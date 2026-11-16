// design-system: strict
"use client";

/*
 * The wall's sticky toolbar. One header, two layouts, picked by CSS on the
 * phone query so the first paint is already right:
 *
 *   desktop  title, count, Continue · search, Do/Don't
 *   phone    one row of category chips that jump (never filter), led by a
 *            chip that clears the search or collection when one is on. The
 *            phone shell's top bar owns search; the Do/Don't switch floats
 *            at the bottom of the wall.
 *
 * It holds no state: GalleryController owns the query, the side and the
 * active category, and passes them in.
 */

import { CornerDownRight, Search, X } from "lucide-react";
import type { KeyboardEvent, RefObject } from "react";

import { CategoryIcon } from "@/components/ui/category-icon";
import { Kbd } from "@/components/ui/kbd";
import type { GallerySide } from "@/lib/navigation/routes";

import { SideSwitch } from "./side-switch";

/** A chip's section: a rail category, or (`plain`, no icon) a collection's group. */
export type ChipSection = { id: string; short: string; ruleIds: readonly string[]; plain?: boolean };

export type ToolbarProps = {
  total: number;
  /** The wall's filter as a set, or null for every rule. */
  visible: ReadonlySet<string> | null;
  sections: readonly ChipSection[];
  /** The scroll-spy's section, for the phone chips. */
  active: string | null;
  scrolled: boolean;
  text: string;
  /** The committed query: the phone's clear chip names it. */
  query: string;
  collection: { id: string; name: string } | null;
  continueRule: { id: string; title: string; href: string } | null;
  singleKeys: boolean;
  searchRef: RefObject<HTMLInputElement | null>;
  chipsRef: RefObject<HTMLElement | null>;
  onText: (text: string) => void;
  onSearchKey: (event: KeyboardEvent<HTMLInputElement>) => void;
  onClear: () => void;
  onJump: (categoryId: string) => void;
  onChooseSide: (side: GallerySide) => void;
};

export function Toolbar({
  total,
  visible,
  sections,
  active,
  scrolled,
  text,
  query,
  collection,
  continueRule,
  singleKeys,
  searchRef,
  chipsRef,
  onText,
  onSearchKey,
  onClear,
  onJump,
  onChooseSide,
}: ToolbarProps) {
  const shown = visible ? visible.size : total;
  const filtered = visible !== null;
  const chips = filtered ? sections.filter((section) => section.ruleIds.some((id) => visible.has(id))) : sections;
  const typed = query.trim();

  return (
    <header className="gw-bar" data-scrolled={scrolled || undefined}>
      <h1 className="gw-h1">All rules</h1>
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
      <label className="gw-search gw-desk">
        <span className="sr-only">Search rules</span>
        <Search aria-hidden="true" />
        <input
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
        ) : singleKeys ? (
          <Kbd className="gw-search-key">/</Kbd>
        ) : null}
      </label>
      <span className="gw-desk">
        <SideSwitch variant="bar" keyHint={singleKeys} onChoose={onChooseSide} />
      </span>

      <nav ref={chipsRef} className="gw-chips" aria-label="Jump to a category">
        {typed || collection ? (
          <button
            type="button"
            className="gw-chip gw-chip-clear"
            aria-label={typed ? `Clear search “${typed}”` : `${collection?.name} collection, show all rules`}
            onClick={onClear}
          >
            <span>{typed ? `“${typed}”` : collection?.name}</span>
            <X aria-hidden="true" />
          </button>
        ) : null}
        {chips.map((section) => {
          const count = filtered ? section.ruleIds.filter((id) => visible.has(id)).length : section.ruleIds.length;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="gw-chip"
              data-cat={section.id}
              aria-current={active === section.id ? "true" : undefined}
              onClick={(event) => {
                event.preventDefault();
                onJump(section.id);
              }}
            >
              {section.plain ? null : <CategoryIcon categoryId={section.id} className="gw-chip-icon" />}
              <span>{section.short}</span>
              <span className="gw-chip-count">{count}</span>
            </a>
          );
        })}
      </nav>
    </header>
  );
}
