---
name: axiomui
description: Axiom UI's library of 105 UI design rules, each with a Do/Don't pair, a canonical URL, and full reasoning. Use when building new interface code and a concrete, citable value is needed for type, spacing, color and contrast, buttons and overlays, form fields and validation, loading and empty states, animation timing and easing, or accessibility; when the user mentions Axiom UI or cites a rule id such as typo-1 or motion-12; or when two UI treatments are on the table and the choice should rest on an established rule rather than taste. To change an existing interface, use axiomui-website-upgrade only if it is installed; otherwise apply the rules here. For a review without edits, use axiomui-audit only if it is installed; otherwise review with this library.
license: MIT
metadata:
  author: Nischal Skanda
  homepage: https://axiomui.nischal.fyi
  source: https://github.com/RexO77/axiomUI
  group: core
---

# Axiom UI

Axiom UI is a library of 105 UI design rules across 8 domains. Each rule is one decision with a concrete Do, a concrete Don't, and written reasoning. Use the rules to make interface choices you can cite, instead of choices you have to defend on taste.

## Which Axiom UI skill

This skill is the rule library. The other Axiom UI skills each add a procedure for one job, and each applies only if it is installed:

- Building new UI and choosing a value or a treatment: stay here. Find the rule and apply it.
- Changing an existing interface in code: use `axiomui-website-upgrade`. It adds the upgrade loop, the craft standards and a verification contract.
- Reviewing without editing: use `axiomui-audit`. It adds per-domain checklists, a severity scale and a report format.
- Working mostly in one domain: use that domain's skill (`axiomui-typography`, `axiomui-layout`, `axiomui-color`, `axiomui-components`, `axiomui-forms`, `axiomui-system`, `axiomui-motion`, `axiomui-accessibility`). It carries the domain's rules inline, with sharper triggers.

When the matching skill is not installed, stay here. Every rule is in this skill.

## How to apply a rule

1. Find the rule. Pick the domain in the table below and open its file, or scan the rule index for the id or title.
2. Apply its Do as written. Durations, ratios, sizes and easing curves are targets, not suggestions.
3. Check the result against its Don't. Code that matches the Don't is a violation, whatever the intent behind it.
4. Read the rule's file under `references/rules/` when the case is ambiguous or high-stakes, or when you need the reasoning: why it works, what breaks, how to apply it, and the questions to ask in review.
5. Cite the rule id and its URL when you explain a change, so the reader can check the decision.

Where the project already has a token or component for the decision, use it. When that token contradicts a rule, flag the conflict instead of quietly rewriting the system.

## When breaking a rule is right

Axiom UI's tagline is the policy: "Built for consistency. Break rules only after mastering them." A rule gives way when the product's context makes the tradeoff clearly better: an established brand system, a platform convention, or a measured result. When you break one, name the rule, say why, and say what you did instead. Never break a rule silently, and never because following it is inconvenient.

## Domains

| Domain | Rules | Compact Do/Don't |
|---|---|---|
| Typography & text | 13 | `references/typography.md` |
| Layout & spacing | 11 | `references/layout.md` |
| Color & depth | 12 | `references/color.md` |
| Components & actions | 12 | `references/components.md` |
| Forms & inputs | 12 | `references/forms.md` |
| System & logic | 13 | `references/system.md` |
| Motion & interaction | 29 | `references/motion.md` |
| Accessibility & inclusivity | 3 | `references/accessibility.md` |

## Rule index

### Typography & text

- `typo-1` Sentence case is king (`references/rules/typo-1.md`)
- `typo-2` Letter spacing on caps (`references/rules/typo-2.md`)
- `typo-3` Line height math (body) (`references/rules/typo-3.md`)
- `typo-4` Line height math (headings) (`references/rules/typo-4.md`)
- `typo-5` The 2-font limit (`references/rules/typo-5.md`)
- `typo-6` De-emphasize with color, not size (`references/rules/typo-6.md`)
- `typo-7` Numeric alignment (`references/rules/typo-7.md`)
- `typo-8` Left align body copy (`references/rules/typo-8.md`)
- `typo-9` Limit font weights (`references/rules/typo-9.md`)
- `typo-10` Truncation strategy (`references/rules/typo-10.md`)
- `typo-11` Minimum body size (`references/rules/typo-11.md`)
- `typo-12` Balance short headings (`references/rules/typo-12.md`)
- `typo-13` Pretty wrap UI copy (`references/rules/typo-13.md`)

### Layout & spacing

- `layout-1` The 4pt grid system (`references/rules/layout-1.md`)
- `layout-2` Text width limits (`references/rules/layout-2.md`)
- `layout-3` Group by proximity (`references/rules/layout-3.md`)
- `layout-4` Visual vs mathematical center (`references/rules/layout-4.md`)
- `layout-5` Button padding formula (`references/rules/layout-5.md`)
- `layout-6` Optical alignment of icons (`references/rules/layout-6.md`)
- `layout-7` The container fallacy (`references/rules/layout-7.md`)
- `layout-8` Consistent gutters (`references/rules/layout-8.md`)
- `layout-9` Responsive spacing scaling (`references/rules/layout-9.md`)
- `layout-10` Vertical rhythm (`references/rules/layout-10.md`)
- `layout-11` Z-index scale (`references/rules/layout-11.md`)

### Color & depth

- `color-1` 60-30-10 rule (`references/rules/color-1.md`)
- `color-2` Never pure black (`references/rules/color-2.md`)
- `color-3` Colored shadows (`references/rules/color-3.md`)
- `color-4` Semantic colors (`references/rules/color-4.md`)
- `color-5` Border colors (`references/rules/color-5.md`)
- `color-6` Double contrast for borders (`references/rules/color-6.md`)
- `color-7` Hover = same hue (`references/rules/color-7.md`)
- `color-8` Dark mode isn't inverted (`references/rules/color-8.md`)
- `color-9` Accessible contrast ratios (`references/rules/color-9.md`)
- `color-10` Opacity over new colors (`references/rules/color-10.md`)
- `color-11` Neutral image outlines (`references/rules/color-11.md`)
- `color-12` Shadows can replace borders (`references/rules/color-12.md`)

### Components & actions

- `comp-1` Action hierarchy (`references/rules/comp-1.md`)
- `comp-2` Destructive actions (`references/rules/comp-2.md`)
- `comp-3` Nested radius formula (`references/rules/comp-3.md`)
- `comp-4` Avatars are circles (`references/rules/comp-4.md`)
- `comp-5` Modal vs drawer (`references/rules/comp-5.md`)
- `comp-6` Toast vs inline error (`references/rules/comp-6.md`)
- `comp-7` Icon + label for ambiguous actions (`references/rules/comp-7.md`)
- `comp-8` Disabled needs a reason (`references/rules/comp-8.md`)
- `comp-9` Loading states on buttons (`references/rules/comp-9.md`)
- `comp-10` Consistent icon size (`references/rules/comp-10.md`)
- `comp-11` Card click area (`references/rules/comp-11.md`)
- `comp-12` Close affordance on overlays (`references/rules/comp-12.md`)

### Forms & inputs

- `form-1` Labels top aligned (`references/rules/form-1.md`)
- `form-2` No placeholders as labels (`references/rules/form-2.md`)
- `form-3` Mark optional, not required (`references/rules/form-3.md`)
- `form-4` Input width hints (`references/rules/form-4.md`)
- `form-5` Checkbox vs radio (`references/rules/form-5.md`)
- `form-6` Dropdown vs radio (`references/rules/form-6.md`)
- `form-7` Switch vs checkbox (`references/rules/form-7.md`)
- `form-8` Validate on blur (`references/rules/form-8.md`)
- `form-9` Format hints (`references/rules/form-9.md`)
- `form-10` Single column forms (`references/rules/form-10.md`)
- `form-11` Smart defaults (`references/rules/form-11.md`)
- `form-12` Success state feedback (`references/rules/form-12.md`)

### System & logic

- `sys-1` Skeleton loading (`references/rules/sys-1.md`)
- `sys-2` Empty states (`references/rules/sys-2.md`)
- `sys-3` Click targets (Fitts's law) (`references/rules/sys-3.md`)
- `sys-4` Date formats (`references/rules/sys-4.md`)
- `sys-5` Design tokens naming (`references/rules/sys-5.md`)
- `sys-6` Undo destructive actions (`references/rules/sys-6.md`)
- `sys-7` Show progress for multi-step (`references/rules/sys-7.md`)
- `sys-8` Keyboard navigation (`references/rules/sys-8.md`)
- `sys-9` Optimistic UI updates (`references/rules/sys-9.md`)
- `sys-10` Graceful degradation (`references/rules/sys-10.md`)
- `sys-11` Responsive breakpoint strategy (`references/rules/sys-11.md`)
- `sys-13` Transition only what changes (`references/rules/sys-13.md`)
- `sys-14` Use will-change sparingly (`references/rules/sys-14.md`)

### Motion & interaction

- `motion-1` Animate by frequency (`references/rules/motion-1.md`)
- `motion-2` Keyboard actions stay instant (`references/rules/motion-2.md`)
- `motion-3` Purpose before motion (`references/rules/motion-3.md`)
- `motion-4` Use strong custom easing (`references/rules/motion-4.md`)
- `motion-5` Never use ease-in for UI (`references/rules/motion-5.md`)
- `motion-6` Keep UI motion under 300ms (`references/rules/motion-6.md`)
- `motion-7` Asymmetric enter and exit (`references/rules/motion-7.md`)
- `motion-8` Press feedback (`references/rules/motion-8.md`)
- `motion-9` Never scale from zero (`references/rules/motion-9.md`)
- `motion-10` Origin-aware popovers (`references/rules/motion-10.md`)
- `motion-11` Subsequent tooltips are instant (`references/rules/motion-11.md`)
- `motion-12` Use transitions for interruptible UI (`references/rules/motion-12.md`)
- `motion-13` Use starting styles for entry (`references/rules/motion-13.md`)
- `motion-14` Animate transform and opacity (`references/rules/motion-14.md`)
- `motion-15` Use percentage transforms (`references/rules/motion-15.md`)
- `motion-16` Gate hover motion (`references/rules/motion-16.md`)
- `motion-17` Reduced motion still has intent (`references/rules/motion-17.md`)
- `motion-18` Gesture dismissal uses velocity (`references/rules/motion-18.md`)
- `motion-19` Damp drag boundaries (`references/rules/motion-19.md`)
- `motion-20` Capture pointer during drag (`references/rules/motion-20.md`)
- `motion-21` Use CSS under load (`references/rules/motion-21.md`)
- `motion-22` Use WAAPI for programmatic motion (`references/rules/motion-22.md`)
- `motion-23` Avoid inheritable motion variables (`references/rules/motion-23.md`)
- `motion-24` Stagger without blocking (`references/rules/motion-24.md`)
- `motion-25` Review motion in slow time (`references/rules/motion-25.md`)
- `motion-26` Split enter animations (`references/rules/motion-26.md`)
- `motion-27` Subtle exit motion (`references/rules/motion-27.md`)
- `motion-28` Animate contextual icons (`references/rules/motion-28.md`)
- `motion-29` Skip default load animation (`references/rules/motion-29.md`)

### Accessibility & inclusivity

- `a11y-1` Focus visible indicators (`references/rules/a11y-1.md`)
- `a11y-2` Color shouldn't be the only signal (`references/rules/a11y-2.md`)
- `a11y-3` Touch target spacing (`references/rules/a11y-3.md`)
