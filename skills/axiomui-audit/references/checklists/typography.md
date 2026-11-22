# Typography & text checklist

Ask each question of the surface under review. Check the rule's description before you record a finding, then record the observed failure or unmet requirement and the evidence for it.

## Use sentence case for English UI labels (`typo-1`)

Use sentence case for ordinary English labels and headings. Keep the spelling of names and acronyms intact, including title case in official titles. Follow the casing conventions of each translation.

- Do: Invite your team / Skip for now · Don't: Invite Your Team / Skip For Now
- [ ] Does the label follow the convention for this language?
- [ ] Does a named service retain its own spelling?
- [ ] Will the localized string reach the screen as written?
- Reasoning: `references/rules/typo-1.md`

## Letter spacing on caps (`typo-2`)

For a short uppercase Latin label, compare the font’s default spacing with a small positive adjustment. Judge the result at its displayed size.

- Do: Short caps · +0.025em tracking · Don't: tracking-normal (0em)
- [ ] Do adjacent forms stay distinct at the rendered size?
- [ ] Does the label fit when the reader increases spacing?
- [ ] Is this treatment appropriate for the script being displayed?
- Reasoning: `references/rules/typo-2.md`

## Set body leading for sustained reading (`typo-3`)

For a paragraph of 16px Latin text, try a unitless line-height of 1.5. Adjust it with the typeface, line length, and language in view.

- Do: Size: 16px / Line-height: 24px · Don't: Size: 16px / Line-height: 18px
- [ ] Can you follow the next line throughout a realistic paragraph?
- [ ] Do accents and descenders clear adjacent lines?
- [ ] When spacing increases, is all text still present and usable?
- Reasoning: `references/rules/typo-3.md`

## Fit leading to wrapped headings (`typo-4`)

Set heading leading with a two- or three-line title. Start tighter than paragraph leading if that keeps the title together, and leave clearance for the tallest marks in the supported scripts.

- Do: 22px / 24px line-height (1.1x) · Don't: 22px / 33px line-height (1.5x)
- [ ] Do both lines still read as one title?
- [ ] Do accented capitals and descending marks clear adjacent lines?
- [ ] Does the heading remain intact when enlarged?
- Reasoning: `references/rules/typo-4.md`

## Give each typeface a job (`typo-5`)

Start with one family for product headings and body text. Add another family when it serves a recognizable role, such as code, editorial display, or coverage for another script.

- Do: One sans for headings + body · Don't: Arial headings + Verdana body
- [ ] Where does the change of family signal a change of role?
- [ ] Could the existing family express the same distinction?
- [ ] Which face actually renders the localized copy?
- Reasoning: `references/rules/typo-5.md`

## Keep secondary text at a readable size (`typo-6`)

Size secondary text for the task it supports. An email below a member’s name still needs to be easy to read when it helps someone choose the right person.

- Do: 14px member email · Don't: 10px member email
- [ ] Can a reader distinguish the people by their addresses?
- [ ] Can you read the address at the normal zoom level?
- [ ] Can a longer address still be read when text is enlarged?
- Reasoning: `references/rules/typo-6.md`

## Align comparable numbers (`typo-7`)

Align amounts at the numeric end of a column and use tabular figures when the font supports them. With consistent fractional precision, corresponding place values then line up.

- Do: font-variant-numeric: tabular-nums · Don't: font-variant-numeric: proportional-nums
- [ ] Do the decimal marks line up in representative amounts?
- [ ] Do negative values and localized currency symbols still fit?
- [ ] Would adding a zero change what the number implies?
- Reasoning: `references/rules/typo-7.md`

## Align paragraphs to the reading start (`typo-8`)

Give multiline prose a stable starting edge. For horizontal text, start alignment places English on the left and Arabic on the right. Reserve centering for short, self-contained passages that still work when they wrap.

- Do: Left-aligned paragraph text · Don't: Centered multi-line paragraph
- [ ] Can the reader return to a consistent starting edge?
- [ ] Does right-to-left text follow its own reading direction?
- [ ] Is the centered treatment still suitable at its longest length?
- Reasoning: `references/rules/typo-8.md`

## Assign font weights by role (`typo-9`)

Use a small set of weights with named purposes. Regular and semibold can distinguish the body and heading in a settings card. Add another weight only when the distinction remains visible at the intended size.

- Do: Regular + Semibold · Don't: Regular + Medium + Semibold + Bold
- [ ] Which text should the reader encounter first?
- [ ] Does incidental metadata compete with the heading?
- [ ] Do adjacent weights remain distinct in the loaded font?
- Reasoning: `references/rules/typo-9.md`

## Preserve meaning when text overflows (`typo-10`)

Let meaningful text wrap when space permits. In a compact row, an ellipsis can protect neighboring controls if the reader can still obtain the full value before acting.

- Do: truncate (single-line ellipsis) · Don't: overflow-visible, no truncation
- [ ] Can two files with the same prefix still be distinguished?
- [ ] Can keyboard and touch users reveal the complete value?
- [ ] Do the size and actions stay accessible at narrow widths?
- Reasoning: `references/rules/typo-10.md`

## Choose a readable body size (`typo-11`)

Start routine reading around 16px and adjust for the typeface, task, and distance. Give essential details enough space to enlarge without losing content.

- Do: Body: 16px / Subtext: 12px · Don't: Body: 11px / Subtext: 9px
- [ ] Can the reader make the decision using the smallest essential line?
- [ ] At 200% enlargement, are all details and actions available?
- [ ] Could moving or wrapping a detail recover space?
- Reasoning: `references/rules/typo-11.md`

## Balance short headings (`typo-12`)

Try balanced wrapping when a short multiline heading ends with an isolated word. Read the resulting phrases at several widths before making it the heading default.

- Do: h1, h2, h3 { text-wrap: balance } · Don't: h1, h2, h3 { text-wrap: wrap }
- [ ] Does the title read naturally across the break?
- [ ] How does the longest translated heading wrap?
- [ ] Does the layout still work with ordinary wrapping?
- Reasoning: `references/rules/typo-12.md`

## Review wrapping in short descriptions (`typo-13`)

Try text-wrap: pretty on a caption or card description with an awkward ending. Browsers choose the details of the wrapping algorithm, so judge the result on the engines you support.

- Do: p.description { text-wrap: pretty } · Don't: p.description { text-wrap: wrap }
- [ ] Does the closing phrase read naturally?
- [ ] Can the description gain a line without losing its action?
- [ ] Does ordinary wrapping still give a usable result?
- Reasoning: `references/rules/typo-13.md`

## Keep names and counts together across scripts (`typo-14`)

A name inserted into a translated sentence can run in either direction. Isolate the name so the browser keeps the surrounding punctuation and count with the sentence.

- Do: Isolate the restaurant name before its review count · Don't: Insert the name directly before the dash and count
- [ ] In an English row with a Hebrew name, does the count read as part of the review phrase?
- [ ] Does a Latin name keep its own order in a Hebrew row?
- [ ] Have readers of each language checked the punctuation at the displayed size?
- Reasoning: `references/rules/typo-14.md`

## Tighten display tracking only until letters crowd (`typo-15`)

When tightening a display headline, check the gaps between neighboring glyphs at the shipped font, weight, and size. An em-based adjustment moves the letters farther as the type gets larger. Stop while the closest pairs still have a visible gap.

- Do: 38px semibold · tracking -0.015em · Don't: 38px semibold · tracking -0.05em
- [ ] Open the hero at its largest breakpoint, wait for the webfont, and toggle the tracking declaration in DevTools. Is there still a visible gap between the closest strokes with the declaration on?
- [ ] Which letter pair comes closest at the smaller heading size?
- [ ] Do the closest pairs in translated headlines still have visible space between them?
- Reasoning: `references/rules/typo-15.md`

## Also in scope

This domain also depends on rules filed under other domains. Walk these items too whenever this domain is in scope:

- `layout-2` Set a measure for long-form text (`references/checklists/layout.md`)
- `a11y-5` Choose heading levels by outline, not size (`references/checklists/accessibility.md`)
