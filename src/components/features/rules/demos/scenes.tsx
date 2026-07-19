import type { CSSProperties, ReactNode } from "react";

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
}: {
    size: PreviewSize;
    children?: ReactNode;
    dim?: boolean;
}) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900",
                size === "lg" ? "h-24" : "h-16"
            )}
        >
            <div className="flex items-center gap-1.5 border-b border-neutral-100 px-2 py-1.5 dark:border-neutral-800">
                <span className="size-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                <MiniLine widthClass="w-10" className="h-1.5" />
            </div>
            <div className={cn("space-y-1.5 p-2", dim && "opacity-50")}>
                <MiniLine widthClass="w-5/6" />
                <MiniLine widthClass="w-3/5" />
            </div>
            {children}
        </div>
    );
}

/** Modal: scrim + centered dialog, both hidden at rest. */
export function ModalScene({ size }: { size: PreviewSize }) {
    return (
        <AppSurface size={size}>
            <div data-anim="scrim" className="absolute inset-0 bg-neutral-900/40" style={{ opacity: 0 }} />
            <div
                data-anim="panel"
                className={cn(
                    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-800",
                    size === "lg" ? "w-24" : "w-20"
                )}
                style={{ opacity: 0 }}
            >
                <MiniLine widthClass="w-3/4" className="mb-1.5" />
                <div className="flex justify-end">
                    <MiniButton label="OK" variant="primary" size={size} />
                </div>
            </div>
        </AppSurface>
    );
}

/** Command palette: floating input + result rows, hidden at rest. */
export function PaletteScene({ size }: { size: PreviewSize }) {
    return (
        <AppSurface size={size} dim>
            <div
                data-anim="panel"
                className="absolute inset-x-3 top-2 rounded-md border border-neutral-200 bg-white p-1.5 shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
                style={{ opacity: 0 }}
            >
                <div className="mb-1.5 h-3 rounded-sm bg-neutral-100 dark:bg-neutral-700" />
                <MiniLine widthClass="w-2/3" className="mb-1" />
                <MiniLine widthClass="w-1/2" />
            </div>
        </AppSurface>
    );
}

/** Side panel sliding in from the right edge (rest: parked off-frame). */
export function EdgePanelScene({ size }: { size: PreviewSize }) {
    return (
        <AppSurface size={size}>
            <div
                data-anim="panel"
                className="absolute inset-y-0 right-0 w-2/5 border-l border-neutral-200 bg-neutral-50 p-2 dark:border-neutral-700 dark:bg-neutral-800"
                style={{ transform: "translateX(110%)" }}
            >
                <MiniLine widthClass="w-3/4" className="mb-1.5" />
                <MiniLine widthClass="w-1/2" />
            </div>
        </AppSurface>
    );
}

/** Toast rising from the bottom edge (rest: parked below the frame). */
export function ToastScene({ size }: { size: PreviewSize }) {
    return (
        <AppSurface size={size}>
            <div
                data-anim="panel"
                className="absolute inset-x-2 bottom-2 flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2 py-1.5 shadow-md dark:border-neutral-700 dark:bg-neutral-800"
                style={{ transform: "translateY(150%)" }}
            >
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <MiniLine widthClass="w-1/2" />
            </div>
        </AppSurface>
    );
}

/** Menu popover opening from a trigger button. `origin` is the lesson knob. */
export function MenuScene({ size, origin }: { size: PreviewSize; origin: string }) {
    return (
        <div className={cn("relative", size === "lg" ? "h-24" : "h-16")}>
            <div className="absolute left-2 top-1">
                <MiniButton label="Menu" variant="secondary" size={size} />
            </div>
            <div
                data-anim="panel"
                className="absolute left-2 top-7 w-20 rounded-md border border-neutral-200 bg-white p-1.5 shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
                style={{ opacity: 0, transformOrigin: origin } as CSSProperties}
            >
                <MiniLine widthClass="w-3/4" className="mb-1" />
                <MiniLine widthClass="w-full" className="mb-1" />
                <MiniLine widthClass="w-1/2" />
            </div>
        </div>
    );
}

/** Tooltip above a button. */
export function TooltipScene({ size }: { size: PreviewSize }) {
    return (
        <div className={cn("relative flex items-end justify-center", size === "lg" ? "h-24 pb-3" : "h-16 pb-2")}>
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
    const widths = ["w-full", "w-5/6", "w-2/3"];
    return (
        <div className={cn("flex flex-col justify-center gap-1.5", size === "lg" ? "h-24 px-1" : "h-16")}>
            {widths.map((w) => (
                <div key={w} data-anim="row" style={hiddenAtRest ? { opacity: 0 } : undefined}>
                    <MiniLine widthClass={w} />
                </div>
            ))}
        </div>
    );
}

/** A mini card racing across a track — for pure timing/easing comparisons. */
export function RaceScene({ size }: { size: PreviewSize }) {
    return (
        <div className={cn("flex flex-col justify-center", size === "lg" ? "h-24 px-1" : "h-16")}>
            <div
                className="relative w-full rounded-md border border-dashed border-neutral-200 p-1 dark:border-neutral-800"
                style={{ containerType: "inline-size" }}
            >
                <div
                    data-anim="panel"
                    className={cn(
                        "rounded-sm border border-neutral-300 bg-white shadow-sm dark:border-neutral-600 dark:bg-neutral-800",
                        size === "lg" ? "h-7 w-10" : "h-5 w-8"
                    )}
                >
                    <div className="m-1 h-1 w-1/2 rounded bg-neutral-300 dark:bg-neutral-600" />
                </div>
            </div>
        </div>
    );
}

/** A dismissable card on a clipped rail (motion-18/19 grid previews simulate
 *  the gesture; the lg deep-dive renders the real drag prototype instead). */
export function RailCardScene({ size }: { size: PreviewSize }) {
    return (
        <div className={cn("flex flex-col justify-center", size === "lg" ? "h-24 px-1" : "h-16")}>
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
        <div className={cn("flex items-center", size === "lg" ? "h-24 px-2" : "h-16 px-1")}>
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
 *  Both carry data-anim targets so tracks can give them separate durations. */
export function NestedChipsScene({ size }: { size: PreviewSize }) {
    return (
        <div className={cn("flex items-center justify-center", size === "lg" ? "h-24" : "h-16")}>
            <div
                data-anim="parent"
                className="rounded-md border border-neutral-200 bg-neutral-50 p-1.5 dark:border-neutral-700 dark:bg-neutral-900"
            >
                <span className="mb-1 block text-[8px] font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                    parent
                </span>
                <div
                    data-anim="child"
                    className="rounded-sm border border-neutral-200 bg-white px-2 py-1 text-[9px] font-medium text-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                >
                    child
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
        <div className={cn("flex items-center justify-center", size === "lg" ? "h-24" : "h-16")}>
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

/** Submit button whose label crossfades to a spinner (rest: idle label). */
export function SubmitScene({ size, spinner }: { size: PreviewSize; spinner: boolean }) {
    return (
        <div className={cn("flex items-center justify-center", size === "lg" ? "h-24" : "h-16")}>
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

/** Like button: grey outline heart with a red heart revealed on play. */
export function LikeScene({ size }: { size: PreviewSize }) {
    const px = size === "lg" ? 22 : 18;
    return (
        <div className={cn("flex items-center justify-center", size === "lg" ? "h-24" : "h-16")}>
            <div className="relative" style={{ width: px, height: px }}>
                <svg viewBox="0 0 24 24" className="absolute inset-0 text-neutral-400 dark:text-neutral-600" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
                </svg>
                <svg data-anim="panel" viewBox="0 0 24 24" className="absolute inset-0 text-rose-500" fill="currentColor" style={{ opacity: 0 }}>
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
                </svg>
            </div>
        </div>
    );
}

/** Loading treatment: skeleton rows or a lone spinner, then content fades in. */
export function LoadingScene({ size, kind }: { size: PreviewSize; kind: "skeleton" | "spinner" }) {
    return (
        <div className={cn("relative flex flex-col justify-center gap-1.5", size === "lg" ? "h-24 px-1" : "h-16")}>
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
            <div data-anim="content" className="absolute inset-x-0 space-y-1.5 px-1" style={{ opacity: 0 }}>
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
        <div className={cn("flex items-center justify-center", size === "lg" ? "h-24" : "h-16")}>
            <div
                data-anim="panel"
                className="overflow-hidden rounded bg-neutral-300 dark:bg-neutral-700"
                style={{ width: size === "lg" ? 48 : 40, height: 2 }}
            />
        </div>
    );
}
