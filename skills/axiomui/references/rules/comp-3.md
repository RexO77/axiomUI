# Align nested corner radii

- ID: comp-3
- Category: Components & actions
- Tags: Shape, Polish
- URL: https://axiomui.nischal.fyi/rules/comp-3

For circular corners with an even inset, subtract the inset from the outer radius. Measure between painted edges, including the border. With a 12px outer radius and an 8px inset, the inner radius is 4px.

- Do: Outer 12px = Inner 4px + Inset 8px
- Don’t: Outer 4px and inner 4px with an 8px inset

## Why it works

The gap stays even around a circular corner when both curves share a center. Here, 7px of padding and a 1px border make an 8px inset. Subtract that from the 12px outer radius to get 4px.

- [CSS Backgrounds and Borders · Corner shaping](https://www.w3.org/TR/css-backgrounds-3/#corner-shaping)
- [GitLab Pajamas · Concentric nested radii](https://design.gitlab.com/product-foundations/border/#keep-nested-radii-concentric)
- [Apple SwiftUI · Concentric corners](https://developer.apple.com/documentation/swiftui/edge/corner/style/concentric)
- [REI Cedar · Border radius](https://cedar.rei.com/guidelines/radius)

## What breaks

Giving both the card and the field a 4px radius makes the corner gap wider than the 8px gap along the sides.

## How to apply it

1. Measure from painted edge to painted edge, including any intervening border.
2. Subtract the inset from the outer radius. Use zero if the result is negative.
3. Check the curves separately when the insets differ or the corners are elliptical.

## Before you ship

1. Which two edges should track each other?
2. Did you include the border in the inset?
3. Does the corner still read as an even inset at the smallest component size?
