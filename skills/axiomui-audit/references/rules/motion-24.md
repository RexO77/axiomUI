# Cap the total stagger time

- ID: motion-24
- Category: Motion & interaction
- Tags: Stagger, Timing
- URL: https://axiomui.nischal.fyi/rules/motion-24

Stagger rows when their order helps people follow a change. Check when the last row finishes. As the list grows, shorten the delay or show the rows together.

- Do: Three rows start 60ms apart
- Don’t: Three rows start 220ms apart

## Why it works

Three rows with a 220ms entrance and 60ms between starts finish in 340ms. At 220ms between starts, the last finishes at 660ms. With thirty rows, the last would finish at 1,960ms or 6,600ms respectively.

- [Fluent 2 · Motion choreography](https://fluent2.microsoft.design/motion/)
- [Carbon · Motion choreography](https://www.carbondesignsystem.com/building-blocks/foundations/motion/choreography)
- [Motion · Staggering animations](https://motion.dev/docs/stagger)
- [MDN · CSS opacity](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/opacity)
- [WAI-ARIA APG · Modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [Material Design 1 · Motion choreography](https://m1.material.io/motion/choreography.html)

## What breaks

A search result can already accept clicks while its opacity is zero. Keyboard focus can also advance to a row that has not become visible.

## How to apply it

1. Sequence items only when their order explains a relationship or change. Show a familiar dialog together when people need its title and action immediately.
2. Budget for the last useful item. For evenly spaced starts, the last row finishes at duration + interval × (rows − 1). Cap the animated group or start the remaining items together.
3. Show each row before it can receive focus or clicks.

## Before you ship

1. When does the last row finish its entrance?
2. What happens when the list has thirty items?
3. Can someone tab to or click an invisible result?
