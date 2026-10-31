import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DUR, EASE } from "@/lib/showcase-engine";

/**
 * Guardrails for the token layer in globals.css and for the files that have
 * opted into it.
 *
 * Every failure here was once a visible defect that no type or linter caught:
 * `:root { --radius-md: 12px }` silently rewrote Tailwind's `rounded-md`, an
 * unlayered `.pressable` beat the transition utilities next to it, `font-mono`
 * resolved to the OS mono because no `@theme` registered the face, and the
 * showcase engine's ease drifted from the CSS token it claims to mirror.
 */

const SRC = path.resolve(__dirname, "../..");
const GLOBALS = readFileSync(path.join(SRC, "app/globals.css"), "utf8");
const CSS = GLOBALS.replace(/\/\*[\s\S]*?\*\//g, "");

/** Bodies of every block whose header matches, found by brace matching. */
function blocks(css: string, header: RegExp): { start: number; end: number; body: string }[] {
  const found: { start: number; end: number; body: string }[] = [];
  const re = new RegExp(header.source, header.flags.includes("g") ? header.flags : `${header.flags}g`);
  for (let match = re.exec(css); match; match = re.exec(css)) {
    const open = css.indexOf("{", match.index + match[0].length - 1);
    let depth = 0;
    for (let i = open; i < css.length; i++) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}" && --depth === 0) {
        found.push({ start: match.index, end: i + 1, body: css.slice(open + 1, i) });
        re.lastIndex = i + 1;
        break;
      }
    }
  }
  return found;
}

function without(css: string, header: RegExp): string {
  let out = css;
  for (const block of blocks(css, header).reverse()) {
    out = out.slice(0, block.start) + out.slice(block.end);
  }
  return out;
}

const THEME = /@theme\b[^{]*\{/;
const COMPONENTS = /@layer components\s*\{/;
const themeBodies = blocks(CSS, THEME).map((block) => block.body).join("\n");

/** Custom properties declared directly in a block (nested blocks excluded). */
function declarations(body: string): Map<string, string> {
  const flat = body.replace(/\{[^{}]*\}/g, "");
  const out = new Map<string, string>();
  for (const match of flat.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    out.set(match[1], match[2].replace(/\s+/g, " ").trim());
  }
  return out;
}

const [rootBlock] = blocks(CSS, /^:root\s*\{/m);
const [darkBlock] = blocks(CSS, /^\.dark\s*\{/m);
const light = declarations(rootBlock.body);
const dark = declarations(darkBlock.body);
const theme = declarations(themeBodies);

// ── WCAG 2.x contrast (the same formula consistency.test.ts checks claims with)

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const channel = (pair: string) => {
    const c = parseInt(pair, 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(h.slice(0, 2)) + 0.7152 * channel(h.slice(2, 4)) + 0.0722 * channel(h.slice(4, 6));
}

function contrastRatio(fg: string, bg: string): number {
  const a = luminance(fg);
  const b = luminance(bg);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

function hex(tokens: Map<string, string>, name: string): string {
  const value = tokens.get(`--ax-${name}`);
  expect(value, `--ax-${name}`).toMatch(/^#[0-9a-f]{6}$/i);
  return value!;
}

describe("globals.css token layer", () => {
  it("registers the three type faces with Tailwind", () => {
    for (const face of ["sans", "serif", "mono"]) {
      expect(theme.get(`--font-${face}`), `--font-${face} in @theme`).toBeDefined();
    }
  });

  it("keeps component classes inside @layer components, below the utilities", () => {
    const outside = without(CSS, COMPONENTS);
    for (const name of ["pressable", "reveal", "rule-card", "glass"]) {
      expect(outside, `.${name} outside @layer components`).not.toMatch(new RegExp(`\\.${name}(?![\\w-])`));
      expect(blocks(CSS, COMPONENTS).some((block) => block.body.includes(`.${name}`))).toBe(true);
    }
  });

  it("declares no raw value in a Tailwind namespace outside @theme", () => {
    const outside = without(CSS, THEME);
    expect(outside).not.toMatch(/--shadow-(?:sm|md|lg|xl)\s*:/);
    expect(outside).not.toMatch(/--color-[\w-]+\s*:/);
  });

  it("leaves Tailwind's numeric radius scale alone", () => {
    // `:root { --radius-md: 12px }` once made rounded-md 12px, rounded-xl
    // larger than rounded-2xl, and comp-4's square avatar a circle. Named
    // radii (frame, field, well, card) belong in @theme; the numeric steps
    // stay Tailwind's own 2/4/6/8/12/16/24/32.
    const outside = without(CSS, THEME);
    expect(outside).not.toMatch(/--radius-(?:xs|sm|md|lg|xl|\dxl)\s*:/);
    expect(themeBodies).not.toMatch(/--radius-(?:xs|sm|md|lg|xl|\dxl)\s*:/);
  });

  it("defines every raw token for both themes", () => {
    const lightOnly = [...light.keys()].filter((name) => name.startsWith("--ax-") && !dark.has(name));
    expect(lightOnly).toEqual([]);
  });

  it("references only raw tokens that exist", () => {
    const used = new Set([...CSS.matchAll(/var\((--ax-[\w-]+)/g)].map((match) => match[1]));
    for (const name of used) expect(light.has(name), name).toBe(true);
  });
});

describe("showcase-engine mirrors the motion tokens", () => {
  const css = (name: string) => theme.get(name) ?? light.get(name);
  const bezier = (value: string | undefined) => value?.replace(/\s+/g, "");

  it("eases", () => {
    expect(bezier(EASE.out)).toBe(bezier(css("--ease-out-strong")));
    expect(bezier(EASE.inOut)).toBe(bezier(css("--ease-in-out-strong")));
  });

  it("durations", () => {
    expect(`${DUR.fast}ms`).toBe(css("--motion-fast"));
    expect(`${DUR.medium}ms`).toBe(css("--motion-medium"));
    expect(`${DUR.slow}ms`).toBe(css("--motion-slow"));
  });
});

describe("token contrast", () => {
  const themes = { light, dark };

  for (const [mode, tokens] of Object.entries(themes)) {
    for (const bg of ["canvas", "surface", "sunken"]) {
      it(`${mode}: readable text clears 4.5:1 on ${bg}`, () => {
        for (const fg of ["ink", "ink-secondary", "ink-muted", "do-ink", "dont-ink"]) {
          const ratio = contrastRatio(hex(tokens, fg), hex(tokens, bg));
          expect(ratio, `${fg} on ${bg} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
        }
      });
    }

    it(`${mode}: the focus ring clears 3:1 on canvas and surface`, () => {
      for (const bg of ["canvas", "surface"]) {
        const ratio = contrastRatio(hex(tokens, "ring"), hex(tokens, bg));
        expect(ratio, `ring on ${bg} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(3);
      }
    });

    it(`${mode}: the primary pill's label clears 4.5:1`, () => {
      expect(contrastRatio(hex(tokens, "on-inverse"), hex(tokens, "inverse"))).toBeGreaterThanOrEqual(4.5);
    });
  }
});

// ── Strict files ─────────────────────────────────────────────────────

const MARKER = "// design-system: strict";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return entry === "__tests__" ? [] : sourceFiles(full);
    return /\.tsx?$/.test(entry) ? [full] : [];
  });
}

const strictFiles = sourceFiles(SRC).filter((file) => readFileSync(file, "utf8").startsWith(`${MARKER}\n`));

/** Raw palette steps, numeric motion, Tailwind's generic eases, ring-based
 *  focus, and hex backgrounds: everything the tokens replace. */
const FORBIDDEN: [string, RegExp][] = [
  ["raw palette utility", /\b(?:[a-z-]+:)*(?:bg|text|border|ring|divide|outline|placeholder)-(?:neutral|zinc|gray|slate)-\d{2,3}\b/],
  ["numeric duration", /\bduration-\d+\b/],
  ["generic ease", /\bease-(?:in|out|in-out)\b(?!-)/],
  ["ring focus recipe", /focus-visible:ring/],
  ["hex background", /bg-\[#/],
];

/** Class strings in this codebase are double-quoted or template literals. */
function classLiterals(source: string): string[] {
  return source.match(/"[^"\n]*"|`[^`]*`/g) ?? [];
}

/**
 * `pressable` owns the transition. A `transition-*` or `duration-*` utility in
 * any string of the same recipe replaces that list, including when the two
 * classes are written in separate constants and joined at render.
 */
function conflictingPressTransition(literals: string[]): string | undefined {
  if (!literals.some((literal) => /\bpressable\b/.test(literal))) return undefined;
  for (const literal of literals) {
    const hit = literal.match(/\b(?:transition|duration)-[\w-]+/);
    if (hit) return hit[0];
  }
  return undefined;
}

describe("pressable transition guard", () => {
  it("catches a transition utility composed from a separate string", () => {
    expect(conflictingPressTransition(['"pressable inline-flex"', '"hover:bg-fill transition-colors"'])).toBe(
      "transition-colors",
    );
  });

  it("allows a recipe whose other strings carry no transition", () => {
    expect(conflictingPressTransition(['"pressable inline-flex"', '"hover:bg-fill"'])).toBeUndefined();
  });
});

describe("files marked `design-system: strict`", () => {
  it("include the shared primitives", () => {
    const relative = strictFiles.map((file) => path.relative(SRC, file));
    for (const file of ["components/ui/icon-button.tsx", "components/ui/button.tsx", "components/ui/verdict-label.tsx"]) {
      expect(relative).toContain(file);
    }
  });

  for (const file of strictFiles) {
    const name = path.relative(SRC, file);
    const source = readFileSync(file, "utf8");

    it(`${name} uses tokens only`, () => {
      for (const [label, pattern] of FORBIDDEN) {
        expect(source.match(pattern)?.[0], `${label} in ${name}`).toBeUndefined();
      }
    });

    it(`${name} lets pressable own its transitions`, () => {
      expect(conflictingPressTransition(classLiterals(source)), name).toBeUndefined();
    });
  }
});

// ── Preview annotation ink ───────────────────────────────────────────

describe("preview annotation ink", () => {
  // Achromatic OKLCH has a = b = 0, so linear R = G = B = L³ and that is the
  // relative luminance WCAG wants. Reading Tailwind's own theme keeps the
  // check true to the steps the previews actually paint.
  const tailwindTheme = readFileSync(path.resolve(SRC, "../node_modules/tailwindcss/theme.css"), "utf8");
  const neutralLuminance = (step: string) => {
    const match = tailwindTheme.match(new RegExp(`--color-neutral-${step}:\\s*oklch\\(([\\d.]+)% 0 0\\)`));
    expect(match, `neutral-${step} in tailwindcss/theme.css`).not.toBeNull();
    return (Number(match![1]) / 100) ** 3;
  };
  const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

  const primitives = readFileSync(path.join(SRC, "components/features/rules/preview-primitives.tsx"), "utf8");
  const ink = primitives.match(/ANNOTATION_INK = "([^"]+)"/)?.[1] ?? "";
  const frame = primitives.match(/"preview-frame [^"]+"/)?.[0] ?? "";

  it("is readable on the preview frame in both themes", () => {
    const lightInk = ink.match(/(?:^|\s)text-neutral-(\d+)/)?.[1];
    const darkInk = ink.match(/dark:text-neutral-(\d+)/)?.[1];
    const darkFrame = frame.match(/dark:bg-neutral-(\d+)/)?.[1];
    expect(frame, "preview frame is white in light mode").toMatch(/(?:^|[\s"])bg-white\b/);
    expect([lightInk, darkInk, darkFrame]).not.toContain(undefined);

    const light = ratio(neutralLuminance(lightInk!), 1);
    const dark = ratio(neutralLuminance(darkInk!), neutralLuminance(darkFrame!));
    expect(light, `neutral-${lightInk} on white = ${light.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    expect(dark, `neutral-${darkInk} on neutral-${darkFrame} = ${dark.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
  });
});
