"use client";

// The catalog's client stores: visited marks, compare preferences, the deep
// dive's open state, the strip's first-visit hint, Continue and Recent. Each
// is a useSyncExternalStore triple whose server snapshot is the default, so
// hydration never mismatches and the client corrects after it.
//
// Storage keys:
//   axiom:v1          visited, last, recent, prefs (src/lib/navigation/memory.ts)
//   axiom:deep-dive   "hidden" when the reader closed it; absent means open.
//                     The only record of the deep dive's state.
//   axiom:strip-hint  "seen" once the hint is dismissed.
// Every storage access is guarded: blocked storage keeps the choice for the load.

import { startTransition, useEffect, useState } from "react";

import { rules, type Rule } from "@/data/ui-logic";
import {
  browserEvents,
  memoryStore,
  type CatalogMemory,
  type MemoryStore,
  type StorageEvents,
} from "@/lib/navigation/memory";

export const DEEP_DIVE_KEY = "axiom:deep-dive";
export const STRIP_HINT_KEY = "axiom:strip-hint";

export type CompareMode = "side" | "flip";
export type Prefs = Readonly<{ mode: CompareMode; zoom: 1 | 2 }>;
export type KeyStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
type Listener = () => void;

const PREF_DEFAULTS: Prefs = Object.freeze({ mode: "side", zoom: 1 });
const NONE: ReadonlySet<string> = new Set();
const ruleById = new Map(rules.map((rule) => [rule.id, rule]));

function browserStorage(): KeyStorage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

/** A flag under its own localStorage key, re-read when another tab changes it. */
function createFlag(
  key: string,
  read: (stored: string | null) => boolean,
  getStorage: () => KeyStorage | null,
  getEvents: () => StorageEvents | null,
) {
  const listeners = new Set<Listener>();
  let value: boolean | undefined;
  /** The stored flag, or undefined when storage can't be read at all. */
  const tryLoad = (): boolean | undefined => {
    try {
      return read(getStorage()?.getItem(key) ?? null);
    } catch {
      return undefined;
    }
  };
  const load = () => tryLoad() ?? read(null);
  /** One handler for every reader: read once, then tell them all. */
  const onStorage = (event: Event) => {
    const changed = (event as StorageEvent).key;
    if (changed !== key && changed !== null) return;
    // An unreadable store keeps this session's choice.
    const next = tryLoad();
    if (next === undefined || next === value) return;
    value = next;
    listeners.forEach((listener) => listener());
  };
  return {
    subscribe(listener: Listener) {
      const events = getEvents();
      if (listeners.size === 0) {
        events?.addEventListener("storage", onStorage);
        // No one was listening, so another tab may have changed the key unheard.
        if (value !== undefined) value = tryLoad() ?? value;
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) events?.removeEventListener("storage", onStorage);
      };
    },
    get: () => (value ??= load()),
    set(next: boolean, stored: string | null) {
      value = next;
      try {
        if (stored === null) getStorage()?.removeItem(key);
        else getStorage()?.setItem(key, stored);
      } catch {
        // Blocked storage: the choice holds for this page load.
      }
      listeners.forEach((listener) => listener());
    },
  };
}

export type CatalogStoreOptions = {
  memory?: MemoryStore;
  getStorage?: () => KeyStorage | null;
  getEvents?: () => StorageEvents | null;
};

/** One set of stores per page load. Tests build their own; the app uses `catalogStores`. */
export function createCatalogStores({
  memory = memoryStore,
  getStorage = browserStorage,
  getEvents = browserEvents,
}: CatalogStoreOptions = {}) {
  /* Visited: a Set whose identity changes only when the marks do. */
  let visitedFrom: CatalogMemory | null = null;
  let visitedSet: ReadonlySet<string> = NONE;
  const readVisited = () => {
    const snapshot = memory.getSnapshot();
    if (snapshot !== visitedFrom) {
      visitedFrom = snapshot;
      const same = visitedSet.size === snapshot.visited.length && snapshot.visited.every((id) => visitedSet.has(id));
      if (!same) visitedSet = new Set(snapshot.visited);
    }
    return visitedSet;
  };

  /* Compare preferences: compare mode and zoom persist across paging and visits. */
  let prefsFrom: CatalogMemory | null = null;
  let prefs: Prefs = PREF_DEFAULTS;
  const readPrefs = () => {
    const snapshot = memory.getSnapshot();
    if (snapshot !== prefsFrom) {
      prefsFrom = snapshot;
      const { compareMode, zoom } = snapshot.prefs;
      if (compareMode !== prefs.mode || zoom !== prefs.zoom) prefs = Object.freeze({ mode: compareMode, zoom });
    }
    return prefs;
  };

  const readLast = (): string | null => {
    const last = memory.getSnapshot().last;
    return last && ruleById.has(last) ? last : null;
  };

  /*
   * Continue: `last` is read once per page load, so it never changes under the
   * reader. Opening a rule writes `last` at once; without the cached read,
   * returning to the wall would offer "Continue · the rule you just read". A
   * load that starts on a rule (a deep link) shows no Continue at all.
   */
  let lastOnce: string | null | undefined;
  let deepLinked = false;
  const readContinue = () => (deepLinked ? null : (lastOnce === undefined ? (lastOnce = readLast()) : lastOnce));

  const deepDive = createFlag(DEEP_DIVE_KEY, (stored) => stored !== "hidden", getStorage, getEvents);

  /*
   * Whether the reader is past the strip's first-visit hint: true once it is
   * dismissed, or for anyone with history (a visited mark, or more than the
   * landing rule in Recent). The hint renders only while this is false. The
   * server snapshot is true, so the server and hydration render no hint and
   * a new reader's hint appears after hydration, never the other way round.
   */
  const stripHintSeen = createFlag(
    STRIP_HINT_KEY,
    (stored) => {
      if (stored === "seen") return true;
      const snapshot = memory.getSnapshot();
      return snapshot.visited.length > 0 || snapshot.recent.length > 1;
    },
    getStorage,
    getEvents,
  );

  return {
    visited: { subscribe: memory.subscribe, get: readVisited, server: (): ReadonlySet<string> => NONE },
    prefs: { subscribe: memory.subscribe, get: readPrefs, server: (): Prefs => PREF_DEFAULTS },
    writePrefs(patch: Partial<Prefs>) {
      memory.setPrefs({
        ...(patch.mode ? { compareMode: patch.mode } : null),
        ...(patch.zoom ? { zoom: patch.zoom } : null),
      });
    },
    /** The last rule read, validated. Live; the wall reads `continueRule` instead. */
    readLast,
    /** The last five rules read, newest first (the palette's Recent). */
    readRecent: (): Rule[] => memory.getSnapshot().recent.flatMap((id) => ruleById.get(id) ?? []),
    continueRule: {
      /** Nothing to hear: the value is fixed for the load. */
      subscribe: (): (() => void) => () => {},
      get: readContinue,
      server: (): string | null => null,
      /** Call before the first render when the load's location is a rule. */
      suppress() {
        deepLinked = true;
      },
    },
    deepDive: { subscribe: deepDive.subscribe, get: deepDive.get, server: () => true },
    setDeepDiveOpen: (open: boolean) => deepDive.set(open, open ? null : "hidden"),
    /** True when the strip's hint should not show: `{!seen && <Hint />}`. */
    stripHintSeen: { subscribe: stripHintSeen.subscribe, get: stripHintSeen.get, server: () => true },
    dismissStripHint() {
      if (stripHintSeen.get()) return;
      stripHintSeen.set(true, "seen");
    },
  };
}

export type CatalogStores = ReturnType<typeof createCatalogStores>;

export const catalogStores: CatalogStores = createCatalogStores();

/**
 * Visited marks for the component that draws them, applied as a transition so
 * a visit landing mid-scrub never costs a frame. Empty until hydrated.
 */
export function useVisited(stores: CatalogStores = catalogStores): ReadonlySet<string> {
  const [visited, setVisited] = useState<ReadonlySet<string>>(NONE);
  useEffect(() => {
    const sync = () => startTransition(() => setVisited(stores.visited.get()));
    sync();
    return stores.visited.subscribe(sync);
  }, [stores]);
  return visited;
}
