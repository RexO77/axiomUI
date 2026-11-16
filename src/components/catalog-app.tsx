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
 * one real router.replace to the gallery URL, which fills the slot in place
 * (an in-document replace, never a new document). An idle prefetch warms it.
 *
 * Interrupted morphs are discarded, never replayed: runViewTransition drops
 * an update whose capture was skipped. Every path that
 * supersedes one commits the authoritative location itself, in the same task:
 * a new open, an exit, or the location popstate landed on.
 */

import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams, useSelectedLayoutSegments } from "next/navigation";
import {
  Suspense,
  startTransition,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";

import { writeSide } from "@/components/gallery/side-switch";
import { WallContext, type WallApi, type WallFilter } from "@/components/gallery/wall-context";
import { Shell } from "@/components/shell/shell";
import type { InputOrigin } from "@/components/shell/shell-context";
import { rules } from "@/data/ui-logic";
import { catalogStores } from "@/lib/catalog/stores";
import { deckFor, deckHas, resolveEntryDeck } from "@/lib/navigation/deck";
import {
  currentUrl,
  exitAction,
  galleryState,
  holdHistory,
  jumpFromRule,
  openFromGallery as openWrites,
  readAxiomState,
  stampLoad,
  stepInRule,
  writeHistory,
  type AxiomState,
} from "@/lib/navigation/history";
import { resolveHash } from "@/lib/navigation/hash";
import { createRoutes, type CatalogLocation } from "@/lib/navigation/routes";
import { runViewTransition, type TransitionHandle, type ViewTransitionElements } from "@/lib/navigation/view-transition";

const ruleById = new Map(rules.map((rule) => [rule.id, rule]));

/*
 * The rule view: split from the wall's bundle, still rendered on the server.
 * With SSR kept, next/dynamic adds no Suspense boundary,
 * so a first open before its chunk arrived would suspend the whole commit and
 * lose the 0 ms keyboard open. CatalogApp primes it once after hydration.
 */
const Stage = dynamic(() => import("@/components/rule/stage").then((mod) => mod.Stage));

const same = (a: CatalogLocation, b: CatalogLocation) =>
  a.view === b.view && a.ruleId === b.ruleId && a.q === b.q && a.show === b.show && a.collection === b.collection;

const wallOf = (from: CatalogLocation): CatalogLocation => ({ ...from, view: "gallery", ruleId: null });

/** The rule's location: it keeps the wall's `q` or collection only when that deck holds it. */
function ruleOf(id: string, from: CatalogLocation): CatalogLocation {
  const keep = deckHas(deckFor(from), id);
  return { view: "rule", ruleId: id, q: keep ? from.q : "", collection: keep ? from.collection : null, show: from.show };
}

/* The morph pair: a tile's frame and title, and the rule view's canvas and title. */
const tileIn = (layer: HTMLElement | null, id: string) =>
  layer?.querySelector<HTMLElement>(`[data-rule-link][id="rule-${CSS.escape(id)}"]`) ?? null;
const sectionIn = (layer: HTMLElement | null, id: string) =>
  layer?.querySelector<HTMLElement>(`[id="${CSS.escape(id)}"]`) ?? null;

/** What the wall brings into view on arrival: a rule's tile (focused), or a category's section. */
type Reveal = { ruleId: string; section: string | null };
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
/** How long after a Back that cut such a wait short a stale router commit is still put right. */
const POP_GUARD_MS = 10_000;

export type CatalogAppProps = {
  /** The catalog's base path (`""` at the site root). Every URL comes from `createRoutes(basePath)`. */
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
  /** The same, as state: the wall keeps showing its own filter while a rule is open above it. */
  const [wallShown, setWallShown] = useState<CatalogLocation>(wallLoc.current);
  const wallLayer = useRef<HTMLDivElement>(null);
  const morph = useRef<TransitionHandle | null>(null);
  const pendingOpen = useRef<{ ruleId: string; cancelled: boolean } | null>(null);
  const pendingExit = useRef<{ reveal: Reveal; origin: InputOrigin } | null>(null);
  /** An exit after a direct load, holding the rule view until the router replace has filled @wall. */
  const pendingWall = useRef<{ reveal: Reveal; origin: InputOrigin; below: CatalogLocation } | null>(null);
  const wallWatch = useRef<MutationObserver | null>(null);
  /** After a Back that interrupted an exit's wait: the entry it reached, which a late router commit must not overwrite. */
  const popGuard = useRef<{ url: string; axiom: AxiomState; until: number } | null>(null);
  /** The tile (or section) to bring into view once the wall shows it. Open, exit and popstate clear it. */
  const pendingReveal = useRef<Reveal | null>(null);

  const readLocation = useCallback(
    () => routes.parseLocation(window.location.pathname, window.location.search),
    [routes],
  );
  const setWall = useCallback((next: CatalogLocation) => {
    wallLoc.current = next;
    setWallShown(next);
  }, []);
  const commit = useCallback(
    (next: CatalogLocation) => {
      locRef.current = next;
      if (next.view === "gallery") setWall(next);
      setLoc(next);
    },
    [setWall],
  );
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
    const target = pendingReveal.current;
    const layer = wallLayer.current;
    if (!target || !layer || locRef.current.view !== "gallery") return;
    const found = target.section ? sectionIn(layer, target.section) : tileIn(layer, target.ruleId);
    if (!found) {
      revealWatch.current = new MutationObserver(revealPending);
      revealWatch.current.observe(layer, { childList: true, subtree: true });
      return;
    }
    pendingReveal.current = null;
    if (target.section) {
      // A category: its section at the top; focus stays where the reader chose it.
      found.scrollIntoView({ block: "start" });
      return;
    }
    // A tile the wall's filter hides is not there to return to.
    if (found.closest("[hidden]")) return;
    found.scrollIntoView({ block: "nearest" });
    found.focus({ preventScroll: true });
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
    pendingWall.current = null;
    holdHistory(false);
    wallWatch.current?.disconnect();
    wallWatch.current = null;
    popGuard.current = null;
  }, []);

  /*
   * Back during that wait. The reader's own traversal is not
   * gated, and Next's late commit then writes the address being left onto
   * the entry Back reached. For a while after such a pop, a router commit
   * that leaves the address bar anywhere but the entry popped to is put back
   * through the one writer, so Next adopts that address too. Any move of ours
   * supersedes it.
   */
  const holdPop = useCallback(() => {
    const guard = popGuard.current;
    if (!guard) return;
    if (performance.now() > guard.until) popGuard.current = null;
    else if (currentUrl(window.location) !== guard.url) writeHistory("replace", guard.axiom, guard.url);
  }, []);
  const release = useCallback(() => {
    const pending = traversal.current;
    if (!pending || pending.generation !== generation.current) return;
    if (urlKey(routerUrl.current.path, routerUrl.current.search) !== pending.target) return;
    window.clearTimeout(pending.timer);
    traversal.current = null;
    pending.run();
  }, []);
  /* Every router commit: put a stale address back, run a waiting traversal, seat a wall that has arrived. */
  const landWall = useRef(() => {});
  useLayoutEffect(() => {
    routerUrl.current.path = pathname;
    holdPop();
    release();
    landWall.current();
  }, [pathname, holdPop, release]);
  const onRouterSearch = useCallback(
    (search: string) => {
      routerUrl.current.search = search;
      holdPop();
      release();
      landWall.current();
    },
    [holdPop, release],
  );
  useEffect(() => supersede, [supersede]);

  const showGallery = useCallback(
    (next: CatalogLocation, target: Reveal | null, origin: InputOrigin) => {
      pendingReveal.current = target;
      // Only a return to the rule's own tile morphs; a category lands at once.
      const tile = target && !target.section ? tileIn(wallLayer.current, target.ruleId) : null;
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

  /*
   * The first exit after a direct load waits here, with the rule view still
   * on screen, until the router replace has committed the wall into @wall.
   * Then it runs like any other exit: 0 ms from the keyboard, the morph from
   * a pointer. Without the wait, a slow replace showed an empty sheet.
   */
  useLayoutEffect(() => {
    landWall.current = () => {
      const waiting = pendingWall.current;
      if (!waiting || !wallLayer.current?.querySelector("[data-wall]")) return;
      pendingWall.current = null;
      holdHistory(false);
      wallWatch.current?.disconnect();
      wallWatch.current = null;
      showGallery(waiting.below, waiting.reveal, waiting.origin);
    };
  }, [showGallery]);

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

  /** Back to the wall, at the rule's tile, or at `section` when a category icon asked for its run. */
  const exit = useCallback(
    (origin: InputOrigin, section: string | null = null) => {
      const opening = pendingOpen.current;
      const cur = locRef.current;
      const ruleId = opening?.ruleId ?? cur.ruleId;
      if (!ruleId || pendingExit.current || pendingWall.current) return;
      if (opening) opening.cancelled = true;
      pendingOpen.current = null;
      pendingReveal.current = null;
      const below = wallLoc.current;
      const reveal: Reveal = { ruleId, section };
      const action = exitAction(window.history.state, ruleId, deckFor(below), below, routes);
      if (action.type === "back") {
        supersede();
        pendingExit.current = { reveal, origin };
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
      const href = section ? routes.galleryHref({ q: below.q, show: below.show, collection: below.collection, hash: section }) : action.href;
      if (!wallMounted()) {
        // No wall in this document (a direct load or a reload): fill the @wall
        // slot with one real replace, in place. The rule view stays until it
        // lands, and no history write may interrupt it meanwhile (a scroll
        // save, a page turn): Next would drop the navigation and the wall
        // would never come.
        supersede();
        pendingWall.current = { reveal, origin, below };
        holdHistory(true);
        const layer = wallLayer.current;
        if (layer) {
          wallWatch.current = new MutationObserver(() => landWall.current());
          wallWatch.current.observe(layer, { childList: true, subtree: true });
        }
        router.replace(href, { scroll: false });
        return;
      }
      writeHistory("replace", action.axiom, href);
      showGallery(below, reveal, origin);
    },
    [commitNow, readLocation, release, routes, router, showGallery, supersede],
  );

  /* The shell's navigation: a push from the strip, the palette or Related; a replace for paging. */
  const onOpenRule = useCallback(
    (id: string, mode: "push" | "replace") => {
      const cur = locRef.current;
      // An exit is already filling the wall: the page turn would race its router replace.
      if (pendingWall.current) return;
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
        exit(origin, categoryId);
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
    if (cur.view !== "rule" || pendingWall.current) return;
    const next: CatalogLocation = { ...cur, q: "", collection: null };
    const write = stepInRule(window.history.state);
    writeHistory(write.mode, write.axiom, ruleUrl(next));
    commitNow(next);
  }, [commitNow, ruleUrl]);

  /* Prime the rule view in the background: its chunk and stylesheet are in before the first open. */
  const [stageWarm, setStageWarm] = useState(false);
  useEffect(() => startTransition(() => setStageWarm(true)), []);

  /* Hydrated: phone CSS may now collapse what only script can reopen (the deep dive's sections). */
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.hydrated = "";
    return () => {
      delete root.dataset.hydrated;
    };
  }, []);

  /*
   * The wall's search, collection and side: replace the gallery entry and
   * commit, with no morph. The wall reads the result through WallContext.
   * A rule on screen, or one opening, owns the location: the change waits.
   */
  const setFilter = useCallback(
    (patch: WallFilter) => {
      const cur = locRef.current;
      if (cur.view !== "gallery" || pendingOpen.current) return;
      const next: CatalogLocation = { ...cur, ...patch, collection: patch.collection === undefined ? cur.collection : patch.collection };
      if (same(next, cur)) return;
      writeHistory("replace", galleryState, galleryUrl(next));
      commit(next);
    },
    [commit, galleryUrl],
  );
  const visible = useMemo(() => {
    const deck = deckFor(wallShown);
    return deck.kind === "catalog" ? null : new Set(deck.rules.map((rule) => rule.id));
  }, [wallShown]);
  const wallApi = useMemo<WallApi>(
    () => ({ q: wallShown.q, collection: wallShown.collection, show: wallShown.show, visible, setFilter }),
    [wallShown.q, wallShown.collection, wallShown.show, visible, setFilter],
  );

  /*
   * A fragment on the wall (hash.ts): a category section scrolls into view,
   * a tile is revealed and focused, and #accessibility opens the collection.
   * Runs once the location is real, and again on every hashchange.
   */
  const applyHash = useCallback(
    (hash: string) => {
      const target = resolveHash(hash);
      if (!target || locRef.current.view !== "gallery") return;
      if (target.kind === "tile") {
        pendingReveal.current = { ruleId: target.id, section: null };
        reveal();
      } else if (target.kind === "section") {
        wallLayer.current?.querySelector<HTMLElement>(`section[id="${CSS.escape(target.id)}"]`)?.scrollIntoView({ block: "start" });
      } else {
        setFilter({ q: "", collection: target.id });
      }
    },
    [reveal, setFilter],
  );
  useEffect(() => {
    const onHash = () => applyHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [applyHash]);

  /* After hydration: the real location, which the prerendered HTML could not know. */
  const onReady = useCallback(() => {
    const actual = readLocation();
    // The wall to return to, from the entry's own query, once: paging keeps it.
    setWall(wallOf(actual));
    // The boot script painted this side already; this only covers a page where it could not run.
    writeSide(actual.show);
    if (actual.view === "rule") catalogStores.continueRule.suppress();
    if (!same(actual, locRef.current)) commit(actual);
    // The filter is applied in this same commit, before paint: the wall may show (boot-script.ts).
    delete document.documentElement.dataset.filterPending;
    applyHash(window.location.hash);
  }, [applyHash, commit, readLocation, setWall]);

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
      const interrupted = traversal.current !== null;
      supersede();
      if (interrupted) {
        const axiom = readAxiomState(window.history.state) ?? (next.view === "gallery" ? galleryState : null);
        if (axiom) popGuard.current = { url: currentUrl(window.location), axiom, until: performance.now() + POP_GUARD_MS };
      }
      pendingReveal.current = null;
      if (pendingOpen.current) pendingOpen.current.cancelled = true;
      pendingOpen.current = null;
      const cur = locRef.current;
      if (next.view === "gallery") {
        // The entry's own side: Back to a Don't link shows Don't again.
        writeSide(next.show);
        const target = exiting?.reveal ?? (cur.ruleId ? { ruleId: cur.ruleId, section: null } : null);
        showGallery(next, target, exiting?.origin ?? "keyboard");
        // A move between two wall entries (a fragment link) lands on its fragment.
        if (cur.view === "gallery") applyHash(window.location.hash);
        return;
      }
      commitNow(next);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [applyHash, commitNow, readLocation, showGallery, supersede]);

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
  const shownRule = ruleId && ruleById.has(ruleId) ? ruleId : null;
  const segments = useSelectedLayoutSegments();
  const loadedRule = segments[0] === "rules" ? (segments[1] ?? null) : null;
  const deck = useMemo(() => (ruleId ? resolveEntryDeck(deckFor(loc), ruleId) : deckFor(loc)), [loc, ruleId]);
  const onWall = loc.view === "gallery";
  const hrefFor = useCallback((id: string) => routes.ruleHref(id), [routes]);

  /*
   * The wall's context sits above the shell, not only around the wall: the
   * palette's "show all matches" filters the wall in place through it.
   */
  return (
    <WallContext.Provider value={wallApi}>
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
        {/*
          The page slot holds the server-rendered Inspector of the rule this
          document loaded (its router segment, which native history writes
          never swap). It is the rule view's prose seed only while that rule is
          shown; any other rule reads the loader. Elsewhere it renders as is,
          so an unknown id still reaches its not-found boundary.
        */}
        {shownRule ? <Stage ruleId={shownRule} seed={shownRule === loadedRule ? children : null} /> : children}
        {/* An empty id renders nothing; it only resolves the lazy rule view. */}
        {!shownRule && stageWarm ? (
          <Suspense fallback={null}>
            <Stage ruleId="" />
          </Suspense>
        ) : null}
      </Shell>
      <Suspense fallback={null}>
        <RouterSearch onReady={onReady} onCommit={onRouterSearch} />
      </Suspense>
    </WallContext.Provider>
  );
}
