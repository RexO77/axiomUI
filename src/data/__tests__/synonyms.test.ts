import { describe, expect, it } from "vitest";
import { accessibilityCollection } from "@/data/taxonomy";
import { synonyms } from "@/data/synonyms";
import { rules } from "@/data/ui-logic";
import { queryTerms } from "@/lib/rule-search";

describe("synonym data", () => {
  it("uses unique, normalized phrases", () => {
    expect(new Set(synonyms.map((synonym) => synonym.phrase)).size).toBe(synonyms.length);
    for (const { phrase } of synonyms) {
      expect(phrase).not.toBe("");
      expect(queryTerms(phrase).join(" "), phrase).toBe(phrase);
    }
  });

  it("only targets real rules, once per phrase", () => {
    const ids = new Set(rules.map((rule) => rule.id));
    for (const { phrase, ruleIds } of synonyms) {
      expect(ruleIds.length, phrase).toBeGreaterThan(0);
      expect(new Set(ruleIds).size, phrase).toBe(ruleIds.length);
      for (const id of ruleIds) expect(ids.has(id), `${phrase} → ${id}`).toBe(true);
    }
  });

  it("keeps accessibility aliases synchronized with the collection", () => {
    for (const phrase of ["a11y", "accessibility"]) {
      expect(synonyms.find((synonym) => synonym.phrase === phrase)?.ruleIds)
        .toEqual(accessibilityCollection.ruleIds);
    }
  });
});
