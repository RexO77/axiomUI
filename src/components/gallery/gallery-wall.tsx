// design-system: strict

/*
 * The gallery wall: every rule as a live preview, in the seven rail
 * categories, under one toolbar. A server component. The tiles and their
 * previews are rendered here once and never by the client; the controller
 * around them owns the toolbar, the filter and the keys, and the gates inside
 * hide what a filter leaves out.
 *
 * Without script it is still the whole catalog: real links, one h1, seven
 * h2s, and sections whose ids are the bare category ids, so `/#forms` lands.
 * `#accessibility` lands on the collection entry at the end of the wall.
 *
 * Each tile is built once. The category sections and the collection sections
 * place the same elements, so a collection reorders tiles without a second
 * copy of any preview.
 */

import type { ReactNode } from "react";

import { accessibilityCollection, collections, railCategories, railOrder } from "@/data/taxonomy";
import { createRoutes } from "@/lib/navigation/routes";

import { CollectionSections } from "./collection-sections";
import { GalleryController } from "./gallery-controller";
import { Section } from "./section";
import { Tile } from "./tile";

export function GalleryWall({ base }: { base: string }) {
  const routes = createRoutes(base);
  const tiles = new Map<string, ReactNode>(railOrder.map((rule) => [rule.id, <Tile key={rule.id} rule={rule} href={routes.ruleHref(rule.id)} />]));
  const inCollections = new Set(collections.flatMap((item) => item.ruleIds));
  const collectionTiles = Object.fromEntries([...inCollections].map((id) => [id, tiles.get(id)]));
  const sections = railCategories.map((category) => ({
    id: category.id,
    short: category.short,
    ruleIds: category.rules.map((rule) => rule.id),
  }));
  const collection = accessibilityCollection;
  return (
    <GalleryController base={routes.base} total={railOrder.length} sections={sections}>
      <CollectionSections tiles={collectionTiles} />
      {railCategories.map((category) => (
        <Section key={category.id} category={category} tiles={tiles} />
      ))}
      <p id={collection.id} className="gw-collection">
        <span>
          Accessibility rules appear in every category.
        </span>
        <a href={routes.galleryHref({ collection: collection.id })} data-collection={collection.id}>
          Show {collection.ruleIds.length} accessibility rules
        </a>
      </p>
    </GalleryController>
  );
}
