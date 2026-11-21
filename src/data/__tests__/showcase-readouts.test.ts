import { describe, expect, it } from "vitest";
import {
  paneReadout,
  showcaseSpecs,
  type PaneSpec,
} from "@/components/features/rules/demos/showcase-specs";
import { EASE, tracksDurationMs } from "@/lib/showcase-engine";

/**
 * The timing bar under each showcase pane ends in a ms counter, printed right
 * above a caption that states the pane's timing. When the two disagree the
 * page contradicts itself in adjacent lines: sys-9's optimistic heart read
 * "840ms" (its sync receipt) under "fills at 0ms", and motion-7's dismiss
 * kept reading the 220ms entrance while the 160ms exit played.
 *
 * Rules whose deep dive is a bespoke prototype render their own readouts
 * (drag, interrupt, load and toolbar showcases), so their spec tracks are a
 * grid stand-in and are not held to the captions here.
 */
const PROTOTYPE_TRIGGERS = new Set(["drag", "interrupt", "load", "toolbar"]);
/** Triggers whose release plays exitTracks and updates the readout. */
const EXITING_TRIGGERS = new Set(["toggle", "press", "hover"]);

const VARIANTS = ["do", "dont"] as const;

function statedMs(caption: string): number[] {
  return [...caption.matchAll(/(\d+)\s*ms\b/g)].map((match) => Number(match[1]));
}

function panes() {
  return Object.entries(showcaseSpecs)
    .filter(([, spec]) => !PROTOTYPE_TRIGGERS.has(spec.trigger))
    .flatMap(([id, spec]) =>
      VARIANTS.map((variant) => ({ id, variant, spec, pane: spec[variant] as PaneSpec })),
    );
}

describe("showcase readouts agree with their captions", () => {
  it("a pane with readoutMs states that number first in its caption", () => {
    const wrong: string[] = [];
    for (const { id, variant, pane } of panes()) {
      if (pane.readoutMs === undefined) continue;
      const [first] = statedMs(pane.caption);
      if (first !== undefined && first !== pane.readoutMs) {
        wrong.push(`${id}.${variant}: readout ${pane.readoutMs}ms, caption leads with ${first}ms — "${pane.caption}"`);
      }
    }
    expect(wrong, wrong.join("\n")).toEqual([]);
  });

  it("a caption that states durations includes the number the readout counts to", () => {
    const wrong: string[] = [];
    for (const { id, variant, spec, pane } of panes()) {
      // A stagger step ("60ms steps") is spacing, not a length
      // the counter could reach, so it doesn't count as a stated duration.
      const steps = new Set(pane.tracks.map((track) => track.staggerMs));
      const stated = statedMs(pane.caption).filter((ms) => !steps.has(ms));
      if (stated.length === 0) continue;

      const phases: ("enter" | "exit")[] = ["enter"];
      if (pane.exitTracks && EXITING_TRIGGERS.has(spec.trigger)) phases.push("exit");

      for (const phase of phases) {
        const { ms } = paneReadout(pane, phase);
        if (!stated.includes(ms)) {
          wrong.push(`${id}.${variant} ${phase}: readout ${ms}ms, caption states ${stated.join(", ")}ms — "${pane.caption}"`);
        }
      }
    }
    expect(wrong, wrong.join("\n")).toEqual([]);
  });

  it("readoutMs falls inside the pane's own timeline", () => {
    for (const { id, variant, pane } of panes()) {
      if (pane.readoutMs === undefined) continue;
      expect(pane.readoutMs, `${id}.${variant}`).toBeGreaterThanOrEqual(0);
      expect(pane.readoutMs, `${id}.${variant}`).toBeLessThanOrEqual(tracksDurationMs(pane.tracks));
    }
  });

  it("the exit readout reads the exit, not the entrance", () => {
    // motion-7 is the case that shipped wrong: in 220ms, out 160ms.
    const pane = showcaseSpecs["motion-7"].do;
    expect(paneReadout(pane, "enter").ms).toBe(220);
    expect(paneReadout(pane, "exit").ms).toBe(160);
  });

  it("sys-9 and sys-1 count the event the lesson is about", () => {
    expect(paneReadout(showcaseSpecs["sys-9"].do).ms).toBe(0);
    expect(paneReadout(showcaseSpecs["sys-9"].dont).ms).toBe(560);
    expect(paneReadout(showcaseSpecs["sys-1"].do).ms).toBe(900);
    expect(paneReadout(showcaseSpecs["sys-1"].dont).ms).toBe(900);
  });

  it("animation overrides follow their track's curve while wait readouts stay linear", () => {
    for (const variant of VARIANTS) {
      const pane = showcaseSpecs["motion-10"][variant];
      const panel = pane.tracks.find((track) => track.target === "panel");
      expect(panel).toBeDefined();
      expect(paneReadout(pane)).toEqual({ ms: panel!.durationMs, easing: panel!.easing ?? EASE.out });
      expect(paneReadout(showcaseSpecs["sys-1"][variant]).easing).toBe(EASE.linear);
      expect(paneReadout(showcaseSpecs["sys-9"][variant]).easing).toBe(EASE.linear);
    }
  });

  it("motion-2 counts to focus and motion-28 shows the same timing both ways", () => {
    for (const variant of VARIANTS) {
      const focusPane = showcaseSpecs["motion-2"][variant];
      const focus = focusPane.tracks.find((track) => track.target === "focus");
      expect(focus).toBeDefined();
      expect(paneReadout(focusPane)).toEqual({ ms: focus!.delayMs, easing: EASE.linear });
      expect(focusPane.readoutTag).toBe("focus");

      const iconPane = showcaseSpecs["motion-28"][variant];
      expect(paneReadout(iconPane, "enter").ms).toBe(300);
      expect(paneReadout(iconPane, "exit").ms).toBe(300);
    }
  });
});
