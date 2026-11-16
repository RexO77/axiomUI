"use client";

import { useEffect, useSyncExternalStore } from "react";

import { rules } from "@/data/ui-logic";

export const MEMORY_KEY = "axiom:v1";
/** The schema version written into `axiom:v1`. Readers accept any version and keep the fields they know. */
export const MEMORY_VERSION = 1;
export const VISIT_DELAY_MS = 2000;
/** One mark per rule: the catalog has 105, so a longer list is corrupt or stale. */
export const VISITED_LIMIT = 105;
export const RECENT_LIMIT = 5;

export type MemoryPrefs = {
  /** Null means the responsive default, until the reader makes a choice. */
  sidebarOpen: boolean | null;
  compareMode: "side" | "flip";
  zoom: 1 | 2;
  singleKeys: boolean;
};
export type CatalogMemory = Readonly<{
  last: string | null;
  recent: readonly string[];
  visited: readonly string[];
  prefs: Readonly<MemoryPrefs>;
}>;
export type MemoryStorage = Pick<Storage, "getItem" | "setItem">;
export type RuleIdCheck = (id: string) => boolean;

const DEFAULT_PREFS: Readonly<MemoryPrefs> = Object.freeze({
  sidebarOpen: null,
  compareMode: "side",
  zoom: 1,
  singleKeys: true,
});
export const DEFAULT_MEMORY: CatalogMemory = Object.freeze({
  last: null,
  recent: Object.freeze([]),
  visited: Object.freeze([]),
  prefs: DEFAULT_PREFS,
});

const KNOWN_KEYS = new Set(["v", "last", "recent", "visited", "prefs"]);
const ruleIds = new Set(rules.map((rule) => rule.id));
/** Ids are checked on read, so a renamed or removed rule never reaches Continue, Recent or a visited mark. */
export const isRuleId: RuleIdCheck = (id) => ruleIds.has(id);

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function idList(value: unknown, valid: RuleIdCheck): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id): id is string => typeof id === "string" && valid(id)))];
}

function parseRecord(raw: string | null): Record<string, unknown> | null {
  try {
    const value: unknown = raw ? JSON.parse(raw) : null;
    return record(value) ? value : null;
  } catch {
    return null;
  }
}

export function parseMemory(raw: string | null, valid: RuleIdCheck = isRuleId): CatalogMemory {
  const value = parseRecord(raw);
  if (!value) return DEFAULT_MEMORY;
  const prefs = record(value.prefs) ? value.prefs : {};
  const last = typeof value.last === "string" && valid(value.last) ? value.last : null;
  return Object.freeze({
    last,
    recent: Object.freeze(Array.isArray(value.recent) ? idList(value.recent, valid).slice(0, RECENT_LIMIT) : last ? [last] : []),
    visited: Object.freeze(idList(value.visited, valid).slice(-VISITED_LIMIT)),
    prefs: Object.freeze({
      sidebarOpen: typeof prefs.sidebarOpen === "boolean" ? prefs.sidebarOpen : null,
      compareMode: prefs.compareMode === "flip" ? "flip" : "side",
      zoom: prefs.zoom === 2 ? 2 : 1,
      singleKeys: prefs.singleKeys !== false,
    }),
  });
}

/**
 * The stored JSON for `memory`, keeping the keys this version does not know (a
 * newer tab's), at the top level and inside `prefs`.
 */
export function serialiseMemory(memory: CatalogMemory, previousRaw: string | null): string {
  const previous = parseRecord(previousRaw) ?? {};
  const unknown = Object.fromEntries(Object.entries(previous).filter(([key]) => !KNOWN_KEYS.has(key)));
  const previousPrefs = record(previous.prefs) ? previous.prefs : {};
  const unknownPrefs = Object.fromEntries(Object.entries(previousPrefs).filter(([key]) => !Object.hasOwn(DEFAULT_PREFS, key)));
  return JSON.stringify({ ...unknown, v: MEMORY_VERSION, ...memory, prefs: { ...unknownPrefs, ...memory.prefs } });
}

export type StorageEvents = Pick<EventTarget, "addEventListener" | "removeEventListener">;

function browserStorage(): MemoryStorage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function browserEvents(): StorageEvents | null {
  return typeof window === "undefined" ? null : window;
}

/** Storage is lazy and injectable: blocked storage still gives a usable session store. */
export function createMemoryStore(
  getStorage: () => MemoryStorage | null = browserStorage,
  valid: RuleIdCheck = isRuleId,
  getEvents: () => StorageEvents | null = browserEvents,
) {
  let snapshot: CatalogMemory | undefined;
  let pending: ReturnType<typeof setTimeout> | undefined;
  const listeners = new Set<() => void>();

  /** The stored memory, or null when storage can't be read at all (blocked, throwing). */
  const tryRead = (): CatalogMemory | null => {
    try {
      return parseMemory(getStorage()?.getItem(MEMORY_KEY) ?? null, valid);
    } catch {
      return null;
    }
  };
  const read = (): CatalogMemory => tryRead() ?? DEFAULT_MEMORY;
  const getSnapshot = () => snapshot ??= read();
  const emit = () => listeners.forEach((listener) => listener());
  const write = (next: CatalogMemory) => {
    snapshot = Object.freeze(next);
    try {
      const storage = getStorage();
      let previous: string | null = null;
      try {
        previous = storage?.getItem(MEMORY_KEY) ?? null;
      } catch {
        // Unreadable: nothing of a newer version's to keep.
      }
      storage?.setItem(MEMORY_KEY, serialiseMemory(next, previous));
    } catch {
      // Keep the session choice when browser storage is blocked or full.
    }
    emit();
  };
  const refresh = () => {
    // An unreadable store keeps the session's choices; only a successful read
    // (including an emptied or corrupt one) replaces them.
    const next = tryRead();
    if (next === null) return;
    if (JSON.stringify(next) === JSON.stringify(getSnapshot())) return;
    snapshot = next;
    emit();
  };
  const onStorage = (event: Event) => {
    const key = (event as StorageEvent).key;
    if (key === MEMORY_KEY || key === null) refresh();
  };
  const markVisited = (id: string) => {
    const current = getSnapshot();
    if (!valid(id) || current.visited.includes(id)) return;
    write({ ...current, visited: Object.freeze([...current.visited, id].slice(-VISITED_LIMIT)) });
  };
  const setLast = (id: string) => {
    const current = getSnapshot();
    if (valid(id) && id !== current.last) {
      write({ ...current, last: id, recent: Object.freeze([id, ...current.recent.filter((recent) => recent !== id)].slice(0, RECENT_LIMIT)) });
    }
  };

  return {
    getSnapshot,
    getServerSnapshot: () => DEFAULT_MEMORY,
    subscribe(listener: () => void) {
      const events = getEvents();
      const first = listeners.size === 0;
      listeners.add(listener);
      if (first) {
        events?.addEventListener("storage", onStorage);
        // No one was listening, so another tab's save may have gone unheard;
        // without this the next write would overwrite it.
        if (snapshot !== undefined) refresh();
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) events?.removeEventListener("storage", onStorage);
      };
    },
    refresh,
    setLast,
    markVisited,
    setPrefs(patch: Partial<MemoryPrefs>) {
      const current = getSnapshot();
      // Reuse the persisted-data validator so callers cannot poison a later read.
      const next = parseMemory(JSON.stringify({ ...current, prefs: { ...current.prefs, ...patch } }), valid);
      write(next);
    },
    /** The returned cleanup cancels a skim; only the latest active rule can mature. */
    trackRule(id: string) {
      clearTimeout(pending);
      setLast(id);
      const timer = setTimeout(() => markVisited(id), VISIT_DELAY_MS);
      pending = timer;
      return () => {
        clearTimeout(timer);
        if (pending === timer) pending = undefined;
      };
    },
  };
}

export type MemoryStore = ReturnType<typeof createMemoryStore>;

export const memoryStore: MemoryStore = createMemoryStore();

export function useMemory(): CatalogMemory {
  return useSyncExternalStore(memoryStore.subscribe, memoryStore.getSnapshot, memoryStore.getServerSnapshot);
}

export function useRuleMemory(id: string | null): void {
  useEffect(() => id ? memoryStore.trackRule(id) : undefined, [id]);
}
