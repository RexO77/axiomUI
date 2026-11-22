import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PHONE_QUERY } from "@/lib/media";

/**
 * Enforces stylesheet rules under components/{shell,rule,gallery} and the
 * strict marker on every module there and in components/ui. Scans existing
 * directories and includes new files automatically.
 */

const ROOT = process.cwd();
const FEATURE_DIRS = ["shell", "rule", "gallery"].map((dir) => `src/components/${dir}`);
const STRICT_DIRS = ["ui", ...FEATURE_DIRS.map((dir) => dir.slice("src/components/".length))].map((dir) => `src/components/${dir}`);
const MARKER = "// design-system: strict";
/** Existing modules exempt from the strict marker. Keep this list closed. */
const GRANDFATHERED = ["src/components/ui/axiom-logo.tsx"];

function walk(dir: string, match: RegExp): string[] {
  const full = path.join(ROOT, dir);
  if (!existsSync(full)) return [];
  return readdirSync(full).flatMap((entry) => {
    const relative = `${dir}/${entry}`;
    if (statSync(path.join(ROOT, relative)).isDirectory()) return entry === "__tests__" ? [] : walk(relative, match);
    return match.test(entry) && !/\.test\./.test(entry) ? [relative] : [];
  });
}

// ── A small CSS reader ───────────────────────────────────────────────

type Declaration = { property: string; value: string; selector: string; at: string[] };
type Sheet = { declarations: Declaration[]; media: { prelude: string; at: string[] }[]; selectors: string[] };

const squash = (text: string) => text.replace(/\s+/g, " ").trim();

/** Declarations with their rule's selector and the at-rules around them. Comments are dropped. */
function readCss(source: string): Sheet {
  const css = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const sheet: Sheet = { declarations: [], media: [], selectors: [] };
  const stack: string[] = [];
  let buffer = "";
  const flush = () => {
    const text = squash(buffer);
    buffer = "";
    const colon = text.indexOf(":");
    const selector = [...stack].reverse().find((prelude) => !prelude.startsWith("@")) ?? "";
    if (!text || colon < 0 || !selector) return;
    sheet.declarations.push({
      property: text.slice(0, colon).trim().toLowerCase(),
      value: text.slice(colon + 1).trim(),
      selector,
      at: stack.filter((prelude) => prelude.startsWith("@")),
    });
  };
  let depth = 0;
  for (const c of css) {
    if (c === "(") depth++;
    if (c === ")") depth--;
    if (c === "{" && depth === 0) {
      const prelude = squash(buffer);
      buffer = "";
      if (prelude.startsWith("@media")) sheet.media.push({ prelude: squash(prelude.slice(6)), at: stack.filter((p) => p.startsWith("@")) });
      else if (!prelude.startsWith("@")) sheet.selectors.push(prelude);
      stack.push(prelude);
    } else if (c === "}" && depth === 0) {
      flush();
      stack.pop();
    } else if (c === ";" && depth === 0) flush();
    else buffer += c;
  }
  return sheet;
}

// ── The rules ────────────────────────────────────────────────────────

const SYSTEM_COLOURS = /\b(?:CanvasText|Canvas|GrayText|Highlight|HighlightText|ButtonText|ButtonFace|LinkText|Mark|MarkText)\b/;

/** Declarations that paint a colour. Their colours must follow `colourGrammar`. */
const COLOUR_PROPERTY =
  /^(?:color|background(?:-color)?|(?:border|outline|column-rule|text-decoration)(?:-(?:top|right|bottom|left|block|inline|start|end))*(?:-color)?|(?:box|text)-shadow|fill|stroke|caret-color|accent-color|scrollbar-color|text-emphasis-color|-webkit-text-(?:fill|stroke)-color)$/;
const NOT_A_COLOUR = /^(?:-?\d*\.?\d+(?:px|%|em|rem)?|currentcolor|inherit|initial|unset|revert|none|solid|dashed|dotted|double|inset|hidden|auto|thin|medium|thick|underline|wavy)$/i;
/** CSS Color 4's named colours. As a bare word anywhere in a value, one is a raw colour. */
const NAMED_COLOURS = new Set(
  `aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood
  cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray
  darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen
  darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue
  firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew
  hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan
  lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray
  lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue
  mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred
  midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid
  palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple
  rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue
  slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white
  whitesmoke yellow yellowgreen transparent`.split(/\s+/),
);

/**
 * A colour value: var(--ax-*), a custom property this sheet only ever sets to
 * such a value, or color-mix over them, beside lengths and keywords. Anything
 * else (a named colour, an unapproved variable, a raw function) is reported.
 */
function colourGrammar(value: string, local: ReadonlySet<string>, forced: boolean): string | null {
  const rest = value.replace(/var\((--[\w-]+)\)/g, (use, name: string) => (name.startsWith("--ax-") || local.has(name) ? " " : use));
  if (rest.includes("var(")) return "unapproved variable";
  const words = rest.replace(/color-mix\(\s*in\s+[a-z-]+\s*,/gi, " ").replace(/[(),/]/g, " ").split(/\s+/).filter(Boolean);
  const bad = words.find((word) => !NOT_A_COLOUR.test(word) && !(forced && SYSTEM_COLOURS.test(word)));
  return bad ? `"${bad}"` : null;
}

/** Custom properties whose every definition in the sheet, across selectors, is a token colour. */
function tokenAliases(declarations: readonly Declaration[]): Set<string> {
  const local = new Set(declarations.filter(({ property }) => property.startsWith("--")).map(({ property }) => property));
  for (let changed = true; changed; ) {
    changed = false;
    for (const { property, value } of declarations) {
      if (local.has(property) && colourGrammar(value, local, false)) changed = local.delete(property);
    }
  }
  return local;
}

function colourProblems({ declarations }: Sheet): string[] {
  const local = tokenAliases(declarations);
  return declarations.flatMap(({ property, value, at }) => {
    const where = `${property}: ${value}`;
    const forced = at.some((prelude) => prelude.includes("forced-colors"));
    if (COLOUR_PROPERTY.test(property)) {
      const problem = colourGrammar(value, local, forced);
      return problem ? [`${problem} is not a token colour in ${where}`] : [];
    }
    // Every other declaration, custom properties included: no raw colour anywhere in the value.
    if (/#[0-9a-f]{3,8}\b/i.test(value)) return [`hex colour in ${where}`];
    if (/\b(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch|color|light-dark|device-cmyk)\(/i.test(value)) return [`raw colour function in ${where}`];
    if (!forced && SYSTEM_COLOURS.test(value)) return [`system colour outside forced colours in ${where}`];
    const mask = property.includes("mask") && /gradient\(/i.test(value);
    const named = (value.toLowerCase().match(/(?<![\w-])[a-z]+(?![\w-])/g) ?? []).filter(
      (word) => NAMED_COLOURS.has(word) && !(mask && (word === "black" || word === "transparent")),
    );
    return named.length ? [`named colour "${named[0]}" in ${where}`] : [];
  });
}

function radiusProblems({ declarations }: Sheet): string[] {
  return declarations
    .filter(({ property }) => /^border(?:-[a-z]+)*-radius$/.test(property))
    .flatMap(({ property, value }) => {
      const parts = value.replace(/\//g, " ").split(/\s+(?![^(]*\))/).filter(Boolean);
      const bad = parts.filter((part) => !/^(?:var\(--radius-[a-z-]+\)|0|50%|9999px)$/.test(part));
      return bad.length ? [`${property}: ${value}`] : [];
    });
}

function typeProblems({ declarations }: Sheet): string[] {
  return declarations.flatMap(({ property, value }) => {
    if (property === "font") return [`font shorthand: ${value}`];
    if (property !== "font-size") return [];
    const px = [...value.matchAll(/(\d*\.?\d+)px/g)].map((m) => Number(m[1]));
    const rem = [...value.matchAll(/(\d*\.?\d+)rem/g)].map((m) => Number(m[1]) * 16);
    return [...px, ...rem].some((size) => size < 12) ? [`font-size under 12px: ${value}`] : [];
  });
}

/** CSS function names are case-insensitive. */
const SCALE = /\bscale(?:x|y|z|3d)?\(/i;

/** A matrix whose linear part is not the identity scales the box (or skews or turns it); a pure translation is fine. */
function matrixScales(value: string): boolean {
  return [...value.matchAll(/\bmatrix(3d)?\(([^)]*)\)/gi)].some(([, three, args]) => {
    const n = args.split(",").map(Number);
    const linear = three ? [n[0], n[1], n[2], n[4], n[5], n[6], n[8], n[9], n[10]] : n.slice(0, 4);
    const identity = three ? [1, 0, 0, 0, 1, 0, 0, 0, 1] : [1, 0, 0, 1];
    return linear.some((entry, i) => entry !== identity[i]);
  });
}
const scales = (value: string) => SCALE.test(value) || matrixScales(value);

/** Gallery and shell (peek, palette) never scale or zoom; the press scale is the tile frame's alone. */
function scaleProblems(file: string, { declarations }: Sheet): string[] {
  const out = declarations.filter(({ property }) => property === "zoom").map(({ value }) => `zoom: ${value}`);
  if (file.endsWith("/compare.css")) {
    const scaled = declarations.filter(({ value }) => scales(value));
    if (scaled.length !== 1 || !scaled[0].selector.includes('[data-zoom="2"]')) out.push(`compare.css needs exactly one scale(), under [data-zoom="2"]`);
  } else if (/\/(?:gallery|shell)\//.test(file)) {
    for (const { property, value, selector } of declarations) {
      if (scales(value)) out.push(`scale() or a scaling matrix() in ${selector}`);
      if (property === "scale" && selector !== ".gw-frame:active") out.push(`scale: on ${selector}`);
    }
  }
  return out;
}

type Feature = { name: string; value: string | null };
const features = (clause: string): Feature[] =>
  [...clause.matchAll(/\(\s*([a-z-]+)\s*(?::\s*([^)]+?))?\s*\)/g)].map((m) => ({ name: m[1], value: m[2] ?? null }));
const px = (value: string | null) => (value && /^\d*\.?\d+px$/.test(value) ? Number.parseFloat(value) : NaN);
const LAYOUT = /width|height|orientation|aspect-ratio|^pointer$|^any-pointer$/;
/** Plain preferences: never a layout cut-over. `pointer: fine` only rides with hover. */
const PREFERENCE = /^(?:hover|any-hover|prefers-reduced-motion|prefers-color-scheme|prefers-contrast|forced-colors)$/;
/** Narrower cases inside the phone layout: small phones, short landscape screens and coarse pointers. */
const REFINEMENTS = new Set(["max-width: 640px", "max-width: 351px", "max-width: 351.98px", "max-height: 500px", "max-height: 420px", "orientation: landscape", "pointer: coarse"]);

/** Touch at any size, outside the phone layout. It may only grow targets, never switch a layout. */
const TOUCH = "(pointer: coarse)";
/** A row grown to 44px, or a pseudo-element that reaches past its control (and the control that anchors it). */
const growsHitArea = ({ property, value, selector }: Declaration) =>
  (/^(?:min-)?(?:height|width)$/.test(property) && px(value) >= 44) ||
  (/::(?:before|after)$/.test(selector) && /^(?:content|position|inset)$/.test(property)) ||
  (property === "position" && value === "relative");

/**
 * Which @media preludes are allowed: PHONE_QUERY itself, preferences, refinements that only apply
 * on phones, and a bare touch query that only grows hit areas (and makes the phone layout’s room for them).
 */
function mediaProblems({ media, declarations }: Sheet): string[] {
  const phone = squash(PHONE_QUERY);
  return media.flatMap(({ prelude, at }) => {
    if (prelude === phone) return [];
    if (prelude === TOUCH && !at.length) {
      const inside = declarations.filter((declaration) => declaration.at.some((outer) => squash(outer.slice(6)) === TOUCH));
      // Grown targets can need the room the phone layout already makes for them
      // (the comparison dock's landing): the very declaration, never a new one.
      const onPhone = new Set(
        declarations
          .filter((declaration) => declaration.at.some((outer) => squash(outer.slice(6)) === phone))
          .map(({ selector, property, value }) => `${selector}{${property}:${value}}`),
      );
      const sharedWithPhone = ({ selector, property, value }: Declaration) => onPhone.has(`${selector}{${property}:${value}}`);
      return inside.every((declaration) => growsHitArea(declaration) || sharedWithPhone(declaration)) ? [] : [`@media ${prelude}`];
    }
    const nested = at.some((outer) => squash(outer.slice(6)) === phone);
    const bad = prelude.split(/,(?![^(]*\))/).some((clause) => {
      const list = features(clause);
      const layout = list.filter(({ name, value }) => LAYOUT.test(name) && !(name === "pointer" && value === "fine"));
      if (!layout.length) return !list.every(({ name, value }) => PREFERENCE.test(name) || (name === "pointer" && value === "fine"));
      if (!layout.every(({ name, value }) => REFINEMENTS.has(`${name}: ${value}`))) return true;
      if (nested) return false;
      const narrow = layout.some(({ name, value }) => name === "max-width" && px(value) <= 640);
      const coarseShort =
        layout.some(({ name, value }) => name === "pointer" && value === "coarse") &&
        layout.some(({ name, value }) => name === "max-height" && px(value) <= 500);
      return !(narrow || coarseShort);
    });
    return bad ? [`@media ${prelude}`] : [];
  });
}

const classDefined = (sheet: Sheet, name: string) =>
  sheet.selectors.some((selector) => new RegExp(`\\.${name}(?![\\w-])`).test(selector));

// ── Self-tests ───────────────────────────────────────────────────────

describe("feature CSS rules (fixtures)", () => {
  const check = (css: string) => {
    const sheet = readCss(css);
    return [...colourProblems(sheet), ...radiusProblems(sheet), ...typeProblems(sheet), ...mediaProblems(sheet)];
  };

  it("accepts token colours, colour-mix, mask gradients and forced colours", () => {
    expect(check(`.a { color: var(--ax-ink); background: color-mix(in oklch, var(--ax-ink) 24%, var(--ax-backdrop)); }
      .b { mask-image: linear-gradient(black, transparent); }
      @media (forced-colors: active) { .c { border: 1px solid CanvasText; } }`)).toEqual([]);
  });

  it("rejects hex, raw functions, named colours and system colours outside forced colours", () => {
    expect(check(`.a { color: #fff; }`)).toHaveLength(1);
    expect(check(`.a { color: rgb(0 0 0 / 0.1); }`)).toHaveLength(1);
    expect(check(`.a { background: oklch(50% 0 0); }`)).toHaveLength(1);
    expect(check(`.a { background: transparent; }`)).toHaveLength(1);
    expect(check(`.a { outline-color: Highlight; }`)).toHaveLength(1);
    expect(check(`.peek { color: red; }`)).toHaveLength(1);
    expect(check(`.peek { background: var(--unapproved); }`)).toHaveLength(1);
    // Both the definition and its use are reported.
    expect(check(`.a { --bad: red; color: var(--bad); }`)).toHaveLength(2);
    expect(check(`.a { border: 1px solid tomato; }`)).toHaveLength(1);
  });

  it("rejects an alias redefined later as a named colour", () => {
    expect(check(`.a { --local: var(--ax-ink); } .b { --local: red; color: var(--local); }`).length).toBeGreaterThan(0);
  });

  it("rejects named colours in every property that can paint one", () => {
    for (const css of [
      `.a { background-image: linear-gradient(red, blue); }`,
      `.a { scrollbar-color: red blue; }`,
      `.a { filter: drop-shadow(0 0 4px red); }`,
      `.a { -webkit-text-fill-color: red; }`,
      `.a { text-emphasis-color: Red; }`,
      `.a { border-image: linear-gradient(red, blue) 1; }`,
      `.a { --tint: rebeccapurple; }`,
    ]) {
      expect(check(css), css).toHaveLength(1);
    }
  });

  it("accepts a local custom property that holds a token colour", () => {
    expect(check(`.a { --m: color-mix(in oklch, var(--ax-ink) 24%, var(--ax-backdrop)); background: var(--m); box-shadow: inset 0 0 0 1px var(--ax-line); }`)).toEqual([]);
  });

  it("allows only named radii, 0, 50% and 9999px", () => {
    expect(check(`.a { border-radius: var(--radius-sheet) var(--radius-sheet) 0 0; } .b { border-radius: 50%; }`)).toEqual([]);
    expect(check(`.a { border-radius: 12px; }`)).toHaveLength(1);
    expect(check(`.a { border-top-left-radius: 999px; }`)).toHaveLength(1);
  });

  it("rejects the font shorthand and text under 12px", () => {
    expect(check(`.a { font: 500 11px/1 sans-serif; }`)).toHaveLength(1);
    expect(check(`.a { font-size: 11px; }`)).toHaveLength(1);
    expect(check(`.a { font-size: 0.7rem; }`)).toHaveLength(1);
    expect(check(`.a { font-size: 12px; } .b { font-size: 0.92em; }`)).toEqual([]);
  });

  it("allows PHONE_QUERY, preferences and phone-only refinements, nothing else", () => {
    expect(check(`@media ${PHONE_QUERY} { .a { top: 0; } }`)).toEqual([]);
    expect(check(`@media (hover: hover) and (pointer: fine) { .a { top: 0; } }`)).toEqual([]);
    expect(check(`@media (prefers-reduced-motion: reduce) { .a { top: 0; } }`)).toEqual([]);
    expect(check(`@media (pointer: coarse) and (max-height: 500px) { .a { top: 0; } }`)).toEqual([]);
    expect(check(`@media (max-width: 351.98px) { .a { top: 0; } }`)).toEqual([]);
    expect(check(`@media ${PHONE_QUERY} { @media (max-height: 420px) { .a { top: 0; } } }`)).toEqual([]);
    expect(check(`@media (max-width: 768px) { .a { top: 0; } }`)).toHaveLength(1);
    expect(check(`@media (min-width: 641px) { .a { top: 0; } }`)).toHaveLength(1);
    expect(check(`@media (pointer: coarse) { .a { top: 0; } }`)).toHaveLength(1);
    // Touch at any size may grow hit areas, and nothing else.
    expect(check(`@media (pointer: coarse) { .a { height: 44px; } .b { position: relative; } .b::before { content: ""; position: absolute; inset: -6px; } }`)).toEqual([]);
    expect(check(`@media (pointer: coarse) { .a { height: 40px; } }`)).toHaveLength(1);
    // It may also make the room the phone layout makes for those targets, with the same declaration.
    expect(check(`@media (pointer: coarse) { .s { padding-bottom: 62px; } } @media ${PHONE_QUERY} { .s { padding-bottom: 62px; } }`)).toEqual([]);
    expect(check(`@media (pointer: coarse) { .s { padding-bottom: 70px; } } @media ${PHONE_QUERY} { .s { padding-bottom: 62px; } }`)).toHaveLength(1);
    expect(check(`@media (pointer: coarse) { .a::before { content: ""; position: absolute; inset: -6px; } .a { display: none; } }`)).toHaveLength(1);
    expect(check(`@media (max-height: 500px) { .a { top: 0; } }`)).toHaveLength(1);
  });

  it("keeps scale and zoom where they belong", () => {
    expect(scaleProblems("src/components/gallery/gallery.css", readCss(`.gw-frame:active { scale: 0.98; }`))).toEqual([]);
    expect(scaleProblems("src/components/shell/shell.css", readCss(`.peek { transform: scale(0.97); }`))).toHaveLength(1);
    expect(scaleProblems("src/components/shell/shell.css", readCss(`.ctl:active { scale: 0.96; }`))).toHaveLength(1);
    for (const fn of ["scaleX(2)", "scaleY(2)", "scale3d(2, 2, 1)", "SCALEX(2)", "ScaleX(2)", "SCALE(3)", "matrix(2, 0, 0, 2, 0, 0)", "matrix3d(2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)"]) {
      expect(scaleProblems("src/components/shell/shell.css", readCss(`.peek { transform: ${fn}; }`)), fn).toHaveLength(1);
    }
    expect(scaleProblems("src/components/shell/shell.css", readCss(`.peek { transform: matrix(1, 0, 0, 1, 12, 0); }`))).toEqual([]);
    expect(scaleProblems("src/components/rule/compare.css", readCss(`[data-zoom="2"] .pane { transform: scale(2); }`))).toEqual([]);
    expect(scaleProblems("src/components/rule/compare.css", readCss(`[data-zoom="2"] .pane { transform: scale(2); } .b { transform: matrix(2, 0, 0, 2, 0, 0); }`))).toHaveLength(1);
    expect(scaleProblems("src/components/rule/compare.css", readCss(`.pane { transform: scale(2); }`))).toHaveLength(1);
    expect(scaleProblems("src/components/rule/rule.css", readCss(`.a { zoom: 2; }`))).toHaveLength(1);
  });
});

// ── The repo ─────────────────────────────────────────────────────────

const sheets = FEATURE_DIRS.flatMap((dir) => walk(dir, /\.css$/)).map((file) => ({
  file,
  sheet: readCss(readFileSync(path.join(ROOT, file), "utf8")),
}));

describe("feature stylesheets", () => {
  it("exist once the shell lands", () => {
    expect(sheets.map(({ file }) => file)).toContain("src/components/shell/shell.css");
  });

  for (const { file, sheet } of sheets) {
    it(`${file} takes colours, radii and type from tokens`, () => {
      expect([...colourProblems(sheet), ...radiusProblems(sheet), ...typeProblems(sheet)]).toEqual([]);
    });
    it(`${file} switches layouts on PHONE_QUERY only`, () => {
      expect(mediaProblems(sheet)).toEqual([]);
    });
    it(`${file} keeps scale and zoom in their place`, () => {
      expect(scaleProblems(file, sheet)).toEqual([]);
    });
  }

  it("defines no .sd-hint, and each hint class in one stylesheet at most", () => {
    const globals = readCss(readFileSync(path.join(ROOT, "src/app/globals.css"), "utf8"));
    expect([globals, ...sheets.map(({ sheet }) => sheet)].some((sheet) => classDefined(sheet, "sd-hint"))).toBe(false);
    for (const name of ["strip-hint", "rule-hint"]) {
      expect(sheets.filter(({ sheet }) => classDefined(sheet, name)).length, name).toBeLessThanOrEqual(1);
    }
  });
});

describe("strict marker", () => {
  const modules = STRICT_DIRS.flatMap((dir) => walk(dir, /\.tsx?$/));

  it(`opens every module under ${STRICT_DIRS.join(", ")}`, () => {
    const missing = modules.filter(
      (file) => !GRANDFATHERED.includes(file) && !readFileSync(path.join(ROOT, file), "utf8").startsWith(`${MARKER}\n`),
    );
    expect(missing).toEqual([]);
  });

  it("keeps the grandfathered list closed and honest", () => {
    for (const file of GRANDFATHERED) {
      expect(existsSync(path.join(ROOT, file)), `${file} is gone: drop it from GRANDFATHERED`).toBe(true);
      expect(readFileSync(path.join(ROOT, file), "utf8").startsWith(MARKER), `${file} carries the marker: drop it from GRANDFATHERED`).toBe(false);
    }
  });

  it("covers the shell's own modules", () => {
    expect(modules).toEqual(expect.arrayContaining(["src/components/shell/shell.tsx", "src/components/shell/shell-context.ts"]));
  });
});
