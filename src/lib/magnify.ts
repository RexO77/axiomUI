export type MagnifyItem = { size: number; maxScale: number };
export type MagnifyLayout = {
  positions: Float64Array;
  sizes: Float64Array;
  index: number;
  /** Fixed strip length, including the unspent end padding. */
  length: number;
  startPadding: number;
  endPadding: number;
};
export type MagnifyOptions = { padding?: number; radius?: number; strength?: number };

const MIN_SCALE = 0.42;
const EPSILON = 1e-8;
const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));

export function cosineWeight(distance: number, radius: number): number {
  if (radius <= 0 || Math.abs(distance) >= radius) return 0;
  return (1 + Math.cos(Math.PI * distance / radius)) / 2;
}

/** The inverse hit test works for both the resting and magnified positions. */
export function magnifyHitTest(positions: Float64Array, sizes: Float64Array, pointer: number): number {
  let low = 0;
  let high = positions.length - 1;
  while (low <= high) {
    const middle = (low + high) >>> 1;
    if (pointer < positions[middle]) high = middle - 1;
    else if (pointer >= positions[middle] + sizes[middle]) low = middle + 1;
    else return middle;
  }
  return -1;
}

/** Spend compression first, then end padding, then flatten the lens at a hard end. */
function sideScale(base: number, weighted: number, magnified: number, padding: number): number {
  const unweighted = base - weighted;
  if (unweighted > EPSILON) {
    const compressed = (base - magnified) / unweighted;
    if (compressed >= MIN_SCALE) return Math.min(1, compressed);
    const padded = (base + padding - magnified) / unweighted;
    if (padded >= MIN_SCALE) return Math.min(1, padded);
  }
  return MIN_SCALE;
}

function sideStrength(base: number, weighted: number, magnified: number, padding: number, scale: number): number {
  if (scale > MIN_SCALE) return 1;
  const growth = magnified - MIN_SCALE * weighted;
  return growth > EPSILON ? clamp((base + padding - MIN_SCALE * base) / growth, 0, 1) : 0;
}

const maxScale = (item: MagnifyItem) => Number.isFinite(item.maxScale) ? Math.max(1, item.maxScale) : 1;

function lensSize(item: MagnifyItem, weight: number, scale: number, strength: number): number {
  return item.size * (scale + (maxScale(item) - scale) * weight * strength);
}

/** Convenience allocation for callers that don't retain frame buffers. */
export function magnify(items: readonly MagnifyItem[], pointer: number, options: MagnifyOptions = {}): MagnifyLayout {
  return magnifyInto({
    positions: new Float64Array(items.length), sizes: new Float64Array(items.length),
    index: -1, length: 0, startPadding: 0, endPadding: 0,
  }, items, pointer, options);
}

/**
 * Cosine lens in one dimension, O(n), with no per-frame allocations. The caller
 * owns two exact-length buffers and the result object. Recompute cheap weights
 * rather than allocate scratch arrays. Items stay contiguous, the hit item stays
 * hit, and neither end exceeds the strip; the same math serves either axis.
 */
export function magnifyInto(out: MagnifyLayout, items: readonly MagnifyItem[], pointer: number, options?: MagnifyOptions): MagnifyLayout {
  if (out.positions.length !== items.length || out.sizes.length !== items.length) {
    throw new RangeError("Magnify buffers must match the item count");
  }
  const padding = Math.max(0, options?.padding ?? 0);
  const radius = Math.max(0, options?.radius ?? 5);
  const strength = clamp(options?.strength ?? 1, 0, 1);
  const positions = out.positions;
  const sizes = out.sizes;
  let end = padding;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!Number.isFinite(item.size) || item.size <= 0) {
      throw new RangeError("Magnify items need a positive finite size");
    }
    positions[i] = end;
    sizes[i] = item.size;
    end += item.size;
  }
  out.index = -1;
  out.length = end + padding;
  out.startPadding = padding;
  out.endPadding = padding;
  if (!items.length || !Number.isFinite(pointer)) return out;
  const anchor = clamp(pointer, padding, end - EPSILON);
  const index = magnifyHitTest(positions, sizes, anchor);
  out.index = index;
  if (strength === 0 || radius === 0) return out;

  const fraction = (anchor - positions[index]) / items[index].size;
  let leftBase = 0, leftWeighted = 0, leftMagnified = 0;
  let rightBase = 0, rightWeighted = 0, rightMagnified = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const weight = strength * cosineWeight(i + 0.5 - index - fraction, radius);
    const peak = maxScale(item);
    const share = i < index ? 1 : i === index ? fraction : 0;
    const left = item.size * share;
    const right = item.size * (1 - share);
    leftBase += left;
    leftWeighted += left * weight;
    leftMagnified += left * peak * weight;
    rightBase += right;
    rightWeighted += right * weight;
    rightMagnified += right * peak * weight;
  }
  const leftScale = sideScale(leftBase, leftWeighted, leftMagnified, padding);
  const rightScale = sideScale(rightBase, rightWeighted, rightMagnified, padding);
  const leftStrength = sideStrength(leftBase, leftWeighted, leftMagnified, padding, leftScale);
  const rightStrength = sideStrength(rightBase, rightWeighted, rightMagnified, padding, rightScale);
  const anchorWeight = strength * cosineWeight(0.5 - fraction, radius);
  const beforeAnchor = fraction * lensSize(items[index], anchorWeight, leftScale, leftStrength);
  sizes[index] = beforeAnchor + (1 - fraction) * lensSize(items[index], anchorWeight, rightScale, rightStrength);
  positions[index] = anchor - beforeAnchor;
  for (let i = index - 1; i >= 0; i--) {
    const weight = strength * cosineWeight(i + 0.5 - index - fraction, radius);
    sizes[i] = lensSize(items[i], weight, leftScale, leftStrength);
    positions[i] = positions[i + 1] - sizes[i];
  }
  for (let i = index + 1; i < items.length; i++) {
    const weight = strength * cosineWeight(i + 0.5 - index - fraction, radius);
    sizes[i] = lensSize(items[i], weight, rightScale, rightStrength);
    positions[i] = positions[i - 1] + sizes[i - 1];
  }
  out.startPadding = Math.max(0, positions[0]);
  out.endPadding = Math.max(0, out.length - positions[items.length - 1] - sizes[items.length - 1]);
  return out;
}

export function easeOut(progress: number): number {
  return 1 - (1 - clamp(progress, 0, 1)) ** 3;
}
