// design-system: strict
"use client";

/*
 * A collection on the wall, in its own groups and its own order: the order
 * its deck pages in, so J/K on the wall and in the rule view walk the same
 * sequence. The tiles are the wall's own server-rendered elements, handed in
 * once; while a collection is on, its tiles render here and their category
 * gates stay empty, so every tile is in the document once.
 */

import type { ReactNode } from "react";

import { groupSectionId, shownCollection, useWall } from "./wall-context";

export function CollectionSections({ tiles }: { tiles: Readonly<Record<string, ReactNode>> }) {
  const wall = useWall();
  const collection = shownCollection(wall);
  if (!collection) return null;
  return collection.groups.map((group, index) => {
    const id = groupSectionId(collection, index);
    const heading = `${id}-heading`;
    const count = group.ruleIds.length;
    return (
      <section key={id} id={id} data-cat={id} className="gw-section" aria-labelledby={heading}>
        <div className="gw-section-head">
          <h2 id={heading}>{group.label ?? collection.name}</h2>
          <span className="gw-section-count">
            {count} {count === 1 ? "rule" : "rules"}
          </span>
        </div>
        <ul className="gw-grid">
          {group.ruleIds.map((ruleId) => (
            <li key={ruleId} className="gw-gate" data-gate={ruleId}>
              {tiles[ruleId]}
            </li>
          ))}
        </ul>
      </section>
    );
  });
}
