# 010 — Migrate the codebase to semantic tokens and add guardrails that keep it there

- **Status**: TODO
- **Commit**: c885413
- **Severity**: MEDIUM (large surface, mechanical)
- **Category**: Design system / migration + enforcement
- **Estimated scope**: ~15 component files (class-string changes only) + 1 new test file
- **Depends on**: plan 008 (utilities), plan 009 (primitives). Execute LAST, after plans 001-007 have landed (they rewrite several demo files this plan would otherwise churn).

## Problem

After plan 008 the semantic utilities exist, but ~975 raw `neutral-*` usages (most with `dark:` twins) remain across 17 files, plus Tailwind-default durations/eases in app chrome (`duration-150/200/300`, bare `ease-out`/`ease-in-out` — e.g. `src/components/layout/sidebar.tsx:21,143,268,278,313,330`, `src/components/features/search/search-input.tsx:36`, `src/components/features/rules/copy-rule-button.tsx:140,148`). Nothing stops the next file from adding more — the system decays without a tripwire.

## Target

1. Component styling reads in Axiom vocabulary only: `surface/ink/line` colors, `duration-fast|medium|slow`, `ease-out-strong|in-out-strong|drawer`, `rounded-*`/`rounded-panel`.
2. A vitest guardrail fails CI when new code reintroduces raw dark-twin palette classes, numeric durations, default eases on transitions, or stray `cubic-bezier(` literals in TSX.

### Substitution table (apply mechanically, then eyeball)

| Current pattern | Replacement |
| --- | --- |
| `bg-white dark:bg-neutral-950` / `dark:bg-neutral-900` (page/card surfaces) | `bg-surface` (or `bg-surface-raised` when it sits on another surface — drawer, popover, sticky header) |
| `bg-neutral-50 dark:bg-neutral-800/900` (inset fields, wells) | `bg-surface-muted` |
| `bg-neutral-100 dark:bg-neutral-800` (hovers, pills) | `bg-surface-muted` (hover: `hover:bg-surface-muted`) |
| `bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900` (inverse fills) | `bg-surface-inverse text-ink-inverse` |
| `text-neutral-900 dark:text-neutral-100` | `text-ink` |
| `text-neutral-600/700 dark:text-neutral-200/300` | `text-ink-secondary` |
| `text-neutral-400/500 dark:text-neutral-400/500` | `text-ink-muted` |
| `border-neutral-100/200 dark:border-neutral-800` | `border-line` (`border-line-muted` for the 100-weight hairlines) |
| `border-neutral-300 dark:border-neutral-600/700` | `border-line-strong` |
| `duration-150` | `duration-fast` |
| `duration-200` | `duration-medium` |
| `duration-300` | `duration-slow` **and add an explicit ease** (`ease-out-strong` for enters/hovers, `ease-in-out-strong` for on-screen movement) |
| bare `ease-out` / `ease-in-out` on transitions | `ease-out-strong` / `ease-in-out-strong` |

Judgment calls the executor must make per instance (and list in the PR description): decorative alpha washes (`bg-neutral-950/20` scrims, `bg-white/95` glass panels) map to no token — keep them, they're allowed; emerald/rose/blue accents in demos stay (they're depictions); when a light/dark pair doesn't cleanly match a row above, choose the semantically nearest token and note it.

### Migration order (one commit each, visual check between)

1. App chrome: `sidebar.tsx`, `header.tsx`, `theme-toggle.tsx` remnants, `search-input.tsx`
2. Rule surfaces: `rule-card.tsx`, `rule-drawer.tsx`, `rules/[id]/page.tsx`, `copy-rule-button.tsx` (colors + its `duration-300 ease-in-out` → `duration-slow ease-in-out-strong`)
3. Skills + landing: `skill-bonus.tsx`, `skill-modal*`, `page.tsx`, `footer` if present
4. Demo chrome + scenes: `showcase-chrome.tsx`, `motion-showcase.tsx`, `drag-showcases.tsx`, `scenes.tsx`, `preview-primitives.tsx`, plus any new files plans 001-007 created (`interrupt-showcase.tsx`, `load-showcase.tsx`, `tooltip-showcase.tsx`, `easing-graph.tsx`)

### Exemptions (enforced by the guardrail's allowlist)

- `src/app/rules/[id]/opengraph-image.tsx` — Satori requires literal values; no CSS vars available.
- `src/lib/showcase-engine.ts` — the `EASE` literals are a documented mirror of the CSS tokens (see its comment "WAAPI cannot read CSS variables in `easing`").
- Miniature type sizes in demos (`text-[10px]`, `text-[9px]`, `text-[7px]`…) — intentional depiction scale, not part of the app's type ramp.
- Focus rings (`ring-neutral-400 dark:ring-neutral-500`) — keep as-is unless plan 008's tokens grew a ring color; do not invent one here.
- `showcaseSpecs` color literals (`#155dfc` etc. in `showcase-specs.tsx`) — WAAPI keyframes can't resolve classes; documented at the `color-7` spec.

### Guardrail test — `src/lib/__tests__/design-system-guardrails.test.ts`

A vitest (node env; vitest is already configured — see `vitest.config.ts`) that walks `src/**/*.{tsx,ts}` with `fs`/`path` (no globby — no new deps), skips the exemption list, and asserts zero matches for:

```ts
const FORBIDDEN: Array<{ name: string; pattern: RegExp }> = [
    // Raw palette with a dark twin — use bg-surface/text-ink/border-line tokens.
    { name: "dark-twin palette class", pattern: /dark:(bg|text|border)-neutral-\d{2,3}/ },
    // Tailwind numeric durations — use duration-fast|medium|slow.
    { name: "numeric duration utility", pattern: /(?<![\w-])duration-\d{2,4}(?![\w-])/ },
    // Hand-typed curves in components — import EASE from showcase-engine or use ease-* utilities.
    { name: "cubic-bezier literal", pattern: /cubic-bezier\(/ },
];
const EXEMPT = [
    "src/app/rules/[id]/opengraph-image.tsx",
    "src/lib/showcase-engine.ts",
    "src/app/globals.css", // not scanned (ts/tsx walk), listed for clarity
];
```

Each failure message must print file, line, matched text, and the sanctioned replacement (mirror the table above) so a weaker model can self-serve the fix. Keep light-only `neutral-*` (no `dark:` twin) legal — demos legitimately depict fixed-color mini-UI; the dark-twin pattern is the smell that means "should have been a token".

## Repo conventions to follow

- Test placement/naming: `src/lib/__tests__/*.test.ts`, vitest `describe/it/expect` — mirror `src/data/__tests__/showcase-specs.test.ts`.
- This repo already treats integrity checks as tests (rule/deep-dive integrity suites) — the guardrail joins `npm test`, which CI runs.
- Commit style: one imperative-mood commit per migration batch (`Migrate app chrome to semantic tokens`).

## Steps

1. Write the guardrail test FIRST with the migration batches' files temporarily in an `TODO_MIGRATING` allowlist, so the suite passes from day one; shrink the allowlist as each batch lands; delete it at the end.
2. Migrate batch 1 (app chrome) per the substitution table; `npm run dev` and eyeball light + dark; commit.
3. Batches 2, 3, 4 the same way. Batch 4 only after confirming plans 001-007 are merged (check `plans/README.md` statuses or `git log`).
4. Remove the `TODO_MIGRATING` allowlist; `npm test` green with only the permanent exemptions.
5. Final sweep: `grep -rn "dark:bg-neutral\|dark:text-neutral\|dark:border-neutral" src --include="*.tsx"` → zero hits outside exemptions; `grep -rn "duration-[0-9]" src --include="*.tsx"` → zero.

## Boundaries

- Class strings only — NO markup, logic, motion-timing semantics (a 150→140ms shift is sanctioned; anything larger needs the substitution table row), or copy changes.
- Do NOT migrate `opengraph-image.tsx`, `showcase-engine.ts` EASE, or alpha-wash decoratives.
- Do NOT tighten the guardrail beyond the three patterns (e.g. don't ban all `neutral-*`) — false positives will train people to delete the test.
- No new dependencies.
- If a file diverges badly from the substitution table (heavy drift from plans 001-007), migrate what matches, list the rest in the PR description, and leave that file in the allowlist rather than improvising.

## Verification

- **Mechanical**: `npm run typecheck && npm run lint && npm run build && npm test` after every batch. The guardrail test itself must fail if you seed a `dark:bg-neutral-900` into any non-exempt file (try it once, then revert).
- **Feel check**: after each batch, flip themes on the affected pages: no element loses contrast, no border disappears, hover states still visible in dark mode. Compare against production (`https://` deploy or `git stash` toggling) for the three or four most visible surfaces: sidebar, rule card grid, rule drawer, deep-dive page.
- **Done when**: the greps in step 5 return zero, `npm test` enforces it, and a screenshot A/B of home + one deep dive in both themes shows either parity or deliberate token-truth shifts.
