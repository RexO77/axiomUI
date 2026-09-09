# 013 — Craft pass on the scenes: real miniature UI, an accent protagonist, legible graphs, present chrome

- **Status**: DONE (completed 2026-09-07 — the round-4 audit found the accent protagonist on `RailCardScene`/`SliderScene` and the shared rail treatment had never landed, and finished them)
- **Commit**: c885413 (working tree includes executed plans 001-007; token migration may be in flight)
- **Severity**: HIGH
- **Category**: Round 2 — illustration & stage quality ("not sure about the illustrations / the showcase part")
- **Estimated scope**: 5 files: `src/components/features/rules/demos/scenes.tsx` (the bulk), `easing-graph.tsx`, `showcase-chrome.tsx`, `showcase-specs.tsx` (motion-4/5 composition), small touches in `load-showcase.tsx`/`interrupt-showcase.tsx` rails
- **Depends on**: plan 008 (semantic utilities). Land after 011/012 to avoid triple-editing the same files.

## Problem

The demos are mechanically right and visually anonymous. Verified in the browser:

1. **Every scene is grey wireframe soup.** `scenes.tsx` builds all mini-UIs from `MiniLine` skeleton bars — at deep-dive size the rest state reads as *empty placeholder*, not "a composed interface" (its own stated goal, `scenes.tsx:14-18`). The panes on `/rules/motion-1` are two nearly-identical grey boxes; nothing invites a first click.
2. **Nothing tells the eye what to watch.** Every element — moving card, static rail, context lines — is the same neutral. Motion demos need a protagonist; the site's `--color-accent` (#2563eb, `globals.css`) is defined and used *nowhere*.
3. **The easing graphs are timid.** `easing-graph.tsx`: hairline `stroke-neutral-400` curve, 6px dot, an invisible mid-gridline, no axis meaning, no value on the graph itself. And on motion-4/5 the pane stacks an unrelated rail + card above the graph with dead space between — two widgets, no composition (`showcase-specs.tsx` motion-4/5 scenes).
4. **The chrome undersells the content.** 96px stages (`h-24`), 2px timing bars (`h-0.5` in `showcase-chrome.tsx` PaneChrome), 11px captions. The most interesting UI on the site is presented at the scale of a form hint.

## Target

### 1. Accent protagonist (system-wide rule for demos)

The element that *moves* gets the accent; everything static stays neutral. Concretely, in every scene/prototype:

- Moving cards/knobs/panels: `border-accent/40 bg-accent/10` on the container… **too washy** — exact treatment: the moving element keeps its surface (`bg-surface-raised` or white/neutral-800 equivalent) but gets `border-accent` (full strength) and its inner detail lines become `bg-accent/40`. Small solid elements (slider knob, progress dot) become solid accent: `bg-accent border-accent`.
- Do/Don't stays in the chrome (emerald/rose header chips) — do NOT color protagonists by verdict; both panes' protagonists are accent (they're the same object under two treatments; the verdict is the chrome's job).
- Scrims, rails, context UI: unchanged neutrals.
- Files: `scenes.tsx` (RaceScene card, RailCardScene card, SliderScene knob, ToastScene panel accent border, MenuScene panel, PaletteScene panel, ModalScene panel), `load-showcase.tsx`/`interrupt-showcase.tsx` rail cards, `drag-showcases.tsx` DragCard, `easing-graph.tsx` dot.

### 2. Real miniature UI at deep-dive size

`scenes.tsx` — for `size === "lg"` only (grid `sm` keeps the cheap skeletons), replace anonymous bars with legible miniature content. Keep it monochrome + accent, text at `text-[10px]`, lucide icons at `size-3`. Exact upgrades:

- **PaletteScene**: input row shows `Search commands…` placeholder text + a `⌘K` kbd chip (`rounded border border-line px-1 text-[9px] font-medium text-ink-muted`); two result rows: `FileText` icon + "Open file…", `Moon` icon + "Toggle theme".
- **MenuScene**: three items with text — "Rename", "Duplicate", "Share…" — first item with a subtle `bg-surface-muted` hover-state look.
- **ToastScene**: swap the plain dot for `CheckCircle2` (`size-3 text-emerald-500`) + text "Saved" + a thin progress underline (static).
- **ModalScene**: title text "Delete file?" (`font-semibold text-[10px] text-ink`), one body line (keep a MiniLine here), buttons "Cancel" (secondary) + "Delete" (primary) via `MiniButton`.
- **TooltipScene / SubmitScene / LikeScene / IconSwapScene**: already have real content — only accent/consistency touches.
- **ListScene**: rows become icon + text lines ("Inbox", "Drafts", "Archive") at lg.
- **AppSurface**: title-bar gets a tiny window-dot triplet instead of one dot, and the context lines drop to 40% opacity so overlays pop.

Scenes stay hook-free pure markup (the file's contract) — all of this is conditional JSX on `size`.

### 3. EasingGraph legibility + motion-4/5 composition

`easing-graph.tsx`:

- Curve: `strokeWidth 2`, `stroke-ink` (was neutral-400/500 hairline).
- Area fill under the curve: second path `${path} L ${w} ${h} Z` with `fill-accent/10` (dark included), no stroke.
- Dot: `size-2` (8px), `bg-accent`, with a 2px `ring-2 ring-surface` so it separates from the curve.
- Corner annotation inside the graph, top-left: the bezier string, `text-[9px] font-mono text-ink-muted` (e.g. `cubic-bezier(0.23, 1, 0.32, 1)`), so the artifact is self-describing; pane captions then carry the *verdict* copy only (`moves immediately` / `starts sluggish`).
- Axis hints: bottom-right `time →` and rotated or simply top-left small `progress` may crowd 100×60 — include ONLY `time →` (`text-[8px] text-ink-muted`, positioned under the graph, right-aligned).

`showcase-specs.tsx` motion-4/5 scene composition — make the rail and the graph one instrument:

- Wrap rail + graph in a single column with the SAME horizontal padding so the card's travel width and the graph's time axis are the same pixel span; card x-position and dot x-position then track 1:1 during playback (both are linear-in-time only for the don't... no — card x is eased, dot x is linear/time. They won't align and shouldn't; what aligns is the *span*.) Keep the vertical gap ≤ 8px (`gap-2`), rail directly above graph, no `justify-center` dead space (`RaceScene`'s outer `h-24` centering goes away for these two rules — export the rail row from RaceScene or build inline).
- Result: pane content = [rail | curve] as one visual block, top-aligned, ~stage height without voids.

### 4. Chrome presence

`showcase-chrome.tsx` PaneChrome:

- Stage min-height: standardize lg stages at `min-h-28` (112px) — scenes currently hardcode `h-24`; change scene roots from `h-24` to `h-28` for lg (sm untouched).
- Timing bar: `h-1` (4px) and `rounded-full` (currently `h-0.5`); keep the neutral fill (the bar is a clock, not a protagonist).
- Caption: `text-xs` (12px) `leading-4 text-ink-muted` (was `text-[11px]`).
- Do/Don't header: keep size, but add the pane's trigger affordance when gesture-driven — no new UI; just ensure `cursor-pointer` panes got the grip/pulse treatment from plan 007 (verify it landed; if not, skip — 007 owns it).

## Repo conventions to follow

- Semantic utilities from plan 008 (`bg-surface`, `text-ink`, `border-line`, `text-ink-muted`, `bg-surface-muted`, plus `accent`). If a file still carries `neutral-*` classes mid-migration, write the new code with semantic utilities anyway (008 is a dependency of this plan).
- Icons: `lucide-react`, `aria-hidden="true"`, sized via `size-3`/`className` — see `showcase-chrome.tsx`'s `CheckCircle2` usage.
- Scenes: pure markup, no hooks, `data-anim` contract untouched — every existing `data-anim` target must survive with the same name (the engine and specs select on them; `npm test` checks spec structure but NOT target presence — be careful; grep each scene's targets against `showcase-specs.tsx` after editing).
- `text-[10px]`/`text-[9px]` miniature sizes are the sanctioned depiction scale (see AGENTS.md design-system exemptions).

## Steps

1. `scenes.tsx` — AppSurface + the seven scene upgrades (Target §2), accent protagonist treatment (Target §1). After editing run: `grep -o 'data-anim="[a-z-]*"' src/components/features/rules/demos/scenes.tsx | sort -u` and diff against the same grep from `git show HEAD -- …` equivalents — target sets must match.
2. `easing-graph.tsx` — Target §3 graph changes.
3. `showcase-specs.tsx` — motion-4/5 scene composition (Target §3, second half); move the bezier strings out of captions into the graph annotation; captions become verdict copy.
4. `showcase-chrome.tsx` — Target §4 (bar height, caption size).
5. Scene-root heights `h-24` → `h-28` for lg branches across `scenes.tsx` and the prototype rails (`interrupt-showcase.tsx`, `load-showcase.tsx`, `drag-showcases.tsx` DragCard container, `tooltip-showcase.tsx` if it hardcodes h-24).
6. Accent touches in the prototype files' moving cards/knobs (Target §1 list).

## Boundaries

- No timing/behavior changes — this plan is pixels only (011/012 own behavior).
- No new dependencies; icons only from `lucide-react` already installed.
- Do NOT recolor Do/Don't chrome or verdict badges; accent ≠ verdict.
- Do NOT touch grid `sm` scene branches beyond what shared markup forces.
- Keep every `data-anim` target name identical (step 1's grep check is mandatory).
- If a scene has drifted heavily (token migration mid-flight), apply the same intent to current code; STOP only if a scene component no longer exists.

## Verification

- **Mechanical**: `npm run typecheck && npm run lint && npm test` + the `data-anim` grep parity check from step 1.
- **Feel check**, both themes:
  - `/rules/motion-1` at rest: two composed miniature apps you can *read* (palette with ⌘K, real modal), not grey bars. The thing that will move is findable before it moves (accent).
  - `/rules/motion-4`: rail + curve read as one instrument; the graph states its own bezier; the accent dot is visible from arm's length; area fill separates curve from background in dark mode.
  - `/rules/motion-9` (menu): menu items are readable words; the panel border is accent; the trigger button stays neutral.
  - Timing bars are visible without hunting; captions readable at laptop distance.
  - Grid previews (home page) unchanged in weight — still light skeletons.
  - Reduced motion / dark mode / 0.25× all still behave (no behavior was touched).
- **Done when**: a screenshot of any motion deep-dive looks like a designed teaching instrument — protagonist, readable mini-UI, self-describing graph — rather than a wireframe placeholder, in both themes.
