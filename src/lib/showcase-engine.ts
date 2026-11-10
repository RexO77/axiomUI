// design-system: strict
import { prefersReducedMotion } from "@/lib/media";

/**
 * WAAPI playback engine for the rule showcases.
 *
 * A demo is a set of `Track`s. Each track names a target (`[data-anim="…"]`
 * inside the pane), explicit from→to keyframes, and timing. Playing a pane =
 * cancel whatever this engine previously started on it, then `element.animate()`
 * every track.
 *
 * Playback is interruptible. An element nothing is running on starts from the
 * track's own first keyframe, so a first play is deterministic. An element
 * this engine is still animating (or holding at an end frame) starts from the
 * value it shows right now, and the track runs for the share of its duration
 * that the remaining distance is worth. A press released after 40ms turns
 * around from where the button is, instead of snapping to the far keyframe.
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
 *  in `easing`, so these are literals. design-system.test.ts parses globals.css
 *  and fails if `out`, `inOut` or DUR drift from the tokens they name. */
export const EASE = {
    out: "cubic-bezier(0.23, 1, 0.32, 1)", // --ease-out-strong
    in: "cubic-bezier(0.55, 0, 1, 0.45)",
    inOut: "cubic-bezier(0.65, 0, 0.35, 1)", // --ease-in-out-strong
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

/** Whether this engine is animating, or holding an end frame, inside a pane.
 *  False means every animated node shows its scene's rest style. */
export function paneIsLive(root: HTMLElement): boolean {
    return (live.get(root)?.length ?? 0) > 0;
}

/** An interrupted track never runs shorter than this share of its duration,
 *  so a turnaround a few pixels from home still reads as motion. */
const MIN_REMAINING = 0.35;

const NON_VALUES = new Set(["offset", "easing", "composite"]);
const IDENTITY = [1, 0, 0, 1, 0, 0];

/** The animated properties a track's keyframes mention. */
function keyedProps(keyframes: Keyframe[]): string[] {
    const props = new Set<string>();
    for (const frame of keyframes) {
        for (const prop of Object.keys(frame)) if (!NON_VALUES.has(prop)) props.add(prop);
    }
    return [...props];
}

function computed(el: HTMLElement, props: string[]): Record<string, string> {
    const style = getComputedStyle(el) as unknown as Record<string, string>;
    const out: Record<string, string> = {};
    for (const prop of props) out[prop] = style[prop];
    return out;
}

/** A keyframe resolved to computed values on this element (percentages and
 *  calc() become pixels), by applying it for one synchronous style read. No
 *  frame is painted in between, so the probe is never seen. */
function resolveFrame(el: HTMLElement, frame: Keyframe, props: string[]): Record<string, string> {
    const values: Keyframe = {};
    for (const prop of props) if (frame[prop] !== undefined) values[prop] = frame[prop];
    const probe = el.animate([values, values], { duration: 1, fill: "both" });
    const out = computed(el, props);
    probe.cancel();
    return out;
}

/** A computed value as a vector, so two values of one property can be compared. */
function numbers(prop: string, value: string): number[] {
    if (prop === "transform" && value === "none") return IDENTITY;
    const out = (value.match(/-?\d*\.?\d+(?:e-?\d+)?/g) ?? []).map(Number);
    if (value.startsWith("rgb(")) out.push(1);
    return out;
}

function distance(prop: string, a: string, b: string): number {
    const x = numbers(prop, a);
    const y = numbers(prop, b);
    let sum = 0;
    for (let i = 0; i < Math.max(x.length, y.length); i++) sum += ((x[i] ?? 0) - (y[i] ?? 0)) ** 2;
    return Math.sqrt(sum);
}

/** Whether every keyframe sets the same values: a "go to" track, such as a
 *  settle to rest, rather than a motion with a shape of its own. */
function isGoTo(frames: Keyframe[], props: string[]): boolean {
    return frames.every((frame) => props.every((prop) => frame[prop] === frames[0][prop]));
}

/** How much of a track is left to travel from `now`: 1 = all of it. A go-to
 *  track takes its full duration when there is anywhere to go and none when
 *  there isn't. A track that leaves and comes back (a key press) has no
 *  distance to measure, so it always runs in full. */
function remainingShare(
    frames: Keyframe[],
    now: Record<string, string>,
    from: Record<string, string>,
    to: Record<string, string>,
    props: string[]
): number {
    if (isGoTo(frames, props)) {
        return props.some((prop) => distance(prop, now[prop], to[prop]) > 1e-3) ? 1 : 0;
    }
    let share = -1;
    for (const prop of props) {
        const total = distance(prop, from[prop], to[prop]);
        if (total > 1e-3) share = Math.max(share, distance(prop, now[prop], to[prop]) / total);
    }
    if (share < 0) return 1;
    return Math.min(1, Math.max(MIN_REMAINING, share));
}

/** A computed 2D transform without rotation or skew, as translate + scale. */
function translateScale(value: string | undefined): string | null {
    if (!value) return null;
    const m = new DOMMatrixReadOnly(value === "none" ? undefined : value);
    if (!m.is2D || Math.abs(m.b) > 1e-6 || Math.abs(m.c) > 1e-6) return null;
    return `translate(${m.e}px, ${m.f}px) scale(${m.a}, ${m.d})`;
}

/**
 * The sampled start of a takeover is a computed `matrix()`. Between a matrix
 * and a function list the browser interpolates matrices, and a singular end
 * such as motion-9's scale(0) cannot be decomposed, so the whole transform
 * flips at the halfway point. Writing every frame in one translate + scale
 * shape keeps the interpolation per function. Frames with rotation or skew,
 * or a frame that leaves transform out, keep their authored values.
 */
function sameTransformShape(keyframes: Keyframe[], resolved: Record<string, string>[]): Keyframe[] {
    if (keyframes.some((frame) => frame.transform === undefined)) return keyframes;
    const shaped = resolved.map((values) => translateScale(values.transform));
    if (shaped.some((value) => value === null)) return keyframes;
    return keyframes.map((frame, i) => ({ ...frame, transform: shaped[i] }));
}

export type PlayOptions = {
    rate?: number;
    reduced?: boolean;
    /** Start from each track's own first keyframe even where something is
     *  running: for a restart whose reset has already brought the pane to
     *  exactly that frame. */
    fromKeyframes?: boolean;
};

export function playPane(
    root: HTMLElement,
    tracks: Track[],
    { rate = 1, reduced = false, fromKeyframes = false }: PlayOptions = {}
): Animation[] {
    const reduceMotion = reduced || prefersReducedMotion();
    const running = new Set(
        (live.get(root) ?? [])
            .map((a) => (a.effect instanceof KeyframeEffect ? a.effect.target : null))
            .filter((el): el is Element => el !== null)
    );

    // Plan every animation before cancelling anything: the current values have
    // to be read while the old animations still apply them.
    type Planned = {
        el: HTMLElement;
        track: Track;
        delay: number;
        keyframes: Keyframe[];
        duration: number;
        holdStart: boolean;
    };
    const planned: Planned[] = [];
    const firstDelay = new Map<HTMLElement, number>();
    for (const track of tracks) {
        root.querySelectorAll<HTMLElement>(`[data-anim="${track.target}"]`).forEach((el, i) => {
            const delay = (track.delayMs ?? 0) + (track.staggerMs ?? 0) * i;
            planned.push({
                el,
                track,
                delay,
                keyframes: track.keyframes,
                duration: track.durationMs,
                holdStart: false,
            });
            firstDelay.set(el, Math.min(firstDelay.get(el) ?? Infinity, delay));
        });
    }

    if (!reduceMotion && !fromKeyframes) {
        for (const plan of planned) {
            // Only the track that moves an element first takes over from its
            // current value; later tracks on it (comp-9's press, then release)
            // pick up from the frame the earlier one hands them.
            if (plan.delay !== firstDelay.get(plan.el)) continue;
            const frames = plan.track.keyframes;
            const props = keyedProps(frames);
            // A go-to has no starting frame of its own: it always leaves from
            // wherever the element is, running or not.
            if (!running.has(plan.el) && !isGoTo(frames, props)) continue;
            const now = computed(plan.el, props);
            const resolved = frames.map((frame) => resolveFrame(plan.el, frame, props));
            const share = remainingShare(frames, now, resolved[0], resolved[resolved.length - 1], props);
            const start: Keyframe = { ...now };
            if (frames[0].easing) start.easing = frames[0].easing;
            plan.keyframes = sameTransformShape([start, ...frames.slice(1)], [now, ...resolved.slice(1)]);
            plan.duration = plan.track.durationMs * share;
            // A delayed takeover holds where the element is until its turn,
            // rather than dropping to the scene's rest style for the delay.
            plan.holdStart = plan.delay > 0;
        }
    }

    cancelPane(root);
    const spawned = planned.map((plan) => {
        const anim = plan.el.animate(plan.keyframes, {
            duration: reduceMotion ? 0 : plan.duration,
            delay: reduceMotion ? 0 : plan.delay,
            easing: plan.track.easing ?? EASE.out,
            fill: plan.holdStart ? "both" : "forwards",
        });
        anim.playbackRate = rate;
        return anim;
    });
    live.set(root, spawned);
    return spawned;
}

/**
 * Play tracks that end on the scene's rest frame, then hand every element
 * back to its rest style: the animations are cancelled in the same frame they
 * finish, so nothing is painted in between. Afterwards the pane is not live,
 * so the next play starts from its own first keyframes. Resolves false when
 * something else took over the pane first.
 */
export async function settlePane(
    root: HTMLElement,
    tracks: Track[],
    options: PlayOptions = {}
): Promise<boolean> {
    const anims = await finishPane(root, tracks, options);
    if (!anims || live.get(root) !== anims) return false;
    cancelPane(root);
    return true;
}

/** Play tracks and wait for them. Resolves with the animations, still holding
 *  their end frames, or null when something else took over the pane first. */
export async function finishPane(
    root: HTMLElement,
    tracks: Track[],
    options: PlayOptions = {}
): Promise<Animation[] | null> {
    const anims = playPane(root, tracks, options);
    try {
        await Promise.all(anims.map((a) => a.finished));
    } catch {
        return null; // cancelled by a newer play
    }
    return live.get(root) === anims ? anims : null;
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
