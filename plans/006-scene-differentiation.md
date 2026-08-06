# 006 — Break the RaceScene monoculture: real scenes for motion-6, motion-25, motion-11

- **Status**: TODO
- **Commit**: c885413
- **Severity**: MEDIUM
- **Category**: Cohesion / purpose — every demo should look like the UI it legislates
- **Estimated scope**: 3 files (~180 lines): `src/components/features/rules/demos/showcase-specs.tsx`, `src/components/features/rules/demos/scenes.tsx`, plus one new interactive file for motion-11 (`tooltip-showcase.tsx`) and the dispatch line in `motion-showcase.tsx`

## Problem

Seven motion rules (4, 5, 6, 12, 21, 22, 25) currently render the identical abstract demo — a small grey card sliding across a dashed rail (`RaceScene`, `src/components/features/rules/demos/scenes.tsx:170-189`). The rules blur together, none of them look like the UI pattern they legislate, and the site reads as one demo re-skinned seven times. Plans 002/003 already replace motion-12/21/22 and plan 005 upgrades motion-4/5; this plan fixes the remaining three weak spots:

1. **motion-6 "Keep UI Motion Under 300ms"** (`showcase-specs.tsx:166-178`) races two boxes at 180ms vs 500ms — indistinguishable in subject from the easing races either side of it. The rule's own do/dont copy says "Dropdown: 180ms / Popover: 500ms" (`src/data/ui-logic.ts`, motion-6) — the demo should show a dropdown.
2. **motion-25 "Review in Slow Time"** (`showcase-specs.tsx:559-571`) shows a 540ms box vs a 180ms box — that's motion-6's lesson again. The actual lesson (flaws invisible at 1× jump out at review speed) is not demonstrated; ironically, the showcase's own `0.25×` toggle *is* the lesson and the demo doesn't use it.
3. **motion-11 "Subsequent Tooltips Are Instant"** (`showcase-specs.tsx:250-264`) hovers ONE tooltip per pane with/without delay — it demos "tooltip delay exists", not "tooltips after the first skip the delay". The rule is about *moving across a toolbar*.

Current motion-25 spec for reference:

```tsx
"motion-25": {
    trigger: "replay",
    do: { caption: "reviewed at 3× duration", scene: (size) => <RaceScene size={size} />, tracks: [t("panel", kf.race(), 540)] },
    dont: { caption: "judged only at full speed", scene: (size) => <RaceScene size={size} />, tracks: [t("panel", kf.race(), 180)] },
},
```

## Target

**motion-6 — dropdown vs popover, real durations.** Reuse `MenuScene` (`scenes.tsx:120-137`):

```tsx
"motion-6": {
    trigger: "action",
    control: "Open",
    do: {
        caption: "dropdown · 180ms",
        scene: (size) => <MenuScene size={size} origin="top left" />,
        tracks: [t("panel", kf.popIn(0.95), 180)],
    },
    dont: {
        caption: "popover · 500ms — a loading state, not a response",
        scene: (size) => <MenuScene size={size} origin="top left" />,
        tracks: [t("panel", kf.popIn(0.95), 500)],
    },
},
```

**motion-25 — spot the flaw at review speed.** Same scene both panes: a toast entrance with a deliberately planted flaw — opacity pops from 0 to 0.55 on the first visible frame (a classic "fade that doesn't start at zero"). The do pane plays it at quarter speed (multiply duration ×4 in the track — the pane represents "you, reviewing"), the don't pane at full speed where the flaw slips past:

```tsx
const FLAWED_TOAST = (durationMs: number): Track[] => [
    t("panel", [
        { opacity: 0, transform: "translateY(150%)" },
        { opacity: 0.55, transform: "translateY(140%)", offset: 0.02 }, // the planted flaw: opacity pops
        { opacity: 1, transform: "translateY(0)" },
    ], durationMs),
];
"motion-25": {
    trigger: "replay",
    do: {
        caption: "reviewed at 0.25× — the opacity pop is obvious",
        scene: (size) => <ToastScene size={size} />,
        tracks: FLAWED_TOAST(880), // 220ms × 4: review speed
    },
    dont: {
        caption: "judged at 1× — the same flaw slips past",
        scene: (size) => <ToastScene size={size} />,
        tracks: FLAWED_TOAST(220),
    },
},
```

(`ToastScene` is `scenes.tsx:104-117`; keyframe `offset` is standard WAAPI and already used in this file, e.g. motion-3's bounce at `showcase-specs.tsx:122-128`.)

**motion-11 — a real 3-button toolbar you sweep across.** New interactive prototype (deep-dive only, like the drag rules; the grid preview keeps simplified tracks). New file `src/components/features/rules/demos/tooltip-showcase.tsx`, dispatched via a new `TriggerKind` `"toolbar"`:

- Each pane renders three small buttons (reuse `MiniButton` from `preview-primitives.tsx`) with a tooltip above each (markup like `TooltipScene`, `scenes.tsx:140-153`).
- One shared pointer surface (the two-pane grid, same pattern as `DragShowcase`'s shared surface) tracks which third of the surface the pointer is over; both panes mirror that hover.
- **Do pane**: first tooltip appears after a 300ms delay; while any tooltip is open (and for a 300ms grace period after leaving), moving to another button shows its tooltip with **0ms delay**, 100ms fade.
- **Don't pane**: every tooltip waits the full 300ms delay, every time.
- Tooltip show/hide via `style.opacity` + `style.transition = "opacity 100ms var(--ease-out-strong)"`; timers in refs, cleared on unmount and pane-leave.
- Hint: `Sweep across the three buttons — the left pane only makes you wait once`.
- Touch fallback: tapping a third acts as hover for it (pointerdown sets the same state).

## Repo conventions to follow

- Interactive prototype pattern: `drag-showcases.tsx` (shared surface driving both panes, captions from `showcaseSpecs`, `PaneChrome` wrappers, `className="motion-showcase"` for the reduced-motion kill switch at `globals.css:539-542`).
- New trigger kind: extend `TriggerKind` in `showcase-specs.tsx:29`, branch in `MotionShowcase` (`motion-showcase.tsx:27-33`), and add the kind to `TRIGGERS` in `src/data/__tests__/showcase-specs.test.ts:8` — same three touch points plans 002/003 use.
- Keep motion-11's grid preview tracks (simplified single tooltip) — grid cards can't host the interactive toolbar.
- Scene components stay hook-free (`scenes.tsx` doc comment, lines 6-12); anything stateful goes in the new showcase file, not in `scenes.tsx`.

## Steps

1. **`showcase-specs.tsx`** — replace the motion-6 spec with the dropdown/popover version above.
2. **`showcase-specs.tsx`** — replace the motion-25 spec with the flawed-toast version above (define `FLAWED_TOAST` as a local helper beside the spec).
3. **`showcase-specs.tsx`** — add `"toolbar"` to `TriggerKind`; change motion-11's `trigger` to `"toolbar"` (keep existing tracks + `TooltipScene` for the grid preview; keep captions, updating do to `"no delay after the first"` → keep as-is, and dont `"every tooltip waits 320ms"` → `"every tooltip waits 300ms"`).
4. **Create `tooltip-showcase.tsx`** per the Target spec. Suggested skeleton: `ToolbarPane({ instantAfterFirst, hovered, everOpened })` renders buttons + tooltips from local refs; the parent owns pointer tracking (`onPointerMove` over the shared grid → `Math.floor(relativeX / (width / 3))`) and passes the active index to both panes; per-pane timer logic decides opacity.
5. **`motion-showcase.tsx`** — `if (spec.trigger === "toolbar") return <TooltipToolbarShowcase />;`
6. **`showcase-specs.test.ts`** — add `"toolbar"` to `TRIGGERS`.

## Boundaries

- Do NOT touch motion-4/5/12/21/22 (owned by plans 002/003/005). If those plans landed first, `TriggerKind` will already have extra members — merge, don't overwrite.
- Do NOT delete `RaceScene` (motion-4/5 still use it under plan 005).
- Do NOT introduce hover-only interactions without the tap fallback described above (`useCanHover` from `src/lib/media.ts` is the existing detector — see `motion-showcase.tsx:43`).
- No new dependencies.

## Verification

- **Mechanical**: `npm run typecheck && npm run lint && npm test`.
- **Feel check**:
  - `/rules/motion-6`: Open → left menu snaps in; right menu at 500ms genuinely reads as "loading". With `0.25×` both are legible.
  - `/rules/motion-25`: Play at 1× — don't pane looks *fine* (this is the point; if the flaw is visible at 1×, soften it: opacity pop 0.4 instead of 0.55). The do pane's slow replay makes the pop unmistakable.
  - `/rules/motion-11`: sweep the pointer across the three buttons left-to-right in ~1s. Left pane: one wait, then instant tooltips. Right pane: stutters — each tooltip arrives late or not at all during a fast sweep. On a touch viewport (DevTools device mode), tapping buttons walks the same behavior.
  - Reduced motion: toolbar tooltips still appear/disappear (opacity is comprehension feedback) but with no transition — verify the global kill switch handles it.
- **Done when**: motion-6/11/25 each demo their *own* lesson with a scene that looks like the UI in the rule copy, and no two motion rules share an indistinguishable demo.
