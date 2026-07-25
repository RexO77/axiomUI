# PLAN: CI pipeline + data-integrity test suite

**Rank: 1 of 5 — do this first.** Every other plan in this batch will be executed by lower-tier models. This plan builds the safety net that catches their mistakes: a GitHub Actions pipeline and a vitest suite that locks down the invariants the whole site depends on (unique rule ids, valid categories, deep-dive coverage, showcase integrity, serializer formats). Cheapest plan, highest leverage.

## Goal

The repo has **zero tests and no CI** (`.github/` does not exist). The only guardrail is `scripts/check-deep-dives.mjs`, which is regex-based and only checks deep-dive key validity. Meanwhile the site's correctness rests entirely on hand-maintained data invariants across four files (`ui-logic.ts`, `deep-dives.ts`, `showcase-specs.tsx`, `rule-text.ts`) that nothing verifies. Add:

1. A **vitest** data-integrity suite (pure Node, no DOM needed).
2. A **GitHub Actions workflow** running lint, typecheck, tests, the deep-dive check, and a production build on every push and PR.

## Files to touch

| File | Change |
|---|---|
| `package.json` | Add `vitest` devDependency; add `test` and `typecheck` scripts |
| `vitest.config.ts` (NEW) | Alias `@` → `src`, node environment |
| `src/data/__tests__/rules.test.ts` (NEW) | Rule-corpus invariants |
| `src/data/__tests__/deep-dives.test.ts` (NEW) | Deep-dive coverage + shape |
| `src/data/__tests__/showcase-specs.test.ts` (NEW) | Showcase spec integrity |
| `src/lib/__tests__/rule-text.test.ts` (NEW) | Serializer format locks |
| `src/lib/__tests__/rule-helpers.test.ts` (NEW) | getAdjacentRules / getRelatedRules invariants |
| `.github/workflows/ci.yml` (NEW) | The pipeline |

Do **not** touch any `src` file outside `__tests__` directories. This plan is purely additive.

## Implementation order

### Step 1 — install and wire vitest

```bash
npm install --save-dev vitest
```

In `package.json` scripts, add (keep existing scripts untouched):

```json
"test": "vitest run",
"typecheck": "tsc --noEmit"
```

Create `vitest.config.ts` at the repo root:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
    test: {
        environment: "node",
        include: ["src/**/__tests__/**/*.test.ts"],
    },
});
```

Do NOT add `jsdom` or `@testing-library/*` — these are data tests, not component tests. Keep the dependency footprint to vitest alone.

### Step 2 — rule-corpus invariants (`src/data/__tests__/rules.test.ts`)

```ts
import { describe, expect, it } from "vitest";
import { categories, rules } from "@/data/ui-logic";

const PREFIX_TO_CATEGORY: Record<string, string> = {
    typo: "typography",
    layout: "layout",
    color: "color",
    comp: "components",
    form: "forms",
    sys: "system",
    motion: "motion",
    a11y: "accessibility",
};

describe("rule corpus", () => {
    it("has unique ids", () => {
        const ids = rules.map((rule) => rule.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it("has no empty required fields", () => {
        for (const rule of rules) {
            expect(rule.title.trim()).not.toBe("");
            expect(rule.desc.trim()).not.toBe("");
            expect(rule.do.trim()).not.toBe("");
            expect(rule.dont.trim()).not.toBe("");
            expect(rule.tags.length).toBeGreaterThan(0);
        }
    });

    it("only uses declared categories", () => {
        const categoryIds = new Set(categories.map((category) => category.id));
        for (const rule of rules) {
            expect(categoryIds.has(rule.category), `${rule.id} → ${rule.category}`).toBe(true);
        }
    });

    it("id prefixes match their category", () => {
        for (const rule of rules) {
            const prefix = rule.id.replace(/-\d+$/, "");
            expect(PREFIX_TO_CATEGORY[prefix], `unknown prefix on ${rule.id}`).toBe(rule.category);
        }
    });

    it("every category has at least one rule", () => {
        for (const category of categories) {
            expect(rules.some((rule) => rule.category === category.id), category.id).toBe(true);
        }
    });
});
```

### Step 3 — deep-dive invariants (`src/data/__tests__/deep-dives.test.ts`)

The drawer looks sections up **by exact title string** — that contract is the most fragile thing in the codebase, so lock it here too.

```ts
import { describe, expect, it } from "vitest";
import { ruleDeepDives } from "@/data/deep-dives";
import { buildDeepDive, rules } from "@/data/ui-logic";

describe("deep dives", () => {
    it("every key is a real rule id", () => {
        const ruleIds = new Set(rules.map((rule) => rule.id));
        for (const key of Object.keys(ruleDeepDives)) {
            expect(ruleIds.has(key), `unknown deep-dive key: ${key}`).toBe(true);
        }
    });

    it("covers all rules", () => {
        for (const rule of rules) {
            expect(ruleDeepDives[rule.id], `missing deep dive: ${rule.id}`).toBeDefined();
        }
    });

    it("authored overrides have exactly 3 review prompts and 3-5 implementation notes", () => {
        for (const [id, dive] of Object.entries(ruleDeepDives)) {
            if (dive.reviewPrompts) expect(dive.reviewPrompts.length, id).toBe(3);
            if (dive.implementationNotes) {
                expect(dive.implementationNotes.length, id).toBeGreaterThanOrEqual(3);
                expect(dive.implementationNotes.length, id).toBeLessThanOrEqual(5);
            }
        }
    });

    it("buildDeepDive emits the exact section titles the drawer keys on", () => {
        const sections = buildDeepDive(rules[0]);
        expect(sections.map((section) => section.title)).toEqual([
            "Summary",
            "Why it matters",
            "Risk when ignored",
            "Implementation notes",
            "Design review prompts",
            "Recommended",
            "Avoid",
        ]);
    });
});
```

> **Coordination note:** if PLAN-client-bundle-diet lands first, `buildDeepDive` moves to `@/data/deep-dive-builder` — update the import in that one test accordingly. Everything else is unaffected.

### Step 4 — showcase-spec integrity (`src/data/__tests__/showcase-specs.test.ts`)

Importing `showcase-specs.tsx` is safe in a node environment: the JSX lives inside `scene: (size) => …` closures that are never invoked at import time. Do NOT call any `scene()` function in tests — that would require a DOM renderer.

```ts
import { describe, expect, it } from "vitest";
import { hasShowcase, showcaseSpecs } from "@/components/features/rules/demos/showcase-specs";
import { rules } from "@/data/ui-logic";

const TRIGGERS = new Set(["replay", "action", "toggle", "press", "hover", "drag"]);

describe("showcase specs", () => {
    it("every spec key is a real rule id", () => {
        const ruleIds = new Set(rules.map((rule) => rule.id));
        for (const key of Object.keys(showcaseSpecs)) {
            expect(ruleIds.has(key), `unknown showcase key: ${key}`).toBe(true);
        }
    });

    it("covers every motion rule (no motion rule falls to the generic placeholder)", () => {
        for (const rule of rules.filter((r) => r.category === "motion")) {
            expect(hasShowcase(rule.id), `motion rule without showcase: ${rule.id}`).toBe(true);
        }
    });

    it("specs are structurally complete", () => {
        for (const [id, spec] of Object.entries(showcaseSpecs)) {
            expect(TRIGGERS.has(spec.trigger), `${id} trigger`).toBe(true);
            for (const variant of ["do", "dont"] as const) {
                expect(spec[variant].caption.trim(), `${id}.${variant} caption`).not.toBe("");
                expect(spec[variant].tracks.length, `${id}.${variant} tracks`).toBeGreaterThan(0);
                expect(typeof spec[variant].scene, `${id}.${variant} scene`).toBe("function");
            }
            if (spec.trigger === "toggle" || spec.trigger === "press" || spec.trigger === "hover") {
                expect(spec.do.exitTracks?.length, `${id}.do exitTracks required for ${spec.trigger}`).toBeGreaterThan(0);
            }
        }
    });

    it("every track has explicit start AND end keyframes (deterministic replay)", () => {
        for (const [id, spec] of Object.entries(showcaseSpecs)) {
            for (const variant of ["do", "dont"] as const) {
                for (const track of spec[variant].tracks) {
                    expect(track.keyframes.length, `${id}.${variant} → ${track.target}`).toBeGreaterThanOrEqual(2);
                }
            }
        }
    });
});
```

### Step 5 — serializer + helper locks (`src/lib/__tests__/rule-text.test.ts`, `rule-helpers.test.ts`)

`rule-text.test.ts` — the copy button's output format is a user-facing contract; freeze it byte-for-byte:

```ts
import { describe, expect, it } from "vitest";
import { allRulesMarkdown, ruleToText } from "@/lib/rule-text";
import { rules } from "@/data/ui-logic";

describe("rule-text serializers", () => {
    it("ruleToText matches the frozen clipboard format", () => {
        const rule = rules.find((r) => r.id === "typo-1")!;
        expect(ruleToText(rule, "https://example.com")).toBe(
            [
                "Sentence Case Is King (Typography & Text)",
                "Never use Title Case for buttons, labels, or headers. It slows down reading speed by disrupting word shapes.",
                "",
                "Do: Create new account",
                "Don't: Create New Account",
                "",
                "https://example.com/rules/typo-1",
            ].join("\n")
        );
    });

    it("allRulesMarkdown has one H3 per rule and no timestamps", () => {
        const markdown = allRulesMarkdown();
        expect(markdown.match(/^### /gm)?.length).toBe(rules.length);
        expect(markdown).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
    });
});
```

`rule-helpers.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getAdjacentRules, getRelatedRules, rules } from "@/data/ui-logic";

describe("getAdjacentRules", () => {
    it("first rule of a category has no prev; last has no next; middles have both", () => {
        const typography = rules.filter((rule) => rule.category === "typography");
        expect(getAdjacentRules(typography[0]).prev).toBeNull();
        expect(getAdjacentRules(typography[0]).next?.id).toBe(typography[1].id);
        expect(getAdjacentRules(typography[typography.length - 1]).next).toBeNull();
    });

    it("never crosses category boundaries", () => {
        for (const rule of rules) {
            const { prev, next } = getAdjacentRules(rule);
            if (prev) expect(prev.category).toBe(rule.category);
            if (next) expect(next.category).toBe(rule.category);
        }
    });
});

describe("getRelatedRules", () => {
    it("never returns the rule itself, never duplicates, caps at 3", () => {
        for (const rule of rules) {
            const related = getRelatedRules(rule);
            expect(related.length).toBeLessThanOrEqual(3);
            expect(related.some((r) => r.id === rule.id)).toBe(false);
            expect(new Set(related.map((r) => r.id)).size).toBe(related.length);
        }
    });
});
```

### Step 6 — the workflow (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run check
      - run: npm test
      - run: npm run build
```

`package-lock.json` exists at the repo root, so `npm ci` is correct — do not switch to `npm install`.

## Edge cases found during exploration (a weaker model will miss these)

1. **`showcase-specs.tsx` has a `"use client"`-free import chain but contains JSX.** Vitest transpiles TSX natively; importing the module is safe because no JSX is *evaluated* at module scope. If the import ever fails on `preview-primitives` (it has `"use client"` at the top — a no-op string literal outside Next), do NOT add jsdom; the string directive is inert in Node and the module has no `window` access at module scope.
2. **Do not call `scene(size)` in any test.** It returns React elements needing a renderer. Structural checks only.
3. **The `test` script must be `vitest run`, not `vitest`** — bare `vitest` starts watch mode and hangs CI forever.
4. **`npm run check` (the deep-dive regex script) stays in CI alongside the vitest coverage test.** They overlap but the script is what contributors run locally; keep both.
5. **`typecheck` must be a script**, not inlined in the workflow as `npx tsc --noEmit`, so local usage and CI stay identical.
6. **Vitest and Next both want to own `tsconfig` paths.** The `@` alias in `vitest.config.ts` must point at `./src` exactly as `tsconfig.json`'s `paths` does — verify with `grep -A3 '"paths"' tsconfig.json` before writing the config.
7. **The build step in CI is the slowest (~1 min) and must come last** so fast failures (lint/type/test) short-circuit first.

## Acceptance criteria

1. `npm test` passes locally with all 5 test files discovered (vitest reports 5 files, ≥ 14 tests).
2. `npm run lint`, `npm run typecheck`, `npm run check`, `npm run build` all still pass.
3. Mutation check A: temporarily duplicate a rule id in `ui-logic.ts` → `npm test` fails on "has unique ids". Revert.
4. Mutation check B: temporarily rename the `"Why it matters"` title string inside `buildDeepDive` → `npm test` fails on the section-titles test. Revert.
5. Mutation check C: temporarily delete the `"motion-18"` entry from `showcaseSpecs` → `npm test` fails on motion coverage. Revert.
6. Push a branch → the GitHub Actions run appears and passes all six steps (visible in the repo's Actions tab).
7. `git status` clean except the new files; no changes to any existing `src` file.
