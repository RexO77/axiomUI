import type { ReactNode } from "react";

import { Bell, Play } from "lucide-react";

import {
    PreviewFrame,
    type PreviewRenderer,
    type PreviewSize,
    type Variant,
} from "@/components/features/rules/preview-primitives";
import { cn } from "@/lib/utils";

// Craft-pass previews for layout-1..layout-11. Every pair is the same
// scene with one spacing/alignment variable flipped; measurements are
// drawn as accent ticks with mono tabular-nums values, and each pair
// closes on the numeric verdict rather than narrating the lesson.
// Every number on screen is a value the pane actually renders — an
// annotation that cannot be checked against the pixels is worse than
// no annotation at all.

// ── Local vocabulary ────────────────────────────────────────────────

// Evidence annotation: mono, tabular, muted.
const ANNOT = "font-mono text-[10px] tabular-nums text-neutral-400 dark:text-neutral-500";
// Fine annotation (axis labels) — 8–9px reserved for these.
// Fine annotation (axis labels) — 8-9px is reserved for these. Deliberately
// carries NO colour: `cn` is plain concatenation, and CSS resolves conflicts by
// stylesheet order, not argument order. A colour here beat every caller's
// override — `.text-neutral-400` is emitted after `.text-blue-600` — so all
// twelve accent measurement labels in this file silently rendered grey.
const FINE = "font-mono text-[9px] tabular-nums";
// The resting tone, applied explicitly wherever the label is not the protagonist.
const FINE_MUTED = "text-neutral-400 dark:text-neutral-500";
// Scene copy that happens to be small. Mono is reserved for evidence, so
// in-scene labels stay in the UI face even at 9px.
const STAT_LABEL = "text-[9px] font-medium text-neutral-400 dark:text-neutral-500";
// The measurement accent (protagonist of most layout rules).
const TICK = "bg-blue-500 dark:bg-blue-400";
const TICK_TEXT = "text-blue-600 dark:text-blue-400";

function TextLine({ widthClass, className }: { widthClass: string; className?: string }) {
    return (
        <div
            className={cn(
                "h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800",
                widthClass,
                className
            )}
        />
    );
}

// A vertical gap that measures itself: hairline bracket + value in the
// right gutter. The spacer's real height IS the evidence.
function MeasuredGap({ px, className }: { px: number; className?: string }) {
    return (
        <div aria-hidden="true" className={cn("relative", className)} style={{ height: px }}>
            <span className="absolute inset-y-0 right-8 flex w-8 items-center gap-1.5">
                <span className={cn("relative h-full w-px", TICK)}>
                    <span className={cn("absolute -left-0.5 top-0 h-px w-1.5", TICK)} />
                    <span className={cn("absolute -left-0.5 bottom-0 h-px w-1.5", TICK)} />
                </span>
                <span className={cn(FINE, TICK_TEXT)}>{px}</span>
            </span>
        </div>
    );
}

// ── layout-1 · The 4pt grid system ──────────────────────────────────
// The same settings card, self-measured: padding and gap values are
// drawn as ticks. One pane lands on the 4pt grid, one picks lint.
function fourPtGrid(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    const pad = isDo ? 16 : 13;
    const gap = isDo ? 8 : 5;
    return (
        <PreviewFrame size={size} className="flex items-center justify-center">
            <div className="flex items-center gap-3">
                <div
                    className="w-40 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
                    style={{ padding: pad }}
                >
                    <span className="block text-[11px] font-semibold text-neutral-800 dark:text-neutral-100">
                        Notifications
                    </span>
                    <div style={{ height: gap }} />
                    <TextLine widthClass="w-full" />
                    <div style={{ height: gap }} />
                    <TextLine widthClass="w-3/4" />
                </div>
                <div className="flex flex-col gap-1">
                    <span className={cn(FINE, TICK_TEXT)}>p·{pad}</span>
                    <span className={cn(FINE, TICK_TEXT)}>gap·{gap}</span>
                    <span className={ANNOT}>
                        {isDo ? "16, 8 ÷ 4 = 4, 2" : "13, 5 ÷ 4 = 3.25, 1.25"}
                    </span>
                </div>
            </div>
        </PreviewFrame>
    );
}

// ── layout-2 · Text width limits ────────────────────────────────────
// The same article intro; one caps its measure, one drinks the whole
// container. The column is a self-measuring unit: the accent rail under
// the paragraph is exactly as wide as the text it measures, so the two
// panes can be compared by rail length instead of by squinting at rag.
//
// The frame gives the copy 278px. Body copy is set at 8px so that 45ch
// — the low end of the readable band, and the value the Do pane
// annotates — computes to about 220px and therefore actually binds
// inside the frame. At 10px, 45ch is 274px and the cap would do
// nothing, leaving the two panes identical.
function textWidth(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    return (
        <PreviewFrame size={size} className="flex flex-col justify-center gap-2">
            <span className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-100">
                Introducing workspaces
            </span>
            <div className={cn("text-[8px] leading-[13px]", isDo && "max-w-[45ch]")}>
                <p className="text-neutral-500 dark:text-neutral-400">
                    Workspaces keep every project, doc, and thread in one shared place your team
                    can search, so onboarding an engineer stops meaning a week of asking where
                    things live.
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                    <span className={cn("h-px flex-1", TICK)} />
                    <span className={cn(FINE, TICK_TEXT)}>
                        {isDo ? "max-w: 45ch" : "width: 100%"}
                    </span>
                </div>
            </div>
            <span className={ANNOT}>45–75ch reads easily</span>
        </PreviewFrame>
    );
}

// ── layout-3 · Group by proximity ───────────────────────────────────
// The same two form fields. Do: tight inside a pair, loose between
// pairs. Don't: uniform gaps — the middle label belongs to no one.
// The values are the rule's own gap-2 / gap-6 and gap-4 / gap-4, so the
// ticks can be read straight off the Tailwind scale.
function proximity(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    const inner = isDo ? 8 : 16;
    const outer = isDo ? 24 : 16;
    const field = (label: string) => (
        <>
            <span className="block text-[10px] font-semibold text-neutral-600 dark:text-neutral-300">
                {label}
            </span>
            <div style={{ height: inner }} className="relative">
                <span className={cn("absolute right-[-26px] top-1/2 -translate-y-1/2", FINE, TICK_TEXT)}>
                    {inner}
                </span>
            </div>
            <div className="h-6 w-44 rounded-md border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900" />
        </>
    );
    return (
        <PreviewFrame size={size} className="flex items-center justify-center">
            <div>
                {field("Full name")}
                <div style={{ height: outer }} className="relative">
                    <span className={cn("absolute right-[-26px] top-1/2 -translate-y-1/2", FINE, TICK_TEXT)}>
                        {outer}
                    </span>
                </div>
                {field("Work email")}
            </div>
        </PreviewFrame>
    );
}

// ── layout-4 · Visual vs mathematical center ────────────────────────
// The same play button with its centerline drawn. The triangle's mass
// sits left of its bounding box; only the nudged one looks centered.
function opticalCenter(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    return (
        <PreviewFrame size={size} className="flex flex-col items-center justify-center gap-2.5">
            <div className="relative flex size-14 items-center justify-center rounded-full border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900">
                <span
                    aria-hidden="true"
                    className={cn("absolute inset-y-2 left-1/2 w-px", TICK, "opacity-40")}
                />
                <Play
                    aria-hidden="true"
                    size={18}
                    strokeWidth={1.5}
                    className={cn(
                        "fill-neutral-700 text-neutral-700 dark:fill-neutral-200 dark:text-neutral-200",
                        isDo && "translate-x-[2px]"
                    )}
                />
            </div>
            <span className={ANNOT}>{isDo ? "nudged +2px right" : "geometric center"}</span>
        </PreviewFrame>
    );
}

// ── layout-5 · Button padding formula ───────────────────────────────
// The same primary button, dimensions drawn. Text wants roughly twice
// the horizontal breathing room; square padding pinches it.
function buttonPadding(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    const px = isDo ? 16 : 8;
    const py = 8;
    return (
        <PreviewFrame size={size} className="flex flex-col items-center justify-center gap-3">
            <span
                className="inline-flex items-center rounded-md bg-neutral-900 text-[11px] font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900"
                style={{ paddingInline: px, paddingBlock: py }}
            >
                Get started
            </span>
            <div className="flex items-center gap-3">
                <span className={cn(FINE, TICK_TEXT)}>x·{px}</span>
                <span className={cn(FINE, TICK_TEXT)}>y·{py}</span>
                <span className={ANNOT}>{isDo ? "ratio 2:1" : "ratio 1:1"}</span>
            </div>
        </PreviewFrame>
    );
}

// ── layout-6 · Optical alignment of icons ───────────────────────────
// The same multi-line notification row. Do pins the icon to the first
// line's cap height; Don't centers it against the whole text block, so
// the bell drifts down as the copy wraps. The annotation names the
// flex property doing it, because the miss is a few pixels wide.
function iconAlignment(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    return (
        <PreviewFrame size={size} className="flex flex-col items-center justify-center gap-2.5">
            <div
                className={cn(
                    "flex w-48 gap-2 rounded-md border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900",
                    isDo ? "items-start" : "items-center"
                )}
            >
                <Bell
                    aria-hidden="true"
                    size={13}
                    strokeWidth={1.5}
                    className={cn("shrink-0 text-blue-500 dark:text-blue-400", isDo && "mt-px")}
                />
                <div className="min-w-0">
                    <span className="block text-[10px] font-semibold leading-[14px] text-neutral-800 dark:text-neutral-100">
                        Backup complete
                    </span>
                    <span className="mt-0.5 block text-[10px] leading-[14px] text-neutral-400 dark:text-neutral-500">
                        128 files synced to cloud storage two minutes ago
                    </span>
                </div>
            </div>
            <span className={ANNOT}>
                {isDo ? "items-start — icon on the cap height" : "items-center — icon on the block"}
            </span>
        </PreviewFrame>
    );
}

// ── layout-7 · The container fallacy ────────────────────────────────
// The same stat section. Do separates with surface contrast and space;
// Don't draws a border around every idea it has. The tally counts the
// borders the avoid pane actually renders: wrapper, label, two stat
// boxes — four, not the five it used to claim.
function containerFallacy(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    // The page surface is painted by its own absolutely positioned layer
    // instead of being passed to PreviewFrame's className. cn() is a plain
    // class joiner with no tailwind-merge, so a background handed to the
    // frame does not replace the frame's own: both classes ship and Tailwind's
    // source order decides. dark:bg-neutral-900/60 lost to the frame's
    // dark:bg-neutral-950, which silently deleted the surface contrast this
    // rule exists to demonstrate — both panes rendered the same background.
    const pageSurface = isDo
        ? "bg-neutral-100 dark:bg-neutral-900"
        : "bg-white dark:bg-neutral-950";
    // Do: the card is a different surface from the page, so it needs no
    // outline. Don't: the card is the same surface as the page, so a border
    // is the only thing that finds it — which is the trap.
    const statBox = cn(
        "flex-1 rounded-md p-2",
        isDo
            ? "bg-white dark:bg-neutral-800"
            : "border border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-950"
    );
    return (
        <PreviewFrame size={size} className="flex flex-col justify-center">
            <span aria-hidden="true" className={cn("absolute inset-0", pageSurface)} />
            <div className="relative">
                <div
                    className={cn(
                        !isDo && "rounded-lg border border-neutral-300 p-2 dark:border-neutral-600"
                    )}
                >
                    <span
                        className={cn(
                            "block text-[10px] font-semibold text-neutral-700 dark:text-neutral-200",
                            !isDo &&
                                "rounded-sm border border-neutral-300 px-1.5 py-1 dark:border-neutral-600"
                        )}
                    >
                        This week
                    </span>
                    <div className="mt-2 flex gap-2">
                        <div className={statBox}>
                            <span className={cn("block", STAT_LABEL)}>Deploys</span>
                            <span className="block text-[13px] font-semibold tabular-nums text-neutral-800 dark:text-neutral-100">
                                24
                            </span>
                        </div>
                        <div className={statBox}>
                            <span className={cn("block", STAT_LABEL)}>Uptime</span>
                            <span className="block text-[13px] font-semibold tabular-nums text-neutral-800 dark:text-neutral-100">
                                99.9%
                            </span>
                        </div>
                    </div>
                </div>
                <span className={cn("mt-2 block", ANNOT)}>
                    {isDo ? "0 borders — surface + space" : "4 borders, 1 idea"}
                </span>
            </div>
        </PreviewFrame>
    );
}

// ── layout-8 · Consistent gutters ───────────────────────────────────
// The same 2×2 card grid; only the row gutter changes. Both ticks stay
// accented in both panes — they are the measurement, and dimming the
// offending value would send the eye away from the defect.
function gutters(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    const rowGap = isDo ? 8 : 24;
    const cell = "h-9 rounded-md bg-neutral-200/80 dark:bg-neutral-800";
    return (
        <PreviewFrame size={size} className="flex flex-col items-center justify-center gap-2.5">
            <div className="flex items-center gap-4">
                <div className="grid w-36 grid-cols-2" style={{ columnGap: 8, rowGap }}>
                    <div className={cell} />
                    <div className={cell} />
                    <div className={cell} />
                    <div className={cell} />
                </div>
                <div className="flex flex-col gap-1">
                    <span className={cn(FINE, TICK_TEXT)}>x·8</span>
                    <span className={cn(FINE, TICK_TEXT)}>y·{rowGap}</span>
                </div>
            </div>
            <span className={ANNOT}>{isDo ? "8 / 8 — one gutter" : "8 / 24 — two gutters"}</span>
        </PreviewFrame>
    );
}

// ── layout-9 · Responsive spacing scaling ───────────────────────────
// The same card at two viewports; only the small viewport's padding
// changes. Padding that scales down keeps the phone honest; desktop
// padding on mobile starves the content down to a stub. The small
// frame's tick carries the accent in both panes — it is the one
// measurement under test.
function responsiveSpacing(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    const mobilePad = isDo ? 12 : 24;
    const frame = (width: number, pad: number, label: string, underTest?: boolean) => (
        <div className="flex flex-col items-center gap-1.5">
            <div
                className="rounded-md border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
                style={{ width, padding: pad }}
            >
                <TextLine widthClass="w-full" />
                <TextLine widthClass="w-2/3" className="mt-1.5" />
            </div>
            <span className={cn(FINE, underTest ? TICK_TEXT : FINE_MUTED)}>{label}</span>
        </div>
    );
    return (
        <PreviewFrame size={size} className="flex flex-col items-center justify-center gap-2.5">
            <div className="flex items-end gap-4">
                {frame(72, mobilePad, `sm · p·${mobilePad}`, true)}
                {frame(128, 24, "lg · p·24")}
            </div>
            <span className={ANNOT}>
                {isDo ? "12 → 24 scales with the screen" : "24 → 24 at every breakpoint"}
            </span>
        </PreviewFrame>
    );
}

// ── layout-10 · Vertical rhythm ─────────────────────────────────────
// The same page skeleton; section gaps measured. Every gap in the do pane is
// a whole multiple of the smallest one, so the eye can count in that unit;
// the avoid pane's 13 and 18 sit off the 8px base entirely.
function verticalRhythm(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    const gaps = isDo ? [8, 16, 32] : [8, 13, 18];
    return (
        <PreviewFrame size={size} className="flex flex-col items-center justify-center gap-2.5">
            <div className="w-44">
                <TextLine widthClass="w-1/2" className="h-2 bg-neutral-300 dark:bg-neutral-700" />
                <MeasuredGap px={gaps[0]} className="-mr-8" />
                <TextLine widthClass="w-full" />
                <MeasuredGap px={gaps[1]} className="-mr-8" />
                <TextLine widthClass="w-full" />
                <MeasuredGap px={gaps[2]} className="-mr-8" />
                <TextLine widthClass="w-5/6" />
            </div>
            <span className={ANNOT}>
                {isDo ? "8, 16, 32 — 1x, 2x, 4x of 8" : "8, 13, 18 — off the 8px base"}
            </span>
        </PreviewFrame>
    );
}

// ── layout-11 · Z-index scale ───────────────────────────────────────
// The same three layers with the same three names in both panes; only
// the z-index values change. Renaming the layers between panes would
// have made the reader compare vocabularies instead of numbers.
const Z_LAYERS = ["base", "dropdown", "modal"];

function zIndexScale(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    const values = isDo ? ["0", "100", "300"] : ["1", "999", "9999"];
    const topIndex = Z_LAYERS.length - 1;
    return (
        <PreviewFrame size={size} className="flex flex-col items-center justify-center gap-2.5">
            <div className="relative h-20 w-44">
                {Z_LAYERS.map((name, index) => {
                    const isTop = index === topIndex;
                    return (
                        <div
                            key={name}
                            className={cn(
                                "absolute flex h-9 items-center justify-between rounded-md border bg-white px-2 dark:bg-neutral-900",
                                isTop
                                    ? "border-blue-500 dark:border-blue-400"
                                    : "border-neutral-200 dark:border-neutral-700"
                            )}
                            style={{
                                left: index * 14,
                                right: (topIndex - index) * 14,
                                top: index * 20,
                                zIndex: index,
                            }}
                        >
                            <span className="text-[9px] font-medium text-neutral-500 dark:text-neutral-400">
                                {name}
                            </span>
                            <span className={cn(FINE, isTop ? TICK_TEXT : FINE_MUTED)}>z·{values[index]}</span>
                        </div>
                    );
                })}
            </div>
            <span className={ANNOT}>
                {isDo ? "0 · 100 · 300 — steps of 100" : "1 · 999 · 9999 — no room above"}
            </span>
        </PreviewFrame>
    );
}

// ── Dispatcher ──────────────────────────────────────────────────────

export const layoutPreviews: PreviewRenderer = (ruleId, variant, size): ReactNode | null => {
    switch (ruleId) {
        case "layout-1":
            return fourPtGrid(variant, size);
        case "layout-2":
            return textWidth(variant, size);
        case "layout-3":
            return proximity(variant, size);
        case "layout-4":
            return opticalCenter(variant, size);
        case "layout-5":
            return buttonPadding(variant, size);
        case "layout-6":
            return iconAlignment(variant, size);
        case "layout-7":
            return containerFallacy(variant, size);
        case "layout-8":
            return gutters(variant, size);
        case "layout-9":
            return responsiveSpacing(variant, size);
        case "layout-10":
            return verticalRhythm(variant, size);
        case "layout-11":
            return zIndexScale(variant, size);
        default:
            return null;
    }
};
