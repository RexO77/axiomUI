---
name: axiomui-website-upgrade
description: Changes an existing website, landing page, dashboard, SaaS product, or design system in code, using Axiom UI's rules as the standard. Use when an existing interface feels cluttered, flat, inconsistent, cramped, visually misaligned, unresponsive, hard to scan, or insufficiently polished; when asked to refine, fix, or polish its hierarchy, typography, spacing, components, forms, states, accessibility, responsive behavior, or motion; or when a critique should end in implemented changes. For a review without edits, use axiomui-audit only if it is installed; otherwise review with the included rules. For values while building new UI, use axiomui only if it is installed; otherwise consult the included rule library.
license: MIT
metadata:
  author: Nischal Skanda
  homepage: https://axiomui.nischal.fyi
  source: https://github.com/RexO77/axiomUI
  group: core
---

# Website upgrade playbook

Act as a design engineer. Improve the interface by making its intent easier to understand and its behavior easier to trust. Treat polish as the accumulated result of correct hierarchy, spacing, alignment, states, and interaction—not decoration.

## Operating principles

- Inspect the current interface, implementation, and existing design patterns before proposing changes.
- Identify the task or tasks the surface supports and the information each decision needs.
- Fix structure before styling, and styling before motion.
- Prefer the smallest coherent system-level fix over scattered one-off patches.
- Preserve accepted behavior, content, and interaction choreography unless the request explicitly changes them.
- Use optical judgment alongside measurements. Mathematical alignment can still look wrong.
- Do not stop at critique when the user asked for implementation and the code is available.

## Improvement loop

1. Frame the task.
   State the visible problem, the affected surface, and what must remain unchanged.
2. Trace the cause.
   Inspect the real component, styles, tokens, responsive rules, states, and interaction path. Do not redesign from a screenshot alone when the implementation is available.
3. Choose the highest-leverage correction.
   Resolve hierarchy and product logic first, then layout, typography, components, states, accessibility, and motion.
4. Implement cohesively.
   Reuse existing components and tokens. If the problem repeats, correct the shared primitive rather than patching every instance.
5. Verify in context.
   Exercise the changed UI at relevant viewport sizes and interaction states. Compare the result to the original symptom.
6. Report precisely.
   Describe every material change, why it improved the interface, what was verified, and what remains uncertain.

## Diagnose by symptom

- Feels crowded: reduce competing emphasis, group by proximity, restore inner padding, and increase separation between unrelated regions.
- Feels empty or flat: strengthen hierarchy and grouping before adding borders, shadows, cards, or color.
- Feels inconsistent: find the shared token or primitive behind mismatched spacing, type, radius, icon size, or state treatment.
- Feels visually misaligned: inspect baselines, cap height, icon geometry, negative space, and optical centering—not only flex alignment.
- Feels hard to scan: check line length, heading roles, secondary-text contrast and the relative emphasis of actions within each task.
- Feels slow: distinguish actual latency from delayed feedback or sluggish motion. Respond immediately, then animate only when it aids continuity.
- Feels unsafe or confusing: clarify labels, consequences, validation, recovery, loading, success, empty, and error states.
- Breaks on mobile: preserve reading order and task priority; recompose the layout instead of merely shrinking desktop UI.

## Craft standards

### Hierarchy and typography

- Give the next action appropriate emphasis within its task group. Independent tasks on a dashboard can each have a primary action.
- Use sentence case for ordinary English labels when it matches the product’s editorial convention. Preserve names and follow the conventions of each translation.
- Align paragraphs to the reading start for their language. Check sustained reading, wrapped headings and mixed-script names with representative text.
- Build hierarchy with size, weight, spacing, and contrast before adding color.
- De-emphasize secondary text with color before making it uncomfortably small.
- Balance headings and prevent awkward orphaned words when the stack supports it.

### Layout and surfaces

- Use a consistent spacing scale and let proximity explain relationships.
- Keep repeated gutters and control heights aligned across the same region.
- Give content enough room inside cards; outer whitespace does not compensate for cramped inner padding.
- For concentric circular corners with an equal inset, subtract the painted-edge inset from the outer radius to obtain the inner radius. Inspect each edge when the insets differ.
- Avoid wrapping every section in a card. Use whitespace, surface contrast, or dividers only when they clarify structure.
- Keep decorative boundaries quiet. Measure an edge against adjacent colors when it identifies a control or a graphic.

### Components and forms

- Size the primary target for its input method and give independent actions inside a card their own controls.
- Label ambiguous icons and preserve visible focus states.
- Use controls that match the decision: radio for one choice, checkbox for many, switch for immediate change.
- Keep labels visible while typing and validate after meaningful interaction, not on the first keystroke.
- Prevent duplicate async actions and show immediate, local feedback.
- Make destructive actions deliberate, explain consequences, and offer recovery when practical.

### States, accessibility, and motion

- Design loading, empty, error, success, disabled, hover, focus, and active states as part of the component.
- Preserve meaning without color and maintain readable contrast.
- Follow the keyboard model for each control. Check entry, navigation within composite widgets, and focus after a modal closes.
- Check whether motion helps explain a change of state. Repeated actions should keep their feedback and content responsive.
- Specify the properties that transition. Tune entrance and exit separately, then interrupt the transition and check where the element settles.
- Respect reduced-motion preferences and avoid movement that delays access to content.

## Decision guardrails

- Do not introduce a new visual language to solve a local inconsistency.
- Do not add dependencies for effects the current stack can express clearly.
- Do not hide usability problems behind animation, gradients, blur, or decorative chrome.
- Explain departures from a design convention using the product context. Assess accessibility conformance against the applicable criterion and its stated exceptions.
- Do not widen a focused request into an unrelated redesign.

## Verification contract

Before calling the work complete:

1. Recheck the exact symptom that triggered the change.
2. Inspect desktop and mobile layouts at realistic widths.
3. Exercise keyboard flow and relevant hover, focus, active, loading, empty, success, and error states.
4. Check content extremes such as long labels, wrapping text, and dense data where relevant.
5. Respect reduced motion and confirm overlays can be dismissed.
6. Run the repository's focused checks and inspect the final diff for accidental scope.

For visual work, source inspection and a successful build are not sufficient. Verify the rendered interface.

## Reporting format

Present implemented changes in a markdown table with Before, After, and Why columns. Include every material change, not only highlights.

Then state:

- the viewports and interactions verified,
- the checks run,
- any deliberate exceptions or remaining risks.

Optimize for an interface that feels obvious, calm, responsive, and trustworthy. The best details should disappear into use.

## Axiom UI rule lookup

The craft standards above are backed by Axiom UI's 108 rules, each with an example, implementation notes and review questions. This is the single-file copy of the skill, so the rules are online rather than beside it:

- Every rule's Do and Don't, in one JSON file: https://axiomui.nischal.fyi/rules.json
- One rule's full reasoning: https://axiomui.nischal.fyi/rules/<id>, for example https://axiomui.nischal.fyi/rules/typo-1

Before you change a domain, find the relevant rule in the index below and check where its example applies. Read the rule's page before you defend a tradeoff or break a rule, and cite the rule id when you report the change. To keep the rule files offline, install the full skill with `npx skills add RexO77/axiomUI --skill axiomui-website-upgrade`.

### Typography & text

- `typo-1` Use sentence case for English UI labels
- `typo-2` Letter spacing on caps
- `typo-3` Set body leading for sustained reading
- `typo-4` Fit leading to wrapped headings
- `typo-5` Give each typeface a job
- `typo-6` Keep secondary text legible
- `typo-7` Align comparable numbers
- `typo-8` Align paragraphs to the reading start
- `typo-9` Assign font weights by role
- `typo-10` Preserve meaning when text overflows
- `typo-11` Choose a readable body size
- `typo-12` Balance short headings
- `typo-13` Review wrapping in short descriptions
- `typo-14` Keep names and counts together across scripts

### Layout & spacing

- `layout-1` Use a shared spacing scale
- `layout-2` Set a measure for long-form text
- `layout-3` Show which items belong together
- `layout-4` Optically center asymmetric glyphs
- `layout-5` Size button padding around the label
- `layout-6` Anchor a row icon to the text it describes
- `layout-7` Choose a boundary that explains the group
- `layout-8` Consistent gutters
- `layout-9` Adapt outer spacing to available width
- `layout-10` Use spacing to express vertical hierarchy
- `layout-11` Define stacking order within each context

### Color & depth

- `color-1` Use accent color to mark priority
- `color-2` Use the intended text color
- `color-3` Match shadows to their role
- `color-4` Make status colors dependable
- `color-5` Keep decorative dividers quiet
- `color-6` Give essential control edges enough contrast
- `color-7` Keep hover feedback distinct from a result
- `color-8` Design the dark palette by role
- `color-9` Accessible contrast ratios
- `color-10` Give state colors a shared source
- `color-11` Define image edges when they disappear
- `color-12` Use elevation when a surface is raised

### Components & actions

- `comp-1` Prioritize the next action
- `comp-2` Confirm irreversible deletion
- `comp-3` Align nested corner radii
- `comp-4` Distinguish people from content
- `comp-5` Choose a surface for the task
- `comp-6` Place field errors beside the field
- `comp-7` Label ambiguous actions
- `comp-8` Explain unavailable actions
- `comp-9` Acknowledge a pending submission
- `comp-10` Match icon scale within a toolbar
- `comp-11` Size a card’s primary link
- `comp-12` Make overlay dismissal discoverable
- `comp-13` Make the chart’s question answerable in text

### Forms & inputs

- `form-1` Keep labels close to their fields
- `form-2` Keep field labels visible
- `form-3` Make required and optional choices clear
- `form-4` Match field width to plausible answers
- `form-5` Match selection controls to the choice
- `form-6` Expose alternatives worth comparing
- `form-7` Match the control to when the change takes effect
- `form-8` Validate when a correction is useful
- `form-9` Show format constraints before entry
- `form-10` Give the form one clear reading order
- `form-11` Reuse answers the user has supplied
- `form-12` Confirm the outcome of a submission
- `form-13` Accept a complete sign-in code in one paste

### System & logic

- `sys-1` Choose a loading state that explains the wait
- `sys-2` Explain why a view is empty
- `sys-3` Size the hit area for the input
- `sys-4` Choose a timestamp for the question
- `sys-5` Give shared colors semantic roles
- `sys-6` Make reversible deletion recoverable
- `sys-7` Orient people in a multi-step flow
- `sys-8` Follow the keyboard model for each control
- `sys-9` Reconcile optimistic changes
- `sys-10` Recover at the point of failure
- `sys-11` Set breakpoints where the layout needs them
- `sys-13` Limit transitions to intended properties
- `sys-14` Use will-change sparingly

### Motion & interaction

- `motion-1` Animate by frequency
- `motion-2` Keep keyboard input responsive
- `motion-3` Purpose before motion
- `motion-4` Choose easing for the movement
- `motion-5` Make the start of an entrance visible
- `motion-6` Time motion to the task
- `motion-7` Tune entrance and exit separately
- `motion-8` Show when a control is pressed
- `motion-9` Keep surface entrances near full size
- `motion-10` Anchor a popover’s motion to its trigger
- `motion-11` Share tooltip timing across a toolbar
- `motion-12` Retarget interrupted motion from its current position
- `motion-13` Give new elements a starting style
- `motion-14` Choose animation properties with layout in mind
- `motion-15` Size slide exits to the moving element
- `motion-16` Gate decorative hover motion
- `motion-17` Preserve feedback with reduced motion
- `motion-18` Use release direction and speed for swipe dismissal
- `motion-19` Use drag resistance where overshoot is meaningful
- `motion-20` Keep a drag attached to its initiating pointer
- `motion-21` Keep decorative motion independent of busy scripts
- `motion-22` Use a playback controller for programmatic animation
- `motion-23` Scope rapidly changing drag styles
- `motion-24` Limit the total stagger
- `motion-25` Review motion slowly, then at normal speed
- `motion-26` Sequence panel content when order explains something
- `motion-27` Keep routine exits quiet
- `motion-28` Make icon state changes recognizable
- `motion-29` Show the initial interface in its ready state

### Accessibility & inclusivity

- `a11y-1` Keep keyboard focus visible
- `a11y-2` Carry meaning beyond color
- `a11y-3` Separate competing touch targets
