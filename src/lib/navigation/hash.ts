import { collections, railCategoryIds, railRank, type RailCategoryId } from "@/data/taxonomy";
import { resolveRuleId } from "@/data/ui-logic";

/*
 * What a wall URL's fragment points at. The wall's sections carry the bare
 * category ids, so `/#typography` works natively, without script. With
 * script, CatalogApp runs every hash through here on load, on hashchange and
 * on popstate, so the older and indirect forms land as well:
 *
 *   #typography, #motion       a rail section
 *   #gw-forms                  the earlier gallery's section ids
 *   #rule-typo-1, #gw-rule-…   a tile (aliases resolve to their rule)
 *   #accessibility             the Accessibility collection: it is a source
 *                              category with no section of its own, so it
 *                              opens as ?collection=accessibility
 *
 * Anything else resolves to null and is left to the browser.
 */

export type HashTarget =
  | { kind: "section"; id: RailCategoryId }
  | { kind: "tile"; id: string }
  | { kind: "collection"; id: string };

const sectionIds: ReadonlySet<string> = new Set(railCategoryIds);
const collectionIds: ReadonlySet<string> = new Set(collections.map((collection) => collection.id));

/** The fragment without its `#`, percent-decoded. A malformed escape reads as empty. */
export function readFragment(hash: string): string {
  const raw = hash.replace(/^#/, "");
  try {
    return decodeURIComponent(raw);
  } catch {
    return "";
  }
}

export function resolveHash(hash: string): HashTarget | null {
  const fragment = readFragment(hash).replace(/^gw-/, "");
  if (!fragment) return null;
  if (fragment.startsWith("rule-")) {
    const id = resolveRuleId(fragment.slice("rule-".length));
    return id && railRank(id) >= 0 ? { kind: "tile", id } : null;
  }
  if (sectionIds.has(fragment)) return { kind: "section", id: fragment as RailCategoryId };
  if (collectionIds.has(fragment)) return { kind: "collection", id: fragment };
  return null;
}
