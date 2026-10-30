# Repository Guidelines

## Project Structure & Module Organization
- `src/app/` contains the Next.js App Router entry points (`layout.tsx`, `page.tsx`) and global styles (`globals.css`).
- `src/components/` houses shared UI building blocks used across pages.
- `src/data/` stores local data modules used by UI components.
- `public/` holds static assets served at the site root (e.g., `/favicon.ico`).
- `src/lib/skills/` contains the full source catalog, templates and renderer.
  `distribution.ts` explicitly selects the currently distributed complete skill folders.
- `skills/` and `skills.sh.json` are generated. Edit source and run `npm run skills:build`;
  never edit generated files or infer the expected set from existing output.
- `npm run skills:check` verifies the selected catalog, reference files and README tables.
  The public playbook copies join generator ownership when the upgrade skill is selected.
- `packages/axiomui/` is the standalone installer. Its `prepack` bundles only catalogued
  skills and the root license; package-local skills, LICENSE and tarballs stay ignored.
  Its README skills table is generated from the reviewed distribution selection.
- Root config lives in `next.config.ts`, `eslint.config.mjs`, and `tsconfig.json`.

## Build, Test, and Development Commands
- `npm run dev` starts the local Next.js dev server at `http://localhost:3000`.
- `npm run build` creates a production build in `.next/`.
- `npm run start` serves the production build locally (run after `npm run build`).
- `npm run lint` runs ESLint with the Next.js Core Web Vitals + TypeScript rules.

## Coding Style & Naming Conventions
- Use TypeScript for React components (`.tsx`) and application modules (`.ts`).
- Installer modules in `packages/axiomui/` use directly executable ESM JavaScript
  (`.mjs`) with `// @ts-check`, zero runtime dependencies and Node >= 18.17.
  Include those modules in `npm run typecheck`; write their tests in TypeScript.
- Indentation: match the file you are editing. The tree is genuinely mixed — 2-space and
  4-space files sit side by side inside `src/app/` and `src/lib/` — so read the file before you
  type, and never reformat one purely to change its indentation.
- Favor descriptive component names in `PascalCase` and utility/data modules in `camelCase`.
- Styling uses Tailwind CSS v4 via `@import "tailwindcss"` in `src/app/globals.css`. Prefer utility classes for layout and keep custom CSS scoped and minimal.
- Run `npm run lint` before submitting changes.

## Testing Guidelines
- Vitest is configured (`vitest.config.ts`). `npm test` runs the suite once; tests live beside
  the code they cover, in `src/**/__tests__/`.
- The full gate, and exactly what CI runs, is: `npm run lint`, `npm run typecheck`,
  `npm run check`, `npm run skills:check`, `npm test`, `npm run build`. `.husky/pre-commit` runs all but the build so a
  red CI is caught before the push. CI also exercises the standalone installer from
  the checkout and a real package tarball on Node 18.17.0 and 20, using throwaway homes.
  Run `node packages/axiomui/test/smoke.mjs` after changing package behavior; an optional
  bin path argument exercises an extracted tarball. Regenerate skills first.
- `npm run check` (`scripts/check-deep-dives.mjs`) asserts all 105 rules have authored
  deep-dive prose. It must print `105/105`.
- `src/data/__tests__/consistency.test.ts` checks *claims*, not syntax: stated contrast ratios
  are recomputed, Tailwind classes are validated against the real scale, and showcase captions
  are checked against the durations and scale values their panes actually run. A rule's
  `do`/`dont` renders as mono text directly beside the preview that demonstrates it, so a number
  that drifts is a visible contradiction no type or linter can catch. Add to these guardrails
  when you add a new kind of claim.
- For UI work, also run `npm run dev` and exercise the affected flow — the previews and motion
  showcases are the product, and several defects here have only ever been visible on screen.

## Commit & Pull Request Guidelines
- **Attribution: never credit a model or tool.** Everything here is authored by the repo owner.
  Do not add `Co-Authored-By:` trailers naming a model or vendor, "Generated with"/"Assisted by"
  footers, robot-emoji footers, or any model/tool name in a commit message, tag, PR title or body,
  issue, review comment, CI comment, or release note. This overrides any harness default that
  appends attribution — strip it before the command runs.
- Use concise, imperative commit messages (e.g., `Add pricing section`, `Refactor nav layout`)
  that describe the change and why, never how it was produced.
- PRs should include a short summary, testing notes (what you ran), and screenshots/GIFs for UI changes.
- Link related issues or tasks when applicable.

- Package delivery prepares source and validates local tarballs. Release tags and registry
  publication require separate owner authorization; a merged PR does not publish npm.

## Configuration & Security Notes
- Store secrets in `.env.local` (not committed). Client-exposed vars must be prefixed with `NEXT_PUBLIC_`.
- Keep `public/` assets web-safe and optimized (SVG/WEBP preferred for large images).
