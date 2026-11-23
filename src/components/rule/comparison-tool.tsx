// design-system: strict
"use client";

import { useEffect, useRef, useSyncExternalStore, type MouseEvent, type ReactNode, type Ref } from "react";
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
  const follow = useRef<() => void>(undefined);
  useEffect(() => () => follow.current?.(), []);
  // On a phone the panes stack, so showing one pane shortens the page by a
  // pane's height and the dock would slide away from the finger that tapped
  // it. The canvas height eases over --motion-medium, so follow the dock
  // through that transition. A ResizeObserver runs after each frame's layout
  // and before its paint, so the correction lands in the same frame. Track the
  // dock's offset within the scroller, not the viewport, so a scroll the
  // reader makes meanwhile is never undone, and carry the sub-pixel remainder
  // a whole-pixel scrollTop drops.
  const choose = (next: View) => {
    const el = dock.current;
    const stage = el?.closest<HTMLElement>(".cmp-stage");
    const scroller = el?.closest<HTMLElement>(".shell-sheet") ?? document.scrollingElement;
    follow.current?.();
    if (!el || !stage || !scroller) { setView(next); return; }
    const offset = () => el.getBoundingClientRect().top + scroller.scrollTop;
    let last = offset(), pending = 0;
    const settle = () => {
      const now = offset();
      pending += now - last;
      last = now;
      if (Math.abs(pending) < 1) return;
      const from = scroller.scrollTop;
      scroller.scrollTop = from + pending;
      pending -= scroller.scrollTop - from;
    };
    const observer = new ResizeObserver(settle);
    // The transition is 220ms; 400ms covers it with frames to spare.
    const timer = setTimeout(() => follow.current?.(), 400);
    follow.current = () => { observer.disconnect(); clearTimeout(timer); follow.current = undefined; };
    flushSync(() => setView(next));
    settle();
    observer.observe(stage);
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
