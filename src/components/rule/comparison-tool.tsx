// design-system: strict
"use client";

import { useSyncExternalStore, type MouseEvent, type ReactNode, type Ref } from "react";
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
  return (
    <div className="cmp-dock">
      <Tooltip side="top" content={<>Switch comparison view{keys ? <Kbd className="ml-2">F</Kbd> : null}</>}>
        <Segmented variant="capsule" label={keys ? "Comparison view (F)" : "Comparison view"} value={view} options={VIEWS} onChange={setView} />
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
