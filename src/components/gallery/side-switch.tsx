// design-system: strict
"use client";

/*
 * The wall's Do/Don't side. It lives in one attribute, `data-side` on <html>,
 * which the catalog's boot script sets from `?show` before the first paint;
 * gallery.css keys the panes, the rings and the Don't badges on it. React
 * reads it through a store whose server snapshot is "do" and writes it only
 * from events, never during render, so hydration never disagrees with it.
 */

import { CircleCheck, CircleX } from "lucide-react";
import { useSyncExternalStore } from "react";

import { Kbd } from "@/components/ui/kbd";
import { Segmented, type SegmentOption } from "@/components/ui/segmented";
import { Tooltip } from "@/components/ui/tooltip";
import type { GallerySide } from "@/lib/navigation/routes";

const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export function readSide(): GallerySide {
  return document.documentElement.dataset.side === "dont" ? "dont" : "do";
}

/** Paint a side. The URL is the caller's business: a held D shows a side without choosing it. */
export function writeSide(side: GallerySide): void {
  const root = document.documentElement;
  if (root.dataset.side === side) return;
  root.dataset.side = side;
  listeners.forEach((listener) => listener());
}

export function useSide(): GallerySide {
  return useSyncExternalStore(subscribe, readSide, () => "do");
}

const never = () => () => {};
const useHydrated = () => useSyncExternalStore(never, () => true, () => false);

const OPTIONS: readonly SegmentOption<GallerySide>[] = [
  { value: "do", label: "Do", icon: <CircleCheck className="gw-side-do" /> },
  { value: "dont", label: "Don’t", icon: <CircleX className="gw-side-dont" /> },
];

export type SideSwitchProps = {
  /** "bar" sits in the desktop toolbar under a tooltip; "capsule" floats in a phone's thumb zone. */
  variant: "bar" | "capsule";
  /** Show the D key in the tooltip (false while single-key shortcuts are off). */
  keyHint: boolean;
  onChoose: (side: GallerySide) => void;
};

export function SideSwitch({ variant, keyHint, onChoose }: SideSwitchProps) {
  const side = useSide();
  // Until hydration the switch can only show the server's "do". On a
  // ?show=dont load gallery.css keeps it hidden for that moment, so it never
  // contradicts the wall beside it.
  const pending = !useHydrated();
  const control = (
    <Segmented
      label="Show Do or Don’t examples"
      value={side}
      options={OPTIONS}
      variant={variant === "capsule" ? "capsule" : "default"}
      className={variant === "capsule" ? "gw-capsule" : undefined}
      onChange={(next) => onChoose(next)}
    />
  );
  return (
    <div className="gw-side" data-variant={variant} data-pending={pending || undefined}>
      {variant === "bar" ? (
        <Tooltip
          side="bottom"
          content={
            <>
              {side === "do" ? "Show Don’ts" : "Show Dos"}
              {keyHint ? <Kbd className="ml-2">D</Kbd> : null}
            </>
          }
        >
          {control}
        </Tooltip>
      ) : (
        control
      )}
    </div>
  );
}
