import { deckHas, type Deck } from "./deck";
import { routes as canonicalRoutes, type CatalogRoutes, type RouteOptions } from "./routes";

/*
 * The shell's history recipe.
 *
 * - One writer: `writeHistory` is the only caller of pushState/replaceState,
 *   and it reads `window.history` at call time, so it always reaches the
 *   methods Next has patched.
 * - Fresh state: the first argument is `{ axiom }` and nothing else. Never a
 *   spread of `history.state`: Next adds its own keys to the entry and moves
 *   its canonical URL, so a later router commit cannot snap the address back.
 * - A non-empty, same-origin URL on every write, scroll saves included.
 */

export type AxiomView = "gallery" | "rule";

/** The sheet's reading position for one rule. Restored only on popstate, and only for that rule. */
export type AxiomScroll = { id: string; top: number };

export type AxiomState = Readonly<{
  view: AxiomView;
  /** Rule entries above the gallery entry in this document. 0: none below (a direct load or a reload). */
  depth: number;
  scroll: AxiomScroll | null;
}>;

export type HistoryMode = "push" | "replace";
export type HistoryWriter = Pick<History, "pushState" | "replaceState">;

export type ExitAction =
  | { type: "back"; delta: number }
  | { type: "replace"; href: string; axiom: AxiomState };

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readScroll(value: unknown): AxiomScroll | null {
  if (!record(value) || typeof value.id !== "string" || !value.id) return null;
  if (typeof value.top !== "number" || !Number.isFinite(value.top)) return null;
  return { id: value.id, top: Math.max(0, value.top) };
}

/** Our part of an entry, validated. Null when the entry is not ours (a first load, another app). */
export function readAxiomState(state: unknown): AxiomState | null {
  if (!record(state) || !record(state.axiom)) return null;
  const { view, depth, scroll } = state.axiom;
  if (view !== "gallery" && view !== "rule") return null;
  return {
    view,
    depth: view === "rule" && Number.isInteger(depth) && (depth as number) > 0 ? (depth as number) : 0,
    scroll: readScroll(scroll),
  };
}

/** The whole first argument to pushState/replaceState: a fresh object with only our key. */
export function historyEntry(axiom: AxiomState): { axiom: AxiomState } {
  return {
    axiom: {
      view: axiom.view,
      depth: axiom.view === "rule" ? Math.max(0, Math.trunc(axiom.depth)) : 0,
      scroll: axiom.scroll ? { id: axiom.scroll.id, top: Math.max(0, axiom.scroll.top) } : null,
    },
  };
}

function assertUrl(url: string) {
  if (typeof url !== "string" || !url.startsWith("/") || url.startsWith("//")) {
    throw new TypeError(`writeHistory needs a non-empty same-origin path, got ${JSON.stringify(url)}`);
  }
}

let held = false;

/**
 * While Next's router is navigating on the shell's behalf (the first exit
 * after a direct load, which fetches the wall), a native write would make
 * Next discard that navigation and the wall would never arrive. Writes made
 * in that window are dropped: the view they describe is being left.
 */
export function holdHistory(hold: boolean): void {
  held = hold;
}

/** The one writer. `target` exists for tests; production omits it so the patched methods are used. */
export function writeHistory(mode: HistoryMode, axiom: AxiomState, url: string, target?: HistoryWriter): void {
  assertUrl(url);
  if (held) return;
  const history = target ?? window.history;
  const entry = historyEntry(axiom);
  if (mode === "push") history.pushState(entry, "", url);
  else history.replaceState(entry, "", url);
}

/** Path, search and hash: what a scroll save or a stamp rewrites in place. */
export function currentUrl(location: Pick<Location, "pathname" | "search" | "hash">): string {
  return `${location.pathname || "/"}${location.search}${location.hash}`;
}

export type HistoryWrite = { mode: HistoryMode; axiom: AxiomState };

export const galleryState: AxiomState = Object.freeze({ view: "gallery", depth: 0, scroll: null });

/** Open from the wall (tile, rail, palette): replace the gallery entry, then push the rule at depth 1. */
export function openFromGallery(): readonly [HistoryWrite, HistoryWrite] {
  return [
    { mode: "replace", axiom: galleryState },
    { mode: "push", axiom: { view: "rule", depth: 1, scroll: null } },
  ];
}

/**
 * A Related or palette jump from a rule pushes one level deeper. After a
 * reload (depth 0, no gallery below in this document) it stays 0, so Esc still
 * replaces to the wall rather than going back to the reloaded rule.
 */
export function jumpFromRule(current: unknown): HistoryWrite {
  const depth = readAxiomState(current)?.depth ?? 0;
  return { mode: "push", axiom: { view: "rule", depth: depth > 0 ? depth + 1 : 0, scroll: null } };
}

/** J/K, the pager and the strip replace, keep the depth, and drop the old rule's scroll. */
export function stepInRule(current: unknown): HistoryWrite {
  return { mode: "replace", axiom: { view: "rule", depth: readAxiomState(current)?.depth ?? 0, scroll: null } };
}

/** The settle handler: the sheet's live reading position for the rule shown. */
export function saveScroll(current: unknown, id: string, top: number): HistoryWrite {
  const state = readAxiomState(current);
  return {
    mode: "replace",
    axiom: { view: "rule", depth: state?.view === "rule" ? state.depth : 0, scroll: { id, top } },
  };
}

/**
 * The load stamp, one task after mount (the entry Next writes first must not
 * be overwritten early). A rule URL is stamped depth 0 even when a reload kept
 * a deeper entry: nothing is below it in this document any more.
 */
export function stampLoad(view: AxiomView): HistoryWrite {
  return { mode: "replace", axiom: view === "rule" ? { view: "rule", depth: 0, scroll: null } : galleryState };
}

/** On popstate: the scroll to restore, only when the entry's scroll belongs to the rule shown. */
export function scrollToRestore(state: unknown, ruleId: string): number | null {
  const scroll = readAxiomState(state)?.scroll;
  return scroll && scroll.id === ruleId ? scroll.top : null;
}

/**
 * Esc, the logo and the crumb. Go back `depth` entries when the gallery entry
 * is below and its deck still holds the rule; otherwise replace in place with
 * the wall, anchored on the rule's tile. `galleryDeck` is the wall's deck, not
 * the deck the rule view pages.
 */
export function exitAction(
  state: unknown,
  ruleId: string,
  galleryDeck: Deck,
  gallery: RouteOptions = {},
  routes: CatalogRoutes = canonicalRoutes,
): ExitAction {
  const depth = readAxiomState(state)?.depth ?? 0;
  if (depth > 0 && deckHas(galleryDeck, ruleId)) return { type: "back", delta: depth };
  return { type: "replace", href: routes.galleryHref({ ...gallery, hash: `rule-${ruleId}` }), axiom: galleryState };
}
