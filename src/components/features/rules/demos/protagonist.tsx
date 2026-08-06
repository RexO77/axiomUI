import type { RefObject } from "react";

import { cn } from "@/lib/utils";

/**
 * The thing that moves. Blue accent so the eye knows what to watch;
 * optional label so race/load demos aren't anonymous chips.
 */
export function ProtagonistChip({
    label,
    chipRef,
    className,
    compact = false,
}: {
    label?: string;
    chipRef?: RefObject<HTMLDivElement | null>;
    className?: string;
    compact?: boolean;
}) {
    return (
        <div
            ref={chipRef}
            className={cn(
                "flex items-center gap-1.5 rounded-md border border-blue-500 bg-blue-500/10 shadow-sm dark:border-blue-400 dark:bg-blue-400/10",
                compact ? "h-6 px-1.5" : "h-9 px-2.5",
                className
            )}
        >
            <span
                className={cn(
                    "shrink-0 rounded-full bg-blue-500 dark:bg-blue-400",
                    compact ? "size-1" : "size-1.5"
                )}
            />
            {label ? (
                <span
                    className={cn(
                        "truncate font-semibold tracking-tight text-blue-700 dark:text-blue-300",
                        compact ? "text-[9px]" : "text-[11px]"
                    )}
                >
                    {label}
                </span>
            ) : (
                <span
                    className={cn(
                        "rounded-sm bg-blue-500/35 dark:bg-blue-400/35",
                        compact ? "h-1 w-4" : "h-1.5 w-6"
                    )}
                />
            )}
        </div>
    );
}

/** Shared dashed rail for race / interrupt / load demos. */
export function MotionRail({
    children,
    railRef,
    className,
}: {
    children: React.ReactNode;
    railRef?: RefObject<HTMLDivElement | null>;
    className?: string;
}) {
    return (
        <div
            ref={railRef}
            className={cn(
                "relative flex w-full items-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50/80 p-2 dark:border-neutral-700 dark:bg-neutral-900/50",
                className
            )}
            style={{ containerType: "inline-size" }}
        >
            {children}
        </div>
    );
}
