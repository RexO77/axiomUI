import {
  collections,
  railCategories,
  railCategoryOf,
  railOrder,
  railRank,
  type RailCategoryId,
} from "@/data/taxonomy";
import type { Rule } from "@/data/ui-logic";
import { searchRules } from "@/lib/rule-search";

/**
 * The ordered list a reader pages through: J/K, the pager, "n of N", the
 * strip and Shift+J/K all read it. Its order is always the wall's order.
 * Only the palette keeps relevance order, for its own list.
 */
export type Deck = {
  kind: "catalog" | "search" | "collection";
  rules: readonly Rule[];
  /** The normalised query of a search deck. */
  q?: string;
  /** The collection id of a collection deck. */
  collection?: string;
};
export type Direction = -1 | 1;

export const catalogDeck: Deck = Object.freeze({ kind: "catalog", rules: railOrder });

/** Trim and collapse whitespace: the deck cache key, and the query a deck reports. */
export function normaliseQuery(q: string): string {
  return q.trim().replace(/\s+/g, " ");
}

const DECK_CACHE_LIMIT = 64;
const searchDecks = new Map<string, Deck>();
const collectionDecks = new Map<string, Deck>();

/**
 * The search hits in wall order (rail order), memoised by the normalised
 * query. A blank query is no search: the catalog deck, as `deckFor` gives. A
 * query with no matches is an empty deck, never the catalog: the wall shows
 * its empty state, and a rule view resolves through `resolveEntryDeck`.
 */
export function searchDeck(q: string): Deck {
  const key = normaliseQuery(q);
  if (!key) return catalogDeck;
  const cached = searchDecks.get(key);
  if (cached) return cached;
  const hits = searchRules(key).map((hit) => hit.rule);
  const rules = [...new Map(hits.map((rule) => [rule.id, rule])).values()]
    .sort((a, b) => railRank(a.id) - railRank(b.id));
  const deck: Deck = Object.freeze({ kind: "search", rules: Object.freeze(rules), q: key });
  if (searchDecks.size >= DECK_CACHE_LIMIT) searchDecks.clear();
  searchDecks.set(key, deck);
  return deck;
}

/** A collection in its own reading order (its wall groups). Unknown ids are an empty deck. */
export function collectionDeck(id: string): Deck {
  const cached = collectionDecks.get(id);
  if (cached) return cached;
  const data = collections.find((item) => item.id === id);
  const byId = new Map(railOrder.map((rule) => [rule.id, rule]));
  const rules = data?.ruleIds.flatMap((ruleId) => byId.get(ruleId) ?? []) ?? [];
  const deck: Deck = Object.freeze({ kind: "collection", collection: id, rules: Object.freeze(rules) });
  if (collectionDecks.size >= DECK_CACHE_LIMIT) collectionDecks.clear();
  collectionDecks.set(id, deck);
  return deck;
}

/** The wall's deck for a location: a non-blank `?q` wins, then `?collection`, then the catalog. */
export function deckFor({ q = "", collection = null }: { q?: string; collection?: string | null }): Deck {
  if (normaliseQuery(q)) return searchDeck(q);
  if (collection) return collectionDeck(collection);
  return catalogDeck;
}

export function deckHas(deck: Deck, id: string): boolean {
  return deck.rules.some((rule) => rule.id === id);
}

export function deckContaining(deck: Deck, id: string): Deck | null {
  return deckHas(deck, id) ? deck : null;
}

/**
 * The deck a rule view pages. A stale `?q` (no matches), or a rule opened from
 * the palette or Related outside the active search or collection, pages the
 * catalog. A rule view never holds an empty deck.
 */
export function resolveEntryDeck(deck: Deck, id: string): Deck {
  return deckContaining(deck, id) ?? catalogDeck;
}

export function deckNeighbours(deck: Deck, id: string): { prev: Rule | null; next: Rule | null } {
  const index = deck.rules.findIndex((rule) => rule.id === id);
  return {
    prev: index > 0 ? deck.rules[index - 1] : null,
    next: index >= 0 ? deck.rules[index + 1] ?? null : null,
  };
}

/** Paging never wraps. */
export function stepRule(deck: Deck, id: string, direction: Direction): Rule | null {
  const neighbours = deckNeighbours(deck, id);
  return direction === 1 ? neighbours.next : neighbours.prev;
}

/** Catalog counters describe the category; search and collection counters describe the deck. */
export function deckPosition(deck: Deck, id: string): {
  index: number;
  total: number;
  label: string;
  category: RailCategoryId;
} | null {
  if (!deckHas(deck, id)) return null;
  const category = railCategoryOf(id);
  const scope = deck.kind === "catalog" ? railCategories.find((item) => item.id === category)!.rules : deck.rules;
  const index = scope.findIndex((rule) => rule.id === id) + 1;
  return { index, total: scope.length, label: `${index} of ${scope.length}`, category };
}

/** The wall section a rule sits in: its rail category, or its group inside a collection. */
function sectionOf(deck: Deck, id: string): string {
  if (deck.kind !== "collection") return railCategoryOf(id);
  const groups = collections.find((item) => item.id === deck.collection)?.groups ?? [];
  const at = groups.findIndex((group) => group.ruleIds.includes(id));
  return `group-${at}`;
}

/**
 * Shift+J/K: the first rule of the next or previous wall section in this deck.
 * Because the deck is in wall order, sections are contiguous runs. Inside the
 * first section, Shift+K goes to its own first rule; neither end wraps.
 */
export function sectionJump(deck: Deck, id: string, direction: Direction): Rule | null {
  const index = deck.rules.findIndex((rule) => rule.id === id);
  if (index < 0) return null;
  const starts: number[] = [];
  deck.rules.forEach((rule, at) => {
    if (at === 0 || sectionOf(deck, rule.id) !== sectionOf(deck, deck.rules[at - 1].id)) starts.push(at);
  });
  let own = 0;
  while (own + 1 < starts.length && starts[own + 1] <= index) own += 1;
  if (direction === 1) return own + 1 < starts.length ? deck.rules[starts[own + 1]] : null;
  // Backward leaves the section from any rule in it, so each Shift+K moves up
  // one whole section rather than first stopping at this section's start.
  if (own > 0) return deck.rules[starts[own - 1]];
  return starts[0] !== index ? deck.rules[starts[0]] : null;
}

export type CategoryHandoff = {
  rule: Rule;
  category: RailCategoryId;
  name: string;
  count: number;
};

/**
 * Metadata for the "Next category" row and the category-named pager arrow.
 * Catalog deck only: a search or collection deck has no category handoff.
 * Null within a category and at the end.
 */
export function categoryHandoff(deck: Deck, id: string): CategoryHandoff | null {
  if (deck.kind !== "catalog") return null;
  const next = stepRule(deck, id, 1);
  if (!next || railCategoryOf(next.id) === railCategoryOf(id)) return null;
  const category = railCategories.find((item) => item.id === railCategoryOf(next.id))!;
  return { rule: next, category: category.id, name: category.name, count: category.rules.length };
}
