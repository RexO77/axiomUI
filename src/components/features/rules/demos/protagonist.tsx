import type { ReactNode, RefObject } from "react";

import { cn } from "@/lib/utils";

/** Chip sizes. `"narrow"` is compact until its rail reaches 18rem, then full:
 *  on a phone the two panes sit side by side at ~156px, and a full chip there
 *  leaves itself almost nowhere to travel. It needs a `MotionRail` (or any
 *  inline-size container) as its query container. */
const SIZE = {
    full: { chip: "h-9 px-2.5", dot: "size-1.5", text: "text-[11px]", bar: "h-1.5 w-6" },
    compact: { chip: "h-6 px-1.5", dot: "size-1", text: "text-[9px]", bar: "h-1 w-4" },
    narrow: {
        chip: "h-6 px-1.5 @2xs:h-9 @2xs:px-2.5",
        dot: "size-1 @2xs:size-1.5",
        text: "text-[9px] @2xs:text-[11px]",
        bar: "h-1 w-4 @2xs:h-1.5 @2xs:w-6",
    },
} as const;

/**
 * The thing that moves. Blue accent so the eye knows what to watch;
 * optional label so race/load demos aren't anonymous chips. Its radii are
 * pinned in pixels, so the chip keeps its shape when Tailwind's numeric
 * radius scale changes underneath it.
 *
 * `anim` sets the chip's data-anim target, for scenes the showcase engine
 * plays (the race and easing rails).
 */
export function ProtagonistChip({
    label,
    chipRef,
    anim,
    className,
    compact = false,
}: {
    label?: string;
    chipRef?: RefObject<HTMLDivElement | null>;
    anim?: string;
    className?: string;
    compact?: boolean | "narrow";
}) {
    const size = SIZE[compact === "narrow" ? "narrow" : compact ? "compact" : "full"];
    return (
        <div
            ref={chipRef}
            data-anim={anim}
            className={cn(
                "flex items-center gap-1.5 rounded-[12px] border border-blue-500 bg-blue-500/10 shadow-sm dark:border-blue-400 dark:bg-blue-400/10",
                size.chip,
                className
            )}
        >
            <span className={cn("shrink-0 rounded-full bg-blue-500 dark:bg-blue-400", size.dot)} />
            {label ? (
                <span
                    className={cn(
                        "truncate font-semibold tracking-tight text-blue-700 dark:text-blue-300",
                        size.text
                    )}
                >
                    {label}
                </span>
            ) : (
                <span className={cn("rounded-full bg-blue-500/35 dark:bg-blue-400/35", size.bar)} />
            )}
        </div>
    );
}

/**
 * Shared dashed rail for the race, easing, interrupt and load demos. Its
 * colours match the drag and tooltip stages, which draw the same rail inline.
 *
 * The corner is its own prop because cn() concatenates rather than merges: a
 * radius in `className` would fight the default instead of replacing it.
 * Leave `className` to size and layout. The default is the 16px every
 * showcase stage shares.
 *
 * `hug` is for a rail that wraps its chip with no room to spare (the race and
 * easing scenes). Its padding drops to 3px so the chip's 12px corner sits
 * concentric in the rail's 16px one: 16 = 12 + 3 + the 1px border. A tall
 * rail (interrupt, load) keeps 8px, because its chip sits nowhere near a
 * corner.
 */
export function MotionRail({
    children,
    railRef,
    radius = "rounded-field",
    hug = false,
    className,
}: {
    children: ReactNode;
    railRef?: RefObject<HTMLDivElement | null>;
    radius?: "rounded-field" | `rounded-[${string}]`;
    hug?: boolean;
    className?: string;
}) {
    return (
        <div
            ref={railRef}
            className={cn(
                "relative flex w-full items-center border border-dashed border-neutral-300 bg-neutral-50/80 dark:border-neutral-700 dark:bg-neutral-900/50",
                hug ? "p-[3px]" : "p-2",
                radius,
                className
            )}
            style={{ containerType: "inline-size" }}
        >
            {children}
        </div>
    );
}
