// design-system: strict
"use client";

/*
 * What the wall reads from the catalog app and asks of it. The wall is
 * server-rendered into its own slot, so it cannot take props from the app
 * that owns the location; CatalogApp provides this around it instead.
 *
 * `visible` is the wall's deck as a set (null: every rule). Gates, sections,
 * the count and J/K all read it, so the wall shows exactly the deck the rule
 * view pages, in the same order.
 */

import { createContext, useContext } from "react";

import { collections, type Collection } from "@/data/taxonomy";
import type { GallerySide } from "@/lib/navigation/routes";

export type WallFilter = { q?: string; collection?: string | null; show?: GallerySide };

export type WallApi = {
  q: string;
  collection: string | null;
  show: GallerySide;
  visible: ReadonlySet<string> | null;
  /** Replace the wall's entry with this filter applied. Ignored while a rule is open. */
  setFilter: (patch: WallFilter) => void;
  /**
   * The same, once the wall is showing: a filter chosen on a rule waits for
   * the exit to land. The catalog holds it, so it survives whatever asked for
   * it (the phone menu) unmounting meanwhile.
   */
  queueFilter: (patch: WallFilter) => void;
};

const noop = () => {};

/** Outside CatalogApp (a test render, a stray mount): the whole catalog, filters ignored. */
export const wallDefaults: WallApi = Object.freeze({ q: "", collection: null, show: "do", visible: null, setFilter: noop, queueFilter: noop });

export const WallContext = createContext<WallApi>(wallDefaults);

export function useWall(): WallApi {
  return useContext(WallContext);
}

/**
 * The collection the wall lays out in its own groups, or null. A collection
 * deck pages in group order, not rail order, so while one is on the wall
 * shows its groups as the sections instead of the rail categories. A
 * non-blank query wins over the collection, as it does for the deck.
 */
export function shownCollection({ q, collection }: Pick<WallApi, "q" | "collection">): Collection | null {
  if (!collection || q.trim()) return null;
  return collections.find((item) => item.id === collection) ?? null;
}

/** A collection group's section id: `accessibility-1`, never a bare category id. */
export const groupSectionId = (collection: Collection, index: number) => `${collection.id}-${index + 1}`;
