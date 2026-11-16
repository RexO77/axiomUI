// design-system: strict
"use client";

// Motion rules on the same comparison as every other rule: Play and speed in
// the compare bar, both panes on one canvas with their verdict labels inside,
// the captions under it and the hints under those. Nothing plays until the
// reader asks: no autoplay on arrival, and scenes' own CSS loops are paused
// while no pane is live.
//
// Built from the showcase specs and the engine directly, so it can be shaped
// here without touching the shared MotionShowcase. The hand-built showcases
// (drag, interrupt, load, toolbar) still render MotionShowcase (comparison.tsx).
//
// Lifecycle: every timer, bar and engine track is released on unmount, when
// reduced motion turns on mid-play, and when a hold loses its pointer, focus or
// window. Reduced-motion text is always in the server HTML; compare.css shows it.

import { useEffect, useEffectEvent, useId, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";

import { paneReadout, showcaseSpecs, type PaneSpec, type ShowcaseSpec } from "@/components/features/rules/demos/showcase-specs";
import { Segmented } from "@/components/ui/segmented";
import { Tooltip } from "@/components/ui/tooltip";
import { VerdictLabel } from "@/components/ui/verdict-label";
import { useCanHover, useReducedMotion } from "@/lib/media";
import {
  cancelPane,
  finishPane,
  paneIsLive,
  playPane,
  settlePane,
  tracksDurationMs,
  DUR,
  EASE,
  type Track,
} from "@/lib/showcase-engine";
import "./compare.css";

const NATIVE = new Set(["replay", "action", "toggle", "press", "hover"]);

/** Whether this rule's showcase renders on the shared comparison. */
export function isNativeMotion(ruleId: string): boolean {
  const spec = showcaseSpecs[ruleId];
  return Boolean(spec && NATIVE.has(spec.trigger));
}

type Rate = "1" | "0.5" | "0.25";
const RATES = [
  { value: "1", label: "1×", name: "Full speed" },
  { value: "0.5", label: "½×", name: "Half speed" },
  { value: "0.25", label: "¼×", name: "Quarter speed" },
] as const;
const SETTLE_HOLD_MS = 1400;
const RESET_MS = 120;
/** A gesture or a toggle stays live until it is released. */
const HELD_MS = 600_000;
const REST_DEFAULTS: Record<string, string> = { opacity: "1", transform: "none", filter: "none" };
const META = new Set(["offset", "easing", "composite"]);

const paneRate = (pane: PaneSpec, rate: number) => (pane.pinRate ? 1 : rate);

export type Phase = "enter" | "exit";

/** A pane's timing readout for the phase that is playing: a dismiss reads its exit, not its entrance. */
export function readoutLabel(pane: PaneSpec, phase: Phase): string {
  return `${paneReadout(pane, phase).ms}ms${pane.readoutTag ? ` · ${pane.readoutTag}` : ""}`;
}

/** Tracks that take every animated node back to its scene's rest frame. */
function restTracks(pane: PaneSpec, root: HTMLElement): Track[] {
  const keyed = new Map<string, Set<string>>();
  for (const track of [...pane.tracks, ...(pane.exitTracks ?? [])]) {
    const props = keyed.get(track.target) ?? new Set<string>();
    for (const frame of track.keyframes) for (const prop of Object.keys(frame)) if (!META.has(prop)) props.add(prop);
    keyed.set(track.target, props);
  }
  const out: Track[] = [];
  for (const [target, props] of keyed) {
    const el = root.querySelector<HTMLElement>(`[data-anim="${target}"]`);
    if (!el) continue;
    const inline = el.style as unknown as Record<string, string>;
    const rest: Keyframe = {};
    for (const prop of props) {
      const value = inline[prop] || REST_DEFAULTS[prop];
      if (value) rest[prop] = value;
    }
    out.push({ target, keyframes: [rest, rest], durationMs: DUR.fast, easing: EASE.inOut });
  }
  return out;
}

/** Tracks that take every node to the frame its next play starts from. */
function startTracks(pane: PaneSpec, durationMs: number): Track[] {
  const starts = new Map<string, { frame: Keyframe; delays: Map<string, number> }>();
  for (const track of pane.tracks) {
    const entry = starts.get(track.target) ?? { frame: {}, delays: new Map<string, number>() };
    const delay = track.delayMs ?? 0;
    for (const [prop, value] of Object.entries(track.keyframes[0] ?? {})) {
      if (META.has(prop) || (entry.delays.get(prop) ?? Infinity) <= delay) continue;
      entry.delays.set(prop, delay);
      entry.frame[prop] = value;
    }
    starts.set(track.target, entry);
  }
  return [...starts].map(([target, { frame }]) => ({ target, keyframes: [frame, frame], durationMs, easing: EASE.inOut }));
}

export function MotionCompare({ ruleId }: { ruleId: string }) {
  const spec = showcaseSpecs[ruleId];
  if (!spec) return null;
  // Remount per rule, so a page turn never carries a half-played pane over.
  return <Body key={ruleId} spec={spec} />;
}

function Body({ spec }: { spec: ShowcaseSpec }) {
  const uid = useId();
  const doRef = useRef<HTMLDivElement>(null);
  const dontRef = useRef<HTMLDivElement>(null);
  const bars = useRef<(HTMLSpanElement | null)[]>([null, null]);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const liveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const generation = useRef(0);
  const engagedRef = useRef(false);
  /** Bar animations in flight, held apart from the bar refs so unmount can cancel them. */
  const barAnims = useRef(new Set<Animation>());
  /** The input of the last press on the canvas, and whether the Do side sits out this run. */
  const lastPointer = useRef("mouse");
  const skipDo = useRef(false);
  const [rate, setRate] = useState<Rate>("0.5");
  const [engaged, setEngagedState] = useState(false);
  const [live, setLive] = useState(false);
  /** Which run the readouts and bars count: the last enter, or the exit that followed it. */
  const [phase, setPhase] = useState<Phase>("enter");
  const [plays, setPlays] = useState(0);
  const reduced = useReducedMotion();
  const canHover = useCanHover();
  const seenReduced = useRef(reduced);

  const trigger = spec.trigger;
  const isPress = trigger === "press";
  const isHover = trigger === "hover";
  const gesture = isPress || isHover;
  const pinned = Boolean(spec.do.pinRate && spec.dont.pinRate);
  const showSpeed = !gesture && !reduced && !pinned;
  // A gesture has no speed control: it plays at full speed, as the reader's hand does.
  const speed = gesture ? 1 : Number(rate);

  const setEngaged = (on: boolean) => {
    engagedRef.current = on;
    setEngagedState(on);
  };

  const panes = () => [
    { el: doRef.current, pane: spec.do, skip: skipDo.current, bar: bars.current[0] },
    { el: dontRef.current, pane: spec.dont, skip: false, bar: bars.current[1] },
  ];

  /** Bars end committed to their final width, so no animation outlives its run. */
  const runBars = (phase: Phase) => {
    for (const { pane, bar, skip } of panes()) {
      if (!bar || skip) continue;
      bar.getAnimations().forEach((animation) => animation.cancel());
      const readout = paneReadout(pane, phase);
      if (reduced) {
        bar.style.transform = "scaleX(1)";
        continue;
      }
      bar.style.transform = "scaleX(0)";
      const animation = bar.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
        duration: Math.max(1, readout.ms),
        easing: readout.easing,
        fill: "forwards",
      });
      animation.playbackRate = paneRate(pane, speed);
      barAnims.current.add(animation);
      animation.oncancel = () => barAnims.current.delete(animation);
      animation.onfinish = () => {
        bar.style.transform = "scaleX(1)";
        animation.cancel();
      };
    }
  };

  const clearBars = () => {
    for (const bar of bars.current) {
      if (!bar) continue;
      bar.getAnimations().forEach((animation) => animation.cancel());
      bar.style.transform = "scaleX(0)";
    }
  };

  /** Scenes' own CSS loops (spinners, pulses) run only while a pane is live. */
  const markLive = (ms: number) => {
    clearTimeout(liveTimer.current);
    setLive(ms > 0);
    if (ms > 0) liveTimer.current = setTimeout(() => setLive(false), ms);
  };

  /** `touch`: a tap stands in for hover, so a lesson whose Do side needs hover (motion-16) moves only Don't. */
  const enter = (touch = false) => {
    skipDo.current = Boolean(spec.doRequiresHover) && touch;
    clearTimeout(settleTimer.current);
    const run = ++generation.current;
    setEngaged(true);
    setPhase("enter");
    if (spec.tallyDontMs) setPlays((count) => count + 1);
    const start = (fromKeyframes = false) => {
      if (run !== generation.current) return;
      for (const { el, pane, skip } of panes()) {
        if (!el || skip) continue;
        playPane(el, pane.tracks, { rate: paneRate(pane, speed), reduced, fromKeyframes });
      }
      runBars("enter");
      const wall = (pane: PaneSpec) => tracksDurationMs(pane.tracks) / paneRate(pane, speed);
      const longest = Math.max(skipDo.current ? 0 : wall(spec.do), wall(spec.dont));
      const canSettle = !reduced && spec.settle !== false && (trigger === "replay" || trigger === "action");
      const hold = longest + SETTLE_HOLD_MS / (pinned ? 1 : speed);
      markLive(reduced ? 0 : canSettle ? hold + DUR.fast / speed : gesture || trigger === "toggle" ? HELD_MS : longest);
      if (!canSettle) return;
      settleTimer.current = setTimeout(() => {
        if (run !== generation.current) return;
        for (const { el, pane, skip } of panes()) {
          if (!el || skip) continue;
          void settlePane(el, pane.exitTracks ?? restTracks(pane, el), { rate: paneRate(pane, speed), reduced });
        }
        clearBars();
        setEngaged(false);
      }, hold);
    };
    const restarts = (trigger === "replay" || trigger === "action") && !reduced;
    const busy = restarts && panes().some(({ el, skip }) => el && !skip && paneIsLive(el));
    if (!busy) {
      start();
      return;
    }
    clearBars();
    void Promise.all(
      panes().map(async ({ el, pane, skip }) =>
        el && !skip ? (await finishPane(el, startTracks(pane, RESET_MS), { reduced })) !== null : true,
      ),
    ).then((done) => {
      if (done.every(Boolean)) start(true);
    });
  };

  const exit = () => {
    clearTimeout(settleTimer.current);
    generation.current++;
    for (const { el, pane, skip } of panes()) {
      if (!el || skip || !pane.exitTracks) continue;
      playPane(el, pane.exitTracks, { rate: paneRate(pane, speed), reduced });
    }
    runBars("exit");
    setPhase("exit");
    const longest = Math.max(...[spec.do, spec.dont].map((pane) => tracksDurationMs(pane.exitTracks ?? [])));
    markLive(reduced ? 0 : longest / speed + 60);
    setEngaged(false);
  };

  /** A hold ends when its pointer, its focus or the window goes; never on a stray release. */
  const release = () => {
    if (engagedRef.current) exit();
  };

  // A hold whose release can no longer arrive: the window loses focus or the tab hides.
  const onLost = useEffectEvent(() => release());
  useEffect(() => {
    if (!gesture || !engaged) return;
    const onHidden = () => {
      if (document.visibilityState === "hidden") onLost();
    };
    const onBlur = () => onLost();
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, [gesture, engaged]);

  // Reduced motion turned on (or off) mid-play: stop everything and show the rest state at once.
  const settleForReduced = useEffectEvent(() => {
    generation.current++;
    clearTimeout(settleTimer.current);
    clearTimeout(liveTimer.current);
    clearBars();
    for (const { el, pane } of panes()) {
      if (!el) continue;
      cancelPane(el);
      void settlePane(el, restTracks(pane, el), { reduced: true });
    }
    setEngaged(false);
    setLive(false);
    setPhase("enter");
  });
  useEffect(() => {
    if (seenReduced.current === reduced) return;
    seenReduced.current = reduced;
    settleForReduced();
  }, [reduced]);

  useEffect(() => {
    const els = [doRef.current, dontRef.current];
    const anims = barAnims.current;
    return () => {
      clearTimeout(settleTimer.current);
      clearTimeout(liveTimer.current);
      els.forEach((el) => el && cancelPane(el));
      anims.forEach((animation) => animation.cancel());
    };
  }, []);

  const played = plays > 0 || engaged;
  const label =
    trigger === "toggle"
      ? engaged
        ? (spec.controlEngaged ?? spec.control ?? "Toggle")
        : (spec.control ?? "Toggle")
      : spec.tallyDontMs && plays > 0
        ? "Open again"
        : trigger === "replay"
          ? played
            ? "Replay"
            : (spec.control ?? "Play both")
          : (spec.control ?? "Run");

  const gestureHint = isPress
    ? (spec.hint ?? "Press and hold the canvas: both sides react together")
    : isHover
      ? canHover
        ? (spec.hint ?? "Hover the canvas: both sides react together")
        : spec.doRequiresHover
          ? "Tap: only the Don’t side moves; the Do side is obeying this rule"
          : "Tap the canvas to preview the hover state"
      : null;
  const hotkey = spec.hotkey;
  const hint = gesture ? gestureHint : hotkey ? `Or press ${hotkey.toUpperCase()} while the demo has focus` : spec.hint;
  /** A hover canvas toggled by a tap, Enter, Space or an assistive click: only a hover input previews by hovering. */
  const toggleHover = (touch: boolean) => (engagedRef.current ? exit() : enter(touch));
  const reducedHint = gesture ? undefined : spec.hintReduced;
  const tally = spec.tallyDontMs ? ((plays * spec.tallyDontMs) / 1000).toFixed(1) : null;

  return (
    <div
      className="cmp"
      data-kind="motion"
      // The lesson's own key (motion-2's K) while focus is in the demo. Consumed
      // here, so the shell's shortcut for the same key never also runs.
      onKeyDown={
        hotkey
          ? (event) => {
              if (event.metaKey || event.ctrlKey || event.altKey || event.key.toLowerCase() !== hotkey) return;
              event.preventDefault();
              if (!event.repeat) enter();
            }
          : undefined
      }
    >
      {gesture ? null : (
        <div className="cmp-bar">
          <button
            type="button"
            className="cmp-ctl"
            aria-pressed={trigger === "toggle" ? engaged : undefined}
            onClick={() => (trigger === "toggle" && engaged ? exit() : enter())}
          >
            {trigger === "toggle" ? null : played && trigger === "replay" ? (
              <RotateCcw aria-hidden="true" />
            ) : (
              <Play aria-hidden="true" className="cmp-play-glyph" />
            )}
            {label}
          </button>
          <span className="cmp-spacer" />
          {showSpeed ? (
            <Tooltip content="Playback speed" side="bottom">
              <Segmented label="Playback speed" value={rate} options={RATES} onChange={(value) => setRate(value)} />
            </Tooltip>
          ) : null}
        </div>
      )}

      <div
        className="cmp-canvas"
        data-live={live || undefined}
        data-gesture={gesture || undefined}
        role={gesture ? "button" : undefined}
        tabIndex={gesture ? 0 : undefined}
        aria-label={gesture ? (isPress ? "Press and hold to preview both sides" : "Hover or focus to preview both sides") : undefined}
        onPointerDown={
          gesture
            ? (event) => {
                lastPointer.current = event.pointerType;
                if (!isPress || event.button !== 0) return;
                // Captured, so the release arrives here even off the canvas.
                event.currentTarget.setPointerCapture(event.pointerId);
                enter();
              }
            : undefined
        }
        onPointerUp={isPress ? release : undefined}
        onPointerCancel={gesture ? release : undefined}
        onLostPointerCapture={isPress ? release : undefined}
        // Decided per input, not per device: a mouse or pen hovers; a touch tap toggles, on a
        // phone or on a touchscreen laptop whose primary pointer can hover.
        onPointerEnter={isHover ? (event) => event.pointerType !== "touch" && enter() : undefined}
        onPointerLeave={isHover ? (event) => event.pointerType !== "touch" && release() : undefined}
        // A tap toggles. So does a click with no pointer behind it (detail 0: a
        // screen reader's activation), whatever input was used last.
        onClick={
          isHover
            ? (event) => {
                if (event.detail === 0) toggleHover(false);
                else if (lastPointer.current === "touch") toggleHover(true);
              }
            : undefined
        }
        onFocus={isHover ? (event) => event.currentTarget.matches(":focus-visible") && enter() : undefined}
        onBlur={gesture ? release : undefined}
        onKeyDown={
          gesture
            ? (event) => {
                if (event.key !== " " && event.key !== "Enter") return;
                // Every one, repeats included: a held Space must never scroll the page.
                event.preventDefault();
                if (event.repeat) return;
                if (isPress) enter();
                else toggleHover(false);
              }
            : undefined
        }
        onKeyUp={isPress ? (event) => (event.key === " " || event.key === "Enter") && release() : undefined}
      >
        {(["do", "dont"] as const).map((side) => {
          const pane = side === "do" ? spec.do : spec.dont;
          return (
            <figure key={side} className="cmp-pane" aria-labelledby={`${uid}-${side}-l`} aria-describedby={`${uid}-${side}-c`}>
              <span className="cmp-pane-label" id={`${uid}-${side}-l`}>
                <VerdictLabel verdict={side} />
              </span>
              <span className="cmp-pane-ms">{readoutLabel(pane, phase)}</span>
              <div className="cmp-box">
                <div ref={side === "do" ? doRef : dontRef} aria-hidden="true" className="motion-showcase cmp-scene">
                  {pane.scene()}
                </div>
              </div>
              <span className="cmp-track" aria-hidden="true">
                <span
                  ref={(el) => {
                    bars.current[side === "do" ? 0 : 1] = el;
                  }}
                  style={{ transform: "scaleX(0)" }}
                />
              </span>
            </figure>
          );
        })}
      </div>

      <div className="cmp-captions">
        {(["do", "dont"] as const).map((side) => (
          <p key={side} id={`${uid}-${side}-c`}>
            <span className="cmp-cap-v">{side === "do" ? "Do" : "Don’t"}</span>
            {(side === "do" ? spec.do : spec.dont).caption}
            {side === "dont" && tally !== null ? (
              <span className="cmp-tally" data-on={plays > 0 || undefined}>
                ×{plays} · <span className="rule-hint-motion">{tally}s waited</span><span className="rule-hint-reduced">would cost {tally}s</span>
              </span>
            ) : null}
          </p>
        ))}
      </div>
      {hint ? <p className={reducedHint ? "rule-hint rule-hint-motion" : "rule-hint"}>{hint}</p> : null}
      {reducedHint ? <p className="rule-hint rule-hint-reduced">{reducedHint}</p> : null}
      <p className="rule-hint rule-hint-reduced">Reduced motion: end states only, as your setting asks.</p>
    </div>
  );
}
