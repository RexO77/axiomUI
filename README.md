# Axiom UI

> Understand the decision. See the difference. Build it better.

A visual field guide for making interfaces feel right. Compare what works with what doesn’t, see why, and take the same rules into your code. Built for designers and for builders who don’t want to guess at design.

**[Explore Axiom UI](https://axiomui.nischal.fyi)** · [Install agent skills](#agent-skills) · [Run locally](#development)

## What’s in V2

- **105 curated UI decisions**, each with a Do/Don’t example and an authored deep dive.
- **Interactive comparisons**: view static examples together or flip between them, zoom in, and try live demos for motion and interaction rules.
- **Search and collections**: find a rule, browse the Accessibility or Live demos collection, and move through the matching rules without losing your place.
- **Desktop and phone navigation**: a category rail on desktop; dedicated menu, search and rule navigation on phones, with touch-friendly comparison controls.
- **A redesigned deep-dive panel**: the desktop panel slides into place without a second layout jump, and the narrower layout reveals the explanation below the comparison. Keyboard toggles and reduced-motion mode stay instant.
- **Light and dark themes**, keyboard navigation, shortcut preferences and reduced-motion handling.
- **11 complete agent skills**, plus Markdown and JSON exports generated from the same ruleset.

The underlying data retains eight categories. The browser groups the catalog into seven sections and presents Accessibility as a cross-category collection. Skill coverage and the browser’s section counts therefore do not always match one-to-one.

These are practical guidelines with context, not universal laws. The deep dives explain why a pattern works, what breaks, how to apply it and what to review before making an exception.

## Explore a rule

Start with the gallery, use search, or choose a collection. Open a tile to compare the examples and read its deep dive. Copy the rule for an agent, export a short Markdown summary, or share its direct link.

A rule brings together:

- **The decision**: a title, context tags and a concrete guideline.
- **The comparison**: Do/Don’t examples with values and captions.
- **The reasoning**: an authored deep dive with application guidance and edge cases.
- **The next step**: related rules and navigation through the current catalog, search or collection.

### Keyboard shortcuts

| Key | Action |
| --- | --- |
| `⌘K` / `Ctrl+K` | Search |
| `J` / `K` | Next / previous rule |
| `Shift+J` / `Shift+K` | Next / previous category |
| `[` | Toggle the desktop sidebar |
| `D` | Switch the gallery between Do and Don’t |
| `F` / `Z` / `I` | Flip, zoom or toggle the deep dive on a rule |
| `Esc` | Dismiss search or return from a rule to the gallery |
| `?` or `⌘/` / `Ctrl+/` | Open the shortcut reference |

Single-key shortcuts can be turned off in the shortcut reference. `⌘/` / `Ctrl+/` remains available to turn them back on. Inputs and menus keep their own keyboard behavior.

## Agent skills

Install from GitHub:

```sh
npx skills add RexO77/axiomUI
```

Choose all skills or install only the ones you need. The three core skills each carry all 105 rules; domain skills carry focused selections and their own local references. The table below and machine catalog are generated from the reviewed distribution selection.

<!-- skills:start -->
| Skill | Group | Rules | What it covers | Install on its own |
|---|---|---|---|---|
| `axiomui` | Core | 105 | Every Axiom UI rule, indexed by domain, with full reasoning one file away. | `npx skills add RexO77/axiomUI --skill axiomui` |
| `axiomui-website-upgrade` | Core | 105 | A playbook for upgrading a real interface in code, backed by every Axiom UI rule. | `npx skills add RexO77/axiomUI --skill axiomui-website-upgrade` |
| `axiomui-audit` | Core | 105 | A read-only design review where every finding cites a rule, a location and a fix. | `npx skills add RexO77/axiomUI --skill axiomui-audit` |
| `axiomui-typography` | Domain | 13 | Casing, tracking, line height, weights, figures and wrapping for interface text. | `npx skills add RexO77/axiomUI --skill axiomui-typography` |
| `axiomui-layout` | Domain | 11 | Spacing scale, measure, proximity, optical alignment, gutters and z-index. | `npx skills add RexO77/axiomUI --skill axiomui-layout` |
| `axiomui-color` | Domain | 12 | Palette balance, contrast, semantic status, hover, dark mode and depth. | `npx skills add RexO77/axiomUI --skill axiomui-color` |
| `axiomui-components` | Domain | 12 | Button hierarchy, overlays, radii, icon buttons, disabled and loading states. | `npx skills add RexO77/axiomUI --skill axiomui-components` |
| `axiomui-forms` | Domain | 12 | Labels, field sizing, control choice, validation timing, hints and defaults. | `npx skills add RexO77/axiomUI --skill axiomui-forms` |
| `axiomui-system` | Domain | 13 | Loading, empty and error states, undo, optimistic updates, tokens and breakpoints. | `npx skills add RexO77/axiomUI --skill axiomui-system` |
| `axiomui-motion` | Domain | 31 | Exact durations, easing and gesture physics for UI motion. | `npx skills add RexO77/axiomUI --skill axiomui-motion` |
| `axiomui-accessibility` | Domain | 11 | Focus, contrast, target size, keyboard paths, labels and reduced motion. | `npx skills add RexO77/axiomUI --skill axiomui-accessibility` |
<!-- skills:end -->

The standalone `axiomui` npm installer is **not published yet**. For its source commands and local package workflow, see [`packages/axiomui/README.md`](packages/axiomui/README.md). Installing the GitHub skills does not require that package to be published.

## Machine-readable references

Use the same rules outside the browser:

| Endpoint | Contents |
| --- | --- |
| [`/llms.txt`](https://axiomui.nischal.fyi/llms.txt) | Catalog index and links to the rules and skills |
| [`/llms-full.txt`](https://axiomui.nischal.fyi/llms-full.txt) | Full ruleset as Markdown, including the reasoning |
| [`/rules.json`](https://axiomui.nischal.fyi/rules.json) | Structured rule data |

## Development

The web app uses Next.js, React, TypeScript and Tailwind CSS. Use **Node.js 22.18 or later** for the repository; the standalone installer's lower runtime requirement is separate.

```sh
git clone https://github.com/RexO77/axiomUI.git
cd axiomUI
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). For a production build, run `npm run build`, then `npm start`.

### Checks

Run the repository gate before submitting changes:

```sh
npm run lint
npm run typecheck
npm run check
npm run skills:check
npm test
npm run build
```

`npm run check` verifies authored deep dives for all 105 rules. `npm run skills:check` verifies the generated skills, references, catalog and README tables against their source.

For browser coverage:

```sh
npx playwright install chromium
npm run e2e
```

The browser command builds and serves the production app, then runs the Chromium suite. Set `E2E_PORT` to use a different port. For UI changes, also exercise the affected flow in the dev server, including interrupted interactions, keyboard paths, phone layouts and reduced motion.

### Repository structure

| Path | Purpose |
| --- | --- |
| `src/app/` | Routes, generated endpoints and global styles |
| `src/components/` | Catalog, gallery, shell, comparisons and rule views |
| `src/data/` | Rules, taxonomy and deep-dive content |
| `src/lib/navigation/` | Routing, history, keyboard behavior and preferences |
| `src/lib/skills/` | Skill source catalog, distribution selection and renderer |
| `skills/`, `skills.sh.json` | Generated skill folders and machine catalog |
| `packages/axiomui/` | Standalone installer source and smoke tests |
| `e2e/` | Production browser regression suite |

## Contributing

Read [AGENTS.md](AGENTS.md) for the repository guidelines. Keep examples, captions and numeric claims aligned: the consistency tests check the meaning of the rules, not just their syntax.

Do not hand-edit generated skills, catalogs or the marked skills tables. Change the source under `src/lib/skills/`, then run `npm run skills:build` and `npm run skills:check`. If changing installer behavior, also run its checkout and tarball smoke tests described in the repository guidelines.

## License

[MIT](LICENSE) · Built by [Nischal Skanda](https://nischal.fyi).
