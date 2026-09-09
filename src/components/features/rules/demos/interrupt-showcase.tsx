"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

import { EASE } from "@/lib/showcase-engine";
import { prefersReducedMotion, REDUCED_MOTION_QUERY } from "@/lib/media";
import {
    ControlButton,
    Hint,
    PaneChrome,
} from "@/components/features/rules/demos/showcase-chrome";
import { showcaseSpecs } from "@/components/features/rules/demos/showcase-specs";
import { MotionRail, ProtagonistChip } from "@/components/features/rules/demos/protagonist";

const DURATION = 420;
const REST = "translateX(0)";
const FAR = "translateX(calc(100cqw - 100%))";

/** motion-12: CSS transition retargets; WAAPI keyframes restart from rest. */
export function InterruptShowcase() {
    const spec = showcaseSpecs["motion-12"];
    const [atFar, setAtFar] = useState(false);
    const doCard = useRef<HTMLDivElement | null>(null);
    const dontCard = useRef<HTMLDivElement | null>(null);
    const dontAnim = useRef<Animation | null>(null);

    // Sampling the preference at play time covers the common case, but a user
    // who switches reduced motion on *during* a 420ms run would otherwise be
    // left watching it finish. Land both cards the moment the preference flips.
    useEffect(() => {
        const mql = window.matchMedia(REDUCED_MOTION_QUERY);
        const onChange = () => {
            if (!mql.matches) return;
            const anim = dontAnim.current;
            // finish() lands the end state; cancel() would snap it back to the
            // start and leave the two panes disagreeing.
            if (anim && anim.playState === "running") anim.finish();
            if (doCard.current) doCard.current.style.transition = "none";
        };
        mql.addEventListener("change", onChange);
        return () => mql.removeEventListener("change", onChange);
    }, []);

    const toggle = () => {
        const next = !atFar;
        setAtFar(next);
        // Read at play time, matching the engine — see media.ts.
        const reduced = prefersReducedMotion();

        const doEl = doCard.current;
        if (doEl) {
            doEl.style.transition = reduced
                ? "none"
                : `transform ${DURATION}ms ${EASE.inOut}`;
            doEl.style.transform = next ? FAR : REST;
        }

        const dontEl = dontCard.current;
        if (dontEl) {
            dontAnim.current?.cancel();
            // A script-created effect is immune to the global reduced-motion
            // CSS override, so the duration has to be zeroed here — otherwise
            // this pane animates for users who asked for no motion.
            dontAnim.current = dontEl.animate(
                next
                    ? [{ transform: REST }, { transform: FAR }]
                    : [{ transform: FAR }, { transform: REST }],
                { duration: reduced ? 0 : DURATION, easing: EASE.inOut, fill: "forwards" }
            );
        }
    };

    return (
        <div className="motion-showcase">
            <div className="grid grid-cols-2 gap-3">
                <PaneChrome variant="do" caption={spec.do.caption}>
                    <InterruptRail cardRef={doCard} label="Transition" />
                </PaneChrome>
                <PaneChrome variant="dont" caption={spec.dont.caption}>
                    <InterruptRail cardRef={dontCard} label="Keyframe" />
                </PaneChrome>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
                <ControlButton onClick={toggle}>Toggle</ControlButton>
                <Hint>
                    Hit Toggle again mid-flight — the left card turns from where it is,
                    the right snaps to the far end first
                </Hint>
            </div>
        </div>
    );
}

function InterruptRail({
    cardRef,
    label,
}: {
    cardRef: RefObject<HTMLDivElement | null>;
    label: string;
}) {
    return (
        <div className="flex h-32 flex-col justify-center">
            <MotionRail>
                <div ref={cardRef} className="w-fit" style={{ transform: REST }}>
                    <ProtagonistChip label={label} />
                </div>
            </MotionRail>
        </div>
    );
}
