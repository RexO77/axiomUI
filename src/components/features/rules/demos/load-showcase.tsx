"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

import { EASE } from "@/lib/showcase-engine";
import { useReducedMotion } from "@/lib/media";
import {
    ControlButton,
    Hint,
    PaneChrome,
} from "@/components/features/rules/demos/showcase-chrome";
import { showcaseSpecs } from "@/components/features/rules/demos/showcase-specs";
import {
    ThreadMeter,
    type ThreadSample,
} from "@/components/features/rules/demos/thread-meter";
import { MotionRail, ProtagonistChip } from "@/components/features/rules/demos/protagonist";

const REST = "translateX(0px)";

/** motion-21 / 22 deep dives — real main-thread work, retimed for study (011). */
export function LoadShowcase({ ruleId }: { ruleId: string }) {
    switch (ruleId) {
        case "motion-21":
            return <BlockedThreadRace />;
        case "motion-22":
            return <IntervalRace />;
        default:
            return null;
    }
}

function RaceRail({
    railRef,
    cardRef,
    label,
}: {
    railRef?: RefObject<HTMLDivElement | null>;
    cardRef: RefObject<HTMLDivElement | null>;
    label: string;
}) {
    return (
        <div className="flex h-32 flex-col justify-center">
            <MotionRail railRef={railRef}>
                <div ref={cardRef} className="w-fit" style={{ transform: REST }}>
                    <ProtagonistChip label={label} />
                </div>
            </MotionRail>
        </div>
    );
}

function measureTravel(rail: HTMLElement | null, card: HTMLElement | null) {
    if (!rail || !card) return 120;
    return Math.max(0, rail.clientWidth - card.offsetWidth - 8);
}

function far(px: number) {
    return `translateX(${px}px)`;
}

function stall(ms: number) {
    const end = performance.now() + ms;
    while (performance.now() < end) {
        /* deliberate main-thread burn — the demo */
    }
}

function resetCard(el: HTMLElement | null) {
    if (!el) return;
    el.style.transition = "none";
    el.style.transform = REST;
    el.style.opacity = "1";
}

/** Hold at the finish so the seismograph can be studied, then soft-reset. */
function scheduleReset(
    el: HTMLElement | null,
    delayMs: number,
    timers: ReturnType<typeof setTimeout>[],
    onDone?: () => void
) {
    timers.push(
        setTimeout(() => {
            if (!el) {
                onDone?.();
                return;
            }
            el.style.transition = "opacity 200ms var(--ease-out-strong)";
            el.style.opacity = "0";
            timers.push(
                setTimeout(() => {
                    el.style.transition = "none";
                    el.style.transform = REST;
                    void el.offsetHeight;
                    el.style.transition = "opacity 220ms var(--ease-out-strong)";
                    el.style.opacity = "1";
                    onDone?.();
                }, 220)
            );
        }, delayMs)
    );
}

/* ── motion-21 · Race under load (retimed: 2600ms, 3×240ms stalls) ─── */

function BlockedThreadRace() {
    const spec = showcaseSpecs["motion-21"];
    const reduced = useReducedMotion();
    const [running, setRunning] = useState(false);
    const [samples, setSamples] = useState<ThreadSample[]>([]);
    const doCard = useRef<HTMLDivElement | null>(null);
    const dontCard = useRef<HTMLDivElement | null>(null);
    const rail = useRef<HTMLDivElement | null>(null);
    const doAnim = useRef<Animation | null>(null);
    const rafId = useRef<number | null>(null);
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
    const sampleBuf = useRef<ThreadSample[]>([]);
    const lastTick = useRef(0);

    useEffect(
        () => () => {
            doAnim.current?.cancel();
            if (rafId.current !== null) cancelAnimationFrame(rafId.current);
            timers.current.forEach(clearTimeout);
        },
        []
    );

    const race = () => {
        if (running) return;
        setRunning(true);
        setSamples([]);
        sampleBuf.current = [];
        timers.current.forEach(clearTimeout);
        timers.current = [];
        doAnim.current?.cancel();
        if (rafId.current !== null) cancelAnimationFrame(rafId.current);

        const travel = measureTravel(rail.current, doCard.current);
        const duration = 2600;
        const destination = far(travel);

        if (reduced) {
            if (doCard.current) doCard.current.style.transform = destination;
            if (dontCard.current) dontCard.current.style.transform = destination;
            scheduleReset(doCard.current, 800, timers.current, () => setRunning(false));
            scheduleReset(dontCard.current, 800, timers.current);
            return;
        }

        resetCard(doCard.current);
        resetCard(dontCard.current);
        void doCard.current?.offsetHeight;

        if (doCard.current) {
            doAnim.current = doCard.current.animate(
                [{ transform: REST }, { transform: destination }],
                { duration, easing: EASE.linear, fill: "forwards" }
            );
        }

        const start = performance.now();
        lastTick.current = start;
        const tick = (now: number) => {
            const gap = now - lastTick.current;
            sampleBuf.current.push({ atMs: now - start, gapMs: gap });
            lastTick.current = now;

            const p = Math.min(1, (now - start) / duration);
            if (dontCard.current) {
                dontCard.current.style.transform = far(travel * p);
            }
            if (p < 1) {
                rafId.current = requestAnimationFrame(tick);
            } else {
                rafId.current = null;
                setSamples([...sampleBuf.current]);
            }
        };
        rafId.current = requestAnimationFrame(tick);

        timers.current.push(setTimeout(() => stall(240), 300));
        timers.current.push(setTimeout(() => stall(240), 1150));
        timers.current.push(setTimeout(() => stall(240), 2000));

        // Hold at finish ~1.6s so freezes + seismograph can be studied.
        scheduleReset(doCard.current, duration + 1600, timers.current, () =>
            setRunning(false)
        );
        scheduleReset(dontCard.current, duration + 1600, timers.current);
    };

    return (
        <div className="motion-showcase">
            <div className="grid grid-cols-2 gap-3">
                <PaneChrome variant="do" caption={spec.do.caption}>
                    <RaceRail railRef={rail} cardRef={doCard} label="Compositor" />
                </PaneChrome>
                <PaneChrome variant="dont" caption={spec.dont.caption}>
                    <RaceRail cardRef={dontCard} label="Main thread" />
                </PaneChrome>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
                <ControlButton onClick={race} disabled={running}>
                    Race + block main thread
                </ControlButton>
                <Hint>
                    Watch the right card — it freezes three times; the strip below is
                    the receipt
                </Hint>
            </div>
            <ThreadMeter samples={samples} durationMs={2600} mode="stalls" />
        </div>
    );
}

/* ── motion-22 · Smooth vs setInterval (retimed: 1400ms / 80ms ticks) ── */

function IntervalRace() {
    const spec = showcaseSpecs["motion-22"];
    const reduced = useReducedMotion();
    const [running, setRunning] = useState(false);
    const [samples, setSamples] = useState<ThreadSample[]>([]);
    const doCard = useRef<HTMLDivElement | null>(null);
    const dontCard = useRef<HTMLDivElement | null>(null);
    const rail = useRef<HTMLDivElement | null>(null);
    const doAnim = useRef<Animation | null>(null);
    const intervalId = useRef<ReturnType<typeof setInterval> | null>(null);
    const sampleRaf = useRef<number | null>(null);
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
    const sampleBuf = useRef<ThreadSample[]>([]);
    const lastTick = useRef(0);

    useEffect(
        () => () => {
            doAnim.current?.cancel();
            if (intervalId.current !== null) clearInterval(intervalId.current);
            if (sampleRaf.current !== null) cancelAnimationFrame(sampleRaf.current);
            timers.current.forEach(clearTimeout);
        },
        []
    );

    const play = () => {
        if (running) return;
        setRunning(true);
        setSamples([]);
        sampleBuf.current = [];
        timers.current.forEach(clearTimeout);
        timers.current = [];
        doAnim.current?.cancel();
        if (intervalId.current !== null) {
            clearInterval(intervalId.current);
            intervalId.current = null;
        }
        if (sampleRaf.current !== null) cancelAnimationFrame(sampleRaf.current);

        const travel = measureTravel(rail.current, doCard.current);
        const duration = 1400;
        const destination = far(travel);

        if (reduced) {
            if (doCard.current) doCard.current.style.transform = destination;
            if (dontCard.current) dontCard.current.style.transform = destination;
            scheduleReset(doCard.current, 800, timers.current, () => setRunning(false));
            scheduleReset(dontCard.current, 800, timers.current);
            return;
        }

        resetCard(doCard.current);
        resetCard(dontCard.current);
        void doCard.current?.offsetHeight;

        if (doCard.current) {
            doAnim.current = doCard.current.animate(
                [{ transform: REST }, { transform: destination }],
                { duration, easing: EASE.linear, fill: "forwards" }
            );
        }

        const start = performance.now();
        lastTick.current = start;

        // Sample thread health via rAF (should stay ~16ms) while setInterval steps the card.
        const sample = (now: number) => {
            sampleBuf.current.push({ atMs: now - start, gapMs: now - lastTick.current });
            lastTick.current = now;
            if (now - start < duration) {
                sampleRaf.current = requestAnimationFrame(sample);
            } else {
                sampleRaf.current = null;
                setSamples([...sampleBuf.current]);
            }
        };
        sampleRaf.current = requestAnimationFrame(sample);

        intervalId.current = setInterval(() => {
            const p = Math.min(1, (performance.now() - start) / duration);
            if (dontCard.current) {
                dontCard.current.style.transform = far(travel * p);
            }
            if (p >= 1 && intervalId.current !== null) {
                clearInterval(intervalId.current);
                intervalId.current = null;
            }
        }, 80);

        scheduleReset(doCard.current, duration + 1400, timers.current, () =>
            setRunning(false)
        );
        scheduleReset(dontCard.current, duration + 1400, timers.current);
    };

    return (
        <div className="motion-showcase">
            <div className="grid grid-cols-2 gap-3">
                <PaneChrome variant="do" caption={spec.do.caption}>
                    <RaceRail railRef={rail} cardRef={doCard} label="WAAPI" />
                </PaneChrome>
                <PaneChrome variant="dont" caption={spec.dont.caption}>
                    <RaceRail cardRef={dontCard} label="setInterval" />
                </PaneChrome>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
                <ControlButton onClick={play} disabled={running}>
                    Play both
                </ControlButton>
                <Hint>
                    Same 1400ms, same distance — count the jumps on the right
                </Hint>
            </div>
            <ThreadMeter samples={samples} durationMs={1400} mode="healthy" />
        </div>
    );
}
