import { afterEach, describe, expect, it, vi } from "vitest";
import { rules } from "@/data/ui-logic";
import { createMemoryStore, DEFAULT_MEMORY, MEMORY_KEY, MEMORY_VERSION, parseMemory, VISIT_DELAY_MS, VISITED_LIMIT, type MemoryStorage } from "@/lib/navigation/memory";

afterEach(() => vi.useRealTimers());

function storage(raw: string | null = null): MemoryStorage {
  let value = raw;
  return { getItem: vi.fn(() => value), setItem: vi.fn((_key, next) => { value = next; }) };
}

describe("local catalog memory", () => {
  it("validates corrupt JSON and malformed shapes with stable server defaults", () => {
    for (const raw of [null, "{bad", "null", "[]", '"string"']) expect(parseMemory(raw)).toBe(DEFAULT_MEMORY);
    const parsed = parseMemory(JSON.stringify({ last: 123, visited: ["typo-1", "typo-1", null, 3, ""], prefs: { zoom: 9, compareMode: "invalid", sidebarOpen: "yes" }, show: "dont" }));
    expect(parsed).toEqual({ ...DEFAULT_MEMORY, visited: ["typo-1"] });
    expect(parsed).not.toHaveProperty("show");
    const store = createMemoryStore(() => storage("{bad"));
    expect(store.getSnapshot()).toBe(store.getSnapshot());
    expect(store.getServerSnapshot()).toBe(DEFAULT_MEMORY);
  });

  it("recovers corrupt persisted JSON on the next write without losing the session", () => {
    const persisted = storage("{broken");
    const store = createMemoryStore(() => persisted);
    store.setLast("motion-7");
    store.setPrefs({ sidebarOpen: true, compareMode: "flip", zoom: 2, singleKeys: false });
    store.markVisited("motion-7");
    const reloaded = createMemoryStore(() => persisted);
    expect(reloaded.getSnapshot()).toEqual({
      last: "motion-7", recent: ["motion-7"], visited: ["motion-7"],
      prefs: { sidebarOpen: true, compareMode: "flip", zoom: 2, singleKeys: false },
    });
    expect(persisted.setItem).toHaveBeenCalledWith(MEMORY_KEY, expect.any(String));
  });

  it("continues in memory when the storage getter, read or write throws", () => {
    const throwing = () => { throw new Error("Storage blocked"); };
    for (const getStorage of [throwing, () => ({ getItem: throwing, setItem: throwing }), () => null]) {
      const store = createMemoryStore(getStorage);
      expect(store.getSnapshot()).toBe(DEFAULT_MEMORY);
      expect(() => {
        store.setLast("color-1");
        store.markVisited("color-1");
        store.setPrefs({ zoom: 2 });
      }).not.toThrow();
      expect(store.getSnapshot()).toMatchObject({ last: "color-1", visited: ["color-1"], prefs: { zoom: 2 } });
    }
  });

  it("notifies subscribers only on changes and refreshes external persisted choices", () => {
    const persisted = storage();
    const store = createMemoryStore(() => persisted);
    const notify = vi.fn();
    const unsubscribe = store.subscribe(notify);
    store.markVisited("typo-1");
    store.markVisited("typo-1");
    expect(notify).toHaveBeenCalledTimes(1);
    persisted.setItem(MEMORY_KEY, JSON.stringify({ last: "typo-2", prefs: { singleKeys: false } }));
    store.refresh();
    expect(store.getSnapshot()).toMatchObject({ last: "typo-2", prefs: { singleKeys: false } });
    store.refresh();
    expect(notify).toHaveBeenCalledTimes(2);
    unsubscribe();
    store.setLast("typo-3");
    expect(notify).toHaveBeenCalledTimes(2);
  });

  it("remembers last immediately and visits only after two seconds on the active rule", () => {
    vi.useFakeTimers();
    const store = createMemoryStore(() => storage());
    const cancel = store.trackRule("typo-1");
    expect(store.getSnapshot().last).toBe("typo-1");
    vi.advanceTimersByTime(VISIT_DELAY_MS - 1);
    expect(store.getSnapshot().visited).toEqual([]);
    cancel();
    const cancelB = store.trackRule("typo-2");
    vi.advanceTimersByTime(VISIT_DELAY_MS);
    expect(store.getSnapshot().visited).toEqual(["typo-2"]);
    cancelB();
    store.trackRule("typo-3");
    vi.advanceTimersByTime(100);
    store.trackRule("typo-4");
    vi.advanceTimersByTime(VISIT_DELAY_MS);
    expect(store.getSnapshot().visited).toEqual(["typo-2", "typo-4"]);
  });

  it("keeps the palette's five most recent rules in recency order without duplicates", () => {
    const store = createMemoryStore(() => null);
    for (const n of [1, 2, 3, 4, 5, 6, 3]) store.setLast(`typo-${n}`);
    expect(store.getSnapshot().recent).toEqual(["typo-3", "typo-6", "typo-5", "typo-4", "typo-2"]);
    expect(store.getSnapshot().visited).toEqual([]);
  });

  it("drops ids that are not rules, from every list and from last", () => {
    const parsed = parseMemory(JSON.stringify({
      last: "sys-12",
      recent: ["motion-99", "typo-1", "__proto__", "typo-1"],
      visited: ["color-1", "nope", "color-2"],
    }));
    expect(parsed).toMatchObject({ last: null, recent: ["typo-1"], visited: ["color-1", "color-2"] });
    expect(parseMemory(JSON.stringify({ last: "typo-9" })).recent).toEqual(["typo-9"]);
    const store = createMemoryStore(() => storage());
    store.setLast("not-a-rule");
    store.markVisited("not-a-rule");
    expect(store.getSnapshot()).toBe(store.getSnapshot());
    expect(store.getSnapshot()).toMatchObject({ last: null, visited: [] });
  });

  it("caps visited at the catalog's 105 rules, keeping the newest", () => {
    expect(VISITED_LIMIT).toBe(105);
    expect(rules).toHaveLength(VISITED_LIMIT);
    const all = rules.map((rule) => rule.id);
    const padded = [...all, ...all.map((id) => `${id}0`), "extra-1"];
    expect(parseMemory(JSON.stringify({ visited: padded })).visited).toEqual(all);
    const store = createMemoryStore(() => storage(JSON.stringify({ visited: all.slice(1) })));
    store.markVisited(all[0]);
    expect(store.getSnapshot().visited).toHaveLength(VISITED_LIMIT);
    expect(store.getSnapshot().visited.at(-1)).toBe(all[0]);
  });

  it("writes a version and keeps top-level keys it does not know", () => {
    const persisted = storage(JSON.stringify({ v: 2, last: "typo-1", future: { a: 1 }, flags: [1] }));
    const store = createMemoryStore(() => persisted);
    expect(store.getSnapshot().last).toBe("typo-1");
    store.setLast("typo-2");
    const written = JSON.parse((persisted.setItem as ReturnType<typeof vi.fn>).mock.calls.at(-1)![1]);
    expect(written).toMatchObject({ v: MEMORY_VERSION, last: "typo-2", future: { a: 1 }, flags: [1] });
    expect(MEMORY_VERSION).toBe(1);
  });

  it("keeps pref keys it does not know, so a newer tab's preferences survive this tab's write", () => {
    const persisted = storage(JSON.stringify({ v: 2, prefs: { zoom: 2, density: "compact", panels: { notes: true } } }));
    const store = createMemoryStore(() => persisted);
    store.setPrefs({ singleKeys: false });
    const written = JSON.parse((persisted.setItem as ReturnType<typeof vi.fn>).mock.calls.at(-1)![1]);
    expect(written.prefs).toEqual({ sidebarOpen: null, compareMode: "side", zoom: 2, singleKeys: false, density: "compact", panels: { notes: true } });
    expect(store.getSnapshot().prefs).not.toHaveProperty("density");
  });

  it("holds no deep-dive preference: its own key in the catalog stores is the only one", () => {
    expect(DEFAULT_MEMORY.prefs).not.toHaveProperty("inspectorOpen");
    expect(parseMemory(JSON.stringify({ prefs: { inspectorOpen: true } })).prefs).not.toHaveProperty("inspectorOpen");
  });

  it("refreshes on a storage event for its key from the injected event target", () => {
    const persisted = storage();
    const events = new EventTarget();
    const store = createMemoryStore(() => persisted, undefined, () => events);
    const notify = vi.fn();
    const unsubscribe = store.subscribe(notify);
    expect(store.getSnapshot().last).toBeNull();
    persisted.setItem(MEMORY_KEY, JSON.stringify({ last: "color-3" }));
    events.dispatchEvent(Object.assign(new Event("storage"), { key: "other" }));
    expect(notify).not.toHaveBeenCalled();
    events.dispatchEvent(Object.assign(new Event("storage"), { key: MEMORY_KEY }));
    expect(notify).toHaveBeenCalledOnce();
    expect(store.getSnapshot().last).toBe("color-3");
    unsubscribe();
  });
});
