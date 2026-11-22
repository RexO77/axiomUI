// design-system: strict
"use client";

import { useSyncExternalStore, type MouseEvent, type ReactNode, type Ref } from "react";
import { Kbd } from "@/components/ui/kbd";
import { Tooltip } from "@/components/ui/tooltip";
import { memoryStore } from "@/lib/navigation/memory";

const subscribeMemory = memoryStore.subscribe;
const readSingleKeys = () => memoryStore.getSnapshot().prefs.singleKeys;
const serverSingleKeys = () => true;

export function useComparisonKeys() {
  return useSyncExternalStore(subscribeMemory, readSingleKeys, serverSingleKeys);
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
