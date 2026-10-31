import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type Variant = "do" | "dont";
export type PreviewSize = "sm" | "lg";
export type DemoProps = { variant: Variant; size: PreviewSize };

// One renderer per rule category (previews/*.tsx). Returns null for ids the
// module doesn't own so the dispatcher can fall through to the generic card.
export type PreviewRenderer = (
    ruleId: string,
    variant: Variant,
    size: PreviewSize
) => ReactNode | null;

// The ink for the mono evidence annotations under a mini UI (measurements,
// narration, axis labels). It sits a step below the scene's own text, so the
// product stays the protagonist, but it is evidence the reader is meant to
// read: neutral-500 on the white frame is 4.7:1 and neutral-400 on the dark
// frame (#0a0a0a) is 7.8:1. The 2.5:1 neutral-400-on-white it replaces is
// color-9's own Don't.
export const ANNOTATION_INK = "text-neutral-500 dark:text-neutral-400";

export function PreviewFrame({
    children,
    size,
    className,
}: {
    children: ReactNode;
    size: PreviewSize;
    className?: string;
}) {
    return (
        <div
            aria-hidden="true"
            className={cn(
                "preview-frame relative overflow-hidden rounded-[10px] bg-white text-neutral-700 dark:bg-neutral-950 dark:text-neutral-200",
                size === "lg" ? "min-h-[150px] p-4 text-xs" : "min-h-[54px] p-2 text-[10px] sm:min-h-[64px]",
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
    size,
    className,
}: {
    label: string;
    variant: "primary" | "secondary" | "ghost" | "danger" | "disabled";
    size: PreviewSize;
    className?: string;
}) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                "inline-flex max-w-full items-center justify-center truncate rounded-md font-semibold",
                size === "lg" ? "px-3 py-1.5 text-xs" : "px-2.5 py-1 text-[10px]",
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

export function MiniPill({
    label,
    size,
    tone = "neutral",
}: {
    label: string;
    size: PreviewSize;
    tone?: "neutral" | "accent" | "danger" | "success";
}) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 font-semibold",
                size === "lg" ? "text-[10px]" : "text-[9px]",
                tone === "neutral" &&
                    "border-neutral-200 bg-neutral-100 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
                tone === "accent" &&
                    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
                tone === "danger" &&
                    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300",
                tone === "success" &&
                    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
            )}
        >
            {label}
        </span>
    );
}
