import { rules } from "@/data/ui-logic";
import { ruleProse } from "@/lib/rule-prose";

/*
 * One rule's deep dive as static JSON: `{ id, how, why, breaks, review }`,
 * about 1.3 KB, one file per rule. The rule view fetches it when the reader
 * pages to a rule the document did not ship with, so no page carries another
 * rule's prose. Every id is prerendered; any other path is a 404.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return rules.map((rule) => ({ id: rule.id }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const prose = ruleProse((await params).id);
  return prose ? Response.json(prose) : Response.json({ error: "Not found" }, { status: 404 });
}
