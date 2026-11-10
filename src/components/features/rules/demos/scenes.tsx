import type { CSSProperties, ReactNode } from "react";
import { Archive, CheckCircle2, ChevronDown, FileText, Inbox, Moon, Pencil } from "lucide-react";

import { cn } from "@/lib/utils";
import { MiniButton } from "@/components/features/rules/preview-primitives";
import { MotionRail, ProtagonistChip } from "@/components/features/rules/demos/protagonist";

/**
 * Miniature UI scenes. No hooks, no state — pure markup rendering the rest
 * frame. Animated elements carry `data-anim` attributes the showcase engine
 * targets. Overlay elements that should be invisible at rest carry inline
 * `opacity: 0` (the engine's keyframes own their appearance; `fill: "forwards"`
 * holds the end state).
 */

/**
 * A tiny app surface: title-bar + content lines. Gives overlays (modals, toasts,
 * menus) real UI context so their motion has spatial logic — and keeps every
 * rest frame looking like a composed interface instead of an empty box.
 */
export function AppSurface({
    children,
    dim = false,
    title = "App",
}: {
    children?: ReactNode;
    dim?: boolean;
    /** Window title — readable at rest so the stage isn't an empty shell. */
    title?: string;
}) {
    return (
        <div className="relative h-44 overflow-hidden rounded-field border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center gap-1.5 border-b border-neutral-100 px-2 py-1.5 dark:border-neutral-800">
                <span className="size-1.5 rounded-full bg-rose-400/80" />
                <span className="size-1.5 rounded-full bg-amber-400/80" />
                <span className="size-1.5 rounded-full bg-emerald-400/80" />
                <span className="ml-1.5 truncate text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                    {title}
                </span>
            </div>
            {/* Rest content stays legible — overlays (modals/palettes) sit on top. */}
            <div className={cn("space-y-1.5 p-2.5", dim && "opacity-50")}>
                <div className="flex items-center gap-2">
                    <span className="size-5 shrink-0 rounded-md bg-neutral-100 dark:bg-neutral-800" />
                    <div className="min-w-0 flex-1 space-y-1">
                        <div className="h-1.5 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
                        <div className="h-1.5 w-1/2 rounded bg-neutral-100 dark:bg-neutral-800" />
                    </div>
                </div>
                <div className="h-1.5 w-full rounded bg-neutral-100 dark:bg-neutral-800" />
                <div className="h-1.5 w-2/3 rounded bg-neutral-100 dark:bg-neutral-800" />
                <div className="h-1.5 w-4/5 rounded bg-neutral-100 dark:bg-neutral-800" />
                <div className="h-1.5 w-1/2 rounded bg-neutral-100 dark:bg-neutral-800" />
            </div>
            {children}
        </div>
    );
}

/** Modal: scrim + centered dialog, both hidden at rest. */
export function ModalScene() {
    return (
        <AppSurface title="Files">
            <div data-anim="scrim" className="absolute inset-0 bg-neutral-900/45" style={{ opacity: 0 }} />
            <div
                data-anim="panel"
                // Wide enough for Cancel + Delete inside its own padding.
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-blue-500 bg-white p-2.5 shadow-xl dark:bg-neutral-900 w-[8.5rem]"
                style={{ opacity: 0 }}
            >
                <p className="mb-1 text-[11px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                    Delete file?
                </p>
                <p className="mb-2 text-[9px] leading-snug text-neutral-500 dark:text-neutral-400">
                    This can’t be undone.
                </p>
                <div className="flex justify-end gap-1">
                    <MiniButton label="Cancel" variant="secondary" />
                    <MiniButton label="Delete" variant="danger" />
                </div>
            </div>
        </AppSurface>
    );
}

/** Command palette: floating input + result rows, hidden at rest. */
export function PaletteScene() {
    return (
        <AppSurface dim title="Editor">
            <div
                data-anim="panel"
                // top-9 floats it below the window title bar, never over its dots.
                // 13px = the search field's 6px + 6px padding + 1px border, so
                // the field sits concentric in the panel (comp-3).
                className="absolute inset-x-2.5 rounded-[13px] border border-blue-500 bg-white p-1.5 shadow-xl dark:bg-neutral-900 top-9"
                style={{ opacity: 0 }}
            >
                <div className="mb-1.5 flex items-center justify-between gap-1 rounded-md bg-neutral-100 px-2 py-1.5 dark:bg-neutral-800">
                    <span className="text-[10px] text-neutral-400">Search commands…</span>
                    {/* data-anim="key": motion-2 depresses this on each keystroke */}
                    <kbd
                        data-anim="key"
                        className="inline-block rounded border border-neutral-300 px-1 font-mono text-[9px] font-medium text-neutral-500 dark:border-neutral-600 dark:text-neutral-400"
                    >
                        K
                    </kbd>
                </div>
                <div className="mb-0.5 flex items-center gap-1.5 rounded-md px-1.5 py-1">
                    <FileText aria-hidden="true" className="size-3.5 text-blue-500" />
                    <span className="text-[11px] font-medium text-neutral-800 dark:text-neutral-200">
                        Open file…
                    </span>
                </div>
                <div className="flex items-center gap-1.5 rounded-md px-1.5 py-1">
                    <Moon aria-hidden="true" className="size-3.5 text-neutral-400" />
                    <span className="text-[11px] text-neutral-600 dark:text-neutral-300">
                        Toggle theme
                    </span>
                </div>
            </div>
        </AppSurface>
    );
}

/** Side panel sliding in from the right edge (rest: parked off-frame). */
export function EdgePanelScene() {
    return (
        <AppSurface title="Workspace">
            <div
                data-anim="panel"
                className="absolute inset-y-0 right-0 w-[42%] border-l border-blue-500/60 bg-white p-2 shadow-lg dark:bg-neutral-900"
                style={{ transform: "translateX(110%)" }}
            >
                <p className="mb-1.5 text-[10px] font-semibold text-neutral-800 dark:text-neutral-100">
                    Details
                </p>
                <div className="mb-1 h-1.5 w-full rounded bg-neutral-100 dark:bg-neutral-800" />
                <div className="mb-1 h-1.5 w-4/5 rounded bg-neutral-100 dark:bg-neutral-800" />
                <div className="h-1.5 w-3/5 rounded bg-neutral-100 dark:bg-neutral-800" />
            </div>
        </AppSurface>
    );
}

/** Toast rising from the bottom edge (rest: parked below the frame). */
export function ToastScene() {
    return (
        <AppSurface title="Inbox">
            <div
                data-anim="panel"
                className="absolute inset-x-2.5 bottom-2.5 flex flex-col gap-1 rounded-md border border-blue-500 bg-white px-2.5 py-2 shadow-lg dark:bg-neutral-900"
                style={{ transform: "translateY(150%)" }}
            >
                <div className="flex items-center gap-1.5">
                    <CheckCircle2 aria-hidden="true" className="size-3.5 text-emerald-500" />
                    <span className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-100">
                        Saved
                    </span>
                </div>
                <span className="h-0.5 w-full rounded-full bg-emerald-500/35" />
            </div>
        </AppSurface>
    );
}

/** Menu popover opening from a trigger button. `origin` is the lesson knob.
 *  `originMarker` renders a data-anim="origin-dot" pip at the transform-origin
 *  (motion-10 makes the origin literally visible during playback). */
export function MenuScene({
    origin,
    originMarker = false,
}: {
    origin: string;
    originMarker?: boolean;
}) {
    return (
        <div className="relative h-44 overflow-hidden rounded-field border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            {/* Fake app chrome so rest isn't a black void */}
            <div className="absolute inset-x-0 top-0 flex items-center gap-1 border-b border-neutral-100 px-2 py-1.5 dark:border-neutral-800">
                <span className="size-1.5 rounded-full bg-rose-400/80" />
                <span className="size-1.5 rounded-full bg-amber-400/80" />
                <span className="size-1.5 rounded-full bg-emerald-400/80" />
            </div>
            <div className="absolute left-2 top-8">
                <MiniButton label="Menu" variant="secondary" />
            </div>
            {/* 11px = the rows' 6px + 4px padding + 1px border, so the
                highlighted row sits concentric in the menu (comp-3). */}
            <div
                data-anim="panel"
                className="absolute left-2 top-[3.75rem] w-28 rounded-[11px] border border-blue-500 bg-white p-1 shadow-xl dark:bg-neutral-900"
                style={{ opacity: 0, transformOrigin: origin } as CSSProperties}
            >
                <div className="rounded-md bg-neutral-100 px-2 py-1.5 text-[11px] font-medium text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100">
                    Rename
                </div>
                <div className="px-2 py-1.5 text-[11px] text-neutral-600 dark:text-neutral-300">
                    Duplicate
                </div>
                <div className="px-2 py-1.5 text-[11px] text-neutral-600 dark:text-neutral-300">
                    Share…
                </div>
            </div>
            {originMarker ? (
                // Pip at the panel's transform-origin — fades in with the menu
                // so "where it grows from" is literally visible.
                <span
                    data-anim="origin-dot"
                    className="absolute z-10 size-2 rounded-full bg-blue-500 ring-2 ring-white dark:bg-blue-400 dark:ring-neutral-900"
                    style={{
                        opacity: 0,
                        ...(origin === "center"
                            ? { left: "calc(0.5rem + 3.5rem - 4px)", top: "calc(3.75rem + 2.75rem - 4px)" }
                            : { left: "calc(0.5rem - 4px)", top: "calc(3.75rem - 4px)" }),
                    }}
                />
            ) : null}
        </div>
    );
}

/** Tooltip above a button. */
export function TooltipScene() {
    return (
        <div className="relative flex items-end justify-center rounded-field border border-neutral-200 bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-900/50 h-36 pb-4">
            <div
                data-anim="panel"
                className="absolute top-3 rounded-md bg-neutral-900 px-2 py-1 text-[9px] font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
                style={{ opacity: 0 }}
            >
                Save (⌘S)
            </div>
            <MiniButton label="Save" variant="secondary" />
        </div>
    );
}

/** Three list rows (targets share data-anim="row" so tracks can stagger them). */
const LIST_ROWS = [
    { icon: Inbox, label: "Inbox" },
    { icon: Pencil, label: "Drafts" },
    { icon: Archive, label: "Archive" },
];

export function ListScene({ hiddenAtRest }: { hiddenAtRest: boolean }) {
    return (
        <div className="relative flex flex-col justify-center gap-2 rounded-field border border-neutral-200 bg-neutral-50/50 px-2 dark:border-neutral-800 dark:bg-neutral-900/40 h-40">
            {hiddenAtRest ? (
                <div
                    aria-hidden="true"
                    className="absolute inset-x-2 inset-y-0 flex flex-col justify-center gap-2"
                >
                    {LIST_ROWS.map(({ label }) => (
                        <div
                            key={label}
                            className="h-[26px] rounded-md border border-dashed border-neutral-300 dark:border-neutral-700"
                        />
                    ))}
                </div>
            ) : null}
            {LIST_ROWS.map(({ icon: Icon, label }) => (
                <div
                    key={label}
                    data-anim="row"
                    className="relative flex h-[26px] items-center gap-2 rounded-md px-1.5"
                    style={hiddenAtRest ? { opacity: 0 } : undefined}
                >
                    <Icon aria-hidden="true" className="size-3.5 shrink-0 text-blue-500/80" />
                    <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-200">
                        {label}
                    </span>
                </div>
            ))}
        </div>
    );
}

/** A labeled chip racing across a track — for pure timing/easing comparisons. */
export function RaceScene({ label = "Item" }: { label?: string }) {
    return (
        <div className="flex flex-col justify-center h-32 px-0.5">
            <MotionRail hug>
                <ProtagonistChip anim="panel" label={label} compact="narrow" />
            </MotionRail>
        </div>
    );
}

/** A dismissable card on a clipped rail (motion-18/19 grid previews simulate
 *  the gesture; the deep-dive renders the real drag prototype instead). */
export function RailCardScene() {
    return (
        <div className="flex flex-col justify-center h-36 px-1">
            <div
                className="relative flex w-full items-center overflow-hidden rounded-field border border-dashed border-neutral-300 bg-neutral-50/80 p-2 dark:border-neutral-700 dark:bg-neutral-900/50"
                style={{ containerType: "inline-size" }}
            >
                <div
                    data-anim="card"
                    className="flex flex-col justify-center rounded-[12px] border border-blue-500 bg-blue-500/10 shadow-sm dark:border-blue-400 dark:bg-blue-400/10 h-11 w-20 p-1.5"
                >
                    <span className="mb-1 text-[10px] font-semibold leading-none tracking-tight text-blue-700 dark:text-blue-300">
                        Message
                    </span>
                    <div className="h-1 w-3/4 rounded bg-blue-500/40 dark:bg-blue-400/40" />
                    <div className="mt-1 h-1 w-1/2 rounded bg-blue-500/40 dark:bg-blue-400/40" />
                </div>
            </div>
        </div>
    );
}

/** A slider knob on a track (motion-20 grid preview simulates the drag). */
const KNOB_PX = 16;

export function SliderScene() {
    return (
        <div className="flex flex-col justify-center gap-2.5 h-36 rounded-field border border-neutral-200 bg-neutral-50/80 px-3 dark:border-neutral-800 dark:bg-neutral-900/50">
            <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                Volume
            </span>
            <div
                className="relative h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800"
                style={{ containerType: "inline-size" }}
            >
                <div
                    data-anim="knob"
                    className="absolute rounded-full border border-blue-600 bg-blue-600 shadow-sm dark:border-blue-500 dark:bg-blue-500"
                    style={{ width: KNOB_PX, height: KNOB_PX, top: `calc(50% - ${KNOB_PX / 2}px)`, left: 0 }}
                />
            </div>
        </div>
    );
}

/** Parent chip containing a child chip (motion-23: inherited motion variables).
 *
 *  The child is a sibling laid over a dashed slot inside the parent, not a
 *  DOM child, so it travels on its own track instead of riding the parent's
 *  transform: whatever duration it runs is the duration you see. The slot
 *  moves with the parent, so a child on a different clock visibly trails it.
 *  The parent label swaps 220ms → 140ms when the parent is sped up. */
export function NestedChipsScene({
    childLabel = "220ms",
    childInherits = false,
}: {
    childLabel?: string;
    childInherits?: boolean;
}) {
    const label = (
        <>
            <span className="hidden @[10rem]:inline">child · </span>
            {childLabel}
        </>
    );
    const chip = "whitespace-nowrap rounded-md border px-2 py-1 font-mono font-medium leading-4 text-[10px]";
    return (
        <div className="@container flex max-w-full items-end justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50/80 px-3 dark:border-neutral-800 dark:bg-neutral-900/50 h-36 pb-4">
            <div className="relative max-w-full">
                <div
                    data-anim="parent"
                    className="rounded-lg border border-blue-500/60 bg-white dark:bg-neutral-900 p-2.5"
                >
                    <span className="mb-1.5 grid font-mono font-medium tracking-tight text-neutral-500 dark:text-neutral-400 text-[10px]">
                        <span data-anim="parent-was" className="col-start-1 row-start-1">
                            parent · 220ms
                        </span>
                        <span
                            data-anim="parent-now"
                            className="col-start-1 row-start-1"
                            style={{ opacity: 0 }}
                        >
                            parent · 140ms
                        </span>
                    </span>
                    {/* Where the child belongs. Same box as the chip, so at rest
                        the chip covers it exactly. */}
                    <div
                        aria-hidden="true"
                        className={cn(chip, "w-fit border-dashed border-neutral-300 text-transparent dark:border-neutral-600")}
                    >
                        {label}
                    </div>
                </div>
                <div
                    data-anim="child"
                    className={cn(
                        chip,
                        "absolute",
                        "bottom-[11px] left-[11px]",
                        childInherits
                            ? "border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-500/50 dark:bg-rose-950 dark:text-rose-300"
                            : "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-300"
                    )}
                >
                    {label}
                </div>
            </div>
        </div>
    );
}

/** A single centered button (press feedback, hover scale, hue shift).
 *  `restBounds` draws a dashed outline at the button's rest size behind it,
 *  hidden while the button is at rest. Any scale reveals the gap between the
 *  two, so 0.96 and 0.90 read as different numbers rather than "smaller". */
export function ButtonScene({
    label,
    variant = "primary",
    background,
    restBounds = false,
}: {
    label: string;
    variant?: "primary" | "secondary";
    background?: string;
    restBounds?: boolean;
}) {
    // Big enough that a 4% press is a visible 2px, not a rounding error.
    const button = "inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md px-6 text-sm font-semibold";
    return (
        <div className="flex flex-col items-center justify-center gap-2.5 rounded-field border border-neutral-200 bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-900/50 h-36">
            <p className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                Form actions
            </p>
            <span className="relative inline-flex">
                {restBounds ? (
                    <span
                        aria-hidden="true"
                        className="absolute inset-0 rounded-md border border-dashed border-neutral-400 dark:border-neutral-500"
                    />
                ) : null}
                <span data-anim="panel" className="relative inline-flex" style={background ? { borderRadius: 6 } : undefined}>
                    {background ? (
                        <span
                            className={cn(button, "text-white")}
                            style={{ backgroundColor: background }}
                            data-anim="fill"
                        >
                            {label}
                        </span>
                    ) : (
                        <span
                            className={cn(
                                button,
                                variant === "primary"
                                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                                    : "border border-neutral-300 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                            )}
                        >
                            {label}
                        </span>
                    )}
                </span>
            </span>
        </div>
    );
}

/** Two contextual icons occupying the same visual slot. Both stay mounted so
 * the showcase can compare a composed cross-fade with an abrupt state swap.
 * The slot is a real 40px icon button with a 24px glyph, big enough that the
 * 4px blur reads as a blur at ¼× instead of a smudge. */
const ICON_PX = 24;

export function IconSwapScene() {
    const glyph = {
        "aria-hidden": true,
        viewBox: "0 0 24 24",
        className: "absolute inset-0",
        fill: "none",
        stroke: "currentColor",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 2,
    } as const;
    return (
        <div className="flex items-center justify-center rounded-field border border-neutral-200 bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-900/50 h-36">
            <span className="inline-flex size-10 items-center justify-center rounded-[12px] border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <span className="relative text-blue-600 dark:text-blue-400" style={{ width: ICON_PX, height: ICON_PX }}>
                    <svg data-anim="icon-out" {...glyph}>
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    <svg
                        data-anim="icon-in"
                        {...glyph}
                        style={{ opacity: 0, transform: "scale(0.25)", filter: "blur(4px)" }}
                    >
                        <path d="m5 12 4 4L19 6" />
                    </svg>
                </span>
            </span>
        </div>
    );
}

/** Submit button whose label crossfades to a spinner (rest: idle label). */
export function SubmitScene({ spinner }: { spinner: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2.5 rounded-field border border-neutral-200 bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-900/50 h-36">
            <p className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                Checkout
            </p>
            <span
                data-anim="fill"
                className="relative inline-flex items-center justify-center rounded-md bg-neutral-900 font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900 px-3 py-1.5 text-xs"
            >
                <span data-anim="label">Submit</span>
                {spinner ? (
                    <span
                        data-anim="spinner"
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ opacity: 0 }}
                    >
                        <span className="inline-block animate-spin rounded-full border-2 border-neutral-400 border-t-transparent dark:border-neutral-500 size-3.5" />
                    </span>
                ) : null}
            </span>
        </div>
    );
}

/** Like button: grey outline heart with a red heart revealed on play.
 *  `data-anim="sync"` is the background-sync receipt (sys-9's do pane fades
 *  it in ~700ms after the optimistic fill). `data-anim="wait"` is a 14px
 *  spinner in the heart's slot, which the don't pane shows for the whole
 *  round trip in place of the `outline` heart. */
const HEART_PATH =
    "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z";

export function LikeScene() {
    return (
        <div className="relative flex flex-col items-center justify-center gap-2 rounded-field border border-neutral-200 bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-900/50 h-36">
            <p className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                Post
            </p>
            <div className="relative" style={{ width: 26, height: 26 }}>
                <svg data-anim="outline" viewBox="0 0 24 24" className="absolute inset-0 text-neutral-400 dark:text-neutral-600" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d={HEART_PATH} />
                </svg>
                <span
                    data-anim="wait"
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ opacity: 0 }}
                >
                    <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600 dark:border-neutral-700 dark:border-t-neutral-300" />
                </span>
                <svg data-anim="panel" viewBox="0 0 24 24" className="absolute inset-0 text-rose-500" fill="currentColor" style={{ opacity: 0 }}>
                    <path d={HEART_PATH} />
                </svg>
            </div>
            <span
                data-anim="sync"
                className="font-mono text-[9px] font-medium text-emerald-600 dark:text-emerald-400"
                style={{ opacity: 0 }}
            >
                synced ✓
            </span>
        </div>
    );
}

/** sys-1's row widths. Both layers read them, so the skeleton promises the
 *  exact line lengths the content resolves to. */
const ROWS = ["w-full", "w-5/6", "w-2/3"] as const;
/** Long enough to truncate at every pane width, so each line's ink runs to
 *  the end of its row the way the skeleton bar does. */
const ROW_TEXT = [
    "Q3 planning review: roadmap, hiring, budget and the launch checklist",
    "Notes from Tuesday's sync with design, engineering and support",
    "Owners are assigned and due before the Friday release window",
] as const;

/** Loading treatment: skeleton rows or a lone spinner, then content fades in.
 *  Every row is a 16px line box: a 10px/16px text line, or an 8px bar with
 *  4px above and below it, so the swap at 900ms moves nothing. */
export function LoadingScene({ kind }: { kind: "skeleton" | "spinner" }) {
    return (
        <div className="relative flex flex-col justify-center rounded-field border border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/40 h-36 px-3">
            {kind === "skeleton" ? (
                <div data-anim="placeholder" className="flex flex-col">
                    {ROWS.map((width) => (
                        <div
                            key={width}
                            className={cn("my-1 h-2 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700", width)}
                        />
                    ))}
                </div>
            ) : (
                <div data-anim="placeholder" className="flex justify-center">
                    <span className="inline-block animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100 size-7" />
                </div>
            )}
            <div data-anim="content" className="absolute inset-x-0 px-3" style={{ opacity: 0 }}>
                {ROWS.map((width, i) => (
                    <p
                        key={width}
                        className={cn(
                            "truncate text-[10px] leading-4",
                            i === 0
                                ? "font-semibold text-neutral-800 dark:text-neutral-100"
                                : "text-neutral-500 dark:text-neutral-400",
                            width
                        )}
                    >
                        {ROW_TEXT[i]}
                    </p>
                ))}
            </div>
        </div>
    );
}

/** For motion-14's don't: a disclosure panel that animates its own height
 *  (layout work on every frame) instead of transforming into place. The body
 *  grows 2px -> 30px — the content's laid-out height plus its own border — so
 *  the reveal lands on a real layout, not an arbitrary number. */
export function GrowBoxScene() {
    return (
        <div
            // h-44 matches AppSurface: motion-14's panes must be the same
            // size so the animated property is the only difference.
            className="flex flex-col justify-center rounded-field border border-neutral-200 bg-neutral-50/80 px-3 dark:border-neutral-800 dark:bg-neutral-900/50 h-44"
        >
            <div className="rounded-lg border border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-semibold tracking-tight text-neutral-800 dark:text-neutral-100">
                        Details
                    </span>
                    <ChevronDown aria-hidden="true" className="size-3 text-neutral-400" />
                </div>
                <div
                    data-anim="panel"
                    className="overflow-hidden rounded border border-blue-500 bg-blue-500/10 dark:border-blue-400 dark:bg-blue-400/10"
                    style={{ height: 2 }}
                >
                    <div className="space-y-1 p-1.5">
                        <div className="h-1.5 w-3/4 rounded bg-blue-500/40 dark:bg-blue-400/40" />
                        <div className="h-1.5 w-1/2 rounded bg-blue-500/40 dark:bg-blue-400/40" />
                    </div>
                </div>
            </div>
        </div>
    );
}

/** motion-26: a composed card whose header / body / actions can enter as
 *  three beats (`data-anim="part"`) or as one lump (`data-anim="whole"`).
 *  `mode` controls which nodes hide at rest so both panes rest identically. */
export function CardRevealScene({ mode }: { mode: "parts" | "whole" }) {
    const hideParts = mode === "parts" ? { opacity: 0 } : undefined;
    return (
        <div className="relative flex items-center justify-center rounded-field border border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/40 h-40 px-3">
            {/* The slot and the card share one box, so the rest frame reads as
                "content lands here" and the card lands exactly on it. */}
            <div className="relative w-full max-w-56">
                <div
                    aria-hidden="true"
                    className="absolute inset-0 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700"
                />
                <div
                    data-anim="whole"
                    className="relative rounded-lg border border-blue-500/60 bg-white p-2.5 shadow-sm dark:bg-neutral-900"
                    style={{ opacity: 0 }}
                >
                    <div data-anim="part" style={hideParts}>
                        <p className="font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 text-[11px]">
                            Weekly digest
                        </p>
                    </div>
                    <div data-anim="part" className="mt-1.5 space-y-1" style={hideParts}>
                        <div className="h-1.5 w-full rounded bg-neutral-100 dark:bg-neutral-800" />
                        <div className="h-1.5 w-3/4 rounded bg-neutral-100 dark:bg-neutral-800" />
                    </div>
                    <div data-anim="part" className="mt-2 flex justify-end" style={hideParts}>
                        <MiniButton label="Read" variant="primary" />
                    </div>
                </div>
            </div>
        </div>
    );
}

/** motion-15: two toasts of different sizes sharing data-anim="panel" —
 *  percentage transforms clear the frame for both; a fixed pixel exit is
 *  tuned to one size and strands the other. */
export function ToastPairScene() {
    return (
        <AppSurface title="Notifications">
            <div
                data-anim="panel"
                className="absolute bottom-2.5 left-2.5 flex w-[52%] items-center gap-1.5 rounded-md border border-blue-500 bg-white px-2 py-1.5 shadow-lg dark:bg-neutral-900"
                style={{ transform: "translateY(150%)" }}
            >
                <CheckCircle2 aria-hidden="true" className="size-3 shrink-0 text-emerald-500" />
                <span className="truncate font-semibold text-neutral-800 dark:text-neutral-100 text-[10px]">
                    Saved
                </span>
            </div>
            <div
                data-anim="panel"
                className="absolute bottom-2.5 right-2.5 w-[38%] rounded-md border border-blue-500 bg-white px-2 py-1.5 shadow-lg dark:bg-neutral-900"
                style={{ transform: "translateY(150%)" }}
            >
                <p className="mb-1 font-semibold text-neutral-800 dark:text-neutral-100 text-[10px]">
                    3 updates
                </p>
                <div className="mb-1 h-1.5 w-full rounded bg-neutral-100 dark:bg-neutral-800" />
                <div className="h-1.5 w-2/3 rounded bg-neutral-100 dark:bg-neutral-800" />
            </div>
        </AppSurface>
    );
}
