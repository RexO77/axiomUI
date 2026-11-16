import { readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { compile } from "tailwindcss";
import { describe, expect, it } from "vitest";

/**
 * Guardrails for the shell's tokens: the backdrop
 * the rail sits on, the sheet over it, the stage previews paint on, and the
 * translucent hover and press fills that have to show on all three.
 *
 * The design states numbers — "#737373 was 4.31:1 on the backdrop", "the tone
 * step is only ~1.1:1" — and globals.css repeats them in comments. These
 * tests recompute them from the declared values, so a later tweak to one
 * token can't quietly break a claim made about another.
 */

const GLOBALS = readFileSync(path.resolve(__dirname, "../../app/globals.css"), "utf8");
const CSS = GLOBALS.replace(/\/\*[\s\S]*?\*\//g, "");

/** Body of the first block whose header matches, by brace matching. */
function block(css: string, header: RegExp): string {
  const match = header.exec(css);
  expect(match, String(header)).not.toBeNull();
  const open = css.indexOf("{", match!.index + match![0].length - 1);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  throw new Error(`unclosed block ${header}`);
}

function declarations(body: string): Map<string, string> {
  const flat = body.replace(/\{[^{}]*\}/g, "");
  const out = new Map<string, string>();
  for (const match of flat.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    out.set(match[1], match[2].replace(/\s+/g, " ").trim());
  }
  return out;
}

const light = declarations(block(CSS, /^:root\s*\{/m));
const dark = declarations(block(CSS, /^\.dark\s*\{/m));
const inline = declarations(block(CSS, /@theme inline\s*\{/));
const statics = declarations(block(CSS, /@theme static\s*\{/));
const themes = { light, dark } as const;

// ── Tailwind compilation, for the phone variant ─────────────────────

const TAILWIND = path.dirname(createRequire(import.meta.url).resolve("tailwindcss/package.json"));
const PHONE_MEDIA = "@media (max-width: 640px), (pointer: coarse) and (max-height: 500px)";
const PHONE_QUERY_TAIL = "(pointer: coarse) and (max-height: 500px)";

/** globals.css through Tailwind's own compiler, asked for two phone utilities. */
async function compilePhone(globals: string): Promise<string> {
  const compiler = await compile(globals, {
    base: path.resolve(__dirname, "../../app"),
    async loadStylesheet(id: string, base: string) {
      const file =
        id === "tailwindcss"
          ? path.join(TAILWIND, "index.css")
          : id.startsWith("tailwindcss/")
            ? path.join(TAILWIND, id.slice("tailwindcss/".length))
            : path.resolve(base, id);
      return { path: file, base: path.dirname(file), content: readFileSync(file, "utf8") };
    },
  });
  return compiler.build(["phone:min-h-11", "phone:before:min-h-11"]);
}

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** What is wrong with the emitted phone utilities; empty when both sit in the one media rule. */
function phoneProblems(out: string): string[] {
  const flat = out.replace(/\s+/g, " ");
  const media = escapeRegExp(PHONE_MEDIA);
  const problems: string[] = [];
  if (!new RegExp(`\\.phone\\\\:min-h-11 \\{ ${media} \\{ min-height: [^;]+; \\} \\}`).test(flat)) {
    problems.push("phone:min-h-11 is not inside the phone media rule");
  }
  const before = `\\.phone\\\\:before\\\\:min-h-11 \\{ ${media} \\{ &::before \\{ content: var\\(--tw-content\\); min-height: [^;]+; \\} \\} \\}`;
  if (!new RegExp(before).test(flat)) problems.push("phone:before:min-h-11 is not inside the phone media rule");
  const stray = flat.split(PHONE_QUERY_TAIL).length - flat.split(PHONE_MEDIA).length;
  if (stray > 0) problems.push(`${stray} use(s) of "${PHONE_QUERY_TAIL}" outside an @media rule, as a selector`);
  return problems;
}

// ── Colour maths (WCAG 2.x, as design-system.test.ts and consistency.test.ts)

type RGB = [number, number, number];

function parseHex(value: string): RGB {
  expect(value).toMatch(/^#[0-9a-f]{6}$/i);
  return [1, 3, 5].map((at) => parseInt(value.slice(at, at + 2), 16)) as RGB;
}

/** `rgb(0 0 0 / 0.04)` → colour and alpha. */
function parseRgba(value: string): { rgb: RGB; alpha: number } {
  const match = value.match(/^rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)$/);
  expect(match, `${value} is rgb(r g b / a)`).not.toBeNull();
  return { rgb: [Number(match![1]), Number(match![2]), Number(match![3])], alpha: Number(match![4]) };
}

/** A translucent fill painted over an opaque backdrop. */
function over(fill: string, backdrop: RGB): RGB {
  const { rgb, alpha } = parseRgba(fill);
  return rgb.map((channel, i) => channel * alpha + backdrop[i] * (1 - alpha)) as RGB;
}

function luminance([r, g, b]: RGB): number {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function tone(tokens: Map<string, string>, name: string): RGB {
  const value = tokens.get(`--ax-${name}`);
  expect(value, `--ax-${name}`).toBeDefined();
  return parseHex(value!);
}

const BACKGROUNDS = ["backdrop", "canvas", "surface", "sunken", "stage", "raised", "overlay"];
const fmt = (ratio: number) => `${ratio.toFixed(2)}:1`;

// ── The spec's values ────────────────────────────────────────────────

describe("shell tokens match the design's values", () => {
  const SPEC: [string, string, string][] = [
    ["--ax-backdrop", "#f4f4f4", "#0a0a0a"],
    ["--ax-surface", "#ffffff", "#161616"],
    ["--ax-stage", "#ffffff", "#111111"],
    ["--ax-raised", "#ffffff", "#333333"],
    ["--ax-overlay", "#ffffff", "#1f1f1f"],
    ["--ax-ink", "#171717", "#ededed"],
    ["--ax-ink-secondary", "#525252", "#b4b4b4"],
    ["--ax-hover", "rgb(0 0 0 / 0.04)", "rgb(255 255 255 / 0.05)"],
    ["--ax-press", "rgb(0 0 0 / 0.09)", "rgb(255 255 255 / 0.08)"],
    ["--ax-line", "rgb(0 0 0 / 0.08)", "rgb(255 255 255 / 0.08)"],
    ["--ax-line-strong", "rgb(0 0 0 / 0.14)", "rgb(255 255 255 / 0.14)"],
    ["--ax-ink-muted", "#666666", "#a3a3a3"],
    [
      "--ax-shadow-sheet",
      "0 0 0 1px rgb(0 0 0 / 0.06), 0 1px 2px rgb(0 0 0 / 0.04), 0 4px 16px -4px rgb(0 0 0 / 0.06)",
      "0 0 0 1px rgb(255 255 255 / 0.07)",
    ],
    ["--ax-shadow-item", "0 0 0 1px rgb(0 0 0 / 0.06), 0 1px 2px rgb(0 0 0 / 0.05)", "0 0 0 1px rgb(255 255 255 / 0.07)"],
  ];

  for (const [name, lightValue, darkValue] of SPEC) {
    it(name, () => {
      expect(light.get(name)).toBe(lightValue);
      expect(dark.get(name)).toBe(darkValue);
    });
  }

  it("registers each one as a Tailwind utility", () => {
    const UTILITIES: [string, string][] = [
      ["--color-backdrop", "var(--ax-backdrop)"],
      ["--color-stage", "var(--ax-stage)"],
      ["--color-raised", "var(--ax-raised)"],
      ["--color-overlay", "var(--ax-overlay)"],
      ["--color-hover", "var(--ax-hover)"],
      ["--color-press", "var(--ax-press)"],
      ["--shadow-sheet", "var(--ax-shadow-sheet)"],
      ["--shadow-item", "var(--ax-shadow-item)"],
      ["--shadow-popover", "var(--ax-shadow-popover)"],
    ];
    for (const [name, value] of UTILITIES) expect(inline.get(name), name).toBe(value);
  });

  it("names every shell radius, so a consumer says which shape it means", () => {
    // Sheet 12, control 8, tooltip 6,
    // item 5 (inside an 8 track with 3 padding), kbd 4, progress track 2.
    const RADII: [string, string][] = [
      ["--radius-sheet", "12px"],
      ["--radius-control", "8px"],
      ["--radius-tip", "6px"],
      ["--radius-item", "5px"],
      ["--radius-kbd", "4px"],
      ["--radius-track", "2px"],
    ];
    for (const [name, value] of RADII) expect(statics.get(name), name).toBe(value);
    // The item nests in its control: 5 + 3 padding = 8, as the comment says.
    expect(parseFloat(statics.get("--radius-item")!) + 3).toBe(parseFloat(statics.get("--radius-control")!));
    expect(GLOBALS).toMatch(/8 track − 3 padding\. \*\/\s*--radius-item:/);
  });

  it("rings a keycap with the hairline tokens, live and off", () => {
    for (const [mode, tokens] of Object.entries(themes)) {
      expect(tokens.get("--ax-shadow-keycap"), mode).toBe("inset 0 0 0 1px var(--ax-line-strong)");
      expect(tokens.get("--ax-shadow-keycap-off"), mode).toBe("inset 0 0 0 1px var(--ax-line)");
    }
    expect(inline.get("--shadow-keycap")).toBe("var(--ax-shadow-keycap)");
    expect(inline.get("--shadow-keycap-off")).toBe("var(--ax-shadow-keycap-off)");
  });

  it("compiles phone utilities, plain and pseudo-element, inside the one phone media rule", async () => {
    // A build only emits `phone:` classes something uses, so it could miss a
    // broken variant. This compiles two on purpose.
    const out = await compilePhone(GLOBALS);
    expect(out).toContain(".phone\\:min-h-11");
    expect(out).toContain(".phone\\:before\\:min-h-11");
    expect(phoneProblems(out)).toEqual([]);
  });

  it("catches the shorthand that compiled the touch query into a selector", async () => {
    // The first form of this variant: Tailwind split the media list and emitted
    // `(pointer: coarse) and (max-height: 500px)` as a nested selector.
    const shorthand = GLOBALS.replace(
      /@custom-variant phone \{[\s\S]*?@slot;\s*\}\s*\}/,
      "@custom-variant phone (@media (max-width: 640px), (pointer: coarse) and (max-height: 500px));"
    );
    expect(shorthand).not.toBe(GLOBALS);
    expect(phoneProblems(await compilePhone(shorthand)).join("\n")).toMatch(/outside an @media rule/);
  });

  it("gives every shell elevation a 1px ring, the edge that survives dark mode", () => {
    for (const [mode, tokens] of Object.entries(themes)) {
      for (const name of ["sheet", "item", "popover"]) {
        expect(tokens.get(`--ax-shadow-${name}`), `${mode} --ax-shadow-${name}`).toMatch(/^0 0 0 1px rgb\(/);
      }
    }
  });
});

// ── Contrast ─────────────────────────────────────────────────────────

describe("shell token contrast", () => {
  for (const [mode, tokens] of Object.entries(themes)) {
    for (const bg of BACKGROUNDS) {
      it(`${mode}: readable text clears 4.5:1 on ${bg}`, () => {
        for (const fg of ["ink", "ink-secondary", "ink-muted", "do-ink", "dont-ink"]) {
          const ratio = contrast(tone(tokens, fg), tone(tokens, bg));
          expect(ratio, `${fg} on ${bg} = ${fmt(ratio)}`).toBeGreaterThanOrEqual(4.5);
        }
      });

      // No meaningful glyph may use ink-faint: light ink-faint is main's
      // #a3a3a3, under 3:1 on every surface, so light faint glyphs are not
      // held to 3:1 here. A glyph that means something on its own (a state, a
      // control with no label beside it) is ink-muted, held to WCAG 1.4.11's
      // 3:1 in both themes on every surface. "ink-faint stays decorative",
      // below, holds today's ink-faint glyphs to aria-hidden.
      it(`${mode}: meaningful glyphs (ink-muted) clear 3:1 on ${bg}`, () => {
        const ratio = contrast(tone(tokens, "ink-muted"), tone(tokens, bg));
        expect(ratio, `ink-muted on ${bg} = ${fmt(ratio)}`).toBeGreaterThanOrEqual(3);
      });

      // The focus ring is drawn on the original shell surfaces only.
      if (bg === "raised" || bg === "overlay") continue;
      it(`${mode}: the focus ring clears 3:1 on ${bg}`, () => {
        const ratio = contrast(tone(tokens, "ring"), tone(tokens, bg));
        expect(ratio, `ring on ${bg} = ${fmt(ratio)}`).toBeGreaterThanOrEqual(3);
      });
    }
  }

  it("keeps light ink-faint at main's #a3a3a3", () => {
    // Light ink-faint is decorative only (a separator, or an icon beside a
    // label that already says the same thing), so it stays main's lighter
    // value; anything a reader needs uses ink-muted instead.
    expect(light.get("--ax-ink-faint")).toBe("#a3a3a3");
  });

  it("keeps the comment's reason for ink-faint being decorative true", () => {
    // globals.css says light ink-faint is under 3:1 on every surface. If a
    // later value clears 3:1 the claim is stale; if the comment stops saying
    // so, the rule it justifies has lost its reason.
    const comment = GLOBALS.match(/\/\*([^*]*(?:\*(?!\/)[^*]*)*)\*\/\s*--ax-ink:/)?.[1] ?? "";
    expect(comment).toMatch(/ink-faint is decorative/);
    expect(comment).toMatch(/under 3:1 on every\s+surface/);
    expect(comment).toMatch(/glyph that means something on its own/);
    expect(comment).not.toMatch(/ink-faint is for glyphs and placeholders/);
    for (const bg of BACKGROUNDS) {
      const ratio = contrast(tone(light, "ink-faint"), tone(light, bg));
      expect(ratio, `light ink-faint on ${bg} = ${fmt(ratio)}`).toBeLessThan(3);
    }
  });

  it("holds dark ink-faint to 3:1 on the shell surfaces it can sit on", () => {
    for (const bg of BACKGROUNDS) {
      if (bg === "raised" || bg === "overlay") continue;
      const ratio = contrast(tone(dark, "ink-faint"), tone(dark, bg));
      expect(ratio, `dark ink-faint on ${bg} = ${fmt(ratio)}`).toBeGreaterThanOrEqual(3);
    }
  });

  it("keeps the dark ink ladder distinct on every surface", () => {
    for (const bg of BACKGROUNDS) {
      const primary = contrast(tone(dark, "ink"), tone(dark, bg));
      const secondary = contrast(tone(dark, "ink-secondary"), tone(dark, bg));
      expect(primary / secondary, bg).toBeGreaterThanOrEqual(1.5);
    }
  });

  it("keeps neutral-900 preview cards above the dark stage, with a ring carrying the edge", () => {
    // #171717 over #111111 is only 1.05:1: decorative tone separation, not
    // a control boundary. color-12's Do cards retain their white/9% ring;
    // that edge must remain stronger than the fill against the stage.
    const stage = tone(dark, "stage");
    const card = parseHex("#171717");
    const fill = contrast(card, stage);
    expect(fill).toBeGreaterThanOrEqual(1.05);
    expect(contrast(over("rgb(255 255 255 / 0.09)", card), stage)).toBeGreaterThan(fill);
  });

  it("keeps the reason for the ink-muted change true", () => {
    // The plan moved light ink-muted off #737373 because it is 4.31:1 on the
    // backdrop. If the backdrop moves, this claim and the comment go stale.
    const ratio = contrast(parseHex("#737373"), tone(light, "backdrop"));
    expect(ratio.toFixed(2)).toBe("4.31");
  });

  it("tooltips (inverse) clear 4.5:1 for their label", () => {
    for (const tokens of Object.values(themes)) {
      expect(contrast(tone(tokens, "on-inverse"), tone(tokens, "inverse"))).toBeGreaterThanOrEqual(4.5);
    }
  });
});

// ── Translucent fills and hairlines ──────────────────────────────────

describe("hover and press fills", () => {
  // Design floors, not WCAG requirements: hover clears 1.05:1 against its
  // background; press vs hover clears 1.10:1 light and 1.05:1 dark. A fill
  // that rounds to the backdrop was the defect these tokens replace.
  const STEP = 1.05;

  for (const [mode, tokens] of Object.entries(themes)) {
    for (const bg of ["backdrop", "surface", "stage"]) {
      it(`${mode}: show on ${bg}, press deeper than hover`, () => {
        const base = tone(tokens, bg);
        const hover = contrast(over(tokens.get("--ax-hover")!, base), base);
        const press = contrast(over(tokens.get("--ax-press")!, base), base);
        expect(hover, `hover on ${bg} = ${fmt(hover)}`).toBeGreaterThanOrEqual(STEP);
        const step = contrast(over(tokens.get("--ax-press")!, base), over(tokens.get("--ax-hover")!, base));
        expect(press, `press on ${bg}`).toBeGreaterThan(hover);
        expect(step, `press vs hover on ${bg} = ${fmt(step)}`).toBeGreaterThanOrEqual(mode === "light" ? 1.10 : STEP);
      });
    }

    it(`${mode}: are translucent, so one value serves every tone`, () => {
      for (const name of ["hover", "press"]) {
        const { alpha } = parseRgba(tokens.get(`--ax-${name}`)!);
        expect(alpha, name).toBeGreaterThan(0);
        expect(alpha, name).toBeLessThan(0.2);
      }
    });
  }
});

describe("hairlines", () => {
  it("are documented as decorative, since they don't reach 3:1", () => {
    // WCAG 1.4.11 asks 3:1 only of a boundary a control needs to be
    // identified. The hairline is ~1.2:1 by design, so the comment must say
    // what it is for and what a control uses instead.
    const comment = GLOBALS.match(/\/\*([^*]*(?:\*(?!\/)[^*]*)*)\*\/\s*--ax-line:/)?.[1] ?? "";
    expect(comment).toMatch(/Decorative/);
    expect(comment).toMatch(/line-strong/);
  });

  for (const [mode, tokens] of Object.entries(themes)) {
    it(`${mode}: still show on every background, and line-strong is the stronger`, () => {
      for (const bg of BACKGROUNDS) {
        const base = tone(tokens, bg);
        const line = contrast(over(tokens.get("--ax-line")!, base), base);
        const strong = contrast(over(tokens.get("--ax-line-strong")!, base), base);
        expect(line, `line on ${bg} = ${fmt(line)}`).toBeGreaterThanOrEqual(1.15);
        expect(strong, `line-strong on ${bg}`).toBeGreaterThan(line);
      }
    });
  }

  it("the sheet's tone step is too small to stand alone", () => {
    // Why the sheet needs its ring and a forced-colors border.
    for (const tokens of Object.values(themes)) {
      expect(contrast(tone(tokens, "surface"), tone(tokens, "backdrop"))).toBeLessThan(1.5);
    }
  });
});

// ── Forced colors ────────────────────────────────────────────────────

describe("forced colors", () => {
  const media = [...CSS.matchAll(/@media \(forced-colors: active\)\s*\{/g)].map((match) =>
    block(CSS.slice(match.index), /@media \(forced-colors: active\)\s*\{/)
  );
  const rules = media.join("\n");

  /** The declarations of every rule whose selector names the utility. */
  function forcedFor(utility: string): string {
    return [...rules.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
      .filter(([, selector]) => selector.includes(`"${utility}"`) && selector.includes(`":${utility}"`))
      .map(([, , body]) => body)
      .join(";");
  }

  it("give the sheet and popovers a real border", () => {
    for (const utility of ["shadow-sheet", "shadow-popover"]) {
      expect(forcedFor(utility), utility).toMatch(/border:\s*1px solid CanvasText/);
    }
  });

  it("outline the active rail item without stealing the focus ring", () => {
    expect(forcedFor("shadow-item")).toMatch(/outline:\s*2px solid Highlight/);
    expect(rules).toMatch(/shadow-item"\]\):not\(:focus-visible\)/);
  });

  it("sit in @layer components, where a :where() rule beats the preflight border reset", () => {
    expect(block(CSS, /@layer components\s*\{/)).toMatch(/@media \(forced-colors: active\)/);
  });
});

// ── ink-faint stays decorative ───────────────────────────────────────

const SRC = path.resolve(__dirname, "../..");

function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return entry === "__tests__" || entry === "data" || entry === "proto" ? [] : tsxFiles(full);
    return entry.endsWith(".tsx") ? [full] : [];
  });
}

/** The opening JSX tag that spans `index`, quote- and brace-aware, or undefined. */
function enclosingTag(source: string, index: number): string | undefined {
  let start = index;
  while (start >= 0 && !(source[start] === "<" && /[A-Za-z]/.test(source[start + 1] ?? ""))) start--;
  if (start < 0) return undefined;
  let depth = 0;
  let quote = "";
  for (let i = start + 1; i < source.length; i++) {
    const c = source[i];
    if (quote) {
      if (c === quote) quote = "";
    } else if (c === '"' || c === "'" || c === "`") quote = c;
    else if (c === "{") depth++;
    else if (c === "}") depth--;
    else if (c === ">" && depth === 0) return i > index ? source.slice(start, i + 1) : undefined;
  }
  return undefined;
}

describe("ink-faint stays decorative", () => {
  it("marks every ink-faint glyph aria-hidden, and no placeholder uses it", () => {
    // Light ink-faint is under 3:1 (above), so a glyph that means something
    // uses ink-muted. Where ink-faint is written, the element is hidden from
    // assistive tech: a separator, or an icon beside a label that says it.
    const offenders: string[] = [];
    let checked = 0;
    for (const file of tsxFiles(SRC)) {
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(/(?<![\w-])((?:[\w-]+:)*)(?:text|fill|stroke)-ink-faint(?![\w-])/g)) {
        checked++;
        const where = `${path.relative(SRC, file)}:${source.slice(0, match.index).split("\n").length}`;
        if (match[1].includes("placeholder:")) {
          offenders.push(`${where}: a placeholder uses ink-faint; use ink-muted`);
          continue;
        }
        const tag = enclosingTag(source, match.index!);
        if (!tag || !/\saria-hidden(?:="true"|=\{true\})?(?=[\s/>])/.test(tag)) {
          offenders.push(`${where}: ink-faint on an element that is not aria-hidden; use ink-muted if it means something`);
        }
      }
    }
    expect(offenders, offenders.join("\n")).toEqual([]);
    // Today: the empty-state icon, the breadcrumb separator, the tag icon and
    // the search magnifier. Zero would mean the scan stopped finding them.
    expect(checked).toBeGreaterThan(0);
  });

  it("finds the tag around a class, and none for a class kept in a constant", () => {
    const jsx = `<Icon aria-hidden="true" onClick={() => a > b} className="size-4 text-ink-faint" />`;
    expect(enclosingTag(jsx, jsx.indexOf("text-ink-faint"))).toBe(jsx);
    const constant = `<p>x</p>; const ICON = "text-ink-faint";`;
    expect(enclosingTag(constant, constant.indexOf("text-ink-faint"))).toBeUndefined();
  });
});

// ── Rail and strip marks ─────────────────────────────────────────────

/*
 * Every mark in the strip and the rail's mini runs is a link, so its resting
 * and visited greys are held to WCAG 1.4.11's 3:1 on the backdrop the rail
 * sits on. They are `color-mix(in oklch, ink N%, backdrop)`; for two greys
 * that is a straight mix of OKLab lightness, recomputed here.
 */
describe("rail and strip marks", () => {
  const SHELL = readFileSync(path.resolve(__dirname, "../../components/shell/shell.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const railTokens = { light: declarations(block(SHELL, /^\.shell-rail\s*\{/m)), dark: declarations(block(SHELL, /^\.dark \.shell-rail\s*\{/m)) };

  const toLinear = (value: number) => {
    const c = value / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const fromLinear = (value: number) => 255 * (value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055);
  /** OKLab lightness of a grey: the cube root of its linear value (the LMS rows each sum to 1). */
  const lightnessOf = ([r, g, b]: RGB) => {
    expect(r === g && g === b, "a grey").toBe(true);
    return Math.cbrt(toLinear(r));
  };
  function mixed(value: string, tokens: Map<string, string>): RGB {
    const match = value.match(/^color-mix\(in oklch, var\(--ax-ink\) ([\d.]+)%, var\(--ax-backdrop\)\)$/);
    expect(match, `${value} is an ink-over-backdrop mix`).not.toBeNull();
    const share = Number(match![1]) / 100;
    const lightness = lightnessOf(tone(tokens, "ink")) * share + lightnessOf(tone(tokens, "backdrop")) * (1 - share);
    const channel = fromLinear(lightness ** 3);
    return [channel, channel, channel];
  }

  for (const [mode, tokens] of Object.entries(themes)) {
    const rail = railTokens[mode as keyof typeof railTokens];
    it(`${mode}: resting and visited marks clear 3:1 on the backdrop, visited a step above resting`, () => {
      const resting = contrast(mixed(rail.get("--rail-mark")!, tokens), tone(tokens, "backdrop"));
      const visited = contrast(mixed(rail.get("--rail-visited")!, tokens), tone(tokens, "backdrop"));
      expect(resting, `resting mark = ${fmt(resting)}`).toBeGreaterThanOrEqual(3);
      expect(visited, `visited mark = ${fmt(visited)}`).toBeGreaterThan(resting * 1.3);
    });
  }

  it("the strip paints its marks with the rail's tokens", () => {
    const strip = (selector: RegExp) => declarations(block(SHELL, selector).replace(/(^|;)\s*background:/g, "$1--background:")).get("--background");
    expect(strip(/^\.strip-mark\s*\{/m)).toBe("var(--rail-mark)");
    expect(strip(/^\.strip-item\[data-visited\] \.strip-mark\s*\{/m)).toBe("var(--rail-visited)");
    expect(SHELL).not.toMatch(/^\.dark \.strip-(?:mark|item\[data-visited\] \.strip-mark)\s*\{/m);
  });
});
