"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Drives a rule's motion demo.
 *
 * A demo renders its "start" frame and animates to the final frame when it
 * scrolls into view; on hover devices, re-hovering replays it. Under
 * prefers-reduced-motion it rests at the final frame and never moves.
 *
 * `hoverOnly` opts a demo out of touch autoplay: motion-16 illustrates
 * hover-gated motion, so animating it on touch would contradict the rule it
 * shows. It still autoplays and replays on hover devices.
 *
 * Demos read `settled` to pick between their start (false) and end (true) styles.
 * A play flips it to false for one frame (jump to start) then back to true on the
 * next, so the CSS transition runs.
 */
export function useDemoPlayback({ hoverOnly = false }: { hoverOnly?: boolean } = {}) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [settled, setSettled] = useState(false);

    const canHoverRef = useRef(false);
    const reducedRef = useRef(false);
    const rafRef = useRef(0);

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

    useEffect(() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
        const hover = window.matchMedia("(hover: hover) and (pointer: fine)");

        const sync = () => {
            reducedRef.current = reduced.matches;
            canHoverRef.current = hover.matches;
            if (reduced.matches) {
                setSettled(true); // rest at the final frame; never animate
            }
        };

        sync();
        reduced.addEventListener("change", sync);
        hover.addEventListener("change", sync);
        return () => {
            reduced.removeEventListener("change", sync);
            hover.removeEventListener("change", sync);
        };
    }, []);

    // Autoplay once when scrolled into view. hoverOnly demos skip this on touch
    // (see motion-16) but still play on hover devices.
    useEffect(() => {
        const el = ref.current;
        if (!el || reducedRef.current || (!canHoverRef.current && hoverOnly)) {
            return;
        }

        let played = false;
        const observer = new IntersectionObserver(
            (entries) => {
                if (!played && entries.some((entry) => entry.isIntersecting)) {
                    played = true;
                    play();
                    observer.disconnect();
                }
            },
            { threshold: 0.4 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [play, hoverOnly]);

    useEffect(() => () => {
        cancelAnimationFrame(rafRef.current);
        delete ref.current?.dataset.motionReset;
    }, []);

    const handlers = {
        onPointerEnter: () => {
            if (canHoverRef.current) {
                play();
            }
        },
    };

    return { ref, settled, handlers };
}
