"use client";

import { flushSync } from "react-dom";
import { prefersReducedMotion } from "@/lib/media";

export type TransitionHandle = { finished: Promise<void>; skipTransition: () => void };
export type ViewTransitionElements = { canvas?: HTMLElement | null; title?: HTMLElement | null };
export type ViewTransitionOptions = {
  source?: "pointer" | "keyboard";
  direction?: "in" | "out";
  reducedMotion?: boolean;
  /** The outgoing tile or rule, named before the old snapshot. */
  from?: ViewTransitionElements;
  /** Resolve the incoming pair after the synchronous update has mounted it. */
  to?: () => ViewTransitionElements;
  /** Fade this surface on browsers without View Transitions. */
  fallbackTarget?: HTMLElement | null;
};

const ENTER_MS = 360;
const EXIT_MS = 220;
const FADE_MS = 140;
let active: TransitionHandle | null = null;
let generation = 0;

export function interruptViewTransition(): void {
  generation++;
  active?.skipTransition();
  active = null;
}

/** Event-only: keyboard changes commit at 0ms; interrupted captures cannot replay stale updates. */
export function runViewTransition(update: () => void, options: ViewTransitionOptions = {}): TransitionHandle {
  interruptViewTransition();
  const current = generation;
  const root = typeof document === "undefined" ? null : document.documentElement;
  const reduced = options.reducedMotion ?? prefersReducedMotion();
  const native = root && typeof document.startViewTransition === "function" && options.source !== "keyboard";
  const named = new Map<HTMLElement, string>();
  let cancelled = false;
  let committed = false;
  let cleaned = false;
  let sheet: HTMLStyleElement | null = null;
  const previousMode = root?.getAttribute("data-vt") ?? null;
  const clearNames = () => {
    named.forEach((name, element) => { element.style.viewTransitionName = name; });
    named.clear();
  };
  const namePair = (pair?: ViewTransitionElements) => {
    if (!pair || reduced) return;
    for (const key of ["canvas", "title"] as const) {
      const element = pair[key];
      if (!element) continue;
      named.set(element, element.style.viewTransitionName);
      element.style.viewTransitionName = `rule-${key}`;
    }
  };
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    clearNames();
    sheet?.remove();
    if (native) {
      if (previousMode === null) root.removeAttribute("data-vt");
      else root.setAttribute("data-vt", previousMode);
    }
  };
  const commit = () => {
    if (generation !== current || cancelled || committed) return;
    committed = true;
    clearNames();
    flushSync(update);
    if (native) namePair(options.to?.());
  };
  let handle: TransitionHandle;
  if (native) {
    const mode = reduced ? "fade" : options.direction ?? "in";
    const duration = reduced ? FADE_MS : mode === "out" ? EXIT_MS : ENTER_MS;
    root.setAttribute("data-vt", mode);
    namePair(options.from);
    // These pseudo-elements only exist during this capture. Owning the sheet
    // here also makes interruption remove the names, mode and timing together.
    sheet = document.createElement("style");
    sheet.textContent = `
      :root::view-transition-group(root),
      :root::view-transition-old(root), :root::view-transition-new(root) {
        animation-duration: ${reduced ? FADE_MS : EXIT_MS}ms;
        animation-timing-function: linear;
      }
      :root::view-transition-group(rule-canvas), :root::view-transition-group(rule-title),
      :root::view-transition-old(rule-canvas), :root::view-transition-new(rule-canvas),
      :root::view-transition-old(rule-title), :root::view-transition-new(rule-title) {
        animation-duration: ${duration}ms;
        animation-timing-function: ${reduced ? "linear" : "var(--ease-drawer)"};
      }
      :root::view-transition-old(rule-canvas), :root::view-transition-new(rule-canvas) {
        height: 100%; object-fit: cover; object-position: top;
      }
    `;
    document.head.append(sheet);
    try {
      const transition = document.startViewTransition(commit);
      // Skipping rejects ready; finished still settles and owns final cleanup.
      void transition.ready.catch(() => {});
      handle = {
        finished: transition.finished.then(() => {}),
        skipTransition: () => { cancelled = true; transition.skipTransition(); cleanup(); },
      };
    } catch (error) {
      cleanup();
      throw error;
    }
  } else {
    commit();
    const target = options.fallbackTarget ?? root;
    const animation = options.source !== "keyboard" && target?.animate
      ? target.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE_MS, easing: "linear" })
      : null;
    handle = {
      finished: animation ? animation.finished.then(() => {}, () => {}) : Promise.resolve(),
      skipTransition: () => { cancelled = true; animation?.cancel(); cleanup(); },
    };
  }
  active = handle;
  const settle = () => {
    cleanup();
    if (active === handle) active = null;
  };
  void handle.finished.then(settle, settle);
  return handle;
}
