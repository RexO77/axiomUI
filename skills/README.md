# Axiom UI agent skills

Axiom UI's 112 UI design rules, packaged as agent skills for Claude Code, Codex, Cursor, OpenCode, Gemini CLI, GitHub Copilot and Windsurf.

**These files are generated. Do not edit them by hand.** Change rules in `src/data/`, skill prose in `src/lib/skills/templates/`, then run `npm run skills:build`. CI fails when this folder is out of sync.

## Install

```sh
npx skills add RexO77/axiomUI
```

## Skills

Each listed skill is complete and self-contained. Core skills carry every rule; domain skills carry focused rules with sharper triggers. The npm installer has not been published; install these files from GitHub.

| Skill | Group | Rules | What it covers | Install on its own |
|---|---|---|---|---|
| `axiomui` | Core | 112 | Every Axiom UI rule, indexed by domain, with full reasoning one file away. | `npx skills add RexO77/axiomUI --skill axiomui` |
| `axiomui-website-upgrade` | Core | 112 | A step-by-step guide to improving an existing interface in code using Axiom UI rules. | `npx skills add RexO77/axiomUI --skill axiomui-website-upgrade` |
| `axiomui-audit` | Core | 112 | A read-only design review where every finding cites a rule, a location and a fix. | `npx skills add RexO77/axiomUI --skill axiomui-audit` |
| `axiomui-typography` | Domain | 17 | Interface text, from labels and display headings to long passages and mixed-direction names. | `npx skills add RexO77/axiomUI --skill axiomui-typography` |
| `axiomui-layout` | Domain | 15 | Grouping, measure, padding, alignment, sticky headers, media space, crops and reflow. | `npx skills add RexO77/axiomUI --skill axiomui-layout` |
| `axiomui-color` | Domain | 9 | Accent and status roles, text and control contrast, hover feedback, dark themes and elevation. | `npx skills add RexO77/axiomUI --skill axiomui-color` |
| `axiomui-components` | Domain | 15 | Action hierarchy, links and buttons, product evidence, overlays, button states and charts. | `npx skills add RexO77/axiomUI --skill axiomui-components` |
| `axiomui-forms` | Domain | 15 | Field labels, input purpose, choices, validation, retaining answers after errors and sign-in codes. | `npx skills add RexO77/axiomUI --skill axiomui-forms` |
| `axiomui-system` | Domain | 14 | Loading, empty states, error recovery, return to results, hit areas, keyboard, reflow and motion. | `npx skills add RexO77/axiomUI --skill axiomui-system` |
| `axiomui-motion` | Domain | 26 | Timing, easing, interruption, gestures, reduced motion and browser animation performance. | `npx skills add RexO77/axiomUI --skill axiomui-motion` |
| `axiomui-accessibility` | Domain | 23 | Keyboard focus, targets, contrast, links, headings, drag alternatives, pause controls and reflow. | `npx skills add RexO77/axiomUI --skill axiomui-accessibility` |

Rules and reasoning: https://axiomui.nischal.fyi
