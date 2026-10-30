# Consistent icon size

- ID: comp-10
- Category: Components & actions
- Tags: Icons, Consistency
- URL: https://axiomui.nischal.fyi/rules/comp-10

Icons in the same context should be the same size. Don't mix 16px and 20px icons in the same toolbar or nav.

- Do: All toolbar icons: 20px
- Don't: Mixed 16px, 20px, 24px icons in toolbar

## Why it works

Same-context icons need one shared size because the eye reads size variance as a signal of importance or hierarchy, even when none is intended. Mixing 16px, 20px, and 24px icons in one toolbar sends a false hierarchy signal, making users hunt for meaning in a difference that is really just inconsistency.

## What breaks

A toolbar mixing 16px and 24px icons makes some actions look more prominent than others for no reason, causing users to misjudge which controls are primary versus minor.

## How to apply it

1. Standardize every toolbar icon to a single size, like 20px, across the context.
2. Audit nav bars and toolbars for stray 16px or 24px icons mixed in.
3. Apply size changes at the icon-set level, not per individual icon.
4. Keep size variance reserved for genuinely different contexts, like nav versus inline.

## Review questions

1. Are all icons in this toolbar rendered at the same size?
2. Is any icon in this toolbar a different size from the ones beside it?
3. Does icon size stay consistent across this entire navigation context?
