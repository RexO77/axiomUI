// design-system: strict
"use client";

import type { CSSProperties } from "react";

import type { Group, PaneMeasure, Prim } from "./measure";

/** Device-pixel snap, so a 1px line lands on one row of pixels at any zoom. */
function snapper(dpr: number) {
  return (value: number) => Math.round(value * dpr) / dpr;
}

function Primitive({ p, snap }: { p: Prim; snap: (v: number) => number }) {
  switch (p.t) {
    case "seg": {
      if (p.axis === "x") {
        const left = snap(p.x);
        return <span className="ml-seg" data-axis="x" style={{ left, top: snap(p.y - 0.5), width: snap(p.x + p.len) - left }} />;
      }
      const top = snap(p.y);
      return <span className="ml-seg" data-axis="y" style={{ top, left: snap(p.x - 0.5), height: snap(p.y + p.len) - top }} />;
    }
    case "rule": {
      if (p.axis === "x") {
        const left = snap(p.x);
        return <span className="ml-rule" data-axis="x" data-tone={p.tone} style={{ left, top: snap(p.y), width: snap(p.x + p.len) - left, height: 1 }} />;
      }
      const top = snap(p.y);
      return <span className="ml-rule" data-axis="y" data-tone={p.tone} style={{ top, left: snap(p.x), height: snap(p.y + p.len) - top, width: 1 }} />;
    }
    case "fill": {
      const left = snap(p.x);
      const top = snap(p.y);
      return <span className="ml-fill" data-tone={p.tone} style={{ left, top, width: snap(p.x + p.w) - left, height: snap(p.y + p.h) - top }} />;
    }
    case "chip":
      return p.size === "md" ? (
        <span className="ml-chip" style={{ left: snap(p.x), top: snap(p.y) }}>
          {p.tag ? <span className="ml-chip-tag">{p.tag}</span> : null}
          {p.text}
        </span>
      ) : (
        <span className="ml-tag" data-align={p.align} style={{ left: snap(p.x), top: snap(p.y), minWidth: p.w }}>
          {p.text}
        </span>
      );
    case "path":
      return null;
  }
}

function GroupLayer({ group, dim, snap }: { group: Group; dim: boolean; snap: (v: number) => number }) {
  const paths = group.prims.filter((p): p is Extract<Prim, { t: "path" }> => p.t === "path");
  return (
    <div className="ml-group" data-dim={dim || undefined} data-group={group.key} style={{ "--i": group.step } as CSSProperties}>
      {paths.length > 0 && (
        <svg className="ml-svg" aria-hidden="true">
          {paths.map((p, i) => <path key={i} d={p.d} data-tone={p.tone} />)}
        </svg>
      )}
      {group.prims.map((p, i) => <Primitive key={i} p={p} snap={snap} />)}
    </div>
  );
}

export function Redlines({ measure, shown, instant, focus, dpr }: {
  measure: PaneMeasure | undefined;
  shown: boolean;
  instant: boolean;
  focus: string | null;
  dpr: number;
}) {
  const snap = snapper(dpr);
  return (
    <div className="ml-overlay" aria-hidden="true" data-shown={shown || undefined} data-instant={instant || undefined}>
      <div className="ml-layer">
        {measure?.groups.map((group) => (
          <GroupLayer key={group.key} group={group} dim={focus !== null && focus !== group.key} snap={snap} />
        ))}
      </div>
    </div>
  );
}
