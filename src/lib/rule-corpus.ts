import { ruleSources } from "@/data/rule-sources";
import { buildDeepDive } from "@/data/deep-dive-builder";
import { categories, rules, type Rule } from "@/data/ui-logic";
import { categoryNameById } from "@/lib/rule-text";
import { findListSection, findTextSection } from "@/lib/deep-dive-sections";
import { siteConfig } from "@/lib/site";

/**
 * Server-only corpus builder for /llms-full.txt and the generated agent skills.
 *
 * Deliberately NOT in `rule-text.ts`: that module is imported by the rule
 * view's copy menu, a client component, so anything it imports lands in the
 * client bundle. The authored prose in `deep-dives.ts` is ~60KB and reaches the
 * client one rule at a time, from /deep-dives/<id> — pulling it through
 * `rule-text.ts` would ship all of it on first paint of every page.
 */

export type RuleMarkdownOptions = {
    /** Level of the rule's own heading; its four reasoning sections sit one level below. */
    headingLevel: 1 | 2 | 3;
    /** Add an `- ID:` line. Standalone rule files need it; the corpus heading already disambiguates. */
    includeId?: boolean;
};

const TAG = /<\/?[A-Za-z][^<>]*>/;
const codeSpan = (text: string) => (text.includes("`") ? `\`\` ${text} \`\`` : `\`${text}\``);

/**
 * Rule copy (a title, description or Do/Don't) as Markdown text. An HTML tag
 * in it is code, never markup a renderer would swallow: "in <bdi>" keeps its
 * tag name. A value that is all markup becomes one code span. The data keeps
 * the plain text; this is only the Markdown boundary.
 */
export function markdownText(text: string): string {
    if (!TAG.test(text)) return text;
    if (/^\s*</.test(text) && />\s*$/.test(text)) return codeSpan(text.trim());
    return text.replace(new RegExp(TAG.source, "g"), codeSpan);
}

/**
 * One rule as markdown, including its full deep-dive prose. Shared by
 * /llms-full.txt (H3, nested under a category H2) and the generated agent-skill
 * rule files (H1, one file per rule), so the two can never drift apart.
 */
export function ruleToMarkdown(rule: Rule, { headingLevel, includeId = false }: RuleMarkdownOptions): string {
    const categoryName = categoryNameById.get(rule.category) ?? "Axiom UI";
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
        markdownText(rule.desc),
        [`- Do: ${markdownText(rule.do)}`, `- Don’t: ${markdownText(rule.dont)}`].join("\n"),
    ];

    const whyItMatters = findTextSection(deepDive, "Why it matters");
    if (whyItMatters) {
        blocks.push(`${subheading} Why it works`, whyItMatters);
        const sources = ruleSources[rule.id];
        if (sources?.length) {
            blocks.push(sources.map(({ title, href }) => `- [${title}](${href})`).join("\n"));
        }
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
            `${subheading} Before you ship`,
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
        `# Axiom UI`,
        `${rules.length} UI design rules in ${categories.length} source categories. Each rule includes Do and Don’t examples, tags, a link and a deep dive.`,
        ...sections,
    ].join("\n\n");
}
