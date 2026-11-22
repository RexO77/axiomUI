// design-system: strict
"use client";

import { useCallback, useRef, useState, type HTMLAttributes } from "react";

import { Ruler } from "@/components/ui/icons";
import { RULE_ANNOTATIONS } from "@/data/measure-marks";
import type { Rule } from "@/data/ui-logic";
import { ToolToggle, useComparisonKeys } from "../comparison-tool";
import { useComparisonMeasure } from "../use-comparison-measure";
import type { Side } from "../use-compare";
import { AnnotationReadout, MeasuredCaption } from "./annotation-readout";
import { Redlines } from "./redlines";

/** An authored measurement can accompany a live demo with its own inputs
 * (playback or language selection). Its controls continue to own the canvas. */
export function useDemoAnnotations(rule: Rule) {
  const spec = RULE_ANNOTATIONS[rule.id];
  const canvas = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const attachCanvas = useCallback((element: HTMLDivElement | null) => { canvas.current = element; }, []);
  const keys = useComparisonKeys();
  const measure = useComparisonMeasure(canvas, button, 1, false, "do", spec, !!spec);
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const highlight = { focus: hover ?? pinned, pinned, setPinned, setHover };
  const measured = measure.authored;
  return {
    enabled: !!spec, active: measure.active, ruleId: rule.id, attachCanvas, replaces: spec?.replaces,
    refresh: measure.refresh,
    toggle: spec && <ToolToggle label="Measure" shortcut="M" keys={keys} pressed={measure.active} onClick={measure.toggle} buttonRef={button}><Ruler /></ToolToggle>,
    overlay: (side: Side) => measured && <Redlines measure={measured[side]} shown instant focus={highlight.focus} dpr={window.devicePixelRatio || 1} />,
    caption: (side: Side) => measured ? <MeasuredCaption text={rule[side]} rows={measured[side].rows} {...highlight} /> : rule[side],
    readout: measured && <AnnotationReadout measured={measured} multiMark={spec.marks.length > 1} {...highlight} />,
  };
}

export function DemoCanvas({ annotations: { enabled, active, ruleId, replaces, attachCanvas, toggle }, children, ...props }: HTMLAttributes<HTMLDivElement> & {
  annotations: ReturnType<typeof useDemoAnnotations>;
}) {
  if (!enabled) return <div {...props}>{children}</div>;
  return (
    <div className="cmp-stage">
      {active && replaces?.length ? <style>{
        `[data-compare-canvas][data-rule="${ruleId}"][data-annotated] :is(${replaces.join(", ")}) { visibility: hidden; }`
      }</style> : null}
      <div {...props} ref={attachCanvas}
        role={props.role ?? "group"} tabIndex={props.tabIndex ?? 0} aria-label={props["aria-label"] ?? "Comparison"}
        data-rule={ruleId} data-compare-canvas="" data-annotated={active || undefined}>
        {children}
      </div>
      <div className="cmp-dock">{toggle}</div>
    </div>
  );
}
