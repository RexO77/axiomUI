import { categories, rules, type Rule } from "@/data/ui-logic";
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

/** One rule as a markdown section (### heading, Do/Don't lines, tags, canonical URL). */
export function ruleToMarkdown(rule: Rule): string {
    const categoryName = categoryNameById.get(rule.category) ?? "Axiom";
    const url = `${siteConfig.origin}/rules/${rule.id}`;

    return [
        `### ${rule.title}`,
        ``,
        `- Category: ${categoryName}`,
        `- Tags: ${rule.tags.join(", ")}`,
        `- URL: ${url}`,
        ``,
        rule.desc,
        ``,
        `- Do: ${rule.do}`,
        `- Don't: ${rule.dont}`,
    ].join("\n");
}

/** The whole corpus: H1 + intro + per-category H2s + every rule via ruleToMarkdown. */
export function allRulesMarkdown(): string {
    const sections = categories.map((category) => {
        const categoryRules = rules.filter((rule) => rule.category === category.id);
        const body = categoryRules.map(ruleToMarkdown).join("\n\n");
        return `## ${category.name}\n\n${body}`;
    });

    return [
        `# Axiom`,
        ``,
        `The decision engine behind sharp, consistent interfaces. ${rules.length} curated UI decisions across ${categories.length} categories, each with a Do/Don't pair, context tags, and a canonical URL.`,
        ``,
        ...sections,
    ].join("\n\n");
}
