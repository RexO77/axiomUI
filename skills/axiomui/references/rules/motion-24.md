# Limit the total stagger

- ID: motion-24
- Category: Motion & interaction
- Tags: Stagger, Timing
- URL: https://axiomui.nischal.fyi/rules/motion-24

When a short sequence helps people follow a group of arrivals, budget for the last useful item. Cap or remove delays as the group grows.

- Do: 60ms between three row starts
- Don't: 220ms between items

## Why it works

Three rows with a 220ms entrance and 60ms between starts finish in 340ms. At 220ms between starts, the last finishes at 660ms. Extending either pattern to a long list changes when later items can be seen, even if the first row feels responsive.

- [Motion · Staggering animations](https://motion.dev/docs/stagger)
- [WAI-ARIA APG · Modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

## What breaks

A search result can already accept clicks while its opacity is zero. Keyboard focus can also advance to a row that has not become visible.

## How to apply it

1. Sequence items only when their order explains a relationship or change. Show a familiar dialog together when people need its title and action immediately.
2. Budget for the last useful item. For an even stagger, add the item duration to the interval times the number of gaps. Cap the animated group or start the remaining items together.
3. Ensure a focused or actionable item is visible immediately.

## Review questions

1. How long does the last useful item take to appear?
2. What happens when the list has thirty items?
3. Can someone tab to or click an invisible result?
