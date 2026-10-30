# Border colors

- ID: color-5
- Category: Color & depth
- Tags: Contrast, Surfaces
- URL: https://axiomui.nischal.fyi/rules/color-5

Borders should sit well below text contrast — if your text is neutral-900, your borders belong near neutral-200. A border is structure, not content, and at text contrast it competes with the words it frames.

- Do: border: neutral-200
- Don't: border: neutral-400

## Why it works

Border weight should track the same contrast step-down as your text hierarchy: if body text sits at neutral-900, a border at neutral-200 stays clearly subordinate, while neutral-400 jumps too many steps and starts competing with content for attention. This is simultaneous contrast at work — a border reads heavier next to light fills than the same value would in isolation.

## What breaks

Neutral-400 borders around every card and input create a grid of heavy lines that visually outweighs the text inside, so the layout reads as a spreadsheet of boxes rather than content.

## How to apply it

1. Set default dividers and card borders to neutral-200.
2. Never jump to neutral-400 for standard borders — reserve heavier steps for emphasis.
3. Check border weight relative to your body text color, not in isolation.
4. Scan the page for any border that draws the eye before the content does.

## Review questions

1. Do borders fade into the background rather than framing it heavily?
2. Is any border darker than neutral-200 without a specific reason?
3. Does content draw more attention than the dividers around it?
