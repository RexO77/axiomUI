# Visual vs mathematical center

- ID: layout-4
- Category: Layout & spacing
- Tags: Alignment, Icons, Polish
- URL: https://axiomui.nischal.fyi/rules/layout-4

Icons with lopsided mass — a play triangle, a send arrow — read as off-center when centered by their bounding box. The eye centers visual weight, not the box.

- Do: Play icon nudged +2px right
- Don't: Play icon on the geometric center

## Why it works

A right-pointing play triangle carries most of its area against the flat left edge and tapers to a point on the right, so its centroid sits about a third of the way in from that edge, left of the bounding box’s center. Center the box and the shape reads as sitting left; nudging it 1-2px right puts perceived center back on true center. Typefaces make the same correction when they overshoot round letterforms past the baseline.

## What breaks

Center a play icon by its bounding box alone and it reads as off-center inside its button, a defect reviewers will flag even when the CSS math is technically correct.

## How to apply it

1. Nudge asymmetric icons 1-2px away from their heavy side: a right-pointing play triangle moves right.
2. Don’t trust absolute centering, such as margin: auto, as the final check for asymmetric shapes.
3. Verify alignment by eye, not by inspecting computed box dimensions.
4. Apply the same correction to any icon with uneven mass: arrows, chevrons, triangles.

## Review questions

1. Does the icon look centered when you squint at it, not just measure it?
2. Has an asymmetric icon like a play triangle been nudged off mathematical center?
3. Would swapping in a symmetric icon reveal a now mis-centered container?
