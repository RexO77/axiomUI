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
| 008 | [Wire design tokens into Tailwind semantic utilities](008-design-tokens-into-tailwind.md) | HIGH | SUPERSEDED by 015 (W1-A) |
| 009 | [Extract Button/Chip primitives into src/components/ui](009-ui-primitives.md) | MEDIUM | SUPERSEDED by 015 (W1-A) |
| 010 | [Migrate to semantic tokens + CI guardrails](010-token-migration-and-guardrails.md) | MEDIUM | SUPERSEDED by 015 for guardrails; remaining migration is per touched line under 015's strict-marker ratchet, never bulk |
| 011 | [Demo pacing: segmented speed control + retimed load demos](011-demo-pacing.md) | HIGH | DONE |
| 012 | [Evidence: thread seismograph, live ms readouts, motion-1 tally](012-evidence-instrumentation.md) | HIGH | DONE |
| 013 | [Scene craft: real mini-UI, accent protagonist, legible graphs](013-scene-craft.md) | HIGH | DONE |
| 014 | [**Showcase craft spec — every motion rule, fully detailed**](014-showcase-craft-spec.md) | HIGH | DONE |
| 015 | [**Craft round 5 — make the site obey its own catalog**](015-craft-round-5.md) | HIGH | TODO |

## Recommended execution order

Plans 001–007 and 011–014 are complete; their documents remain historical context.
Plans 008, 009 and 010 are superseded by [015](015-craft-round-5.md), including its
incremental migration and strict-marker guardrails.

1. **015 wave 1** — register tokens, shared primitives and guardrails, then prerender the catalog.
2. **015 wave 2** — migrate the disjoint chrome and preview surfaces onto that foundation.
   W2-L retains distribution UI and indexing requirements and owns its separate file set.
3. **015 wave 3** — reset the radius scale only after every surface, including W2-L,
   pins its dependent radii. Remove preview sizing across the types and all callers atomically.

## Dependencies

- Wave 2 requires wave 1's semantic utilities and primitives. Do not execute superseded 008/009 separately.
- W3-A waits for the wave-2 radius pins; W3-B owns the shared preview types and every size consumer.
- Token values are authoritative for migrated chrome. Fix a token when a shared color is wrong,
  rather than adding an independent dark utility.
- Motion demo durations and instrumentation are retained from 011–014 unless a finding explicitly changes them.
- Migration stays incremental; never replay 010's abandoned bulk replacement.

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

## Round 5 — six-lens audit, one execution plan (2026-10-02)

See **[015-craft-round-5.md](015-craft-round-5.md)**. Six lenses (chrome, reading surfaces, static
previews, motion, design system, content/a11y/SEO) were merged, and every P0/P1 was re-checked on
screen at commit `2089439`. Several round-4 open items are now closed: sys-12 is merged into motion-3
(105 rules), and category names and site metadata are sentence case.

The diagnosis in one line: the shell breaks the rules the catalog teaches. Unlayered radius
tokens rewrite Tailwind's scale (comp-4's square avatar renders round), `font-mono` was never
registered (Plex is loaded but never shown), the entrance stagger blanks deep links for ~4.5s, and the mobile
sheet and sub-xl drawer aren't accessible overlays. The homepage prerenders only a skeleton.
`/rules/typo-10` scrolls sideways on phones.

Execution: wave 1 is the foundation (`--ax-*` tokens registered in `@theme`, fonts, `@layer
components`, IconButton/Button/VerdictLabel, `design-system.test.ts`) plus prerendering the
catalog. Wave 2 is eleven disjoint surface batches, plus the distribution handoff in W2-L. Wave 3 takes back Tailwind's radius scale and deletes
the dead `size="sm"` branch. 015 supersedes 008, 009 and the guardrail half of 010. Skill-modal
and llms.txt requirements remain in 015's W2-L distribution handoff, which owns those files.
