---
name: axiomui
description: Axiom UI's library of 108 UI design rules, each with a Do/Don't pair, a canonical URL, and full reasoning. Use when building new interface code and a concrete, citable value is needed for type, spacing, color and contrast, buttons and overlays, form fields and validation, loading and empty states, animation timing and easing, or accessibility; when the user mentions Axiom UI or cites a rule id such as typo-1 or motion-12; or when two UI treatments are on the table and the choice should rest on an established rule rather than taste. To change an existing interface, use axiomui-website-upgrade only if it is installed; otherwise apply the rules here. For a review without edits, use axiomui-audit only if it is installed; otherwise review with this library.
license: MIT
metadata:
  author: Nischal Skanda
  homepage: https://axiomui.nischal.fyi
  source: https://github.com/RexO77/axiomUI
  group: core
---

# Axiom UI

Axiom UI is a library of 108 UI design rules across 8 domains. Each rule is one decision with a concrete Do, a concrete Don't, and written reasoning. Use the rules to make interface choices you can cite, instead of choices you have to defend on taste.

## Which Axiom UI skill

This skill is the rule library. The other Axiom UI skills each add a procedure for one job, and each applies only if it is installed:

- Building new UI and choosing a value or a treatment: stay here. Find the rule and apply it.
- Changing an existing interface in code: use `axiomui-website-upgrade`. It adds the upgrade loop, the craft standards and a verification contract.
- Reviewing without editing: use `axiomui-audit`. It adds per-domain checklists, a severity scale and a report format.
- Working mostly in one domain: use that domain's skill (`axiomui-typography`, `axiomui-layout`, `axiomui-color`, `axiomui-components`, `axiomui-forms`, `axiomui-system`, `axiomui-motion`, `axiomui-accessibility`). It carries the domain's rules inline, with sharper triggers.

When the matching skill is not installed, stay here. Every rule is in this skill.

## How to apply a rule

1. Find the rule. Pick the domain in the table below and open its file, or scan the rule index for the id or title.
2. Establish what the example demonstrates. A timing value describes that transition. A contrast criterion has a defined scope, threshold and exceptions.
3. Apply the rule to the actual task. Reproduce the failure or measure the applicable threshold before recommending a change.
4. Read the rule's file under `references/rules/` when the case is ambiguous or high-stakes, or when you need the reasoning: why it works, what breaks, how to apply it, and the questions to ask in review.
5. Cite the rule id and its URL when you explain a change, so the reader can check the decision.

Where the project already has a token or component for the decision, use it. When that token contradicts a rule, flag the conflict instead of quietly rewriting the system.

## When breaking a rule is right

A platform convention, a language’s reading direction or evidence from the task can justify a different treatment from the example. Document the rule, the evidence and the result. When the decision concerns a standard, use that standard’s own conditions and exceptions to assess conformance.

## Domains

| Domain | Rules | Compact Do/Don't |
|---|---|---|
| Typography & text | 14 | `references/typography.md` |
| Layout & spacing | 11 | `references/layout.md` |
| Color & depth | 12 | `references/color.md` |
| Components & actions | 13 | `references/components.md` |
| Forms & inputs | 13 | `references/forms.md` |
| System & logic | 13 | `references/system.md` |
| Motion & interaction | 29 | `references/motion.md` |
| Accessibility & inclusivity | 3 | `references/accessibility.md` |

## Rule index

### Typography & text

- `typo-1` Use sentence case for English UI labels (`references/rules/typo-1.md`)
- `typo-2` Letter spacing on caps (`references/rules/typo-2.md`)
- `typo-3` Set body leading for sustained reading (`references/rules/typo-3.md`)
- `typo-4` Fit leading to wrapped headings (`references/rules/typo-4.md`)
- `typo-5` Give each typeface a job (`references/rules/typo-5.md`)
- `typo-6` Keep secondary text legible (`references/rules/typo-6.md`)
- `typo-7` Align comparable numbers (`references/rules/typo-7.md`)
- `typo-8` Align paragraphs to the reading start (`references/rules/typo-8.md`)
- `typo-9` Assign font weights by role (`references/rules/typo-9.md`)
- `typo-10` Preserve meaning when text overflows (`references/rules/typo-10.md`)
- `typo-11` Choose a readable body size (`references/rules/typo-11.md`)
- `typo-12` Balance short headings (`references/rules/typo-12.md`)
- `typo-13` Review wrapping in short descriptions (`references/rules/typo-13.md`)
- `typo-14` Keep names and counts together across scripts (`references/rules/typo-14.md`)

### Layout & spacing

- `layout-1` Use a shared spacing scale (`references/rules/layout-1.md`)
- `layout-2` Set a measure for long-form text (`references/rules/layout-2.md`)
- `layout-3` Show which items belong together (`references/rules/layout-3.md`)
- `layout-4` Optically center asymmetric glyphs (`references/rules/layout-4.md`)
- `layout-5` Size button padding around the label (`references/rules/layout-5.md`)
- `layout-6` Anchor a row icon to the text it describes (`references/rules/layout-6.md`)
- `layout-7` Choose a boundary that explains the group (`references/rules/layout-7.md`)
- `layout-8` Consistent gutters (`references/rules/layout-8.md`)
- `layout-9` Adapt outer spacing to available width (`references/rules/layout-9.md`)
- `layout-10` Use spacing to express vertical hierarchy (`references/rules/layout-10.md`)
- `layout-11` Define stacking order within each context (`references/rules/layout-11.md`)

### Color & depth

- `color-1` Use accent color to mark priority (`references/rules/color-1.md`)
- `color-2` Use the intended text color (`references/rules/color-2.md`)
- `color-3` Match shadows to their role (`references/rules/color-3.md`)
- `color-4` Make status colors dependable (`references/rules/color-4.md`)
- `color-5` Keep decorative dividers quiet (`references/rules/color-5.md`)
- `color-6` Give essential control edges enough contrast (`references/rules/color-6.md`)
- `color-7` Keep hover feedback distinct from a result (`references/rules/color-7.md`)
- `color-8` Design the dark palette by role (`references/rules/color-8.md`)
- `color-9` Accessible contrast ratios (`references/rules/color-9.md`)
- `color-10` Give state colors a shared source (`references/rules/color-10.md`)
- `color-11` Define image edges when they disappear (`references/rules/color-11.md`)
- `color-12` Use elevation when a surface is raised (`references/rules/color-12.md`)

### Components & actions

- `comp-1` Prioritize the next action (`references/rules/comp-1.md`)
- `comp-2` Confirm irreversible deletion (`references/rules/comp-2.md`)
- `comp-3` Align nested corner radii (`references/rules/comp-3.md`)
- `comp-4` Distinguish people from content (`references/rules/comp-4.md`)
- `comp-5` Choose a surface for the task (`references/rules/comp-5.md`)
- `comp-6` Place field errors beside the field (`references/rules/comp-6.md`)
- `comp-7` Label ambiguous actions (`references/rules/comp-7.md`)
- `comp-8` Explain unavailable actions (`references/rules/comp-8.md`)
- `comp-9` Acknowledge a pending submission (`references/rules/comp-9.md`)
- `comp-10` Match icon scale within a toolbar (`references/rules/comp-10.md`)
- `comp-11` Size a card’s primary link (`references/rules/comp-11.md`)
- `comp-12` Make overlay dismissal discoverable (`references/rules/comp-12.md`)
- `comp-13` Make the chart’s question answerable in text (`references/rules/comp-13.md`)

### Forms & inputs

- `form-1` Keep labels close to their fields (`references/rules/form-1.md`)
- `form-2` Keep field labels visible (`references/rules/form-2.md`)
- `form-3` Make required and optional choices clear (`references/rules/form-3.md`)
- `form-4` Match field width to plausible answers (`references/rules/form-4.md`)
- `form-5` Match selection controls to the choice (`references/rules/form-5.md`)
- `form-6` Expose alternatives worth comparing (`references/rules/form-6.md`)
- `form-7` Match the control to when the change takes effect (`references/rules/form-7.md`)
- `form-8` Validate when a correction is useful (`references/rules/form-8.md`)
- `form-9` Show format constraints before entry (`references/rules/form-9.md`)
- `form-10` Give the form one clear reading order (`references/rules/form-10.md`)
- `form-11` Reuse answers the user has supplied (`references/rules/form-11.md`)
- `form-12` Confirm the outcome of a submission (`references/rules/form-12.md`)
- `form-13` Accept a complete sign-in code in one paste (`references/rules/form-13.md`)

### System & logic

- `sys-1` Choose a loading state that explains the wait (`references/rules/sys-1.md`)
- `sys-2` Explain why a view is empty (`references/rules/sys-2.md`)
- `sys-3` Size the hit area for the input (`references/rules/sys-3.md`)
- `sys-4` Choose a timestamp for the question (`references/rules/sys-4.md`)
- `sys-5` Give shared colors semantic roles (`references/rules/sys-5.md`)
- `sys-6` Make reversible deletion recoverable (`references/rules/sys-6.md`)
- `sys-7` Orient people in a multi-step flow (`references/rules/sys-7.md`)
- `sys-8` Follow the keyboard model for each control (`references/rules/sys-8.md`)
- `sys-9` Reconcile optimistic changes (`references/rules/sys-9.md`)
- `sys-10` Recover at the point of failure (`references/rules/sys-10.md`)
- `sys-11` Set breakpoints where the layout needs them (`references/rules/sys-11.md`)
- `sys-13` Limit transitions to intended properties (`references/rules/sys-13.md`)
- `sys-14` Use will-change sparingly (`references/rules/sys-14.md`)

### Motion & interaction

- `motion-1` Animate by frequency (`references/rules/motion-1.md`)
- `motion-2` Keep keyboard input responsive (`references/rules/motion-2.md`)
- `motion-3` Purpose before motion (`references/rules/motion-3.md`)
- `motion-4` Choose easing for the movement (`references/rules/motion-4.md`)
- `motion-5` Make the start of an entrance visible (`references/rules/motion-5.md`)
- `motion-6` Time motion to the task (`references/rules/motion-6.md`)
- `motion-7` Tune entrance and exit separately (`references/rules/motion-7.md`)
- `motion-8` Show when a control is pressed (`references/rules/motion-8.md`)
- `motion-9` Keep surface entrances near full size (`references/rules/motion-9.md`)
- `motion-10` Anchor a popover’s motion to its trigger (`references/rules/motion-10.md`)
- `motion-11` Share tooltip timing across a toolbar (`references/rules/motion-11.md`)
- `motion-12` Retarget interrupted motion from its current position (`references/rules/motion-12.md`)
- `motion-13` Give new elements a starting style (`references/rules/motion-13.md`)
- `motion-14` Choose animation properties with layout in mind (`references/rules/motion-14.md`)
- `motion-15` Size slide exits to the moving element (`references/rules/motion-15.md`)
- `motion-16` Gate decorative hover motion (`references/rules/motion-16.md`)
- `motion-17` Preserve feedback with reduced motion (`references/rules/motion-17.md`)
- `motion-18` Use release direction and speed for swipe dismissal (`references/rules/motion-18.md`)
- `motion-19` Use drag resistance where overshoot is meaningful (`references/rules/motion-19.md`)
- `motion-20` Keep a drag attached to its initiating pointer (`references/rules/motion-20.md`)
- `motion-21` Keep decorative motion independent of busy scripts (`references/rules/motion-21.md`)
- `motion-22` Use a playback controller for programmatic animation (`references/rules/motion-22.md`)
- `motion-23` Scope rapidly changing drag styles (`references/rules/motion-23.md`)
- `motion-24` Limit the total stagger (`references/rules/motion-24.md`)
- `motion-25` Review motion slowly, then at normal speed (`references/rules/motion-25.md`)
- `motion-26` Sequence panel content when order explains something (`references/rules/motion-26.md`)
- `motion-27` Keep routine exits quiet (`references/rules/motion-27.md`)
- `motion-28` Make icon state changes recognizable (`references/rules/motion-28.md`)
- `motion-29` Show the initial interface in its ready state (`references/rules/motion-29.md`)

### Accessibility & inclusivity

- `a11y-1` Keep keyboard focus visible (`references/rules/a11y-1.md`)
- `a11y-2` Carry meaning beyond color (`references/rules/a11y-2.md`)
- `a11y-3` Separate competing touch targets (`references/rules/a11y-3.md`)
