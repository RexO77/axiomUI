// design-system: strict
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type KbdProps = ComponentProps<"kbd"> & {
  size?: "default" | "lg";
  "data-off"?: boolean;
};

export function Kbd({ className, size = "default", "data-off": off = false, ...props }: KbdProps) {
  return (
    <kbd
      {...props}
      data-off={off || undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-kbd px-1 font-sans text-xs leading-4 font-medium",
        size === "lg" ? "min-h-5.5 min-w-5.5 text-ink-secondary" : "min-h-4.5 min-w-4.5 text-ink-muted",
        off ? "shadow-keycap-off" : "shadow-keycap",
        className,
      )}
    />
  );
}
