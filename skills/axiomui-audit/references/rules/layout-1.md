# The 4pt grid system

- ID: layout-1
- Category: Layout & spacing
- Tags: Spacing, Consistency
- URL: https://axiomui.nischal.fyi/rules/layout-1

Every margin, padding, and height should be divisible by 4. A fixed step means components built by different people still line up, and nobody has to defend a 13px gap.

- Do: 4px, 8px, 16px, 24px, 32px, 48px
- Don't: 13px, 5px

## Why it works

The 4pt grid turns spacing into a shared vocabulary: every value is a whole multiple of one base unit, so any two components snap into alignment without negotiation. It also survives fractional device pixel ratios — 4, 8, 16, and 24 stay whole numbers at 1.5x and 2x, while 13px lands on 19.5 device pixels at 1.5x and gets rounded one way here and the other way there. This is systemic scale design, not personal taste.

## What breaks

Once one component uses 13px padding, every neighboring component built to the 4pt scale misaligns by a few pixels, and the drift compounds across nested containers until edges visibly stair-step down the page.

## How to apply it

1. Restrict every spacing value to one published scale: 4, 8, 16, 24, 32, 48px.
2. Reject values like 13px or 5px on sight — round to the nearest multiple of 4.
3. Encode the scale in Tailwind config or CSS variables so arbitrary values need an explicit escape hatch.
4. Audit existing components for legacy odd-numbered padding or margin and normalize them.

## Review questions

1. Does every margin and padding value divide evenly by 4?
2. Do adjacent components share the same base spacing unit?
3. Are there any hardcoded odd pixel values, like 13px or 5px, in the styles?
