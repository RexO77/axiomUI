import { describe, expect, it } from "vitest";
import { relatedRuleIds } from "@/data/related-rules";
import { rules } from "@/data/ui-logic";
import { relatedRules } from "@/lib/related";

const top = (id: string) => relatedRules(id).map((rule) => rule.id);

describe("related rules", () => {
  it("covers the full catalog with distinct, navigable destinations in editorial order", () => {
    const known = new Set(rules.map((rule) => rule.id));
    expect(Object.keys(relatedRuleIds).sort()).toEqual([...known].sort());
    for (const [id, destinations] of Object.entries(relatedRuleIds)) {
      expect(destinations.length, id).toBeGreaterThanOrEqual(1);
      expect(destinations.length, id).toBeLessThanOrEqual(3);
      expect(new Set(destinations).size, id).toBe(destinations.length);
      expect(destinations, id).not.toContain(id);
      for (const destination of destinations) {
        expect(known.has(destination), `${id} → ${destination}`).toBe(true);
      }
      expect(top(id), id).toEqual(destinations);
    }
  });

  it("pairs decisions with the next useful design question", () => {
    // A reader choosing body leading can check line length and font size.
    expect(top("typo-3").slice(0, 2)).toEqual(["layout-2", "typo-11"]);
    // Confirmation and recovery are alternative safeguards for the same loss.
    expect(top("comp-2")[0]).toBe("sys-6");
    expect(top("sys-6")[0]).toBe("comp-2");
    // The group’s selection model determines which controls to compare next.
    expect(top("form-5").slice(0, 2)).toEqual(["form-6", "form-7"]);
  });

  it("keeps incidental word overlap from making unrelated recommendations", () => {
    // Text-driven ranking previously paired two kinds of “role”, and two
    // unrelated rules about “choices”. Neither pair helps with the task.
    expect(top("typo-5")).not.toContain("layout-11");
    expect(top("layout-11")).not.toContain("typo-5");
    expect(top("form-5")).not.toContain("sys-4");
    expect(top("motion-4")).not.toContain("comp-3");
    expect(top("motion-7")).not.toContain("form-8");
  });

  it("returns a fresh array and handles retired and unknown IDs", () => {
    expect(relatedRules("typo-3")).not.toBe(relatedRules("typo-3"));
    expect(relatedRules("sys-12")).toEqual([]);
    expect(relatedRules("nope-1")).toEqual([]);
    expect(relatedRules("toString")).toEqual([]);
  });
});
