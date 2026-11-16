// design-system: strict
"use client";

// The rule comparison. Static rules: Side by side or Flip, at 1× or 2×, both
// variants on one canvas with their verdict labels inside, captions under each
// half and the Flip hint under those. Engine-backed motion rules render
// MotionCompare on the same canvas; the hand-built showcases (drag, interrupt,
// load, toolbar) render MotionShowcase, laid into the same canvas, caption row
// and compare bar by compare.css, so paging into one never moves the layout.
//
// Every caption carries the rule's own Do and Don't: a static rule's caption is
// that text, and a motion rule's caption opens with it before narrating what
// plays.
//
// Each rule gets its own instance (keyed by id), so Flip and any hold reset on
// a page turn. Mode and zoom are stored preferences (use-compare.ts).

import { useId, useLayoutEffect, useRef } from "react";
import { Columns2, SquareStack } from "lucide-react";

import type { Rule } from "@/data/ui-logic";
import { RulePreview } from "@/components/features/rules/rule-preview";
import { MotionShowcase } from "@/components/features/rules/demos/motion-showcase";
import { CaptionLeadContext } from "@/components/features/rules/demos/showcase-chrome";
import { hasShowcase } from "@/components/features/rules/demos/showcase-specs";
import { Kbd } from "@/components/ui/kbd";
import { Segmented } from "@/components/ui/segmented";
import { Tooltip } from "@/components/ui/tooltip";
import { VerdictLabel } from "@/components/ui/verdict-label";
import { MotionCompare, isNativeMotion } from "./motion-compare";
import { clampPan, panByPointer, panKeyDelta, useCompare, type Pan, type Side } from "./use-compare";
import "./compare.css";

const SIDES = ["do", "dont"] as const;
const MODES = [
  { value: "side", label: "Side by side", icon: <Columns2 /> },
  { value: "flip", label: "Flip", icon: <SquareStack /> },
] as const;
const ZOOMS = [
  { value: "1", label: "1×", name: "100%" },
  { value: "2", label: "2×", name: "200%" },
] as const;
const VERDICT: Record<Side, string> = { do: "Do", dont: "Don’t" };

export function Comparison({ rule }: { rule: Rule }) {
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
  const { mode, setMode, zoom, setZoom, showing, flipped, held, toggle, hold } = useCompare(rule.id);
  const flip = mode === "flip";
  const canvas = useRef<HTMLDivElement>(null);
  const boxes = useRef<(HTMLDivElement | null)[]>([]);
  const pan = useRef<Pan>({ x: 0, y: 0 });
  const drag = useRef<{ from: Pan; x: number; y: number; id: number } | null>(null);
  const pointerKind = useRef("mouse");
  const uid = useId();

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

  const endPointer = () => {
    if (drag.current) {
      drag.current = null;
      delete canvas.current?.dataset.panning;
    }
    hold(false);
  };

  const label = flip
    ? `Comparison, showing ${VERDICT[showing]}. Hold Space to flip.${zoom === 2 ? " Arrow keys pan." : ""}`
    : zoom === 2
      ? "Comparison at 200%. Arrow keys pan."
      : undefined;

  return (
    <div className="cmp" data-kind="static" data-flip={flip || undefined}>
      <div className="cmp-bar">
        <Tooltip content="Side by side or Flip (F)" side="bottom">
          <Segmented label="Compare" value={mode} options={MODES} onChange={(next) => setMode(next)} />
        </Tooltip>
        {flip ? (
          <button type="button" className="cmp-ctl cmp-flip" aria-pressed={flipped} onClick={toggle}>
            {flipped ? "Show Do" : "Show Don’t"}
          </button>
        ) : null}
      </div>
      <Tooltip content="Zoom (Z)" side="bottom" className="cmp-zoom">
        <Segmented
          label="Zoom"
          value={zoom === 2 ? "2" : "1"}
          options={ZOOMS}
          onChange={(next) => setZoom(next === "2" ? 2 : 1)}
        />
      </Tooltip>

      <div
        ref={canvas}
        className="cmp-canvas"
        data-compare-canvas=""
        data-flip={flip || undefined}
        data-zoom={zoom}
        tabIndex={flip || zoom === 2 ? 0 : undefined}
        aria-label={label}
        onKeyDown={(event) => {
          // At 2× the arrow keys pan the focused canvas, and only then.
          if (zoom !== 2 || event.metaKey || event.ctrlKey || event.altKey) return;
          const delta = panKeyDelta(event.key, event.shiftKey);
          if (!delta) return;
          event.preventDefault();
          applyPan({ x: pan.current.x + delta.x, y: pan.current.y + delta.y });
        }}
        onBlur={() => {
          if (held) hold(false);
        }}
        onPointerDown={(event) => {
          pointerKind.current = event.pointerType;
          if (event.button !== 0) return;
          if (zoom === 2) {
            drag.current = { from: pan.current, x: event.clientX, y: event.clientY, id: event.pointerId };
            event.currentTarget.setPointerCapture(event.pointerId);
            event.currentTarget.dataset.panning = "";
            return;
          }
          // Touch has no hold: a tap flips. A mouse holds.
          if (flip && event.pointerType === "mouse") hold(true);
        }}
        onPointerMove={(event) => {
          const current = drag.current;
          if (!current || current.id !== event.pointerId) return;
          applyPan(panByPointer(current.from, event.clientX - current.x, event.clientY - current.y));
        }}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onLostPointerCapture={endPointer}
        onPointerLeave={() => {
          if (!drag.current && held) hold(false);
        }}
        onClick={() => {
          if (flip && pointerKind.current !== "mouse" && zoom !== 2) toggle();
        }}
      >
        {SIDES.map((side, index) => {
          const off = flip && showing !== side;
          return (
            <figure
              key={side}
              className="cmp-pane"
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
            </figure>
          );
        })}
        {zoom === 2 ? <span className="cmp-zoomchip">2× · drag or arrow keys to pan</span> : null}
      </div>

      <div className="cmp-captions">
        {SIDES.map((side) => (
          <p
            key={side}
            id={`${uid}-${side}-c`}
            data-on={flip && showing === side ? "" : undefined}
          >
            <span className="cmp-cap-v">{VERDICT[side]}</span>
            {side === "do" ? rule.do : rule.dont}
          </p>
        ))}
      </div>
      {flip ? (
        <p className="rule-hint">
          <span className="rule-hint-key">
            Hold <Kbd>Space</Kbd> to flip
          </span>
          <span className="rule-hint-touch">Tap the canvas to flip</span>
        </p>
      ) : null}
    </div>
  );
}
