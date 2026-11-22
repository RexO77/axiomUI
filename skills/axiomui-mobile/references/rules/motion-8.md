# Show when a control is pressed

- ID: motion-8
- Category: Motion & interaction
- Tags: Buttons, Feedback
- URL: https://axiomui.nischal.fyi/rules/motion-8

Give a press an immediate visible state. A slight scale, fill or border change can work. Keep the control legible and preserve its hit area.

- Do: Pressed button face · scale(0.96)
- Don’t: Pressed button face · scale(0.90)

## Why it works

Feedback on contact shows that the button registered the press. A small scale change can suit a compact icon button. The same factor moves the edges of a wide button much farther, and scaling the actual hit target can move it out from under a pointer near the edge.

- [Apple HIG · Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
- [ACM TAP · Towards the temporally perfect virtual button](https://eprints.gla.ac.uk/104653/)
- [CSSOM View · Hit testing transformed elements](https://www.w3.org/TR/cssom-view-1/#dom-document-elementfrompoint)
- [WCAG 2.2 · Pointer cancellation](https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html)
- [CSS Transforms · Transform geometry](https://www.w3.org/TR/css-transforms-1/)
- [Adobe Spectrum · Motion](https://spectrum.adobe.com/page/motion/)

## What breaks

Committing a destructive action on pointer down can take away the chance to slide off and cancel before release.

## How to apply it

1. Apply decorative scale to an inner surface when the outer hit area should stay fixed.
2. Run the button’s action on click. Use :active for the pressed appearance.
3. Check keyboard activation, release outside and reduced motion.

## Before you ship

1. Can a press near an edge finish or cancel predictably?
2. Is the label still sharp and readable while held?
3. Can the pressed state be recognized without movement?
