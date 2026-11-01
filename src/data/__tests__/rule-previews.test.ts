import { describe, expect, it } from "vitest";

import { hasShowcase } from "@/components/features/rules/demos/registry";
import { getStaticRulePreview } from "@/components/features/rules/rule-preview";
import { rules } from "@/data/ui-logic";

describe("rule previews", () => {
  // RulePreview has no generic fallback: a static rule without an authored
  // pane would render nothing beside its do/don't caption.
  it("authors both comparison panes for every non-showcase rule", () => {
    const missing: string[] = [];
    for (const rule of rules.filter((candidate) => !hasShowcase(candidate.id))) {
      for (const variant of ["do", "dont"] as const) {
        if (getStaticRulePreview(rule.id, variant) == null) missing.push(`${rule.id}.${variant}`);
      }
    }
    expect(missing, missing.join("\n")).toEqual([]);
  });

  it("keeps showcase rules out of the static modules", () => {
    const doubled = rules
      .filter((rule) => hasShowcase(rule.id))
      .filter((rule) => getStaticRulePreview(rule.id, "do") != null || getStaticRulePreview(rule.id, "dont") != null)
      .map((rule) => rule.id);
    expect(doubled, doubled.join("\n")).toEqual([]);
  });
});
