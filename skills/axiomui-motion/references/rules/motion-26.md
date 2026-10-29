# Split enter animations

- ID: motion-26
- Category: Motion & interaction
- Tags: Entry, Stagger
- URL: https://axiomui.nischal.fyi/rules/motion-26

Do not animate a whole page or panel as one object when its content has separate meaning. Split title, copy, and actions into short staggered groups.

- Do: Title, copy, actions staggered 80-100ms
- Don't: Title, copy, actions in one fade

## Why it works

A title, supporting copy, and action buttons are semantically separate pieces, so animating an entire panel as one fading block erases that distinction and asks the eye to parse everything at once. Splitting them into staggered groups at 80-100ms apart lets each piece register as its own idea in sequence, mirroring how a reader’s attention naturally moves from heading to body to action. This is the panel-level counterpart to per-item list stagger, applied to content roles instead of repeated items.

## What breaks

A modal fades in as one container, the title, body text, and buttons all appear simultaneously, and users report the panel feels like a flash of content rather than something they read.

## How to apply it

1. Split the panel into title, copy, and action groups with roughly 80-100ms stagger between them.
2. Never wrap the whole panel in a single fade or scale as though it were one object.
3. Order the stagger to match reading order: title first, then copy, then actions.
4. Keep each group’s individual animation short so the full sequence still resolves quickly.

## Review questions

1. Do the title, copy, and actions animate in as separate staggered groups?
2. Does the stagger order follow natural reading order, top to bottom?
3. Does the whole panel avoid animating in as one single fading block?
