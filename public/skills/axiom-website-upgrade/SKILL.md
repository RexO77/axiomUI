---
name: axiom-website-upgrade
description: Changes an existing website, landing page, dashboard, SaaS product, or design system in code, using Axiom UI's rules as the standard. Use when an existing interface feels cluttered, flat, inconsistent, cramped, visually misaligned, unresponsive, hard to scan, or insufficiently polished; when asked to refine, fix, or polish its hierarchy, typography, spacing, components, forms, states, accessibility, responsive behavior, or motion; or when a critique should end in implemented changes. For a review without edits, use axiomui-audit only if it is installed; otherwise review with the included rules. For values while building new UI, use axiomui only if it is installed; otherwise consult the included rule library.
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
- Identify the page goal, the primary user action, and the information users need first.
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
- Feels hard to scan: shorten line length, clarify heading levels, soften secondary copy, and make one next action dominant.
- Feels slow: distinguish actual latency from delayed feedback or sluggish motion. Respond immediately, then animate only when it aids continuity.
- Feels unsafe or confusing: clarify labels, consequences, validation, recovery, loading, success, empty, and error states.
- Breaks on mobile: preserve reading order and task priority; recompose the layout instead of merely shrinking desktop UI.

## Craft standards

### Hierarchy and typography

- Give each screen one unmistakable primary action.
- Use sentence case for interface copy unless the product language requires otherwise.
- Keep body text readable, left-align multi-line copy, and constrain long measures.
- Build hierarchy with size, weight, spacing, and contrast before adding color.
- De-emphasize secondary text with color before making it uncomfortably small.
- Balance headings and prevent awkward orphaned words when the stack supports it.

### Layout and surfaces

- Use a consistent spacing scale and let proximity explain relationships.
- Keep repeated gutters and control heights aligned across the same region.
- Give content enough room inside cards; outer whitespace does not compensate for cramped inner padding.
- Make nested corners concentric: outer radius should account for the inner radius plus the surrounding inset.
- Avoid wrapping every section in a card. Use whitespace, surface contrast, or dividers only when they clarify structure.
- Keep borders quieter than content and use depth sparingly.

### Components and forms

- Make the whole intended target interactive and keep hit areas comfortably large.
- Label ambiguous icons and preserve visible focus states.
- Use controls that match the decision: radio for one choice, checkbox for many, switch for immediate change.
- Keep labels visible while typing and validate after meaningful interaction, not on the first keystroke.
- Prevent duplicate async actions and show immediate, local feedback.
- Make destructive actions deliberate, explain consequences, and offer recovery when practical.

### States, accessibility, and motion

- Design loading, empty, error, success, disabled, hover, focus, and active states as part of the component.
- Preserve meaning without color and maintain readable contrast.
- Ensure keyboard users can reach, operate, and dismiss every control and overlay.
- Use motion for feedback, orientation, or continuity—not to decorate frequent actions.
- Prefer responsive, interruptible transitions; specify the animated properties and keep exits quicker than entrances.
- Respect reduced-motion preferences and avoid movement that delays access to content.

## Decision guardrails

- Do not introduce a new visual language to solve a local inconsistency.
- Do not add dependencies for effects the current stack can express clearly.
- Do not hide usability problems behind animation, gradients, blur, or decorative chrome.
- Do not apply heuristics mechanically. Break a rule when the product context makes the tradeoff clearly better, and explain why.
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

The craft standards above are backed by Axiom UI's 105 rules, which carry the exact values. This is the single-file copy of the skill, so the rules are online rather than beside it:

- Every rule's Do and Don't, in one JSON file: https://axiomui.nischal.fyi/rules.json
- One rule's full reasoning: https://axiomui.nischal.fyi/rules/<id>, for example https://axiomui.nischal.fyi/rules/typo-1

Before you change a domain, find its rules in the index below and apply the matching rule's Do. Read the rule's page before you defend a tradeoff or break a rule, and cite the rule id when you report the change. To keep the rule files offline, install the full skill with `npx skills add RexO77/axiomUI --skill axiomui-website-upgrade`.

### Typography & text

- `typo-1` Sentence case is king
- `typo-2` Letter spacing on caps
- `typo-3` Line height math (body)
- `typo-4` Line height math (headings)
- `typo-5` The 2-font limit
- `typo-6` De-emphasize with color, not size
- `typo-7` Numeric alignment
- `typo-8` Left align body copy
- `typo-9` Limit font weights
- `typo-10` Truncation strategy
- `typo-11` Minimum body size
- `typo-12` Balance short headings
- `typo-13` Pretty wrap UI copy

### Layout & spacing

- `layout-1` The 4pt grid system
- `layout-2` Text width limits
- `layout-3` Group by proximity
- `layout-4` Visual vs mathematical center
- `layout-5` Button padding formula
- `layout-6` Optical alignment of icons
- `layout-7` The container fallacy
- `layout-8` Consistent gutters
- `layout-9` Responsive spacing scaling
- `layout-10` Vertical rhythm
- `layout-11` Z-index scale

### Color & depth

- `color-1` 60-30-10 rule
- `color-2` Never pure black
- `color-3` Colored shadows
- `color-4` Semantic colors
- `color-5` Border colors
- `color-6` Double contrast for borders
- `color-7` Hover = same hue
- `color-8` Dark mode isn't inverted
- `color-9` Accessible contrast ratios
- `color-10` Opacity over new colors
- `color-11` Neutral image outlines
- `color-12` Shadows can replace borders

### Components & actions

- `comp-1` Action hierarchy
- `comp-2` Destructive actions
- `comp-3` Nested radius formula
- `comp-4` Avatars are circles
- `comp-5` Modal vs drawer
- `comp-6` Toast vs inline error
- `comp-7` Icon + label for ambiguous actions
- `comp-8` Disabled needs a reason
- `comp-9` Loading states on buttons
- `comp-10` Consistent icon size
- `comp-11` Card click area
- `comp-12` Close affordance on overlays

### Forms & inputs

- `form-1` Labels top aligned
- `form-2` No placeholders as labels
- `form-3` Mark optional, not required
- `form-4` Input width hints
- `form-5` Checkbox vs radio
- `form-6` Dropdown vs radio
- `form-7` Switch vs checkbox
- `form-8` Validate on blur
- `form-9` Format hints
- `form-10` Single column forms
- `form-11` Smart defaults
- `form-12` Success state feedback

### System & logic

- `sys-1` Skeleton loading
- `sys-2` Empty states
- `sys-3` Click targets (Fitts's law)
- `sys-4` Date formats
- `sys-5` Design tokens naming
- `sys-6` Undo destructive actions
- `sys-7` Show progress for multi-step
- `sys-8` Keyboard navigation
- `sys-9` Optimistic UI updates
- `sys-10` Graceful degradation
- `sys-11` Responsive breakpoint strategy
- `sys-13` Transition only what changes
- `sys-14` Use will-change sparingly

### Motion & interaction

- `motion-1` Animate by frequency
- `motion-2` Keyboard actions stay instant
- `motion-3` Purpose before motion
- `motion-4` Use strong custom easing
- `motion-5` Never use ease-in for UI
- `motion-6` Keep UI motion under 300ms
- `motion-7` Asymmetric enter and exit
- `motion-8` Press feedback
- `motion-9` Never scale from zero
- `motion-10` Origin-aware popovers
- `motion-11` Subsequent tooltips are instant
- `motion-12` Use transitions for interruptible UI
- `motion-13` Use starting styles for entry
- `motion-14` Animate transform and opacity
- `motion-15` Use percentage transforms
- `motion-16` Gate hover motion
- `motion-17` Reduced motion still has intent
- `motion-18` Gesture dismissal uses velocity
- `motion-19` Damp drag boundaries
- `motion-20` Capture pointer during drag
- `motion-21` Use CSS under load
- `motion-22` Use WAAPI for programmatic motion
- `motion-23` Avoid inheritable motion variables
- `motion-24` Stagger without blocking
- `motion-25` Review motion in slow time
- `motion-26` Split enter animations
- `motion-27` Subtle exit motion
- `motion-28` Animate contextual icons
- `motion-29` Skip default load animation

### Accessibility & inclusivity

- `a11y-1` Focus visible indicators
- `a11y-2` Color shouldn't be the only signal
- `a11y-3` Touch target spacing
