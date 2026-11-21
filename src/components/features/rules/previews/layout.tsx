import Image from "next/image";
import type { ReactNode } from "react";

import { Bell, ChevronDown, Play } from "@/components/ui/icons";

import {
    Annotation,
    ANNOTATION_INK,
    ANNOTATION_INK_ON_FILL,
    MiniButton,
    PRODUCT_MUTED,
    PreviewFrame,
    type PreviewRenderer,
    type Variant,
} from "@/components/features/rules/preview-primitives";
import { cn } from "@/lib/utils";

// Layout previews show the same scene with one layout decision changed.
// Measurements use accent ticks with mono tabular-nums values.
// Every number on screen is a value the pane actually renders — an
// annotation that cannot be checked against the pixels is worse than
// no annotation at all.

// ── Local vocabulary ────────────────────────────────────────────────

// Evidence annotation: mono, tabular, muted.
const ANNOT = `font-mono text-[10px] tabular-nums ${ANNOTATION_INK}`;
// The same, on a tinted page surface inside the frame (layout-7's Do).
const ANNOT_ON_FILL = `font-mono text-[10px] tabular-nums ${ANNOTATION_INK_ON_FILL}`;
// Fine annotation (axis labels) — 8-9px is reserved for these. Deliberately
// carries NO colour: `cn` is plain concatenation, and CSS resolves conflicts by
// stylesheet order, not argument order. A colour here beat every caller's
// override — `.text-neutral-400` is emitted after `.text-blue-600` — so all
// twelve accent measurement labels in this file silently rendered grey.
const FINE = "font-mono text-[9px] tabular-nums";
// The resting tone, applied explicitly wherever the label is not the protagonist.
const FINE_MUTED = ANNOTATION_INK;
// Scene copy that happens to be small. Mono is reserved for evidence, so
// in-scene labels stay in the UI face even at 9px.
const STAT_LABEL = "text-[9px] font-medium text-neutral-500 dark:text-neutral-300";
// The measurement accent (protagonist of most layout rules).
const TICK = "bg-blue-500 dark:bg-blue-400";
const TICK_TEXT = "text-blue-600 dark:text-blue-400";

// `tone` is a prop rather than a className override: cn() is plain
// concatenation, so a caller's h-2 / dark:bg-neutral-700 shipped beside the
// base h-1.5 / dark:bg-neutral-800 and lost by stylesheet order. In dark the
// heading bar rendered at body weight and layout-10 lost its heading.
function TextLine({
    widthClass,
    tone = "body",
    className,
}: {
    widthClass: string;
    tone?: "title" | "body";
    className?: string;
}) {
    return (
        <div
            className={cn(
                "rounded-full",
                tone === "title"
                    ? "h-2 bg-neutral-300 dark:bg-neutral-700"
                    : "h-1.5 bg-neutral-200 dark:bg-neutral-800",
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
                <Annotation className={cn(FINE, TICK_TEXT)}>{px}</Annotation>
            </span>
        </div>
    );
}

// ── layout-1 · The 4pt grid system ──────────────────────────────────
// The same settings card, self-measured: padding and gap values are
// drawn as ticks. One pane lands on the 4pt grid, one picks lint.
function fourPtGrid(variant: Variant) {
    const isDo = variant === "do";
    const pad = isDo ? 16 : 13;
    const gap = isDo ? 8 : 5;
    return (
        <PreviewFrame className="flex items-center justify-center">
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
                    <Annotation className={cn(FINE, TICK_TEXT)}>p·{pad}</Annotation>
                    <Annotation className={cn(FINE, TICK_TEXT)}>gap·{gap}</Annotation>
                    <Annotation className={ANNOT}>
                        {isDo ? "16, 8 ÷ 4 = 4, 2" : "13, 5 ÷ 4 = 3.25, 1.25"}
                    </Annotation>
                </div>
            </div>
        </PreviewFrame>
    );
}

// ── layout-2 · Text width limits ────────────────────────────────────
// Both examples model a 95ch page. Cap Do at 52ch and let Don't fill the page.
// Scale the sample type in smaller panes so the whole 52ch column is visible.
function textWidth(variant: Variant) {
    const isDo = variant === "do";
    const pageWidth = "95ch";
    const columnWidth = isDo ? "52ch" : pageWidth;
    return (
        <PreviewFrame className="flex flex-col justify-center gap-2.5">
            <div className="flex items-baseline justify-between gap-3">
                <span className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-100">
                    Introducing workspaces
                </span>
                <Annotation className={cn("shrink-0", FINE, TICK_TEXT)}>
                    {columnWidth}
                </Annotation>
            </div>
            {/* Keep the aria-hidden illustration out of the scroll-container tab order. */}
            <div tabIndex={-1} className="@container w-full min-w-0 overflow-x-auto overscroll-x-contain">
                {/* In Manrope, 52ch is about 31.7em. Size the text to fit that measure. */}
                <div className="text-[clamp(8px,3.125cqi,13px)] leading-[1.54]" style={{ width: pageWidth }}>
                    <div data-text-column="" className="w-full" style={{ maxWidth: isDo ? columnWidth : undefined }}>
                        <div aria-hidden="true" className="h-1 border-x border-t border-blue-500 dark:border-blue-400" />
                        <div className="mt-1 min-h-[14.3em] text-neutral-600 dark:text-neutral-300">
                            <p>
                                Workspaces keep every project, doc, and thread in one shared place
                                your team can search, so onboarding an engineer stops meaning a week
                                of asking where things live.
                            </p>
                            <p className="mt-[0.75em]">
                                Each workspace has its own members, permissions, and billing, and
                                anything you move between them keeps its history, comments, and links
                                intact.
                            </p>
                            <p className="mt-[0.75em]">
                                Start with one for the whole company and split it later, when a team
                                needs a room of its own.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Annotation className={ANNOT}>
                {isDo ? `${columnWidth} cap` : "100% width"} · {pageWidth} page
            </Annotation>
        </PreviewFrame>
    );
}

// ── layout-3 · Group by proximity ───────────────────────────────────
// The same two form fields. Do: tight inside a pair, loose between
// pairs. Don't: uniform gaps — the middle label belongs to no one.
// The values are the rule's own gap-2 / gap-6 and gap-4 / gap-4, so the
// ticks can be read straight off the Tailwind scale.
function proximity(variant: Variant) {
    const isDo = variant === "do";
    const inner = isDo ? 8 : 16;
    const outer = isDo ? 24 : 16;
    const field = (label: string) => (
        <>
            <span className="block text-[10px] font-semibold text-neutral-600 dark:text-neutral-300">
                {label}
            </span>
            <div style={{ height: inner }} className="relative">
                <Annotation className={cn("absolute right-[-26px] top-1/2 -translate-y-1/2", FINE, TICK_TEXT)}>
                    {inner}
                </Annotation>
            </div>
            <div className="h-6 w-44 rounded-md border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900" />
        </>
    );
    return (
        <PreviewFrame className="flex items-center justify-center">
            <div>
                {field("Full name")}
                <div style={{ height: outer }} className="relative">
                    <Annotation className={cn("absolute right-[-26px] top-1/2 -translate-y-1/2", FINE, TICK_TEXT)}>
                        {outer}
                    </Annotation>
                </div>
                {field("Work email")}
            </div>
        </PreviewFrame>
    );
}

// ── layout-4 · Visual vs mathematical center ────────────────────────
// The same play button with its centerline drawn. The triangle's mass
// sits left of its bounding box; only the nudged one looks centered.
function opticalCenter(variant: Variant) {
    const isDo = variant === "do";
    return (
        <PreviewFrame className="flex flex-col items-center justify-center gap-2.5">
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
            {/* A 2px nudge is invisible at tile size, so a tile keeps the verdict. */}
            <Annotation className={ANNOT} keep>
                {isDo ? "nudged +2px right" : "geometric center"}
            </Annotation>
        </PreviewFrame>
    );
}

// ── layout-5 · Button padding formula ───────────────────────────────
// The same primary button, dimensions drawn. Text wants roughly twice
// the horizontal breathing room; square padding pinches it.
function buttonPadding(variant: Variant) {
    const isDo = variant === "do";
    const px = isDo ? 16 : 8;
    const py = 8;
    return (
        <PreviewFrame className="flex flex-col items-center justify-center gap-3">
            <span
                className="inline-flex items-center rounded-md bg-neutral-900 text-[11px] font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900"
                style={{ paddingInline: px, paddingBlock: py }}
            >
                Get started
            </span>
            <div className="flex items-center gap-3">
                <Annotation className={cn(FINE, TICK_TEXT)}>x·{px}</Annotation>
                <Annotation className={cn(FINE, TICK_TEXT)}>y·{py}</Annotation>
                <Annotation className={ANNOT}>{isDo ? "ratio 2:1" : "ratio 1:1"}</Annotation>
            </div>
        </PreviewFrame>
    );
}

// ── layout-6 · Optical alignment of icons ───────────────────────────
// The same multi-line notification row. Do pins the icon to the first
// line; Don't centers it against the whole text block, so
// the bell drifts down as the copy wraps. The annotation names the
// flex property doing it, because the miss is a few pixels wide.
function iconAlignment(variant: Variant) {
    const isDo = variant === "do";
    return (
        <PreviewFrame className="flex flex-col items-center justify-center gap-2.5">
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
                    <span className={cn("mt-0.5 block text-[10px] leading-[14px]", PRODUCT_MUTED)}>
                        128 files synced to cloud storage two minutes ago
                    </span>
                </div>
            </div>
            <Annotation className={ANNOT}>
                {isDo ? "items-start + 1px — first line" : "items-center — icon on the block"}
            </Annotation>
        </PreviewFrame>
    );
}

// ── layout-7 · The container fallacy ────────────────────────────────
// The same stat section. Do separates with surface contrast and space;
// Don't draws a border around every idea it has. The tally counts the
// borders the avoid pane actually renders: wrapper, label, two stat
// boxes — four, not the five it used to claim.
function containerFallacy(variant: Variant) {
    const isDo = variant === "do";
    // The page surface is painted by its own absolutely positioned layer
    // instead of being passed to PreviewFrame's className. cn() is a plain
    // class joiner with no tailwind-merge, so a background handed to the
    // frame does not replace the frame's own: both classes ship and Tailwind's
    // source order decides. dark:bg-neutral-900/60 lost to the frame's
    // dark:bg-neutral-950, which silently deleted the surface contrast this
    // rule exists to demonstrate — both panes rendered the same background.
    //
    // The layer is inset 1px (radius 10 - 1 = 9) so it paints inside the
    // frame's inset hairline instead of over it. In dark the Do page has to
    // be lighter than the #171717 card around the frame, or the frame edge
    // dissolves into the card and the pane reads as unframed.
    const pageSurface = isDo
        ? "bg-neutral-100 dark:bg-neutral-800/70"
        : "bg-white dark:bg-neutral-950";
    // Do: the card is a different surface from the page, so it needs no
    // outline. Don't: the card is the same surface as the page, so a border
    // is the only thing that finds it — which is the trap.
    const statBox = cn(
        "flex-1 rounded-md p-2",
        isDo
            ? "bg-white dark:bg-neutral-700/70"
            : "border border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-950"
    );
    return (
        <PreviewFrame className="flex flex-col justify-center">
            <span aria-hidden="true" className={cn("absolute inset-px rounded-[9px]", pageSurface)} />
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
                {/* Match the annotation ink to each pane’s surface. */}
                <Annotation className={cn("mt-2 block", isDo ? ANNOT_ON_FILL : ANNOT)}>
                    {isDo ? "0 borders — surface + space" : "4 borders, 1 idea"}
                </Annotation>
            </div>
        </PreviewFrame>
    );
}

// ── layout-9 · Responsive spacing scaling ───────────────────────────
// The same card at two viewports; only the small viewport's padding
// changes. Padding that scales down keeps the phone honest; desktop
// padding on mobile starves the content down to a stub. The small
// frame's tick carries the accent in both panes — it is the one
// measurement under test.
function responsiveSpacing(variant: Variant) {
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
            <Annotation className={cn(FINE, underTest ? TICK_TEXT : FINE_MUTED)}>{label}</Annotation>
        </div>
    );
    return (
        <PreviewFrame className="flex flex-col items-center justify-center gap-2.5">
            <div className="flex items-end gap-4">
                {frame(72, mobilePad, `sm · p·${mobilePad}`, true)}
                {frame(128, 24, "lg · p·24")}
            </div>
            <Annotation className={ANNOT}>
                {isDo ? "12 → 24 scales with the screen" : "24 → 24 at every breakpoint"}
            </Annotation>
        </PreviewFrame>
    );
}

// ── layout-10 · Vertical hierarchy ─────────────────────────────────────
// The same page skeleton with a more or less pronounced section break.
function verticalRhythm(variant: Variant) {
    const isDo = variant === "do";
    const sectionGap = isDo ? 32 : 16;
    return (
        <PreviewFrame className="flex flex-col items-center justify-center gap-2.5">
            <div className="w-44">
                <TextLine widthClass="w-1/2" tone="title" />
                <MeasuredGap px={8} className="-mr-8" />
                <TextLine widthClass="w-full" />
                <MeasuredGap px={16} className="-mr-8" />
                <TextLine widthClass="w-full" />
                <MeasuredGap px={sectionGap} className="-mr-8" />
                <TextLine widthClass="w-2/5" tone="title" />
            </div>
            <Annotation className={ANNOT}>
                Section break · {sectionGap}px
            </Annotation>
        </PreviewFrame>
    );
}

// ── layout-11 · Stacking contexts ────────────────────────────────────
// The menu keeps its coordinates and z-index when moved out of the transform.
function stackingContext(variant: Variant) {
    const isDo = variant === "do";
    const menuZ = 9999;
    const menu = (
        <div
            data-stacking-menu=""
            className="absolute left-1 top-9 grid w-32 gap-1.5 rounded-md border border-blue-500 bg-white px-2 py-2 text-[10px] font-medium shadow-sm dark:border-blue-400 dark:bg-neutral-900"
            style={{ zIndex: menuZ }}
        >
            <span>Copy link</span>
            <span>Download report</span>
        </div>
    );
    return (
        <PreviewFrame className="flex flex-col items-center justify-center gap-2.5">
            <div className="relative isolate h-24 w-full max-w-56">
                <div
                    data-transformed-panel=""
                    className="absolute inset-y-0 left-0 w-36 rounded-md bg-white ring-1 ring-neutral-200 ring-inset dark:bg-neutral-950 dark:ring-neutral-800"
                    style={{ transform: "translateY(0)" }}
                >
                    <span className="absolute left-1 top-1 inline-flex h-6 items-center gap-1 rounded border border-neutral-200 px-2 text-[10px] font-semibold dark:border-neutral-700">
                        Export <ChevronDown size={11} />
                    </span>
                    {!isDo && menu}
                </div>
                <div data-stacking-sibling="" className="absolute inset-y-0 left-[76px] right-0 z-[1] rounded-md border border-neutral-200 bg-neutral-100 p-2 dark:border-neutral-700 dark:bg-neutral-800">
                    <span className="block text-right text-[10px] font-semibold">Activity</span>
                    <div className="ml-auto mt-2 w-2/3 space-y-2">
                        <TextLine widthClass="w-full" tone="title" />
                        <TextLine widthClass="w-3/4" tone="title" />
                    </div>
                </div>
                {isDo && menu}
            </div>
            <Annotation className={ANNOT}>
                z-index: {menuZ} · {isDo ? "outside the transform" : "inside the transform"}
            </Annotation>
        </PreviewFrame>
    );
}

// ── layout-12 · Sticky header clearance ──────────────────────────────
// A frozen post-Tab view. The mock field lands at the scroll inset in each pane.
function stickyHeaderClearance(variant: Variant) {
    const headerHeight = 64;
    const scrollInset = variant === "do" ? headerHeight : 0;
    return (
        <PreviewFrame className="flex flex-col items-center justify-center gap-2.5">
            <div className="relative isolate h-28 w-full max-w-56 overflow-hidden rounded-md ring-1 ring-neutral-200 dark:ring-neutral-800" style={{ scrollPaddingTop: scrollInset }}>
                <div data-scroll-target="" className="absolute inset-x-0 px-3 pt-1.5" style={{ top: scrollInset }}>
                    <span className="block text-[10px] font-semibold leading-3">Work email</span>
                    <div className="mt-1 flex h-6 items-center rounded px-2 text-[10px] outline-2 -outline-offset-2 outline-blue-500 dark:outline-blue-400">
                        alex@example.com
                    </div>
                    <div className="mt-5 text-[10px] font-semibold">Time zone</div>
                    <TextLine widthClass="mt-1 w-16" />
                </div>
                <div data-sticky-header="" className="sticky top-0 z-10 flex flex-col justify-center gap-1 border-b border-neutral-200 bg-neutral-100 px-3 dark:border-neutral-700 dark:bg-neutral-800" style={{ height: headerHeight }}>
                    <span className="text-[11px] font-semibold">Account settings</span>
                    <span className={cn("text-[10px]", ANNOTATION_INK_ON_FILL)}>Profile · Notifications</span>
                    <Annotation className={cn("absolute right-2 top-2", FINE, ANNOTATION_INK_ON_FILL)}>{headerHeight}px</Annotation>
                </div>
            </div>
            <Annotation className={ANNOT}>Tab to Work email · {scrollInset}px inset</Annotation>
        </PreviewFrame>
    );
}

// ── layout-13 · Space for media ─────────────────────────────────────
// The ghost records the button position before the image dimensions arrived.
function reserveMediaSpace(variant: Variant) {
    const isDo = variant === "do";
    const imageRatio = "2 / 1";
    return (
        <PreviewFrame className="flex flex-col items-center justify-center gap-2.5">
            <div className="relative isolate flex w-full max-w-40 flex-col items-start gap-2">
                <div className="grid w-full place-items-center rounded-md border border-neutral-200 bg-neutral-100 text-[10px] font-medium dark:border-neutral-700 dark:bg-neutral-800" style={{ aspectRatio: imageRatio }}>
                    <span className={cn("mt-4", ANNOTATION_INK_ON_FILL)}>Loading cabin photo…</span>
                </div>
                <div className="absolute inset-x-0 top-0 z-[1] flex flex-col items-start gap-2">
                    <div data-reserved-media="" className="w-full" style={{ aspectRatio: isDo ? imageRatio : undefined }} />
                    <MiniButton label="View details" variant="secondary" className="border-dashed bg-white opacity-75 dark:bg-neutral-900" />
                </div>
                <MiniButton label="View details" variant="primary" className="relative z-[2]" />
            </div>
            <Annotation className={ANNOT}>
                {isDo ? "Reserved image space · button stays put" : "Dashed outline · previous button position"}
            </Annotation>
        </PreviewFrame>
    );
}

// ── layout-14 · Crop focal point ─────────────────────────────────────
// The brass latch is deliberately outside the narrow center crop.
const CABIN_IMAGE = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120" viewBox="0 0 240 120">
    <path fill="#294554" d="M0 0h240v120H0z"/>
    <path fill="#355565" d="M0 16h240v14H0zm0 28h240v14H0zm0 28h240v14H0zm0 28h240v14H0z"/>
    <path fill="#496e7b" d="M0 16h240v2H0zm0 28h240v2H0zm0 28h240v2H0zm0 28h240v2H0z"/>
    <path fill="#172b35" d="M169 8h68v112h-68z"/>
    <path fill="#225b68" d="M174 13h58v107h-58z"/>
    <path fill="#1b4a56" d="M180 19h46v32h-46zm0 63h46v32h-46z"/>
    <rect x="210" y="56" width="14" height="22" rx="3" fill="#a06c36"/>
    <rect x="198" y="63" width="24" height="7" rx="3.5" fill="#ffd17a"/>
    <circle cx="217" cy="74" r="1.5" fill="#493521"/>
</svg>`)}`;

function focalCrop(variant: Variant) {
    const position = variant === "do" ? "right center" : "center";
    return (
        <PreviewFrame className="flex flex-col items-center justify-center gap-2.5">
            <div className="grid w-full max-w-56 grid-cols-[8fr_3fr] gap-3">
                {["2 / 1", "3 / 4"].map((ratio) => (
                    <div key={ratio} className="flex min-w-0 flex-col gap-1">
                        <div className="overflow-hidden rounded-md" style={{ aspectRatio: ratio }}>
                            <Image
                                src={CABIN_IMAGE}
                                alt=""
                                width={240}
                                height={120}
                                unoptimized
                                className="size-full object-cover"
                                style={{ objectPosition: position }}
                            />
                        </div>
                        <Annotation className={cn(FINE, FINE_MUTED)}>{ratio.replace(" / ", ":")}</Annotation>
                    </div>
                ))}
            </div>
            <Annotation className={ANNOT}>
                object-position: {position}
            </Annotation>
        </PreviewFrame>
    );
}

// ── Dispatcher ──────────────────────────────────────────────────────

export const layoutPreviews: PreviewRenderer = (ruleId, variant): ReactNode | null => {
    switch (ruleId) {
        case "layout-1":
            return fourPtGrid(variant);
        case "layout-2":
            return textWidth(variant);
        case "layout-3":
            return proximity(variant);
        case "layout-4":
            return opticalCenter(variant);
        case "layout-5":
            return buttonPadding(variant);
        case "layout-6":
            return iconAlignment(variant);
        case "layout-7":
            return containerFallacy(variant);
        case "layout-9":
            return responsiveSpacing(variant);
        case "layout-10":
            return verticalRhythm(variant);
        case "layout-11":
            return stackingContext(variant);
        case "layout-12":
            return stickyHeaderClearance(variant);
        case "layout-13":
            return reserveMediaSpace(variant);
        case "layout-14":
            return focalCrop(variant);
        default:
            return null;
    }
};
