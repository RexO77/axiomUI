# Responsive spacing scaling

- ID: layout-9
- Category: Layout & spacing
- Tags: Spacing, Responsive, Mobile
- URL: https://axiomui.nischal.fyi/rules/layout-9

Don't ship one spacing scale to every breakpoint. Scale padding and margins down on small screens — a 48px gutter spends an eighth of a 375px viewport on nothing.

- Do: p-3 sm / p-6 lg
- Don't: p-6 sm / p-6 lg

## Why it works

Padding that stays fixed while the viewport shrinks eats a growing share of available width, so p-6 on a 1440px screen and the same p-6 on a 375px phone aren’t equivalent — 24px each side is 48px of gutter, a thirtieth of the desktop width and an eighth of the phone’s. Scaling padding down per breakpoint, p-6 at lg down to p-4 at md down to p-3 at sm, holds the proportion roughly constant instead of the pixel value.

## What breaks

Ship p-6 at every breakpoint and on a small phone the content area shrinks to a narrow column squeezed between two thick padding bands, forcing text to wrap awkwardly or truncate.

## How to apply it

1. Scale padding down per breakpoint: p-6 at lg, p-4 at md, p-3 at sm.
2. Never hardcode one padding value, like p-6, across every breakpoint.
3. Reduce margins alongside padding, not just container padding, for full proportional scaling.
4. Check the smallest supported viewport first — that’s where fixed spacing does the most damage.

## Review questions

1. Does padding visibly shrink from desktop to tablet to mobile breakpoints?
2. Is any padding or margin value identical at every breakpoint?
3. Does content on the smallest screen retain a reasonable amount of usable width?
