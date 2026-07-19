"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Play } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCanHover, useReducedMotion } from "@/lib/media";
import { cancelPane, playPane, tracksDurationMs, EASE } from "@/lib/showcase-engine";
import { showcaseSpecs, type PaneSpec, type ShowcaseSpec } from "@/components/features/rules/demos/showcase-specs";
import { DragShowcase } from "@/components/features/rules/demos/drag-showcases";
import { ControlButton, Hint, PaneChrome } from "@/components/features/rules/demos/showcase-chrome";
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

export function MotionShowcase({ ruleId }: { ruleId: string }) {
    const spec = showcaseSpecs[ruleId];
    if (!spec) return null;
    // Drag rules render a real gesture prototype instead of the track player.
    if (spec.trigger === "drag") return <DragShowcase ruleId={ruleId} />;
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
    // motion-16's do pane obeys its own rule: no hover motion on touch.
    const skipDo = Boolean(spec.doRequiresHover) && !canHover;

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
        if (doRef.current && !skipDo) {
            playPane(doRef.current, spec.do.tracks, { rate, reduced });
            runBar(doBarRef.current, spec.do, rate, reduced);
        }
        if (dontRef.current) {
            playPane(dontRef.current, spec.dont.tracks, { rate, reduced });
            runBar(dontBarRef.current, spec.dont, rate, reduced);
        }
        setEngaged(true);
    }, [spec, rate, reduced, runBar, skipDo]);

    const exit = useCallback(() => {
        if (doRef.current && spec.do.exitTracks && !skipDo) {
            playPane(doRef.current, spec.do.exitTracks, { rate, reduced });
        }
        if (dontRef.current && spec.dont.exitTracks) {
            playPane(dontRef.current, spec.dont.exitTracks, { rate, reduced });
        }
        setEngaged(false);
    }, [spec, rate, reduced, skipDo]);

    // Reset the toggle when the rule changes (drawer navigates without
    // unmounting) — render-time state adjustment, not an effect.
    const [prevSpec, setPrevSpec] = useState(spec);
    if (prevSpec !== spec) {
        setPrevSpec(spec);
        setEngaged(false);
    }

    // Cancel any engine animations on the outgoing panes when the spec changes.
    useEffect(() => {
        const doEl = doRef.current;
        const dontEl = dontRef.current;
        return () => {
            if (doEl) cancelPane(doEl);
            if (dontEl) cancelPane(dontEl);
        };
    }, [spec]);

    const isPress = spec.trigger === "press";
    const isHover = spec.trigger === "hover";

    return (
        <div className="motion-showcase">
            <div
                onPointerDown={isPress ? enter : undefined}
                onPointerUp={isPress ? exit : undefined}
                onPointerCancel={isPress ? exit : undefined}
                onPointerEnter={isHover ? enter : undefined}
                onPointerLeave={
                    isPress
                        ? () => {
                              if (engaged) exit();
                          }
                        : isHover
                          ? exit
                          : undefined
                }
                // Tap fallback for hover demos on touch devices.
                onClick={
                    isHover
                        ? () => {
                              if (canHover) return;
                              if (engaged) exit();
                              else enter();
                          }
                        : undefined
                }
                // Keyboard equivalents: hold Space/Enter for press demos;
                // focus previews the hover state for hover demos.
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
                onFocus={isHover ? enter : undefined}
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
                <ShowcasePane variant="do" pane={spec.do} paneRef={doRef} barRef={doBarRef} />
                <ShowcasePane variant="dont" pane={spec.dont} paneRef={dontRef} barRef={dontBarRef} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
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
    return (
        <PaneChrome
            variant={variant}
            caption={pane.caption}
            paneRef={paneRef}
            bar={
                <div
                    ref={barRef}
                    className="h-full origin-left bg-neutral-900 dark:bg-neutral-100"
                    style={{ transform: "scaleX(0)" }}
                />
            }
        >
            {pane.scene("lg")}
        </PaneChrome>
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
            className="motion-showcase cursor-pointer rounded-lg border border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-950"
        >
            {pane.scene(size)}
            <p className="mt-1.5 text-[10px] leading-4 text-neutral-600 dark:text-neutral-300">{pane.caption}</p>
        </div>
    );
}
