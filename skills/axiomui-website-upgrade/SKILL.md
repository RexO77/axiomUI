---
name: axiomui-website-upgrade
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

The craft standards above are backed by Axiom UI's 105 rules, which carry the exact values. Before you change a domain, open its file and apply the matching rule's Do. Read the rule's own file under `references/rules/` before you defend a tradeoff or break a rule, and cite the rule id when you report the change.

If `references/` is missing, this is a single-file copy: read https://axiomui.nischal.fyi/rules.json for every rule's Do and Don't, and https://axiomui.nischal.fyi/rules/<id> for one rule's reasoning.

| Domain | Rules | File |
|---|---|---|
| Typography & text | 13 | `references/typography.md` |
| Layout & spacing | 11 | `references/layout.md` |
| Color & depth | 12 | `references/color.md` |
| Components & actions | 12 | `references/components.md` |
| Forms & inputs | 12 | `references/forms.md` |
| System & logic | 13 | `references/system.md` |
| Motion & interaction | 29 | `references/motion.md` |
| Accessibility & inclusivity | 3 | `references/accessibility.md` |
