# Card click area

- ID: comp-11
- Category: Components & actions
- Tags: Click targets, Navigation
- URL: https://axiomui.nischal.fyi/rules/comp-11

If a card is clickable, the entire card should be the click target, not just the title or a tiny link inside it.

- Do: Hit area: 100% of the card
- Don't: Hit area: 16% (title text only)

## Why it works

Fitts’s law says a larger, closer target is faster and easier to hit, so a full card click area turns the entire surface into one generous target instead of forcing precision onto a small title link. Shrinking the target to just the title text ignores decades of pointing-device research for no visual gain.

## What breaks

A card where only the title text is clickable makes users miss the target repeatedly when clicking the image or whitespace, producing frustrated re-clicks and a sense that the card is unresponsive.

## How to apply it

1. Wrap the entire card in the click handler, not just the title text.
2. Keep any internal links, like a secondary action button, as separate stop-propagation targets.
3. Add a hover state across the full card to confirm the click area visually.
4. Test by clicking the image and empty padding, not just the title.

## Review questions

1. Does clicking anywhere on the card, not just the title, trigger navigation?
2. Is there a hover state confirming the full card is the target?
3. Do secondary links inside the card still work independently of the card click?
