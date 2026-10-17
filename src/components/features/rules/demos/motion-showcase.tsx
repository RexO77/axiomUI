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
    playPane,
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
import { type PreviewSize, type Variant } from "@/components/features/rules/preview-primitives";

/* ─────────────────────────────────────────────────────────
 * SHOWCASE STORYBOARD
 *   rest → trigger → play (easing-aware bars + ms readouts)
 *   settle after hold · rate: 1× / ½× / ¼× · reduced → duration 0
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

const reverseTracks = (tracks: Track[]): Track[] =>
    tracks.map((track) => ({
        target: track.target,
        keyframes: [...track.keyframes].reverse().map((frame) => {
            const next: Keyframe = { ...frame };
            delete next.offset;
            return next;
        }),
        durationMs: DUR.fast,
        easing: EASE.inOut,
    }));

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

    const clearBars = useCallback(() => {
        doBarRef.current?.getAnimations().forEach((a) => a.cancel());
        dontBarRef.current?.getAnimations().forEach((a) => a.cancel());
        if (doBarRef.current) doBarRef.current.style.transform = "scaleX(0)";
        if (dontBarRef.current) dontBarRef.current.style.transform = "scaleX(0)";
        writeMs(doMsRef.current, paneReadout(spec.do).ms);
        writeMs(dontMsRef.current, paneReadout(spec.dont).ms);
        stopMsClocks();
    }, [spec]);

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

        if (doRef.current && !skipDo) {
            const r = paneRate(spec.do, playbackRate);
            playPane(doRef.current, spec.do.tracks, { rate: r, reduced });
            runBar(doBarRef.current, doMsRef.current, paneReadout(spec.do), r, reduced, "do");
        }
        if (dontRef.current) {
            const r = paneRate(spec.dont, playbackRate);
            playPane(dontRef.current, spec.dont.tracks, { rate: r, reduced });
            runBar(dontBarRef.current, dontMsRef.current, paneReadout(spec.dont), r, reduced, "dont");
        }
        setEngaged(true);

        // The tally is evidence of what the user cost themselves — the mount
        // autoplay is not a user action, so it must not count.
        if (spec.tallyDontMs && counts) {
            setPlays((p) => p + 1);
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
            const settle = (el: HTMLDivElement | null, pane: PaneSpec, skip: boolean) => {
                if (!el || skip) return;
                playPane(el, pane.exitTracks ?? reverseTracks(pane.tracks), {
                    rate: paneRate(pane, playbackRate),
                    reduced,
                });
            };
            settle(doRef.current, spec.do, skipDo);
            settle(dontRef.current, spec.dont, false);
            clearBars();
            setEngaged(false);
        }, hold);
    }, [spec, playbackRate, holdRate, reduced, runBar, skipDo, clearBars]);

    const exit = useCallback(() => {
        clearTimeout(settleTimer.current);
        stopMsClocks();
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
            playPane(el, pane.exitTracks, { rate: r, reduced });
            // The readout follows the exit, so a 160ms dismiss reads 160ms.
            runBar(bar, msLabel, paneReadout(pane, "exit"), r, reduced, slot);
        };
        leave(doRef.current, doBarRef.current, doMsRef.current, spec.do, "do", skipDo);
        leave(dontRef.current, dontBarRef.current, dontMsRef.current, spec.dont, "dont", false);
        setEngaged(false);
    }, [spec, playbackRate, reduced, runBar, skipDo]);

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

    const [prevSpec, setPrevSpec] = useState(spec);
    if (prevSpec !== spec) {
        setPrevSpec(spec);
        setEngaged(false);
        setPlays(0);
        autoplayed.current = false;
    }

    useEffect(() => {
        // Rest labels show what the next play will count to.
        writeMs(doMsRef.current, paneReadout(spec.do).ms);
        writeMs(dontMsRef.current, paneReadout(spec.dont).ms);
    }, [spec]);

    // Autoplay once when a play-style demo mounts — rest shells aren't empty for long.
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
        return () => {
            clearTimeout(settleTimer.current);
            stopMsClocks();
            if (doEl) cancelPane(doEl);
            if (dontEl) cancelPane(dontEl);
        };
    }, [spec]);

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

    const tallySeconds = spec.tallyDontMs ? ((plays * spec.tallyDontMs) / 1000).toFixed(1) : "0";
    const tally =
        spec.tallyDontMs && plays > 0
            ? reduced
                ? `opened ×${plays} — would cost ${tallySeconds}s with motion on`
                : `opened ×${plays} — ${tallySeconds}s spent waiting`
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
                onPointerEnter={isHover ? () => enter() : undefined}
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
                onBlur={isHover ? exit : undefined}
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
    tally?: string | null;
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
                {pane.scene("lg")}
            </PaneChrome>
            {tally ? (
                <p className="mt-1 text-xs font-medium tabular-nums text-dont-ink">{tally}</p>
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
        if (!canHover && spec?.touchAutoplay === false) return;
        const unobserve = observePreview(el, playOnce);
        return () => {
            unobserve();
            clearTimeout(exitTimer.current);
        };
    }, [pane, spec, reduced, canHover, playOnce]);

    if (!pane) return null;

    return (
        // No extra frame — lg scenes carry their own stage chrome; a second
        // border here reads as box-in-box on the rule cards.
        <div
            ref={ref}
            aria-hidden="true"
            onPointerEnter={canHover ? playOnce : undefined}
            className="motion-showcase cursor-pointer"
        >
            {pane.scene(size)}
            <p className="mt-2 px-0.5 font-mono text-xs leading-5 text-ink-muted">
                {pane.caption}
            </p>
        </div>
    );
}
