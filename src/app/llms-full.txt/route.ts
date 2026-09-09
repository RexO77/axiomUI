import { fullCorpusMarkdown } from "@/lib/rule-corpus";

export const dynamic = "force-static";

export async function GET() {
    return new Response(fullCorpusMarkdown(), {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}
