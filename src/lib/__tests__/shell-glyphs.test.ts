import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Meaningful glyphs. Every glyph that identifies a
 * control or its state (the inactive Flip icon and caption, Segmented icons,
 * rail state icons) uses ink-muted, never ink-faint: light ink-faint is
 * #a3a3a3, under 3:1 on every surface, and stays decorative. This guard
 * scans the shell's existing feature directories and holds ink-muted to
 * WCAG 1.4.11's 3:1 on every surface such a glyph
 * sits on, in both themes, including the Segmented track (fill) the inactive
 * Flip icon is drawn on. shell-tokens.test.ts checks the other surfaces' text.
 */

const ROOT = process.cwd();
const FEATURE_DIRS = ["shell", "rule", "gallery"].map((dir) => `src/components/${dir}`);
const REQUIRED = ["src/components/shell", "src/components/rule"];

function walk(dir: string): string[] {
  const full = path.join(ROOT, dir);
  if (!existsSync(full)) return [];
  return readdirSync(full).flatMap((entry) => {
    const relative = `${dir}/${entry}`;
    if (statSync(path.join(ROOT, relative)).isDirectory()) return entry === "__tests__" ? [] : walk(relative);
    return /\.(?:tsx?|css)$/.test(entry) && !/\.test\./.test(entry) ? [relative] : [];
  });
}

/** Comments out, strings kept: a class or a var() inside a comment is not a use. */
const stripComments = (source: string) => source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");

/** Any use of the faint ink: a utility (`text-ink-faint`, `fill-ink-faint/50`) or the token itself. */
function faintUses(source: string): string[] {
  return [...stripComments(source).matchAll(/(?:\b[\w:[\]&-]*-ink-faint\b(?:\/\d+)?|--(?:ax|color)-ink-faint\b)/g)].map((m) => m[0]);
}

describe("faint-ink scanner (fixtures)", () => {
  it("finds utilities, variants and the token, and ignores comments and other inks", () => {
    expect(faintUses(`<X className="text-ink-faint hover:fill-ink-faint/50" />`)).toEqual(["text-ink-faint", "hover:fill-ink-faint/50"]);
    expect(faintUses(`.a { color: var(--ax-ink-faint); }`)).toEqual(["--ax-ink-faint"]);
    expect(faintUses(`/* text-ink-faint */ // var(--ax-ink-faint)\n<X className="text-ink-muted" />`)).toEqual([]);
  });
});

describe("meaningful glyphs in the shell, the rule view and the gallery", () => {
  const files = FEATURE_DIRS.flatMap(walk);

  it("scans the directories that have landed", () => {
    for (const dir of REQUIRED) expect(files.some((file) => file.startsWith(`${dir}/`)), dir).toBe(true);
  });

  for (const file of files) {
    it(`${file} draws no glyph in ink-faint`, () => {
      expect(faintUses(readFileSync(path.join(ROOT, file), "utf8"))).toEqual([]);
    });
  }
});

// ── Contrast ─────────────────────────────────────────────────────────

const CSS = readFileSync(path.join(ROOT, "src/app/globals.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

function tokens(header: RegExp): Map<string, string> {
  const start = CSS.search(header);
  expect(start, String(header)).toBeGreaterThanOrEqual(0);
  const open = CSS.indexOf("{", start);
  let depth = 0;
  let end = open;
  for (; end < CSS.length; end++) {
    if (CSS[end] === "{") depth++;
    else if (CSS[end] === "}" && --depth === 0) break;
  }
  const body = CSS.slice(open + 1, end).replace(/\{[^{}]*\}/g, "");
  return new Map([...body.matchAll(/(--ax-[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}

type RGB = [number, number, number];
const hex = (value: string | undefined): RGB => {
  expect(value).toMatch(/^#[0-9a-f]{6}$/i);
  return [1, 3, 5].map((at) => parseInt(value!.slice(at, at + 2), 16)) as RGB;
};
/** A translucent `rgb(r g b / a)` fill composited over an opaque base. */
const over = (fill: string | undefined, base: RGB): RGB => {
  const m = fill?.match(/^rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)$/);
  expect(m, fill).not.toBeNull();
  const alpha = Number(m![4]);
  return base.map((channel, i) => Number(m![i + 1]) * alpha + channel * (1 - alpha)) as RGB;
};
const luminance = (rgb: RGB) =>
  rgb
    .map((value) => value / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a: RGB, b: RGB) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** Where a control's glyph can sit: the shell's surfaces, the Segmented track, and a hovered sheet. */
const SURFACES = ["backdrop", "surface", "stage", "raised", "overlay", "fill"];

describe("ink-muted clears 3:1 wherever a meaningful glyph sits", () => {
  for (const [mode, theme] of [["light", tokens(/^:root\s*\{/m)], ["dark", tokens(/^\.dark\s*\{/m)]] as const) {
    const ink = hex(theme.get("--ax-ink-muted"));
    for (const name of SURFACES) {
      it(`${mode}: ink-muted on ${name}`, () => {
        const ratio = contrast(ink, hex(theme.get(`--ax-${name}`)));
        expect(ratio, `${mode} ink-muted on ${name} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(3);
      });
    }
    it(`${mode}: ink-muted on a hovered or pressed sheet`, () => {
      const sheet = hex(theme.get("--ax-surface"));
      for (const fill of ["--ax-hover", "--ax-press"]) {
        expect(contrast(ink, over(theme.get(fill), sheet)), `${mode} ${fill}`).toBeGreaterThanOrEqual(3);
      }
    });
  }
});
