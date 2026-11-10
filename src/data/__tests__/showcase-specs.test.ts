import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  hasShowcase,
  showcaseSpecs,
} from "@/components/features/rules/demos/showcase-specs";
import { rules } from "@/data/ui-logic";
import { finishPane, paneIsLive, playPane, settlePane, type Track } from "@/lib/showcase-engine";

const TRIGGERS = new Set([
  "replay",
  "action",
  "toggle",
  "press",
  "hover",
  "drag",
  "interrupt",
  "load",
  "toolbar",
]);

describe("showcase specs", () => {
  it("every spec key is a real rule id", () => {
    const ruleIds = new Set(rules.map((rule) => rule.id));

    for (const key of Object.keys(showcaseSpecs)) {
      expect(ruleIds.has(key), `unknown showcase key: ${key}`).toBe(true);
    }
  });

  it("covers every motion rule", () => {
    for (const rule of rules.filter((candidate) => candidate.category === "motion")) {
      expect(hasShowcase(rule.id), `motion rule without showcase: ${rule.id}`).toBe(true);
    }
  });

  it("specs are structurally complete", () => {
    for (const [id, spec] of Object.entries(showcaseSpecs)) {
      expect(TRIGGERS.has(spec.trigger), `${id} trigger`).toBe(true);

      for (const variant of ["do", "dont"] as const) {
        expect(spec[variant].caption.trim(), `${id}.${variant} caption`).not.toBe("");
        expect(spec[variant].tracks.length, `${id}.${variant} tracks`).toBeGreaterThan(0);
        expect(typeof spec[variant].scene, `${id}.${variant} scene`).toBe("function");
      }

      if (spec.trigger === "toggle" || spec.trigger === "press" || spec.trigger === "hover") {
        expect(
          spec.do.exitTracks?.length,
          `${id}.do exitTracks required for ${spec.trigger}`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it("every track has explicit start and end keyframes", () => {
    for (const [id, spec] of Object.entries(showcaseSpecs)) {
      for (const variant of ["do", "dont"] as const) {
        for (const track of spec[variant].tracks) {
          expect(
            track.keyframes.length,
            `${id}.${variant} → ${track.target}`,
          ).toBeGreaterThanOrEqual(2);
        }
      }
    }
  });
});

// ── Rest styles the tracks must own ─────────────────────────────────

/**
 * Inline styles a scene sets on an animated node to hide it at rest. These are
 * the ones a track can leave behind: the engine fills forwards, so a property
 * the keyframes never mention keeps its rest value. Layout properties (width,
 * height, transform-origin, border-radius) also size static nodes such as
 * motion-20's knob, so they are not listed.
 */
const STATE_PROPS = new Set([
  "opacity",
  "transform",
  "filter",
  "translate",
  "scale",
  "rotate",
  "backgroundColor",
  "clipPath",
]);

const camel = (prop: string) => prop.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

/** data-anim target → the state properties its rest inline style sets. */
function restStyles(markup: string): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  for (const [tag] of markup.matchAll(/<[a-z][^>]*>/g)) {
    const target = /data-anim="([^"]+)"/.exec(tag)?.[1];
    const style = /style="([^"]*)"/.exec(tag)?.[1];
    if (!target || !style) continue;
    const props = out.get(target) ?? new Set<string>();
    for (const declaration of style.split(";")) {
      const prop = camel(declaration.split(":")[0] ?? "");
      if (STATE_PROPS.has(prop)) props.add(prop);
    }
    out.set(target, props);
  }
  return out;
}

/** Every property the keyframes of one track set mention, per target. */
function keyedProps(tracks: Track[]): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  for (const track of tracks) {
    const props = out.get(track.target) ?? new Set<string>();
    for (const frame of track.keyframes) {
      for (const prop of Object.keys(frame)) {
        if (prop !== "offset" && prop !== "easing" && prop !== "composite") props.add(prop);
      }
    }
    out.set(track.target, props);
  }
  return out;
}

describe("tracks key every rest style they animate", () => {
  /**
   * motion-28's don't pane shared the do pane's scene, where the incoming icon
   * rests at `scale(0.25)` + `blur(4px)`, but its tracks keyed only opacity.
   * The swap faded in a blurred speck instead of the check.
   */
  it("a track that animates a hidden node keys every state property the node rests with", () => {
    const missing: string[] = [];

    for (const [id, spec] of Object.entries(showcaseSpecs)) {
      for (const variant of ["do", "dont"] as const) {
        const pane = spec[variant];
        const rest = restStyles(renderToStaticMarkup(createElement("div", null, pane.scene())));

        const sets: [string, Track[] | undefined][] = [
          ["tracks", pane.tracks],
          ["exitTracks", pane.exitTracks],
        ];
        for (const [name, tracks] of sets) {
          if (!tracks) continue;
          for (const [target, keyed] of keyedProps(tracks)) {
            for (const prop of rest.get(target) ?? []) {
              if (!keyed.has(prop)) {
                missing.push(`${id}.${variant}.${name} → ${target}: rests with ${prop} but never keys it`);
              }
            }
          }
        }
      }
    }

    expect(missing, missing.join("\n")).toEqual([]);
  });

  it("motion-28's don't pane swaps to a full-size, sharp icon", () => {
    const [, iconIn] = showcaseSpecs["motion-28"].dont.tracks;
    expect(iconIn.target).toBe("icon-in");
    expect(iconIn.keyframes.at(-1)).toEqual({ opacity: 1, transform: "scale(1)", filter: "blur(0px)" });
  });
});

// ── Copy that renders as plain text ─────────────────────────────────

describe("showcase copy", () => {
  /**
   * Captions, hints and control labels render as plain text. A backtick meant
   * as inline code ("browser default `ease`") prints as a literal backtick.
   */
  it("never contains a backtick", () => {
    const ticked: string[] = [];
    for (const [id, spec] of Object.entries(showcaseSpecs)) {
      const copy = [
        spec.hint,
        spec.hintReduced,
        spec.control,
        spec.controlEngaged,
        spec.do.caption,
        spec.dont.caption,
        spec.do.readoutTag,
        spec.dont.readoutTag,
      ];
      for (const text of copy) {
        if (text?.includes("`")) ticked.push(`${id}: ${text}`);
      }
    }
    expect(ticked, ticked.join("\n")).toEqual([]);
  });

  /**
   * The speed control only renders on timed playthroughs with full motion:
   * gestures, fully pinned specs and reduced motion all hide it. A hint that
   * says "switch to ¼×" must therefore belong to a spec that can show the
   * control, and carry a reduced-motion wording that doesn't mention a rate.
   */
  it("only points at the speed control where it can render", () => {
    const RATE = /[¼½]×|\b1×/;
    const broken: string[] = [];
    for (const [id, spec] of Object.entries(showcaseSpecs)) {
      const isGesture = spec.trigger === "press" || spec.trigger === "hover";
      const pinned = Boolean(spec.do.pinRate && spec.dont.pinRate);
      // Hotkey specs replace the per-rule hint with the hotkey line.
      const shownHint = isGesture || !spec.hotkey ? spec.hint : undefined;
      if (shownHint && RATE.test(shownHint)) {
        if (isGesture || pinned) broken.push(`${id}: hint names a rate, but the speed control never renders`);
        else if (!spec.hintReduced) broken.push(`${id}: hint names a rate, but has no hintReduced`);
      }
      if (spec.hintReduced && RATE.test(spec.hintReduced)) {
        broken.push(`${id}: hintReduced names a rate`);
      }
    }
    expect(broken, broken.join("\n")).toEqual([]);
  });
});

// ── Settle and exit land on the scene's rest frame ──────────────────

/** data-anim target → its first node's inline rest values, camelCased. */
function restValues(markup: string): Map<string, Record<string, string>> {
  const out = new Map<string, Record<string, string>>();
  for (const [tag] of markup.matchAll(/<[a-z][^>]*>/g)) {
    const target = /data-anim="([^"]+)"/.exec(tag)?.[1];
    if (!target || out.has(target)) continue;
    const values: Record<string, string> = {};
    const style = /style="([^"]*)"/.exec(tag)?.[1] ?? "";
    for (const declaration of style.split(";")) {
      const [prop, ...value] = declaration.split(":");
      if (prop?.trim()) values[camel(prop)] = value.join(":").trim();
    }
    out.set(target, values);
  }
  return out;
}

/** What a node shows when its scene sets nothing inline (the engine's own
 *  rest defaults in motion-showcase.tsx). */
const REST_DEFAULTS: Record<string, string> = { opacity: "1", transform: "none", filter: "none" };

const IDENTITY_FN =
  /\b(?:translate[XYZ]?\((?:\s*-?0(?:px|%)?\s*,?)+\)|scale[XYZ]?\((?:\s*1\s*,?)+\)|rotate[XYZ]?\(\s*0(?:deg)?\s*\)|blur\(\s*0(?:px)?\s*\))/gi;

/** "scale(1)", "translateY(0)" and "none" are the same frame. */
function normalize(prop: string, value: string | number | null | undefined): string {
  const text = String(value ?? "").trim().toLowerCase();
  if (prop === "opacity") return String(Number(text));
  if (prop === "transform" || prop === "filter") {
    const rest = text.replace(IDENTITY_FN, "").replace(/\s+/g, " ").trim();
    return rest === "" || rest === "none" ? "none" : rest;
  }
  return text;
}

/** The final value each target's exit leaves on each property: the last
 *  keyframe of whichever track keys that property last. */
function endFrames(tracks: Track[]): Map<string, Record<string, string | number>> {
  const out = new Map<string, Record<string, string | number>>();
  const endsAt = new Map<string, number>();
  for (const track of tracks) {
    const end = (track.delayMs ?? 0) + track.durationMs;
    const last = track.keyframes.at(-1) ?? {};
    const frame = out.get(track.target) ?? {};
    for (const [prop, value] of Object.entries(last)) {
      if (prop === "offset" || prop === "easing" || prop === "composite" || value == null) continue;
      const key = `${track.target}:${prop}`;
      if ((endsAt.get(key) ?? -1) > end) continue;
      endsAt.set(key, end);
      frame[prop] = value;
    }
    out.set(track.target, frame);
  }
  return out;
}

/** Exits whose end frame is the lesson, so they deliberately stop short of rest. */
const ENDS_OFF_REST: Record<string, string> = {
  "motion-15.dont": "the fixed-pixel exit strands the taller toast; that is what the pane shows",
};

describe("settle and exit", () => {
  /**
   * The deep dive used to settle a replay by playing its tracks backwards.
   * motion-2's key press (scale 1 → 0.88 → 1) reversed is the same press, so
   * every settle pressed the key a second time. A track that leaves and comes
   * back needs an exit that says where to go instead. Only replay and action
   * panes settle; drag, interrupt, load and toolbar rules run their own
   * prototypes, and their round-trip tracks are grid stand-ins that end where
   * they start.
   */
  it("a settling pane with a leave-and-return track declares exitTracks", () => {
    const missing: string[] = [];
    for (const [id, spec] of Object.entries(showcaseSpecs)) {
      if (spec.trigger !== "replay" && spec.trigger !== "action") continue;
      for (const variant of ["do", "dont"] as const) {
        const pane = spec[variant];
        if (pane.exitTracks) continue;
        for (const track of pane.tracks) {
          const frames = track.keyframes.map(({ offset, easing, composite, ...values }) => {
            void offset;
            void easing;
            void composite;
            return JSON.stringify(values);
          });
          const returns = frames[0] === frames.at(-1);
          const moves = frames.some((frame) => frame !== frames[0]);
          if (returns && moves) missing.push(`${id}.${variant} → ${track.target}: leaves and returns, but no exitTracks`);
        }
      }
    }
    expect(missing, missing.join("\n")).toEqual([]);
  });

  /**
   * After a settle the engine hands each node back to its rest style, and the
   * next play starts from the track's first keyframe. An exit that stops
   * anywhere else (comp-9's fill used to park at scale(0.97)) would snap on
   * that hand-back. A node that ends invisible has no visible frame to miss,
   * so only its opacity is held to rest.
   */
  it("every exit ends each target at its scene's rest frame", () => {
    const off: string[] = [];
    for (const [id, spec] of Object.entries(showcaseSpecs)) {
      for (const variant of ["do", "dont"] as const) {
        const pane = spec[variant];
        if (!pane.exitTracks || ENDS_OFF_REST[`${id}.${variant}`]) continue;
        const rest = restValues(renderToStaticMarkup(createElement("div", null, pane.scene())));
        for (const [target, frame] of endFrames(pane.exitTracks)) {
          const restFrame = rest.get(target) ?? {};
          const hidden = normalize("opacity", frame.opacity ?? restFrame.opacity ?? "1") === "0";
          for (const [prop, value] of Object.entries(frame)) {
            if (hidden && prop !== "opacity") continue;
            const expected = restFrame[prop] ?? REST_DEFAULTS[prop];
            if (expected === undefined) continue;
            if (normalize(prop, value) !== normalize(prop, expected)) {
              off.push(`${id}.${variant}.exitTracks → ${target}: ends ${prop} ${value}, rests at ${expected}`);
            }
          }
        }
      }
    }
    expect(off, off.join("\n")).toEqual([]);
  });
});

describe("playback interruption", () => {
  afterEach(() => vi.unstubAllGlobals());

  class TestEffect {
    readonly target: HTMLElement;

    constructor(target: HTMLElement) {
      this.target = target;
    }
  }

  function fixture() {
    const runs: Array<{
      frames: Keyframe[];
      duration: number;
      finish: () => void;
      cancel: ReturnType<typeof vi.fn>;
    }> = [];
    let opacity = "1";
    let probe: string | undefined;

    vi.stubGlobal("KeyframeEffect", TestEffect);
    vi.stubGlobal("getComputedStyle", () => ({ opacity: probe ?? opacity }));

    const element = {
      animate(frames: Keyframe[], options: KeyframeAnimationOptions) {
        if (options.fill === "both" && options.duration === 1) {
          probe = String(frames[0].opacity);
          return { cancel: () => { probe = undefined; } };
        }
        const { promise: finished, resolve: finish, reject } = Promise.withResolvers<void>();
        // The real API exposes cancellation through the finished promise.
        void finished.catch(() => {});
        const cancel = vi.fn(() => reject(new Error("cancelled")));
        runs.push({ frames, duration: Number(options.duration), finish, cancel });
        return { effect: new TestEffect(element as unknown as HTMLElement), cancel, finished };
      },
    };
    const root = { querySelectorAll: () => [element] } as unknown as HTMLElement;
    const track = (from: number, to: number): Track[] => [{
      target: "panel",
      keyframes: [{ opacity: from }, { opacity: to }],
      durationMs: 120,
    }];
    return { root, runs, track, paint: (value: string) => { opacity = value; } };
  }

  it("releases from the displayed value and shortens the remaining travel", () => {
    const { root, runs, track, paint } = fixture();
    playPane(root, track(1, 0));
    paint("0.6");

    playPane(root, track(0, 1));

    expect(runs[0].cancel).toHaveBeenCalledOnce();
    expect(runs[1].frames[0].opacity).toBe("0.6");
    expect(runs[1].duration).toBeCloseTo(48);
  });

  it("abandons the previous reset when another replay takes over", async () => {
    const { root, runs, track } = fixture();
    const first = finishPane(root, track(1, 0));
    const second = finishPane(root, track(1, 0));

    expect(await first).toBeNull();
    expect(runs[1].cancel).not.toHaveBeenCalled();
    runs[1].finish();
    expect(await second).toHaveLength(1);
  });

  it("never clears a newer play between settle completion and cleanup", async () => {
    const { root, runs, track } = fixture();
    const settling = settlePane(root, track(0, 1));
    runs[0].finish();
    // Let finishPane observe ownership before its caller resumes.
    await Promise.resolve();
    await Promise.resolve();

    playPane(root, track(1, 0));

    expect(await settling).toBe(false);
    expect(runs[1].cancel).not.toHaveBeenCalled();
    expect(paneIsLive(root)).toBe(true);
  });
});
