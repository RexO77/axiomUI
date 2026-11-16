// design-system: strict
"use client";

/*
 * One pane of a motion rule's tile. The scene arrives server-rendered as
 * children and the tracks as plain data, so nothing function-valued crosses
 * into the client.
 *
 * At rest the pane holds its most telling frame, set through the engine's
 * reduced path (duration 0, fill forwards): nothing runs at idle. gallery.css
 * keeps the scene hidden until that frame is set (`data-ready`), so the first
 * paint never shows a scene's pre-animation markup and then jumps.
 *
 * It replays once, from its first keyframe:
 *   - after a 150 ms mouse dwell on the tile, so a sweep across the wall
 *     sets nothing off (a press cancels it: that reader is opening the rule);
 *   - at once when the tile takes keyboard focus (Tab, J/K).
 * The tile's link is server markup with no handlers, so the listeners go on
 * it natively. Clicks are never touched: CatalogApp's one delegated listener
 * opens the rule. Only the side the wall shows plays, drag scenes (hands-on
 * in the rule view) stay still, and reduced motion never replays; turned on
 * mid-replay, it puts the pane back on its rest frame at once.
 */

import { useLayoutEffect, useRef, type ReactNode } from "react";

import { prefersReducedMotion, REDUCED_MOTION_QUERY } from "@/lib/media";
import { cancelPane, playPane, tracksDurationMs, type Track } from "@/lib/showcase-engine";

const DWELL_MS = 150;
/** A scene with its own CSS loop (a spinner, a pulse) gets whole loops: two 1 s turns, one 2 s pulse. */
const LOOP_WINDOW_MS = 2000;
/** An exit lesson ends on an empty pane: hold that long enough to read before the still comes back. */
const EXIT_HOLD_MS = 700;

/** A keyframe that leaves its node unseen: faded out, scaled to nothing, or pushed a whole box away. */
function unseen(frame: Keyframe | undefined): boolean {
  if (!frame) return true;
  if (frame.opacity !== undefined && Number(frame.opacity) === 0) return true;
  const transform = typeof frame.transform === "string" ? frame.transform : "";
  if (/scale\(\s*0(\.0+)?\s*[,)]/.test(transform)) return true;
  const shift = transform.match(/translate[XY]?\(\s*(-?[\d.]+)%/);
  return Boolean(shift && Math.abs(parseFloat(shift[1])) >= 100);
}

/**
 * The frame a tile rests on, per track: the end state, unless the lesson is
 * an exit and the end is empty; then the first frame (the thing before it
 * leaves); failing both, the middle of the move. The same choice as the
 * rule view's stills.
 */
export function restTracks(tracks: readonly Track[]): Track[] {
  return tracks.map((track) => {
    const frames = track.keyframes;
    if (!unseen(frames[frames.length - 1])) return track;
    const pick = !unseen(frames[0]) ? frames[0] : frames[Math.floor(frames.length / 2)];
    return { ...track, keyframes: [pick, pick] };
  });
}

export type MotionTileProps = {
  /** The rule, written on the pane as `data-motion`. */
  id: string;
  tracks: Track[];
  /** Held still at its rest frame: drag lessons, which only make sense by hand. */
  still?: boolean;
  children: ReactNode;
};

export function MotionTile({ id, tracks, still = false, children }: MotionTileProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rest = restTracks(tracks);
    const settle = () => playPane(el, rest, { reduced: true });
    settle();
    el.dataset.ready = "";

    const anchor = el.closest<HTMLAnchorElement>("a[data-rule-link]");
    const frame = el.closest<HTMLElement>("[data-tile-frame]");
    if (still || !anchor) {
      return () => cancelPane(el);
    }

    const exits = rest.some((track, i) => track !== tracks[i]);
    const loops = el.querySelector('[class*="animate-"]') !== null;
    const length = tracksDurationMs(tracks);
    let dwell: ReturnType<typeof setTimeout> | undefined;
    let done: ReturnType<typeof setTimeout> | undefined;
    let back: ReturnType<typeof setTimeout> | undefined;

    const play = () => {
      // The other side is display: none, a wall under an open rule is inert,
      // and a reader who asked for less motion gets none.
      if (el.offsetParent === null || anchor.closest("[inert]") || prefersReducedMotion()) return;
      clearTimeout(done);
      clearTimeout(back);
      playPane(el, tracks, { fromKeyframes: true });
      // Brackets the scene's own CSS loops: gallery.css lets them run only while this is set.
      frame?.setAttribute("data-playing", "");
      done = setTimeout(
        () => {
          frame?.removeAttribute("data-playing");
          if (exits) back = setTimeout(settle, EXIT_HOLD_MS);
        },
        loops ? Math.max(length, LOOP_WINDOW_MS) : length,
      );
    };
    const onEnter = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      clearTimeout(dwell);
      dwell = setTimeout(play, DWELL_MS);
    };
    const onLeave = () => clearTimeout(dwell);
    const onFocusIn = () => {
      if (anchor.matches(":focus-visible")) play();
    };
    const onFocusOut = () => clearTimeout(dwell);

    // Asking for less motion mid-replay stops it there: the pane goes back to its rest frame at once.
    const reduced = window.matchMedia(REDUCED_MOTION_QUERY);
    const onReduced = () => {
      if (!reduced.matches) return;
      clearTimeout(dwell);
      clearTimeout(done);
      clearTimeout(back);
      frame?.removeAttribute("data-playing");
      settle();
    };

    anchor.addEventListener("pointerenter", onEnter);
    anchor.addEventListener("pointerleave", onLeave);
    anchor.addEventListener("pointerdown", onLeave);
    anchor.addEventListener("focusin", onFocusIn);
    anchor.addEventListener("focusout", onFocusOut);
    reduced.addEventListener("change", onReduced);
    return () => {
      reduced.removeEventListener("change", onReduced);
      anchor.removeEventListener("pointerenter", onEnter);
      anchor.removeEventListener("pointerleave", onLeave);
      anchor.removeEventListener("pointerdown", onLeave);
      anchor.removeEventListener("focusin", onFocusIn);
      anchor.removeEventListener("focusout", onFocusOut);
      clearTimeout(dwell);
      clearTimeout(done);
      clearTimeout(back);
      frame?.removeAttribute("data-playing");
      cancelPane(el);
    };
  }, [tracks, still]);

  return (
    <div ref={ref} data-motion={id} aria-hidden="true" className="motion-showcase gw-scene">
      {children}
    </div>
  );
}
