import { intersection, unitsPerMm } from "./geometry";
import type { Variant } from "@/components/features/rules/preview-primitives";

export const feedbackSize = { width: 390, height: 460 };
export const priceTarget = 84;
export const composeSize = 56;

export function priceGeometry(price: number, side: Variant, leftHand: boolean, nearTop: boolean) {
  const point = { x: 36 + 318 * price / 100, y: nearTop ? 86 : 285 };
  const diameter = 18 * unitsPerMm;
  const pad = { x: point.x - diameter * (leftHand ? 0.6 : 0.4), y: point.y - diameter * 0.3, width: diameter, height: diameter };
  const above = pad.y - 4 - 34;
  const fixed = side === "do" && above < 48;
  const bubble = {
    x: fixed ? 24 : Math.max(4, Math.min(feedbackSize.width - 60, point.x - 28)),
    y: side === "dont" ? point.y - 17 : fixed ? 180 : above, width: 56, height: 34,
  };
  return { point, bubble, pad, fixed, overlap: intersection(bubble, pad) };
}
