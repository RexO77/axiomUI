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
    /** CSS's own `ease`. Only for motion-4, which teaches that it is too weak. */
    browserDefault: "cubic-bezier(0.25, 0.1, 0.25, 1)",
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

/**
 * CSS linear() easing sampling a damped spring settling to 1.
 * bounce 0.1–0.3 = subtle overshoot; pair with ~350–500ms duration.
 */
export function springLinear(bounce = 0.2, points = 24): string {
    const zeta = 1 - bounce;
    const omega = 8;
    const omegaD = omega * Math.sqrt(1 - zeta * zeta);
    const samples: string[] = [];
    for (let i = 0; i <= points; i++) {
        const tNorm = i / points;
        const decay = Math.exp(-zeta * omega * tNorm);
        const x =
            1 -
            decay *
                (Math.cos(omegaD * tNorm) +
                    ((zeta * omega) / omegaD) * Math.sin(omegaD * tNorm));
        samples.push(x.toFixed(4));
    }
    samples[samples.length - 1] = "1";
    return `linear(${samples.join(", ")})`;
}

// ── Keyframe builders ────────────────────────────────────────────────
// Every builder returns BOTH endpoints so replays are deterministic.

export const kf = {
    fadeIn: (): Keyframe[] => [{ opacity: 0 }, { opacity: 1 }],
    /** Kbd-chip depression (motion-2): down fast, back up — one keystroke. */
    keyPress: (): Keyframe[] => [
        { transform: "scale(1)" },
        { transform: "scale(0.88)", offset: 0.35 },
        { transform: "scale(1)" },
    ],
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
    /** Nudge sideways by a fixed amount (motion-23's parent/child chips). */
    nudgeX: (px: number): Keyframe[] => [
        { transform: "translateX(0)" },
        { transform: `translateX(${px}px)` },
    ],
    nudgeXBack: (px: number): Keyframe[] => [
        { transform: `translateX(${px}px)` },
        { transform: "translateX(0)" },
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
