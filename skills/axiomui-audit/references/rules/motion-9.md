# Keep surface entrances near full size

- ID: motion-9
- Category: Motion & interaction
- Tags: Entry, Transform
- URL: https://axiomui.nischal.fyi/rules/motion-9

When a panel contains text or controls, begin near its reading size. Use a small scale change or fade if the entrance needs emphasis.

- Do: scale(0.95) + opacity 0
- Don't: scale(0) + opacity 0

## Why it works

Scaling a menu from zero makes every line pass through sizes too small to read. Starting at 95% of the final size keeps the text close to its resting geometry. On a small status glyph, the same relative change represents much less travel in pixels.

- [CSS Transforms · Transform geometry](https://www.w3.org/TR/css-transforms-1/)
- [WCAG 2.2 · Animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

## What breaks

A person can reach for a control before its moving edges align with the visible destination. Oversized scaling also adds motion to a routine action.

## How to apply it

1. Compare the same scale change on the smallest and largest surfaces.
2. Try opacity alone when text moves noticeably.
3. Keep the final position and focus cue visible when motion is reduced.

## Review questions

1. Can the user identify the menu as it appears?
2. How far do its outer edges travel?
3. Does scaling add information beyond the fade?
