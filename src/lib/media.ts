"use client";

import { useSyncExternalStore } from "react";

/**
 * Shared media-query store. One MediaQueryList + one listener per query for the
 * whole app (the old system created a pair per demo — 160 listeners on the grid).
 * SSR/first paint snapshot is `false` for both queries, which renders the safe
 * default (no hover affordances, motion enabled; reduced-motion is re-checked
 * by the engine at play time, so nothing can animate for a reduced-motion user).
 */
const stores = new Map<
    string,
    { mql: MediaQueryList; listeners: Set<() => void> }
>();

function getStore(query: string) {
    let store = stores.get(query);
    if (!store) {
        const mql = window.matchMedia(query);
        const listeners = new Set<() => void>();
        mql.addEventListener("change", () => listeners.forEach((l) => l()));
        store = { mql, listeners };
        stores.set(query, store);
    }
    return store;
}

function useMediaFlag(query: string): boolean {
    return useSyncExternalStore(
        (onChange) => {
            const store = getStore(query);
            store.listeners.add(onChange);
            return () => store.listeners.delete(onChange);
        },
        () => getStore(query).mql.matches,
        () => false
    );
}

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
export const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

export function useReducedMotion() {
    return useMediaFlag(REDUCED_MOTION_QUERY);
}

export function useCanHover() {
    return useMediaFlag(HOVER_QUERY);
}

/** Non-hook read for event handlers / the engine (client only). */
export function prefersReducedMotion() {
    return typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}
