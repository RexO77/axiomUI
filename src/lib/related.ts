import { relatedRuleIds } from "@/data/related-rules";
import { rules, type Rule } from "@/data/ui-logic";

const ruleById = new Map(rules.map((rule) => [rule.id, rule]));

/** Returns a fresh list so callers can reorder suggestions for their own view. */
export function relatedRules(id: string): Rule[] {
  if (!ruleById.has(id)) return [];
  return relatedRuleIds[id].map((relatedId) => ruleById.get(relatedId)!);
}
