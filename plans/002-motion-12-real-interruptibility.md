# 002 — Make motion-12 a spammable toggle that really retargets

- **Status**: TODO
- **Commit**: c885413
- **Severity**: HIGH
- **Category**: Interruptibility / demo honesty
- **Estimated scope**: 3 files (~150 lines): new `src/components/features/rules/demos/interrupt-showcase.tsx`, `src/components/features/rules/demos/motion-showcase.tsx`, `src/components/features/rules/demos/showcase-specs.tsx`

## Problem

**motion-12 "Use Transitions for Interruptible UI"** teaches that CSS transitions retarget mid-flight while keyframes restart from zero. The current showcase demonstrates neither: it plays a one-shot race where the don't pane simply uses a stepped easing.

`src/components/features/rules/demos/showcase-specs.tsx:266-280`:

```tsx
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
```

A `steps(6, end)` easing shows a *choppy* animation — a completely different defect from *restarting on interruption*. The lesson only exists when the user interrupts the motion themselves, mid-flight, and one pane keeps its momentum while the other snaps back to the start. The site's own deep-dive standard (drag rules render "a real gesture prototype") already establishes the right pattern: `motion-showcase.tsx:30-31` special-cases drag rules to `DragShowcase`.

## Target

A dedicated interactive prototype for motion-12, rendered in deep dives instead of the track player (grid previews keep the existing simulated tracks). One **Toggle** button (plus clicking either pane) moves a card between the left and right end of a rail in BOTH panes simultaneously:

- **Do pane**: the card's position is driven by a CSS **transition**: `transition: transform 300ms var(--ease-in-out-strong)`. Spamming Toggle mid-flight retargets smoothly from wherever the card currently is.
- **Don't pane**: the card is driven by a WAAPI **keyframe pair with explicit endpoints** — on every toggle, cancel the running animation and `element.animate([{transform: rest}, {transform: destination}], …)` from the *rest position, not the current position*. Spamming Toggle makes it visibly teleport back and restart.
- Hint under the panes: `Click Toggle rapidly — interrupt the motion mid-flight`.
- Duration 300ms and easing `var(--ease-in-out-strong)` / its JS mirror `EASE.inOut` (`cubic-bezier(0.65, 0, 0.35, 1)` from `src/lib/showcase-engine.ts:31`) on both panes, so the ONLY variable is retargeting behavior.
- Reduced motion: the existing global rule `src/app/globals.css:539-542` (`.motion-showcase * { transition: none !important; animation-duration: 0s !important }` inside `@media (prefers-reduced-motion: reduce)`) already snaps both panes to end state — wrap the prototype in the `motion-showcase` class like the drag showcases do.

## Repo conventions to follow

- Model the new file on `src/components/features/rules/demos/drag-showcases.tsx`: a `"use client"` component that imports `PaneChrome`, `Hint` from `showcase-chrome.tsx` and reads captions from `showcaseSpecs["motion-12"]`. It renders inside `<div className="motion-showcase">`.
- Rail + card markup: copy `RaceScene` (`src/components/features/rules/demos/scenes.tsx:170-189`) — a dashed rail with `containerType: "inline-size"` and a small card. For the travel distance use the same idiom as the engine's race keyframe: `translateX(calc(100cqw - 100%))` (`src/lib/showcase-engine.ts:131-134`).
- Dispatch: `motion-showcase.tsx` currently returns `<DragShowcase/>` for `spec.trigger === "drag"`. Add a `TriggerKind` value `"interrupt"` in `showcase-specs.tsx`, set motion-12's trigger to it, and branch in `MotionShowcase`:

```tsx
if (spec.trigger === "interrupt") return <InterruptShowcase ruleId={ruleId} />;
```

- `PanePreview` (grid) plays `spec[variant].tracks` — keep motion-12's existing tracks as the simulated preview, exactly like drag rules keep theirs (see the comment at `showcase-specs.tsx:25-28`).
- Update the trigger allowlist in `src/data/__tests__/showcase-specs.test.ts:8`: `const TRIGGERS = new Set(["replay", "action", "toggle", "press", "hover", "drag", "interrupt"]);`
- Control button: reuse `ControlButton` from `showcase-chrome.tsx`.

## Steps

1. **`showcase-specs.tsx`** — add `"interrupt"` to `TriggerKind`; change motion-12's `trigger` to `"interrupt"` (keep its `tracks` for the grid preview; captions become `caption: "transition — retargets from where it is"` and `caption: "keyframes — restart from zero"`).
2. **Create `src/components/features/rules/demos/interrupt-showcase.tsx`**:

```tsx
"use client";

import { useRef, useState } from "react";

import { EASE } from "@/lib/showcase-engine";
import { ControlButton, Hint, PaneChrome } from "@/components/features/rules/demos/showcase-chrome";
import { showcaseSpecs } from "@/components/features/rules/demos/showcase-specs";

const DURATION = 300;
const REST = "translateX(0)";
const FAR = "translateX(calc(100cqw - 100%))";

/** motion-12: one toggle drives both panes; the do card transitions (and so
 *  retargets mid-flight), the don't card re-runs keyframes from rest. */
export function InterruptShowcase() {
    const spec = showcaseSpecs["motion-12"];
    const [atFar, setAtFar] = useState(false);
    const doCard = useRef<HTMLDivElement | null>(null);
    const dontCard = useRef<HTMLDivElement | null>(null);
    const dontAnim = useRef<Animation | null>(null);

    const toggle = () => {
        const next = !atFar;
        setAtFar(next);
        // Do: retarget by setting a new transform under a transition.
        const doEl = doCard.current;
        if (doEl) {
            doEl.style.transition = `transform ${DURATION}ms ${EASE.inOut}`;
            doEl.style.transform = next ? FAR : REST;
        }
        // Don't: cancel and restart keyframes from the rest position —
        // the exact failure the rule warns about.
        const dontEl = dontCard.current;
        if (dontEl) {
            dontAnim.current?.cancel();
            dontAnim.current = dontEl.animate(
                next ? [{ transform: REST }, { transform: FAR }] : [{ transform: FAR }, { transform: REST }],
                { duration: DURATION, easing: EASE.inOut, fill: "forwards" }
            );
        }
    };

    return (
        <div className="motion-showcase">
            <div className="grid grid-cols-2 gap-3">
                <PaneChrome variant="do" caption={spec.do.caption}>
                    <InterruptRail cardRef={doCard} />
                </PaneChrome>
                <PaneChrome variant="dont" caption={spec.dont.caption}>
                    <InterruptRail cardRef={dontCard} />
                </PaneChrome>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
                <ControlButton onClick={toggle}>Toggle</ControlButton>
                <Hint>Click rapidly — interrupt the motion mid-flight</Hint>
            </div>
        </div>
    );
}
```

   `InterruptRail` is the `RaceScene` markup with a `ref` on the card (copy the classNames from `scenes.tsx:170-189`, `size === "lg"` branch only — the deep dive always renders lg).
3. **`motion-showcase.tsx`** — import `InterruptShowcase`, branch before the `ShowcaseBody` return:

```tsx
if (spec.trigger === "interrupt") return <InterruptShowcase />;
```

4. **`showcase-specs.test.ts`** — extend `TRIGGERS` with `"interrupt"`.

## Boundaries

- Do NOT change the engine (`showcase-engine.ts`) — the don't pane intentionally uses raw `element.animate`.
- Do NOT change any other rule's spec or the drag showcases.
- Do NOT remove motion-12's `tracks`/grid preview.
- No new dependencies.
- If `motion-showcase.tsx` no longer has the `trigger === "drag"` branch shape shown above, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck && npm run lint && npm test`.
- **Feel check**: `/rules/motion-12`, click Toggle rapidly (4-5 clicks in ~1s):
  - Do card glides back and forth, changing direction from wherever it is — never jumps.
  - Don't card visibly teleports to an endpoint and restarts on each click.
  - Let both settle: they end in the same place (parity when uninterrupted).
  - DevTools Rendering → `prefers-reduced-motion: reduce`: both cards jump instantly, no motion.
- **Done when**: interrupting mid-flight produces obviously different behavior between panes, and single un-interrupted toggles look identical on both.
