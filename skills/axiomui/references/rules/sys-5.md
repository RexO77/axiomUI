# Give shared colors semantic roles

- ID: sys-5
- Category: System & logic
- Tags: System, Semantics
- URL: https://axiomui.nischal.fyi/rules/sys-5

Let components request a role such as accent or warning. Map that role to a palette value for each theme when several components share the same intent.

- Do: blue-500 (palette) → accent (alias) → component
- Don't: $button-blue → component

## Why it works

A Save button and an overdue invoice can happen to share a hue today. Their meanings can diverge in the next theme. A named role allows each to change independently even when both point at the same palette entry.

- [Design Tokens Community Group · Aliases and references](https://www.designtokens.org/tr/2025.10/format/#aliases-references)

## What breaks

Reusing a button-specific color token for a warning quietly couples the two features. A brand update to the button then changes the warning’s meaning and contrast.

## How to apply it

1. Identify roles that need independent control across themes.
2. Use aliases where the design system needs that indirection, rather than requiring three layers for every value.
3. Check the resolved foreground and background pairs in each supported theme.

## Review questions

1. What intent does this component request?
2. Can the warning change without changing the action?
3. Do aliases resolve to legible pairs in every theme?
