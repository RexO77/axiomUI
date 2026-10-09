import { describe, expect, it } from "vitest";
import { categories, rules } from "@/data/ui-logic";
import { countByCategory, filterRules } from "@/lib/rule-search";

function sum(counts: Map<string, number>): number {
  return [...counts.values()].reduce((total, count) => total + count, 0);
}

describe("filterRules", () => {
  it("keeps every rule, in catalog order, for a blank query", () => {
    expect(filterRules("")).toEqual(rules);
    expect(filterRules("   ")).toEqual(rules);
  });

  it("matches title, desc, do, dont and tags case-insensitively", () => {
    const results = filterRules("  BUTTON ");

    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThan(rules.length);
    for (const rule of results) {
      const haystack = [rule.title, rule.desc, rule.do, rule.dont, ...rule.tags]
        .join(" ")
        .toLowerCase();
      expect(haystack).toContain("button");
    }
    expect(results).toEqual(rules.filter((rule) => results.includes(rule)));
  });

  it("returns nothing for a query no rule contains", () => {
    expect(filterRules("zzqx")).toEqual([]);
  });

  it("finds a rule by its exact id", () => {
    const results = filterRules("motion-12");

    expect(results.map((rule) => rule.id)).toContain("motion-12");
  });
});

describe("countByCategory", () => {
  it("lists every category, and the counts add up to the filtered rules", () => {
    for (const query of ["", "button", "zzqx", "motion-12"]) {
      const counts = countByCategory(query);

      expect([...counts.keys()]).toEqual(categories.map((category) => category.id));
      expect(sum(counts)).toBe(filterRules(query).length);
    }
  });

  it("counts the whole catalog for a blank query", () => {
    const counts = countByCategory("");

    for (const category of categories) {
      expect(counts.get(category.id)).toBe(
        rules.filter((rule) => rule.category === category.id).length,
      );
    }
  });

  it("reads 0 for a category the query empties", () => {
    const counts = countByCategory("zzqx");

    expect([...counts.values()].every((count) => count === 0)).toBe(true);
  });
});
