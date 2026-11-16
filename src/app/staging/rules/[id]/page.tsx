// design-system: strict
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Inspector } from "@/components/rule/inspector";
import { rules } from "@/data/ui-logic";
import { ruleProse } from "@/lib/rule-prose";
import { stagingEnabled } from "@/lib/staging";

/** Only the 105 known ids, and none at all when staging is off: every other id is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return stagingEnabled() ? rules.map((rule) => ({ id: rule.id })) : [];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: rules.find((rule) => rule.id === id)?.title ?? "Rule" };
}

/**
 * CatalogApp in the layout draws the rule view. The page renders only this
 * rule's deep dive, built on the server, which the rule view seats while
 * this rule is shown. No other rule's prose reaches the page.
 */
export default async function StagingRulePage({ params }: { params: Promise<{ id: string }> }) {
  const prose = ruleProse((await params).id);
  if (!prose) notFound();
  return <Inspector ruleId={prose.id} prose={prose} />;
}
