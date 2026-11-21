# Typography & text

Compact Do/Don't for every rule in this domain. Each Reasoning line names the file with the full write-up.

## Use sentence case for English UI labels (`typo-1`)

Use sentence case for ordinary English labels and headings. Keep the spelling of names and acronyms intact, including title case in official titles. Follow the casing conventions of each translation.

- Do: Invite your team / Skip for now
- Don't: Invite Your Team / Skip For Now
- Reasoning: `references/rules/typo-1.md` · https://axiomui.nischal.fyi/rules/typo-1

## Letter spacing on caps (`typo-2`)

For a short uppercase Latin label, compare the font’s default spacing with a small positive adjustment. Judge the result at its displayed size.

- Do: Short caps · +0.025em tracking
- Don't: tracking-normal (0em)
- Reasoning: `references/rules/typo-2.md` · https://axiomui.nischal.fyi/rules/typo-2

## Set body leading for sustained reading (`typo-3`)

For a paragraph of 16px Latin text, try a unitless line-height of 1.5. Adjust it with the typeface, line length, and language in view.

- Do: Size: 16px / Line-height: 24px
- Don't: Size: 16px / Line-height: 18px
- Reasoning: `references/rules/typo-3.md` · https://axiomui.nischal.fyi/rules/typo-3

## Fit leading to wrapped headings (`typo-4`)

Set heading leading with a two- or three-line title. Start tighter than paragraph leading if that keeps the title together, and leave clearance for the tallest marks in the supported scripts.

- Do: 22px / 24px line-height (1.1x)
- Don't: 22px / 33px line-height (1.5x)
- Reasoning: `references/rules/typo-4.md` · https://axiomui.nischal.fyi/rules/typo-4

## Give each typeface a job (`typo-5`)

Start with one family for product headings and body text. Add another family when it serves a recognizable role, such as code, editorial display, or coverage for another script.

- Do: Manrope for headings + body
- Don't: Arial headings + Verdana body
- Reasoning: `references/rules/typo-5.md` · https://axiomui.nischal.fyi/rules/typo-5

## Keep secondary text at a readable size (`typo-6`)

Size secondary text for the task it supports. An email below a member’s name still needs to be easy to read when it helps someone choose the right person.

- Do: 14px member email
- Don't: 10px member email
- Reasoning: `references/rules/typo-6.md` · https://axiomui.nischal.fyi/rules/typo-6

## Align comparable numbers (`typo-7`)

Align amounts at the numeric end of a column and use tabular figures when the font supports them. With consistent fractional precision, corresponding place values then line up.

- Do: font-variant-numeric: tabular-nums
- Don't: font-variant-numeric: proportional-nums
- Reasoning: `references/rules/typo-7.md` · https://axiomui.nischal.fyi/rules/typo-7

## Align paragraphs to the reading start (`typo-8`)

Give multiline prose a stable starting edge. For horizontal text, start alignment places English on the left and Arabic on the right. Reserve centering for short, self-contained passages that still work when they wrap.

- Do: Left-aligned paragraph text
- Don't: Centered multi-line paragraph
- Reasoning: `references/rules/typo-8.md` · https://axiomui.nischal.fyi/rules/typo-8

## Assign font weights by role (`typo-9`)

Use a small set of weights with named purposes. Regular and semibold can distinguish the body and heading in a settings card. Add another weight only when the distinction remains visible at the intended size.

- Do: Regular + Semibold
- Don't: Regular + Medium + Semibold + Bold
- Reasoning: `references/rules/typo-9.md` · https://axiomui.nischal.fyi/rules/typo-9

## Preserve meaning when text overflows (`typo-10`)

Let meaningful text wrap when space permits. In a compact row, an ellipsis can protect neighboring controls if the reader can still obtain the full value before acting.

- Do: truncate (single-line ellipsis)
- Don't: overflow-visible, no truncation
- Reasoning: `references/rules/typo-10.md` · https://axiomui.nischal.fyi/rules/typo-10

## Choose a readable body size (`typo-11`)

Start routine reading around 16px and adjust for the typeface, task, and distance. Give essential details enough space to enlarge without losing content.

- Do: Body: 16px / Subtext: 12px
- Don't: Body: 11px / Subtext: 9px
- Reasoning: `references/rules/typo-11.md` · https://axiomui.nischal.fyi/rules/typo-11

## Balance short headings (`typo-12`)

Try balanced wrapping when a short multiline heading ends with an isolated word. Read the resulting phrases at several widths before making it the heading default.

- Do: h1, h2, h3 { text-wrap: balance }
- Don't: h1, h2, h3 { text-wrap: wrap }
- Reasoning: `references/rules/typo-12.md` · https://axiomui.nischal.fyi/rules/typo-12

## Review wrapping in short descriptions (`typo-13`)

Try text-wrap: pretty on a caption or card description with an awkward ending. Browsers choose the details of the wrapping algorithm, so judge the result on the engines you support.

- Do: p.description { text-wrap: pretty }
- Don't: p.description { text-wrap: wrap }
- Reasoning: `references/rules/typo-13.md` · https://axiomui.nischal.fyi/rules/typo-13

## Keep names and counts together across scripts (`typo-14`)

A name inserted into a translated sentence can run in either direction. Isolate the name so the browser keeps the surrounding punctuation and count with the sentence.

- Do: Isolate the restaurant name before its review count
- Don't: Insert the name directly before the dash and count
- Reasoning: `references/rules/typo-14.md` · https://axiomui.nischal.fyi/rules/typo-14

## Tighten display tracking only until letters crowd (`typo-15`)

When tightening a display headline, check the gaps between neighboring glyphs at the shipped font, weight, and size. An em-based adjustment moves the letters farther as the type gets larger. Stop while the closest pairs still have a visible gap.

- Do: 38px semibold · tracking -0.015em
- Don't: 38px semibold · tracking -0.05em
- Reasoning: `references/rules/typo-15.md` · https://axiomui.nischal.fyi/rules/typo-15

## Related rules in other domains

- `layout-2` Set a measure for long-form text (`references/layout.md`)
- `a11y-5` Choose heading levels by outline, not size (`references/accessibility.md`)
