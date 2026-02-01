"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState<boolean | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("axiom-theme:v1")
    if (stored === "dark" || stored === "light") {
      setIsDark(stored === "dark")
    } else {
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches)
    }
  }, [])

  useEffect(() => {
    if (isDark === null) return
    document.documentElement.classList.toggle("dark", isDark)
    localStorage.setItem("axiom-theme:v1", isDark ? "dark" : "light")
  }, [isDark])

  if (isDark === null) return null

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className={cn(
        "p-2 rounded-lg transition-colors",
        "hover:bg-neutral-100 dark:hover:bg-neutral-800",
        "text-neutral-600 dark:text-neutral-400",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}


