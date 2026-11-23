// design-system: strict
"use client";

/*
 * The title opens the rules menu. Its real href also reaches the current
 * deck's wall before hydration or in a new tab. The visible title and count
 * lead its accessible name. It opens on Space as well as Enter, like the
 * button it acts as. Esc on a rule still returns to its tile.
 */

import { CategoryIcon } from "@/components/ui/category-icon";
import { ChevronDown, Search } from "@/components/ui/icons";
import { useCallback, useLayoutEffect, useRef, type MouseEvent, type RefObject } from "react";

import { collections, railCategory, railOrder } from "@/data/taxonomy";
import { deckPosition } from "@/lib/navigation/deck";
import type { CatalogRoutes } from "@/lib/navigation/routes";
import { useShell } from "./shell-context";

const TOTAL = railOrder.length;
/** Keep the title in place until its height has scrolled past. */
const HIDE_AFTER = 52;
const DIRECTION_TRAVEL = 32;

const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

type PhoneBarProps = {
  routes: CatalogRoutes;
  menuOpen: boolean;
  onMenu: () => void;
};

export function PhoneBar({ routes, menuOpen, onMenu }: PhoneBarProps) {
  const { view, ruleId, deck, openPalette } = useShell();
  const position = view === "rule" && ruleId ? deckPosition(deck, ruleId) : null;
  const deckName =
    deck.kind === "search"
      ? `“${deck.q ?? ""}”`
      : deck.kind === "collection"
        ? (collections.find((item) => item.id === deck.collection)?.name ?? "All rules")
        : null;

  let name: string;
  let count: string;
  if (position) {
    name = deckName ?? railCategory(position.category).short;
    count = position.label;
  } else {
    name = deckName ?? "All rules";
    count = deck.kind === "search" ? `${deck.rules.length} of ${TOTAL}` : String(deck.rules.length);
  }

  return (
    <nav className="phone-bar" aria-label="Catalog">
      <a
        className="phone-loc"
        href={routes.galleryHref({ q: deck.q, collection: deck.collection })}
        aria-label={`${name} ${count}, open rules menu`}
        aria-haspopup="dialog"
        aria-expanded={menuOpen}
        onClick={(event) => {
          if (!isPlainClick(event)) return;
          event.preventDefault();
          event.currentTarget.focus({ preventScroll: true });
          onMenu();
        }}
        onKeyDown={(event) => {
          // It works as a button here, so Space opens the menu as Enter does, instead of scrolling the page.
          if (event.key !== " " || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
          event.preventDefault();
          if (!event.repeat) onMenu();
        }}
      >
        {position ? <CategoryIcon categoryId={position.category} className="size-5" /> : null}
        <span className="phone-loc-name">{name}</span>
        <ChevronDown aria-hidden="true" className="phone-loc-chevron" />
        <span className="phone-loc-count">{count}</span>
      </a>
      <button
        type="button"
        className="shell-ctl phone-ctl"
        aria-label={`Search ${TOTAL} rules`}
        aria-haspopup="dialog"
        onClick={(event) => {
          event.currentTarget.focus({ preventScroll: true });
          openPalette();
        }}
      >
        <Search aria-hidden="true" />
      </button>
    </nav>
  );
}

/** Track travel from the last turning point, so small reversals never reveal the bar. */
export function usePhoneChrome(rootRef: RefObject<HTMLElement | null>, active: boolean, ruleId: string | null) {
  const state = useRef({ anchor: 0, min: false });
  useLayoutEffect(() => {
    const el = rootRef.current;
    const scroller = el?.querySelector<HTMLElement>(ruleId ? ".shell-sheet" : ".shell-wall");
    const reset = () => {
      const y = scroller?.scrollTop ?? 0;
      state.current = { anchor: y, min: false };
      el?.removeAttribute("data-chrome-min");
      el?.toggleAttribute("data-chrome-scrolled", active && y > 0);
    };
    reset();
    if (!active) return;
    // The wall restores its tile after the shell's layout effect. Start
    // measuring from that restored position and from the new layout on rotation.
    const frame = requestAnimationFrame(reset);
    let width = window.innerWidth;
    const onResize = () => {
      if (width === window.innerWidth) return;
      width = window.innerWidth;
      reset();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, [rootRef, active, ruleId]);

  // Stable: the shell API memo depends on it through `home`.
  return useCallback((scroller: HTMLElement, reveal = false) => {
    const el = rootRef.current;
    if (!active || !el) return;
    const y = Math.max(0, scroller.scrollTop);
    const s = state.current;
    el.toggleAttribute("data-chrome-scrolled", y > 0);
    if (reveal || y < HIDE_AFTER || y + scroller.clientHeight >= scroller.scrollHeight - 2) {
      s.min = false;
      s.anchor = y;
    } else if (s.min) {
      s.anchor = Math.max(s.anchor, y);
      if (s.anchor - y >= DIRECTION_TRAVEL) {
        s.min = false;
        s.anchor = y;
      }
    } else {
      s.anchor = Math.min(s.anchor, y);
      // Within a bar's height of the end, the end-of-page reveal above would
      // undo a hide a frame later: the bar would dip and snap back.
      const nearEnd = y + scroller.clientHeight >= scroller.scrollHeight - (HIDE_AFTER + DIRECTION_TRAVEL);
      if (!nearEnd && y - s.anchor >= DIRECTION_TRAVEL) {
        s.min = true;
        s.anchor = y;
      }
    }
    el.toggleAttribute("data-chrome-min", s.min);
  }, [rootRef, active]);
}
