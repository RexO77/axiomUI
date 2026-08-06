"use client";

import type { ReactNode, RefObject } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Variant } from "@/components/features/rules/preview-primitives";

/**
 * Shared chrome for showcase panes: Do/Don't header, framed stage, optional
 * timing bar, caption. Used by both the WAAPI showcase (motion-showcase) and
 * the drag prototypes (drag-showcases) so the two read as one system.
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
    const isDo = variant === "do";
    return (
        <div className="min-w-0">
            <div className="mb-2 flex items-center gap-1.5">
                {isDo ? (
                    <CheckCircle2 aria-hidden="true" className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                    <XCircle aria-hidden="true" className="size-3.5 text-rose-600 dark:text-rose-300" />
                )}
                <span
                    className={cn(
                        "text-[11px] font-semibold",
                        isDo ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-200"
                    )}
                >
                    {isDo ? "Do" : "Don't"}
                </span>
            </div>
            {/* No stage border — lg scenes carry their own frame; wrapping
                them again reads as box-in-box. */}
            <div ref={paneRef} aria-hidden="true">
                {children}
            </div>
            {bar ? <div className="mt-2">{bar}</div> : null}
            <p className="mt-1.5 text-xs leading-snug text-neutral-500 dark:text-neutral-400">
                {caption}
            </p>
        </div>
    );
}

export function Hint({ children }: { children: ReactNode }) {
    return <span className="text-xs text-neutral-500 dark:text-neutral-400">{children}</span>;
}

export function ControlButton({
    onClick,
    children,
    disabled = false,
}: {
    onClick: () => void;
    children: ReactNode;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                // Matches the speed segments: 44px on touch, dense for a mouse.
                "inline-flex min-h-9 items-center gap-1.5 rounded-md border border-neutral-300 px-3 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 pointer-coarse:min-h-11 pointer-coarse:px-4 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800",
                disabled && "pointer-events-none opacity-50"
            )}
        >
            {children}
        </button>
    );
}
