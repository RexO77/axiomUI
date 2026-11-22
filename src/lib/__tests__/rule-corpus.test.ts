import { describe, expect, it } from "vitest";
import { rules } from "@/data/ui-logic";
import { fullCorpusMarkdown, markdownText, ruleReviewQuestions, ruleToMarkdown } from "@/lib/rule-corpus";

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
      "Before you ship",
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

describe("rule markdown", () => {
  it("gives standalone rule files the same complete reasoning as the full corpus", () => {
    const corpus = fullCorpusMarkdown();
    for (const rule of rules) {
      const markdown = ruleToMarkdown(rule, { headingLevel: 1, includeId: true });
      expect(markdown.startsWith(`# ${rule.title}\n`), rule.id).toBe(true);
      expect(markdown, rule.id).toContain(`- ID: ${rule.id}\n`);
      const asCorpusSection = markdown
        .replace(`\n- ID: ${rule.id}`, "")
        .replace(/^(#{1,2}) /gm, (_match, hashes: string) => `${hashes}## `);
      expect(corpus, rule.id).toContain(asCorpusSection);
    }
  });

  it("keeps reasoning nested below the rule heading at every supported level", () => {
    for (const headingLevel of [1, 2, 3] as const) {
      const markdown = ruleToMarkdown(rules[0], { headingLevel });
      expect(markdown.split("\n")[0]).toBe(`${"#".repeat(headingLevel)} ${rules[0].title}`);
      expect(markdown).not.toMatch(/^- ID:/m);
      const nestedHeadings = markdown.match(/^#+ /gm)?.slice(1);
      expect(nestedHeadings).toEqual(Array(4).fill(`${"#".repeat(headingLevel + 1)} `));
    }
  });

  it("exposes the authored review questions already included in every rule", () => {
    for (const rule of rules) {
      const questions = ruleReviewQuestions(rule);
      const markdown = ruleToMarkdown(rule, { headingLevel: 1 });
      expect(questions.length, rule.id).toBeGreaterThan(0);
      expect(markdown, rule.id).toContain(`## Before you ship\n\n${questions.map((question, index) => `${index + 1}. ${question}`).join("\n")}`);
    }
  });
});

describe("rule copy at the Markdown boundary", () => {
  it("keeps literal tags as code, so a renderer never swallows them", () => {
    expect(markdownText("Wrap just the name in <bdi> to keep the count")).toBe("Wrap just the name in `<bdi>` to keep the count");
    expect(markdownText('<a href="/invoices/1042">View invoice</a>')).toBe('`<a href="/invoices/1042">View invoice</a>`');
    expect(markdownText("<div onClick={() => router.push(…)}>")).toBe("`<div onClick={() => router.push(…)}>`");
    expect(markdownText("8px from label to input")).toBe("8px from label to input");
  });

  it("leaves no raw tag in any rule's description or Do/Don't", () => {
    const outsideCode = (text: string) => text.replace(/`[^`]*`/g, "");
    for (const rule of rules) {
      const markdown = ruleToMarkdown(rule, { headingLevel: 1 });
      for (const field of [rule.desc, rule.do, rule.dont]) {
        expect(markdown).toContain(markdownText(field));
        expect(outsideCode(markdownText(field)), rule.id).not.toMatch(/<\/?[A-Za-z][^<>]*>/);
      }
    }
  });
});
