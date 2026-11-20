# Axiom UI agent skills

Axiom UI's 108 UI design rules, packaged as agent skills for Claude Code, Codex, Cursor, OpenCode, Gemini CLI, GitHub Copilot and Windsurf.

**These files are generated. Do not edit them by hand.** Change rules in `src/data/`, skill prose in `src/lib/skills/templates/`, then run `npm run skills:build`. CI fails when this folder is out of sync.

## Install

```sh
npx skills add RexO77/axiomUI
```

## Skills

Each listed skill is complete and self-contained. Core skills carry every rule; domain skills carry focused rules with sharper triggers. The npm installer has not been published; install these files from GitHub.

| Skill | Group | Rules | What it covers | Install on its own |
|---|---|---|---|---|
| `axiomui` | Core | 108 | Every Axiom UI rule, indexed by domain, with full reasoning one file away. | `npx skills add RexO77/axiomUI --skill axiomui` |
| `axiomui-website-upgrade` | Core | 108 | A playbook for upgrading a real interface in code, backed by every Axiom UI rule. | `npx skills add RexO77/axiomUI --skill axiomui-website-upgrade` |
| `axiomui-audit` | Core | 108 | A read-only design review where every finding cites a rule, a location and a fix. | `npx skills add RexO77/axiomUI --skill axiomui-audit` |
| `axiomui-typography` | Domain | 14 | Interface text, from labels and tabular figures to long passages and mixed-direction names. | `npx skills add RexO77/axiomUI --skill axiomui-typography` |
| `axiomui-layout` | Domain | 12 | Grouping, measure, control padding, alignment, gutters and stacking across viewport sizes. | `npx skills add RexO77/axiomUI --skill axiomui-layout` |
| `axiomui-color` | Domain | 12 | Accent and status roles, text and control contrast, hover feedback, dark themes and elevation. | `npx skills add RexO77/axiomUI --skill axiomui-color` |
| `axiomui-components` | Domain | 13 | Action hierarchy, overlays, button states, icon labels, card links and chart alternatives. | `npx skills add RexO77/axiomUI --skill axiomui-components` |
| `axiomui-forms` | Domain | 13 | Field labels, choice controls, validation, reused answers, submission feedback and sign-in codes. | `npx skills add RexO77/axiomUI --skill axiomui-forms` |
| `axiomui-system` | Domain | 13 | Loading, empty states, recovery, timestamps, keyboard behavior, breakpoints and transitions. | `npx skills add RexO77/axiomUI --skill axiomui-system` |
| `axiomui-motion` | Domain | 31 | Timing, easing, interruption, gestures, reduced motion and browser animation performance. | `npx skills add RexO77/axiomUI --skill axiomui-motion` |
| `axiomui-accessibility` | Domain | 13 | Focus, targets, contrast, keyboard access, chart alternatives, authentication and reduced motion. | `npx skills add RexO77/axiomUI --skill axiomui-accessibility` |

Rules and reasoning: https://axiomui.nischal.fyi
