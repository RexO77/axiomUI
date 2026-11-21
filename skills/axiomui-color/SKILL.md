---
name: axiomui-color
description: Use Axiom UI’s color guidance when assigning accent and status roles, checking text or control contrast, designing hover and selected states, adapting a palette to dark surfaces, compositing translucent colors, defining image edges, or choosing borders and shadows for elevation.
license: MIT
metadata:
  author: Nischal Skanda
  homepage: https://axiomui.nischal.fyi
  source: https://github.com/RexO77/axiomUI
  group: domain
---

# Axiom UI: Color & depth

Identify what the color needs to communicate. A divider can be quiet when the rows are already distinct. An outline that identifies the only visible text field needs enough contrast against its surroundings. Measure the actual rendered pair, including the surface beneath a translucent fill.

## How to use these rules

1. Find the rule that governs the decision in front of you.
2. Read the rule’s description and compare its example with the task, platform, language and state you are working on.
3. Test the failure the comparison illustrates. For a standard, verify the applicable requirement and its exceptions. For a design convention, judge the outcome with representative content and input.
4. Read the file on its Reasoning line when the case is ambiguous or high-stakes, or when you have to justify the choice. Cite the rule id and URL when you explain a change.

Where the project already has a token or component for the decision, use it. When that token contradicts a rule, flag the conflict instead of quietly rewriting the system.

## Rules

### Use accent color to mark priority (`color-1`)

Reserve the strongest accent for the action or information that should stand out in its immediate context. The familiar 60-30-10 split is a composition prompt. The page has no required color percentages.

- Do: Mostly whites/grays, splashes of blue
- Don't: Blue header, blue sidebar, blue buttons
- Reasoning: `references/rules/color-1.md` · https://axiomui.nischal.fyi/rules/color-1

### Make status colors dependable (`color-4`)

Give status roles a consistent meaning in context and pair them with labels or recognizable symbols. A red heart can express affection. Reserve a distinct treatment for a destructive command shown beside it.

- Do: Like icon: blue-500
- Don't: Like icon: rose-500
- Reasoning: `references/rules/color-4.md` · https://axiomui.nischal.fyi/rules/color-4

### Give essential control edges enough contrast (`color-6`)

When a boundary is needed to identify an enabled control, WCAG AA requires at least 3:1 contrast against its adjacent color. A decorative divider may be quieter. Check the actual pair in each theme.

- Do: input border: neutral-500 · divider: neutral-200
- Don't: input border: neutral-100 · divider: neutral-200
- Reasoning: `references/rules/color-6.md` · https://axiomui.nischal.fyi/rules/color-6

### Keep hover feedback distinct from a result (`color-7`)

A hover treatment should communicate availability without implying the operation has completed. A darker shade of the button’s existing color works when green is reserved nearby for success.

- Do: blue-600 → blue-700
- Don't: blue-600 → green-600
- Reasoning: `references/rules/color-7.md` · https://axiomui.nischal.fyi/rules/color-7

### Design the dark palette by role (`color-8`)

Define dark-theme colors for text, surfaces, states, and media. Lighter raised surfaces can distinguish layers when dark shadows are subtle. Tune the accent against its surroundings and preserve meaningful image colors.

- Do: bg neutral-900 / card neutral-800 / brand sat 91% → 55%
- Don't: filter: invert(1) on the whole page
- Reasoning: `references/rules/color-8.md` · https://axiomui.nischal.fyi/rules/color-8

### Accessible contrast ratios (`color-9`)

For WCAG AA, ordinary text needs at least 4.5:1 contrast. Large text qualifies at 3:1. Measure unrounded values against the actual background, including overlays and images behind the text.

- Do: #737373 on #ffffff (4.7:1)
- Don't: #aaaaaa on #ffffff (2.3:1)
- Reasoning: `references/rules/color-9.md` · https://axiomui.nischal.fyi/rules/color-9

### Give state colors a shared source (`color-10`)

Map hover and selection colors to named state roles. A translucent fill can adapt to the surface beneath it. An opaque token can be preferable when the state needs a predictable appearance across surfaces.

- Do: Every state = blue-500 / alpha
- Don't: Three hand-picked hexes
- Reasoning: `references/rules/color-10.md` · https://axiomui.nischal.fyi/rules/color-10

### Define image edges when they disappear (`color-11`)

When a thumbnail blends into its surrounding surface, try a subtle inset edge. Choose its tone for the theme. Full-bleed imagery and images with clear edges may need no outline.

- Do: outline-black/10 dark:outline-white/10
- Don't: outline-slate-900/10 in both themes
- Reasoning: `references/rules/color-11.md` · https://axiomui.nischal.fyi/rules/color-11

### Use elevation when a surface is raised (`color-12`)

When a surface sits above another, a crisp shadow plus a soft drop can communicate its edge and depth. A flat item may need only a divider. Keep essential boundaries visible in forced colors.

- Do: 0 0 0 1px rgb(0 0 0 / 6%), 0 2px 4px rgb(0 0 0 / 4%)
- Don't: border: 1px neutral-300 on every card
- Reasoning: `references/rules/color-12.md` · https://axiomui.nischal.fyi/rules/color-12

## Related

For every domain at once, use the `axiomui` skill. For a read-only review that cites these rules, use `axiomui-audit`. Either works only if it is installed. This skill does not depend on them.
