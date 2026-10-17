// design-system: strict
"use client";

import type { ReactNode, RefObject } from "react";

import { cn } from "@/lib/utils";
import type { Variant } from "@/components/features/rules/preview-primitives";
import { VerdictLabel } from "@/components/ui/verdict-label";

/**
 * Shared chrome for showcase panes: Do/Don't header, framed stage, optional
 * timing bar, caption. Used by both the WAAPI showcase (motion-showcase) and
 * the drag prototypes (drag-showcases) so the two read as one system.
 *
 * The caption is set in mono, like the grid previews' captions: it states
 * spec facts (durations, curves, scale values) and reads as evidence.
 */
export function PaneChrome({
    variant,
    caption,
    paneRef,
    bar,
    children,
}: {
    variant: Variant;
    caption: string;
    paneRef?: RefObject<HTMLDivElement | null>;
    bar?: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="min-w-0">
            <div className="mb-2 flex">
                <VerdictLabel verdict={variant} />
            </div>
            {/* No stage border — lg scenes carry their own frame; wrapping
                them again reads as box-in-box. */}
            <div ref={paneRef} aria-hidden="true">
                {children}
            </div>
            {bar ? <div className="mt-2">{bar}</div> : null}
            <p className="mt-1.5 font-mono text-xs leading-5 text-ink-muted">{caption}</p>
        </div>
    );
}

export function Hint({ children }: { children: ReactNode }) {
    return <span className="text-xs text-ink-muted">{children}</span>;
}

/** The radius every showcase control shares: 12px, what `rounded-md` drew
 *  before plan 015 W3-A returns that utility to Tailwind's 6px. */
export const CONTROL_RADIUS = "rounded-[12px]";

export function ControlButton({
    onClick,
    children,
    disabled = false,
    pressed,
}: {
    onClick: () => void;
    children: ReactNode;
    disabled?: boolean;
    pressed?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-pressed={pressed}
            className={cn(
                // Matches the speed segments: 44px on touch, dense for a mouse.
                "inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap border border-line-strong px-3 text-xs font-medium text-ink-secondary transition-colors hover:bg-fill hover:text-ink pointer-coarse:min-h-11 pointer-coarse:px-4",
                CONTROL_RADIUS,
                disabled && "pointer-events-none opacity-50"
            )}
        >
            {children}
        </button>
    );
}
