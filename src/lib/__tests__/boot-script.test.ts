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
function runScript(store: BootStorage | "blocked" | null, matchMedia: BootMatchMedia | null, search = "") {
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
  window.location = { search };
  new Function("window", "document", bootScript())(window, { documentElement });
  return set;
}

const cases: { name: string; store: BootStorage | null; matchMedia: BootMatchMedia | null; expected: Record<string, string> }[] = [
  { name: "a first visit", store: storage({}), matchMedia: media(false), expected: { side: "do" } },
  { name: "no storage, no matchMedia", store: null, matchMedia: null, expected: { side: "do" } },
  { name: "sidebar open", store: storage({ [MEMORY_KEY]: memory({ sidebarOpen: true }) }), matchMedia: media(false), expected: { side: "do", rail: "open" } },
  { name: "sidebar closed", store: storage({ [MEMORY_KEY]: memory({ sidebarOpen: false }) }), matchMedia: media(false), expected: { side: "do", rail: "closed" } },
  { name: "sidebar unset (responsive default)", store: storage({ [MEMORY_KEY]: memory({ sidebarOpen: null }) }), matchMedia: null, expected: { side: "do" } },
  { name: "sidebar as a string", store: storage({ [MEMORY_KEY]: memory({ sidebarOpen: "true" }) }), matchMedia: null, expected: { side: "do" } },
  { name: "corrupt memory", store: storage({ [MEMORY_KEY]: "{nope" }), matchMedia: null, expected: { side: "do" } },
  { name: "memory that is not an object", store: storage({ [MEMORY_KEY]: "5" }), matchMedia: null, expected: { side: "do" } },
  { name: "deep dive hidden", store: storage({ [DEEP_DIVE_KEY]: "hidden" }), matchMedia: null, expected: { side: "do", deep: "hidden" } },
  { name: "deep dive any other value", store: storage({ [DEEP_DIVE_KEY]: "open" }), matchMedia: null, expected: { side: "do" } },
  { name: "reduced motion", store: storage({}), matchMedia: media(true), expected: { side: "do", reduced: "" } },
  {
    name: "everything at once",
    store: storage({ [MEMORY_KEY]: memory({ sidebarOpen: true }), [DEEP_DIVE_KEY]: "hidden" }),
    matchMedia: media(true),
    expected: { side: "do", rail: "open", deep: "hidden", reduced: "" },
  },
  { name: "throwing storage", store: throwing, matchMedia: media(true), expected: { side: "do", reduced: "" } },
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
    expect(bootAttributes(throwing, explode)).toEqual({ side: "do" });
    expect(runScript("blocked", explode)).toEqual({ side: "do" });
    expect(runScript("blocked", media(true))).toEqual({ side: "do", reduced: "" });
  });

  const sides: [search: string, side: "do" | "dont"][] = [
    ["", "do"],
    ["?show=dont", "dont"],
    ["?q=toast&show=dont", "dont"],
    ["?show=dont&q=toast", "dont"],
    ["?show=do", "do"],
    ["?show=donts", "do"],
    ["?noshow=dont", "do"],
    // URLSearchParams.get reads the first value, and so does the script.
    ["?show=do&show=dont", "do"],
    ["?show=dont&show=do", "dont"],
  ];
  for (const [search, side] of sides) {
    it(`paints the ${side} side first for "${search}", as routes.parseLocation reads it`, () => {
      expect(bootAttributes(null, null, search).side).toBe(side);
      expect(runScript(null, null, search).side).toBe(side);
      expect(new URLSearchParams(search).get("show") === "dont" ? "dont" : "do").toBe(side);
    });
  }

  const pending: [search: string, pending: boolean][] = [
    ["", false],
    ["?show=dont", false],
    ["?q=", false],
    ["?q=toast", true],
    ["?show=dont&q=toast", true],
    ["?collection=accessibility", true],
    ["?collection=", false],
    ["?qq=toast", false],
  ];
  for (const [search, hides] of pending) {
    it(`${hides ? "holds" : "shows"} the wall at first paint for "${search}"`, () => {
      expect("filter-pending" in bootAttributes(null, null, search)).toBe(hides);
      expect("filter-pending" in runScript(null, null, search)).toBe(hides);
    });
  }

  it("is a single self-contained statement", () => {
    const script = bootScript();
    expect(script.startsWith("(function(){")).toBe(true);
    expect(script.endsWith("})();")).toBe(true);
    expect(script).not.toMatch(/<\/script/i);
  });
});
