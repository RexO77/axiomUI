import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { rules } from "../ui-logic";
import { NavigationStill } from "@/components/features/rules/previews/mobile/navigation";
import { backGesture, current, destinations, draft, draftHistory, navigationSurface, product, windowSizes } from "@/components/features/rules/previews/mobile/kit/navigation-fixture";

const rule = (n: number) => rules.find(r => r.id === "mobile-" + n)!;

describe("navigation comparisons", () => {
  it("includes the same Orders destination behind the extra disclosure", () => {
    expect(destinations).toContain("Orders");
    expect(rule(7).do).toContain("one tap");
    expect(rule(7).dont).toContain("in two");
  });
  it("opens the product named in the tab restoration caption", () => {
    expect(rule(8).do).toContain("product " + product.id);
    expect(product.path).toBe("/shop/products/" + product.id);
  });
  it("keeps the draft through preview and cancellation and spends a single pop on completion", () => {
    for (const deferred of [true, false]) {
      const history = draftHistory();
      const preview = [0, .6, .2].reduce((h, progress) => backGesture(h, "preview", deferred, progress), history);
      const canceled = backGesture(preview, "cancel", deferred);
      expect(canceled.index + 1).toBe(deferred ? 2 : 1);
      expect(current(canceled)).toEqual(deferred ? draft : history.entries[0]);
      expect(backGesture(preview, "back", deferred).index).toBe(history.index - 1);
    }
  });
  it("adapts across the 599/600 boundary, compact height and tabletop posture", () => {
    const [split, compact, medium, full, short] = windowSizes;
    expect(rule(11).do).toContain(split.width + " dp");
    expect(rule(11).dont).toContain(full.width + " dp");
    for (const size of [split, compact, short]) expect(navigationSurface(size, true, false)).toBe("Bottom bar");
    for (const size of [medium, full]) expect(navigationSurface(size, true, false)).toBe("Side rail");
    for (const size of windowSizes) {
      expect(navigationSurface(size, false, false)).toBe("Side rail");
      expect(navigationSurface(size, true, true)).toBe("Bottom bar");
    }
  });
  it.each([7, 8, 9, 10, 11])("keeps both gallery stills for mobile-%i free of controls", n => {
    for (const variant of ["do", "dont"] as const) {
      const html = renderToStaticMarkup(createElement(NavigationStill, { id: rule(n).id, variant }));
      expect(html).not.toMatch(/<(button|input|textarea|select|a)(\s|>)|tabindex=/i);
    }
  });
});
