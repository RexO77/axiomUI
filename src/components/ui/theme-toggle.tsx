// design-system: strict
"use client";

import { Moon, Sun } from "lucide-react";
import { useHaptics } from "@/hooks/use-haptics";
import { useTheme } from "@/components/providers/theme-provider";
import { IconButton } from "@/components/ui/icon-button";

/**
 * The name follows the theme through CSS rather than state, so the server
 * render is already right for either theme and nothing flips on hydration.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { tapMedium } = useHaptics();
  const { toggleTheme } = useTheme();

  const handleToggle = () => {
    tapMedium();
    toggleTheme();
  };

  return (
    <IconButton
      size="sm"
      variant="ghost"
      onClick={handleToggle}
      className={className}
      label={
        <>
          <span className="dark:hidden">Switch to dark theme</span>
          <span className="hidden dark:inline">Switch to light theme</span>
        </>
      }
    >
      <Sun aria-hidden="true" className="hidden dark:block" />
      <Moon aria-hidden="true" className="dark:hidden" />
    </IconButton>
  );
}
