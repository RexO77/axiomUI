# Use a shared spacing scale

- ID: layout-1
- Category: Layout & spacing
- Tags: Spacing, Consistency
- URL: https://axiomui.nischal.fyi/rules/layout-1

Use a shared scale for padding and gaps. A 4px base is a useful starting point. Hairlines, optical adjustments and sizes set by content can fall between steps.

- Do: 16px padding · 8px gaps
- Don’t: 13px padding · 5px gaps

## Why it works

One settings card uses 16px padding and 8px gaps. The other uses 13px padding and 5px gaps. Reusing the same gap between related items keeps new settings rows consistent.

- [USWDS · Spacing units](https://designsystem.digital.gov/design-tokens/spacing-units/)
- [IBM Carbon · Spacing](https://www.carbondesignsystem.com/building-blocks/foundations/spacing/overview)
- [Adobe Spectrum · Layout spacing](https://spectrum.adobe.com/foundations/layout-and-structure/spacing/layout-spacing)
- [Designsystems.com · Space, grids, and layouts](https://www.designsystems.com/space-grids-and-layouts/)
- [Every Layout · The Stack](https://every-layout.dev/layouts/stack/)

## What breaks

Slightly different gaps are harder to change together. Rounding a 1px border up to 4px makes it heavy, and forcing text into a fixed height can clip it.

## How to apply it

1. Choose tokens for common spaces within a group and between groups.
2. Reuse one token wherever the same relationship recurs.
3. Keep optical adjustments local and explain what required them.

## Before you ship

1. Do comparable components use the same spacing step?
2. Does each larger gap represent a different relationship?
3. Would the nearest grid step look better than this off-grid value?
