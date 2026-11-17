import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PINNED_GUTTERS, PINNED_USES, settleFor, trackCount, wallResizer } from "@/components/gallery/wall-resize";

const box = (left: number, top: number, width = 270, height = 260) => ({ left, top, right: left + width, bottom: top + height });

describe("trackCount", () => {
  it("counts resolved tracks", () => {
    expect(trackCount("271px 271px 271px 271px")).toBe(4);
    expect(trackCount(" 304.5px 304.5px 304.5px ")).toBe(3);
  });

  it("counts a function as one track and an empty grid as none", () => {
    expect(trackCount("minmax(0px, 1fr) 200px")).toBe(2);
    expect(trackCount("none")).toBe(0);
    expect(trackCount("")).toBe(0);
  });
});

describe("settleFor", () => {
  it("leaves a tile that did not move", () => {
    expect(settleFor(box(88, 120), box(88.3, 119.8))).toBeNull();
  });

  it("glides a short move from where the tile was", () => {
    // The gutters pinned at the destination's values: 8px left, 4px up.
    expect(settleFor(box(88, 120), box(80, 116))).toEqual({ glide: { x: 8, y: 4 } });
  });

  it("fades a tile in at a new slot rather than send it across the others", () => {
    // Fourth in the first row, first in the second once a column goes.
    expect(settleFor(box(970, 120), box(80, 400))).toEqual({ fade: true });
    // One column over on the same row is a new slot too.
    expect(settleFor(box(400, 120), box(80, 120))).toEqual({ fade: true });
  });
});

/*
 * gallery.css and the pins have to agree. Every box that reads a gutter is
 * pinned by wall-resize.ts; a new reader the pins miss would step mid-move.
 * And the gutters must not inherit: a step on an inherited custom property
 * restyles every node in the wall, ~20ms of one frame on a 4x slower CPU.
 */
describe("gallery.css and the pins", () => {
  const css = readFileSync(path.join(process.cwd(), "src/components/gallery/gallery.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const rules = [...css.matchAll(/([^{};]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({ selector: selector.trim(), body }));
  const gutter = new RegExp(`var\\((${PINNED_GUTTERS.join("|")})\\)`);

  it("registers every gutter as a non-inherited length", () => {
    for (const name of PINNED_GUTTERS) {
      const rule = rules.find(({ selector }) => selector === `@property ${name}`);
      expect(rule, name).toBeDefined();
      expect(rule!.body).toMatch(/syntax: "<length>"/);
      expect(rule!.body).toMatch(/inherits: false/);
    }
  });

  it("pins every box that reads a gutter, on the property that carries it", () => {
    const readers = rules.flatMap(({ selector, body }) =>
      body.split(";").map((declaration) => declaration.trim()).filter((declaration) => gutter.test(declaration)).map((declaration) => ({ selector, property: declaration.slice(0, declaration.indexOf(":")).trim() })),
    );
    expect(readers.length).toBeGreaterThan(0);
    for (const { selector, property } of readers) {
      if (property.startsWith("scroll-margin")) continue;
      expect(Object.keys(PINNED_USES), selector).toContain(selector);
      const pinned: readonly string[] = PINNED_USES[selector as keyof typeof PINNED_USES];
      expect(pinned.some((longhand) => longhand === property || longhand.startsWith(`${property}-`)), `${selector} { ${property} }`).toBe(true);
    }
  });

  it("sets the gutters on the boxes that read them, never on the wall", () => {
    const setters = rules.filter(({ body }) => PINNED_GUTTERS.some((name) => new RegExp(`(^|;)\\s*${name}\\s*:`).test(body)));
    expect(setters.length).toBeGreaterThan(0);
    for (const { selector } of setters) {
      if (selector.startsWith("@property")) continue;
      expect(selector).toBe(":is(.gw-bar, .gw-wall, .gw-section, .gw-grid)");
    }
  });
});

/** Minimal frame boxes: style writes and tile reads stay observable without a browser. */
function wallFixture(same = false) {
  const element = () => {
    const values = new Map<string, string>();
    return { style: {
      setProperty: (name: string, value: string) => values.set(name, value),
      removeProperty: (name: string) => values.delete(name),
    }, values };
  };
  const selectors = Object.keys(PINNED_USES);
  const boxes = new Map(selectors.map((selector) => [selector, element()]));
  const destination = new Map(selectors.map((selector) => [selector, element()]));
  const tile = {
    ...element(),
    closest: () => null,
    getBoundingClientRect: vi.fn(() => box(100, 120)),
  };
  const probeRoot = {
    style: { width: "" },
    querySelector: (selector: string) => destination.get(selector === ".gw-section:not([hidden]) .gw-grid" ? ".gw-grid" : selector),
  };
  const probe = { style: { cssText: "" }, setAttribute: vi.fn(), firstElementChild: probeRoot, remove: vi.fn(), innerHTML: "" };
  const host = { append: vi.fn() };
  const sheet = { getBoundingClientRect: () => ({ width: 1466 }) };
  const root = {
    closest: (selector: string) => selector === ".shell-sheet" ? sheet : host,
    querySelector: (selector: string) => boxes.get(selector === ".gw-section:not([hidden]) .gw-grid" ? ".gw-grid" : selector),
    querySelectorAll: vi.fn((selector: string) => selector === ".gw-tile" ? [tile] : [boxes.get(selector)]),
  };
  vi.stubGlobal("document", { createElement: () => probe });
  vi.stubGlobal("getComputedStyle", (node: unknown) => ({
    getPropertyValue: () => same || [...destination.values()].includes(node as ReturnType<typeof element>) ? "32px" : "24px",
    gridTemplateColumns: "300px 300px 300px 300px",
  }));
  const layer = { clientWidth: 1451, scrollTop: 0 };
  const resizer = wallResizer(root as unknown as HTMLElement, () => layer as HTMLElement);
  return { resizer, root, tile, probe, probeRoot, boxes, matchLayout: () => { same = true; } };
}

afterEach(() => vi.unstubAllGlobals());

describe("wallResizer lifecycle", () => {
  it("skips tile collection and rect reads when the destination layout is unchanged", () => {
    const { resizer, root, tile } = wallFixture(true);
    resizer.measure(-184);
    resizer.release();
    resizer.pin(-184);
    resizer.glide({ duration: 290, easing: "ease" });
    expect(root.querySelectorAll).not.toHaveBeenCalled();
    expect(tile.getBoundingClientRect).not.toHaveBeenCalled();
  });

  it("probes the sheet query width separately from the wall's scrollbar-reduced width", () => {
    const { resizer, probe, probeRoot } = wallFixture();
    resizer.measure(-184);
    expect(probe.style.cssText).toContain("width:1282px");
    expect(probeRoot.style.width).toBe("1267px");
    expect(probe.remove).toHaveBeenCalledOnce();
  });

  it("releases all pinned properties on an instant interruption or teardown, repeatedly", () => {
    const { resizer, boxes } = wallFixture();
    resizer.measure(-184);
    resizer.release();
    resizer.pin(-184);
    expect([...boxes.values()].every((box) => box.values.size > 0)).toBe(true);
    resizer.release();
    resizer.release();
    expect([...boxes.values()].every((box) => box.values.size === 0)).toBe(true);
  });

  it("measures a carried layout before release even if the next natural layout would match", () => {
    const { resizer, tile, matchLayout } = wallFixture();
    resizer.measure(-184);
    resizer.release();
    resizer.pin(-184);
    tile.getBoundingClientRect.mockClear();
    matchLayout();
    resizer.measure(184);
    expect(tile.getBoundingClientRect).toHaveBeenCalledOnce();
    resizer.release();
    resizer.pin(184);
    resizer.release();
  });
});
