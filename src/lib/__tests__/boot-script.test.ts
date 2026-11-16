import { describe, expect, it } from "vitest";
import { BOOT_KEYS, bootAttributes, bootScript, type BootMatchMedia, type BootStorage } from "@/components/shell/boot-script";
import { DEEP_DIVE_KEY } from "@/lib/catalog/stores";
import { REDUCED_MOTION_QUERY } from "@/lib/media";
import { MEMORY_KEY } from "@/lib/navigation/memory";

function storage(values: Record<string, string>): BootStorage {
  return { getItem: (key) => (key in values ? values[key] : null) };
}
const throwing: BootStorage = {
  getItem: () => {
    throw new Error("SecurityError");
  },
};
const media = (reduced: boolean): BootMatchMedia => (query) => ({ matches: reduced && query === REDUCED_MOTION_QUERY });
const memory = (prefs: unknown) => JSON.stringify({ v: 1, prefs });

/** Run the inline script against a fake window and return what it set on <html>. */
function runScript(store: BootStorage | "blocked" | null, matchMedia: BootMatchMedia | null) {
  const set: Record<string, string> = {};
  const documentElement = { setAttribute: (name: string, value: string) => void (set[name.replace(/^data-/, "")] = value) };
  const window: Record<string, unknown> = {};
  if (store === "blocked") {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("SecurityError");
      },
    });
  } else window.localStorage = store;
  if (matchMedia) window.matchMedia = matchMedia;
  new Function("window", "document", bootScript())(window, { documentElement });
  return set;
}

const cases: { name: string; store: BootStorage | null; matchMedia: BootMatchMedia | null; expected: Record<string, string> }[] = [
  { name: "a first visit", store: storage({}), matchMedia: media(false), expected: {} },
  { name: "no storage, no matchMedia", store: null, matchMedia: null, expected: {} },
  { name: "sidebar open", store: storage({ [MEMORY_KEY]: memory({ sidebarOpen: true }) }), matchMedia: media(false), expected: { rail: "open" } },
  { name: "sidebar closed", store: storage({ [MEMORY_KEY]: memory({ sidebarOpen: false }) }), matchMedia: media(false), expected: { rail: "closed" } },
  { name: "sidebar unset (responsive default)", store: storage({ [MEMORY_KEY]: memory({ sidebarOpen: null }) }), matchMedia: null, expected: {} },
  { name: "sidebar as a string", store: storage({ [MEMORY_KEY]: memory({ sidebarOpen: "true" }) }), matchMedia: null, expected: {} },
  { name: "corrupt memory", store: storage({ [MEMORY_KEY]: "{nope" }), matchMedia: null, expected: {} },
  { name: "memory that is not an object", store: storage({ [MEMORY_KEY]: "5" }), matchMedia: null, expected: {} },
  { name: "deep dive hidden", store: storage({ [DEEP_DIVE_KEY]: "hidden" }), matchMedia: null, expected: { deep: "hidden" } },
  { name: "deep dive any other value", store: storage({ [DEEP_DIVE_KEY]: "open" }), matchMedia: null, expected: {} },
  { name: "reduced motion", store: storage({}), matchMedia: media(true), expected: { reduced: "" } },
  {
    name: "everything at once",
    store: storage({ [MEMORY_KEY]: memory({ sidebarOpen: true }), [DEEP_DIVE_KEY]: "hidden" }),
    matchMedia: media(true),
    expected: { rail: "open", deep: "hidden", reduced: "" },
  },
  { name: "throwing storage", store: throwing, matchMedia: media(true), expected: { reduced: "" } },
];

describe("boot attributes", () => {
  it("uses the stores' keys and the shared reduced-motion query", () => {
    expect(BOOT_KEYS.memory).toBe(MEMORY_KEY);
    expect(BOOT_KEYS.deepDive).toBe(DEEP_DIVE_KEY);
    expect(BOOT_KEYS.reducedQuery).toBe(REDUCED_MOTION_QUERY);
  });

  for (const { name, store, matchMedia, expected } of cases) {
    it(`${name}: the function and the inline script agree`, () => {
      expect(bootAttributes(store, matchMedia)).toEqual(expected);
      expect(runScript(store, matchMedia)).toEqual(expected);
    });
  }

  it("survives storage that throws on access, and a throwing matchMedia", () => {
    const explode: BootMatchMedia = () => {
      throw new Error("no media");
    };
    expect(bootAttributes(throwing, explode)).toEqual({});
    expect(runScript("blocked", explode)).toEqual({});
    expect(runScript("blocked", media(true))).toEqual({ reduced: "" });
  });

  it("is a single self-contained statement", () => {
    const script = bootScript();
    expect(script.startsWith("(function(){")).toBe(true);
    expect(script.endsWith("})();")).toBe(true);
    expect(script).not.toMatch(/<\/script/i);
  });
});
