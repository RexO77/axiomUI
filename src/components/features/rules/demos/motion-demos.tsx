"use client";

import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { useDemoPlayback } from "@/hooks/use-demo-playback";
import {
    MiniButton,
    MiniLine,
    PreviewFrame,
    textClass,
    type PreviewSize,
    type Variant,
} from "@/components/features/rules/preview-primitives";

type DemoProps = { variant: Variant; size: PreviewSize };

/**
 * Wires the playback hook to a PreviewFrame. The render-prop hands each demo the
 * current `settled` flag (true = final/resting frame). Hover (desktop) /
 * scroll-into-view (touch) replay; reduced motion rests at the final frame.
 */
function DemoStage({
    size,
    children,
    caption,
    hoverOnly = false,
}: {
    size: PreviewSize;
    caption?: ReactNode;
    hoverOnly?: boolean;
    children: (state: { settled: boolean; reducedMotion: boolean }) => ReactNode;
}) {
    // Focused contexts (drawer / standalone page) render at lg and play once on
    // open; the sm card grid stays hover-only on desktop to keep the grid calm.
    // hoverOnly demos never auto-play on touch (see motion-16).
    const { ref, settled, reducedMotion, handlers } = useDemoPlayback({
        autoPlayOnView: size === "lg",
        hoverOnly,
    });
    return (
        <div ref={ref} {...handlers} className="motion-demo cursor-pointer">
            <PreviewFrame size={size}>
                <div className="flex h-full flex-col justify-center gap-2">
                    {children({ settled, reducedMotion })}
                    {caption ? (
                        <span className={cn("text-neutral-600 dark:text-neutral-300", textClass(size))}>
                            {caption}
                        </span>
                    ) : null}
                </div>
            </PreviewFrame>
        </div>
    );
}

// ── Shared movers ────────────────────────────────────────────────────

/** A dot that slides along a rail. Travel is rail-relative (container units). */
function SlideRail({
    settled,
    size,
    easing,
    duration,
}: {
    settled: boolean;
    size: PreviewSize;
    easing: string;
    duration: string;
}) {
    const dotStyle: CSSProperties = {
        transitionProperty: "transform",
        transitionTimingFunction: easing,
        transitionDuration: duration,
        transform: `translate(${settled ? "calc(100cqw - 100%)" : "0px"}, -50%)`,
    };
    return (
        <div
            className="relative h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800"
            style={{ containerType: "inline-size" }}
        >
            <span
                className={cn(
                    "absolute left-0 top-1/2 rounded-full bg-neutral-900 will-change-transform dark:bg-neutral-100",
                    size === "lg" ? "h-2.5 w-2.5" : "h-2 w-2"
                )}
                style={dotStyle}
            />
        </div>
    );
}

/** A chip that fades (and optionally rises) in. */
function FadeBox({
    settled,
    size,
    label,
    duration,
    rise = false,
}: {
    settled: boolean;
    size: PreviewSize;
    label: string;
    duration: string;
    rise?: boolean;
}) {
    return (
        <div className="flex justify-center">
            <span
                className="will-change-[opacity,transform]"
                style={{
                    transitionProperty: "opacity, transform",
                    transitionTimingFunction: "var(--ease-out-strong)",
                    transitionDuration: duration,
                    opacity: settled ? 1 : 0,
                    transform: settled || !rise ? "translateY(0)" : `translateY(${size === "lg" ? "12px" : "8px"})`,
                }}
            >
                <MiniButton label={label} variant="secondary" size={size} />
            </span>
        </div>
    );
}

/** A chip that scales up from `fromScale` with a configurable origin. */
function ScalePop({
    settled,
    size,
    label,
    fromScale,
    origin = "center",
    duration = "var(--motion-medium)",
}: {
    settled: boolean;
    size: PreviewSize;
    label: string;
    fromScale: number;
    origin?: string;
    duration?: string;
}) {
    return (
        <div className={cn("flex", origin === "center" ? "justify-center" : "justify-start")}>
            <span
                className="inline-block will-change-transform"
                style={{
                    transformOrigin: origin,
                    transitionProperty: "opacity, transform",
                    transitionTimingFunction: "var(--ease-out-strong)",
                    transitionDuration: duration,
                    opacity: settled ? 1 : 0,
                    transform: settled ? "scale(1)" : `scale(${fromScale})`,
                }}
            >
                <MiniButton label={label} variant="primary" size={size} />
            </span>
        </div>
    );
}

/** A panel that slides in from an edge. `percent` uses size-relative transforms. */
function SlidePanel({
    settled,
    size,
    from,
    percent = true,
    label,
}: {
    settled: boolean;
    size: PreviewSize;
    from: "right" | "bottom";
    percent?: boolean;
    label: string;
}) {
    const hidden =
        from === "right"
            ? percent
                ? "translateX(110%)"
                : `translateX(${size === "lg" ? "180px" : "120px"})`
            : percent
              ? "translateY(120%)"
              : `translateY(${size === "lg" ? "90px" : "60px"})`;
    return (
        <div className="relative h-12 overflow-hidden rounded-md border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
            <div
                className="absolute inset-x-2 bottom-2 flex items-center justify-center rounded bg-white py-1.5 shadow-sm will-change-transform dark:bg-neutral-800"
                style={{
                    transitionProperty: "transform",
                    transitionTimingFunction: "var(--ease-out-strong)",
                    transitionDuration: "var(--motion-medium)",
                    transform: settled ? "translate(0,0)" : hidden,
                }}
            >
                <MiniButton label={label} variant="ghost" size={size} />
            </div>
        </div>
    );
}

/** A short list whose rows stagger in. */
function StaggerList({
    settled,
    size,
    stepMs,
}: {
    settled: boolean;
    size: PreviewSize;
    stepMs: number;
}) {
    const widths = ["w-full", "w-5/6", "w-2/3"];
    return (
        <div className="space-y-1.5">
            {widths.map((w, i) => (
                <div
                    key={w}
                    className="will-change-[opacity,transform]"
                    style={{
                        transitionProperty: "opacity, transform",
                        transitionTimingFunction: "var(--ease-out-strong)",
                        transitionDuration: "var(--motion-medium)",
                        transitionDelay: settled ? `${i * stepMs}ms` : "0ms",
                        opacity: settled ? 1 : 0,
                        transform: settled ? "translateY(0)" : `translateY(${size === "lg" ? "8px" : "6px"})`,
                    }}
                >
                    <MiniLine widthClass={w} />
                </div>
            ))}
        </div>
    );
}

// ── motion-1: Animate by Frequency ───────────────────────────────────
export function FrequencyDemo({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    return (
        <DemoStage size={size} caption={isDo ? "rare modal · 220ms" : "frequent palette · 220ms (too slow)"}>
            {({ settled }) => (
                <FadeBox settled={settled} size={size} label={isDo ? "Modal" : "Palette"} duration="220ms" rise />
            )}
        </DemoStage>
    );
}

// ── motion-2: Keyboard Actions Stay Instant ──────────────────────────
export function KeyboardInstantDemo({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    return (
        <DemoStage size={size} caption={isDo ? "instant (0ms)" : "waits 240ms"}>
            {({ settled }) => (
                <FadeBox settled={settled} size={size} label="⌘K" duration={isDo ? "0ms" : "240ms"} />
            )}
        </DemoStage>
    );
}

// ── motion-3: Purpose Before Motion ──────────────────────────────────
export function PurposeDemo({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    return (
        <DemoStage size={size} caption={isDo ? "drawer slides from origin" : "decorative bounce"}>
            {({ settled }) =>
                isDo ? (
                    <SlidePanel settled={settled} size={size} from="right" label="Panel" />
                ) : (
                    <ScalePop settled={settled} size={size} label="Pop!" fromScale={1.25} />
                )
            }
        </DemoStage>
    );
}

// ── motion-4: Use Strong Custom Easing ───────────────────────────────
export function EasingDemo({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    return (
        <DemoStage size={size} caption={isDo ? "ease-out (0.23, 1, 0.32, 1)" : "ease-in"}>
            {({ settled }) => (
                <SlideRail
                    settled={settled}
                    size={size}
                    easing={isDo ? "var(--ease-out-strong)" : "cubic-bezier(0.42, 0, 1, 1)"}
                    duration="var(--motion-slow)"
                />
            )}
        </DemoStage>
    );
}

// ── motion-5: Never Use Ease-In for UI ───────────────────────────────
export function EaseInDemo({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    return (
        <DemoStage size={size} caption={isDo ? "ease-out — moves immediately" : "ease-in — feels delayed"}>
            {({ settled }) => (
                <SlideRail
                    settled={settled}
                    size={size}
                    easing={isDo ? "var(--ease-out-strong)" : "cubic-bezier(0.55, 0, 1, 0.45)"}
                    duration="var(--motion-medium)"
                />
            )}
        </DemoStage>
    );
}

// ── motion-6: Keep UI Motion Under 300ms ─────────────────────────────
export function DurationDemo({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    return (
        <DemoStage size={size} caption={isDo ? "180ms" : "500ms"}>
            {({ settled }) => (
                <SlideRail
                    settled={settled}
                    size={size}
                    easing="var(--ease-out-strong)"
                    duration={isDo ? "180ms" : "500ms"}
                />
            )}
        </DemoStage>
    );
}

// ── motion-7: Asymmetric Enter and Exit ──────────────────────────────
export function AsymmetricDemo({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    return (
        <DemoStage size={size} caption={isDo ? "enter 220ms · exit 160ms" : "enter 360ms · exit 360ms"}>
            {({ settled }) => (
                <FadeBox settled={settled} size={size} label="Enter" duration={isDo ? "220ms" : "360ms"} rise />
            )}
        </DemoStage>
    );
}

// ── motion-8: Press Feedback ─────────────────────────────────────────
export function PressDemo({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    const pressed = isDo ? "scale(0.96)" : "scale(0.9)";
    return (
        <DemoStage size={size} caption={isDo ? "active: scale(0.96)" : "scale(0.9) — overshoots"}>
            {({ settled }) => (
                <div className="flex justify-center">
                    <span
                        className="inline-block will-change-transform"
                        style={{
                            transitionProperty: "transform",
                            transitionTimingFunction: "var(--ease-out-strong)",
                            transitionDuration: "var(--motion-fast)",
                            transform: settled ? "scale(1)" : pressed,
                        }}
                    >
                        <MiniButton label="Save" variant="primary" size={size} />
                    </span>
                </div>
            )}
        </DemoStage>
    );
}

// ── motion-9: Never Scale From Zero ──────────────────────────────────
export function ScaleFromZeroDemo({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    return (
        <DemoStage size={size} caption={isDo ? "scale(0.95) + opacity" : "scale(0) — pops from nothing"}>
            {({ settled }) => (
                <ScalePop settled={settled} size={size} label="Menu" fromScale={isDo ? 0.95 : 0} />
            )}
        </DemoStage>
    );
}

// ── motion-10: Origin-Aware Popovers ─────────────────────────────────
export function OriginDemo({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    return (
        <DemoStage size={size} caption={isDo ? "origin: from trigger" : "origin: center"}>
            {({ settled }) => (
                <ScalePop
                    settled={settled}
                    size={size}
                    label="Popover"
                    fromScale={0.6}
                    origin={isDo ? "top left" : "center"}
                />
            )}
        </DemoStage>
    );
}

// ── motion-11: Subsequent Tooltips Are Instant ───────────────────────
export function TooltipDelayDemo({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    return (
        <DemoStage size={size} caption={isDo ? "no delay after first" : "every tooltip waits"}>
            {({ settled }) => (
                <FadeBox settled={settled} size={size} label="Tip" duration={isDo ? "60ms" : "320ms"} />
            )}
        </DemoStage>
    );
}

// ── motion-12: Use Transitions for Interruptible UI ──────────────────
export function InterruptibleDemo({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    return (
        <DemoStage size={size} caption={isDo ? "transition — retargets" : "keyframe — restarts"}>
            {({ settled }) => (
                <SlideRail
                    settled={settled}
                    size={size}
                    easing={isDo ? "var(--ease-out-strong)" : "steps(6, end)"}
                    duration="var(--motion-medium)"
                />
            )}
        </DemoStage>
    );
}

// ── motion-13: Use Starting Styles for Entry ─────────────────────────
export function StartingStyleDemo({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    return (
        <DemoStage size={size} caption={isDo ? "@starting-style" : "useEffect state flip"}>
            {({ settled }) => (
                <FadeBox settled={settled} size={size} label="New" duration="var(--motion-medium)" rise />
            )}
        </DemoStage>
    );
}

// ── motion-14: Animate Transform and Opacity ─────────────────────────
export function TransformOpacityDemo({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    if (isDo) {
        return (
            <DemoStage size={size} caption="translateY + opacity (smooth)">
                {({ settled }) => <FadeBox settled={settled} size={size} label="Card" duration="var(--motion-medium)" rise />}
            </DemoStage>
        );
    }
    // dont: animates height (layout work).
    return (
        <DemoStage size={size} caption="height + top (layout thrash)">
            {({ settled }) => (
                <div className="flex justify-center">
                    <div
                        className="overflow-hidden rounded bg-neutral-300 will-change-[height] dark:bg-neutral-700"
                        style={{
                            width: size === "lg" ? "48px" : "40px",
                            transitionProperty: "height",
                            transitionTimingFunction: "var(--ease-out-strong)",
                            transitionDuration: "var(--motion-medium)",
                            height: settled ? (size === "lg" ? "28px" : "22px") : "2px",
                        }}
                    />
                </div>
            )}
        </DemoStage>
    );
}

// ── motion-15: Use Percentage Transforms ─────────────────────────────
export function PercentTransformDemo({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    return (
        <DemoStage size={size} caption={isDo ? "translateY(100%)" : "translateY(240px) hardcoded"}>
            {({ settled }) => (
                <SlidePanel settled={settled} size={size} from="bottom" percent={isDo} label="Toast" />
            )}
        </DemoStage>
    );
}

// ── motion-16: Gate Hover Motion ─────────────────────────────────────
export function HoverGateDemo({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    // The "do" example is gated to hover devices — so it must not auto-play on
    // touch, exactly as the rule prescribes. The "dont" scales everywhere.
    return (
        <DemoStage
            size={size}
            hoverOnly={isDo}
            caption={isDo ? "@media (hover: hover)" : "scales on touch too"}
        >
            {({ settled }) => (
                <ScalePop settled={settled} size={size} label={isDo ? "Hover" : "Tap"} fromScale={0.92} duration="var(--motion-fast)" />
            )}
        </DemoStage>
    );
}

// ── motion-22: Use WAAPI for Programmatic Motion ─────────────────────
export function WaapiDemo({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    return (
        <DemoStage size={size} caption={isDo ? "element.animate — smooth" : "setInterval — stepped"}>
            {({ settled }) => (
                <SlideRail
                    settled={settled}
                    size={size}
                    easing={isDo ? "var(--ease-out-strong)" : "steps(8, end)"}
                    duration="var(--motion-medium)"
                />
            )}
        </DemoStage>
    );
}

// ── motion-24: Stagger Without Blocking ──────────────────────────────
export function StaggerDemo({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    return (
        <DemoStage size={size} caption={isDo ? "30–80ms between rows" : "long cascade before usable"}>
            {({ settled }) => <StaggerList settled={settled} size={size} stepMs={isDo ? 60 : 220} />}
        </DemoStage>
    );
}

// ── motion-25: Review in Slow Time ───────────────────────────────────
export function SlowReviewDemo({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    return (
        <DemoStage size={size} caption={isDo ? "review at 3× duration" : "judged only at full speed"}>
            {({ settled }) => (
                <SlideRail
                    settled={settled}
                    size={size}
                    easing="var(--ease-out-strong)"
                    duration={isDo ? "900ms" : "180ms"}
                />
            )}
        </DemoStage>
    );
}

// ── motion-17: Reduced Motion Still Has Intent ───────────────────────
export function ReducedMotionDemo({ variant, size }: DemoProps) {
    const isDo = variant === "do";
    return (
        <DemoStage size={size} caption={isDo ? "fade, no movement" : "slides regardless"}>
            {({ settled }) => (
                <div className="flex justify-center">
                    <span
                        className="will-change-[opacity,transform]"
                        style={{
                            transitionProperty: "opacity, transform",
                            transitionTimingFunction: "var(--ease-out-strong)",
                            transitionDuration: "var(--motion-medium)",
                            opacity: settled ? 1 : 0,
                            transform:
                                isDo || settled ? "translateY(0)" : `translateY(${size === "lg" ? "14px" : "10px"})`,
                        }}
                    >
                        <MiniButton label="Saved" variant="secondary" size={size} />
                    </span>
                </div>
            )}
        </DemoStage>
    );
}
