// design-system: strict
"use client";

/*
 * The phone's top bar (PHONE_QUERY; CSS shows it, so the first paint is
 * already right): Menu, where you are, and Search.
 *
 * On the wall the middle says what the wall shows ("All rules · 105"). On a
 * rule it is Up: back to the wall at this rule's tile, as Esc is. It is a
 * real link to the wall, so it works before hydration and in a new tab, and
 * its name starts with what it shows (WCAG 2.5.3): "Motion · 7 of 29, back to
 * all rules". The name truncates; the count never does.
 *
 * `usePhoneChrome` is the reading mode: scrolling down a rule tucks the
 * bottom strip's category row away (and, held sideways, the top bar too), and
 * scrolling up or reaching the end brings it back.
 */

import { ChevronLeft, Menu, Search } from "lucide-react";
import { useCallback, useEffect, useRef, type MouseEvent, type RefObject } from "react";

import { collections, railCategory, railOrder } from "@/data/taxonomy";
import { deckPosition } from "@/lib/navigation/deck";
import type { CatalogRoutes } from "@/lib/navigation/routes";
import { useShell } from "./shell-context";

const TOTAL = railOrder.length;
/** Scroll this far in one direction before the reading mode changes. */
const CHROME_DY = 6;

const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

type PhoneBarProps = {
  routes: CatalogRoutes;
  menuOpen: boolean;
  onMenu: () => void;
};

export function PhoneBar({ routes, menuOpen, onMenu }: PhoneBarProps) {
  const { view, ruleId, deck, exit, openPalette } = useShell();
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
    <div className="phone-bar">
      <button
        type="button"
        className="shell-ctl phone-ctl"
        aria-label="Menu"
        aria-haspopup="dialog"
        aria-expanded={menuOpen}
        onClick={(event) => {
          event.currentTarget.focus({ preventScroll: true });
          onMenu();
        }}
      >
        <Menu aria-hidden="true" />
      </button>
      {position ? (
        <a
          className="phone-loc phone-up"
          href={routes.galleryHref({ q: deck.q, collection: deck.collection })}
          aria-label={`${name} · ${count}, back to all rules`}
          onClick={(event) => {
            if (!isPlainClick(event)) return;
            event.preventDefault();
            exit(event.detail === 0 ? "keyboard" : "pointer");
          }}
        >
          <ChevronLeft aria-hidden="true" />
          <span className="phone-loc-name">{name}</span>
          <span className="phone-loc-count">
            <span className="phone-loc-sep">· </span>
            {count}
          </span>
        </a>
      ) : (
        <p className="phone-loc">
          <span className="phone-loc-name">{name}</span>
          <span className="phone-loc-count">
            <span className="phone-loc-sep">· </span>
            {count}
          </span>
        </p>
      )}
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
    </div>
  );
}

/**
 * The reading mode, on `data-chrome-min` of the shell root: written straight
 * to the DOM, so a scroll never re-renders. Returns the sheet's scroll
 * handler. Off the phone layout, or off a rule, it stays cleared.
 */
export function usePhoneChrome(root: RefObject<HTMLElement | null>, active: boolean, ruleId: string | null) {
  const state = useRef({ y: 0, min: false });
  const set = useCallback(
    (min: boolean) => {
      if (state.current.min === min) return;
      state.current.min = min;
      root.current?.toggleAttribute("data-chrome-min", min);
    },
    [root],
  );

  // A new rule, or leaving the phone layout, starts with everything shown.
  useEffect(() => {
    state.current.y = 0;
    set(false);
  }, [active, ruleId, set]);

  return useCallback(
    (sheet: HTMLElement) => {
      if (!active || !ruleId) return;
      const s = state.current;
      const y = sheet.scrollTop;
      const atEnd = y + sheet.clientHeight >= sheet.scrollHeight - 2;
      if (atEnd || y <= 0) {
        set(false);
        s.y = y;
      } else if (y - s.y > CHROME_DY) {
        set(true);
        s.y = y;
      } else if (s.y - y > CHROME_DY) {
        set(false);
        s.y = y;
      }
    },
    [active, ruleId, set],
  );
}
