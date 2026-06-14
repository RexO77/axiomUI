import type { ComponentType } from "react";

import type { PreviewSize, Variant } from "@/components/features/rules/preview-primitives";
import {
    AsymmetricDemo,
    DurationDemo,
    EaseInDemo,
    EasingDemo,
    FrequencyDemo,
    HoverGateDemo,
    InterruptibleDemo,
    KeyboardInstantDemo,
    OriginDemo,
    PercentTransformDemo,
    PressDemo,
    PurposeDemo,
    ReducedMotionDemo,
    ScaleFromZeroDemo,
    SlowReviewDemo,
    StaggerDemo,
    StartingStyleDemo,
    TooltipDelayDemo,
    TransformOpacityDemo,
    WaapiDemo,
} from "@/components/features/rules/demos/motion-demos";
import { ColorHoverDemo } from "@/components/features/rules/demos/interaction-demos";

export type DemoProps = { variant: Variant; size: PreviewSize };

/**
 * Rule id → animated demo. RulePreview consults this first (only when `animate`
 * is set); rules without an entry fall back to the static `getRulePreview`.
 *
 * Intentionally NOT registered (kept as static text — motion would mislead or
 * adds nothing the caption can't): motion-18/19/20 (gesture velocity, damping,
 * pointer capture), motion-21/23 (CSS-vs-JS / variable internals are invisible).
 */
export const motionDemos: Record<string, ComponentType<DemoProps>> = {
    "motion-1": FrequencyDemo,
    "motion-2": KeyboardInstantDemo,
    "motion-3": PurposeDemo,
    "motion-4": EasingDemo,
    "motion-5": EaseInDemo,
    "motion-6": DurationDemo,
    "motion-7": AsymmetricDemo,
    "motion-8": PressDemo,
    "motion-9": ScaleFromZeroDemo,
    "motion-10": OriginDemo,
    "motion-11": TooltipDelayDemo,
    "motion-12": InterruptibleDemo,
    "motion-13": StartingStyleDemo,
    "motion-14": TransformOpacityDemo,
    "motion-15": PercentTransformDemo,
    "motion-16": HoverGateDemo,
    "motion-17": ReducedMotionDemo,
    "motion-22": WaapiDemo,
    "motion-24": StaggerDemo,
    "motion-25": SlowReviewDemo,

    // Opportunistic motion for non-motion rules where it clarifies the point.
    "color-7": ColorHoverDemo,
};
