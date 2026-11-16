// design-system: strict
"use client";

/*
 * The wall's filter, applied without re-rendering a single preview. Tiles and
 * sections are server markup; these wrappers only toggle `hidden` on them
 * from the wall's deck, so a search or a collection hides what it leaves out
 * and the rest of the wall keeps its DOM, its scroll and its settled scenes.
 *
 * Everything that walks the wall (J/K, the reveal on return, scroll-spy)
 * skips `[hidden]`, so the visible tiles are the deck, in deck order. A
 * collection is the one deck not in rail order: its tiles move to the
 * collection's own sections (collection-sections.tsx), and their gates here
 * stay hidden and empty.
 */

import type { ReactNode } from "react";

import { shownCollection, useWall } from "./wall-context";

export function TileGate({ id, children }: { id: string; children: ReactNode }) {
  const wall = useWall();
  const { visible } = wall;
  const moved = shownCollection(wall)?.ruleIds.includes(id) ?? false;
  return (
    <li className="gw-gate" data-gate={id} hidden={moved || (visible !== null && !visible.has(id))}>
      {moved ? null : children}
    </li>
  );
}

type SectionGateProps = {
  id: string;
  ruleIds: readonly string[];
  labelledBy: string;
  children: ReactNode;
};

/** A category section, hidden when the filter leaves none of its rules. Its id is the bare category id. */
export function SectionGate({ id, ruleIds, labelledBy, children }: SectionGateProps) {
  const wall = useWall();
  const { visible } = wall;
  // A collection shows its own groups as the sections.
  const hidden = shownCollection(wall) !== null || (visible !== null && !ruleIds.some((ruleId) => visible.has(ruleId)));
  return (
    <section id={id} data-cat={id} className="gw-section" aria-labelledby={labelledBy} hidden={hidden}>
      {children}
    </section>
  );
}

/** "12 rules", or "2 of 12 rules" while a filter is on. */
export function SectionCount({ ruleIds }: { ruleIds: readonly string[] }) {
  const { visible } = useWall();
  const total = ruleIds.length;
  if (visible === null) return <span className="gw-section-count">{total} rules</span>;
  const shown = ruleIds.filter((ruleId) => visible.has(ruleId)).length;
  return (
    <span className="gw-section-count">
      {shown} of {total} {total === 1 ? "rule" : "rules"}
    </span>
  );
}
