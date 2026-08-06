"use client";

import type { PointerEvent as ReactPointerEvent, ReactNode, RefObject } from "react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import { springLinear } from "@/lib/showcase-engine";
import { useHaptics } from "@/hooks/use-haptics";
import { MiniLine } from "@/components/features/rules/preview-primitives";
import { Hint, PaneChrome } from "@/components/features/rules/demos/showcase-chrome";
import { showcaseSpecs } from "@/components/features/rules/demos/showcase-specs";

/* ─────────────────────────────────────────────────────────
 * DRAG SHOWCASE STORYBOARD (motion-18 / 19 / 20)
 *
 *    rest   both panes show the same resting prototype
 *    drag   ONE pointer drives BOTH panes simultaneously —
 *           the do/don't difference is felt on the same gesture
 * release   each pane applies its own outcome rule
 * reduced   1:1 tracking keeps working (user-driven, WCAG-exempt);
 *           release transitions are stilled by the global
 *           .motion-showcase reduced-motion CSS, so cards snap home
 * ─────────────────────────────────────────────────────────
 * Edge cases carried over from the gesture-demo exploration:
 * - data-vaul-no-drag on the surface, or vaul drags the whole drawer.
 * - touch-action: pan-y so vertical scroll still works on mobile;
 *   never `none` (it would trap the page).
 * - setPointerCapture in pointerdown — motion-20's lesson, dogfooded.
 * - Velocity from the last ~5 move samples, in px/ms.
 * - State applied imperatively via refs inside rAF: pointermove never
 *   re-renders React, and never more than once a frame.
 */

const RELEASE_TRANSITION =
    "transform 220ms var(--ease-out-strong), opacity 220ms var(--ease-out-strong)";

const SUPPORTS_LINEAR =
    typeof CSS !== "undefined" &&
    CSS.supports("transition-timing-function", "linear(0, 1)");
const SPRING_SOFT = SUPPORTS_LINEAR ? springLinear(0.15) : "var(--ease-out-strong)";
const SPRING_SETTLE = SUPPORTS_LINEAR ? springLinear(0.2) : "var(--ease-out-strong)";

export function DragShowcase({ ruleId }: { ruleId: string }) {
    switch (ruleId) {
        case "motion-18":
            return <VelocityDismiss />;
        case "motion-19":
            return <DampedBoundary />;
        case "motion-20":
            return <PointerCaptureSlider />;
        default:
            return null;
    }
}

/* ── shared mirrored-drag plumbing ──────────────────────────────────── */

type DragHandlers = {
    onStart: () => void;
    onFrame: (dx: number, point: { clientX: number; clientY: number }) => void;
    onRelease: (dx: number, velocity: number) => void;
};

function useMirroredDrag(handlers: DragHandlers) {
    const latest = useRef(handlers);
    useEffect(() => {
        latest.current = handlers;
    });

    const dragging = useRef(false);
    const startX = useRef(0);
    const lastDx = useRef(0);
    const lastPoint = useRef({ clientX: 0, clientY: 0 });
    const samples = useRef<{ x: number; t: number }[]>([]);
    const frame = useRef<number | null>(null);

    useEffect(
        () => () => {
            if (frame.current !== null) cancelAnimationFrame(frame.current);
        },
        []
    );

    const release = () => {
        if (!dragging.current) return;
        dragging.current = false;
        const s = samples.current;
        const first = s[0];
        const last = s[s.length - 1];
        const dt = last && first ? last.t - first.t : 0;
        const velocity = dt > 0 ? (last.x - first.x) / dt : 0;
        latest.current.onRelease(lastDx.current, velocity);
    };

    return {
        onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => {
            // Pointer capture is motion-20's entire lesson — the surface
            // dogfoods it so moves keep arriving outside the frame.
            e.currentTarget.setPointerCapture(e.pointerId);
            dragging.current = true;
            startX.current = e.clientX;
            lastDx.current = 0;
            samples.current = [{ x: 0, t: e.timeStamp }];
            latest.current.onStart();
        },
        onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => {
            if (!dragging.current) return;
            const dx = e.clientX - startX.current;
            lastDx.current = dx;
            lastPoint.current = { clientX: e.clientX, clientY: e.clientY };
            samples.current = [...samples.current.slice(-4), { x: dx, t: e.timeStamp }];
            if (frame.current === null) {
                frame.current = requestAnimationFrame(() => {
                    frame.current = null;
                    if (dragging.current) latest.current.onFrame(lastDx.current, lastPoint.current);
                });
            }
        },
        onPointerUp: release,
        onPointerCancel: release,
    };
}

function DragSurface({
    hint,
    surfaceRef,
    readoutRef,
    children,
    ...pointerProps
}: {
    hint: string;
    surfaceRef?: RefObject<HTMLDivElement | null>;
    /** Live gesture readout (velocity / damping / capture) — written
     *  imperatively from onFrame, never through React state. */
    readoutRef?: RefObject<HTMLSpanElement | null>;
    children: ReactNode;
} & ReturnType<typeof useMirroredDrag>) {
    return (
        <div className="motion-showcase">
            <div
                ref={surfaceRef}
                {...pointerProps}
                data-vaul-no-drag
                className="grid cursor-grab select-none grid-cols-2 gap-3 active:cursor-grabbing"
                style={{ touchAction: "pan-y" }}
            >
                {children}
            </div>
            <div className="mt-3 flex min-h-[28px] flex-wrap items-center gap-x-3 gap-y-1">
                <Hint>{hint}</Hint>
                {readoutRef ? (
                    <span
                        ref={readoutRef}
                        aria-hidden="true"
                        className="font-mono text-xs tabular-nums text-blue-700 dark:text-blue-300"
                    />
                ) : null}
            </div>
        </div>
    );
}

function setCardX(
    el: HTMLElement | null,
    x: number,
    animate: boolean,
    releaseStyle?: { durationMs: number; easing: string }
) {
    if (!el) return;
    el.style.transition = animate
        ? releaseStyle
            ? `transform ${releaseStyle.durationMs}ms ${releaseStyle.easing}, opacity ${releaseStyle.durationMs}ms ${releaseStyle.easing}`
            : RELEASE_TRANSITION
        : "none";
    el.style.transform = `translateX(${x}px)`;
}

/* ── motion-18 · Gesture Dismissal Uses Velocity ────────────────────── */

function DragGrip() {
    return (
        <div
            aria-hidden="true"
            className="absolute right-1 top-1/2 grid -translate-y-1/2 grid-cols-2 gap-0.5"
        >
            {Array.from({ length: 6 }).map((_, i) => (
                <span
                    key={i}
                    className="size-0.5 rounded-full bg-neutral-300 dark:bg-neutral-600"
                />
            ))}
        </div>
    );
}

function DragCard({
    cardRef,
    railRef,
    size = "md",
    showThreshold = false,
    showWall = false,
}: {
    cardRef: RefObject<HTMLDivElement | null>;
    railRef?: RefObject<HTMLDivElement | null>;
    size?: "md" | "sm";
    /** Visual 60% dismiss mark for the velocity demo. */
    showThreshold?: boolean;
    /** Solid right-edge cap — the "wall" the damping demo drags against. */
    showWall?: boolean;
}) {
    return (
        <div
            ref={railRef}
            className="relative flex h-36 items-center overflow-hidden rounded-lg border border-dashed border-neutral-300 bg-neutral-50/80 px-2 dark:border-neutral-700 dark:bg-neutral-900/50"
        >
            {showThreshold ? (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-2 left-[60%] w-px border-l border-dashed border-rose-400/70"
                >
                    {/* Reader-facing annotation, not depicted UI — keep it legible. */}
                    <span className="absolute -top-1.5 left-1 text-xs font-medium tabular-nums text-rose-500 dark:text-rose-300">
                        60%
                    </span>
                </div>
            ) : null}
            {showWall ? (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-1.5 right-1 w-0.5 rounded-full bg-neutral-400/80 dark:bg-neutral-500/80"
                />
            ) : null}
            <div
                ref={cardRef}
                className={cn(
                    "relative flex flex-col justify-center rounded-lg border border-blue-500 bg-blue-500/10 p-2 shadow-sm dark:border-blue-400 dark:bg-blue-400/10",
                    size === "md" ? "h-14 w-28" : "h-10 w-16"
                )}
            >
                <span className="mb-1 text-[10px] font-semibold tracking-tight text-blue-700 dark:text-blue-300">
                    Message
                </span>
                <MiniLine widthClass="w-3/4" className="mb-1 h-1 !bg-blue-500/40" />
                <MiniLine widthClass="w-1/2" className="h-1 !bg-blue-500/40" />
                <DragGrip />
            </div>
        </div>
    );
}

function VelocityDismiss() {
    const spec = showcaseSpecs["motion-18"];
    const { tapLight, tapSuccess } = useHaptics();
    const doCard = useRef<HTMLDivElement | null>(null);
    const dontCard = useRef<HTMLDivElement | null>(null);
    const rail = useRef<HTMLDivElement | null>(null);
    const readout = useRef<HTMLSpanElement | null>(null);
    const travel = useRef(120);
    const currentX = useRef(0);
    const ticked = useRef(false);
    const prevSample = useRef({ x: 0, t: 0 });
    const liveVelocity = useRef(0);
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        const pending = timers.current;
        return () => pending.forEach(clearTimeout);
    }, []);

    const writeReadout = (text: string) => {
        if (readout.current) readout.current.textContent = text;
    };

    const dismiss = (el: HTMLElement | null, velocity: number) => {
        if (!el) return;
        const remaining = Math.max(8, travel.current + 48 - currentX.current);
        const durationMs = Math.min(
            260,
            Math.max(120, remaining / Math.max(velocity, 0.8))
        );
        el.style.transition = `transform ${durationMs}ms var(--ease-out-strong), opacity ${durationMs}ms var(--ease-out-strong)`;
        el.style.transform = `translateX(${travel.current + 48}px)`;
        el.style.opacity = "0";
        timers.current.push(
            setTimeout(() => {
                el.style.transition = "none";
                el.style.transform = "translateX(0)";
                void el.offsetHeight;
                el.style.transition = "opacity 220ms var(--ease-out-strong)";
                el.style.opacity = "1";
            }, 700)
        );
    };

    const surface = useMirroredDrag({
        onStart: () => {
            ticked.current = false;
            currentX.current = 0;
            liveVelocity.current = 0;
            prevSample.current = { x: 0, t: performance.now() };
            const railEl = rail.current;
            const cardEl = doCard.current;
            if (railEl && cardEl) {
                travel.current = railEl.clientWidth - cardEl.offsetWidth - 12;
            }
        },
        onFrame: (dx) => {
            const x = Math.min(Math.max(dx, 0), travel.current);
            currentX.current = x;
            setCardX(doCard.current, x, false);
            setCardX(dontCard.current, x, false);
            // Live physics readout — smoothed frame-to-frame velocity.
            const now = performance.now();
            const dt = now - prevSample.current.t;
            if (dt > 0) {
                const instant = (dx - prevSample.current.x) / dt;
                liveVelocity.current = liveVelocity.current * 0.7 + instant * 0.3;
            }
            prevSample.current = { x: dx, t: now };
            writeReadout(
                `v ${liveVelocity.current.toFixed(2)} px/ms · x ${Math.round(
                    (x / Math.max(1, travel.current)) * 100
                )}%`
            );
            if (!ticked.current && x > travel.current * 0.6) {
                ticked.current = true;
                tapLight();
            }
        },
        onRelease: (dx, velocity) => {
            const x = Math.min(Math.max(dx, 0), travel.current);
            currentX.current = x;
            const farEnough = x > travel.current * 0.6;
            const flick = velocity > 0.5;
            if (flick || farEnough) {
                dismiss(doCard.current, Math.abs(velocity));
                tapSuccess();
            } else {
                setCardX(doCard.current, 0, true, {
                    durationMs: 350,
                    easing: SPRING_SOFT,
                });
            }
            if (farEnough) dismiss(dontCard.current, Math.abs(velocity));
            else setCardX(dontCard.current, 0, true);
            // Freeze the release verdict as evidence, then clear.
            writeReadout(
                `v ${velocity.toFixed(2)} px/ms · x ${Math.round(
                    (x / Math.max(1, travel.current)) * 100
                )}% — ${
                    flick && !farEnough
                        ? "dismissed by flick"
                        : farEnough
                          ? "dismissed by distance"
                          : "no flick, not far — snapped back"
                }`
            );
            timers.current.push(setTimeout(() => writeReadout(""), 2500));
        },
    });

    return (
        <DragSurface
            {...surface}
            readoutRef={readout}
            hint="Flick short and fast: the left card reads intent, the right demands mileage"
        >
            <PaneChrome variant="do" caption={spec.do.caption}>
                <DragCard cardRef={doCard} railRef={rail} showThreshold />
            </PaneChrome>
            <PaneChrome variant="dont" caption={spec.dont.caption}>
                <DragCard cardRef={dontCard} showThreshold />
            </PaneChrome>
        </DragSurface>
    );
}

/* ── motion-19 · Damp Drag Boundaries ───────────────────────────────── */

function DampedBoundary() {
    const spec = showcaseSpecs["motion-19"];
    const doCard = useRef<HTMLDivElement | null>(null);
    const dontCard = useRef<HTMLDivElement | null>(null);
    const rail = useRef<HTMLDivElement | null>(null);
    const readout = useRef<HTMLSpanElement | null>(null);
    const max = useRef(120);
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        const pending = timers.current;
        return () => pending.forEach(clearTimeout);
    }, []);

    const writeReadout = (text: string) => {
        if (readout.current) readout.current.textContent = text;
    };

    const surface = useMirroredDrag({
        onStart: () => {
            const railEl = rail.current;
            const cardEl = doCard.current;
            if (railEl && cardEl) {
                max.current = railEl.clientWidth - cardEl.offsetWidth - 12;
            }
        },
        onFrame: (dx) => {
            const limit = max.current;
            const damped =
                dx < 0 ? dx / 3 : dx <= limit ? dx : limit + (dx - limit) / 3;
            const clamped = Math.min(Math.max(dx, 0), limit);
            setCardX(doCard.current, damped, false);
            setCardX(dontCard.current, clamped, false);
            // The damping math, made visible while you're past the wall.
            if (dx > limit) {
                const over = Math.round(dx - limit);
                writeReadout(`pointer +${over}px past the wall → card +${Math.round(over / 3)}px`);
            } else if (dx < 0) {
                writeReadout(`pointer ${Math.round(dx)}px → card ${Math.round(dx / 3)}px`);
            } else {
                writeReadout("");
            }
        },
        onRelease: () => {
            setCardX(doCard.current, 0, true, {
                durationMs: 450,
                easing: SPRING_SETTLE,
            });
            setCardX(dontCard.current, 0, true);
            timers.current.push(setTimeout(() => writeReadout(""), 2000));
        },
    });

    return (
        <DragSurface
            {...surface}
            readoutRef={readout}
            hint="Drag past the edge and let go — one card is physical, one is a clamp"
        >
            <PaneChrome variant="do" caption={spec.do.caption}>
                <DragCard cardRef={doCard} railRef={rail} showWall />
            </PaneChrome>
            <PaneChrome variant="dont" caption={spec.dont.caption}>
                <DragCard cardRef={dontCard} showWall />
            </PaneChrome>
        </DragSurface>
    );
}

/* ── motion-20 · Capture Pointer During Drag ────────────────────────── */

function SliderPane({
    knobRef,
    trackRef,
}: {
    knobRef: RefObject<HTMLDivElement | null>;
    trackRef?: RefObject<HTMLDivElement | null>;
}) {
    return (
        <div className="flex h-36 items-center px-2">
            <div
                ref={trackRef}
                className="relative h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800"
            >
                <div
                    ref={knobRef}
                    className="absolute size-4 rounded-full border border-blue-600 bg-blue-600 shadow-sm"
                    style={{ top: "calc(50% - 8px)", left: 0 }}
                />
            </div>
        </div>
    );
}

function PointerCaptureSlider() {
    const spec = showcaseSpecs["motion-20"];
    const doKnob = useRef<HTMLDivElement | null>(null);
    const dontKnob = useRef<HTMLDivElement | null>(null);
    const track = useRef<HTMLDivElement | null>(null);
    const surfaceEl = useRef<HTMLDivElement | null>(null);
    const readout = useRef<HTMLSpanElement | null>(null);
    const max = useRef(120);
    const bounds = useRef<DOMRect | null>(null);
    const base = useRef({ do: 0, dont: 0 });
    const current = useRef({ do: 0, dont: 0 });

    const writeReadout = (text: string) => {
        if (readout.current) readout.current.textContent = text;
    };

    const surface = useMirroredDrag({
        onStart: () => {
            const trackEl = track.current;
            const knobEl = doKnob.current;
            if (trackEl && knobEl) {
                max.current = trackEl.clientWidth - knobEl.offsetWidth;
            }
            bounds.current = surfaceEl.current?.getBoundingClientRect() ?? null;
            base.current = { ...current.current };
        },
        onFrame: (dx, point) => {
            const clamp = (x: number) => Math.min(Math.max(x, 0), max.current);
            // Do: pointer capture means every move arrives, even off-surface.
            current.current.do = clamp(base.current.do + dx);
            setCardX(doKnob.current, current.current.do, false);
            // Don't: without capture, moves outside the surface never fire —
            // emulate it by freezing the knob while the pointer is outside.
            const r = bounds.current;
            const inside =
                !!r &&
                point.clientX >= r.left &&
                point.clientX <= r.right &&
                point.clientY >= r.top &&
                point.clientY <= r.bottom;
            if (inside) {
                current.current.dont = clamp(base.current.dont + dx);
                setCardX(dontKnob.current, current.current.dont, false);
                writeReadout("pointer inside — both knobs tracking");
            } else {
                writeReadout("pointer outside — left knob still tracking, right knob lost");
            }
        },
        onRelease: () => {
            // Sliders keep their value; the next drag continues from here.
            writeReadout("");
        },
    });

    return (
        <DragSurface
            {...surface}
            surfaceRef={surfaceEl}
            readoutRef={readout}
            hint="Drag a knob, then swing your pointer outside the panes mid-drag"
        >
            <PaneChrome variant="do" caption={spec.do.caption}>
                <SliderPane knobRef={doKnob} trackRef={track} />
            </PaneChrome>
            <PaneChrome variant="dont" caption={spec.dont.caption}>
                <SliderPane knobRef={dontKnob} />
            </PaneChrome>
        </DragSurface>
    );
}
