import { afterEach, describe, expect, it, vi } from "vitest";
import { interruptViewTransition, runViewTransition } from "@/lib/navigation/view-transition";

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function element() {
  const attributes = new Map<string, string>();
  return {
    style: { viewTransitionName: "" },
    getAttribute: (name: string) => attributes.get(name) ?? null,
    setAttribute: (name: string, value: string) => { attributes.set(name, value); },
    removeAttribute: (name: string) => { attributes.delete(name); },
    animate: vi.fn(() => ({ finished: Promise.resolve(), cancel: vi.fn() })),
  };
}

function fixture(native = true) {
  const root = element();
  const from = { canvas: element(), title: element() };
  const to = { canvas: element(), title: element() };
  const captures: { commit: () => void; done: ReturnType<typeof deferred>; skipTransition: ReturnType<typeof vi.fn> }[] = [];
  const sheet = { textContent: "", remove: vi.fn() };
  const append = vi.fn();
  const startViewTransition = vi.fn((commit: () => void) => {
    const done = deferred();
    const skipTransition = vi.fn();
    captures.push({ commit, done, skipTransition });
    return { ready: Promise.resolve(), finished: done.promise, skipTransition };
  });
  vi.stubGlobal("document", {
    documentElement: root, head: { append }, createElement: () => sheet,
    startViewTransition: native ? startViewTransition : undefined,
  });
  // The fixture implements the style and attribute surface the helper uses.
  const pair = (value: typeof from) => value as unknown as { canvas: HTMLElement; title: HTMLElement };
  return { root, from, to, captures, sheet, append, startViewTransition, pair };
}

afterEach(() => {
  interruptViewTransition();
  vi.unstubAllGlobals();
});

describe("shell view transitions", () => {
  it("commits keyboard changes synchronously without names, capture, timing or fade", async () => {
    const f = fixture();
    const update = vi.fn();
    await runViewTransition(update, { source: "keyboard", reducedMotion: false, from: f.pair(f.from) }).finished;
    expect(update).toHaveBeenCalledOnce();
    expect(f.startViewTransition).not.toHaveBeenCalled();
    expect(f.root.animate).not.toHaveBeenCalled();
    expect(f.append).not.toHaveBeenCalled();
    expect(f.root.getAttribute("data-vt")).toBeNull();
    expect(f.from.canvas.style.viewTransitionName).toBe("");
  });

  it.each(["in", "out"] as const)("names the snapshot pair and uses the %s duration until finished", async (direction) => {
    const f = fixture();
    f.from.canvas.style.viewTransitionName = "previous-name";
    const update = vi.fn();
    const handle = runViewTransition(update, { direction, reducedMotion: false, from: f.pair(f.from), to: () => f.pair(f.to) });
    expect(f.root.getAttribute("data-vt")).toBe(direction);
    expect(f.from.canvas.style.viewTransitionName).toBe("rule-canvas");
    expect(f.from.title.style.viewTransitionName).toBe("rule-title");
    expect(f.sheet.textContent).toContain(`animation-duration: ${direction === "in" ? 360 : 220}ms`);
    f.captures[0].commit();
    expect(update).toHaveBeenCalledOnce();
    expect(f.from.canvas.style.viewTransitionName).toBe("previous-name");
    expect(f.to.canvas.style.viewTransitionName).toBe("rule-canvas");
    expect(f.to.title.style.viewTransitionName).toBe("rule-title");
    f.captures[0].done.resolve();
    await handle.finished;
    expect(f.root.getAttribute("data-vt")).toBeNull();
    expect(f.to.canvas.style.viewTransitionName).toBe("");
    expect(f.to.title.style.viewTransitionName).toBe("");
    expect(f.sheet.remove).toHaveBeenCalledOnce();
  });

  it("uses a 140ms linear native root crossfade without naming a reduced-motion pair", async () => {
    const f = fixture();
    const update = vi.fn();
    const handle = runViewTransition(update, { reducedMotion: true, from: f.pair(f.from), to: () => f.pair(f.to) });
    expect(f.root.getAttribute("data-vt")).toBe("fade");
    expect(f.from.canvas.style.viewTransitionName).toBe("");
    expect(f.sheet.textContent).not.toMatch(/360ms|220ms|var\(--ease-drawer\)/);
    expect(f.sheet.textContent).toContain("animation-duration: 140ms");
    expect(f.sheet.textContent).toContain("animation-timing-function: linear");
    f.captures[0].commit();
    expect(f.to.canvas.style.viewTransitionName).toBe("");
    f.captures[0].done.resolve();
    await handle.finished;
    expect(update).toHaveBeenCalledOnce();
    expect(f.root.getAttribute("data-vt")).toBeNull();
  });

  it("fades unsupported browsers at 140ms and cancels safely", async () => {
    const f = fixture(false);
    const update = vi.fn();
    const handle = runViewTransition(update, { reducedMotion: true });
    expect(update).toHaveBeenCalledOnce();
    expect(f.root.animate).toHaveBeenCalledWith([{ opacity: 0 }, { opacity: 1 }], { duration: 140, easing: "linear" });
    handle.skipTransition();
    expect(f.root.animate.mock.results[0].value.cancel).toHaveBeenCalledOnce();
    await handle.finished;
  });

  it("cleans interruption immediately and prevents a delayed stale update from winning", async () => {
    const f = fixture();
    const oldUpdate = vi.fn();
    const newUpdate = vi.fn();
    runViewTransition(oldUpdate, { reducedMotion: false, from: f.pair(f.from) });
    const handle = runViewTransition(newUpdate, { reducedMotion: false, direction: "out" });
    expect(f.captures[0].skipTransition).toHaveBeenCalledOnce();
    expect(f.from.canvas.style.viewTransitionName).toBe("");
    f.captures[0].commit();
    f.captures[1].commit();
    expect(oldUpdate).not.toHaveBeenCalled();
    expect(newUpdate).toHaveBeenCalledOnce();
    f.captures[0].done.resolve();
    await Promise.resolve();
    expect(f.root.getAttribute("data-vt")).toBe("out");
    handle.skipTransition();
    expect(f.root.getAttribute("data-vt")).toBeNull();
    expect(f.captures[1].skipTransition).toHaveBeenCalledOnce();
    f.captures[1].done.resolve();
    await handle.finished;
  });

  it("cleans names and restores an existing mode after a failed capture", async () => {
    const f = fixture();
    f.root.setAttribute("data-vt", "theme");
    const handle = runViewTransition(vi.fn(), { reducedMotion: false, from: f.pair(f.from) });
    f.captures[0].done.reject(new Error("capture failed"));
    await expect(handle.finished).rejects.toThrow("capture failed");
    expect(f.root.getAttribute("data-vt")).toBe("theme");
    expect(f.from.title.style.viewTransitionName).toBe("");
    expect(f.sheet.remove).toHaveBeenCalledOnce();
  });

  it("commits safely without a document", async () => {
    const update = vi.fn();
    await runViewTransition(update, { reducedMotion: false }).finished;
    expect(update).toHaveBeenCalledOnce();
  });
});
