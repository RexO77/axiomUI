# 009 — Extract the repeated recipes into `src/components/ui` primitives (Button, Chip)

- **Status**: TODO
- **Commit**: c885413
- **Severity**: MEDIUM
- **Category**: Design system / components
- **Estimated scope**: 2 new files (`src/components/ui/button.tsx`, `src/components/ui/chip.tsx`) + ~6 call-site files
- **Depends on**: plan 008 (semantic utilities must exist)

## Problem

The same interactive recipes are hand-typed across the codebase with small accidental divergences — each new surface re-derives padding, radius, border color, hover, and (inconsistently) press feedback:

- Bordered small button, three near-identical spellings:
  - `src/components/features/rules/demos/showcase-chrome.tsx` `ControlButton` — `rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:…`
  - `src/components/features/rules/demos/motion-showcase.tsx:189-201` slow-mo `0.25×` toggle — `rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors` + hand-rolled selected/unselected variants (`border-neutral-900 bg-neutral-900 text-white …` / `border-neutral-300 text-neutral-600 hover:bg-neutral-100 …`)
  - copy/action buttons in `src/components/features/rules/copy-rule-button.tsx` (own shell classes again)
- Icon button, twice: `src/components/layout/sidebar.tsx:21` (`pressable flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-neutral-500 … duration-150 hover:…` — note Tailwind default ease + 150ms, violating the motion tokens) and `src/components/ui/theme-toggle.tsx` (its own copy).
- Tag chip: `src/app/rules/[id]/page.tsx:173` — `inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 dark:…` — with a sibling spelling in `src/components/features/rules/rule-drawer.tsx` (find with `grep -n "rounded-full border" src/components/features/rules/rule-drawer.tsx`).

Meanwhile `src/components/ui/` (the natural home) contains only `axiom-logo`, `category-icon`, `demo`, `theme-toggle` — no primitives. Press feedback exists as a global `pressable` class (`src/app/globals.css:296-307`, scale 0.96 at `--motion-fast` + `--ease-out-strong` — the motion-8 rule as code) but only some buttons use it.

## Target

Two primitives, hand-rolled variant maps (no cva/class-variance-authority — **no new dependencies**), styled exclusively with plan 008's semantic utilities, `pressable` built in.

### `src/components/ui/button.tsx`

```tsx
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "icon";

const base =
    "pressable inline-flex select-none items-center justify-center gap-1.5 font-medium " +
    "transition-colors duration-fast ease-out-strong " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 " +
    "focus-visible:ring-offset-2 dark:focus-visible:ring-neutral-500 " +
    "disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
    primary: "bg-surface-inverse text-ink-inverse hover:opacity-90",
    secondary: "border border-line-strong text-ink-secondary hover:bg-surface-muted",
    ghost: "text-ink-muted hover:bg-surface-muted hover:text-ink",
};

const sizes: Record<Size, string> = {
    sm: "rounded-md px-2.5 py-1.5 text-xs",
    md: "rounded-md px-3 py-1.5 text-xs",
    icon: "h-9 w-9 rounded-xl",
};

export function Button({
    variant = "secondary",
    size = "md",
    className,
    type = "button",
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
    return <button type={type} className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
```

Selected/toggled state (the slow-mo button, aria-pressed): expressed via `aria-pressed` styling baked into the base — add to `base`:

```
"aria-pressed:border-transparent aria-pressed:bg-surface-inverse aria-pressed:text-ink-inverse"
```

(Tailwind v4 supports `aria-pressed:` natively; the caller just passes the real `aria-pressed` attribute.)

### `src/components/ui/chip.tsx`

```tsx
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Static tag/badge pill. Not interactive — use Button for anything clickable. */
export function Chip({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-muted px-3 py-1 text-xs font-medium text-ink-secondary",
                className
            )}
        >
            {children}
        </span>
    );
}
```

### Call sites migrated in this plan

1. `showcase-chrome.tsx` `ControlButton` → re-export a thin wrapper over `Button variant="secondary" size="md"` (keep the `ControlButton` name so demo files don't churn — plans 001-007 executors import it).
2. `motion-showcase.tsx` slow-mo toggle → `<Button size="sm" aria-pressed={slow} onClick={…}>0.25×</Button>`.
3. `theme-toggle.tsx` and the sidebar icon-button class (`sidebar.tsx:21`) → `Button variant="ghost" size="icon"` (sidebar keeps its extra hover border via `className` merge). This also fixes their `duration-150` + default-ease motion violation for free.
4. Tag chips in `rules/[id]/page.tsx:173` and the matching pill(s) in `rule-drawer.tsx` → `Chip`.

NOT migrated here: `copy-rule-button.tsx` (stateful morphing button — plan 010 tokenizes its colors in place), `MiniButton` in `preview-primitives.tsx` (miniature *depictions* of buttons inside demo scenes, not real controls — they stay independent by design).

## Repo conventions to follow

- File placement/naming: `src/components/ui/*.tsx`, PascalCase exports, named (not default) exports — match `theme-toggle.tsx`.
- `cn()` from `@/lib/utils` for class merging (used everywhere).
- Focus rings: copy the exact ring classes used at `motion-showcase.tsx:166` (`focus-visible:ring-2 focus-visible:ring-neutral-400 …`) — they're the established focus treatment. (Plan 010 may tokenize ring colors later; keep them literal here to match the app.)
- `pressable` is defined in `globals.css` and already used by sidebar/skill rows — the primitives standardize it.

## Steps

1. Create `src/components/ui/button.tsx` per Target (including the `aria-pressed` additions to `base`).
2. Create `src/components/ui/chip.tsx` per Target.
3. `showcase-chrome.tsx` — replace `ControlButton`'s body with the wrapper (`export function ControlButton({ onClick, children }) { return <Button variant="secondary" onClick={onClick}>{children}</Button>; }`).
4. `motion-showcase.tsx` — replace the slow-mo `<button …>` block with the `Button` call per Target §migrated-2. Remove the now-unused conditional class logic.
5. `theme-toggle.tsx` + `sidebar.tsx:21` — adopt `Button variant="ghost" size="icon"`, merging any surface-specific classes via `className`. Preserve all aria labels/handlers/haptics exactly.
6. `rules/[id]/page.tsx` + `rule-drawer.tsx` — adopt `Chip` for tag pills. Do/Don't badges (`badge-do`/`badge-dont` at `page.tsx:194,213`) are NOT chips — leave them.
7. Grep sweep: `grep -rn "px-3 py-1.5 text-xs font-medium\|px-2.5 py-1.5 text-xs font-medium" src` — any remaining bordered-small-button spelling in non-demo, non-preview files should adopt `Button`; list anything you deliberately left in the PR description.

## Boundaries

- No new dependencies (no cva, no radix).
- Do NOT restyle: visual output should match the current rendering to within the token shifts already accepted in plan 008.
- Do NOT touch demo scene internals (`scenes.tsx`, `preview-primitives.tsx`) or any file plans 001-007 list as theirs, beyond the exact call sites above.
- Do NOT convert links (`<a>`/`next/link`) to `Button` — buttons only.
- If a call site's markup has drifted from the excerpts (plans 001-007 are editing `motion-showcase.tsx`/`showcase-chrome.tsx`), apply the same substitution to the current code; if the component is gone, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck && npm run lint && npm run build && npm test`.
- **Feel check**: `npm run dev`:
  - Deep dive (e.g. `/rules/motion-4`): control button and 0.25× toggle look as before; toggle's pressed state is the filled inverse style; both scale to 0.96 on press (the `pressable` behavior) — previously the toggle had NO press feedback, now it does (this is a deliberate upgrade; motion-8 dogfooded).
  - Theme toggle + sidebar icon buttons: unchanged hover/press behavior, but transitions now run 140ms `ease-out-strong` (slightly snappier than the old 150ms default ease).
  - Rule page tags render identically in both themes; keyboard-focus any Button → visible ring.
- **Done when**: the four call-site groups render from the primitives, no visual regressions beyond documented token shifts, and `src/components/ui/` is the obvious home for the next control someone needs.
