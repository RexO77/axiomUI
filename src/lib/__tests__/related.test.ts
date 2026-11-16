import { describe, expect, it } from "vitest";
import { railOrder } from "@/data/taxonomy";
import { rules } from "@/data/ui-logic";
import { RELATED_ORDER, relatedRules, relatedWithOrder } from "@/lib/related";

/**
 * The Related list for all 105 rules, as readers are shown it. A change here
 * is a change to what readers see: review it as editorial, not as a test fix.
 */
const PINNED: Record<string, readonly string[]> = {
  "typo-5": ["layout-10", "color-8", "comp-10"],
  "typo-9": ["color-1", "layout-1", "layout-10"],
  "typo-11": ["sys-11", "layout-2", "color-2"],
  "typo-6": ["color-1", "color-5", "comp-1"],
  "typo-1": ["comp-2", "layout-5", "comp-1"],
  "typo-2": ["layout-2", "color-2", "comp-7"],
  "typo-3": ["layout-2", "layout-1", "layout-5"],
  "typo-4": ["layout-5", "layout-1", "layout-3"],
  "typo-8": ["layout-2", "layout-6", "layout-4"],
  "typo-7": ["layout-6", "layout-2", "layout-4"],
  "typo-10": ["sys-11", "layout-2", "layout-9"],
  "typo-12": ["typo-4", "typo-13", "typo-1"],
  "typo-13": ["layout-2", "color-2"],
  "layout-1": ["typo-4", "typo-9", "typo-3"],
  "layout-2": ["typo-3", "typo-8", "typo-13"],
  "layout-3": ["form-5", "typo-4", "form-6"],
  "layout-4": ["typo-8", "comp-7", "comp-10"],
  "layout-5": ["typo-4", "comp-9", "typo-3"],
  "layout-6": ["typo-8", "typo-7", "comp-7"],
  "layout-7": ["color-12", "color-5", "color-3"],
  "layout-8": ["comp-10", "color-7", "typo-5"],
  "layout-9": ["sys-11", "a11y-3", "typo-11"],
  "layout-10": ["typo-5", "typo-9", "typo-4"],
  "layout-11": ["comp-12", "comp-5", "sys-5"],
  "color-1": ["typo-9", "typo-6", "comp-1"],
  "color-2": ["typo-11", "typo-6", "typo-2"],
  "color-3": ["layout-7"],
  "color-4": ["form-5", "form-12", "sys-5"],
  "color-5": ["typo-6", "layout-7"],
  "color-6": ["a11y-1", "comp-12", "sys-3"],
  "color-7": ["motion-16", "layout-1", "comp-9"],
  "color-8": ["typo-5", "sys-5", "layout-7"],
  "color-9": ["a11y-1", "typo-6", "sys-8"],
  "color-10": ["comp-9", "sys-2", "motion-28"],
  "color-11": ["sys-10"],
  "color-12": ["layout-7"],
  "comp-1": ["typo-6", "color-1", "layout-5"],
  "comp-2": ["sys-6", "typo-1", "layout-5"],
  "comp-3": ["layout-4", "motion-4", "motion-25"],
  "comp-4": ["form-5", "a11y-2", "color-4"],
  "comp-5": ["layout-11", "form-5", "sys-4"],
  "comp-6": ["form-8", "sys-7", "motion-3"],
  "comp-7": ["form-3", "layout-6", "form-1"],
  "comp-8": ["motion-11", "color-4", "color-7"],
  "comp-9": ["sys-2", "sys-1", "form-12"],
  "comp-10": ["layout-6", "layout-8", "color-7"],
  "comp-11": ["sys-3", "a11y-3", "sys-8"],
  "comp-12": ["sys-8", "a11y-1", "layout-11"],
  "form-1": ["comp-7", "typo-1", "typo-2"],
  "form-2": ["comp-7", "a11y-1", "a11y-2"],
  "form-3": ["comp-7", "typo-1", "typo-2"],
  "form-4": ["layout-3", "comp-7", "comp-8"],
  "form-5": ["color-4", "layout-3", "comp-4"],
  "form-6": ["layout-3"],
  "form-7": ["layout-3", "color-4", "comp-4"],
  "form-8": ["comp-6", "motion-27", "sys-6"],
  "form-9": ["sys-7", "comp-7", "comp-8"],
  "form-10": ["layout-3"],
  "form-11": ["layout-3"],
  "form-12": ["comp-9", "motion-8", "sys-2"],
  "sys-2": ["comp-9", "color-10", "form-12"],
  "sys-1": ["comp-9", "color-4", "color-7"],
  "sys-7": ["comp-6", "form-9", "form-12"],
  "sys-4": ["comp-5", "color-4", "comp-4"],
  "sys-9": ["comp-9", "motion-1", "motion-2"],
  "sys-10": ["comp-9", "color-11", "comp-6"],
  "sys-6": ["comp-2", "comp-6", "form-8"],
  "sys-5": ["layout-11", "color-4", "color-8"],
  "sys-11": ["layout-9", "typo-11", "typo-10"],
  "sys-3": ["a11y-3", "comp-11", "color-6"],
  "sys-8": ["comp-12", "a11y-1", "color-6"],
  "sys-13": ["motion-21", "motion-14", "motion-13"],
  "sys-14": ["motion-21", "motion-22", "motion-14"],
  "motion-3": ["comp-6", "form-12", "sys-7"],
  "motion-1": ["sys-9", "sys-1"],
  "motion-2": ["a11y-1", "sys-9", "sys-8"],
  "motion-17": ["color-6", "comp-12", "a11y-1"],
  "motion-16": ["color-7", "a11y-3", "sys-3"],
  "motion-6": ["form-8", "sys-1", "sys-9"],
  "motion-5": ["sys-9", "sys-1"],
  "motion-4": ["layout-4", "comp-3"],
  "motion-8": ["form-12", "layout-5", "comp-9"],
  "motion-11": ["comp-8", "sys-9", "sys-1"],
  "motion-25": ["form-8", "layout-4", "comp-3"],
  "motion-29": ["sys-1", "sys-9"],
  "motion-9": ["motion-10", "motion-7", "motion-14"],
  "motion-10": ["layout-11", "comp-12", "comp-5"],
  "motion-7": ["form-8"],
  "motion-27": ["form-8"],
  "motion-24": ["form-8"],
  "motion-26": ["motion-29", "motion-9", "motion-7"],
  "motion-28": ["color-10", "layout-4", "layout-6"],
  "motion-14": ["sys-13", "sys-14"],
  "motion-12": ["sys-13", "sys-14"],
  "motion-13": ["sys-13", "sys-14"],
  "motion-15": ["typo-10", "layout-2", "layout-9"],
  "motion-21": ["sys-13", "sys-14"],
  "motion-22": ["sys-14", "sys-13"],
  "motion-18": ["sys-3", "a11y-3"],
  "motion-19": ["sys-3", "a11y-3"],
  "motion-20": ["sys-3", "a11y-3"],
  "motion-23": ["sys-13", "sys-14"],
  "a11y-1": ["color-6", "comp-12", "sys-8"],
  "a11y-2": ["layout-6", "layout-4", "color-4"],
  "a11y-3": ["sys-3", "layout-9", "comp-11"],
};

const top = (id: string) => relatedRules(id).map((rule) => rule.id);

describe("related rules", () => {
  it("matches the pinned list for every rule", () => {
    expect(Object.keys(PINNED)).toHaveLength(105);
    for (const rule of rules) expect(top(rule.id), rule.id).toEqual(PINNED[rule.id]);
  });

  it("matches the worked examples", () => {
    expect(top("typo-3")).toEqual(["layout-2", "layout-1", "layout-5"]);
    expect(top("typo-12")).toEqual(["typo-4", "typo-13", "typo-1"]);
  });

  it("returns one to three rules, never padded, never the rule itself", () => {
    const byId = new Map(rules.map((rule) => [rule.id, rule]));
    for (const rule of rules) {
      const ids = top(rule.id);
      expect(ids.length).toBeGreaterThanOrEqual(1);
      expect(ids.length).toBeLessThanOrEqual(3);
      expect(ids).not.toContain(rule.id);
      expect(new Set(ids).size).toBe(ids.length);
      const tags = new Set(rule.tags.map((tag) => tag.toLowerCase()));
      for (const id of ids) {
        expect(byId.get(id)!.tags.some((tag) => tags.has(tag.toLowerCase())), `${rule.id} → ${id} shares a tag`).toBe(true);
      }
    }
    expect(top("color-3")).toEqual(["layout-7"]);
  });

  it("falls back to the rule’s own category only when no other category shares a tag", () => {
    const category = (id: string) => rules.find((rule) => rule.id === id)!.category;
    expect(top("typo-12").every((id) => category(id) === "typography")).toBe(true);
    const fallbacks = rules.filter((rule) => top(rule.id).every((id) => category(id) === rule.category)).map((rule) => rule.id);
    expect(fallbacks).toEqual(["typo-12", "motion-9", "motion-26"]);
  });

  it("breaks ties by the fixed source-catalog order, not rail order", () => {
    expect([...RELATED_ORDER].sort()).toEqual(rules.map((rule) => rule.id).sort());
    expect(RELATED_ORDER.slice(-3)).toEqual(["a11y-1", "a11y-2", "a11y-3"]);
    expect(RELATED_ORDER).not.toEqual(railOrder.map((rule) => rule.id));
    const rail = railOrder.map((rule) => rule.id);
    // Rail order would change real results (9 of 105 on today's taxonomy) and
    // promote the re-homed a11y-2 as a tie winner. The count is not pinned:
    // the learning order can change independently of Related.
    const changed = rules.flatMap((rule) => {
      const before = top(rule.id);
      const after = relatedWithOrder(rule.id, rail).map((r) => r.id);
      return before.join() === after.join() ? [] : [{ id: rule.id, before, after }];
    });
    expect(changed.length).toBeGreaterThan(0);
    expect(changed.some(({ before, after }) => after.indexOf("a11y-2") >= 0 && after.indexOf("a11y-2") !== before.indexOf("a11y-2"))).toBe(true);
  });

  it("returns a fresh array and nothing for an unknown id", () => {
    expect(relatedRules("typo-3")).not.toBe(relatedRules("typo-3"));
    expect(relatedRules("nope-1")).toEqual([]);
    expect(relatedRules("sys-12")).toEqual([]);
  });
});
