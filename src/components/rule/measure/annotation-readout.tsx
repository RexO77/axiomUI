// design-system: strict
"use client";

import type { ReactNode } from "react";
import type { Side } from "../use-compare";
import type { PaneMeasure, Row } from "./measure";

const SIDES = ["do", "dont"] as const;
export type Measured = Record<Side, PaneMeasure>;

type Highlight = {
  focus: string | null;
  pinned: string | null;
  setHover: (key: string | null) => void;
  setPinned: (change: (key: string | null) => string | null) => void;
};

/** Match measured quantities to caption numbers, using their unit and nearby
 * label to distinguish equal dimensions such as two 4px corner radii. */
export function MeasuredCaption({ text, rows, focus, pinned, setHover, setPinned }: Highlight & { text: string; rows: Row[] }) {
  const parts: ReactNode[] = [];
  let end = 0;
  const used = new Set<string>();
  const quantity = /#[a-f\d]{3,8}\b|(?<![\w.])[+−-]?\d+(?:\.\d+)?(?:px|em|ch|×|%|:1)?/gi;
  for (const token of text.matchAll(quantity)) {
    const raw = token[0].toLowerCase();
    const value = parseFloat(raw.replace("−", "-"));
    const unit = /(?:px|em|ch|×|%|:1)$/.exec(raw)?.[0];
    const matches = rows.filter(row => row.group && !/:(face|kerning)$/.test(row.key) &&
      Array.from(row.value.matchAll(quantity)).some(([n]) => {
        if (raw.startsWith("#") || n.startsWith("#")) return n.toLowerCase() === raw;
        if (parseFloat(n.replace("−", "-")) !== value) return false;
        const measuredUnit = /(?:px|em|ch|×|%|:1)$/.exec(n)?.[0];
        return !unit || unit === measuredUnit || (!measuredUnit && (unit === "px" || unit === "×"));
      }));
    const at = token.index;
    const before = text.slice(0, at).trimEnd().toLowerCase().split(/\s+/).at(-1);
    // The words that follow name it too ("16px between fields"); short ones ("to", "an") name nothing.
    const after = text.slice(at + token[0].length).toLowerCase().split(/[^\p{L}]+/u).filter(word => word.length >= 4).slice(0, 3);
    const names = (r: Row, word?: string) => Boolean(word && r.label.toLowerCase().includes(word));
    const fresh = matches.filter(r => !used.has(r.key));
    // Equal values with nothing to tell them apart ("44 × 44px") take the marks in order.
    const row = matches.find(r => names(r, before)) ?? fresh.find(r => after.some(word => names(r, word))) ??
      matches.find(r => after.some(word => names(r, word))) ?? fresh[0] ?? matches[0];
    if (!row?.group) continue;
    used.add(row.key);
    const group = row.group;
    parts.push(text.slice(end, at), <button type="button" className="ml-proof" key={at}
      aria-label={row.label + ", " + token[0]} aria-pressed={pinned === group} data-on={focus === group || undefined}
      onPointerEnter={e => e.pointerType === "mouse" && setHover(group)} onPointerLeave={() => setHover(null)}
      onFocus={() => setHover(group)} onBlur={() => setHover(null)}
      onClick={() => setPinned(previous => previous === group ? null : group)}>{token[0]}</button>);
    end = at + token[0].length;
  }
  return <>{parts}{text.slice(end)}</>;
}

/** Do and Don't rows side by side, in the order the marks declare them. */
function mergeRows(measured: Measured | null) {
  if (!measured) return [];
  const keys: string[] = [];
  for (const side of SIDES) for (const row of measured[side].rows) if (!keys.includes(row.key)) keys.push(row.key);
  return keys.map((key) => {
    const at = (side: Side) => measured[side].rows.find((r) => r.key === key);
    const base = at("do") ?? at("dont")!;
    return { key, mark: base.mark, label: base.label, group: base.group, do: at("do")?.value ?? "—", dont: at("dont")?.value ?? "—" };
  });
}

export function AnnotationReadout({ measured, multiMark, id, focus, pinned, setHover, setPinned }: Highlight & {
  measured: Measured | null; multiMark: boolean; id?: string;
}) {
  const rows = mergeRows(measured);
  if (!rows.length) return null;
  return (
    <section className="ml-spec" aria-label="Measurements" id={id}>
      <div className="ml-spec-grid">
        <div className="ml-spec-line" data-head="" aria-hidden="true">
          <span>Measured</span>
          <span>Do</span>
          <span>Don’t</span>
        </div>
        {rows.map((row) => {
          const diff = row.do !== row.dont;
          const label = (
            <span className="ml-spec-k">
              {row.group ? <span className="ml-spec-mark" aria-hidden="true" /> : <span className="ml-spec-nomark" aria-hidden="true" />}
              {multiMark && row.mark ? <><b>{row.mark}</b> · </> : null}
              {row.label}
            </span>
          );
          const cells = (
            <>
              {label}
              <span className="ml-spec-v" data-side="do"><span className="sr-only">, Do: </span>{row.do}</span>
              <span className="ml-spec-v" data-side="dont"><span className="sr-only">, Don’t: </span>{row.dont}</span>
            </>
          );
          if (!row.group) {
            return <div key={row.key} className="ml-spec-line" data-diff={diff || undefined}>{cells}</div>;
          }
          const group = row.group;
          return (
            <button
              key={row.key}
              type="button"
              className="ml-spec-line"
              aria-pressed={pinned === group}
              data-diff={diff || undefined}
              data-on={focus === group ? "" : undefined}
              onPointerEnter={(e) => e.pointerType === "mouse" && setHover(group)}
              onPointerLeave={() => setHover(null)}
              onFocus={(e) => e.currentTarget.matches(":focus-visible") && setHover(group)}
              onBlur={() => setHover(null)}
              onClick={() => setPinned((p) => (p === group ? null : group))}
            >
              {cells}
            </button>
          );
        })}
      </div>
    </section>
  );
}
