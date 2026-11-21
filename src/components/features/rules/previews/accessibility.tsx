import type { ReactNode } from "react";

import { ChevronDown, ChevronUp, CircleAlert } from "@/components/ui/icons";

import type { DemoProps, PreviewRenderer } from "@/components/features/rules/preview-primitives";
import { Annotation, ANNOTATION_INK, PreviewFrame } from "@/components/features/rules/preview-primitives";
import { cn } from "@/lib/utils";

// Authored previews for a11y-1..a11y-8:
// same scene in both panes, one variable, evidence annotated in mono.

// ── Local vocabulary ────────────────────────────────────────────────

// Both recipes carry a 1px border (transparent on the filled one), so Cancel
// and Save changes are the same height. The colour stays in each recipe, never
// in BUTTON_BASE: cn() cannot let a later border colour override an earlier one.
const BUTTON_BASE =
    "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-[11px] font-semibold";
const BUTTON_PRIMARY = cn(
    BUTTON_BASE,
    "border border-transparent bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
);
const BUTTON_SECONDARY = cn(
    BUTTON_BASE,
    "border border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
);
const COMPACT_BUTTON = "inline-flex items-center rounded border border-neutral-300 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-600 dark:border-neutral-700 dark:text-neutral-300";
const FOCUS_OUTLINE = "outline-2 outline-offset-2 outline-blue-500 dark:outline-blue-400";

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
const ANNOT = `font-mono text-[10px] tabular-nums ${ANNOTATION_INK}`;

// Fine annotation (lens badges, narration) — 8–9px is reserved for these.
const FINE = `font-mono text-[9px] tabular-nums ${ANNOTATION_INK}`;

// ── a11y-1 · Focus visible indicators ───────────────────────────────
// Same form footer, same keystrokes, same focus position: Tab Tab has
// landed on "Save changes" in both panes, and the narration line says so
// out loud. Do renders the outline that a focus-visible rule would apply;
// Don't renders outline: none, so the keyboard user is told nothing.
//
// A static, aria-hidden preview applies the 2px outline and 2px offset directly.

function FocusScene({ variant }: DemoProps) {
    const isDo = variant === "do";
    return (
        <PreviewFrame className="flex">
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
                            isDo && FOCUS_OUTLINE
                        )}
                    >
                        Save changes
                    </span>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                        <Kbd>Tab</Kbd>
                        <Kbd>Tab</Kbd>
                        <Annotation className={FINE}>focus is on &ldquo;Save changes&rdquo;</Annotation>
                    </div>
                    <Annotation className={cn(ANNOT, "block")}>
                        {isDo
                            ? "focus-visible:outline-2 outline-offset-2"
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
// the filtered copy is a border of some gray — visibly different, but
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
                <Annotation className={cn(FINE, "ml-auto")}>
                    {lens === "color" ? "full color" : "grayscale(1)"}
                </Annotation>
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

function ErrorSignalScene({ variant }: DemoProps) {
    const isDo = variant === "do";
    return (
        <PreviewFrame className="flex flex-col justify-center gap-2">
            <CardField isDo={isDo} lens="color" />
            <CardField isDo={isDo} lens="gray" />
            <Annotation className={ANNOT}>
                {isDo
                    ? "3 signals — icon and text survive"
                    : "1 signal — gray border, no meaning"}
            </Annotation>
        </PreviewFrame>
    );
}

// ── a11y-3 · Touch target spacing ───────────────────────────────────
// Both panes use 84×44px buttons and the same sample tap, 3px past
// Cancel. At x=87 the point falls into the 8px gutter or onto Delete.
// The crosshair marks that point. The surrounding circle is illustrative.

function TargetSpacingScene({ variant }: DemoProps) {
    const isDo = variant === "do";
    return (
        <PreviewFrame className="flex flex-col items-center justify-center gap-2">
            <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                Delete &ldquo;Q3 report.pdf&rdquo;?
            </span>
            <Annotation className={FINE}>stray tap · 3px past Cancel</Annotation>
            <div className="relative">
                <div className={cn("flex items-center", isDo ? "gap-2" : "gap-0")}>
                    <span className={cn(BUTTON_SECONDARY, "h-11 w-[84px]")}>Cancel</span>
                    <span className={cn(BUTTON_PRIMARY, "h-11 w-[84px]")}>Delete</span>
                </div>
                <span
                    aria-hidden="true"
                    className="absolute left-[87px] top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-dashed border-blue-500/30 dark:border-blue-400/30"
                >
                    <span className="absolute inset-y-2.5 left-1/2 w-px -translate-x-1/2 bg-blue-500 dark:bg-blue-400" />
                    <span className="absolute inset-x-2.5 top-1/2 h-px -translate-y-1/2 bg-blue-500 dark:bg-blue-400" />
                    <span className="relative size-1.5 rounded-full bg-blue-500 ring-2 ring-white dark:bg-blue-400 dark:ring-neutral-950" />
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
                <Annotation className={ANNOT}>
                    {isDo ? "8px gutter · tap → gutter" : "0px gutter · tap → Delete"}
                </Annotation>
            </div>
        </PreviewFrame>
    );
}

// ── a11y-4 · Single-pointer alternatives to drag ──────────────────────

const TASKS = ["Send agenda", "Book room", "Share notes"];

function DragAlternativeScene({ variant }: DemoProps) {
    const isDo = variant === "do";
    return (
        <PreviewFrame className="flex flex-col justify-center gap-2">
            <span className="text-[11px] font-semibold">Meeting tasks</span>
            <ol className="space-y-1">
                {TASKS.map((task, index) => (
                    <li
                        key={task}
                        className="flex min-h-7 items-center gap-2 rounded-md border border-neutral-200 px-2 text-[10px] dark:border-neutral-800"
                    >
                        <span className="grid shrink-0 grid-cols-2 gap-px text-neutral-500 dark:text-neutral-400">
                            {Array.from({ length: 6 }, (_, dot) => (
                                <span key={dot} className="size-0.5 rounded-full bg-current" />
                            ))}
                        </span>
                        <span className="tabular-nums text-neutral-500 dark:text-neutral-400">{index + 1}.</span>
                        <span className="flex-1">{task}</span>
                        {isDo && (
                            <div className="flex shrink-0 flex-wrap justify-end gap-1">
                                {index > 0 && (
                                    <span className={cn(COMPACT_BUTTON, "gap-0.5")}>
                                        <ChevronUp size={10} /> Move up
                                    </span>
                                )}
                                {index < TASKS.length - 1 && (
                                    <span className={cn(COMPACT_BUTTON, "gap-0.5")}>
                                        <ChevronDown size={10} /> Move down
                                    </span>
                                )}
                            </div>
                        )}
                    </li>
                ))}
            </ol>
            <Annotation className={ANNOT}>
                {isDo ? "Tap Move up once → Book room moves from 2 to 1" : "Hold and drag Book room from 2 to 1"}
            </Annotation>
        </PreviewFrame>
    );
}

// ── a11y-5 · Heading levels follow the outline ───────────────────────

const SETTINGS_HEADINGS = ["Settings", "Billing", "Invoices"];

function HeadingOutlineScene({ variant }: DemoProps) {
    // The page is drawn with plain elements: real headings inside an
    // illustration would join the host page's outline (one h1 per page).
    // data-heading-level carries the level the consistency test reads.
    const levels = ["h1", variant === "do" ? "h2" : "h4", variant === "do" ? "h3" : "h4"];
    return (
        <PreviewFrame className="flex items-center">
            <div className="grid w-full grid-cols-2 gap-2.5">
                <div className="space-y-1.5 rounded-md border border-neutral-200 p-2 dark:border-neutral-800">
                    <div data-heading-level={levels[0]} className="text-sm font-semibold leading-tight">{SETTINGS_HEADINGS[0]}</div>
                    <div data-heading-level={levels[1]} className="border-t border-neutral-200 pt-1.5 text-[11px] font-semibold dark:border-neutral-800">
                        {SETTINGS_HEADINGS[1]}
                    </div>
                    <div>
                        <div data-heading-level={levels[2]} className="text-[10px] font-semibold">{SETTINGS_HEADINGS[2]}</div>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Download past invoices.</p>
                    </div>
                </div>
                <div className="rounded-md bg-neutral-100 p-2 text-[10px] dark:bg-neutral-900">
                    <div className="mb-1.5 font-semibold">Heading list</div>
                    <ul>
                        {SETTINGS_HEADINGS.map((heading, index) => (
                            <li key={heading} className="leading-relaxed" style={{ paddingInlineStart: (Number(levels[index][1]) - 1) * 3 }}>
                                <span className="font-mono font-semibold">{levels[index]}</span>{" "}
                                {heading}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </PreviewFrame>
    );
}

// ── a11y-6 · Auto-advancing content can be paused ─────────────────────

function PauseUpdatesScene({ variant }: DemoProps) {
    const isDo = variant === "do";
    return (
        <PreviewFrame className="flex flex-col justify-center gap-2">
            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-2.5 dark:border-neutral-800 dark:bg-neutral-900">
                <blockquote className="text-[11px] font-semibold">&ldquo;We planned the whole week in one place.&rdquo;</blockquote>
                <div className="mt-1.5 flex min-h-6 flex-wrap items-center justify-between gap-x-1 gap-y-1">
                    <span className="text-[10px] text-neutral-600 dark:text-neutral-400">Maya Chen</span>
                    {isDo && (
                        <span className={cn(COMPACT_BUTTON, "gap-1 bg-neutral-200 dark:bg-neutral-800")}>
                            <span className="h-2 w-1.5 border-x-2 border-current" /> Pause
                        </span>
                    )}
                </div>
            </div>
            <p className="text-[11px]">Set up a shared calendar to keep track of shifts and deadlines.</p>
            <Annotation className={ANNOT}>
                {isDo ? "Paused · quote stays put" : "Quote changes every 4s"}
            </Annotation>
        </PreviewFrame>
    );
}

// ── a11y-7 · Persistent cues for links in prose ───────────────────────

function InlineLinkScene({ variant }: DemoProps) {
    return (
        <PreviewFrame className="flex items-center justify-center">
            <p className="max-w-52 text-[13px] leading-relaxed">
                To change who can see a file, check the{" "}
                <span className={cn("text-blue-700 dark:text-blue-300", variant === "do" && "underline underline-offset-2")}>
                    sharing guide
                </span>
                .
            </p>
        </PreviewFrame>
    );
}

// ── a11y-8 · Focus after an overlay closes ────────────────────────────

function ReturnFocusScene({ variant }: DemoProps) {
    const isDo = variant === "do";
    return (
        <PreviewFrame className="flex flex-col justify-center gap-2">
            <div className="space-y-2 rounded-md border border-neutral-200 p-2 dark:border-neutral-800">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold">Projects</span>
                    <span className={cn(COMPACT_BUTTON, !isDo && FOCUS_OUTLINE)}>
                        New project
                    </span>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-neutral-200 pt-2 dark:border-neutral-800">
                    <span className="text-[11px]">Quarterly report</span>
                    <span className={cn(COMPACT_BUTTON, isDo && FOCUS_OUTLINE)}>
                        Edit
                    </span>
                </div>
            </div>
            <div className="space-y-1">
                <Annotation className={cn(FINE, "flex flex-wrap items-center gap-1.5")}>
                    <Kbd>Tab</Kbd><Kbd>Tab</Kbd><Kbd>Enter</Kbd> Edit dialog opens
                </Annotation>
                <Annotation className={cn(FINE, "flex flex-wrap items-center gap-1.5")}>
                    <Kbd>Esc</Kbd>
                    {isDo ? "Focus returns to Edit" : <><Kbd>Tab</Kbd> Focus starts at New project</>}
                </Annotation>
            </div>
        </PreviewFrame>
    );
}

// ── Dispatcher ──────────────────────────────────────────────────────

export const accessibilityPreviews: PreviewRenderer = (ruleId, variant) => {
    switch (ruleId) {
        case "a11y-1":
            return <FocusScene variant={variant} />;
        case "a11y-2":
            return <ErrorSignalScene variant={variant} />;
        case "a11y-3":
            return <TargetSpacingScene variant={variant} />;
        case "a11y-4":
            return <DragAlternativeScene variant={variant} />;
        case "a11y-5":
            return <HeadingOutlineScene variant={variant} />;
        case "a11y-6":
            return <PauseUpdatesScene variant={variant} />;
        case "a11y-7":
            return <InlineLinkScene variant={variant} />;
        case "a11y-8":
            return <ReturnFocusScene variant={variant} />;
        default:
            return null;
    }
};
