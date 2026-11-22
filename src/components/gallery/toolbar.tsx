// design-system: strict
"use client";

/* The desktop wall toolbar. Its h1 also names the wall on phones. */

import { CornerDownRight, Search, X } from "@/components/ui/icons";
import type { KeyboardEvent, RefObject } from "react";

import { CategoryIcon } from "@/components/ui/category-icon";
import { Kbd } from "@/components/ui/kbd";
import type { GallerySide } from "@/lib/navigation/routes";

import { SideSwitch } from "./side-switch";

export type ToolbarProps = {
  total: number;
  /** The wall's filter as a set, or null for every rule. */
  visible: ReadonlySet<string> | null;
  scrolled: boolean;
  text: string;
  /** The committed query: used to name the results. */
  query: string;
  collection: { id: string; name: string } | null;
  continueRule: { id: string; title: string; href: string } | null;
  singleKeys: boolean;
  /** "⌘" or "Ctrl ": ⌘K opens the palette, which an empty field opens too, so its keycap names it. */
  modKey: string;
  /** The ⌘K palette: a click into the empty field opens it (`/` still types here). */
  /** Opens the ⌘K palette; its close returns focus to `returnTo` when given. */
  onOpenPalette: (returnTo?: HTMLElement | null) => void;
  searchRef: RefObject<HTMLInputElement | null>;
  onText: (text: string) => void;
  onSearchKey: (event: KeyboardEvent<HTMLInputElement>) => void;
  onClear: () => void;
  onChooseSide: (side: GallerySide) => void;
};

export function Toolbar({
  total,
  visible,
  scrolled,
  text,
  query,
  collection,
  continueRule,
  singleKeys,
  modKey,
  onOpenPalette,
  searchRef,
  onText,
  onSearchKey,
  onClear,
  onChooseSide,
}: ToolbarProps) {
  const shown = visible ? visible.size : total;
  const filtered = visible !== null;
  const typed = query.trim();

  return (
    <header className="gw-bar" data-scrolled={scrolled || undefined}>
      <h1 className="gw-h1">{typed ? "Search results" : collection?.name ?? "All rules"}</h1>
      <span className="gw-count gw-desk">
        {filtered ? `${shown} of ${total} rules` : `${total} rules`}
      </span>
      {collection ? (
        <button type="button" className="gw-pill gw-desk" aria-label={`${collection.name} collection, show all rules`} onClick={onClear}>
          <CategoryIcon categoryId={collection.id} className="gw-pill-icon" />
          <span>{collection.name}</span>
          <X aria-hidden="true" />
        </button>
      ) : null}
      {continueRule && !filtered ? (
        <a className="gw-continue gw-desk" href={continueRule.href} data-rule-link="">
          <CornerDownRight aria-hidden="true" />
          <span>Continue · {continueRule.title}</span>
        </a>
      ) : null}
      <span className="gw-spacer gw-desk" />
      {/* Empty, the field is the palette's front door, the keycap included: the
          press is held so focus stays put, and the click (a label forwards one
          from the keycap) opens the palette, returning to the field after.
          `/` still focuses the field itself, for filtering in place. With a
          query, a click edits it. */}
      <label
        className="gw-search gw-desk"
        onPointerDown={(event) => {
          if (text || event.button !== 0) return;
          event.preventDefault();
        }}
        onClick={(event) => {
          if (text) return;
          event.preventDefault();
          onOpenPalette(searchRef.current);
        }}
      >
        <Search aria-hidden="true" />
        <input
          aria-label={`Search ${total} rules`}
          ref={searchRef}
          type="search"
          value={text}
          placeholder={`Search ${total} rules`}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          onChange={(event) => onText(event.target.value)}
          onKeyDown={onSearchKey}
        />
        {text ? (
          <button type="button" className="gw-search-clear" aria-label="Clear search" onClick={onClear}>
            <X aria-hidden="true" />
          </button>
        ) : (
          <Kbd className="gw-search-key">{modKey}K</Kbd>
        )}
      </label>
      <span className="gw-desk">
        <SideSwitch variant="bar" keyHint={singleKeys} onChoose={onChooseSide} />
      </span>

    </header>
  );
}
