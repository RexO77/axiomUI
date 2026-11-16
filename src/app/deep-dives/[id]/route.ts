import { rules } from "@/data/ui-logic";
import { ruleProse } from "@/lib/rule-prose";
import { stagingEnabled } from "@/lib/staging";

/*
 * One rule's deep dive as static JSON: `{ id, how, why,
 * breaks, review }`, about 1.3 KB, one file per rule, so a paged-to rule
 * never ships another rule's prose.
 *
 * It fails closed with the staging catalog: when staging is off for
 * this build there are no params and no files, and the handler answers 404 by
 * itself, because a layout's notFound() does not cover a route handler.
 * The guard can be removed when the catalog moves to the site root.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return stagingEnabled() ? rules.map((rule) => ({ id: rule.id })) : [];
}

const notFound = () => Response.json({ error: "Not found" }, { status: 404 });

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!stagingEnabled()) return notFound();
  const prose = ruleProse((await params).id);
  return prose ? Response.json(prose) : notFound();
}
