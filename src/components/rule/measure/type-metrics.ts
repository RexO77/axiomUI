// design-system: strict

// Typography read off the rendered page: the face actually drawing, its
// vertical metrics at the size it renders, tracking, kerned pairs, and where
// every character and line sits. DOM samples measure shaping and font metrics,
// and text ranges locate the rendered glyphs.

import { cssColor, fontFace, measureValue } from "@/components/rule/measure-geometry";

export type Glyph = { ch: string; left: number; right: number; top: number; bottom: number };
export type TextLine = { left: number; right: number; top: number; bottom: number; glyphs: Glyph[] };

export type FontInfo = {
  face: string;
  size: number;
  weight: string;
  opsz: string | null;
  lineHeight: number;
  normalLineHeight: boolean;
  letterSpacing: number;
  explicitTracking: boolean;
  kerning: boolean;
  caps: boolean;
  numeric: string;
  wrap: string;
  /** Metrics in CSS px at the rendered size. */
  asc: number;
  desc: number;
  cap: number;
  xHeight: number;
  spaceAdvance: number;
  pairAdvances: Map<string, number>;
};

/** Each sample inherits the preview's shaping settings. Only the kern feature
 * differs between the two advances being compared. Put all samples in the
 * document at once so the browser can resolve them in one layout. Without
 * `withPairs`, no pair is sampled and `pairAdvances` stays empty. */
export function fontInfo(el: Element, lines: TextLine[], withPairs = true): FontInfo {
  const style = getComputedStyle(el);
  const probe = document.createElement("span");
  probe.style.cssText = "position:fixed;left:-10000px;top:0;visibility:hidden;white-space:pre;width:max-content;pointer-events:none";
  for (const property of ["font-family", "font-size", "font-weight", "font-stretch", "font-style",
    "font-size-adjust", "font-optical-sizing", "font-variation-settings", "font-feature-settings",
    "font-kerning", "font-variant-ligatures", "font-variant-caps", "font-variant-numeric",
    "letter-spacing", "word-spacing", "text-rendering", "line-height"]) {
    probe.style.setProperty(property, style.getPropertyValue(property));
  }
  const sample = (text: string) => {
    const span = document.createElement("span");
    span.style.cssText = "display:inline-block;letter-spacing:inherit";
    span.textContent = text;
    probe.append(span);
    return span;
  };
  const cap = sample("");
  cap.style.width = "1cap";
  const x = sample("");
  x.style.width = "1ex";
  const line = sample("H");
  const marker = document.createElement("i");
  marker.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
  line.append(marker);
  const space = sample(" ");
  const feature = Array.from(style.fontFeatureSettings.matchAll(/"kern"(?:\s+(on|off|\d+))?/g)).at(-1);
  const kerning = feature ? feature[1] !== "off" && feature[1] !== "0" : style.fontKerning !== "none";
  const samples = new Map<string, [HTMLElement, HTMLElement]>();
  if (kerning && withPairs) for (const { glyphs } of lines) {
    for (let i = 1; i < glyphs.length; i++) {
      const pair = glyphs[i - 1].ch + glyphs[i].ch;
      if (/\s/.test(pair) || samples.has(pair)) continue;
      const on = sample(pair);
      const off = sample(pair);
      const features = style.fontFeatureSettings;
      off.style.fontKerning = "none";
      off.style.fontFeatureSettings = (features === "normal" ? "" : features + ", ") + '"kern" 0';
      samples.set(pair, [on, off]);
    }
  }
  document.body.append(probe);
  try {
    const range = document.createRange();
    range.selectNodeContents(line.firstChild!);
    const rect = range.getBoundingClientRect();
    const baseline = marker.getBoundingClientRect().top;
    const size = parseFloat(style.fontSize);
    const pairAdvances = new Map<string, number>();
    for (const [pair, [on, off]] of samples) {
      pairAdvances.set(pair, on.getBoundingClientRect().width - off.getBoundingClientRect().width);
    }
    const face = fontFace(style.fontFamily);
    return {
      face, size, weight: style.fontWeight, kerning, pairAdvances,
      opsz: /"opsz"\s+([\d.]+)/.exec(style.fontVariationSettings)?.[1] ??
        (/^(SF Pro|Inter)$/.test(face) && style.fontOpticalSizing === "auto" ? "auto" : null),
      lineHeight: parseFloat(style.lineHeight) || line.getBoundingClientRect().height,
      normalLineHeight: style.lineHeight === "normal",
      letterSpacing: parseFloat(style.letterSpacing) || 0,
      explicitTracking: el instanceof HTMLElement && el.style.letterSpacing !== "",
      caps: style.textTransform === "uppercase", numeric: style.fontVariantNumeric,
      wrap: style.getPropertyValue("text-wrap-style") || "wrap",
      asc: baseline - rect.top, desc: rect.bottom - baseline,
      cap: cap.getBoundingClientRect().width, xHeight: x.getBoundingClientRect().width,
      spaceAdvance: space.getBoundingClientRect().width,
    };
  } finally {
    probe.remove();
  }
}

// A base character, its marks and variation selectors, and anything joined to it with a ZWJ.
const CLUSTER = new RegExp("\\P{M}\\p{M}*(?:\\u200d\\P{M}\\p{M}*)*|\\p{M}+", "gu");
const segmenter = typeof Intl.Segmenter === "function" ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;

/**
 * The text's user-perceived characters with their offsets. Firefox before 125
 * has no Intl.Segmenter; there a base character keeps its combining marks,
 * variation selectors and joined emoji, which covers the catalog's samples.
 */
export function graphemes(text: string, native: Intl.Segmenter | null = segmenter): { index: number; segment: string }[] {
  if (native) return Array.from(native.segment(text), ({ index, segment }) => ({ index, segment }));
  const out: { index: number; segment: string }[] = [];
  for (const match of text.matchAll(CLUSTER)) {
    out.push({ index: match.index, segment: match[0] });
  }
  return out;
}

/** Every visible character and the line it sits on, in viewport px. */
export function textLines(el: Element, tolerance: number): TextLine[] {
  const lines: TextLine[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => node.parentElement?.closest("[data-annotation]") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  const range = document.createRange();
  const caps = getComputedStyle(el).textTransform === "uppercase";
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? "";
    for (const { index: i, segment } of graphemes(text)) {
      range.setStart(node, i);
      range.setEnd(node, i + segment.length);
      const rect = Array.from(range.getClientRects()).find((r) => r.width > 0 && r.height > 0);
      if (!rect) continue;
      const ch = caps ? segment.toUpperCase() : segment;
      const glyph = { ch, left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
      const centre = (rect.top + rect.bottom) / 2;
      let line = lines.find((l) => Math.abs((l.top + l.bottom) / 2 - centre) < tolerance);
      if (!line) {
        line = { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, glyphs: [] };
        lines.push(line);
      }
      line.glyphs.push(glyph);
    }
  }
  for (const line of lines) {
    // A wrapped line's trailing space has width but no ink: it is not part of the measure.
    while (line.glyphs.length && /\s/.test(line.glyphs[line.glyphs.length - 1].ch)) line.glyphs.pop();
    line.left = Math.min(...line.glyphs.map((g) => g.left));
    line.right = Math.max(...line.glyphs.map((g) => g.right));
    line.top = Math.min(...line.glyphs.map((g) => g.top));
    line.bottom = Math.max(...line.glyphs.map((g) => g.bottom));
  }
  return lines.filter((l) => l.glyphs.length > 0).sort((a, b) => a.top - b.top);
}

export type Kern = { pair: string; value: number; at: number };

/** Locate pairs whose rendered advance changes when kerning is disabled. */
export function kernedPairs(line: TextLine, font: FontInfo): Kern[] {
  const out: Kern[] = [];
  for (let i = 1; i < line.glyphs.length; i += 1) {
    const a = line.glyphs[i - 1].ch;
    const b = line.glyphs[i].ch;
    if (/\s/.test(a) || /\s/.test(b)) continue;
    const value = font.pairAdvances.get(a + b) ?? 0;
    if (Math.abs(value) >= 1 / 64) out.push({ pair: a + b, value, at: line.glyphs[i].left });
  }
  return out;
}

export const signed = (value: number, digits = 1) => `${value < 0 ? "−" : value > 0 ? "+" : ""}${Math.abs(value).toFixed(digits)}`;
export const px = (value: number) => measureValue(Math.round(value * 10) / 10);

// ── Colour ──────────────────────────────────────────────────────────

function rgb(hex: string) {
  const h = hex.replace("#", "");
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
  return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
}

function luminance({ r, g, b }: { r: number; g: number; b: number }) {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

type Colour = ReturnType<typeof rgb>;

function composite(front: Colour, back: Colour): Colour {
  const weight = 1 - front.a;
  return {
    r: front.r * front.a + back.r * weight, g: front.g * front.a + back.g * weight,
    b: front.b * front.a + back.b * weight, a: 1,
  };
}

/** A ratio is available when the sampled text has a solid or layered colour backdrop. */
export function textContrast(el: Element) {
  const fg = cssColor(getComputedStyle(el).color);
  const layers: Colour[] = [];
  for (let node: Element | null = el; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.backgroundImage !== "none") return { fg, bg: "image", ratio: null };
    const ink = cssColor(style.backgroundColor);
    if (!ink.startsWith("#")) continue;
    const layer = rgb(ink);
    layers.push(layer);
    if (layer.a === 1) break;
  }
  const base = layers.pop();
  if (!base || base.a < 1 || !fg.startsWith("#")) return { fg, bg: "unresolved", ratio: null };
  const background = layers.reduceRight((back, front) => composite(front, back), base);
  const bg = "#" + [background.r, background.g, background.b].map(n => Math.round(n).toString(16).padStart(2, "0")).join("");
  const foreground = composite(rgb(fg), background);
  const [hi, lo] = [luminance(foreground), luminance(background)].sort((x, y) => y - x);
  return { fg, bg, ratio: (hi + 0.05) / (lo + 0.05) };
}
