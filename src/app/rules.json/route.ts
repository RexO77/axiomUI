import { categories, rules } from "@/data/ui-logic";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export async function GET() {
    const payload = {
        name: siteConfig.name,
        origin: siteConfig.origin,
        count: rules.length,
        categories: categories.map((category) => ({ id: category.id, name: category.name })),
        rules: rules.map((rule) => ({
            id: rule.id,
            category: rule.category,
            title: rule.title,
            desc: rule.desc,
            do: rule.do,
            dont: rule.dont,
            tags: rule.tags,
            url: `${siteConfig.origin}/rules/${rule.id}`,
        })),
    };

    return new Response(JSON.stringify(payload, null, 2), {
        headers: { "Content-Type": "application/json; charset=utf-8" },
    });
}
