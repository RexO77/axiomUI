import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  hasShowcase,
  showcaseSpecs,
} from "@/components/features/rules/demos/showcase-specs";
import { rules } from "@/data/ui-logic";
import type { Track } from "@/lib/showcase-engine";

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
        const rest = restStyles(renderToStaticMarkup(createElement("div", null, pane.scene("lg"))));

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
