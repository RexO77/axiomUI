import type { CSSProperties, ReactNode } from "react";
import { Archive, CheckCircle2, FileText, Inbox, Moon, Pencil } from "lucide-react";

import { cn } from "@/lib/utils";
import { MiniButton, MiniLine, type PreviewSize } from "@/components/features/rules/preview-primitives";

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
    size,
    children,
    dim = false,
    title = "App",
}: {
    size: PreviewSize;
    children?: ReactNode;
    dim?: boolean;
    /** Window title — readable at rest so the stage isn't an empty shell. */
    title?: string;
}) {
    const isLg = size === "lg";
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900",
                isLg ? "h-44" : "h-16"
            )}
        >
            <div className="flex items-center gap-1.5 border-b border-neutral-100 px-2 py-1.5 dark:border-neutral-800">
                <span className="size-1.5 rounded-full bg-rose-400/80" />
                <span className="size-1.5 rounded-full bg-amber-400/80" />
                <span className="size-1.5 rounded-full bg-emerald-400/80" />
                {isLg ? (
                    <span className="ml-1.5 truncate text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                        {title}
                    </span>
                ) : (
                    <MiniLine widthClass="w-10" className="ml-1 h-1.5" />
                )}
            </div>
            {/* Rest content stays legible — overlays (modals/palettes) sit on top. */}
            <div className={cn("space-y-1.5 p-2.5", dim && "opacity-50")}>
                {isLg ? (
                    <>
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
                    </>
                ) : (
                    <>
                        <MiniLine widthClass="w-5/6" />
                        <MiniLine widthClass="w-3/5" />
                    </>
                )}
            </div>
            {children}
        </div>
    );
}

/** Modal: scrim + centered dialog, both hidden at rest. */
export function ModalScene({ size }: { size: PreviewSize }) {
    return (
        <AppSurface size={size} title="Files">
            <div data-anim="scrim" className="absolute inset-0 bg-neutral-900/45" style={{ opacity: 0 }} />
            <div
                data-anim="panel"
                className={cn(
                    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-blue-500 bg-white p-2.5 shadow-xl dark:bg-neutral-900",
                    size === "lg" ? "w-[7.5rem]" : "w-20"
                )}
                style={{ opacity: 0 }}
            >
                {size === "lg" ? (
                    <>
                        <p className="mb-1 text-[11px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Delete file?
                        </p>
                        <p className="mb-2 text-[9px] leading-snug text-neutral-500 dark:text-neutral-400">
                            This can’t be undone.
                        </p>
                        <div className="flex justify-end gap-1">
                            <MiniButton label="Cancel" variant="secondary" size={size} />
                            <MiniButton label="Delete" variant="danger" size={size} />
                        </div>
                    </>
                ) : (
                    <>
                        <MiniLine widthClass="w-3/4" className="mb-1.5" />
                        <div className="flex justify-end">
                            <MiniButton label="OK" variant="primary" size={size} />
                        </div>
                    </>
                )}
            </div>
        </AppSurface>
    );
}

/** Command palette: floating input + result rows, hidden at rest. */
export function PaletteScene({ size }: { size: PreviewSize }) {
    return (
        <AppSurface size={size} dim title="Editor">
            <div
                data-anim="panel"
                className={cn(
                    "absolute inset-x-2.5 rounded-lg border border-blue-500 bg-white p-1.5 shadow-xl dark:bg-neutral-900",
                    // Float below the window title bar — never over its dots.
                    size === "lg" ? "top-9" : "top-2"
                )}
                style={{ opacity: 0 }}
            >
                {size === "lg" ? (
                    <>
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
                    </>
                ) : (
                    <>
                        <div className="mb-1.5 h-3 rounded-sm bg-neutral-100 dark:bg-neutral-700" />
                        <MiniLine widthClass="w-2/3" className="mb-1" />
                        <MiniLine widthClass="w-1/2" />
                    </>
                )}
            </div>
        </AppSurface>
    );
}

/** Side panel sliding in from the right edge (rest: parked off-frame). */
export function EdgePanelScene({ size }: { size: PreviewSize }) {
    return (
        <AppSurface size={size} title="Workspace">
            <div
                data-anim="panel"
                className="absolute inset-y-0 right-0 w-[42%] border-l border-blue-500/60 bg-white p-2 shadow-lg dark:bg-neutral-900"
                style={{ transform: "translateX(110%)" }}
            >
                {size === "lg" ? (
                    <>
                        <p className="mb-1.5 text-[10px] font-semibold text-neutral-800 dark:text-neutral-100">
                            Details
                        </p>
                        <div className="mb-1 h-1.5 w-full rounded bg-neutral-100 dark:bg-neutral-800" />
                        <div className="mb-1 h-1.5 w-4/5 rounded bg-neutral-100 dark:bg-neutral-800" />
                        <div className="h-1.5 w-3/5 rounded bg-neutral-100 dark:bg-neutral-800" />
                    </>
                ) : (
                    <>
                        <MiniLine widthClass="w-3/4" className="mb-1.5" />
                        <MiniLine widthClass="w-1/2" />
                    </>
                )}
            </div>
        </AppSurface>
    );
}

/** Toast rising from the bottom edge (rest: parked below the frame). */
export function ToastScene({ size }: { size: PreviewSize }) {
    return (
        <AppSurface size={size} title="Inbox">
            <div
                data-anim="panel"
                className="absolute inset-x-2.5 bottom-2.5 flex flex-col gap-1 rounded-lg border border-blue-500 bg-white px-2.5 py-2 shadow-lg dark:bg-neutral-900"
                style={{ transform: "translateY(150%)" }}
            >
                <div className="flex items-center gap-1.5">
                    {size === "lg" ? (
                        <>
                            <CheckCircle2 aria-hidden="true" className="size-3.5 text-emerald-500" />
                            <span className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-100">
                                Saved
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            <MiniLine widthClass="w-1/2" />
                        </>
                    )}
                </div>
                {size === "lg" ? (
                    <span className="h-0.5 w-full rounded-full bg-emerald-500/35" />
                ) : null}
            </div>
        </AppSurface>
    );
}

/** Menu popover opening from a trigger button. `origin` is the lesson knob.
 *  `originMarker` renders a data-anim="origin-dot" pip at the transform-origin
 *  (motion-10 makes the origin literally visible during playback). */
export function MenuScene({
    size,
    origin,
    originMarker = false,
}: {
    size: PreviewSize;
    origin: string;
    originMarker?: boolean;
}) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900",
                size === "lg" ? "h-44" : "h-16"
            )}
        >
            {/* Fake app chrome so rest isn't a black void */}
            <div className="absolute inset-x-0 top-0 flex items-center gap-1 border-b border-neutral-100 px-2 py-1.5 dark:border-neutral-800">
                <span className="size-1.5 rounded-full bg-rose-400/80" />
                <span className="size-1.5 rounded-full bg-amber-400/80" />
                <span className="size-1.5 rounded-full bg-emerald-400/80" />
            </div>
            <div className="absolute left-2 top-8">
                <MiniButton label="Menu" variant="secondary" size={size} />
            </div>
            <div
                data-anim="panel"
                className="absolute left-2 top-[3.75rem] w-28 rounded-lg border border-blue-500 bg-white p-1 shadow-xl dark:bg-neutral-900"
                style={{ opacity: 0, transformOrigin: origin } as CSSProperties}
            >
                {size === "lg" ? (
                    <>
                        <div className="rounded-md bg-neutral-100 px-2 py-1.5 text-[11px] font-medium text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100">
                            Rename
                        </div>
                        <div className="px-2 py-1.5 text-[11px] text-neutral-600 dark:text-neutral-300">
                            Duplicate
                        </div>
                        <div className="px-2 py-1.5 text-[11px] text-neutral-600 dark:text-neutral-300">
                            Share…
                        </div>
                    </>
                ) : (
                    <>
                        <MiniLine widthClass="w-3/4" className="mb-1" />
                        <MiniLine widthClass="w-full" className="mb-1" />
                        <MiniLine widthClass="w-1/2" />
                    </>
                )}
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
export function TooltipScene({ size }: { size: PreviewSize }) {
    return (
        <div
            className={cn(
                "relative flex items-end justify-center rounded-lg border border-neutral-200 bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-900/50",
                size === "lg" ? "h-36 pb-4" : "h-16 pb-2"
            )}
        >
            <div
                data-anim="panel"
                className="absolute top-3 rounded-md bg-neutral-900 px-2 py-1 text-[9px] font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
                style={{ opacity: 0 }}
            >
                Save (⌘S)
            </div>
            <MiniButton label="Save" variant="secondary" size={size} />
        </div>
    );
}

/** Three list rows (targets share data-anim="row" so tracks can stagger them). */
export function ListScene({ size, hiddenAtRest }: { size: PreviewSize; hiddenAtRest: boolean }) {
    const rows =
        size === "lg"
            ? [
                  { icon: Inbox, label: "Inbox" },
                  { icon: Pencil, label: "Drafts" },
                  { icon: Archive, label: "Archive" },
              ]
            : null;
    const widths = ["w-full", "w-5/6", "w-2/3"];
    return (
        <div
            className={cn(
                "flex flex-col justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50/50 px-2 dark:border-neutral-800 dark:bg-neutral-900/40",
                size === "lg" ? "h-40" : "h-16"
            )}
        >
            {rows
                ? rows.map(({ icon: Icon, label }) => (
                      <div
                          key={label}
                          data-anim="row"
                          className="flex items-center gap-2 rounded-md px-1.5 py-1"
                          style={hiddenAtRest ? { opacity: 0 } : undefined}
                      >
                          <Icon aria-hidden="true" className="size-3.5 shrink-0 text-blue-500/80" />
                          <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-200">
                              {label}
                          </span>
                      </div>
                  ))
                : widths.map((w) => (
                      <div key={w} data-anim="row" style={hiddenAtRest ? { opacity: 0 } : undefined}>
                          <MiniLine widthClass={w} />
                      </div>
                  ))}
        </div>
    );
}

/** A labeled chip racing across a track — for pure timing/easing comparisons. */
export function RaceScene({ size, label = "Item" }: { size: PreviewSize; label?: string }) {
    return (
        <div className={cn("flex flex-col justify-center", size === "lg" ? "h-32 px-0.5" : "h-16")}>
            <div
                className="relative flex w-full items-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50/80 p-2 dark:border-neutral-700 dark:bg-neutral-900/50"
                style={{ containerType: "inline-size" }}
            >
                <div
                    data-anim="panel"
                    className={cn(
                        "flex items-center gap-1.5 rounded-md border border-blue-500 bg-blue-500/10 shadow-sm dark:border-blue-400 dark:bg-blue-400/10",
                        size === "lg" ? "h-9 px-2.5" : "h-6 px-1.5"
                    )}
                >
                    <span
                        className={cn(
                            "shrink-0 rounded-full bg-blue-500 dark:bg-blue-400",
                            size === "lg" ? "size-1.5" : "size-1"
                        )}
                    />
                    {size === "lg" ? (
                        <span className="text-[11px] font-semibold tracking-tight text-blue-700 dark:text-blue-300">
                            {label}
                        </span>
                    ) : (
                        <span className="h-1 w-4 rounded-sm bg-blue-500/35" />
                    )}
                </div>
            </div>
        </div>
    );
}

/** A dismissable card on a clipped rail (motion-18/19 grid previews simulate
 *  the gesture; the lg deep-dive renders the real drag prototype instead). */
export function RailCardScene({ size }: { size: PreviewSize }) {
    return (
        <div className={cn("flex flex-col justify-center", size === "lg" ? "h-36 px-1" : "h-16")}>
            <div
                className="relative w-full overflow-hidden rounded-md border border-dashed border-neutral-200 p-1 dark:border-neutral-800"
                style={{ containerType: "inline-size" }}
            >
                <div
                    data-anim="card"
                    className={cn(
                        "rounded-sm border border-neutral-300 bg-white shadow-sm dark:border-neutral-600 dark:bg-neutral-800",
                        size === "lg" ? "h-9 w-14" : "h-6 w-10"
                    )}
                >
                    <div className="m-1 h-1 w-1/2 rounded bg-neutral-300 dark:bg-neutral-600" />
                    <div className="mx-1 h-1 w-1/3 rounded bg-neutral-200 dark:bg-neutral-700" />
                </div>
            </div>
        </div>
    );
}

/** A slider knob on a track (motion-20 grid preview simulates the drag). */
export function SliderScene({ size }: { size: PreviewSize }) {
    const knobPx = size === "lg" ? 16 : 12;
    return (
        <div
            className={cn(
                "flex items-center",
                size === "lg"
                    ? "h-36 rounded-lg border border-neutral-200 bg-neutral-50/80 px-3 dark:border-neutral-800 dark:bg-neutral-900/50"
                    : "h-16 px-1"
            )}
        >
            <div
                className="relative h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800"
                style={{ containerType: "inline-size" }}
            >
                <div
                    data-anim="knob"
                    className="absolute rounded-full border border-neutral-300 bg-white shadow-sm dark:border-neutral-500 dark:bg-neutral-200"
                    style={{ width: knobPx, height: knobPx, top: `calc(50% - ${knobPx / 2}px)`, left: 0 }}
                />
            </div>
        </div>
    );
}

/** Parent chip containing a child chip (motion-23: inherited motion variables).
 *  Both carry data-anim targets so tracks can give them separate durations.
 *  Duration labels are printed on the chips so the abstraction reads at a
 *  glance; the don't pane's child label is rose (silently inherited). */
export function NestedChipsScene({
    size,
    childLabel = "child",
    childInherits = false,
}: {
    size: PreviewSize;
    childLabel?: string;
    childInherits?: boolean;
}) {
    return (
        <div
            className={cn(
                "flex items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-900/50",
                size === "lg" ? "h-36" : "h-16"
            )}
        >
            <div
                data-anim="parent"
                className={cn(
                    "rounded-lg border border-blue-500/60 bg-white dark:bg-neutral-900",
                    size === "lg" ? "p-2.5" : "p-1.5"
                )}
            >
                <span
                    className={cn(
                        "mb-1.5 block font-mono font-medium tracking-tight text-neutral-500 dark:text-neutral-400",
                        size === "lg" ? "text-[10px]" : "text-[8px]"
                    )}
                >
                    {size === "lg" ? "parent · 140ms" : "parent"}
                </span>
                <div
                    data-anim="child"
                    className={cn(
                        "rounded-md border px-2 py-1 font-mono font-medium",
                        size === "lg" ? "text-[10px]" : "text-[9px]",
                        childInherits
                            ? "border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-300"
                            : "border-blue-500 bg-blue-500/10 text-blue-700 dark:border-blue-400 dark:bg-blue-400/10 dark:text-blue-300"
                    )}
                >
                    {size === "lg" ? childLabel : "child"}
                </div>
            </div>
        </div>
    );
}

/** A single centered button (press feedback, hover scale, hue shift). */
export function ButtonScene({
    size,
    label,
    variant = "primary",
    background,
}: {
    size: PreviewSize;
    label: string;
    variant?: "primary" | "secondary";
    background?: string;
}) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-2.5 rounded-lg border border-neutral-200 bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-900/50",
                size === "lg" ? "h-36" : "h-16"
            )}
        >
            {size === "lg" ? (
                <p className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                    Form actions
                </p>
            ) : null}
            <span data-anim="panel" className="inline-block" style={background ? { borderRadius: 6 } : undefined}>
                {background ? (
                    <span
                        className={cn(
                            "inline-flex items-center justify-center rounded-md font-semibold text-white",
                            size === "lg" ? "px-3 py-1.5 text-xs" : "px-2.5 py-1 text-[10px]"
                        )}
                        style={{ backgroundColor: background }}
                        data-anim="fill"
                    >
                        {label}
                    </span>
                ) : (
                    <MiniButton label={label} variant={variant} size={size} />
                )}
            </span>
        </div>
    );
}

/** Two contextual icons occupying the same visual slot. Both stay mounted so
 * the showcase can compare a composed cross-fade with an abrupt state swap. */
export function IconSwapScene({ size }: { size: PreviewSize }) {
    const iconSize = size === "lg" ? 22 : 18;

    return (
        <div
            className={cn(
                "flex items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-900/50",
                size === "lg" ? "h-36" : "h-16"
            )}
        >
            <div
                className="relative text-blue-600 dark:text-blue-400"
                style={{ width: iconSize, height: iconSize }}
            >
                <svg
                    data-anim="icon-out"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="absolute inset-0"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                >
                    <path d="M12 5v14M5 12h14" />
                </svg>
                <svg
                    data-anim="icon-in"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="absolute inset-0"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    style={{ opacity: 0, transform: "scale(0.25)", filter: "blur(4px)" }}
                >
                    <path d="m5 12 4 4L19 6" />
                </svg>
            </div>
        </div>
    );
}

/** Submit button whose label crossfades to a spinner (rest: idle label). */
export function SubmitScene({ size, spinner }: { size: PreviewSize; spinner: boolean }) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-2.5 rounded-lg border border-neutral-200 bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-900/50",
                size === "lg" ? "h-36" : "h-16"
            )}
        >
            {size === "lg" ? (
                <p className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                    Checkout
                </p>
            ) : null}
            <span
                data-anim="fill"
                className={cn(
                    "relative inline-flex items-center justify-center rounded-md bg-neutral-900 font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900",
                    size === "lg" ? "px-3 py-1.5 text-xs" : "px-2.5 py-1 text-[10px]"
                )}
            >
                <span data-anim="label">Submit</span>
                {spinner ? (
                    <span
                        data-anim="spinner"
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ opacity: 0 }}
                    >
                        <span
                            className={cn(
                                "inline-block animate-spin rounded-full border-2 border-neutral-400 border-t-transparent dark:border-neutral-500",
                                size === "lg" ? "size-3.5" : "size-3"
                            )}
                        />
                    </span>
                ) : null}
            </span>
        </div>
    );
}

/** Like button: grey outline heart with a red heart revealed on play.
 *  `data-anim="sync"` is the background-sync receipt (sys-9's do pane fades
 *  it in ~700ms after the optimistic fill). */
export function LikeScene({ size }: { size: PreviewSize }) {
    const px = size === "lg" ? 26 : 18;
    return (
        <div
            className={cn(
                "relative flex flex-col items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-900/50",
                size === "lg" ? "h-36" : "h-16"
            )}
        >
            {size === "lg" ? (
                <p className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                    Post
                </p>
            ) : null}
            <div className="relative" style={{ width: px, height: px }}>
                <svg viewBox="0 0 24 24" className="absolute inset-0 text-neutral-400 dark:text-neutral-600" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
                </svg>
                <svg data-anim="panel" viewBox="0 0 24 24" className="absolute inset-0 text-rose-500" fill="currentColor" style={{ opacity: 0 }}>
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
                </svg>
            </div>
            {size === "lg" ? (
                <span
                    data-anim="sync"
                    className="font-mono text-[9px] font-medium text-emerald-600 dark:text-emerald-400"
                    style={{ opacity: 0 }}
                >
                    synced ✓
                </span>
            ) : null}
        </div>
    );
}

/** Loading treatment: skeleton rows or a lone spinner, then content fades in. */
export function LoadingScene({ size, kind }: { size: PreviewSize; kind: "skeleton" | "spinner" }) {
    return (
        <div
            className={cn(
                "relative flex flex-col justify-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/40",
                size === "lg" ? "h-36 px-3" : "h-16"
            )}
        >
            {kind === "skeleton" ? (
                <div data-anim="placeholder" className="space-y-1.5">
                    <MiniLine widthClass="w-full" className="animate-pulse" />
                    <MiniLine widthClass="w-5/6" className="animate-pulse" />
                    <MiniLine widthClass="w-2/3" className="animate-pulse" />
                </div>
            ) : (
                <div data-anim="placeholder" className="flex justify-center">
                    <span
                        className={cn(
                            "inline-block animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100",
                            size === "lg" ? "size-7" : "size-6"
                        )}
                    />
                </div>
            )}
            <div data-anim="content" className="absolute inset-x-0 space-y-1.5 px-3" style={{ opacity: 0 }}>
                <div className="h-2 rounded bg-neutral-400 dark:bg-neutral-500" style={{ width: "90%" }} />
                <div className="h-2 rounded bg-neutral-400 dark:bg-neutral-500" style={{ width: "70%" }} />
                <div className="h-2 rounded bg-neutral-400 dark:bg-neutral-500" style={{ width: "50%" }} />
            </div>
        </div>
    );
}

/** For motion-14's don't: a box that animates height (layout work). */
export function GrowBoxScene({ size }: { size: PreviewSize }) {
    return (
        <div
            className={cn(
                "flex items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-900/50",
                size === "lg" ? "h-36" : "h-16"
            )}
        >
            <div
                data-anim="panel"
                className="overflow-hidden rounded border border-blue-500 bg-blue-500/10 dark:border-blue-400 dark:bg-blue-400/10"
                style={{ width: size === "lg" ? 64 : 40, height: 2 }}
            />
        </div>
    );
}

/** motion-26: a composed card whose header / body / actions can enter as
 *  three beats (`data-anim="part"`) or as one lump (`data-anim="whole"`).
 *  `mode` controls which nodes hide at rest so both panes rest identically. */
export function CardRevealScene({ size, mode }: { size: PreviewSize; mode: "parts" | "whole" }) {
    const hideParts = mode === "parts" ? { opacity: 0 } : undefined;
    return (
        <div
            className={cn(
                "relative flex items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/40",
                size === "lg" ? "h-40 px-3" : "h-16 px-2"
            )}
        >
            {/* Static slot: the rest frame reads as "content lands here". */}
            <div
                aria-hidden="true"
                className="absolute inset-x-3 inset-y-4 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700"
            />
            <div
                data-anim="whole"
                className="relative w-full max-w-56 rounded-lg border border-blue-500/60 bg-white p-2.5 shadow-sm dark:bg-neutral-900"
                style={{ opacity: 0 }}
            >
                <div data-anim="part" style={hideParts}>
                    <p
                        className={cn(
                            "font-semibold tracking-tight text-neutral-900 dark:text-neutral-100",
                            size === "lg" ? "text-[11px]" : "text-[9px]"
                        )}
                    >
                        Weekly digest
                    </p>
                </div>
                <div data-anim="part" className="mt-1.5 space-y-1" style={hideParts}>
                    <div className="h-1.5 w-full rounded bg-neutral-100 dark:bg-neutral-800" />
                    <div className="h-1.5 w-3/4 rounded bg-neutral-100 dark:bg-neutral-800" />
                </div>
                <div data-anim="part" className="mt-2 flex justify-end" style={hideParts}>
                    <MiniButton label="Read" variant="primary" size={size} />
                </div>
            </div>
        </div>
    );
}

/** motion-15: two toasts of different sizes sharing data-anim="panel" —
 *  percentage transforms clear the frame for both; a fixed pixel exit is
 *  tuned to one size and strands the other. */
export function ToastPairScene({ size }: { size: PreviewSize }) {
    return (
        <AppSurface size={size} title="Notifications">
            <div
                data-anim="panel"
                className="absolute bottom-2.5 left-2.5 flex w-[52%] items-center gap-1.5 rounded-lg border border-blue-500 bg-white px-2 py-1.5 shadow-lg dark:bg-neutral-900"
                style={{ transform: "translateY(150%)" }}
            >
                <CheckCircle2 aria-hidden="true" className="size-3 shrink-0 text-emerald-500" />
                <span
                    className={cn(
                        "truncate font-semibold text-neutral-800 dark:text-neutral-100",
                        size === "lg" ? "text-[10px]" : "text-[8px]"
                    )}
                >
                    Saved
                </span>
            </div>
            <div
                data-anim="panel"
                className="absolute bottom-2.5 right-2.5 w-[38%] rounded-lg border border-blue-500 bg-white px-2 py-1.5 shadow-lg dark:bg-neutral-900"
                style={{ transform: "translateY(150%)" }}
            >
                <p
                    className={cn(
                        "mb-1 font-semibold text-neutral-800 dark:text-neutral-100",
                        size === "lg" ? "text-[10px]" : "text-[8px]"
                    )}
                >
                    3 updates
                </p>
                <div className="mb-1 h-1.5 w-full rounded bg-neutral-100 dark:bg-neutral-800" />
                <div className="h-1.5 w-2/3 rounded bg-neutral-100 dark:bg-neutral-800" />
            </div>
        </AppSurface>
    );
}
