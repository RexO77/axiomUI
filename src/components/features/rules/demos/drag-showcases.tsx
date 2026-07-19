"use client";

import type { PointerEvent as ReactPointerEvent, ReactNode, RefObject } from "react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
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
    children,
    ...pointerProps
}: {
    hint: string;
    surfaceRef?: RefObject<HTMLDivElement | null>;
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
            <div className="mt-3 flex min-h-[28px] items-center">
                <Hint>{hint}</Hint>
            </div>
        </div>
    );
}

function setCardX(el: HTMLElement | null, x: number, animate: boolean) {
    if (!el) return;
    el.style.transition = animate ? RELEASE_TRANSITION : "none";
    el.style.transform = `translateX(${x}px)`;
}

/* ── motion-18 · Gesture Dismissal Uses Velocity ────────────────────── */

function DragCard({
    cardRef,
    railRef,
    size = "md",
}: {
    cardRef: RefObject<HTMLDivElement | null>;
    railRef?: RefObject<HTMLDivElement | null>;
    size?: "md" | "sm";
}) {
    return (
        <div
            ref={railRef}
            className="relative flex h-24 items-center overflow-hidden rounded-md border border-dashed border-neutral-200 px-1.5 dark:border-neutral-800"
        >
            <div
                ref={cardRef}
                className={cn(
                    "rounded-md border border-neutral-300 bg-white p-1.5 shadow-sm dark:border-neutral-600 dark:bg-neutral-800",
                    size === "md" ? "h-14 w-20" : "h-10 w-14"
                )}
            >
                <MiniLine widthClass="w-3/4" className="mb-1 h-1.5" />
                <MiniLine widthClass="w-1/2" className="h-1.5" />
            </div>
        </div>
    );
}

function VelocityDismiss() {
    const spec = showcaseSpecs["motion-18"];
    const doCard = useRef<HTMLDivElement | null>(null);
    const dontCard = useRef<HTMLDivElement | null>(null);
    const rail = useRef<HTMLDivElement | null>(null);
    const travel = useRef(120);
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        const pending = timers.current;
        return () => pending.forEach(clearTimeout);
    }, []);

    const dismiss = (el: HTMLElement | null) => {
        if (!el) return;
        el.style.transition = RELEASE_TRANSITION;
        el.style.transform = `translateX(${travel.current + 48}px)`;
        el.style.opacity = "0";
        // Fade back in so the demo is infinitely repeatable.
        timers.current.push(
            setTimeout(() => {
                el.style.transition = "none";
                el.style.transform = "translateX(0)";
                void el.offsetHeight; // commit the jump before fading back in
                el.style.transition = "opacity 220ms var(--ease-out-strong)";
                el.style.opacity = "1";
            }, 700)
        );
    };

    const surface = useMirroredDrag({
        onStart: () => {
            const railEl = rail.current;
            const cardEl = doCard.current;
            if (railEl && cardEl) {
                travel.current = railEl.clientWidth - cardEl.offsetWidth - 12;
            }
        },
        onFrame: (dx) => {
            const x = Math.min(Math.max(dx, 0), travel.current);
            setCardX(doCard.current, x, false);
            setCardX(dontCard.current, x, false);
        },
        onRelease: (dx, velocity) => {
            const x = Math.min(Math.max(dx, 0), travel.current);
            const farEnough = x > travel.current * 0.6;
            // Do: a quick short flick dismisses — velocity OR distance.
            if (velocity > 0.5 || farEnough) dismiss(doCard.current);
            else setCardX(doCard.current, 0, true);
            // Don't: distance is the only signal — the same flick snaps back.
            if (farEnough) dismiss(dontCard.current);
            else setCardX(dontCard.current, 0, true);
        },
    });

    return (
        <DragSurface {...surface} hint="Drag or flick the cards right — a quick short flick should dismiss">
            <PaneChrome variant="do" caption={spec.do.caption}>
                <DragCard cardRef={doCard} railRef={rail} />
            </PaneChrome>
            <PaneChrome variant="dont" caption={spec.dont.caption}>
                <DragCard cardRef={dontCard} />
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
    const max = useRef(120);

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
            // Do: past the boundary, movement continues at a third of the
            // pointer's pace — the rubber-band the rule prescribes.
            const damped =
                dx < 0 ? dx / 3 : dx <= limit ? dx : limit + (dx - limit) / 3;
            // Don't: a hard clamp — the card pins dead at the edge.
            const clamped = Math.min(Math.max(dx, 0), limit);
            setCardX(doCard.current, damped, false);
            setCardX(dontCard.current, clamped, false);
        },
        onRelease: () => {
            setCardX(doCard.current, 0, true);
            setCardX(dontCard.current, 0, true);
        },
    });

    return (
        <DragSurface {...surface} hint="Drag the cards past the frame edge, then release">
            <PaneChrome variant="do" caption={spec.do.caption}>
                <DragCard cardRef={doCard} railRef={rail} />
            </PaneChrome>
            <PaneChrome variant="dont" caption={spec.dont.caption}>
                <DragCard cardRef={dontCard} />
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
        <div className="flex h-24 items-center px-2">
            <div ref={trackRef} className="relative h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800">
                <div
                    ref={knobRef}
                    className="absolute size-4 rounded-full border border-neutral-300 bg-white shadow-sm dark:border-neutral-500 dark:bg-neutral-200"
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
    const max = useRef(120);
    const bounds = useRef<DOMRect | null>(null);
    const base = useRef({ do: 0, dont: 0 });
    const current = useRef({ do: 0, dont: 0 });

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
            }
        },
        onRelease: () => {
            // Sliders keep their value; the next drag continues from here.
        },
    });

    return (
        <DragSurface
            {...surface}
            surfaceRef={surfaceEl}
            hint="Drag the knobs, then move the pointer outside the frame mid-drag"
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
