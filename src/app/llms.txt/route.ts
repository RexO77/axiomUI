import { categories, rules } from "@/data/ui-logic";
import { siteConfig } from "@/lib/site";
import { skillsCliCommand, skillsTreeUrl } from "@/lib/skills/catalog";

export const dynamic = "force-static";

export async function GET() {
    const origin = siteConfig.origin;

    const lines = [
        `# Axiom UI`,
        ``,
        `The decision engine behind sharp, consistent interfaces. Axiom UI is a reference-ready collection of ${rules.length} curated UI decisions — each with a Do/Don't pair, context tags, and specific values — structured as design axioms across ${categories.length} categories.`,
        ``,
        `## Docs`,
        ``,
        `- [Full ruleset](${origin}/llms-full.txt): every rule as markdown, with its full reasoning — why it works, what breaks, how to apply it, and review questions`,
        `- [Structured data](${origin}/rules.json): every rule as JSON`,
        ``,
        `## Agent skills`,
        ``,
        `- Install from GitHub: \`${skillsCliCommand}\` lets you choose skills and agents`,
        `- Install one skill: \`${skillsCliCommand} --skill axiomui\``,
        `- [Skill sources](${skillsTreeUrl}): the generated skills on GitHub`,
        `- [Single-file playbook](${origin}/skills/axiomui-website-upgrade/SKILL.md): the website upgrade playbook without local reference files`,
        ``,
        `## Categories`,
        ``,
        ...categories.flatMap((category) => [
            `### ${category.name}`,
            ``,
            ...rules
                .filter((rule) => rule.category === category.id)
                .map((rule) => `- [${rule.title}](${origin}/rules/${rule.id}): ${rule.desc}`),
            ``,
        ]),
    ];

    return new Response(lines.join("\n"), {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}
