import { buildDeepDive } from "@/data/deep-dive-builder";
import { categories, rules, type Rule } from "@/data/ui-logic";
import { categoryNameById } from "@/lib/rule-text";
import { findListSection, findTextSection } from "@/lib/deep-dive-sections";
import { siteConfig } from "@/lib/site";

/**
 * Server-only corpus builder for /llms-full.txt and the generated agent skills.
 *
 * Deliberately NOT in `rule-text.ts`: that module is imported by
 * `copy-rule-button.tsx`, a client component, so anything it imports lands in
 * the client bundle. The authored prose in `deep-dives.ts` is ~60KB and is
 * loaded as an async chunk everywhere else (see the drawer's dynamic import) —
 * pulling it through `rule-text.ts` would ship it on first paint of every page.
 */

export type RuleMarkdownOptions = {
    /** Level of the rule's own heading; its four reasoning sections sit one level below. */
    headingLevel: 1 | 2 | 3;
    /** Add an `- ID:` line. Standalone rule files need it; the corpus heading already disambiguates. */
    includeId?: boolean;
};

/**
 * One rule as markdown, including its full deep-dive prose. Shared by
 * /llms-full.txt (H3, nested under a category H2) and the generated agent-skill
 * rule files (H1, one file per rule), so the two can never drift apart.
 */
export function ruleToMarkdown(rule: Rule, { headingLevel, includeId = false }: RuleMarkdownOptions): string {
    const categoryName = categoryNameById.get(rule.category) ?? "Axiom";
    const url = `${siteConfig.origin}/rules/${rule.id}`;
    const deepDive = buildDeepDive(rule);
    const heading = "#".repeat(headingLevel);
    const subheading = "#".repeat(headingLevel + 1);

    const meta = [
        ...(includeId ? [`- ID: ${rule.id}`] : []),
        `- Category: ${categoryName}`,
        `- Tags: ${rule.tags.join(", ")}`,
        `- URL: ${url}`,
    ];

    const blocks = [
        `${heading} ${rule.title}`,
        meta.join("\n"),
        rule.desc,
        [`- Do: ${rule.do}`, `- Don't: ${rule.dont}`].join("\n"),
    ];

    const whyItMatters = findTextSection(deepDive, "Why it matters");
    if (whyItMatters) {
        blocks.push(`${subheading} Why it works`, whyItMatters);
    }

    const riskWhenIgnored = findTextSection(deepDive, "Risk when ignored");
    if (riskWhenIgnored) {
        blocks.push(`${subheading} What breaks`, riskWhenIgnored);
    }

    const implementationNotes = findListSection(deepDive, "Implementation notes");
    if (implementationNotes.length > 0) {
        blocks.push(
            `${subheading} How to apply it`,
            implementationNotes.map((note, index) => `${index + 1}. ${note}`).join("\n")
        );
    }

    const reviewPrompts = findListSection(deepDive, "Design review prompts");
    if (reviewPrompts.length > 0) {
        blocks.push(
            `${subheading} Review questions`,
            reviewPrompts.map((prompt, index) => `${index + 1}. ${prompt}`).join("\n")
        );
    }

    return blocks.join("\n\n");
}

/** The authored review prompts for one rule, as the audit checklist uses them. */
export function ruleReviewQuestions(rule: Rule): string[] {
    return findListSection(buildDeepDive(rule), "Design review prompts");
}

/**
 * The whole corpus as markdown: H1 + intro + per-category H2s + every rule with
 * its Do/Don't pair AND its authored tutorial. This is what /llms.txt points at
 * when it promises "every rule as markdown".
 */
export function fullCorpusMarkdown(): string {
    const sections = categories.map((category) => {
        const categoryRules = rules.filter((rule) => rule.category === category.id);
        // H3 keeps exactly one H3 per rule, with its sections at H4.
        const body = categoryRules.map((rule) => ruleToMarkdown(rule, { headingLevel: 3 })).join("\n\n");
        return `## ${category.name}\n\n${body}`;
    });

    // Blocks are separated by the join — no `` spacer entries, or every gap
    // renders as three blank lines.
    return [
        `# Axiom`,
        `The decision engine behind sharp, consistent interfaces. ${rules.length} curated UI decisions across ${categories.length} categories. Each rule carries a Do/Don't pair, context tags, a canonical URL, and its full reasoning: why it works, what breaks without it, how to apply it, and what to ask in review.`,
        ...sections,
    ].join("\n\n");
}
