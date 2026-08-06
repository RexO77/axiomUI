# 003 — Replace fake jank with a real blocked main thread (motion-21) and a real setInterval (motion-22)

- **Status**: TODO
- **Commit**: c885413
- **Severity**: HIGH
- **Category**: Performance / demo honesty
- **Estimated scope**: 3 files (~200 lines): new `src/components/features/rules/demos/load-showcase.tsx`, `src/components/features/rules/demos/motion-showcase.tsx`, `src/components/features/rules/demos/showcase-specs.tsx` (+1 test line)

## Problem

Two performance rules currently *simulate* jank with a stepped easing, which is dishonest and teaches nothing observable:

`src/components/features/rules/demos/showcase-specs.tsx:481-493` (motion-21 "Use CSS Under Load"):

```tsx
"motion-21": {
    trigger: "replay",
    do: {
        caption: "CSS transition — compositor holds 60fps under load",
        tracks: [t("panel", kf.race(), 420)],
    },
    dont: {
        caption: "JS-driven — ~12fps when the main thread blocks",
        tracks: [t("panel", kf.race(), 420, { easing: "steps(5, end)" })],
    },
},
```

`showcase-specs.tsx:497-509` (motion-22 "Use WAAPI for Programmatic Motion") — same trick, `steps(8, end)`.

Both don't-panes run buttery-smooth compositor animations dressed up to look steppy. A reader cannot distinguish "this is what jank looks like" from "they chose a stepped easing". The compositor-vs-main-thread lesson is real, mechanical, and demonstrable in-browser — the demo should actually block the main thread and let physics do the teaching.

## Target

A dedicated interactive prototype (deep dives only; grid previews keep the existing simulated tracks, same pattern as the drag rules — see `showcase-specs.tsx:25-28`).

**motion-21 — "Race under load":** one button, label `Race + block main thread`. On click:
- Both cards travel their rail over **1200ms**, easing `EASE.inOut` (`cubic-bezier(0.65, 0, 0.35, 1)`).
- **Do card**: WAAPI `element.animate` on `transform` — runs on the compositor.
- **Don't card**: a `requestAnimationFrame` loop that computes progress from `performance.now()` and sets `style.transform` each frame — runs on the main thread.
- 200ms after the race starts, deliberately stall the main thread: three synchronous busy-loops of **120ms**, spaced **150ms** apart (`setTimeout`). Total stall ≈ 360ms of the 1200ms race.

```tsx
const stall = (ms: number) => {
    const end = performance.now() + ms;
    while (performance.now() < end) {
        /* deliberately burn the main thread — this is the demo */
    }
};
// schedule: setTimeout(() => stall(120), 200); setTimeout(() => stall(120), 470); setTimeout(() => stall(120), 740);
```

Result: the do card glides through the stalls; the don't card visibly freezes three times and jumps to catch up. That's the actual lesson, felt.

**motion-22 — "Smooth vs setInterval":** button `Play both`.
- **Do card**: `element.animate([{transform: REST}, {transform: FAR}], { duration: 600, easing: EASE.out, fill: "forwards" })` with `EASE.out = "cubic-bezier(0.23, 1, 0.32, 1)"`.
- **Don't card**: a real `setInterval` at **45ms** ticks over the same 600ms — manually compute eased progress and set `style.transform` per tick (~13 updates → genuinely chunky), then `clearInterval` and pin the end state.

Both prototypes: cards return to rest ~800ms after finishing (set `transition: none`, reset transform, brief opacity dip like `drag-showcases.tsx:198-207` does), so the demo invites replay. Wrap everything in `className="motion-showcase"` so the global reduced-motion CSS (`src/app/globals.css:539-542`) applies; additionally, in reduced motion skip the stall entirely (check `useReducedMotion()` from `src/lib/media.ts`) and jump both cards to the end.

## Repo conventions to follow

- Pattern to imitate: `src/components/features/rules/demos/drag-showcases.tsx` — one file, a `switch (ruleId)` export, panes built from `PaneChrome` + captions read from `showcaseSpecs[ruleId]`, refs + imperative style writes, timers collected in a ref and cleared on unmount (`drag-showcases.tsx:186-191`).
- Rail/card markup: copy `RaceScene` (`scenes.tsx:170-189`), travel = `translateX(calc(100cqw - 100%))`.
- Dispatch: add `TriggerKind` `"load"` in `showcase-specs.tsx`; in `MotionShowcase` (`motion-showcase.tsx:27-33`) branch `if (spec.trigger === "load") return <LoadShowcase ruleId={ruleId} />;`
- Easing/duration literals come from `EASE` in `src/lib/showcase-engine.ts:28-33` — import, don't retype.
- Tests: add `"load"` to the `TRIGGERS` set in `src/data/__tests__/showcase-specs.test.ts:8`.

## Steps

1. **`showcase-specs.tsx`** — add `"load"` to `TriggerKind`. Set motion-21 and motion-22 `trigger: "load"`. Keep both rules' `tracks` (grid previews). Update captions:
   - motion-21 do: `WAAPI transform — compositor sails through the stall`; dont: `rAF + style writes — freezes while the thread is blocked`.
   - motion-22 do: `element.animate() — one declaration, smooth`; dont: `setInterval every 45ms — visible steps`.
2. **Create `src/components/features/rules/demos/load-showcase.tsx`** exporting `LoadShowcase({ ruleId })` with a switch for `motion-21` → `<BlockedThreadRace/>` and `motion-22` → `<IntervalRace/>`, both structured like the target section above. Key implementation notes:
   - Compute travel in px at press time (`rail.clientWidth - card.offsetWidth - padding`) like `drag-showcases.tsx:213-216`, or use the `100cqw` calc string with WAAPI keyframes (both endpoints explicit).
   - The rAF loop: progress `p = Math.min(1, (now - start) / 1200)`, apply the same cubic-bezier via a small helper — for exact parity with `EASE.inOut`, evaluate the bezier numerically (Newton iteration on x, then y) or simply use linear progress for BOTH the WAAPI don't… **no**: keep it simple and honest — use `linear` easing on BOTH cards in motion-21 (`EASE.linear`), so curve math is trivial (`transform = travel * p`) and the only difference is where the animation runs. Update motion-21 captions accordingly (linear is acceptable here: constant motion, per the easing decision table).
   - `setInterval` pane (motion-22): eased progress with the same trick is unnecessary — use linear on both there too; the steps are the lesson, not the curve.
   - Guard every timer/interval/rAF in refs; clear on unmount.
   - Buttons disabled while a run is in flight (`aria-disabled` + early return), re-enabled after reset.
3. **`motion-showcase.tsx`** — import and branch: `if (spec.trigger === "load") return <LoadShowcase ruleId={ruleId} />;`
4. **`showcase-specs.test.ts`** — extend `TRIGGERS` with `"load"`.

## Boundaries

- The synchronous stall is capped at 3 × 120ms — do NOT increase it, and do NOT run it on mount, on scroll, or anywhere except an explicit button press.
- Do NOT touch the engine, drag showcases, or any other rule.
- Do NOT remove the existing `tracks` (grid previews depend on them).
- No new dependencies.
- If `MotionShowcase`'s dispatch shape has drifted, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck && npm run lint && npm test`.
- **Feel check**: `/rules/motion-21`, click `Race + block main thread`:
  - Left card moves continuously the whole way; right card freezes visibly (three hitches) and lurches forward after each.
  - Open DevTools Performance, record a run: main thread shows three ~120ms tasks; the WAAPI animation stays on the compositor track.
  - `/rules/motion-22`, `Play both`: left glides, right steps ~13 times.
  - Both demos reset to rest ~1s after finishing; clicking again replays.
  - Reduced motion: click → both cards appear at the end instantly, no stall runs.
- **Done when**: the don't panes' jank comes from real main-thread work (verifiable in the Performance panel), not from easing tricks.
