"use client";

import type { ComponentProps, PointerEvent as ReactPointerEvent, ReactNode, RefObject } from "react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import { springLinear } from "@/lib/showcase-engine";
import { useHaptics } from "@/hooks/use-haptics";
import { MiniLine } from "@/components/features/rules/preview-primitives";
import { PaneChrome, ShowcaseControls } from "@/components/features/rules/demos/showcase-chrome";
import { showcaseSpecs } from "@/components/features/rules/demos/showcase-specs";

/** `setTimeout` that drops its own id from `bucket` once it fires, so a long
 *  session of drags doesn't accumulate dead ids. The unmount effect in each
 *  component still clears whatever is genuinely pending. */
function deferOn(
    bucket: RefObject<ReturnType<typeof setTimeout>[]>,
    fn: () => void,
    ms: number
) {
    const id = setTimeout(() => {
        const at = bucket.current.indexOf(id);
        if (at !== -1) bucket.current.splice(at, 1);
        fn();
    }, ms);
    bucket.current.push(id);
}

/* ─────────────────────────────────────────────────────────
 * DRAG SHOWCASE STORYBOARD (motion-18 / 19 / 20 / 23)
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
        case "motion-23":
            return <SwipeCost />;
        default:
            return null;
    }
}

/* ── shared mirrored-drag plumbing ──────────────────────────────────── */

type DragHandlers = {
    onStart: () => void;
    onFrame: (dx: number, point: { clientX: number; clientY: number }) => void;
    onRelease: (dx: number, velocity: number) => void;
    onCancel?: () => void;
};

function useMirroredDrag(handlers: DragHandlers) {
    const latest = useRef(handlers);
    useEffect(() => {
        latest.current = handlers;
    });

    const pointer = useRef<number | null>(null);
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

    const finish = (e: ReactPointerEvent<HTMLDivElement>, cancelled: boolean) => {
        if (pointer.current !== e.pointerId) return;
        pointer.current = null;
        if (frame.current !== null) {
            cancelAnimationFrame(frame.current);
            frame.current = null;
            if (!cancelled) latest.current.onFrame(lastDx.current, lastPoint.current);
        }
        if (cancelled && latest.current.onCancel) {
            latest.current.onCancel();
            return;
        }
        const s = samples.current;
        const first = s[0];
        const last = s[s.length - 1];
        const dt = last && first ? last.t - first.t : 0;
        const velocity = dt > 0 ? (last.x - first.x) / dt : 0;
        latest.current.onRelease(lastDx.current, velocity);
    };

    return {
        onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => {
            if (pointer.current !== null || e.button !== 0) return;
            // Pointer capture is motion-20's entire lesson — the surface
            // dogfoods it so moves keep arriving outside the frame.
            e.currentTarget.setPointerCapture(e.pointerId);
            pointer.current = e.pointerId;
            startX.current = e.clientX;
            lastDx.current = 0;
            samples.current = [{ x: 0, t: e.timeStamp }];
            latest.current.onStart();
        },
        onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => {
            if (pointer.current !== e.pointerId) return;
            const dx = e.clientX - startX.current;
            lastDx.current = dx;
            lastPoint.current = { clientX: e.clientX, clientY: e.clientY };
            samples.current = [...samples.current.slice(-4), { x: dx, t: e.timeStamp }];
            if (frame.current === null) {
                frame.current = requestAnimationFrame(() => {
                    frame.current = null;
                    if (pointer.current !== null) latest.current.onFrame(lastDx.current, lastPoint.current);
                });
            }
        },
        onPointerUp: (e: ReactPointerEvent<HTMLDivElement>) => finish(e, false),
        onPointerCancel: (e: ReactPointerEvent<HTMLDivElement>) => finish(e, true),
        onLostPointerCapture: (e: ReactPointerEvent<HTMLDivElement>) => finish(e, true),
    };
}

/** What reduced motion changes on a drag prototype: the hand still drives
 *  the cards (user-driven, WCAG-exempt); only the release lands at once. */
const DRAG_REDUCED_NOTE =
    "Reduced motion: the cards still follow your pointer; only the release lands instantly.";

function DragSurface({
    hint,
    reducedNote = DRAG_REDUCED_NOTE,
    surfaceRef,
    readoutRef,
    control,
    statusRef,
    children,
    ...pointerProps
}: {
    hint: string;
    reducedNote?: string;
    surfaceRef?: RefObject<HTMLDivElement | null>;
    /** Live gesture readout (velocity / damping / capture) — written
     *  imperatively from onFrame, never through React state. */
    readoutRef?: RefObject<HTMLSpanElement | null>;
    control?: ComponentProps<typeof ShowcaseControls>["control"];
    statusRef?: RefObject<HTMLSpanElement | null>;
    children: ReactNode;
} & ReturnType<typeof useMirroredDrag>) {
    return (
        <div className="motion-showcase @container">
            <div
                ref={surfaceRef}
                {...pointerProps}
                data-vaul-no-drag
                className="grid cursor-grab select-none grid-cols-2 gap-3 active:cursor-grabbing"
                style={{ touchAction: "pan-y" }}
            >
                {children}
            </div>
            <ShowcaseControls control={control} hints={[hint]} reducedNote={reducedNote} />
            {statusRef ? <span ref={statusRef} role="status" className="sr-only" /> : null}
            {/* Its own line, one line tall, there at rest and empty: text
                arriving mid-drag can't wrap the hint or grow the frame. */}
            {readoutRef ? (
                <span
                    ref={readoutRef}
                    aria-hidden="true"
                    className="mt-1 block min-h-4 truncate font-mono text-xs leading-4 tabular-nums text-blue-700 dark:text-blue-300"
                />
            ) : null}
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

/* ── motion-18 · Gesture dismissal uses velocity ────────────────────── */

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

/*
 * Rail geometry, shared by the markup and the drag logic so the marks drawn on
 * the rail are the numbers the release verdict actually uses.
 *
 *   card travel = rail width − card width − END_GAP
 *   dismiss     = the card's leading edge passes DISMISS_AT of that travel
 *   wall        = WALL_AT of the rail; past it the do card rubber-bands
 */
/* Two panes share a 390px phone, so the card gives way before the travel
 * does: 7rem, or just over half the rail where that is narrower. The rail is
 * the query container, so the threshold line's calc() and the card resolve
 * the same width. */
const CARD_W = "min(7rem, 52cqw)";
const RAIL_INSET_PX = 8;
const END_GAP_PX = 12;
const DISMISS_AT = 0.6;
const WALL_AT = 0.68;

function DragCard({
    cardRef,
    railRef,
    wallRef,
    showThreshold = false,
    showWall = false,
}: {
    cardRef: RefObject<HTMLDivElement | null>;
    railRef?: RefObject<HTMLDivElement | null>;
    wallRef?: RefObject<HTMLDivElement | null>;
    /** Dismiss line for the velocity demo, where the card's leading edge
     *  reaches 60% of its travel. */
    showThreshold?: boolean;
    /** The boundary the damping demo drags against. It sits inside the rail
     *  so the rubber-band overshoot past it stays in view. */
    showWall?: boolean;
}) {
    return (
        <div
            ref={railRef}
            className="@container relative flex h-36 items-center overflow-hidden rounded-[16px] border border-dashed border-neutral-300 bg-neutral-50/80 px-2 dark:border-neutral-700 dark:bg-neutral-900/50"
        >
            {showThreshold ? (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-2 w-px border-l border-dashed border-rose-400/70"
                    style={{
                        left: `calc(${RAIL_INSET_PX}px + ${CARD_W} + ${DISMISS_AT} * (100% - ${CARD_W} - ${END_GAP_PX}px))`,
                    }}
                >
                    {/* Reader-facing annotation, not depicted UI — keep it legible. */}
                    <span className="absolute -top-1.5 left-1 text-xs font-medium tabular-nums text-rose-500 dark:text-rose-300">
                        60%
                    </span>
                </div>
            ) : null}
            {showWall ? (
                <div
                    ref={wallRef}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 right-0 bg-neutral-200/50 dark:bg-neutral-800/50"
                    style={{ left: `${WALL_AT * 100}%` }}
                >
                    <div className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-neutral-400/80 dark:bg-neutral-500/80" />
                </div>
            ) : null}
            {/* Opaque under its blue tint: the card slides over the dismiss
                line and past the wall, and neither may show through it. */}
            <div
                ref={cardRef}
                className="relative flex h-14 shrink-0 flex-col justify-center rounded-lg border border-blue-500 bg-white bg-[linear-gradient(rgb(59_130_246/0.1),rgb(59_130_246/0.1))] p-2 shadow-sm dark:border-blue-400 dark:bg-neutral-900 dark:bg-[linear-gradient(rgb(96_165_250/0.1),rgb(96_165_250/0.1))]"
                style={{ width: CARD_W }}
            >
                <span className="mb-1 text-xs font-semibold leading-none tracking-tight text-blue-700 dark:text-blue-300">
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
        deferOn(
            timers,
            () => {
                el.style.transition = "none";
                el.style.transform = "translateX(0)";
                void el.offsetHeight;
                el.style.transition = "opacity 220ms var(--ease-out-strong)";
                el.style.opacity = "1";
            },
            700
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
                travel.current = railEl.clientWidth - cardEl.offsetWidth - END_GAP_PX;
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
            if (!ticked.current && x > travel.current * DISMISS_AT) {
                ticked.current = true;
                tapLight();
            }
        },
        onCancel: () => {
            setCardX(doCard.current, 0, true);
            setCardX(dontCard.current, 0, true);
            writeReadout("");
        },
        onRelease: (dx, velocity) => {
            const x = Math.min(Math.max(dx, 0), travel.current);
            currentX.current = x;
            const farEnough = x > travel.current * DISMISS_AT;
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
            // Short enough for one line in a 390px frame: the readout truncates.
            writeReadout(
                `v ${velocity.toFixed(2)} px/ms · x ${Math.round(
                    (x / Math.max(1, travel.current)) * 100
                )}% · ${
                    flick && !farEnough
                        ? "dismissed by flick"
                        : farEnough
                          ? "dismissed by distance"
                          : "snapped back"
                }`
            );
            deferOn(timers, () => writeReadout(""), 2500);
        },
    });

    return (
        <DragSurface
            {...surface}
            readoutRef={readout}
            hint="Flick short and fast: the Do card reads intent, the Don’t card demands mileage"
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

/* ── motion-19 · Damp drag boundaries ───────────────────────────────── */

/** The rubber band UIScrollView uses: the first pixel past the edge moves the
 *  card RUBBER_BAND px, and every pixel after moves it less, approaching
 *  `room` and never reaching it. Resistance grows the farther you pull. */
const RUBBER_BAND = 0.55;

function rubberBand(over: number, room: number) {
    return room * (1 - 1 / ((over * RUBBER_BAND) / room + 1));
}

function DampedBoundary() {
    const spec = showcaseSpecs["motion-19"];
    const doCard = useRef<HTMLDivElement | null>(null);
    const dontCard = useRef<HTMLDivElement | null>(null);
    const rail = useRef<HTMLDivElement | null>(null);
    const wall = useRef<HTMLDivElement | null>(null);
    const readout = useRef<HTMLSpanElement | null>(null);
    const max = useRef(120);
    const room = useRef(80);
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
            // The limit is wherever the drawn wall is: the card's leading
            // edge meets it at `max`, and everything past it is damped.
            // offsetLeft ignores transforms, so this is the card at rest.
            const wallEl = wall.current;
            const cardEl = doCard.current;
            const railEl = rail.current;
            if (wallEl && cardEl) {
                max.current = Math.max(
                    0,
                    wallEl.offsetLeft - cardEl.offsetLeft - cardEl.offsetWidth
                );
            }
            // The band tops out just inside the rail's far edge, so however
            // hard you pull, the card stays in view.
            if (wallEl && railEl) {
                room.current = Math.max(24, railEl.clientWidth - wallEl.offsetLeft - 8);
            }
        },
        onFrame: (dx) => {
            const limit = max.current;
            const over = dx > limit ? dx - limit : dx < 0 ? -dx : 0;
            const band = rubberBand(over, room.current);
            const damped = dx > limit ? limit + band : dx < 0 ? -band : dx;
            const clamped = Math.min(Math.max(dx, 0), limit);
            setCardX(doCard.current, damped, false);
            setCardX(dontCard.current, clamped, false);
            // The damping made visible while you're past an edge: the share of
            // your pull the card keeps falls as you pull farther.
            if (over > 0) {
                const share = `${Math.round((band / over) * 100)}%`;
                writeReadout(
                    dx > 0
                        ? `past the wall +${Math.round(over)}px → card +${Math.round(band)}px · ${share}`
                        : `past rest −${Math.round(over)}px → card −${Math.round(band)}px · ${share}`
                );
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
            deferOn(timers, () => writeReadout(""), 2000);
        },
    });

    return (
        <DragSurface
            {...surface}
            readoutRef={readout}
            hint="Drag past the edge and let go — one card is physical, one is a clamp"
        >
            <PaneChrome variant="do" caption={spec.do.caption}>
                <DragCard cardRef={doCard} railRef={rail} wallRef={wall} showWall />
            </PaneChrome>
            <PaneChrome variant="dont" caption={spec.dont.caption}>
                <DragCard cardRef={dontCard} showWall />
            </PaneChrome>
        </DragSurface>
    );
}

/* ── motion-20 · Capture pointer during drag ────────────────────────── */

/** Chip classes for the capture state. Written imperatively on the don't pane
 *  (see PointerCaptureSlider) so the failure is dated to the exact frame the
 *  pointer leaves the surface. */
const CHIP_BASE =
    "rounded-full px-1.5 py-0.5 font-mono text-[10px] font-medium tabular-nums";
const CHIP_IDLE = "bg-neutral-200/80 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400";
const CHIP_LOST = "bg-rose-500/15 text-rose-600 dark:text-rose-300";

function SliderPane({
    knobRef,
    trackRef,
    chipRef,
    capture,
}: {
    knobRef: RefObject<HTMLDivElement | null>;
    trackRef?: RefObject<HTMLDivElement | null>;
    chipRef?: RefObject<HTMLSpanElement | null>;
    /** Whether this pane calls setPointerCapture — printed on the chip so the
     *  one variable under test is readable before anything moves. */
    capture: boolean;
}) {
    return (
        <div className="flex h-36 flex-col justify-center gap-2.5 rounded-[16px] border border-neutral-200 bg-neutral-50/80 px-3 dark:border-neutral-800 dark:bg-neutral-900/50">
            <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                    Volume
                </span>
                <span ref={chipRef} className={cn(CHIP_BASE, CHIP_IDLE)}>
                    {capture ? "capture ON" : "capture OFF"}
                </span>
            </div>
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
    const dontChip = useRef<HTMLSpanElement | null>(null);
    const max = useRef(120);
    const bounds = useRef<DOMRect | null>(null);
    const base = useRef({ do: 0, dont: 0 });
    const current = useRef({ do: 0, dont: 0 });
    const lostAtRelease = useRef(false);
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        const pending = timers.current;
        return () => pending.forEach(clearTimeout);
    }, []);

    const writeReadout = (text: string) => {
        if (readout.current) readout.current.textContent = text;
    };

    /** The don't pane's chip is the receipt: the frame the pointer crosses the
     *  border is the frame its knob stops hearing about the gesture. */
    const writeDontChip = (lost: boolean) => {
        const el = dontChip.current;
        if (!el) return;
        lostAtRelease.current = lost;
        el.textContent = lost ? "pointer lost" : "capture OFF";
        // Wholesale write, so this must stay in sync with the chip's JSX
        // className in SliderPane — both are cn(CHIP_BASE, <state>).
        el.className = cn(CHIP_BASE, lost ? CHIP_LOST : CHIP_IDLE);
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
                writeReadout("pointer inside the frame");
                writeDontChip(false);
            } else {
                writeReadout("pointer outside the frame");
                writeDontChip(true);
            }
        },
        onRelease: () => {
            // Sliders keep their value; the next drag continues from here.
            writeReadout("");
            // Hold "pointer lost" as the verdict, then return the chip to its
            // resting truth — the pane isn't losing a pointer it doesn't have.
            if (lostAtRelease.current) {
                deferOn(timers, () => writeDontChip(false), 2000);
            }
        },
    });

    return (
        <DragSurface
            {...surface}
            surfaceRef={surfaceEl}
            readoutRef={readout}
            hint="Drag a knob, then swing your pointer outside the panes mid-drag"
            reducedNote="Reduced motion changes nothing here: the knobs only ever follow your pointer."
        >
            <PaneChrome variant="do" caption={spec.do.caption}>
                <SliderPane knobRef={doKnob} trackRef={track} capture />
            </PaneChrome>
            <PaneChrome variant="dont" caption={spec.dont.caption}>
                <SliderPane knobRef={dontKnob} chipRef={dontChip} capture={false} />
            </PaneChrome>
        </DragSurface>
    );
}

/* ── motion-23 · Avoid inheritable motion variables ─────────────────── */

/*
 * Both panes hold the same list: the card you drag, then SWIPE_ROWS rows
 * under it, clipped by the stage. Only the write differs. The Don't pane sets
 * --swipe-amount on the list, where descendants inherit it. The Do pane
 * writes the card's transform directly. The meters time each write and
 * the subsequent computed-style reads in this browser.
 */
const SWIPE_ROWS = 300;
/** Frames in the rolling mean: long enough to steady the 0.1ms timer, short
 *  enough to follow the drag. */
const SWIPE_WINDOW = 20;

function SwipeCard({
    cardRef,
    viaVariable,
}: {
    cardRef: RefObject<HTMLDivElement | null>;
    viaVariable: boolean;
}) {
    return (
        <div
            ref={cardRef}
            className="relative flex h-14 shrink-0 flex-col justify-center rounded-lg border border-blue-500 bg-white bg-[linear-gradient(rgb(59_130_246/0.1),rgb(59_130_246/0.1))] p-2 shadow-sm dark:border-blue-400 dark:bg-neutral-900 dark:bg-[linear-gradient(rgb(96_165_250/0.1),rgb(96_165_250/0.1))]"
            style={viaVariable ? { transform: "translateX(var(--swipe-amount, 0px))" } : undefined}
        >
            <span className="mb-1 text-xs font-semibold leading-none tracking-tight text-blue-700 dark:text-blue-300">
                Message
            </span>
            <MiniLine widthClass="w-3/4" className="mb-1 h-1 !bg-blue-500/40" />
            <MiniLine widthClass="w-1/2" className="h-1 !bg-blue-500/40" />
            <DragGrip />
        </div>
    );
}

function SwipeList({
    listRef,
    cardRef,
    lastRowRef,
    viaVariable,
}: {
    listRef?: RefObject<HTMLDivElement | null>;
    cardRef: RefObject<HTMLDivElement | null>;
    lastRowRef: RefObject<HTMLDivElement | null>;
    viaVariable: boolean;
}) {
    return (
        <div className="h-36 overflow-hidden rounded-[16px] border border-dashed border-neutral-300 bg-neutral-50/80 p-2 dark:border-neutral-700 dark:bg-neutral-900/50">
            <div ref={listRef} className="flex flex-col gap-1.5">
                <SwipeCard cardRef={cardRef} viaVariable={viaVariable} />
                {/* A few inbox rows show through the stage; the rest are clipped. */}
                <div
                    aria-hidden="true"
                    className="flex flex-col gap-1.5 [mask-image:linear-gradient(to_bottom,black,transparent)]"
                >
                    {Array.from({ length: SWIPE_ROWS }, (_, i) => (
                        <div
                            key={i}
                            ref={i === SWIPE_ROWS - 1 ? lastRowRef : undefined}
                            className="flex h-5 shrink-0 items-center gap-1.5 rounded-lg bg-white px-2 dark:bg-neutral-900"
                        >
                            <span className="size-2 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                            <span className="h-1 w-1/2 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/** The per-pane receipt, in the slot the timed showcases use for their bars. */
function StyleMeter({
    fillRef,
    labelRef,
}: {
    fillRef: RefObject<HTMLDivElement | null>;
    labelRef: RefObject<HTMLSpanElement | null>;
}) {
    return (
        <div className="flex items-center gap-2">
            <div className="h-1 min-w-6 flex-1 overflow-hidden rounded-full bg-fill-strong dark:bg-fill">
                <div
                    ref={fillRef}
                    className="h-full origin-left rounded-full bg-ink-faint"
                    style={{ transform: "scaleX(0)" }}
                />
            </div>
            <span className="flex shrink-0 items-baseline gap-1 text-xs font-medium tabular-nums text-ink-muted">
                style
                {/* Fixed width: a changing digit count must not resize the track. */}
                <span ref={labelRef} className="inline-block min-w-12">
                    —
                </span>
            </span>
        </div>
    );
}

function translateXOf(el: HTMLElement | null) {
    if (!el) return 0;
    const t = getComputedStyle(el).transform;
    return t === "none" ? 0 : new DOMMatrixReadOnly(t).m41;
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const formatMs = (ms: number) => `${ms.toFixed(ms >= 10 ? 1 : 2)}ms`;

function SwipeCost() {
    const spec = showcaseSpecs["motion-23"];
    const doCard = useRef<HTMLDivElement | null>(null);
    const dontCard = useRef<HTMLDivElement | null>(null);
    const dontList = useRef<HTMLDivElement | null>(null);
    const doLastRow = useRef<HTMLDivElement | null>(null);
    const dontLastRow = useRef<HTMLDivElement | null>(null);
    const doFill = useRef<HTMLDivElement | null>(null);
    const dontFill = useRef<HTMLDivElement | null>(null);
    const doLabel = useRef<HTMLSpanElement | null>(null);
    const dontLabel = useRef<HTMLSpanElement | null>(null);
    const readout = useRef<HTMLSpanElement | null>(null);
    const status = useRef<HTMLSpanElement | null>(null);
    const base = useRef(0);
    const travel = useRef(120);
    const lastX = useRef<number | null>(null);
    const samples = useRef<{ do: number[]; dont: number[] }>({ do: [], dont: [] });
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        const pending = timers.current;
        return () => pending.forEach(clearTimeout);
    }, []);

    const writeReadout = (text: string) => {
        if (readout.current) readout.current.textContent = text;
    };

    /** Time one write through to a forced style read, in either pane. Both
     *  panes probe the same two elements, so the probe can't favour one. */
    const timed = (write: () => void, card: HTMLElement | null, lastRow: HTMLElement | null) => {
        const t0 = performance.now();
        write();
        if (card) void getComputedStyle(card).transform;
        if (lastRow) void getComputedStyle(lastRow).transform;
        return performance.now() - t0;
    };

    const setDontX = (x: number) => {
        dontList.current?.style.setProperty("--swipe-amount", `${x}px`);
    };

    const showMeters = () => {
        const doMs = mean(samples.current.do);
        const dontMs = mean(samples.current.dont);
        // One scale for both bars: the larger cost fills its track.
        const scale = Math.max(doMs, dontMs, 0.001);
        if (doFill.current) doFill.current.style.transform = `scaleX(${doMs / scale})`;
        if (dontFill.current) dontFill.current.style.transform = `scaleX(${dontMs / scale})`;
        if (doLabel.current) doLabel.current.textContent = formatMs(doMs);
        if (dontLabel.current) dontLabel.current.textContent = formatMs(dontMs);
        // The 0.1ms timer can round the Do to zero; a ratio would be infinite.
        writeReadout(
            doMs >= 0.01
                ? `Don’t: ${Math.round(dontMs / doMs)}× the Do’s style work a frame`
                : `Don’t: ${formatMs(dontMs)} a frame · Do: under 0.01ms`
        );
    };

    const announceMeasurement = () => {
        if (!status.current || samples.current.do.length === 0) return;
        status.current.textContent =
            `Measured style work per sample. Do: ${formatMs(mean(samples.current.do))}. ` +
            `Don’t: ${formatMs(mean(samples.current.dont))}.`;
    };

    const begin = () => {
        timers.current.forEach(clearTimeout);
        timers.current.length = 0;
        if (status.current) status.current.textContent = "";
        // Catch a card that is still springing home where it is: both
        // panes run the same spring, so the Do card speaks for both.
        base.current = translateXOf(doCard.current);
        setCardX(doCard.current, base.current, false);
        if (dontCard.current) dontCard.current.style.transition = "none";
        setDontX(base.current);
        const list = dontList.current;
        if (list) travel.current = list.clientWidth * 0.7;
        lastX.current = null;
        samples.current = { do: [], dont: [] };
    };

    const sampleFrame = (dx: number) => {
        const x = Math.min(Math.max(base.current + dx, -travel.current), travel.current);
        // A clamped frame writes nothing new, so it has nothing to time.
        if (x === lastX.current) return;
        lastX.current = x;
        // Flush setup and the previous meter updates before either timed write.
        if (doCard.current) void getComputedStyle(doCard.current).transform;
        if (dontCard.current) void getComputedStyle(dontCard.current).transform;
        const doMs = timed(
            () => setCardX(doCard.current, x, false),
            doCard.current,
            doLastRow.current
        );
        const dontMs = timed(() => setDontX(x), dontCard.current, dontLastRow.current);
        const s = samples.current;
        s.do = [...s.do.slice(1 - SWIPE_WINDOW), doMs];
        s.dont = [...s.dont.slice(1 - SWIPE_WINDOW), dontMs];
        showMeters();
    };

    const settle = () => {
        // The same spring as motion-18's snap-back, on each pane's own
        // property: the card's transform, or the list's variable.
        setCardX(doCard.current, 0, true, { durationMs: 350, easing: SPRING_SOFT });
        if (dontCard.current) {
            dontCard.current.style.transition = `transform 350ms ${SPRING_SOFT}`;
        }
        setDontX(0);
        // The meters hold their last reading; only the comparison clears.
        deferOn(timers, () => writeReadout(""), 2500);
    };

    const stepCards = () => {
        begin();
        const destination = Math.abs(base.current) > 1 ? 0 : travel.current * 0.65;
        sampleFrame(destination - base.current);
        announceMeasurement();
    };

    const surface = useMirroredDrag({
        onStart: begin,
        onFrame: sampleFrame,
        onRelease: () => {
            settle();
            announceMeasurement();
        },
        onCancel: settle,
    });

    return (
        <DragSurface
            {...surface}
            readoutRef={readout}
            statusRef={status}
            control={{ label: "Step both cards", onClick: stepCards, icon: false }}
            hint="Drag either card or step both cards to compare the measured style work."
        >
            <PaneChrome
                variant="do"
                caption={spec.do.caption}
                bar={<StyleMeter fillRef={doFill} labelRef={doLabel} />}
            >
                <SwipeList cardRef={doCard} lastRowRef={doLastRow} viaVariable={false} />
            </PaneChrome>
            <PaneChrome
                variant="dont"
                caption={spec.dont.caption}
                bar={<StyleMeter fillRef={dontFill} labelRef={dontLabel} />}
            >
                <SwipeList
                    listRef={dontList}
                    cardRef={dontCard}
                    lastRowRef={dontLastRow}
                    viaVariable
                />
            </PaneChrome>
        </DragSurface>
    );
}
