import { describe, expect, it } from "vitest";
import { categories, rules } from "@/data/ui-logic";
import {
  accessibilityCollection,
  alignedRuleIds,
  categoryShort,
  collections,
  compareKind,
  hasLiveDemo,
  liveDemoCollection,
  railCategories,
  railCategory,
  railCategoryIds,
  railCategoryOf,
  railHome,
  railOrder,
  railPosition,
  railRank,
  structuralRuleIds,
  suggestsFlip,
} from "@/data/taxonomy";
import { showcaseSpecs } from "@/components/features/rules/demos/showcase-specs";

const ruleIds = rules.map((rule) => rule.id);

describe("category display data", () => {
  it("gives every source category a short name, with no punctuation split off a full name", () => {
    expect(Object.keys(categoryShort).sort()).toEqual(categories.map((c) => c.id).sort());
    expect(Object.values(categoryShort)).toEqual([
      "Typography",
      "Layout",
      "Color",
      "Components",
      "Forms",
      "System",
      "Motion",
      "Accessibility",
    ]);
  });

  it("leaves ui-logic untouched: the a11y rules keep their category, so skills and llms.txt don't shift", () => {
    expect(categories.map((c) => c.id)).toContain("accessibility");
    for (const id of ["a11y-1", "a11y-2", "a11y-3"]) {
      expect(rules.find((rule) => rule.id === id)?.category).toBe("accessibility");
    }
  });
});

describe("rail view", () => {
  it("shows seven categories, without Accessibility", () => {
    expect(railCategoryIds).toEqual([
      "typography", "layout", "color", "components", "forms", "system", "motion",
    ]);
    expect(railCategories.map((c) => c.id)).toEqual([...railCategoryIds]);
    expect(railCategories).toHaveLength(7);
    expect(railCategoryIds).not.toContain("accessibility");
  });

  it("places every rule exactly once", () => {
    const placed = railOrder.map((rule) => rule.id);
    expect(placed).toHaveLength(rules.length);
    expect(new Set(placed).size).toBe(rules.length);
    expect([...placed].sort()).toEqual([...ruleIds].sort());
  });

  it("keeps each rule in its own category unless the rail re-homes it", () => {
    for (const rule of rules) {
      expect(railCategoryOf(rule), rule.id).toBe(railHome[rule.id] ?? rule.category);
    }
    expect(railHome).toEqual({ "a11y-1": "system", "a11y-3": "system", "a11y-2": "color" });
  });

  it("uses the full name as the title and the short name as the label", () => {
    for (const category of railCategories) {
      expect(category.name).toBe(categories.find((c) => c.id === category.id)?.name);
      expect(category.short).toBe(categoryShort[category.id]);
      expect(category.rules).toEqual(category.groups.flatMap((group) => group.rules));
    }
  });

  it("counts honestly after re-homing", () => {
    expect(Object.fromEntries(railCategories.map((c) => [c.id, c.rules.length]))).toEqual({
      typography: 13,
      layout: 11,
      color: 13,
      components: 12,
      forms: 12,
      system: 15,
      motion: 29,
    });
  });

  it("sub-groups Motion, Typography and System in the spec's learning order", () => {
    const groups = (id: string) =>
      railCategories
        .find((c) => c.id === id)!
        .groups.map((g) => [g.label, g.rules.map((r) => r.id)]);

    expect(groups("motion")).toEqual([
      ["Intent and input preferences", ["motion-3", "motion-1", "motion-2", "motion-17", "motion-16"]],
      ["Timing and feedback", ["motion-6", "motion-5", "motion-4", "motion-8", "motion-11", "motion-25"]],
      [
        "Entrances, exits and continuity",
        ["motion-29", "motion-9", "motion-10", "motion-7", "motion-27", "motion-24", "motion-26", "motion-28"],
      ],
      ["Animation implementation", ["motion-14", "motion-12", "motion-13", "motion-15", "motion-21", "motion-22"]],
      ["Direct manipulation", ["motion-18", "motion-19", "motion-20", "motion-23"]],
    ]);
    expect(groups("typography")).toEqual([
      ["Type foundations", ["typo-5", "typo-9", "typo-11", "typo-6", "typo-1", "typo-2"]],
      ["Reading and wrapping", ["typo-3", "typo-4", "typo-8", "typo-7", "typo-10", "typo-12", "typo-13"]],
    ]);
    expect(groups("system")).toEqual([
      ["State, progress and recovery", ["sys-2", "sys-1", "sys-7", "sys-4", "sys-9", "sys-10", "sys-6"]],
      [
        "Interaction infrastructure",
        ["sys-5", "sys-11", "sys-3", "a11y-3", "sys-8", "a11y-1", "sys-13", "sys-14"],
      ],
    ]);
  });

  it("leaves Layout, Color, Components and Forms as one unlabelled group", () => {
    for (const id of ["layout", "color", "components", "forms"]) {
      const category = railCategories.find((c) => c.id === id)!;
      expect(category.groups).toHaveLength(1);
      expect(category.groups[0].label).toBeNull();
    }
  });

  it.each([
    ["layout", "layout", 11],
    ["color", "color", 12],
    ["components", "comp", 12],
    ["forms", "form", 12],
  ] as const)("keeps %s in its catalog numbering order", (categoryId, prefix, total) => {
    const category = railCategories.find((entry) => entry.id === categoryId)!;
    expect(category.rules.filter((rule) => rule.category === categoryId).map((rule) => rule.id))
      .toEqual(Array.from({ length: total }, (_, index) => `${prefix}-${index + 1}`));
  });

  it("inserts re-homed accessibility rules beside the rules they extend", () => {
    expect(railPosition("a11y-2").prev?.id).toBe("color-4");
    expect(railPosition("a11y-2").next?.id).toBe("color-5");
    expect(railPosition("a11y-3").prev?.id).toBe("sys-3");
    expect(railPosition("a11y-3").next?.id).toBe("sys-8");
    expect(railPosition("a11y-1").prev?.id).toBe("sys-8");
    expect(railPosition("a11y-1").next?.id).toBe("sys-13");
  });

  it("ranks rules by rail order", () => {
    railOrder.forEach((rule, index) => expect(railRank(rule.id)).toBe(index));
    expect(railRank("nope")).toBe(-1);
  });

  it("gives a position inside the category that never wraps", () => {
    expect(railPosition("motion-3")).toMatchObject({ category: "motion", index: 1, total: 29, prev: null });
    expect(railPosition("motion-3").next?.id).toBe("motion-1");
    expect(railPosition("motion-23")).toMatchObject({ index: 29, total: 29, next: null });
    expect(railPosition("a11y-1")).toMatchObject({ category: "system", total: 15 });
    expect(railPosition("a11y-1").prev?.id).toBe("sys-8");
    expect(() => railPosition("sys-12")).toThrow();
  });
});

describe("collections", () => {
  it("makes Accessibility a 14-rule collection across categories, holding all three a11y rules", () => {
    expect(accessibilityCollection.ruleIds).toHaveLength(14);
    expect(new Set(accessibilityCollection.ruleIds).size).toBe(14);
    for (const id of ["a11y-1", "a11y-2", "a11y-3"]) {
      expect(accessibilityCollection.ruleIds).toContain(id);
    }
    const spans = new Set(accessibilityCollection.ruleIds.map((id) => railCategoryOf(id)));
    expect(spans.size).toBeGreaterThan(4);
  });

  it("holds Live demos to the showcase registry, so it cannot drift from the demos", () => {
    expect([...liveDemoCollection.ruleIds].sort()).toEqual(Object.keys(showcaseSpecs).sort());
    expect(liveDemoCollection.ruleIds).toHaveLength(33);
    for (const rule of rules) {
      expect(hasLiveDemo(rule.id), rule.id).toBe(rule.id in showcaseSpecs);
    }
  });

  it("only names real rules, once each", () => {
    for (const collection of collections) {
      expect(new Set(collection.ruleIds).size, collection.id).toBe(collection.ruleIds.length);
      for (const id of collection.ruleIds) expect(ruleIds, collection.id).toContain(id);
    }
  });
});

describe("compare kind", () => {
  it("classifies every rule exactly once", () => {
    expect(Object.keys(compareKind).sort()).toEqual([...ruleIds].sort());
    for (const id of ruleIds) {
      expect(alignedRuleIds.has(id) !== structuralRuleIds.has(id), id).toBe(true);
    }
    expect(alignedRuleIds.size + structuralRuleIds.size).toBe(rules.length);
    for (const id of structuralRuleIds) expect(ruleIds).toContain(id);
  });

  it("pins the editorial split, so a change to it is a deliberate edit here", () => {
    expect([...structuralRuleIds].sort()).toEqual(
      [
        "comp-2", "comp-5", "comp-6", "comp-7",
        "form-1", "form-6", "form-10",
        "sys-1", "sys-2", "sys-5", "sys-6", "sys-7", "sys-10", "sys-11",
        "motion-1", "motion-3", "motion-14",
      ].sort(),
    );
    expect(alignedRuleIds.size).toBe(88);
  });

  it("suggests Flip only on aligned static rules", () => {
    expect(suggestsFlip("typo-2")).toBe(true);
    expect(suggestsFlip("form-1")).toBe(false);
    expect(suggestsFlip("motion-6")).toBe(false);
    expect(suggestsFlip("color-7")).toBe(false);
    for (const id of ruleIds) {
      expect(suggestsFlip(id), id).toBe(compareKind[id] === "aligned" && !hasLiveDemo(id));
    }
  });
});

describe("railCategory", () => {
  it("returns each rail category by id, with its rules", () => {
    for (const id of railCategoryIds) {
      const category = railCategory(id);
      expect(category.id).toBe(id);
      expect(category.rules.length).toBeGreaterThan(0);
    }
  });
});
