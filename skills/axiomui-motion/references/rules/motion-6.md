# Keep UI motion under 300ms

- ID: motion-6
- Category: Motion & interaction
- Tags: Timing, Perceived performance
- URL: https://axiomui.nischal.fyi/rules/motion-6

Most interface motion should finish quickly. Slow everyday transitions make the product feel heavier than it is.

- Do: Menu: 180ms
- Don't: Menu: 500ms

## Why it works

Everyday transitions like a 180ms dropdown stay under the threshold where motion reads as responsive rather than deliberate; a 500ms popover crosses into feeling like a loading state instead of an instant UI reaction.

## What breaks

A 500ms popover triggered on every hover adds up across dozens of daily uses, making the whole product feel padded and slow even though nothing is actually loading.

## How to apply it

1. Cap dropdown transitions at 180ms and popovers well under 300ms.
2. Flag any transition duration above 300ms in code review as a motion violation.
3. Reserve durations closer to 300ms for larger surfaces like page transitions, not small popovers.
4. Measure the rendered duration, not just the declared value, since easing can extend perceived length.

## Review questions

1. Does the dropdown finish opening in under 200ms?
2. Does any popover or menu take half a second or longer to appear?
3. Do small UI transitions feel snappy rather than deliberate?
