import { buildDeepDive } from "@/data/deep-dive-builder";
import { ruleSources } from "@/data/rule-sources";
import { rules } from "@/data/ui-logic";
import { findListSection, findTextSection } from "@/lib/deep-dive-sections";
import type { RuleProse } from "@/lib/rule-prose-types";

/*
 * The pure builder behind `rule-prose.ts`. It reads the whole
 * deep-dive corpus, so only two modules may import it: `rule-prose.ts`, which
 * marks it server-only, and its unit test. Client code imports the type from
 * `rule-prose-types.ts`; `client-graph.test.ts` fails on either module.
 */

const ruleById = new Map(rules.map((rule) => [rule.id, rule]));

/** One rule's prose, and nothing of any other rule's. Null for an id that is not a rule (aliases included). */
export function ruleProse(id: string): RuleProse | null {
  const rule = ruleById.get(id);
  if (!rule) return null;
  const sections = buildDeepDive(rule);
  return {
    id: rule.id,
    how: findListSection(sections, "Implementation notes"),
    why: findTextSection(sections, "Why it matters") ?? "",
    sources: ruleSources[rule.id],
    breaks: findTextSection(sections, "Risk when ignored") ?? "",
    review: findListSection(sections, "Design review prompts"),
  };
}
