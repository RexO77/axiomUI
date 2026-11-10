// design-system: strict
"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type KeyboardEvent,
} from "react";
import { Play } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCanHover, useReducedMotion } from "@/lib/media";
import { useHaptics } from "@/hooks/use-haptics";
import {
    cancelPane,
    finishPane,
    paneIsLive,
    playPane,
    settlePane,
    tracksDurationMs,
    DUR,
    EASE,
    type Track,
} from "@/lib/showcase-engine";
import {
    paneReadout,
    showcaseSpecs,
    type PaneSpec,
    type ShowcaseSpec,
} from "@/components/features/rules/demos/showcase-specs";
import { DragShowcase } from "@/components/features/rules/demos/drag-showcases";
import { InterruptShowcase } from "@/components/features/rules/demos/interrupt-showcase";
import { LoadShowcase } from "@/components/features/rules/demos/load-showcase";
import { TooltipToolbarShowcase } from "@/components/features/rules/demos/tooltip-showcase";
import {
    CONTROL_RADIUS,
    ControlButton,
    PaneChrome,
} from "@/components/features/rules/demos/showcase-chrome";
import { type Variant } from "@/components/features/rules/preview-primitives";

/* ─────────────────────────────────────────────────────────
 * SHOWCASE STORYBOARD
 *   rest → trigger → play (easing-aware bars + ms readouts)
 *   settle to rest after hold · rate: 1× / ½× / ¼× · reduced → duration 0
 *   replay while moving or holding → 120ms settle to rest, then play
 *
 *   Layout: panes, then one control row (action left, speed right), then
 *   the hint lines. Every rule gets the same rows in the same order, so the
 *   page doesn't reflow from rule to rule.
 * ───────────────────────────────────────────────────────── */

const RATES = [1, 0.5, 0.25] as const;
type Rate = (typeof RATES)[number];
/** Hold at end state so the lesson can be studied before settle-back. */
const SETTLE_HOLD_MS = 1400;

type Readout = ReturnType<typeof paneReadout>;

/** A pinned pane ignores the speed control (motion-25 bakes its review speed in). */
const paneRate = (pane: PaneSpec, rate: number) => (pane.pinRate ? 1 : rate);

/** A replay that finds a pane mid-flight, or holding its end frame, first
 *  takes it back to its starting frame this fast, so the restart never cuts
 *  to keyframe 0. */
const RESET_MS = 120;

/** What an animated node shows when its scene sets nothing inline. */
const REST_DEFAULTS: Record<string, string> = { opacity: "1", transform: "none", filter: "none" };

/**
 * Tracks that take every animated node in a pane back to its scene's rest
 * frame: the value its inline style sets (a hidden menu's opacity 0, a toast's
 * translateY(150%)), else opacity 1 / transform none. Each is a "go to" from
 * wherever the node is now, so a settle never replays the motion backwards
 * (motion-2's key press is symmetric: reversed, it presses again).
 */
function restTracks(pane: PaneSpec, root: HTMLElement): Track[] {
    const keyed = new Map<string, Set<string>>();
    for (const track of [...pane.tracks, ...(pane.exitTracks ?? [])]) {
        const props = keyed.get(track.target) ?? new Set<string>();
        for (const frame of track.keyframes) {
            for (const prop of Object.keys(frame)) {
                if (prop !== "offset" && prop !== "easing" && prop !== "composite") props.add(prop);
            }
        }
        keyed.set(track.target, props);
    }
    const tracks: Track[] = [];
    for (const [target, props] of keyed) {
        const el = root.querySelector<HTMLElement>(`[data-anim="${target}"]`);
        if (!el) continue;
        const inline = el.style as unknown as Record<string, string>;
        const rest: Keyframe = {};
        for (const prop of props) {
            const value = inline[prop] || REST_DEFAULTS[prop];
            if (value) rest[prop] = value;
        }
        tracks.push({ target, keyframes: [rest, rest], durationMs: DUR.fast, easing: EASE.inOut });
    }
    return tracks;
}

/**
 * Tracks that take every animated node back to the frame its next play starts
 * from: the first keyframe of the earliest track that keys each property. A
 * replay resets along the path it is about to run (motion-9's menu shrinks as
 * it fades instead of swelling back to full size), and since the reset ends
 * exactly on the first keyframe, the replay that follows is continuous.
 */
function startTracks(pane: PaneSpec, durationMs: number): Track[] {
    const starts = new Map<string, { frame: Keyframe; delays: Map<string, number> }>();
    for (const track of pane.tracks) {
        const entry = starts.get(track.target) ?? { frame: {}, delays: new Map<string, number>() };
        const delay = track.delayMs ?? 0;
        for (const [prop, value] of Object.entries(track.keyframes[0] ?? {})) {
            if (prop === "offset" || prop === "easing" || prop === "composite") continue;
            if ((entry.delays.get(prop) ?? Infinity) <= delay) continue;
            entry.delays.set(prop, delay);
            entry.frame[prop] = value;
        }
        starts.set(track.target, entry);
    }
    return [...starts].map(([target, { frame }]) => ({
        target,
        keyframes: [frame, frame],
        durationMs,
        easing: EASE.inOut,
    }));
}

/** The readout for one phase. A pane whose tracks wait (a delay or a stagger)
 *  has no single curve to follow, so its bar runs linear across the whole
 *  timeline instead of on the longest track's ease. */
function readoutFor(pane: PaneSpec, phase: "enter" | "exit" = "enter", animations?: Animation[]): Readout {
    const readout = paneReadout(pane, phase);
    // Retargeting can shorten an interrupted track. Count the actual local
    // timeline; explicit event readouts (optimistic feedback, waits) keep
    // measuring their authored event instead of the whole animation.
    if (animations?.length && !(phase === "enter" && pane.readoutMs !== undefined)) {
        readout.ms = Math.round(Math.max(...animations.map((animation) => Number(animation.effect?.getComputedTiming().endTime ?? 0))));
    }
    const tracks = phase === "exit" && pane.exitTracks ? pane.exitTracks : pane.tracks;
    const waits = tracks.some((track) => (track.delayMs ?? 0) > 0 || (track.staggerMs ?? 0) > 0);
    return waits ? { ...readout, easing: EASE.linear } : readout;
}

export function MotionShowcase({ ruleId }: { ruleId: string }) {
    const spec = showcaseSpecs[ruleId];
    if (!spec) return null;
    if (spec.trigger === "drag") return <DragShowcase ruleId={ruleId} />;
    if (spec.trigger === "interrupt") return <InterruptShowcase />;
    if (spec.trigger === "load") return <LoadShowcase ruleId={ruleId} />;
    if (spec.trigger === "toolbar") return <TooltipToolbarShowcase />;
    return <ShowcaseBody spec={spec} />;
}

function ShowcaseBody({ spec }: { spec: ShowcaseSpec }) {
    const doRef = useRef<HTMLDivElement | null>(null);
    const dontRef = useRef<HTMLDivElement | null>(null);
    const doBarRef = useRef<HTMLDivElement | null>(null);
    const dontBarRef = useRef<HTMLDivElement | null>(null);
    const doMsRef = useRef<HTMLSpanElement | null>(null);
    const dontMsRef = useRef<HTMLSpanElement | null>(null);
    const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    /** Bumped by every enter/exit, so a restart waiting on a settle can tell
     *  it was overtaken. */
    const generation = useRef(0);
    const nextGeneration = useCallback(() => ++generation.current, []);
    const doMsRaf = useRef<number | null>(null);
    const dontMsRaf = useRef<number | null>(null);
    // Default to study speed — full speed is available, but demos are teaching material.
    const [rate, setRate] = useState<Rate>(0.5);
    const [engaged, setEngaged] = useState(false);
    const [plays, setPlays] = useState(0);
    const reduced = useReducedMotion();
    const canHover = useCanHover();
    const autoplayed = useRef(false);
    // Press demos dogfood motion-8: feedback confirms the press was heard.
    const { tapLight } = useHaptics();

    const isGesture = spec.trigger === "press" || spec.trigger === "hover";
    const skipDo = Boolean(spec.doRequiresHover) && !canHover;
    // Speed is for timed playthroughs: gestures are driven by the hand, reduced
    // motion has no playthrough to slow down, and fully pinned specs ignore it.
    const ratePinned = Boolean(spec.do.pinRate && spec.dont.pinRate);
    const showSpeed = !isGesture && !reduced && !ratePinned;
    const playbackRate = isGesture ? 1 : rate;
    const holdRate = ratePinned ? 1 : playbackRate;

    const writeMs = (el: HTMLSpanElement | null, ms: number) => {
        if (el) el.textContent = `${ms}ms`;
    };

    const stopMsClocks = () => {
        if (doMsRaf.current !== null) {
            cancelAnimationFrame(doMsRaf.current);
            doMsRaf.current = null;
        }
        if (dontMsRaf.current !== null) {
            cancelAnimationFrame(dontMsRaf.current);
            dontMsRaf.current = null;
        }
    };

    /** Bars and counters back to rest. The bars drain over the same time the
     *  scene settles, so the instrument and the scene land together. */
    const clearBars = useCallback(
        (durationMs = 0) => {
            for (const bar of [doBarRef.current, dontBarRef.current]) {
                if (!bar) continue;
                const now = getComputedStyle(bar).transform;
                bar.getAnimations().forEach((a) => a.cancel());
                bar.style.transform = "scaleX(0)";
                if (durationMs > 0 && !reduced && now !== "none") {
                    bar.animate([{ transform: now }, { transform: "scaleX(0)" }], {
                        duration: durationMs,
                        easing: EASE.inOut,
                    });
                }
            }
            writeMs(doMsRef.current, paneReadout(spec.do).ms);
            writeMs(dontMsRef.current, paneReadout(spec.dont).ms);
            stopMsClocks();
        },
        [spec, reduced]
    );

    const runBar = useCallback(
        (
            bar: HTMLDivElement | null,
            msLabel: HTMLSpanElement | null,
            readout: Readout,
            currentRate: number,
            isReduced: boolean,
            rafSlot: "do" | "dont"
        ) => {
            if (!bar) return;
            bar.getAnimations().forEach((a) => a.cancel());
            if (isReduced) {
                // End states only: the bar and the counter land where they finish.
                bar.style.transform = "scaleX(1)";
                writeMs(msLabel, readout.ms);
                return;
            }
            const anim = bar.animate(
                [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
                {
                    duration: Math.max(1, readout.ms),
                    easing: readout.easing,
                    fill: "forwards",
                }
            );
            anim.playbackRate = currentRate;

            // Per-pane rAF so do/dont clocks don't stomp each other.
            const slot = rafSlot === "do" ? doMsRaf : dontMsRaf;
            const tick = () => {
                const t = anim.currentTime;
                if (typeof t === "number") {
                    writeMs(msLabel, Math.min(readout.ms, Math.round(t)));
                }
                if (anim.playState === "finished" || anim.playState === "idle") {
                    writeMs(msLabel, readout.ms);
                    slot.current = null;
                    return;
                }
                slot.current = requestAnimationFrame(tick);
            };
            slot.current = requestAnimationFrame(tick);
        },
        []
    );

    const enter = useCallback((options?: { countsAsInteraction?: boolean }) => {
        const counts = options?.countsAsInteraction !== false;
        autoplayed.current = true;
        clearTimeout(settleTimer.current);
        stopMsClocks();
        const run = nextGeneration();
        setEngaged(true);

        // The tally is evidence of what the user cost themselves — the mount
        // autoplay is not a user action, so it must not count.
        if (spec.tallyDontMs && counts) {
            setPlays((p) => p + 1);
        }

        const panes = [
            { el: doRef.current, pane: spec.do, skip: skipDo },
            { el: dontRef.current, pane: spec.dont, skip: false },
        ];

        const start = (fromKeyframes = false) => {
            if (run !== generation.current) return;
            if (doRef.current && !skipDo) {
                const r = paneRate(spec.do, playbackRate);
                const animations = playPane(doRef.current, spec.do.tracks, { rate: r, reduced, fromKeyframes });
                runBar(doBarRef.current, doMsRef.current, readoutFor(spec.do, "enter", reduced ? undefined : animations), r, reduced, "do");
            }
            if (dontRef.current) {
                const r = paneRate(spec.dont, playbackRate);
                const animations = playPane(dontRef.current, spec.dont.tracks, { rate: r, reduced, fromKeyframes });
                runBar(dontBarRef.current, dontMsRef.current, readoutFor(spec.dont, "enter", reduced ? undefined : animations), r, reduced, "dont");
            }

            const canSettle =
                !reduced &&
                spec.settle !== false &&
                (spec.trigger === "replay" || spec.trigger === "action");
            if (!canSettle) return;

            // Wait for the slower pane, at the rate each one actually plays.
            const wallMs = (pane: PaneSpec) => tracksDurationMs(pane.tracks) / paneRate(pane, playbackRate);
            const hold =
                Math.max(skipDo ? 0 : wallMs(spec.do), wallMs(spec.dont)) + SETTLE_HOLD_MS / holdRate;
            settleTimer.current = setTimeout(() => {
                for (const { el, pane, skip } of panes) {
                    if (!el || skip) continue;
                    const r = paneRate(pane, playbackRate);
                    void settlePane(el, pane.exitTracks ?? restTracks(pane, el), { rate: r, reduced });
                }
                clearBars(DUR.fast / holdRate);
                setEngaged(false);
            }, hold);
        };

        // A replay restarts the lesson from its first frame. A pane that is
        // still moving, or holding its end frame, is taken back to that frame
        // first — quickly — so the restart never cuts to it. A keystroke is
        // the exception: it is answered in the same frame (motion-2's whole
        // lesson), so each pane takes the new press from wherever it is.
        // Reduced motion has no path to rewind: it lands on the end frame.
        const restarts =
            (spec.trigger === "replay" || spec.trigger === "action") && !spec.hotkey && !reduced;
        const busy = restarts && panes.some(({ el, skip }) => el && !skip && paneIsLive(el));
        if (!busy) {
            start();
            return;
        }
        clearBars(RESET_MS);
        void Promise.all(
            panes.map(async ({ el, pane, skip }) =>
                el && !skip ? (await finishPane(el, startTracks(pane, RESET_MS), { reduced })) !== null : true
            )
        ).then((reset) => {
            // A pane cancelled mid-reset (unmount, a newer play) stays put.
            if (reset.every(Boolean)) start(true);
        });
    }, [spec, playbackRate, holdRate, reduced, runBar, skipDo, clearBars, nextGeneration]);

    const exit = useCallback(() => {
        clearTimeout(settleTimer.current);
        stopMsClocks();
        nextGeneration();
        const leave = (
            el: HTMLDivElement | null,
            bar: HTMLDivElement | null,
            msLabel: HTMLSpanElement | null,
            pane: PaneSpec,
            slot: "do" | "dont",
            skip: boolean
        ) => {
            if (!el || skip || !pane.exitTracks) return;
            const r = paneRate(pane, playbackRate);
            // Interruptible: a release mid-press turns around from where the
            // pane is, not from the exit's first keyframe.
            const animations = playPane(el, pane.exitTracks, { rate: r, reduced });
            // The readout follows the exit, so a 160ms dismiss reads 160ms.
            runBar(bar, msLabel, readoutFor(pane, "exit", reduced ? undefined : animations), r, reduced, slot);
        };
        leave(doRef.current, doBarRef.current, doMsRef.current, spec.do, "do", skipDo);
        leave(dontRef.current, dontBarRef.current, dontMsRef.current, spec.dont, "dont", false);
        setEngaged(false);
    }, [spec, playbackRate, reduced, runBar, skipDo, nextGeneration]);

    // Hotkey for keyboard-lesson rules (motion-2): plain key only.
    useEffect(() => {
        const hotkey = spec.hotkey;
        if (!hotkey) return;
        const onKeyDown = (event: globalThis.KeyboardEvent) => {
            if (event.metaKey || event.ctrlKey || event.altKey) return;
            if (event.key.toLowerCase() !== hotkey) return;
            const target = event.target instanceof Element ? event.target : null;
            if (target?.closest("input, textarea, [contenteditable]")) return;
            event.preventDefault();
            enter();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [spec.hotkey, enter]);

    const [prevReduced, setPrevReduced] = useState(reduced);
    if (prevReduced !== reduced) {
        setPrevReduced(reduced);
        setEngaged(false);
    }

    const [prevSpec, setPrevSpec] = useState(spec);
    if (prevSpec !== spec) {
        setPrevSpec(spec);
        setEngaged(false);
        setPlays(0);
        autoplayed.current = false;
    }

    // Autoplay once when a play-style demo mounts — rest shells aren't empty for long.
    // The guard is set when the play fires, not when it is scheduled: Strict
    // Mode (and a drawer that mounts, unmounts and remounts) runs this effect
    // twice, and the first cleanup clears the timer the guard was set for.
    useEffect(() => {
        if (reduced) return;
        if (spec.trigger !== "replay" && spec.trigger !== "action") return;
        if (autoplayed.current) return;
        const t = window.setTimeout(() => {
            if (autoplayed.current) return;
            enter({ countsAsInteraction: false });
        }, 350);
        return () => window.clearTimeout(t);
        // Only re-run when the rule changes; rate/enter identity intentionally omitted.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [spec, reduced]);

    useEffect(() => {
        const doEl = doRef.current;
        const dontEl = dontRef.current;
        const bars = [doBarRef.current, dontBarRef.current];
        clearBars();
        return () => {
            nextGeneration();
            clearTimeout(settleTimer.current);
            stopMsClocks();
            if (doEl) cancelPane(doEl);
            if (dontEl) cancelPane(dontEl);
            for (const bar of bars) bar?.getAnimations().forEach((animation) => animation.cancel());
        };
    }, [clearBars, nextGeneration]);

    const isPress = spec.trigger === "press";
    const isHover = spec.trigger === "hover";

    const controlLabel =
        spec.trigger === "toggle"
            ? engaged
                ? (spec.controlEngaged ?? spec.control ?? "Toggle")
                : (spec.control ?? "Toggle")
            : spec.tallyDontMs && plays > 0
              ? "Open again"
              : spec.trigger === "replay"
                ? (spec.control ?? "Play both")
                : (spec.control ?? "Run");

    // The tally slot is always there for a frequency lesson, so the first
    // click fills it in place instead of pushing the page down.
    const tallySeconds = spec.tallyDontMs ? ((plays * spec.tallyDontMs) / 1000).toFixed(1) : "0.0";
    const tally = spec.tallyDontMs
        ? {
              text: reduced
                  ? `×${plays} · would cost ${tallySeconds}s`
                  : `×${plays} · ${tallySeconds}s waited`,
              counting: plays > 0,
          }
        : null;

    const gestureHint =
        spec.trigger === "press"
            ? (spec.hint ?? "Press & hold either side — both react together")
            : spec.trigger === "hover"
              ? canHover
                  ? (spec.hint ?? "Hover the panes — both react together")
                  : spec.doRequiresHover
                    ? "Tap — only the don’t pane moves; the do pane is obeying this rule"
                    : "Tap the panes to preview the hover state"
              : null;

    const hints = [
        gestureHint,
        spec.hotkey
            ? `Or press ${spec.hotkey.toUpperCase()} — feel the don’t pane lag behind your keystroke`
            : null,
        // Per-rule hint for button-driven demos (gesture hints carry their own).
        // Reduced motion hides the speed control, so a hint that points at it
        // swaps for its reduced wording.
        spec.hint && !isGesture && !spec.hotkey
            ? reduced
                ? (spec.hintReduced ?? spec.hint)
                : spec.hint
            : null,
        reduced ? "Reduced motion — end states only; this page is honoring it" : null,
    ].filter((hint): hint is string => hint !== null);

    return (
        <div className="motion-showcase">
            <div
                onPointerDown={
                    isPress
                        ? () => {
                              tapLight();
                              enter();
                          }
                        : undefined
                }
                onPointerUp={isPress ? exit : undefined}
                onPointerCancel={isPress ? exit : undefined}
                onPointerEnter={isHover && canHover ? () => enter() : undefined}
                onPointerLeave={
                    isPress
                        ? () => {
                              if (engaged) exit();
                          }
                        : isHover
                          ? exit
                          : undefined
                }
                onClick={
                    isHover
                        ? () => {
                              if (canHover) return;
                              if (engaged) exit();
                              else enter();
                          }
                        : undefined
                }
                onKeyDown={
                    isPress
                        ? (e: KeyboardEvent) => {
                              if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                                  e.preventDefault();
                                  enter();
                              }
                          }
                        : undefined
                }
                onKeyUp={
                    isPress
                        ? (e: KeyboardEvent) => {
                              if (e.key === " " || e.key === "Enter") exit();
                          }
                        : undefined
                }
                onFocus={
                    isHover
                        ? (event) => {
                              if (event.currentTarget.matches(":focus-visible")) enter();
                          }
                        : undefined
                }
                onBlur={isHover || isPress ? exit : undefined}
                role={isGesture ? "button" : undefined}
                tabIndex={isGesture ? 0 : undefined}
                aria-label={
                    isGesture
                        ? isPress
                            ? "Press and hold to preview both variants"
                            : "Focus or hover to preview both variants"
                        : undefined
                }
                className={cn(
                    "grid grid-cols-2 gap-3",
                    // The global focus outline follows this radius.
                    isGesture && "cursor-pointer select-none rounded-field"
                )}
            >
                <ShowcasePane
                    variant="do"
                    pane={spec.do}
                    paneRef={doRef}
                    barRef={doBarRef}
                    msRef={doMsRef}
                />
                <ShowcasePane
                    variant="dont"
                    pane={spec.dont}
                    paneRef={dontRef}
                    barRef={dontBarRef}
                    msRef={dontMsRef}
                    tally={tally}
                />
            </div>

            {!isGesture ? (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <ControlButton onClick={spec.trigger === "toggle" && engaged ? exit : () => enter()} pressed={spec.trigger === "toggle" ? engaged : undefined}>
                        {spec.trigger === "toggle" ? null : (
                            <Play aria-hidden="true" className="size-3.5" />
                        )}
                        {controlLabel}
                    </ControlButton>

                    {showSpeed ? <SpeedControl rate={rate} onChange={setRate} /> : null}
                </div>
            ) : null}

            {hints.length > 0 ? (
                <div className={cn("flex flex-col gap-1 text-xs text-ink-muted", isGesture ? "mt-3" : "mt-2")}>
                    {hints.map((hint) => (
                        <p key={hint}>{hint}</p>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

function SpeedControl({ rate, onChange }: { rate: Rate; onChange: (rate: Rate) => void }) {
    return (
        // No overflow-hidden: it would clip the focus outline of the segments.
        <div
            role="group"
            aria-label="Playback speed"
            className={cn("ml-auto flex shrink-0 border border-line-strong", CONTROL_RADIUS)}
        >
            {RATES.map((r) => (
                <button
                    key={r}
                    type="button"
                    aria-pressed={rate === r}
                    onClick={() => onChange(r)}
                    className={cn(
                        // 44px on touch, where the guideline applies;
                        // 36px keeps the row dense for a mouse.
                        "relative inline-flex min-h-9 items-center justify-center px-3 text-xs font-medium tabular-nums transition-colors first:rounded-l-[11px] last:rounded-r-[11px] pointer-coarse:min-h-11 pointer-coarse:px-4",
                        // Segments abut, so the focused one must paint above
                        // its neighbours or the active fill covers its ring.
                        "focus-visible:z-10",
                        rate === r
                            ? "bg-inverse text-on-inverse"
                            : "text-ink-secondary hover:bg-fill hover:text-ink"
                    )}
                >
                    {r === 1 ? "1×" : r === 0.5 ? "½×" : "¼×"}
                </button>
            ))}
        </div>
    );
}

function ShowcasePane({
    variant,
    pane,
    paneRef,
    barRef,
    msRef,
    tally,
}: {
    variant: Variant;
    pane: PaneSpec;
    paneRef: React.RefObject<HTMLDivElement | null>;
    barRef: React.RefObject<HTMLDivElement | null>;
    msRef: React.RefObject<HTMLSpanElement | null>;
    tally?: { text: string; counting: boolean } | null;
}) {
    return (
        <div className="min-w-0">
            <PaneChrome
                variant={variant}
                caption={pane.caption}
                paneRef={paneRef}
                bar={
                    // A thin, quiet instrument: it measures the motion, it isn't
                    // one more thing on the page competing with it.
                    // A container, so the readout tag can drop out where the pane
                    // is too narrow for it (the caption states the same fact).
                    <div className="@container flex items-center gap-2">
                        <div className="h-1 min-w-6 flex-1 overflow-hidden rounded-full bg-fill-strong dark:bg-fill">
                            <div
                                ref={barRef}
                                className="h-full origin-left rounded-full bg-ink-faint"
                                style={{ transform: "scaleX(0)" }}
                            />
                        </div>
                        <span className="flex shrink-0 items-baseline gap-1.5 text-xs font-medium tabular-nums text-ink-muted">
                            <span ref={msRef} className="min-w-10 text-right" />
                            {pane.readoutTag ? (
                                <span className="hidden font-normal @[14rem]:inline">· {pane.readoutTag}</span>
                            ) : null}
                        </span>
                    </div>
                }
            >
                {pane.scene()}
            </PaneChrome>
            {tally ? (
                <p
                    className={cn(
                        "mt-1 min-h-4 truncate text-xs font-medium tabular-nums",
                        tally.counting ? "text-dont-ink" : "text-ink-muted"
                    )}
                >
                    {tally.text}
                </p>
            ) : null}
        </div>
    );
}

/* ── Grid preview ─────────────────────────────────────────────────── */

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

/** Pointer dwell before a grid preview replays: a sweep across the grid on
 *  the way to somewhere else passes over cards without setting them off. */
const REPLAY_DWELL_MS = 150;

export function PanePreview({ ruleId, variant }: { ruleId: string; variant: Variant }) {
    const spec = showcaseSpecs[ruleId];
    const ref = useRef<HTMLDivElement | null>(null);
    const exitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const dwellTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const replayRun = useRef(0);
    const nextReplay = useCallback(() => ++replayRun.current, []);
    const reduced = useReducedMotion();
    const canHover = useCanHover();
    const pane = spec ? spec[variant] : null;

    const playOnce = useCallback((fromKeyframes = false) => {
        const el = ref.current;
        if (!el || !pane) return;
        clearTimeout(exitTimer.current);
        playPane(el, pane.tracks, { reduced, fromKeyframes });
        if (pane.exitTracks) {
            exitTimer.current = setTimeout(
                () => {
                    if (ref.current) playPane(ref.current, pane.exitTracks!, { reduced });
                },
                reduced ? 600 : tracksDurationMs(pane.tracks) + 500
            );
        }
    }, [pane, reduced]);

    /** Replays from the first frame. A preview holding its end frame (or still
     *  moving) is taken back to that frame first, so the replay never cuts to
     *  an empty stage; one already at rest plays straight away. */
    const replay = useCallback(() => {
        const el = ref.current;
        if (!el || !pane) return;
        clearTimeout(exitTimer.current);
        const run = nextReplay();
        if (reduced || !paneIsLive(el)) {
            playOnce();
            return;
        }
        void finishPane(el, startTracks(pane, RESET_MS), { reduced }).then((reset) => {
            if (reset && run === replayRun.current) playOnce(true);
        });
    }, [pane, reduced, playOnce, nextReplay]);

    useEffect(() => {
        const el = ref.current;
        if (!el || !pane) return;
        const shouldObserve = !reduced && (canHover || spec?.touchAutoplay !== false);
        const unobserve = shouldObserve ? observePreview(el, playOnce) : undefined;
        return () => {
            unobserve?.();
            nextReplay();
            clearTimeout(exitTimer.current);
            clearTimeout(dwellTimer.current);
            cancelPane(el);
        };
    }, [pane, spec, reduced, canHover, playOnce, nextReplay]);

    if (!pane) return null;

    return (
        // No extra frame — scenes carry their own stage chrome; a second
        // border here reads as box-in-box on the rule cards.
        <div
            ref={ref}
            aria-hidden="true"
            onPointerEnter={
                canHover && !reduced
                    ? () => {
                          clearTimeout(dwellTimer.current);
                          dwellTimer.current = setTimeout(replay, REPLAY_DWELL_MS);
                      }
                    : undefined
            }
            onPointerLeave={canHover ? () => clearTimeout(dwellTimer.current) : undefined}
            className="motion-showcase cursor-pointer"
        >
            {pane.scene()}
            <p className="mt-2 px-0.5 font-mono text-xs leading-5 text-ink-muted">
                {pane.caption}
            </p>
        </div>
    );
}
