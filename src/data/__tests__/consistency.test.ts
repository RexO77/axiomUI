import { describe, expect, it } from "vitest";

import { rules } from "@/data/ui-logic";
import { showcaseSpecs } from "@/components/features/rules/demos/showcase-specs";
import { tracksDurationMs } from "@/lib/showcase-engine";

/**
 * Guardrails against words drifting away from pixels.
 *
 * A rule's `do`/`dont` string renders as mono text directly beside the preview
 * or showcase that demonstrates it, and the tutorial prose quotes both. A round
 * of parallel edits once left ~12 rules stating one value while the pane six
 * pixels away rendered another — a stale duration in a caption, a Tailwind class
 * that does not exist, a contrast ratio off by enough to invert its own point.
 *
 * None of that is caught by types, lint, or the existing tests: every one of
 * those strings is a valid string. These tests check the claims themselves.
 */

// ── Contrast ratios ─────────────────────────────────────────────────

/** WCAG 2.x relative luminance. */
function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const channel = (pair: string) => {
    const c = parseInt(pair, 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const r = channel(h.slice(0, 2));
  const g = channel(h.slice(2, 4));
  const b = channel(h.slice(4, 6));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(fg: string, bg: string): number {
  const a = luminance(fg);
  const b = luminance(bg);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

/** `#737373 on #ffffff (4.7:1)` — the form the catalog uses for contrast pairs. */
const CONTRAST_CLAIM = /#([0-9a-f]{6}) on #([0-9a-f]{6}) \(([0-9.]+):1\)/gi;

describe("stated contrast ratios are true", () => {
  it("every '#fg on #bg (N:1)' claim matches the computed ratio", () => {
    const wrong: string[] = [];

    for (const rule of rules) {
      for (const field of ["do", "dont"] as const) {
        const value = rule[field];
        for (const match of value.matchAll(CONTRAST_CLAIM)) {
          const [, fg, bg, claimed] = match;
          const actual = contrastRatio(`#${fg}`, `#${bg}`);
          // Claims are rounded for display; allow the rounding, not an error.
          const tolerance = claimed.includes(".") ? 0.05 : 0.5;
          if (Math.abs(actual - Number(claimed)) > tolerance) {
            wrong.push(
              `${rule.id}.${field}: claims ${claimed}:1, computes ${actual.toFixed(2)}:1 (${match[0]})`
            );
          }
        }
      }
    }

    expect(wrong, wrong.join("\n")).toEqual([]);
  });
});

// ── Tailwind spacing tokens ─────────────────────────────────────────

/**
 * Tailwind's default numeric spacing scale. A `do`/`dont` naming a class off
 * this scale (`gap-18`) reads as authoritative and silently renders nothing.
 */
const TAILWIND_SPACING = new Set([
  "0", "0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "5", "6", "7", "8", "9",
  "10", "11", "12", "14", "16", "20", "24", "28", "32", "36", "40", "44", "48",
  "52", "56", "60", "64", "72", "80", "96",
]);

const SPACING_CLASS = /\b(?:gap|gap-x|gap-y|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|space-x|space-y)-([0-9.]+)\b/g;

describe("Tailwind classes named in rule values exist", () => {
  it("every spacing class in a do/dont is on the default scale", () => {
    const bogus: string[] = [];

    for (const rule of rules) {
      for (const field of ["do", "dont"] as const) {
        for (const match of rule[field].matchAll(SPACING_CLASS)) {
          if (!TAILWIND_SPACING.has(match[1])) {
            bogus.push(`${rule.id}.${field}: "${match[0]}" is not on Tailwind's scale`);
          }
        }
      }
    }

    expect(bogus, bogus.join("\n")).toEqual([]);
  });
});

// ── Showcase caption durations ──────────────────────────────────────

/**
 * A caption that states a duration in its **spec segment** must state one the
 * pane actually runs. Retiming a spec without retiming its caption is how a
 * demo ends up contradicting its own label while every test still passes.
 *
 * Two deliberate narrowings, both learned the hard way:
 *
 * 1. Only the spec segment is checked — the text before the em dash. The house
 *    caption format is `<spec facts> — <consequence>`, and the consequence half
 *    is prose ("dead for the first 100ms"), where a number describes behaviour
 *    rather than naming a track value.
 *
 * 2. Rules whose deep dive is a bespoke prototype are exempt. Their captions
 *    describe the prototype's real timings — motion-22's 80ms is
 *    `setInterval(..., 80)` in load-showcase.tsx, motion-19's 450ms is
 *    `durationMs: 450` in drag-showcases.tsx — while the grid `tracks` are a
 *    simplified stand-in on a different clock. Checking those against the grid
 *    track flags correct captions, so it is worse than not checking them.
 */
const PROTOTYPE_DRIVEN = new Set([
  "motion-11", // tooltip-showcase
  "motion-12", // interrupt-showcase
  "motion-18", // drag-showcases
  "motion-19", // drag-showcases
  "motion-20", // drag-showcases
  "motion-21", // load-showcase
  "motion-22", // load-showcase
]);

/** The spec-facts half of a caption: everything before the em dash. */
function specSegment(caption: string): string {
  const dash = caption.indexOf("\u2014");
  return dash === -1 ? caption : caption.slice(0, dash);
}

describe("showcase captions state durations the panes actually run", () => {
  it("every Nms in a caption's spec segment matches a real duration", () => {
    const stale: string[] = [];

    for (const [id, spec] of Object.entries(showcaseSpecs)) {
      if (PROTOTYPE_DRIVEN.has(id)) continue;

      for (const variant of ["do", "dont"] as const) {
        const pane = spec[variant];
        const honest = new Set<number>();

        // The showcase ships a 1× / ½× / ¼× speed control, so a caption may
        // legitimately cite the shipped-speed equivalent of what the pane runs
        // ("220ms stretched to 880ms"). Those are durations the reader can
        // actually observe, so they count as honest.
        const RATES = [1, 0.5, 0.25];
        const add = (ms: number) => {
          for (const rate of RATES) honest.add(Math.round(ms * rate));
        };

        const collect = (tracks: typeof pane.tracks) => {
          add(Math.round(tracksDurationMs(tracks)));
          for (const t of tracks) {
            add(t.durationMs);
            honest.add(t.delayMs ?? 0);
            add((t.delayMs ?? 0) + t.durationMs);
            if (t.staggerMs !== undefined) {
              honest.add(t.staggerMs);
              // The last staggered child's landing time, which captions cite.
              add(t.durationMs + t.staggerMs * 2);
            }
          }
        };

        collect(pane.tracks);
        if (pane.exitTracks) collect(pane.exitTracks);

        for (const match of specSegment(pane.caption).matchAll(/(\d+)\s*ms/g)) {
          const claimed = Number(match[1]);
          if (!honest.has(claimed)) {
            stale.push(
              `${id}.${variant}: caption says ${claimed}ms; pane runs ${[...honest]
                .sort((a, b) => a - b)
                .join(", ")}  —  "${pane.caption}"`
            );
          }
        }
      }
    }

    expect(stale, stale.join("\n")).toEqual([]);
  });
});

// ── Scale percentages ───────────────────────────────────────────────

/**
 * A caption or hint that states a percentage must state one the keyframes
 * actually produce. `scale(0.96)` is a 4% reduction, not 6% — an easy slip,
 * and invisible to every other check because "6%" is a perfectly good string.
 *
 * Percentages are collected across both panes of a spec, because a shared hint
 * legitimately contrasts them ("4% is acknowledgment, 10% is drama").
 */
const SCALE_IN_KEYFRAME = /scale\(([0-9.]+)\)/g;
/** Captions cite translate percentages too ("-100% + scale(0.5)"). */
const TRANSLATE_PCT_IN_KEYFRAME = /translate[XY]?\((-?[0-9.]+)%/g;

describe("stated scale percentages match the keyframes", () => {
  it("every N% in a caption or hint is a real scale delta or translate", () => {
    const wrong: string[] = [];

    for (const [id, spec] of Object.entries(showcaseSpecs)) {
      const deltas = new Set<number>();

      for (const variant of ["do", "dont"] as const) {
        const pane = spec[variant];
        for (const track of [...pane.tracks, ...(pane.exitTracks ?? [])]) {
          for (const frame of track.keyframes) {
            const transform = String(
              (frame as Record<string, unknown>).transform ?? ""
            );
            for (const match of transform.matchAll(SCALE_IN_KEYFRAME)) {
              // The delta only. Admitting the raw value too would make any spec
              // with a scale(1) keyframe accept "100%", which is most of them.
              deltas.add(Math.round(Math.abs(1 - Number(match[1])) * 100));
            }
            for (const match of transform.matchAll(TRANSLATE_PCT_IN_KEYFRAME)) {
              deltas.add(Math.abs(Math.round(Number(match[1]))));
            }
          }
        }
      }

      // Nothing to check against if this spec animates no scale.
      if (deltas.size === 0) continue;

      const claims = [spec.do.caption, spec.dont.caption, spec.hint ?? ""];
      for (const claim of claims) {
        for (const match of claim.matchAll(/(\d+)\s*%/g)) {
          const pct = Number(match[1]);
          if (!deltas.has(pct)) {
            wrong.push(
              `${id}: claims ${pct}%; keyframes give ${[...deltas]
                .sort((a, b) => a - b)
                .join(", ")}%  —  "${claim}"`
            );
          }
        }
      }
    }

    expect(wrong, wrong.join("\n")).toEqual([]);
  });
});

// ── Do/Don't must be a real pair ────────────────────────────────────

describe("every rule's do and dont form a comparable pair", () => {
  it("do and dont are never identical", () => {
    const same = rules.filter((r) => r.do.trim() === r.dont.trim()).map((r) => r.id);
    expect(same, `identical pair: ${same.join(", ")}`).toEqual([]);
  });

  it("neither side is empty", () => {
    const empty = rules
      .filter((r) => !r.do.trim() || !r.dont.trim())
      .map((r) => r.id);
    expect(empty, `empty side: ${empty.join(", ")}`).toEqual([]);
  });
});
