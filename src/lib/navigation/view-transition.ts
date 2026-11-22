"use client";

import { flushSync } from "react-dom";
import { prefersReducedMotion } from "@/lib/media";

export type TransitionHandle = { finished: Promise<void>; skipTransition: () => void };
export type ViewTransitionOptions = {
  source?: "pointer" | "keyboard";
  direction?: "in" | "out";
  reducedMotion?: boolean;
  /** Fade this surface on browsers without View Transitions. */
  fallbackTarget?: HTMLElement | null;
};

const ENTER_MS = 280;
const EXIT_MS = 220;
const FADE_MS = 140;

/**
 * The page behind a rule opening or closing goes out of focus rather than
 * ghosting through: the leaving page blurs as it fades, the arriving one
 * comes into focus as it appears, so two layers of text never read at once.
 * The whole page changes in place; nothing travels. Reduced motion keeps the
 * plain crossfade.
 */
const BLUR_CSS = `
      :root::view-transition-old(root), :root::view-transition-new(root) {
        mix-blend-mode: plus-lighter;
      }
      :root::view-transition-old(root) { animation-name: ax-page-out; }
      :root::view-transition-new(root) { animation-name: ax-page-in; }
      @keyframes ax-page-out { to { opacity: 0; filter: blur(8px); } }
      @keyframes ax-page-in { from { opacity: 0; filter: blur(8px); } }
`;

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
  let cancelled = false;
  let committed = false;
  let cleaned = false;
  let sheet: HTMLStyleElement | null = null;
  const previousMode = root?.getAttribute("data-vt") ?? null;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    sheet?.remove();
    if (native) {
      if (previousMode === null) root.removeAttribute("data-vt");
      else root.setAttribute("data-vt", previousMode);
    }
  };
  const commit = () => {
    if (generation !== current || cancelled || committed) return;
    committed = true;
    flushSync(update);
  };
  let handle: TransitionHandle;
  if (native) {
    const mode = reduced ? "fade" : options.direction ?? "in";
    const duration = reduced ? FADE_MS : mode === "out" ? EXIT_MS : ENTER_MS;
    root.setAttribute("data-vt", mode);
    // These pseudo-elements only exist during this capture. Owning the sheet
    // here also makes interruption remove the mode and timing together.
    sheet = document.createElement("style");
    sheet.textContent = `
      :root::view-transition-group(root),
      :root::view-transition-old(root), :root::view-transition-new(root) {
        animation-duration: ${duration}ms;
        animation-timing-function: ${reduced ? "linear" : "var(--ease-out-strong)"};
      }
    ${reduced ? "" : BLUR_CSS}`;
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
