---
name: axiomui
description: Axiom UI's library of 112 UI design rules, each with a Do/Don’t pair, a canonical URL, and full reasoning. Use these rules to choose between UI treatments or find values for type, spacing, color, contrast or motion. They also cover components, forms, states and accessibility. Use this skill when a request names Axiom UI or a rule ID such as typo-1 or motion-12. To change an existing interface, use axiomui-website-upgrade only if it is installed; otherwise apply the rules here. For a review without edits, use axiomui-audit only if it is installed; otherwise review with this library.
license: MIT
metadata:
  author: Nischal Skanda
  homepage: https://axiomui.nischal.fyi
  source: https://github.com/RexO77/axiomUI
  group: core
---

# Axiom UI

Axiom UI is a library of 112 UI design rules across 8 domains. Each rule shows Do and Don’t examples, explains the choice and gives a URL you can cite.

## Which Axiom UI skill

This skill is the rule library. Choose an installed skill that fits the task.

- Building new UI and choosing a value or a treatment: stay here. Find the rule and apply it.
- Changing an existing interface in code: use `axiomui-website-upgrade`. It lists rules by page type and explains how to find, fix and verify problems.
- Reviewing without editing: use `axiomui-audit`. It adds the detection sweep, per-domain checklists, a severity scale and a report format.
- Working mostly in one domain: use that domain's skill (`axiomui-typography`, `axiomui-layout`, `axiomui-color`, `axiomui-components`, `axiomui-forms`, `axiomui-system`, `axiomui-motion`, `axiomui-accessibility`). Its skill file includes the rules for that domain.

When the matching skill is not installed, stay here. Every rule is in this skill.

## How to apply a rule

1. Find the rule. Pick the domain in the table below and open its file, or scan the rule index for the ID or title.
2. Check what the example covers. A duration describes the transition shown. A contrast requirement has its own scope, threshold and exceptions.
3. Before recommending a change, reproduce the failure or measure the value and compare it with the applicable threshold.
4. Read the rule's file under `references/rules/` when the case is ambiguous or high-stakes, or when you need the reasoning: why it works, what breaks, how to apply it, and the questions to ask in review.
5. Cite the rule ID and its URL when you explain a change, so the reader can check the decision.

Where the project already has a token or component for the decision, use it. When that token contradicts a rule, flag the conflict instead of quietly rewriting the system.

## When breaking a rule is right

A platform convention, a language’s reading direction or evidence from the task can justify a different treatment from the example. Document the rule, the evidence and the result. When the decision concerns a standard, use that standard’s own conditions and exceptions to assess conformance.

## Domains

| Domain | Rules | Compact Do/Don’t |
|---|---|---|
| Typography & text | 15 | `references/typography.md` |
| Layout & spacing | 13 | `references/layout.md` |
| Color & depth | 9 | `references/color.md` |
| Components & actions | 15 | `references/components.md` |
| Forms & inputs | 15 | `references/forms.md` |
| System & logic | 14 | `references/system.md` |
| Motion & interaction | 23 | `references/motion.md` |
| Accessibility & inclusivity | 8 | `references/accessibility.md` |

## Rule index

### Typography & text

- `typo-1` Use sentence case for English UI labels (`references/rules/typo-1.md`)
- `typo-2` Check letter spacing on uppercase labels (`references/rules/typo-2.md`)
- `typo-3` Set line height for paragraphs (`references/rules/typo-3.md`)
- `typo-4` Set line height for wrapped headings (`references/rules/typo-4.md`)
- `typo-5` Give each typeface a job (`references/rules/typo-5.md`)
- `typo-6` Keep secondary text at a readable size (`references/rules/typo-6.md`)
- `typo-7` Line up amounts in a column (`references/rules/typo-7.md`)
- `typo-8` Align paragraphs to their starting edge (`references/rules/typo-8.md`)
- `typo-9` Assign font weights by role (`references/rules/typo-9.md`)
- `typo-10` Keep long filenames readable in tight rows (`references/rules/typo-10.md`)
- `typo-11` Choose a readable body size (`references/rules/typo-11.md`)
- `typo-12` Balance short headings (`references/rules/typo-12.md`)
- `typo-13` Avoid a lone last word in short descriptions (`references/rules/typo-13.md`)
- `typo-14` Isolate names in mixed-direction text (`references/rules/typo-14.md`)
- `typo-15` Stop tightening headline letters before they touch (`references/rules/typo-15.md`)

### Layout & spacing

- `layout-1` Use a shared spacing scale (`references/rules/layout-1.md`)
- `layout-2` Limit the width of long paragraphs (`references/rules/layout-2.md`)
- `layout-3` Show which items belong together (`references/rules/layout-3.md`)
- `layout-4` Center the icon by eye (`references/rules/layout-4.md`)
- `layout-5` Size button padding around the label (`references/rules/layout-5.md`)
- `layout-6` Align a row icon with the first line of text (`references/rules/layout-6.md`)
- `layout-7` Group related details before adding borders (`references/rules/layout-7.md`)
- `layout-9` Reduce outer padding when space is tight (`references/rules/layout-9.md`)
- `layout-10` Use larger gaps between sections (`references/rules/layout-10.md`)
- `layout-11` Check the stacking context before raising z-index (`references/rules/layout-11.md`)
- `layout-12` Keep scroll and focus targets clear of sticky headers (`references/rules/layout-12.md`)
- `layout-13` Reserve space for media before it loads (`references/rules/layout-13.md`)
- `layout-14` Keep the subject in the crop at every ratio (`references/rules/layout-14.md`)

### Color & depth

- `color-1` Use accent color to mark priority (`references/rules/color-1.md`)
- `color-4` Use status colors consistently (`references/rules/color-4.md`)
- `color-6` Give essential control edges at least 3:1 contrast (`references/rules/color-6.md`)
- `color-7` Keep hover distinct from success (`references/rules/color-7.md`)
- `color-8` Design the dark palette by role (`references/rules/color-8.md`)
- `color-9` Check text contrast (`references/rules/color-9.md`)
- `color-10` Derive state fills from one color (`references/rules/color-10.md`)
- `color-11` Outline images that blend into the page (`references/rules/color-11.md`)
- `color-12` Use shadows to show depth (`references/rules/color-12.md`)

### Components & actions

- `comp-1` Prioritize the next action (`references/rules/comp-1.md`)
- `comp-2` Confirm irreversible deletion (`references/rules/comp-2.md`)
- `comp-3` Align nested corner radii (`references/rules/comp-3.md`)
- `comp-4` Distinguish people from content (`references/rules/comp-4.md`)
- `comp-5` Choose a dialog, side panel or full page (`references/rules/comp-5.md`)
- `comp-6` Show each error under its field (`references/rules/comp-6.md`)
- `comp-7` Label ambiguous actions (`references/rules/comp-7.md`)
- `comp-8` Explain unavailable actions (`references/rules/comp-8.md`)
- `comp-9` Show when a submission is in progress (`references/rules/comp-9.md`)
- `comp-10` Match the size of related toolbar icons (`references/rules/comp-10.md`)
- `comp-11` Make a one-link card clickable throughout (`references/rules/comp-11.md`)
- `comp-12` Show how to close a dialog (`references/rules/comp-12.md`)
- `comp-13` State the chart’s main finding in words (`references/rules/comp-13.md`)
- `comp-14` Navigate with links, act with buttons (`references/rules/comp-14.md`)
- `comp-15` Show the product doing what the headline promises (`references/rules/comp-15.md`)

### Forms & inputs

- `form-1` Stack labels when space is tight (`references/rules/form-1.md`)
- `form-2` Keep field labels visible (`references/rules/form-2.md`)
- `form-3` Mark optional fields (`references/rules/form-3.md`)
- `form-4` Size fields for the expected answer (`references/rules/form-4.md`)
- `form-5` Match selection controls to the choice (`references/rules/form-5.md`)
- `form-6` Show options people need to compare (`references/rules/form-6.md`)
- `form-7` Use switches for changes that apply immediately (`references/rules/form-7.md`)
- `form-8` Show format errors on submission (`references/rules/form-8.md`)
- `form-9` Show the expected format before typing (`references/rules/form-9.md`)
- `form-10` Give the form one clear reading order (`references/rules/form-10.md`)
- `form-11` Reuse answers from earlier steps (`references/rules/form-11.md`)
- `form-12` Confirm what was saved (`references/rules/form-12.md`)
- `form-13` Accept a one-time code in one paste (`references/rules/form-13.md`)
- `form-14` Declare what each field expects (`references/rules/form-14.md`)
- `form-15` Keep entered answers when validation fails (`references/rules/form-15.md`)

### System & logic

- `sys-1` Choose a loading state that explains the wait (`references/rules/sys-1.md`)
- `sys-2` Explain why a view is empty (`references/rules/sys-2.md`)
- `sys-3` Give small icons a larger hit area (`references/rules/sys-3.md`)
- `sys-4` Use relative time for activity, dates for records (`references/rules/sys-4.md`)
- `sys-5` Reference colors by role, not by value (`references/rules/sys-5.md`)
- `sys-6` Let people restore deleted items (`references/rules/sys-6.md`)
- `sys-7` Show the current step in a multi-step flow (`references/rules/sys-7.md`)
- `sys-8` Use the keys people expect for each control (`references/rules/sys-8.md`)
- `sys-9` Show changes before the server confirms them (`references/rules/sys-9.md`)
- `sys-10` Contain a failure to the part that failed (`references/rules/sys-10.md`)
- `sys-11` Keep the task usable at 320 CSS pixels (`references/rules/sys-11.md`)
- `sys-13` Limit transitions to intended properties (`references/rules/sys-13.md`)
- `sys-15` Return people to the result they opened (`references/rules/sys-15.md`)
- `sys-16` Keep errors and the only recovery action on screen (`references/rules/sys-16.md`)

### Motion & interaction

- `motion-1` Shorten entrances for frequent actions (`references/rules/motion-1.md`)
- `motion-2` Focus the palette field on open (`references/rules/motion-2.md`)
- `motion-3` Use motion to show what changed (`references/rules/motion-3.md`)
- `motion-4` Ease out when a panel needs to settle early (`references/rules/motion-4.md`)
- `motion-6` Match duration to travel distance (`references/rules/motion-6.md`)
- `motion-7` Tune entrance and exit separately (`references/rules/motion-7.md`)
- `motion-8` Show when a control is pressed (`references/rules/motion-8.md`)
- `motion-9` Start panels near full size (`references/rules/motion-9.md`)
- `motion-10` Anchor a popover’s motion to its trigger (`references/rules/motion-10.md`)
- `motion-11` Delay only the first hover tooltip in a toolbar (`references/rules/motion-11.md`)
- `motion-12` Reverse motion from its current position (`references/rules/motion-12.md`)
- `motion-13` Give new elements a starting style (`references/rules/motion-13.md`)
- `motion-14` Use a transform when neighbors can stay in place (`references/rules/motion-14.md`)
- `motion-15` Base slide exits on the element’s height (`references/rules/motion-15.md`)
- `motion-16` Show hover effects only where hover exists (`references/rules/motion-16.md`)
- `motion-17` Preserve feedback with reduced motion (`references/rules/motion-17.md`)
- `motion-18` Let a quick flick dismiss a card (`references/rules/motion-18.md`)
- `motion-19` Add resistance past a drag limit (`references/rules/motion-19.md`)
- `motion-20` Keep tracking the pointer that started the drag (`references/rules/motion-20.md`)
- `motion-21` Keep decorative motion independent of busy scripts (`references/rules/motion-21.md`)
- `motion-24` Cap the total stagger time (`references/rules/motion-24.md`)
- `motion-28` Make icon state changes recognizable (`references/rules/motion-28.md`)
- `motion-29` Show ready controls on first paint (`references/rules/motion-29.md`)

### Accessibility & inclusivity

- `a11y-1` Keep keyboard focus visible (`references/rules/a11y-1.md`)
- `a11y-2` Pair color with another cue (`references/rules/a11y-2.md`)
- `a11y-3` Leave space between touch targets (`references/rules/a11y-3.md`)
- `a11y-4` Offer a click or tap alternative to dragging (`references/rules/a11y-4.md`)
- `a11y-5` Choose heading levels by outline, not size (`references/rules/a11y-5.md`)
- `a11y-6` Let people pause what moves or updates on its own (`references/rules/a11y-6.md`)
- `a11y-7` Underline links in paragraphs (`references/rules/a11y-7.md`)
- `a11y-8` Return focus when a dialog closes (`references/rules/a11y-8.md`)
