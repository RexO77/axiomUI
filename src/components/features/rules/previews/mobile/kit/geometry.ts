import type { CSSProperties } from "react";

export type Size = { width: number; height: number };
export type Point = { x: number; y: number };
export type Box = Point & Size;
export type Profile = "iOS" | "Android";
export type Host = "App" | "Browser";

export const windows = {
  portrait: { width: 390, height: 844 },
  landscape: { width: 844, height: 390 },
  narrow: { width: 360, height: 640 },
  split: { width: 390, height: 844 },
  compact: { width: 599, height: 844 },
  medium: { width: 600, height: 844 },
  large: { width: 700, height: 844 },
  short: { width: 700, height: 390 },
} as const;

export const screenMetrics = { gap: 12, action: 48, inset: 34, toolbar: 88, side: 47, edge: 24 } as const;
export const insetPresets = [0, 24, 34, 48] as const;
export function logicalPoint(client: Point, bounds: DOMRectReadOnly, size: Size): Point {
  return { x: (client.x - bounds.left) * size.width / bounds.width, y: (client.y - bounds.top) * size.height / bounds.height };
}
export function intersection(a: Box, b: Box): Box | null {
  const x = Math.max(a.x, b.x), y = Math.max(a.y, b.y);
  const width = Math.min(a.x + a.width, b.x + b.width) - x;
  const height = Math.min(a.y + a.height, b.y + b.height) - y;
  return width > 0 && height > 0 ? { x, y, width, height } : null;
}
export function contains(box: Box, point: Point) {
  return point.x >= box.x && point.y >= box.y && point.x < box.x + box.width && point.y < box.y + box.height;
}
export function payBox(size: Size, inset: number, side: number, padded: boolean): Box {
  const left = screenMetrics.gap + (padded ? side : 0);
  return { x: left, y: size.height - screenMetrics.action - screenMetrics.gap - (padded ? inset : 0),
    width: size.width - left - screenMetrics.gap, height: screenMetrics.action };
}
export function panelHeight(height: number, unit: "svh" | "vh" | "dvh", toolbar: number, host: Host) {
  if (host === "App") return height;
  if (unit === "svh") return height - screenMetrics.toolbar;
  return height - (unit === "dvh" ? toolbar : 0);
}
export function fixtureUnit(host: Host, profile: Profile) {
  return host === "Browser" ? "CSS px" : profile === "iOS" ? "modelled pt" : "modelled dp";
}
export const unitsPerMm = 460 / (3 * 25.4);
export function calibratedScale(cardWidth: number) { return cardWidth / 85.60 / unitsPerMm; }

export function keyboardViewport(height: number, policy: "visual" | "layout" | "overlay", software = true, offset = 0) {
  const keyboardHeight = software ? Math.min(height, 336) : 0;
  const keyboardTop = height - keyboardHeight;
  return { keyboardTop, keyboardHeight, offset, layoutHeight: policy === "layout" ? keyboardTop : height,
    visualHeight: policy === "overlay" ? height : keyboardTop };
}
export const initialSheet = {
  detent: 120, bodyScrollTop: 0, backgroundOffset: 0, modal: false, back: "idle" as "idle" | "preview",
};
export type SheetState = typeof initialSheet;
export type Sample = Point & { time: number; pointerId: number; phase: "down" | "move" | "up" | "cancel" };
export function seededOffsets(seed: number, count: number, region: "center" | "edge" | "corner"): Point[] {
  // Uniform square offsets in logical units. Every pane starts with the same seed.
  const spread = { center: 14, edge: 22, corner: 32 }[region];
  let state = seed >>> 0;
  function offset() { state = (Math.imul(1664525, state) + 1013904223) >>> 0; return (state / 4294967296 * 2 - 1) * spread; }
  return Array.from({ length: count }, () => ({ x: offset(), y: offset() }));
}

export function boxStyle(box: Box): CSSProperties {
  return { position: "absolute", left: box.x, top: box.y, width: box.width, height: box.height };
}
