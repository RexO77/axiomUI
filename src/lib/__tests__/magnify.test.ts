import { describe, expect, it } from "vitest";
import { cosineWeight, easeOut, magnify, magnifyInto, magnifyHitTest, type MagnifyItem } from "@/lib/magnify";

const items: MagnifyItem[] = Array.from({ length: 80 }, (_, index) => ({ size: index % 12 === 0 ? 18 : 5, maxScale: index % 12 === 0 ? 1.5 : 5 }));

describe("Magnify lens", () => {
  it("conserves total strip length and the pointer's hit item over heterogeneous items", () => {
    for (const padding of [0, 12]) {
      const rest = magnify(items, 0, { padding, strength: 0 });
      for (let pointer = padding + 0.13; pointer < rest.length - padding; pointer += 2.7) {
        const result = magnify(items, pointer, { padding, radius: 5, strength: 1 });
        expect(result.length).toBe(rest.length);
        expect(result.startPadding + result.sizes.reduce((sum, size) => sum + size, 0) + result.endPadding).toBeCloseTo(rest.length, 7);
        expect(magnifyHitTest(result.positions, result.sizes, pointer)).toBe(magnifyHitTest(rest.positions, rest.sizes, pointer));
        expect(result.index).toBe(magnifyHitTest(rest.positions, rest.sizes, pointer));
        expect(result.positions[0]).toBeGreaterThanOrEqual(-1e-7);
        expect(result.positions.at(-1)! + result.sizes.at(-1)!).toBeLessThanOrEqual(result.length + 1e-7);
        for (let i = 0; i < items.length; i++) {
          expect(result.sizes[i]).toBeGreaterThan(0);
          expect(result.sizes[i]).toBeLessThanOrEqual(items[i].size * items[i].maxScale + 1e-7);
          if (i > 0) expect(result.positions[i]).toBeCloseTo(result.positions[i - 1] + result.sizes[i - 1], 7);
        }
      }
    }
  });

  it("flattens at hard ends, spends available padding, and handles one item", () => {
    const uniform = Array.from({ length: 40 }, () => ({ size: 5, maxScale: 6 }));
    const edge = magnify(uniform, 2.5);
    const centre = magnify(uniform, 102.5);
    expect(edge.positions[0]).toBeCloseTo(0);
    expect(edge.sizes[0]).toBeLessThan(centre.sizes[20]);
    const padded = magnify(uniform, 12.01, { padding: 12 });
    expect(padded.startPadding).toBeLessThan(12);
    expect(padded.positions[0]).toBeGreaterThanOrEqual(-1e-7);
    const single = magnify([{ size: 10, maxScale: 8 }], 4);
    expect(single.sizes[0]).toBeCloseTo(10);
    expect(single.positions[0]).toBeCloseTo(0);
    const pastEnd = magnify(uniform, 1000);
    expect(pastEnd.index).toBe(uniform.length - 1);
    expect(pastEnd.positions.at(-1)! + pastEnd.sizes.at(-1)!).toBeCloseTo(pastEnd.length);
  });

  it("has a bounded symmetric cosine falloff and an exact resting layout", () => {
    expect(cosineWeight(0, 5)).toBe(1);
    expect(cosineWeight(5, 5)).toBe(0);
    expect(cosineWeight(2, 5)).toBe(cosineWeight(-2, 5));
    expect(cosineWeight(0, 0)).toBe(0);
    expect(cosineWeight(1, 5)).toBeGreaterThan(cosineWeight(2, 5));
    const rest = magnify(items, 50, { strength: 0, padding: 12 });
    expect([...rest.sizes]).toEqual(items.map((item) => item.size));
    expect(rest.startPadding).toBe(12);
    expect(rest.endPadding).toBe(12);
    expect(magnify([], 0).index).toBe(-1);
    expect(magnify(items, NaN).index).toBe(-1);
    expect(() => magnify([{ size: 0, maxScale: 1 }], 0)).toThrow(RangeError);
    expect(easeOut(0)).toBe(0);
    expect(easeOut(1)).toBe(1);
  });
});

describe("caller-owned magnify buffers", () => {
  it("matches the allocating version across repeated frames without replacing buffers", () => {
    const out = magnify(items, 0, { strength: 0 });
    const positions = out.positions;
    const sizes = out.sizes;
    for (const pointer of [2.5, 40, 150, 400, -10, 1000, NaN]) {
      for (const strength of [0, 0.5, 1]) {
        const options = { strength, padding: 12 };
        const expected = magnify(items, pointer, options);
        expect(magnifyInto(out, items, pointer, options)).toBe(out);
        expect(out.positions).toBe(positions);
        expect(out.sizes).toBe(sizes);
        expect(out).toEqual(expected);
      }
    }
  });

  it("floors invalid peak scales at one without mutating the items or throwing", () => {
    const low = Object.freeze([Object.freeze({ size: 10, maxScale: 0.2 }), Object.freeze({ size: 10, maxScale: -2 })]);
    const clamped = low.map(item => ({ ...item, maxScale: 1 }));
    const out = magnify(low, 7, { strength: 0 });
    expect([...out.sizes]).toEqual([10, 10]);
    for (const pointer of [0, 7, 19, 40]) {
      expect(magnifyInto(out, low, pointer)).toEqual(magnify(clamped, pointer));
    }
    for (const peak of [NaN, Infinity, -Infinity]) {
      expect(magnify([{ size: 10, maxScale: peak }], 4)).toEqual(magnify([{ size: 10, maxScale: 1 }], 4));
    }
  });

  it("rejects mismatched buffers rather than silently writing beyond them", () => {
    expect(() => magnifyInto(magnify([], 0), items, 10)).toThrow(/buffers must match/);
  });
});
