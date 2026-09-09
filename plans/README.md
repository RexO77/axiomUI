# Motion showcase improvement plans

Audit date: 2026-08-05 · Commit: `c885413` · Written by the `improve-animations` advisor workflow.

Theme: the showcase *system* (WAAPI track engine, do/don't panes, drag prototypes) is solid. The weaknesses are in **what** the demos show — several demos simulate their lesson instead of demonstrating it, seven rules share one abstract "box on a rail" scene, and the gesture physics stop at the fingertips. These plans make each rule's demo something you can *feel*, per the site's own bar.

Plans 008-010 open a second track: **Axiom dogfoods its own design system.** `globals.css` defines a full token layer (`--color-*`, `--motion-*`, `--radius-*`) that zero TSX files use — 975 raw `neutral-*` utilities with hand-written `dark:` twins, Tailwind default durations/eases in the app chrome, and button/chip recipes hand-typed in 6+ places. The track wires tokens into Tailwind as semantic utilities (008), extracts primitives (009), then migrates everything and adds a CI tripwire so it stays unified (010).

Each plan is self-contained: an executor needs no other context. If code has drifted from a plan's excerpts, the executor should stop and report, not improvise.

| # | Plan | Severity | Status |
| --- | --- | --- | --- |
| 001 | [Drive motion-2 with a real keystroke](001-motion-2-real-keyboard-trigger.md) | HIGH | DONE |
| 002 | [Real interruptibility toggle for motion-12](002-motion-12-real-interruptibility.md) | HIGH | DONE |
| 003 | [Real main-thread jank for motion-21/22](003-motion-21-22-real-jank.md) | HIGH | DONE |
| 004 | [Velocity-carrying releases + spring easing util](004-velocity-releases-and-springs.md) | HIGH | DONE |
| 005 | [Easing curve visualization for motion-4/5 + easing-aware bars](005-easing-curve-visualization.md) | MEDIUM | DONE |
| 006 | [Scene differentiation: motion-6 dropdown, motion-25 spot-the-flaw, motion-11 toolbar](006-scene-differentiation.md) | MEDIUM | DONE |
| 007 | [Settle-back to rest, drag affordances, haptics](007-settle-back-affordances-haptics.md) | MEDIUM/LOW | DONE |
| 008 | [Wire design tokens into Tailwind semantic utilities](008-design-tokens-into-tailwind.md) | HIGH | TODO — do NOT bulk-migrate; foundation only |
| 009 | [Extract Button/Chip primitives into src/components/ui](009-ui-primitives.md) | MEDIUM | TODO |
| 010 | [Migrate to semantic tokens + CI guardrails](010-token-migration-and-guardrails.md) | MEDIUM | BLOCKED — prior bulk migration corrupted class strings; needs hand migration file-by-file |
| 011 | [Demo pacing: segmented speed control + retimed load demos](011-demo-pacing.md) | HIGH | DONE |
| 012 | [Evidence: thread seismograph, live ms readouts, motion-1 tally](012-evidence-instrumentation.md) | HIGH | DONE |
| 013 | [Scene craft: real mini-UI, accent protagonist, legible graphs](013-scene-craft.md) | HIGH | DONE |
| 014 | [**Showcase craft spec — every motion rule, fully detailed**](014-showcase-craft-spec.md) | HIGH | DONE |

## Recommended execution order

1. **001** — smallest, highest headline value, zero risk to others.
2. **002**, then **003** — both add a `TriggerKind` member and a `MotionShowcase` dispatch branch; landing them in sequence avoids merge friction (each merges the other's trigger kinds if present).
3. **004** — independent of 001–003 (touches only `drag-showcases.tsx` + `showcase-engine.ts`).
4. **005** — independent; touches motion-4/5 specs and `runBar`.
5. **006** — depends on knowing 002/003 landed (shared `TriggerKind` edits; also assumes motion-12/21/22 no longer need scene differentiation).
6. **007** — last of the motion track: its settle-back interacts with every replay/action spec, so verify after the spec churn above has settled.
7. **008** — design-system foundation; independent of the motion track, can start any time (001-007 are DONE, so no coordination needed).
8. **009** — after 008 (needs the semantic utilities).
9. **011 → 012 → 013** — round 2 (post-review of the executed motion track): pacing first (011 sets the durations), then instrumentation (012 builds on 011's numbers; both edit `load-showcase.tsx`), then the visual craft pass (013 rewrites scenes/graph/chrome and needs 008's utilities).
10. **014** — the per-rule craft spec (round 3). Canonical: where it conflicts with 011-013, **014 wins**. Execute in its four batches (A copy → B scenes → C instruments → D sweep). Note for executors: the working tree may contain corrupted class strings from the aborted bulk migration (see 010's status) — if a file you touch has malformed classes, fix only the lines you edit and report the rest.
11. **010** — strictly last overall, now BLOCKED pending hand migration: file-by-file only, no bulk find-and-replace; the guardrail test is written first so each hand-migrated file locks in.

## Dependencies

- 002, 003, 006 all extend `TriggerKind` in `showcase-specs.tsx` and the `TRIGGERS` set in `src/data/__tests__/showcase-specs.test.ts` — executors must merge, not replace.
- 006 must not delete `RaceScene` (005 still uses it for motion-4/5).
- 007's settle-back should land after 002/003/006 change several specs' triggers away from `replay`.
- 009 needs 008's utilities; its `ControlButton` wrapper must preserve the export name (demo files from 001-007 import it).
- 010 needs 008 + 009, and must run after the motion track is merged — its batch 4 migrates the files plans 001-007 touched (`interrupt-showcase.tsx`, `load-showcase.tsx`, `tooltip-showcase.tsx`, `easing-graph.tsx`, plus the reworked chrome/specs).
- 008/010 sanctioned visual shifts: token values win over the old hand-picked neutrals (e.g. dark borders `neutral-700 → --color-stroke-strong #525252`); anything that reads wrong gets fixed at the token, never with a `dark:` twin.
- 011 owns every duration/stall/tick number in the load demos; 012 must not change them. 012 owns the instrumentation; 011 must not remove sampling code if it lands second (it won't if the order holds).
- 013 must keep every `data-anim` target name intact (the engine + specs select on them) — its step 1 grep check is mandatory, and it changes pixels only, never behavior.

## Round 2 — review verdict on the executed motion track (2026-08-05)

Plans 001-007 were executed faithfully; the remaining gap is demo *presence*, not mechanics. Diagnosis behind 011-013:

1. **Evanescence** — lessons live in 0.1-1.2s of motion, play once, and leave no artifact to study (the motion-21 race is over before the eye reaches the stage). Fix: slower explanatory timebases (011) + persistent evidence: seismograph strip, ms counters, cumulative wait tally (012).
2. **No protagonist** — every element is the same neutral grey; the eye isn't told what to watch. Fix: the moving element gets `--color-accent`, statics stay neutral (013).
3. **Wireframe illustrations** — deep-dive scenes are skeleton bars; rest states read as empty placeholders. Fix: real miniature UI (readable labels, icons, kbd chips) at lg size only (013).

## Shared verification for every plan

```
npm run typecheck && npm run lint && npm test
```

plus the plan's feel check in `npm run dev`. Feel checks that involve gestures (004, 007) should be done on a real trackpad/touch device — synthetic drags don't produce honest velocity.

## Round 4 — full audit (2026-09-07)

Six parallel agents audited the previews, showcases, deep-dive prose, and app chrome. What the
earlier rounds left behind was not missing content — coverage was already 106/106 on both prose
and previews — but craft residue and a handful of real defects:

- **`plans/013` was mis-tracked.** This table said DONE; the plan's own header said TODO. Several
  of its targets had genuinely never landed. Both are now DONE and consistent.
- **A silent CSS override.** `globals.css` declared `p, li, figcaption, blockquote
  { text-wrap: pretty }` *outside* any cascade layer, so every layered Tailwind utility lost to
  it — `text-balance` on a `<p>` was emitted but had no effect, which is why the typo-12 and
  typo-13 preview pairs rendered identically. The heading `font-family` block had the same
  latent defect (it would beat `font-mono`), though no heading in the repo currently uses
  `font-mono`, so nothing visible was broken by that half. Both blocks now live in `@layer base`.
- **Related rules was largely fake.** 61 of 101 tags were used exactly once, so `getRelatedRules`
  fell through to same-category order for 31% of slots. Tag vocabulary is now 55, none single-use,
  0 fallback slots.
- **Rule titles are sentence case** as of this round, per `typo-1`. Category names, the site
  metadata in `layout.tsx`, and the skill `SKILL.md` headings are still Title Case — a deliberate
  open question, not an oversight.
- **`llms-full.txt` shipped none of the authored prose** and had a blank-line join bug. It now
  carries all four deep-dive sections per rule via the server-only `src/lib/rule-corpus.ts`
  (kept out of `rule-text.ts`, which a client component imports).

Still open, deliberately: the `size="sm"` preview branch is dead code at every call site (61
size-conditional expressions), `cn` in `src/lib/utils.ts` is plain concatenation with no
tailwind-merge (so a `className` passed to a shared primitive silently loses to source order),
`sys-12`/`motion-3` are the same rule filed twice, and plans 008-010 remain parked.

## Vetted but not planned (deliberately)

- **motion-8 press feedback uses one-shot WAAPI tracks** rather than a retargeting transition — at 140ms the restart is imperceptible; not worth churn. Revisit only if press demos gain longer durations.
- **motion-28's 300ms icon crossfade** — at the top of the UI budget but defensible for an explanatory toggle demo.
- **Grid `PanePreview` autoplay** — acceptable as a preview affordance (respects reduced motion and the motion-16 self-exemption); deep dives remain gesture-driven, which is the standing product decision.
