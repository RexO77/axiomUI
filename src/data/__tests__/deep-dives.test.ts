import { describe, expect, it } from "vitest";
import { buildDeepDive } from "@/data/deep-dive-builder";
import { ruleDeepDives } from "@/data/deep-dives";
import { rules } from "@/data/ui-logic";

describe("deep dives", () => {
  it("every key is a real rule id", () => {
    const ruleIds = new Set(rules.map((rule) => rule.id));

    for (const key of Object.keys(ruleDeepDives)) {
      expect(ruleIds.has(key), `unknown deep-dive key: ${key}`).toBe(true);
    }
  });

  it("covers all rules", () => {
    for (const rule of rules) {
      expect(ruleDeepDives[rule.id], `missing deep dive: ${rule.id}`).toBeDefined();
    }
  });

  it("authored overrides have exactly 3 review prompts and 3-5 implementation notes", () => {
    for (const [id, dive] of Object.entries(ruleDeepDives)) {
      if (dive.reviewPrompts) {
        expect(dive.reviewPrompts.length, id).toBe(3);
      }

      if (dive.implementationNotes) {
        expect(dive.implementationNotes.length, id).toBeGreaterThanOrEqual(3);
        expect(dive.implementationNotes.length, id).toBeLessThanOrEqual(5);
      }
    }
  });

  it("buildDeepDive emits the exact section titles its consumers key on", () => {
    const sections = buildDeepDive(rules[0]);

    expect(sections.map((section) => section.title)).toEqual([
      "Summary",
      "Why it matters",
      "Risk when ignored",
      "Implementation notes",
      "Design review prompts",
      "Recommended",
      "Avoid",
    ]);
  });
});
