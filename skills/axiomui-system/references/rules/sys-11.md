# Responsive breakpoint strategy

- ID: sys-11
- Category: System & logic
- Tags: Responsive, System, Mobile
- URL: https://axiomui.nischal.fyi/rules/sys-11

Two breakpoints, three tiers: mobile below 640px, tablet from 640px, desktop from 1024px. Break where the layout has to reflow, not where a device happens to exist.

- Do: 2 breakpoints: 640px / 1024px (3 tiers)
- Don't: 8 breakpoints, one per device

## Why it works

A breakpoint should mark a width where the layout genuinely has to reflow, where a column count or a density changes, not a width where some particular phone happens to exist. Three tiers cover that, and three tiers need only two queries: the base state carries mobile up to 640px, one query opens the tablet tier from there, a second opens desktop at 1024px, and the layout stops widening around 1280px. Every extra breakpoint past those two multiplies the states you have to design, review, and regression-test, for differences nobody outside the team will ever see.

## What breaks

Chasing device widths instead of reflow points leaves eight near-identical rules — 320, 375, 414, 480 and up — and the phone that ships at 393px falls into the 375px rule and renders cramped, with no single place to fix it because the width it needed sits between two rules that already exist.

## How to apply it

1. Declare two steps, 640px and 1024px, so the base state plus those two give you three tiers, and stop the widest one widening near 1280px.
2. Change column count and density at those steps only; leave the widths between them fluid.
3. Never add a breakpoint for a specific device, aspect ratio, or screen model.
4. Test by dragging the window through each step and watching for one clean reflow, not several.

## Review questions

1. Does this layout reflow only at the declared steps, plus the base state below the first one?
2. Does dragging the window through a step produce one clean change rather than a sequence of small shifts?
3. Is there any media query targeting a specific device or screen model?
