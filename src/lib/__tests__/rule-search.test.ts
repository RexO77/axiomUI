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

  it("returns every matching rule in catalog order", () => {
    const expected = rules.filter((rule) =>
      [rule.title, rule.desc, rule.do, rule.dont, ...rule.tags]
        .join("\n")
        .toLowerCase()
        .includes("button"),
    );

    expect(expected.length).toBeGreaterThan(0);
    expect(expected.length).toBeLessThan(rules.length);
    expect(filterRules("  BUTTON ")).toEqual(expected);
  });

  for (const [field, needle, id] of [
    ["title", "sentence case is king", "typo-1"],
    ["desc", "no natural rhythm", "typo-2"],
    ["do", "tracking-wider", "typo-2"],
    ["dont", "tracking-normal", "typo-2"],
    ["tags", "responsive", "typo-10"],
  ] as const) {
    it(`finds matches carried only by ${field}, ignoring case and whitespace`, () => {
      const target = rules.find((rule) => rule.id === id)!;
      const matchedFields = [
        ...(["title", "desc", "do", "dont"] as const).filter((key) =>
          target[key].toLowerCase().includes(needle),
        ),
        ...(target.tags.some((tag) => tag.toLowerCase().includes(needle)) ? ["tags"] : []),
      ];
      expect(matchedFields).toEqual([field]);

      const expected = rules.filter((rule) =>
        [rule.title, rule.desc, rule.do, rule.dont, ...rule.tags]
          .join("\n")
          .toLowerCase()
          .includes(needle),
      );
      expect(expected).toContain(target);
      expect(filterRules(`  ${needle.toUpperCase()}  `)).toEqual(expected);
    });
  }

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
