# 001 — Drive the motion-2 showcase with a real keystroke

- **Status**: TODO
- **Commit**: c885413
- **Severity**: HIGH
- **Category**: Purpose & frequency / experience honesty
- **Estimated scope**: 2 files (~60 lines): `src/components/features/rules/demos/showcase-specs.tsx`, `src/components/features/rules/demos/motion-showcase.tsx`

## Problem

The rule **motion-2 "Keyboard Actions Stay Instant"** is about the feel of a keystroke — yet its showcase is driven by a *mouse click* on a button labeled "Press ⌘K". Pressing the actual keyboard does nothing (verified in a browser: ⌘K only focuses the site search, which owns that shortcut globally in `src/components/providers/search-provider.tsx:88-111`).

The lesson ("animation on a keyboard action delays the result you just asked for") can only be *felt* when the delay lands on your own keystroke. A click on a "Press ⌘K" button is a simulation of a simulation.

Current spec, `src/components/features/rules/demos/showcase-specs.tsx:91-104`:

```tsx
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
```

The trigger dispatch lives in `src/components/features/rules/demos/motion-showcase.tsx` (`ShowcaseBody`), which currently has no `window` keydown listener of any kind.

## Target

While a motion-2 deep dive is mounted, pressing the **`k` key** (no modifier — ⌘K and `/` are reserved by the global search shortcut and MUST NOT be intercepted) toggles both palettes exactly as the control button does. The do pane opens the same frame as the keystroke; the don't pane visibly lags 240ms behind your own finger.

- Keystroke: plain `k` / `K`, ignored while the user is typing in an input/textarea/contenteditable, ignored when any modifier (meta/ctrl/alt) is held.
- Each `k` press replays the open (same as clicking the button; the engine's `playPane` already makes replays deterministic).
- The control button stays (mouse/touch users), relabeled `Press K`.
- The pane captions stay as they are.
- Hint line under the panes: `Or press K on your keyboard — feel the don't pane lag behind your keystroke` (render it next to the control button the same way other hints render, using the existing `Hint` component from `src/components/features/rules/demos/showcase-chrome.tsx`).

## Repo conventions to follow

- Specs are data in `showcaseSpecs`; behavior lives in `motion-showcase.tsx`. Add an optional field to `ShowcaseSpec` (in `showcase-specs.tsx`) rather than hard-coding `ruleId === "motion-2"` in the component:

```tsx
export type ShowcaseSpec = {
    trigger: TriggerKind;
    control?: string;
    /** Plain key (no modifiers) that fires the action trigger while the deep
     *  dive is mounted, e.g. "k". Never a combo — ⌘K and "/" belong to search. */
    hotkey?: string;
    ...
```

- Effect cleanup style: see the existing `useEffect` at `motion-showcase.tsx:95-102` (cancel pane animations on spec change) — add a sibling effect, remove the listener on unmount.
- The typing-guard idiom already exists in this repo at `src/components/providers/search-provider.tsx:98-101` — copy it:

```tsx
const target = event.target instanceof Element ? event.target : null;
const isTyping = target?.closest("input, textarea, [contenteditable]");
```

- The tests in `src/data/__tests__/showcase-specs.test.ts` iterate spec fields; adding an optional field breaks nothing, but run them.

## Steps

1. **`showcase-specs.tsx`** — add the optional `hotkey?: string` field to `ShowcaseSpec` (with the doc comment above), then set on motion-2: `control: "Press K"`, `hotkey: "k"`.
2. **`motion-showcase.tsx`** — in `ShowcaseBody`, add an effect gated on `spec.hotkey`:

```tsx
// Real keystroke for keyboard-lesson rules (motion-2): a plain key press
// fires the same enter() as the control button. Modifier combos are never
// claimed — ⌘K and "/" belong to the global search shortcut.
useEffect(() => {
    const hotkey = spec.hotkey;
    if (!hotkey) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
        if (event.metaKey || event.ctrlKey || event.altKey) return;
        if (event.key.toLowerCase() !== hotkey) return;
        const target = event.target instanceof Element ? event.target : null;
        if (target?.closest("input, textarea, [contenteditable]")) return;
        event.preventDefault();
        enter();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
}, [spec.hotkey, enter]);
```

3. **`motion-showcase.tsx`** — in the controls row, when `spec.hotkey` is set, render after the control button:

```tsx
{spec.hotkey ? (
    <Hint>Or press {spec.hotkey.toUpperCase()} — feel the don&apos;t pane lag behind your keystroke</Hint>
) : null}
```

## Boundaries

- Do NOT bind ⌘K, Ctrl+K, or `/` — those are the site search's (`search-provider.tsx`). Do not modify `search-provider.tsx`.
- Do NOT add the hotkey to `PanePreview` (grid cards) — deep-dive only.
- Do NOT touch any other rule's spec.
- No new dependencies.
- If `ShowcaseBody`'s structure has drifted from the excerpts above, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck && npm run lint && npm test` — all pass (showcase-specs tests included).
- **Feel check**: `npm run dev`, open `/rules/motion-2`:
  - Press `K` → both palettes open; the left one appears on the keystroke, the right one arrives noticeably late.
  - Press `K` repeatedly fast → replays cleanly, no stuck states.
  - Click into the search field, type "k" → the demo does NOT fire.
  - Press ⌘K → search focuses (unchanged), demo does not fire.
  - Toggle reduced motion (DevTools → Rendering) → `K` still swaps panes to end states instantly.
- **Done when**: a `K` keypress on `/rules/motion-2` visibly demonstrates the lag on the don't pane and all mechanical checks pass.
