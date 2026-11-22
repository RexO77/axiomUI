// design-system: strict
import type { Side } from "./use-compare";

export type Point = { x: number; y: number };
export type Rect = { left: number; top: number; right: number; bottom: number };
export type Edges = [top: number, right: number, bottom: number, left: number];
export type Target = { element: Element; side: Side; depth: number; rect: Rect; visible: Rect; pane: Rect };

export const width = (rect: Rect) => rect.right - rect.left;
export const height = (rect: Rect) => rect.bottom - rect.top;

export function measureValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function cssMeasure(value: string) {
  return value.endsWith("px") ? `${measureValue(parseFloat(value))}px` : value;
}

let swatch: CanvasRenderingContext2D | null | undefined;

/**
 * A computed colour as a designer reads it: hex, with alpha only when it is
 * not opaque. Browsers report lab(), oklch() or rgb() depending on how it was
 * written; a 1px canvas resolves any of them to sRGB. Without a canvas (tests,
 * a server render), the computed string, rounded.
 */
export function cssColor(value: string) {
  if (value === "rgba(0, 0, 0, 0)" || value === "transparent") return "transparent";
  if (swatch === undefined) swatch = typeof document === "undefined" ? null : document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!swatch) return value.replace(/-?\d+\.\d{4,}/g, (part) => String(Math.round(Number(part) * 1000) / 1000));
  swatch.clearRect(0, 0, 1, 1);
  swatch.fillStyle = "#000";
  swatch.fillStyle = value;
  swatch.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = swatch.getImageData(0, 0, 1, 1).data;
  if (a === 0) return "transparent";
  const hex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}${a < 255 ? hex(a) : ""}`;
}

const GENERIC = /^(serif|sans-serif|monospace|cursive|fantasy|math|emoji|fangsong|ui-serif|ui-sans-serif|ui-monospace|ui-rounded)$/i;
const SYSTEM = /^(-apple-system|BlinkMacSystemFont|system-ui)$/i;
// Only a drawable family is remembered: a web font still loading reads as missing until it lands.
const installed = new Set<string>();
let probe: CanvasRenderingContext2D | null | undefined;

/**
 * Whether the browser can draw with `family`: a loaded web font, or a local
 * face whose advances differ from a generic fallback's. Without a canvas it
 * cannot be told.
 */
function canDraw(family: string): boolean | null {
  if (installed.has(family)) return true;
  if (probe === undefined) probe = typeof document === "undefined" ? null : document.createElement("canvas").getContext("2d");
  if (!probe) return null;
  const sample = "mmmmmmmmmmlliWW@#0123456789";
  const quoted = `"${family.replace(/["\\]/g, "\\$&")}"`;
  let drawn = false;
  for (const generic of ["monospace", "serif", "sans-serif"]) {
    probe.font = `72px ${generic}`;
    const base = probe.measureText(sample).width;
    probe.font = `72px ${quoted}, ${generic}`;
    if (probe.measureText(sample).width !== base) drawn = true;
  }
  if (drawn) installed.add(family);
  return drawn;
}

/**
 * The face a reader sees. The site's sans resolves to SF Pro on Apple devices
 * and Inter elsewhere (globals.css). Any other stack names the first family the
 * browser can draw; when that cannot be established, the declared stack.
 */
export function fontFace(stack: string) {
  const families = stack.split(",").map((family) => family.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
  if (!families.length) return stack;
  if (SYSTEM.test(families[0])) {
    return typeof document !== "undefined" && document.documentElement.dataset.face === "inter" ? "Inter" : "SF Pro";
  }
  for (const family of families) {
    if (GENERIC.test(family) || SYSTEM.test(family)) break;
    const drawn = canDraw(family);
    if (drawn === null) break;
    if (drawn) return family;
  }
  return families.join(", ");
}

export function sizeLabel(rect: Rect, zoom: number) {
  return `${measureValue(width(rect) / zoom)} × ${measureValue(height(rect) / zoom)}`;
}

export function deepestAt(targets: Target[], { x, y }: Point) {
  let hit: Target | undefined;
  for (const target of targets) {
    const { left, top, right, bottom } = target.visible;
    if (x >= left && x < right && y >= top && y < bottom && (!hit || target.depth >= hit.depth)) hit = target;
  }
  return hit;
}

function intersection(a: Rect, b: Rect): Rect {
  return { left: Math.max(a.left, b.left), top: Math.max(a.top, b.top), right: Math.min(a.right, b.right), bottom: Math.min(a.bottom, b.bottom) };
}

function visitTargets(root: Element, side: Side, pane: Rect, clip: Rect, depth: number, targets: Target[]) {
  for (const element of root.children) {
    if (element.matches("[data-annotation], script, style, template")) continue;
    const style = getComputedStyle(element);
    if (style.display === "none" || style.visibility !== "visible" || Number(style.opacity) === 0 || style.contentVisibility === "hidden") continue;
    const rect = element.getBoundingClientRect();
    const visible = intersection(rect, clip);
    if (width(rect) > 0 && height(rect) > 0 && !element.matches(".preview-frame")) {
      targets.push({ element, rect, visible, pane, side, depth });
    }
    // SVG artwork is a single element. The paths inside it are drawing data.
    if (element instanceof SVGElement) continue;
    const childClip = {
      left: style.overflowX === "visible" ? clip.left : visible.left,
      right: style.overflowX === "visible" ? clip.right : visible.right,
      top: style.overflowY === "visible" ? clip.top : visible.top,
      bottom: style.overflowY === "visible" ? clip.bottom : visible.bottom,
    };
    visitTargets(element, side, pane, childClip, depth + 1, targets);
  }
}

export function comparisonTargets(canvas: HTMLElement) {
  const targets: Target[] = [];
  const clip = canvas.getBoundingClientRect();
  for (const side of ["do", "dont"] as const) {
    const pane = canvas.querySelector(`.cmp-pane[data-side="${side}"]:not([data-off])`);
    const box = pane?.querySelector(".cmp-box");
    if (!pane || !box || Number(getComputedStyle(pane).opacity) === 0) continue;
    const rect = pane.getBoundingClientRect();
    visitTargets(box, side, rect, intersection(rect, clip), 0, targets);
  }
  return targets;
}

/** Nearest edges form an interval on each axis. Overlapping ranges have no gap. */
function nearestEdges(a: number, b: number, c: number, d: number) {
  return [Math.min(b, d), Math.max(a, c)] as const;
}

export function gapBetween(a: Rect, b: Rect, zoom: number) {
  const [left, right] = nearestEdges(a.left, a.right, b.left, b.right);
  const [top, bottom] = nearestEdges(a.top, a.bottom, b.top, b.bottom);
  return { left, right, top, bottom, x: Math.max(0, right - left) / zoom, y: Math.max(0, bottom - top) / zoom };
}

export function targetName({ element }: Target) {
  const text = element.getAttribute("aria-label") || element.getAttribute("alt") || element.getAttribute("title") ||
    Array.from(element.childNodes, (node) => node.nodeType === Node.TEXT_NODE ? node.textContent : "").join(" ");
  const label = text.trim().replace(/\s+/g, " ");
  return label.length > 40 ? `${label.slice(0, 39)}…` : label || element.localName;
}

export function describeTarget(target: Target, zoom: number) {
  const style = getComputedStyle(target.element);
  const padding: Edges = [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft].map((value) => parseFloat(value) || 0) as Edges;
  return {
    name: targetName(target),
    size: sizeLabel(target.rect, zoom),
    padding,
    border: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth].map((value) => parseFloat(value) || 0) as Edges,
    font: `${cssMeasure(style.fontSize)} / ${cssMeasure(style.lineHeight)} · ${style.fontWeight}`,
    family: fontFace(style.fontFamily),
    color: cssColor(style.color),
    background: cssColor(style.backgroundColor),
  };
}
