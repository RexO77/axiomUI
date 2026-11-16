export type ThemeMode = "light" | "dark" | "system";

const storageKey = "axiom-theme:v1";

export function readThemeMode(getStorage: () => Pick<Storage, "getItem">): ThemeMode {
  try {
    const stored = getStorage().getItem(storageKey);
    return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
  } catch {
    return "system";
  }
}

export function writeThemeMode(getStorage: () => Pick<Storage, "setItem">, mode: ThemeMode): void {
  try {
    getStorage().setItem(storageKey, mode);
  } catch {
    // Persistence is optional; the provider still applies the choice in memory.
  }
}
