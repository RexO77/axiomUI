// design-system: strict
import type { Viewport } from "next";
import type { ReactNode } from "react";

import { CatalogApp } from "@/components/catalog-app";
// A direct rule prefetches the wall; sharing its stylesheet keeps that warm fetch from issuing an unused CSS preload.
import "@/components/gallery/gallery.css";
import { CATALOG_BASE } from "@/lib/navigation/routes";

/*
 * The catalog at the site root. CatalogApp owns the location, the wall and
 * the rule view; the wall arrives as the @wall slot, which only the gallery
 * URL fills on the server. The root layout's first-paint script has already
 * set the shell's attributes on <html>.
 */

export const viewport: Viewport = { viewportFit: "cover" };

export default function CatalogLayout({ children, wall }: Readonly<{ children: ReactNode; wall: ReactNode }>) {
  return (
    <CatalogApp basePath={CATALOG_BASE} wall={wall}>
      {children}
    </CatalogApp>
  );
}
