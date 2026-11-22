# Make a one-link card clickable throughout

- ID: comp-11
- Category: Components & actions
- Tags: Click targets, Navigation
- URL: https://axiomui.nischal.fyi/rules/comp-11

When a card has one destination, let the whole card open it. Give additional actions their own targets and keep text selectable where readers need to copy it.

- Do: The whole card links to the article
- Don’t: Only the article title is clickable

## Why it works

If the image, title and padding all suggest one link, readers expect any of them to open it. A menu, checkbox or second link needs its own target.

- [HTML · Links and nested interactive content](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-a-element)
- [New York State Design System · Interactive cards](https://designsystem.ny.gov/components/card/)
- [Inclusive Components · Cards](https://inclusive-components.design/cards/#thepseudocontenttrick)
- [WCAG 2.2 · Target size (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [NICE Design System · Clickable cards](https://design-system.nice.org.uk/components/card/)

## What breaks

If only the title is linked, clicking the card’s padding does nothing. Stretching a link over a Save button can block that button or prevent text selection. A clickable div also loses the browser’s link menu.

## How to apply it

1. Use a native link with a concise, descriptive name for navigation.
2. Keep buttons, checkboxes and other links outside the card link so each can receive clicks and keyboard focus.
3. Check the image, padding, text selection, context menu and keyboard focus in the rendered card.

## Before you ship

1. Can readers click anywhere the card looks clickable?
2. Can each secondary action be operated independently?
3. Can readers select text that they may need to copy?
