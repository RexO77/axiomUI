import { describe, expect, it } from "vitest";
import { categories, rules } from "@/data/ui-logic";

const PREFIX_TO_CATEGORY: Record<string, string> = {
  typo: "typography",
  layout: "layout",
  color: "color",
  comp: "components",
  form: "forms",
  sys: "system",
  motion: "motion",
  a11y: "accessibility",
};

describe("rule corpus", () => {
  it("has unique ids", () => {
    const ids = rules.map((rule) => rule.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has no empty required fields", () => {
    for (const rule of rules) {
      expect(rule.title.trim()).not.toBe("");
      expect(rule.desc.trim()).not.toBe("");
      expect(rule.do.trim()).not.toBe("");
      expect(rule.dont.trim()).not.toBe("");
      expect(rule.tags.length).toBeGreaterThan(0);
    }
  });

  it("only uses declared categories", () => {
    const categoryIds = new Set(categories.map((category) => category.id));

    for (const rule of rules) {
      expect(categoryIds.has(rule.category), `${rule.id} → ${rule.category}`).toBe(true);
    }
  });

  it("id prefixes match their category", () => {
    for (const rule of rules) {
      const prefix = rule.id.replace(/-\d+$/, "");
      expect(PREFIX_TO_CATEGORY[prefix], `unknown prefix on ${rule.id}`).toBe(rule.category);
    }
  });

  it("every category has at least one rule", () => {
    for (const category of categories) {
      expect(rules.some((rule) => rule.category === category.id), category.id).toBe(true);
    }
  });
});
