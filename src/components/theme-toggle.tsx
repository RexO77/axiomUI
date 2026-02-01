"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

type ThemeMode = "light" | "dark" | "system";

const storageKey = "axiom-theme:v1";
const defaultMode: ThemeMode = "system";

const getInitialThemeMode = (): ThemeMode => {
  if (typeof window === "undefined") {
    return defaultMode;
  }

  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // Ignore storage failures
  }

  return defaultMode;
};

const themeOptions: Array<{
  id: ThemeMode;
  label: string;
  icon: typeof Sun;
}> = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const isDark = mode === "dark" || (mode === "system" && media.matches);
  root.classList.toggle("dark", isDark);
}

export default function ThemeToggle() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode);

  useEffect(() => {
    applyTheme(themeMode);
    try {
      window.localStorage.setItem(storageKey, themeMode);
    } catch {
      // Ignore storage failures
    }

    if (themeMode !== "system") {
      return undefined;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [themeMode]);

  const activeOption = themeOptions.find((option) => option.id === themeMode);
  const Icon = activeOption?.icon ?? Monitor;
  const label = activeOption?.label ?? "System";

  const nextTheme = (mode: ThemeMode): ThemeMode => {
    if (mode === "light") return "dark";
    if (mode === "dark") return "system";
    return "light";
  };

  return (
    <button
      type="button"
      onClick={() => setThemeMode(nextTheme(themeMode))}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
      aria-label={`Theme: ${label}`}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
