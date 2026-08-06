# 005 — Show the curve: easing-aware timing bars and a live bezier plot for motion-4/5

- **Status**: TODO
- **Commit**: c885413
- **Severity**: MEDIUM
- **Category**: Easing & duration / comprehension
- **Estimated scope**: 3 files (~140 lines): `src/components/features/rules/demos/motion-showcase.tsx`, new `src/components/features/rules/demos/easing-graph.tsx`, `src/components/features/rules/demos/showcase-specs.tsx`

## Problem

The easing rules are the hardest to *see* and the showcase gives the least help exactly there:

1. **The timing bar always fills linearly.** `src/components/features/rules/demos/motion-showcase.tsx:50-62`:

```tsx
const anim = bar.animate(
    [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
    { duration: Math.max(1, tracksDurationMs(pane.tracks)), easing: EASE.linear, fill: "forwards" }
);
```

The bar is a clock, but visually it reads as "the animation's progress" — and for easing rules it contradicts the pane above it (the do pane starts fast while its bar crawls linearly).

2. **motion-4 and motion-5 (the two easing rules) show two identical grey boxes** whose only difference is invisible once the run ends (`fill: "forwards"` parks both at the same end position — verified in browser: after playing, the panes are pixel-identical). The single most explanatory artifact for an easing rule — the curve itself, with progress riding it — is absent. Both rules also share `RaceScene` with five other rules, deepening the sameness (see plan 006).

## Target

1. **Bars mirror their pane's easing.** `runBar` gains an `easing` argument: the scaleX fill animates with the *dominant track's* easing instead of always-linear. The do bar surges then settles; the don't bar crawls then rushes — the difference is now visible even in peripheral vision.
2. **A live easing graph for motion-4 and motion-5.** A small SVG under each pane's stage (only for these two rules) that:
   - Plots the pane's cubic-bezier exactly: CSS `cubic-bezier(x1, y1, x2, y2)` is a bezier from (0,0) to (1,1) with those control points, so in a 100×60 viewBox (time →, progress ↑) the path is literally

     ```
     M 0 60 C {x1*100} {60 - y1*60}, {x2*100} {60 - y2*60}, 100 0
     ```

     For `EASE.out = cubic-bezier(0.23, 1, 0.32, 1)`: `M 0 60 C 23 0, 32 0, 100 0`.
     For `EASE.in = cubic-bezier(0.55, 0, 1, 0.45)`: `M 0 60 C 55 60, 100 33, 100 0`.
   - Rides a 6px dot along the curve during playback with zero curve math: the dot is two nested elements — the outer animates `translateX(0 → 100%)` with `linear` easing (time axis), the inner animates `translateY(0 → -100%)` with the pane's *own* easing (value axis). Both driven by the engine so slow-mo and reduced motion come free.
3. Reduced motion: the static curve still renders (it's informative while motionless); the dot just jumps to the end (engine already plays at duration 0).

## Repo conventions to follow

- Scenes are pure markup with `data-anim` targets; the engine finds them by attribute (`showcase-engine.ts:59`). The graph's dot carries `data-anim="dot-x"` (outer) and `data-anim="dot-y"` (inner) and is animated by adding tracks to the motion-4/5 specs — do NOT hand-roll a separate animation system.
- The graph component lives beside the other demo pieces in `src/components/features/rules/demos/`, styled with the same neutral Tailwind palette (`border-neutral-200 dark:border-neutral-800`, curve stroke `stroke-neutral-900 dark:stroke-neutral-100`, dot `fill-emerald-600` on do / `fill-rose-500` on don't is WRONG — keep both dots neutral; the Do/Don't chrome already colors the panes).
- Spec shape: `PaneSpec.scene` is a function of size — compose the graph inside the scene for motion-4/5 rather than changing `PaneChrome`.

## Steps

1. **Create `src/components/features/rules/demos/easing-graph.tsx`** — a server-safe (no hooks) component:

```tsx
import { cn } from "@/lib/utils";

/** Static bezier plot with a rideable dot. x1,y1,x2,y2 are the CSS
 *  cubic-bezier control points. The dot's two data-anim wrappers are
 *  animated by the rule's tracks (outer: time, linear; inner: value,
 *  the pane's easing). */
export function EasingGraph({ x1, y1, x2, y2, size }: { x1: number; y1: number; x2: number; y2: number; size: "sm" | "lg" }) {
    const w = 100, h = 60;
    const path = `M 0 ${h} C ${x1 * w} ${h - y1 * h}, ${x2 * w} ${h - y2 * h}, ${w} 0`;
    return (
        <div className={cn("relative", size === "lg" ? "h-16" : "h-10")}>
            <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
                <path d={path} className="fill-none stroke-neutral-300 dark:stroke-neutral-700" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            </svg>
            {/* dot rides the curve: outer = time axis, inner = value axis */}
            <div data-anim="dot-x" className="absolute bottom-0 left-0 h-full" style={{ width: "100%", transform: "translateX(-100%)" }}>
                {/* implementation note: simpler scheme below in step 2 */}
            </div>
        </div>
    );
}
```

   **Dot mechanics, exactly:** the outer wrapper is `position:absolute; left:0; bottom:0; width:6px; height:6px` and animates `transform: translateX(0) → translateX(94px…)` — px are wrong under `preserveAspectRatio="none"`; instead make the outer wrapper a full-size layer that animates `translateX(0%) → translateX(100%)` of a **zero-width** column at the left edge, with the visible 6px dot centered on that column inside an inner element animating `translateY(0%) → translateY(-100%)` of the graph height, `transform` on both, and the dot offset by `-3px` margins so it stays centered. Give the outer layer `will-change: transform` — nothing else.
2. **`showcase-specs.tsx`** — motion-4 and motion-5: change each pane's `scene` to render `RaceScene` *plus* the graph (stack them in a flex column, graph beneath), passing the pane's own control points:
   - motion-4/5 do: `<EasingGraph x1={0.23} y1={1} x2={0.32} y2={1} size={size} />`
   - motion-4/5 dont: `<EasingGraph x1={0.55} y1={0} x2={1} y2={0.45} size={size} />`
   Add two tracks per pane (same duration as the pane's race track — motion-4: `DUR.slow` = 360; motion-5: `DUR.medium` = 220):

```tsx
t("dot-x", [{ transform: "translateX(0%)" }, { transform: "translateX(100%)" }], DUR.slow, { easing: EASE.linear }),
t("dot-y", [{ transform: "translateY(0%)" }, { transform: "translateY(-100%)" }], DUR.slow), // default easing = EASE.out (do pane)
```

   (don't panes: `{ easing: EASE.in }` on the `dot-y` track.)
3. **`motion-showcase.tsx`** — thread easing into the bar. Change `runBar`'s animate options to accept the pane's dominant easing:

```tsx
const primary = pane.tracks.reduce((a, b) => (b.durationMs > a.durationMs ? b : a));
const anim = bar.animate(
    [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
    { duration: Math.max(1, tracksDurationMs(pane.tracks)), easing: primary.easing ?? EASE.out, fill: "forwards" }
);
```

   Note `EASE.out` (not linear) is the correct default — it matches `playPane`'s default at `showcase-engine.ts:64`.

## Boundaries

- Do NOT modify `showcase-engine.ts` (the existing track/`data-anim` mechanism already covers this).
- Do NOT add the graph to any rule other than motion-4 and motion-5.
- Do NOT animate SVG attributes (cx/cy) — transforms only (compositor, and the reduced-motion CSS covers them).
- If `runBar` or the motion-4/5 specs have drifted from the excerpts, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck && npm run lint && npm test`.
- **Feel check**: `/rules/motion-4`, click `Play both`, then again with `0.25×`:
  - Each dot traces its plotted curve exactly (at 0.25× you can watch it hug the line; any divergence means the dot-y easing doesn't match the plot's control points).
  - The do bar under the pane surges early; the don't bar lags early and rushes late.
  - Reduced motion: curves render statically, dots and cards sit at end states after pressing play, nothing moves.
  - Dark mode: curve visible (`stroke-neutral-700`), dot visible.
- **Done when**: on motion-4/5 a reader can see *why* the two cards feel different — curve shape, bar fill, and card motion all tell the same story.
