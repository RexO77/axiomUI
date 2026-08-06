# 004 — Carry gesture velocity into releases; add a spring easing utility

- **Status**: TODO
- **Commit**: c885413
- **Severity**: HIGH
- **Category**: Physicality / interruptibility
- **Estimated scope**: 2 files (~120 lines): `src/lib/showcase-engine.ts`, `src/components/features/rules/demos/drag-showcases.tsx`

## Problem

The drag prototypes measure release velocity and then throw it away. Every release — hard flick or gentle drop — animates with the same fixed 220ms curve, so the handoff from finger to animation feels dead. For a site whose gesture rules preach physics, the gesture demos themselves have none.

`src/components/features/rules/demos/drag-showcases.tsx:32-33`:

```tsx
const RELEASE_TRANSITION =
    "transform 220ms var(--ease-out-strong), opacity 220ms var(--ease-out-strong)";
```

`drag-showcases.tsx:193-207` (motion-18 dismiss — velocity checked, then discarded):

```tsx
const dismiss = (el: HTMLElement | null) => {
    if (!el) return;
    el.style.transition = RELEASE_TRANSITION;
    el.style.transform = `translateX(${travel.current + 48}px)`;
    el.style.opacity = "0";
```

`drag-showcases.tsx:275-279` (motion-19 rubber-band return — a flat ease, no spring):

```tsx
onRelease: () => {
    setCardX(doCard.current, 0, true);
    setCardX(dontCard.current, 0, true);
},
```

Two failures against the physics bar:

1. **Dismiss speed ignores flick speed** (motion-18): a 2 px/ms flick and a slow drag both exit in 220ms. Springs/gesture animations must inherit velocity.
2. **The rubber-band snap-back has no spring** (motion-19): a card stretched past the boundary returns with a plain ease-out — it should settle with a slight, damped overshoot (`bounce ≈ 0.2`, the Apple-style subtle range 0.1–0.3).

There is no spring capability anywhere in the codebase (no motion library — the engine is hand-rolled WAAPI, `src/lib/showcase-engine.ts`), and CSS `linear()` easing makes springs expressible without dependencies.

## Target

1. A `springLinear(bounce, points)` helper in `showcase-engine.ts` that returns a CSS `linear(…)` easing string sampling a damped spring, usable in both `transition` and WAAPI `easing`.
2. motion-18: dismiss duration computed from measured velocity — `duration = clamp(remainingPx / max(velocity, 0.8), 120, 260)` ms, easing stays `var(--ease-out-strong)` (an exit that fades out needs no bounce). Snap-back (not far enough / no flick) uses `springLinear(0.15)` over 350ms so the card lands with a hint of life.
3. motion-19: the do card's return-from-overstretch uses `springLinear(0.2)` over 450ms — a visible but subtle overshoot past rest and settle. The don't card keeps the current flat 220ms ease-out return (the contrast becomes part of the lesson).
4. motion-20: unchanged (sliders keep value; no release animation).

## Repo conventions to follow

- Engine utilities live in `src/lib/showcase-engine.ts` with block comments (see the `kf` builders at `:88-91`). Export the helper there so future specs can use it.
- `setCardX(el, x, animate)` (`drag-showcases.tsx:144-148`) is the single write point for transforms — extend it (add an optional easing/duration argument) rather than scattering style writes.
- Durations: stay within the drag budget already used in this file (220ms base; the spring returns may run 350-450ms — acceptable, gesture settles are exempt from the 300ms UI cap when they carry physics).
- Reduced motion needs no work: `src/app/globals.css:539-542` kills transitions inside `.motion-showcase` under `prefers-reduced-motion`.

## Steps

1. **`showcase-engine.ts`** — add and export:

```tsx
/**
 * CSS linear() easing that samples a damped spring settling to 1.
 * bounce 0 = critically damped; 0.1–0.3 = subtle overshoot (recommended);
 * pair with a duration ≈ 350–500ms. Usable in CSS transitions and WAAPI.
 */
export function springLinear(bounce = 0.2, points = 24): string {
    // Underdamped spring: ζ from bounce, natural frequency tuned so the
    // motion settles by t=1 (normalized time).
    const zeta = 1 - bounce; // 0.8 for bounce 0.2
    const omega = 8; // rad per normalized duration — settles within t=1
    const omegaD = omega * Math.sqrt(1 - zeta * zeta);
    const samples: string[] = [];
    for (let i = 0; i <= points; i++) {
        const tNorm = i / points;
        const decay = Math.exp(-zeta * omega * tNorm);
        const x = 1 - decay * (Math.cos(omegaD * tNorm) + ((zeta * omega) / omegaD) * Math.sin(omegaD * tNorm));
        samples.push(x.toFixed(4));
    }
    // Last sample must be exactly 1 so fill states land cleanly.
    samples[samples.length - 1] = "1";
    return `linear(${samples.join(", ")})`;
}
```

2. **`drag-showcases.tsx`** — generalize the write helper:

```tsx
function setCardX(
    el: HTMLElement | null,
    x: number,
    animate: boolean,
    releaseStyle?: { durationMs: number; easing: string }
) {
    if (!el) return;
    el.style.transition = animate
        ? releaseStyle
            ? `transform ${releaseStyle.durationMs}ms ${releaseStyle.easing}, opacity ${releaseStyle.durationMs}ms ${releaseStyle.easing}`
            : RELEASE_TRANSITION
        : "none";
    el.style.transform = `translateX(${x}px)`;
}
```

3. **`drag-showcases.tsx` · motion-18 (`VelocityDismiss`)** —
   - `dismiss` takes the measured velocity: `const dismiss = (el, velocity) => { const remaining = travel.current + 48 - currentX; const durationMs = Math.min(260, Math.max(120, remaining / Math.max(velocity, 0.8))); … }` and uses that duration in the exit transition (easing unchanged: `var(--ease-out-strong)`). Track `currentX` from the last `onFrame` value (a ref).
   - In `onRelease`, pass `velocity` through: `dismiss(doCard.current, velocity)`.
   - Snap-back branch: `setCardX(doCard.current, 0, true, { durationMs: 350, easing: springLinear(0.15) })`. The don't card keeps plain `setCardX(dontCard.current, 0, true)` — its lesson is the threshold, not the spring.
4. **`drag-showcases.tsx` · motion-19 (`DampedBoundary`)** — in `onRelease`:

```tsx
onRelease: () => {
    setCardX(doCard.current, 0, true, { durationMs: 450, easing: springLinear(0.2) });
    setCardX(dontCard.current, 0, true); // flat 220ms — part of the contrast
},
```

5. Import `springLinear` from `@/lib/showcase-engine` in `drag-showcases.tsx`. Compute the two easing strings once at module scope (they're pure), e.g. `const SPRING_SOFT = springLinear(0.15); const SPRING_SETTLE = springLinear(0.2);`

## Boundaries

- Do NOT introduce a motion library (no framer-motion/react-spring) — `linear()` strings only.
- Do NOT change drag tracking (`useMirroredDrag`), thresholds, or the damping math (`dx / 3`).
- Do NOT touch motion-20 or the WAAPI track player.
- If `setCardX`/`dismiss` don't match the excerpts (drift), STOP and report.

## Verification

- **Mechanical**: `npm run typecheck && npm run lint && npm test`. Also check `springLinear(0.2)` output starts with `linear(0` and ends with `1)` (quick node eval or a unit test beside `src/lib/__tests__`).
- **Feel check** (trackpad or touch, real device if possible — synthetic drags won't produce honest velocity):
  - `/rules/motion-18`: a hard flick exits noticeably faster than a slow far drag; a gentle non-dismissing drop snaps back with a faint settle, not a robotic stop.
  - `/rules/motion-19`: drag well past the edge and release — the do card returns and *just* overshoots rest before settling; the don't card returns flat. At 0.25×… the showcase slow-mo toggle doesn't cover drag prototypes, so verify in DevTools → Animations panel at 25% speed.
  - Safari check: `linear()` easing requires Safari 17.2+ / Chrome 113+ / Firefox 112+ — in older browsers the transition falls back to `linear` keyword? It does NOT (invalid easing → transition may be dropped). Guard: `CSS.supports("transition-timing-function", "linear(0, 1)")` — if unsupported, fall back to `var(--ease-out-strong)`. Add this guard as a module-scope constant.
- **Done when**: flick speed visibly changes dismiss speed, and the motion-19 do-card settles with a damped overshoot in a supporting browser while degrading to the current behavior elsewhere.
