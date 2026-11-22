// design-system: strict
"use client";

import { useRef, useSyncExternalStore, type MouseEvent, type ReactNode, type Ref } from "react";
import { flushSync } from "react-dom";
import { CircleCheck, CircleX, Columns2 } from "@/components/ui/icons";
import { Segmented } from "@/components/ui/segmented";
import type { View } from "./use-compare";
import { Kbd } from "@/components/ui/kbd";
import { Tooltip } from "@/components/ui/tooltip";
import { memoryStore } from "@/lib/navigation/memory";

const subscribeMemory = memoryStore.subscribe;
const readSingleKeys = () => memoryStore.getSnapshot().prefs.singleKeys;
const serverSingleKeys = () => true;

export function useComparisonKeys() {
  return useSyncExternalStore(subscribeMemory, readSingleKeys, serverSingleKeys);
}

const VIEWS = [
  { value: "both", label: "Both", icon: <Columns2 /> },
  { value: "do", label: "Do", icon: <CircleCheck /> },
  { value: "dont", label: "Don’t", icon: <CircleX /> },
] as const satisfies readonly { value: View; label: string; icon: ReactNode }[];

export function ComparisonDock({ view, setView, keys, children }: {
  view: View; setView: (view: View) => void; keys: boolean; children: ReactNode;
}) {
  const dock = useRef<HTMLDivElement>(null);
  // On a phone the panes stack, so showing one pane shortens the page by a
  // pane's height and the dock would jump away from the finger that tapped
  // it. Commit the change, then scroll by however far the dock moved.
  const choose = (next: View) => {
    const el = dock.current;
    const before = el?.getBoundingClientRect().top;
    flushSync(() => setView(next));
    if (!el || before === undefined) return;
    const moved = el.getBoundingClientRect().top - before;
    if (Math.abs(moved) < 1) return;
    const scroller = el.closest<HTMLElement>(".shell-sheet") ?? document.scrollingElement;
    if (scroller) scroller.scrollTop += moved;
  };
  return (
    <div className="cmp-dock" ref={dock}>
      <Tooltip side="top" content={<>Switch comparison view{keys ? <Kbd className="ml-2">F</Kbd> : null}</>}>
        <Segmented variant="capsule" label={keys ? "Comparison view (F)" : "Comparison view"} value={view} options={VIEWS} onChange={choose} />
      </Tooltip>
      {children}
    </div>
  );
}

/**
 * An icon toggle in the toolbar's tool group. Its name states the shortcut
 * while single-key shortcuts are on, as its tooltip does.
 */
export function ToolToggle({ label, shortcut, keys, pressed, onClick, buttonRef, children }: {
  label: string;
  shortcut: string;
  keys: boolean;
  pressed: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  buttonRef?: Ref<HTMLButtonElement>;
  children: ReactNode;
}) {
  return (
    <Tooltip side="top" content={<>{label}{keys ? <Kbd className="ml-2">{shortcut}</Kbd> : null}</>}>
      <button
        ref={buttonRef}
        type="button"
        className="cmp-tool pressable"
        aria-pressed={pressed}
        aria-label={keys ? `${label} (${shortcut})` : label}
        aria-keyshortcuts={keys ? shortcut : undefined}
        onClick={onClick}
      >
        {children}
      </button>
    </Tooltip>
  );
}
