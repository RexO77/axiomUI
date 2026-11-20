# Limit transitions to intended properties

- ID: sys-13
- Category: System & logic
- Tags: Motion, CSS, Performance
- URL: https://axiomui.nischal.fyi/rules/sys-13

List the properties that should animate in a state change. A broad transition can also animate unrelated changes in computed style.

- Do: transition-property: scale, background-color
- Don't: transition: all 150ms ease-out

## Why it works

Suppose a button animates its hover color and scale. Later a layout state changes its explicit width. With a general transition the width can interpolate too, while an explicit property list allows it to settle immediately.

- [CSS Transitions · Starting a transition](https://www.w3.org/TR/css-transitions-1/#starting)
- [CSS Transitions · Selecting properties to transition](https://www.w3.org/TR/css-transitions-1/#transition-property-property)

## What breaks

A button that stretches for 150ms while adjacent controls reposition can make a layout update look unfinished. A font swap changing intrinsic dimensions alone does not establish a transition between explicit width values.

## How to apply it

1. Define the intended properties, duration and easing for each state change.
2. Exercise unrelated layout and theme changes while the control is mounted.
3. Respect reduced motion where animation would distract or disorient.

## Review questions

1. Which computed values are intended to interpolate?
2. Does an unrelated explicit width change stretch the control?
3. Does the rest of the interface settle as expected?
