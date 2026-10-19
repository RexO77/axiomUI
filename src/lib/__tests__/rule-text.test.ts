import { describe, expect, it } from "vitest";
import { rules } from "@/data/ui-logic";
import { ruleToText } from "@/lib/rule-text";

describe("rule-text serializers", () => {
  it("ruleToText matches the frozen clipboard format", () => {
    const rule = rules.find((candidate) => candidate.id === "typo-1");

    expect(rule).toBeDefined();
    expect(ruleToText(rule!, "https://example.com")).toBe(
      [
        "Sentence case is king (Typography & text)",
        "Capitalize only the first word and proper nouns. Sentence case reads as plain speech, removes the per-word capitalization debate, and keeps proper nouns standing out.",
        "",
        "Do: Invite your team / Skip for now",
        "Don't: Invite Your Team / Skip For Now",
        "",
        "https://example.com/rules/typo-1",
      ].join("\n"),
    );
  });
});
