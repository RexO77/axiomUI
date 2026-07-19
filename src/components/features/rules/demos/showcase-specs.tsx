import type { ReactNode } from "react";

import { DUR, EASE, kf, type Track } from "@/lib/showcase-engine";
import type { PreviewSize } from "@/components/features/rules/preview-primitives";
import {
    ButtonScene,
    EdgePanelScene,
    GrowBoxScene,
    LikeScene,
    ListScene,
    LoadingScene,
    MenuScene,
    ModalScene,
    NestedChipsScene,
    PaletteScene,
    RaceScene,
    RailCardScene,
    SliderScene,
    SubmitScene,
    ToastScene,
    TooltipScene,
} from "@/components/features/rules/demos/scenes";

/** How the user drives the showcase. Gestures act on the panes themselves;
 *  `action`/`toggle`/`replay` are driven from the shared control button.
 *  `drag` rules render a real drag prototype in the deep dive (drag-showcases)
 *  and use their tracks only for the simulated grid preview. */
export type TriggerKind = "replay" | "action" | "toggle" | "press" | "hover" | "drag";

export type PaneSpec = {
    /** Timing readout under the pane, e.g. "180ms · ease-out". */
    caption: string;
    /** Rest-frame markup; animated nodes carry data-anim targets. */
    scene: (size: PreviewSize) => ReactNode;
    /** Played on trigger (button press / gesture engage). */
    tracks: Track[];
    /** Played on gesture release / toggle-off. Required for toggle/press/hover.
     *  For grid previews it also serves as the "settle back" pass. */
    exitTracks?: Track[];
};

export type ShowcaseSpec = {
    trigger: TriggerKind;
    /** Control-button label for action/toggle triggers. */
    control?: string;
    /** Skip grid autoplay on touch devices (motion-16 must obey its own rule). */
    touchAutoplay?: false;
    /** The do pane's motion is hover-gated by its own lesson: on touch devices
     *  the tap fallback animates only the don't pane (motion-16 dogfoods itself). */
    doRequiresHover?: true;
    do: PaneSpec;
    dont: PaneSpec;
};

const t = (target: string, keyframes: Keyframe[], durationMs: number, extra?: Partial<Track>): Track => ({
    target,
    keyframes,
    durationMs,
    ...extra,
});

/** Rail travel for the drag-preview scenes: fraction of the container width
 *  minus the card's own width (0 = rest, 1 = far edge). */
const railX = (fraction: number) =>
    fraction === 0 ? "translateX(0)" : `translateX(calc((100cqw - 100%) * ${fraction}))`;

export const showcaseSpecs: Record<string, ShowcaseSpec> = {
    /* motion-1 · Animate by Frequency
     * One "Open": a rare modal earns 220ms; a frequent palette at the same
     * 220ms feels laggy next to it. */
    "motion-1": {
        trigger: "action",
        control: "Open",
        do: {
            caption: "rare modal · 220ms",
            scene: (size) => <ModalScene size={size} />,
            tracks: [
                t("scrim", kf.fadeIn(), DUR.medium),
                t("panel", kf.riseIn(8), DUR.medium),
            ],
        },
        dont: {
            caption: "frequent palette · 220ms — too slow",
            scene: (size) => <PaletteScene size={size} />,
            tracks: [t("panel", kf.riseIn(8), DUR.medium)],
        },
    },

    /* motion-2 · Keyboard Actions Stay Instant — ⌘K palette: 0ms vs 240ms. */
    "motion-2": {
        trigger: "action",
        control: "Press ⌘K",
        do: {
            caption: "instant · 0ms",
            scene: (size) => <PaletteScene size={size} />,
            tracks: [t("panel", kf.fadeIn(), 0)],
        },
        dont: {
            caption: "waits 240ms",
            scene: (size) => <PaletteScene size={size} />,
            tracks: [t("panel", kf.riseIn(8), 240)],
        },
    },

    /* motion-3 · Purpose Before Motion — panel slides from its edge (spatial
     * logic) vs a modal that bounces for decoration. */
    "motion-3": {
        trigger: "action",
        control: "Open",
        do: {
            caption: "panel enters from its edge",
            scene: (size) => <EdgePanelScene size={size} />,
            tracks: [t("panel", kf.slideXIn("110%"), DUR.medium)],
        },
        dont: {
            caption: "decorative bounce",
            scene: (size) => <ModalScene size={size} />,
            tracks: [
                t("scrim", kf.fadeIn(), DUR.medium),
                t(
                    "panel",
                    [
                        { opacity: 0, transform: "scale(0.5)" },
                        { opacity: 1, transform: "scale(1.15)", offset: 0.6 },
                        { opacity: 1, transform: "scale(1)" },
                    ],
                    DUR.slow
                ),
            ],
        },
    },

    /* motion-4 · Use Strong Custom Easing — same distance, same duration;
     * only the curve differs. Use slow-mo to study it. */
    "motion-4": {
        trigger: "replay",
        do: {
            caption: "cubic-bezier(0.23, 1, 0.32, 1)",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), DUR.slow)],
        },
        dont: {
            caption: "ease-in — starts sluggish",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), DUR.slow, { easing: EASE.in })],
        },
    },

    /* motion-5 · Never Use Ease-In for UI. */
    "motion-5": {
        trigger: "replay",
        do: {
            caption: "ease-out · moves immediately",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), DUR.medium)],
        },
        dont: {
            caption: "ease-in · feels delayed",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), DUR.medium, { easing: EASE.in })],
        },
    },

    /* motion-6 · Keep UI Motion Under 300ms — 180ms vs 500ms, racing. */
    "motion-6": {
        trigger: "replay",
        do: {
            caption: "180ms",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), 180)],
        },
        dont: {
            caption: "500ms — the UI is waiting on the animation",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), 500)],
        },
    },

    /* motion-7 · Asymmetric Enter and Exit — toast: enter 220 / exit 160
     * vs a symmetric 360/360. Toggle to feel both directions. */
    "motion-7": {
        trigger: "toggle",
        control: "Show / dismiss",
        do: {
            caption: "enter 220ms · exit 160ms",
            scene: (size) => <ToastScene size={size} />,
            tracks: [t("panel", kf.slideYIn("150%"), DUR.medium)],
            exitTracks: [t("panel", kf.slideYOut("150%"), 160, { easing: EASE.inOut })],
        },
        dont: {
            caption: "enter 360ms · exit 360ms",
            scene: (size) => <ToastScene size={size} />,
            tracks: [t("panel", kf.slideYIn("150%"), DUR.slow)],
            exitTracks: [t("panel", kf.slideYOut("150%"), DUR.slow)],
        },
    },

    /* motion-8 · Press Feedback — hold the panes: 0.96 reads as feedback,
     * 0.9 overshoots. */
    "motion-8": {
        trigger: "press",
        do: {
            caption: "active: scale(0.96)",
            scene: (size) => <ButtonScene size={size} label="Save" />,
            tracks: [t("panel", kf.scaleTo(1, 0.96), DUR.fast)],
            exitTracks: [t("panel", kf.scaleTo(0.96, 1), DUR.fast)],
        },
        dont: {
            caption: "scale(0.9) — overshoots",
            scene: (size) => <ButtonScene size={size} label="Save" />,
            tracks: [t("panel", kf.scaleTo(1, 0.9), DUR.fast)],
            exitTracks: [t("panel", kf.scaleTo(0.9, 1), DUR.fast)],
        },
    },

    /* motion-9 · Never Scale From Zero — menu from 0.95 vs from 0. */
    "motion-9": {
        trigger: "action",
        control: "Open menu",
        do: {
            caption: "scale(0.95) + fade",
            scene: (size) => <MenuScene size={size} origin="top left" />,
            tracks: [t("panel", kf.popIn(0.95), DUR.medium)],
        },
        dont: {
            caption: "scale(0) — pops from nothing",
            scene: (size) => <MenuScene size={size} origin="top left" />,
            tracks: [t("panel", kf.popIn(0), DUR.medium)],
        },
    },

    /* motion-10 · Origin-Aware Popovers — from the trigger vs from center. */
    "motion-10": {
        trigger: "action",
        control: "Open menu",
        do: {
            caption: "transform-origin: top left (the trigger)",
            scene: (size) => <MenuScene size={size} origin="top left" />,
            tracks: [t("panel", kf.popIn(0.6), DUR.medium)],
        },
        dont: {
            caption: "transform-origin: center — detached",
            scene: (size) => <MenuScene size={size} origin="center" />,
            tracks: [t("panel", kf.popIn(0.6), DUR.medium)],
        },
    },

    /* motion-11 · Subsequent Tooltips Are Instant — hover the panes. */
    "motion-11": {
        trigger: "hover",
        do: {
            caption: "no delay after the first",
            scene: (size) => <TooltipScene size={size} />,
            tracks: [t("panel", kf.riseIn(4), 60)],
            exitTracks: [t("panel", kf.crossfade(false), 60)],
        },
        dont: {
            caption: "every tooltip waits 320ms",
            scene: (size) => <TooltipScene size={size} />,
            tracks: [t("panel", kf.riseIn(4), DUR.fast, { delayMs: 320 })],
            exitTracks: [t("panel", kf.crossfade(false), 60)],
        },
    },

    /* motion-12 · Transitions for Interruptible UI — smooth retarget vs a
     * stepped keyframe that visibly restarts. */
    "motion-12": {
        trigger: "replay",
        do: {
            caption: "transition — retargets smoothly",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), DUR.medium)],
        },
        dont: {
            caption: "keyframe — restarts from zero",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), DUR.medium, { easing: "steps(6, end)" })],
        },
    },

    /* motion-13 · Use Starting Styles for Entry — a new row enters composed
     * vs snapping in. */
    "motion-13": {
        trigger: "action",
        control: "Add item",
        do: {
            caption: "@starting-style — enters from a defined frame",
            scene: (size) => <ListScene size={size} hiddenAtRest />,
            tracks: [t("row", kf.riseIn(6), DUR.medium, { staggerMs: 40 })],
        },
        dont: {
            caption: "state flip — appears with no entrance",
            scene: (size) => <ListScene size={size} hiddenAtRest />,
            tracks: [t("row", kf.fadeIn(), 0)],
        },
    },

    /* motion-14 · Animate Transform and Opacity — compositor-friendly rise
     * vs animating height (layout work every frame). */
    "motion-14": {
        trigger: "replay",
        do: {
            caption: "translateY + opacity — compositor only",
            scene: (size) => <ToastScene size={size} />,
            tracks: [t("panel", kf.slideYIn("150%"), DUR.medium)],
        },
        dont: {
            caption: "height — layout thrash",
            scene: (size) => <GrowBoxScene size={size} />,
            tracks: [t("panel", kf.growHeight(2, 28), DUR.medium)],
        },
    },

    /* motion-15 · Use Percentage Transforms — 150% of self vs a hardcoded
     * pixel distance that breaks at other sizes. */
    "motion-15": {
        trigger: "action",
        control: "Show toast",
        do: {
            caption: "translateY(150%) — size-relative",
            scene: (size) => <ToastScene size={size} />,
            tracks: [t("panel", kf.slideYIn("150%"), DUR.medium)],
        },
        dont: {
            caption: "translateY(240px) — hardcoded",
            scene: (size) => <ToastScene size={size} />,
            tracks: [t("panel", kf.slideYIn("240px"), DUR.medium)],
        },
    },

    /* motion-16 · Gate Hover Motion — the do pane obeys its own rule: no
     * autoplay on touch, and the touch tap fallback animates only the don't. */
    "motion-16": {
        trigger: "hover",
        touchAutoplay: false,
        doRequiresHover: true,
        do: {
            caption: "@media (hover: hover) only",
            scene: (size) => <ButtonScene size={size} label="Hover" variant="secondary" />,
            tracks: [t("panel", kf.scaleTo(1, 1.06), DUR.fast)],
            exitTracks: [t("panel", kf.scaleTo(1.06, 1), DUR.fast)],
        },
        dont: {
            caption: "scales on touch too",
            scene: (size) => <ButtonScene size={size} label="Tap" variant="secondary" />,
            tracks: [t("panel", kf.scaleTo(1, 1.06), DUR.fast)],
            exitTracks: [t("panel", kf.scaleTo(1.06, 1), DUR.fast)],
        },
    },

    /* motion-17 · Reduced Motion Still Has Intent — fade (intent kept, no
     * movement) vs sliding regardless. */
    "motion-17": {
        trigger: "replay",
        do: {
            caption: "fade only — intent without movement",
            scene: (size) => <ToastScene size={size} />,
            tracks: [
                t("panel", [{ opacity: 0, transform: "translateY(0)" }, { opacity: 1, transform: "translateY(0)" }], DUR.medium),
            ],
        },
        dont: {
            caption: "slides regardless of the setting",
            scene: (size) => <ToastScene size={size} />,
            tracks: [t("panel", kf.slideYIn("150%"), DUR.medium)],
        },
    },

    /* motion-18 · Gesture Dismissal Uses Velocity — the deep dive is a real
     * drag prototype (one flick drives both panes); the grid simulates it. */
    "motion-18": {
        trigger: "drag",
        do: {
            caption: "dismisses on flick — velocity or distance",
            scene: (size) => <RailCardScene size={size} />,
            tracks: [
                t(
                    "card",
                    [
                        { transform: railX(0), opacity: 1 },
                        { transform: railX(1.2), opacity: 0 },
                    ],
                    260
                ),
            ],
            exitTracks: [
                t(
                    "card",
                    [
                        { transform: railX(0), opacity: 0 },
                        { transform: railX(0), opacity: 1 },
                    ],
                    DUR.medium
                ),
            ],
        },
        dont: {
            caption: "distance only — the flick snaps back",
            scene: (size) => <RailCardScene size={size} />,
            tracks: [
                t(
                    "card",
                    [
                        { transform: railX(0) },
                        { transform: railX(0.4), offset: 0.45 },
                        { transform: railX(0) },
                    ],
                    520
                ),
            ],
        },
    },

    /* motion-19 · Damp Drag Boundaries — rubber-band past the edge vs a hard
     * stop. Deep dive is the real drag prototype. */
    "motion-19": {
        trigger: "drag",
        do: {
            caption: "resists past the edge — overshoot / 3",
            scene: (size) => <RailCardScene size={size} />,
            tracks: [
                t(
                    "card",
                    [
                        { transform: railX(0) },
                        { transform: railX(1.06), offset: 0.5 },
                        { transform: railX(1), offset: 0.7 },
                        { transform: railX(0) },
                    ],
                    640
                ),
            ],
        },
        dont: {
            caption: "hard stop at the boundary",
            scene: (size) => <RailCardScene size={size} />,
            tracks: [
                t(
                    "card",
                    [
                        { transform: railX(0) },
                        { transform: railX(1), offset: 0.42, easing: EASE.linear },
                        { transform: railX(1), offset: 0.7 },
                        { transform: railX(0) },
                    ],
                    640
                ),
            ],
        },
    },

    /* motion-20 · Capture Pointer During Drag — the knob keeps tracking when
     * the pointer leaves the surface vs abandoning mid-gesture. */
    "motion-20": {
        trigger: "drag",
        do: {
            caption: "setPointerCapture — keeps tracking off-surface",
            scene: (size) => <SliderScene size={size} />,
            tracks: [t("knob", [{ transform: railX(0) }, { transform: railX(1) }], 500)],
        },
        dont: {
            caption: "no capture — loses the knob mid-drag",
            scene: (size) => <SliderScene size={size} />,
            tracks: [
                t(
                    "knob",
                    [
                        { transform: railX(0) },
                        { transform: railX(0.55), offset: 0.55, easing: EASE.linear },
                        { transform: railX(0.55) },
                    ],
                    500
                ),
            ],
        },
    },

    /* motion-21 · Use CSS Under Load — the compositor keeps a CSS transition
     * smooth while a blocked main thread reduces JS motion to a slideshow. */
    "motion-21": {
        trigger: "replay",
        do: {
            caption: "CSS transition — compositor holds 60fps under load",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), 420)],
        },
        dont: {
            caption: "JS-driven — ~12fps when the main thread blocks",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), 420, { easing: "steps(5, end)" })],
        },
    },

    /* motion-22 · Use WAAPI for Programmatic Motion — smooth vs setInterval
     * steps. (This whole showcase runs on WAAPI.) */
    "motion-22": {
        trigger: "replay",
        do: {
            caption: "element.animate() — smooth",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), DUR.medium)],
        },
        dont: {
            caption: "setInterval — stepped",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), DUR.medium, { easing: "steps(8, end)" })],
        },
    },

    /* motion-23 · Avoid Inheritable Motion Variables — "speed up the parent":
     * an explicit child duration survives; an inherited one silently changes. */
    "motion-23": {
        trigger: "toggle",
        control: "Speed up parent",
        do: {
            caption: "child keeps its explicit 220ms",
            scene: (size) => <NestedChipsScene size={size} />,
            tracks: [
                t("parent", kf.nudgeX(10), DUR.fast),
                t("child", kf.nudgeX(10), DUR.medium),
            ],
            exitTracks: [
                t("parent", kf.nudgeXBack(10), DUR.fast),
                t("child", kf.nudgeXBack(10), DUR.medium),
            ],
        },
        dont: {
            caption: "child inherits the parent's 140ms",
            scene: (size) => <NestedChipsScene size={size} />,
            tracks: [
                t("parent", kf.nudgeX(10), DUR.fast),
                t("child", kf.nudgeX(10), DUR.fast),
            ],
            exitTracks: [
                t("parent", kf.nudgeXBack(10), DUR.fast),
                t("child", kf.nudgeXBack(10), DUR.fast),
            ],
        },
    },

    /* motion-24 · Stagger Without Blocking — 60ms steps vs a 220ms cascade. */
    "motion-24": {
        trigger: "replay",
        do: {
            caption: "60ms between rows",
            scene: (size) => <ListScene size={size} hiddenAtRest />,
            tracks: [t("row", kf.riseIn(6), DUR.medium, { staggerMs: 60 })],
        },
        dont: {
            caption: "220ms between rows — content held hostage",
            scene: (size) => <ListScene size={size} hiddenAtRest />,
            tracks: [t("row", kf.riseIn(6), DUR.medium, { staggerMs: 220 })],
        },
    },

    /* motion-25 · Review in Slow Time — the same motion at 1× and at review
     * speed. (The showcase's own 0.25× toggle is this rule as a feature.) */
    "motion-25": {
        trigger: "replay",
        do: {
            caption: "reviewed at 3× duration",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), 540)],
        },
        dont: {
            caption: "judged only at full speed",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), 180)],
        },
    },

    /* color-7 · Hover State Stays in Hue — hover the panes: blue darkens
     * vs jumping to green. Colors are literal because WAAPI keyframes
     * cannot resolve Tailwind classes: blue-600/700, green-600. */
    "color-7": {
        trigger: "hover",
        do: {
            caption: "blue-600 → blue-700",
            scene: (size) => <ButtonScene size={size} label="Hover me" background="#155dfc" />,
            tracks: [t("fill", kf.background("#155dfc", "#1447e6"), DUR.medium)],
            exitTracks: [t("fill", kf.background("#1447e6", "#155dfc"), DUR.medium)],
        },
        dont: {
            caption: "blue → green — hue jump",
            scene: (size) => <ButtonScene size={size} label="Hover me" background="#155dfc" />,
            tracks: [t("fill", kf.background("#155dfc", "#00a63e"), DUR.medium)],
            exitTracks: [t("fill", kf.background("#00a63e", "#155dfc"), DUR.medium)],
        },
    },

    /* comp-9 · Loading State on Async Buttons — submit: label crossfades to
     * a spinner and the button dims vs staying clickable. */
    "comp-9": {
        trigger: "action",
        control: "Submit",
        do: {
            caption: "spinner + disabled on submit",
            scene: (size) => <SubmitScene size={size} spinner />,
            tracks: [
                t("label", kf.crossfade(false), DUR.fast),
                t("spinner", kf.crossfade(true), DUR.fast),
                t("fill", [{ opacity: 1 }, { opacity: 0.55 }], DUR.medium),
            ],
        },
        dont: {
            caption: "stays clickable — double submit",
            scene: (size) => <SubmitScene size={size} spinner={false} />,
            tracks: [t("fill", kf.scaleTo(1, 0.97), 80), t("fill", kf.scaleTo(0.97, 1), 80, { delayMs: 80 })],
        },
    },

    /* sys-9 · Optimistic UI — heart fills instantly vs waiting on the server. */
    "sys-9": {
        trigger: "action",
        control: "Like",
        do: {
            caption: "fills instantly · syncs in the background",
            scene: (size) => <LikeScene size={size} />,
            tracks: [t("panel", kf.popIn(0.6), 120)],
        },
        dont: {
            caption: "waits ~560ms for the round-trip",
            scene: (size) => <LikeScene size={size} />,
            tracks: [t("panel", kf.popIn(0.6), 120, { delayMs: 560 })],
        },
    },

    /* sys-1 · Skeletons Over Spinners — both loaders resolve to the same
     * content; the skeleton already told you the shape. */
    "sys-1": {
        trigger: "action",
        control: "Load",
        do: {
            caption: "skeleton implies the structure",
            scene: (size) => <LoadingScene size={size} kind="skeleton" />,
            tracks: [
                t("placeholder", kf.crossfade(false), DUR.medium, { delayMs: 400 }),
                t("content", kf.fadeIn(), DUR.medium, { delayMs: 400 }),
            ],
        },
        dont: {
            caption: "spinner highlights the wait",
            scene: (size) => <LoadingScene size={size} kind="spinner" />,
            tracks: [
                t("placeholder", kf.crossfade(false), DUR.medium, { delayMs: 400 }),
                t("content", kf.fadeIn(), DUR.medium, { delayMs: 400 }),
            ],
        },
    },
};

/**
 * Whether a rule renders as a motion showcase. Lives here (a shared module,
 * not a "use client" one) so server components — rules/[id]/page — can call
 * it; functions exported from client modules are not callable on the server.
 */
export function hasShowcase(ruleId: string): boolean {
    return ruleId in showcaseSpecs;
}
