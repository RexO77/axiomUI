import { categories, type Rule } from "@/data/ui-logic";
import { siteConfig } from "@/lib/site";

export const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

/** One rule as plain text. `origin` param: client callers pass window.location.origin. */
export function ruleToText(rule: Rule, origin: string = siteConfig.origin): string {
    const url = `${origin}/rules/${rule.id}`;
    const categoryName = categoryNameById.get(rule.category) ?? "Axiom";

    return [
        `${rule.title} (${categoryName})`,
        rule.desc,
        ``,
        `Do: ${rule.do}`,
        `Don't: ${rule.dont}`,
        ``,
        url,
    ].join("\n");
}
