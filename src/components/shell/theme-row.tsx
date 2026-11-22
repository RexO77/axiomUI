// design-system: strict
"use client";

/*
 * The rail's theme row. A switch is one root crossfade through a View
 * Transition (220ms; 140ms linear under reduced motion, where nothing moves
 * but the information still crossfades). Colours never tween one by one: the
 * theme provider locks element transitions for the swap. Started from the
 * keyboard, or without View Transitions, it is a 0ms swap.
 *
 * The visible label and the name follow the theme through CSS, so the server
 * render is right for either theme and nothing flips on hydration. Collapsed,
 * the label stays in the name and the tooltip shows it.
 */

import { Moon, Sun } from "@/components/ui/icons";
import { flushSync } from "react-dom";

import { useTheme } from "@/components/providers/theme-provider";
import { Tooltip } from "@/components/ui/tooltip";
import { prefersReducedMotion } from "@/lib/media";

/** One crossfade of the whole page, or a 0ms swap. The attribute picks its timing in overlays.css. */
export function switchTheme(toggle: () => void, instant: boolean): void {
  const root = document.documentElement;
  if (instant || typeof document.startViewTransition !== "function") {
    toggle();
    return;
  }
  root.dataset.themeFade = prefersReducedMotion() ? "reduced" : "on";
  const transition = document.startViewTransition(() => flushSync(toggle));
  // A skipped transition rejects `ready`; `finished` still settles.
  void transition.ready.catch(() => {});
  void transition.finished.finally(() => {
    delete root.dataset.themeFade;
  });
}

const Label = () => (
  <>
    <span className="dark:hidden">Switch to dark mode</span>
    <span className="hidden dark:inline">Switch to light mode</span>
  </>
);

export function ThemeRow({ expanded, keyboard }: { expanded: boolean; keyboard: () => boolean }) {
  const { toggleTheme } = useTheme();
  return (
    <Tooltip content={<Label />} disabled={expanded} className="w-full">
      <button type="button" className="rail-row" onClick={(event) => switchTheme(toggleTheme, event.detail === 0 || keyboard())}>
        <Moon aria-hidden="true" className="dark:hidden" />
        <Sun aria-hidden="true" className="hidden dark:block" />
        <span className="rail-row-label">
          <Label />
        </span>
      </button>
    </Tooltip>
  );
}
