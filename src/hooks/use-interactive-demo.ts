"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * How a deep-dive prototype is driven. Gesture triggers (`hover`, `press`) react
 * to the user acting on the preview itself; control triggers (`action`,
 * `toggle`, `replay`) drive it from a labelled button.
 */
export type InteractionTrigger = "hover" | "press" | "toggle" | "action" | "replay";

/**
 * Powers a single interactive deep-dive prototype. Unlike the autoplay preview
 * hook, nothing fires until the user acts: they perform the gesture the rule
 * teaches (press/hover) or trigger it from a control (action/toggle/replay).
 *
 * `settled` carries the same meaning the preview demos already use (true = the
 * demo's end/engaged frame), so the existing demo visuals are reused unchanged.
 * Reduced motion lands on the end frame instantly (the .motion-demo CSS removes
 * the transition).
 */
export function useInteractiveDemo(trigger: InteractionTrigger) {
    // Resting frame before the user acts. `press` rests at its released frame and
    // `replay` shows the finished motion (so neither starts blank); `action`,
    // `toggle` and `hover` start from the "before" frame the trigger reveals.
    const ref = useRef<HTMLDivElement | null>(null);
    const [settled, setSettled] = useState(trigger === "press" || trigger === "replay");

    const reducedRef = useRef(false);
    const rafRef = useRef(0);

    useEffect(() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
        const sync = () => {
            reducedRef.current = reduced.matches;
        };
        sync();
        reduced.addEventListener("change", sync);
        return () => reduced.removeEventListener("change", sync);
    }, []);

    useEffect(() => () => {
        cancelAnimationFrame(rafRef.current);
        delete ref.current?.dataset.motionReset;
    }, []);

    // Re-run the entrance: jump to the start frame, then animate to the end on
    // the next frame so the CSS transition fires.
    const play = useCallback(() => {
        if (reducedRef.current) {
            setSettled(true);
            return;
        }
        const el = ref.current;
        cancelAnimationFrame(rafRef.current);
        if (el) {
            el.dataset.motionReset = "true";
        }
        setSettled(false);
        rafRef.current = requestAnimationFrame(() => {
            if (el) {
                el.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
                void el.offsetHeight;
            }
            rafRef.current = requestAnimationFrame(() => {
                if (el) {
                    void el.offsetHeight;
                    delete el.dataset.motionReset;
                }
                rafRef.current = requestAnimationFrame(() => setSettled(true));
            });
        });
    }, []);

    const toggle = useCallback(() => setSettled((s) => !s), []);

    // Gesture handlers spread onto the preview surface. Press shows its engaged
    // (start) frame while held; hover shows its engaged (end) frame on pointer-over.
    const surfaceHandlers =
        trigger === "hover"
            ? {
                  onPointerEnter: () => setSettled(true),
                  onPointerLeave: () => setSettled(false),
              }
            : trigger === "press"
              ? {
                    onPointerDown: () => setSettled(false),
                    onPointerUp: () => setSettled(true),
                    onPointerLeave: () => setSettled(true),
                    onPointerCancel: () => setSettled(true),
                }
              : null;

    return { ref, settled, play, toggle, surfaceHandlers };
}
