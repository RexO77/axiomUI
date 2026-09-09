import type { ReactNode } from "react";

import { CircleAlert } from "lucide-react";

import type { DemoProps, PreviewRenderer } from "@/components/features/rules/preview-primitives";
import { PreviewFrame } from "@/components/features/rules/preview-primitives";
import { cn } from "@/lib/utils";

// Authored previews for a11y-1..a11y-3:
// same scene in both panes, one variable, evidence annotated in mono.

// ── Local vocabulary ────────────────────────────────────────────────

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

// Evidence annotation: mono, tabular, muted. Numbers only earn ink here.
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

// Fine annotation (lens badges, narration) — 8–9px is reserved for these.
const FINE = "font-mono text-[9px] tabular-nums text-neutral-400 dark:text-neutral-500";

// ── a11y-1 · Focus visible indicators ───────────────────────────────
// Same form footer, same keystrokes, same focus position: Tab Tab has
// landed on "Save changes" in both panes, and the narration line says so
// out loud. Do renders the ring that a focus-visible rule would apply;
// Don't renders outline: none, so the keyboard user is told nothing.
//
// The ring is the real ring utility (2px ring, 2px offset), not a painted
// border — a static preview cannot hold :focus-visible, and a genuinely
// focusable control inside this aria-hidden frame would be a bug.

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
                <div className="flex items-center justify-end gap-2">
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
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                        <Kbd>Tab</Kbd>
                        <Kbd>Tab</Kbd>
                        <span className={FINE}>focus is on &ldquo;Save changes&rdquo;</span>
                    </div>
                    <Annotation className="block">
                        {isDo
                            ? "focus-visible:ring-2 ring-offset-2"
                            : "outline: none — nothing replaces it"}
                    </Annotation>
                </div>
            </div>
        </PreviewFrame>
    );
}

// ── a11y-2 · Color shouldn't be the only signal ─────────────────────
// The same invalid card field twice over: once in full color, once
// through grayscale(1), so the reader's own screen runs the failure
// instead of being told about it. Do carries an icon and a sentence, so
// the filtered copy still reads as an error. Don't only ever had hue, so
// the filtered copy is a border of some grey — visibly different, but
// carrying no meaning. That gap, not invisibility, is the lesson: the
// annotation claims exactly that and no more.

function CardField({ isDo, lens }: { isDo: boolean; lens: "color" | "gray" }) {
    return (
        <div className="space-y-1">
            {/* Fixed height so the label-only row and the badge-only row match. */}
            <div className="flex h-3.5 items-baseline justify-between gap-2">
                {lens === "color" ? (
                    <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
                        Card number
                    </span>
                ) : null}
                <span className={cn(FINE, "ml-auto")}>
                    {lens === "color" ? "full color" : "grayscale(1)"}
                </span>
            </div>
            <div className={cn("space-y-1", lens === "gray" && "grayscale")}>
                <div className="flex h-7 w-full items-center justify-between gap-2 rounded-md border border-rose-500 bg-white px-2 dark:border-rose-400 dark:bg-neutral-900">
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
                {/* Reserved so both panes keep the same geometry. */}
                <div className="flex h-3.5 items-center">
                    {isDo ? (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-rose-600 dark:text-rose-400">
                            <CircleAlert aria-hidden="true" size={11} strokeWidth={1.75} className="shrink-0" />
                            Card number needs 16 digits, not 14
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function ErrorSignalScene({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    return (
        <PreviewFrame size={size} className="flex flex-col justify-center gap-2">
            <CardField isDo={isDo} lens="color" />
            <CardField isDo={isDo} lens="gray" />
            <Annotation>
                {isDo
                    ? "3 signals — icon and text survive"
                    : "1 signal — grey border, no meaning"}
            </Annotation>
        </PreviewFrame>
    );
}

// ── a11y-3 · Touch target spacing ───────────────────────────────────
// Same confirm sheet, same 44px targets, same stray tap: the contact
// patch is a 44px thumb whose centroid lands 3px past Cancel's trailing
// edge in both panes. The only variable is the gutter. 8px turns that
// mis-tap into a no-op; 0px turns it into a delete.
//
// Geometry is pinned so the claim is checkable: buttons are 84px wide, so
// Cancel's trailing edge sits at 84px and the centroid at 87px — inside
// the 84–92px dead zone when the gutter is 8px, on Delete when it is 0px.

function TargetSpacingScene({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    return (
        <PreviewFrame size={size} className="flex flex-col items-center justify-center gap-2">
            <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                Delete &ldquo;Q3 report.pdf&rdquo;?
            </span>
            <span className={FINE}>stray tap · 3px past Cancel</span>
            <div className="relative">
                <div className={cn("flex items-center", isDo ? "gap-2" : "gap-0")}>
                    <span className={cn(BUTTON_SECONDARY, "h-11 w-[84px]")}>Cancel</span>
                    <span className={cn(BUTTON_PRIMARY, "h-11 w-[84px]")}>Delete</span>
                </div>
                <span
                    aria-hidden="true"
                    className="absolute left-[87px] top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-dashed border-blue-500 bg-blue-500/10 dark:border-blue-400 dark:bg-blue-400/15"
                >
                    <span className="size-1 rounded-full bg-blue-500 dark:bg-blue-400" />
                </span>
            </div>
            <div className="flex flex-col items-center gap-1">
                {/* One caliper in both panes; at 0px the two ticks simply meet. */}
                <span
                    aria-hidden="true"
                    className={cn(
                        "flex h-1.5 items-center border-x border-blue-500 dark:border-blue-400",
                        isDo ? "w-2" : "w-0"
                    )}
                >
                    <span className="h-px w-full bg-blue-500 dark:bg-blue-400" />
                </span>
                <Annotation>
                    {isDo ? "8px gutter — the tap hits nothing" : "0px gutter — the tap hits Delete"}
                </Annotation>
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
