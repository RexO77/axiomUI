import { useImperativeHandle, useRef, type PointerEvent, type Ref } from "react";
import type { Sample } from "./geometry";
import { anchors, clamp, detents, holdTime, photoActions } from "./gesture-metrics";

export { anchors, clamp, detents, holdTime, photoActions };

export type PathName = "trim" | "vertical" | "horizontal" | "hold" | "archive" | "quick" | "slow";
export const pathLabels: Record<PathName, string> = {
  trim: "Replay inward drag", vertical: "Replay vertical swipe", horizontal: "Replay horizontal drag",
  hold: "Replay long press", archive: "Replay archive swipe", quick: "Replay quick flick", slow: "Replay slow drag",
};

// Samples use displacement from the control's starting point, in fixture units.
export function gesturePath(name: PathName, right = false): Sample[] {
  const [x, y, duration] = {
    trim: [right ? -60 : 60, 0, 300], vertical: [0, -88, 300], horizontal: [60, 0, 300],
    hold: [0, 0, holdTime], archive: [-80, 0, 300], quick: [0, -40, 40 / 1300 * 1000], slow: [0, -40, 800],
  }[name];
  return [
    { phase: "down", time: 0, x: 0, y: 0, pointerId: -1 },
    { phase: "move", time: duration / 2, x: x / 2, y: y / 2, pointerId: -1 },
    { phase: "up", time: duration, x, y, pointerId: -1 },
  ];
}

export function sheetLanding(release: number, velocity: number, useSpeed: boolean) {
  const projected = clamp(release + 0.2 * velocity, detents.Peek, detents.Full);
  const target = useSpeed ? projected : release;
  const [name, height] = Object.entries(detents).reduce((best, stop) =>
    Math.abs(stop[1] - target) < Math.abs(best[1] - target) ? stop : best);
  return { projected, name, height };
}

export type Receiver = (event: Sample) => void;
export type ReplayRef = Ref<Receiver>;
type Source = "mouse" | "touch" | "pen" | "replay";
type Input = Sample & { source: Source; startInset: number };

// Both replay controls and the pointer surface enter through the same receiver.
export function useGestureInput(ref: ReplayRef, transition: (sample: Input) => void, yScale = 1) {
  const origin = useRef<{ x: number; y: number; pointerId: number; inset: number } | null>(null);
  useImperativeHandle(ref, () => event => {
    origin.current = null;
    transition({ ...event, source: "replay", startInset: 0 });
  });
  function send(e: PointerEvent<HTMLElement>, phase: Sample["phase"]) {
    if (phase === "down") {
      if (origin.current || e.button !== 0) return;
      const rect = e.currentTarget.getBoundingClientRect();
      origin.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId, inset: e.clientX - rect.left - rect.width / 2 };
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    const start = origin.current;
    if (!start || start.pointerId !== e.pointerId) return;
    transition({ phase, time: e.timeStamp, x: e.clientX - start.x, y: (e.clientY - start.y) * yScale,
      pointerId: e.pointerId, source: e.pointerType as Source, startInset: start.inset });
    if (phase === "up" || phase === "cancel") origin.current = null;
  }
  return {
    onPointerDown: (e: PointerEvent<HTMLElement>) => send(e, "down"),
    onPointerMove: (e: PointerEvent<HTMLElement>) => send(e, "move"),
    onPointerUp: (e: PointerEvent<HTMLElement>) => send(e, "up"),
    onPointerCancel: (e: PointerEvent<HTMLElement>) => send(e, "cancel"),
    onLostPointerCapture: (e: PointerEvent<HTMLElement>) => send(e, "cancel"),
  };
}
