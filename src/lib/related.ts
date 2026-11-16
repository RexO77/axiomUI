// Related rules for the rule view, scored by shared tags.
//
// A candidate must share at least one tag (the floor). A shared tag scores 3;
// shared title-and-summary words add 1 each, up to 4. One to three results,
// never padded, from other source categories. A rule with no cross-category
// tag (typo-12) takes its own category's instead, so the list is never empty.

import { rules, type Rule } from "@/data/ui-logic";

/**
 * The tie-break, fixed so Related never shifts when the rail is reordered:
 * the eight source categories in their original order, each in its learning
 * order, Accessibility last. It must not follow `railOrder` or the taxonomy:
 * ordering ties by rail order changes 9 of 105 results and starts surfacing
 * a11y-2 as a tie winner.
 */
export const RELATED_ORDER: readonly string[] = Object.freeze([
  "typo-5", "typo-9", "typo-11", "typo-6", "typo-1", "typo-2", "typo-3", "typo-4", "typo-8", "typo-7",
  "typo-10", "typo-12", "typo-13",
  "layout-1", "layout-2", "layout-3", "layout-4", "layout-5", "layout-6", "layout-7", "layout-8", "layout-9",
  "layout-10", "layout-11",
  "color-1", "color-2", "color-3", "color-4", "color-5", "color-6", "color-7", "color-8", "color-9", "color-10",
  "color-11", "color-12",
  "comp-1", "comp-2", "comp-3", "comp-4", "comp-5", "comp-6", "comp-7", "comp-8", "comp-9", "comp-10",
  "comp-11", "comp-12",
  "form-1", "form-2", "form-3", "form-4", "form-5", "form-6", "form-7", "form-8", "form-9", "form-10",
  "form-11", "form-12",
  "sys-2", "sys-1", "sys-7", "sys-4", "sys-9", "sys-10", "sys-6", "sys-5", "sys-11", "sys-3",
  "sys-8", "sys-13", "sys-14",
  "motion-3", "motion-1", "motion-2", "motion-17", "motion-16", "motion-6", "motion-5", "motion-4", "motion-8",
  "motion-11", "motion-25", "motion-29", "motion-9", "motion-10", "motion-7", "motion-27", "motion-24",
  "motion-26", "motion-28", "motion-14", "motion-12", "motion-13", "motion-15", "motion-21", "motion-22",
  "motion-18", "motion-19", "motion-20", "motion-23",
  "a11y-1", "a11y-2", "a11y-3",
]);

const TAG_WEIGHT = 3;
const WORD_CAP = 4;
const LIMIT = 3;

const STOP = new Set(
  "the a an and or of to in on for with is are be it its as at by not your you this that when from use than into over more less only one two".split(
    " ",
  ),
);

const ruleById = new Map(rules.map((rule) => [rule.id, rule]));
const words = new Map<string, Set<string>>();
const cache = new Map<string, readonly Rule[]>();

function fold(text: string): string {
  return text.toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
}

function wordsOf(rule: Rule): Set<string> {
  let set = words.get(rule.id);
  if (!set) {
    set = new Set(
      fold(`${rule.title} ${rule.desc}`)
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 3 && !STOP.has(word)),
    );
    words.set(rule.id, set);
  }
  return set;
}

function rank(rule: Rule, pool: readonly Rule[], order: ReadonlyMap<string, number>): Rule[] {
  const tags = new Set(rule.tags.map((tag) => tag.toLowerCase()));
  const own = wordsOf(rule);
  return pool
    .map((candidate) => {
      const shared = candidate.tags.filter((tag) => tags.has(tag.toLowerCase())).length;
      let overlap = 0;
      for (const word of wordsOf(candidate)) if (own.has(word)) overlap += 1;
      return { candidate, shared, score: shared * TAG_WEIGHT + Math.min(overlap, WORD_CAP) };
    })
    .filter((entry) => entry.shared > 0)
    .sort((a, b) => b.score - a.score || order.get(a.candidate.id)! - order.get(b.candidate.id)!)
    .slice(0, LIMIT)
    .map((entry) => entry.candidate);
}

/**
 * The scorer with an explicit tie-break order. Exported for the test that
 * shows why the order is frozen; product code calls `relatedRules`.
 */
export function relatedWithOrder(id: string, order: readonly string[]): Rule[] {
  const rule = ruleById.get(id);
  if (!rule) return [];
  const index = new Map(order.map((ruleId, at) => [ruleId, at]));
  const others = rank(rule, rules.filter((candidate) => candidate.category !== rule.category), index);
  if (others.length) return others;
  return rank(rule, rules.filter((candidate) => candidate.category === rule.category && candidate.id !== id), index);
}

/** One to three related rules, strongest first, ties in `RELATED_ORDER`. Unknown ids get none. */
export function relatedRules(id: string): Rule[] {
  if (!ruleById.has(id)) return [];
  let hit = cache.get(id);
  if (!hit) {
    hit = relatedWithOrder(id, RELATED_ORDER);
    cache.set(id, hit);
  }
  return [...hit];
}
