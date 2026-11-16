"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { readThemeMode, writeThemeMode, type ThemeMode } from "@/lib/theme-storage";

type ThemeContextValue = {
  mode: ThemeMode;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getStoredMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "system";
  }

  return readThemeMode(() => window.localStorage);
}

function getSystemDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveDark(mode: ThemeMode) {
  return mode === "dark" || (mode === "system" && getSystemDark());
}

function applyTheme(mode: ThemeMode, lockTransitions: boolean) {
  const root = document.documentElement;
  const isDark = resolveDark(mode);

  if (lockTransitions) {
    root.classList.add("theme-change-lock");
  }

  root.classList.toggle("dark", isDark);
  root.dataset.theme = isDark ? "dark" : "light";
  root.style.colorScheme = isDark ? "dark" : "light";

  if (lockTransitions) {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        root.classList.remove("theme-change-lock");
      });
    });
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());

  useEffect(() => {
    applyTheme(mode, false);
  }, [mode]);

  useEffect(() => {
    if (mode !== "system") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system", true);
    media.addEventListener("change", handleChange);

    return () => {
      media.removeEventListener("change", handleChange);
    };
  }, [mode]);

  const toggleTheme = useCallback(() => {
    const nextMode: ThemeMode = document.documentElement.classList.contains("dark") ? "light" : "dark";
    writeThemeMode(() => window.localStorage, nextMode);
    setMode(nextMode);
    applyTheme(nextMode, true);
  }, []);

  const value = useMemo(() => ({ mode, toggleTheme }), [mode, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
