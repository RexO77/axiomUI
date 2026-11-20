# Size a card’s primary link

- ID: comp-11
- Category: Components & actions
- Tags: Click targets, Navigation
- URL: https://axiomui.nischal.fyi/rules/comp-11

A card with one destination can offer a generous link target. On a card with multiple actions, give each an independent target and preserve text selection where readers need it.

- Do: Single-destination card with a card-sized target
- Don't: Card looks clickable, only its title responds

## Why it works

If the image, heading and whitespace all advertise the same destination, a generous target matches that promise. Cards containing a menu, a checkbox or another link require distinct interaction areas.

- [HTML · Links and nested interactive content](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-a-element)
- [WCAG 2.2 · Target size (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

## What breaks

An invisible link stretched over an entire card can intercept its Save button or block selecting a tracking number. A generic clickable container can also lose native link features such as opening in a new tab.

## How to apply it

1. Use a native link with a concise, descriptive name for navigation.
2. Keep other interactive elements outside that link, with independently reachable targets.
3. Check the image, padding, text selection, context menu and keyboard focus in the rendered card.

## Review questions

1. Does the visual affordance agree with the clickable area?
2. Can each secondary action be operated independently?
3. Can readers select text that they may need to copy?
