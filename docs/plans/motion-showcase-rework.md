# Motion Showcase Rework — Execution Plan

> **For the executing model:** This is a complete, self-contained plan. Follow the phases
> in order. Every new file's full contents are given — copy them verbatim. Edits to
> existing files are given as exact find/replace pairs or anchored insertions. Run the
> verification step at the end of each phase before moving on. Do not improvise
> alternative architectures; the pitfalls section explains why each decision was made.

---

## 1. Why this rework exists (critique of the current system)

The current demos (`demo-stage.tsx`, `use-demo-playback.ts`, `use-interactive-demo.ts`,
`motion-demos.tsx`, `interaction-demos.tsx`) have five structural problems:

1. **The replay mechanism is fundamentally fragile.** Motion is driven by flipping a
   `settled` boolean and letting CSS transitions react. Replaying requires
   jump-to-start → force reflow → double/triple `requestAnimationFrame` → flip back.
   This is why the code has accumulated `dataset.motionReset`, `getAnimations().cancel()`,
   and `void el.offsetHeight` patches — and it still glitches (restarts, flashes,
   interrupted loops). CSS transitions were never designed to be replayed on demand.
2. **The visuals are abstract, not UI.** A grey dot sliding on a rail is reused for
   8 different rules. A grey chip fading in stands for a modal, a palette, a tooltip,
   and a toast. Motion divorced from UI context teaches nothing — motion is spatial
   logic, and these demos have no space to be logical about.
3. **Do and Don't play independently.** The entire pedagogy of a do/don't pair is the
   *difference* — 180ms vs 500ms, ease-out vs ease-in. Played separately, seconds
   apart, the difference is imperceptible. They must race side-by-side from one trigger.
4. **Rest states look broken.** Action demos rest on an empty frame ("click Open" shows
   a blank box). A resting demo should be a composed mini-UI.
5. **Performance debris.** Permanent `will-change` on ~100 elements (compositor layers
   held forever), a `matchMedia` pair + listeners per demo instance (160 listeners on
   the grid), and one `IntersectionObserver` per demo.

## 2. The new design

**One `MotionShowcase` per rule** in the deep-dive (drawer + `/rules/[id]`):
Do and Don't panes **side by side**, each a miniature real UI scene (a modal over an
app surface, a menu from its trigger button, a toast over content), driven by **one
shared control** so both panes play in perfect sync and the difference is *felt*.

- **Gesture-driven where the gesture is the lesson** (press & hold, hover) — the
  gesture acts on both panes at once. This preserves the agreed interaction model
  (deep-dive = interactive prototypes, not autoplay).
- **Web Animations API (WAAPI) engine** replaces the `settled`-flip. `element.animate()`
  with explicit from→to keyframes is deterministic: cancel + replay is glitch-free by
  construction, `playbackRate` gives free slow motion, and no reflow hacks or
  `will-change` are needed (browsers promote layers for the duration of the animation
  automatically).
- **Slow-mo toggle (0.25×)** on every showcase — motion-25's "review in slow time"
  becomes a feature of the showcase itself.
- **Timing bars**: a thin bar under each pane fills linearly for exactly the pane's
  duration while it plays, making "180ms vs 500ms" *visible* as well as felt.
- **Rest = composed UI.** Every scene renders a complete mini-interface at rest;
  overlays sit hidden inside the frame, revealed by the animation.
- **Grid cards keep a lightweight preview** (autoplay-once on view + replay on hover),
  now running through the same WAAPI engine and scenes — one system, two modes.
- **Perf**: one shared `matchMedia` store (`useSyncExternalStore`), one shared
  `IntersectionObserver` for all grid previews, zero permanent `will-change`.
- **Reduced motion**: the engine plays every animation with duration 0 (instant jump
  to end state). Single enforcement point — no CSS kill-switch coordination needed.

### File map

| Action | File |
| --- | --- |
| ADD | `src/lib/media.ts` — shared media-query store |
| ADD | `src/lib/showcase-engine.ts` — WAAPI track engine + easing/duration tokens |
| ADD | `src/components/features/rules/demos/scenes.tsx` — mini-UI scenes |
| ADD | `src/components/features/rules/demos/showcase-specs.tsx` — all 24 rule specs |
| ADD | `src/components/features/rules/demos/motion-showcase.tsx` — showcase + grid preview |
| REPLACE | `src/components/features/rules/demos/registry.ts` |
| EDIT | `src/components/features/rules/rule-preview.tsx` |
| EDIT | `src/components/features/rules/rule-drawer.tsx` |
| EDIT | `src/app/rules/[id]/page.tsx` |
| EDIT | `src/app/globals.css` |
| DELETE | `src/hooks/use-demo-playback.ts`, `src/hooks/use-interactive-demo.ts`, `src/components/features/rules/demos/demo-stage.tsx`, `src/components/features/rules/demos/motion-demos.tsx`, `src/components/features/rules/demos/interaction-demos.tsx` |

Unchanged: `preview-primitives.tsx` (static previews for non-demo rules still use it;
scenes reuse `MiniButton`/`MiniLine`), `rule-card.tsx` (grid routing happens inside
`RulePreview`).

---

## 3. Phase 1 — Foundations

### 3.1 ADD `src/lib/media.ts`

```tsx
"use client";

import { useSyncExternalStore } from "react";

/**
 * Shared media-query store. One MediaQueryList + one listener per query for the
 * whole app (the old system created a pair per demo — 160 listeners on the grid).
 * SSR/first paint snapshot is `false` for both queries, which renders the safe
 * default (no hover affordances, motion enabled; reduced-motion is re-checked
 * by the engine at play time, so nothing can animate for a reduced-motion user).
 */
const stores = new Map<
    string,
    { mql: MediaQueryList; listeners: Set<() => void> }
>();

function getStore(query: string) {
    let store = stores.get(query);
    if (!store) {
        const mql = window.matchMedia(query);
        const listeners = new Set<() => void>();
        mql.addEventListener("change", () => listeners.forEach((l) => l()));
        store = { mql, listeners };
        stores.set(query, store);
    }
    return store;
}

function useMediaFlag(query: string): boolean {
    return useSyncExternalStore(
        (onChange) => {
            const store = getStore(query);
            store.listeners.add(onChange);
            return () => store.listeners.delete(onChange);
        },
        () => getStore(query).mql.matches,
        () => false
    );
}

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
export const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

export function useReducedMotion() {
    return useMediaFlag(REDUCED_MOTION_QUERY);
}

export function useCanHover() {
    return useMediaFlag(HOVER_QUERY);
}

/** Non-hook read for event handlers / the engine (client only). */
export function prefersReducedMotion() {
    return typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}
```

### 3.2 ADD `src/lib/showcase-engine.ts`

```ts
/**
 * WAAPI playback engine for the rule showcases.
 *
 * A demo is a set of `Track`s. Each track names a target (`[data-anim="…"]`
 * inside the pane), explicit from→to keyframes, and timing. Playing a pane =
 * cancel whatever this engine previously started on it, then `element.animate()`
 * every track. Because keyframes always contain BOTH endpoints, replay is
 * deterministic — no reflow forcing, no double-rAF, no reset flags.
 *
 * Reduced motion: play with duration 0 → instant jump to the end state.
 * This is the single enforcement point for reduced motion in showcases.
 */

export type Track = {
    /** Matches elements with data-anim="<target>" inside the pane root. */
    target: string;
    /** Explicit keyframes — always include the starting frame. */
    keyframes: Keyframe[];
    durationMs: number;
    easing?: string; // defaults to EASE.out
    delayMs?: number;
    /** Extra delay per matched element, in DOM order (for staggers). */
    staggerMs?: number;
};

/** Mirror of the CSS tokens in globals.css — WAAPI cannot read CSS variables
 *  in `easing`, so these literals must be kept in sync with :root. */
export const EASE = {
    out: "cubic-bezier(0.23, 1, 0.32, 1)", // --ease-out-strong
    in: "cubic-bezier(0.55, 0, 1, 0.45)",
    inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
    linear: "linear",
} as const;

export const DUR = {
    fast: 140, // --motion-fast
    medium: 220, // --motion-medium
    slow: 360, // --motion-slow
} as const;

/** Animations this engine started, per pane root. Only these are cancelled on
 *  replay — never `getAnimations({subtree})`, which would kill CSS animations
 *  owned by scenes (e.g. a spinner's animate-spin). */
const live = new WeakMap<HTMLElement, Animation[]>();

export function cancelPane(root: HTMLElement) {
    live.get(root)?.forEach((a) => a.cancel());
    live.set(root, []);
}

export function playPane(
    root: HTMLElement,
    tracks: Track[],
    { rate = 1, reduced = false }: { rate?: number; reduced?: boolean } = {}
): Animation[] {
    cancelPane(root);
    const spawned: Animation[] = [];
    for (const track of tracks) {
        const els = root.querySelectorAll<HTMLElement>(`[data-anim="${track.target}"]`);
        els.forEach((el, i) => {
            const anim = el.animate(track.keyframes, {
                duration: reduced ? 0 : track.durationMs,
                delay: reduced ? 0 : (track.delayMs ?? 0) + (track.staggerMs ?? 0) * i,
                easing: track.easing ?? EASE.out,
                fill: "forwards",
            });
            anim.playbackRate = rate;
            spawned.push(anim);
        });
    }
    live.set(root, spawned);
    return spawned;
}

/** Wall-clock length of a track set (3 assumed for staggers without a count). */
export function tracksDurationMs(tracks: Track[], staggerCount = 3): number {
    return Math.max(
        0,
        ...tracks.map(
            (t) =>
                (t.delayMs ?? 0) +
                (t.staggerMs ?? 0) * Math.max(0, staggerCount - 1) +
                t.durationMs
        )
    );
}

// ── Keyframe builders ────────────────────────────────────────────────
// Every builder returns BOTH endpoints so replays are deterministic.

export const kf = {
    fadeIn: (): Keyframe[] => [{ opacity: 0 }, { opacity: 1 }],
    riseIn: (px: number): Keyframe[] => [
        { opacity: 0, transform: `translateY(${px}px)` },
        { opacity: 1, transform: "translateY(0)" },
    ],
    dropOut: (px: number): Keyframe[] => [
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: `translateY(${px}px)` },
    ],
    popIn: (fromScale: number): Keyframe[] => [
        { opacity: 0, transform: `scale(${fromScale})` },
        { opacity: 1, transform: "scale(1)" },
    ],
    scaleTo: (from: number, to: number): Keyframe[] => [
        { transform: `scale(${from})` },
        { transform: `scale(${to})` },
    ],
    slideXIn: (from: string): Keyframe[] => [
        { transform: `translateX(${from})` },
        { transform: "translateX(0)" },
    ],
    slideYIn: (from: string): Keyframe[] => [
        { transform: `translateY(${from})` },
        { transform: "translateY(0)" },
    ],
    slideYOut: (to: string): Keyframe[] => [
        { transform: "translateY(0)" },
        { transform: `translateY(${to})` },
    ],
    /** Runner for the "race" scenes: travels the width of its container. */
    race: (): Keyframe[] => [
        { transform: "translateX(0)" },
        { transform: "translateX(calc(100cqw - 100%))" },
    ],
    background: (from: string, to: string): Keyframe[] => [
        { backgroundColor: from },
        { backgroundColor: to },
    ],
    crossfade: (show: boolean): Keyframe[] =>
        show ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }],
    growHeight: (fromPx: number, toPx: number): Keyframe[] => [
        { height: `${fromPx}px` },
        { height: `${toPx}px` },
    ],
};
```

### Phase 1 verification

```bash
npx tsc --noEmit
```
Must pass with zero errors.

---

## 4. Phase 2 — Scenes

### 4.1 ADD `src/components/features/rules/demos/scenes.tsx`

Miniature UI scenes. No hooks, no state — pure markup rendering the **rest frame**.
Animated elements carry `data-anim` attributes the engine targets. Overlay elements
that should be invisible at rest carry `style={{ opacity: 0 }}` (the engine's
keyframes own their appearance; `fill: "forwards"` holds the end state).

```tsx
import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { MiniButton, MiniLine, type PreviewSize } from "@/components/features/rules/preview-primitives";

/**
 * A tiny app surface: title-bar + content lines. Gives overlays (modals, toasts,
 * menus) real UI context so their motion has spatial logic — and keeps every
 * rest frame looking like a composed interface instead of an empty box.
 */
export function AppSurface({
    size,
    children,
    dim = false,
}: {
    size: PreviewSize;
    children?: ReactNode;
    dim?: boolean;
}) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900",
                size === "lg" ? "h-24" : "h-16"
            )}
        >
            <div className="flex items-center gap-1.5 border-b border-neutral-100 px-2 py-1.5 dark:border-neutral-800">
                <span className="size-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                <MiniLine widthClass="w-10" className="h-1.5" />
            </div>
            <div className={cn("space-y-1.5 p-2", dim && "opacity-50")}>
                <MiniLine widthClass="w-5/6" />
                <MiniLine widthClass="w-3/5" />
            </div>
            {children}
        </div>
    );
}

/** Modal: scrim + centered dialog, both hidden at rest. */
export function ModalScene({ size }: { size: PreviewSize }) {
    return (
        <AppSurface size={size}>
            <div data-anim="scrim" className="absolute inset-0 bg-neutral-900/40" style={{ opacity: 0 }} />
            <div
                data-anim="panel"
                className={cn(
                    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-800",
                    size === "lg" ? "w-24" : "w-20"
                )}
                style={{ opacity: 0 }}
            >
                <MiniLine widthClass="w-3/4" className="mb-1.5" />
                <div className="flex justify-end">
                    <MiniButton label="OK" variant="primary" size={size} />
                </div>
            </div>
        </AppSurface>
    );
}

/** Command palette: floating input + result rows, hidden at rest. */
export function PaletteScene({ size }: { size: PreviewSize }) {
    return (
        <AppSurface size={size} dim>
            <div
                data-anim="panel"
                className="absolute inset-x-3 top-2 rounded-md border border-neutral-200 bg-white p-1.5 shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
                style={{ opacity: 0 }}
            >
                <div className="mb-1.5 h-3 rounded-sm bg-neutral-100 dark:bg-neutral-700" />
                <MiniLine widthClass="w-2/3" className="mb-1" />
                <MiniLine widthClass="w-1/2" />
            </div>
        </AppSurface>
    );
}

/** Side panel sliding in from the right edge (rest: parked off-frame). */
export function EdgePanelScene({ size }: { size: PreviewSize }) {
    return (
        <AppSurface size={size}>
            <div
                data-anim="panel"
                className="absolute inset-y-0 right-0 w-2/5 border-l border-neutral-200 bg-neutral-50 p-2 dark:border-neutral-700 dark:bg-neutral-800"
                style={{ transform: "translateX(110%)" }}
            >
                <MiniLine widthClass="w-3/4" className="mb-1.5" />
                <MiniLine widthClass="w-1/2" />
            </div>
        </AppSurface>
    );
}

/** Toast rising from the bottom edge (rest: parked below the frame). */
export function ToastScene({ size }: { size: PreviewSize }) {
    return (
        <AppSurface size={size}>
            <div
                data-anim="panel"
                className="absolute inset-x-2 bottom-2 flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2 py-1.5 shadow-md dark:border-neutral-700 dark:bg-neutral-800"
                style={{ transform: "translateY(150%)" }}
            >
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <MiniLine widthClass="w-1/2" />
            </div>
        </AppSurface>
    );
}

/** Menu popover opening from a trigger button. `origin` is the lesson knob. */
export function MenuScene({ size, origin }: { size: PreviewSize; origin: string }) {
    return (
        <div className={cn("relative", size === "lg" ? "h-24" : "h-16")}>
            <div className="absolute left-2 top-1">
                <MiniButton label="Menu" variant="secondary" size={size} />
            </div>
            <div
                data-anim="panel"
                className="absolute left-2 top-7 w-20 rounded-md border border-neutral-200 bg-white p-1.5 shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
                style={{ opacity: 0, transformOrigin: origin } as CSSProperties}
            >
                <MiniLine widthClass="w-3/4" className="mb-1" />
                <MiniLine widthClass="w-full" className="mb-1" />
                <MiniLine widthClass="w-1/2" />
            </div>
        </div>
    );
}

/** Tooltip above a button. */
export function TooltipScene({ size }: { size: PreviewSize }) {
    return (
        <div className={cn("relative flex items-end justify-center", size === "lg" ? "h-24 pb-3" : "h-16 pb-2")}>
            <div
                data-anim="panel"
                className="absolute top-3 rounded-md bg-neutral-900 px-2 py-1 text-[9px] font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
                style={{ opacity: 0 }}
            >
                Save (⌘S)
            </div>
            <MiniButton label="Save" variant="secondary" size={size} />
        </div>
    );
}

/** Three list rows (targets share data-anim="row" so tracks can stagger them). */
export function ListScene({ size, hiddenAtRest }: { size: PreviewSize; hiddenAtRest: boolean }) {
    const widths = ["w-full", "w-5/6", "w-2/3"];
    return (
        <div className={cn("flex flex-col justify-center gap-1.5", size === "lg" ? "h-24 px-1" : "h-16")}>
            {widths.map((w) => (
                <div key={w} data-anim="row" style={hiddenAtRest ? { opacity: 0 } : undefined}>
                    <MiniLine widthClass={w} />
                </div>
            ))}
        </div>
    );
}

/** A mini card racing across a track — for pure timing/easing comparisons. */
export function RaceScene({ size }: { size: PreviewSize }) {
    return (
        <div className={cn("flex flex-col justify-center", size === "lg" ? "h-24 px-1" : "h-16")}>
            <div
                className="relative w-full rounded-md border border-dashed border-neutral-200 p-1 dark:border-neutral-800"
                style={{ containerType: "inline-size" }}
            >
                <div
                    data-anim="panel"
                    className={cn(
                        "rounded-sm border border-neutral-300 bg-white shadow-sm dark:border-neutral-600 dark:bg-neutral-800",
                        size === "lg" ? "h-7 w-10" : "h-5 w-8"
                    )}
                >
                    <div className="m-1 h-1 w-1/2 rounded bg-neutral-300 dark:bg-neutral-600" />
                </div>
            </div>
        </div>
    );
}

/** A single centered button (press feedback, hover scale, hue shift). */
export function ButtonScene({
    size,
    label,
    variant = "primary",
    background,
}: {
    size: PreviewSize;
    label: string;
    variant?: "primary" | "secondary";
    background?: string;
}) {
    return (
        <div className={cn("flex items-center justify-center", size === "lg" ? "h-24" : "h-16")}>
            <span data-anim="panel" className="inline-block" style={background ? { borderRadius: 6 } : undefined}>
                {background ? (
                    <span
                        className={cn(
                            "inline-flex items-center justify-center rounded-md font-semibold text-white",
                            size === "lg" ? "px-3 py-1.5 text-xs" : "px-2.5 py-1 text-[10px]"
                        )}
                        style={{ backgroundColor: background }}
                        data-anim="fill"
                    >
                        {label}
                    </span>
                ) : (
                    <MiniButton label={label} variant={variant} size={size} />
                )}
            </span>
        </div>
    );
}

/** Submit button whose label crossfades to a spinner (rest: idle label). */
export function SubmitScene({ size, spinner }: { size: PreviewSize; spinner: boolean }) {
    return (
        <div className={cn("flex items-center justify-center", size === "lg" ? "h-24" : "h-16")}>
            <span
                data-anim="fill"
                className={cn(
                    "relative inline-flex items-center justify-center rounded-md bg-neutral-900 font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900",
                    size === "lg" ? "px-3 py-1.5 text-xs" : "px-2.5 py-1 text-[10px]"
                )}
            >
                <span data-anim="label">Submit</span>
                {spinner ? (
                    <span
                        data-anim="spinner"
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ opacity: 0 }}
                    >
                        <span
                            className={cn(
                                "inline-block animate-spin rounded-full border-2 border-neutral-400 border-t-transparent dark:border-neutral-500",
                                size === "lg" ? "size-3.5" : "size-3"
                            )}
                        />
                    </span>
                ) : null}
            </span>
        </div>
    );
}

/** Like button: grey outline heart with a red heart revealed on play. */
export function LikeScene({ size }: { size: PreviewSize }) {
    const px = size === "lg" ? 22 : 18;
    return (
        <div className={cn("flex items-center justify-center", size === "lg" ? "h-24" : "h-16")}>
            <div className="relative" style={{ width: px, height: px }}>
                <svg viewBox="0 0 24 24" className="absolute inset-0 text-neutral-400 dark:text-neutral-600" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
                </svg>
                <svg data-anim="panel" viewBox="0 0 24 24" className="absolute inset-0 text-rose-500" fill="currentColor" style={{ opacity: 0 }}>
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
                </svg>
            </div>
        </div>
    );
}

/** Loading treatment: skeleton rows or a lone spinner, then content fades in. */
export function LoadingScene({ size, kind }: { size: PreviewSize; kind: "skeleton" | "spinner" }) {
    return (
        <div className={cn("relative flex flex-col justify-center gap-1.5", size === "lg" ? "h-24 px-1" : "h-16")}>
            {kind === "skeleton" ? (
                <div data-anim="placeholder" className="space-y-1.5">
                    <MiniLine widthClass="w-full" className="animate-pulse" />
                    <MiniLine widthClass="w-5/6" className="animate-pulse" />
                    <MiniLine widthClass="w-2/3" className="animate-pulse" />
                </div>
            ) : (
                <div data-anim="placeholder" className="flex justify-center">
                    <span
                        className={cn(
                            "inline-block animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100",
                            size === "lg" ? "size-7" : "size-6"
                        )}
                    />
                </div>
            )}
            <div data-anim="content" className="absolute inset-x-0 space-y-1.5 px-1" style={{ opacity: 0 }}>
                <div className="h-2 rounded bg-neutral-400 dark:bg-neutral-500" style={{ width: "90%" }} />
                <div className="h-2 rounded bg-neutral-400 dark:bg-neutral-500" style={{ width: "70%" }} />
                <div className="h-2 rounded bg-neutral-400 dark:bg-neutral-500" style={{ width: "50%" }} />
            </div>
        </div>
    );
}

/** For motion-14's don't: a box that animates height (layout work). */
export function GrowBoxScene({ size }: { size: PreviewSize }) {
    return (
        <div className={cn("flex items-center justify-center", size === "lg" ? "h-24" : "h-16")}>
            <div
                data-anim="panel"
                className="overflow-hidden rounded bg-neutral-300 dark:bg-neutral-700"
                style={{ width: size === "lg" ? 48 : 40, height: 2 }}
            />
        </div>
    );
}
```

### Phase 2 verification

```bash
npx tsc --noEmit
```

---

## 5. Phase 3 — Specs (all 24 rules)

### 5.1 ADD `src/components/features/rules/demos/showcase-specs.tsx`

Each spec follows the storyboard pattern: a comment stating what plays, then tracks
built only from named `EASE`/`DUR` tokens or rule-mandated literals (a rule about
"500ms is too slow" hard-codes 500 — the number *is* the lesson).

```tsx
import type { ReactNode } from "react";

import { DUR, EASE, kf, type Track } from "@/lib/showcase-engine";
import type { PreviewSize } from "@/components/features/rules/preview-primitives";
import {
    ButtonScene,
    EdgePanelScene,
    GrowBoxScene,
    LikeScene,
    ListScene,
    LoadingScene,
    MenuScene,
    ModalScene,
    PaletteScene,
    RaceScene,
    SubmitScene,
    ToastScene,
    TooltipScene,
} from "@/components/features/rules/demos/scenes";

/** How the user drives the showcase. Gestures act on the panes themselves;
 *  `action`/`toggle`/`replay` are driven from the shared control button. */
export type TriggerKind = "replay" | "action" | "toggle" | "press" | "hover";

export type PaneSpec = {
    /** Timing readout under the pane, e.g. "180ms · ease-out". */
    caption: string;
    /** Rest-frame markup; animated nodes carry data-anim targets. */
    scene: (size: PreviewSize) => ReactNode;
    /** Played on trigger (button press / gesture engage). */
    tracks: Track[];
    /** Played on gesture release / toggle-off. Required for toggle/press/hover. */
    exitTracks?: Track[];
};

export type ShowcaseSpec = {
    trigger: TriggerKind;
    /** Control-button label for action/toggle triggers. */
    control?: string;
    /** Skip grid autoplay on touch devices (motion-16 must obey its own rule). */
    touchAutoplay?: false;
    do: PaneSpec;
    dont: PaneSpec;
};

const t = (target: string, keyframes: Keyframe[], durationMs: number, extra?: Partial<Track>): Track => ({
    target,
    keyframes,
    durationMs,
    ...extra,
});

export const showcaseSpecs: Record<string, ShowcaseSpec> = {
    /* motion-1 · Animate by Frequency
     * One "Open": a rare modal earns 220ms; a frequent palette at the same
     * 220ms feels laggy next to it. */
    "motion-1": {
        trigger: "action",
        control: "Open",
        do: {
            caption: "rare modal · 220ms",
            scene: (size) => <ModalScene size={size} />,
            tracks: [
                t("scrim", kf.fadeIn(), DUR.medium),
                t("panel", kf.riseIn(8), DUR.medium),
            ],
        },
        dont: {
            caption: "frequent palette · 220ms — too slow",
            scene: (size) => <PaletteScene size={size} />,
            tracks: [t("panel", kf.riseIn(8), DUR.medium)],
        },
    },

    /* motion-2 · Keyboard Actions Stay Instant — ⌘K palette: 0ms vs 240ms. */
    "motion-2": {
        trigger: "action",
        control: "Press ⌘K",
        do: {
            caption: "instant · 0ms",
            scene: (size) => <PaletteScene size={size} />,
            tracks: [t("panel", kf.fadeIn(), 0)],
        },
        dont: {
            caption: "waits 240ms",
            scene: (size) => <PaletteScene size={size} />,
            tracks: [t("panel", kf.riseIn(8), 240)],
        },
    },

    /* motion-3 · Purpose Before Motion — panel slides from its edge (spatial
     * logic) vs a modal that bounces for decoration. */
    "motion-3": {
        trigger: "action",
        control: "Open",
        do: {
            caption: "panel enters from its edge",
            scene: (size) => <EdgePanelScene size={size} />,
            tracks: [t("panel", kf.slideXIn("110%"), DUR.medium)],
        },
        dont: {
            caption: "decorative bounce",
            scene: (size) => <ModalScene size={size} />,
            tracks: [
                t("scrim", kf.fadeIn(), DUR.medium),
                t(
                    "panel",
                    [
                        { opacity: 0, transform: "scale(0.5)" },
                        { opacity: 1, transform: "scale(1.15)", offset: 0.6 },
                        { opacity: 1, transform: "scale(1)" },
                    ],
                    DUR.slow
                ),
            ],
        },
    },

    /* motion-4 · Use Strong Custom Easing — same distance, same duration;
     * only the curve differs. Use slow-mo to study it. */
    "motion-4": {
        trigger: "replay",
        do: {
            caption: "cubic-bezier(0.23, 1, 0.32, 1)",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), DUR.slow)],
        },
        dont: {
            caption: "ease-in — starts sluggish",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), DUR.slow, { easing: EASE.in })],
        },
    },

    /* motion-5 · Never Use Ease-In for UI. */
    "motion-5": {
        trigger: "replay",
        do: {
            caption: "ease-out · moves immediately",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), DUR.medium)],
        },
        dont: {
            caption: "ease-in · feels delayed",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), DUR.medium, { easing: EASE.in })],
        },
    },

    /* motion-6 · Keep UI Motion Under 300ms — 180ms vs 500ms, racing. */
    "motion-6": {
        trigger: "replay",
        do: {
            caption: "180ms",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), 180)],
        },
        dont: {
            caption: "500ms — the UI is waiting on the animation",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), 500)],
        },
    },

    /* motion-7 · Asymmetric Enter and Exit — toast: enter 220 / exit 160
     * vs a symmetric 360/360. Toggle to feel both directions. */
    "motion-7": {
        trigger: "toggle",
        control: "Show / dismiss",
        do: {
            caption: "enter 220ms · exit 160ms",
            scene: (size) => <ToastScene size={size} />,
            tracks: [t("panel", kf.slideYIn("150%"), DUR.medium)],
            exitTracks: [t("panel", kf.slideYOut("150%"), 160, { easing: EASE.inOut })],
        },
        dont: {
            caption: "enter 360ms · exit 360ms",
            scene: (size) => <ToastScene size={size} />,
            tracks: [t("panel", kf.slideYIn("150%"), DUR.slow)],
            exitTracks: [t("panel", kf.slideYOut("150%"), DUR.slow)],
        },
    },

    /* motion-8 · Press Feedback — hold the panes: 0.96 reads as feedback,
     * 0.9 overshoots. */
    "motion-8": {
        trigger: "press",
        do: {
            caption: "active: scale(0.96)",
            scene: (size) => <ButtonScene size={size} label="Save" />,
            tracks: [t("panel", kf.scaleTo(1, 0.96), DUR.fast)],
            exitTracks: [t("panel", kf.scaleTo(0.96, 1), DUR.fast)],
        },
        dont: {
            caption: "scale(0.9) — overshoots",
            scene: (size) => <ButtonScene size={size} label="Save" />,
            tracks: [t("panel", kf.scaleTo(1, 0.9), DUR.fast)],
            exitTracks: [t("panel", kf.scaleTo(0.9, 1), DUR.fast)],
        },
    },

    /* motion-9 · Never Scale From Zero — menu from 0.95 vs from 0. */
    "motion-9": {
        trigger: "action",
        control: "Open menu",
        do: {
            caption: "scale(0.95) + fade",
            scene: (size) => <MenuScene size={size} origin="top left" />,
            tracks: [t("panel", kf.popIn(0.95), DUR.medium)],
        },
        dont: {
            caption: "scale(0) — pops from nothing",
            scene: (size) => <MenuScene size={size} origin="top left" />,
            tracks: [t("panel", kf.popIn(0), DUR.medium)],
        },
    },

    /* motion-10 · Origin-Aware Popovers — from the trigger vs from center. */
    "motion-10": {
        trigger: "action",
        control: "Open menu",
        do: {
            caption: "transform-origin: top left (the trigger)",
            scene: (size) => <MenuScene size={size} origin="top left" />,
            tracks: [t("panel", kf.popIn(0.6), DUR.medium)],
        },
        dont: {
            caption: "transform-origin: center — detached",
            scene: (size) => <MenuScene size={size} origin="center" />,
            tracks: [t("panel", kf.popIn(0.6), DUR.medium)],
        },
    },

    /* motion-11 · Subsequent Tooltips Are Instant — hover the panes. */
    "motion-11": {
        trigger: "hover",
        do: {
            caption: "no delay after the first",
            scene: (size) => <TooltipScene size={size} />,
            tracks: [t("panel", kf.riseIn(4), 60)],
            exitTracks: [t("panel", kf.crossfade(false), 60)],
        },
        dont: {
            caption: "every tooltip waits 320ms",
            scene: (size) => <TooltipScene size={size} />,
            tracks: [t("panel", kf.riseIn(4), DUR.fast, { delayMs: 320 })],
            exitTracks: [t("panel", kf.crossfade(false), 60)],
        },
    },

    /* motion-12 · Transitions for Interruptible UI — smooth retarget vs a
     * stepped keyframe that visibly restarts. */
    "motion-12": {
        trigger: "replay",
        do: {
            caption: "transition — retargets smoothly",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), DUR.medium)],
        },
        dont: {
            caption: "keyframe — restarts from zero",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), DUR.medium, { easing: "steps(6, end)" })],
        },
    },

    /* motion-13 · Use Starting Styles for Entry — a new row enters composed
     * vs snapping in. */
    "motion-13": {
        trigger: "action",
        control: "Add item",
        do: {
            caption: "@starting-style — enters from a defined frame",
            scene: (size) => <ListScene size={size} hiddenAtRest />,
            tracks: [t("row", kf.riseIn(6), DUR.medium, { staggerMs: 40 })],
        },
        dont: {
            caption: "state flip — appears with no entrance",
            scene: (size) => <ListScene size={size} hiddenAtRest />,
            tracks: [t("row", kf.fadeIn(), 0)],
        },
    },

    /* motion-14 · Animate Transform and Opacity — compositor-friendly rise
     * vs animating height (layout work every frame). */
    "motion-14": {
        trigger: "replay",
        do: {
            caption: "translateY + opacity — compositor only",
            scene: (size) => <ToastScene size={size} />,
            tracks: [t("panel", kf.slideYIn("150%"), DUR.medium)],
        },
        dont: {
            caption: "height — layout thrash",
            scene: (size) => <GrowBoxScene size={size} />,
            tracks: [t("panel", kf.growHeight(2, 28), DUR.medium)],
        },
    },

    /* motion-15 · Use Percentage Transforms — 150% of self vs a hardcoded
     * pixel distance that breaks at other sizes. */
    "motion-15": {
        trigger: "action",
        control: "Show toast",
        do: {
            caption: "translateY(150%) — size-relative",
            scene: (size) => <ToastScene size={size} />,
            tracks: [t("panel", kf.slideYIn("150%"), DUR.medium)],
        },
        dont: {
            caption: "translateY(240px) — hardcoded",
            scene: (size) => <ToastScene size={size} />,
            tracks: [t("panel", kf.slideYIn("240px"), DUR.medium)],
        },
    },

    /* motion-16 · Gate Hover Motion — the do pane obeys its own rule: no
     * autoplay on touch (touchAutoplay: false). */
    "motion-16": {
        trigger: "hover",
        touchAutoplay: false,
        do: {
            caption: "@media (hover: hover) only",
            scene: (size) => <ButtonScene size={size} label="Hover" variant="secondary" />,
            tracks: [t("panel", kf.scaleTo(1, 1.06), DUR.fast)],
            exitTracks: [t("panel", kf.scaleTo(1.06, 1), DUR.fast)],
        },
        dont: {
            caption: "scales on touch too",
            scene: (size) => <ButtonScene size={size} label="Tap" variant="secondary" />,
            tracks: [t("panel", kf.scaleTo(1, 1.06), DUR.fast)],
            exitTracks: [t("panel", kf.scaleTo(1.06, 1), DUR.fast)],
        },
    },

    /* motion-17 · Reduced Motion Still Has Intent — fade (intent kept, no
     * movement) vs sliding regardless. */
    "motion-17": {
        trigger: "replay",
        do: {
            caption: "fade only — intent without movement",
            scene: (size) => <ToastScene size={size} />,
            tracks: [
                t("panel", [{ opacity: 0, transform: "translateY(0)" }, { opacity: 1, transform: "translateY(0)" }], DUR.medium),
            ],
        },
        dont: {
            caption: "slides regardless of the setting",
            scene: (size) => <ToastScene size={size} />,
            tracks: [t("panel", kf.slideYIn("150%"), DUR.medium)],
        },
    },

    /* motion-22 · Use WAAPI for Programmatic Motion — smooth vs setInterval
     * steps. (This whole showcase runs on WAAPI.) */
    "motion-22": {
        trigger: "replay",
        do: {
            caption: "element.animate() — smooth",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), DUR.medium)],
        },
        dont: {
            caption: "setInterval — stepped",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), DUR.medium, { easing: "steps(8, end)" })],
        },
    },

    /* motion-24 · Stagger Without Blocking — 60ms steps vs a 220ms cascade. */
    "motion-24": {
        trigger: "replay",
        do: {
            caption: "60ms between rows",
            scene: (size) => <ListScene size={size} hiddenAtRest />,
            tracks: [t("row", kf.riseIn(6), DUR.medium, { staggerMs: 60 })],
        },
        dont: {
            caption: "220ms between rows — content held hostage",
            scene: (size) => <ListScene size={size} hiddenAtRest />,
            tracks: [t("row", kf.riseIn(6), DUR.medium, { staggerMs: 220 })],
        },
    },

    /* motion-25 · Review in Slow Time — the same motion at 1× and at review
     * speed. (The showcase's own 0.25× toggle is this rule as a feature.) */
    "motion-25": {
        trigger: "replay",
        do: {
            caption: "reviewed at 3× duration",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), 540)],
        },
        dont: {
            caption: "judged only at full speed",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), 180)],
        },
    },

    /* color-7 · Hover State Stays in Hue — hover the panes: blue darkens
     * vs jumping to green. Colors are literal because WAAPI keyframes
     * cannot resolve Tailwind classes: blue-600/700, green-600. */
    "color-7": {
        trigger: "hover",
        do: {
            caption: "blue-600 → blue-700",
            scene: (size) => <ButtonScene size={size} label="Hover me" background="#155dfc" />,
            tracks: [t("fill", kf.background("#155dfc", "#1447e6"), DUR.medium)],
            exitTracks: [t("fill", kf.background("#1447e6", "#155dfc"), DUR.medium)],
        },
        dont: {
            caption: "blue → green — hue jump",
            scene: (size) => <ButtonScene size={size} label="Hover me" background="#155dfc" />,
            tracks: [t("fill", kf.background("#155dfc", "#00a63e"), DUR.medium)],
            exitTracks: [t("fill", kf.background("#00a63e", "#155dfc"), DUR.medium)],
        },
    },

    /* comp-9 · Loading State on Async Buttons — submit: label crossfades to
     * a spinner and the button dims vs staying clickable. */
    "comp-9": {
        trigger: "action",
        control: "Submit",
        do: {
            caption: "spinner + disabled on submit",
            scene: (size) => <SubmitScene size={size} spinner />,
            tracks: [
                t("label", kf.crossfade(false), DUR.fast),
                t("spinner", kf.crossfade(true), DUR.fast),
                t("fill", [{ opacity: 1 }, { opacity: 0.55 }], DUR.medium),
            ],
        },
        dont: {
            caption: "stays clickable — double submit",
            scene: (size) => <SubmitScene size={size} spinner={false} />,
            tracks: [t("fill", kf.scaleTo(1, 0.97), 80), t("fill", kf.scaleTo(0.97, 1), 80, { delayMs: 80 })],
        },
    },

    /* sys-9 · Optimistic UI — heart fills instantly vs waiting on the server. */
    "sys-9": {
        trigger: "action",
        control: "Like",
        do: {
            caption: "fills instantly · syncs in the background",
            scene: (size) => <LikeScene size={size} />,
            tracks: [t("panel", kf.popIn(0.6), 120)],
        },
        dont: {
            caption: "waits ~560ms for the round-trip",
            scene: (size) => <LikeScene size={size} />,
            tracks: [t("panel", kf.popIn(0.6), 120, { delayMs: 560 })],
        },
    },

    /* sys-1 · Skeletons Over Spinners — both loaders resolve to the same
     * content; the skeleton already told you the shape. */
    "sys-1": {
        trigger: "action",
        control: "Load",
        do: {
            caption: "skeleton implies the structure",
            scene: (size) => <LoadingScene size={size} kind="skeleton" />,
            tracks: [
                t("placeholder", kf.crossfade(false), DUR.medium, { delayMs: 400 }),
                t("content", kf.fadeIn(), DUR.medium, { delayMs: 400 }),
            ],
        },
        dont: {
            caption: "spinner highlights the wait",
            scene: (size) => <LoadingScene size={size} kind="spinner" />,
            tracks: [
                t("placeholder", kf.crossfade(false), DUR.medium, { delayMs: 400 }),
                t("content", kf.fadeIn(), DUR.medium, { delayMs: 400 }),
            ],
        },
    },
};
```

> Note: `color-7`'s hex literals are Tailwind v4's `blue-600` (#155dfc), `blue-700`
> (#1447e6) and `green-600` (#00a63e). If the project's palette changes, update them.

### Phase 3 verification

```bash
npx tsc --noEmit
```

---

## 6. Phase 4 — The showcase component

### 6.1 ADD `src/components/features/rules/demos/motion-showcase.tsx`

```tsx
"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, Play, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCanHover, useReducedMotion } from "@/lib/media";
import { cancelPane, playPane, tracksDurationMs, EASE } from "@/lib/showcase-engine";
import { showcaseSpecs, type PaneSpec, type ShowcaseSpec } from "@/components/features/rules/demos/showcase-specs";
import { type PreviewSize, type Variant } from "@/components/features/rules/preview-primitives";

/* ─────────────────────────────────────────────────────────
 * SHOWCASE INTERACTION STORYBOARD
 *
 *    rest   both panes show composed mini-UIs (overlays parked)
 * trigger   ONE control / gesture fires BOTH panes simultaneously
 *    play   engine runs each pane's tracks; timing bars fill in
 *           real time so the duration difference is visible
 * slow-mo   0.25× toggle re-runs everything at quarter speed
 * reduced   engine plays at duration 0 — end states, no motion
 * ───────────────────────────────────────────────────────── */

const SLOW_RATE = 0.25;

/** Look up whether a rule has a showcase (safe to call from server components). */
export function hasShowcase(ruleId: string): boolean {
    return ruleId in showcaseSpecs;
}

export function MotionShowcase({ ruleId }: { ruleId: string }) {
    const spec = showcaseSpecs[ruleId];
    if (!spec) return null;
    return <ShowcaseBody spec={spec} />;
}

function ShowcaseBody({ spec }: { spec: ShowcaseSpec }) {
    const doRef = useRef<HTMLDivElement | null>(null);
    const dontRef = useRef<HTMLDivElement | null>(null);
    const doBarRef = useRef<HTMLDivElement | null>(null);
    const dontBarRef = useRef<HTMLDivElement | null>(null);
    const [slow, setSlow] = useState(false);
    const [engaged, setEngaged] = useState(false);
    const reduced = useReducedMotion();
    const canHover = useCanHover();

    const rate = slow ? SLOW_RATE : 1;
    const isGesture = spec.trigger === "press" || spec.trigger === "hover";

    const runBar = useCallback(
        (bar: HTMLDivElement | null, pane: PaneSpec, currentRate: number, isReduced: boolean) => {
            if (!bar) return;
            bar.getAnimations().forEach((a) => a.cancel());
            if (isReduced) return;
            const anim = bar.animate(
                [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
                { duration: Math.max(1, tracksDurationMs(pane.tracks)), easing: EASE.linear, fill: "forwards" }
            );
            anim.playbackRate = currentRate;
        },
        []
    );

    const enter = useCallback(() => {
        if (doRef.current) playPane(doRef.current, spec.do.tracks, { rate, reduced });
        if (dontRef.current) playPane(dontRef.current, spec.dont.tracks, { rate, reduced });
        runBar(doBarRef.current, spec.do, rate, reduced);
        runBar(dontBarRef.current, spec.dont, rate, reduced);
        setEngaged(true);
    }, [spec, rate, reduced, runBar]);

    const exit = useCallback(() => {
        if (doRef.current && spec.do.exitTracks) playPane(doRef.current, spec.do.exitTracks, { rate, reduced });
        if (dontRef.current && spec.dont.exitTracks) playPane(dontRef.current, spec.dont.exitTracks, { rate, reduced });
        setEngaged(false);
    }, [spec, rate, reduced]);

    // Reset panes when the rule changes (drawer navigates without unmounting).
    useEffect(() => {
        setEngaged(false);
        const doEl = doRef.current;
        const dontEl = dontRef.current;
        return () => {
            if (doEl) cancelPane(doEl);
            if (dontEl) cancelPane(dontEl);
        };
    }, [spec]);

    const surfaceHandlers = !isGesture
        ? undefined
        : spec.trigger === "press"
          ? {
                onPointerDown: enter,
                onPointerUp: exit,
                onPointerLeave: () => engaged && exit(),
                onPointerCancel: exit,
            }
          : {
                onPointerEnter: enter,
                onPointerLeave: exit,
                // Tap fallback for hover demos on touch devices.
                onClick: () => (canHover ? undefined : engaged ? exit() : enter()),
            };

    return (
        <div className="motion-showcase">
            <div
                {...(surfaceHandlers ?? {})}
                className={cn("grid grid-cols-2 gap-3", isGesture && "cursor-pointer select-none")}
            >
                <ShowcasePane variant="do" pane={spec.do} paneRef={doRef} barRef={doBarRef} />
                <ShowcasePane variant="dont" pane={spec.dont} paneRef={dontRef} barRef={dontBarRef} />
            </div>

            <div className="mt-3 flex items-center gap-2">
                {spec.trigger === "press" ? (
                    <Hint>Press &amp; hold either side — both react together</Hint>
                ) : spec.trigger === "hover" ? (
                    <Hint>{canHover ? "Hover the panes — both react together" : "Tap the panes to preview the hover state"}</Hint>
                ) : spec.trigger === "toggle" ? (
                    <ControlButton onClick={engaged ? exit : enter}>
                        {spec.control ?? "Toggle"}
                    </ControlButton>
                ) : (
                    <ControlButton onClick={enter}>
                        <Play aria-hidden="true" className="size-3.5" />
                        {spec.trigger === "replay" ? "Play both" : spec.control ?? "Run"}
                    </ControlButton>
                )}

                <button
                    type="button"
                    aria-pressed={slow}
                    onClick={() => setSlow((s) => !s)}
                    className={cn(
                        "rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                        slow
                            ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                            : "border-neutral-300 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    )}
                >
                    0.25×
                </button>

                {reduced ? <Hint>Reduced motion — showing end states</Hint> : null}
            </div>
        </div>
    );
}

function ShowcasePane({
    variant,
    pane,
    paneRef,
    barRef,
}: {
    variant: Variant;
    pane: PaneSpec;
    paneRef: React.RefObject<HTMLDivElement | null>;
    barRef: React.RefObject<HTMLDivElement | null>;
}) {
    const isDo = variant === "do";
    return (
        <div>
            <div className="mb-2 flex items-center gap-1.5">
                {isDo ? (
                    <CheckCircle2 aria-hidden="true" className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                    <XCircle aria-hidden="true" className="size-3.5 text-rose-600 dark:text-rose-300" />
                )}
                <span
                    className={cn(
                        "text-[11px] font-semibold",
                        isDo ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-200"
                    )}
                >
                    {isDo ? "Do" : "Don't"}
                </span>
            </div>
            <div
                ref={paneRef}
                aria-hidden="true"
                className="rounded-lg border border-neutral-200 bg-white p-2.5 dark:border-neutral-800 dark:bg-neutral-950"
            >
                {pane.scene("lg")}
            </div>
            <div className="mt-1.5 h-0.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                <div
                    ref={barRef}
                    className="h-full origin-left bg-neutral-900 dark:bg-neutral-100"
                    style={{ transform: "scaleX(0)" }}
                />
            </div>
            <p className="mt-1.5 text-[11px] leading-4 text-neutral-500 dark:text-neutral-400">{pane.caption}</p>
        </div>
    );
}

function Hint({ children }: { children: ReactNode }) {
    return <span className="text-xs text-neutral-500 dark:text-neutral-400">{children}</span>;
}

function ControlButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
            {children}
        </button>
    );
}

/* ── Grid preview ─────────────────────────────────────────────────────
 * Lightweight sm-card preview: autoplay once on view (shared observer),
 * replay on hover. Gesture specs play enter, hold a beat, then exit. */

const previewCallbacks = new WeakMap<Element, () => void>();
let sharedObserver: IntersectionObserver | null = null;

function observePreview(el: Element, cb: () => void) {
    if (!sharedObserver) {
        sharedObserver = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        previewCallbacks.get(entry.target)?.();
                        sharedObserver?.unobserve(entry.target);
                        previewCallbacks.delete(entry.target);
                    }
                }
            },
            { threshold: 0.4 }
        );
    }
    previewCallbacks.set(el, cb);
    sharedObserver.observe(el);
    return () => {
        previewCallbacks.delete(el);
        sharedObserver?.unobserve(el);
    };
}

export function PanePreview({
    ruleId,
    variant,
    size,
}: {
    ruleId: string;
    variant: Variant;
    size: PreviewSize;
}) {
    const spec = showcaseSpecs[ruleId];
    const ref = useRef<HTMLDivElement | null>(null);
    const exitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const reduced = useReducedMotion();
    const canHover = useCanHover();

    const pane = spec ? spec[variant] : null;

    const playOnce = useCallback(() => {
        const el = ref.current;
        if (!el || !pane) return;
        clearTimeout(exitTimer.current);
        playPane(el, pane.tracks, { reduced });
        if (pane.exitTracks) {
            exitTimer.current = setTimeout(
                () => {
                    if (ref.current) playPane(ref.current, pane.exitTracks!, { reduced });
                },
                reduced ? 600 : tracksDurationMs(pane.tracks) + 500
            );
        }
    }, [pane, reduced]);

    useEffect(() => {
        const el = ref.current;
        if (!el || !pane || reduced) return;
        if (!canHover && spec?.touchAutoplay === false) return; // motion-16 obeys itself
        const unobserve = observePreview(el, playOnce);
        return () => {
            unobserve();
            clearTimeout(exitTimer.current);
        };
    }, [pane, spec, reduced, canHover, playOnce]);

    if (!pane) return null;

    return (
        <div
            ref={ref}
            aria-hidden="true"
            onPointerEnter={canHover ? playOnce : undefined}
            className="cursor-pointer rounded-lg border border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-950"
        >
            {pane.scene(size)}
            <p className="mt-1.5 text-[10px] leading-4 text-neutral-600 dark:text-neutral-300">{pane.caption}</p>
        </div>
    );
}
```

### Phase 4 verification

```bash
npx tsc --noEmit
```

---

## 7. Phase 5 — Wiring (registry, RulePreview, drawer, page)

### 7.1 REPLACE `src/components/features/rules/demos/registry.ts` (entire file)

```ts
export { showcaseSpecs } from "@/components/features/rules/demos/showcase-specs";
export { hasShowcase, MotionShowcase, PanePreview } from "@/components/features/rules/demos/motion-showcase";
```

### 7.2 EDIT `src/components/features/rules/rule-preview.tsx`

Replace this block:

```tsx
export function RulePreview({ rule, variant, size = "sm" }: RulePreviewProps) {
    // Animated demo when the rule has one registered; otherwise the static preview.
    const Demo = motionDemos[rule.id];
    if (Demo) {
        return <Demo variant={variant} size={size} />;
    }

    const preview = getRulePreview(rule.id, variant, size);
```

with:

```tsx
export function RulePreview({ rule, variant, size = "sm" }: RulePreviewProps) {
    // Rules with a motion showcase render its pane preview here (grid cards).
    // The lg deep-dive renders <MotionShowcase> directly — see rule-drawer /
    // rules/[id]/page, which skip RulePreview for showcase rules.
    if (hasShowcase(rule.id)) {
        return <PanePreview ruleId={rule.id} variant={variant} size={size} />;
    }

    const preview = getRulePreview(rule.id, variant, size);
```

and replace the import
`import { motionDemos } from "@/components/features/rules/demos/registry";`
with
`import { hasShowcase, PanePreview } from "@/components/features/rules/demos/registry";`

> **IMPORTANT (RSC):** pass only `ruleId`/`variant` strings into `PanePreview` and
> `MotionShowcase`. Never pass a spec object as a prop from a server component —
> specs contain functions and will throw a serialization error.

### 7.3 EDIT `src/components/features/rules/rule-drawer.tsx`

1. Add the import:
   ```tsx
   import { hasShowcase, MotionShowcase } from "@/components/features/rules/demos/registry";
   ```
2. Read the file and locate the two `<article>` blocks ("Recommended" and "Avoid").
   Immediately **before the first `<article>`**, insert:
   ```tsx
   {hasShowcase(activeRule.id) ? (
       <div className="mb-6">
           <MotionShowcase ruleId={activeRule.id} />
       </div>
   ) : null}
   ```
3. Replace
   ```tsx
                           <div className="mt-4">
                             <RulePreview rule={activeRule} variant="do" size="lg" />
                           </div>
   ```
   with
   ```tsx
                           {!hasShowcase(activeRule.id) && (
                             <div className="mt-4">
                               <RulePreview rule={activeRule} variant="do" size="lg" />
                             </div>
                           )}
   ```
   and the same for the `variant="dont"` block.

### 7.4 EDIT `src/app/rules/[id]/page.tsx`

1. Add the import:
   ```tsx
   import { hasShowcase, MotionShowcase } from "@/components/features/rules/demos/registry";
   ```
2. Locate the two do/don't cards (`<div className="rounded-2xl border ...">` pair).
   Immediately **before the element that contains them** (their grid wrapper), insert:
   ```tsx
   {hasShowcase(rule.id) ? (
       <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
           <MotionShowcase ruleId={rule.id} />
       </div>
   ) : null}
   ```
3. Replace
   ```tsx
                               <div className="mb-3">
                                   <RulePreview rule={rule} variant="do" size="lg" />
                               </div>
   ```
   with
   ```tsx
                               {!hasShowcase(rule.id) && (
                                   <div className="mb-3">
                                       <RulePreview rule={rule} variant="do" size="lg" />
                                   </div>
                               )}
   ```
   and the same for the `variant="dont"` block.

### 7.5 DELETE old files

```bash
rm src/hooks/use-demo-playback.ts \
   src/hooks/use-interactive-demo.ts \
   src/components/features/rules/demos/demo-stage.tsx \
   src/components/features/rules/demos/motion-demos.tsx \
   src/components/features/rules/demos/interaction-demos.tsx
```

### 7.6 EDIT `src/app/globals.css`

Replace the `.motion-demo` block inside the `prefers-reduced-motion` media query:

```css
  /*
   * Motion-rule demos: kill movement only. The demos render their final/resting
   * frame by default (the hook keeps `settled` true and never plays under reduced
   * motion), so disabling transitions/animations lands them on that frame
   * instantly — without overriding the inline transforms used for layout.
   */
  .motion-demo,
  .motion-demo * {
    transition: none !important;
    animation: none !important;
  }
```

with:

```css
  /*
   * Motion showcases enforce reduced motion in the WAAPI engine (animations run
   * at duration 0 → end states apply instantly). CSS-level decoration inside
   * scenes (spinners, pulses) is stilled here.
   */
  .motion-showcase * {
    animation-duration: 0s !important;
    transition: none !important;
  }
```

### Phase 5 verification

```bash
npx tsc --noEmit && npm run build
```
Both must pass. `next build` must generate all static pages.

---

## 8. Phase 6 — Browser verification (use the preview tools)

1. Start the dev server; open `/`.
   - Expect: grid cards render composed mini-UI scenes (no empty boxes). No console errors.
2. Open `/rules/motion-6`.
   - Expect: one showcase block with Do/Don't panes side by side, a single
     "Play both" button, and a `0.25×` toggle.
   - Click "Play both": both race cards animate simultaneously; the timing bars
     fill — the Do bar finishes visibly earlier (180ms vs 500ms).
   - Verify via eval even in a hidden tab (WAAPI timelines advance without rAF):
     ```js
     document.querySelectorAll('[data-anim="panel"]')[0].getAnimations().length // ≥ 1 after Play
     ```
3. Open `/rules/motion-8`: press & hold anywhere on the panes — both buttons
   scale down together (0.96 vs 0.9); release restores both.
4. Open `/rules/motion-7`: the control toggles "Show / dismiss"; enter and exit
   speeds differ between panes.
5. Toggle `0.25×` on any showcase and replay — motion runs at quarter speed.
6. Emulate `prefers-reduced-motion: reduce` (preview_resize supports colorScheme
   only, so use devtools emulation or set the OS toggle): panes jump to end
   states; the "Reduced motion" hint shows.
7. Check the drawer on `/`: open any motion rule card's deep dive; the showcase
   renders above the Recommended/Avoid text and the old per-variant lg previews
   are gone for showcase rules.

## 9. Acceptance checklist

- [ ] All 24 previously-registered rules render a showcase (20 motion + color-7, comp-9, sys-9, sys-1).
- [ ] One control drives both panes simultaneously in every showcase.
- [ ] Replay is glitch-free: rapid repeated clicks never leave a pane stuck mid-frame
      (the engine cancels its own animations before each play).
- [ ] No `will-change` anywhere in the new demo code.
- [ ] Exactly 2 matchMedia listeners app-wide for hover/reduced-motion (the shared store).
- [ ] One IntersectionObserver total for all grid previews.
- [ ] Grid preview: autoplays once on scroll-into-view, replays on hover; motion-16's
      Do pane does not autoplay on touch.
- [ ] Reduced motion: end states everywhere, hint text visible, zero movement.
- [ ] `tsc`, `next build`, and ESLint all clean.
- [ ] No RSC serialization errors (specs never cross the server→client boundary as props).

## 10. Pitfalls (read before executing)

1. **RSC prop serialization.** `rule-preview.tsx` and `rules/[id]/page.tsx` are server
   components. They must pass only strings (`ruleId`, `variant`) to the client
   components. Passing a `PaneSpec`/`ShowcaseSpec` object as a prop throws
   "Functions cannot be passed directly to Client Components".
2. **WAAPI `easing` cannot read CSS variables.** That's why `EASE`/`DUR` mirror the
   `:root` tokens as literals. If you change `--ease-out-strong` or `--motion-*`
   in globals.css, update `showcase-engine.ts` to match.
3. **Never cancel with `getAnimations({ subtree: true })`.** It would kill CSS
   animations owned by scenes (spinner `animate-spin`, skeleton `animate-pulse`).
   The engine tracks its own animations in a WeakMap; only those are cancelled.
4. **Keyframes must include the starting frame.** Every `kf.*` builder returns both
   endpoints. If you add a new builder, do the same — single-frame keyframes
   animate from "current style", which reintroduces the replay indeterminism this
   rework exists to kill.
5. **`fill: "forwards"` + cancel-on-replay** is the state model. Do not add React
   state that mirrors animation progress (no `settled` booleans) — the DOM
   animation IS the state.
6. **Headless testing:** `requestAnimationFrame` is paused in hidden tabs but WAAPI
   timelines still advance, and `fill: "forwards"` commits end states — so
   `getAnimations()` and end-state assertions work in the preview tools even when
   the tab never paints.
7. **Tailwind arbitrary values in scenes:** scene layout uses inline styles for
   anything dynamic (`transformOrigin`, parked transforms). Do not move parked
   transforms into Tailwind classes — the engine overrides them with animations,
   and class-based transforms would fight the animation's `fill`.
