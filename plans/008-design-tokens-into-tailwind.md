# 008 — Wire Axiom's design tokens into Tailwind so utilities ARE the design system

- **Status**: TODO
- **Commit**: c885413
- **Severity**: HIGH (foundation — plans 009/010 build on it)
- **Category**: Design system / tokens
- **Estimated scope**: 2 files: `src/app/globals.css` (~70 new lines), `AGENTS.md` (~35 new lines). No component changes except one exemplar.

## Problem

Axiom preaches token discipline and doesn't practice it. `src/app/globals.css:10-111` defines a complete token layer — `--color-bg/-elevated/-muted/-inverse`, `--color-text-primary/-secondary/-muted`, `--color-stroke/*`, `--color-accent`, `--color-success/-error`, `--radius-*`, `--ease-*`, `--motion-*` — with proper `.dark` overrides. But the tokens are **not registered with Tailwind** (no `@theme` block exists), so no utility classes exist for them, so the components can't use them:

- **0** occurrences of `var(--color-` in any `.tsx` file.
- **975** raw palette utilities (`neutral-50…neutral-950`) across 17 component files, almost all doubled with a hand-written `dark:` twin, e.g. `src/components/features/search/search-input.tsx:36`:

```
border-neutral-200 bg-neutral-50 … text-neutral-900 placeholder:text-neutral-400 … dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 …
```

- **Motion tokens bypassed in the app's own chrome**: `src/components/layout/sidebar.tsx:21,143` use `duration-150` (Tailwind default ease), `sidebar.tsx:278,330` use `duration-300`, `src/components/features/rules/copy-rule-button.tsx:140,148` use `duration-300 ease-in-out` — none use `--motion-fast/medium/slow` (140/220/360ms) or `--ease-out-strong`. The site that legislates "Use Strong Custom Easing" animates its own copy button with Tailwind's default `ease-in-out`.
- **Radius tokens are fiction**: `--radius-sm/md/lg/xl` claim 8/12/16/24px (`globals.css:60-63`) but the components actually use Tailwind defaults (`rounded-md` ×72 = 6px, `rounded-lg` ×19 = 8px, plus 4 hardcoded `rounded-[28px]` in `sidebar.tsx:330` area). Two contradictory radius systems, one unused.

Result: every new component invents its own light/dark pair, duration, and radius — the exact "getting confused about what we're using" this plan kills.

## Target

One vocabulary, enforced by Tailwind v4 utilities generated from the existing tokens. New code writes:

```
bg-surface text-ink border-line          ← flips with theme automatically, no dark: twin
bg-surface-raised text-ink-muted
duration-fast ease-out-strong
```

### 1. `@theme inline` block in `globals.css`

Add immediately after the `.dark { … }` block (after line 111). `inline` is required because the values reference CSS variables that change under `.dark`:

```css
/* ==========================================================================
   TAILWIND THEME — semantic utilities generated from the tokens above.
   New components MUST use these instead of raw palette classes + dark: twins.
   bg-surface / text-ink / border-line flip with the theme automatically.
   ========================================================================== */
@theme inline {
  /* Surfaces (backgrounds) */
  --color-surface: var(--color-bg);
  --color-surface-raised: var(--color-bg-elevated);
  --color-surface-muted: var(--color-bg-muted);
  --color-surface-inverse: var(--color-bg-inverse);

  /* Ink (text) */
  --color-ink: var(--color-text-primary);
  --color-ink-secondary: var(--color-text-secondary);
  --color-ink-muted: var(--color-text-muted);
  --color-ink-inverse: var(--color-text-inverse);

  /* Lines (borders/strokes) */
  --color-line: var(--color-stroke);
  --color-line-muted: var(--color-stroke-muted);
  --color-line-strong: var(--color-stroke-strong);

  /* Accents & semantics */
  --color-accent: var(--color-accent);
  --color-accent-hover: var(--color-accent-hover);
  --color-success: var(--color-success);
  --color-success-muted: var(--color-success-muted);
  --color-error: var(--color-error);
  --color-error-muted: var(--color-error-muted);

  /* Easing utilities: ease-out-strong / ease-in-out-strong / ease-drawer */
  --ease-out-strong: var(--ease-out-strong);
  --ease-in-out-strong: var(--ease-in-out-strong);
  --ease-drawer: var(--ease-drawer);
}
```

(Every `--color-*` theme key generates the full set: `bg-surface`, `text-ink`, `border-line`, `placeholder:text-ink-muted`, `divide-line`, etc. Every `--ease-*` key generates an `ease-*` utility.)

### 2. Motion duration utilities

Tailwind's numeric `duration-*` stays available (that's what plan 010's guardrail forbids in `src/`); the sanctioned spellings are:

```css
@utility duration-fast   { transition-duration: var(--motion-fast); }
@utility duration-medium { transition-duration: var(--motion-medium); }
@utility duration-slow   { transition-duration: var(--motion-slow); }
```

### 3. Radius reconciliation

The `:root` radius tokens describe a scale nothing uses. Make the tokens tell the truth and give the one bespoke value a name:

- Change `globals.css:59-64` to match actual usage and intent:

```css
  /* Radius tokens — aligned to the utilities in use (Tailwind defaults) */
  --radius-sm: 4px;    /* rounded-sm */
  --radius-md: 6px;    /* rounded-md — controls, chips */
  --radius-lg: 8px;    /* rounded-lg — cards, inputs */
  --radius-xl: 12px;   /* rounded-xl — nav items */
  --radius-panel: 28px; /* floating sidebar / drawer panels */
  --radius-full: 9999px;
```

- Add `--radius-panel: var(--radius-panel);` to the `@theme inline` block → generates `rounded-panel`. Replace the 4 occurrences of `rounded-[28px]` (all in `src/components/layout/sidebar.tsx`; find with `grep -rn "rounded-\[28px\]" src`) with `rounded-panel`.
- Do NOT redefine Tailwind's own `--radius-sm/md/lg/xl` inside `@theme` — that would silently change every `rounded-*` in the app. The `:root` tokens are documentation + bespoke-CSS values only.
- First check nothing consumes the old 8/12/16/24 values: `grep -rn "var(--radius" src` — at this commit the only hits are in `globals.css` itself; if any use `--radius-xl`/`--radius-lg` expecting 24/16px, adjust that CSS to the new names and report it.

### 4. Exemplar conversion (proof, not migration)

Convert exactly one leaf component so reviewers see the before/after: `Hint` and `ControlButton` in `src/components/features/rules/demos/showcase-chrome.tsx`:

```tsx
/* Hint — current */
<span className="text-xs text-neutral-500 dark:text-neutral-400">{children}</span>
/* Hint — target */
<span className="text-xs text-ink-muted">{children}</span>
```

```tsx
/* ControlButton — current classes */
"inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
/* ControlButton — target */
"inline-flex items-center gap-1.5 rounded-md border border-line-strong px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors duration-fast ease-out-strong hover:bg-surface-muted"
```

Note the mapping is *semantic*, not hex-exact: `neutral-300` light / `neutral-700` dark → `line-strong` (`#d4d4d4` / `#525252`). Small visible shifts toward the token values are the point — the tokens are the source of truth now. If a pairing reads wrong in either theme, adjust the *token* (or pick the neighboring semantic step), never reintroduce a `dark:` twin.

### 5. The contract, in `AGENTS.md`

Append a new section so every future agent/model builds with the system (this is the "anything new uses Axiom itself" requirement):

```markdown
## Design system (MANDATORY for new UI)

Axiom is built on its own tokens. All UI code uses the semantic utilities generated
from `src/app/globals.css` — never raw palette classes with `dark:` twins.

- Colors: `bg-surface(-raised|-muted|-inverse)`, `text-ink(-secondary|-muted|-inverse)`,
  `border-line(-muted|-strong)`, `text-accent`, `bg-success-muted`, `text-error`.
  Never `bg-white`, `bg-neutral-*`, or any `dark:*-neutral-*` pair in new code.
- Motion: `duration-fast|medium|slow` (140/220/360ms) + `ease-out-strong` (entrances),
  `ease-in-out-strong` (on-screen movement), `ease-drawer` (drawers). Never numeric
  `duration-*` or Tailwind's default `ease-*`. In WAAPI/JS, import `EASE`/`DUR` from
  `src/lib/showcase-engine.ts` — never retype a cubic-bezier.
- Radius: standard `rounded-sm|md|lg|xl|full`; `rounded-panel` (28px) for floating panels.
- Press feedback: the `pressable` class (globals.css) — don't hand-roll `:active` scales.
- Primitives: prefer `src/components/ui/*` (Button, Chip — see plans/009) over restyling
  raw elements.
- Exemptions: `src/app/rules/[id]/opengraph-image.tsx` (Satori requires literal hex),
  `src/lib/showcase-engine.ts` EASE literals (documented mirror of the CSS tokens),
  miniature demo scenes' arbitrary text sizes (`text-[9px]` etc.).
```

## Repo conventions to follow

- `globals.css` section banners: match the existing `/* ===… */` style (see line 6-8).
- Tailwind v4 idioms already in use: `@custom-variant dark` at `globals.css:4` — the `@theme inline` and `@utility` blocks are the v4-native companions.
- `AGENTS.md` voice: short imperative bullets (see its existing "Coding Style" section).

## Steps

1. `globals.css` — add the `@theme inline` block after line 111 (the `.dark` close brace), exactly as in Target §1, plus the `--radius-panel` line from §3.
2. `globals.css` — add the three `@utility duration-*` rules after the `@theme` block (Target §2).
3. `globals.css` — replace lines 59-64 with the reconciled radius tokens (Target §3); run the `grep -rn "var(--radius" src` check first.
4. `sidebar.tsx` — swap the 4 `rounded-[28px]` for `rounded-panel`.
5. `showcase-chrome.tsx` — convert `Hint` and `ControlButton` per Target §4. **Coordination**: plans 001-007 executors may be editing this file; apply the class change to whatever the current `Hint`/`ControlButton` classes are (same substitutions), and if the components have been moved/renamed, STOP and report.
6. `AGENTS.md` — append the Design system section (Target §5).

## Boundaries

- Do NOT migrate any other component (that's plan 010) and do NOT create primitives (plan 009).
- Do NOT redefine Tailwind's default color palette or radius scale inside `@theme` — additive semantic names only.
- Do NOT rename the underlying `:root` token variables (`--color-bg` etc.) — 18 custom-CSS usages in `globals.css` depend on them.
- Do NOT touch `opengraph-image.tsx` or `showcase-engine.ts`.
- No new dependencies.

## Verification

- **Mechanical**: `npm run typecheck && npm run lint && npm run build && npm test` — the build fails loudly if `@theme inline`/`@utility` syntax is wrong.
- **Feel check**: `npm run dev`:
  - Any deep-dive page: the control button and hints look unchanged in light mode and dark mode (within a hair of the old neutrals — line-strong is `#d4d4d4`/`#525252` vs the old `#d4d4d4`/`#404040`; the dark border reads slightly lighter, which is correct per tokens).
  - Toggle the theme: converted elements flip with NO `dark:` classes on them (inspect in DevTools — the computed color comes from the CSS variable).
  - Sidebar floating panel still has its 28px radius (`rounded-panel`).
  - Sanity: temporarily add `class="bg-surface text-ink border-line duration-fast ease-out-strong rounded-panel"` to any element and confirm all utilities resolve (then remove).
- **Done when**: the utilities exist and render correctly in both themes, the exemplar component carries zero `dark:` classes, and `AGENTS.md` states the contract.
