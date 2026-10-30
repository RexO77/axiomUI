# Avoid inheritable motion variables

- ID: motion-23
- Category: Motion & interaction
- Tags: Gestures, Performance
- URL: https://axiomui.nischal.fyi/rules/motion-23

Updating CSS variables on a parent can recalculate styles for every child. For drag distance, update the element transform directly.

- Do: element.style.transform
- Don't: Parent --swipe-amount variable

## Why it works

Setting a CSS custom property like --swipe-amount on a parent element forces the browser to recompute styles for every descendant that references it, since custom property invalidation cascades down the whole subtree on each update. Writing directly to element.style.transform touches only that one element’s compositor layer. For a value updating every drag frame, that difference is the gap between 60fps and a dropped-frame stutter.

## What breaks

A drag handler updates a --swipe-amount variable on a parent container every pointermove, style recalculation cascades to every child that reads it, and the drag visibly stutters under a large or nested DOM tree.

## How to apply it

1. Write drag distance straight to element.style.transform on the dragged element.
2. Never update a shared custom property on a parent as the per-frame drag value.
3. Confirm no descendant styles reference a variable that changes every pointermove.
4. Profile style recalculation in devtools while dragging to confirm it stays scoped to one element.

## Review questions

1. Is the drag transform written directly to the dragged element’s style, not a parent variable?
2. Does dragging stay smooth even inside a deeply nested or large DOM subtree?
3. Does devtools performance recording show no wide style recalculation during the drag?
