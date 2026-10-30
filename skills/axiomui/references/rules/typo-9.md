# Limit font weights

- ID: typo-9
- Category: Typography & text
- Tags: Hierarchy, Consistency
- URL: https://axiomui.nischal.fyi/rules/typo-9

Use at most two weights per typeface (Regular + Semibold). Every extra weight shrinks the step between levels, until nothing reads as clearly dominant.

- Do: Regular + Semibold
- Don't: Regular + Medium + Semibold + Bold

## Why it works

Hierarchy works by contrast: two weights, say Regular and Semibold, create one unambiguous distinction between normal and emphasized text. Adding Light, Medium, and Bold into the same interface gives every weight a neighbor close enough to blur into it, so the contrast that signals importance disappears.

## What breaks

With five weights in play, a Medium label and a Regular label sit close enough in visual weight that users can’t tell which one is meant to stand out, and hierarchy collapses across the screen.

## How to apply it

1. Restrict a typeface to two weights: Regular and Semibold.
2. Never introduce Light, Medium, and Bold alongside them.
3. Reassign any Medium-weight text to either Regular or Semibold.
4. Audit a full screen for weight count before adding a new one.

## Review questions

1. Does the interface use at most two font weights?
2. Is it obvious which text is emphasized versus normal at a glance?
3. Are there any Light or Medium weights that could collapse into Regular?
