import { describe, expect, it } from "vitest";
import {
  hasShowcase,
  showcaseSpecs,
} from "@/components/features/rules/demos/showcase-specs";
import { rules } from "@/data/ui-logic";

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
