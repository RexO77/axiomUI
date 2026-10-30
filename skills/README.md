# Axiom UI agent skills

Axiom UI's 105 UI design rules, packaged as agent skills for Claude Code, Codex, Cursor, OpenCode, Gemini CLI, GitHub Copilot and Windsurf.

**These files are generated. Do not edit them by hand.** Change rules in `src/data/`, skill prose in `src/lib/skills/templates/`, then run `npm run skills:build`. CI fails when this folder is out of sync.

## Install

```sh
npx skills add RexO77/axiomUI
```

## Skills

Each listed skill is complete and self-contained. Core skills carry every rule; domain skills carry focused rules with sharper triggers. The npm installer has not been published; install these files from GitHub.

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

Rules and reasoning: https://axiomui.nischal.fyi
