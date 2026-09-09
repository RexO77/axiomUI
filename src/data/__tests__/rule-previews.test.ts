import { describe, expect, it } from "vitest";

import { hasShowcase } from "@/components/features/rules/demos/registry";
import { getStaticRulePreview } from "@/components/features/rules/rule-preview";
import { rules } from "@/data/ui-logic";

describe("rule previews", () => {
  it("authors both comparison panes for every non-showcase rule", () => {
    for (const rule of rules.filter((candidate) => !hasShowcase(candidate.id))) {
      for (const variant of ["do", "dont"] as const) {
        expect(
          getStaticRulePreview(rule.id, variant, "sm"),
          `${rule.id}.${variant}`,
        ).not.toBeNull();
      }
    }
  });
});
