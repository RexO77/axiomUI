import { useSyncExternalStore } from "react";

import type { RuleProse } from "@/lib/rule-prose-types";

/*
 * The rule view's deep-dive prose, one rule at a time.
 *
 * The landing rule's prose arrives with its document, as the server-rendered
 * Inspector, and is seeded here under its own id only. Every other rule is
 * fetched from its static JSON file (`/deep-dives/<id>`), kept in an id-keyed
 * map, and fetched at most once at a time. The rule view prefetches the deck
 * neighbours and anything a pointer or focus rests on, so paging with J/K
 * finds the prose already here and stays 0 ms.
 *
 * Replies are cached whenever they arrive, but only a reply for the rule now
 * shown is announced: a slow reply for a rule the reader has paged past never
 * replaces the prose on screen. A reply whose payload names another rule is
 * a failure. A failed load shows a retry state until it is retried or shown
 * again.
 */

export type ProseState = Readonly<{ status: "ready"; prose: RuleProse } | { status: "loading" } | { status: "error" }>;

/** The JSON route lives at the site root, outside the catalog's base path, so it is not one of `createRoutes`' URLs. */
export const proseUrl = (id: string) => `/deep-dives/${encodeURIComponent(id)}`;

const LOADING: ProseState = Object.freeze({ status: "loading" });
const ERROR: ProseState = Object.freeze({ status: "error" });

function isProse(data: unknown, id: string): data is RuleProse {
  if (!data || typeof data !== "object") return false;
  const value = data as Record<string, unknown>;
  const strings = (list: unknown) => Array.isArray(list) && list.every((item) => typeof item === "string");
  return value.id === id && typeof value.why === "string" && typeof value.breaks === "string" && strings(value.how) && strings(value.review);
}

export type ProseLoader = ReturnType<typeof createProseLoader>;

export function createProseLoader(fetcher: (id: string) => Promise<unknown>) {
  const cache = new Map<string, RuleProse>();
  const ready = new Map<string, ProseState>();
  const pending = new Map<string, Promise<void>>();
  const failed = new Set<string>();
  const listeners = new Set<() => void>();
  let shown: string | null = null;

  const emit = () => listeners.forEach((listener) => listener());

  function get(id: string): ProseState {
    const prose = cache.get(id);
    if (!prose) return failed.has(id) ? ERROR : LOADING;
    let state = ready.get(id);
    if (!state) {
      state = Object.freeze({ status: "ready", prose });
      ready.set(id, state);
    }
    return state;
  }

  function load(id: string): Promise<void> {
    if (cache.has(id)) return Promise.resolve();
    const inflight = pending.get(id);
    if (inflight) return inflight;
    failed.delete(id);
    let request: Promise<unknown>;
    try {
      request = Promise.resolve(fetcher(id));
    } catch (error) {
      request = Promise.reject(error);
    }
    const run = request
      .then((data) => {
        if (!isProse(data, id)) throw new Error(`no prose for ${id}`);
        cache.set(id, data);
      })
      .catch(() => {
        failed.add(id);
      })
      .finally(() => {
        pending.delete(id);
        // Only the rule on screen hears about it; anything else just waits in the cache.
        if (id === shown) emit();
      });
    pending.set(id, run);
    return run;
  }

  return {
    get,
    /** The rule the view shows now: loads it unless it is cached or already on its way. */
    show(id: string): void {
      shown = id;
      const wasFailed = failed.has(id);
      if (!cache.has(id)) void load(id);
      // A failed rule shown again tries again: its state moves from the retry button to loading.
      if (wasFailed) emit();
    },
    /** Warm a rule the reader may go to next. Never retries a failure on its own. */
    prefetch(id: string | null | undefined): void {
      if (id && !failed.has(id)) void load(id);
    },
    retry(id: string): Promise<void> {
      failed.delete(id);
      if (id === shown) emit();
      return load(id);
    },
    /** The server-rendered prose of the landing rule. It is stored under its own id and no other. */
    seed(prose: RuleProse): void {
      if (cache.has(prose.id) || !isProse(prose, prose.id)) return;
      cache.set(prose.id, prose);
      failed.delete(prose.id);
      if (prose.id === shown) emit();
    },
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

async function fetchProse(id: string): Promise<unknown> {
  const response = await fetch(proseUrl(id), { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`${response.status} for ${id}`);
  return response.json();
}

/** The one loader the rule view shares. */
export const proseLoader = createProseLoader(fetchProse);

/** What the rule view shows for `id`. The server renders the loading state; the seed replaces it before paint. */
export function useProse(id: string): ProseState {
  return useSyncExternalStore(
    proseLoader.subscribe,
    () => proseLoader.get(id),
    () => LOADING,
  );
}
