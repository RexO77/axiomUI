# 014 — The showcase craft specification: every motion rule, fully detailed

- **Status**: DONE (implemented 2026-08-06 — see the checklist at the end of this file)
- **Commit**: c885413 (+ executed plans 001-007 in tree; token migration in flight)
- **Severity**: HIGH — this is the canonical reference for round 2
- **Precedence**: where this document conflicts with plans 011/012/013, **this document wins**. 011-013 build the capabilities (speed control, instrumentation components, scene system); this spec decides what every individual rule shows, says, and measures.

The bar: each showcase is a **teaching instrument**, not a wireframe with motion attached. A visitor should be able to (a) predict what will move before it moves, (b) watch it at a speed they control, (c) read the evidence afterwards, and (d) quote the exact numbers. Nothing in this spec is optional; "roughly like this" is not a valid reading.

---

## Part I — Global craft standards

### 1. Stage anatomy (every pane)

```
┌ PaneChrome ───────────────────────────┐
│ ✓ Do                                  │  header: unchanged (emerald/rose)
│ ┌───────────────────────────────────┐ │
│ │  scene, min-h-28 (112px), p-2.5   │ │  stage: bg-surface, border-line,
│ │                                   │ │  rounded-lg — NO internal dead space;
│ └───────────────────────────────────┘ │  scenes fill or top-align
│ ▓▓▓▓▓▓▓░░░░░░░░░░░  220ms            │  bar: h-1 rounded-full + ms readout
│ caption — text-xs text-ink-muted      │  (tabular-nums, counts live, rests at
└───────────────────────────────────────┘   nominal duration)
```

- Timing bar fills with the pane's own easing (already landed, plan 005).
- The ms readout is plan 012's counter; at rest it displays the pane's nominal duration — every pane silently states its number.

### 2. The protagonist rule

The element that moves carries `--color-accent`; everything static is neutral. Exact treatment:

- Panels/cards/toasts/menus that move: `border-accent` (full strength), surface stays `bg-surface-raised`; inner detail lines `bg-accent/40`.
- Small solid movers (slider knob, easing dot, heart, icons mid-swap): solid `bg-accent` / `text-accent`.
- Never color by verdict — both panes' protagonists are accent; Do/Don't lives in the chrome only.
- Scrims stay `bg-neutral-900/40`; rails stay dashed `border-line`.

### 3. Copy voice (captions, hints, controls)

- **Captions** state treatment + felt consequence, in that order, joined by an em dash: `220ms · ease-out — arrives the moment you ask`. Sentence case, no trailing period, numbers in `tabular-nums`.
- **Hints** are imperative and name what to watch: `Open it a few times — feel the palette's delay compound`. One clause of instruction, one of payoff.
- **Controls** are verbs: `Open`, `Show toast`, `Race + block main thread`. Frequency rules switch to `Open again` after the first play.
- Never both a caption and a graph stating the same value — the artifact self-describes (bezier string lives ON the graph), the caption carries the verdict.

### 4. Instrumentation matrix

| Trigger type | Instrument |
| --- | --- |
| replay / action | live ms counter per pane (rests at nominal) |
| frequency rules (motion-1) | cumulative tally on the don't pane |
| load rules (motion-21/22) | ThreadMeter seismograph + stall summary |
| drag rules (motion-18/19/20) | live gesture readout chip (velocity / damped offset / capture state) |
| stagger rules (motion-24/26) | "last element lands at Nms" readout |

### 5. Pacing

- UI-honest rules keep real durations — the duration IS the lesson; study happens via the 1×/½×/¼× segmented control (plan 011).
- Explanatory rules (motion-21/22) use stretched timebases (2600ms / 1400ms; plan 011) and are exempt from the speed control.
- Settle-back after 900ms hold (landed, plan 007) — artifacts (counters, tallies, meters) survive settle; only motion resets.

### 6. Accessibility invariants

- Reduced motion: engine plays at duration 0 (landed); artifacts render statically; tallies still count (clicks are input, not motion).
- All gesture surfaces keep keyboard equivalents (landed) and `touch-action: pan-y`.
- Accent on dark must pass 3:1 against `bg-surface-raised` — accent `#2563eb` fails on dark; use `#3b82f6` (blue-500) for dark-mode accent: define once in `globals.css` `.dark { --color-accent: #3b82f6; }` (this is a token fix, sanctioned).

---

## Part II — Per-rule specifications

Format per rule: **Scene** (what each pane depicts, rest state) · **Motion** (exact values) · **Copy** (exact strings: do caption / don't caption / control / hint) · **Detail** (the craft touches that make it feel designed).

### motion-1 · Animate by Frequency — `action`

- **Scene** do: ModalScene — "Delete file?" title, one body line, Cancel/Delete buttons; scrim + panel hidden at rest. don't: PaletteScene — input with `Search commands…` + `⌘K` chip, two result rows, hidden at rest.
- **Motion**: both enter 220ms `ease-out-strong`; do = scrim fade + panel riseIn(8), don't = panel riseIn(8).
- **Copy**: do `rare modal · 220ms — earns its motion` · don't `frequent palette · 220ms — a tax you pay every time` · control `Open` → `Open again` · hint `Open it a few times — feel the palette's delay compound`.
- **Detail**: don't pane tally (plan 012): `opened ×4 — 0.9s spent waiting` in rose, `tabular-nums`, survives settle-back, resets on rule change.

### motion-2 · Keyboard Actions Stay Instant — `action` + hotkey `k`

- **Scene**: PaletteScene both panes (as motion-1's don't). Each pane's input row includes the `⌘K` kbd chip with `data-anim="key"`.
- **Motion**: do = fadeIn 0ms. don't = riseIn(8) 240ms. Plus both panes: `key` track scaleTo(1, 0.94) 90ms + back — the kbd chip visibly depresses on every trigger, tying keystroke to response.
- **Copy**: do `0ms — the result is the feedback` · don't `240ms — your keystroke waits for a cartoon` · control `Press K` · hint `Press K on your keyboard — the right pane lags your finger`.
- **Detail**: hotkey `k` (landed, plan 001). The don't counter ending at 240ms while do rests at 0ms is the receipt.

### motion-3 · Purpose Before Motion — `action`

- **Scene** do: EdgePanelScene (side panel parked off right edge; panel gets real content at lg: "Details" title + two lines). don't: ModalScene (motion-1's) with the decorative bounce.
- **Motion**: do slideXIn("110%") 220ms `ease-out-strong`. don't scrim fade 220ms + panel keyframes `scale 0.5 → 1.15 (offset 0.6) → 1` 360ms.
- **Copy**: do `slides from its edge — motion explains where it lives` · don't `bounce — motion explains nothing` · control `Open` · hint `Both open something. Only one tells you where it came from`.

### motion-4 · Use Strong Custom Easing — `replay`

- **Scene** both: the **easing instrument** — rail (accent-border card) directly above the EasingGraph, same horizontal span, `gap-2`, top-aligned, zero dead space. Graph: 2px `stroke-ink` curve, `fill-accent/10` area, 8px accent dot with surface ring, bezier string printed top-left inside graph (`font-mono text-[9px] text-ink-muted`), `time →` bottom-right.
- **Motion**: both race 360ms; do easing `cubic-bezier(0.23, 1, 0.32, 1)`, don't `cubic-bezier(0.55, 0, 1, 0.45)`. Dot tracks: dot-x linear / dot-y pane easing (landed, plan 005).
- **Copy**: do `starts fast, lands soft` · don't `starts sluggish, lands abrupt` · control `Play both` · hint `Play, then switch to ¼× — watch each dot hug its curve`.

### motion-5 · Never Use Ease-In for UI — `replay`

- Same instrument as motion-4 at **220ms**; do `EASE.out`, don't `EASE.in`.
- **Copy**: do `ease-out — responds the instant you ask` · don't `ease-in — dead for the first 100ms` · control `Play both` · hint `Watch the first 100ms — that's where trust is won or lost`.

### motion-6 · Keep UI Motion Under 300ms — `action`

- **Scene** both: MenuScene (real items: Rename / Duplicate / Share…), accent panel border.
- **Motion**: popIn(0.95) — do 180ms, don't 500ms, both `ease-out-strong`.
- **Copy**: do `dropdown · 180ms` · don't `popover · 500ms — reads as loading, not response` · control `Open` · hint `The counters don't lie — 500ms is a wait, not a transition`.
- **Detail**: ms counters are the proof; don't pane's counter grinding to 500 is the lesson.

### motion-7 · Asymmetric Enter and Exit — `toggle`

- **Scene** both: ToastScene — CheckCircle2 (emerald) + "Saved", accent border, parked below frame.
- **Motion**: do enter slideYIn("150%") 220ms `ease-out-strong`, exit slideYOut 160ms `ease-in-out-strong`. don't 360ms both directions.
- **Copy**: do `in 220ms · out 160ms — exits get out of the way` · don't `360ms both ways — the goodbye takes as long as the hello` · control `Show / dismiss` · hint `Dismiss is the moment you've already moved on — it should be the fastest thing here`.

### motion-8 · Press Feedback — `press`

- **Scene** both: ButtonScene "Save" (primary MiniButton), centered.
- **Motion**: hold scaleTo(1→0.96) do / (1→0.90) don't, 140ms `ease-out-strong`; release reverses.
- **Copy**: do `active: scale(0.96) — a nod, not a flinch` · don't `scale(0.90) — the button cowers` · hint `Press and hold either side — 6% is acknowledgment, 10% is drama`.
- **Detail**: on touch, `tapLight()` haptic on press of the do pane only (dogfoods "feedback confirms").

### motion-9 · Never Scale From Zero — `action`

- **Scene** both: MenuScene (motion-6's), origin top-left.
- **Motion**: 220ms `ease-out-strong`; do popIn(0.95), don't popIn(0).
- **Copy**: do `scale(0.95) + fade — it arrives` · don't `scale(0) — it materializes from a point` · control `Open menu` · hint `Real objects don't grow from nothing — run it at ¼×`.

### motion-10 · Origin-Aware Popovers — `action`

- **Scene** both: MenuScene with the trigger button visible; do origin `top left`, don't `center`. Add `data-anim="origin-dot"`: a 4px accent dot at the pane's transform-origin point.
- **Motion**: popIn(0.6) 220ms (0.6 exaggerated deliberately so origin is legible). `origin-dot` track: fadeIn 90ms, fade out via settle.
- **Copy**: do `grows from its trigger — cause meets effect` · don't `grows from center — detached from its button` · control `Open menu` · hint `The dot marks the origin — only one of them starts where you clicked`.

### motion-11 · Subsequent Tooltips Are Instant — `toolbar` (interactive prototype, landed)

- **Scene**: 3-button toolbar per pane — Cut / Copy / Paste (real labels), tooltips `Cut ⌘X` / `Copy ⌘C` / `Paste ⌘V`.
- **Motion**: first tooltip 300ms delay then 100ms fade; subsequent 0ms delay, 100ms fade; 300ms grace after leaving. don't: every tooltip 300ms delay.
- **Copy**: do `one wait, then instant — the toolbar feels learned` · don't `300ms every time — the toolbar never trusts you` · hint `Sweep across the three buttons — the left pane only makes you wait once`.
- **Detail**: hovered button gets `bg-surface-muted`; tooltip carries a 2px accent left-edge. Touch: tapping a third acts as hover.

### motion-12 · Transitions for Interruptible UI — `interrupt` (landed)

- **Motion**: 300ms `ease-in-out-strong` both; do CSS transition (retargets), don't WAAPI restart from endpoint.
- **Copy**: do `transition — turns from where it is` · don't `keyframes — teleports back and starts over` · control `Toggle` · hint `Click fast. Interruption is the test — momentum should survive it`.
- **Detail**: panes are also click targets (whole surface toggles); accent card per §2.

### motion-13 · Use Starting Styles for Entry — `action`

- **Scene** both: ListScene lg = icon + word rows (Inbox / Drafts / Archive), hidden at rest.
- **Motion**: do riseIn(6) 220ms stagger 40ms. don't fadeIn 0ms (snap).
- **Copy**: do `enters from a declared first frame` · don't `mounted, then flipped — there was no first frame` · control `Add items` · hint `The left list was born mid-motion; the right just appeared`.

### motion-14 · Animate Transform and Opacity — `replay`

- **Scene** do: ToastScene rise. don't: GrowBoxScene (bar growing by height).
- **Motion**: do slideYIn("150%") 220ms; don't growHeight(2→28) 220ms.
- **Copy**: do `translateY + opacity — compositor only` · don't `height — layout math on every frame` · control `Play both` · hint `They look similar here — under real load, only the left stays smooth (see rule 21)`.
- **Detail**: cross-link chip to motion-21 in the hint (plain text is fine; a link if the rule page supports it).

### motion-15 · Use Percentage Transforms — `action`

- **Scene** both panes render **two** toasts of different sizes (one wide/short, one narrow/tall) sharing `data-anim="panel"`.
- **Motion**: do slideYIn("150%") 220ms — both sizes land perfectly. don't slideYIn("240px") 220ms — the short one overshoots its slot, the tall one barely clears the frame edge.
- **Copy**: do `translateY(150%) — measured against itself` · don't `240px — right for one size, wrong for every other` · control `Show toasts` · hint `Percentages scale with the element; pixels bet on one layout`.

### motion-16 · Gate Hover Motion — `hover` (self-exempting, landed)

- **Motion**: scaleTo(1→1.06) 140ms; do requires hover capability; touch tap animates only the don't.
- **Copy**: do `@media (hover: hover) — only where hover is real` · don't `scales on tap — a phantom hover` · hint (pointer) `Hover the panes — both react together` / (touch) `Tap — only the don't pane moves; the do pane is obeying this rule`.

### motion-17 · Reduced Motion Still Has Intent — `replay`

- **Scene** both: ToastScene.
- **Motion**: do opacity-only fade 220ms (zero translation). don't slideYIn("150%") 220ms.
- **Copy**: do `fade in place — the signal without the sweep` · don't `slides regardless — motion the user asked you to remove` · control `Play both` · hint `Reduced motion isn't no feedback — it's feedback without movement`.
- **Detail**: when the visitor's own `prefers-reduced-motion` is on, existing hint appears; add `— this page is honoring it now` to that string.

### motion-18 · Gesture Dismissal Uses Velocity — `drag` (springs landed)

- **Scene**: DragCard with grip dots (plan 007) + accent border; rail shows a **dashed threshold tick** at 60% travel (`absolute` 1px dashed `border-line-strong` vertical line).
- **Motion**: dismiss when `velocity > 0.5 px/ms` OR `x > 60%`; dismiss duration `clamp(remaining/velocity, 120, 260)ms`; snap-back spring `springLinear(0.15)` 350ms (landed, plan 004).
- **Copy**: do `flick or distance — intent counts` · don't `distance only — your flick is ignored` · hint `Flick short and fast: the left card reads intent, the right demands mileage`.
- **Detail**: live gesture chip above the hint while dragging (`ref`-written, rAF): `v 1.8 px/ms · x 42%`, `font-mono text-[10px] text-ink-muted`; freezes at release values for 1.5s (evidence). Haptics per plan 007.

### motion-19 · Damp Drag Boundaries — `drag`

- **Scene**: DragCard + accent; rail edge marked with a solid 2px `border-line-strong` right cap (the "wall").
- **Motion**: damping `overshoot / 3` past the limit (existing); release: do `springLinear(0.2)` 450ms, don't flat 220ms (landed).
- **Copy**: do `resists past the edge — overshoot ÷ 3, then a springy return` · don't `dead stop at the wall` · hint `Drag past the edge and let go — one card is physical, one is a clamp`.
- **Detail**: live chip: `pointer +128px → card +43px` while past the boundary (do pane math made visible).

### motion-20 · Capture Pointer During Drag — `drag`

- **Scene**: slider per pane; knob = solid accent circle; track neutral.
- **Motion**: existing (capture vs frozen-outside-bounds emulation).
- **Copy**: do `setPointerCapture — the drag survives leaving the frame` · don't `no capture — the knob is abandoned at the border` · hint `Drag a knob, then swing your pointer outside the panes mid-drag`.
- **Detail**: chip per pane: `capture ON` / `capture OFF`; the don't chip flips to `pointer lost` (rose) the moment the pointer exits the surface, back when it re-enters.

### motion-21 · Use CSS Under Load — `load` (retimed by 011, instrumented by 012)

- **Motion**: 2600ms linear race; stalls 3×240ms at +300/+1150/+2000.
- **Copy**: do `WAAPI transform — sails through every stall` · don't `rAF + style writes — hostage to the thread` · control `Race + block main thread` · hint `Watch the right card — it freezes three times. The strip below is the receipt`.
- **Detail**: ThreadMeter with rose stall blocks + `main thread — longest stall 243ms · frozen 704ms of 2600ms`.

### motion-22 · Use WAAPI for Programmatic Motion — `load`

- **Motion**: 1400ms; don't = real `setInterval` 80ms (~17 jumps).
- **Copy**: do `element.animate() — one declaration, every frame` · don't `setInterval every 80ms — animation by flipbook` · control `Play both` · hint `Same duration, same distance — count the jumps on the right`.
- **Detail**: ThreadMeter shows healthy thread + `main thread — healthy · the steps come from setInterval, not load`.

### motion-23 · Avoid Inheritable Motion Variables — `toggle`

- **Scene**: NestedChipsScene; print the durations inside the chips: parent chip labeled `parent · 140ms`, child chip `child · 220ms` (`font-mono text-[8px]`), don't pane child reads `child · inherits 140ms` in rose.
- **Motion**: existing nudge tracks (parent 140, child 220 vs both 140).
- **Copy**: do `child keeps its explicit 220ms` · don't `child silently inherits the parent's 140ms` · control `Speed up parent` · hint `You changed the parent. Watch what the child does about it`.

### motion-24 · Stagger Without Blocking — `replay`

- **Scene** both: ListScene (real rows).
- **Motion**: riseIn(6) 220ms; do stagger 60ms, don't 220ms.
- **Copy**: do `60ms steps — rhythm, not a queue` · don't `220ms steps — content held hostage` · control `Play both` · hint `Stagger is decoration. The moment it delays reading, it's a bug`.
- **Detail**: readout under each bar: `last row lands at 340ms` / `660ms` (computed from `tracksDurationMs`).

### motion-25 · Review in Slow Time — `replay` (spot-the-flaw, landed via 006)

- **Motion**: flawed toast (opacity pops 0 → 0.55 at 2%) — do at 880ms (reviewed), don't at 220ms (shipped).
- **Copy**: do `at ¼× the opacity pop is unmissable` · don't `at 1× it shipped — nobody saw it` · control `Play both` · hint `This is why the ¼× button exists. Every motion bug survives full speed`.
- **Detail**: if the flaw is visible at 1×, soften to 0.4. This rule is the ad for the speed control — the hint says so.

### motion-26 · Split Enter Animations — `replay`

- **Scene**: replace generic rows with **CardRevealScene** (new, `scenes.tsx`): a mini card with title line, two body lines, and a primary button — do pane splits them (`data-anim="part"` ×3: header/body/actions), don't pane wraps all in one `data-anim="whole"`.
- **Motion**: do riseIn(8) 220ms stagger 90ms per part. don't whole-card fadeIn 360ms.
- **Copy**: do `title, body, actions — three beats, 90ms apart` · don't `one undifferentiated fade` · control `Play both` · hint `Three beats read as composition; one fade reads as a screenshot`.

### motion-27 · Subtle Exit Motion — `replay`

- **Motion**: do dropOut(-12) 150ms `EASE.in`; don't translateY(-100%)+scale(0.5) 400ms.
- **Copy**: do `-12px + fade · 150ms — leaves the room quietly` · don't `flies away · 400ms — exits are not fireworks` · control `Play both` · hint `Watch where your eye goes — the exit shouldn't compete with what's next`.

### motion-28 · Animate Contextual Icons — `toggle`

- **Scene**: IconSwapScene, icons `text-accent`.
- **Motion**: crossfade scale 0.25↔1 + blur 4px↔0, 300ms both directions (existing).
- **Copy**: do `scale + fade + blur — one object changing its mind` · don't `swap — two strangers trading places` · control `Change state` · hint `Run it at ¼× — the blur is what sells the morph`.

### motion-29 · Skip Default Load Animation — `replay`

- **Scene** both: ButtonScene "Ready" (secondary).
- **Motion**: do no-op (opacity 1→1, 0ms). don't riseIn(8) 220ms.
- **Copy**: do `already there — the default state owes you nothing` · don't `re-enters on every visit — ceremony for furniture` · control `Reload UI` · hint `A default state that animates in is a page apologizing for existing`.

### color-7 · Hover State Stays in Hue — `hover`

- Existing (blue-600→700 vs blue→green). **Copy**: do `blue-600 → blue-700 — same hue, deeper` · don't `blue → green — a different opinion, not a hover`. No accent treatment (color IS the content here).

### comp-9 · Loading State on Async Buttons — `action`

- Existing crossfade to spinner + dim. **Copy**: do `spinner + disabled — the button is honest about working` · don't `still clickable — double-submit roulette` · control `Submit` · hint `Click the right button twice. That's two orders in production`.

### sys-1 · Skeletons Over Spinners — `action`

- **Motion**: raise the wait from 400ms to **900ms** delay before content fades in (the wait must be long enough to feel); skeleton rows `animate-pulse`, content fade 220ms.
- **Copy**: do `skeleton — the layout arrives before the data` · don't `spinner — a clock with no hands` · control `Load` · hint `Same 900ms wait. One pane spends it teaching you the layout`.

### sys-9 · Optimistic UI — `action`

- **Scene**: LikeScene; heart = accent→rose on fill.
- **Motion**: do popIn(0.6) 120ms immediately; **plus** a tiny `synced ✓` chip (`data-anim="sync"`, `text-[8px] text-ink-muted`) fading in at +700ms — the background sync made visible. don't: same heart, delayMs 560.
- **Copy**: do `fills now, syncs behind your back` · don't `waits 560ms for permission to feel` · control `Like` · hint `The left heart trusts the server will agree. The right one asks first`.

---

## Part III — Execution protocol

Implement in four batches, each independently verifiable (`npm run typecheck && npm run lint && npm test` + feel check at 1× and ¼×, both themes):

1. **Batch A — copy pass** (lowest risk, highest immediate lift): every caption/hint/control string above, into `showcase-specs.tsx` and the prototype files. Strings are exact; typos in this doc lose to obvious intent, nothing else does.
2. **Batch B — scenes**: the scene upgrades (013's system + this doc's per-rule specifics: CardRevealScene, two-toast motion-15, kbd chip motion-2, origin dot motion-10, chip duration labels motion-23, sync chip sys-9). `data-anim` parity check after every scene edit.
3. **Batch C — instruments**: gesture readout chips (18/19/20), stagger readouts (24), tally (1), counters/meters if 012 hasn't landed them.
4. **Batch D — sweep**: motion values not already landed (sys-1 900ms, motion-15 keyframes, motion-10 popIn 0.6 origin dot track), accent dark-mode token fix (§6), cross-check every rule against this spec top to bottom and tick them off in a checklist appended to this file.

Boundaries: no new dependencies; engine semantics untouched; every `data-anim` name preserved unless this spec explicitly adds one; grid `sm` previews stay lightweight; if a target file has drifted beyond recognition, stop and report the rule ID rather than improvising.

Done when: someone can open any motion rule, and the scene tells them what will move, the control tells them how to make it move, the numbers prove what moved, and the caption tells them why it matters — with zero rule left on the old wireframe treatment.

---

## Implementation checklist (2026-08-06)

Verified with `npm run typecheck && npm run lint && npm test && npm run build` (all green) and visual checks on motion-1/4/15/26 in the browser. `data-anim` parity confirmed: every spec track target has a provider.

- [x] Part I standards: taller stages (AppSurface/Menu h-44, framed scenes h-36/40, rails h-32/36 — per user feedback that panes felt cropped), ms readouts resting at nominal, protagonist accent (blue-500/400), copy voice, per-rule `hint` field rendered in the deep dive.
- [x] motion-1 tally + "Open again" + new captions/hint
- [x] motion-2 kbd chip (`data-anim="key"`, `kf.keyPress()`) depresses on every trigger; captions
- [x] motion-3/5/6/7/8/9/13/14/16/17/24/25/27/28/29, color-7, comp-9 — captions/hints/controls per Part II
- [x] motion-4/5 easing instrument (labeled chip rail + annotated graph h-[120px], label backdrop pill)
- [x] motion-8 press haptic (`tapLight` on press-and-hold demos)
- [x] motion-10 origin pip (`data-anim="origin-dot"` at each pane's transform-origin)
- [x] motion-11 toolbar (real labels Cut/Copy/Paste, 300ms first delay, 0ms subsequent, 300ms grace) — landed via 006/013, verified
- [x] motion-12 interrupt prototype 420ms, labeled Transition/Keyframe chips — verified
- [x] motion-15 redesigned: ToastPairScene, toggle Show/dismiss, 150% vs 40px exit — the stranded tall toast persists as evidence
- [x] motion-18 live readout `v … px/ms · x …%` + release verdict frozen 2.5s; 60% threshold tick; haptics
- [x] motion-19 damping math readout (`pointer +Npx past the wall → card +N/3px`) + wall cap + spring return
- [x] motion-20 capture readout (`pointer outside — left knob still tracking, right knob lost`)
- [x] motion-21/22 retimed (2600ms / 3×240ms stalls; 1400ms / 80ms ticks) + ThreadMeter — landed via 011/012, verified
- [x] motion-23 duration labels inside chips (`parent · 140ms`, `child · 220ms` / rose `child · inherits 140ms`)
- [x] motion-26 CardRevealScene (three-beat parts vs whole fade; dashed rest slot)
- [x] sys-1 wait raised to 900ms; sys-9 `synced ✓` chip at +700ms
- [ ] NOT done (deliberate): dark accent token fix via `--color-accent` — scenes use blue-500/blue-400 utility pairs directly since plan 008's `@theme` hasn't landed; fold into 008/010.
