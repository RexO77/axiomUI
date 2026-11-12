// design-system: strict
"use client";

import { Fragment, type ReactNode, type RefObject } from "react";
import { Play } from "lucide-react";

import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/media";
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
    interactive = false,
    bar,
    children,
}: {
    variant: Variant;
    caption: string;
    paneRef?: RefObject<HTMLDivElement | null>;
    interactive?: boolean;
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
            <div
                ref={paneRef}
                aria-hidden={interactive ? undefined : true}
                role={interactive ? "group" : undefined}
                aria-label={interactive ? (variant === "do" ? "Do" : "Don’t") : undefined}
            >
                {children}
            </div>
            {bar ? <div className="mt-2">{bar}</div> : null}
            <p className="mt-1.5 font-mono text-xs leading-5 wrap-break-word text-ink-muted">
                {withPathBreaks(caption)}
            </p>
        </div>
    );
}

/** A caption can name a property path (`element.style.transform`) that is
 *  wider than a pane on a phone. Offer a break after each dot inside a word,
 *  so it wraps at a joint instead of mid-identifier or past the pane. */
function withPathBreaks(caption: string): ReactNode {
    // Odd entries are the captured "x." joints; the break goes after each.
    // (No lookbehind: older Safari can't parse one, and would drop the module.)
    const parts = caption.split(/(\w\.)(?=\w)/);
    if (parts.length === 1) return caption;
    return parts.map((part, i) => (
        <Fragment key={i}>
            {part}
            {i % 2 === 1 ? <wbr /> : null}
        </Fragment>
    ));
}

export function Hint({ children }: { children: ReactNode }) {
    return <span className="text-xs text-ink-muted">{children}</span>;
}

/**
 * The control rows under a hand-built showcase, laid out as ShowcaseBody lays
 * out its own: the action on the left (Play icon plus label), the optional
 * speed control on the right, then each hint on its own line. Under reduced
 * motion `reducedNote` closes the list, so it can say what changed.
 *
 * Hints that describe motion the reader won't see under reduced motion are the
 * caller's to drop (pass `false`); the note then carries the explanation.
 */
export function ShowcaseControls({
    control,
    speed,
    hints = [],
    reducedNote,
}: {
    control?: {
        label: string;
        onClick: () => void;
        disabled?: boolean;
        /** Toggles have no playthrough to start, so they drop the Play icon. */
        icon?: boolean;
    };
    speed?: ReactNode;
    hints?: ReadonlyArray<string | false | null | undefined>;
    reducedNote?: string;
}) {
    const reduced = useReducedMotion();
    const lines = [...hints, reduced ? reducedNote : null].filter(
        (line): line is string => Boolean(line)
    );
    const hasRow = Boolean(control || speed);

    return (
        <>
            {hasRow ? (
                <div className="mt-3 flex items-center justify-between gap-2">
                    {control ? (
                        <ControlButton onClick={control.onClick} disabled={control.disabled}>
                            {control.icon === false ? null : (
                                <Play aria-hidden="true" className="size-3.5" />
                            )}
                            {control.label}
                        </ControlButton>
                    ) : null}
                    {speed}
                </div>
            ) : null}
            {lines.length > 0 ? (
                <div className={cn("flex flex-col gap-1 text-xs text-ink-muted", hasRow ? "mt-2" : "mt-3")}>
                    {lines.map((line) => (
                        <p key={line}>{line}</p>
                    ))}
                </div>
            ) : null}
        </>
    );
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
