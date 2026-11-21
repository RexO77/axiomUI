import { describe, expect, it, vi } from "vitest";
import { createCatalogStores, DEEP_DIVE_KEY, STRIP_HINT_KEY, type KeyStorage } from "@/lib/catalog/stores";
import { createMemoryStore, MEMORY_KEY } from "@/lib/navigation/memory";

/** One browser profile: a shared localStorage and a window that hears other tabs' writes. */
function profile(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const storage: KeyStorage = {
    getItem: vi.fn((key: string) => data.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => void data.set(key, value)),
    removeItem: vi.fn((key: string) => void data.delete(key)),
  };
  const events = new EventTarget();
  /** A page load: fresh module state over the same storage. */
  const load = () => {
    const memory = createMemoryStore(() => storage, undefined, () => events);
    return { memory, stores: createCatalogStores({ memory, getStorage: () => storage, getEvents: () => events }) };
  };
  /** Another tab writes a key; this tab hears a `storage` event. */
  const otherTab = (key: string, value: string | null) => {
    if (value === null) data.delete(key);
    else data.set(key, value);
    events.dispatchEvent(Object.assign(new Event("storage"), { key }));
  };
  return { data, storage, load, otherTab };
}

describe("catalog stores", () => {
  it("survive a reload: visited, prefs, the deep-dive choice and the hint", () => {
    const browser = profile();
    const first = browser.load();
    first.stores.dismissStripHint();
    first.memory.markVisited("typo-1");
    first.stores.writePrefs({ mode: "flip", zoom: 2 });
    first.stores.setDeepDiveOpen(false);
    const second = browser.load().stores;
    expect([...second.visited.get()]).toEqual(["typo-1"]);
    expect(second.prefs.get()).toEqual({ mode: "flip", zoom: 2 });
    expect(second.deepDive.get()).toBe(false);
    expect(second.stripHintSeen.get()).toBe(true);
    expect(browser.data.get(DEEP_DIVE_KEY)).toBe("hidden");
    expect(browser.data.get(STRIP_HINT_KEY)).toBe("seen");
  });

  it("serve stable snapshots and server defaults", () => {
    const { stores, memory } = profile().load();
    expect(stores.visited.get()).toBe(stores.visited.get());
    expect(stores.prefs.get()).toBe(stores.prefs.get());
    memory.setLast("typo-2");
    expect(stores.prefs.get()).toBe(stores.prefs.get());
    expect(stores.visited.server().size).toBe(0);
    expect(stores.prefs.server()).toEqual({ mode: "side", zoom: 1 });
    expect(stores.deepDive.server()).toBe(true);
    expect(stores.stripHintSeen.server()).toBe(true);
    expect(stores.continueRule.server()).toBeNull();
  });

  it("keep working, for this load, when storage is blocked", () => {
    const blocked = () => {
      throw new Error("SecurityError");
    };
    const storage = { getItem: blocked, setItem: blocked, removeItem: blocked };
    for (const getStorage of [() => storage, blocked, () => null]) {
      const memory = createMemoryStore(getStorage, undefined, () => null);
      const stores = createCatalogStores({ memory, getStorage, getEvents: () => null });
      expect(stores.deepDive.get()).toBe(true);
      expect(stores.stripHintSeen.get()).toBe(false);
      expect(() => {
        stores.setDeepDiveOpen(false);
        stores.dismissStripHint();
        stores.writePrefs({ zoom: 2 });
      }).not.toThrow();
      expect(stores.deepDive.get()).toBe(false);
      expect(stores.stripHintSeen.get()).toBe(true);
      expect(stores.prefs.get().zoom).toBe(2);
    }
  });

  it("follow another tab through storage events", () => {
    const browser = profile();
    const { stores } = browser.load();
    const onDeep = vi.fn();
    const onVisited = vi.fn();
    const stopDeep = stores.deepDive.subscribe(onDeep);
    const stopVisited = stores.visited.subscribe(onVisited);
    expect(stores.deepDive.get()).toBe(true);
    expect(stores.visited.get().size).toBe(0);
    browser.otherTab(DEEP_DIVE_KEY, "hidden");
    expect(onDeep).toHaveBeenCalledOnce();
    expect(stores.deepDive.get()).toBe(false);
    browser.otherTab(MEMORY_KEY, JSON.stringify({ visited: ["color-4"] }));
    expect(onVisited).toHaveBeenCalledOnce();
    expect([...stores.visited.get()]).toEqual(["color-4"]);
    browser.otherTab("unrelated", "1");
    expect(onDeep).toHaveBeenCalledOnce();
    stopDeep();
    stopVisited();
    browser.otherTab(DEEP_DIVE_KEY, null);
    expect(onDeep).toHaveBeenCalledOnce();
  });

  it("keep the deep dive open unless hidden, and reopen it by clearing the key", () => {
    const browser = profile({ [MEMORY_KEY]: JSON.stringify({ prefs: { inspectorOpen: false } }) });
    const { stores } = browser.load();
    expect(stores.deepDive.get()).toBe(true);
    const listener = vi.fn();
    stores.deepDive.subscribe(listener);
    stores.setDeepDiveOpen(false);
    expect(stores.deepDive.get()).toBe(false);
    stores.setDeepDiveOpen(true);
    expect(stores.deepDive.get()).toBe(true);
    expect(browser.data.has(DEEP_DIVE_KEY)).toBe(false);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("read Continue once per load, so the rule just opened never becomes Continue", () => {
    const browser = profile({ [MEMORY_KEY]: JSON.stringify({ last: "typo-3" }) });
    const { memory, stores } = browser.load();
    expect(stores.continueRule.get()).toBe("typo-3");
    memory.trackRule("layout-2")();
    expect(stores.readLast()).toBe("layout-2");
    expect(stores.continueRule.get()).toBe("typo-3");
    expect(browser.load().stores.continueRule.get()).toBe("layout-2");
  });

  it("suppress Continue on a deep-linked load, before or after the first read", () => {
    const browser = profile({ [MEMORY_KEY]: JSON.stringify({ last: "typo-3", recent: ["typo-3", "sys-12"] }) });
    const early = browser.load().stores;
    early.continueRule.suppress();
    expect(early.continueRule.get()).toBeNull();
    const late = browser.load().stores;
    expect(late.continueRule.get()).toBe("typo-3");
    late.continueRule.suppress();
    expect(late.continueRule.get()).toBeNull();
    expect(late.readRecent().map((rule) => rule.id)).toEqual(["typo-3"]);
  });

  it("name the strip-hint flag for what it holds: seen, true on the server and for a returning reader", () => {
    const { stores } = profile({ [MEMORY_KEY]: JSON.stringify({ visited: ["typo-1"] }) }).load();
    expect(stores.stripHintSeen.server()).toBe(true);
    expect(stores.stripHintSeen.get()).toBe(true);
    expect(stores).not.toHaveProperty("stripHint");
  });

  it("show the strip hint only to a reader without history", () => {
    expect(profile().load().stores.stripHintSeen.get()).toBe(false);
    expect(profile({ [MEMORY_KEY]: JSON.stringify({ recent: ["typo-1"] }) }).load().stores.stripHintSeen.get()).toBe(false);
    expect(profile({ [MEMORY_KEY]: JSON.stringify({ recent: ["typo-1", "typo-2"] }) }).load().stores.stripHintSeen.get()).toBe(true);
    expect(profile({ [MEMORY_KEY]: JSON.stringify({ visited: ["typo-1"] }) }).load().stores.stripHintSeen.get()).toBe(true);
    const browser = profile();
    const { stores } = browser.load();
    stores.dismissStripHint();
    stores.dismissStripHint();
    expect(browser.storage.setItem).toHaveBeenCalledTimes(1);
  });
});

describe("a failed storage refresh", () => {
  it("keeps the session's choices instead of resetting them to defaults", () => {
    const browser = profile();
    const { memory, stores } = browser.load();
    const subscriptions = [memory.subscribe(() => {}), stores.deepDive.subscribe(() => {})];
    memory.setLast("typo-2");
    memory.markVisited("typo-2");
    memory.setPrefs({ singleKeys: false, zoom: 2 });
    stores.setDeepDiveOpen(false);

    vi.mocked(browser.storage.getItem).mockImplementation(() => {
      throw new Error("blocked");
    });
    browser.otherTab(MEMORY_KEY, "{}");
    browser.otherTab(DEEP_DIVE_KEY, null);

    expect(memory.getSnapshot()).toMatchObject({ last: "typo-2", visited: ["typo-2"], prefs: { singleKeys: false, zoom: 2 } });
    expect(stores.deepDive.get()).toBe(false);
    subscriptions.forEach((unsubscribe) => unsubscribe());
  });

  it("still follows a successful read, including another tab clearing storage", () => {
    const browser = profile();
    const { memory, stores } = browser.load();
    const subscriptions = [memory.subscribe(() => {}), stores.deepDive.subscribe(() => {})];
    memory.setPrefs({ singleKeys: false });
    stores.setDeepDiveOpen(false);

    browser.otherTab(MEMORY_KEY, null);
    browser.otherTab(DEEP_DIVE_KEY, null);

    expect(memory.getSnapshot().prefs.singleKeys).toBe(true);
    expect(stores.deepDive.get()).toBe(true);
    subscriptions.forEach((unsubscribe) => unsubscribe());
  });
});

describe("several readers of one store", () => {
  it("all hear one change from another tab", () => {
    const browser = profile();
    const { stores } = browser.load();
    const first = vi.fn();
    const second = vi.fn();
    const stops = [stores.deepDive.subscribe(first), stores.deepDive.subscribe(second)];
    expect(stores.deepDive.get()).toBe(true);
    browser.otherTab(DEEP_DIVE_KEY, "hidden");
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
    expect(stores.deepDive.get()).toBe(false);
    stops.forEach((stop) => stop());
  });

  it("re-read storage when a reader returns, so a save never overwrites another tab's change", () => {
    const browser = profile();
    const { memory, stores } = browser.load();
    const stop = memory.subscribe(() => {});
    memory.setPrefs({ zoom: 2 });
    stop();
    browser.otherTab(MEMORY_KEY, JSON.stringify({ visited: ["color-4"], prefs: { zoom: 2, compareMode: "flip" } }));
    const listener = vi.fn();
    const again = memory.subscribe(listener);
    memory.setPrefs({ singleKeys: false });
    const stored = JSON.parse(browser.data.get(MEMORY_KEY) ?? "{}");
    expect(stored.visited).toEqual(["color-4"]);
    expect(stored.prefs).toMatchObject({ compareMode: "flip", zoom: 2, singleKeys: false });
    again();

    const flagStop = stores.deepDive.subscribe(() => {});
    expect(stores.deepDive.get()).toBe(true);
    flagStop();
    browser.otherTab(DEEP_DIVE_KEY, "hidden");
    const flagAgain = stores.deepDive.subscribe(() => {});
    expect(stores.deepDive.get()).toBe(false);
    flagAgain();
  });
});
