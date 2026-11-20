import { describe, expect, it } from "vitest";

import { buildDeepDive } from "@/data/deep-dive-builder";
import { ruleDeepDives } from "@/data/deep-dives";
import { ruleSources } from "@/data/rule-sources";
import { rules } from "@/data/ui-logic";
import { findListSection, findTextSection } from "@/lib/deep-dive-sections";
import { ruleProse } from "@/lib/rule-prose-build";
import { PROSE_HEADINGS } from "@/lib/rule-prose-types";

/*
 * The server-only prose payload. The test imports the pure
 * builder, never `rule-prose.ts`, so it never resolves `server-only`.
 */

const byId = new Map(rules.map((rule) => [rule.id, rule]));

/** Every sentence of a rule's authored prose that is long enough to be its own, not a shared category default. */
function ownSentences(id: string): string[] {
  const authored = ruleDeepDives[id];
  if (!authored) return [];
  return [authored.whyItMatters, authored.riskWhenIgnored, ...(authored.implementationNotes ?? []), ...(authored.reviewPrompts ?? [])].filter(
    (text): text is string => typeof text === "string" && text.length > 40,
  );
}

describe("ruleProse", () => {
  it("gives typo-1 the four sections, exactly as the builder writes them", () => {
    const prose = ruleProse("typo-1")!;
    const sections = buildDeepDive(byId.get("typo-1")!);
    expect(prose).toEqual({
      id: "typo-1",
      how: findListSection(sections, "Implementation notes"),
      why: findTextSection(sections, "Why it matters"),
      sources: [{ title: "Microsoft Writing Style Guide · Capitalization", href: "https://learn.microsoft.com/en-us/style-guide/capitalization" }],
      breaks: findTextSection(sections, "Risk when ignored"),
      review: findListSection(sections, "Design review prompts"),
    });
    expect(prose.how.length).toBeGreaterThan(0);
    expect(prose.why).not.toBe("");
    expect(prose.breaks).not.toBe("");
    expect(prose.review.length).toBeGreaterThan(0);
    expect(Object.keys(PROSE_HEADINGS)).toEqual(["how", "why", "breaks", "review"]);
  });

  it("carries no other rule's prose", () => {
    const text = JSON.stringify(ruleProse("typo-1"));
    const leaks = rules
      .filter((rule) => rule.id !== "typo-1")
      .flatMap((rule) => ownSentences(rule.id).filter((sentence) => text.includes(sentence)).map((sentence) => `${rule.id}: ${sentence.slice(0, 60)}`));
    expect(leaks).toEqual([]);
  });

  it("gives every rule four filled sections under its own id", () => {
    for (const rule of rules) {
      const prose = ruleProse(rule.id)!;
      expect(prose.id, rule.id).toBe(rule.id);
      expect(prose.how.length && prose.review.length && prose.why && prose.breaks, rule.id).toBeTruthy();
    }
  });

  it("has no prose for an id that is not a rule, or for an alias", () => {
    expect(ruleProse("nope-0")).toBeNull();
    expect(ruleProse("sys-12")).toBeNull();
    expect(ruleProse("__proto__")).toBeNull();
  });

  it("serves one to three distinct, named HTTPS sources for every canonical rule", () => {
    expect(Object.keys(ruleSources).sort()).toEqual(rules.map((rule) => rule.id).sort());
    for (const rule of rules) {
      const sources = ruleProse(rule.id)?.sources ?? [];
      expect(sources.length, rule.id).toBeGreaterThanOrEqual(1);
      expect(sources.length, rule.id).toBeLessThanOrEqual(3);
      expect(new Set(sources.map(({ href }) => href)).size, rule.id).toBe(sources.length);
      for (const { title, href } of sources) {
        expect(title.trim(), rule.id).toMatch(/\S/);
        expect(new URL(href).protocol, rule.id).toBe("https:");
      }
    }
  });

  it("is small enough to ship one rule at a time", () => {
    const sizes = rules.map((rule) => JSON.stringify(ruleProse(rule.id)).length);
    expect(Math.max(...sizes)).toBeLessThan(4000);
  });
});
