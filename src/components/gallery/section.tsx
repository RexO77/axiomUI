// design-system: strict

/*
 * One rail category on the wall: its heading and one continuous grid of
 * tiles. Sub-groups stay in the sidebar, so a short group never strands a
 * tile and leaves a hole in the wall.
 */

import type { ReactNode } from "react";

import { CategoryIcon } from "@/components/ui/category-icon";
import type { RailCategory } from "@/data/taxonomy";

import { SectionCount, SectionGate, TileGate } from "./tile-gate";

/** `tiles` holds the wall's one tile element per rule, shared with the collection sections. */
export function Section({ category, tiles }: { category: RailCategory; tiles: ReadonlyMap<string, ReactNode> }) {
  const heading = `${category.id}-heading`;
  const ruleIds = category.rules.map((rule) => rule.id);
  return (
    <SectionGate id={category.id} ruleIds={ruleIds} labelledBy={heading}>
      <div className="gw-section-head">
        <h2 id={heading}>
          <CategoryIcon categoryId={category.id} className="gw-section-icon" />
          {category.name}
        </h2>
        <SectionCount ruleIds={ruleIds} />
      </div>
      <ul className="gw-grid">
        {category.rules.map((rule) => (
          <TileGate key={rule.id} id={rule.id}>
            {tiles.get(rule.id)}
          </TileGate>
        ))}
      </ul>
    </SectionGate>
  );
}
