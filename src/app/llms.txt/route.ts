import { categories, rules } from "@/data/ui-logic";
import { siteConfig } from "@/lib/site";
import { skillsCliCommand, skillsTreeUrl } from "@/lib/skills/catalog";

export const dynamic = "force-static";

export async function GET() {
    const origin = siteConfig.origin;

    const lines = [
        `# Axiom UI`,
        ``,
        `An index of ${rules.length} Axiom UI design rules in ${categories.length} source categories. Each entry links to a rule and summarizes it.`,
        ``,
        `## Docs`,
        ``,
        `- [Full rule catalog](${origin}/llms-full.txt): every rule in Markdown, with examples, implementation notes and review questions`,
        `- [Structured data](${origin}/rules.json): every rule as JSON`,
        ``,
        `## Agent skills`,
        ``,
        `- Install from GitHub: \`${skillsCliCommand}\` lets you choose skills and agents`,
        `- Install one skill: \`${skillsCliCommand} --skill axiomui\``,
        `- [Skill sources](${skillsTreeUrl}): the generated skills on GitHub`,
        `- [Website upgrade playbook](${origin}/skills/axiomui-website-upgrade/SKILL.md): the skill in one file, without local references`,
        ``,
        `## Source categories`,
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
