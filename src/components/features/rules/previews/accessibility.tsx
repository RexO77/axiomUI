import type { ReactNode } from "react";

import { Check, CircleAlert, Minus } from "lucide-react";

import type { DemoProps, PreviewRenderer } from "@/components/features/rules/preview-primitives";
import { PreviewFrame } from "@/components/features/rules/preview-primitives";
import { cn } from "@/lib/utils";

// Authored previews for a11y-1..a11y-3:
// same scene in both panes, one variable, evidence annotated in mono.

// ── Local helpers ───────────────────────────────────────────────────

const BUTTON_BASE =
    "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-[11px] font-semibold";
const BUTTON_PRIMARY = cn(
    BUTTON_BASE,
    "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
);
const BUTTON_SECONDARY = cn(
    BUTTON_BASE,
    "border border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
);

function Kbd({ children }: { children: ReactNode }) {
    return (
        <span
            aria-hidden="true"
            className="inline-flex items-center rounded-[4px] border border-b-2 border-neutral-300 bg-neutral-50 px-1.5 py-px font-mono text-[9px] font-medium text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
        >
            {children}
        </span>
    );
}

function Annotation({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <span
            className={cn(
                "font-mono text-[10px] tabular-nums text-neutral-400 dark:text-neutral-500",
                className
            )}
        >
            {children}
        </span>
    );
}

// ── a11y-1 · Focus visible indicators ───────────────────────────────
// Same form footer in both panes; Tab was just pressed. Do restores a
// 2px offset ring on the focused button; Don't gives the keyboard user
// nothing to find.

function FocusScene({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    return (
        <PreviewFrame size={size} className="flex">
            <div className="flex w-full flex-1 flex-col justify-between gap-3">
                <div className="space-y-1">
                    <span className="block text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
                        Work email
                    </span>
                    <div className="flex h-6 w-full items-center rounded-md border border-neutral-200 bg-white px-2 text-[10px] text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
                        maya@acme.co
                    </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <Kbd>Tab</Kbd>
                    <div className="flex items-center gap-2">
                        <span className={BUTTON_SECONDARY}>Cancel</span>
                        <span
                            className={cn(
                                BUTTON_PRIMARY,
                                isDo &&
                                    "ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-blue-400 dark:ring-offset-neutral-950"
                            )}
                        >
                            Save changes
                        </span>
                    </div>
                </div>
                <Annotation>
                    {isDo ? "focus-visible:ring-2 ring-offset-2" : "outline: none"}
                </Annotation>
            </div>
        </PreviewFrame>
    );
}

// ── a11y-2 · Color shouldn't be the only signal ─────────────────────
// The same invalid card field in both panes, identical rose border.
// Do adds the icon and the written message; the signal tally at the
// bottom keeps the lesson legible even in grayscale.

function SignalChip({ label, present }: { label: string; present: boolean }) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 font-mono text-[9px]",
                present
                    ? "text-neutral-500 dark:text-neutral-400"
                    : "text-neutral-300 dark:text-neutral-600"
            )}
        >
            {present ? (
                <Check aria-hidden="true" size={10} strokeWidth={2} />
            ) : (
                <Minus aria-hidden="true" size={10} strokeWidth={2} />
            )}
            <span className={cn(!present && "line-through")}>{label}</span>
        </span>
    );
}

function ErrorSignalScene({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    return (
        <PreviewFrame size={size} className="flex">
            <div className="flex w-full flex-1 flex-col gap-1.5">
                <span className="block text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
                    Card number
                </span>
                <div className="flex h-7 w-full items-center justify-between gap-2 rounded-md border border-rose-500 bg-white px-2 dark:border-rose-500 dark:bg-neutral-900">
                    <span className="font-mono text-[10px] tabular-nums text-neutral-600 dark:text-neutral-300">
                        4242 4242 4242 42
                    </span>
                    {isDo ? (
                        <CircleAlert
                            aria-hidden="true"
                            size={12}
                            strokeWidth={1.75}
                            className="shrink-0 text-rose-500 dark:text-rose-400"
                        />
                    ) : null}
                </div>
                {isDo ? (
                    <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                        <CircleAlert aria-hidden="true" size={11} strokeWidth={1.75} className="shrink-0" />
                        <span className="text-[10px] font-medium">Card number must be 16 digits</span>
                    </div>
                ) : null}
                <div className="mt-auto flex items-center gap-2.5">
                    <SignalChip label="color" present />
                    <SignalChip label="icon" present={isDo} />
                    <SignalChip label="text" present={isDo} />
                </div>
            </div>
        </PreviewFrame>
    );
}

// ── a11y-3 · Touch target spacing ───────────────────────────────────
// The same destructive confirm in both panes; fixed-width buttons keep
// the seam centered so the accent dimension tick can measure the gap:
// 8px of clearance vs 0px edge-to-edge.

function TargetSpacingScene({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    return (
        <PreviewFrame size={size} className="flex">
            <div className="flex w-full flex-1 flex-col items-center justify-center gap-2.5">
                <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                    Delete “Q3 report.pdf”?
                </span>
                <div className={cn("flex items-center", isDo ? "gap-2" : "gap-0")}>
                    <span className={cn(BUTTON_SECONDARY, "w-20")}>Cancel</span>
                    <span className={cn(BUTTON_PRIMARY, "w-20")}>Delete</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    {isDo ? (
                        <span
                            aria-hidden="true"
                            className="flex h-2 w-2 items-center border-x border-blue-500 dark:border-blue-400"
                        >
                            <span className="h-px w-full bg-blue-500 dark:bg-blue-400" />
                        </span>
                    ) : (
                        <span aria-hidden="true" className="h-2 w-px bg-blue-500 dark:bg-blue-400" />
                    )}
                    <Annotation>{isDo ? "8px" : "0px"}</Annotation>
                </div>
            </div>
        </PreviewFrame>
    );
}

// ── Dispatcher ──────────────────────────────────────────────────────

export const accessibilityPreviews: PreviewRenderer = (ruleId, variant, size) => {
    switch (ruleId) {
        case "a11y-1":
            return <FocusScene variant={variant} size={size} />;
        case "a11y-2":
            return <ErrorSignalScene variant={variant} size={size} />;
        case "a11y-3":
            return <TargetSpacingScene variant={variant} size={size} />;
        default:
            return null;
    }
};
