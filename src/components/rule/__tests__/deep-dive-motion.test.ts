import { afterEach, describe, expect, it, vi } from "vitest";

import { cancelDeepDive, toggleDeepDive } from "../deep-dive-motion";

function fixture() {
  const events: string[] = [];
  const animations: { animation: Animation; finish: () => void }[] = [];
  const animate = vi.fn(() => {
    let finish!: () => void;
    let reject!: (reason: Error) => void;
    const animation = {
      finished: new Promise<void>((resolve, fail) => { finish = resolve; reject = fail; }),
      cancel: vi.fn(() => { events.push("cancel"); reject(new Error("cancelled")); }),
    } as unknown as Animation;
    animations.push({ animation, finish });
    return animation;
  });
  const rect = { left: 0, top: 0, width: 400, height: 600 };
  const side = { getBoundingClientRect: () => rect, animate };
  const sheet = { clientWidth: 1200, clientHeight: 900, getBoundingClientRect: () => ({ right: 1200 }) };
  const root = {
    querySelector: (selector: string) => selector === ".rv-side" ? side : selector === ".rv-dd" ? {} : null,
    querySelectorAll: () => [],
    closest: () => sheet,
  } as unknown as HTMLElement;
  const disconnect = vi.fn();
  let resize!: () => void;
  vi.stubGlobal("getComputedStyle", () => ({ display: "block", opacity: "1" }));
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: () => void) { resize = callback; }
    observe = vi.fn();
    disconnect = disconnect;
  });
  const commit = () => events.push("commit");
  return { root, sheet, animations, disconnect, resize: () => resize(), events, commit };
}

afterEach(() => vi.unstubAllGlobals());

describe("deep-dive cancellation", () => {
  it("cancels the active transition before an instant toggle commits", () => {
    const view = fixture();
    toggleDeepDive(view.root, true, view.commit, true);
    view.events.length = 0;
    toggleDeepDive(view.root, false, view.commit, false);
    expect(view.events).toEqual(["cancel", "commit"]);
    expect(view.disconnect).toHaveBeenCalledOnce();
    cancelDeepDive(view.root);
    expect(view.disconnect).toHaveBeenCalledOnce();
  });

  it("still commits when there is no mounted view", () => {
    const commit = vi.fn();
    toggleDeepDive(null, false, commit, false);
    expect(commit).toHaveBeenCalledOnce();
  });

  it("ignores the initial size observation and cancels on a size change", () => {
    const view = fixture();
    toggleDeepDive(view.root, true, view.commit, true);
    view.resize();
    expect(view.animations[0].animation.cancel).not.toHaveBeenCalled();
    view.sheet.clientWidth = 1100;
    view.resize();
    expect(view.animations[0].animation.cancel).toHaveBeenCalledOnce();
    expect(view.disconnect).toHaveBeenCalledOnce();
  });

  it("disconnects size observation when the transition finishes", async () => {
    const view = fixture();
    toggleDeepDive(view.root, true, view.commit, true);
    view.animations[0].finish();
    await vi.waitFor(() => expect(view.disconnect).toHaveBeenCalledOnce());
  });

  it("an interrupted transition settling cannot cancel its replacement", async () => {
    const view = fixture();
    toggleDeepDive(view.root, true, view.commit, true);
    toggleDeepDive(view.root, true, view.commit, true);
    await Promise.resolve();
    await Promise.resolve();
    expect(view.animations[0].animation.cancel).toHaveBeenCalledOnce();
    expect(view.animations[1].animation.cancel).not.toHaveBeenCalled();
    cancelDeepDive(view.root);
    expect(view.animations[1].animation.cancel).toHaveBeenCalledOnce();
  });
});
