# PLAN: Prev/next navigation inside the rule drawer

**Rank: 3 of 5.** The drawer is the primary reading surface (the homepage is where all traffic lands), yet moving between rules requires closing it and hunting for the next card. The static `/rules/[id]` pages already got prev/next navigation; give the drawer the same power — buttons plus arrow-key navigation — so a user can read an entire category without ever leaving the drawer.

## Goal

1. A **prev/next footer** at the bottom of the drawer body, navigating within the current category (same semantics as `getAdjacentRules` on the rule pages — no wrap-around).
2. **ArrowLeft / ArrowRight keyboard navigation** while the drawer is open (guarded so typing in inputs is unaffected).
3. **Scroll reset**: navigating to another rule scrolls the drawer body back to the top (today, switching rules preserves the old scroll offset — a pre-existing nuisance this plan fixes for card-clicks too).

## Files to touch

| File | Change |
|---|---|
| `src/components/features/rules/rule-drawer.tsx` | Footer nav, keyboard listener, scroll reset |
| `src/app/page.tsx` | Pass an `onNavigate` prop to `RuleDrawer` |

No other files. Do **not** modify `getAdjacentRules` in `ui-logic.ts` — reuse it as-is. Do not touch `rule-card.tsx`.

## Implementation order

### Step 1 — wire the navigation callback from the homepage

In `src/app/page.tsx`, `HomeBody` already has `openRule` (sets state + syncs the `rule` URL param via `history.replaceState`). Pass it to the drawer:

```tsx
      <RuleDrawer
        activeRule={activeRule}
        activeCategoryName={activeCategoryName}
        activeRuleId={activeRuleId}
        contentPending={Boolean(activeRuleId && activeRuleId !== deferredRuleId)}
        onClose={closeRule}
        onNavigate={openRule}
      />
```

### Step 2 — drawer plumbing

In `rule-drawer.tsx`:

1. Extend the props interface:

```ts
interface RuleDrawerProps {
  activeRule: Rule | null;
  activeCategoryName: string;
  activeRuleId: string | null;
  contentPending: boolean;
  onClose: () => void;
  onNavigate: (ruleId: string) => void;
}
```

2. Import `getAdjacentRules` (the file already imports `buildDeepDive` from `@/data/ui-logic` — extend that import). Import `ArrowLeft`, `ArrowRight` from `lucide-react` (extend the existing lucide import).

3. Compute adjacency near the top of the component body:

```ts
  const { prev, next } = activeRule
    ? getAdjacentRules(activeRule)
    : { prev: null, next: null };
```

### Step 3 — keyboard navigation

Add one effect (after the existing effects):

```ts
  // Arrow keys page through the category while the drawer is open.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      // Never hijack arrows from text inputs (the sidebar search stays usable).
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("input, textarea, [contenteditable]")) return;

      const targetRule = event.key === "ArrowLeft" ? prev : next;
      if (targetRule) {
        event.preventDefault();
        onNavigate(targetRule.id);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, prev, next, onNavigate]);
```

### Step 4 — scroll reset on rule change

The scroll container is the `div` with `className="drawer-scroll flex-1 overflow-y-auto px-5 pb-8 sm:px-7"` (it already carries `onScroll={handleScroll}`). Give it a ref:

```ts
  const scrollRef = useRef<HTMLDivElement>(null);
```

```tsx
            <div ref={scrollRef} onScroll={handleScroll} className="drawer-scroll flex-1 overflow-y-auto px-5 pb-8 sm:px-7">
```

And reset when the rule changes:

```ts
  // New rule → start reading from the top. Instant, not smooth: this is a
  // content swap, not a scroll animation (and reduced-motion-safe by default).
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [activeRuleId]);
```

### Step 5 — the footer nav

Inside the `activeRule` branch, after the closing `</div>` of the `key={activeRule.id}` grid (the `<div key={activeRule.id} className="grid gap-10">…</div>` block) but still inside the `rule-drawer-content` wrapper, add:

```tsx
                  {(prev || next) && (
                    <nav
                      aria-label="Adjacent rules"
                      className="flex items-center justify-between gap-4 border-t border-neutral-200 pt-6 dark:border-neutral-800"
                    >
                      {prev ? (
                        <button
                          type="button"
                          onClick={() => onNavigate(prev.id)}
                          className="pressable group inline-flex min-h-11 max-w-[45%] items-center gap-2 rounded-full text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                          aria-label={`Previous rule: ${prev.title}`}
                        >
                          <ArrowLeft aria-hidden="true" className="h-4 w-4 shrink-0" />
                          <span className="truncate">{prev.title}</span>
                        </button>
                      ) : <span />}
                      {next ? (
                        <button
                          type="button"
                          onClick={() => onNavigate(next.id)}
                          className="pressable group inline-flex min-h-11 max-w-[45%] items-center gap-2 rounded-full text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                          aria-label={`Next rule: ${next.title}`}
                        >
                          <span className="truncate">{next.title}</span>
                          <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                        </button>
                      ) : <span />}
                    </nav>
                  )}
```

The empty `<span />` placeholders keep `justify-between` from centering a lone button at category ends. Use `<button>`, not `<a href="/rules/…">` — navigation here is a state change on `/`, not a page load.

## Edge cases found during exploration (a weaker model will miss these)

1. **`onNavigate` must be `openRule`, not a bare `setActiveRuleId`.** `openRule` also syncs the `?rule=` URL param via `history.replaceState`, keeping deep links shareable mid-browse. Skipping the sync silently breaks the copy-link workflow.
2. **The keyboard listener must live in `RuleDrawer`, not the page**, and must be gated on `isOpen` — otherwise arrow keys navigate rules while the drawer is closed, which is invisible and deeply confusing.
3. **`event.target instanceof Element` guard is mandatory.** Window-level keydown events can have `window` itself as the target (no `.closest`); this exact bug was hit and fixed in the search-provider shortcut — do not reintroduce it.
4. **Do not `preventDefault()` unconditionally** — only when a target rule exists. At category ends the arrow key should fall through to native behavior (e.g. scrolling), not become a dead key.
5. **The header is keyed by category, the body by rule id** (`<header key={activeRule.category}>`, `<div key={activeRule.id}>`). Navigating within a category re-animates only the body — that's the existing intentional behavior; do not add keys or "fix" the animation.
6. **`behavior: "instant"`, not `"smooth"`, for the scroll reset.** Smooth scrolling during a content swap looks broken and violates reduced-motion expectations. (`"instant"` is a valid `ScrollBehavior` in the TS lib; if the TS version complains, use `scrollRef.current?.scrollTo(0, 0)`.)
7. **Drag showcases live inside the drawer** (motion-18/19/20). Their surfaces are `div`s, not inputs — the input guard correctly leaves arrow-keys active there, and arrows don't conflict with pointer dragging. Do not add the drag surface to the guard selector.
8. **The `deferredRuleId` pipeline means rapid arrow presses can outrun content rendering** — that's fine (React defers), but test criterion 6 below covers it; do not add debouncing.

## Acceptance criteria

Run `npm run dev` and verify on `/?rule=typo-2` (drawer open):

1. `npm run lint`, `npx tsc --noEmit`, `npm run build` pass.
2. The drawer shows a bottom nav: "← Sentence Case Is King" and "Line Height Math (Body) →". Clicking next loads typo-3 in the drawer without closing it, and the URL becomes `/?rule=typo-3`.
3. On `/?rule=typo-1` there is no prev button — the left slot is empty and the next button stays pinned right. On the last rule of a category (`/?rule=typo-13`) there is no next button. No wrap-around in either direction.
4. Press `ArrowRight` → next rule loads. Press `ArrowLeft` → previous rule loads. At a category end, the arrow key does nothing (no error, no wrap).
5. Focus the sidebar search input, type text containing no arrows, then press `ArrowLeft` with the cursor in the input → the caret moves inside the input; the drawer does NOT navigate.
6. Hold `ArrowRight` across 5+ rules quickly — no crash, no stuck state; the drawer settles on the final rule with its content fully rendered.
7. Scroll the drawer to the bottom, click next → the new rule starts scrolled to the top.
8. With the drawer closed, arrow keys do not change the URL.
9. Mobile viewport (375px): both footer buttons have ≥44px tap height and truncate long titles without overflowing.
