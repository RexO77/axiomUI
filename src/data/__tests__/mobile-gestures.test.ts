import { describe, expect, it } from "vitest";
import { anchors, detents, gesturePath, photoActions, sheetLanding } from "@/components/features/rules/previews/mobile/kit/gestures-path";
import { screenMetrics } from "@/components/features/rules/previews/mobile/kit/geometry";
import { rules } from "../ui-logic";

describe("gesture captions and paths", () => {
  it("starts the trim handle on the stated side of the simulated Back region", () => {
    const rule = rules.find(rule => rule.id === "mobile-12")!;
    for (const side of ["do", "dont"] as const) expect(rule[side]).toContain("x=" + anchors[side]);
    expect(anchors.do).toBeGreaterThan(screenMetrics.edge);
    expect(anchors.dont).toBeLessThan(screenMetrics.edge);
    expect(gesturePath("trim", true).at(-1)?.x).toBe(-gesturePath("trim").at(-1)!.x);
  });

  it("offers the three named long-press actions", () => {
    const rule = rules.find(rule => rule.id === "mobile-14")!;
    expect(photoActions).toHaveLength(3);
    for (const action of photoActions) expect(rule.do).toContain(action);
  });

  it("releases both lifts at 160 px and selects the stated rest height", () => {
    const rule = rules.find(rule => rule.id === "mobile-15")!;
    for (const path of ["quick", "slow"] as const) {
      const [down, move, up] = gesturePath(path);
      const travel = down.y - up.y;
      const release = detents.Peek + travel;
      const velocity = (move.y - up.y) * 1000 / (up.time - move.time);
      expect(rule.do).toContain(travel + " px");
      expect(release).toBe(160);
      expect(sheetLanding(release, velocity, true)).toEqual(path === "quick" ?
        { name: "Half", height: 422, projected: 420 } : { name: "Peek", height: 120, projected: 170 });
      expect(sheetLanding(release, velocity, false).height).toBe(detents.Peek);
    }
  });
});
