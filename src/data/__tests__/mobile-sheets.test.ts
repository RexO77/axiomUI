import { describe, expect, it } from "vitest";
import { finishPull, matchingShoes, sheetMetrics as m, toggleFilter, visitOptions } from "@/components/features/rules/previews/mobile/kit/sheets-fixtures";
import { rules } from "../ui-logic";

describe("sheet comparisons", () => {
  it("keeps the list owner through the last event of a flick from row 25", () => {
    const start = (m.firstDeparture - 1) * m.row;
    expect(finishPull(start, 160, 2.4, true)).toEqual({ offset: 0, dismiss: false, owner: "List" });
    expect(finishPull(start, 160, 2.4, false)).toEqual({ offset: 0, dismiss: true, owner: "Sheet" });
    for (const good of [true, false]) {
      expect(finishPull(0, 160, 2.4, good).dismiss).toBe(true);
      expect(finishPull(0, 3, 1, good).dismiss).toBe(false);
    }
  });
  it("requires scrolling to reach the option named in the captions", () => {
    const option = visitOptions.indexOf("Wheelchair access") + 1;
    const rule = rules.find(r => r.id === "mobile-18")!;
    expect(option).toBe(visitOptions.length);
    expect((option - 1) * m.row).toBeGreaterThan(m.expanded - m.header - m.inset);
    for (const text of [rule.do, rule.dont]) expect(text).toContain("option " + option);
  });
  it("previews the same pairs for three draft or successive committed choices", () => {
    const selection = ["Size 9", "Black", "Under $120"] as const;
    const rule = rules.find(r => r.id === "mobile-19")!;
    expect(rule.do).toMatch(/three filters · apply once/i);
    expect(rule.dont).toMatch(/three choices · sheet closes three times/i);
    const active = selection.reduce<ReturnType<typeof toggleFilter>>(toggleFilter, []);
    expect(matchingShoes(active).map(shoe => shoe.name)).toEqual(["Court low", "Road trainer"]);
    expect(matchingShoes(toggleFilter(active, "Size 11"))).toHaveLength(0);
    expect(toggleFilter(active, "Black")).toEqual(["Size 9", "Under $120"]);
  });
});
