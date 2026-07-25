import { describe, expect, it } from "vitest";
import { getAdjacentRules, getRelatedRules, rules } from "@/data/ui-logic";

describe("getAdjacentRules", () => {
  it("handles category boundaries", () => {
    const typography = rules.filter((rule) => rule.category === "typography");

    expect(getAdjacentRules(typography[0]).prev).toBeNull();
    expect(getAdjacentRules(typography[0]).next?.id).toBe(typography[1].id);
    expect(getAdjacentRules(typography.at(-1)!).next).toBeNull();
  });

  it("never crosses category boundaries", () => {
    for (const rule of rules) {
      const { prev, next } = getAdjacentRules(rule);

      if (prev) expect(prev.category).toBe(rule.category);
      if (next) expect(next.category).toBe(rule.category);
    }
  });
});

describe("getRelatedRules", () => {
  it("never returns the source rule or duplicates and caps results at 3", () => {
    for (const rule of rules) {
      const related = getRelatedRules(rule);

      expect(related.length).toBeLessThanOrEqual(3);
      expect(related.some((candidate) => candidate.id === rule.id)).toBe(false);
      expect(new Set(related.map((candidate) => candidate.id)).size).toBe(related.length);
    }
  });
});
