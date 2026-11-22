// design-system: strict

// Turns a rule's declared marks into drawing primitives for one pane, from
// the preview as rendered. Coordinates are px in the pane's own box with the
// 2× pan taken out (the overlay re-applies it as a transform), so redlines
// are drawn unscaled: 1px lines and 12px labels at either zoom, positioned
// on the scaled content. Values are reported in CSS px (rendered / zoom).

import { cssColor } from "../measure-geometry";
import type { Side } from "@/components/rule/use-compare";
import type { Edge, Mark, MetricLine, Pick, RuleAnnotations, TextRow } from "./specs";
import { fontInfo, kernedPairs, px, signed, textContrast, textLines, type FontInfo, type TextLine } from "./type-metrics";

export type Prim =
  | { t: "seg"; axis: "x" | "y"; x: number; y: number; len: number }
  | { t: "rule"; axis: "x" | "y"; x: number; y: number; len: number; tone: "guide" | "metric" | "strong" }
  | { t: "fill"; x: number; y: number; w: number; h: number; tone: "hatch" | "leading" }
  | { t: "path"; d: string; tone: "strong" | "guide" }
  | { t: "chip"; x: number; y: number; w: number; tag?: string; text: string; size: "md" | "sm"; align?: "left" | "right"; anchor?: { x: number; y: number } };

export type Group = { key: string; step: number; prims: Prim[] };
export type Row = { key: string; mark: string; label: string; value: string; group?: string };
export type PaneMeasure = { groups: Group[]; rows: Row[] };

type Box = { l: number; t: number; r: number; b: number; w: number; h: number };
type Env = { pane: DOMRect; pan: { x: number; y: number }; zoom: number };

const MD_H = 16;
const SM_H = 14;
const mdWidth = (text: string) => Math.ceil(10 + text.length * 7.3);
const smWidth = (text: string) => Math.ceil(3 + text.length * 7.3);
const CLEAR = 6;
/** A label sits on its line only if this much line still shows past each end. */
const LINE_SHOWS = 6;

function pick(p: Pick, side: Side) {
  return typeof p === "string" ? p : p[side];
}

function box(rect: DOMRect, env: Env): Box {
  const l = rect.left - env.pane.left - env.pan.x;
  const t = rect.top - env.pane.top - env.pan.y;
  return { l, t, r: l + rect.width, b: t + rect.height, w: rect.width, h: rect.height };
}

function chipMd(x: number, y: number, text: string, tag?: string): Prim {
  return { t: "chip", x, y, w: mdWidth(tag ? `${tag} ${text}` : text), text, tag, size: "md" };
}

/** A dimension and its label: on the line when it fits, else beside it. */
function dimension(axis: "x" | "y", x: number, y: number, len: number, text: string, beside: "before" | "after", tag?: string): Prim[] {
  const label = tag ? `${tag} ${text}` : text;
  const w = mdWidth(label);
  const fits = axis === "x" ? len >= w + 2 * LINE_SHOWS : len >= MD_H + 2 * LINE_SHOWS;
  const seg: Prim = { t: "seg", axis, x, y, len };
  if (fits) {
    return axis === "x"
      ? [seg, chipMd(x + len / 2 - w / 2, y - MD_H / 2, text, tag)]
      : [seg, chipMd(x - w / 2, y + len / 2 - MD_H / 2, text, tag)];
  }
  if (axis === "x") {
    const cy = beside === "before" ? y - CLEAR - MD_H : y + 1 + CLEAR;
    return [seg, chipMd(x + len / 2 - w / 2, cy, text, tag)];
  }
  const cx = beside === "before" ? x - CLEAR - w : x + 1 + CLEAR;
  return [seg, chipMd(cx, y + len / 2 - MD_H / 2, text, tag)];
}

// ── Box marks ───────────────────────────────────────────────────────

function edgeWidth(style: CSSStyleDeclaration, kind: "padding" | "border", edge: Edge) {
  return parseFloat(style.getPropertyValue(kind === "padding" ? `padding-${edge}` : `border-${edge}-width`)) || 0;
}

function padding(el: Element, edge: Edge, env: Env): { prims: Prim[]; value: string } {
  const style = getComputedStyle(el);
  const r = box(el.getBoundingClientRect(), env);
  const z = env.zoom;
  const p = edgeWidth(style, "padding", edge);
  const bw = { top: edgeWidth(style, "border", "top"), right: edgeWidth(style, "border", "right"), bottom: edgeWidth(style, "border", "bottom"), left: edgeWidth(style, "border", "left") };
  const inner = { l: r.l + bw.left * z, t: r.t + bw.top * z, r: r.r - bw.right * z, b: r.b - bw.bottom * z };
  const len = p * z;
  const value = px(p);
  const label = `pad ${value}`;
  const w = mdWidth(label);
  const prims: Prim[] = [];
  if (edge === "left" || edge === "right") {
    const x = edge === "left" ? inner.l : inner.r - len;
    const y = (r.t + r.b) / 2;
    prims.push({ t: "fill", x, y: inner.t, w: len, h: inner.b - inner.t, tone: "hatch" });
    prims.push({ t: "seg", axis: "x", x, y, len });
    prims.push(chipMd(edge === "left" ? r.l - CLEAR - w : r.r + CLEAR, y - MD_H / 2, value, "pad"));
  } else {
    const y = edge === "top" ? inner.t : inner.b - len;
    const x = (r.l + r.r) / 2;
    prims.push({ t: "fill", x: inner.l, y, w: inner.r - inner.l, h: len, tone: "hatch" });
    prims.push({ t: "seg", axis: "y", x, y, len });
    prims.push(chipMd(x - w / 2, edge === "top" ? r.t - CLEAR - MD_H : r.b + CLEAR, value, "pad"));
  }
  return { prims, value };
}

function gap(a: Element, b: Element, axis: "x" | "y", place: "inside" | "after", env: Env): { prims: Prim[]; value: string } | null {
  const ra = box(a.getBoundingClientRect(), env);
  const rb = box(b.getBoundingClientRect(), env);
  const [first, second] = axis === "y" ? (ra.t <= rb.t ? [ra, rb] : [rb, ra]) : (ra.l <= rb.l ? [ra, rb] : [rb, ra]);
  const start = axis === "y" ? first.b : first.r;
  const end = axis === "y" ? second.t : second.l;
  if (end < start) return null;
  const value = px((end - start) / env.zoom);
  const prims: Prim[] = [];
  if (axis === "y") {
    const x = place === "after" ? Math.max(ra.r, rb.r) + 12 : (Math.max(ra.l, rb.l) + Math.min(ra.r, rb.r)) / 2;
    if (place === "after") {
      prims.push({ t: "rule", axis: "x", x: first.r + 2, y: start, len: x + 4 - first.r - 2, tone: "guide" });
      prims.push({ t: "rule", axis: "x", x: second.r + 2, y: end - 1, len: x + 4 - second.r - 2, tone: "guide" });
    }
    prims.push(...dimension("y", x, start, end - start, value, "after", "gap"));
  } else {
    const y = place === "after" ? Math.max(ra.b, rb.b) + 12 : (Math.max(ra.t, rb.t) + Math.min(ra.b, rb.b)) / 2;
    prims.push(...dimension("x", start, y, end - start, value, "after", "gap"));
  }
  return { prims, value };
}

function inset(outer: Element, inner: Element, edge: Edge, env: Env): { prims: Prim[]; value: string } {
  const o = box(outer.getBoundingClientRect(), env);
  const i = box(inner.getBoundingClientRect(), env);
  const prims: Prim[] = [];
  let len = 0;
  if (edge === "left" || edge === "right") {
    const y = (i.t + i.b) / 2;
    const x = edge === "left" ? o.l : i.r;
    len = edge === "left" ? i.l - o.l : o.r - i.r;
    const value = px(len / env.zoom);
    const w = mdWidth(`inset ${value}`);
    prims.push({ t: "seg", axis: "x", x, y, len });
    prims.push(chipMd(edge === "left" ? o.l - CLEAR - w : o.r + CLEAR, y - MD_H / 2, value, "inset"));
    return { prims, value };
  }
  const x = (i.l + i.r) / 2;
  const y = edge === "top" ? o.t : i.b;
  len = edge === "top" ? i.t - o.t : o.b - i.b;
  const value = px(len / env.zoom);
  const w = mdWidth(`inset ${value}`);
  prims.push({ t: "seg", axis: "y", x, y, len });
  prims.push(chipMd(x - w / 2, edge === "top" ? o.t - CLEAR - MD_H : o.b + CLEAR, value, "inset"));
  return { prims, value };
}

function size(el: Element, axis: "x" | "y", clear: Element | null, env: Env): { prims: Prim[]; value: string } {
  const r = box(el.getBoundingClientRect(), env);
  const c = clear ? box(clear.getBoundingClientRect(), env) : r;
  const prims: Prim[] = [];
  if (axis === "x") {
    const y = c.b + 10;
    const value = px(r.w / env.zoom);
    if (y - r.b > 6) {
      prims.push({ t: "rule", axis: "y", x: r.l, y: r.b + 2, len: y + 4 - r.b - 2, tone: "guide" });
      prims.push({ t: "rule", axis: "y", x: r.r - 1, y: r.b + 2, len: y + 4 - r.b - 2, tone: "guide" });
    }
    prims.push(...dimension("x", r.l, y, r.w, value, "after"));
    return { prims, value };
  }
  const x = c.r + 10;
  const value = px(r.h / env.zoom);
  if (x - r.r > 6) {
    prims.push({ t: "rule", axis: "x", x: r.r + 2, y: r.t, len: x + 4 - r.r - 2, tone: "guide" });
    prims.push({ t: "rule", axis: "x", x: r.r + 2, y: r.b - 1, len: x + 4 - r.r - 2, tone: "guide" });
  }
  prims.push(...dimension("y", x, r.t, r.h, value, "after"));
  return { prims, value };
}

function radius(el: Element, corner: "top-left" | "top-right", chip: "outside" | "inside", env: Env): { prims: Prim[]; value: string } {
  const style = getComputedStyle(el);
  const r = box(el.getBoundingClientRect(), env);
  const wCss = r.w / env.zoom;
  const hCss = r.h / env.zoom;
  // Adjacent radii are reduced by a common factor when they exceed an edge.
  const corners = [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomRightRadius, style.borderBottomLeftRadius].map(value => {
    const [x, y = x] = value.split(" ");
    const pixels = (v: string, axis: number) => v.endsWith("%") ? parseFloat(v) * axis / 100 : parseFloat(v) || 0;
    return { x: pixels(x, wCss), y: pixels(y, hCss) };
  });
  const [tl, tr, br, bl] = corners;
  const fit = (edge: number, sum: number) => sum > edge ? edge / sum : 1;
  const factor = Math.min(fit(wCss, tl.x + tr.x), fit(wCss, bl.x + br.x), fit(hCss, tl.y + bl.y), fit(hCss, tr.y + br.y));
  const selected = corner === "top-left" ? tl : tr;
  const R = selected.x * factor * env.zoom;
  const Ry = selected.y * factor * env.zoom;
  const value = R === Ry ? px(R / env.zoom) : px(R / env.zoom) + " × " + px(Ry / env.zoom);
  const w = mdWidth(`r ${value}`);
  const lead = 6;
  const top = r.t + 0.5;
  const prims: Prim[] = [];
  if (corner === "top-right") {
    const edge = r.r - 0.5;
    prims.push({ t: "path", tone: "strong", d: `M${r.r - R - lead} ${top}H${r.r - R}A${Math.max(0, R - 0.5)} ${Math.max(0, Ry - 0.5)} 0 0 1 ${edge} ${r.t + Ry}V${r.t + Ry + lead}` });
    prims.push(chip === "outside"
      ? chipMd(r.r + 4, r.t - 4 - MD_H, value, "r")
      : chipMd(r.r - R - lead - 4 - w, r.t + (Math.min(r.h, 40) - MD_H) / 2, value, "r"));
  } else {
    const edge = r.l + 0.5;
    prims.push({ t: "path", tone: "strong", d: `M${edge} ${r.t + Ry + lead}V${r.t + Ry}A${Math.max(0, R - 0.5)} ${Math.max(0, Ry - 0.5)} 0 0 1 ${r.l + R} ${top}H${r.l + R + lead}` });
    prims.push(chip === "outside"
      ? chipMd(r.l - 4 - w, r.t - 4 - MD_H, value, "r")
      : chipMd(r.l + R + lead + 4, r.t + (Math.min(r.h, 40) - MD_H) / 2, value, "r"));
  }
  return { prims, value };
}

// ── Text marks ──────────────────────────────────────────────────────

/** Letter-spacing in px and em; zero reads as zero, not 0.00. */
function trackingText(font: FontInfo) {
  if (Math.abs(font.letterSpacing) < 0.005) return "tracking 0";
  return `${signed(font.letterSpacing, 2)}px · ${signed(font.letterSpacing / font.size, 3)}em`;
}

const ratio = (value: number) => (Math.round(value * 1000) / 1000).toString();

function baselineOf(line: TextLine, font: FontInfo) {
  return line.top + (line.bottom - line.top) * (font.asc / (font.asc + font.desc));
}

function local(line: TextLine, env: Env): TextLine {
  const dx = env.pane.left + env.pan.x;
  const dy = env.pane.top + env.pan.y;
  return {
    left: line.left - dx, right: line.right - dx, top: line.top - dy, bottom: line.bottom - dy,
    glyphs: line.glyphs.map((g) => ({ ...g, left: g.left - dx, right: g.right - dx, top: g.top - dy, bottom: g.bottom - dy })),
  };
}

/** Labels in a column, pushed apart so none overlap, each joined to its line by a leader if it moved. */
function labelColumn(items: { y: number; text: string }[], x: number, side: "left" | "right", anchorX: number): Prim[] {
  const sorted = [...items].sort((a, b) => a.y - b.y);
  const placed = sorted.map((item) => ({ ...item, at: item.y }));
  const pitch = SM_H + 1;
  for (let i = 1; i < placed.length; i += 1) placed[i].at = Math.max(placed[i].at, placed[i - 1].at + pitch);
  // Re-centre a pushed column on the lines it labels; an uncrowded one stays exactly level.
  const drift = placed.reduce((sum, p) => sum + (p.at - p.y), 0) / Math.max(1, placed.length);
  if (drift > 0.5) {
    placed.forEach((p) => { p.at -= drift; });
    for (let i = 1; i < placed.length; i += 1) placed[i].at = Math.max(placed[i].at, placed[i - 1].at + pitch);
  }
  const prims: Prim[] = [];
  for (const p of placed) {
    const w = smWidth(p.text);
    const cx = side === "left" ? x - w : x;
    prims.push({ t: "chip", x: cx, y: p.at - SM_H / 2, w, text: p.text, size: "sm",
      align: side === "left" ? "right" : "left", anchor: { x: anchorX, y: p.y } });
  }
  return prims;
}

const METRIC_ORDER: MetricLine[] = ["asc", "cap", "x", "base", "desc"];

function textMark(mark: Extract<Mark, { kind: "text" }>, index: number, els: Element[], env: Env, step: () => number): PaneMeasure {
  const el = els[0];
  const z = env.zoom;
  const tolerance = parseFloat(getComputedStyle(el).fontSize) * z * 0.4;
  const all = els.map((e) => textLines(e, tolerance).map((line) => local(line, env)));
  const rowsWanted: TextRow[] = mark.rows ?? ["face", "size", "metrics", "leading", "tracking", "kerning", "figures", "measure", "colour"];
  // Pair advances cost two DOM samples per distinct pair: read them only when kerning is drawn or reported.
  const wantsKerning = Boolean(mark.show.kerning) || rowsWanted.includes("kerning");
  const font = fontInfo(el, all[0], wantsKerning);
  const lines = all[0];
  const elBox = box(el.getBoundingClientRect(), env);
  const groups: Group[] = [];
  const show = mark.show;
  const key = (layer: string) => `${index}:${layer}`;
  const lh = font.lineHeight * z;
  let metricsRight = false;

  if (show.leading && lines.length) {
    const prims: Prim[] = [];
    const s = step();
    for (const line of lines) {
      const centre = (line.top + line.bottom) / 2;
      const boxTop = centre - lh / 2;
      const boxBottom = centre + lh / 2;
      prims.push({ t: "rule", axis: "x", x: elBox.l, y: boxTop, len: elBox.w, tone: "guide" });
      prims.push({ t: "rule", axis: "x", x: elBox.l, y: boxBottom, len: elBox.w, tone: "guide" });
      if (line.top - boxTop > 0.5) prims.push({ t: "fill", x: elBox.l, y: boxTop, w: elBox.w, h: line.top - boxTop, tone: "leading" });
      if (boxBottom - line.bottom > 0.5) prims.push({ t: "fill", x: elBox.l, y: line.bottom, w: elBox.w, h: boxBottom - line.bottom, tone: "leading" });
      prims.push({ t: "rule", axis: "x", x: elBox.l, y: baselineOf(line, font), len: elBox.w, tone: "metric" });
    }
    const left = show.leading === "left";
    const x = left ? elBox.l - 10 : elBox.r + 9;
    const y0 = lines.length > 1 ? baselineOf(lines[0], font) : (lines[0].top + lines[0].bottom) / 2 - lh / 2;
    const text = `${px(font.lineHeight)} · ${ratio(font.lineHeight / font.size)}`;
    prims.push(...dimension("y", x, y0, lh, text, left ? "before" : "after", "lh"));
    groups.push({ key: key("leading"), step: s, prims });
  }

  if (show.metrics && lines.length) {
    const s = step();
    const line = lines[0];
    const base = baselineOf(line, font);
    const at: Record<MetricLine, number> = { asc: base - font.asc * z, cap: base - font.cap * z, x: base - font.xHeight * z, base, desc: base + font.desc * z };
    const name: Record<MetricLine, string> = {
      asc: `asc ${px(font.asc)}`, cap: `cap ${px(font.cap)}`, x: `x ${px(font.xHeight)}`, base: "base", desc: `desc ${px(font.desc)}`,
    };
    const wanted = METRIC_ORDER.filter((m) => show.metrics?.lines.includes(m));
    const x0 = line.left - 4;
    const x1 = line.right + 4;
    // The declared side, unless its labels would run off the pane (a 2× zoom): then the other.
    const widest = Math.max(...wanted.map((m) => smWidth(name[m])));
    const roomLeft = x0 - 8 - widest >= 4;
    const roomRight = x1 + 8 + widest <= env.pane.width - 4;
    const left = show.metrics.side === "left" ? roomLeft || !roomRight : !roomRight && roomLeft;
    // Lines above the baseline sit on the pixel row above their metric and
    // the baseline and descender on the row below, so no line covers ink.
    const above = (m: MetricLine) => m === "asc" || m === "cap" || m === "x";
    // On small type a full-strength line across reads as a strikethrough; it steps back to a guide.
    const quiet = font.size * z < 20;
    const prims: Prim[] = wanted.map((m) => ({ t: "rule", axis: "x", x: x0, y: above(m) ? at[m] - 1 : at[m], len: x1 - x0, tone: m === "base" ? "strong" : quiet ? "guide" : "metric" }) as Prim);
    metricsRight = !left;
    prims.push(...labelColumn(wanted.map((m) => ({ y: at[m], text: name[m] })), left ? x0 - 8 : x1 + 8, left ? "left" : "right", left ? x0 : x1));
    groups.push({ key: key("metrics"), step: s, prims });
  }

  // Rulers sit just under the content area: below every glyph, descenders included.
  const rulerLines = mark.all ? all.map((l) => l[0]).filter(Boolean) : lines.length ? [lines[lines.length - 1]] : [];
  const rulerY = (line: TextLine) => line.bottom + 2;
  const digits = mark.all ? all.flatMap((l) => l.flatMap((line) => line.glyphs.filter((g) => /\d/.test(g.ch)))) : [];

  if (show.tracking && rulerLines.length) {
    const s = step();
    const prims: Prim[] = [];
    for (const line of rulerLines) {
      const y = rulerY(line);
      const first = line.glyphs[0].left;
      const last = line.glyphs[line.glyphs.length - 1].right;
      prims.push({ t: "rule", axis: "x", x: first, y, len: last - first, tone: "metric" });
      for (const g of line.glyphs) prims.push({ t: "rule", axis: "y", x: g.left, y: y + 1, len: /\s/.test(g.ch) ? 5 : 3, tone: "metric" });
      prims.push({ t: "rule", axis: "y", x: last - 1, y: y + 1, len: 3, tone: "metric" });
    }
    const end = rulerLines[rulerLines.length - 1];
    let text: string;
    if (digits.length) {
      const widths = digits.map((g) => (g.right - g.left) / z);
      const lo = Math.min(...widths);
      const hi = Math.max(...widths);
      text = hi - lo < 0.05 ? `every digit ${px(lo)}` : `digits ${px(lo)}–${px(hi)}`;
    } else {
      text = trackingText(font);
    }
    const w = smWidth(text);
    const lastRight = end.glyphs[end.glyphs.length - 1].right;
    // At the ruler's end; under it, right-aligned, when the end runs off the pane
    // or the metric labels already hold that side of a one-line run.
    const besideMetrics = metricsRight && lines.length === 1;
    prims.push(lastRight + 6 + w <= env.pane.width - 4 && !besideMetrics
      ? { t: "chip", x: lastRight + 6, y: rulerY(end) + 2 - SM_H / 2, w, text, size: "sm" }
      : { t: "chip", x: lastRight - w, y: rulerY(end) + 6, w, text, size: "sm", align: "right" });
    groups.push({ key: key("tracking"), step: s, prims });
  }

  if (show.align) {
    const s = step();
    const hits = all.map((l) => l[0]).flatMap((line) => {
      const g = line?.glyphs.find((glyph) => glyph.ch === show.align);
      return g && line ? [{ x: g.left, top: line.top, bottom: line.bottom }] : [];
    });
    if (hits.length > 1) {
      const xs = hits.map((h) => h.x);
      const spread = Math.max(...xs) - Math.min(...xs);
      const prims: Prim[] = [];
      const top = Math.min(...hits.map((h) => h.top));
      const bottom = Math.max(...hits.map((h) => h.bottom));
      if (spread < 0.5) {
        prims.push({ t: "rule", axis: "y", x: xs[0], y: top - 4, len: bottom - top + 8, tone: "strong" });
        const text = "decimals aligned";
        prims.push({ t: "chip", x: xs[0] - smWidth(text) / 2, y: top - 6 - SM_H, w: smWidth(text), text, size: "sm" });
      } else {
        for (const h of hits) prims.push({ t: "rule", axis: "y", x: h.x, y: h.top, len: h.bottom - h.top, tone: "strong" });
        const lo = Math.min(...xs);
        const label = `Δ ${px(spread / z)}`;
        prims.push({ t: "seg", axis: "x", x: lo, y: top - 8, len: spread + 1 });
        prims.push(chipMd(lo + spread / 2 - mdWidth(label) / 2, top - 8 - CLEAR - MD_H, label));
      }
      groups.push({ key: key("align"), step: s, prims });
    }
  }

  const pairs = font.kerning && wantsKerning ? lines.map((line) => kernedPairs(line, font)) : [];
  if (show.kerning && lines.length) {
    const s = step();
    const prims: Prim[] = [];
    const place = (line: TextLine, list: ReturnType<typeof kernedPairs>, below: boolean) => {
      const rows: number[] = [-Infinity, -Infinity];
      const ruled = below && show.tracking ? rulerY(line) + 6 : line.bottom + 2;
      for (const k of list) {
        const text = `${k.pair} ${signed(k.value, 2)}`;
        const w = smWidth(text);
        const x = k.at;
        const tickY = below ? ruled : line.top - 7;
        prims.push({ t: "rule", axis: "y", x, y: tickY, len: 4, tone: "strong" });
        const row = rows.findIndex((right) => x - w / 2 > right + 4);
        if (row === -1) continue;
        rows[row] = x + w / 2;
        const y = below ? tickY + 5 + row * (SM_H + 1) : tickY - 1 - SM_H - row * (SM_H + 1);
        prims.push({ t: "chip", x: x - w / 2, y, w, text, size: "sm" });
      }
    };
    if (pairs[0]?.length) place(lines[0], pairs[0], false);
    if (lines.length > 1 && pairs[lines.length - 1]?.length) place(lines[lines.length - 1], pairs[lines.length - 1], true);
    if (prims.length) groups.push({ key: key("kerning"), step: s, prims });
  }

  const multiline = lines.length > 1;
  const counts = lines.map((line) => line.glyphs.length);
  if (show.measure && multiline) {
    const s = step();
    const prims: Prim[] = [];
    // At each line's end, unless the leading dim holds that side: then before its start.
    const before = show.leading === "right";
    const widest = Math.max(...counts.map((c, i) => smWidth(i === 0 ? `${c} ch` : String(c))));
    const room = before ? Math.min(...lines.map((l) => l.left)) - 8 - widest >= 4 : true;
    if (!room) {
      // A narrow pane has no gutter for them: one tag over the paragraph instead.
      const text = `${counts.join(" · ")} ch`;
      prims.push({ t: "chip", x: lines[0].left, y: lines[0].top - 4 - SM_H, w: smWidth(text), text, size: "sm" });
      groups.push({ key: key("measure"), step: s, prims });
    }
    if (room) lines.forEach((line, i) => {
      const text = i === 0 ? `${counts[i]} ch` : String(counts[i]);
      const w = smWidth(text);
      const y = baselineOf(line, font) - SM_H + 2;
      prims.push(before
        ? { t: "chip", x: line.left - 8 - w, y, w, text, size: "sm", align: "right" }
        : { t: "chip", x: line.right + 6, y, w, text, size: "sm" });
    });
    if (room) groups.push({ key: key("measure"), step: s, prims });
  }

  // The same measured values also feed the selectable readout.
  const contrast = textContrast(el);
  if (show.contrast && contrast.ratio && lines.length) {
    const line = lines[0];
    const text = contrast.ratio.toFixed(1) + ":1";
    groups.push({ key: key("colour"), step: step(), prims: [
      { t: "seg", axis: "x", x: line.left, y: line.bottom + 2, len: line.right - line.left },
      chipMd(line.right + CLEAR, line.bottom + 2 - MD_H / 2, text),
    ] });
  }
  const allPairs = [...new Map(pairs.flat().map(pair => [pair.pair, pair])).values()].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  const tracking = Math.abs(font.letterSpacing) < 0.005
    ? `0px · 0em${font.face === "SF Pro" ? " · SF tracks by size" : ""}`
    : `${trackingText(font)}${font.face === "Inter" && !font.explicitTracking ? " · Inter fit" : ""}`;
  const space = font.spaceAdvance;
  const values: Record<TextRow, [string, string, string?] | null> = {
    face: ["Face", `${font.face}${font.opsz ? ` · opsz ${font.opsz}` : ""}`],
    size: ["Size", `${px(font.size)}px · ${font.weight}${font.caps ? " · caps" : ""}`, groups.find(g => g.key === key("metrics") || g.key === key("leading"))?.key],
    metrics: ["x-height · cap height", `${px(font.xHeight)}px · ${px(font.cap)}px`, show.metrics ? key("metrics") : undefined],
    leading: ["Line height", `${px(font.lineHeight)}px · ${ratio(font.lineHeight / font.size)}${font.normalLineHeight ? " (normal)" : ""}`, show.leading ? key("leading") : undefined],
    tracking: ["Tracking", tracking, show.tracking ? key("tracking") : undefined],
    kerning: ["Kerning", font.kerning ? `on · ${allPairs.length ? `${allPairs.map(k => k.pair + " " + signed(k.value, 2) + "px").join(", ")}` : "no pairs here"}` : "off", allPairs.length && show.kerning ? key("kerning") : undefined],
    figures: font.numeric !== "normal" ? ["Figures", font.numeric, show.align ? key("align") : undefined] : null,
    measure: counts.length ? ["Characters per line", `${counts.join(" · ")} ch · space ${px(space)}${font.wrap !== "wrap" ? ` · ${font.wrap}` : ""}`, show.measure && multiline ? key("measure") : undefined] : null,
    halfLeading: ["Half-leading", `${px((font.lineHeight - font.asc - font.desc) / 2)}px`, key("leading")],
    baseline: ["Baseline from line top", `${px((font.lineHeight - font.asc - font.desc) / 2 + font.asc)}px`, key("metrics")],
    colour: ["Colour", `${contrast.fg} on ${contrast.bg}${contrast.ratio ? ` · ${contrast.ratio.toFixed(1)}:1` : ""}`, show.contrast && contrast.ratio ? key("colour") : undefined],
  };
  const rows: Row[] = rowsWanted.flatMap((field) => {
    const v = values[field];
    return v ? [{ key: key(field), mark: mark.name, label: v[0], value: v[1], group: v[2] }] : [];
  });
  return { groups, rows };
}

// ── Entry ───────────────────────────────────────────────────────────

/** Stagger slots per mark: one per layer the mark can draw, so Do and Don't stay in step. */
function slots(mark: Mark) {
  if (mark.kind !== "text") return 1;
  const s = mark.show;
  return [s.leading, s.metrics, s.tracking, s.align, s.kerning, s.measure, s.contrast].filter(Boolean).length;
}

function styleReading(element: Element, property: string): string {
  const style = getComputedStyle(element);
  if (property === "outline-width" && ["none", "hidden"].includes(style.outlineStyle)) return "0px";
  const raw = style.getPropertyValue(property).trim();
  if (element instanceof HTMLElement && raw.endsWith("px")) {
    const specified = element.style.getPropertyValue(property).trim();
    if (/^-?[\d.]+(?:ch|em|rem)$/.test(specified)) return specified + " · " + px(parseFloat(raw)) + "px";
  }
  if (CSS.supports("color", raw)) return cssColor(raw);
  if (property !== "box-shadow") return raw;
  const layers = raw.split(/,(?![^()]*\))/).map(layer => layer.trim());
  return layers.flatMap(layer => {
    const color = layer.match(/(?:rgba?|oklch|oklab|lab|lch|color)\([^()]*\)/)?.[0];
    if (!color) return [layer];
    const ink = cssColor(color);
    return ink === "transparent" ? [] : [layer.replace(color, ink)];
  }).join(", ") || "none";
}

export function measurePane(root: Element, pane: DOMRect, spec: RuleAnnotations, side: Side, zoom: number, pan: { x: number; y: number }): PaneMeasure {
  const env: Env = { pane, pan, zoom };
  const groups: Group[] = [];
  const rows: Row[] = [];
  let base = 0;
  spec.marks.forEach((mark, index) => {
    const first = base;
    base += slots(mark);
    const q = (p: Pick) => root.querySelector(pick(p, side));
    if (mark.kind === "text") {
      let n = first;
      const els = mark.all ? Array.from(root.querySelectorAll(pick(mark.target, side))) : [q(mark.target)].filter((e): e is Element => !!e);
      if (!els.length) return;
      const result = textMark(mark, index, els, env, () => n++);
      groups.push(...result.groups);
      rows.push(...result.rows);
      return;
    }
    let result: { prims: Prim[]; value: string } | null = null;
    if (mark.kind === "count") {
      const anchor = q(mark.target);
      const clip = mark.clip ? q(mark.clip)?.getBoundingClientRect() : undefined;
      if (anchor && (!mark.clip || clip)) {
        const items = Array.from(root.querySelectorAll(pick(mark.items, side)));
        const count = items.filter(item => {
          const r = item.getBoundingClientRect();
          return r.width && r.height && getComputedStyle(item).visibility === "visible" &&
            (!clip || (r.left >= clip.left - 0.5 && r.top >= clip.top - 0.5 && r.right <= clip.right + 0.5 && r.bottom <= clip.bottom + 0.5));
        }).length;
        const r = box(anchor.getBoundingClientRect(), env);
        result = { value: String(count), prims: [
          { t: "seg", axis: "x", x: r.l, y: r.b + 2, len: r.w },
          chipMd(r.l, r.b + 8, String(count), mark.name),
        ] };
      }
    } else if (mark.kind === "style") {
      const el = q(mark.target);
      if (el) {
        const r = box(el.getBoundingClientRect(), env);
        const value = styleReading(el, mark.property);
        if (mark.property === "transform-origin" && el instanceof HTMLElement && el.offsetWidth && el.offsetHeight) {
          const [ox, oy] = value.split(" ").map(parseFloat);
          const x = r.l + ox * r.w / el.offsetWidth;
          const y = r.t + oy * r.h / el.offsetHeight;
          result = { value, prims: [
            { t: "rule", axis: "x", x: x - 5, y, len: 11, tone: "strong" },
            { t: "rule", axis: "y", x, y: y - 5, len: 11, tone: "strong" },
            chipMd(x + 8, y - MD_H - 4, value),
          ] };
        } else {
          const text = value.length <= 16 ? value : mark.property;
          result = { value, prims: [
            { t: "seg", axis: "x", x: r.l, y: r.b + 2, len: r.w },
            chipMd((r.l + r.r - mdWidth(text)) / 2, r.b + 7, text),
          ] };
        }
      }
    } else if (mark.kind === "padding") {
      const el = q(mark.target);
      if (el) result = padding(el, mark.edge, env);
    } else if (mark.kind === "gap") {
      const a = q(mark.from);
      const b = q(mark.to);
      if (a && b) result = gap(a, b, mark.axis, mark.place ?? "inside", env);
    } else if (mark.kind === "inset") {
      const o = q(mark.outer);
      const i = q(mark.inner);
      if (o && i) result = inset(o, i, mark.edge, env);
    } else if (mark.kind === "size") {
      const el = q(mark.target);
      if (el) result = size(el, mark.axis, mark.clear ? q(mark.clear) : null, env);
    } else if (mark.kind === "radius") {
      const el = q(mark.target);
      if (el) result = radius(el, mark.corner, mark.chip ?? "outside", env);
    }
    if (!result) return;
    groups.push({ key: String(index), step: first, prims: result.prims });
    // Tags on the canvas stay bare ("r 12"); the readout table names the unit of every length.
    const length = mark.kind === "padding" || mark.kind === "gap" || mark.kind === "inset" || mark.kind === "size" || mark.kind === "radius";
    const value = length ? result.value.replace(/(\d+(?:\.\d+)?)(?![\d.]|px)/g, "$1px") : result.value;
    rows.push({ key: String(index), mark: "", label: mark.name, value, group: String(index) });
  });
  return { groups, rows };
}

export function inspectText(element: Element, pane: DOMRect, zoom: number) {
  const mark: Extract<Mark, { kind: "text" }> = {
    kind: "text", name: "Text", target: "",
    show: { metrics: { lines: ["cap", "x", "base"], side: "left" }, tracking: true, leading: "right", kerning: true, measure: true },
    rows: ["face", "size", "baseline", "metrics", "leading", "halfLeading", "tracking", "kerning", "measure"],
  };
  let step = 0;
  return textMark(mark, 0, [element], { pane, zoom, pan: { x: 0, y: 0 } }, () => step++);
}

type Obstacle = { x: number; y: number; w: number; h: number };

/** Protect visible text fragments and artwork while leaving their surrounding
 * padding available for labels. All coordinates include the current pan. */
export function previewObstacles(root: Element, pane: DOMRect): Obstacle[] {
  const obstacles: Obstacle[] = [];
  const add = (r: DOMRect) => {
    if (r.width > 0 && r.height > 0) obstacles.push({ x: r.left - pane.left, y: r.top - pane.top, w: r.width, h: r.height });
  };
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.textContent?.trim() || node.parentElement?.closest("[data-annotation]")) continue;
    range.selectNodeContents(node);
    for (const rect of range.getClientRects()) add(rect);
  }
  for (const image of root.querySelectorAll("svg, img, [role=img]")) {
    if (!image.closest("[data-annotation]") && getComputedStyle(image).visibility === "visible") add(image.getBoundingClientRect());
  }
  return obstacles;
}

/** Place each label as close to its mark as possible without covering text,
 * another label or a ruler. If no slot fits, the readout still carries the value. */
export function settleChips(measure: PaneMeasure, width: number, height: number, glyphs: Obstacle[] = []): PaneMeasure {
  const placed: Obstacle[] = [{ x: 0, y: 0, w: 96, h: 40 }, ...glyphs];
  for (const group of measure.groups) for (const p of group.prims) {
    if (p.t === "rule" || p.t === "seg") placed.push({
      x: p.x, y: p.y, w: p.axis === "x" ? p.len : 1, h: p.axis === "y" ? p.len : 1,
    });
  }
  const margin = 4;
  const clearance = 2;
  function position(left: number, top: number, w: number, h: number): Obstacle | null {
    const right = width - w - margin;
    const bottom = height - h - margin;
    if (right < margin || bottom < margin) return null;
    const x = Math.max(margin, Math.min(left, right));
    const y = Math.max(margin, Math.min(top, bottom));
    const xs = new Set([x, margin, right]);
    const ys = new Set([y, margin, bottom]);
    for (const r of placed) {
      xs.add(r.x - w - clearance); xs.add(r.x + r.w + clearance);
      ys.add(r.y - h - clearance); ys.add(r.y + r.h + clearance);
    }
    const byDistance = (values: Set<number>, origin: number, max: number) =>
      [...values].filter(v => v >= margin && v <= max).sort((a, b) => Math.abs(a - origin) - Math.abs(b - origin));
    const columns = byDistance(xs, x, right);
    let best: Obstacle | null = null;
    let cost = Infinity;
    for (const cy of byDistance(ys, y, bottom)) {
      const dy = (cy - y) ** 2;
      if (dy >= cost) break;
      const row = placed.filter(r => cy < r.y + r.h + clearance && r.y < cy + h + clearance);
      for (const cx of columns) {
        const distance = dy + (cx - x) ** 2;
        if (distance >= cost) break;
        if (row.some(r => cx < r.x + r.w + clearance && r.x < cx + w + clearance)) continue;
        best = { x: cx, y: cy, w, h };
        cost = distance;
        break;
      }
    }
    if (best) placed.push(best);
    return best;
  }
  type Chip = Extract<Prim, { t: "chip" }>;
  function placeGroup(group: Group): Group {
    // The font metrics form an ordered scale. Move its labels as one column
    // so a crowded descender can never jump above the baseline.
    const labels = group.prims.filter((p): p is Chip => p.t === "chip" && !!p.anchor);
    let offset: { x: number; y: number } | null = null;
    if (labels.length) {
      const left = Math.min(...labels.map(p => p.x));
      const top = Math.min(...labels.map(p => p.y));
      const w = Math.max(...labels.map(p => p.x + p.w)) - left;
      const h = Math.max(...labels.map(p => p.y + SM_H)) - top;
      const column = position(left, top, w, h);
      if (column) offset = { x: column.x - left, y: column.y - top };
    }
    const prims = group.prims.flatMap<Prim>(p => {
      if (p.t !== "chip") return [p];
      const slot = p.anchor && offset ? { x: p.x + offset.x, y: p.y + offset.y } :
        position(p.x, p.y, p.w, p.size === "md" ? MD_H : SM_H);
      if (!slot) return [];
      const chip = { ...p, x: slot.x, y: slot.y };
      if (!p.anchor) return [chip];
      const endX = p.align === "right" ? slot.x + p.w : slot.x;
      const endY = slot.y + SM_H / 2;
      if (Math.abs(endY - p.anchor.y) < 1 || Math.abs(endX - p.anchor.x) > 48) return [chip];
      return [{ t: "path", tone: "guide", d: `M${p.anchor.x} ${p.anchor.y}L${endX} ${endY}` }, chip];
    });
    return { ...group, prims };
  }
  return { ...measure, groups: measure.groups.map(placeGroup) };
}
