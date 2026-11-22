"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

import { useReducedMotion } from "@/lib/media";
import { PaneChrome, ShowcaseControls } from "@/components/features/rules/demos/showcase-chrome";
import { showcaseSpecs } from "@/components/features/rules/demos/showcase-specs";
import {
    ThreadMeter,
    type ThreadSample,
} from "@/components/features/rules/demos/thread-meter";
import { MotionRail, ProtagonistChip } from "@/components/features/rules/demos/protagonist";

const REST = "translateX(0px)";

/** motion-21 deep dive — real main-thread work, retimed for study (011). */
export function LoadShowcase({ ruleId }: { ruleId: string }) {
    switch (ruleId) {
        case "motion-21":
            return <BlockedThreadRace />;
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
    // The dashed rail is the stage: one frame, like the drag rails, at
    // MotionRail's default rounded-field corner.
    return (
        <MotionRail railRef={railRef} className="h-36">
            <div ref={cardRef} className="w-fit" style={{ transform: REST }}>
                <ProtagonistChip label={label} />
            </div>
        </MotionRail>
    );
}

/** Room `card` has before it reaches the rail's far 8px inset. */
function measureTravel(rail: HTMLElement | null, card: HTMLElement | null) {
    if (!rail || !card) return 120;
    return Math.max(0, rail.clientWidth - card.offsetWidth - 16);
}

/**
 * One distance for both cards, so the race is a controlled experiment: same
 * duration, same distance, same speed — only the timing source differs. The
 * chips carry different labels, so it is the shorter room of the two; the
 * wider chip lands on the 8px inset and neither overruns its rail.
 */
function sharedTravel(
    doRail: HTMLElement | null,
    doCard: HTMLElement | null,
    dontRail: HTMLElement | null,
    dontCard: HTMLElement | null
) {
    return Math.min(measureTravel(doRail, doCard), measureTravel(dontRail, dontCard));
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

/* ── motion-21 · Race under load (retimed: 2600ms, 3×240ms stalls) ───
 * Do is the rule's own advice, a CSS transition. Don't writes style from rAF. */

function BlockedThreadRace() {
    const spec = showcaseSpecs["motion-21"];
    const reduced = useReducedMotion();
    const [running, setRunning] = useState(false);
    const [samples, setSamples] = useState<ThreadSample[]>([]);
    const doCard = useRef<HTMLDivElement | null>(null);
    const dontCard = useRef<HTMLDivElement | null>(null);
    const rail = useRef<HTMLDivElement | null>(null);
    const dontRail = useRef<HTMLDivElement | null>(null);
    const rafId = useRef<number | null>(null);
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
    const sampleBuf = useRef<ThreadSample[]>([]);
    const lastTick = useRef(0);

    useEffect(
        () => () => {
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
        if (rafId.current !== null) cancelAnimationFrame(rafId.current);

        const travel = sharedTravel(
            rail.current,
            doCard.current,
            dontRail.current,
            dontCard.current
        );
        const duration = 2600;

        if (reduced) {
            if (doCard.current) doCard.current.style.transform = far(travel);
            if (dontCard.current) dontCard.current.style.transform = far(travel);
            scheduleReset(doCard.current, 800, timers.current, () => setRunning(false));
            scheduleReset(dontCard.current, 800, timers.current);
            return;
        }

        resetCard(doCard.current);
        resetCard(dontCard.current);
        // Commit the rest position before the transition is set, or the
        // browser sees one change and there is nothing to transition from.
        void doCard.current?.offsetHeight;

        // Do: a CSS transform transition. Once the browser has it, the
        // compositor runs every frame, so the stalls below can't touch it.
        if (doCard.current) {
            doCard.current.style.transition = `transform ${duration}ms linear`;
            doCard.current.style.transform = far(travel);
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
        <div className="motion-showcase @container">
            <div className="grid grid-cols-2 gap-3">
                <PaneChrome variant="do" caption={spec.do.caption}>
                    <RaceRail railRef={rail} cardRef={doCard} label="CSS transition" />
                </PaneChrome>
                <PaneChrome variant="dont" caption={spec.dont.caption}>
                    <RaceRail railRef={dontRail} cardRef={dontCard} label="Main thread" />
                </PaneChrome>
            </div>
            <ShowcaseControls
                control={{ label: "Start race", onClick: race, disabled: running }}
                hints={[
                    !reduced &&
                        "Watch which card pauses during the three long tasks. After the race, the strip marks gaps over 40ms between callbacks.",
                ]}
                reducedNote="With reduced motion, both cards go directly to the finish and the long tasks are skipped."
            />
            <ThreadMeter
                samples={samples}
                durationMs={2600}
                recording={running && samples.length === 0}
                reduced={reduced}
            />
        </div>
    );
}
