import { categories, rules, type Rule } from "@/data/ui-logic";

function normalize(query: string): string {
    return query.trim().toLowerCase();
}

function matches(rule: Rule, needle: string): boolean {
    return (
        rule.title.toLowerCase().includes(needle) ||
        rule.desc.toLowerCase().includes(needle) ||
        rule.do.toLowerCase().includes(needle) ||
        rule.dont.toLowerCase().includes(needle) ||
        rule.id === needle ||
        rule.tags.some((tag) => tag.toLowerCase().includes(needle))
    );
}

/** The rules a search query keeps, in catalog order. A blank query keeps every rule. */
export function filterRules(query: string): Rule[] {
    const needle = normalize(query);
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
