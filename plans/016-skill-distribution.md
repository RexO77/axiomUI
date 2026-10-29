# 016 — Axiom UI skill distribution

Status: selected complete skills distributed; full catalog, package and site integration pending.

This plan describes the intended distribution contract and the work still needed to
activate it. PR #33 is the source-foundation baseline; the table below follows the
incremental distribution delivery. This does not mean that the
npm package has been published or that the site advertises the new installation flow.

The current catalog has 105 rules and 11 skills. Counts and exact trigger text come
from `src/lib/skills/catalog.ts` and `src/data/ui-logic.ts`; do not maintain another
copy of those descriptions here.

## Delivery checkpoint

| Area | Current state | Source of truth |
| --- | --- | --- |
| Rule serialization | Implemented; shared by skill rendering and the full rules endpoint | `src/lib/rule-text.ts`, `src/lib/rule-corpus.ts` |
| Skill definitions | Implemented; three core skills and eight domain skills | `src/lib/skills/catalog.ts` |
| Skill documents | Renderer and authored templates implemented and tested in memory | `src/lib/skills/render.ts`, `src/lib/skills/templates/` |
| Generation command | Activated with an explicit source-controlled distribution selection | `scripts/build-skills.mjs`, `scripts/lib/register-ts.mjs` |
| Installer | Catalog loading, target resolution, managed operations, prompts and command handling implemented | `packages/axiomui/lib/` |
| Package bundling | Standalone bundler implemented; lifecycle activation pending | `packages/axiomui/scripts/bundle-skills.mjs` |
| Generated distribution | Complete selected domain folders delivered; remaining skills pending | Planned `skills/`, `skills.sh.json` and public copies |
| Package entry point | Manifest, bin, package documentation and standalone smoke test pending | Planned `packages/axiomui/package.json`, `bin/` and `test/` |
| Site installation flow | Pending; existing playbook UI remains | `src/components/features/skills/skill-bonus.tsx` |
| Synchronization gate | Selected output checked in CI and pre-commit; full-source rendering remains tested | `.github/workflows/ci.yml`, `.husky/pre-commit` |
| Publication | Separate owner action; no registry publication or release tag is authorized by this plan | Release prerequisites below |

Keep the install modal and rule-indexing requirements in
[015, W2-L](015-craft-round-5.md). This document specifies the distribution contract;
it does not remove that handoff, authorize edits to 015, or change its radius-reset
dependency. Do not edit `plans/README.md` as part of this source-plan delivery.

## Source and output ownership

Rules live in `src/data/`. Skill names, triggers, summaries, aliases, groups and
cross-listing live in `src/lib/skills/catalog.ts`. Authored prose lives in templates
whose filenames are not `SKILL.md`, so templates are not installable skill folders.

The renderer produces a complete tree keyed by repository-relative path. Each skill
owns its local references. No skill requires another skill to be installed first.

The intended generated outputs are:

- `skills/<name>/SKILL.md` and its `references/` files.
- `skills/catalog.json`, including every bundled file's content hash.
- `skills/README.md` and `skills.sh.json`.
- The canonical single-file public playbook and its legacy alias.
- The skills tables between `<!-- skills:start -->` and `<!-- skills:end -->`
  in the root and package READMEs, once those marker regions exist.

Edit source, then regenerate. Do not edit generated output or commit another copy
under `packages/axiomui/skills/`. Packaging creates that second copy locally and
cleans it afterward.

Use the product name **Axiom UI** in prose. The npm command and skill prefix are
`axiomui`. Preserve legacy identifiers where compatibility requires them. Public
commits, documentation and generated files must not credit a model or tool; agent
product names used as supported installation targets are functional names.

## Skill catalog contract

| Skill | Group | Rules carried at this checkpoint |
| --- | --- | ---: |
| `axiomui` | Core | All 105 |
| `axiomui-website-upgrade` | Core | All 105 |
| `axiomui-audit` | Core | All 105 |
| `axiomui-typography` | Domain | 13 |
| `axiomui-layout` | Domain | 11 |
| `axiomui-color` | Domain | 12 |
| `axiomui-components` | Domain | 12 |
| `axiomui-forms` | Domain | 12 |
| `axiomui-system` | Domain | 13 |
| `axiomui-motion` | Domain | 29 home rules plus 2 cross-listed rules |
| `axiomui-accessibility` | Domain | 3 home rules plus 8 cross-listed rules |

The core skills serve different requests: concrete values while building, implemented
improvements to existing UI, and review without edits. Their triggers point to the
appropriate alternative. Domain skills carry focused triggers and inline rule values.
Cross-listing is tag-driven; do not duplicate a hand-maintained list of rule IDs.

Names must be unique, use the `axiomui` prefix, and satisfy the catalog's name
validation. Aliases must not collide with names or group words. The catalog tests
also validate description and summary constraints, category coverage and cross-listing.

Frontmatter carries the skill name, description and owner metadata. The optional
license field comes from package metadata once that metadata is delivered. Do not
add a package version or generation timestamp to every skill document: unchanged
content must remain byte-identical across builds and package-version changes.

Every cited `references/...md` file must exist inside that same skill, and every
shipped reference must be reachable from its documents. A rule's deep-dive file must
be byte-identical wherever it is included. The renderer shares the site's rule
serializer so exported reasoning and the full rules endpoint do not drift.

The machine catalog uses schema 1, the site and repository identifiers, and a skill
array. Each skill has its name, group, title, summary, rule count, aliases and a
relative-path-to-`sha256:<hex>` file map. Legacy entries record the old name, its
replacement and recognized pristine hashes. Keep the complete hash set generated
from source; examples in documentation must not become a second catalog.

## Runtime boundaries

The repository requires Node >=22.18. Native TypeScript loading resolves the `@/`
alias and extensionless TypeScript imports; `erasableSyntaxOnly` prevents syntax
that the loader cannot strip. The site's CI version remains controlled by `.nvmrc`.

The installer is directly executable ESM JavaScript with `// @ts-check` and JSDoc.
Its supported floor is Node 18.17, and it has no runtime dependencies or code-build
step. Keep its `.mjs` modules in root typechecking and its tests in the existing
Vitest suite. Do not introduce npm workspaces solely to package the CLI.

The packaged CLI first looks for skills beside its own library and otherwise uses
the repository's generated `skills/` tree. The fallback is useful only after the
complete distribution exists. Current source tests use temporary fixture packages;
they are not proof that the pending bin or a published package works.

## Installer behavior to retain

The command runner implements `add` (`install`, `i`), `list` (`ls`), `update` and
`remove` (`rm`), plus help and version output. Skill selection accepts full names,
aliases and `core`, `domains` or `all`. `--all` selects the full relevant set, including
managed retired skills during removal.

Flags include `--agent`, `--global`, `--dir`, `--all`, `--yes`, `--dry-run`, `--force`,
`--json` and `--no-color`. Keep the parser and CLI tests authoritative for aliases,
combinations, precedence and output shapes. `--dir` takes precedence over agent and
scope selection; empty paths are usage errors. Unknown commands, including inherited
object-property names, must never fall through to a destructive command.

JSON mode emits machine-readable results or errors on stdout, including parse errors
and a missing command. The `--` terminator ends flag interpretation. JSON mode does
not authorize legacy-file deletion merely by suppressing prompts.

| Exit | Meaning |
| --- | --- |
| 0 | Success, nothing to do, or declined confirmation |
| 1 | Runtime failure |
| 2 | Usage error |
| 3 | One or more skills skipped because of conflicts or foreign ownership |
| 130 | Cancellation |

Interactive mode requires TTY input and output, no CI flag, and no noninteractive
flag. A bare interactive command opens installation; a bare noninteractive command
shows usage and exits 2. Skill and agent selection, scope choice and confirmation
must name the actual destinations. Scope defaults follow the runner's project
heuristic. Preserve numbered-input fallback, raw-mode restoration and cleanup on
EOF, errors and cancellation.

The implemented target mapping uses `.claude/skills` for Claude and `.agents/skills`
for the shared agent target. Global Claude targeting honors `CLAUDE_CONFIG_DIR`;
other shared targets use the home `.agents/skills` directory. Detection can suggest
agents but does not independently prove that every external agent version reads
these locations. Recheck external compatibility before promoting installation
instructions; do not turn old research observations into a current support claim.

Deduplicate targets by physical destination, including stable linked target folders.
The planner pins the destination and existing ancestor identity. Apply must reject
redirected targets, replaced skill roots or intervening owned-file edits instead of
using a stale confirmation. Project-scoped add and remove operations from the home directory require
an explicit global or custom target choice. Update intentionally searches managed
project and global installs unless its target flags narrow that search.

The `.axiomui.json` sidecar records the ownership marker, installed version, skill and hashes of
managed files. Repeating an unchanged install must preserve bytes and mtimes. Foreign
directories and edited managed files are skipped unless explicitly forced. Preserve
unowned files, and keep modified files dropped by a newer bundle with a warning.

Fresh installs are assembled before activation. Updates use unique temporary write
directories and replace files without following links. Preserve the existing rules
for file/directory shape changes; `--force` is not permission to follow a symlink or
remove unrelated content. During removal, deactivate a skill's `SKILL.md` before
removing references. Write ownership metadata only after successful file operations.

Legacy cleanup requires a recognized pristine file and an up-to-date managed
replacement in the same target. Recheck readiness, the legacy file hash and directory
identity after confirmation. Modified or replaced legacy content must survive. An
explicit `--yes` can authorize eligible cleanup; JSON alone cannot.

## Generation and bundling safeguards

The generator owns its generated roots and README marker regions. Check mode reports
missing, stale and extra output without writing. Generation repairs output, removes
obsolete owned files and preserves prose outside the markers. Missing marker regions
must fail before mutation. Refuse symlinked generated paths and marker files.

Ignored local OS litter does not fail synchronization checks, though generation
cleans it. Third-party discovery checks inspect tracked skill files and read locks
from the Git index; an untracked local lock must not hide committed third-party
content. Test repositories must strip inherited `GIT_*` variables so pre-commit
settings cannot redirect fixture Git operations into the caller's repository.

The bundler validates the complete input before replacing a previous package copy.
It rejects unsafe or duplicate skill entries, missing files, hash mismatches, linked
source paths and local Markdown references absent from that skill's manifest. It
stages the validated bytes and copies only catalogued files plus the generated
README and catalog. Uncatalogued local material must not enter the package.

`--clean` removes package-local skills and license copies without deleting source or
following linked destinations. `--require-license` checks root license content and
publishable package license metadata. Neither bundling nor the presence of that
preflight authorizes publication.

## Remaining integration sequence

1. Prepare a complete generated-artifact split. Every delivered skill folder must
   include all of its references and a matching catalog; generated tables and
   discovery metadata must describe what is actually present. Keep each review unit
   within 2,000 authored and 5,000 total textual changed lines. Do not land partial
   folders, stale hashes or disabled checks to meet the limit. If no independent
   split satisfies those contracts, retain the hold and identify the dependency.
2. Activate generation scripts only with their required artifacts, README markers
   and package metadata present. The future root scripts are:

   ```json
   "skills:build": "node --import ./scripts/lib/register-ts.mjs scripts/build-skills.mjs",
   "skills:check": "node --import ./scripts/lib/register-ts.mjs scripts/build-skills.mjs --check"
   ```

3. Deliver the package manifest, executable bin, README, package tests and standalone
   smoke test together with the inputs they need. Keep runtime dependencies empty
   and the bin's Node 18.17 floor. Restrict packed files to the bin, library modules,
   generated skills, README, license and package metadata. Tests, local tooling and
   generated staging files must stay out of the tarball.
4. Wire synchronization into CI and pre-commit, mark generated files appropriately,
   and document source/output ownership in repository guidance. Add the Node 18/20
   standalone CLI smoke matrix and local pack validation at the usable checkpoint.
5. Complete the site handoff from 015 W2-L. Render the install list and rule counts
   from the client-safe catalog, retain per-button copy feedback, fetch the playbook
   lazily for preview, and preserve download and GitHub access. Keep the existing
   modal portal, keyboard focus, Escape, background locking, reduced motion and
   responsive behavior. Use the product name Axiom UI and no decorative dividers.
   Pin dependent radii before the later radius reset; that reset does not own this
   component. Index all canonical rule URLs in `llms.txt` and retain its skills links.
6. Keep the old public playbook path working. Its new canonical copy must be a
   self-contained single file, with no local `references/` dependency. The two public
   variants differ only in the legacy frontmatter name. Do not advertise an npm
   install command as available before publication has been independently confirmed.

## Verification and publication prerequisites

Current source validation is:

```sh
npm run lint
npm run typecheck
npm run check
npm test
npm run build
git diff --check
```

The deep-dive check must agree with the current rule catalog. Rerun the gates for
each delivery rather than carrying historical results forward. Check exact source
hashes and explicit allowlists before staging.

After activation, add `npm run skills:check`, the standalone CLI smoke on Node 18 and
20, and a local package dry run. Inspect the actual tarball and exercise add, list,
update and remove in a scratch project with a throwaway home. Keep fixture Git and
home state separate from the working repository. Verify deterministic rendering,
complete local references, catalog hashes, legacy equivalence, attribution and the
unchanged full-rules endpoint. Browser-test changed installation UI on mobile and
desktop, keyboard-only, light/dark themes and reduced motion, including every copy
button, preview, download, closing and focus restoration.

A usable distribution requires committed complete artifacts, synchronization gates,
the package entry point and metadata, correct license inputs, and verified package
contents. A published distribution additionally requires an owner-authorized registry
action and verification of the actual installed version. Neither a successful local
pack nor a merge proves publication.

Release tags, registry login, package publication and release-workflow activation
remain separate owner decisions. Do not run them as part of prepared code delivery.
Recheck the chosen registry authentication and external agent-discovery behavior
against current primary documentation when those actions are authorized. No release
workflow is activated by this plan.

## Deferred directions

Site-based skill discovery, marketplace/plugin manifests and a command that prints a
skill for agents without skill support remain separate proposals. They are not
prerequisites for the file-based distribution and are not authorized by this plan.
