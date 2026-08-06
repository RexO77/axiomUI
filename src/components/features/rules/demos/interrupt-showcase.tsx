"use client";

import { useRef, useState, type RefObject } from "react";

import { EASE } from "@/lib/showcase-engine";
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

    const toggle = () => {
        const next = !atFar;
        setAtFar(next);

        const doEl = doCard.current;
        if (doEl) {
            doEl.style.transition = `transform ${DURATION}ms ${EASE.inOut}`;
            doEl.style.transform = next ? FAR : REST;
        }

        const dontEl = dontCard.current;
        if (dontEl) {
            dontAnim.current?.cancel();
            dontAnim.current = dontEl.animate(
                next
                    ? [{ transform: REST }, { transform: FAR }]
                    : [{ transform: FAR }, { transform: REST }],
                { duration: DURATION, easing: EASE.inOut, fill: "forwards" }
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
                <Hint>Spam Toggle mid-flight — left keeps momentum, right restarts</Hint>
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
