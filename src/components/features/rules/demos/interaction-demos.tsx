"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { useDemoPlayback } from "@/hooks/use-demo-playback";
import { PreviewFrame, textClass, type PreviewSize, type Variant } from "@/components/features/rules/preview-primitives";

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
                        <span className={cn("text-neutral-400 dark:text-neutral-500", textClass(size))}>{caption}</span>
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
