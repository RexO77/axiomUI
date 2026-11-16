import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { categories } from "@/data/ui-logic";
import { CategoryIcon } from "../category-icon";

type RGB = [number, number, number];
const theme = readFileSync(path.resolve(__dirname, "../../../../node_modules/tailwindcss/theme.css"), "utf8");
const globals = readFileSync(path.resolve(__dirname, "../../../app/globals.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

function linear(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function hex(value: string): RGB {
  return [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16)) as RGB;
}

function luminance(rgb: RGB): number {
  const [r, g, b] = rgb.map(linear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function hue(rgb: RGB): number {
  const [r, g, b] = rgb.map(linear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  return (Math.atan2(bb, a) * 180 / Math.PI + 360) % 360;
}

/** Resolve Tailwind v4's OKLCH palette into displayable sRGB, then use WCAG luminance. */
function palette(name: string): RGB {
  const match = theme.match(new RegExp(`--color-${name}:\\s*oklch\\(([\\d.]+)% ([\\d.]+) ([\\d.]+)\\)`));
  if (!match) throw new Error(`Missing Tailwind color ${name}`);
  const L = Number(match[1]) / 100;
  const C = Number(match[2]);
  const H = Number(match[3]) * Math.PI / 180;
  const a = C * Math.cos(H);
  const b = C * Math.sin(H);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ].map((v) => {
    const c = Math.max(0, Math.min(1, v));
    return 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
  }) as RGB;
}

const distance = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

for (const mode of ["light", "dark"] as const) {
  const body = globals.match(mode === "light" ? /:root\s*\{([\s\S]*?)\}/ : /\.dark\s*\{([\s\S]*?)\}/)![1];
  const token = (name: string) => hex(body.match(new RegExp(`--ax-${name}:\\s*(#[\\da-f]{6})`))![1]);

  describe(`${mode} category icon colors`, () => {
    for (const category of categories) {
      const markup = renderToStaticMarkup(createElement(CategoryIcon, { categoryId: category.id }));
      const classes = markup.match(/class="([^"]+)"/)![1].split(/\s+/);
      const colorClass = classes.find((c) => mode === "light" ? /^text-/.test(c) : /^dark:text-/.test(c));
      if (!colorClass) throw new Error(`No ${mode} color for ${category.id}`);
      const rgb = palette(colorClass.replace(/^(dark:)?text-/, ""));

      it(`${category.id} clears 3:1 on backdrop and surface`, () => {
        for (const bg of ["backdrop", "surface"]) {
          const ratio = contrast(rgb, token(bg));
          expect(ratio, `${colorClass} on ${bg}: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(3);
        }
      });

      it(`${category.id} stays at least 15 degrees from both verdict hues`, () => {
        for (const verdict of ["do", "dont"]) {
          const delta = distance(hue(rgb), hue(token(verdict)));
          expect(delta, `${colorClass} vs ${verdict}: ${delta.toFixed(1)} degrees`).toBeGreaterThanOrEqual(15);
        }
      });
    }
  });
}
