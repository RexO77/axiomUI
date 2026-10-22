import { describe, expect, it } from "vitest";

import { categories, rules } from "@/data/ui-logic";
import {
  categoriesWithoutSkill,
  findSkill,
  skillCatalog,
  skillDescription,
  skillGroupWords,
  skillRules,
} from "@/lib/skills/catalog";

const domainSkills = skillCatalog.filter((skill) => skill.group === "domain");

describe("skill catalog", () => {
  it("has exactly one domain skill per category, named axiomui-<category>", () => {
    expect(categoriesWithoutSkill).toEqual([]);
    expect(domainSkills.map((skill) => skill.name)).toEqual(
      categories.map((category) => `axiomui-${category.id}`)
    );
    for (const skill of domainSkills) {
      expect(skill.lead?.length, skill.name).toBeGreaterThan(0);
      expect(skill.summary.length, skill.name).toBeGreaterThan(0);
      expect(skill.description.length, skill.name).toBeGreaterThan(0);
    }
  });

  it("uses valid, unique, axiomui-prefixed names that no alias shadows", () => {
    const names = skillCatalog.map((skill) => skill.name);
    const aliases = skillCatalog.flatMap((skill) => skill.aliases);
    for (const name of names) {
      expect(name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(name.length).toBeLessThanOrEqual(64);
      expect(name.startsWith("axiomui")).toBe(true);
    }
    const everything = [...names, ...aliases, ...skillGroupWords];
    expect(new Set(everything).size).toBe(everything.length);
    for (const alias of aliases) {
      expect(alias).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  // The description is the trigger. Agents parse it as a YAML plain scalar and
  // show it in a capped listing, so these are format limits, not style.
  it("keeps every description a valid, listable YAML plain scalar", () => {
    for (const skill of skillCatalog) {
      const placeholders = skill.description.match(/\{\{\w+\}\}/g) ?? [];
      expect(placeholders.every((placeholder) => placeholder === "{{ruleCount}}"), skill.name).toBe(true);

      const description = skillDescription(skill);
      expect(description.length, skill.name).toBeGreaterThanOrEqual(1);
      expect(description.length, skill.name).toBeLessThanOrEqual(1024);
      expect(description.length, skill.name).toBeLessThan(1536);
      expect(description, skill.name).not.toMatch(/^(I|You) /);
      expect(description, skill.name).not.toMatch(/[<>]/);
      expect(description, skill.name).not.toContain(": ");
      expect(description, skill.name).not.toContain(" #");
      expect(description, skill.name).not.toMatch(/^[-?:,[\]{}#&*!|>'"%@`]/);
      expect(description, skill.name).not.toMatch(/\s$/);
    }
  });

  // Counts drift when rules move; only core descriptions may carry one, and
  // only through the {{ruleCount}} placeholder.
  it("puts no rule counts in domain descriptions", () => {
    for (const skill of domainSkills) {
      expect(skill.description, skill.name).not.toMatch(/\d+ rules/);
    }
  });

  it("keeps summaries short and in sentence case", () => {
    const properNouns = new Set(["Axiom"]);
    for (const skill of skillCatalog) {
      expect(skill.summary.length, skill.name).toBeLessThanOrEqual(100);
      for (const copy of [skill.title, skill.summary, skill.description, skill.lead ?? ""]) {
        expect(copy, skill.name).not.toMatch(/\bAxiom\b(?! UI)/);
      }
      expect(skill.summary, skill.name).toMatch(/^[A-Z]/);
      const laterCapitals = skill.summary
        .split(/\s+/)
        .slice(1)
        .filter((word) => /^[A-Z][a-z]/.test(word) && !properNouns.has(word.replace(/\W+$/, "")));
      expect(laterCapitals, skill.name).toEqual([]);
    }
  });

  it("cross-lists rules from other domains only, and only where a trigger covers them", () => {
    const crossListing = Object.fromEntries(
      domainSkills.filter((skill) => skill.crossListedRuleIds.length > 0).map((skill) => [skill.name, skill])
    );
    expect(Object.keys(crossListing).sort()).toEqual(["axiomui-accessibility", "axiomui-motion"]);
    for (const skill of Object.values(crossListing)) {
      expect(skill.crossListedNote, skill.name).toBeTruthy();
      for (const id of skill.crossListedRuleIds) {
        expect(rules.find((rule) => rule.id === id)?.category, `${skill.name} ${id}`).not.toBe(skill.categoryId);
      }
    }
    // The motion skill's trigger names transitions and will-change, so it must carry those rules.
    expect(findSkill("axiomui-motion")?.crossListedRuleIds).toEqual(["sys-13", "sys-14"]);
  });

  // Descriptions are triggers. The three core skills must point at each other
  // so "fix this page" and "review this page" each land on one of them.
  it("draws reciprocal boundaries between the core skills", () => {
    const trigger = (name: string) => skillDescription(findSkill(name)!);
    expect(trigger("axiomui")).toContain("use axiomui-website-upgrade");
    expect(trigger("axiomui")).toContain("use axiomui-audit");
    expect(trigger("axiomui-website-upgrade")).toContain("use axiomui-audit");
    expect(trigger("axiomui-website-upgrade").replaceAll("axiomui-audit", "")).not.toMatch(/audit/i);
    expect(trigger("axiomui-audit")).toContain("use axiomui-website-upgrade");
    expect(trigger("axiomui-system")).not.toMatch(/transition|will-change|keyboard|target/i);
  });

  it("gives every rule exactly one home domain skill, and every core skill all rules", () => {
    for (const rule of rules) {
      const homes = domainSkills.filter((skill) => skill.homeRuleIds.includes(rule.id));
      expect(homes.map((skill) => skill.name), rule.id).toEqual([`axiomui-${rule.category}`]);
    }
    for (const skill of skillCatalog.filter((skill) => skill.group === "core")) {
      expect(skillRules(skill).length, skill.name).toBe(rules.length);
    }
  });
});
