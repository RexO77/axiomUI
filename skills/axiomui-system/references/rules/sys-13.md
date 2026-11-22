# Limit transitions to intended properties

- ID: sys-13
- Category: System & logic
- Tags: Motion, CSS, Performance
- URL: https://axiomui.nischal.fyi/rules/sys-13

List the CSS properties you want to animate. With transition: all, setting a new button width can animate that change too.

- Do: transition-property: scale, background-color
- Don’t: transition: all 150ms ease-out

## Why it works

The Save changes button animates its scale and background color. When the layout sets a new width, `transition: all` animates that too. Listing only `scale` and `background-color` lets the width change immediately.

- [CSS Transitions · Selecting properties to transition](https://www.w3.org/TR/css-transitions-1/#transition-property-property)
- [CSS Transitions · Starting a transition](https://www.w3.org/TR/css-transitions-1/#starting)
- [web.dev · High-performance CSS animations](https://web.dev/articles/animations-guide)
- [WCAG 2.2 · Animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

## What breaks

A button that stretches for 150ms makes a layout change look unfinished. Test by changing the button between two explicit widths. A font swap alone doesn’t set a new width.

## How to apply it

1. Define the intended properties, duration and easing for each state change.
2. With the control on screen, switch themes and change the layout. Watch which properties animate.
3. When someone requests reduced motion, remove the scale animation and keep the color cue.

## Before you ship

1. Which properties should animate, and are those the only ones listed?
2. Does an unrelated explicit width change stretch the control?
3. When the button changes width, do neighboring controls move straight to their final positions?
