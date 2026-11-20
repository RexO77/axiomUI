# Sign-in, chart access and mixed-direction text

Three cases extend the original 105-rule review. Each has a working comparison on its rule page and a static illustration in the gallery.

| Rule | Evidence and boundary | What to verify |
| --- | --- | --- |
| form-13 | WCAG 2.2 SC 3.3.8 covers authentication to an existing account. It permits assisting mechanisms, qualifying alternatives and specified recognition exceptions. W3C describes a six-box field that consumes only the first digit of a pasted code. Separate boxes can meet the criterion when the whole value can be entered at once. [Accessible authentication](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html) · [W3C failure F109](https://www.w3.org/WAI/WCAG22/Techniques/failures/F109) | Paste the sample 012345 and check the received string on each side. The comparison runs locally. A product review must also follow the real sign-in and recovery paths and test the password managers and platforms that customers use. |
| comp-13 | WAI’s complex-image tutorial distinguishes identifying a graphic from communicating its essential information. A structured table suits lookup tasks. How much description is appropriate depends on what readers need to learn from the chart. [WAI complex images](https://www.w3.org/WAI/tutorials/images/complex/) · [USWDS data visualizations](https://designsystem.digital.gov/components/data-visualizations/) | Hide the bars. Identify which support queue grew and look up March’s billing count of 27 tickets. Switch periods and check June’s 42 billing tickets. The plotted bars, summary and table use the selected rows. |
| typo-14 | W3C’s restaurant-review example shows an inserted name of unknown direction beside a separator and count. A tightly wrapped directional isolate protects the surrounding sentence. Document direction and language are independent settings. [W3C inline bidirectional text](https://www.w3.org/International/articles/inline-bidi-markup/) · [W3C document direction](https://www.w3.org/International/questions/qa-html-dir) | Switch between English and Hebrew. Check the name’s character order, then the side on which the number and separator appear. A bilingual review of copy and punctuation remains necessary before adopting the pattern in a localized product. |

### Rendered text and chart checks

Headless Chromium 149 and WebKit 26.5 rendered both language settings at a 390 × 844 CSS pixel viewport. The table gives the horizontal bounds returned by DOM text ranges in WebKit, rounded to CSS pixels. Chromium placed the same spans within one pixel. Starting at the left edge for English and the right edge for Hebrew, the isolated examples read name, separator, count, review label. In each unisolated example the count crossed the name. Within the Hebrew name the first glyph was on the right in both panes. Within the English name the first glyph was on the left.

| Interface and example | Restaurant name | En dash | Digit 5 | Review label |
| --- | --- | --- | --- | --- |
| English, isolated | 49–100 | 103–111 | 113–122 | 124–173 |
| English, unisolated | 70–122 | 59–68 | 49–57 | 124–173 |
| Hebrew, isolated | 276–341 | 265–274 | 255–263 | 208–252 |
| Hebrew, unisolated | 255–320 | 322–331 | 332–341 | 208–252 |

With the plot hidden, keyboard activation of “Monthly counts” exposed the Jan–Mar table. After switching to Q2, both browsers exposed a table named “Monthly support tickets, Apr–Jun” with Month, Billing and Delivery column headers. The June row exposed a row header and two cells carrying 42 and 32, respectively. The regression checks these semantics and the text order on the rule pages. The two checks passed on desktop Chromium at 1440 × 900 and phone-width WebKit at 390 × 844.

These measurements cover the two sample strings in a single line. A fluent Hebrew reader should review the wording, punctuation and longer names in context. Browser accessibility roles and names establish what the automated check can query. Spoken header announcements and navigation in VoiceOver or another screen reader still need a listening test.

The additional headless Firefox run did not reach the page. Its software compositor reported a framebuffer initialization failure at launch, so the measurements above cover Chromium and WebKit.

## Worked examples across sizes and themes

Headless Chromium rendered all three comparisons at 1440, 390 and 320 CSS pixels in both light and dark themes. None of the 18 combinations overflowed the page horizontally. Expanding the chart table originally displaced the desktop plots vertically by 59px. Both plots now retain the same top edge while the table grows. The disclosure target measures 44px high, and the phone’s bilingual demonstration fits each pane into 142px.

The sign-in check starts with its own selectable example. A keyboard user can focus it, copy all six characters, paste into the labeled field and submit with Enter. The comparison with six individual fields retains only the first character of the same paste. Native select typeahead also changed reporting period and review language in Chromium and WebKit.
