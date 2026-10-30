# Nested radius formula

- ID: comp-3
- Category: Components & actions
- Tags: Shape, Polish
- URL: https://axiomui.nischal.fyi/rules/comp-3

Outer Radius = Inner Radius + Padding. This makes concentric corners look mathematically parallel.

- Do: Outer 12px = Inner 4px + Padding 8px
- Don't: Outer 4px = Inner 4px (padding ignored)

## Why it works

Concentric corners only read as parallel when the outer radius equals the inner radius plus the padding between them, a geometric nesting rule borrowed from how circles offset from a shared center. Break the formula and the eye detects the mismatch as visual noise even if it cannot name the problem.

## What breaks

An outer radius of 4px wrapped around an inner radius of 4px with padding between them creates a pinched, uneven gap that looks like a spacing bug rather than an intentional design choice.

## How to apply it

1. Calculate the outer radius as inner radius plus padding: 12 = 4 + 8.
2. Never set outer and inner radius to the same value when padding sits between them.
3. Recalculate the outer radius any time padding changes on a nested component.
4. Check card-in-card, tab-in-container, and badge-in-button patterns specifically.

## Review questions

1. Does the outer radius equal inner radius plus the padding between them?
2. Do the nested corners look concentric rather than pinched?
3. Was the radius recalculated after any recent padding change?
