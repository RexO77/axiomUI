import { describe, expect, it } from "vitest";

import { deepestAt, fontFace, gapBetween, sizeLabel, type Rect, type Target } from "../measure-geometry";

const rect = (left: number, top: number, right: number, bottom: number): Rect => ({ left, top, right, bottom });

describe("comparison geometry", () => {
  it("names a face only when it can be established, else the declared stack", () => {
    expect(fontFace("-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif")).toBe("SF Pro");
    // No canvas here, so nothing says which family draws: the stack is the honest answer.
    expect(fontFace('"Arial", Verdana, "Liberation Sans", sans-serif')).toBe("Arial, Verdana, Liberation Sans, sans-serif");
  });

  it("uses preview pixels at 2× and keeps one decimal only when needed", () => {
    expect(sizeLabel(rect(4, 8, 63.25, 36), 1)).toBe("59.3 × 28");
    expect(sizeLabel(rect(26, 40, 144.5, 96), 2)).toBe("59.3 × 28");
  });

  it("measures the nearest edges on both axes, independently of pick order", () => {
    const first = rect(10, 20, 90, 80);
    const second = rect(106, 88.5, 146, 120);
    const expected = { left: 90, right: 106, top: 80, bottom: 88.5, x: 8, y: 4.25 };
    expect(gapBetween(first, second, 2)).toEqual(expected);
    expect(gapBetween(second, first, 2)).toEqual(expected);
    expect(gapBetween(first, rect(20, 80, 30, 110), 1)).toMatchObject({ x: 0, y: 0 });
  });

  it("picks the deepest box at the pointer and ignores its clipped portion", () => {
    const pane = rect(0, 0, 100, 100);
    const parent: Target = { element: {} as Element, side: "do", depth: 0, rect: pane, visible: pane, pane };
    const child: Target = { ...parent, element: {} as Element, depth: 1, rect: rect(60, 60, 120, 110), visible: rect(60, 60, 100, 100) };
    expect(deepestAt([parent, child], { x: 70, y: 65 })).toBe(child);
    expect(deepestAt([parent, child], { x: 40, y: 65 })).toBe(parent);
    expect(deepestAt([parent, child], { x: 110, y: 65 })).toBeUndefined();
  });
});
