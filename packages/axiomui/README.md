# axiomui

Axiom UI's rule library and website playbook as complete agent skills.
Install the distributed skills from GitHub:

```sh
npx skills add RexO77/axiomUI
```

The standalone npm installer has not been published yet. Its source is runnable
from this repository after generating the skills:

```sh
node packages/axiomui/bin/axiomui.mjs add
```

The installer uses Node 18.17 or later, built-in modules and local file copies.
It makes no network calls while installing bundled content. Package retrieval
through npm or the GitHub skills CLI is a separate network operation.

## Skills

The three core skills each carry all 105 rules. Domain skills carry focused rules
and their own complete local references. This table is generated from the same
reviewed distribution selection as the machine catalog.

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

## Commands from a checkout

```sh
node packages/axiomui/bin/axiomui.mjs add [skills...]
node packages/axiomui/bin/axiomui.mjs list
node packages/axiomui/bin/axiomui.mjs update [skills...]
node packages/axiomui/bin/axiomui.mjs remove [skills...]
```

Use full skill names, aliases such as `motion` and `audit`, or `core`, `domains`
and `all`. With no names, add asks in a terminal and selects core skills otherwise.
Run `node packages/axiomui/bin/axiomui.mjs --help` for the complete flag contract.

| Flag | Meaning |
| --- | --- |
| `--agent <list>` | Choose supported agent targets; comma-separated or repeatable |
| `--global` | Use user folders instead of project folders |
| `--dir <path>` | Use this skills folder, overriding agent and scope flags |
| `--all` | Select all relevant skills |
| `--yes` | Accept eligible operations without prompting |
| `--dry-run` | Show the plan without writing |
| `--force` | Replace conflicting managed content or foreign entries without following links |
| `--json` | Machine-readable output without prompts; does not independently authorize legacy cleanup |
| `--no-color` | Disable color; `NO_COLOR` and `FORCE_COLOR` are also honored |

## Targets and ownership

The implemented mapping uses `.claude/skills` for Claude and `.agents/skills` for
shared targets. Global Claude targeting honors `CLAUDE_CONFIG_DIR`; shared global
targets use the home's `.agents/skills`. Physical destinations are deduplicated.
External agents' discovery behavior depends on their current version and configuration.

Each managed skill has a `.axiomui.json` sidecar. Unchanged installs preserve bytes
and mtimes; edited skills and foreign entries are skipped unless explicitly forced.
Unowned files survive removal. Target and file identities are rechecked before apply,
and changed legacy downloads are preserved. Exit codes are `0` success, `1` runtime error,
`2` usage error, `3` skipped skills and `130` cancellation.

## Package verification

From the repository root, generate and check skills, run the source gates, and
exercise `packages/axiomui/test/smoke.mjs` with a throwaway home/project. Local packing
bundles only validated catalogued files and a license. No second skills copy is
committed inside this package. Registry publication and release tags require separate
authorization; a successful local pack does not mean the package is published.
