# PLAN: Move deep-dive content out of the homepage client bundle

**Rank: 5 of 5.** Verified with the current build: the authored deep-dive prose ships to every homepage visitor — `grep -rl "saccades" .next/static/chunks` matches a client chunk (that word exists only in `deep-dives.ts`). That's ~1,600 lines of strings (~100KB pre-gzip, plus the ~150-line category templates) parsed on every load of `/`, even though deep-dive content is only needed when a drawer opens. Split it out: the drawer lazy-loads it on demand; the static rule pages keep importing it synchronously on the server where it costs nothing.

## Goal

1. Extract `buildDeepDive` + its private dependencies out of `ui-logic.ts` into a new module, so `ui-logic.ts` (imported by the client homepage for filtering) no longer pulls in `deep-dives.ts`.
2. The drawer `import()`s the new module dynamically when a rule opens.
3. `rules/[id]/page.tsx` (server) imports it statically — build output unchanged.

## Files to touch

| File | Change |
|---|---|
| `src/data/deep-dive-builder.ts` (NEW) | `buildDeepDive`, `buildImplementationNotes`, `categoryDeepDive`, `defaultDeepDive`, `CategoryDeepDive` |
| `src/data/ui-logic.ts` | Remove all of the above + the `deep-dives` import; keep `DeepDiveSection` type |
| `src/components/features/rules/rule-drawer.tsx` | Lazy-load the builder |
| `src/app/rules/[id]/page.tsx` | Import `buildDeepDive` from the new module |

**Sequencing:** if PLAN-rule-page-polish and/or PLAN-ci-guardrails have landed, they reference `buildDeepDive` via `@/data/ui-logic` — update those imports too (the CI plan flagged this exact coordination point in its own text).

## Implementation order

### Step 1 — create `src/data/deep-dive-builder.ts`

Move, verbatim, from `ui-logic.ts`:

- the `CategoryDeepDive` type
- `defaultDeepDive`
- the entire `categoryDeepDive` record (all 8 category templates)
- `buildDeepDive` (exported)
- `buildImplementationNotes`

The new module's imports:

```ts
import { ruleDeepDives } from "@/data/deep-dives";
import type { DeepDiveSection, Rule } from "@/data/ui-logic";
```

`DeepDiveSection` and `Rule` stay defined in `ui-logic.ts`. This is a **type-only** import, so there is no runtime cycle (`ui-logic` will no longer import anything from this module or from `deep-dives`).

### Step 2 — slim `ui-logic.ts`

Delete from `ui-logic.ts`:

- `import { ruleDeepDives } from "@/data/deep-dives";` (line 1)
- the `CategoryDeepDive` type, `defaultDeepDive`, `categoryDeepDive`, `buildDeepDive`, `buildImplementationNotes`

Keep everything else: `Category`, `Rule`, `DeepDiveSection` types, `categories`, `rules`, `getAdjacentRules`, `getRelatedRules`. Do NOT re-export `buildDeepDive` from `ui-logic` "for compatibility" — a re-export recreates the exact dependency edge this plan removes.

### Step 3 — update the server page

In `src/app/rules/[id]/page.tsx`:

```ts
import { rules, categories, getAdjacentRules, getRelatedRules } from "@/data/ui-logic";
import { buildDeepDive } from "@/data/deep-dive-builder";
```

(One import moves; the call site is unchanged. Server component + SSG → the content lands in prerendered HTML exactly as before.)

### Step 4 — lazy-load in the drawer

In `rule-drawer.tsx`, replace the synchronous memo:

```ts
  const activeDeepDive = useMemo(
    () => activeRule ? buildDeepDive(activeRule) : [],
    [activeRule]
  );
```

with a lazy-loaded state (and drop `buildDeepDive` from the `@/data/ui-logic` import; drop `useMemo` from the react import if now unused):

```ts
  const [activeDeepDive, setActiveDeepDive] = useState<DeepDiveSection[]>([]);

  // Deep-dive prose is ~100KB of strings only needed once a drawer opens —
  // load it on demand instead of shipping it in the homepage bundle. After
  // the first open the module is cached, so navigation is synchronous-feeling.
  useEffect(() => {
    if (!activeRule) {
      setActiveDeepDive([]);
      return;
    }
    let cancelled = false;
    import("@/data/deep-dive-builder").then((mod) => {
      if (!cancelled) setActiveDeepDive(mod.buildDeepDive(activeRule));
    });
    return () => {
      cancelled = true;
    };
  }, [activeRule]);
```

Add `useState` to the react import if not present.

**Why this is safe with zero loading UI:** the drawer already has a complete fallback chain for missing sections — `summary ?? activeRule?.desc`, `recommended ?? activeRule?.do`, `avoid ?? activeRule?.dont`, and the list/aside sections simply don't render while empty. During the (one-time, few-ms) module load the drawer shows title, description, showcase, and Do/Don't — the authored prose pops in a frame later. Do not add a spinner.

## Edge cases found during exploration (a weaker model will miss these)

1. **The `cancelled` flag is not optional.** Rapid rule switching (or the arrow-key navigation from PLAN-drawer-navigation) fires overlapping loads; without the flag a stale resolve overwrites a newer rule's sections.
2. **`setActiveDeepDive([])` on `activeRule === null` matters** — otherwise closing and reopening the drawer flashes the previous rule's prose under the new title before the effect resolves.
3. **Type-only imports do not create cycles.** `deep-dive-builder` importing `type { Rule, DeepDiveSection }` from `ui-logic` while nothing flows back is a clean one-way graph. Verify with `npx tsc --noEmit` and by confirming `ui-logic.ts` contains zero references to `deep-dives` or `deep-dive-builder` after the change.
4. **`scripts/check-deep-dives.mjs` regex-reads `ui-logic.ts` for rule ids and `deep-dives.ts` for keys** — both untouched by this plan; `npm run check` must still report 106/106.
5. **If the CI plan's test imports `buildDeepDive` from `@/data/ui-logic`**, that import breaks — update it to `@/data/deep-dive-builder` (the CI plan's own text flags this).
6. **Do not use `next/dynamic`** — that's for components. A plain `import()` of a data module is the correct tool here.
7. **The webpack/turbopack chunk for the builder will include `deep-dives.ts`** (it's the point). Don't be alarmed that a new async chunk appears in the build output — it must, and it loads only on drawer open.
8. **`useDeferredValue` interplay:** the effect keys on `activeRule` (derived from `deferredRuleId`), matching the old memo's dependency exactly. Do not "improve" it to key on `activeRuleId` — that would fetch for a rule whose content the drawer isn't ready to render.

## Acceptance criteria

1. `npm run lint`, `npx tsc --noEmit`, `npm run build` pass; all 106 rule pages still generate. If the vitest suite exists, `npm test` passes (with the one import updated per edge case 5).
2. **The bundle proof:** after `npm run build`, `grep -rl "saccades" .next/static/chunks` still matches at least one chunk file (the new async one), BUT the page's *initial* JS no longer contains it. Verify the user-facing way: in the browser Network tab on a fresh load of `/`, no JS file fetched before interaction contains "saccades"; opening a drawer fetches one additional chunk that does. (Practical check: `npm run dev`, open `/` with Network open, filter JS, search responses.)
3. First Load JS for `/` in the build output shrinks versus the pre-change build (record both numbers in the commit message).
4. Drawer behavior: open `/?rule=motion-8` → title, desc, showcase, and Recommended/Avoid mono captions render immediately; "How to apply it" / "Why it works" / "What breaks" / "Review questions" appear (allow one frame). Navigate between rules — no flash of the previous rule's prose (edge case 2), no stale content after rapid switching (edge case 1).
5. Static page parity: `curl -s localhost:3000/rules/typo-3 | grep -c "saccades"` returns ≥1 — the server-rendered HTML still contains the authored prose (SEO unaffected).
6. `npm run check` still reports `deep dives authored: 106/106`.
7. `grep -n "deep-dives\|deep-dive-builder" src/data/ui-logic.ts` returns nothing.
