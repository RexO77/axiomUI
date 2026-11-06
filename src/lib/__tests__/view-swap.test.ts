import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createViewSwap, type SwapPhase } from "@/lib/view-swap";

type View = "install" | "preview";
let frames: Map<number, FrameRequestCallback>;
let nextFrame: number;

function fixture() {
  const events: string[] = [];
  const onView = vi.fn((view: View) => events.push(`view:${view}`));
  const onPhase = vi.fn((phase: SwapPhase) => events.push(`phase:${phase}`));
  const swap = createViewSwap<View>("install", onView, onPhase);
  return { swap, events, onView, onPhase };
}

function paint() {
  const callbacks = [...frames.values()];
  frames.clear();
  callbacks.forEach((callback) => callback(0));
}

beforeEach(() => {
  vi.useFakeTimers();
  frames = new Map();
  nextFrame = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    const id = nextFrame++;
    frames.set(id, callback);
    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("view swap", () => {
  it("ignores the current view without callbacks or delayed work", () => {
    const { swap, events } = fixture();
    expect(swap.request("install")).toBe(false);
    swap.finishFade();
    swap.reduceMotion();
    swap.cancel();
    swap.reset("install");
    expect(events).toEqual([]);
    expect(vi.getTimerCount()).toBe(0);
    expect(frames.size).toBe(0);
  });

  it("commits the new view while hidden and reveals it on the next frame", () => {
    const { swap, events } = fixture();
    expect(swap.request("preview")).toBe(true);
    expect(events).toEqual(["phase:out"]);
    expect(vi.getTimerCount()).toBe(1);
    swap.finishFade();
    expect(events).toEqual(["phase:out", "phase:swapped", "view:preview"]);
    expect(vi.getTimerCount()).toBe(0);
    expect(frames.size).toBe(1);
    swap.finishFade();
    expect(frames.size).toBe(1);
    paint();
    expect(events).toEqual(["phase:out", "phase:swapped", "view:preview", "phase:idle"]);
    vi.advanceTimersByTime(1000);
    expect(events).toHaveLength(4);
    expect(frames.size).toBe(0);
  });

  it("finishes after 200ms when transitionend is missing", () => {
    const { swap, events } = fixture();
    swap.request("preview");
    vi.advanceTimersByTime(199);
    expect(events).toEqual(["phase:out"]);
    vi.advanceTimersByTime(1);
    expect(events).toEqual(["phase:out", "phase:swapped", "view:preview"]);
    expect(vi.getTimerCount()).toBe(0);
    paint();
    expect(events.at(-1)).toBe("phase:idle");
  });

  it("ignores repeated and reverse requests until the swap is idle", () => {
    const { swap, onView } = fixture();
    swap.request("preview");
    expect(swap.request("preview")).toBe(false);
    expect(swap.request("install", true)).toBe(false);
    swap.finishFade();
    expect(swap.request("install")).toBe(false);
    paint();
    expect(swap.request("install")).toBe(true);
    swap.finishFade();
    paint();
    expect(onView.mock.calls).toEqual([["preview"], ["install"]]);
  });

  it("cancels closing before the view commits", () => {
    const { swap, events, onView } = fixture();
    swap.request("preview");
    swap.cancel();
    vi.advanceTimersByTime(1000);
    paint();
    swap.finishFade();
    expect(events).toEqual(["phase:out", "phase:idle"]);
    expect(onView).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    expect(frames.size).toBe(0);
  });

  it("cancels a pending reveal frame without reverting a committed view", () => {
    const { swap, events, onView } = fixture();
    swap.request("preview");
    swap.finishFade();
    swap.cancel();
    paint();
    expect(events).toEqual(["phase:out", "phase:swapped", "view:preview", "phase:idle"]);
    expect(onView).toHaveBeenCalledExactlyOnceWith("preview");
    expect(frames.size).toBe(0);
  });

  it("silently cancels for cleanup and can be reused after setup", () => {
    const { swap, events } = fixture();
    swap.request("preview");
    swap.cancel(false);
    expect(events).toEqual(["phase:out"]);
    expect(vi.getTimerCount()).toBe(0);
    expect(swap.request("preview")).toBe(true);
    swap.finishFade();
    paint();
    expect(events.at(-1)).toBe("phase:idle");
  });

  it("resets a pending swap without allowing a late view change", () => {
    const { swap, onView } = fixture();
    swap.request("preview");
    swap.reset("install");
    vi.advanceTimersByTime(1000);
    paint();
    expect(onView).not.toHaveBeenCalled();
    expect(swap.request("preview")).toBe(true);
  });

  it("resets a committed preview to install and clears its reveal frame", () => {
    const { swap, onView, onPhase } = fixture();
    swap.request("preview");
    swap.finishFade();
    swap.reset("install");
    paint();
    expect(onView.mock.calls).toEqual([["preview"], ["install"]]);
    expect(onPhase.mock.calls).toEqual([["out"], ["swapped"], ["idle"]]);
    expect(frames.size).toBe(0);
    swap.reset("install");
    expect(onView).toHaveBeenCalledTimes(2);
  });

  it("changes views immediately under reduced motion without phase churn", () => {
    const { swap, events } = fixture();
    expect(swap.request("preview", true)).toBe(true);
    expect(events).toEqual(["view:preview"]);
    expect(vi.getTimerCount()).toBe(0);
    expect(frames.size).toBe(0);
  });

  it("finishes a pending view immediately when reduced motion turns on", () => {
    const { swap, events } = fixture();
    swap.request("preview");
    swap.reduceMotion();
    vi.advanceTimersByTime(1000);
    paint();
    expect(events).toEqual(["phase:out", "view:preview", "phase:idle"]);
    expect(vi.getTimerCount()).toBe(0);
    expect(frames.size).toBe(0);
  });

  it("finishes a committed swap under reduced motion without duplicate callbacks", () => {
    const { swap, events } = fixture();
    swap.request("preview");
    swap.finishFade();
    swap.reduceMotion();
    swap.reduceMotion();
    paint();
    expect(events).toEqual(["phase:out", "phase:swapped", "view:preview", "phase:idle"]);
    expect(frames.size).toBe(0);
  });

  it("ignores an already queued old timeout after cancellation and a new request", () => {
    const timeout = vi.spyOn(globalThis, "setTimeout");
    const { swap, events } = fixture();
    swap.request("preview");
    const oldTimeout = timeout.mock.calls[0][0] as () => void;
    swap.cancel();
    swap.request("preview");
    oldTimeout();
    expect(events).toEqual(["phase:out", "phase:idle", "phase:out"]);
    vi.advanceTimersByTime(200);
    expect(events.at(-1)).toBe("view:preview");
  });

  it("ignores an old reveal frame after reset starts another swap", () => {
    const { swap, events } = fixture();
    swap.request("preview");
    swap.finishFade();
    const oldFrame = [...frames.values()][0];
    swap.reset("install");
    swap.request("preview");
    const before = [...events];
    oldFrame(0);
    expect(events).toEqual(before);
    expect(vi.getTimerCount()).toBe(1);
    swap.finishFade();
    paint();
    expect(events.at(-1)).toBe("phase:idle");
  });
});
