import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  captureReadingAnchor,
  distanceToNearest,
  findReadingAnchor,
  glideToCard,
  holdReadingAnchor,
  restoreReadingAnchor,
  settleReadingAnchor,
  stopGlide,
} from "@/lib/reading-anchor";

let now = 0;
let nextId = 0;
let frames: Map<number, FrameRequestCallback>;
let timers: Map<number, () => void>;
let cards: HTMLElement[];
let headerBottom = 0;
let media: EventTarget & { matches: boolean };
let win: EventTarget & {
  innerWidth: number;
  innerHeight: number;
  scrollY: number;
  scrollBy: ReturnType<typeof vi.fn>;
};
let observers: TestObserver[];

class TestObserver {
  disconnected = false;
  private callback: () => void;
  constructor(callback: () => void) { this.callback = callback; observers.push(this); }
  observe() {}
  disconnect() { this.disconnected = true; }
  fire(queued = false) { if (queued || !this.disconnected) this.callback(); }
}

function card(id: string, y: number, height = 300) {
  return {
    id: `rule-${id}`,
    isConnected: true,
    getBoundingClientRect: () => ({ top: y - win.scrollY, bottom: y + height - win.scrollY }),
    scrollIntoView: vi.fn(),
  } as unknown as HTMLElement;
}

function step(ms = 16) {
  now += ms;
  const pending = [...frames.values()];
  frames.clear();
  pending.forEach((callback) => callback(now));
}

beforeEach(() => {
  now = 0;
  nextId = 0;
  frames = new Map();
  timers = new Map();
  cards = [];
  observers = [];
  headerBottom = 0;
  media = Object.assign(new EventTarget(), { matches: false });
  win = Object.assign(new EventTarget(), {
    innerWidth: 1440,
    innerHeight: 900,
    scrollY: 500,
    scrollBy: vi.fn(({ top }: { top: number }) => { win.scrollY += top; }),
    matchMedia: () => media,
    setTimeout: (callback: () => void) => {
      const id = ++nextId;
      timers.set(id, callback);
      return id;
    },
    clearTimeout: (id: number) => { timers.delete(id); },
  });
  vi.stubGlobal("window", win);
  vi.stubGlobal("document", {
    documentElement: { scrollHeight: 20000 },
    getElementById: (id: string) => cards.find((candidate) => candidate.id === id && candidate.isConnected) ?? null,
    querySelectorAll: () => cards,
    querySelector: () => ({ getBoundingClientRect: () => ({ bottom: headerBottom }) }),
  });
  vi.stubGlobal("ResizeObserver", TestObserver);
  vi.stubGlobal("performance", { now: () => now });
  vi.stubGlobal("getComputedStyle", () => ({ scrollMarginTop: "0px", scrollMarginBottom: "0px" }));
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    const id = ++nextId;
    frames.set(id, callback);
    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => { frames.delete(id); });
});

afterEach(() => {
  stopGlide();
  restoreReadingAnchor();
  vi.unstubAllGlobals();
});

describe("reading anchors", () => {
  it("prefers the open visible rule and otherwise uses the first visible card", () => {
    cards = [card("above", 0), card("first", 600), card("preferred", 1000), card("below", 1800)];
    expect(findReadingAnchor("preferred")).toEqual({ id: "rule-preferred", top: 500 });
    expect(findReadingAnchor("above")).toEqual({ id: "rule-first", top: 100 });
    expect(findReadingAnchor("below")).toEqual({ id: "rule-first", top: 100 });
  });

  it("skips a card fully hidden beneath the sticky mobile header", () => {
    headerBottom = 61;
    cards = [card("occluded", 400, 140), card("visible", 600)];
    expect(findReadingAnchor("occluded")).toEqual({ id: "rule-visible", top: 100 });
  });

  it("restores a captured top once without overriding subsequent reader scrolling", () => {
    cards = [card("read", 600)];
    captureReadingAnchor("read");
    win.scrollY = 450;
    restoreReadingAnchor();
    expect(win.scrollY).toBe(500);
    win.scrollY = 470;
    restoreReadingAnchor();
    expect(win.scrollY).toBe(470);
  });

  it("ignores removed cards and subpixel drift", () => {
    cards = [card("read", 600)];
    holdReadingAnchor({ id: "rule-read", top: 100.5 });
    holdReadingAnchor({ id: "rule-removed", top: 100 });
    expect(win.scrollBy).not.toHaveBeenCalled();
  });

  it.each(["wheel", "touchstart", "keydown", "resize"])("stops delayed anchor correction on %s", (event) => {
    cards = [card("read", 600)];
    settleReadingAnchor({ id: "rule-read", top: 100 }, { isConnected: true } as Element);
    win.dispatchEvent(new Event(event));
    win.scrollY = 450;
    observers[0].fire(true);
    expect(win.scrollY).toBe(450);
    expect(observers[0].disconnected).toBe(true);
    expect(timers.size).toBe(0);
  });

  it("stops paging before capturing a layout change", () => {
    cards = [card("read", 600)];
    glideToCard(card("target", 6000));
    captureReadingAnchor("read");
    expect(frames.size).toBe(0);
    expect(findReadingAnchor("read")).toEqual({ id: "rule-read", top: 100 });
  });

  it("returns cleanup that releases its observer and timeout", () => {
    cards = [card("read", 600)];
    const cleanup = settleReadingAnchor({ id: "rule-read", top: 100 }, { isConnected: true } as Element);
    cleanup();
    cleanup();
    expect(observers[0].disconnected).toBe(true);
    expect(timers.size).toBe(0);
  });
});

describe("docked paging glide", () => {
  it("clamps a nearest-card distance to the scrollable document", () => {
    expect(distanceToNearest(card("above", -1000))).toBe(-500);
    expect(distanceToNearest(card("below", 30000))).toBe(18600);
    expect(distanceToNearest(card("visible", 600))).toBe(0);
  });

  it("keeps one animation when retargeted and limits even a stalled frame to 100px", () => {
    const first = card("first", 6000);
    glideToCard(first);
    step();
    const second = card("second", 10000);
    glideToCard(second);
    expect(frames.size).toBe(1);
    step(1000);
    expect(win.scrollBy).toHaveBeenCalled();
    for (const [options] of win.scrollBy.mock.calls) expect(Math.abs(options.top)).toBeLessThanOrEqual(100);
  });

  it.each([1, 0.5])("settles on a %spx root scroller without leaving a background frame", (quantum) => {
    win.scrollBy.mockImplementation(({ top }: { top: number }) => {
      win.scrollY = Math.round((win.scrollY + top) / quantum) * quantum;
    });
    const target = card("target", 6000);
    glideToCard(target);
    let count = 0;
    while (frames.size > 0 && count++ < 2000) step();

    expect(frames.size).toBe(0);
    expect(distanceToNearest(target)).toBe(0);
    for (const [options] of win.scrollBy.mock.calls) expect(Math.abs(options.top)).toBeLessThanOrEqual(100);
  });

  it.each(["wheel", "touchstart", "resize"])("cancels the pending animation on %s", (event) => {
    glideToCard(card("target", 6000));
    win.dispatchEvent(new Event(event));
    expect(frames.size).toBe(0);
    step();
    expect(win.scrollBy).not.toHaveBeenCalled();
  });

  it("preserves arrow paging while manual navigation keys cancel the glide", () => {
    glideToCard(card("target", 6000));
    win.dispatchEvent(Object.assign(new Event("keydown"), { key: "ArrowRight" }));
    expect(frames.size).toBe(1);
    win.dispatchEvent(Object.assign(new Event("keydown"), { key: "PageDown" }));
    expect(frames.size).toBe(0);
  });

  it("cancels external root scrolling without requiring a wheel or key event", () => {
    glideToCard(card("target", 6000));
    step();
    const calls = win.scrollBy.mock.calls.length;
    win.scrollY += 200;
    win.dispatchEvent(new Event("scroll"));
    expect(frames.size).toBe(0);
    step();
    expect(win.scrollBy).toHaveBeenCalledTimes(calls);
  });

  it("ignores its own scroll events and preserves retargeting", () => {
    glideToCard(card("target", 6000));
    step();
    win.dispatchEvent(new Event("scroll"));
    expect(frames.size).toBe(1);
    glideToCard(card("next", 9000));
    step();
    win.dispatchEvent(new Event("scroll"));
    expect(frames.size).toBe(1);
  });

  it("stops before overwriting external scrolling when its scroll event is delayed", () => {
    glideToCard(card("target", 6000));
    step();
    const calls = win.scrollBy.mock.calls.length;
    win.scrollY += 200;
    step();
    expect(frames.size).toBe(0);
    expect(win.scrollBy).toHaveBeenCalledTimes(calls);
  });

  it("cancels when the motion preference changes", () => {
    glideToCard(card("target", 6000));
    media.matches = true;
    media.dispatchEvent(new Event("change"));
    expect(frames.size).toBe(0);
  });

  it("stops if the target detaches before its next frame", () => {
    const target = card("target", 6000);
    glideToCard(target);
    Object.assign(target, { isConnected: false });
    step();
    expect(frames.size).toBe(0);
    expect(win.scrollBy).not.toHaveBeenCalled();
  });

  it("snaps rather than animates when reduced motion is already enabled", () => {
    media.matches = true;
    const target = card("target", 6000);
    glideToCard(target);
    expect(target.scrollIntoView).toHaveBeenCalledWith({ block: "nearest", behavior: "instant" });
    expect(frames.size).toBe(0);
  });
});
