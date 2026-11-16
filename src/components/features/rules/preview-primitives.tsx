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
// frame (#0a0a0a) is about 7.6:1. The 2.6:1 neutral-400-on-white it replaces is
// color-9's own Don't.
export const ANNOTATION_INK = "text-neutral-500 dark:text-neutral-400";

// The same annotation sitting on a tinted fill inside the frame rather than
// on the frame itself. neutral-500 drops to 4.4:1 on neutral-100 and to 4.0:1
// on blue-500/15 over white, so light mode steps up to neutral-600 (6.5:1 or
// better on both). Dark keeps neutral-400, which stays above 6.6:1 on those
// fills over #0a0a0a.
export const ANNOTATION_INK_ON_FILL = "text-neutral-600 dark:text-neutral-400";

// Every evidence label in a static preview renders through <Annotation>, so
// its context can choose whether to show it: the rule page reads the label
// beside the scene, a gallery tile hides `[data-annotation]:not([data-keep])`
// and lets the scene carry the difference alone. The caller passes the whole
// class string (size, tone and layout), because cn() is plain concatenation
// and a default ink here would stack against an accent one.
//
// Only evidence goes here: measurements, narration, axis labels. Text the
// depicted product would show (a file size, a price, a field value, a kbd
// key, a code chip) stays a plain element, since a tile without it would be
// a different product. rule-previews.test.ts holds every mono label to one
// side of that line.
//
// `keep` marks the label a pane cannot make its point without: with it gone,
// Do and Don't render alike, so a tile keeps it until the scene is redrawn.
export function Annotation({
    children,
    className,
    keep = false,
}: {
    children: ReactNode;
    className?: string;
    keep?: boolean;
}) {
    return (
        <span data-annotation="" data-keep={keep ? "" : undefined} className={className}>
            {children}
        </span>
    );
}

// Secondary text inside the depicted product (subtitles, helper lines, meta
// like "2m ago"). These Tailwind steps clear 4.5:1 on white and neutral-900/950
// surfaces. Tinted fills need ANNOTATION_INK_ON_FILL instead: neutral-500 falls
// below 4.5:1 on neutral-100, while neutral-600 clears 7:1 there.
export const PRODUCT_MUTED = "text-neutral-500 dark:text-neutral-400";

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
                // Every branch carries a 1px border, transparent where the
                // fill is the edge, so a filled button and an outline button
                // set side by side are the same height. The colour lives in
                // the branch, never in the shared base, because cn() cannot
                // let a later border colour override an earlier one.
                variant === "primary" &&
                    "border border-transparent bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900",
                variant === "secondary" &&
                    "border border-neutral-300 text-neutral-700 dark:border-neutral-700 dark:text-neutral-200",
                variant === "ghost" && "border border-transparent text-neutral-500 dark:text-neutral-400",
                variant === "danger" && "border border-transparent bg-rose-600 text-white",
                // Disabled ink stays faint on purpose: WCAG 1.4.3 exempts
                // inactive controls, and the low contrast is what says "off".
                variant === "disabled" &&
                    "border border-transparent bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500",
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
