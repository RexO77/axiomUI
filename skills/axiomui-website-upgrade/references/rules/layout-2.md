# Text width limits

- ID: layout-2
- Category: Layout & spacing
- Tags: Readability, Responsive
- URL: https://axiomui.nischal.fyi/rules/layout-2

Lines of text should run 45-75 characters. Past that the return sweep to the next line gets harder to aim, and readers start losing their place mid-paragraph.

- Do: max-w: 45ch
- Don't: width: 100%

## Why it works

Line length governs how far the eye travels before jumping back to find the next line’s start. At 45-75 characters, roughly 65ch, that return sweep stays short enough that readers rarely lose their place; past that range, saccade length and re-fixation errors climb.

## What breaks

Setting width: 100% on a 27-inch monitor stretches a paragraph past 120 characters per line, so readers skip lines or reread the same one twice, and time-on-page for long-form content quietly drops.

## How to apply it

1. Cap body copy by character count, not by container width: anywhere in the 45-75ch band reads comfortably, and max-w-prose lands near its top.
2. Never let paragraph containers inherit width: 100% on wide viewports.
3. Test copy blocks at 1440px-plus widths, not just mobile breakpoints.
4. Apply the cap to text content specifically, not to images, tables, or full-bleed sections.

## Review questions

1. Can you count roughly 45-75 characters per line of body text at the widest breakpoint?
2. Does any paragraph stretch edge-to-edge on a large monitor?
3. Is a character-based cap applied to every text container, rather than letting it fill the viewport?
