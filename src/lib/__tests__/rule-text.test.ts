import { describe, expect, it } from "vitest";
import { rules } from "@/data/ui-logic";
import { allRulesMarkdown, ruleToText } from "@/lib/rule-text";

describe("rule-text serializers", () => {
  it("ruleToText matches the frozen clipboard format", () => {
    const rule = rules.find((candidate) => candidate.id === "typo-1");

    expect(rule).toBeDefined();
    expect(ruleToText(rule!, "https://example.com")).toBe(
      [
        "Sentence Case Is King (Typography & Text)",
        "Never use Title Case for buttons, labels, or headers. It slows down reading speed by disrupting word shapes.",
        "",
        "Do: Create new account",
        "Don't: Create New Account",
        "",
        "https://example.com/rules/typo-1",
      ].join("\n"),
    );
  });

  it("allRulesMarkdown has one H3 per rule and no timestamps", () => {
    const markdown = allRulesMarkdown();

    expect(markdown.match(/^### /gm)?.length).toBe(rules.length);
    expect(markdown).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
  });
});
