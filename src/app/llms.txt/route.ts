import { categories, rules } from "@/data/ui-logic";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export async function GET() {
    const origin = siteConfig.origin;

    const lines = [
        `# Axiom`,
        ``,
        `The decision engine behind sharp, consistent interfaces. Axiom is a reference-ready collection of ${rules.length} curated UI decisions — each with a Do/Don't pair, context tags, and specific values — structured as design axioms across ${categories.length} categories.`,
        ``,
        `## Docs`,
        ``,
        `- [Full ruleset](${origin}/llms-full.txt): every rule as markdown, with its full reasoning — why it works, what breaks, how to apply it, and review questions`,
        `- [Structured data](${origin}/rules.json): every rule as JSON`,
        ``,
        `## Categories`,
        ``,
        ...categories.map((category) => `- [${category.name}](${origin}/#${category.id})`),
    ];

    return new Response(lines.join("\n"), {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}
