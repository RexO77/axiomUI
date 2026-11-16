// design-system: strict
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { stagingEnabled } from "@/lib/staging";

export const metadata: Metadata = { title: "All rules" };

/*
 * Fail closed with a real status. Prerendered, this route kept status 200
 * when staging was off: a notFound() from the layout or this page renders the
 * not-found UI, but the static output records no 404 (measured, Next 16.2.9),
 * and the layout's alone still shipped the @wall payload. Rendered per
 * request, notFound() answers 404. The rule pages stay prerendered: their
 * params decide, and there are none when staging is off.
 */
export const dynamic = "force-dynamic";

/**
 * The wall is the @wall slot and CatalogApp owns the view, so the page slot
 * renders nothing. It repeats the layout's guard, as the slot does.
 */
export default function StagingGalleryPage() {
  if (!stagingEnabled()) notFound();
  return null;
}
