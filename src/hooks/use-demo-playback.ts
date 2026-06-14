"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Drives a rule's motion demo.
 *
 * Trigger model (confirmed with product):
 * - Desktop (hover + fine pointer): hover the preview to play; re-hover replays.
 *   In focused contexts (drawer / standalone page) it also plays once on open
 *   via `autoPlayOnView`, so the motion is seen without requiring a hover. The
 *   card grid leaves `autoPlayOnView` off so it stays calm until hovered.
 * - Touch / no-hover: auto-play once when scrolled into view, then settle.
 * - prefers-reduced-motion: never animate — the demo rests at its final state.
 *
 * Demos read `settled` to choose between their "start" and "end" class sets.
 * `settled` rests at true (final frame). A play flips it to false for one frame
 * (jump to start) then back to true on the next frame, so a CSS transition runs.
 * Replay just calls `play` again.
 */
export function useDemoPlayback({
    autoPlayOnView = false,
    hoverOnly = false,
}: { autoPlayOnView?: boolean; hoverOnly?: boolean } = {}) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [settled, setSettled] = useState(true);
    const [reducedMotion, setReducedMotion] = useState(false);

    const canHoverRef = useRef(false);
    const reducedRef = useRef(false);
    const rafRef = useRef(0);

    const play = useCallback(() => {
        if (reducedRef.current) {
            return;
        }
        cancelAnimationFrame(rafRef.current);
        setSettled(false);
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = requestAnimationFrame(() => setSettled(true));
        });
    }, []);

    useEffect(() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
        const hover = window.matchMedia("(hover: hover) and (pointer: fine)");

        const sync = () => {
            reducedRef.current = reduced.matches;
            canHoverRef.current = hover.matches;
            setReducedMotion(reduced.matches);
        };

        sync();
        reduced.addEventListener("change", sync);
        hover.addEventListener("change", sync);
        return () => {
            reduced.removeEventListener("change", sync);
            hover.removeEventListener("change", sync);
        };
    }, []);

    // Play once when the demo scrolls into view — always on touch (no hover to
    // trigger it) and, when autoPlayOnView is set, on desktop too (focused
    // contexts like the drawer / standalone page).
    //
    // hoverOnly suppresses the touch path entirely: a demo about hover-gated
    // motion (motion-16) must NOT animate on touch, or it would contradict the
    // very rule it illustrates. On hover devices it still plays.
    useEffect(() => {
        const el = ref.current;
        const canHover = canHoverRef.current;
        if (
            !el ||
            reducedRef.current ||
            (canHover && !autoPlayOnView) ||
            (!canHover && hoverOnly)
        ) {
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
    }, [play, autoPlayOnView, hoverOnly]);

    useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

    const handlers = {
        onPointerEnter: () => {
            if (canHoverRef.current) {
                play();
            }
        },
    };

    return { ref, settled, reducedMotion, replay: play, handlers };
}
