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
| `axiomui-audit` | Core | 105 | A read-only design review where every finding cites a rule, a location and a fix. | `npx skills add RexO77/axiomUI --skill axiomui-audit` |
| `axiomui-typography` | Domain | 13 | Casing, tracking, line height, weights, figures and wrapping for interface text. | `npx skills add RexO77/axiomUI --skill axiomui-typography` |
| `axiomui-system` | Domain | 13 | Loading, empty and error states, undo, optimistic updates, tokens and breakpoints. | `npx skills add RexO77/axiomUI --skill axiomui-system` |
| `axiomui-motion` | Domain | 31 | Exact durations, easing and gesture physics for UI motion. | `npx skills add RexO77/axiomUI --skill axiomui-motion` |

Rules and reasoning: https://axiomui.nischal.fyi
