"use client";

import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import { useDemoPlayback } from "@/hooks/use-demo-playback";
import { useInteractiveDemo, type InteractionTrigger } from "@/hooks/use-interactive-demo";
import { PreviewFrame, textClass, type PreviewSize } from "@/components/features/rules/preview-primitives";

type StageRender = (state: { settled: boolean }) => ReactNode;

type DemoStageProps = {
    size: PreviewSize;
    caption?: ReactNode;
    /** Preview only: keep this demo from autoplaying on touch (see motion-16). */
    hoverOnly?: boolean;
    /** Set to make the lg deep-dive an interactive prototype the user drives. */
    trigger?: InteractionTrigger;
    /** Button label for `action`/`toggle` triggers (defaults are generic). */
    control?: string;
    children: StageRender;
};

/**
 * Renders a rule's motion demo. In the card grid (sm) it's a lightweight autoplay
 * preview; in the deep-dive (lg) with a `trigger`, it's an interactive prototype
 * the user drives by performing the gesture the rule teaches.
 */
export function DemoStage({ trigger, ...props }: DemoStageProps) {
    if (props.size === "lg" && trigger) {
        return <InteractiveStage trigger={trigger} {...props} />;
    }
    return <PreviewStage {...props} />;
}

function StageFrame({
    size,
    caption,
    children,
}: {
    size: PreviewSize;
    caption?: ReactNode;
    children: ReactNode;
}) {
    return (
        <PreviewFrame size={size}>
            <div className="flex h-full flex-col justify-center gap-2">
                {children}
                {caption ? (
                    <span className={cn("text-neutral-600 dark:text-neutral-300", textClass(size))}>{caption}</span>
                ) : null}
            </div>
        </PreviewFrame>
    );
}

/** Card-grid preview: autoplays once on view, replays on hover. */
function PreviewStage({ size, caption, hoverOnly = false, children }: Omit<DemoStageProps, "trigger" | "control">) {
    const { ref, settled, handlers } = useDemoPlayback({ hoverOnly });
    return (
        <div ref={ref} {...handlers} className="motion-demo cursor-pointer">
            <StageFrame size={size} caption={caption}>
                {children({ settled })}
            </StageFrame>
        </div>
    );
}

/** Deep-dive prototype: the user drives the motion by gesture or control. */
function InteractiveStage({
    size,
    caption,
    trigger,
    control,
    children,
}: DemoStageProps & { trigger: InteractionTrigger }) {
    const { ref, settled, play, toggle, surfaceHandlers } = useInteractiveDemo(trigger);
    const isGesture = trigger === "hover" || trigger === "press";

    return (
        <div ref={ref} className="motion-demo">
            <div {...(surfaceHandlers ?? {})} className={cn(isGesture && "cursor-pointer select-none")}>
                <StageFrame size={size} caption={caption}>
                    {children({ settled })}
                </StageFrame>
            </div>
            <div className="mt-2.5 flex min-h-[28px] items-center">
                {trigger === "hover" ? (
                    <Hint>Hover the preview</Hint>
                ) : trigger === "press" ? (
                    <Hint>Press &amp; hold the preview</Hint>
                ) : (
                    <ControlButton
                        onClick={trigger === "toggle" ? toggle : play}
                        replay={trigger === "replay"}
                    >
                        {trigger === "toggle" ? control ?? "Toggle" : trigger === "action" ? control ?? "Run" : "Replay"}
                    </ControlButton>
                )}
            </div>
        </div>
    );
}

function Hint({ children }: { children: ReactNode }) {
    return <span className="text-xs text-neutral-500 dark:text-neutral-400">{children}</span>;
}

function ControlButton({
    onClick,
    replay,
    children,
}: {
    onClick: () => void;
    replay?: boolean;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
            {replay ? <RotateCcw aria-hidden="true" className="size-3.5" /> : null}
            {children}
        </button>
    );
}
