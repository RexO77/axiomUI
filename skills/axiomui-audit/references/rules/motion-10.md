# Origin-aware popovers

- ID: motion-10
- Category: Motion & interaction
- Tags: Overlays, Transform
- URL: https://axiomui.nischal.fyi/rules/motion-10

Popovers should scale from their trigger. Center origin is correct for modals, but anchored UI should respect its source.

- Do: transform-origin: the trigger
- Don't: transform-origin: center

## Why it works

A scale animation always has one fixed point, the single pixel that does not move, and the eye finds it for free: it is the only stable reference in a frame where everything else is expanding. Put that point on the trigger and the animation states its own cause — the menu grew out of the button you pressed — with no arrow or highlight needed. Put it at the panel’s center and the fixed point lands in the middle of content still too small to read, so it names nothing, and the link between click and result has to be worked out afterwards from position alone. Modals are the exception only because nothing on screen launched them from a particular place.

## What breaks

A popover that scales from center instead of its trigger appears to materialize disconnected from the button that opened it, forcing users to visually search for the connection.

## How to apply it

1. Set transform-origin to the trigger element’s position.
2. Reserve center-origin scaling exclusively for modals with no single anchor point.
3. Calculate origin dynamically if the trigger can appear in different screen positions.
4. Recheck origin behavior when a popover is repositioned by collision detection near screen edges.

## Review questions

1. Does the popover visually grow out of the element that triggered it?
2. Does a modal scale from the center of the screen rather than an edge?
3. Does any anchored menu appear to originate from the wrong location?
