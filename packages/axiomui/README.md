# Axiom UI skill installer

The installer source is being prepared for package distribution. The npm package
is not published yet. Current skills can be installed from GitHub:

```sh
npx skills add RexO77/axiomUI
```

## Available skills

This table lists complete skill folders currently distributed in the repository.
Each folder includes all of its local references.

<!-- skills:start -->
| Skill | Group | Rules | What it covers | Install on its own |
|---|---|---|---|---|
| `axiomui-typography` | Domain | 13 | Casing, tracking, line height, weights, figures and wrapping for interface text. | `npx skills add RexO77/axiomUI --skill axiomui-typography` |
| `axiomui-system` | Domain | 13 | Loading, empty and error states, undo, optimistic updates, tokens and breakpoints. | `npx skills add RexO77/axiomUI --skill axiomui-system` |
| `axiomui-motion` | Domain | 31 | Exact durations, easing and gesture physics for UI motion. | `npx skills add RexO77/axiomUI --skill axiomui-motion` |
<!-- skills:end -->

## Development

Edit skill definitions and prose in `src/lib/skills/`, then run the root
`skills:build` and `skills:check` scripts. Package metadata, executable wiring and
standalone package smoke checks will be delivered with package integration.
