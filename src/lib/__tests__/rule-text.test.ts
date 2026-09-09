import { describe, expect, it } from "vitest";
import { rules } from "@/data/ui-logic";
import { ruleToText } from "@/lib/rule-text";

describe("rule-text serializers", () => {
  it("ruleToText matches the frozen clipboard format", () => {
    const rule = rules.find((candidate) => candidate.id === "typo-1");

    expect(rule).toBeDefined();
    expect(ruleToText(rule!, "https://example.com")).toBe(
      [
        "Sentence case is king (Typography & Text)",
        "Never use Title Case for buttons, labels, or headers. It slows down reading speed by disrupting word shapes.",
        "",
        "Do: Create new account",
        "Don't: Create New Account",
        "",
        "https://example.com/rules/typo-1",
      ].join("\n"),
    );
  });
});
