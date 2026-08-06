# 011 — Give demos a legible timebase: segmented speed control + retimed load demos

- **Status**: TODO
- **Commit**: c885413 (working tree includes executed plans 001-007)
- **Severity**: HIGH
- **Category**: Round 2 — pacing ("it's too fast")
- **Estimated scope**: 2 files: `src/components/features/rules/demos/motion-showcase.tsx`, `src/components/features/rules/demos/load-showcase.tsx`

## Problem

Every lesson on the site lives inside 140ms-1.2s of motion that plays once and vanishes. Verified in a browser: click "Race + block main thread" on `/rules/motion-21` and by the time your eye travels from the button to the stage, both cards are parked at the finish — the three freezes already happened. The demos are *honest* now (real stalls, real intervals) but **evanescent**: correct physics at a speed nobody can study.

Specifics:

1. **The speed control is an afterthought.** One small `0.25×` toggle (`motion-showcase.tsx`, the `aria-pressed={slow}` button rendering `0.25×`) — a binary jump from full speed to quarter speed, easy to miss, and it doesn't read as "this is how you study motion" even though rule motion-25 says slow review IS the method.
2. **motion-21 is over in 1.2 seconds.** `load-showcase.tsx` (`BlockedThreadRace`): `const duration = 1200;` with three `stall(120)` calls at `200/470/740ms`. A 120ms freeze inside a 1.2s race is a blink — ~10% of the run per stall.
3. **motion-22's chunkiness is too subtle.** `IntervalRace`: `const duration = 600;` with a 45ms `setInterval` — 13 updates in 600ms reads as "slightly imperfect", not "this is what setInterval does".

Demonstrations are *explanatory* motion — per the site's own motion-6 deep dive, the sub-300ms budget applies to UI reactions, not to teaching material. These demos should run at whatever speed makes the lesson land.

## Target

### 1. Segmented speed control (replaces the lone 0.25× toggle)

In `ShowcaseBody` (`motion-showcase.tsx`), replace the boolean `slow` state with a rate state, and the single toggle with a three-segment control:

```tsx
const RATES = [1, 0.5, 0.25] as const;
type Rate = (typeof RATES)[number];
const [rate, setRate] = useState<Rate>(1);
```

Delete `SLOW_RATE` and the `const rate = slow ? SLOW_RATE : 1;` line — `rate` is now state. Control markup (replaces the current `0.25×` button; same spot in the controls row):

```tsx
<div role="group" aria-label="Playback speed" className="flex overflow-hidden rounded-md border border-neutral-300 dark:border-neutral-700">
    {RATES.map((r) => (
        <button
            key={r}
            type="button"
            aria-pressed={rate === r}
            onClick={() => setRate(r)}
            className={cn(
                "px-2.5 py-1.5 text-xs font-medium tabular-nums transition-colors",
                rate === r
                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            )}
        >
            {r === 1 ? "1×" : r === 0.5 ? "½×" : "¼×"}
        </button>
    ))}
</div>
```

(If plan 009 has landed, build the segments from its `Button size="sm"` with `className` overrides for the joined-group borders; if not, use the raw markup above.)

Everything already flows through `rate` (`playPane` options, `runBar` playbackRate, the settle-hold division) — the state change is the whole job. Keep the reduced-motion behavior untouched.

### 2. Retime motion-21 (BlockedThreadRace)

In `load-showcase.tsx`:

```tsx
const duration = 2600;                                    // was 1200
// Three ~240ms stalls, evenly spaced through the race:
timers.current.push(setTimeout(() => stall(240), 300));   // was stall(120), 200
timers.current.push(setTimeout(() => stall(240), 1150));  // was stall(120), 470
timers.current.push(setTimeout(() => stall(240), 2000));  // was stall(120), 740
```

~720ms of the 2600ms race frozen (~28%) — each freeze is unmissable, and the do card's serene glide past a locked sibling becomes the image the rule wants burned in. Update the reset schedule (`duration + 800` still correct — it's derived) and the hint copy: `Watch the right card — it freezes three times while the left one keeps moving`.

### 3. Retime motion-22 (IntervalRace)

```tsx
const duration = 1400;   // was 600
// interval: 80ms ticks   (was 45) → ~17 visible jumps
intervalId.current = setInterval(() => { … }, 80);
```

Update the hint: `Left glides; right jumps ~17 times — that's setInterval` and the motion-22 captions in `showcase-specs.tsx` if they name the old numbers (current dont caption says `setInterval every 45ms — visible steps` → `setInterval every 80ms — visible steps`).

### 4. Load demos are exempt from the speed control — say so

The stalls and intervals are real wall-clock physics; scaling them by a playback rate would fake the very thing plan 003 made honest. `LoadShowcase` renders its own controls (it doesn't have the segmented control) — keep it that way, and no work is needed beyond NOT threading `rate` into it.

## Repo conventions to follow

- The controls row layout: `motion-showcase.tsx`, the `div.mt-3.flex.flex-wrap.items-center.gap-2` — the segmented group replaces the old toggle in the same flex row.
- `tabular-nums` for numeric labels (used in the codebase for numeric chips).
- Hints via the `Hint` component from `showcase-chrome.tsx`.

## Steps

1. `motion-showcase.tsx` — swap `slow`/`SLOW_RATE` for the `rate` state + `RATES` constant; update every `rate` derivation site (they already reference a `rate` variable — only its source changes); replace the toggle button with the segmented group.
2. `load-showcase.tsx` — apply the motion-21 numbers (Target §2) and motion-22 numbers (Target §3).
3. `showcase-specs.tsx` — fix the motion-22 dont caption's `45ms` → `80ms`. Check motion-21 captions for stale numbers too.
4. Sweep hints for stale copy (`grep -n "freezes three times\|~13 times\|45ms" src/components/features/rules/demos`).

## Boundaries

- Do NOT scale the stall/interval durations by playback rate (Target §4).
- Do NOT touch grid previews (`PanePreview`), drag physics, or the interrupt/tooltip showcases.
- Do NOT change engine semantics (`playPane`/`tracksDurationMs`).
- If plan 012's instrumentation has already landed in `load-showcase.tsx`, keep its sampling code intact — only the duration/stall/tick numbers change.

## Verification

- **Mechanical**: `npm run typecheck && npm run lint && npm test`.
- **Feel check**: `npm run dev`:
  - `/rules/motion-21`: the right card's three freezes are individually countable from across the room; the left card never hitches.
  - `/rules/motion-22`: the right card visibly *steps*; the left card glides.
  - `/rules/motion-4`: ½× is a comfortable "study speed"; ¼× is frame-by-frame; the segmented control reads as a feature, not a debug flag.
  - Speed choice survives replays (state persists until the rule changes).
  - Reduced motion: segments render but plays still jump to end states.
- **Done when**: someone seeing motion-21 for the first time can say "it froze three times" without being told, and the speed control looks like part of the pedagogy.
