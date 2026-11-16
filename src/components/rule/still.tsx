// design-system: strict
"use client";

// Still frames for the peek, the phone's rising card and the palette: a rule's
// Do and Don't at 1:1 on one flat split canvas. Motion rules show their scene
// held still (never an empty stage, nothing left running), and the scene's
// fake window chrome is hidden in compare.css, so a still is never a window
// inside a card.

import { memo, useLayoutEffect, useRef } from "react";

import type { Rule } from "@/data/ui-logic";
import { RulePreview } from "@/components/features/rules/rule-preview";
import { hasShowcase, showcaseSpecs } from "@/components/features/rules/demos/showcase-specs";
import type { Variant } from "@/components/features/rules/preview-primitives";
import { VerdictLabel } from "@/components/ui/verdict-label";
import { cancelPane, playPane, type Track } from "@/lib/showcase-engine";
import "./compare.css";

/** A keyframe that leaves its node unseen: faded out, scaled to nothing, or
 *  pushed a whole box away (slideYOut("150%")). */
function unseen(frame: Keyframe | undefined): boolean {
  if (!frame) return true;
  if (frame.opacity !== undefined && Number(frame.opacity) === 0) return true;
  const transform = typeof frame.transform === "string" ? frame.transform : "";
  if (/scale\(\s*0(\.0+)?\s*[,)]/.test(transform)) return true;
  const shift = transform.match(/translate[XY]?\(\s*(-?[\d.]+)%/);
  return Boolean(shift && Math.abs(parseFloat(shift[1])) >= 100);
}

/**
 * The most telling frame per track: the end state, unless the lesson is an
 * exit and the end is empty; then the first frame (the thing before it
 * leaves); failing both, the middle of the move.
 */
function stillTracks(tracks: readonly Track[]): Track[] {
  return tracks.map((track) => {
    const frames = track.keyframes;
    if (!unseen(frames[frames.length - 1])) return track;
    const pick = !unseen(frames[0]) ? frames[0] : frames[Math.floor(frames.length / 2)];
    return { ...track, keyframes: [pick, pick] };
  });
}

function SettledScene({ ruleId, variant }: { ruleId: string; variant: Variant }) {
  const pane = showcaseSpecs[ruleId]?.[variant];
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !pane) return;
    // The engine's reduced path: duration 0, fill forwards. A still.
    playPane(el, stillTracks(pane.tracks), { reduced: true });
    return () => cancelPane(el);
  }, [pane]);
  if (!pane) return null;
  return (
    <div ref={ref} aria-hidden="true" className="motion-showcase cmp-scene">
      {pane.scene()}
    </div>
  );
}

function PreviewStill({ rule, variant }: { rule: Rule; variant: Variant }) {
  if (hasShowcase(rule.id)) return <SettledScene ruleId={rule.id} variant={variant} />;
  return <RulePreview rule={rule} variant={variant} />;
}

/** Do and Don't as stills on one split canvas. The host card is the canvas. */
export const StillPair = memo(function StillPair({ rule }: { rule: Rule }) {
  return (
    <div className="still-pair" inert>
      {(["do", "dont"] as const).map((variant) => (
        <div key={variant} className="still-pane">
          <span className="still-label">
            <VerdictLabel verdict={variant} />
          </span>
          <div className="still">
            <PreviewStill rule={rule} variant={variant} />
          </div>
        </div>
      ))}
    </div>
  );
});
