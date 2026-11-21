import type { ReactNode } from "react";

import { TicketChart } from "./reading-examples";

import { Archive, ArrowDown, Check, FileText, MousePointer2, Share2, Trash2, X } from "@/components/ui/icons";

import {
    Annotation,
    ANNOTATION_INK,
    PreviewFrame,
    PRODUCT_MUTED,
    type PreviewRenderer,
    type Variant,
} from "@/components/features/rules/preview-primitives";
import { cn } from "@/lib/utils";

// Craft-pass previews for comp-1..comp-8 and comp-10..comp-15.
// comp-9 is a motion showcase and never reaches this module.
// Every pair is the same product moment with one component decision
// flipped; evidence is annotated in mono tabular-nums.

// ── Local vocabulary ────────────────────────────────────────────────

// Split so a call site can state its own tone. `cn` is plain concatenation and
// CSS resolves conflicts by stylesheet order, so `cn(ANNOT, "text-rose-600")`
// only rendered rose because "rose" happens to sort after "neutral" — rename
// the colour and it would silently go grey. ANNOT_BASE carries no colour.
const ANNOT_BASE = "font-mono text-[10px] tabular-nums";
const ANNOT_MUTED = ANNOTATION_INK;
const ANNOT = `${ANNOT_BASE} ${ANNOT_MUTED}`;
const FINE_BASE = "font-mono text-[9px] tabular-nums";
const FINE = `${FINE_BASE} ${ANNOT_MUTED}`;
// The product's own small meta (a timestamp, a role, a file size) set in the
// same face. Same ink, but it is the scene, not evidence, so it is never an
// <Annotation> and a tile keeps it.
const PRODUCT_FINE = `${FINE_BASE} ${PRODUCT_MUTED}`;
const ACCENT_TEXT = "text-blue-600 dark:text-blue-400";

// The button recipes carry shape and tone only. Size is passed per call site
// (BTN_MD, BTN_SM, BTN_XS), because `cn` cannot override a padding or font size
// baked into the recipe: comp-2's compact confirm buttons used to ship both
// `px-2.5` and `px-1.5`, and stylesheet order quietly picked the larger one.
// The 6px corner is pinned so the radius does not follow the global scale.
// Every recipe carries a 1px border (transparent where the fill is the edge),
// so a filled button beside an outline one is the same height. The colour
// stays in each recipe, never in BTN, for the same `cn` reason.
const BTN = "inline-flex items-center justify-center rounded-[6px] font-semibold";
const BTN_MD = "px-2.5 py-1.5 text-[10px]";
const BTN_SM = "px-2 py-1 text-[9px]";
const BTN_XS = "px-1.5 py-0.5 text-[9px]";
const BTN_PRIMARY = cn(
    BTN,
    "border border-transparent bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
);
const BTN_SECONDARY = cn(
    BTN,
    "border border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
);
const BTN_GHOST = cn(BTN, "border border-transparent text-neutral-500 dark:text-neutral-400");
const BTN_DANGER = cn(BTN, "border border-transparent bg-rose-600 text-white");

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
function actionHierarchy(variant: Variant) {
    const isDo = variant === "do";
    return (
        <PreviewFrame className="flex flex-col justify-center gap-3">
            <div>
                <span className="block text-[11px] font-semibold text-neutral-800 dark:text-neutral-100">
                    Ready to publish?
                </span>
                <span className={cn("mt-0.5 block text-[10px]", PRODUCT_MUTED)}>
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
            <Annotation className={ANNOT}>{isDo ? "1 primary, 2 quiet" : "3 primaries, 0 hierarchy"}</Annotation>
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
function destructiveActions(variant: Variant) {
    const isDo = variant === "do";
    return (
        <PreviewFrame className="flex items-center justify-center">
            <div className="flex w-full flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2 rounded-[12px] border border-neutral-200 bg-white p-1.5 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="min-w-0 pl-1">
                        <span className="block truncate text-[10px] font-semibold text-neutral-800 dark:text-neutral-100">
                            atlas-api
                        </span>
                        <span className={PRODUCT_FINE}>updated 2h ago</span>
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
                    <Annotation className={ANNOT}>{isDo ? "click → confirm" : "click → gone"}</Annotation>
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
                        <span className={cn("mt-0.5 block pl-1", PRODUCT_FINE)}>this can’t be undone</span>
                    </div>
                ) : (
                    <div className="flex min-h-[46px] items-center justify-center rounded-[12px] border border-dashed border-rose-400/70 dark:border-rose-500/50">
                        <Annotation className={cn(ANNOT_BASE, "text-rose-600 dark:text-rose-400")}>
                            no confirm step
                        </Annotation>
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

function nestedRadius(variant: Variant) {
    const isDo = variant === "do";
    const outer = isDo ? 12 : 4;
    const inner = 4;
    return (
        <PreviewFrame className="flex flex-col items-center justify-center gap-2.5">
            <div
                className="relative mt-3 border border-neutral-200 bg-white p-[7px] dark:border-neutral-700 dark:bg-neutral-900"
                style={{ borderRadius: outer }}
            >
                {/* Sits on the 1px border, so the arc replaces that stretch of it. */}
                <CornerArc radius={outer} className="-right-px -top-px" />
                <Annotation className={cn("absolute -top-4 right-0 leading-none", FINE_BASE, ACCENT_TEXT)}>
                    r·{outer}
                </Annotation>
                <div
                    className="relative flex h-7 w-44 items-center bg-neutral-100 px-2 text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                    style={{ borderRadius: inner }}
                >
                    Search projects…
                    <CornerArc radius={inner} className="right-0 top-0" />
                    <Annotation className={cn("ml-auto pr-1.5", FINE_BASE, ACCENT_TEXT)}>r·{inner}</Annotation>
                </div>
            </div>
            <Annotation className={ANNOT}>
                {isDo ? (
                    <>
                        <span className={ACCENT_TEXT}>12</span> = 4 + 8 inset
                    </>
                ) : (
                    <>
                        <span className={ACCENT_TEXT}>4</span> ≠ 4 + 8 inset
                    </>
                )}
            </Annotation>
        </PreviewFrame>
    );
}

// ── comp-4 · Avatars are circles ────────────────────────────────────
// The same two rows — a person and a file. Organic gets the circle,
// content keeps its corners. Each row is 13px = the 5px tile + 8px padding,
// so the rows stay concentric with what they hold (comp-3).
function avatarShapes(variant: Variant) {
    const isDo = variant === "do";
    return (
        <PreviewFrame className="flex flex-col items-center justify-center gap-2">
            <div className="w-48 space-y-2">
                <div className="flex items-center gap-2 rounded-[13px] bg-neutral-50 p-2 dark:bg-neutral-900">
                    <span
                        className={cn(
                            "flex size-6 shrink-0 items-center justify-center bg-blue-600 text-[9px] font-semibold text-white dark:bg-blue-400 dark:text-neutral-950",
                            isDo ? "rounded-full" : "rounded-[5px]"
                        )}
                    >
                        MC
                    </span>
                    <div className="min-w-0">
                        <span className="block text-[10px] font-medium text-neutral-800 dark:text-neutral-100">
                            Maya Chen
                        </span>
                        <span className={PRODUCT_FINE}>owner</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 rounded-[13px] bg-neutral-50 p-2 dark:bg-neutral-900">
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
                        <span className={PRODUCT_FINE}>2.4 MB</span>
                    </div>
                </div>
            </div>
            <Annotation className={ANNOT}>
                {isDo ? "person → circle · file → rect" : "person → rect · file → rect"}
            </Annotation>
        </PreviewFrame>
    );
}

// ── comp-5 · Modal vs drawer ────────────────────────────────────────
// The same context-heavy task — "Edit profile", six labelled fields — in
// the same app. The one variable is the container it is served in: a side
// drawer that fits the form and leaves the page readable, or a small
// centred modal that scrims the page and clips five fields off the form.
function modalVsDrawer(variant: Variant) {
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
        <PreviewFrame className="flex flex-col items-center justify-center gap-2">
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
                        {/* The fields scroll inside a 24px viewport: one whole
                            row, then the next fading out from where the first
                            ends, so the cut-off reads as "more below" rather
                            than a slice. The rail beside the rows is that
                            viewport's scrollbar; 24px of 82px of rows puts the
                            thumb at about 7px. */}
                        <div className="absolute left-1/2 top-1/2 w-[58%] -translate-x-1/2 -translate-y-1/2 space-y-0.5 overflow-hidden rounded-[6px] border border-blue-500 bg-white p-1 pl-1.5 dark:border-blue-400 dark:bg-neutral-800">
                            <span className="block text-[10px] font-semibold leading-3 text-neutral-800 dark:text-neutral-100">
                                Edit profile
                            </span>
                            <div className="flex gap-1">
                                <div className="h-6 flex-1 space-y-0.5 overflow-hidden [mask-image:linear-gradient(to_bottom,black_12px,transparent)]">
                                    {fieldRows}
                                </div>
                                <span
                                    aria-hidden="true"
                                    className="relative h-6 w-0.5 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-700"
                                >
                                    <span className="absolute inset-x-0 top-0 h-[7px] rounded-full bg-neutral-400 dark:bg-neutral-500" />
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <Annotation className={ANNOT}>
                {isDo ? "drawer · 6 of 6 fields · page stays legible" : "modal · 1 of 6 fields · page blacked out"}
            </Annotation>
        </PreviewFrame>
    );
}

// ── comp-6 · Toast vs inline error ──────────────────────────────────
// The same invalid email, the same field, the same reserved helper slot
// under it. The one variable is where the fix is published: in the slot
// the eye is already in, or in a toast in the opposite corner.
function toastVsInline(variant: Variant) {
    const isDo = variant === "do";
    return (
        <PreviewFrame className="relative flex flex-col justify-center gap-2">
            <div className="w-40">
                <span className="block text-[10px] font-semibold text-neutral-600 dark:text-neutral-300">
                    Email
                </span>
                <div className="mt-1 flex h-6 items-center rounded-md border border-rose-500 bg-white px-2 text-[10px] text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">
                    maya@
                </div>
                <span className="mt-1 block h-3 text-[9px] font-medium leading-3 text-rose-600 dark:text-rose-400">
                    {isDo ? "Add the domain after @" : null}
                </span>
            </div>
            <Annotation className={ANNOT}>
                {isDo ? "fix sits under the field" : "fix sits in the far corner ↗"}
            </Annotation>
            {!isDo ? (
                <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2 py-1.5 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
                    <span className="size-1.5 rounded-full bg-rose-500" />
                    <span className="text-[9px] font-medium text-neutral-700 dark:text-neutral-200">
                        Add the domain after @
                    </span>
                </div>
            ) : null}
        </PreviewFrame>
    );
}

// ── comp-7 · Icon + label for ambiguous actions ─────────────────────
// The same three actions. Archive/share/delete are guesses as glyphs;
// labels retire the guessing. The bar is 13px = the 6px buttons + 1px border
// + 6px padding, so its corners stay concentric with theirs (comp-3).
function iconPlusLabel(variant: Variant) {
    const isDo = variant === "do";
    const actions = [
        { icon: Archive, label: "Archive" },
        { icon: Share2, label: "Share" },
        { icon: Trash2, label: "Delete" },
    ];
    return (
        <PreviewFrame className="flex flex-col items-center justify-center gap-3">
            <div className="flex items-center gap-1.5 rounded-[13px] border border-neutral-200 bg-white p-1.5 dark:border-neutral-800 dark:bg-neutral-900">
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
            <Annotation className={ANNOT}>{isDo ? "0 guesses" : "3 guesses"}</Annotation>
        </PreviewFrame>
    );
}

// ── comp-8 · Disabled needs a reason ────────────────────────────────
// The same locked export inside the panel it actually lives in, so the
// disabled control is judged in real UI rather than floating alone. The
// helper slot under the button is reserved in both panes — the one
// variable is whether a sentence occupies it.
function disabledReason(variant: Variant) {
    const isDo = variant === "do";
    return (
        <PreviewFrame className="flex flex-col items-center justify-center gap-2">
            <div className="w-full rounded-md border border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[10px] font-semibold text-neutral-800 dark:text-neutral-100">
                        Usage report
                    </span>
                    <span className={PRODUCT_FINE}>Aug 1–31</span>
                </div>
                <TextLine widthClass="w-full" className="mt-1.5" />
                <TextLine widthClass="w-3/4" className="mt-1" />
                {/* Disabled ink stays faint on purpose: WCAG 1.4.3 exempts inactive controls. */}
                <span
                    className={cn(
                        BTN,
                        BTN_MD,
                        "mt-2 border border-transparent bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
                    )}
                >
                    Export CSV
                </span>
                <span className="mt-1 block h-3 text-[9px] leading-3 text-neutral-500 dark:text-neutral-400">
                    {isDo ? "Available on the Pro plan" : null}
                </span>
            </div>
            <Annotation className={ANNOT}>
                {isDo ? "reason shown — reads as “not yet”" : "no reason — reads as broken"}
            </Annotation>
        </PreviewFrame>
    );
}

// ── comp-10 · Consistent icon size ──────────────────────────────────
// The same toolbar with a baseline drawn. One size reads as a set;
// three sizes read as three donors.
function iconSizes(variant: Variant) {
    const isDo = variant === "do";
    const sizes = isDo ? [20, 20, 20] : [16, 20, 24];
    const icons = [Archive, Share2, Trash2];
    return (
        <PreviewFrame className="flex flex-col items-center justify-center gap-3">
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
            <Annotation className={ANNOT}>{sizes.join(" · ")}</Annotation>
        </PreviewFrame>
    );
}

// ── comp-11 · Card click area ───────────────────────────────────────
// The same article card; the dashed accent region is the hit area.
// The illustrated target covers either the card or its title.
function cardClickArea(variant: Variant) {
    const isDo = variant === "do";
    return (
        <PreviewFrame className="flex flex-col items-center justify-center gap-2">
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
            <Annotation className={ANNOT}>{isDo ? "hit area · whole card" : "hit area · title only"}</Annotation>
        </PreviewFrame>
    );
}

// ── comp-12 · Close affordance on overlays ──────────────────────────
// The same dialog over the same scrimmed page — the backdrop is drawn in
// both panes, because "closes on backdrop click" is only an exit if the
// backdrop exists. The one variable is the visible ✕.
function closeAffordance(variant: Variant) {
    const isDo = variant === "do";
    return (
        <PreviewFrame className="flex flex-col items-center justify-center gap-2">
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
                <Annotation className={cn("flex items-center gap-1.5", FINE)}>
                    3 exits: <X aria-hidden="true" size={9} strokeWidth={2} /> · <Kbd label="Esc" /> ·
                    backdrop
                </Annotation>
            ) : (
                <Annotation className={FINE}>1 exit: backdrop only — nothing visible</Annotation>
            )}
        </PreviewFrame>
    );
}

// ── comp-14 · Links navigate, buttons act ───────────────────────────
// The same invoice row and the same "View invoice" control, painted
// identically, right-clicked in both panes. The one variable is the element
// underneath. A real link gets the browser's link menu and puts its address
// in the status bar; a div that calls router.push gets the page menu and no
// address, because the browser never learns it is a destination.
const LINK_MENU = ["Open link in new tab", "Open link in new window", "Copy link address"];
const PAGE_MENU = ["Back", "Reload", "Save page as…"];

function linksNavigate(variant: Variant) {
    const isDo = variant === "do";
    const items = isDo ? LINK_MENU : PAGE_MENU;
    return (
        <PreviewFrame className="flex flex-col justify-center gap-2">
            <Annotation className={ANNOT}>
                {isDo ? "<a href> · link menu · URL shown" : "<div onClick> · page menu · no URL"}
            </Annotation>
            {/* The browser window, drawn in the flow at a fixed height so the
                menu and the status bar sit inside it in every context. */}
            <div className="relative h-[112px] overflow-hidden rounded-[8px] border border-neutral-200 bg-neutral-50 p-1.5 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center justify-between gap-2 rounded-[6px] border border-neutral-200 bg-white p-1.5 dark:border-neutral-700 dark:bg-neutral-950">
                    <div className="min-w-0 pl-1">
                        <span className="block truncate text-[10px] font-semibold text-neutral-800 dark:text-neutral-100">
                            INV-1042 · Northwind
                        </span>
                        <span className={PRODUCT_FINE}>$1,240.00 · due Aug 14</span>
                    </div>
                    <span className={cn(BTN_SECONDARY, BTN_SM, "relative shrink-0")}>
                        View invoice
                        <MousePointer2
                            aria-hidden="true"
                            size={12}
                            className="absolute -bottom-2 left-1/2 fill-neutral-800 stroke-white stroke-[1.5] dark:fill-neutral-100 dark:stroke-neutral-900"
                        />
                    </span>
                </div>
                {/* The context menu opens at the pointer, under the control. */}
                <div className="absolute right-3 top-[50px] w-[132px] rounded-[6px] border border-neutral-200 bg-white p-0.5 shadow-[0_4px_12px_rgb(0_0_0/0.08)] dark:border-neutral-700 dark:bg-neutral-800 dark:shadow-[0_4px_12px_rgb(0_0_0/0.5)]">
                    {items.map((item) => (
                        <span
                            key={item}
                            className="block truncate rounded-[4px] px-1.5 py-[3px] text-[9px] leading-3 text-neutral-700 dark:text-neutral-200"
                        >
                            {item}
                        </span>
                    ))}
                </div>
                {/* The status bar: bottom-left, flush with the window edge. It
                    only appears while the pointer is over a real link. */}
                {isDo ? (
                    <span className="absolute bottom-0 left-0 rounded-tr-[6px] border-r border-t border-neutral-200 bg-white px-1.5 py-0.5 font-mono text-[9px] leading-3 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        acme.app/invoices/1042
                    </span>
                ) : null}
            </div>
        </PreviewFrame>
    );
}

// ── comp-15 · The image proves the headline ─────────────────────────
// The same hero: identical headline, subline and frame. Only the picture in
// the frame changes. Do crops the product at the moment the headline
// promises, the failing deploy flagged against the checkout errors it
// caused. Don't fills the same frame with floating avatars, a green check
// and two soft blobs, which would fit any product's headline equally well.
const DEPLOYS = [
    { id: "#419", service: "billing", time: "14:20", bad: false },
    { id: "#418", service: "checkout", time: "14:02", bad: true },
    { id: "#417", service: "search", time: "13:40", bad: false },
];

function productCrop() {
    return (
        <div className="flex h-full flex-col bg-white p-1.5 dark:bg-neutral-900">
            <div className="flex items-baseline justify-between px-1 pb-1">
                <span className="text-[9px] font-semibold text-neutral-700 dark:text-neutral-200">Deploys</span>
                <span className={PRODUCT_FINE}>checkout errors</span>
            </div>
            <div className="space-y-0.5">
                {DEPLOYS.map((deploy) => (
                    <div
                        key={deploy.id}
                        className={cn(
                            "flex items-center gap-1.5 rounded-[4px] px-1 py-[3px] text-[9px] leading-3",
                            deploy.bad
                                ? "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:ring-rose-800"
                                : "text-neutral-600 dark:text-neutral-300"
                        )}
                    >
                        <span className="w-6 font-semibold tabular-nums">{deploy.id}</span>
                        <span className="min-w-0 flex-1 truncate">{deploy.service}</span>
                        <span className="tabular-nums">{deploy.time}</span>
                        <span
                            className={cn(
                                "w-[52px] shrink-0 text-right font-semibold tabular-nums",
                                deploy.bad ? "" : "text-neutral-500 dark:text-neutral-400"
                            )}
                        >
                            {deploy.bad ? "5xx ↑ 38%" : "—"}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Two blurred discs, three floating portraits and a success badge: the stock
// hero kit. None of it names a deploy, a service or an error.
function decorativeHero() {
    return (
        <div className="relative h-full overflow-hidden bg-white dark:bg-neutral-900">
            <span className="absolute -left-4 -top-6 size-20 rounded-full bg-blue-300/50 blur-xl dark:bg-blue-500/30" />
            <span className="absolute -bottom-8 right-2 size-20 rounded-full bg-violet-300/50 blur-xl dark:bg-violet-500/30" />
            {[
                { initials: "MC", className: "left-[18%] top-3 bg-amber-200 text-amber-900" },
                { initials: "AR", className: "left-[42%] top-7 bg-sky-200 text-sky-900" },
                { initials: "SK", className: "left-[64%] top-2 bg-rose-200 text-rose-900" },
            ].map((avatar) => (
                <span
                    key={avatar.initials}
                    className={cn(
                        "absolute flex size-6 items-center justify-center rounded-full text-[8px] font-semibold shadow-[0_2px_6px_rgb(0_0_0/0.12)] ring-2 ring-white dark:ring-neutral-900",
                        avatar.className
                    )}
                >
                    {avatar.initials}
                </span>
            ))}
            <span className="absolute bottom-3 left-[34%] flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_2px_6px_rgb(0_0_0/0.12)]">
                <Check aria-hidden="true" size={12} strokeWidth={2.5} />
            </span>
        </div>
    );
}

function headlineProof(variant: Variant) {
    const isDo = variant === "do";
    return (
        <PreviewFrame className="flex flex-col gap-2">
            <div>
                <span className="block text-[12px] font-semibold leading-4 text-neutral-900 dark:text-neutral-50">
                    Find the deploy that broke checkout
                </span>
                <span className={cn("mt-0.5 block text-[9px]", PRODUCT_MUTED)}>
                    Errors matched to the change that caused them
                </span>
            </div>
            <div className="h-[84px] overflow-hidden rounded-[8px] border border-neutral-200 dark:border-neutral-800">
                {isDo ? productCrop() : decorativeHero()}
            </div>
            <Annotation className={ANNOT}>
                {isDo ? "points to: deploy #418 · checkout 5xx ↑ 38%" : "points to: nothing the headline names"}
            </Annotation>
        </PreviewFrame>
    );
}

// ── Dispatcher ──────────────────────────────────────────────────────

export const componentPreviews: PreviewRenderer = (ruleId, variant): ReactNode | null => {
    switch (ruleId) {
        case "comp-1":
            return actionHierarchy(variant);
        case "comp-2":
            return destructiveActions(variant);
        case "comp-3":
            return nestedRadius(variant);
        case "comp-4":
            return avatarShapes(variant);
        case "comp-5":
            return modalVsDrawer(variant);
        case "comp-6":
            return toastVsInline(variant);
        case "comp-7":
            return iconPlusLabel(variant);
        case "comp-8":
            return disabledReason(variant);
        case "comp-10":
            return iconSizes(variant);
        case "comp-11":
            return cardClickArea(variant);
        case "comp-12":
            return closeAffordance(variant);
        case "comp-13":
            return <PreviewFrame className="flex items-center justify-center"><TicketChart variant={variant} /></PreviewFrame>;
        case "comp-14":
            return linksNavigate(variant);
        case "comp-15":
            return headlineProof(variant);
        default:
            return null;
    }
};
