# Repository Guidelines

## Project Structure & Module Organization
- `src/app/` contains the Next.js App Router entry points (`layout.tsx`, `page.tsx`) and global styles (`globals.css`).
- `src/components/` houses shared UI building blocks used across pages.
- `src/data/` stores local data modules used by UI components.
- `public/` holds static assets served at the site root (e.g., `/favicon.ico`).
- Root config lives in `next.config.ts`, `eslint.config.mjs`, and `tsconfig.json`.

## Build, Test, and Development Commands
- `npm run dev` starts the local Next.js dev server at `http://localhost:3000`.
- `npm run build` creates a production build in `.next/`.
- `npm run start` serves the production build locally (run after `npm run build`).
- `npm run lint` runs ESLint with the Next.js Core Web Vitals + TypeScript rules.

## Coding Style & Naming Conventions
- Use TypeScript for all React components (`.tsx`) and modules (`.ts`).
- Indentation: 2 spaces, matching the current code style in `globals.css` and the TS files.
- Favor descriptive component names in `PascalCase` and utility/data modules in `camelCase`.
- Styling uses Tailwind CSS v4 via `@import "tailwindcss"` in `src/app/globals.css`. Prefer utility classes for layout and keep custom CSS scoped and minimal.
- Run `npm run lint` before submitting changes.

## Testing Guidelines
- No automated test framework is configured yet, and no `test` script exists in `package.json`.
- If you add tests, document the framework and add a `npm run test` script.
- Until then, verify changes by running `npm run dev` and exercising affected UI flows.

## Commit & Pull Request Guidelines
- Git history currently only contains the initial bootstrap commit, so no formal convention is established.
- Use concise, imperative commit messages (e.g., `Add pricing section`, `Refactor nav layout`).
- PRs should include a short summary, testing notes (what you ran), and screenshots/GIFs for UI changes.
- Link related issues or tasks when applicable.

## Configuration & Security Notes
- Store secrets in `.env.local` (not committed). Client-exposed vars must be prefixed with `NEXT_PUBLIC_`.
- Keep `public/` assets web-safe and optimized (SVG/WEBP preferred for large images).
