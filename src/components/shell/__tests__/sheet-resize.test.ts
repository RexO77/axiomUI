import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { moveSheet, registerSheetResizer, settleSheet, type SheetResizer } from "@/components/shell/sheet-resize";

/** A sheet whose left edge is at `left` on screen, and a log of what happened to it, in order. */
function fixture(left: number) {
  const log: string[] = [];
  const style = {
    transition: "",
    left: "",
    removeProperty: (name: "transition" | "left") => {
      log.push(`sheet ${name} cleared`);
      style[name] = "";
    },
  };
  const sheet = {
    style: new Proxy(style, {
      set(target, name, value) {
        log.push(`sheet ${String(name)}=${value}`);
        (target as Record<string, unknown>)[name as string] = value;
        return true;
      },
    }),
    getBoundingClientRect: () => ({ left }),
  } as unknown as HTMLElement;
  vi.stubGlobal("getComputedStyle", () => {
    log.push("style read");
    return { transitionProperty: "left" };
  });
  const resizer = (name: string): SheetResizer => ({
    measure: (grow) => log.push(`${name} measure ${grow}`),
    release: () => log.push(`${name} release`),
    pin: (grow) => log.push(`${name} pin ${grow}`),
    glide: ({ duration, easing }) => log.push(`${name} glide ${duration} ${easing}`),
  });
  return { sheet, log, resizer };
}

const timing = { duration: 220, easing: "var(--ease-drawer)" };
let unregister: (() => void)[] = [];

afterEach(() => {
  for (const off of unregister) off();
  unregister = [];
  vi.unstubAllGlobals();
});

describe("moveSheet", () => {
  it("with nothing registered, only sets the target: CSS transitions the edge and retargets on its own", () => {
    const { sheet, log } = fixture(56);
    const apply = vi.fn(() => log.push("apply"));
    const release = moveSheet(sheet, apply, 240, timing);
    expect(log).toEqual(["apply"]);
    release();
    expect(log).toEqual(["apply"]);
  });

  it("reads before it writes, holds the edge where it is on screen, and starts the transition from there", () => {
    const { sheet, log, resizer } = fixture(130);
    unregister.push(registerSheetResizer(resizer("wall")));
    moveSheet(sheet, () => log.push("apply"), 240, timing);
    expect(log).toEqual([
      "wall measure -110",
      "wall release",
      "sheet transition=none",
      "sheet left=130px",
      "apply",
      "style read",
      // Opening from 130 to 240: the sheet narrows by the 110px its left edge travels.
      "wall pin -110",
      "wall glide 220 var(--ease-drawer)",
      "sheet left cleared",
      "sheet transition cleared",
    ]);
  });

  it("returns a release that unpins every resizer the move pinned", () => {
    const { sheet, log, resizer } = fixture(240);
    unregister.push(registerSheetResizer(resizer("a")), registerSheetResizer(resizer("b")));
    const release = moveSheet(sheet, () => {}, 56, timing);
    expect(log).toContain("a pin 184");
    expect(log).toContain("b pin 184");
    log.length = 0;
    release();
    expect(log).toEqual(["a release", "b release"]);
  });

  it("unregistering releases the resizer and leaves it out of later moves", () => {
    const { sheet, log, resizer } = fixture(56);
    const off = registerSheetResizer(resizer("wall"));
    off();
    expect(log).toEqual(["wall release"]);
    log.length = 0;
    moveSheet(sheet, () => log.push("apply"), 240, timing);
    expect(log).toEqual(["apply"]);
  });
});

describe("shell.css", () => {
  const css = readFileSync(path.join(process.cwd(), "src/components/shell/shell.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

  it("moves the sheet by its left edge, only while a move is on, and never by transform", () => {
    expect(css).toMatch(/\.shell\[data-wide\] \.shell-sheet \{ left: var\(--shell-rail-open\); \}/);
    expect(css).toMatch(/\.shell\[data-moving\] \.shell-sheet \{ transition: left var\(--shell-open-ms\) var\(--ease-drawer\); \}/);
    expect(css).not.toMatch(/\.shell-sheet[^{]*\{[^}]*transition:[^;}]*transform/);
  });

  it("drops the move's transitions for reduced motion", () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.shell\[data-moving\] \.shell-sheet \{ transition: none; \}/);
  });

  it("swaps the strip on the click: fading its hundred mark layers would cost every frame of the move", () => {
    const strip = [...css.matchAll(/([^{}]*\.rail-region[^{}]*)\{([^}]*)\}/g)].map(([, selector, body]) => ({ selector: selector.trim(), body }));
    // The base rule fades the strip back in once a close has landed, after the move.
    const base = strip.filter(({ selector, body }) => selector === ".rail-region" && /transition:/.test(body));
    expect(base.map(({ body }) => body.trim())).toEqual([expect.stringMatching(/^transition: opacity 120ms /)]);
    // While the rail is wide or closing, the strip is hidden at once, with no transition.
    const closing = strip.filter(({ selector }) => selector.includes('[data-moving="close"]') && selector.includes("[data-wide]"));
    expect(closing).toHaveLength(1);
    expect(closing[0].body).toMatch(/visibility: hidden/);
    expect(closing[0].body).toMatch(/opacity: 0/);
    expect(closing[0].body).toMatch(/transition: none/);
    // Keyboard input swaps it without the fade.
    expect(strip.some(({ selector, body }) => selector === ':root[data-input="keyboard"] .rail-region' && /transition: none/.test(body))).toBe(true);
    // No other rule adds a fade of its own.
    for (const { selector, body } of strip) {
      if (selector === ".rail-region" || !/transition:/.test(body)) continue;
      expect(body, selector).toMatch(/transition: none/);
    }
  });
});

describe("settleSheet", () => {
  it("finishes only the sheet edge transition, leaving content animations alone", () => {
    class Transition {
      readonly transitionProperty: string;
      constructor(property: string) { this.transitionProperty = property; }
      finish = vi.fn();
    }
    vi.stubGlobal("CSSTransition", Transition);
    const edge = new Transition("left");
    const opacity = new Transition("opacity");
    const other = { finish: vi.fn() };
    const sheet = { getAnimations: () => [edge, opacity, other] } as unknown as HTMLElement;
    settleSheet(sheet);
    expect(edge.finish).toHaveBeenCalledOnce();
    expect(opacity.finish).not.toHaveBeenCalled();
    expect(other.finish).not.toHaveBeenCalled();
  });

  it("can settle again after the edge has gone", () => {
    const sheet = { getAnimations: () => [] } as unknown as HTMLElement;
    expect(() => { settleSheet(sheet); settleSheet(sheet); }).not.toThrow();
  });
});
