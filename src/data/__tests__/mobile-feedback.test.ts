import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { getStaticRulePreview } from "@/components/features/rules/rule-preview";
import { rules } from "@/data/ui-logic";
import { describe, expect, it } from "vitest";
import { composeSize, priceGeometry, priceTarget } from "@/components/features/rules/previews/mobile/kit/feedback-geometry";

describe("price feedback", () => {
  it.each([true, false])("keeps the bubble outside the pad throughout the drag, left hand %s", left => {
    for (let price = 0; price <= 100; price++) {
      const good = priceGeometry(price, "do", left, false);
      const bad = priceGeometry(price, "dont", left, false);
      expect(good.point).toEqual(bad.point);
      expect(good.pad).toEqual(bad.pad);
      expect(good.overlap).toBeNull();
      expect(good.pad.y - good.bubble.y - good.bubble.height).toBeCloseTo(4);
      expect(bad.overlap).not.toBeNull();
    }
  });

  it("places the target price in a fixed readout when there is no space above the finger", () => {
    expect(priceTarget).toBe(84);
    const { fixed, pad, bubble, overlap } = priceGeometry(priceTarget, "do", false, true);
    expect(fixed).toBe(true);
    expect(bubble.y).toBeGreaterThan(pad.y + pad.height);
    expect(overlap).toBeNull();
  });
});

describe("feedback gallery", () => {
  it.each(["mobile-24", "mobile-25", "mobile-26"])("leaves both %s stills inside a single gallery link", id => {
    for (const side of ["do", "dont"] as const) {
      const html = renderToStaticMarkup(getStaticRulePreview(id, side));
      expect(html).toContain("fb-still");
      expect(html).not.toMatch(/<(?:button|a|input|select|textarea)\b|tabindex=/i);
    }
  });

  it("shows the first bag quantity only in the pane that confirms Add", () => {
    const rule = rules.find(rule => rule.id === "mobile-25")!;
    const count = rule.do.match(/bag count changes to (\d+)/)?.[1];
    expect(count).toBe("1");
    expect(renderToStaticMarkup(getStaticRulePreview(rule.id, "do"))).toContain(count + " item in bag");
    expect(renderToStaticMarkup(getStaticRulePreview(rule.id, "dont"))).not.toContain("item in bag");
  });
});

describe("archive notice", () => {
  const css = readFileSync(new URL("../../components/features/rules/previews/mobile/feedback.css", import.meta.url), "utf8");
  const bottom = (selector: string) => css.match(new RegExp(selector.replace(/[.[\]"=]/g, "\\$&") + " \\{[^}]*?bottom: ([^;]+);"))?.[1];

  it("shares Compose's bottom edge in Don't and clears it by its height plus a gap in Do", () => {
    const rule = rules.find(entry => entry.id === "mobile-26")!;
    expect(rule.do).toMatch(/Undo clears Compose/);
    expect(rule.dont).toMatch(/Undo overlaps Compose/);
    expect(composeSize).toBeGreaterThanOrEqual(48);
    expect(bottom(".fb-snack")).toBe("26px");
    expect(bottom(".fb-compose")).toBe("26px");
    expect(bottom('.fb-snack[data-clear="true"]')).toBe("calc(26px + var(--fb-fab) + 8px)");
  });
});
