// design-system: strict
"use client";

/*
 * One rule owns the sheet: the header row, the title and summary,
 * the comparison,
 * Copy rule ▾ on phones, the deep dive with Related at its foot, Before
 * you ship, and Next. One scrolling surface: the sheet.
 *
 * One grid. With the sheet ≥ 1160px and the deep dive shown, the main column,
 * Before you ship and Next sit on the left and the deep dive with Related on
 * the right, one block capped at 1480 and centred, the hairline between them
 * running its full height. Below that, or with the dive hidden, the side
 * column is a pass-through and rule.css orders main, deep dive, Before you
 * ship, Related, Next; the focusable parts keep DOM order.
 *
 * The prose arrives as props. On the rule the document loaded, CatalogApp
 * hands in the server-rendered Inspector as `seed`; every other rule renders
 * an Inspector that reads the loader, and the deck neighbours are prefetched
 * so J/K finds their prose already here.
 *
 * The title and the counter follow the key press; the comparison and the
 * deep dive follow a beat later (useDeferredValue), so a page turn is never
 * held up by the heavier half.
 */

import { Fragment, useDeferredValue, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";

import { useShell } from "@/components/shell/shell-context";
import { rules } from "@/data/ui-logic";
import { deckNeighbours } from "@/lib/navigation/deck";
import { proseLoader } from "@/lib/prose-loader";
import { Comparison } from "./comparison";
import { CopyMenu } from "./copy-menu";
import { cancelDeepDive } from "./deep-dive-motion";
import { Inspector } from "./inspector";
import { NextRow } from "./next-row";
import { Prose } from "./prose";
import { StageHeader } from "./stage-header";
import "./rule.css";

const ruleById = new Map(rules.map((rule) => [rule.id, rule]));

export type StageProps = {
  ruleId: string;
  /** The server-rendered Inspector of the landing rule, passed only while that rule is shown. */
  seed?: ReactNode;
};

export function Stage({ ruleId, seed = null }: StageProps) {
  const { deck } = useShell();
  const root = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const el = root.current;
    return () => cancelDeepDive(el);
  }, [ruleId]);
  const rule = ruleById.get(ruleId);
  const shown = useDeferredValue(rule);
  const shownId = shown?.id ?? null;

  // The rule on screen loads (unless its seed or the cache has it), and its neighbours warm.
  useEffect(() => {
    if (!shownId) return;
    proseLoader.show(shownId);
    const { prev, next } = deckNeighbours(deck, shownId);
    proseLoader.prefetch(next?.id);
    proseLoader.prefetch(prev?.id);
  }, [shownId, deck]);

  if (!rule || !shown) return null;
  const seeded = seed !== null && shown.id === rule.id;

  return (
    <article ref={root} className="shell-rule rv" aria-labelledby="rule-title">
      <StageHeader rule={rule} />
      <div className="rv-stage">
        <div className="rv-main">
          <h1 id="rule-title" className="rv-title" data-rule-title="" tabIndex={-1}>
            {rule.title}
          </h1>
          <p className="rv-summary">
            <Prose text={rule.desc} />
          </p>
          <div className="rv-compare">
            <Comparison rule={shown} />
          </div>
          <div className="rv-mcopy">
            <CopyMenu key={rule.id} rule={rule} />
          </div>
        </div>
        <Fragment key={shown.id}>{seeded ? seed : <Inspector ruleId={shown.id} />}</Fragment>
        <NextRow ruleId={rule.id} />
      </div>
    </article>
  );
}
