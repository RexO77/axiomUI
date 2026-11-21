---
name: axiomui-layout
description: Use Axiom UI’s layout guidance when choosing a spacing scale, setting line measure and container widths, grouping fields and labels, fitting padding around controls, optically aligning glyphs, choosing cards, dividers or space as a group boundary, adapting gutters and reflowing at narrow widths, keeping anchors and focus clear of sticky headers, reserving space for images and embeds, keeping a subject in each crop, reviewing mixed-direction rows, or resolving stacking contexts.
license: MIT
metadata:
  author: Nischal Skanda
  homepage: https://axiomui.nischal.fyi
  source: https://github.com/RexO77/axiomUI
  group: domain
---

# Axiom UI: Layout & spacing

Compare the distance from a field to its own label with the distance to the next field. Narrow the viewport to 320px with the longest label the product supports, then reload on a throttled connection and follow an in-page link under the sticky header. Those checks reveal whether spacing communicates relationships, whether the layout still fits, and whether media and fixed bars push content out of view.

## How to use these rules

1. Find the rule that governs the decision in front of you.
2. Read the rule’s description and compare its example with the task, platform, language and state you are working on.
3. Test the failure the comparison illustrates. For a standard, verify the applicable requirement and its exceptions. For a design convention, judge the outcome with representative content and input.
4. Read the file on its Reasoning line when the case is ambiguous or high-stakes, or when you have to justify the choice. Cite the rule id and URL when you explain a change.

Where the project already has a token or component for the decision, use it. When that token contradicts a rule, flag the conflict instead of quietly rewriting the system.

## Rules

### Use a shared spacing scale (`layout-1`)

Choose named spacing steps for repeated relationships. A 4px base is useful for padding and gaps. Hairlines, optical offsets, and content-driven dimensions can use other values.

- Do: 4px, 8px, 16px, 24px, 32px, 48px
- Don't: 13px, 5px
- Reasoning: `references/rules/layout-1.md` · https://axiomui.nischal.fyi/rules/layout-1

### Set a measure for long-form text (`layout-2`)

Limit the width of sustained prose on wide screens. Around 65 characters per line is a useful starting point for English paragraphs. Check the actual text because 1ch measures the width of the zero glyph.

- Do: max-width: 52ch
- Don't: width: 100%
- Reasoning: `references/rules/layout-2.md` · https://axiomui.nischal.fyi/rules/layout-2

### Show which items belong together (`layout-3`)

Use a smaller gap within a label–field pair and a larger gap between fields. Keep each label programmatically associated with its control.

- Do: Label (gap-2) Input (gap-6) Next Label
- Don't: Label (gap-4) Input (gap-4) Next Label
- Reasoning: `references/rules/layout-3.md` · https://axiomui.nischal.fyi/rules/layout-3

### Optically center asymmetric glyphs (`layout-4`)

Center the icon box first. If an asymmetric glyph still looks displaced inside its control, compare a small offset at the intended size. Some icon sets already provide optical compensation.

- Do: Play icon nudged +2px right
- Don't: Play icon on the geometric center
- Reasoning: `references/rules/layout-4.md` · https://axiomui.nischal.fyi/rules/layout-4

### Size button padding around the label (`layout-5`)

For a short text button, try more inline padding than block padding. Set the hit area, line height, and space for long labels separately from that visual proportion.

- Do: py-2 px-4 (ratio 2:1)
- Don't: py-2 px-2 (ratio 1:1)
- Reasoning: `references/rules/layout-5.md` · https://axiomui.nischal.fyi/rules/layout-5

### Anchor a row icon to the text it describes (`layout-6`)

When an icon introduces a multiline notification, align it to the first line. Centering it in the whole text block moves it down as detail wraps. A single-line action can use centered alignment.

- Do: items-start + 1px top offset
- Don't: items-center on the whole text block
- Reasoning: `references/rules/layout-6.md` · https://axiomui.nischal.fyi/rules/layout-6

### Choose a boundary that explains the group (`layout-7`)

Use headings and space for related content that reads in sequence. A card surface or border can help when an item stands on its own or takes a distinct action.

- Do: White card on light gray bg
- Don't: White card with gray border on white bg
- Reasoning: `references/rules/layout-7.md` · https://axiomui.nischal.fyi/rules/layout-7

### Adapt outer spacing to available width (`layout-9`)

Reconsider large page and card insets when a layout narrows. Preserve the spacing that holds small controls and related text together. Change a token when the content shows why.

- Do: p-3 sm / p-6 lg
- Don't: p-6 sm / p-6 lg
- Reasoning: `references/rules/layout-9.md` · https://axiomui.nischal.fyi/rules/layout-9

### Use spacing to express vertical hierarchy (`layout-10`)

Give lines within one item, neighboring items, and major sections different spacing roles. Reuse the same role whenever that relationship recurs.

- Do: 8px / 16px / 32px section break
- Don't: 8px / 16px / 16px section break
- Reasoning: `references/rules/layout-10.md` · https://axiomui.nischal.fyi/rules/layout-10

### Define stacking order within each context (`layout-11`)

Give overlay roles an intentional order and identify the stacking context that contains them. A large z-index on a child cannot lift it above a higher sibling context or the browser’s top layer.

- Do: z-index: 9999 outside the transform, above Activity
- Don't: z-index: 9999 inside the transform, behind Activity
- Reasoning: `references/rules/layout-11.md` · https://axiomui.nischal.fyi/rules/layout-11

### Keep scroll and focus targets clear of sticky headers (`layout-12`)

Account for the height of sticky headers and footers in the scroll container. After an anchor jump or keyboard focus, the entire target should be visible.

- Do: scroll-padding-top: 64px
- Don't: scroll-padding-top: 0px
- Reasoning: `references/rules/layout-12.md` · https://axiomui.nischal.fyi/rules/layout-12

### Reserve space for media before it loads (`layout-13`)

Give images, videos, and embeds dimensions or an aspect ratio before they load. Reserve that space on the first render so nearby controls stay where people expect them.

- Do: aspect-ratio: 2 / 1 before load
- Don't: 0px reserved before load
- Reasoning: `references/rules/layout-13.md` · https://axiomui.nischal.fyi/rules/layout-13

### Keep the subject in the crop at every ratio (`layout-14`)

When an image fills frames of different proportions, check the crop at each ratio. Set a focal point or supply another crop so the subject stays in frame.

- Do: object-position: right center · latch in both crops
- Don't: object-position: center · latch cropped out
- Reasoning: `references/rules/layout-14.md` · https://axiomui.nischal.fyi/rules/layout-14

## Cross-listed from other domains

Text direction affects where names, separators and counts sit in a localized row. Reflow at narrow widths decides where the layout recomposes.

### Keep names and counts together across scripts (`typo-14`)

A name inserted into a translated sentence can run in either direction. Isolate the name so the browser keeps the surrounding punctuation and count with the sentence.

- From: Typography & text
- Do: Isolate the restaurant name before its review count
- Don't: Insert the name directly before the dash and count
- Reasoning: `references/rules/typo-14.md` · https://axiomui.nischal.fyi/rules/typo-14

### Keep the task usable at 320 CSS pixels (`sys-11`)

Narrow the viewport to 320 CSS pixels, or zoom a 1280px window to 400%, and complete the page’s main task. Content should reflow without sideways scrolling. A wide table, map or code block may scroll inside its own region.

- From: System & logic
- Do: 320px: fields stack · Continue in view
- Don't: 320px: min-width 512px · Continue off-screen
- Reasoning: `references/rules/sys-11.md` · https://axiomui.nischal.fyi/rules/sys-11

## Related

For every domain at once, use the `axiomui` skill. For a read-only review that cites these rules, use `axiomui-audit`. Either works only if it is installed. This skill does not depend on them.
