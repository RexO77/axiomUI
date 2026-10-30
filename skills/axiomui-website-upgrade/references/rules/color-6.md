# Double contrast for borders

- ID: color-6
- Category: Color & depth
- Tags: Contrast, WCAG, Accessibility
- URL: https://axiomui.nischal.fyi/rules/color-6

An interactive edge needs more contrast than a passive divider, so inputs and outline buttons should sit a step darker. A border has to be found before it can be clicked.

- Do: input border: neutral-300 · divider: neutral-200
- Don't: input border: neutral-100 · divider: neutral-200

## Why it works

An outline button has no fill to separate it from the page, so its border is the only edge cue — neutral-100 sits too close in luminance to a white surface to register, while neutral-300 clears the perceptual threshold needed for double contrast against both the background and the label text. Interactive borders need a stronger step than passive dividers doing decorative separation.

## What breaks

An outline button styled with border-neutral-100 nearly disappears on a white card, so users hover past it without realizing it is clickable and abandon the flow looking for the real action.

## How to apply it

1. Set outline buttons and input fields to border-neutral-300.
2. Never reuse the subtle neutral-100 divider border on interactive elements.
3. Verify the border is visible at a glance on both white and off-white surfaces.
4. Increase to neutral-400+ only if the surface itself is already off-white.

## Review questions

1. Can you spot the outline button’s border without focusing hard?
2. Is the interactive border visibly darker than passive divider borders?
3. Does the input field read as clickable/editable at a glance?
