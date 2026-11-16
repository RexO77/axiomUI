// design-system: strict
"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SegmentOption<T extends string> = {
  value: T;
  icon?: ReactNode;
  disabled?: boolean;
} & (
  | { label: ReactNode; name?: undefined }
  | {
      label: string;
      /**
       * Spoken after the visible label ("2×, 200%"), never instead of it: the
       * accessible name starts with the words a voice-control user reads.
       */
      name: string;
    }
);

/** Radio groups wrap; the navigation deck deliberately does not. */
export function segmentIndex(
  options: readonly { disabled?: boolean }[],
  current: number,
  key: string,
  direction: "ltr" | "rtl" = "ltr",
): number | null {
  const enabled = options.flatMap((option, index) => option.disabled ? [] : [index]);
  if (!enabled.length) return null;
  if (key === "Home") return enabled[0];
  if (key === "End") return enabled[enabled.length - 1];
  let step = key === "ArrowRight" || key === "ArrowDown" ? 1 : key === "ArrowLeft" || key === "ArrowUp" ? -1 : 0;
  if (!step) return null;
  if (direction === "rtl" && (key === "ArrowRight" || key === "ArrowLeft")) step *= -1;
  const at = enabled.indexOf(current);
  if (at === -1) return step === 1 ? enabled[0] : enabled[enabled.length - 1];
  return enabled[(at + step + enabled.length) % enabled.length];
}

export type SegmentedProps<T extends string> = {
  label: string;
  value: T;
  options: readonly SegmentOption<T>[];
  onChange: (value: T, viaKeyboard: boolean) => void;
  className?: string;
  disabled?: boolean;
  dir?: "ltr" | "rtl";
  variant?: "default" | "capsule";
  "aria-describedby"?: string;
};

/** When wrapped in Tooltip, put flex-row layout classes on the Tooltip wrapper. */
export function Segmented<T extends string>({ label, value, options, onChange, className, disabled, dir, variant = "default", "aria-describedby": describedBy }: SegmentedProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selected = options.findIndex((option) => option.value === value && !option.disabled);
  const tabStop = selected >= 0 ? selected : options.findIndex((option) => !option.disabled);

  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-describedby={describedBy}
      aria-disabled={disabled || undefined}
      dir={dir}
      className={cn(
        "inline-flex min-h-8 shrink-0 items-center gap-0.5 bg-fill p-0.75 whitespace-nowrap phone:min-h-11",
        variant === "capsule" ? "rounded-full" : "rounded-control",
        className,
      )}
      onKeyDown={(event) => {
        if (disabled || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
        const current = refs.current.findIndex((element) => element === event.target);
        const direction = dir ?? (getComputedStyle(event.currentTarget).direction === "rtl" ? "rtl" : "ltr");
        const next = segmentIndex(options, current, event.key, direction);
        if (next === null) return;
        event.preventDefault();
        refs.current[next]?.focus();
        onChange(options[next].value, true);
      }}
    >
      {options.map((option, index) => (
        <button
          key={option.value}
          ref={(element) => { refs.current[index] = element; }}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          aria-label={option.name ? `${option.label}, ${option.name}` : undefined}
          disabled={disabled || option.disabled}
          tabIndex={!disabled && index === tabStop ? 0 : -1}
          className={cn(
            "relative inline-flex min-h-6.5 shrink-0 items-center justify-center gap-1.5 px-2.5 text-[13px] leading-5 font-medium whitespace-nowrap transition-[background-color,color,box-shadow] duration-fast ease-out-strong focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring disabled:opacity-50 phone:min-h-9.5 phone:min-w-11 phone:before:absolute phone:before:inset-x-0 phone:before:top-1/2 phone:before:h-11 phone:before:-translate-y-1/2 [&_svg]:size-3.5",
            variant === "capsule" ? "rounded-full" : "rounded-item",
            option.value === value ? "bg-raised text-ink shadow-item forced-colors:outline" : "text-ink-muted hover:text-ink",
          )}
          onClick={(event) => onChange(option.value, event.detail === 0)}
        >
          {option.icon ? <span aria-hidden="true" className={option.value === value ? "text-ink-secondary" : "text-ink-muted"}>{option.icon}</span> : null}
          {option.label}
        </button>
      ))}
    </div>
  );
}
