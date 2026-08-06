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
    showcaseSpecs,
    type PaneSpec,
    type ShowcaseSpec,
} from "@/components/features/rules/demos/showcase-specs";
import { DragShowcase } from "@/components/features/rules/demos/drag-showcases";
import { InterruptShowcase } from "@/components/features/rules/demos/interrupt-showcase";
import { LoadShowcase } from "@/components/features/rules/demos/load-showcase";
import { TooltipToolbarShowcase } from "@/components/features/rules/demos/tooltip-showcase";
import {
    ControlButton,
    Hint,
    PaneChrome,
} from "@/components/features/rules/demos/showcase-chrome";
import { type PreviewSize, type Variant } from "@/components/features/rules/preview-primitives";

/* ─────────────────────────────────────────────────────────
 * SHOWCASE STORYBOARD
 *   rest → trigger → play (easing-aware bars + ms readouts)
 *   settle after hold · rate: 1× / ½× / ¼× · reduced → duration 0
 * ───────────────────────────────────────────────────────── */

const RATES = [1, 0.5, 0.25] as const;
type Rate = (typeof RATES)[number];
/** Hold at end state so the lesson can be studied before settle-back. */
const SETTLE_HOLD_MS = 1400;

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

    const nominalMs = (pane: PaneSpec) => Math.round(tracksDurationMs(pane.tracks));

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
        writeMs(doMsRef.current, nominalMs(spec.do));
        writeMs(dontMsRef.current, nominalMs(spec.dont));
        stopMsClocks();
    }, [spec]);

    const runBar = useCallback(
        (
            bar: HTMLDivElement | null,
            msLabel: HTMLSpanElement | null,
            pane: PaneSpec,
            currentRate: number,
            isReduced: boolean,
            rafSlot: "do" | "dont"
        ): Animation | null => {
            if (!bar) return null;
            bar.getAnimations().forEach((a) => a.cancel());
            const nominal = nominalMs(pane);
            if (isReduced) {
                writeMs(msLabel, nominal);
                return null;
            }
            const primary = pane.tracks.reduce((a, b) =>
                b.durationMs > a.durationMs ? b : a
            );
            const anim = bar.animate(
                [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
                {
                    duration: Math.max(1, tracksDurationMs(pane.tracks)),
                    easing: primary.easing ?? EASE.out,
                    fill: "forwards",
                }
            );
            anim.playbackRate = currentRate;

            // Per-pane rAF so do/dont clocks don't stomp each other.
            const slot = rafSlot === "do" ? doMsRaf : dontMsRaf;
            const tick = () => {
                const t = anim.currentTime;
                if (typeof t === "number") {
                    writeMs(msLabel, Math.min(nominal, Math.round(t)));
                }
                if (anim.playState === "finished" || anim.playState === "idle") {
                    writeMs(msLabel, nominal);
                    slot.current = null;
                    return;
                }
                slot.current = requestAnimationFrame(tick);
            };
            slot.current = requestAnimationFrame(tick);
            return anim;
        },
        []
    );

    const enter = useCallback((options?: { countsAsInteraction?: boolean }) => {
        const counts = options?.countsAsInteraction !== false;
        clearTimeout(settleTimer.current);
        stopMsClocks();

        if (doRef.current && !skipDo) {
            playPane(doRef.current, spec.do.tracks, { rate, reduced });
            runBar(doBarRef.current, doMsRef.current, spec.do, rate, reduced, "do");
        }
        if (dontRef.current) {
            playPane(dontRef.current, spec.dont.tracks, { rate, reduced });
            runBar(dontBarRef.current, dontMsRef.current, spec.dont, rate, reduced, "dont");
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

        const hold = (tracksDurationMs(spec.do.tracks) + SETTLE_HOLD_MS) / rate;
        settleTimer.current = setTimeout(() => {
            const settle = (el: HTMLDivElement | null, pane: PaneSpec, skip: boolean) => {
                if (!el || skip) return;
                playPane(el, pane.exitTracks ?? reverseTracks(pane.tracks), {
                    rate,
                    reduced,
                });
            };
            settle(doRef.current, spec.do, skipDo);
            settle(dontRef.current, spec.dont, false);
            clearBars();
            setEngaged(false);
        }, hold);
    }, [spec, rate, reduced, runBar, skipDo, clearBars]);

    const exit = useCallback(() => {
        clearTimeout(settleTimer.current);
        if (doRef.current && spec.do.exitTracks && !skipDo) {
            playPane(doRef.current, spec.do.exitTracks, { rate, reduced });
        }
        if (dontRef.current && spec.dont.exitTracks) {
            playPane(dontRef.current, spec.dont.exitTracks, { rate, reduced });
        }
        setEngaged(false);
    }, [spec, rate, reduced, skipDo]);

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
        // Rest labels show nominal duration.
        writeMs(doMsRef.current, nominalMs(spec.do));
        writeMs(dontMsRef.current, nominalMs(spec.dont));
    }, [spec]);

    // Autoplay once when a play-style demo mounts — rest shells aren't empty for long.
    useEffect(() => {
        if (reduced) return;
        if (spec.trigger !== "replay" && spec.trigger !== "action") return;
        if (autoplayed.current) return;
        autoplayed.current = true;
        const t = window.setTimeout(() => enter({ countsAsInteraction: false }), 350);
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
        spec.tallyDontMs && plays > 0
            ? "Open again"
            : spec.trigger === "replay"
              ? (spec.control ?? "Play both")
              : (spec.control ?? "Run");

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
                onFocus={isHover ? () => enter() : undefined}
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
                    isGesture &&
                        "cursor-pointer select-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:focus-visible:ring-neutral-500"
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
                    tally={
                        spec.tallyDontMs && plays > 0
                            ? `opened ×${plays} — ${((plays * spec.tallyDontMs) / 1000).toFixed(1)}s spent waiting`
                            : null
                    }
                />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
                {spec.trigger === "press" ? (
                    <Hint>{spec.hint ?? "Press & hold either side — both react together"}</Hint>
                ) : spec.trigger === "hover" ? (
                    <Hint>
                        {canHover
                            ? (spec.hint ?? "Hover the panes — both react together")
                            : spec.doRequiresHover
                              ? "Tap — only the don't pane moves; the do pane is obeying this rule"
                              : "Tap the panes to preview the hover state"}
                    </Hint>
                ) : spec.trigger === "toggle" ? (
                    <ControlButton onClick={engaged ? exit : () => enter()}>
                        {spec.control ?? "Toggle"}
                    </ControlButton>
                ) : (
                    <ControlButton onClick={() => enter()}>
                        <Play aria-hidden="true" className="size-3.5" />
                        {controlLabel}
                    </ControlButton>
                )}

                {spec.hotkey ? (
                    <Hint>
                        Or press {spec.hotkey.toUpperCase()} — feel the don&apos;t pane lag
                        behind your keystroke
                    </Hint>
                ) : null}

                {/* Per-rule hint for button-driven demos (gesture hints render above). */}
                {spec.hint && !isGesture && !spec.hotkey ? <Hint>{spec.hint}</Hint> : null}

                {/* Speed is for timed playthroughs — press/hover are gesture-driven. */}
                {!isGesture ? (
                    <div
                        role="group"
                        aria-label="Playback speed"
                        // No overflow-hidden: it would clip the segments'
                        // touch-target overhang. Segments round their own ends.
                        className="flex rounded-md border border-neutral-300 dark:border-neutral-700"
                    >
                        {RATES.map((r) => (
                            <button
                                key={r}
                                type="button"
                                aria-pressed={rate === r}
                                onClick={() => setRate(r)}
                                className={cn(
                                    // 36px visual, 44px touch: the ::after overhang
                                    // grows the hit area without bloating the row.
                                    "relative inline-flex min-h-9 items-center justify-center px-3 text-xs font-medium tabular-nums transition-colors after:absolute after:inset-x-0 after:-inset-y-1 first:rounded-l-[5px] last:rounded-r-[5px]",
                                    rate === r
                                        ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                                        : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                )}
                            >
                                {r === 1 ? "1×" : r === 0.5 ? "½×" : "¼×"}
                            </button>
                        ))}
                    </div>
                ) : null}

                {reduced ? (
                    <Hint>Reduced motion — end states only; this page is honoring it</Hint>
                ) : null}
            </div>
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
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                            <div
                                ref={barRef}
                                className="h-full origin-left rounded-full bg-neutral-900 dark:bg-neutral-100"
                                style={{ transform: "scaleX(0)" }}
                            />
                        </div>
                        <span
                            ref={msRef}
                            className="w-12 shrink-0 text-right text-xs font-medium tabular-nums text-neutral-500 dark:text-neutral-400"
                        />
                    </div>
                }
            >
                {pane.scene("lg")}
            </PaneChrome>
            {tally ? (
                <p className="mt-1 text-xs font-medium tabular-nums text-rose-600 dark:text-rose-300">
                    {tally}
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
            <p className="mt-2 px-0.5 font-mono text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                {pane.caption}
            </p>
        </div>
    );
}
