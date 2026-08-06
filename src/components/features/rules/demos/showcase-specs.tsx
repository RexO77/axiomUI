import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { DUR, EASE, kf, type Track } from "@/lib/showcase-engine";
import type { PreviewSize } from "@/components/features/rules/preview-primitives";
import { EasingGraph } from "@/components/features/rules/demos/easing-graph";
import {
    ButtonScene,
    CardRevealScene,
    EdgePanelScene,
    GrowBoxScene,
    IconSwapScene,
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
    ToastPairScene,
    ToastScene,
    TooltipScene,
} from "@/components/features/rules/demos/scenes";

/** How the user drives the showcase. Gestures act on the panes themselves;
 *  `action`/`toggle`/`replay` are driven from the shared control button.
 *  `drag` / `interrupt` / `load` / `toolbar` use dedicated deep-dive prototypes. */
export type TriggerKind =
    | "replay"
    | "action"
    | "toggle"
    | "press"
    | "hover"
    | "drag"
    | "interrupt"
    | "load"
    | "toolbar";

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
    /** Per-rule hint line — imperative, names what to do and what to watch.
     *  Overrides the generic per-trigger hint in the deep dive. */
    hint?: string;
    /** Plain key (no modifiers) that fires the action trigger while mounted. */
    hotkey?: string;
    /** Frequency-lesson: per-play wait (ms) accumulated on the don't pane. */
    tallyDontMs?: number;
    /** Opt out of deep-dive auto settle-back after replay/action. */
    settle?: false;
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

/** motion-25: toast with a planted opacity pop — obvious at review speed. */
const flawedToast = (durationMs: number): Track[] => [
    t(
        "panel",
        [
            { opacity: 0, transform: "translateY(150%)" },
            { opacity: 0.55, transform: "translateY(140%)", offset: 0.02 },
            { opacity: 1, transform: "translateY(0)" },
        ],
        durationMs
    ),
];

/** Easing demo: labeled chip on a rail + curve as one instrument. */
const easingScene = (
    size: PreviewSize,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    label: string
) => (
    <div className="flex flex-col gap-2">
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
                        Motion
                    </span>
                ) : (
                    <span className="h-1 w-4 rounded-sm bg-blue-500/35" />
                )}
            </div>
        </div>
        <EasingGraph x1={x1} y1={y1} x2={x2} y2={y2} size={size} label={label} />
    </div>
);

export const showcaseSpecs: Record<string, ShowcaseSpec> = {
    /* motion-1 · Animate by Frequency — tallyDontMs makes frequency felt. */
    "motion-1": {
        trigger: "action",
        control: "Open",
        hint: "Open it a few times — feel the palette's delay compound",
        tallyDontMs: 220,
        do: {
            caption: "rare modal · 220ms — earns its motion",
            scene: (size) => <ModalScene size={size} />,
            tracks: [
                t("scrim", kf.fadeIn(), DUR.medium),
                t("panel", kf.riseIn(8), DUR.medium),
            ],
        },
        dont: {
            caption: "frequent palette · 220ms — a tax you pay every time",
            scene: (size) => <PaletteScene size={size} />,
            tracks: [t("panel", kf.riseIn(8), DUR.medium)],
        },
    },

    /* motion-2 · Keyboard Actions Stay Instant — real K keystroke; the kbd
     * chip in both palettes depresses so keystroke and response read as one. */
    "motion-2": {
        trigger: "action",
        control: "Press K",
        hotkey: "k",
        do: {
            caption: "0ms — the result is the feedback",
            scene: (size) => <PaletteScene size={size} />,
            tracks: [
                t("panel", kf.fadeIn(), 0),
                t("key", kf.keyPress(), 180),
            ],
        },
        dont: {
            caption: "240ms — your keystroke waits for a cartoon",
            scene: (size) => <PaletteScene size={size} />,
            tracks: [
                t("panel", kf.riseIn(8), 240),
                t("key", kf.keyPress(), 180),
            ],
        },
    },

    /* motion-3 · Purpose Before Motion — panel slides from its edge (spatial
     * logic) vs a modal that bounces for decoration. */
    "motion-3": {
        trigger: "action",
        control: "Open",
        hint: "Both open something. Only one tells you where it came from",
        do: {
            caption: "slides from its edge — motion explains where it lives",
            scene: (size) => <EdgePanelScene size={size} />,
            tracks: [t("panel", kf.slideXIn("110%"), DUR.medium)],
        },
        dont: {
            caption: "bounce — motion explains nothing",
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

    /* motion-4 · Use Strong Custom Easing — curve + rail as one instrument. */
    "motion-4": {
        trigger: "replay",
        hint: "Play, then switch to ¼× — watch each dot hug its curve",
        do: {
            caption: "starts fast, lands soft",
            scene: (size) =>
                easingScene(size, 0.23, 1, 0.32, 1, "cubic-bezier(0.23, 1, 0.32, 1)"),
            tracks: [
                t("panel", kf.race(), DUR.slow),
                t(
                    "dot-x",
                    [{ transform: "translateX(0%)" }, { transform: "translateX(100%)" }],
                    DUR.slow,
                    { easing: EASE.linear }
                ),
                t(
                    "dot-y",
                    [{ transform: "translateY(0%)" }, { transform: "translateY(-100%)" }],
                    DUR.slow
                ),
            ],
        },
        dont: {
            caption: "starts sluggish, lands abrupt",
            scene: (size) =>
                easingScene(size, 0.55, 0, 1, 0.45, "cubic-bezier(0.55, 0, 1, 0.45)"),
            tracks: [
                t("panel", kf.race(), DUR.slow, { easing: EASE.in }),
                t(
                    "dot-x",
                    [{ transform: "translateX(0%)" }, { transform: "translateX(100%)" }],
                    DUR.slow,
                    { easing: EASE.linear }
                ),
                t(
                    "dot-y",
                    [{ transform: "translateY(0%)" }, { transform: "translateY(-100%)" }],
                    DUR.slow,
                    { easing: EASE.in }
                ),
            ],
        },
    },

    /* motion-5 · Never Use Ease-In for UI. */
    "motion-5": {
        trigger: "replay",
        hint: "Watch the first 100ms — that's where trust is won or lost",
        do: {
            caption: "ease-out — responds the instant you ask",
            scene: (size) =>
                easingScene(size, 0.23, 1, 0.32, 1, "cubic-bezier(0.23, 1, 0.32, 1)"),
            tracks: [
                t("panel", kf.race(), DUR.medium),
                t(
                    "dot-x",
                    [{ transform: "translateX(0%)" }, { transform: "translateX(100%)" }],
                    DUR.medium,
                    { easing: EASE.linear }
                ),
                t(
                    "dot-y",
                    [{ transform: "translateY(0%)" }, { transform: "translateY(-100%)" }],
                    DUR.medium
                ),
            ],
        },
        dont: {
            caption: "ease-in — dead for the first 100ms",
            scene: (size) =>
                easingScene(size, 0.55, 0, 1, 0.45, "cubic-bezier(0.55, 0, 1, 0.45)"),
            tracks: [
                t("panel", kf.race(), DUR.medium, { easing: EASE.in }),
                t(
                    "dot-x",
                    [{ transform: "translateX(0%)" }, { transform: "translateX(100%)" }],
                    DUR.medium,
                    { easing: EASE.linear }
                ),
                t(
                    "dot-y",
                    [{ transform: "translateY(0%)" }, { transform: "translateY(-100%)" }],
                    DUR.medium,
                    { easing: EASE.in }
                ),
            ],
        },
    },

    /* motion-6 · Keep UI Motion Under 300ms — real dropdown 180 vs 500. */
    "motion-6": {
        trigger: "action",
        control: "Open",
        hint: "The counters don't lie — 500ms is a wait, not a transition",
        do: {
            caption: "dropdown · 180ms",
            scene: (size) => <MenuScene size={size} origin="top left" />,
            tracks: [t("panel", kf.popIn(0.95), 180)],
        },
        dont: {
            caption: "popover · 500ms — reads as loading, not response",
            scene: (size) => <MenuScene size={size} origin="top left" />,
            tracks: [t("panel", kf.popIn(0.95), 500)],
        },
    },

    /* motion-7 · Asymmetric Enter and Exit — toast: enter 220 / exit 160
     * vs a symmetric 360/360. Toggle to feel both directions. */
    "motion-7": {
        trigger: "toggle",
        control: "Show / dismiss",
        hint: "Dismiss is the moment you've already moved on — it should be the fastest thing here",
        do: {
            caption: "in 220ms · out 160ms — exits get out of the way",
            scene: (size) => <ToastScene size={size} />,
            tracks: [t("panel", kf.slideYIn("150%"), DUR.medium)],
            exitTracks: [t("panel", kf.slideYOut("150%"), 160, { easing: EASE.inOut })],
        },
        dont: {
            caption: "360ms both ways — the goodbye takes as long as the hello",
            scene: (size) => <ToastScene size={size} />,
            tracks: [t("panel", kf.slideYIn("150%"), DUR.slow)],
            exitTracks: [t("panel", kf.slideYOut("150%"), DUR.slow)],
        },
    },

    /* motion-8 · Press Feedback — hold the panes: 0.96 reads as feedback,
     * 0.9 overshoots. */
    "motion-8": {
        trigger: "press",
        hint: "Press and hold either side — 6% is acknowledgment, 10% is drama",
        do: {
            caption: "active: scale(0.96) — a nod, not a flinch",
            scene: (size) => <ButtonScene size={size} label="Save" />,
            tracks: [t("panel", kf.scaleTo(1, 0.96), DUR.fast)],
            exitTracks: [t("panel", kf.scaleTo(0.96, 1), DUR.fast)],
        },
        dont: {
            caption: "scale(0.90) — the button cowers",
            scene: (size) => <ButtonScene size={size} label="Save" />,
            tracks: [t("panel", kf.scaleTo(1, 0.9), DUR.fast)],
            exitTracks: [t("panel", kf.scaleTo(0.9, 1), DUR.fast)],
        },
    },

    /* motion-9 · Never Scale From Zero — menu from 0.95 vs from 0. */
    "motion-9": {
        trigger: "action",
        control: "Open menu",
        hint: "Real objects don't grow from nothing — run it at ¼×",
        do: {
            caption: "scale(0.95) + fade — it arrives",
            scene: (size) => <MenuScene size={size} origin="top left" />,
            tracks: [t("panel", kf.popIn(0.95), DUR.medium)],
        },
        dont: {
            caption: "scale(0) — it materializes from a point",
            scene: (size) => <MenuScene size={size} origin="top left" />,
            tracks: [t("panel", kf.popIn(0), DUR.medium)],
        },
    },

    /* motion-10 · Origin-Aware Popovers — from the trigger vs from center.
     * The accent pip marks each pane's transform-origin during playback. */
    "motion-10": {
        trigger: "action",
        control: "Open menu",
        hint: "The dot marks the origin — only one menu starts where you clicked",
        do: {
            caption: "grows from its trigger — cause meets effect",
            scene: (size) => <MenuScene size={size} origin="top left" originMarker />,
            tracks: [
                t("panel", kf.popIn(0.6), DUR.medium),
                t("origin-dot", kf.fadeIn(), 90),
            ],
        },
        dont: {
            caption: "grows from center — detached from its button",
            scene: (size) => <MenuScene size={size} origin="center" originMarker />,
            tracks: [
                t("panel", kf.popIn(0.6), DUR.medium),
                t("origin-dot", kf.fadeIn(), 90),
            ],
        },
    },

    /* motion-11 · Subsequent Tooltips Are Instant — deep dive is toolbar. */
    "motion-11": {
        trigger: "toolbar",
        do: {
            caption: "one wait, then instant — the toolbar feels learned",
            scene: (size) => <TooltipScene size={size} />,
            tracks: [t("panel", kf.riseIn(4), 60)],
            exitTracks: [t("panel", kf.crossfade(false), 60)],
        },
        dont: {
            caption: "300ms every time — the toolbar never trusts you",
            scene: (size) => <TooltipScene size={size} />,
            tracks: [t("panel", kf.riseIn(4), DUR.fast, { delayMs: 300 })],
            exitTracks: [t("panel", kf.crossfade(false), 60)],
        },
    },

    /* motion-12 · Transitions for Interruptible UI — deep dive is interrupt. */
    "motion-12": {
        trigger: "interrupt",
        do: {
            caption: "transition — turns from where it is",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), DUR.medium)],
        },
        dont: {
            caption: "keyframes — teleport back and start over",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), DUR.medium, { easing: "steps(6, end)" })],
        },
    },

    /* motion-13 · Use Starting Styles for Entry — a new row enters composed
     * vs snapping in. */
    "motion-13": {
        trigger: "action",
        control: "Add items",
        hint: "The left list was born mid-motion; the right just appeared",
        do: {
            caption: "enters from a declared first frame",
            scene: (size) => <ListScene size={size} hiddenAtRest />,
            tracks: [t("row", kf.riseIn(6), DUR.medium, { staggerMs: 40 })],
        },
        dont: {
            caption: "mounted, then flipped — there was no first frame",
            scene: (size) => <ListScene size={size} hiddenAtRest />,
            tracks: [t("row", kf.fadeIn(), 0)],
        },
    },

    /* motion-14 · Animate Transform and Opacity — compositor-friendly rise
     * vs animating height (layout work every frame). */
    "motion-14": {
        trigger: "replay",
        hint: "They look similar here — under real load only the left stays smooth (see rule 21)",
        do: {
            caption: "translateY + opacity — compositor only",
            scene: (size) => <ToastScene size={size} />,
            tracks: [t("panel", kf.slideYIn("150%"), DUR.medium)],
        },
        dont: {
            caption: "height — layout math on every frame",
            scene: (size) => <GrowBoxScene size={size} />,
            tracks: [t("panel", kf.growHeight(2, 28), DUR.medium)],
        },
    },

    /* motion-15 · Use Percentage Transforms — two toasts of different sizes:
     * percentage exits clear the frame for both; a fixed pixel exit is tuned
     * to the short one and strands the tall one half-visible. */
    "motion-15": {
        trigger: "toggle",
        control: "Show / dismiss",
        hint: "Dismiss them — the fixed-pixel exit strands the taller toast",
        do: {
            caption: "translateY(150%) — measured against itself",
            scene: (size) => <ToastPairScene size={size} />,
            tracks: [t("panel", kf.slideYIn("150%"), DUR.medium)],
            exitTracks: [t("panel", kf.slideYOut("150%"), 160, { easing: EASE.inOut })],
        },
        dont: {
            caption: "40px — right for one size, wrong for every other",
            scene: (size) => <ToastPairScene size={size} />,
            tracks: [t("panel", kf.slideYIn("150%"), DUR.medium)],
            exitTracks: [
                t(
                    "panel",
                    [{ transform: "translateY(0)" }, { transform: "translateY(40px)" }],
                    160,
                    { easing: EASE.inOut }
                ),
            ],
        },
    },

    /* motion-16 · Gate Hover Motion — the do pane obeys its own rule: no
     * autoplay on touch, and the touch tap fallback animates only the don't. */
    "motion-16": {
        trigger: "hover",
        touchAutoplay: false,
        doRequiresHover: true,
        do: {
            caption: "@media (hover: hover) — only where hover is real",
            scene: (size) => <ButtonScene size={size} label="Hover" variant="secondary" />,
            tracks: [t("panel", kf.scaleTo(1, 1.06), DUR.fast)],
            exitTracks: [t("panel", kf.scaleTo(1.06, 1), DUR.fast)],
        },
        dont: {
            caption: "scales on tap — a phantom hover",
            scene: (size) => <ButtonScene size={size} label="Tap" variant="secondary" />,
            tracks: [t("panel", kf.scaleTo(1, 1.06), DUR.fast)],
            exitTracks: [t("panel", kf.scaleTo(1.06, 1), DUR.fast)],
        },
    },

    /* motion-17 · Reduced Motion Still Has Intent — fade (intent kept, no
     * movement) vs sliding regardless. */
    "motion-17": {
        trigger: "replay",
        hint: "Reduced motion isn't no feedback — it's feedback without movement",
        do: {
            caption: "fade in place — the signal without the sweep",
            scene: (size) => <ToastScene size={size} />,
            tracks: [
                t("panel", [{ opacity: 0, transform: "translateY(0)" }, { opacity: 1, transform: "translateY(0)" }], DUR.medium),
            ],
        },
        dont: {
            caption: "slides regardless — motion the user asked you to remove",
            scene: (size) => <ToastScene size={size} />,
            tracks: [t("panel", kf.slideYIn("150%"), DUR.medium)],
        },
    },

    /* motion-18 · Gesture Dismissal Uses Velocity — the deep dive is a real
     * drag prototype (one flick drives both panes); the grid simulates it. */
    "motion-18": {
        trigger: "drag",
        do: {
            caption: "flick or distance — intent counts",
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
            caption: "distance only — your flick is ignored",
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
            caption: "resists past the edge — overshoot ÷ 3, then a springy return",
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
            caption: "dead stop at the wall",
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
            caption: "setPointerCapture — the drag survives leaving the frame",
            scene: (size) => <SliderScene size={size} />,
            tracks: [t("knob", [{ transform: railX(0) }, { transform: railX(1) }], 500)],
        },
        dont: {
            caption: "no capture — the knob is abandoned at the border",
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

    /* motion-21 · Use CSS Under Load — deep dive is real main-thread stall. */
    "motion-21": {
        trigger: "load",
        do: {
            caption: "WAAPI transform — sails through every stall",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), 420)],
        },
        dont: {
            caption: "rAF + style writes — hostage to the thread",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), 420, { easing: "steps(5, end)" })],
        },
    },

    /* motion-22 · Use WAAPI for Programmatic Motion — real setInterval vs animate. */
    "motion-22": {
        trigger: "load",
        do: {
            caption: "element.animate() — one declaration, every frame",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), DUR.medium)],
        },
        dont: {
            caption: "setInterval every 80ms — animation by flipbook",
            scene: (size) => <RaceScene size={size} />,
            tracks: [t("panel", kf.race(), DUR.medium, { easing: "steps(8, end)" })],
        },
    },

    /* motion-23 · Avoid Inheritable Motion Variables — "speed up the parent":
     * an explicit child duration survives; an inherited one silently changes. */
    "motion-23": {
        trigger: "toggle",
        control: "Speed up parent",
        hint: "You changed the parent. Watch what the child does about it",
        do: {
            caption: "child keeps its explicit 220ms",
            scene: (size) => <NestedChipsScene size={size} childLabel="child · 220ms" />,
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
            caption: "child silently inherits the parent's 140ms",
            scene: (size) => (
                <NestedChipsScene size={size} childLabel="child · inherits 140ms" childInherits />
            ),
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

    /* motion-24 · Stagger Without Blocking — 60ms steps vs a 220ms cascade.
     * Caption math: 220ms + 2 steps × stagger = when the last row lands. */
    "motion-24": {
        trigger: "replay",
        hint: "Stagger is decoration. The moment it delays reading, it's a bug",
        do: {
            caption: "60ms steps — last row lands at 340ms",
            scene: (size) => <ListScene size={size} hiddenAtRest />,
            tracks: [t("row", kf.riseIn(6), DUR.medium, { staggerMs: 60 })],
        },
        dont: {
            caption: "220ms steps — last row lands at 660ms",
            scene: (size) => <ListScene size={size} hiddenAtRest />,
            tracks: [t("row", kf.riseIn(6), DUR.medium, { staggerMs: 220 })],
        },
    },

    /* motion-25 · Review in Slow Time — same flawed toast at review vs 1×.
     * Durations are baked (not the speed control): 880ms ≈ 220ms × 4. */
    "motion-25": {
        trigger: "replay",
        hint: "This is why the ¼× button exists — every motion bug survives full speed",
        do: {
            caption: "reviewed at ¼× (880ms) — the opacity pop is unmissable",
            scene: (size) => <ToastScene size={size} />,
            tracks: flawedToast(880),
        },
        dont: {
            caption: "shipped at 1× (220ms) — nobody saw it",
            scene: (size) => <ToastScene size={size} />,
            tracks: flawedToast(220),
        },
    },

    /* motion-26 · Split Enter Animations — a composed card whose header, body
     * and actions arrive as three beats vs one undifferentiated fade. */
    "motion-26": {
        trigger: "replay",
        hint: "Three beats read as composition; one fade reads as a screenshot",
        do: {
            caption: "title, body, actions — three beats, 90ms apart",
            scene: (size) => <CardRevealScene size={size} mode="parts" />,
            tracks: [
                t("whole", kf.fadeIn(), DUR.fast),
                t("part", kf.riseIn(8), DUR.medium, { staggerMs: 90 }),
            ],
        },
        dont: {
            caption: "one undifferentiated fade",
            scene: (size) => <CardRevealScene size={size} mode="whole" />,
            tracks: [t("whole", kf.fadeIn(), DUR.slow)],
        },
    },

    /* motion-27 · Subtle Exit Motion — a short fixed offset preserves context;
     * the exaggerated comparison shrinks and flies away. */
    "motion-27": {
        trigger: "replay",
        hint: "Watch where your eye goes — the exit shouldn't compete with what's next",
        do: {
            caption: "-12px + fade · 150ms — leaves the room quietly",
            scene: (size) => <ButtonScene size={size} label="Dismiss" variant="secondary" />,
            tracks: [t("panel", kf.dropOut(-12), 150, { easing: EASE.in })],
        },
        dont: {
            caption: "flies away · 400ms — exits are not fireworks",
            scene: (size) => <ButtonScene size={size} label="Dismiss" variant="secondary" />,
            tracks: [
                t(
                    "panel",
                    [
                        { opacity: 1, transform: "translateY(0) scale(1)" },
                        { opacity: 0, transform: "translateY(-100%) scale(0.5)" },
                    ],
                    400,
                    { easing: EASE.in },
                ),
            ],
        },
    },

    /* motion-28 · Animate Contextual Icons — keep both icons mounted and
     * cross-fade with the prescribed scale/opacity/blur combination. */
    "motion-28": {
        trigger: "toggle",
        control: "Change state",
        hint: "Run it at ¼× — the blur is what sells the morph",
        do: {
            caption: "scale + fade + blur — one object changing its mind",
            scene: (size) => <IconSwapScene size={size} />,
            tracks: [
                t(
                    "icon-out",
                    [
                        { opacity: 1, transform: "scale(1)", filter: "blur(0px)" },
                        { opacity: 0, transform: "scale(0.25)", filter: "blur(4px)" },
                    ],
                    300,
                ),
                t(
                    "icon-in",
                    [
                        { opacity: 0, transform: "scale(0.25)", filter: "blur(4px)" },
                        { opacity: 1, transform: "scale(1)", filter: "blur(0px)" },
                    ],
                    300,
                ),
            ],
            exitTracks: [
                t(
                    "icon-out",
                    [
                        { opacity: 0, transform: "scale(0.25)", filter: "blur(4px)" },
                        { opacity: 1, transform: "scale(1)", filter: "blur(0px)" },
                    ],
                    300,
                ),
                t(
                    "icon-in",
                    [
                        { opacity: 1, transform: "scale(1)", filter: "blur(0px)" },
                        { opacity: 0, transform: "scale(0.25)", filter: "blur(4px)" },
                    ],
                    300,
                ),
            ],
        },
        dont: {
            caption: "swap — two strangers trading places",
            scene: (size) => <IconSwapScene size={size} />,
            tracks: [
                t("icon-out", [{ opacity: 1 }, { opacity: 0 }], 0),
                t("icon-in", [{ opacity: 0 }, { opacity: 1 }], 0),
            ],
            exitTracks: [
                t("icon-out", [{ opacity: 0 }, { opacity: 1 }], 0),
                t("icon-in", [{ opacity: 1 }, { opacity: 0 }], 0),
            ],
        },
    },

    /* motion-29 · Skip Default Load Animation — the default state is already
     * present on load; the comparison needlessly replays an entrance. */
    "motion-29": {
        trigger: "replay",
        control: "Reload UI",
        hint: "A default state that animates in is a page apologizing for existing",
        do: {
            caption: "already there — the default state owes you nothing",
            scene: (size) => <ButtonScene size={size} label="Ready" variant="secondary" />,
            tracks: [t("panel", [{ opacity: 1 }, { opacity: 1 }], 0)],
        },
        dont: {
            caption: "re-enters on every visit — ceremony for furniture",
            scene: (size) => <ButtonScene size={size} label="Ready" variant="secondary" />,
            tracks: [t("panel", kf.riseIn(8), DUR.medium)],
        },
    },

    /* color-7 · Hover State Stays in Hue — hover the panes: blue darkens
     * vs jumping to green. Colors are literal because WAAPI keyframes
     * cannot resolve Tailwind classes: blue-600/700, green-600. */
    "color-7": {
        trigger: "hover",
        do: {
            caption: "blue-600 → blue-700 — same hue, deeper",
            scene: (size) => <ButtonScene size={size} label="Hover me" background="#155dfc" />,
            tracks: [t("fill", kf.background("#155dfc", "#1447e6"), DUR.medium)],
            exitTracks: [t("fill", kf.background("#1447e6", "#155dfc"), DUR.medium)],
        },
        dont: {
            caption: "blue → green — a different opinion, not a hover",
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
        hint: "Click the right button twice. That's two orders in production",
        do: {
            caption: "spinner + disabled — the button is honest about working",
            scene: (size) => <SubmitScene size={size} spinner />,
            tracks: [
                t("label", kf.crossfade(false), DUR.fast),
                t("spinner", kf.crossfade(true), DUR.fast),
                t("fill", [{ opacity: 1 }, { opacity: 0.55 }], DUR.medium),
            ],
        },
        dont: {
            caption: "still clickable — double-submit roulette",
            scene: (size) => <SubmitScene size={size} spinner={false} />,
            tracks: [t("fill", kf.scaleTo(1, 0.97), 80), t("fill", kf.scaleTo(0.97, 1), 80, { delayMs: 80 })],
        },
    },

    /* sys-9 · Optimistic UI — heart fills instantly vs waiting on the server.
     * The "synced ✓" chip lands 700ms later: background sync made visible. */
    "sys-9": {
        trigger: "action",
        control: "Like",
        hint: "The left heart trusts the server will agree. The right one asks first",
        do: {
            caption: "fills now, syncs behind your back",
            scene: (size) => <LikeScene size={size} />,
            tracks: [
                t("panel", kf.popIn(0.6), 120),
                t("sync", kf.fadeIn(), 140, { delayMs: 700 }),
            ],
        },
        dont: {
            caption: "waits 560ms for permission to feel",
            scene: (size) => <LikeScene size={size} />,
            tracks: [t("panel", kf.popIn(0.6), 120, { delayMs: 560 })],
        },
    },

    /* sys-1 · Skeletons Over Spinners — both loaders resolve to the same
     * content; the skeleton already told you the shape. */
    /* sys-1 · Skeletons Over Spinners — the wait is 900ms so it's long enough
     * to *feel*; one pane spends it teaching the layout. */
    "sys-1": {
        trigger: "action",
        control: "Load",
        hint: "Same 900ms wait. One pane spends it teaching you the layout",
        do: {
            caption: "skeleton — the layout arrives before the data",
            scene: (size) => <LoadingScene size={size} kind="skeleton" />,
            tracks: [
                t("placeholder", kf.crossfade(false), DUR.medium, { delayMs: 900 }),
                t("content", kf.fadeIn(), DUR.medium, { delayMs: 900 }),
            ],
        },
        dont: {
            caption: "spinner — a clock with no hands",
            scene: (size) => <LoadingScene size={size} kind="spinner" />,
            tracks: [
                t("placeholder", kf.crossfade(false), DUR.medium, { delayMs: 900 }),
                t("content", kf.fadeIn(), DUR.medium, { delayMs: 900 }),
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
