import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TouchStill } from "@/components/features/rules/previews/mobile/touch-still";
import { touchIds } from "@/components/features/rules/previews/mobile/touch-ids";
import { rules } from "@/data/ui-logic";
import { contains, windows } from "@/components/features/rules/previews/mobile/kit/geometry";
import { center, closeBox, cornerMetrics, cornerSamples, doubleTapWait, pressPath, reachGeometry } from "@/components/features/rules/previews/mobile/kit/touch-geometry";

function rule(id: string) { return rules.find(entry => entry.id === id)!; }

describe("Touch comparison captions", () => {
  it("places the same offset inside only the enlarged responding box", () => {
    const expanded = closeBox(windows.portrait, true);
    const ordinary = closeBox(windows.portrait, false);
    const origin = center(expanded);
    expect(origin).toEqual(center(ordinary));
    const tap = { x: origin.x + cornerMetrics.offset, y: origin.y };
    expect(contains(expanded, tap)).toBe(true);
    expect(contains(ordinary, tap)).toBe(false);
    expect(rule("mobile-3").do).toContain("Tap " + cornerMetrics.offset + " px");
    expect(rule("mobile-3").do).toContain(expanded.width + " px target closes");
    expect(rule("mobile-3").dont).toContain(ordinary.width + " px target misses");
    expect(cornerSamples(expanded).map(({ x, y }) => [x, y])).toEqual(cornerSamples(ordinary).map(({ x, y }) => [x, y]));
  });
  it("keeps Save the same size and changes its position relative to the selected pivot", () => {
    for (const left of [true, false]) {
      const low = reachGeometry(windows.portrait, true, left, 136, 265);
      const high = reachGeometry(windows.portrait, false, left, 136, 265);
      expect(low.box.width).toBe(high.box.width);
      expect(low.box.height).toBe(high.box.height);
      expect(low.inside).toBe(true);
      expect(high.inside).toBe(false);
    }
  });
  it("names the replayed row and the scheduled wait", () => {
    for (const side of ["do", "dont"] as const) expect(rule("mobile-5")[side]).toContain("row " + pressPath.row);
    expect(rule("mobile-6").dont).toContain(doubleTapWait + " ms");
  });
  it.each(touchIds)("keeps both gallery stills for %s free of controls", id => {
    for (const variant of ["do", "dont"] as const) {
      const html = renderToStaticMarkup(createElement(TouchStill, { id, variant }));
      expect(html).not.toMatch(/<(button|input|textarea|select|a)(\s|>)|tabindex=/i);
    }
  });
  it("prints the same programmed wait in the gallery still", () => {
    expect(renderToStaticMarkup(createElement(TouchStill, { id: "mobile-6", variant: "dont" }))).toContain(doubleTapWait + " ms");
  });
});
