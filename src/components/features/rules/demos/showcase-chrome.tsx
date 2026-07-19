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
            <div
                ref={paneRef}
                aria-hidden="true"
                className="rounded-lg border border-neutral-200 bg-white p-2.5 dark:border-neutral-800 dark:bg-neutral-950"
            >
                {children}
            </div>
            {bar ? (
                <div className="mt-1.5 h-0.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                    {bar}
                </div>
            ) : null}
            <p className="mt-1.5 text-[11px] leading-4 text-neutral-500 dark:text-neutral-400">{caption}</p>
        </div>
    );
}

export function Hint({ children }: { children: ReactNode }) {
    return <span className="text-xs text-neutral-500 dark:text-neutral-400">{children}</span>;
}

export function ControlButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
            {children}
        </button>
    );
}
