import type { ReactNode } from "react";

import { DUR, EASE, kf, tracksDurationMs, type Track } from "@/lib/showcase-engine";
import { EasingGraph } from "@/components/features/rules/demos/easing-graph";
import { MotionRail, ProtagonistChip } from "@/components/features/rules/demos/protagonist";
import {
    ButtonScene,
    EdgePanelScene,
    GrowBoxScene,
    IconSwapScene,
    LikeScene,
    ListScene,
    LoadingScene,
    MenuScene,
    ModalScene,
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
    scene: () => ReactNode;
    /** Played on trigger (button press / gesture engage). */
    tracks: Track[];
    /** Played on gesture release / toggle-off. Required for toggle/press/hover.
     *  For grid previews it also serves as the "settle back" pass. */
    exitTracks?: Track[];
    /** What the ms readout counts to, when the pane's whole timeline is not
     *  the number the lesson is about (sys-9's heart fills at 0ms even though
     *  its sync receipt lands at 700ms). The caption's first stated ms must
     *  equal it; showcase-readouts.test.ts holds the two together. */
    readoutMs?: number;
    /** An animated event follows its own curve; waits default to linear. */
    readoutEasing?: string;
    /** A second fact printed beside the readout, e.g. "synced 700ms". */
    readoutTag?: string;
};

export type ShowcaseSpec = {
    trigger: TriggerKind;
    /** Control-button label for action/toggle triggers. */
    control?: string;
    /** Toggle label while engaged: the action the next press performs. */
    controlEngaged?: string;
    /** Per-rule hint line — imperative, names what to do and what to watch.
     *  Overrides the generic per-trigger hint in the deep dive. */
    hint?: string;
    /** Hint shown instead under reduced motion, where the speed control is
     *  hidden. Required whenever `hint` tells the reader to change speed. */
    hintReduced?: string;
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

const PALETTE_ENTRANCE_MS = 180;
const PALETTE_TYPE_MS = 90;

/** The same keystrokes arrive in both panes. Only the focused field receives them. */
function paletteFocusPane(focusMs: number, caption: string): PaneSpec {
    const receivesQuery = focusMs <= PALETTE_TYPE_MS;
    return {
        caption: `${focusMs}ms to focus · ${PALETTE_ENTRANCE_MS}ms entrance — ${caption}`,
        scene: () => <PaletteScene query={receivesQuery ? "op" : ""} />,
        readoutMs: focusMs,
        readoutTag: "focus",
        tracks: [
            t("panel", kf.riseIn(8), PALETTE_ENTRANCE_MS),
            t("key", kf.keyPress(), PALETTE_TYPE_MS),
            t("focus", kf.fadeIn(), 0, { delayMs: focusMs }),
            ...(receivesQuery ? [
                t("query", kf.fadeIn(), 0, { delayMs: PALETTE_TYPE_MS }),
                t("placeholder", kf.crossfade(false), 0, { delayMs: PALETTE_TYPE_MS }),
                t("caret", [{ transform: "translateX(0)" }, { transform: "translateX(2ch)" }], 0, { delayMs: PALETTE_TYPE_MS }),
            ] : []),
        ],
        exitTracks: [
            t("panel", kf.crossfade(false), DUR.fast),
            t("focus", kf.crossfade(false), 0, { delayMs: DUR.fast }),
            ...(receivesQuery ? [
                t("query", kf.crossfade(false), 0, { delayMs: DUR.fast }),
                t("placeholder", kf.fadeIn(), 0, { delayMs: DUR.fast }),
                t("caret", [{ transform: "translateX(2ch)" }, { transform: "translateX(0)" }], 0, { delayMs: DUR.fast }),
            ] : []),
        ],
    };
}

const ICON_SWAP_MS = 300;

/** Match the opacity curve and duration. Only the incoming glyph's blur varies. */
function iconSwap(outgoing: string, incoming: string, blurPx: number): Track[] {
    const timing = { easing: EASE.inOut };
    return [
        t(outgoing, [
            { opacity: 1, filter: "blur(0px)" },
            { opacity: 0, filter: "blur(0px)", offset: 0.45 },
            { opacity: 0, filter: "blur(0px)" },
        ], ICON_SWAP_MS, timing),
        t(incoming, [
            { opacity: 0, filter: `blur(${blurPx}px)` },
            // A reversal takes its first frame from the outgoing glyph's current style.
            { opacity: 0.25, filter: `blur(${blurPx * 0.75}px)`, offset: 0.25 },
            { opacity: 1, filter: "blur(0px)" },
        ], ICON_SWAP_MS, timing),
    ];
}

/** motion-10: the origin pip shows while the menu grows, then gets out of the
 *  way 150ms after it lands. The centre origin sits over "Duplicate", so a
 *  longer hold parks a dot on a menu item. */
const ORIGIN_PIP_HOLD_MS = 150;
const menuFromOrigin = (fromScale: number): Track[] => [
    t("panel", kf.popIn(fromScale), DUR.medium),
    t("origin-dot", kf.fadeIn(), 90),
    t("origin-dot", kf.crossfade(false), DUR.fast, { delayMs: DUR.medium + ORIGIN_PIP_HOLD_MS }),
];
/** Settle-back for motion-10. The default reverse would replay the pip's
 *  fade-out backwards and leave it parked on the menu. */
const menuFromOriginExit = (fromScale: number): Track[] => [
    t(
        "panel",
        [
            { opacity: 1, transform: "scale(1)" },
            { opacity: 0, transform: `scale(${fromScale})` },
        ],
        DUR.fast,
        { easing: EASE.inOut }
    ),
    t("origin-dot", [{ opacity: 0 }, { opacity: 0 }], 0),
];

/** Easing demo: labeled chip on a rail + curve as one instrument.
 *  The printed curve label is derived from the control points, so a pane can
 *  never name a bezier it is not actually running. */
const easingScene = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    chipLabel: string
) => (
    <div className="flex flex-col gap-2">
        <MotionRail hug>
            <ProtagonistChip anim="panel" label={chipLabel} compact="narrow" />
        </MotionRail>
        <EasingGraph
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            label={`cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`}
        />
    </div>
);

export const showcaseSpecs: Record<string, ShowcaseSpec> = {
    /* motion-1 · Animate by frequency — tallyDontMs makes frequency felt. */
    "motion-1": {
        trigger: "action",
        control: "Open",
        hint: "Open the palette several times and compare the accumulated entrance duration.",
        tallyDontMs: 220,
        do: {
            caption: "Occasional modal · 220ms entrance",
            scene: () => <ModalScene />,
            tracks: [
                t("scrim", kf.fadeIn(), DUR.medium),
                t("panel", kf.riseIn(8), DUR.medium),
            ],
        },
        dont: {
            caption: "Repeated palette · 220ms per entrance",
            scene: () => <PaletteScene />,
            tracks: [t("panel", kf.riseIn(8), DUR.medium)],
        },
    },

    /* motion-2 · A shared palette entrance with immediate or delayed focus. */
    "motion-2": {
        trigger: "action",
        control: "Press K",
        hotkey: "k",
        do: paletteFocusPane(0, "“op” appears in the field"),
        dont: paletteFocusPane(PALETTE_ENTRANCE_MS, "the first keystrokes are lost"),
    },

    /* motion-3 · Purpose before motion — panel slides from its edge (spatial
     * logic) vs a modal that bounces for decoration. */
    "motion-3": {
        trigger: "action",
        control: "Open",
        hint: "Open both and look for a cue to the panel’s resting location.",
        do: {
            caption: "slides from its edge — motion explains where it lives",
            scene: () => <EdgePanelScene />,
            tracks: [t("panel", kf.slideXIn("110%"), DUR.medium)],
        },
        dont: {
            caption: "Bounce — the modal overshoots its final size",
            scene: () => <ModalScene />,
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

    /* motion-4 · Use strong custom easing — curve + rail as one instrument. */
    "motion-4": {
        trigger: "replay",
        hint: "Play, then switch to ¼× — watch each dot hug its curve",
        hintReduced: "Read the two curves — the steep start is where the left one does its travel",
        do: {
            caption: "strong curve · 360ms — most of the travel happens up front",
            scene: () => easingScene(0.23, 1, 0.32, 1, "Panel"),
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
            caption: "CSS ease · 360ms — more travel near the middle",
            scene: () => easingScene(0.25, 0.1, 0.25, 1, "Panel"),
            tracks: [
                t("panel", kf.race(), DUR.slow, { easing: EASE.browserDefault }),
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
                    { easing: EASE.browserDefault }
                ),
            ],
        },
    },

    /* motion-6 · Keep UI motion under 300ms — real dropdown 180 vs 500. */
    "motion-6": {
        trigger: "action",
        control: "Open",
        hint: "Open both and compare when the menu labels settle.",
        do: {
            caption: "menu · 180ms — reads as a response",
            scene: () => <MenuScene origin="top left" />,
            tracks: [t("panel", kf.popIn(0.95), 180)],
        },
        dont: {
            caption: "Menu · 500ms — the labels stay in motion longer",
            scene: () => <MenuScene origin="top left" />,
            tracks: [t("panel", kf.popIn(0.95), 500)],
        },
    },

    /* motion-7 · Asymmetric enter and exit — toast: enter 220 / exit 160
     * vs a symmetric 360/360. Toggle to feel both directions. */
    "motion-7": {
        trigger: "toggle",
        control: "Show toast",
        controlEngaged: "Dismiss",
        hint: "Show the toast, then dismiss it. Compare the timing in each direction.",
        do: {
            caption: "in 220ms · out 160ms — exits get out of the way",
            scene: () => <ToastScene />,
            tracks: [t("panel", kf.slideYIn("150%"), DUR.medium)],
            exitTracks: [t("panel", kf.slideYOut("150%"), 160, { easing: EASE.inOut })],
        },
        dont: {
            caption: "360ms both ways — the goodbye takes as long as the hello",
            scene: () => <ToastScene />,
            tracks: [t("panel", kf.slideYIn("150%"), DUR.slow)],
            exitTracks: [t("panel", kf.slideYOut("150%"), DUR.slow, { easing: EASE.inOut })],
        },
    },

    /* motion-8 · Press feedback — hold the panes: 0.96 reads as feedback,
     * 0.9 overshoots. */
    "motion-8": {
        trigger: "press",
        hint: "Press and hold either side to compare the change in label size.",
        do: {
            caption: "Pressed scale(0.96) — 4% smaller",
            scene: () => <ButtonScene label="Save" restBounds />,
            tracks: [t("panel", kf.scaleTo(1, 0.96), DUR.fast)],
            exitTracks: [t("panel", kf.scaleTo(0.96, 1), DUR.fast)],
        },
        dont: {
            caption: "Pressed scale(0.90) — 10% smaller",
            scene: () => <ButtonScene label="Save" restBounds />,
            tracks: [t("panel", kf.scaleTo(1, 0.9), DUR.fast)],
            exitTracks: [t("panel", kf.scaleTo(0.9, 1), DUR.fast)],
        },
    },

    /* motion-9 · Never scale from zero — menu from 0.95 vs from 0. */
    "motion-9": {
        trigger: "action",
        control: "Open menu",
        hint: "Replay at ¼× and compare when the menu labels become readable.",
        hintReduced: "Real objects don't grow from nothing — the left menu starts at 95%, the right at zero",
        do: {
            caption: "scale(0.95) + fade — it arrives",
            scene: () => <MenuScene origin="top left" />,
            tracks: [t("panel", kf.popIn(0.95), DUR.medium)],
        },
        dont: {
            caption: "scale(0) + fade — it materializes from a point",
            scene: () => <MenuScene origin="top left" />,
            tracks: [t("panel", kf.popIn(0), DUR.medium)],
        },
    },

    /* motion-10 · Origin-aware popovers — from the trigger vs from center.
     * The accent pip marks each pane's transform-origin during playback. */
    "motion-10": {
        trigger: "action",
        control: "Open menu",
        hint: "The dot marks the origin — only one menu starts where you clicked",
        do: {
            caption: "grows from its trigger — cause meets effect",
            scene: () => <MenuScene origin="top left" originMarker />,
            tracks: menuFromOrigin(0.6),
            exitTracks: menuFromOriginExit(0.6),
            // The menu's own motion; the pip's later fade-out is not the lesson.
            readoutMs: DUR.medium,
            readoutEasing: EASE.out,
        },
        dont: {
            caption: "grows from center — detached from its button",
            scene: () => <MenuScene origin="center" originMarker />,
            tracks: menuFromOrigin(0.6),
            exitTracks: menuFromOriginExit(0.6),
            readoutMs: DUR.medium,
            readoutEasing: EASE.out,
        },
    },

    /* motion-11 · Subsequent tooltips are instant — deep dive is toolbar. */
    "motion-11": {
        trigger: "toolbar",
        do: {
            caption: "Adjacent tip — opens without a second delay",
            scene: () => <TooltipScene />,
            tracks: [t("panel", kf.riseIn(4), 100)],
            exitTracks: [t("panel", kf.crossfade(false), 100)],
        },
        dont: {
            caption: "300ms hover delay on each tool",
            scene: () => <TooltipScene />,
            tracks: [t("panel", kf.riseIn(4), 100, { delayMs: 300 })],
            exitTracks: [t("panel", kf.crossfade(false), 100)],
        },
    },

    /* motion-12 · Transitions for Interruptible UI — deep dive is interrupt. */
    "motion-12": {
        trigger: "interrupt",
        do: {
            caption: "transition · 420ms — turns from where it is",
            scene: () => <RaceScene label="Transition" />,
            // Interrupted at 38%: the target flips back to rest and the card
            // eases home from where it actually is.
            tracks: [
                t(
                    "panel",
                    [
                        { transform: railX(0) },
                        { transform: railX(0.5), offset: 0.38 },
                        { transform: railX(0) },
                    ],
                    420
                ),
            ],
        },
        dont: {
            caption: "Restarted keyframes · 420ms — jumps to a fixed endpoint",
            scene: () => <RaceScene label="Keyframe" />,
            // Same interruption, restarted from the declared endpoint: the card
            // snaps to the far edge (2% of the timeline) before travelling home.
            tracks: [
                t(
                    "panel",
                    [
                        { transform: railX(0) },
                        { transform: railX(0.5), offset: 0.38 },
                        { transform: railX(1), offset: 0.4 },
                        { transform: railX(0) },
                    ],
                    420
                ),
            ],
        },
    },

    /* motion-13 · Use starting styles for entry — a new row enters composed
     * vs snapping in. */
    "motion-13": {
        trigger: "action",
        control: "Add items",
        hint: "Compare the illustrated first frames of the inserted rows.",
        do: {
            caption: "Starting-style illustration — rows enter from below",
            scene: () => <ListScene hiddenAtRest />,
            tracks: [t("row", kf.riseIn(6), DUR.medium, { staggerMs: 40 })],
        },
        dont: {
            caption: "Instant reveal — rows appear at their final positions",
            scene: () => <ListScene hiddenAtRest />,
            tracks: [t("row", kf.fadeIn(), 0)],
        },
    },

    /* motion-14 · Animate transform and opacity — compositor-friendly rise
     * vs animating height (layout work every frame). */
    "motion-14": {
        trigger: "replay",
        hint: "Compare visual travel with a height change. A performance trace can show their layout and paint costs.",
        do: {
            caption: "Translate and fade · 220ms",
            scene: () => <ToastScene />,
            tracks: [t("panel", kf.slideYIn("150%"), DUR.medium)],
        },
        dont: {
            caption: "Height · 220ms — changes layout",
            scene: () => <GrowBoxScene />,
            tracks: [t("panel", kf.growHeight(2, 30), DUR.medium)],
        },
    },

    /* motion-15 · Use percentage transforms — two toasts of different sizes:
     * percentage exits clear the frame for both; a fixed pixel exit is tuned
     * to the short one and strands the tall one half-visible. */
    "motion-15": {
        trigger: "toggle",
        control: "Show toasts",
        controlEngaged: "Dismiss",
        hint: "Dismiss them — the fixed-pixel exit strands the taller toast",
        do: {
            caption: "exit translateY(150%) — measured against itself",
            scene: () => <ToastPairScene />,
            tracks: [t("panel", kf.slideYIn("150%"), DUR.medium)],
            exitTracks: [t("panel", kf.slideYOut("150%"), 160, { easing: EASE.inOut })],
        },
        dont: {
            caption: "Exit translateY(40px) — leaves part of the taller toast visible",
            scene: () => <ToastPairScene />,
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

    /* motion-16 · Gate hover motion — the do pane obeys its own rule: no
     * autoplay on touch, and the touch tap fallback animates only the don't. */
    "motion-16": {
        trigger: "hover",
        hint: "Hover both — a real pointer can't tell them apart; on touch only the right pane moves",
        touchAutoplay: false,
        doRequiresHover: true,
        do: {
            caption: "@media (hover: hover) — primary input can hover",
            scene: () => <ButtonScene label="Hover me" variant="secondary" restBounds />,
            tracks: [t("panel", kf.scaleTo(1, 1.06), DUR.fast)],
            exitTracks: [t("panel", kf.scaleTo(1.06, 1), DUR.fast)],
        },
        dont: {
            caption: "scales on tap — a phantom hover",
            scene: () => <ButtonScene label="Hover me" variant="secondary" restBounds />,
            tracks: [t("panel", kf.scaleTo(1, 1.06), DUR.fast)],
            exitTracks: [t("panel", kf.scaleTo(1.06, 1), DUR.fast)],
        },
    },

    /* motion-17 · Reduced motion still has intent — fade (intent kept, no
     * movement) vs sliding regardless. */
    "motion-17": {
        trigger: "replay",
        hint: "Play both — the left still reports the news without sweeping it across the screen",
        do: {
            caption: "fade in place · 220ms — the signal without the sweep",
            scene: () => <ToastScene />,
            tracks: [
                t("panel", [{ opacity: 0, transform: "translateY(0)" }, { opacity: 1, transform: "translateY(0)" }], DUR.medium),
            ],
        },
        dont: {
            caption: "slides regardless · 220ms — motion the user asked you to remove",
            scene: () => <ToastScene />,
            tracks: [t("panel", kf.slideYIn("150%"), DUR.medium)],
        },
    },

    /* motion-18 · Gesture dismissal uses velocity — the deep dive is a real
     * drag prototype (one flick drives both panes); the grid simulates it. */
    "motion-18": {
        trigger: "drag",
        do: {
            caption: "0.5 px/ms or 60% of the rail — intent counts",
            scene: () => <RailCardScene />,
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
            caption: "60% of the rail only — your flick is ignored",
            scene: () => <RailCardScene />,
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

    /* motion-19 · Damp drag boundaries — rubber-band past the edge vs a hard
     * stop. Deep dive is the real drag prototype. */
    "motion-19": {
        trigger: "drag",
        do: {
            caption: "rubber-band past the edge · spring home in 450ms — the edge pushes back",
            scene: () => <RailCardScene />,
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
            caption: "hard clamp · flat 220ms return — a dead stop at the wall",
            scene: () => <RailCardScene />,
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

    /* motion-20 · Capture pointer during drag — the knob keeps tracking when
     * the pointer leaves the surface vs abandoning mid-gesture. */
    "motion-20": {
        trigger: "drag",
        do: {
            caption: "The knob follows outside the frame until release or cancel",
            scene: () => <SliderScene />,
            tracks: [t("knob", [{ transform: railX(0) }, { transform: railX(1) }], 500)],
        },
        dont: {
            caption: "The knob freezes outside the frame mid-drag",
            scene: () => <SliderScene />,
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

    /* motion-21 · Use CSS under load — deep dive is real main-thread stall. */
    "motion-21": {
        trigger: "load",
        do: {
            caption: "CSS transform transition — browser controls playback",
            scene: () => <RaceScene label="Compositor" />,
            tracks: [t("panel", kf.race(), 420)],
        },
        dont: {
            caption: "rAF transform writes — each update needs a callback",
            scene: () => <RaceScene label="Main thread" />,
            tracks: [t("panel", kf.race(), 420, { easing: "steps(5, end)" })],
        },
    },

    /* motion-24 · Stagger without blocking — 60ms steps vs a 220ms cascade.
     * Caption math: 220ms + 2 steps × stagger = when the last row lands. */
    "motion-24": {
        trigger: "replay",
        hint: "Compare when the last row finishes its entrance.",
        do: {
            caption: "60ms steps — last row lands at 340ms",
            scene: () => <ListScene hiddenAtRest />,
            tracks: [t("row", kf.riseIn(6), DUR.medium, { staggerMs: 60 })],
        },
        dont: {
            caption: "220ms steps — last row lands at 660ms",
            scene: () => <ListScene hiddenAtRest />,
            tracks: [t("row", kf.riseIn(6), DUR.medium, { staggerMs: 220 })],
        },
    },

    /* motion-28 · Identical crossfades, with and without blur on arrival. */
    "motion-28": {
        trigger: "toggle",
        control: "Change state",
        controlEngaged: "Change back",
        hint: "Switch to ¼× to compare when each incoming glyph becomes recognizable.",
        hintReduced: "Change state to see the incoming glyph at rest.",
        do: {
            caption: `${ICON_SWAP_MS}ms crossfade — the incoming glyph stays sharp`,
            scene: () => <IconSwapScene />,
            tracks: iconSwap("icon-out", "icon-in", 0),
            exitTracks: iconSwap("icon-in", "icon-out", 0),
        },
        dont: {
            caption: `${ICON_SWAP_MS}ms crossfade — blur obscures the incoming glyph`,
            scene: () => <IconSwapScene />,
            tracks: iconSwap("icon-out", "icon-in", 4),
            exitTracks: iconSwap("icon-in", "icon-out", 4),
        },
    },

    /* motion-29 · Skip default load animation — the default state is already
     * present on load; the comparison needlessly replays an entrance. */
    "motion-29": {
        trigger: "replay",
        control: "Reload UI",
        hint: "Reload the example to compare when the ready control appears.",
        do: {
            caption: "Ready on first render · 0ms",
            scene: () => <ButtonScene label="Ready" variant="secondary" />,
            tracks: [t("panel", [{ opacity: 1 }, { opacity: 1 }], 0)],
        },
        dont: {
            caption: "Entrance replayed · 220ms",
            scene: () => <ButtonScene label="Ready" variant="secondary" />,
            tracks: [t("panel", kf.riseIn(8), DUR.medium)],
        },
    },

    /* color-7 · Hover State Stays in Hue — hover the panes: blue darkens
     * vs jumping to green. Colors are literal because WAAPI keyframes
     * cannot resolve Tailwind classes: blue-600/700, green-600. */
    "color-7": {
        trigger: "hover",
        hint: "Hover each button and compare its feedback with the color you use for success.",
        do: {
            caption: "blue-600 → blue-700 — same hue, deeper",
            scene: () => <ButtonScene label="Hover me" background="#155dfc" />,
            tracks: [t("fill", kf.background("#155dfc", "#1447e6"), DUR.medium)],
            exitTracks: [t("fill", kf.background("#1447e6", "#155dfc"), DUR.medium)],
        },
        dont: {
            caption: "blue-600 → green-600 — borrows a possible success cue",
            scene: () => <ButtonScene label="Hover me" background="#155dfc" />,
            tracks: [t("fill", kf.background("#155dfc", "#00a63e"), DUR.medium)],
            exitTracks: [t("fill", kf.background("#00a63e", "#155dfc"), DUR.medium)],
        },
    },

    /* comp-9 · Loading State on Async Buttons — submit: label crossfades to
     * a spinner and the button dims vs staying clickable. */
    "comp-9": {
        trigger: "action",
        control: "Submit",
        hint: "Compare the busy state with the button that still looks ready to submit.",
        do: {
            caption: "spinner + disabled — the button is honest about working",
            scene: () => <SubmitScene spinner />,
            tracks: [
                t("label", kf.crossfade(false), DUR.fast),
                t("spinner", kf.crossfade(true), DUR.fast),
                t("fill", [{ opacity: 1 }, { opacity: 0.55 }], DUR.medium),
            ],
        },
        dont: {
            caption: "still clickable — double-submit roulette",
            scene: () => <SubmitScene spinner={false} />,
            tracks: [t("fill", kf.scaleTo(1, 0.97), 80), t("fill", kf.scaleTo(0.97, 1), 80, { delayMs: 80 })],
        },
    },

    /* sys-9 · Optimistic UI — heart fills instantly vs waiting on the server.
     * The "synced ✓" chip lands 700ms later: background sync made visible. */
    "sys-9": {
        trigger: "action",
        control: "Like",
        hint: "Like both — the left heart trusts the server will agree, the right asks permission first",
        do: {
            caption: "fills at 0ms · synced at 700ms — the round trip happens behind you",
            scene: () => <LikeScene />,
            // The lesson is when the heart fills, not when the receipt lands.
            readoutMs: 0,
            readoutTag: "synced 700ms",
            tracks: [
                // The fill replaces the outline in both panes, so the only
                // difference left between them is when it happens.
                t("outline", kf.crossfade(false), 120),
                t("panel", kf.popIn(0.6), 120),
                t("sync", kf.fadeIn(), 140, { delayMs: 700 }),
            ],
        },
        dont: {
            caption: "spinner until 560ms — you wait through the round trip",
            scene: () => <LikeScene />,
            readoutMs: 560,
            tracks: [
                // A spinner takes the heart's slot for the whole round trip,
                // then fades as the heart pops in over it.
                t("outline", kf.crossfade(false), 90),
                t("wait", kf.fadeIn(), 90),
                t("wait", kf.crossfade(false), 120, { delayMs: 560 }),
                t("panel", kf.popIn(0.6), 120, { delayMs: 560 }),
                // Same receipt, arriving with the fill instead of after it —
                // the panes differ only in the order of the two events.
                t("sync", kf.fadeIn(), 140, { delayMs: 560 }),
            ],
        },
    },

    /* sys-1 · Skeleton loading — both loaders resolve to the same content, and
     * the wait is 900ms so it is long enough to feel. The skeleton spends it
     * telling you the shape; the spinner spends it telling you nothing. */
    "sys-1": {
        trigger: "action",
        control: "Load",
        hint: "Load both — the same 900ms wait, but one pane spends it teaching you the layout",
        do: {
            caption: "skeleton — the layout arrives before the data",
            scene: () => <LoadingScene kind="skeleton" />,
            // The wait both panes share; the 220ms reveal after it is not the point.
            readoutMs: 900,
            tracks: [
                t("placeholder", kf.crossfade(false), DUR.medium, { delayMs: 900 }),
                t("content", kf.fadeIn(), DUR.medium, { delayMs: 900 }),
            ],
        },
        dont: {
            caption: "spinner — a clock with no hands",
            scene: () => <LoadingScene kind="spinner" />,
            readoutMs: 900,
            tracks: [
                t("placeholder", kf.crossfade(false), DUR.medium, { delayMs: 900 }),
                t("content", kf.fadeIn(), DUR.medium, { delayMs: 900 }),
            ],
        },
    },
};

/** What a pane's timing bar and ms counter show for one phase of playback.
 *  Enter counts to `readoutMs` when the spec sets one, using its explicit curve
 *  for an animated event or linear for a wait. Otherwise both phases count the
 *  tracks' wall-clock length and the bar follows the longest track's curve.
 *  Exit always reads its own tracks, so
 *  a 160ms dismiss never reports the 220ms entrance. */
export function paneReadout(
    pane: PaneSpec,
    phase: "enter" | "exit" = "enter"
): { ms: number; easing: string } {
    if (phase === "enter" && pane.readoutMs !== undefined) {
        return { ms: pane.readoutMs, easing: pane.readoutEasing ?? EASE.linear };
    }
    const tracks = phase === "exit" && pane.exitTracks ? pane.exitTracks : pane.tracks;
    const primary = tracks.reduce((a, b) => (b.durationMs > a.durationMs ? b : a));
    return { ms: Math.round(tracksDurationMs(tracks)), easing: primary.easing ?? EASE.out };
}

/**
 * Whether a rule renders as a motion showcase. Lives here (a shared module,
 * not a "use client" one) so server components — rules/[id]/page — can call
 * it; functions exported from client modules are not callable on the server.
 */
export function hasShowcase(ruleId: string): boolean {
    return ruleId in showcaseSpecs;
}
