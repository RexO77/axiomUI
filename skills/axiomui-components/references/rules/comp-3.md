# Align nested corner radii

- ID: comp-3
- Category: Components & actions
- Tags: Shape, Polish
- URL: https://axiomui.nischal.fyi/rules/comp-3

For circular corners with an even inset, subtract the distance between the two painted edges from the outer radius. An outer radius of 12px and an 8px inset leave an inner radius of 4px.

- Do: Outer 12px = Inner 4px + Inset 8px
- Don't: Outer 4px and inner 4px with an 8px inset

## Why it works

The centers of two circular arcs coincide when their radii differ by the inset. Measure between the edges you want to align. A border can add to the distance between a card’s outer edge and the child’s edge.

- [CSS Backgrounds and Borders · Corner shaping](https://www.w3.org/TR/css-backgrounds-3/#corner-shaping)

## What breaks

Matching token names alone can leave the diagonal gap around a corner visibly wider or narrower than the straight gutter.

## How to apply it

1. Measure from painted edge to painted edge, including any intervening border.
2. Subtract the inset and use zero if the result would be negative.
3. Inspect other corner shapes separately, especially unequal insets and elliptical radii.

## Review questions

1. Which two edges should track each other?
2. Has the border been included in their separation?
3. Does the corner still read as an even inset at the smallest component size?
