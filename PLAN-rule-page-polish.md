# PLAN: De-duplicate and restyle the /rules/[id] deep-dive layout

**Rank: 4 of 5.** The 106 static rule pages render the deep dive as a raw dump of all seven sections, which duplicates content already on the page: `rule.desc` appears twice (page header + "Summary" section) and `rule.do`/`rule.dont` appear twice each (the Do/Don't cards + trailing "Recommended"/"Avoid" code blocks). The drawer renders the same data through a curated layout with better labels ("How to apply it", "Why it works", "What breaks", "Review questions"). Bring the page up to the drawer's standard — it's the version search engines index.

## Goal

1. Extract the drawer's private section-lookup helpers into a shared module.
2. On `/rules/[id]`, replace the generic `deepDive.map(...)` dump with the drawer's curated section set, dropping the three duplicate sections.
3. Leave the drawer's rendering pixel-identical (it only changes where it imports helpers from).

## Files to touch

| File | Change |
|---|---|
| `src/lib/deep-dive-sections.ts` (NEW) | Shared `findTextSection` / `findListSection` / `findCodeSection` |
| `src/components/features/rules/rule-drawer.tsx` | Delete its private copies; import from the new module |
| `src/app/rules/[id]/page.tsx` | Curated section rendering |

Do **not** touch `buildDeepDive` or any data file. The section title strings (`"Summary"`, `"Why it matters"`, `"Risk when ignored"`, `"Implementation notes"`, `"Design review prompts"`, `"Recommended"`, `"Avoid"`) are a load-bearing contract — this plan consumes them, never changes them.

## Implementation order

### Step 1 — shared helpers `src/lib/deep-dive-sections.ts`

Move the three functions currently defined at the bottom of `rule-drawer.tsx` (below the component) verbatim into a new shared module, adding `export`:

```ts
import type { DeepDiveSection } from "@/data/ui-logic";

export function findTextSection(sections: DeepDiveSection[], title: string): string | null {
  const section = sections.find((item) => item.type === "text" && item.title === title);
  return section?.type === "text" ? section.content : null;
}

export function findListSection(sections: DeepDiveSection[], title: string): string[] {
  const section = sections.find((item) => item.type === "list" && item.title === title);
  return section?.type === "list" ? section.items : [];
}

export function findCodeSection(sections: DeepDiveSection[], title: string): string | null {
  const section = sections.find((item) => item.type === "code" && item.title === title);
  return section?.type === "code" ? section.code : null;
}
```

No `"use client"` directive — this must be importable from both the client drawer and the server page.

### Step 2 — rewire the drawer (mechanical)

In `rule-drawer.tsx`: delete the three private function definitions at the bottom of the file, and add to the imports:

```ts
import { findCodeSection, findListSection, findTextSection } from "@/lib/deep-dive-sections";
```

Nothing else in the drawer changes. Its rendered output must be byte-identical.

### Step 3 — curated rendering on the rule page

In `src/app/rules/[id]/page.tsx`:

1. Add imports: `AlertTriangle` to the existing lucide import, and the two helpers:

```ts
import { findListSection, findTextSection } from "@/lib/deep-dive-sections";
```

(`findCodeSection` is intentionally NOT needed — the code sections are the duplicates being dropped.)

2. After `const deepDive = buildDeepDive(rule);`, derive the curated sections:

```ts
    const whyItMatters = findTextSection(deepDive, "Why it matters");
    const riskWhenIgnored = findTextSection(deepDive, "Risk when ignored");
    const implementationNotes = findListSection(deepDive, "Implementation notes");
    const reviewPrompts = findListSection(deepDive, "Design review prompts");
```

3. Replace the entire `{/* Deep Dive Sections */}` block — the `<div className="space-y-8">` containing `deepDive.map(...)` — with:

```tsx
                    {/* Deep Dive Sections — curated to match the drawer; the
                        Summary and Recommended/Avoid sections are omitted here
                        because desc and the Do/Don't cards already show them. */}
                    <div className="space-y-10">
                        {implementationNotes.length > 0 && (
                            <section>
                                <h2 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                                    How to apply it
                                </h2>
                                <ol className="space-y-4">
                                    {implementationNotes.map((item, index) => (
                                        <li key={`${item}-${index}`} className="flex gap-4">
                                            <span className="mt-0.5 w-5 shrink-0 text-right text-sm text-neutral-400 dark:text-neutral-500">
                                                {index + 1}
                                            </span>
                                            <p className="text-neutral-600 dark:text-neutral-300">{item}</p>
                                        </li>
                                    ))}
                                </ol>
                            </section>
                        )}

                        {whyItMatters && (
                            <section>
                                <h2 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                                    Why it works
                                </h2>
                                <p className="prose-justify text-neutral-600 dark:text-neutral-300">{whyItMatters}</p>
                            </section>
                        )}

                        {riskWhenIgnored && (
                            <section>
                                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                                    <AlertTriangle aria-hidden="true" className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                    What breaks
                                </h2>
                                <p className="prose-justify text-neutral-600 dark:text-neutral-300">{riskWhenIgnored}</p>
                            </section>
                        )}

                        {reviewPrompts.length > 0 && (
                            <section>
                                <h2 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                                    Review questions
                                </h2>
                                <ol className="space-y-4">
                                    {reviewPrompts.map((item, index) => (
                                        <li key={`${item}-${index}`} className="flex gap-4">
                                            <span className="mt-0.5 w-5 shrink-0 text-right text-sm text-neutral-400 dark:text-neutral-500">
                                                {index + 1}
                                            </span>
                                            <p className="text-neutral-600 dark:text-neutral-300">{item}</p>
                                        </li>
                                    ))}
                                </ol>
                            </section>
                        )}
                    </div>
```

Section order is deliberate and mirrors the drawer: actionable steps first, rationale second, failure mode third, review checklist last.

## Edge cases found during exploration (a weaker model will miss these)

1. **Do NOT rename the data-side titles.** The page displays "Why it works" while looking up `"Why it matters"` — this display-vs-data split is the established pattern (the drawer does exactly the same). Changing the lookup string silently hides the section with no error.
2. **The drawer refactor must be extraction-only.** If the helper bodies change in ANY way (even a trimmed string), the drawer's fallback chain (`findTextSection(...) ?? activeRule?.desc`) can change behavior. Copy verbatim.
3. **`page.tsx` is a server component** — the shared helpers module must have no `"use client"` directive and no browser APIs. It's pure functions over data; keep it that way.
4. **Heading semantics:** the page's sections use `<h2>` (page has an `<h1>` title). The drawer uses `<h4>` under its own hierarchy. Do not copy the drawer's `h4`s into the page.
5. **The JSON-LD block reads `rule.do`/`rule.dont` directly, not the removed code sections** — no structured-data change is needed. Verify by grepping: `grep -n "HowToStep" src/app/rules/\[id\]/page.tsx` still shows both steps.
6. **The "Related rules" section and bottom prev/next nav sit AFTER the deep-dive block** — insert the replacement exactly where the old block was, inside `<article>`, so the related/nav sections stay outside the article as they are today.
7. **If PLAN-ci-guardrails has landed**, its `buildDeepDive` section-titles test must still pass — this plan doesn't touch `buildDeepDive`, so any failure there means you changed the wrong thing.

## Acceptance criteria

Run `npm run dev` and check `http://localhost:3000/rules/typo-3`:

1. `npm run lint`, `npx tsc --noEmit`, `npm run build` (all 106 pages) pass. If the vitest suite exists, `npm test` passes untouched.
2. The page shows exactly four deep-dive headings in order: "How to apply it", "Why it works", "What breaks", "Review questions". No "Summary", "Recommended", or "Avoid" headings anywhere on the page (`curl -s localhost:3000/rules/typo-3 | grep -c "Summary"` → 0).
3. `rule.desc` appears exactly once in the rendered page (in the header). The literal `rule.do` string ("Size: 16px / Line-height: 24px") appears exactly once (in the Do card) — no trailing `<pre>` blocks remain.
4. "What breaks" shows the amber warning icon; both numbered lists render with the number gutter (visually match the drawer's list treatment).
5. Open the drawer on `/?rule=typo-3` and compare against a screenshot taken before the change: identical (the drawer only changed import paths).
6. Dark mode: all four sections legible (they reuse existing neutral tokens).
7. Spot-check an authored rule (`/rules/motion-8`): "How to apply it" lists the scale(0.96) steps; "Review questions" shows exactly 3 items.
