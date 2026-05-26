"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/use-haptics";
import { useTheme } from "@/components/providers/theme-provider";

export function ThemeToggle({ className }: { className?: string }) {
  const { tapMedium } = useHaptics();
  const { toggleTheme } = useTheme();

  const handleToggle = () => {
    tapMedium();
    toggleTheme();
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        "pressable relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-transparent text-neutral-600 hover:border-neutral-200 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
        className,
      )}
      aria-label="Toggle theme"
    >
      <Sun aria-hidden="true" className="hidden h-5 w-5 dark:block" />
      <Moon aria-hidden="true" className="h-5 w-5 dark:hidden" />
    </button>
  );
}
