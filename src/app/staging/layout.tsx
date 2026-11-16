// design-system: strict
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { CatalogApp } from "@/components/catalog-app";
import { bootScript } from "@/components/shell/boot-script";
import { STAGING_BASE, stagingEnabled } from "@/lib/staging";

/*
 * The catalog mounted under /staging. It fails
 * closed: unless staging is enabled for this build, the layout calls
 * notFound() before anything renders, so the status is a real 404. It is
 * never indexed and never listed in the sitemap.
 */

export const metadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export const viewport: Viewport = { viewportFit: "cover" };

export default function StagingLayout({ children, wall }: Readonly<{ children: ReactNode; wall: ReactNode }>) {
  if (!stagingEnabled()) notFound();
  return (
    <>
      {/* Before first paint: the rail, deep-dive and reduced-motion attributes on <html>. */}
      <script dangerouslySetInnerHTML={{ __html: bootScript() }} />
      <CatalogApp basePath={STAGING_BASE} wall={wall}>
        {children}
      </CatalogApp>
    </>
  );
}
