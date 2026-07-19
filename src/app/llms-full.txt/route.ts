import { allRulesMarkdown } from "@/lib/rule-text";

export const dynamic = "force-static";

export async function GET() {
    return new Response(allRulesMarkdown(), {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}
