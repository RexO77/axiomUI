"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ComparisonDock, useComparisonKeys } from "@/components/rule/comparison-tool";
import { useCompare } from "@/components/rule/use-compare";
import { RotateCcw, Settings } from "@/components/ui/icons";
import { VerdictLabel } from "@/components/ui/verdict-label";
import type { Rule } from "@/data/ui-logic";
import type { Variant } from "@/components/features/rules/preview-primitives";

const sides = ["do", "dont"] as const;
const verdict = { do: "Do", dont: "Don’t" };

function SceneControls({ controls, reset }: { controls: ReactNode; reset: () => void }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const group = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    panel.current?.scrollIntoView({ block: "nearest" });
    const dismiss = (event: PointerEvent) => {
      if (!group.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  return <div ref={group} className="cmp-tools mf-dock-tools" role="group" aria-label="Demo controls"
    onBlur={event => {
      if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}
    onKeyDown={event => {
      if (open && event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        trigger.current?.focus({ preventScroll: true });
      }
    }}>
    <button ref={trigger} type="button" className="cmp-tool mf-controls-trigger" aria-expanded={open} aria-controls={id}
      onClick={() => setOpen(value => !value)}><Settings aria-hidden="true" />Controls</button>
    <div ref={panel} id={id} className="mf-dock-panel" data-open={open || undefined}>
      {controls}
      <button type="button" className="cmp-tool mf-reset" aria-label="Reset" title="Reset" onClick={reset}><RotateCcw aria-hidden="true" /><span>Reset</span></button>
    </div>
  </div>;
}

export function MobileComparison({ rule, controls, inspect, reset, render, exampleChanged = false }: {
  exampleChanged?: boolean; rule: Rule; controls: ReactNode; inspect?: ReactNode; reset: () => void; render: (side: Variant) => ReactNode;
}) {
  const id = useId();
  const { view, showing, setView } = useCompare(rule.id, undefined, { zoomShortcut: false });
  const keys = useComparisonKeys();
  const flip = view !== "both";
  const canvas = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (flip && canvas.current) canvas.current.dataset.lead = showing;
  }, [flip, showing]);
  useLayoutEffect(() => {
    const root = canvas.current;
    if (!root) return;
    const scenes = [...root.querySelectorAll<HTMLElement>(".mf-scene")];
    const measure = () => root.style.setProperty("--cmp-box-h", Math.max(...scenes.map(scene => scene.offsetHeight)) + "px");
    measure();
    const observer = new ResizeObserver(measure);
    scenes.forEach(scene => observer.observe(scene));
    return () => observer.disconnect();
  }, []);

  return <section className="cmp mf" data-kind="static" aria-label="Phone comparison">
    <div className="cmp-stage">
      <div ref={canvas} className="cmp-canvas" data-compare-canvas="" data-rule={rule.id} data-flip={flip || undefined}
        tabIndex={0} role="group" aria-label={flip ? `Comparison, showing ${verdict[showing]}.` : "Comparison"}>
        {sides.map(side => {
          const off = flip && side !== showing;
          return <figure key={side} className="cmp-pane mf-pane" data-side={side} inert={off} aria-hidden={off || undefined}
            aria-label={verdict[side]} aria-describedby={`${id}-${side}`}>
            <span className="cmp-pane-label"><VerdictLabel verdict={side} /></span>
            <div className="mf-scene">{render(side)}</div>
          </figure>;
        })}
      </div>
      <div className="mf-dock-slot">
        <ComparisonDock view={view} setView={setView} keys={keys}>
          <SceneControls controls={controls} reset={reset} />
        </ComparisonDock>
      </div>
    </div>
    <div className="cmp-captions">
      {sides.map(side => <p key={side} id={`${id}-${side}`} data-on={flip && showing === side ? "" : undefined}>
        <span className="cmp-cap-v">{verdict[side]}: </span>{exampleChanged && "Starting example · "}{rule[side]}
      </p>)}
    </div>
    {inspect}
  </section>;
}
