// design-system: strict
import type { Metadata } from "next";

/*
 * The homepage. Its title, description, social card and site-wide JSON-LD
 * come from the root layout; this sets its canonical URL.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** The wall is the @wall slot and CatalogApp owns the view, so the page slot renders nothing. */
export default function GalleryPage() {
  return null;
}
