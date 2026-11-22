import { contains, seededOffsets, type Box, type Point, type Size } from "./geometry";

export const cornerMetrics = { reference: 48, expanded: 60, inset: 40, offset: 26, seed: 37, count: 48 } as const;
export const pressPath = { row: 4, travel: 120 } as const;
export const doubleTapWait = 300;

export function closeBox(size: Size, expanded: boolean): Box {
  const width = expanded ? cornerMetrics.expanded : cornerMetrics.reference;
  return { x: size.width - cornerMetrics.inset - width / 2, y: 48 + cornerMetrics.inset - width / 2, width, height: width };
}
export function center(box: Box): Point {
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}
export function cornerSamples(box: Box) {
  const origin = center(box);
  return seededOffsets(cornerMetrics.seed, cornerMetrics.count, "corner").map(offset => {
    const point = { x: origin.x + offset.x, y: origin.y + offset.y };
    return { ...point, hit: contains(box, point) };
  });
}
export function reachGeometry(size: Size, low: boolean, left: boolean, pivotHeight: number, radius: number) {
  const pivot = { x: left ? 0 : size.width, y: size.height - pivotHeight };
  const box = { width: 94, height: 52, x: low ? (size.width - 94) / 2 : size.width - 94 - 18, y: low ? size.height - 124 : 62 };
  const target = center(box);
  const distance = Math.hypot(target.x - pivot.x, target.y - pivot.y);
  return { box, pivot, distance, inside: distance <= radius };
}
