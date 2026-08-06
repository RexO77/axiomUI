# 012 — Leave evidence: main-thread seismograph, live ms readouts, motion-1 wait tally

- **Status**: TODO
- **Commit**: c885413 (working tree includes executed plans 001-007; token migration may be in flight)
- **Severity**: HIGH
- **Category**: Round 2 — comprehension ("it's too fast" / nothing to study afterwards)
- **Estimated scope**: 4 files: new `src/components/features/rules/demos/thread-meter.tsx`, `src/components/features/rules/demos/load-showcase.tsx`, `src/components/features/rules/demos/motion-showcase.tsx`, `src/components/features/rules/demos/showcase-specs.tsx`
- **Depends on**: plan 011 (retimed durations; both edit `load-showcase.tsx` — land 011 first)

## Problem

Even at plan 011's slower pacing, a demo that leaves nothing behind forces the user to catch the lesson live or replay forever. Three places need a persistent artifact:

1. **motion-21/22 (load demos)**: after a run, both cards sit at the finish and the stalls/steps are gone. There is no record that the main thread froze, for how long, or when. (`load-showcase.tsx` — `BlockedThreadRace` / `IntervalRace`.)
2. **Track-player demos**: the timing bar fills and stops; nothing states the actual elapsed duration. The captions promise "220ms" but the demo never proves it. (`motion-showcase.tsx`, `runBar`/`ShowcaseBody`.)
3. **motion-1 "Animate by Frequency"**: the lesson is *cumulative* — a 220ms palette is fine once and infuriating the 40th time — but the demo plays once per click with no memory. Frequency is literally the one thing the current demo cannot convey. (`showcase-specs.tsx` motion-1; UI in `ShowcaseBody`.)

## Target

### 1. `ThreadMeter` — a seismograph strip for the load demos

New component `src/components/features/rules/demos/thread-meter.tsx`. One instance renders under the shared controls of `BlockedThreadRace` and `IntervalRace` (motion-21 gets it mandatory; motion-22 optional — include it, the interval demo also stutters the *don't card* not the thread, so label it accordingly, see below).

Mechanics (motion-21):

- While a race runs, sample the main thread with the SAME rAF loop that drives the don't card (no second loop): on each tick compute `gap = now - lastTick`. Append `{ atMs: now - start, gapMs: gap }` to a ref array.
- On race end (p >= 1), render the record as an absolutely-positioned strip: a horizontal track (`h-1.5 w-full rounded-full bg-surface-muted` — pre-token equivalent `bg-neutral-100 dark:bg-neutral-900`) with one rose segment per sample whose `gapMs > 40`:
  - segment `left = (atMs - gapMs) / duration * 100%`, `width = gapMs / duration * 100%`
  - segment classes: `absolute inset-y-0 rounded-full bg-rose-500/80`
- Under the strip, a persistent line in `Hint` styling with `tabular-nums`:
  `main thread — longest stall 243ms · frozen 704ms of 2600ms` (values computed from the samples: max gap, sum of gaps > 40ms, total duration).
- The record persists until the next run starts (clear on `race()` entry, not on reset).
- Reduced motion: no run happens beyond the end-state jump, so render the strip only when samples exist.

For motion-22 the strip measures the same rAF gaps (which stay ~16ms — the thread is healthy) — that's the point: label it `main thread — healthy · the steps come from setInterval, not load`. Compute: if no gap exceeds 40ms, show that healthy line instead of stall stats.

API sketch:

```tsx
export type ThreadSample = { atMs: number; gapMs: number };

export function ThreadMeter({ samples, durationMs }: { samples: ThreadSample[]; durationMs: number }) { … }
```

`load-showcase.tsx` owns the sampling (a `useRef<ThreadSample[]>([])` + a `useState` bump when the run finishes so React re-renders the meter once — never per frame).

### 2. Live/final ms readout on the track-player timing bars

In `ShowcaseBody` (`motion-showcase.tsx`): next to each pane's timing bar, a small `tabular-nums` label showing elapsed time counting up during playback and freezing at the final value until settle-back clears it.

- Implementation without per-frame React state: a `ref`'d `<span>` whose `textContent` is written from a rAF loop that reads the bar animation's `currentTime` (the `Animation` object `runBar` creates — return it from `runBar`). Loop ends when the animation finishes; write the final `Math.round(tracksDurationMs(pane.tracks))` + "ms".
- Label styling: `text-[10px] tabular-nums text-ink-muted` (pre-token: `text-neutral-500 dark:text-neutral-400`), sitting right of the bar — wrap bar + label in a flex row (`flex items-center gap-1.5`; bar container gets `flex-1`).
- At 0.25×/0.5× (plan 011) the count runs slower — correct, it reads the animation clock, and this is itself a nice touch: the readout counts wall-lesson time. Show the pane's *nominal* duration, i.e. multiply `currentTime` by the playbackRate… **No** — simplest honest display: show `animation.currentTime` (which WAAPI reports in animation-local time, already rate-independent). Verify in the feel check: at ¼× the counter must end at the same number as at 1× (e.g. 220ms), just counting slower.
- `clearBars()` also resets the labels to the pane's nominal duration in grey (so at rest each pane quietly states its duration — e.g. `220ms` — which doubles as a spec label).
- Reduced motion: labels always show the nominal duration statically.

### 3. motion-1 wait tally

- `showcase-specs.tsx` — add an optional field to `ShowcaseSpec`:

```tsx
/** Frequency-lesson rules: per-play wait (ms) accumulated on the don't pane
 *  across replays, rendered as a running tally. */
tallyDontMs?: number;
```

  Set `tallyDontMs: 220` on motion-1. Change motion-1's control label from `Open` to `Open again` after the first play (see below) — the copy invites hammering.
- `ShowcaseBody` — when `spec.tallyDontMs` is set: `const [plays, setPlays] = useState(0)` (reset when the spec changes, in the existing `prevSpec` render-time block); `enter()` increments. Under the don't pane's caption render:

```tsx
<p className="mt-0.5 text-[11px] tabular-nums text-rose-600 dark:text-rose-300">
    opened ×{plays} — {(plays * spec.tallyDontMs / 1000).toFixed(1)}s spent waiting
</p>
```

  (Render only when `plays > 0`.) Control label: `{plays > 0 ? "Open again" : spec.control}`.
- The tally must survive settle-back (it's memory, not motion) and reset on rule change.

## Repo conventions to follow

- No per-frame React state anywhere — imperative `ref` writes inside rAF, matching the drag showcases' pattern (`drag-showcases.tsx` comment: "State applied imperatively via refs inside rAF").
- Numeric text: `tabular-nums` (keeps counters from jittering).
- If the token migration (plans 008/010) has landed in these files, use the semantic utilities (`text-ink-muted`, `bg-surface-muted`, `border-line`); if not, use the `neutral-*` + `dark:` equivalents noted inline above and let plan 010 sweep them.
- Timers/rAF ids in refs, cleaned on unmount — match `load-showcase.tsx`'s existing `useEffect` cleanup.

## Steps

1. Create `thread-meter.tsx` per Target §1.
2. `load-showcase.tsx` — add gap sampling to `BlockedThreadRace`'s existing `tick` loop and a sampling loop to `IntervalRace` (it needs its own rAF sampler — its don't card is driven by `setInterval`, so add a lightweight rAF loop that ONLY samples gaps; it will show a healthy thread). Wire `<ThreadMeter …/>` under each demo's controls row. Clear samples at run start; bump a `finished` state at run end to render.
3. `motion-showcase.tsx` — return the `Animation` from `runBar`; add the label spans + rAF counter per Target §2; wire `clearBars` to reset labels to nominal.
4. `showcase-specs.tsx` — add `tallyDontMs` to the type; set it on motion-1.
5. `motion-showcase.tsx` — implement the tally UI + `plays` state per Target §3.

## Boundaries

- ThreadMeter renders only in the two load demos — do not add it to track-player rules.
- The tally applies only to motion-1 (via the spec field — no `ruleId === "motion-1"` conditionals in components).
- Do NOT change any durations/stall values (plan 011 owns those numbers).
- Do NOT introduce per-frame `setState`.
- If `runBar`'s shape has drifted (plans 005/007 reworked it), adapt the same additions to the current shape; if it's gone entirely, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck && npm run lint && npm test`.
- **Feel check**:
  - `/rules/motion-21`: run the race → after it ends, the strip shows three rose blocks roughly evenly spaced, and the summary reads plausible numbers (longest stall ≈ 240-280ms). The strip stays while you study it; the next run replaces it.
  - `/rules/motion-22`: strip shows healthy (no rose), with the "steps come from setInterval" line.
  - `/rules/motion-7` (any track rule): counters count up during play and end at the caption's promised numbers (do: 220ms, dont: 360ms); at ¼× they count slower but end at the same values; after settle-back they rest at the nominal durations.
  - `/rules/motion-1`: click Open five times fast → don't pane reads `opened ×5 — 1.1s spent waiting` and the button says "Open again". Navigate to another rule and back → tally reset.
  - Reduced motion: no counters animate; strip absent (or from a reduced run, absent); tally still counts clicks (clicks are input, not motion).
- **Done when**: every load run leaves a studyable record, every timed demo proves its numbers, and motion-1's don't pane makes frequency *felt* as accumulated seconds.
