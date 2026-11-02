// design-system: strict
import { categories, rules, type Rule } from "@/data/ui-logic";

/**
 * Fold typographic quotes on both sides of the match: a smart-punctuation
 * keyboard and the catalog’s quoted UI copy must find the same rules as ASCII.
 */
function fold(text: string): string {
    return text.toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
}

function matches(rule: Rule, needle: string): boolean {
    return (
        fold(rule.title).includes(needle) ||
        fold(rule.desc).includes(needle) ||
        fold(rule.do).includes(needle) ||
        fold(rule.dont).includes(needle) ||
        rule.id === needle ||
        rule.tags.some((tag) => fold(tag).includes(needle))
    );
}

/** The rules a search query keeps, in catalog order. A blank query keeps every rule. */
export function filterRules(query: string): Rule[] {
    const needle = fold(query.trim());
    if (!needle) {
        return rules;
    }
    return rules.filter((rule) => matches(rule, needle));
}

/** Matching rules per category id. Every category is present, so an empty one reads as 0. */
export function countByCategory(query: string): Map<string, number> {
    const counts = new Map(categories.map((category) => [category.id, 0]));
    for (const rule of filterRules(query)) {
        counts.set(rule.category, (counts.get(rule.category) ?? 0) + 1);
    }
    return counts;
}
