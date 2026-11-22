import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MotionShowcase } from "@/components/features/rules/demos/motion-showcase";
import { paneReadout, showcaseSpecs } from "@/components/features/rules/demos/showcase-specs";
import { Comparison } from "@/components/rule/comparison";
import { isNativeMotion, MotionCompare, readoutLabel } from "@/components/rule/motion-compare";
import { rules as allRules } from "@/data/ui-logic";
import {
  clampPan,
  compareView,
  flipReducer,
  flipShowing,
  freshFlip,
  panByPointer,
  panKeyDelta,
  PAN_STEP,
  PAN_STEP_LARGE,
  nextView,
  viewMode,
  ZOOM_SCALE,
  zoomPatch,
  type FlipState,
} from "@/components/rule/use-compare";
import { createCatalogStores } from "@/lib/catalog/stores";
import { createMemoryStore, type MemoryStorage } from "@/lib/navigation/memory";

/**
 * The rule comparison: the zoom maths, the compare state
 * (stored mode and zoom, a per-rule side), and the layout promises a type
 * can't hold: captions are never truncated, previews are 1:1 at rest, and the
 * demo markup compare.css lays out is still the markup the demos render.
 */

const ROOT = process.cwd();
const RULE_DIR = path.join(ROOT, "src/components/rule");
const CSS = readFileSync(path.join(RULE_DIR, "compare.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

/** Flat rules: each selector list with its declarations, at any nesting depth. */
function rules(css: string): { selector: string; body: string }[] {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ selector: m[1].trim(), body: m[2] }));
}

describe("zoom maths", () => {
  it("zooms by exactly 2", () => {
    expect(ZOOM_SCALE).toBe(2);
  });

  it("keeps a pan within a quarter of the canvas, and centred pans unsigned", () => {
    expect(clampPan({ x: 500, y: -500 }, 800, 400)).toEqual({ x: 200, y: -100 });
    expect(clampPan({ x: 30, y: 20 }, 800, 400)).toEqual({ x: 30, y: 20 });
    expect(Object.is(clampPan({ x: -0, y: -0 }, 800, 400).x, 0)).toBe(true);
  });

  it("moves the content with the pointer, one to one: the translate is in the canvas's pixels, after the scale", () => {
    expect(panByPointer({ x: 10, y: 0 }, 40, -20)).toEqual({ x: 50, y: -20 });
    // A drag the length of the clamp reaches the clamp, no further.
    expect(clampPan(panByPointer({ x: 0, y: 0 }, 200, 100), 800, 400)).toEqual({ x: 200, y: 100 });
  });

  it("pans by key away from the arrow, with a larger Shift step", () => {
    expect(panKeyDelta("ArrowLeft", false)).toEqual({ x: PAN_STEP, y: 0 });
    expect(panKeyDelta("ArrowRight", false)).toEqual({ x: -PAN_STEP, y: 0 });
    expect(panKeyDelta("ArrowUp", true)).toEqual({ x: 0, y: PAN_STEP_LARGE });
    expect(panKeyDelta("ArrowDown", true)).toEqual({ x: 0, y: -PAN_STEP_LARGE });
    expect(panKeyDelta("Enter", false)).toBeNull();
  });
});

describe("compare state", () => {
  const run = (state: FlipState, ...actions: Parameters<typeof flipReducer>[1][]) => actions.reduce(flipReducer, state);

  it("toggles Flip, and a hold inverts whichever side is toggled", () => {
    const start = freshFlip("typo-1");
    const toggled = run(start, { type: "toggle", ruleId: "typo-1" });
    expect(flipShowing("flip", start)).toBe("do");
    expect(flipShowing("flip", toggled)).toBe("dont");
    expect(flipShowing("flip", run(toggled, { type: "hold", on: true, ruleId: "typo-1" }))).toBe("do");
    expect(flipShowing("flip", run(start, { type: "hold", on: true, ruleId: "typo-1" }))).toBe("dont");
  });

  it("shows both sides, led by Do, side by side", () => {
    const toggled = run(freshFlip("typo-1"), { type: "toggle", ruleId: "typo-1" }, { type: "hold", on: true, ruleId: "typo-1" });
    expect(flipShowing("side", toggled)).toBe("do");
  });

  it("starts each rule on Do: an action for another rule resets Flip and any hold", () => {
    const held = run(freshFlip("typo-1"), { type: "toggle", ruleId: "typo-1" }, { type: "hold", on: true, ruleId: "typo-1" });
    const paged = run(held, { type: "hold", on: false, ruleId: "typo-2" });
    expect(paged).toEqual(freshFlip("typo-2"));
    expect(run(held, { type: "toggle", ruleId: "typo-2" })).toEqual({ ruleId: "typo-2", flipped: true, held: false });
  });

  it("shows a chosen side, ending any hold, and keeps identity when nothing changes", () => {
    const held = run(freshFlip("typo-1"), { type: "hold", on: true, ruleId: "typo-1" });
    expect(run(held, { type: "show", side: "dont", ruleId: "typo-1" })).toEqual({ ruleId: "typo-1", flipped: true, held: false });
    expect(run(held, { type: "show", side: "do", ruleId: "typo-1" })).toEqual(freshFlip("typo-1"));
    const start = freshFlip("typo-1");
    expect(flipReducer(start, { type: "show", side: "do", ruleId: "typo-1" })).toBe(start);
    expect(flipReducer(start, { type: "hold", on: false, ruleId: "typo-1" })).toBe(start);
  });

  it("reads one view from the stored mode and the rule's side, and F cycles it", () => {
    const toggled = run(freshFlip("typo-1"), { type: "toggle", ruleId: "typo-1" });
    expect(compareView("side", toggled)).toBe("both");
    expect(compareView("flip", freshFlip("typo-1"))).toBe("do");
    expect(compareView("flip", toggled)).toBe("dont");
    // A hold blinks the canvas, not the control.
    expect(compareView("flip", run(toggled, { type: "hold", on: true, ruleId: "typo-1" }))).toBe("dont");
    expect([nextView("both"), nextView("do"), nextView("dont")]).toEqual(["do", "dont", "both"]);
    expect([viewMode("both"), viewMode("do"), viewMode("dont")]).toEqual(["side", "flip", "flip"]);
  });

  it("persists the view's mode and Z as stored preferences, across paging and visits", () => {
    const data = new Map<string, string>();
    const storage: MemoryStorage = { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => void data.set(key, value) };
    const open = () => createCatalogStores({ memory: createMemoryStore(() => storage, () => true, () => null), getStorage: () => null, getEvents: () => null });

    const first = open();
    expect(first.prefs.get()).toEqual({ mode: "side", zoom: 1 });
    first.writePrefs({ mode: viewMode("dont") });
    first.writePrefs(zoomPatch(first.prefs.get()));
    expect(first.prefs.get()).toEqual({ mode: "flip", zoom: 2 });

    // A stored "flip" from before the view control opens as Do.
    const visit = open();
    expect(visit.prefs.get()).toEqual({ mode: "flip", zoom: 2 });
    expect(compareView(visit.prefs.get().mode, freshFlip("typo-2"))).toBe("do");
    visit.writePrefs({ mode: viewMode("both") });
    visit.writePrefs(zoomPatch(visit.prefs.get()));
    expect(open().prefs.get()).toEqual({ mode: "side", zoom: 1 });
  });
});

describe("compare.css", () => {
  it("transforms the preview box only at 2×: previews are 1:1 at rest", () => {
    const transformed = rules(CSS).filter(({ body }) => /(^|;)\s*transform\s*:/.test(body));
    expect(transformed.map(({ selector }) => selector)).toEqual(['.cmp-canvas[data-zoom="2"] .cmp-box']);
    expect(CSS).not.toMatch(/(^|[;{\s])zoom\s*:/);
  });

  it("never truncates a caption or a hint", () => {
    const captions = rules(CSS).filter(({ selector }) => /cmp-captions|cmp-cap-v|cmp-tally|rule-hint|> p\b/.test(selector));
    expect(captions.length).toBeGreaterThan(4);
    for (const { selector, body } of captions) {
      expect(body, selector).not.toMatch(/text-overflow|line-clamp|overflow\s*:\s*(hidden|clip)/);
    }
    for (const { selector, body } of rules(CSS).filter(({ selector }) => /cmp-captions p\b/.test(selector))) {
      expect(body, selector).not.toMatch(/white-space\s*:\s*nowrap/);
    }
  });

  it("keeps the 280px desktop canvas minimum", () => {
    expect(CSS).toMatch(/--cmp-canvas-h:\s*280px/);
    const tsx = readFileSync(path.join(RULE_DIR, "comparison.tsx"), "utf8");
    expect(tsx).toMatch(/max\(280px, min\(/);
  });

  it("uses no truncation class in the comparison's own markup", () => {
    for (const file of readdirSync(RULE_DIR).filter((name) => name.endsWith(".tsx"))) {
      const source = readFileSync(path.join(RULE_DIR, file), "utf8");
      expect(source.match(/\b(?:truncate|line-clamp-\d+|text-ellipsis|text-clip)\b/)?.[0], file).toBeUndefined();
    }
  });
});

// ── The hand-built showcases compare.css lays out ───────────────────
//
// `.cmp-show` selectors depend on MotionShowcase's markup. Check the rendered
// DOM of every hand-built showcase rather than source text:
// any change to the structure or classes the selectors match fails here.

type Node = { tag: string; cls: string | null; kids: Node[] };
const VOID = new Set(["area", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);

/** React's static markup as a tree. React escapes `>` in attribute values, so a tag ends at the first `>`. */
function tree(html: string): Node {
  const root: Node = { tag: "#root", cls: null, kids: [] };
  const stack = [root];
  for (const [, close, tag, attrs, self] of html.matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>/g)) {
    if (close) stack.pop();
    else {
      const node: Node = { tag, cls: attrs.match(/\sclass="([^"]*)"/)?.[1] ?? null, kids: [] };
      stack[stack.length - 1].kids.push(node);
      if (!self && !VOID.has(tag)) stack.push(node);
    }
  }
  return root;
}
const has = (node: Node | undefined, name: string) => Boolean(node?.cls?.split(" ").includes(name));

/** Root `.motion-showcase` > [`.grid` > 2 × `.min-w-0` > `.mb-2`, unclassed div, `.mt-2`?, p], `.justify-between`?, `.flex-col`?, then readout spans and `.mt-3` meters. */
function showcaseProblems(html: string): string[] {
  const [show, ...extra] = tree(html).kids;
  if (!has(show, "motion-showcase") || extra.length) return ["not one .motion-showcase root"];
  const [grid, ...rest] = show.kids;
  const out: string[] = [];
  const role = (kid: Node) =>
    has(kid, "justify-between") ? "row" : has(kid, "flex-col") ? "hints" : kid.tag === "span" ? "readout" : has(kid, "mt-3") ? "meter" : `${kid.tag}.${kid.cls}`;
  const after = rest.map(role).join(" ");
  if (!/^(row ?)?(hints ?)?((readout|meter) ?)*$/.test(after)) out.push(`after the grid: ${after}`);
  if (!has(grid, "grid") || grid.kids.length !== 2 || grid.kids.some((pane) => pane.cls !== "min-w-0")) out.push("grid of two .min-w-0 panes first");
  for (const pane of grid?.kids ?? []) {
    const shape = pane.kids
      .map((kid) => (kid.tag === "p" ? "caption" : kid.tag !== "div" ? kid.tag : kid.cls === null ? "scene" : has(kid, "mb-2") ? "label" : has(kid, "mt-2") ? "bar" : `div.${kid.cls}`))
      .join(" ");
    if (!/^label scene( bar)? caption$/.test(shape)) out.push(`pane: ${shape}`);
  }
  return out;
}

const render = (ruleId: string) => renderToStaticMarkup(createElement(MotionShowcase, { ruleId }));
const HAND_BUILT = Object.keys(showcaseSpecs).filter((id) => !isNativeMotion(id));

describe("the hand-built showcases compare.css lays out", () => {
  it("covers all four families", () => {
    expect(new Set(HAND_BUILT.map((id) => showcaseSpecs[id].trigger))).toEqual(new Set(["drag", "interrupt", "load", "toolbar"]));
  });

  for (const id of HAND_BUILT) {
    it(`${id} renders the structure the .cmp-show selectors place`, () => {
      expect(showcaseProblems(render(id))).toEqual([]);
    });
  }

  it("fails a class on the scene, a lost grid class, a third pane child or a stray root child", () => {
    const html = render("motion-18");
    expect(html).toContain('<div aria-hidden="true"><div');
    expect(showcaseProblems(html.replace('<div aria-hidden="true"><div', '<div aria-hidden="true" class="scene-test"><div'))).not.toEqual([]);
    expect(showcaseProblems(html.replace('class="grid ', 'class="'))).not.toEqual([]);
    expect(showcaseProblems(html.replace('<p class="mt-1.5', '<span></span><p class="mt-1.5'))).not.toEqual([]);
    expect(showcaseProblems(html.replace(/<\/div>$/, "<aside></aside></div>"))).not.toEqual([]);
    expect(showcaseProblems(render("motion-21").replace('class="mt-3 space-y-1.5"', 'class="space-y-1.5"'))).not.toEqual([]);
  });

  it("reads no demo markup beyond what showcaseProblems checks", () => {
    // Extending the adapter to a new class or position must extend the contract above first.
    const KNOWN = /^(?:\.(?:cmp-show|motion-showcase|grid|min-w-0|mb-2|mt-2|mt-3|justify-between|flex-col|border-dashed|text-xs)|::?(?:before|after)|:nth-child\([12n]\)|:not\((?:\[class\]|p|\.justify-between, \.flex-col)\)|[>*\s]|div|p|span|button|\) :is\(button, \[role="radio"\]\))+$/;
    const selectors = rules(CSS).flatMap(({ selector }) => selector.split(/,(?![^(]*\))/)).map((one) => one.trim()).filter((one) => one.includes(".cmp-show"));
    expect(selectors.length).toBeGreaterThan(20);
    for (const selector of selectors) expect(selector.slice(selector.indexOf(".cmp-show")), selector).toMatch(KNOWN);
  });
});

// Reduced-motion text must be in the server HTML and switched by CSS, or hydration shifts the page.
describe("reduced-motion text renders on the server and CSS switches it", () => {
  const motionOnly = (id: string) => renderToStaticMarkup(createElement(MotionCompare, { ruleId: id }));

  it("puts the reduced-motion note, both hints and the full-speed tally in the server HTML", () => {
    const html = motionOnly("motion-4");
    expect(html).toContain('<p class="rule-hint rule-hint-reduced">Reduced motion: end states only');
    expect(html).toContain(`<p class="rule-hint rule-hint-motion">${showcaseSpecs["motion-4"].hint}</p>`);
    expect(html).toContain(`<p class="rule-hint rule-hint-reduced">${showcaseSpecs["motion-4"].hintReduced}</p>`);
    const tallied = Object.keys(showcaseSpecs).find((id) => isNativeMotion(id) && showcaseSpecs[id].tallyDontMs)!;
    expect(motionOnly(tallied)).toContain('<span class="cmp-tally">0 opens · 0.0s of motion at 1×</span>');
  });

  it("hides them by default and swaps them under prefers-reduced-motion", () => {
    expect(CSS).toMatch(/(^|\})\s*\.rule-hint-reduced \{ display: none; \}/);
    const media = CSS.slice(CSS.indexOf("@media (prefers-reduced-motion: reduce) {\n  .rule-hint-motion"));
    expect(media).toMatch(/^[^}]*\.rule-hint-motion \{ display: none; \}\s*\.rule-hint-reduced \{ display: block; \}/);
  });
});

// A motion rule's captions narrate what plays; the rule's own claim must still be on the page.
describe("every motion caption opens with the rule's own Do and Don't", () => {
  const text = (html: string) =>
    html
      .replace(/<[^>]+>/g, "")
      .replace(/&#x27;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");

  it.each(allRules.filter((rule) => showcaseSpecs[rule.id]).map((rule) => [rule.id, rule] as const))("%s", (_, rule) => {
    const shown = text(renderToStaticMarkup(createElement(Comparison, { rule })));
    for (const claim of [rule.do, rule.dont, showcaseSpecs[rule.id].do.caption, showcaseSpecs[rule.id].dont.caption]) {
      expect(shown).toContain(claim);
    }
  });
});

// A pane's ms readout sits right above a caption like "in 220ms · out 160ms".
// While the exit plays, the bar counts the exit; the number beside it must too.
describe("motion readouts follow the phase that is playing", () => {
  /** Triggers whose release, toggle-off or hover-out plays the exit. */
  const EXITING = new Set(["toggle", "press", "hover"]);
  const SOURCE = readFileSync(path.join(RULE_DIR, "motion-compare.tsx"), "utf8");
  const asymmetric = Object.entries(showcaseSpecs)
    .filter(([id, spec]) => isNativeMotion(id) && EXITING.has(spec.trigger))
    .flatMap(([id, spec]) =>
      (["do", "dont"] as const)
        .map((side) => ({ id, side, pane: spec[side] }))
        .filter(({ pane }) => paneReadout(pane, "enter").ms !== paneReadout(pane, "exit").ms),
    );

  it("covers the asymmetric-timing lessons", () => {
    const ids = new Set(asymmetric.map(({ id }) => id));
    expect(ids).toContain("motion-7");
    expect(ids).toContain("motion-15");
  });

  it("reads the entrance at rest and switches to the exit's own number when the exit plays", () => {
    const wrong: string[] = [];
    for (const { id, side, pane } of asymmetric) {
      const enter = paneReadout(pane, "enter").ms;
      const exit = paneReadout(pane, "exit").ms;
      const html = renderToStaticMarkup(createElement(MotionCompare, { ruleId: id }));
      if (!html.includes(`<span class="cmp-pane-ms">${readoutLabel(pane, "enter")}</span>`)) wrong.push(`${id}.${side}: rest readout is not ${enter}ms`);
      if (!readoutLabel(pane, "exit").startsWith(`${exit}ms`)) wrong.push(`${id}.${side}: exit readout is not ${exit}ms`);
    }
    expect(wrong, wrong.join("\n")).toEqual([]);
  });

  it("sets the readout's phase wherever the bars run, and renders the label from it", () => {
    const ran = new Set([...SOURCE.matchAll(/runBars\("(enter|exit)"\)/g)].map((m) => m[1]));
    const set = new Set([...SOURCE.matchAll(/setPhase\("(enter|exit)"\)/g)].map((m) => m[1]));
    expect(ran).toEqual(new Set(["enter", "exit"]));
    for (const phase of ran) expect(set, `runBars("${phase}") with no setPhase("${phase}")`).toContain(phase);
    expect(SOURCE).toMatch(/<span className="cmp-pane-ms">\{readoutLabel\(pane, phase\)\}<\/span>/);
    expect(SOURCE).not.toMatch(/paneReadout\(pane\)/);
  });
});
