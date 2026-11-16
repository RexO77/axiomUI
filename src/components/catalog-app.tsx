// design-system: strict
"use client";

/*
 * The catalog's one client app. It lives in the
 * catalog layout and owns the location, the wall and the rule view, so the
 * page slot never decides what is on screen: both pages render nothing.
 *
 * History (every write goes through writeHistory, a fresh `{ axiom }`):
 *   open from the wall           replace the gallery entry, push the rule (depth 1)
 *   Related / palette jump       push (depth + 1; stays 0 after a reload)
 *   J/K, the pager, the strip    replace, same depth
 *   Esc, the crumb, the logo     back `depth` entries to the wall, else replace
 *
 * The view is React state committed with flushSync, never derived from
 * usePathname(), which only seeds the first render (it is the SSR snapshot).
 * The real location is read from window.location after hydration and on
 * popstate. In-shell moves never call router.push, router.refresh or <Link>.
 *
 * The wall arrives as the @wall slot: the gallery URL renders it on the
 * server, every other URL renders its default (null). A rule loaded directly,
 * or reloaded, therefore has no wall in this document, and its first exit is
 * one real router.replace to the gallery URL, which fills the slot in place.
 * An idle prefetch warms it.
 *
 * Interrupted morphs are discarded, never replayed: runViewTransition drops
 * an update whose capture was skipped. Every path that
 * supersedes one commits the authoritative location itself, in the same task:
 * a new open, an exit, or the location popstate landed on.
 */

import { ChevronLeft } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";

import { Shell } from "@/components/shell/shell";
import type { InputOrigin } from "@/components/shell/shell-context";
import { railCategory } from "@/data/taxonomy";
import { rules } from "@/data/ui-logic";
import { catalogStores } from "@/lib/catalog/stores";
import { deckFor, deckHas, deckPosition, resolveEntryDeck, type Deck } from "@/lib/navigation/deck";
import {
  currentUrl,
  exitAction,
  jumpFromRule,
  openFromGallery as openWrites,
  stampLoad,
  stepInRule,
  writeHistory,
} from "@/lib/navigation/history";
import { createRoutes, type CatalogLocation } from "@/lib/navigation/routes";
import { runViewTransition, type TransitionHandle, type ViewTransitionElements } from "@/lib/navigation/view-transition";

const ruleById = new Map(rules.map((rule) => [rule.id, rule]));

const same = (a: CatalogLocation, b: CatalogLocation) =>
  a.view === b.view && a.ruleId === b.ruleId && a.q === b.q && a.show === b.show && a.collection === b.collection;

const wallOf = (from: CatalogLocation): CatalogLocation => ({ ...from, view: "gallery", ruleId: null });

/** The rule's location: it keeps the wall's `q` or collection only when that deck holds it. */
function ruleOf(id: string, from: CatalogLocation): CatalogLocation {
  const keep = deckHas(deckFor(from), id);
  return { view: "rule", ruleId: id, q: keep ? from.q : "", collection: keep ? from.collection : null, show: from.show };
}

function readHash(): string {
  try {
    return decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return "";
  }
}

/* The morph pair: a tile's frame and title, and the rule view's canvas and title. */
const tileIn = (layer: HTMLElement | null, id: string) =>
  layer?.querySelector<HTMLElement>(`[data-rule-link][id="rule-${CSS.escape(id)}"]`) ?? null;
const pairOf = (root: Element | null, canvas: string, title: string): ViewTransitionElements => ({
  canvas: root?.querySelector<HTMLElement>(canvas),
  title: root?.querySelector<HTMLElement>(title),
});
const tilePair = (tile: Element | null) => pairOf(tile, "[data-tile-frame]", "[data-tile-title]");
const stagePair = () => pairOf(document.querySelector(".shell-rule"), "[data-rule-canvas]", "[data-rule-title]");

/**
 * Holds useSearchParams under its own Suspense boundary, so a prerendered
 * catalog page keeps the pathname's view in its HTML.
 * Renders nothing. Once hydrated it tells the app to read the real location,
 * and on every router commit it reports the search Next has committed.
 */
function RouterSearch({ onReady, onCommit }: { onReady: () => void; onCommit: (search: string) => void }) {
  const search = useSearchParams().toString();
  const ready = useRef(onReady);
  useLayoutEffect(() => ready.current(), []);
  useLayoutEffect(() => onCommit(search), [search, onCommit]);
  return null;
}

const urlKey = (path: string, search: string) => `${path}?${new URLSearchParams(search).toString()}`;
/** How long an exit waits for Next's router commit before it is abandoned. */
const COMMIT_WAIT_MS = 3000;

export type CatalogAppProps = {
  /** The catalog mount point. Every URL comes from `createRoutes(basePath)`. */
  basePath: string;
  /** The @wall slot: the wall at the gallery URL, null (its default) everywhere else. */
  wall: ReactNode;
  children: ReactNode;
};

export function CatalogApp({ basePath, wall, children }: CatalogAppProps) {
  const routes = useMemo(() => createRoutes(basePath), [basePath]);
  const router = useRouter();
  const pathname = usePathname();
  const [loc, setLoc] = useState<CatalogLocation>(() => routes.parseLocation(pathname));

  const locRef = useRef(loc);
  /** The wall below the rule view: its filter is what Esc returns to. */
  const wallLoc = useRef(wallOf(loc));
  const wallLayer = useRef<HTMLDivElement>(null);
  const morph = useRef<TransitionHandle | null>(null);
  const pendingOpen = useRef<{ ruleId: string; cancelled: boolean } | null>(null);
  const pendingExit = useRef<{ ruleId: string; origin: InputOrigin } | null>(null);
  /** The tile to bring into view and focus once the wall shows it. Open, exit and popstate clear it. */
  const pendingReveal = useRef<string | null>(null);

  const readLocation = useCallback(
    () => routes.parseLocation(window.location.pathname, window.location.search),
    [routes],
  );
  const commit = useCallback((next: CatalogLocation) => {
    locRef.current = next;
    if (next.view === "gallery") wallLoc.current = next;
    setLoc(next);
  }, []);
  /** Commit at 0ms, discarding any morph still waiting for its capture. */
  const commitNow = useCallback(
    (next: CatalogLocation) => {
      morph.current = runViewTransition(() => commit(next), { source: "keyboard" });
    },
    [commit],
  );
  const wallMounted = () => Boolean(wallLayer.current?.querySelector("[data-wall]"));
  const ruleUrl = useCallback(
    (next: CatalogLocation) => routes.ruleHref(next.ruleId ?? "", { q: next.q, collection: next.collection }),
    [routes],
  );
  const galleryUrl = useCallback(
    (from: CatalogLocation) => routes.galleryHref({ q: from.q, show: from.show, collection: from.collection }),
    [routes],
  );

  /*
   * Back on the wall: the pending tile scrolled into view and focused, once it
   * exists. A wall still on its way (the router replace after a direct load)
   * arrives inside the slot, not through a prop, so the layer is watched until
   * the tile shows up or the reveal is cancelled.
   */
  const revealWatch = useRef<MutationObserver | null>(null);
  const reveal = useCallback(function revealPending() {
    revealWatch.current?.disconnect();
    revealWatch.current = null;
    const id = pendingReveal.current;
    const layer = wallLayer.current;
    if (!id || !layer || locRef.current.view !== "gallery") return;
    const tile = tileIn(layer, id);
    if (!tile) {
      revealWatch.current = new MutationObserver(revealPending);
      revealWatch.current.observe(layer, { childList: true, subtree: true });
      return;
    }
    pendingReveal.current = null;
    tile.scrollIntoView({ block: "nearest" });
    tile.focus({ preventScroll: true });
  }, []);
  useLayoutEffect(reveal, [loc, reveal]);
  useEffect(() => () => revealWatch.current?.disconnect(), []);

  /*
   * Next commits each history write later and then writes its canonical URL
   * onto the current entry, so a traversal that lands first gets the URL it
   * left. history.go runs only once Next's committed path and
   * search equal the entry being left. An open, popstate or unmount
   * supersedes the wait; past COMMIT_WAIT_MS the exit is abandoned instead.
   */
  const routerUrl = useRef({ path: pathname, search: "" });
  const generation = useRef(0);
  const traversal = useRef<{ generation: number; target: string; run: () => void; timer: number } | null>(null);
  const supersede = useCallback(() => {
    generation.current += 1;
    if (traversal.current) window.clearTimeout(traversal.current.timer);
    traversal.current = null;
    pendingExit.current = null;
  }, []);
  const release = useCallback(() => {
    const pending = traversal.current;
    if (!pending || pending.generation !== generation.current) return;
    if (urlKey(routerUrl.current.path, routerUrl.current.search) !== pending.target) return;
    window.clearTimeout(pending.timer);
    traversal.current = null;
    pending.run();
  }, []);
  useLayoutEffect(() => {
    routerUrl.current.path = pathname;
    release();
  }, [pathname, release]);
  const onRouterSearch = useCallback(
    (search: string) => {
      routerUrl.current.search = search;
      release();
    },
    [release],
  );
  useEffect(() => supersede, [supersede]);

  const showGallery = useCallback(
    (next: CatalogLocation, revealId: string | null, origin: InputOrigin) => {
      pendingReveal.current = revealId;
      const tile = revealId ? tileIn(wallLayer.current, revealId) : null;
      const animate = origin === "pointer" && tile !== null;
      morph.current = runViewTransition(() => commit(next), {
        source: animate ? "pointer" : "keyboard",
        direction: "out",
        from: animate ? stagePair() : undefined,
        to: animate ? () => tilePair(tile) : undefined,
        fallbackTarget: wallLayer.current,
      });
    },
    [commit],
  );

  const openFromWall = useCallback(
    (id: string, origin: InputOrigin, tile: Element | null) => {
      supersede();
      pendingReveal.current = null;
      if (pendingOpen.current) pendingOpen.current.cancelled = true;
      const from = locRef.current;
      const next = ruleOf(id, from);
      const opening = { ruleId: id, cancelled: false };
      pendingOpen.current = opening;
      const [galleryWrite, ruleWrite] = openWrites();
      writeHistory(galleryWrite.mode, galleryWrite.axiom, galleryUrl(from));
      writeHistory(ruleWrite.mode, ruleWrite.axiom, ruleUrl(next));
      morph.current = runViewTransition(
        () => {
          if (opening.cancelled) return;
          pendingOpen.current = null;
          commit(next);
        },
        { source: tile ? origin : "keyboard", direction: "in", from: tilePair(tile), to: stagePair },
      );
    },
    [commit, galleryUrl, ruleUrl, supersede],
  );

  const exit = useCallback(
    (origin: InputOrigin) => {
      const opening = pendingOpen.current;
      const cur = locRef.current;
      const ruleId = opening?.ruleId ?? cur.ruleId;
      if (!ruleId || pendingExit.current) return;
      if (opening) opening.cancelled = true;
      pendingOpen.current = null;
      pendingReveal.current = null;
      const below = wallLoc.current;
      const action = exitAction(window.history.state, ruleId, deckFor(below), below, routes);
      if (action.type === "back") {
        supersede();
        pendingExit.current = { ruleId, origin };
        const mine = generation.current;
        const timer = window.setTimeout(() => {
          if (generation.current !== mine) return;
          supersede();
          commitNow(readLocation());
        }, COMMIT_WAIT_MS);
        const target = urlKey(window.location.pathname, window.location.search);
        traversal.current = { generation: mine, target, run: () => window.history.go(-action.delta), timer };
        release();
        return;
      }
      if (!wallMounted()) {
        // No wall in this document (a direct load or a reload): fill the @wall
        // slot with one real replace, in place. The tile is revealed when it lands.
        pendingReveal.current = ruleId;
        commitNow(below);
        router.replace(action.href, { scroll: false });
        return;
      }
      writeHistory("replace", action.axiom, action.href);
      showGallery(below, ruleId, origin);
    },
    [commitNow, readLocation, release, routes, router, showGallery, supersede],
  );

  /* The shell's navigation: a push from the strip, the palette or Related; a replace for paging. */
  const onOpenRule = useCallback(
    (id: string, mode: "push" | "replace") => {
      const cur = locRef.current;
      supersede();
      if (cur.view === "gallery") {
        openFromWall(id, "keyboard", null);
        return;
      }
      const next = ruleOf(id, cur);
      const write = mode === "push" ? jumpFromRule(window.history.state) : stepInRule(window.history.state);
      writeHistory(write.mode, write.axiom, ruleUrl(next));
      commitNow(next);
    },
    [commitNow, openFromWall, ruleUrl, supersede],
  );

  const onHome = useCallback(
    (categoryId: string | null, origin: InputOrigin) => {
      if (locRef.current.view === "rule") {
        exit(origin);
        return;
      }
      const layer = wallLayer.current;
      const section = categoryId ? layer?.querySelector<HTMLElement>(`[id="${CSS.escape(categoryId)}"]`) : null;
      if (section) section.scrollIntoView({ block: "start" });
      else layer?.scrollTo({ top: 0 });
    },
    [exit],
  );

  const onClearDeck = useCallback(() => {
    const cur = locRef.current;
    if (cur.view !== "rule") return;
    const next: CatalogLocation = { ...cur, q: "", collection: null };
    const write = stepInRule(window.history.state);
    writeHistory(write.mode, write.axiom, ruleUrl(next));
    commitNow(next);
  }, [commitNow, ruleUrl]);

  /* After hydration: the real location, which the prerendered HTML could not know. */
  const onReady = useCallback(() => {
    const actual = readLocation();
    // The wall to return to, from the entry's own query, once: paging keeps it.
    wallLoc.current = wallOf(actual);
    if (actual.view === "rule") catalogStores.continueRule.suppress();
    else if (readHash().startsWith("rule-")) pendingReveal.current = readHash().slice(5);
    if (!same(actual, locRef.current)) commit(actual);
    else reveal();
  }, [commit, readLocation, reveal]);

  /*
   * Stamp the load's entry, one task after mount: the entry Next writes first
   * must not be overwritten early. A rule URL is stamped depth 0 (nothing is
   * below it in this document) under its canonical URL.
   */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const actual = readLocation();
      const write = stampLoad(actual.view);
      writeHistory(write.mode, write.axiom, actual.view === "rule" ? ruleUrl(actual) : currentUrl(window.location));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [readLocation, ruleUrl]);

  /* A rule loaded without its wall: warm the gallery for the first Esc. */
  useEffect(() => {
    if (wallLayer.current?.querySelector("[data-wall]")) return;
    const warm = () => router.prefetch(routes.galleryHref());
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(warm, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(warm, 200);
    return () => window.clearTimeout(id);
  }, [router, routes]);

  /* Back and Forward. Exits started with history.go() arrive with their rule and origin. */
  useEffect(() => {
    const onPop = () => {
      const next = readLocation();
      const exiting = pendingExit.current;
      supersede();
      pendingReveal.current = null;
      if (pendingOpen.current) pendingOpen.current.cancelled = true;
      pendingOpen.current = null;
      const cur = locRef.current;
      if (next.view === "gallery") {
        showGallery(next, exiting?.ruleId ?? cur.ruleId, exiting?.origin ?? "keyboard");
        return;
      }
      commitNow(next);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [commitNow, readLocation, showGallery, supersede]);

  /* Until a pointer open's capture commits, the shell still sees the wall: Esc in that gap closes it. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !pendingOpen.current) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      exit("keyboard");
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [exit]);

  /* One delegated listener for every tile: plain left clicks only. Enter on a tile is a click with detail 0. */
  const onWallClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element).closest<HTMLAnchorElement>("a[data-rule-link]");
      if (!link || !event.currentTarget.contains(link) || locRef.current.view !== "gallery") return;
      const url = new URL(link.href);
      if (url.origin !== window.location.origin) return;
      const { ruleId } = routes.parseLocation(url.pathname, url.search);
      if (!ruleId || !ruleById.has(ruleId)) return;
      event.preventDefault();
      openFromWall(ruleId, event.detail === 0 ? "keyboard" : "pointer", link);
    },
    [openFromWall, routes],
  );

  const ruleId = loc.view === "rule" ? loc.ruleId : null;
  const deck = useMemo(() => (ruleId ? resolveEntryDeck(deckFor(loc), ruleId) : deckFor(loc)), [loc, ruleId]);
  const onWall = loc.view === "gallery";
  const hrefFor = useCallback((id: string) => routes.ruleHref(id), [routes]);

  return (
    <>
      <Shell
        view={loc.view}
        ruleId={ruleId}
        deck={deck}
        onOpenRule={onOpenRule}
        onExit={exit}
        onHome={onHome}
        onClearDeck={onClearDeck}
        hrefFor={hrefFor}
      >
        <div ref={wallLayer} className="shell-wall" data-hidden={onWall ? undefined : ""} inert={!onWall} onClick={onWallClick}>
          {wall}
        </div>
        {ruleId ? <StagePlaceholder ruleId={ruleId} deck={deck} onExit={exit} /> : null}
        {children}
      </Shell>
      <Suspense fallback={null}>
        <RouterSearch onReady={onReady} onCommit={onRouterSearch} />
      </Suspense>
    </>
  );
}

/** A stand-in for the rule view until the full one replaces it: the title, the position and a canvas to morph into. */
function StagePlaceholder({ ruleId, deck, onExit }: { ruleId: string; deck: Deck; onExit: (origin: InputOrigin) => void }) {
  const rule = ruleById.get(ruleId);
  const position = deckPosition(deck, ruleId);
  if (!rule || !position) return null;
  return (
    <article className="shell-rule" aria-labelledby="rule-title">
      <header className="flex h-13 items-center gap-2 px-6">
        <button type="button" className="shell-ctl -ml-2.5" onClick={(event) => onExit(event.detail === 0 ? "keyboard" : "pointer")}>
          <ChevronLeft aria-hidden="true" />
          All rules
        </button>
        <p className="ml-auto text-[13px] leading-5 text-ink-muted tabular-nums">
          {railCategory(position.category).short} · {position.label}
        </p>
      </header>
      <div className="px-6 pb-16">
        <h1
          id="rule-title"
          data-rule-title
          tabIndex={-1}
          className="max-w-[24ch] font-serif text-4xl/10 font-semibold tracking-[-0.02em] text-balance text-ink outline-none"
        >
          {rule.title}
        </h1>
        <p className="mt-2 max-w-[65ch] text-base/7 text-ink-secondary">{rule.desc}</p>
        <div data-rule-canvas className="mt-8 grid min-h-180 grid-cols-2 rounded-frame bg-sunken ring-1 ring-line ring-inset">
          <p className="p-6 text-sm/6 text-ink-secondary">
            <span className="block font-medium text-do-ink">Do</span>
            {rule.do}
          </p>
          <p className="border-l border-line p-6 text-sm/6 text-ink-secondary">
            <span className="block font-medium text-dont-ink">Don’t</span>
            {rule.dont}
          </p>
        </div>
      </div>
    </article>
  );
}
