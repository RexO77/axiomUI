# Reference colors by role, not by value

- ID: sys-5
- Category: System & logic
- Tags: System, Semantics, Dark mode, Contrast
- URL: https://axiomui.nischal.fyi/rules/sys-5

Give text, surfaces and warnings separate color roles. Set their values per theme so text stays readable and a button can change color independently of a warning.

- Do: var(--text) → #f5f5f5 on #262626 (13.9:1)
- Don’t: #0f172a on #262626 (1.2:1)

## Why it works

The invoice card asks for the text role, which resolves to #f5f5f5 on the dark theme and measures 13.9:1 on its #262626 surface. The same card with the light theme’s #0f172a written into it keeps that ink after the switch and measures 1.2:1, so the invoice number all but vanishes. Roles also keep features apart: a Save button and an overdue warning can share a blue today and still change separately in the next theme.

- [IBM Carbon · Color roles and themes](https://www.carbondesignsystem.com/building-blocks/foundations/color/overview)
- [Adobe Spectrum · Design tokens](https://spectrum.adobe.com/page/design-tokens/)
- [Design Tokens Community Group · Aliases and references](https://www.designtokens.org/tr/2025.10/format/#aliases-references)
- [WCAG 2.2 · Contrast (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

## What breaks

A fixed text color that works on a light surface can disappear on a dark one. If a warning uses the button’s color token, restyling the button also changes the warning.

## How to apply it

1. Define roles for text, muted text, surfaces, borders and states, and give each a value per theme. Components ask for the role. Use aliases where the system needs that indirection rather than three layers for every value.
2. To find literal colors in components, search outside the token files: `grep -rnE "#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(|text-\[#|bg-\[#" src/components`. Each match either becomes a role or is a deliberate fixed color, such as a brand logo, with a comment saying so.
3. Render each screen in every supported theme and measure the resolved text and surface pairs. Check that a deliberately high-contrast palette and forced colors still show every boundary.

## Before you ship

1. When you switch themes, can you still read the text and recognize the icons against their backgrounds?
2. Which role does this component request, and can the warning change without the action changing with it?
3. Does the invoice text have at least 4.5:1 contrast against its card in every theme?
