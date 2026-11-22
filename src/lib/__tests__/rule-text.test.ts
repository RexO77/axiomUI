import { describe, expect, it } from "vitest";
import { rules } from "@/data/ui-logic";
import { ruleToText } from "@/lib/rule-text";

describe("rule-text serializers", () => {
  it("ruleToText matches the frozen clipboard format", () => {
    const rule = rules.find((candidate) => candidate.id === "typo-1");

    expect(rule).toBeDefined();
    expect(ruleToText(rule!, "https://example.com")).toBe(
      [
        "Use sentence case for English UI labels (Typography & text)",
        "Use sentence case for ordinary English labels and headings. Keep the spelling of names and acronyms intact, including title case in official titles. Follow the casing conventions of each translation.",
        "",
        "Do: Invite your team / Skip for now",
        "Don’t: Invite Your Team / Skip For Now",
        "",
        "https://example.com/rules/typo-1",
      ].join("\n"),
    );
  });
});
