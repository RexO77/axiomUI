import { describe, expect, it, vi } from "vitest";
import { readThemeMode, writeThemeMode } from "@/lib/theme-storage";

describe("theme storage", () => {
  it.each(["light", "dark", "system"] as const)("reads a stored %s preference", (mode) => {
    const getItem = vi.fn(() => mode);
    expect(readThemeMode(() => ({ getItem }))).toBe(mode);
    expect(getItem).toHaveBeenCalledWith("axiom-theme:v1");
  });

  it.each([null, "", "invalid"])("uses the system preference for %s", (stored) => {
    expect(readThemeMode(() => ({ getItem: () => stored }))).toBe("system");
  });

  it("uses the system preference when getItem throws", () => {
    const getItem = vi.fn(() => { throw new Error("Storage denied"); });
    expect(readThemeMode(() => ({ getItem }))).toBe("system");
    expect(getItem).toHaveBeenCalledOnce();
  });

  it("uses the system preference when accessing storage itself throws", () => {
    expect(readThemeMode(() => { throw new Error("Storage denied"); })).toBe("system");
  });

  it.each(["light", "dark", "system"] as const)("persists a %s preference", (mode) => {
    const setItem = vi.fn();
    writeThemeMode(() => ({ setItem }), mode);
    expect(setItem).toHaveBeenCalledWith("axiom-theme:v1", mode);
  });

  it("lets theme changes continue when setItem throws", () => {
    const setItem = vi.fn(() => { throw new Error("Storage full"); });
    expect(() => writeThemeMode(() => ({ setItem }), "dark")).not.toThrow();
    expect(() => writeThemeMode(() => ({ setItem }), "light")).not.toThrow();
    expect(setItem).toHaveBeenCalledTimes(2);
  });

  it("lets theme changes continue when accessing storage itself throws", () => {
    expect(() => writeThemeMode(() => { throw new Error("Storage denied"); }, "dark")).not.toThrow();
  });
});
