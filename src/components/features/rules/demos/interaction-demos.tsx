"use client";

import type { ReactNode } from "react";
import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";
import { useDemoPlayback } from "@/hooks/use-demo-playback";
import {
    MiniLine,
    PreviewFrame,
    textClass,
    type PreviewSize,
    type Variant,
} from "@/components/features/rules/preview-primitives";

type DemoProps = { variant: Variant; size: PreviewSize };

function DemoStage({
    size,
    caption,
    children,
}: {
    size: PreviewSize;
    caption?: ReactNode;
    children: (state: { settled: boolean }) => ReactNode;
}) {
    const { ref, settled, handlers } = useDemoPlayback({ autoPlayOnView: size === "lg" });
    return (
        <div ref={ref} {...handlers} className="motion-demo">
            <PreviewFrame size={size}>
                <div className="flex h-full flex-col justify-center gap-2">
                    {children({ settled })}
                    {caption ? (
                        <span className={cn("text-neutral-500 dark:text-neutral-400", textClass(size))}>{caption}</span>
                    ) : null}
                </div>
            </PreviewFrame>
        </div>
    );
}

// ── color-7: Hover State Stays in Hue ────────────────────────────────
// do = blue-600 → blue-700 (same hue, darker). dont = blue → green (hue jump).
// Resting frame is the "hovered" colour; play transitions from the base blue.
export function ColorHoverDemo({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    const base = "#2563eb"; // blue-600
    const hovered = isDo ? "#1d4ed8" /* blue-700 */ : "#16a34a" /* green-600 */;
    return (
        <DemoStage size={size} caption={isDo ? "blue-600 → blue-700" : "blue → green (hue jump)"}>
            {({ settled }) => (
                <div className="flex justify-center">
                    <span
                        className={cn(
                            "inline-flex items-center justify-center rounded-md font-semibold text-white will-change-[background-color]",
                            size === "lg" ? "px-3 py-1.5 text-xs" : "px-2.5 py-1 text-[10px]"
                        )}
                        style={{
                            transitionProperty: "background-color",
                            transitionTimingFunction: "var(--ease-out-strong)",
                            transitionDuration: "var(--motion-medium)",
                            backgroundColor: settled ? hovered : base,
                        }}
                    >
                        Hover me
                    </span>
                </div>
            )}
        </DemoStage>
    );
}

// ── comp-9: Loading State on Async Buttons ───────────────────────────
// do = label crossfades to a spinner and the button disables on submit.
// dont = button stays a normal, re-clickable "Submit".
export function LoadingButtonDemo({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    const pad = size === "lg" ? "px-3 py-1.5 text-xs" : "px-2.5 py-1 text-[10px]";
    if (!isDo) {
        return (
            <DemoStage size={size} caption="stays clickable (double-submit)">
                {() => (
                    <div className="flex justify-center">
                        <span className={cn("inline-flex items-center justify-center rounded-md bg-neutral-900 font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900", pad)}>
                            Submit
                        </span>
                    </div>
                )}
            </DemoStage>
        );
    }
    return (
        <DemoStage size={size} caption="spinner + disabled on submit">
            {({ settled }) => (
                <div className="flex justify-center">
                    <span
                        className={cn(
                            "relative inline-flex items-center justify-center rounded-md font-semibold will-change-[background-color]",
                            pad
                        )}
                        style={{
                            transitionProperty: "background-color, color",
                            transitionDuration: "var(--motion-medium)",
                            backgroundColor: settled ? "rgb(212 212 216)" : "rgb(23 23 23)",
                            color: settled ? "rgb(115 115 115)" : "rgb(255 255 255)",
                        }}
                    >
                        {/* Label and spinner crossfade in place. */}
                        <span style={{ transition: "opacity var(--motion-fast)", opacity: settled ? 0 : 1 }}>Submit</span>
                        <span
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ transition: "opacity var(--motion-fast)", opacity: settled ? 1 : 0 }}
                        >
                            <span
                                className={cn(
                                    "inline-block animate-spin rounded-full border-2 border-neutral-500 border-t-transparent",
                                    size === "lg" ? "h-3.5 w-3.5" : "h-3 w-3"
                                )}
                            />
                        </span>
                    </span>
                </div>
            )}
        </DemoStage>
    );
}

// ── sys-9: Optimistic UI ─────────────────────────────────────────────
// do = heart fills instantly; dont = fill waits on the server round-trip.
export function OptimisticDemo({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    const px = size === "lg" ? 22 : 18;
    return (
        <DemoStage size={size} caption={isDo ? "fills instantly, syncs async" : "waits ~560ms for server"}>
            {({ settled }) => (
                <div className="relative flex justify-center" style={{ height: px }}>
                    <Heart className="absolute text-neutral-400 dark:text-neutral-600" style={{ width: px, height: px }} />
                    <Heart
                        className="absolute text-rose-500 will-change-[opacity,transform]"
                        style={{
                            width: px,
                            height: px,
                            fill: "currentColor",
                            transitionProperty: "opacity, transform",
                            transitionTimingFunction: "var(--ease-out-strong)",
                            transitionDuration: isDo ? "120ms" : "560ms",
                            opacity: settled ? 1 : 0,
                            transform: settled ? "scale(1)" : "scale(0.6)",
                        }}
                    />
                </div>
            )}
        </DemoStage>
    );
}

// ── sys-1: Skeletons Over Spinners ───────────────────────────────────
// do = grey skeleton bars (imply structure); dont = a lone spinner.
export function SkeletonDemo({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    if (isDo) {
        return (
            <DemoStage size={size} caption="skeleton implies structure">
                {({ settled }) => (
                    <div className="space-y-1.5" style={{ transition: "opacity var(--motion-slow)", opacity: settled ? 1 : 0.4 }}>
                        <MiniLine widthClass="w-full" />
                        <MiniLine widthClass="w-5/6" />
                        <MiniLine widthClass="w-2/3" />
                    </div>
                )}
            </DemoStage>
        );
    }
    return (
        <DemoStage size={size} caption="spinner highlights the wait">
            {({ settled }) => (
                <div className="flex justify-center">
                    <span
                        className={cn(
                            "inline-block rounded-full border-2 border-neutral-300 border-t-neutral-900 will-change-transform dark:border-neutral-700 dark:border-t-neutral-100",
                            size === "lg" ? "h-7 w-7" : "h-6 w-6"
                        )}
                        style={{
                            transitionProperty: "transform",
                            transitionTimingFunction: "linear",
                            transitionDuration: "var(--motion-slow)",
                            transform: settled ? "rotate(360deg)" : "rotate(0deg)",
                        }}
                    />
                </div>
            )}
        </DemoStage>
    );
}
