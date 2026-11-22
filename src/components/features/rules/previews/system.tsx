import type { ReactNode } from "react";

import {
    AlertTriangle,
    ArrowLeft,
    CornerUpLeft,
    Download,
    FileText,
    FolderPlus,
    ImageOff,
    MousePointer2,
    Plus,
    RotateCw,
    Search,
    Trash2,
    X,
} from "@/components/ui/icons";

import {
    Annotation,
    ANNOTATION_INK,
    PreviewFrame,
    PRODUCT_MUTED,
    type PreviewRenderer,
    type Variant,
} from "@/components/features/rules/preview-primitives";
import { cn } from "@/lib/utils";

// Craft-pass previews for sys-2..sys-8, sys-10, sys-11, sys-13, sys-15 and sys-16.
// sys-1 and sys-9 are motion showcases and never reach this module.

// ── Local vocabulary ────────────────────────────────────────────────

// Evidence annotation: mono, tabular, muted. Numbers only earn ink here.
// ANNOT_BASE carries no colour, for a scene that paints its own surface and
// has to state its own ink (cn() cannot override a colour already in ANNOT).
const ANNOT_BASE = "font-mono text-[10px] tabular-nums";
const ANNOT = `${ANNOT_BASE} ${ANNOTATION_INK}`;
// Fine annotation (axis labels, kbd meanings) — 8–9px is reserved for these.
const FINE = `font-mono text-[8px] tabular-nums ${ANNOTATION_INK}`;
// The product's own copy in the same faces (a file size, a step counter, an
// article's meta). Same ink, but it is the scene, not evidence, so it is never
// an <Annotation> and a tile keeps it.
const PRODUCT_MONO = `font-mono text-[10px] tabular-nums ${PRODUCT_MUTED}`;
const PRODUCT_FINE = `font-mono text-[8px] tabular-nums ${PRODUCT_MUTED}`;

function Kbd({ label }: { label: string }) {
    return (
        <span className="inline-flex items-center rounded-[3px] border border-neutral-300 bg-neutral-50 px-1 py-px font-mono text-[9px] leading-none text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            {label}
        </span>
    );
}

function CodeChip({ children }: { children: ReactNode }) {
    return (
        <code className="self-start rounded-sm bg-neutral-100 px-2 py-1 font-mono text-[9px] leading-none text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {children}
        </code>
    );
}

// ── sys-2 · Empty states ────────────────────────────────────────────
// Same "Projects" panel; the only variable is whether the empty body
// explains itself and offers the next action.
function emptyStates(variant: Variant) {
    return (
        <PreviewFrame className="flex">
            <div className="flex w-full flex-col rounded-md border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between border-b border-neutral-200 px-2.5 py-1.5 dark:border-neutral-800">
                    <span className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-200">Projects</span>
                    <Search aria-hidden className="size-3 stroke-[1.5] text-neutral-400 dark:text-neutral-500" />
                </div>
                {variant === "do" ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-1 py-3">
                        <span className="flex size-7 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                            <FolderPlus aria-hidden className="size-3.5 stroke-[1.5] text-neutral-500 dark:text-neutral-400" />
                        </span>
                        <span className="text-[10px] font-medium text-neutral-700 dark:text-neutral-200">No projects yet</span>
                        <span className={cn("text-[10px]", PRODUCT_MUTED)}>Create one to start tracking work</span>
                        <span className="mt-1 inline-flex items-center gap-1 rounded-sm bg-blue-600 px-2 py-1 text-[10px] font-semibold leading-none text-white dark:bg-blue-400 dark:text-neutral-950">
                            <Plus aria-hidden className="size-2.5 stroke-[2.5]" />
                            New project
                        </span>
                    </div>
                ) : (
                    <div className="flex-1" />
                )}
            </div>
        </PreviewFrame>
    );
}

// ── sys-3 · Click targets ───────────────────────────────────────────
// Same attachment row; the delete affordance is drawn at true size with
// a dashed hit-area guide — 44px vs a bare 16px glyph.
function tapTargets(variant: Variant) {
    return (
        <PreviewFrame className="flex items-center">
            <div className="flex w-full items-center gap-2.5 rounded-md border border-neutral-200 px-2.5 py-2 dark:border-neutral-800">
                <FileText aria-hidden className="size-4 shrink-0 stroke-[1.5] text-neutral-400 dark:text-neutral-500" />
                <div className="min-w-0 flex-1">
                    <span className="block truncate text-[10px] font-medium text-neutral-700 dark:text-neutral-200">
                        invoice-0248.pdf
                    </span>
                    <span className={PRODUCT_FINE}>1.2 MB</span>
                </div>
                {variant === "do" ? (
                    <div className="flex shrink-0 items-center gap-2">
                        <span className="flex size-11 items-center justify-center">
                            <Download aria-hidden className="size-3.5 stroke-[1.5] text-neutral-500 dark:text-neutral-400" />
                        </span>
                        <span className="flex size-11 items-center justify-center rounded-md border border-dashed border-blue-500/60 dark:border-blue-400/60">
                            <Trash2 aria-hidden className="size-3.5 stroke-[1.5] text-neutral-500 dark:text-neutral-400" />
                        </span>
                        <Annotation className={ANNOT}>44 × 44px</Annotation>
                    </div>
                ) : (
                    <div className="flex shrink-0 items-center gap-2">
                        <span className="flex items-center">
                            <span className="flex size-4 items-center justify-center">
                                <Download aria-hidden className="size-3 stroke-[1.5] text-neutral-500 dark:text-neutral-400" />
                            </span>
                            <span className="flex size-4 items-center justify-center rounded-[2px] border border-dashed border-blue-500/60 dark:border-blue-400/60">
                                <Trash2 aria-hidden className="size-3 stroke-[1.5] text-neutral-500 dark:text-neutral-400" />
                            </span>
                        </span>
                        <Annotation className={ANNOT}>16 × 16px</Annotation>
                    </div>
                )}
            </div>
        </PreviewFrame>
    );
}

// ── sys-4 · Date formats ────────────────────────────────────────────
// Same activity feed, same timestamp face and ink. Do answers "is this
// fresh?" in a 64px slot. Don't prints the full ISO string the caption names,
// never truncated: three times as wide as "2m ago", and the reader still has
// to work out how long ago it was. If a row ever runs short, the label's
// truncate gives way before the timestamp does.
function dateFormats(variant: Variant) {
    const rows = [
        { initial: "M", text: "Maya pushed to main", rel: "2m ago", iso: "2026-08-10T14:02:11Z" },
        { initial: "A", text: "Arun opened #482", rel: "1h ago", iso: "2026-08-10T13:07:44Z" },
        { initial: "S", text: "Sana merged #479", rel: "3h ago", iso: "2026-08-10T11:31:05Z" },
    ];
    return (
        <PreviewFrame className="flex flex-col justify-center gap-2">
            <span className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-200">Activity</span>
            <div className="space-y-2">
                {rows.map((row) => (
                    <div key={row.initial} className="flex items-center gap-2">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[8px] font-semibold text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                            {row.initial}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[10px] text-neutral-700 dark:text-neutral-200">
                            {row.text}
                        </span>
                        {variant === "do" ? (
                            <span className={cn("w-16 shrink-0 text-right text-[10px] tabular-nums", PRODUCT_MUTED)}>
                                {row.rel}
                            </span>
                        ) : (
                            <span className={cn("shrink-0 whitespace-nowrap text-right text-[10px] tabular-nums", PRODUCT_MUTED)}>
                                {row.iso}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </PreviewFrame>
    );
}

// ── sys-5 · Colors by role ──────────────────────────────────────────
// The same invoice card, shown after the theme has switched to dark. The
// panel paints its own dark surfaces in both site themes, because the quoted
// ratios are measured against #262626 and only hold there. It stays in the
// flow (no absolute canvas) so it keeps its size where a compare stage or a
// tile strips the frame's padding. The one variable is where the card's ink
// comes from: Do asks for the text role, which resolves to #f5f5f5 on this
// theme; Don't hard-codes the light theme's #0f172a, which measures 1.2:1
// here and all but disappears.
const ROLE_INK = "text-[#f5f5f5]";
const LITERAL_INK = "text-[#0f172a]";

function colorRoles(variant: Variant) {
    const isDo = variant === "do";
    const ink = isDo ? ROLE_INK : LITERAL_INK;
    return (
        <PreviewFrame className="flex flex-col justify-center">
            <div className="flex flex-col gap-2 rounded-[8px] bg-[#171717] p-3">
                <Annotation className={cn(ANNOT_BASE, "text-neutral-400")}>theme: dark</Annotation>
                <div className="rounded-md border border-neutral-700 bg-[#262626] p-2.5">
                    <span className={cn("block text-[11px] font-semibold", ink)}>Invoice INV-1042</span>
                    <span className={cn("mt-0.5 block text-[10px]", ink)}>Northwind · $1,240.00 due Aug 14</span>
                </div>
                <Annotation className={cn(ANNOT_BASE, "text-neutral-400")}>
                    {isDo ? "color: text role → #f5f5f5 · 13.9:1" : "color: #0f172a (light theme ink) · 1.2:1"}
                </Annotation>
            </div>
        </PreviewFrame>
    );
}

// ── sys-6 · Undo destructive actions ────────────────────────────────
// Same file list, same toast. Do keeps a recoverable ghost row and an
// Undo with a countdown; Don't announces the file is already gone.
function FileRow({ name, meta, ghost }: { name: string; meta: string; ghost?: boolean }) {
    return (
        <div className={cn("flex items-center gap-2", ghost && "opacity-45")}>
            <FileText aria-hidden className="size-3.5 shrink-0 stroke-[1.5] text-neutral-400 dark:text-neutral-500" />
            <span
                className={cn(
                    "min-w-0 flex-1 truncate text-[10px] text-neutral-700 dark:text-neutral-200",
                    ghost && "line-through"
                )}
            >
                {name}
            </span>
            <span className={PRODUCT_FINE}>{meta}</span>
        </div>
    );
}

function undoDelete(variant: Variant) {
    return (
        <PreviewFrame className="flex flex-col justify-between">
            <div className="space-y-1.5">
                <span className="block text-[10px] font-semibold text-neutral-700 dark:text-neutral-200">Files</span>
                {variant === "do" ? <FileRow name="Q3-report.pdf" meta="4.6 MB" ghost /> : null}
                <FileRow name="Roadmap.fig" meta="12.1 MB" />
                <FileRow name="Assets.zip" meta="88.4 MB" />
            </div>
            <div className="flex items-center gap-2 self-center rounded-md bg-neutral-900 px-2.5 py-1.5 dark:border dark:border-neutral-700 dark:bg-neutral-800">
                {variant === "do" ? (
                    <>
                        <span className="text-[10px] leading-none text-white">Q3-report.pdf moved to Trash</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold leading-none text-blue-400">
                            <CornerUpLeft aria-hidden className="size-2.5 stroke-[2]" />
                            Undo
                        </span>
                    </>
                ) : (
                    <>
                        <span className="text-[10px] leading-none text-white">Q3-report.pdf permanently deleted</span>
                        <X aria-hidden className="size-2.5 stroke-[2] text-neutral-500" />
                    </>
                )}
            </div>
        </PreviewFrame>
    );
}

// ── sys-7 · Show progress for multi-step ────────────────────────────
// Same checkout step; the only variable is whether the flow states
// where you are and how much remains.
function multiStepProgress(variant: Variant) {
    return (
        <PreviewFrame className="flex flex-col justify-center">
            <div className="space-y-2 rounded-md border border-neutral-200 p-2.5 dark:border-neutral-800">
                <div className="flex items-baseline justify-between">
                    <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-200">Shipping</span>
                    {variant === "do" ? <span className={PRODUCT_MONO}>Step 2 of 4</span> : null}
                </div>
                {variant === "do" ? (
                    <div className="flex gap-1">
                        {[true, true, false, false].map((filled, index) => (
                            <span
                                key={index}
                                className={cn(
                                    "h-1 flex-1 rounded-full",
                                    filled ? "bg-blue-500 dark:bg-blue-400" : "bg-neutral-200 dark:bg-neutral-800"
                                )}
                            />
                        ))}
                    </div>
                ) : null}
                <div className="space-y-1">
                    <span className="block text-[9px] font-medium text-neutral-500 dark:text-neutral-400">Address</span>
                    <div className="h-6 rounded-sm border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900" />
                </div>
                <div className="flex justify-end">
                    <span className="inline-flex items-center rounded-sm bg-neutral-900 px-2 py-1 text-[10px] font-semibold leading-none text-white dark:bg-neutral-100 dark:text-neutral-900">
                        Continue
                    </span>
                </div>
            </div>
        </PreviewFrame>
    );
}

// ── sys-8 · Keyboard navigation ─────────────────────────────────────
// Same confirm dialog. Do: focus ring on the primary action plus a kbd
// legend. Don't: a mouse cursor is the only way in — no ring, no keys.
function keyboardNav(variant: Variant) {
    return (
        <PreviewFrame className="flex flex-col items-center justify-center gap-3">
            <div className="w-full max-w-[200px] space-y-1.5 rounded-md border border-neutral-200 bg-white p-2.5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                <span className="block text-[10px] font-semibold text-neutral-700 dark:text-neutral-200">
                    Archive project?
                </span>
                <span className={cn("block text-[10px]", PRODUCT_MUTED)}>You can restore it later</span>
                <div className="flex justify-end gap-1.5 pt-0.5">
                    <span className="inline-flex items-center rounded-sm border border-neutral-300 px-2 py-1 text-[10px] font-medium leading-none text-neutral-600 dark:border-neutral-600 dark:text-neutral-300">
                        Cancel
                    </span>
                    <span className="relative inline-flex items-center rounded-sm border border-transparent bg-neutral-900 px-2 py-1 text-[10px] font-semibold leading-none text-white dark:bg-neutral-100 dark:text-neutral-900">
                        {variant === "do" ? (
                            <span
                                aria-hidden
                                className="absolute -inset-1 rounded-[6px] border-2 border-blue-500/60 dark:border-blue-400/60"
                            />
                        ) : (
                            <MousePointer2
                                aria-hidden
                                className="absolute -bottom-2 -right-2 size-3.5 fill-neutral-700 stroke-white stroke-[1.5] dark:fill-neutral-200 dark:stroke-neutral-900"
                            />
                        )}
                        Archive
                    </span>
                </div>
            </div>
            {variant === "do" ? (
                <div className="flex items-center gap-1.5">
                    <Kbd label="Tab" />
                    <Annotation className={FINE}>move</Annotation>
                    <Kbd label="Enter" />
                    <Annotation className={FINE}>activate</Annotation>
                    <Kbd label="Esc" />
                    <Annotation className={FINE}>dismiss</Annotation>
                </div>
            ) : (
                <Annotation className={ANNOT}>tabindex=&quot;-1&quot; · no Esc handler</Annotation>
            )}
        </PreviewFrame>
    );
}

// ── sys-10 · Graceful degradation ───────────────────────────────────
// Same article card with a failed hero image. Do: designed fallback
// with a retry, layout intact. Don't: what the browser does on its own —
// the slot collapses to the alt text's line box, a small glyph and the
// file name in the inherited face, flush left, and the content shifts up.
// No dashed box: an outline would read as a designed empty state.
function gracefulDegradation(variant: Variant) {
    return (
        <PreviewFrame className="flex">
            <div className="w-full space-y-1.5 self-start rounded-md border border-neutral-200 p-2 dark:border-neutral-800">
                {variant === "do" ? (
                    <div className="flex h-12 items-center justify-center gap-2 rounded-sm bg-neutral-100 dark:bg-neutral-800">
                        <ImageOff aria-hidden className="size-3.5 stroke-[1.5] text-neutral-400 dark:text-neutral-500" />
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold leading-none text-blue-600 dark:text-blue-400">
                            <RotateCw aria-hidden className="size-2.5 stroke-[2]" />
                            Reload image
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                        <ImageOff aria-hidden className="size-3 shrink-0 stroke-[1.5]" />
                        <span className="text-[10px] leading-3">hero@2x.jpg</span>
                    </div>
                )}
                <span className="block text-[10px] font-medium text-neutral-700 dark:text-neutral-200">
                    Field notes from the launch
                </span>
                <div className="flex items-center gap-1.5">
                    <span className={PRODUCT_FINE}>4 min read</span>
                    <span aria-hidden className="size-0.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                    <span className={PRODUCT_FINE}>Aug 10</span>
                </div>
            </div>
        </PreviewFrame>
    );
}

// ── sys-11 · Reflow at 320 CSS pixels ───────────────────────────────
// The same checkout step in a 320 CSS px viewport, drawn at 140px so the
// ratio holds: the Don't content is 512 / 320 = 1.6 times the frame. Do
// stacks the two fields and keeps Continue inside the viewport. Don't keeps a
// two-column row with a 512px minimum, so the page scrolls sideways and
// Continue sits past the right edge. The scrollbar thumb is drawn at the same
// ratio (frame / content) so the overflow reads before the numbers do.
const REFLOW_VIEWPORT = 320;
const REFLOW_MIN_WIDTH = 512;
const REFLOW_FRAME_PX = 140;

function ReflowField({ label }: { label: string }) {
    return (
        <div className="min-w-0 flex-1 space-y-0.5">
            <span className={cn("block text-[8px] font-medium", PRODUCT_MUTED)}>{label}</span>
            <div className="h-4 rounded-[3px] border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900" />
        </div>
    );
}

function reflow(variant: Variant) {
    const isDo = variant === "do";
    const contentPx = isDo ? REFLOW_FRAME_PX : (REFLOW_FRAME_PX * REFLOW_MIN_WIDTH) / REFLOW_VIEWPORT;
    const thumbPct = (REFLOW_FRAME_PX / contentPx) * 100;
    return (
        <PreviewFrame className="flex flex-col items-center justify-center gap-2">
            <div
                className="relative overflow-hidden rounded-md border border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950"
                style={{ width: REFLOW_FRAME_PX }}
            >
                <div className="space-y-1.5 p-2" style={{ width: contentPx }}>
                    <span className="block text-[10px] font-semibold text-neutral-800 dark:text-neutral-100">Delivery address</span>
                    <div className={cn("flex gap-1.5", isDo ? "flex-col" : "flex-row")}>
                        <ReflowField label="Street" />
                        <ReflowField label="Postcode" />
                    </div>
                    <div className="flex items-center justify-between gap-1.5 pt-0.5">
                        <span className={cn("text-[9px]", PRODUCT_MUTED)}>Back</span>
                        <span className="rounded-[4px] bg-neutral-900 px-2 py-1 text-[9px] font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900">
                            Continue
                        </span>
                    </div>
                </div>
                {isDo ? null : (
                    <div aria-hidden className="h-1 bg-neutral-200 dark:bg-neutral-800">
                        <div className="h-full rounded-full bg-neutral-400 dark:bg-neutral-500" style={{ width: `${thumbPct}%` }} />
                    </div>
                )}
            </div>
            <Annotation className={ANNOT}>
                {isDo
                    ? `Content fits the ${REFLOW_VIEWPORT}px viewport`
                    : `${REFLOW_MIN_WIDTH}px of content overflows the ${REFLOW_VIEWPORT}px viewport`}
            </Annotation>
        </PreviewFrame>
    );
}

// ── sys-13 · Transition only what changes ───────────────────────────
// Same Save button after a change in its explicit CSS width. Scoped transitions
// let it snap to its new width; `all` makes it drift through the
// intermediate widths, drawn as fading dashed outlines behind the button.
// The button itself never wraps or shrinks: the drift is the only change.
// Intermediate widths the `all` transition paints on its way to the new size,
// fading as they recede.
const DRIFT = [
    { width: 92, opacity: 0.6 },
    { width: 100, opacity: 0.4 },
    { width: 108, opacity: 0.25 },
];

function transitionScope(variant: Variant) {
    return (
        <PreviewFrame className="flex flex-col justify-center gap-3">
            <CodeChip>
                {variant === "do" ? (
                    <>
                        transition-property:{" "}
                        <span className="text-blue-600 dark:text-blue-400">scale, background-color</span>
                    </>
                ) : (
                    "transition: all 150ms ease-out"
                )}
            </CodeChip>
            <div className="relative isolate flex">
                {variant === "dont"
                    ? DRIFT.map((ghost) => (
                          <span
                              key={ghost.width}
                              aria-hidden
                              className="absolute inset-y-0 left-0 -z-10 rounded-sm border border-dashed border-neutral-400 dark:border-neutral-500"
                              style={{ width: ghost.width, opacity: ghost.opacity }}
                          />
                      ))
                    : null}
                <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-sm bg-neutral-900 px-2.5 py-1.5 text-[10px] font-semibold leading-none text-white dark:bg-neutral-100 dark:text-neutral-900">
                    Save changes
                </span>
            </div>
            <Annotation className={ANNOT}>{variant === "do" ? "width: instant" : "width: drifts for 150ms"}</Annotation>
        </PreviewFrame>
    );
}

// ── sys-15 · Back returns to the result ─────────────────────────────
// The same invoice list, the moment after Back is pressed from INV-1037.
// The one variable is whether the view came back with it: Do restores the
// Overdue filter, the due-date sort and row 37 in view, with that state
// readable in the address bar; Don't rebuilds the default list from the top.
const OVERDUE_ROWS = [
    { row: 36, name: "Contoso", amount: "$860.00" },
    { row: 37, name: "Northwind", amount: "$1,240.00", opened: true },
    { row: 38, name: "Fabrikam", amount: "$415.50" },
];
const DEFAULT_ROWS = [
    { row: 1, name: "Acme Corp", amount: "$2,300.00" },
    { row: 2, name: "Globex", amount: "$96.00" },
    { row: 3, name: "Initech", amount: "$1,780.00" },
];

function returnToResult(variant: Variant) {
    const isDo = variant === "do";
    const rows = isDo ? OVERDUE_ROWS : DEFAULT_ROWS;
    return (
        <PreviewFrame className="flex flex-col justify-center gap-1.5">
            <div className="flex items-center gap-1.5">
                <span className="flex size-4 shrink-0 items-center justify-center rounded-sm bg-neutral-100 dark:bg-neutral-800">
                    <ArrowLeft aria-hidden className="size-2.5 stroke-[2] text-neutral-600 dark:text-neutral-300" />
                </span>
                <span className="min-w-0 flex-1 truncate rounded-sm border border-neutral-200 px-1.5 py-0.5 font-mono text-[9px] leading-3 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
                    {isDo ? "/invoices?status=overdue&sort=due" : "/invoices"}
                </span>
            </div>
            <div className="rounded-md border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between gap-2 border-b border-neutral-200 px-2 py-1 dark:border-neutral-800">
                    <span className="rounded-sm bg-neutral-100 px-1.5 py-px text-[9px] font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                        {isDo ? "Overdue" : "All invoices"}
                    </span>
                    <span className={cn("text-[9px]", PRODUCT_MUTED)}>
                        {isDo ? "Sort: due date" : "Sort: newest"}
                    </span>
                </div>
                <div className="p-1">
                    {rows.map((row) => (
                        <div
                            key={row.row}
                            className={cn(
                                "flex items-center gap-2 rounded-sm px-1 py-[3px] text-[10px] leading-3",
                                "opened" in row && row.opened
                                    ? "bg-blue-50 text-neutral-800 ring-1 ring-inset ring-blue-300 dark:bg-blue-950 dark:text-neutral-100 dark:ring-blue-800"
                                    : "text-neutral-700 dark:text-neutral-200"
                            )}
                        >
                            <span className={cn("w-4 text-right text-[9px] tabular-nums", PRODUCT_MUTED)}>{row.row}</span>
                            <span className="min-w-0 flex-1 truncate">{row.name}</span>
                            <span className="tabular-nums">{row.amount}</span>
                        </div>
                    ))}
                </div>
            </div>
            <Annotation className={ANNOT}>
                {isDo ? "Back → row 37 · filter and sort kept" : "Back → row 1 · filter and sort lost"}
            </Annotation>
        </PreviewFrame>
    );
}

// ── sys-16 · Errors stay until handled ──────────────────────────────
// The same upload screen six seconds after the upload failed. The toast is
// the only place Retry exists. Do keeps it on screen until the person acts on
// it or closes it; Don't let a 5s timer take it, so the corner is empty and
// the dashed outline marks where the only recovery path used to be.
function persistentError(variant: Variant) {
    const isDo = variant === "do";
    return (
        <PreviewFrame className="flex flex-col justify-between gap-2">
            <div className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                    <span className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-200">Files</span>
                    <Annotation className={ANNOT}>6s after the upload failed</Annotation>
                </div>
                <FileRow name="Roadmap.fig" meta="12.1 MB" />
                <FileRow name="Assets.zip" meta="88.4 MB" />
            </div>
            <div className="flex flex-col items-end gap-1">
                {isDo ? (
                    <div className="flex h-7 w-[184px] items-center gap-2 rounded-md bg-neutral-900 px-2.5 dark:border dark:border-neutral-700 dark:bg-neutral-800">
                        <AlertTriangle aria-hidden className="size-3 shrink-0 stroke-[1.5] text-rose-400" />
                        <span className="min-w-0 flex-1 truncate text-[10px] leading-none text-white">Upload failed</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold leading-none text-blue-400">
                            <RotateCw aria-hidden className="size-2.5 stroke-[2]" />
                            Retry
                        </span>
                        <X aria-hidden className="size-2.5 shrink-0 stroke-[2] text-neutral-400" />
                    </div>
                ) : (
                    <div className="h-7 w-[184px] rounded-md border border-dashed border-neutral-300 dark:border-neutral-700" />
                )}
                <Annotation className={ANNOT}>
                    {isDo ? "still here · waits for Retry or ✕" : "closed at 5s · Retry gone"}
                </Annotation>
            </div>
        </PreviewFrame>
    );
}

// ── Dispatcher ──────────────────────────────────────────────────────

const scenes: Record<string, (variant: Variant) => ReactNode> = {
    "sys-2": emptyStates,
    "sys-3": tapTargets,
    "sys-4": dateFormats,
    "sys-5": colorRoles,
    "sys-6": undoDelete,
    "sys-7": multiStepProgress,
    "sys-8": keyboardNav,
    "sys-10": gracefulDegradation,
    "sys-11": reflow,
    "sys-13": transitionScope,
    "sys-15": returnToResult,
    "sys-16": persistentError,
};

export const systemPreviews: PreviewRenderer = (ruleId, variant) =>
    scenes[ruleId]?.(variant) ?? null;
