# Keep routine exits quiet

- ID: motion-27
- Category: Motion & interaction
- Tags: Exit, Timing
- URL: https://axiomui.nischal.fyi/rules/motion-27

Use a short fade or small movement when a dismissed item has no destination to explain. A longer directional exit can help when the item returns to a known place.

- Do: opacity 0 + translateY(-12px) at 150ms
- Don't: translateY(-100%) scale(0.5) at 400ms

## Why it works

On a routine dismissal, attention often belongs to the content behind or beside the departing item. Here a 12px lift and fade remove a control in 150ms. A drawer returning to its screen edge or a card moving into an archive can use more travel to show where it went.

- [IBM Carbon · Motion principles and timing](https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview)

## What breaks

Exaggerated motion can compete with the next task. Removing an item too abruptly can also make an important change in position difficult to follow.

## How to apply it

1. Identify what the user should look at after dismissal.
2. Remove the outgoing item from interaction when appropriate.
3. Keep nearby content stable or show clearly how it moves into the vacated space.

## Review questions

1. Where does the next action take place?
2. Does the departure explain a destination when one exists?
3. Can the leaving element still block input after it disappears?
