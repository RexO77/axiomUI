# Use motion to show what changed

- ID: motion-3
- Category: Motion & interaction
- Tags: Intent, Feedback
- URL: https://axiomui.nischal.fyi/rules/motion-3

Use motion to show where a panel came from or which action succeeded. Save a bounce for a change worth drawing attention to.

- Do: Details panel slides in from the right
- Don’t: Dialog grows past its final size

## Why it works

The Details panel slides in from the right, showing which edge it belongs to. The dialog grows to 115% of its final size and shrinks back. That bounce draws attention to the frame while someone is trying to read.

- [IBM Carbon · Motion principles and timing](https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview)
- [Atlassian Design · Applying motion](https://atlassian.design/foundations/motion/applying-motion)
- [Apple HIG · Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- [NN/g · The role of animation and motion in UX](https://www.nngroup.com/articles/animation-purpose-ux/)
- [IEEE TVCG · Animated transitions in statistical data graphics](https://idl.uw.edu/papers/animated-transitions)
- [WCAG 2.2 · Animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

## What breaks

A bounce on every open draws attention back to the dialog frame while someone is trying to read its contents.

## How to apply it

1. Describe the change the user should notice.
2. Match a directional transition to the panel’s actual placement.
3. Compare the transition with an immediate change and inspect what information disappears.

## Before you ship

1. Can someone tell which edge the Details panel came from?
2. Does the animation call attention to the right event?
3. Does the end state communicate the result with reduced motion enabled?
