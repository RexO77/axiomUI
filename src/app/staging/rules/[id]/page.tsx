// design-system: strict
import type { Metadata } from "next";

import { rules } from "@/data/ui-logic";
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

/** CatalogApp in the layout draws the rule view, so the page slot renders nothing. */
export default function StagingRulePage() {
  return null;
}
