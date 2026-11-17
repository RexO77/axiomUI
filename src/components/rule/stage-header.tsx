// design-system: strict
"use client";

/*
 * The rule view's header row: the breadcrumb back to all rules, the pager,
 * the deck it pages, search, Copy rule ▾ and the deep-dive toggle. One 48px
 * row on one 32px control height; phones hide it, because their top bar and
 * bottom strip carry the same jobs.
 *
 * - The breadcrumb names the rail category, so a re-homed Accessibility rule
 *   reads System or Color, as the rail does.
 * - Pager arrows name the next category only in the catalog deck; a search or
 *   collection deck's category runs are partial.
 * - It never speaks: the shell's one live region announces a page turn, and
 *   the shell sets document.title.
 */

import { ChevronLeft, ChevronRight, PanelRightClose, PanelRightOpen, Search, X } from "lucide-react";
import type { MouseEvent } from "react";

import { useShell } from "@/components/shell/shell-context";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Kbd } from "@/components/ui/kbd";
import { Tooltip } from "@/components/ui/tooltip";
import { collections, railCategory, railCategoryOf } from "@/data/taxonomy";
import { rules, type Rule } from "@/data/ui-logic";
import { deckNeighbours, deckPosition } from "@/lib/navigation/deck";
import { proseLoader } from "@/lib/prose-loader";
import { CopyMenu } from "./copy-menu";
import { DEEP_DIVE_ID } from "./inspector";

const originOf = (event: MouseEvent) => (event.detail === 0 ? "keyboard" : "pointer");

export function StageHeader({ rule }: { rule: Rule }) {
  const shell = useShell();
  const { deck, inspectorOpen, singleKeys } = shell;
  const { prev, next } = deckNeighbours(deck, rule.id);
  const position = deckPosition(deck, rule.id);
  const category = railCategory(railCategoryOf(rule));

  // Paging across a category edge names the category, as the Next row does: catalog deck only.
  const crossing = (to: Rule | null) =>
    to && deck.kind === "catalog" && railCategoryOf(to) !== category.id ? railCategory(railCategoryOf(to)).name : null;
  const prevCategory = crossing(prev);
  const nextCategory = crossing(next);
  const prevName = prev ? (prevCategory ? `Previous category: ${prevCategory}` : `Previous rule: ${prev.title}`) : "No previous rule";
  const nextName = next ? (nextCategory ? `Next category: ${nextCategory}` : `Next rule: ${next.title}`) : "No next rule";
  const keyHint = (key: string) => (singleKeys ? ` (${key})` : "");

  const deckLabel =
    deck.kind === "search"
      ? `“${deck.q}”`
      : deck.kind === "collection"
        ? (collections.find((item) => item.id === deck.collection)?.name ?? "")
        : null;

  return (
    <header className="rv-head" data-scrolled={shell.scrolled || undefined} data-deep={inspectorOpen || undefined}>
      {/* Back to the wall at this rule's tile. The name says where it goes after the visible text. */}
      <button
        type="button"
        className="shell-ctl rv-crumb"
        aria-label={`${category.name}, all rules`}
        onClick={(event) => shell.exit(originOf(event))}
      >
        <CategoryIcon categoryId={category.id} className="size-4" />
        <span>{category.name}</span>
      </button>
      <div className="rv-pager" data-deck={deck.kind === "catalog" ? undefined : ""}>
        <Tooltip content={prev ? `${prevCategory ? prevName : prev.title}${keyHint("K")}` : prevName} side="bottom">
          <button
            type="button"
            className="rv-ctl"
            data-sq=""
            disabled={!prev}
            aria-label={prevName}
            onPointerEnter={() => proseLoader.prefetch(prev?.id)}
            onFocus={() => proseLoader.prefetch(prev?.id)}
            onClick={() => shell.page(-1)}
          >
            <ChevronLeft aria-hidden="true" />
          </button>
        </Tooltip>
        <p className="rv-pager-count">
          {deck.kind === "catalog" ? "" : "match "}
          {position?.label}
        </p>
        <Tooltip content={next ? `${nextCategory ? nextName : next.title}${keyHint("J")}` : nextName} side="bottom">
          <button
            type="button"
            className="rv-ctl"
            data-sq=""
            disabled={!next}
            aria-label={nextName}
            onPointerEnter={() => proseLoader.prefetch(next?.id)}
            onFocus={() => proseLoader.prefetch(next?.id)}
            onClick={() => shell.page(1)}
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </Tooltip>
      </div>
      {deckLabel ? (
        <button
          type="button"
          className="rv-deckq"
          onClick={shell.clearDeck}
          aria-label={`Paging through ${deck.kind === "search" ? `matches for ${deckLabel}` : deckLabel}. Page through all rules instead`}
        >
          <span>{deckLabel}</span>
          <X aria-hidden="true" />
        </button>
      ) : null}
      <span className="rv-spacer" />
      <button type="button" className="rv-ctl rv-ctl-search" onClick={(event) => {
        event.currentTarget.focus({ preventScroll: true });
        shell.openPalette();
      }} aria-label={`Search ${rules.length} rules`}>
        <Search aria-hidden="true" />
        <span>Search</span>
        <Kbd>{shell.modKey}K</Kbd>
      </button>
      <CopyMenu key={rule.id} rule={rule} />
      <Tooltip content={`${inspectorOpen ? "Hide" : "Show"} deep dive${keyHint("I")}`} side="bottom">
        <button
          type="button"
          className="rv-ctl"
          data-sq=""
          aria-label="Deep dive"
          aria-expanded={inspectorOpen}
          aria-controls={DEEP_DIVE_ID}
          onClick={shell.toggleInspector}
        >
          {inspectorOpen ? <PanelRightClose aria-hidden="true" /> : <PanelRightOpen aria-hidden="true" />}
        </button>
      </Tooltip>
    </header>
  );
}
