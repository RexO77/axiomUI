import { buildDeepDive } from "@/data/deep-dive-builder";
import { categories, rules, type Rule } from "@/data/ui-logic";
import { categoryNameById } from "@/lib/rule-text";
import { findListSection, findTextSection } from "@/lib/deep-dive-sections";
import { siteConfig } from "@/lib/site";

/**
 * Server-only corpus builder for /llms-full.txt.
 *
 * Deliberately NOT in `rule-text.ts`: that module is imported by
 * `copy-rule-button.tsx`, a client component, so anything it imports lands in
 * the client bundle. The authored prose in `deep-dives.ts` is ~60KB and is
 * loaded as an async chunk everywhere else (see the drawer's dynamic import) —
 * pulling it through `rule-text.ts` would ship it on first paint of every page.
 */

/** One rule as a markdown section, including its full deep-dive prose. */
function ruleToFullMarkdown(rule: Rule): string {
    const categoryName = categoryNameById.get(rule.category) ?? "Axiom";
    const url = `${siteConfig.origin}/rules/${rule.id}`;
    const deepDive = buildDeepDive(rule);

    // Headings here are H4 so the corpus keeps exactly one H3 per rule.
    const blocks = [
        `### ${rule.title}`,
        [
            `- Category: ${categoryName}`,
            `- Tags: ${rule.tags.join(", ")}`,
            `- URL: ${url}`,
        ].join("\n"),
        rule.desc,
        [`- Do: ${rule.do}`, `- Don't: ${rule.dont}`].join("\n"),
    ];

    const whyItMatters = findTextSection(deepDive, "Why it matters");
    if (whyItMatters) {
        blocks.push(`#### Why it works`, whyItMatters);
    }

    const riskWhenIgnored = findTextSection(deepDive, "Risk when ignored");
    if (riskWhenIgnored) {
        blocks.push(`#### What breaks`, riskWhenIgnored);
    }

    const implementationNotes = findListSection(deepDive, "Implementation notes");
    if (implementationNotes.length > 0) {
        blocks.push(
            `#### How to apply it`,
            implementationNotes.map((note, index) => `${index + 1}. ${note}`).join("\n")
        );
    }

    const reviewPrompts = findListSection(deepDive, "Design review prompts");
    if (reviewPrompts.length > 0) {
        blocks.push(
            `#### Review questions`,
            reviewPrompts.map((prompt, index) => `${index + 1}. ${prompt}`).join("\n")
        );
    }

    return blocks.join("\n\n");
}

/**
 * The whole corpus as markdown: H1 + intro + per-category H2s + every rule with
 * its Do/Don't pair AND its authored tutorial. This is what /llms.txt points at
 * when it promises "every rule as markdown".
 */
export function fullCorpusMarkdown(): string {
    const sections = categories.map((category) => {
        const categoryRules = rules.filter((rule) => rule.category === category.id);
        const body = categoryRules.map(ruleToFullMarkdown).join("\n\n");
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
