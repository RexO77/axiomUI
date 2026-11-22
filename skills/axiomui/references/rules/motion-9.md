# Start panels near full size

- ID: motion-9
- Category: Motion & interaction
- Tags: Entry, Transform
- URL: https://axiomui.nischal.fyi/rules/motion-9

Start menus and panels close to full size so their labels stay readable. A small scale change or a fade can mark the entrance.

- Do: scale(0.95) + opacity 0
- Don’t: scale(0) + opacity 0

## Why it works

Scaling a menu from zero makes every line pass through sizes too small to read. Starting at 95% of the final size keeps the text close to its resting geometry. On a small status glyph, the same relative change represents much less travel in pixels.

- [Headless UI · Popover transitions](https://headlessui.com/react/popover)
- [CSS Transforms · Transform geometry](https://www.w3.org/TR/css-transforms-1/)
- [Microsoft Fluent · Motion](https://fluent2.microsoft.design/motion)
- [WCAG 2.2 · Animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
- [web.dev · Web Animations API improvements](https://web.dev/blog/web-animations)

## What breaks

As a menu grows from zero, its items move under the pointer. Someone reaching for a familiar item can hit the next row instead.

## How to apply it

1. Compare the same scale change on the smallest and largest surfaces.
2. Try opacity alone when text moves noticeably.
3. Keep the final position and focus cue visible when motion is reduced.

## Before you ship

1. Can the user identify the menu as it appears?
2. How far do its outer edges travel?
3. Does scaling add information beyond the fade?
