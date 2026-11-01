import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type Variant = "do" | "dont";
export type DemoProps = { variant: Variant };

// One renderer per rule category (previews/*.tsx). Returns null for ids the
// module doesn't own; rule-previews.test.ts holds every static rule to a pane.
export type PreviewRenderer = (ruleId: string, variant: Variant) => ReactNode | null;

// The ink for the mono evidence annotations under a mini UI (measurements,
// narration, axis labels). It sits a step below the scene's own text, so the
// product stays the protagonist, but it is evidence the reader is meant to
// read: neutral-500 on the white frame is 4.7:1 and neutral-400 on the dark
// frame (#0a0a0a) is 7.8:1. The 2.5:1 neutral-400-on-white it replaces is
// color-9's own Don't.
export const ANNOTATION_INK = "text-neutral-500 dark:text-neutral-400";

// The same annotation sitting on a tinted fill inside the frame rather than
// on the frame itself. neutral-500 drops to 4.4:1 on neutral-100 and to 4.0:1
// on blue-500/15 over white, so light mode steps up to neutral-600 (6.5:1 or
// better on both). Dark keeps neutral-400, which stays above 6.6:1 on those
// fills over #0a0a0a.
export const ANNOTATION_INK_ON_FILL = "text-neutral-600 dark:text-neutral-400";

export function PreviewFrame({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            aria-hidden="true"
            className={cn(
                "preview-frame relative min-h-[150px] overflow-hidden rounded-[10px] bg-white p-4 text-xs text-neutral-700 dark:bg-neutral-950 dark:text-neutral-200",
                className
            )}
        >
            {children}
        </div>
    );
}

export function MiniButton({
    label,
    variant,
    className,
}: {
    label: string;
    variant: "primary" | "secondary" | "ghost" | "danger" | "disabled";
    className?: string;
}) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                "inline-flex max-w-full items-center justify-center truncate rounded-md px-3 py-1.5 text-xs font-semibold",
                variant === "primary" && "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900",
                variant === "secondary" &&
                    "border border-neutral-300 text-neutral-700 dark:border-neutral-700 dark:text-neutral-200",
                variant === "ghost" && "text-neutral-500 dark:text-neutral-400",
                variant === "danger" && "bg-rose-600 text-white",
                variant === "disabled" && "bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500",
                className
            )}
        >
            {label}
        </span>
    );
}

export function MiniLine({
    widthClass,
    className,
}: {
    widthClass: string;
    className?: string;
}) {
    return <div className={cn("h-2 rounded bg-neutral-200 dark:bg-neutral-800", widthClass, className)} />;
}
