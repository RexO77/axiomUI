import { describe, expect, it } from "vitest";
import { rules } from "@/data/ui-logic";
import { fullCorpusMarkdown } from "@/lib/rule-corpus";

describe("fullCorpusMarkdown", () => {
  const markdown = fullCorpusMarkdown();

  it("emits exactly one H3 per rule", () => {
    expect(markdown.match(/^### /gm)?.length).toBe(rules.length);
  });

  it("carries all four deep-dive sections for every rule", () => {
    for (const heading of [
      "Why it works",
      "What breaks",
      "How to apply it",
      "Review questions",
    ]) {
      const pattern = new RegExp(`^#### ${heading}$`, "gm");
      expect(markdown.match(pattern)?.length).toBe(rules.length);
    }
  });

  it("separates blocks by exactly one blank line", () => {
    expect(markdown).not.toContain("\n\n\n");
  });

  // The route is `force-static`, so the corpus must not vary between builds.
  // This asserts that property directly. It replaces an earlier regex for
  // `\d{4}-\d{2}-\d{2}T`, which was a proxy for "no build timestamp leaked in"
  // but could not tell one from a quoted example — and sys-4 is the rule about
  // timestamp formats, so its prose legitimately contains one.
  it("is deterministic, so the static output is stable", () => {
    expect(fullCorpusMarkdown()).toBe(markdown);
  });

  // A leaked build stamp would carry the *current* hour. Matching anything
  // looser than that cannot distinguish it from sys-4's quoted example, which
  // is authored content and must be allowed to contain an ISO string.
  it("embeds no clock-derived value", () => {
    const nowToTheHour = new Date().toISOString().slice(0, 13);
    expect(markdown).not.toContain(nowToTheHour);
  });
});
