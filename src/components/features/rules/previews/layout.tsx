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
// drawn as accent ticks with mono tabular-nums values, not narrated.

// ── Local vocabulary ────────────────────────────────────────────────

// Evidence annotation: mono, tabular, muted.
const ANNOT = "font-mono text-[10px] tabular-nums text-neutral-400 dark:text-neutral-500";
// Fine annotation (axis labels) — 8–9px reserved for these.
const FINE = "font-mono text-[9px] tabular-nums text-neutral-400 dark:text-neutral-500";
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

// ── layout-1 · The 4pt Grid System ──────────────────────────────────
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
                    <span className={ANNOT}>{isDo ? "÷4 = 4, 2" : "÷4 = 3.25, 1.25"}</span>
                </div>
            </div>
        </PreviewFrame>
    );
}

// ── layout-2 · Text Width Limits ────────────────────────────────────
// The same article intro; one measures its line, one drinks the whole
// viewport. Real copy so the eye can feel the return sweep.
function textWidth(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    return (
        <PreviewFrame size={size} className="flex flex-col justify-center gap-2">
            <span className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-100">
                Introducing workspaces
            </span>
            <p
                className={cn(
                    "text-[10px] leading-[1.6] text-neutral-500 dark:text-neutral-400",
                    isDo && "max-w-[21ch]"
                )}
            >
                Workspaces keep every project, doc, and thread in one shared place your team can search.
            </p>
            <div className="mt-1 flex items-center gap-1.5">
                <span className={cn("h-px w-4", TICK)} />
                <span className={cn(FINE, TICK_TEXT)}>{isDo ? "max-w: 65ch" : "width: 100%"}</span>
            </div>
        </PreviewFrame>
    );
}

// ── layout-3 · Group by Proximity ───────────────────────────────────
// The same two form fields. Do: tight inside a pair, loose between
// pairs. Don't: uniform gaps — the middle label belongs to no one.
function proximity(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    const inner = isDo ? 6 : 14;
    const outer = isDo ? 22 : 14;
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

// ── layout-4 · Visual vs Mathematical Center ────────────────────────
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

// ── layout-5 · Button Padding Formula ───────────────────────────────
// The same primary button, dimensions drawn. Text wants roughly twice
// the horizontal breathing room; square padding pinches it.
function buttonPadding(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    const px = isDo ? 16 : 8;
    const py = 8;
    return (
        <PreviewFrame size={size} className="flex flex-col items-center justify-center gap-3">
            <div className="flex items-end gap-2">
                <span
                    className="inline-flex items-center rounded-md bg-neutral-900 text-[11px] font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900"
                    style={{ paddingInline: px, paddingBlock: py }}
                >
                    Get started
                </span>
            </div>
            <div className="flex items-center gap-3">
                <span className={cn(FINE, TICK_TEXT)}>x·{px}</span>
                <span className={cn(FINE, TICK_TEXT)}>y·{py}</span>
                <span className={ANNOT}>{isDo ? "ratio 2:1" : "ratio 1:1"}</span>
            </div>
        </PreviewFrame>
    );
}

// ── layout-6 · Optical Alignment of Icons ───────────────────────────
// The same two-line notification row. Do pins the icon to the first
// line's cap height; Don't centers it against the whole line box.
function iconAlignment(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    return (
        <PreviewFrame size={size} className="flex items-center justify-center">
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
        </PreviewFrame>
    );
}

// ── layout-7 · The Container Fallacy ────────────────────────────────
// The same stat section. Do separates with surface contrast and space;
// Don't draws a border around every idea it has.
function containerFallacy(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    const statBox = cn(
        "flex-1 rounded-md p-2",
        isDo
            ? "bg-white dark:bg-neutral-900"
            : "border border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-900"
    );
    return (
        <PreviewFrame
            size={size}
            className={cn(
                "flex flex-col justify-center",
                isDo ? "bg-neutral-100 dark:bg-neutral-900/60" : "bg-white dark:bg-neutral-950"
            )}
        >
            <div className={cn(!isDo && "rounded-lg border border-neutral-300 p-2 dark:border-neutral-600")}>
                <span
                    className={cn(
                        "block text-[10px] font-semibold text-neutral-700 dark:text-neutral-200",
                        !isDo && "rounded-sm border border-neutral-300 px-1.5 py-1 dark:border-neutral-600"
                    )}
                >
                    This week
                </span>
                <div className="mt-2 flex gap-2">
                    <div className={statBox}>
                        <span className={cn("block", FINE)}>Deploys</span>
                        <span className="block text-[13px] font-semibold tabular-nums text-neutral-800 dark:text-neutral-100">
                            24
                        </span>
                    </div>
                    <div className={statBox}>
                        <span className={cn("block", FINE)}>Uptime</span>
                        <span className="block text-[13px] font-semibold tabular-nums text-neutral-800 dark:text-neutral-100">
                            99.9%
                        </span>
                    </div>
                </div>
            </div>
            <span className={cn("mt-2", ANNOT)}>
                {isDo ? "0 borders — surface + space" : "5 borders, 1 idea"}
            </span>
        </PreviewFrame>
    );
}

// ── layout-8 · Consistent Gutters ───────────────────────────────────
// The same 2×2 card grid; only the gutters change. One value reads as
// a system, two read as an accident.
function gutters(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    const cell = "h-9 rounded-md bg-neutral-200/80 dark:bg-neutral-800";
    return (
        <PreviewFrame size={size} className="flex items-center justify-center">
            <div className="flex items-center gap-4">
                <div
                    className="grid w-36 grid-cols-2"
                    style={{ columnGap: 8, rowGap: isDo ? 8 : 24 }}
                >
                    <div className={cell} />
                    <div className={cell} />
                    <div className={cell} />
                    <div className={cell} />
                </div>
                <div className="flex flex-col gap-1">
                    <span className={cn(FINE, TICK_TEXT)}>x·8</span>
                    <span className={cn(FINE, isDo ? TICK_TEXT : "text-neutral-400 dark:text-neutral-500")}>
                        y·{isDo ? 8 : 24}
                    </span>
                </div>
            </div>
        </PreviewFrame>
    );
}

// ── layout-9 · Responsive Spacing Scaling ───────────────────────────
// The same card at two viewports. Padding that scales down keeps the
// phone honest; desktop padding on mobile starves the content.
function responsiveSpacing(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    const mobilePad = isDo ? 8 : 20;
    const frame = (width: number, pad: number, label: string) => (
        <div className="flex flex-col items-center gap-1.5">
            <div
                className="rounded-md border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
                style={{ width, padding: pad }}
            >
                <TextLine widthClass="w-full" />
                <TextLine widthClass="w-2/3" className="mt-1.5" />
            </div>
            <span className={FINE}>{label}</span>
        </div>
    );
    return (
        <PreviewFrame size={size} className="flex flex-col items-center justify-center gap-2.5">
            <div className="flex items-end gap-4">
                {frame(64, mobilePad, `sm · p·${mobilePad}`)}
                {frame(120, 20, "lg · p·20")}
            </div>
            <span className={ANNOT}>{isDo ? "8 → 20 scales with the screen" : "20 → 20 everywhere"}</span>
        </PreviewFrame>
    );
}

// ── layout-10 · Vertical Rhythm ─────────────────────────────────────
// The same page skeleton; section gaps measured. A scale doubles on a
// beat; random jumps have no beat to keep.
function verticalRhythm(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    const gaps = isDo ? [8, 16, 32] : [8, 13, 18];
    return (
        <PreviewFrame size={size} className="flex items-center justify-center">
            <div className="w-44">
                <TextLine widthClass="w-1/2" className="h-2 bg-neutral-300 dark:bg-neutral-700" />
                <MeasuredGap px={gaps[0]} className="-mr-8" />
                <TextLine widthClass="w-full" />
                <MeasuredGap px={gaps[1]} className="-mr-8" />
                <TextLine widthClass="w-full" />
                <MeasuredGap px={gaps[2]} className="-mr-8" />
                <TextLine widthClass="w-5/6" />
            </div>
        </PreviewFrame>
    );
}

// ── layout-11 · Z-Index Scale ───────────────────────────────────────
// The same layer stack, labeled from a named scale vs whatever number
// felt biggest that day.
function zIndexScale(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    const layers: Array<{ name: string; z: string; top: boolean }> = isDo
        ? [
              { name: "base", z: "0", top: false },
              { name: "dropdown", z: "100", top: false },
              { name: "modal", z: "300", top: true },
          ]
        : [
              { name: "panel", z: "1", top: false },
              { name: "menu", z: "999", top: false },
              { name: "modal", z: "9999", top: true },
          ];
    return (
        <PreviewFrame size={size} className="flex items-center justify-center">
            <div className="relative h-20 w-44">
                {layers.map((layer, index) => (
                    <div
                        key={layer.name}
                        className={cn(
                            "absolute flex h-9 items-center justify-between rounded-md border bg-white px-2 dark:bg-neutral-900",
                            layer.top
                                ? "border-blue-500 dark:border-blue-400"
                                : "border-neutral-200 dark:border-neutral-700"
                        )}
                        style={{
                            left: index * 14,
                            right: (2 - index) * 14,
                            top: index * 20,
                            zIndex: index,
                        }}
                    >
                        <span className="text-[9px] font-medium text-neutral-500 dark:text-neutral-400">
                            {layer.name}
                        </span>
                        <span className={cn(FINE, layer.top && TICK_TEXT)}>z·{layer.z}</span>
                    </div>
                ))}
            </div>
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
