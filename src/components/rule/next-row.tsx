// design-system: strict
"use client";

/*
 * Next: an h2 like Related's, then one row, title and position on the left,
 * J and the arrow on the right.
 *
 * - Catalog deck: crossing into another rail category names it ("Next
 *   category", with its rule count). Only the catalog has category handoffs:
 *   a search or collection deck's category runs are partial.
 * - Search and collection decks: "Next" with the rule's title, and "match n
 *   of N" through the deck.
 * - The last rule, or the last match, leads back to all rules. Its counts come
 *   from the data, never a literal.
 */

import { ArrowRight } from "@/components/ui/icons";
import { useId, type ReactNode } from "react";

import { useShell } from "@/components/shell/shell-context";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Kbd } from "@/components/ui/kbd";
import { railCategories, railCategory } from "@/data/taxonomy";
import { rules } from "@/data/ui-logic";
import { categoryHandoff, deckNeighbours, deckPosition } from "@/lib/navigation/deck";
import { proseLoader } from "@/lib/prose-loader";
import { plainClick } from "./related";

export const CATALOG_SUMMARY = `${rules.length} rules in ${railCategories.length} categories`;

export function NextRow({ ruleId }: { ruleId: string }) {
  const shell = useShell();
  const uid = useId();
  const { deck, singleKeys } = shell;
  const { next } = deckNeighbours(deck, ruleId);
  const handoff = categoryHandoff(deck, ruleId);
  const catalog = deck.kind === "catalog";

  let heading: string;
  let card: ReactNode;
  if (!next) {
    heading = deck.kind === "search" ? "That’s the last match" : "That’s the last rule";
    card = (
      <button type="button" className="rv-nextcard" onClick={(event) => shell.home(null, event.detail === 0 ? "keyboard" : "pointer")}>
        <span className="rv-nc-body">
          <span className="rv-nc-title">
            <span>Back to all rules</span>
          </span>
          <span className="rv-nc-meta">{CATALOG_SUMMARY}</span>
        </span>
        <span className="rv-nc-go">
          <ArrowRight aria-hidden="true" className="rv-nc-arrow" />
        </span>
      </button>
    );
  } else {
    heading = handoff ? "Next category" : "Next";
    const position = deckPosition(deck, next.id);
    const short = position ? railCategory(position.category).short : "";
    const meta = handoff
      ? `${handoff.count} ${handoff.count === 1 ? "rule" : "rules"}`
      : catalog
        ? `${short} · ${position?.label ?? ""}`
        : `${short} · match ${position?.label ?? ""}`;
    card = (
      <a
        className="rv-nextcard"
        href={shell.hrefFor(next.id)}
        aria-keyshortcuts={singleKeys ? "J" : undefined}
        onPointerEnter={() => proseLoader.prefetch(next.id)}
        onFocus={() => proseLoader.prefetch(next.id)}
        onClick={(event) => {
          if (!plainClick(event)) return;
          event.preventDefault();
          shell.page(1);
        }}
      >
        <span className="rv-nc-body">
          <span className="rv-nc-title">
            {handoff ? (
              <>
                <CategoryIcon categoryId={handoff.category} className="size-4" />
                <span>{handoff.name}</span>
              </>
            ) : (
              <span>{next.title}</span>
            )}
          </span>
          <span className="rv-nc-meta">{meta}</span>
        </span>
        <span className="rv-nc-go">
          {singleKeys ? <Kbd>J</Kbd> : null}
          <ArrowRight aria-hidden="true" className="rv-nc-arrow" />
        </span>
      </a>
    );
  }

  return (
    <section className="rv-next" aria-labelledby={`${uid}-h`}>
      <h2 id={`${uid}-h`}>{heading}</h2>
      {card}
    </section>
  );
}
