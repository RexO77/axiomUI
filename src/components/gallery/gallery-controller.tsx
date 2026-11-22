// design-system: strict
"use client";

/*
 * Everything on the wall that moves: the toolbar, the search, the Do/Don't
 * side, J/K between tiles, the phone chips' scroll-spy, the empty state and
 * the announcements. The sections arrive as server-rendered children and are
 * never re-rendered here; the filter reaches them through the gates.
 *
 * The wall scrolls in its layer (the nearest scrolling ancestor), so the
 * toolbar sticks to its top and the side switch, on phones, to its bottom.
 *
 * Keys come from the shared table (keyboard.ts), in the bubble phase, and
 * only while the wall is on screen:
 *   /        focus the search          J / K      next / previous tile
 *   D        tap: switch side          ⇧J / ⇧K    next / previous category
 *            hold: show the other      Esc        clear the search
 *            side until release
 * J/K and the reveal walk only tiles that are not [hidden], so the order is
 * the deck's.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";

import { registerSheetResizer, settleSheet } from "@/components/shell/sheet-resize";
import { useShell } from "@/components/shell/shell-context";
import { collections } from "@/data/taxonomy";
import { rules } from "@/data/ui-logic";
import { catalogStores } from "@/lib/catalog/stores";
import { prefersReducedMotion } from "@/lib/media";
import { shortcutAction } from "@/lib/navigation/keyboard";
import { createRoutes, type GallerySide } from "@/lib/navigation/routes";

import { readSide, SideSwitch, writeSide } from "./side-switch";
import { Toolbar, type ChipSection } from "./toolbar";
import { groupSectionId, shownCollection, useWall } from "./wall-context";
import { wallResizer } from "./wall-resize";

/** The search follows typing once it pauses this long. */
const SEARCH_DEBOUNCE_MS = 300;
/** The result is spoken once it has stood this long. */
const ANNOUNCE_MS = 500;
/** D held past this is a look at the other side, not a switch. */
const HOLD_MS = 250;

const titleOf = new Map(rules.map((rule) => [rule.id, rule.title]));
const other = (side: GallerySide): GallerySide => (side === "do" ? "dont" : "do");

/** The nearest ancestor that scrolls: the wall's layer in the shell. */
function scrollerOf(el: HTMLElement | null): HTMLElement | null {
  for (let node = el?.parentElement ?? null; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll") return node;
  }
  return null;
}

const visibleTiles = (root: HTMLElement) =>
  [...root.querySelectorAll<HTMLAnchorElement>("a.gw-tile")].filter((tile) => !tile.closest("[hidden]"));
const visibleSections = (root: HTMLElement) => [...root.querySelectorAll<HTMLElement>("section.gw-section:not([hidden])")];

export type GalleryControllerProps = {
  /** The catalog's base path, for Continue's href. */
  base: string;
  total: number;
  sections: readonly ChipSection[];
  /** The sections and the collection entry, server-rendered. */
  children: ReactNode;
};

export function GalleryController({ base, total, sections, children }: GalleryControllerProps) {
  const shell = useShell();
  const wall = useWall();
  const onWall = shell.view === "gallery";
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLElement | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const chipsRef = useRef<HTMLElement>(null);

  /* ── The query: typed here, committed to the location after a pause ── */

  const [text, setText] = useState(wall.q);
  const [seenQ, setSeenQ] = useState(wall.q);
  if (seenQ !== wall.q) {
    // Back, Forward or the palette changed the query: the field follows.
    setSeenQ(wall.q);
    setText(wall.q);
  }
  const [seenCollection, setSeenCollection] = useState(wall.collection);
  if (seenCollection !== wall.collection) {
    // A collection chosen elsewhere (the sidebar's Show only) drops typing still waiting to commit.
    setSeenCollection(wall.collection);
    setText(wall.q);
  }
  const [seenOnWall, setSeenOnWall] = useState(onWall);
  if (seenOnWall !== onWall) {
    // Typing still waiting to commit is dropped when the wall goes (below): the field drops it too.
    setSeenOnWall(onWall);
    if (!onWall) setText(wall.q);
  }
  const commitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // A query or collection that arrives from outside (history, the palette,
  // the sidebar) replaces what was typed, so a commit still pending from that
  // typing must never land on top of it. Leaving the wall drops it too: a
  // filter never commits behind a rule.
  useEffect(() => {
    clearTimeout(commitTimer.current);
  }, [wall.q, wall.collection, onWall]);
  /** Set when the reader changes the filter here; a filter that arrives with the URL keeps its scroll. */
  const ownChange = useRef(false);
  const commitQuery = useCallback(
    (next: string) => {
      clearTimeout(commitTimer.current);
      ownChange.current = true;
      // A search covers the whole catalog, so it replaces a collection.
      wall.setFilter(next.trim() ? { q: next, collection: null } : { q: "" });
    },
    [wall],
  );
  const onText = (next: string) => {
    setText(next);
    clearTimeout(commitTimer.current);
    commitTimer.current = setTimeout(() => commitQuery(next), SEARCH_DEBOUNCE_MS);
  };
  useEffect(() => () => clearTimeout(commitTimer.current), []);

  const clearFilter = useCallback(() => {
    clearTimeout(commitTimer.current);
    ownChange.current = true;
    setText("");
    wall.setFilter({ q: "", collection: null });
  }, [wall]);

  const onSearchKey = (event: KeyboardEvent<HTMLInputElement>) => {
    // Enter and Esc belong to the composition while an input method is composing.
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (event.key === "Enter") {
      event.preventDefault();
      commitQuery(event.currentTarget.value);
      return;
    }
    if (event.key !== "Escape") return;
    event.preventDefault();
    if (text || wall.q) clearFilter();
    else event.currentTarget.blur();
  };

  /* ── Announcements ─────────────────────────────────────────────────── */

  const [message, setMessage] = useState("");
  const say = useCallback((line: string) => setMessage((current) => (current === line ? `${line}\u00a0` : line)), []);
  const filterKey = `${wall.q.trim()}\u0000${wall.collection ?? ""}`;
  const lastFilter = useRef(filterKey);
  const collection = wall.collection ? (collections.find((item) => item.id === wall.collection) ?? null) : null;
  const shown = wall.visible?.size ?? null;
  const takeReveal = wall.takeReveal;
  useEffect(() => {
    if (lastFilter.current === filterKey) return;
    lastFilter.current = filterKey;
    // The reader's own change, here or through Show only; never one from the URL.
    const revealed = takeReveal();
    if (!ownChange.current && !revealed) return;
    ownChange.current = false;
    // A new filter starts at the top of its results.
    if (scroller.current) scroller.current.scrollTop = 0;
    const cleared = !filterKey.replace("\u0000", "");
    const line = cleared
      ? `Showing all ${total} rules`
      : shown === 0
        ? "No rules match"
        : collection && !wall.q.trim()
          ? `${collection.name} collection, ${shown} rules`
          : `${shown} ${shown === 1 ? "rule matches" : "rules match"}`;
    const timer = setTimeout(() => say(line), ANNOUNCE_MS);
    return () => clearTimeout(timer);
  }, [filterKey, shown, collection, wall.q, takeReveal, total, say]);

  /* ── The side ──────────────────────────────────────────────────────── */

  const chooseSide = useCallback(
    (side: GallerySide) => {
      writeSide(side);
      wall.setFilter({ show: side });
      say(side === "dont" ? "Showing Don’t examples" : "Showing Do examples");
    },
    [wall, say],
  );

  /* ── Scroll: the toolbar's hairline and the phone chips' active section ── */

  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(sections[0]?.id ?? null);
  useLayoutEffect(() => {
    scroller.current = scrollerOf(root.current);
  }, []);
  /* The rail moving the sheet's edge: the wall holds its columns and gutters on the way (wall-resize.ts). */
  useLayoutEffect(() => {
    const el = root.current;
    const sheet = el?.closest<HTMLElement>(".shell-sheet");
    if (sheet) settleSheet(sheet);
    if (!onWall || !el) return;
    return registerSheetResizer(wallResizer(el, () => scroller.current));
  }, [onWall]);
  useEffect(() => {
    const sc = scroller.current;
    const el = root.current;
    if (!sc || !el) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      setScrolled(sc.scrollTop > 0);
      if (!shell.phone) return;
      const list = visibleSections(el);
      if (!list.length) return;
      const bar = el.querySelector<HTMLElement>(".gw-bar")?.offsetHeight ?? 0;
      const top = sc.getBoundingClientRect().top;
      // The section holding the top of the view: the last whose heading has
      // passed a line a third of the way down the space under the toolbar.
      const line = top + bar + (sc.clientHeight - bar) / 3;
      let current = list[0];
      for (const section of list) if ((section.querySelector("h2") ?? section).getBoundingClientRect().top <= line) current = section;
      if (sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 4) current = list[list.length - 1];
      setActive(current.dataset.cat ?? null);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    sc.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      sc.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [shell.phone, filterKey]);

  // The active chip slides into view without moving the page, and without
  // the slide when the reader asked for less motion.
  useEffect(() => {
    const row = chipsRef.current;
    const chip = row?.querySelector<HTMLElement>(`[data-cat="${active}"]`);
    if (!row || !chip || row.offsetParent === null) return;
    const left = chip.offsetLeft - 16;
    const right = chip.offsetLeft + chip.offsetWidth + 16 - row.clientWidth;
    const behavior = prefersReducedMotion() ? "auto" : "smooth";
    if (row.scrollLeft > left) row.scrollTo({ left, behavior });
    else if (row.scrollLeft < right) row.scrollTo({ left: right, behavior });
  }, [active]);

  const jumpTo = useCallback((categoryId: string) => {
    const section = root.current?.querySelector<HTMLElement>(`section[id="${CSS.escape(categoryId)}"]:not([hidden])`);
    if (!section) return;
    section.scrollIntoView({ block: "start" });
    setActive(categoryId);
  }, []);

  /* ── Keys ──────────────────────────────────────────────────────────── */

  const focusSearch = useCallback(() => {
    const input = searchRef.current;
    // On phones the field is hidden and the shell's top bar owns search.
    if (!input || input.offsetParent === null) return false;
    input.focus();
    input.select();
    return true;
  }, []);

  const moveFocus = useCallback((direction: 1 | -1, bySection: boolean) => {
    const el = root.current;
    const sc = scroller.current;
    if (!el || !sc) return;
    const tiles = visibleTiles(el);
    if (!tiles.length) return;
    const focused = document.activeElement instanceof Element ? document.activeElement.closest<HTMLAnchorElement>("a.gw-tile") : null;
    let at = focused ? tiles.indexOf(focused) : -1;
    if (at < 0) {
      // Nothing focused yet: start from the first tile under the toolbar.
      const bar = el.querySelector<HTMLElement>(".gw-bar")?.offsetHeight ?? 0;
      const top = sc.getBoundingClientRect().top + bar;
      const first = tiles.findIndex((tile) => tile.getBoundingClientRect().bottom > top);
      at = first < 0 ? 0 : first - (direction === 1 ? 1 : 0);
    }
    let next: HTMLAnchorElement | undefined;
    if (bySection) {
      const list = visibleSections(el);
      const own = tiles[Math.max(0, at)]?.closest("section");
      const index = own ? list.indexOf(own as HTMLElement) : -1;
      // Back goes to the previous category's first tile; in the first, to its own.
      const target = direction === 1 ? list[index + 1] : (list[index - 1] ?? list[index]);
      next = target ? visibleTiles(target)[0] : undefined;
    } else {
      next = tiles[Math.min(tiles.length - 1, Math.max(0, at + direction))];
    }
    if (!next || next === focused) return;
    next.focus({ preventScroll: true });
    next.scrollIntoView({ block: "nearest" });
  }, []);

  const hold = useRef<{ from: GallerySide; held: boolean; timer: ReturnType<typeof setTimeout> } | null>(null);
  const releaseHold = useCallback(() => {
    const pressed = hold.current;
    if (!pressed) return;
    hold.current = null;
    clearTimeout(pressed.timer);
    // Held: it was a look, so the wall goes back. A tap is a choice.
    if (pressed.held) writeSide(pressed.from);
    else chooseSide(other(pressed.from));
  }, [chooseSide]);

  useEffect(() => {
    if (!onWall) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      const action = shortcutAction(event, { view: "gallery", singleKeys: shell.singleKeys });
      switch (action) {
        case "filter":
          if (!focusSearch()) return;
          break;
        case "next":
        case "previous":
        case "nextSection":
        case "previousSection":
          moveFocus(action === "next" || action === "nextSection" ? 1 : -1, action.endsWith("Section"));
          break;
        case "side": {
          if (hold.current) break;
          const from = readSide();
          // The other side paints on keydown: a held D is a look, a tap a switch.
          writeSide(other(from));
          const pressed = { from, held: false, timer: setTimeout(() => (pressed.held = true), HOLD_MS) };
          hold.current = pressed;
          break;
        }
        case "escape":
          if (shell.peek.current?.isOpen() || (!wall.q && !wall.collection)) return;
          clearFilter();
          break;
        default:
          return;
      }
      event.preventDefault();
    };
    const onKeyUp = (event: globalThis.KeyboardEvent) => {
      if (event.key.toLowerCase() === "d") releaseHold();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", releaseHold);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", releaseHold);
      // The wall went away mid-press (a rule opened): settle it as the release would.
      releaseHold();
    };
  }, [onWall, shell.singleKeys, shell.peek, wall.q, wall.collection, focusSearch, moveFocus, releaseHold, clearFilter]);

  /* ── Continue: offered once per load, until the reader opens a rule ── */

  const continueId = useSyncExternalStore(
    catalogStores.continueRule.subscribe,
    catalogStores.continueRule.get,
    catalogStores.continueRule.server,
  );
  const [opened, setOpened] = useState(false);
  if (!onWall && !opened) setOpened(true);
  const routes = createRoutes(base);
  const continueTitle = continueId ? titleOf.get(continueId) : undefined;
  const continueRule =
    continueId && continueTitle && !opened ? { id: continueId, title: continueTitle, href: routes.ruleHref(continueId) } : null;

  /* ── A collection link on the wall filters in place ─────────────────── */

  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element).closest<HTMLAnchorElement>("a[data-collection]");
    if (!link) return;
    event.preventDefault();
    clearTimeout(commitTimer.current);
    ownChange.current = true;
    setText("");
    wall.setFilter({ q: "", collection: link.dataset.collection ?? null });
  };

  // A collection's chips are its groups, matching the sections it shows.
  const grouped = shownCollection(wall);
  const chips: readonly ChipSection[] = grouped
    ? grouped.groups.map((group, index) => ({ id: groupSectionId(grouped, index), short: group.label ?? grouped.name, ruleIds: group.ruleIds, plain: true }))
    : sections;

  const empty = shown === 0;
  return (
    <div ref={root} data-wall="" className="gw" data-filtered={wall.visible ? "" : undefined} data-empty={empty || undefined} onClick={onClick}>
      <Toolbar
        total={total}
        visible={wall.visible}
        sections={chips}
        active={active}
        scrolled={scrolled}
        text={text}
        query={wall.q}
        collection={collection ? { id: collection.id, name: collection.name } : null}
        continueRule={continueRule}
        singleKeys={shell.singleKeys}
        modKey={shell.modKey}
        onOpenPalette={shell.openPalette}
        searchRef={searchRef}
        chipsRef={chipsRef}
        onText={onText}
        onSearchKey={onSearchKey}
        onClear={clearFilter}
        onJump={jumpTo}
        onChooseSide={chooseSide}
      />
      <div className="gw-wall">
        {empty ? (
          <div className="gw-empty">
            <p className="gw-empty-title">No rules match “{wall.q.trim()}”</p>
            <p>Try one word, like “tracking”.</p>
            <button type="button" className="gw-empty-clear" onClick={clearFilter}>
              Clear search
            </button>
          </div>
        ) : null}
        {children}
      </div>
      <div className="gw-float">
        <SideSwitch variant="capsule" keyHint={false} onChoose={chooseSide} />
      </div>
      <p role="status" className="sr-only">
        {message}
      </p>
    </div>
  );
}
