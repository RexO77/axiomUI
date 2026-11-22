// design-system: strict
"use client";

// Static comparisons share a canvas, dock and caption pair. Motion and
// worked examples provide the controls for their own demonstrations.

import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { CircleCheck, CircleX, Columns2, Ruler, ZoomIn } from "@/components/ui/icons";

import { workedExampleIds } from "@/data/taxonomy";
import { WorkedComparison } from "./worked-comparison";
import type { Rule } from "@/data/ui-logic";
import { RulePreview } from "@/components/features/rules/rule-preview";
import { MotionShowcase } from "@/components/features/rules/demos/motion-showcase";
import { CaptionLeadContext } from "@/components/features/rules/demos/showcase-chrome";
import { hasShowcase } from "@/components/features/rules/demos/showcase-specs";
import { Kbd } from "@/components/ui/kbd";
import { Segmented } from "@/components/ui/segmented";
import { Tooltip } from "@/components/ui/tooltip";
import { VerdictLabel } from "@/components/ui/verdict-label";
import { RULE_ANNOTATIONS } from "@/data/measure-marks";
import { AnnotationReadout, MeasuredCaption } from "./measure/annotation-readout";
import { Redlines } from "./measure/redlines";
import "./measure/annotations.css";
import { MeasureOverlay, MeasureReadout } from "./comparison-measure";
import { MotionCompare, isNativeMotion } from "./motion-compare";
import { PHONE_QUERY, useCanHover, useMediaQuery } from "@/lib/media";
import { ToolToggle, useComparisonKeys } from "./comparison-tool";
import { clampPan, panByPointer, panKeyDelta, useCompare, type Pan, type Side, type View } from "./use-compare";
import { useComparisonMeasure } from "./use-comparison-measure";
import "./compare.css";

const SIDES = ["do", "dont"] as const;
const VIEWS = [
  { value: "both", label: "Both", icon: <Columns2 /> },
  { value: "do", label: "Do", icon: <CircleCheck /> },
  { value: "dont", label: "Don’t", icon: <CircleX /> },
] as const satisfies readonly { value: View; label: string; icon: ReactNode }[];
const VERDICT: Record<Side, string> = { do: "Do", dont: "Don’t" };
const OTHER: Record<Side, Side> = { do: "dont", dont: "do" };
const MEASURE_DRAG_THRESHOLD = 6;

export function Comparison({ rule }: { rule: Rule }) {
  if (workedExampleIds.includes(rule.id)) return <WorkedComparison key={rule.id} rule={rule} />;
  if (hasShowcase(rule.id) && isNativeMotion(rule.id)) return <MotionCompare ruleId={rule.id} />;
  if (hasShowcase(rule.id)) {
    return (
      <div key={rule.id} className="cmp cmp-show" data-kind="showcase">
        <CaptionLeadContext value={{ do: rule.do, dont: rule.dont }}>
          <MotionShowcase ruleId={rule.id} />
        </CaptionLeadContext>
      </div>
    );
  }
  return <StaticComparison key={rule.id} rule={rule} />;
}

function StaticComparison({ rule }: { rule: Rule }) {
  const { mode, view, setView, zoom, setZoom, showing, held, toggle, hold } = useCompare(rule.id);
  const keys = useComparisonKeys();
  const canHover = useCanHover();
  const phone = useMediaQuery(PHONE_QUERY);
  const keyHints = canHover && !phone;
  const flip = mode === "flip";
  /** The side chosen in the view control; a hold shows the other one. */
  const chosen: Side = view === "dont" ? "dont" : "do";
  const canvas = useRef<HTMLDivElement>(null);
  const measureButton = useRef<HTMLButtonElement>(null);
  const boxes = useRef<(HTMLDivElement | null)[]>([]);
  const pan = useRef<Pan>({ x: 0, y: 0 });
  const drag = useRef<{ from: Pan; x: number; y: number; id: number; moved: boolean } | null>(null);
  const pointerKind = useRef("mouse");
  const uid = useId();
  const panHintId = `${uid}-pan`;
  const flipHintId = `${uid}-flip`;
  const measureHintId = `${uid}-measure`;
  const spec = RULE_ANNOTATIONS[rule.id];
  const measure = useComparisonMeasure(canvas, measureButton, zoom, flip, showing, spec);
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const highlight = { focus: hover ?? pinned, pinned, setHover, setPinned };
  const inspecting = measure.active && !spec;

  // The pane last seen in Flip leads the transition back to Both.
  useLayoutEffect(() => {
    if (flip && canvas.current) canvas.current.dataset.lead = showing;
  }, [flip, showing]);

  // Both variants sit in one box sized to the taller of the two, so their
  // positions correspond and Flip is a true blink comparison. The canvas is
  // never shorter than 280px.
  useLayoutEffect(() => {
    const root = canvas.current;
    const previews = boxes.current.flatMap((box) => (box?.firstElementChild instanceof HTMLElement ? [box.firstElementChild] : []));
    if (!root || previews.length === 0) return;
    const measure = () => {
      const tallest = Math.max(...previews.map((el) => el.offsetHeight));
      root.style.setProperty("--cmp-box-h", `${tallest}px`);
      root.style.setProperty("--cmp-canvas-h", `max(280px, min(${tallest + 96}px, calc(100dvh - 360px)))`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    previews.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const applyPan = (next: Pan) => {
    const el = canvas.current;
    if (!el) return;
    pan.current = clampPan(next, el.clientWidth, el.clientHeight);
    el.style.setProperty("--cmp-pan-x", `${pan.current.x}px`);
    el.style.setProperty("--cmp-pan-y", `${pan.current.y}px`);
  };

  // Leaving 2× (or arriving at it) recentres the pan.
  useLayoutEffect(() => {
    applyPan({ x: 0, y: 0 });
  }, [zoom]);

  // A canvas that narrows at 2× narrows the pan's limits with it: re-clamp the
  // current offset, and re-read any measurement drawn over the moved preview.
  const refreshMeasure = measure.refresh;
  useLayoutEffect(() => {
    const el = canvas.current;
    if (!el || zoom !== 2) return;
    const observer = new ResizeObserver(() => {
      const { x, y } = pan.current;
      applyPan(pan.current);
      if (pan.current.x !== x || pan.current.y !== y) refreshMeasure();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [zoom, refreshMeasure]);

  const endPointer = () => {
    if (drag.current) {
      drag.current = null;
      delete canvas.current?.dataset.panning;
    }
    hold(false);
  };

  const label = flip
    ? `Comparison, showing ${VERDICT[showing]}.`
    : zoom === 2
      ? "Comparison at 2× zoom."
      : "Comparison";
  const hints = [zoom === 2 ? panHintId : null, flip && !inspecting && zoom === 1 ? flipHintId : null, inspecting ? measureHintId : null].filter(Boolean).join(" ");

  return (
    <div className="cmp cmp-annotated" data-kind="static" data-flip={flip || undefined}>
      {measure.active && spec?.replaces?.length ? <style>{
        `[data-compare-canvas][data-rule="${rule.id}"][data-annotated] .cmp-box :is(${spec.replaces.join(", ")}) { visibility: hidden; }`
      }</style> : null}
      <div className="cmp-stage">
        <div
          ref={canvas}
          className="cmp-canvas"
          data-compare-canvas=""
          data-rule={rule.id}
          data-annotated={measure.active && !!spec || undefined}
          data-flip={flip || undefined}
          data-zoom={zoom}
          data-measuring={measure.active || undefined}
          tabIndex={0}
          role="group"
          aria-label={label}
          aria-describedby={hints || undefined}
          onKeyDown={(event) => {
            if (measure.key(event)) return;
            // In Measure, plain arrows select and Shift+arrows still pan at 2×.
            if (zoom !== 2 || event.metaKey || event.ctrlKey || event.altKey) return;
            const delta = panKeyDelta(event.key, event.shiftKey);
            if (!delta) return;
            event.preventDefault();
            applyPan({ x: pan.current.x + delta.x, y: pan.current.y + delta.y });
            measure.refresh();
          }}
          onBlur={() => {
            if (held) hold(false);
          }}
          onPointerDown={(event) => {
            pointerKind.current = event.pointerType;
            if (event.button !== 0 || !event.isPrimary) return;
            if (inspecting || zoom === 2) {
              drag.current = { from: pan.current, x: event.clientX, y: event.clientY, id: event.pointerId, moved: !inspecting };
              if (zoom === 2) {
                event.currentTarget.setPointerCapture(event.pointerId);
                if (!inspecting) event.currentTarget.dataset.panning = "";
              }
              return;
            }
            // Touch has no hold: a tap flips. A mouse holds.
            if (flip && event.pointerType === "mouse") hold(true);
          }}
          onPointerMove={(event) => {
            const current = drag.current;
            if (!current) {
              if (event.pointerType !== "touch") measure.point({ x: event.clientX, y: event.clientY, alt: event.altKey });
              return;
            }
            if (current.id !== event.pointerId) return;
            const dx = event.clientX - current.x;
            const dy = event.clientY - current.y;
            if (!current.moved && Math.hypot(dx, dy) < MEASURE_DRAG_THRESHOLD) return;
            current.moved = true;
            measure.point(null);
            if (zoom === 2) {
              event.currentTarget.dataset.panning = "";
              applyPan(panByPointer(current.from, dx, dy));
              measure.refresh();
            }
          }}
          onPointerUp={(event) => {
            if (!event.isPrimary) return;
            const current = drag.current;
            if (inspecting && current?.id === event.pointerId && !current.moved &&
                Math.hypot(event.clientX - current.x, event.clientY - current.y) < MEASURE_DRAG_THRESHOLD) {
              measure.pick({ x: event.clientX, y: event.clientY });
            }
            endPointer();
          }}
          onPointerCancel={(event) => { if (event.isPrimary) endPointer(); }}
          onLostPointerCapture={(event) => { if (event.isPrimary) endPointer(); }}
          onPointerLeave={() => {
            measure.point(null);
            if (inspecting && zoom === 1) endPointer();
            if (!drag.current && held) hold(false);
          }}
          onClick={() => {
            if (!inspecting && flip && pointerKind.current !== "mouse" && zoom !== 2) toggle();
          }}
        >
          {SIDES.map((side, index) => {
            const off = flip && showing !== side;
            const type = measure.view?.typography;
            const drawing = measure.authored?.[side] ?? (type?.target.side === side ? type.measure : undefined);
            return (
              <figure
                key={side}
                className="cmp-pane"
                data-side={side}
                data-off={off ? "" : undefined}
                aria-labelledby={`${uid}-${side}-l`}
                aria-describedby={`${uid}-${side}-c`}
                aria-hidden={off || undefined}
              >
                <span className="cmp-pane-label" id={`${uid}-${side}-l`}>
                  <VerdictLabel verdict={side} />
                </span>
                <div
                  className="cmp-box"
                  aria-hidden="true"
                  inert
                  ref={(el) => {
                    boxes.current[index] = el;
                  }}
                >
                  <RulePreview rule={rule} variant={side} />
                </div>
                {measure.active && drawing && <Redlines measure={drawing} shown instant focus={measure.authored ? highlight.focus : null} dpr={window.devicePixelRatio || 1} />}
                {inspecting && measure.view && <MeasureOverlay view={measure.view} side={side} zoom={zoom} />}
              </figure>
            );
          })}
        </div>

        <div className="cmp-dock">
          <Tooltip side="top" content={<>Switch comparison view{keys ? <Kbd className="ml-2">F</Kbd> : null}</>}>
            <Segmented variant="capsule" label={keys ? "Comparison view (F)" : "Comparison view"} value={view} options={VIEWS} onChange={(next) => setView(next)} />
          </Tooltip>
          <div className="cmp-tools" role="group" aria-label="Inspect">
            <ToolToggle label="Measure" shortcut="M" keys={keys} pressed={measure.active} onClick={(event) => {
              // Enter or Space (a click with no pointer detail) opening free
              // inspection hands focus to the canvas, as M does: the hint
              // that appears says to press an arrow.
              if (!measure.active && !spec && event.detail === 0) canvas.current?.focus({ preventScroll: true });
              measure.toggle();
            }} buttonRef={measureButton}>
              <Ruler />
            </ToolToggle>
            <ToolToggle label="2× zoom" shortcut="Z" keys={keys} pressed={zoom === 2} onClick={() => setZoom(zoom === 2 ? 1 : 2)}>
              <ZoomIn />
            </ToolToggle>
          </div>
        </div>
      </div>
      <div className="cmp-captions">
        {SIDES.map((side) => (
          <p
            key={side}
            id={`${uid}-${side}-c`}
            data-on={flip && showing === side ? "" : undefined}
          >
            <span className="cmp-cap-v">{VERDICT[side]}:{" "}</span>
            {measure.authored ? <MeasuredCaption text={rule[side]} rows={measure.authored[side].rows} {...highlight} /> : rule[side]}
          </p>
        ))}
      </div>
      <p className="cmp-hint">
        {flip && !inspecting && zoom === 1 ? (
          <span id={flipHintId}>
            {keyHints ? <>Hold <Kbd>Space</Kbd> for {VERDICT[OTHER[chosen]]}</> : "Tap to flip"}
          </span>
        ) : null}
        {zoom === 2 ? (
          <span id={panHintId}>{!keyHints ? "Drag to pan" : inspecting ? "Drag or press Shift + arrow keys to pan" : "Drag or use arrow keys to pan"}</span>
        ) : null}
      </p>
      {spec && measure.authored && <AnnotationReadout measured={measure.authored} multiMark={spec.marks.length > 1} id={measureHintId} {...highlight} />}
      {inspecting && <MeasureReadout view={measure.view} id={measureHintId} />}
    </div>
  );
}
