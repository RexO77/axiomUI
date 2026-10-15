import type { ReactNode } from "react";

import { Archive, ArrowDown, FileText, Share2, Trash2, X } from "lucide-react";

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

// Split so a call site can state its own tone. `cn` is plain concatenation and
// CSS resolves conflicts by stylesheet order, so `cn(ANNOT, "text-rose-600")`
// only rendered rose because "rose" happens to sort after "neutral" — rename
// the colour and it would silently go grey. ANNOT_BASE carries no colour.
const ANNOT_BASE = "font-mono text-[10px] tabular-nums";
const ANNOT_MUTED = "text-neutral-400 dark:text-neutral-500";
const ANNOT = `${ANNOT_BASE} ${ANNOT_MUTED}`;
const FINE_BASE = "font-mono text-[9px] tabular-nums";
const FINE = `${FINE_BASE} ${ANNOT_MUTED}`;
const ACCENT_TEXT = "text-blue-600 dark:text-blue-400";

// The button recipes carry shape and tone only. Size is passed per call site
// (BTN_MD, BTN_SM, BTN_XS), because `cn` cannot override a padding or font size
// baked into the recipe: comp-2's compact confirm buttons used to ship both
// `px-2.5` and `px-1.5`, and stylesheet order quietly picked the larger one.
// The 6px corner is pinned so the radius does not follow the global scale.
const BTN = "inline-flex items-center justify-center rounded-[6px] font-semibold";
const BTN_MD = "px-2.5 py-1.5 text-[10px]";
const BTN_SM = "px-2 py-1 text-[9px]";
const BTN_XS = "px-1.5 py-0.5 text-[9px]";
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

// `raised` lifts the line to neutral-700 in dark mode, for overlay scenes: on
// a neutral-800 dialog or drawer the base neutral-800 line vanishes outright,
// and on the neutral-900 page beneath it the page stops reading as content.
// It is a prop rather than a className override for the usual `cn` reason.
function TextLine({
    widthClass,
    className,
    raised = false,
}: {
    widthClass: string;
    className?: string;
    raised?: boolean;
}) {
    return (
        <div
            className={cn(
                "h-1.5 rounded-full bg-neutral-200",
                raised ? "dark:bg-neutral-700" : "dark:bg-neutral-800",
                widthClass,
                className
            )}
        />
    );
}

// ── comp-1 · Action hierarchy ───────────────────────────────────────
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
                        <span className={cn(BTN_PRIMARY, BTN_MD)}>Publish</span>
                        <span className={cn(BTN_SECONDARY, BTN_MD)}>Preview</span>
                        <span className={cn(BTN_GHOST, BTN_MD)}>Discard</span>
                    </>
                ) : (
                    <>
                        <span className={cn(BTN_PRIMARY, BTN_MD)}>Publish</span>
                        <span className={cn(BTN_PRIMARY, BTN_MD)}>Preview</span>
                        <span className={cn(BTN_PRIMARY, BTN_MD)}>Discard</span>
                    </>
                )}
            </div>
            <span className={ANNOT}>{isDo ? "1 primary, 2 quiet" : "3 primaries, 0 hierarchy"}</span>
        </PreviewFrame>
    );
}

// ── comp-2 · Destructive actions ────────────────────────────────────
// The same project row and the same two-stage footprint in both panes.
// The one variable is where the red lives: on the confirm you mean, or
// on the trigger you brush past — in which case stage two is an empty
// slot, because nothing stands between the click and the deletion.
//
// Corners are concentric by construction: 12px row and dialog around 6px
// padding hold 6px buttons (12 = 6 + 6), so the pane obeys comp-3 too.
function destructiveActions(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    return (
        <PreviewFrame size={size} className="flex items-center justify-center">
            <div className="flex w-full flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2 rounded-[12px] border border-neutral-200 bg-white p-1.5 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="min-w-0 pl-1">
                        <span className="block truncate text-[10px] font-semibold text-neutral-800 dark:text-neutral-100">
                            atlas-api
                        </span>
                        <span className={FINE}>updated 2h ago</span>
                    </div>
                    <span className={cn(isDo ? BTN_SECONDARY : BTN_DANGER, BTN_SM, "shrink-0")}>
                        {isDo ? "Delete project…" : "Delete"}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <ArrowDown
                        aria-hidden="true"
                        size={10}
                        strokeWidth={2}
                        className="shrink-0 text-neutral-300 dark:text-neutral-600"
                    />
                    <span className={ANNOT}>{isDo ? "click → confirm" : "click → gone"}</span>
                </div>
                {isDo ? (
                    <div className="min-h-[46px] rounded-[12px] border border-neutral-200 bg-white p-1.5 dark:border-neutral-700 dark:bg-neutral-900">
                        <div className="flex items-center justify-between gap-2">
                            <span className="pl-1 text-[10px] font-semibold text-neutral-800 dark:text-neutral-100">
                                Delete “atlas-api”?
                            </span>
                            <div className="flex shrink-0 items-center gap-1">
                                <span className={cn(BTN_GHOST, BTN_XS)}>Cancel</span>
                                <span className={cn(BTN_DANGER, BTN_XS)}>Delete</span>
                            </div>
                        </div>
                        <span className={cn("mt-0.5 block pl-1", FINE)}>this can’t be undone</span>
                    </div>
                ) : (
                    <div className="flex min-h-[46px] items-center justify-center rounded-[12px] border border-dashed border-rose-400/70 dark:border-rose-500/50">
                        <span className={cn(ANNOT_BASE, "text-rose-600 dark:text-rose-400")}>
                            no confirm step
                        </span>
                    </div>
                )}
            </div>
        </PreviewFrame>
    );
}

// ── comp-3 · Nested radius formula ──────────────────────────────────
// The same search card, radii printed at the corner. Concentric maths
// keep the corners parallel; equal radii pinch.
//
// Both curves are traced at the same top-right corner with a 1px accent
// arc — a box the size of the radius plus a short lead-in, bordered on two
// sides and rounded on one — so the reader compares the two curves the
// formula relates instead of hunting for them. Each arc carries its value.
const ARC_LEAD = 6;

function CornerArc({ radius, className }: { radius: number; className: string }) {
    return (
        <span
            aria-hidden="true"
            className={cn("absolute border-r border-t border-blue-500 dark:border-blue-400", className)}
            style={{
                width: radius + ARC_LEAD,
                height: radius + ARC_LEAD,
                borderTopRightRadius: radius,
            }}
        />
    );
}

function nestedRadius(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    const outer = isDo ? 12 : 4;
    const inner = 4;
    return (
        <PreviewFrame size={size} className="flex flex-col items-center justify-center gap-2.5">
            <div
                className="relative mt-3 border border-neutral-200 bg-white p-2 dark:border-neutral-700 dark:bg-neutral-900"
                style={{ borderRadius: outer }}
            >
                {/* Sits on the 1px border, so the arc replaces that stretch of it. */}
                <CornerArc radius={outer} className="-right-px -top-px" />
                <span className={cn("absolute -top-4 right-0 leading-none", FINE_BASE, ACCENT_TEXT)}>
                    r·{outer}
                </span>
                <div
                    className="relative flex h-7 w-44 items-center bg-neutral-100 px-2 text-[10px] text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
                    style={{ borderRadius: inner }}
                >
                    Search projects…
                    <CornerArc radius={inner} className="right-0 top-0" />
                    <span className={cn("ml-auto pr-1.5", FINE_BASE, ACCENT_TEXT)}>r·{inner}</span>
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

// ── comp-4 · Avatars are circles ────────────────────────────────────
// The same two rows — a person and a file. Organic gets the circle,
// content keeps its corners.
function avatarShapes(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    return (
        <PreviewFrame size={size} className="flex flex-col items-center justify-center gap-2">
            <div className="w-48 space-y-2">
                <div className="flex items-center gap-2 rounded-md bg-neutral-50 p-2 dark:bg-neutral-900">
                    <span
                        className={cn(
                            "flex size-6 shrink-0 items-center justify-center bg-blue-500 text-[9px] font-semibold text-white dark:bg-blue-400 dark:text-neutral-950",
                            // Pinned, not rounded-md: that follows the global radius
                            // scale, and at 12px on a 24px tile it drew a circle.
                            isDo ? "rounded-full" : "rounded-[5px]"
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
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-[5px] bg-neutral-200 dark:bg-neutral-700">
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
            <span className={ANNOT}>
                {isDo ? "person → circle · file → rect" : "person → rect · file → rect"}
            </span>
        </PreviewFrame>
    );
}

// ── comp-5 · Modal vs drawer ────────────────────────────────────────
// The same context-heavy task — "Edit profile", six labelled fields — in
// the same app. The one variable is the container it is served in: a side
// drawer that fits the form and leaves the page readable, or a small
// centred modal that scrims the page and clips five fields off the form.
function modalVsDrawer(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    // Six fields, matching the rule's own shorthand. Rows are label-left so all
    // six fit the drawer's height — and so the modal visibly clips five of them.
    const fields = ["Name", "Role", "Email", "Phone", "City", "Locale"];
    // Field labels are scene copy, so they stay in the UI face; w-9 holds
    // "Locale" whole instead of truncating it to "Loca…".
    const fieldRows = fields.map((field) => (
        <div key={field} className="flex items-center gap-1.5">
            <span className="w-9 shrink-0 text-[9px] font-medium leading-3 text-neutral-500 dark:text-neutral-400">
                {field}
            </span>
            <div className="h-2.5 flex-1 rounded-[3px] border border-neutral-200 dark:border-neutral-600" />
        </div>
    ));
    return (
        <PreviewFrame size={size} className="flex flex-col items-center justify-center gap-2">
            <div className="relative h-[104px] w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                {/* The page underneath — identical in both panes. */}
                <div className="space-y-1.5 p-2">
                    <TextLine raised widthClass="w-1/3" />
                    <TextLine raised widthClass="w-full" />
                    <TextLine raised widthClass="w-5/6" />
                    <TextLine raised widthClass="w-2/3" />
                </div>
                {isDo ? (
                    <div className="absolute inset-y-0 right-0 w-[58%] space-y-0.5 border-l border-blue-500 bg-white p-1 pl-1.5 shadow-[-4px_0_12px_rgb(0_0_0/0.06)] dark:border-blue-400 dark:bg-neutral-800 dark:shadow-[-4px_0_12px_rgb(0_0_0/0.4)]">
                        <span className="block text-[10px] font-semibold leading-3 text-neutral-800 dark:text-neutral-100">
                            Edit profile
                        </span>
                        {fieldRows}
                    </div>
                ) : (
                    <>
                        <div aria-hidden="true" className="absolute inset-0 bg-neutral-950/55 dark:bg-black/70" />
                        <div className="absolute left-1/2 top-1/2 h-[38px] w-[58%] -translate-x-1/2 -translate-y-1/2 space-y-0.5 overflow-hidden rounded-[6px] border border-blue-500 bg-white p-1 pl-1.5 dark:border-blue-400 dark:bg-neutral-800">
                            <span className="block text-[10px] font-semibold leading-3 text-neutral-800 dark:text-neutral-100">
                                Edit profile
                            </span>
                            {fieldRows}
                        </div>
                    </>
                )}
            </div>
            <span className={ANNOT}>
                {isDo ? "drawer · 6 of 6 fields · page stays legible" : "modal · 1 of 6 fields · page blacked out"}
            </span>
        </PreviewFrame>
    );
}

// ── comp-6 · Toast vs inline error ──────────────────────────────────
// The same invalid email, the same field, the same reserved helper slot
// under it. The one variable is where the fix is published: in the slot
// the eye is already in, or in a toast in the opposite corner.
function toastVsInline(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    return (
        <PreviewFrame size={size} className="relative flex flex-col justify-center gap-2">
            <div className="w-40">
                <span className="block text-[10px] font-semibold text-neutral-600 dark:text-neutral-300">
                    Email
                </span>
                <div className="mt-1 flex h-6 items-center rounded-md border border-rose-500 bg-white px-2 text-[10px] text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">
                    maya@acme
                </div>
                <span className="mt-1 block h-3 text-[9px] font-medium leading-3 text-rose-600 dark:text-rose-400">
                    {isDo ? "Enter a valid email address" : null}
                </span>
            </div>
            <span className={ANNOT}>
                {isDo ? "fix sits under the field" : "fix sits in the far corner ↗"}
            </span>
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

// ── comp-7 · Icon + label for ambiguous actions ─────────────────────
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

// ── comp-8 · Disabled needs a reason ────────────────────────────────
// The same locked export inside the panel it actually lives in, so the
// disabled control is judged in real UI rather than floating alone. The
// helper slot under the button is reserved in both panes — the one
// variable is whether a sentence occupies it.
function disabledReason(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    return (
        <PreviewFrame size={size} className="flex flex-col items-center justify-center gap-2">
            <div className="w-full rounded-md border border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[10px] font-semibold text-neutral-800 dark:text-neutral-100">
                        Usage report
                    </span>
                    <span className={FINE}>Aug 1–31</span>
                </div>
                <TextLine widthClass="w-full" className="mt-1.5" />
                <TextLine widthClass="w-3/4" className="mt-1" />
                <span
                    className={cn(
                        BTN,
                        BTN_MD,
                        "mt-2 bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
                    )}
                >
                    Export CSV
                </span>
                <span className="mt-1 block h-3 text-[9px] leading-3 text-neutral-500 dark:text-neutral-400">
                    {isDo ? "Available on the Pro plan" : null}
                </span>
            </div>
            <span className={ANNOT}>
                {isDo ? "reason shown — reads as “not yet”" : "no reason — reads as broken"}
            </span>
        </PreviewFrame>
    );
}

// ── comp-10 · Consistent icon size ──────────────────────────────────
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

// ── comp-11 · Card click area ───────────────────────────────────────
// The same article card; the dashed accent region is the hit area.
// The whole card, or just the title text — 16% of the card's area.
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
            <span className={ANNOT}>{isDo ? "hit area · 100%" : "hit area · 16%"}</span>
        </PreviewFrame>
    );
}

// ── comp-12 · Close affordance on overlays ──────────────────────────
// The same dialog over the same scrimmed page — the backdrop is drawn in
// both panes, because "closes on backdrop click" is only an exit if the
// backdrop exists. The one variable is the visible ✕.
function closeAffordance(variant: Variant, size: PreviewSize) {
    const isDo = variant === "do";
    return (
        <PreviewFrame size={size} className="flex flex-col items-center justify-center gap-2">
            <div className="relative h-[88px] w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="space-y-1.5 p-2">
                    <TextLine raised widthClass="w-1/3" />
                    <TextLine raised widthClass="w-full" />
                    <TextLine raised widthClass="w-5/6" />
                </div>
                <div aria-hidden="true" className="absolute inset-0 bg-neutral-950/55 dark:bg-black/70" />
                {/* 12px dialog around a 6px chip inset 6px: concentric, per comp-3. */}
                <div className="absolute left-1/2 top-1/2 w-40 -translate-x-1/2 -translate-y-1/2 rounded-[12px] border border-neutral-200 bg-white p-2 dark:border-neutral-700 dark:bg-neutral-800">
                    {isDo ? (
                        <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-[6px] bg-neutral-100 dark:bg-neutral-700">
                            <X
                                aria-hidden="true"
                                size={10}
                                strokeWidth={2}
                                className="text-neutral-500 dark:text-neutral-300"
                            />
                        </span>
                    ) : null}
                    <span className="block text-[10px] font-semibold text-neutral-800 dark:text-neutral-100">
                        Keyboard shortcuts
                    </span>
                    <TextLine raised widthClass="w-full" className="mt-1.5" />
                    <TextLine raised widthClass="w-3/4" className="mt-1" />
                </div>
            </div>
            {isDo ? (
                <span className={cn("flex items-center gap-1.5", FINE)}>
                    3 exits: <X aria-hidden="true" size={9} strokeWidth={2} /> · <Kbd label="Esc" /> ·
                    backdrop
                </span>
            ) : (
                <span className={FINE}>1 exit: backdrop only — nothing visible</span>
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
