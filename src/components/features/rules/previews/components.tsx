import type { ReactNode } from "react";

import { Archive, FileText, Share2, Trash2, X } from "lucide-react";

import {
    PreviewFrame,
    type PreviewRenderer,
    type PreviewSize,
    type Variant,
} from "@/components/features/rules/preview-primitives";
import { cn } from "@/lib/utils";

// Craft-pass previews for comp-1..comp-8 and comp-10..comp-12.
// comp-9 is a motion showcase and never reaches this module.
// Every pair is the same product moment with one component decision
// flipped; evidence is annotated in mono tabular-nums.

// ── Local vocabulary ────────────────────────────────────────────────

const ANNOT = "font-mono text-[10px] tabular-nums text-neutral-400 dark:text-neutral-500";
const FINE = "font-mono text-[9px] tabular-nums text-neutral-400 dark:text-neutral-500";
const ACCENT_TEXT = "text-blue-600 dark:text-blue-400";

const BTN = "inline-flex items-center justify-center rounded-md px-2.5 py-1.5 text-[10px] font-semibold";
const BTN_PRIMARY = cn(BTN, "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900");
const BTN_SECONDARY = cn(
    BTN,
    "border border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
);
const BTN_GHOST = cn(BTN, "text-neutral-500 dark:text-neutral-400");
const BTN_DANGER = cn(BTN, "bg-rose-600 text-white");

function Kbd({ label }: { label: string }) {
    return (
        <span className="inline-flex items-center rounded-[3px] border border-neutral-300 bg-neutral-50 px-1 py-px font-mono text-[9px] leading-none text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            {label}
        </span>
    );
}

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

// ── comp-1 · Action Hierarchy ───────────────────────────────────────
// The same publish footer. One filled action tells you what the screen
// wants; three filled actions shout over each other.
function actionHierarchy(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    return (
        <PreviewFrame size={size} className="flex flex-col justify-center gap-3">
            <div>
                <span className="block text-[11px] font-semibold text-neutral-800 dark:text-neutral-100">
                    Ready to publish?
                </span>
                <span className="mt-0.5 block text-[10px] text-neutral-400 dark:text-neutral-500">
                    Your changes go live immediately
                </span>
            </div>
            <div className="flex items-center gap-2">
                {isDo ? (
                    <>
                        <span className={BTN_PRIMARY}>Publish</span>
                        <span className={BTN_SECONDARY}>Preview</span>
                        <span className={BTN_GHOST}>Discard</span>
                    </>
                ) : (
                    <>
                        <span className={BTN_PRIMARY}>Publish</span>
                        <span className={BTN_PRIMARY}>Preview</span>
                        <span className={BTN_PRIMARY}>Discard</span>
                    </>
                )}
            </div>
            <span className={ANNOT}>{isDo ? "1 primary, 2 quiet" : "3 primaries, 0 hierarchy"}</span>
        </PreviewFrame>
    );
}

// ── comp-2 · Destructive Actions ────────────────────────────────────
// The same "delete project" moment. Do keeps the trigger quiet and
// spends the red on a confirm step; Don't parks a loaded red button in
// the everyday UI.
function destructiveActions(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    return (
        <PreviewFrame size={size} className="flex items-center justify-center">
            {isDo ? (
                <div className="flex items-center gap-3">
                    <span className={BTN_SECONDARY}>Delete project…</span>
                    <span aria-hidden="true" className="h-px w-4 bg-neutral-300 dark:bg-neutral-600" />
                    <div className="w-36 rounded-lg border border-neutral-200 bg-white p-2.5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                        <span className="block text-[10px] font-semibold text-neutral-800 dark:text-neutral-100">
                            Delete “atlas-api”?
                        </span>
                        <span className="mt-0.5 block text-[9px] text-neutral-400 dark:text-neutral-500">
                            This can’t be undone
                        </span>
                        <div className="mt-2 flex items-center gap-1.5">
                            <span className={cn(BTN_GHOST, "px-2 py-1 text-[9px]")}>Cancel</span>
                            <span className={cn(BTN_DANGER, "px-2 py-1 text-[9px]")}>Delete</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex w-48 items-center justify-between rounded-md border border-neutral-200 bg-white p-2.5 dark:border-neutral-800 dark:bg-neutral-900">
                    <div>
                        <span className="block text-[10px] font-semibold text-neutral-800 dark:text-neutral-100">
                            atlas-api
                        </span>
                        <span className={FINE}>updated 2h ago</span>
                    </div>
                    <span className={cn(BTN_DANGER, "px-3 py-2 text-[11px]")}>Delete</span>
                </div>
            )}
        </PreviewFrame>
    );
}

// ── comp-3 · Nested Radius Formula ──────────────────────────────────
// The same search card, radii printed at the corner. Concentric maths
// keep the corners parallel; equal radii pinch.
function nestedRadius(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    const outer = isDo ? 12 : 4;
    return (
        <PreviewFrame size={size} className="flex flex-col items-center justify-center gap-2.5">
            <div
                className="relative border border-neutral-200 bg-white p-2 dark:border-neutral-700 dark:bg-neutral-900"
                style={{ borderRadius: outer }}
            >
                <span
                    aria-hidden="true"
                    className={cn("absolute -left-1 -top-1 size-2 rounded-full", "bg-blue-500 dark:bg-blue-400")}
                />
                <div
                    className="flex h-7 w-44 items-center bg-neutral-100 px-2 text-[10px] text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
                    style={{ borderRadius: 4 }}
                >
                    Search projects…
                </div>
            </div>
            <span className={ANNOT}>
                {isDo ? (
                    <>
                        <span className={ACCENT_TEXT}>12</span> = 4 + 8 padding
                    </>
                ) : (
                    <>
                        <span className={ACCENT_TEXT}>4</span> ≠ 4 + 8 — corners pinch
                    </>
                )}
            </span>
        </PreviewFrame>
    );
}

// ── comp-4 · Avatars Are Circles ────────────────────────────────────
// The same two rows — a person and a file. Organic gets the circle,
// content keeps its corners.
function avatarShapes(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    return (
        <PreviewFrame size={size} className="flex items-center justify-center">
            <div className="w-48 space-y-2">
                <div className="flex items-center gap-2 rounded-md bg-neutral-50 p-2 dark:bg-neutral-900">
                    <span
                        className={cn(
                            "flex size-6 shrink-0 items-center justify-center bg-blue-500 text-[9px] font-semibold text-white dark:bg-blue-400 dark:text-neutral-950",
                            isDo ? "rounded-full" : "rounded-md"
                        )}
                    >
                        MC
                    </span>
                    <div className="min-w-0">
                        <span className="block text-[10px] font-medium text-neutral-800 dark:text-neutral-100">
                            Maya Chen
                        </span>
                        <span className={FINE}>owner</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 rounded-md bg-neutral-50 p-2 dark:bg-neutral-900">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-neutral-200 dark:bg-neutral-700">
                        <FileText
                            aria-hidden="true"
                            size={12}
                            strokeWidth={1.5}
                            className="text-neutral-500 dark:text-neutral-300"
                        />
                    </span>
                    <div className="min-w-0">
                        <span className="block text-[10px] font-medium text-neutral-800 dark:text-neutral-100">
                            Q3-report.pdf
                        </span>
                        <span className={FINE}>2.4 MB</span>
                    </div>
                </div>
            </div>
        </PreviewFrame>
    );
}

// ── comp-5 · Modal vs Drawer ────────────────────────────────────────
// The same mini app. A one-line decision earns a modal; an edit form
// stuffed into one clips its own fields.
function modalVsDrawer(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    return (
        <PreviewFrame size={size} className="flex items-center justify-center">
            <div className="relative h-24 w-52 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="space-y-1.5 p-2 opacity-60">
                    <TextLine widthClass="w-1/3" />
                    <TextLine widthClass="w-full" />
                    <TextLine widthClass="w-5/6" />
                </div>
                <div aria-hidden="true" className="absolute inset-0 bg-neutral-900/30" />
                {isDo ? (
                    <div className="absolute left-1/2 top-1/2 w-32 -translate-x-1/2 -translate-y-1/2 rounded-md border border-blue-500 bg-white p-2 dark:border-blue-400 dark:bg-neutral-900">
                        <span className="block text-[10px] font-semibold text-neutral-800 dark:text-neutral-100">
                            Delete file?
                        </span>
                        <div className="mt-1.5 flex gap-1.5">
                            <span className={cn(BTN_GHOST, "px-1.5 py-0.5 text-[8px]")}>Cancel</span>
                            <span className={cn(BTN_PRIMARY, "px-1.5 py-0.5 text-[8px]")}>Delete</span>
                        </div>
                    </div>
                ) : (
                    <div className="absolute left-1/2 top-1/2 h-16 w-32 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-md border border-blue-500 bg-white p-2 dark:border-blue-400 dark:bg-neutral-900">
                        <span className="block text-[10px] font-semibold text-neutral-800 dark:text-neutral-100">
                            Edit profile
                        </span>
                        <div className="mt-1.5 space-y-1">
                            <div className="h-3.5 rounded-sm border border-neutral-200 dark:border-neutral-700" />
                            <div className="h-3.5 rounded-sm border border-neutral-200 dark:border-neutral-700" />
                            <div className="h-3.5 rounded-sm border border-neutral-200 dark:border-neutral-700" />
                        </div>
                    </div>
                )}
                <span
                    className={cn(
                        "absolute bottom-1 right-2 font-mono text-[8px] tabular-nums",
                        "text-white/80"
                    )}
                >
                    {isDo ? "1 decision → modal" : "6 fields → clipped"}
                </span>
            </div>
        </PreviewFrame>
    );
}

// ── comp-6 · Toast vs Inline Error ──────────────────────────────────
// The same invalid email. The fix belongs next to the field, not in a
// toast a full screen away.
function toastVsInline(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    return (
        <PreviewFrame size={size} className="relative flex items-center">
            <div className="w-40">
                <span className="block text-[10px] font-semibold text-neutral-600 dark:text-neutral-300">
                    Email
                </span>
                <div className="mt-1 flex h-6 items-center rounded-md border border-rose-500 bg-white px-2 text-[10px] text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">
                    maya@acme
                </div>
                {isDo ? (
                    <span className="mt-1 block text-[9px] font-medium text-rose-600 dark:text-rose-400">
                        Enter a valid email address
                    </span>
                ) : (
                    <span className={cn("mt-1 block", FINE)}>fix is 220px away ↗</span>
                )}
            </div>
            {!isDo ? (
                <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2 py-1.5 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
                    <span className="size-1.5 rounded-full bg-rose-500" />
                    <span className="text-[9px] font-medium text-neutral-700 dark:text-neutral-200">
                        Invalid email
                    </span>
                </div>
            ) : null}
        </PreviewFrame>
    );
}

// ── comp-7 · Icon + Label for Ambiguous Actions ─────────────────────
// The same three actions. Archive/share/delete are guesses as glyphs;
// labels retire the guessing.
function iconPlusLabel(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    const actions = [
        { icon: Archive, label: "Archive" },
        { icon: Share2, label: "Share" },
        { icon: Trash2, label: "Delete" },
    ];
    return (
        <PreviewFrame size={size} className="flex flex-col items-center justify-center gap-3">
            <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white p-1.5 dark:border-neutral-800 dark:bg-neutral-900">
                {actions.map(({ icon: Icon, label }) => (
                    <span
                        key={label}
                        className={cn(
                            "flex items-center gap-1.5 rounded-md bg-neutral-50 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
                            isDo ? "px-2 py-1.5" : "p-1.5"
                        )}
                    >
                        <Icon aria-hidden="true" size={12} strokeWidth={1.5} />
                        {isDo ? <span className="text-[9px] font-medium">{label}</span> : null}
                    </span>
                ))}
            </div>
            <span className={ANNOT}>{isDo ? "0 guesses" : "3 guesses"}</span>
        </PreviewFrame>
    );
}

// ── comp-8 · Disabled Needs a Reason ────────────────────────────────
// The same locked export. A sentence turns "broken" into "not yet".
function disabledReason(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    return (
        <PreviewFrame size={size} className="flex flex-col items-center justify-center gap-1.5">
            <span
                className={cn(
                    BTN,
                    "bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
                )}
            >
                Export CSV
            </span>
            {isDo ? (
                <span className="text-[9px] text-neutral-500 dark:text-neutral-400">
                    Available on the Pro plan
                </span>
            ) : (
                <span className={FINE}>no reason given</span>
            )}
        </PreviewFrame>
    );
}

// ── comp-10 · Consistent Icon Size ──────────────────────────────────
// The same toolbar with a baseline drawn. One size reads as a set;
// three sizes read as three donors.
function iconSizes(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    const sizes = isDo ? [20, 20, 20] : [16, 20, 24];
    const icons = [Archive, Share2, Trash2];
    return (
        <PreviewFrame size={size} className="flex flex-col items-center justify-center gap-3">
            <div className="relative flex items-center gap-4 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-900">
                <span
                    aria-hidden="true"
                    className="absolute inset-x-2 top-1/2 h-px bg-blue-500/40 dark:bg-blue-400/40"
                />
                {icons.map((Icon, index) => (
                    <Icon
                        key={index}
                        aria-hidden="true"
                        size={sizes[index]}
                        strokeWidth={1.5}
                        className="relative text-neutral-600 dark:text-neutral-300"
                    />
                ))}
            </div>
            <span className={ANNOT}>{sizes.join(" · ")}</span>
        </PreviewFrame>
    );
}

// ── comp-11 · Card Click Area ───────────────────────────────────────
// The same article card; the dashed accent region is the hit area.
// The whole card, or eight characters of title.
function cardClickArea(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    return (
        <PreviewFrame size={size} className="flex flex-col items-center justify-center gap-2">
            <div
                className={cn(
                    "w-48 rounded-lg border bg-white p-2.5 dark:bg-neutral-900",
                    isDo
                        ? "border-dashed border-blue-500 dark:border-blue-400"
                        : "border-neutral-200 dark:border-neutral-800"
                )}
            >
                <span
                    className={cn(
                        "inline-block text-[10px] font-semibold",
                        isDo
                            ? "text-neutral-800 dark:text-neutral-100"
                            : "rounded-sm border border-dashed border-blue-500 px-0.5 text-blue-600 underline dark:border-blue-400 dark:text-blue-400"
                    )}
                >
                    Shipping the new editor
                </span>
                <TextLine widthClass="w-full" className="mt-1.5" />
                <TextLine widthClass="w-2/3" className="mt-1" />
            </div>
            <span className={ANNOT}>{isDo ? "hit area · 100%" : "hit area · 9%"}</span>
        </PreviewFrame>
    );
}

// ── comp-12 · Close Affordance on Overlays ──────────────────────────
// The same dialog. Three honest exits, or a guessing game.
function closeAffordance(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    return (
        <PreviewFrame size={size} className="flex flex-col items-center justify-center gap-2.5">
            <div className="relative w-44 rounded-lg border border-neutral-200 bg-white p-2.5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                {isDo ? (
                    <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-sm bg-neutral-100 dark:bg-neutral-800">
                        <X
                            aria-hidden="true"
                            size={10}
                            strokeWidth={2}
                            className="text-neutral-500 dark:text-neutral-400"
                        />
                    </span>
                ) : null}
                <span className="block text-[10px] font-semibold text-neutral-800 dark:text-neutral-100">
                    Keyboard shortcuts
                </span>
                <TextLine widthClass="w-full" className="mt-1.5" />
                <TextLine widthClass="w-3/4" className="mt-1" />
            </div>
            {isDo ? (
                <span className={cn("flex items-center gap-1.5", FINE)}>
                    <X aria-hidden="true" size={9} strokeWidth={2} /> · <Kbd label="Esc" /> · backdrop
                </span>
            ) : (
                <span className={FINE}>no visible exit</span>
            )}
        </PreviewFrame>
    );
}

// ── Dispatcher ──────────────────────────────────────────────────────

export const componentPreviews: PreviewRenderer = (ruleId, variant, size): ReactNode | null => {
    switch (ruleId) {
        case "comp-1":
            return actionHierarchy(variant, size);
        case "comp-2":
            return destructiveActions(variant, size);
        case "comp-3":
            return nestedRadius(variant, size);
        case "comp-4":
            return avatarShapes(variant, size);
        case "comp-5":
            return modalVsDrawer(variant, size);
        case "comp-6":
            return toastVsInline(variant, size);
        case "comp-7":
            return iconPlusLabel(variant, size);
        case "comp-8":
            return disabledReason(variant, size);
        case "comp-10":
            return iconSizes(variant, size);
        case "comp-11":
            return cardClickArea(variant, size);
        case "comp-12":
            return closeAffordance(variant, size);
        default:
            return null;
    }
};
