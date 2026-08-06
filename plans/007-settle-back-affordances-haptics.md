# 007 — Settle demos back to rest, add gesture affordances and haptic ticks

- **Status**: TODO
- **Commit**: c885413
- **Severity**: MEDIUM (settle-back) / LOW (affordances, haptics)
- **Category**: Cohesion & polish
- **Estimated scope**: 3 files (~90 lines): `src/components/features/rules/demos/motion-showcase.tsx`, `src/components/features/rules/demos/showcase-specs.tsx`, `src/components/features/rules/demos/drag-showcases.tsx`

## Problem

1. **Played demos park in their end state forever.** The engine plays with `fill: "forwards"` (`src/lib/showcase-engine.ts:65`), and the deep-dive player (`ShowcaseBody` in `motion-showcase.tsx`) never runs a settle pass for `replay`/`action` triggers — verified in browser: after "Play both" on motion-4, both cards sit at the far end with full timing bars, the rest composition is gone, and for race-type scenes the two panes are pixel-identical, erasing the difference the user just watched. The grid preview already solved this: `PanePreview` schedules `exitTracks` after `tracksDurationMs + 500ms` (`motion-showcase.tsx:285-298`). The deep dive — the surface that invites repeated study — doesn't.

2. **Gesture surfaces have no affordance.** The drag cards (`DragCard`, `drag-showcases.tsx:152-178`) are plain grey boxes; nothing on the card says "drag me" beyond small hint text below the panes and a `cursor-grab` on desktop. On touch there is no cue at all.

3. **The gesture demos are silent on touch.** The repo ships `web-haptics` and uses it across the app (`src/hooks/use-haptics.ts`; e.g. `rule-card.tsx`, `copy-rule-button.tsx:62` uses `tapSuccess`/`tapError`) — but the three drag prototypes, the most physical surfaces on the site, never tick. A dismiss threshold crossing is exactly the "rare, confirmatory feedback" haptics exist for.

## Target

1. **Auto settle-back in deep dives**: for `replay` and `action` triggered specs, after the enter tracks finish plus a **900ms** hold, play the pane's `exitTracks` if present; otherwise play a generic reset derived from the enter tracks (each track reversed: `[...track.keyframes].reverse()`, duration `DUR.fast` = 140ms, easing `EASE.inOut`). Timing bars reset (`scaleX(0)`, no animation) at the same moment. A replay pressed during the hold cancels the pending settle (same `clearTimeout` pattern as `PanePreview`).
2. **Drag affordance**: a grip glyph on every drag card — two vertical dot-columns, exactly:

```tsx
<div aria-hidden="true" className="absolute right-1 top-1/2 -translate-y-1/2 grid grid-cols-2 gap-0.5">
    {Array.from({ length: 6 }).map((_, i) => (
        <span key={i} className="size-0.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
    ))}
</div>
```

   (parent card gets `relative` — it already has explicit sizing.)
3. **Haptics**: in `VelocityDismiss` (`drag-showcases.tsx:180-244`), import `useHaptics` and fire `tapLight()` once per drag when the do-card first crosses the dismiss threshold (`x > travel.current * 0.6`) during `onFrame`, and `tapSuccess()` when a dismiss commits in `onRelease`. Track "already ticked" in a ref reset on `onStart`. No haptics in motion-19/20 (nothing discrete happens).

## Repo conventions to follow

- The settle pattern to imitate is `PanePreview.playOnce` (`motion-showcase.tsx:285-298`): `clearTimeout` guard + `setTimeout(tracksDurationMs(pane.tracks) + hold)`.
- `useHaptics` usage exemplar: `src/components/features/rules/copy-rule-button.tsx:62` (`const { tapSuccess, tapError } = useHaptics();` — call handlers directly, no availability check needed; the hook no-ops where unsupported).
- Reduced motion: gate the settle timer on the existing `reduced` flag from `useReducedMotion()` (`ShowcaseBody`, `motion-showcase.tsx:42`) — in reduced motion, do NOT auto-settle (state changes without user input are motion); the user replays manually.

## Steps

1. **`motion-showcase.tsx` (`ShowcaseBody`)** — add a `settleTimer` ref; in `enter()`, for `spec.trigger === "replay" || spec.trigger === "action"` and `!reduced`, schedule:

```tsx
clearTimeout(settleTimer.current);
settleTimer.current = setTimeout(() => {
    const settle = (el: HTMLDivElement | null, pane: PaneSpec, skip: boolean) => {
        if (!el || skip) return;
        playPane(el, pane.exitTracks ?? reverseTracks(pane.tracks), { rate, reduced });
    };
    settle(doRef.current, spec.do, skipDo);
    settle(dontRef.current, spec.dont, false);
    doBarRef.current?.getAnimations().forEach((a) => a.cancel());
    dontBarRef.current?.getAnimations().forEach((a) => a.cancel());
}, (tracksDurationMs(spec.do.tracks) + 900) / rate);
```

   Define the helper in the same file:

```tsx
const reverseTracks = (tracks: Track[]): Track[] =>
    tracks.map((track) => ({
        target: track.target,
        keyframes: [...track.keyframes].reverse(),
        durationMs: DUR.fast,
        easing: EASE.inOut,
    }));
```

   (Reversing multi-stop keyframes with explicit `offset` values would corrupt offsets — strip `offset` when reversing: map each keyframe to `{ ...frame }` minus `offset`. Add that line.) Import `DUR`, `Track` from `@/lib/showcase-engine`. Clear the timer in the existing spec-change `useEffect` (`motion-showcase.tsx:95-102`) and on unmount.
2. **Check per-rule fit**: motion-29's whole point is "the default state is already there" — its do pane's tracks are a no-op `[{opacity:1},{opacity:1}]`; reversing is harmless. sys-1/comp-9/sys-9 read fine settling back. motion-13's rows hidden at rest → settle returns them to hidden: correct. No spec changes expected; if a rule looks broken by settle-back, add an opt-out field `settle?: false` to `ShowcaseSpec` and set it there — document which rule needed it in the PR description.
3. **`drag-showcases.tsx`** — add the grip glyph to `DragCard` (both md and sm branches) per the Target markup.
4. **`drag-showcases.tsx` (`VelocityDismiss`)** — wire haptics per Target: `const { tapLight, tapSuccess } = useHaptics();`, `const ticked = useRef(false);` (reset in `onStart`), threshold check inside `onFrame`, success call inside the dismiss branches of `onRelease`.

## Boundaries

- Do NOT change the engine's `fill: "forwards"` model or the keyframe builders.
- Do NOT auto-settle `toggle`/`press`/`hover`/`drag` triggers — their exit is user-driven.
- Do NOT add haptics anywhere beyond `VelocityDismiss`.
- Do NOT add sound.
- If `ShowcaseBody`'s `enter`/`exit` shape has drifted, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck && npm run lint && npm test`.
- **Feel check**:
  - `/rules/motion-4`: Play both → cards race, hold ~1s, then glide back to rest in 140ms; bars empty. Pressing Play again mid-hold cancels the pending settle and replays cleanly (no double-settle).
  - `/rules/motion-1` (action trigger, modal + palette): after settle, the overlays are gone and the rest frames look composed again.
  - With `0.25×` active, the hold scales (settle arrives later) and the settle itself runs at quarter speed.
  - Reduced motion: play → end states appear and STAY (no auto-settle).
  - `/rules/motion-18` on a phone (or any device with vibration): crossing the dismiss point ticks once; a committed dismiss ticks distinctly; dragging back and forth over the threshold in one gesture does not machine-gun the motor.
  - Drag cards visibly read as draggable (grip dots) in both themes.
- **Done when**: every play-style deep dive returns to a composed rest frame unprompted, and the motion-18 gesture has tactile confirmation on supporting hardware.
