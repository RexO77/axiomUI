"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const storageKey = "axiom-theme:v1"
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return true
    try {
      const stored = window.localStorage.getItem(storageKey)
      if (stored === "dark") return true
      if (stored === "light") return false
    } catch {
      // Ignore storage failures
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  // next-themes
  // const { resolvedTheme, setTheme } = useTheme()
  // const isDark = resolvedTheme === "dark"
  // onClick={() => setTheme(isDark ? "light" : "dark")}

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", isDark)
    try {
      window.localStorage.setItem(storageKey, isDark ? "dark" : "light")
    } catch {
      // Ignore storage failures
    }
  }, [isDark])

  return (
    <button
      type="button"
      className={cn(
        "flex h-8 w-16 p-1 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950",
        isDark
          ? "bg-zinc-950 border border-zinc-800 hover:border-zinc-700"
          : "bg-white border border-zinc-200 hover:border-zinc-300",
        className
      )}
      onClick={() => setIsDark(!isDark)}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="flex justify-between items-center w-full">
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-[transform,background-color] duration-300",
            isDark
              ? "transform translate-x-0 bg-zinc-800"
              : "transform translate-x-8 bg-gray-200"
          )}
        >
          {isDark ? (
            <Moon
              aria-hidden="true"
              className="w-4 h-4 text-white"
              strokeWidth={1.5}
            />
          ) : (
            <Sun
              aria-hidden="true"
              className="w-4 h-4 text-gray-700"
              strokeWidth={1.5}
            />
          )}
        </div>
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-[transform,background-color] duration-300",
            isDark
              ? "bg-transparent"
              : "transform -translate-x-8"
          )}
        >
          {isDark ? (
            <Sun
              aria-hidden="true"
              className="w-4 h-4 text-gray-500"
              strokeWidth={1.5}
            />
          ) : (
            <Moon
              aria-hidden="true"
              className="w-4 h-4 text-black"
              strokeWidth={1.5}
            />
          )}
        </div>
      </div>
    </button>
  )
}
