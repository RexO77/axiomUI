# Rule sources

Generated from the source research: per rule, its claims, each source with the passage it supports, where the rule is judgement, and credible disagreement. `src/data/rule-sources.ts` carries the links the site shows.

## typo-1

Claims: Use sentence case for ordinary English UI labels and headings, including dialog titles and actions. Preserve authored product names, acronyms and official titles. Apply language-specific casing in translation resources and avoid blanket case transforms.

- [Microsoft Writing Style Guide · Capitalization](https://learn.microsoft.com/en-us/style-guide/capitalization) · guideline · Applies sentence-style capitalization to ordinary English UI labels and headings, with exceptions for proper names and official casing. · “Capitalize the first word of a sentence, heading, title, UI label”
- [Adobe Spectrum · Grammar and mechanics](https://spectrum.adobe.com/content/grammar-and-mechanics) · guideline · Uses sentence case for product UI and reserves title case for official entities, with specific treatment for brands and acronyms. · “Use title case only when it clarifies that we’re speaking about a specific, official entity”
- [Mozilla · Localized text capitalization](https://mozilla.github.io/ecosystem-platform/reference/localization) · practice · Recommends putting the intended capitalization in the source string and letting localizers choose casing for their locale. · “let localizers determine what is best for their locale.”
- [Atlassian Design · Button usage](https://atlassian.design/components/button/usage) · guideline · Applies sentence case to button labels and preserves proper nouns. · “Only capitalize the first letter of the button and any proper nouns.”

Judgement: The sample wording and the decision to adopt sentence case as the product’s English house style are editorial choices.

Disagreement: Apple HIG uses title-style capitalization for button labels (https://developer.apple.com/design/human-interface-guidelines/buttons). The Windows Win32 guide uses title case for titles and sentence case for other UI elements (https://learn.microsoft.com/en-us/windows/win32/uxguide/text-ui). Both are platform-specific alternatives.

## typo-2

Claims: Compare default tracking and a small positive adjustment on short uppercase Latin labels. Use +0.025em as an example and judge spacing in the actual face, weight and size. Check long translations at narrow widths and ensure user text-spacing overrides cause no clipping.

- [USWDS · Typography](https://designsystem.digital.gov/components/typography/) · guideline · Specifically recommends letter-spacing token 1 for uppercase buttons and stronger spacing for longer uppercase treatments. · “Consider using letterspacing 1 with uppercase buttons”
- [USWDS · Letterspacing tokens](https://designsystem.digital.gov/design-tokens/typesetting/letterspacing/) · guideline · Defines token 1 as 0.025em, the cited trial value for uppercase buttons. · “0.025em”
- [Butterick’s Practical Typography · Letterspacing](https://practicaltypography.com/letterspacing.html) · practice · Explains why adjacent all-capital letters can look crowded, especially at small sizes. · “But when you use capital letters together, that spacing looks too tight.”
- [WCAG 2.2 · Text spacing overrides and clipping](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html) · standard · Requires no loss with the specified simultaneous spacing overrides, including 0.12 times the font size for tracking where applicable. · “without loss of content or functionality”
- [Microsoft Learn · International design](https://learn.microsoft.com/en-us/globalization/methodology/international-design) · guideline · Explains why uppercase treatment may not apply across scripts and why translated text needs expansion room. · “Capitalization can matter, or isn't applicable, depending on language and script.”

Judgement: Whether the default or +0.025em reads better depends on the sample font and rendered label.

Disagreement: Butterick prescribes 5–12% extra tracking for caps, a stronger and larger recommendation than the targeted 0.025em trial (https://practicaltypography.com/letterspacing.html).

## typo-3

Claims: Try unitless 1.5 leading (24px at 16px) as a starting point for Latin body text, compared with 18px. Assess line returns and glyph clearance in full paragraphs at different measures, in each supported script. Distinguish WCAG AAA availability of 1.5 line spacing for blocks of text from WCAG AA survival of specified overrides. Allow the text container to grow when readers change spacing.

- [MDN · Line height](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/line-height) · guideline · Documents unitless multiplication by the element’s size and recommends 1.5 or more for main paragraph copy. · “The used value is this unitless <number> multiplied by the element's own font size.”
- [USWDS · Line height](https://designsystem.digital.gov/design-tokens/typesetting/line-height/) · guideline · Lists a 1.5 token for a paragraph or two of running text and varies the token by use and measure. · “usage: short (1-2 paragraphs) of running text, especially with a short measure”
- [WCAG 2.2 · Visual presentation (1.4.8)](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html) · standard · AAA calls for users to have a way to achieve at least 1.5 line spacing within blocks of text. · “Line spacing (leading) is at least space-and-a-half within paragraphs”
- [WCAG 2.2 · Text spacing overrides and clipping (1.4.12)](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html) · standard · AA requires content to survive the prescribed spacing changes, including a line height of at least 1.5 times font size where applicable. · “without loss of content or functionality”
- [Material Design · Typography](https://m1.material.io/style/typography.html) · guideline · Shows a script-specific leading treatment and explains why tall ascenders and descenders need clearance. · “Characters in tall languages often have long descenders and/or ascenders.”

Judgement: The 16px example and judgement that 24px is more comfortable than 18px are specific to the demonstration and its reading context.

Disagreement: Butterick recommends 120–145% for most text (https://practicaltypography.com/line-spacing.html). An Arial Wikipedia reading experiment found marginal spacing effects at the tested extremes and recommended the study’s default leading (https://pielot.org/pubs/Rello2016-Fontsize.pdf).

## typo-4

Claims: Evaluate leading on a heading that wraps to two or three lines and compare it with body leading. At 22px in the sample, 24px leading groups the two lines more tightly than 33px. Check longer translations, tall marks and descenders, and verify the title still works when enlarged.

- [USWDS · Typography](https://designsystem.digital.gov/components/typography/) · guideline · Pairs shorter headings with tighter leading tokens and prescribes more room for sustained reading. · “1 (line-height 1) and 1.35 (line-height 3).”
- [IBM Carbon · Type sets](https://www.carbondesignsystem.com/building-blocks/foundations/typography/type-sets) · guideline · Shows separate layout heading and body tokens with distinct sizes and line heights. · “This is for component and layout headings. It pairs with $body-01.”
- [Material Design · Typography](https://m1.material.io/style/typography.html) · guideline · Sets leading by size and weight and gives dense and tall scripts more room to avoid clipping. · “Characters in tall languages often have long descenders and/or ascenders.”
- [Adobe Spectrum · Typography system](https://spectrum.adobe.com/foundations/typography/typography-system) · guideline · Applies a tighter default line-height category to headings than to body and highlights the risk of related lines feeling disconnected. · “When it is too loose, related content can feel disconnected.”
- [WCAG 2.2 · Resize text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) · standard · Applies the 200% text enlargement requirement to headings, with layout growth as one way to preserve the text. · “text can be resized without assistive technology up to 200 percent without loss of content or functionality.”

Judgement: The 22px size and 24px versus 33px comparison illustrate one font and composition. There is no universal heading ratio.

## typo-5

Claims: Start with one shared family for product headings and body copy. Add another family for a recognizable role such as code, editorial display or script coverage. Verify the actual fonts that render localized strings, including fallback when glyphs are unavailable.

- [Apple HIG · Typography](https://developer.apple.com/design/human-interface-guidelines/typography.md) · guideline · Advises limiting typefaces to reduce inconsistency and preserve hierarchy. · “Minimize the number of typefaces you use, even in a highly customized interface.”
- [USWDS · Font families](https://designsystem.digital.gov/design-tokens/typesetting/font-family/) · guideline · Models a family assignment by role, including heading, body, code and alternate. · “Role-based tokens set the font family value based on the role the face plays in the project: heading, body, ui, code, and alternate.”
- [CSS Fonts · Font matching](https://www.w3.org/TR/css-fonts-4/#font-matching-algorithm) · standard · Explains why fallback can occur at character level as the browser checks coverage across the prioritized stack. · “until it matches an available font that contains a glyph for the character to be rendered.”
- [Microsoft Fluent 2 · Typography](https://fluent2.microsoft.design/typography) · guideline · Provides a single-family precedent by mapping Segoe UI to multiple web type roles. · “This ramp uses Segoe UI as the default typeface.”

Judgement: Starting with one family and rejecting the particular Arial/Verdana pairing are design judgements. Distinct families may suit a product’s role or brand.

## typo-6

Claims: Keep secondary text legible when it is needed to choose, as with email addresses that distinguish duplicate display names. In the preview compare 14px and 10px at fixed weight and color. Check real addresses at the default size and under enlargement, including longer data.

- [USWDS · Typesetting and optical size](https://designsystem.digital.gov/design-tokens/typesetting/overview/) · guideline · Explains why equal CSS sizes can look different across typefaces, including differences in x-height. · “Optical size is a function of internal font metrics and typeface design choices like x-height.”
- [Rello et al. · Make It Big! (CHI 2016)](https://pielot.org/pubs/Rello2016-Fontsize.pdf) · research · In an eye-tracking study using Arial Wikipedia articles, larger type improved the reading measure. The study did not test email rows or a 14px threshold. · “readability, measured via mean fixation duration, increased significantly with font size.”
- [WCAG 2.2 · Resize text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) · standard · Requires text enlargement up to 200% with content and functionality preserved, with defined exceptions. · “text can be resized without assistive technology up to 200 percent without loss of content or functionality.”
- [Microsoft Fluent 2 · Typography](https://fluent2.microsoft.design/typography) · guideline · Uses 14px for web body text and 10px for its smallest caption role. · “clear style direction and semantic roles”

Judgement: 14px versus 10px is a local choice for task-critical email text. The wrong-recipient scenario illustrates a usability risk without measuring it.

## typo-7

Claims: Align comparable amounts to their numeric end, typically the right edge in the example. Use font-supported tabular digits so each digit has the same advance. Align place values using consistent fractional precision and compatible suffixes, or align decimals explicitly when precision varies. Format values for the locale and preserve meaningful precision rather than adding arbitrary zeroes.

- [Adobe Spectrum · Applying the type system](https://spectrum.adobe.com/foundations/typography/applying-the-type-system) · guideline · Directly recommends tabular figures and a shared right edge for numerical data in tables. · “In tables, numbers should be right aligned to make numerical data easier to read and compare.”
- [CSS Fonts · Numeric glyph variants](https://www.w3.org/TR/css-fonts-4/#font-variant-numeric-prop) · standard · Defines tabular-nums as the CSS switch for the font’s OpenType tabular feature. · “Enables display of tabular numerals (OpenType feature: tnum).”
- [OpenType · Tabular figures](https://learn.microsoft.com/en-us/typography/opentype/spec/features_pt#tag-tnum) · standard · Defines the feature as a substitution from proportional glyphs to uniform-width glyphs. · “Replaces figure glyphs set on proportional widths with corresponding glyphs set on uniform (tabular) widths.”
- [GOV.UK · Tables with numeric columns](https://design-system.service.gov.uk/components/table/) · guideline · Prescribes aligning comparable numeric table cells to the right. · “When comparing columns of numbers, align the numbers to the right in table cells.”
- [Unicode CLDR · Numbers](https://www.unicode.org/reports/tr35/tr35-numbers.html) · standard · Documents locale-specific currency symbol placement and formatting precision, which can affect decimal alignment. · “The currency symbol placeholder may occur before the first digit, after the last digit symbol, or where the decimal symbol would otherwise be placed”

Judgement: The alignment treatment for identifiers and the precision required for measurements depend on what the underlying data represents.

## typo-8

Claims: Give sustained multiline prose a stable reading-start edge. Use text-align: start and set the correct direction so horizontal English aligns left and Arabic aligns right. Reserve centering for short self-contained passages, with wrapping checked at narrow widths and larger text sizes.

- [GOV.UK · Text alignment](https://design-system.service.gov.uk/styles/font-override-classes/#text-alignment) · guideline · Recommends left alignment for the usual left-to-right body copy and right alignment for right-to-left translations. · “Use right-aligned body copy text if you are translating content into a language which is written right-to-left.”
- [ONS Service Manual · Accessible text formatting](https://service-manual.ons.gov.uk/brand-guidelines/typography/accessible-text-formatting) · guideline · Connects a fixed starting edge with locating the next line and reserves centering for short pieces of content. · “these should only be used sparingly and only on short pieces of content.”
- [CSS Text · Text alignment](https://www.w3.org/TR/css-text-3/#text-align-property) · standard · Defines logical text alignment and ties the start and end sides to the line’s inline base direction. · “The start and end sides of a line box are determined by the inline base direction of the line box.”
- [Microsoft Fluent 2 · Typography](https://fluent2.microsoft.design/typography) · guideline · Supports limiting centered treatments to small pieces of copy, while using right alignment for RTL prose. · “call attention to a small piece of copy”

Judgement: What counts as short enough to center depends on the text's task, line breaks, language and available width.

## typo-9

Claims: Map a small set of font weights to semantic roles such as body, heading and emphasis. Regular and semibold are a plausible pairing for the sample card, where metadata should not dominate the title. Judge distinctions in the loaded font at the intended size and account for fallback when a requested weight is unavailable.

- [IBM Carbon · Type sets](https://www.carbondesignsystem.com/building-blocks/foundations/typography/type-sets) · guideline · Uses named roles with different weights, sizes and line heights to communicate hierarchy. · “carefully designed scales, styles, and weights to create hierarchy”
- [Microsoft Fluent 2 · Typography](https://fluent2.microsoft.design/typography) · guideline · Demonstrates regular Body 1 and semibold titles in the web type ramp. · “clear style direction and semantic roles”
- [Adobe Spectrum · Typography system](https://spectrum.adobe.com/foundations/typography/typography-system) · guideline · Pairs heavier text with regular body text to help the eye locate the primary focus. · “it's paired with regular body text to create hierarchy.”
- [MDN · Font weight](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-weight) · guideline · Describes the browser’s choice of a substitute weight when the requested one is unavailable. · “If the exact weight given is unavailable, then the following rule is used to determine the weight actually rendered:”

Judgement: The two-weight palette is a judgement for this card. Larger systems can use additional weights, and the visible difference depends on the font and size.

## typo-10

Claims: Wrap meaningful instructions and errors where space permits. Use an ellipsis on a compact single-line filename when necessary to preserve adjacent data and controls. Let the bounded flex item shrink and expose the full filename through a keyboard- and touch-operable path before selection. Check the row at narrow widths and resolve ambiguity between filenames that share a prefix.

- [GitHub Primer · Truncation](https://primer.style/accessibility/patterns/truncation/) · guideline · Prefers wrapping, explains problems with hover-only disclosure and calls for keyboard access to the full content. · “Ensure that truncated text is accessible via mouse, keyboard, and screen reader.”
- [CSS Overflow · Text overflow and ellipsis](https://www.w3.org/TR/css-overflow-3/#text-overflow) · standard · Defines ellipsis rendering for clipped inline text in a bounded block. · “Render an ellipsis character (U+2026) to represent clipped inline content.”
- [WCAG 2.2 · Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) · standard · Requires information and functionality to remain accessible during reflow, with defined exceptions. · “Content can be presented without loss of information or functionality”
- [MDN · Tooltip role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/tooltip_role) · guideline · Explains why a native title tooltip cannot be the full-name disclosure for keyboard and touch users. · “One cannot activate this feature through either keyboard focus or through touch interaction”
- [CSS Flexbox · Automatic minimum size](https://www.w3.org/TR/css-flexbox-1/#min-size-auto) · standard · Explains why a flex item may need a smaller minimum inline size to shrink below its intrinsic content size. · “its content-based minimum size”
- [WCAG 2.2 · Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) · standard · Requires the disclosure action to be keyboard operable unless an exception applies. · “All functionality of the content is operable through a keyboard interface”

Judgement: The details view and the decision to give the filename a single line are specific to the compact row and action risk.

Disagreement: Carbon’s overflow pattern recommends adding a native title to show a tooltip on hover (https://www.carbondesignsystem.com/building-blocks/core/patterns/overflow-content). That path alone does not satisfy the rule’s keyboard and touch requirements.

## typo-11

Claims: Start ordinary reading near 16px and adjust for typeface, viewing distance and task. Use the alert’s 16px/12px pairing as a visual hierarchy example, compared with 11px/9px. Choose relative sizing, test the smallest essential detail on a representative device, and let the row grow at 200% enlargement.

- [USWDS · Typography](https://designsystem.digital.gov/components/typography/) · guideline · Uses 16px as an effective starting size for body copy, with role-specific exceptions. · “use at least an effective size of 16px”
- [WCAG 2.2 · Resize text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) · standard · Requires text enlargement up to 200% with content and functionality preserved, with defined exceptions. · “text can be resized without assistive technology up to 200 percent without loss of content or functionality.”
- [USWDS · Typesetting and optical size](https://designsystem.digital.gov/design-tokens/typesetting/overview/) · guideline · Explains why equal CSS sizes can look different across typefaces, including differences in x-height. · “Optical size is a function of internal font metrics and typeface design choices like x-height.”
- [Legge and Bigelow · Does print size matter for reading?](https://pmc.ncbi.nlm.nih.gov/articles/PMC3428264/) · research · Reviews reading-size limits in visual angle, which depends on physical size and viewing distance, and discusses x-height. · “Because x-height is not a constant fraction of body size, it cannot be accurately calculated from body size alone.”
- [Rello et al. · Make It Big! (CHI 2016)](https://pielot.org/pubs/Rello2016-Fontsize.pdf) · research · In an eye-tracking study using Arial Wikipedia articles, larger type improved the reading measure. Its preferred article sizes do not define a UI minimum. · “readability, measured via mean fixation duration, increased significantly with font size.”

Judgement: The 16px/12px hierarchy and the exact smallest readable detail are local choices. The 16px starting point comes from a design-system guideline.

Disagreement: The CHI study recommends a larger size for text-heavy reading than the rule’s routine UI starting point (https://pielot.org/pubs/Rello2016-Fontsize.pdf). The study used Arial Wikipedia articles and reports sizes in points.

## typo-12

Claims: Use text-wrap: balance when a short wrapped heading has an awkward one-word final line. Balance requests more even lines and leaves precise breaks to the engine. Check phrasing, widths and translations and retain ordinary wrapping where it reads better.

- [CSS Text · Wrapping styles](https://www.w3.org/TR/css-text-4/#text-wrap-style) · standard · Defines balance as even distribution of leftover line space and leaves the algorithm to the browser. · “Line breaks are chosen to balance the remaining (empty) space in each line box”
- [Chrome for Developers · CSS text-wrap: balance](https://developer.chrome.com/docs/css-ui/css-text-wrap-balance) · practice · Demonstrates balanced headlines and explains why the engine limits its application to short blocks. · “Set all the headlines to balanced text wrapping with the following CSS:”
- [WebKit · Better typography with text-wrap pretty](https://webkit.org/blog/16547/better-typography-with-text-wrap-pretty/) · practice · Shows an isolated final word disappearing in a balanced headline, with examples readers can resize and compare. · “There’s no longer a single word by itself on the last line.”
- [MDN · Text wrap styles](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-wrap-style) · guideline · Recommends balance for headings and other short blocks and documents browser-specific line limits. · “When the styled content will be limited to a short number of lines, such as headings, captions, and blockquotes”

Judgement: Whether the resulting break preserves a phrase and reads better than ordinary wrapping requires editorial review. The 19ch example is illustrative.

## typo-13

Claims: Try text-wrap: pretty on short card descriptions or captions with an awkward closing line. Pretty asks for better wrapping while leaving the exact algorithm and resulting line breaks up to the browser. Compare supported engines and card widths, and allow text to gain a line without clipping.

- [CSS Text · Wrapping styles](https://www.w3.org/TR/css-text-4/#text-wrap-style) · standard · Defines pretty as prioritizing layout quality, with optional short-last-line handling and browser-dependent improvements. · “Specifies the UA should bias for better layout over speed”
- [WebKit · Better typography with text-wrap pretty](https://webkit.org/blog/16547/better-typography-with-text-wrap-pretty/) · practice · Describes WebKit’s passage-wide implementation and recommends trying pretty on short copy as well as paragraphs. · “body text, headlines, captions, teasers, etc.”
- [Chrome for Developers · CSS text-wrap: pretty](https://developer.chrome.com/blog/css-text-wrap-pretty) · practice · Documents Chromium’s initial focus on orphaned final words, including changes to earlier lines and hyphenation. · “adjusts hyphenation if consecutive hyphenated lines appear at the end of a paragraph or adjusts previous lines to make room.”
- [WCAG 2.2 · Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) · standard · Supports retaining access to a card’s content and actions as the text wraps and available width shrinks. · “Content can be presented without loss of information or functionality”

Judgement: Whether a closing phrase looks or reads better with pretty depends on the copy, width, font and engine. The 23ch example is illustrative.

Disagreement: The CSS Text Level 4 draft describes balance as intended for titles and captions and pretty as intended for body text (https://www.w3.org/TR/css-text-4/#text-wrap-style). WebKit demonstrates cases where trying pretty on short standalone copy is useful (https://webkit.org/blog/16547/better-typography-with-text-wrap-pretty/).

## typo-14

Claims: Isolate an inserted name of unknown direction with bdi or tightly applied dir="auto". Keep the dash and count outside the isolate so they retain the surrounding sentence’s direction. Set the document’s base direction separately from its language and preserve the name’s logical character order. Store the message in translation resources with placeholders so translators can place the name and count.

- [W3C Internationalization · Inline bidirectional text](https://www.w3.org/International/articles/inline-bidi-markup/) · guideline · Provides the exact restaurant-name and review-count example and teaches tight directional isolation and auto detection. · “If there is no markup, wrap the location with a bdi element.”
- [WHATWG HTML · The bdi element](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-bdi-element) · standard · Defines the isolation element and shows how it prevents following punctuation and numbers from attaching to a username. · “The bdi element represents a span of text that is to be isolated from its surroundings for the purposes of bidirectional text formatting.”
- [W3C Internationalization · Document direction](https://www.w3.org/International/questions/qa-html-dir) · guideline · Explains why direction is separately declared with dir even when a language tag includes a script subtag. · “You must always declare the directionality using the dir attribute.”
- [Unicode MessageFormat · Variables](https://messageformat.unicode.org/docs/reference/variables/) · standard · Documents inserting supplied values as placeholders inside the translatable message. · “Variables can be interpolated into a message using a placeholder expression.”
- [Mozilla · Localization best practices](https://mozilla-l10n.github.io/documentation/localization/dev_best_practices.html) · practice · Advises keeping the whole sentence localizable so the localizer can set the order of its parts. · “let localizers decide the best order for their language.”

Judgement: The separator choice and the natural word order for the localized sentence need language-specific editorial review.

## typo-15

Claims: Check the nearest adjacent glyphs at the actual display size, weight, font and line breaks. Negative tracking reduces spacing, and an equal em adjustment has a larger pixel magnitude at a larger font size. Use the 38px semibold Inter example to compare -0.015em with -0.05em. Keep neighboring strokes distinct and inspect the loaded font at each breakpoint and in translations.

- [CSS Text · Letter spacing](https://www.w3.org/TR/css-text-3/#letter-spacing-property) · standard · Defines extra letter spacing between typographic units and permits negative values within implementation limits. · “Specifies additional spacing between typographic character units. Values may be negative”
- [CSS Values and Units · Font-relative lengths](https://www.w3.org/TR/css-values-4/#font-relative-lengths) · standard · Defines em in terms of computed font size, which explains the pixel difference across display sizes. · “Equal to the computed value of the font-size property of the element on which it is used.”
- [MDN · Letter spacing](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/letter-spacing) · guideline · Explains that negative values bring glyphs closer together and that excessive negative tracking can make words unrecognizable. · “the letters can overlap each other to the point where the word(s) may be unrecognizable.”
- [Inter · Dynamic metrics](https://d.rsms.me/inter-website/v3/dynmetrics/) · practice · Shows that the Inter author varies suggested tracking with optical size and treats the result as guidance. · “You simply provide the optical font size, and the tracking and line height is calculated for you”
- [Yu et al. · Letter spacing and reading speed](https://pmc.ncbi.nlm.nih.gov/articles/PMC2729067/) · research · Experiments link letter spacing to recognition and reading speed. They do not test the sample font or establish a display-heading threshold. · “the size of the visual span and the reading speeds measured by the two presentation methods showed a qualitatively similar dependence on letter spacing”
- [USWDS · Letterspacing tokens](https://designsystem.digital.gov/design-tokens/typesetting/letterspacing/) · guideline · Provides examples of small negative tracking increments without prescribing a universal limit. · “-0.02em”

Judgement: The -0.015em and -0.05em examples and the visible-gap stopping point are optical judgements for the shipped font and headline. Intentional ligatures and joining scripts warrant their own treatment.

## layout-1

Claims: Name and reuse spacing steps for recurring padding and gap relationships. A 4px base is a practical option. The preview compares 16px padding and an 8px gap with 13px and 5px. Hairlines, optical corrections, and intrinsic dimensions can be handled locally.

- [USWDS · Spacing units](https://designsystem.digital.gov/design-tokens/spacing-units/) · guideline · A shared token scale uses a base plus intermediate and small exceptions. · “Any spacing value in utilities or component CSS should use the following spacing unit tokens, based on multiples of 8px.”
- [IBM Carbon · Spacing](https://www.carbondesignsystem.com/building-blocks/foundations/spacing/overview) · guideline · Uses 2px, 4px, and 8px increments and allows exceptions. · “by using multiples of two, four, and eight”
- [Adobe Spectrum · Layout spacing](https://spectrum.adobe.com/foundations/layout-and-structure/spacing/layout-spacing) · guideline · Documents global spacing tokens chosen according to the relationship between objects, including all six example values. · “Use global tokens for layout spacing.”
- [Designsystems.com · Space, grids, and layouts](https://www.designsystems.com/space-grids-and-layouts/) · practice · Elliot Dahl describes choosing a base unit and several alternatives, including a 4pt increment. · “You’ll see 4pt, 5pt, 6pt, 8pt, 10pt increment systems.”
- [Every Layout · The Stack](https://every-layout.dev/layouts/stack/) · practice · Demonstrates consistent spacing with local CSS exceptions for special cases. · “use the cascade to override these rules in special cases”

Judgement: The exact token list and the comparison with 13px and 5px are choices for this settings example. USWDS, Carbon, and Spectrum use different scales. Spectrum also cautions against expecting every fixed increment to be equally useful across the scale.

## layout-2

Claims: Cap sustained English prose on wide screens. Roughly 65 characters per line is a starting point for comfortable reading. The preview caps prose at 52ch within a 95ch canvas. Its character count varies by font and copy because ch is based on the zero glyph’s advance. Let prose shrink at narrow widths and zoom. Check real copy, translations and font sizes. Give tables and figures the space they need.

- [USWDS · Typography](https://designsystem.digital.gov/components/typography/) · guideline · Recommends approximately 66 characters per line for long texts. · “A good target for long texts is 66 characters (measure 2).”
- [CSS Values · Font-relative lengths](https://www.w3.org/TR/css-values-4/#ch) · standard · Defines ch from the advance measure of the zero glyph. · “the used advance measure of the “0” (ZERO, U+0030) glyph”
- [USWDS · Measure (line length)](https://designsystem.digital.gov/design-tokens/typesetting/measure/) · guideline · Shows how a design system applies named measures to cap text length using font-relative units. · “USWDS has 6 measure tokens to control the reading length of lines in a block of text.”
- [Visible Language · Line length and reading from screen](https://distantreader.org/stacks/journals-ojs/vl/vl-5671.pdf) · research · Dyson and Kipping found moderate line lengths were judged easiest to read, although longer lines could be read faster. · “Documents with 55 cpl were judged as easiest to read, using scrolled or paged movement.”
- [WCAG 2.2 · Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) · standard · Explains why an article column should shrink at narrow widths and zoom to avoid back-and-forth scrolling. · “When lines of text extend beyond the edge of a viewport, users will be forced to scroll back-and-forth to read line by line.”

Judgement: 52ch, 95ch, and the estimated 60–65 characters for the preview are specific to its rendered text and typefaces. The estimate is a local observation.

Disagreement: Dyson and Kipping found faster reading for 100-character lines than for 25-character lines with unchanged comprehension. The speed result depended on display conditions and did not replicate in the second experiment after background glare was reduced. Participants rated 55-character lines easiest to read.

## layout-3

Claims: Use a smaller gap within a label and field pair and a larger gap before the next pair. Keep comparable field groups evenly spaced and place hints and errors inside the affected group, including when text wraps. Programmatically associate each label with its control and group related choices with fieldset and legend where appropriate.

- [Scottish Government · Form spacing](https://designsystem.gov.scot/guidance/forms/form-spacing) · guideline · Explains that equal gaps can obscure which field a label describes. · “Equal spacing makes it unclear which label relates to which field.”
- [W3C WAI · Labeling controls](https://www.w3.org/WAI/tutorials/forms/labels/) · guideline · Explains explicit or implicit programmatic association for each label and form control. · “A label and a form control should be associated with each other either implicitly or explicitly.”
- [W3C WAI · Grouping form controls](https://www.w3.org/WAI/tutorials/forms/grouping/) · guideline · Defines semantic grouping for related form controls using fieldset and legend. · “The <fieldset> element provides a container for related form controls, and the <legend> element acts as a heading to identify the group.”
- [NN/g · Proximity principle in visual design](https://www.nngroup.com/articles/gestalt-proximity/) · research · Applies proximity to top-aligned labels and the larger gap between groups. · “a minimal amount of spacing between a top-aligned label and its corresponding form field”
- [IBM Carbon · Spacing](https://www.carbondesignsystem.com/building-blocks/foundations/spacing/overview) · guideline · Explains how equal spacing patterns communicate related items of equivalent weight. · “related pieces that have equal weight”

Judgement: 8px and 24px demonstrate hierarchy in the sample. The right gap depends on the design, copy, and field states.

## layout-4

Claims: Center the icon box as the starting point, then inspect the visible glyph and consider a small offset at its actual size. Asymmetric artwork such as a right-pointing play triangle can look displaced when its box is geometrically centered. Check whether the asset already provides optical margins, keep the hit area fixed, and compare paired states such as play and pause.

- [Apple · Create custom symbols](https://developer.apple.com/videos/play/wwdc2021/10250/) · guideline · Shows how an icon asset can include margins for optical centering. · “margins for making sure symbols are optically centered with one another”
- [Bjango · Formulas for optical adjustments](https://bjango.com/articles/opticaladjustments/) · practice · Marc Edwards demonstrates the bounding box problem with an equilateral play triangle inside a circle. · “For triangles, the center of the bounding box often does not feel like the center of the triangle”
- [Unity · Iconography](https://unityeditordesignsystem.unity.com/fundamentals/iconography) · guideline · Explicitly distinguishes centering the bounds from balancing visible artwork. · “Icons should be optically balanced within the icon area, optical balance differs from absolute centering.”
- [Adobe Spectrum · Using icons](https://spectrum.adobe.com/foundations/icons-and-illustrations/using-icons) · guideline · Icon artwork includes internal safe space that can accommodate visual positioning. · “Icon designs include a safe area to ensure there's flexibility for finding the best positioning and balance in a layout.”

Judgement: The rightward 2px nudge depends on this particular glyph, SVG padding and size. Checking state changes and holding the hit area steady are practical review choices.

## layout-5

Claims: For a short text button, try more inline padding than block padding. The example uses 16px inline and 8px block. Treat line height, visual padding, and the actual interactive target as distinct sizing considerations. Check long or translated labels, optional icons, and text enlargement. Make room for the label to grow or wrap. Apply the target size and spacing requirements appropriate to the interface.

- [Bootstrap · Buttons](https://getbootstrap.com/docs/5.3/components/buttons/#variables) · guideline · Shows a button with independent block and inline padding and a 2:1 example. · “--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem;”
- [WCAG 2.2 · Target size (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) · standard · Sets a 24 by 24 CSS-pixel minimum for pointer targets, with exceptions including spacing. · “The size of the target for pointer inputs is at least 24 by 24 CSS pixels, except when:”
- [IBM Carbon · Button guidelines](https://www.carbondesignsystem.com/building-blocks/core/components/button/guidelines) · guideline · Recommends wrapping long labels that exceed available button width. · “Do wrap the button label to a second line if there’s overflow content.”
- [Material Design · Buttons](https://m1.material.io/components/buttons.html) · guideline · Specifies a touch target height independently of visible button height. · “give buttons a height of 36dp and give touchable targets a minimum height of 48dp.”
- [USWDS · Buttons](https://designsystem.digital.gov/components/button/) · guideline · Defines the short, action-led label context in which the preview proportion is proposed. · “Keep button text short.”
- [USWDS · Button styles](https://raw.githubusercontent.com/uswds/uswds/v3.14.0/packages/usa-button/src/styles/_usa-button.scss) · guideline · The default implementation specifies more inline than block padding using different spacing tokens. · “padding: units(1.5) units(2.5);”

Judgement: The 2:1 proportion and the 8px/16px values are visual choices. Bootstrap shows the ratio in use, while other button patterns have their own proportions. No cited accessibility standard sets a padding ratio.

## layout-6

Claims: Align a leading notification icon with the line it introduces, usually the first line or title. Anchoring the icon at the start keeps it stable when detail wraps. A one-line action may center its icon. Check typography and the artwork’s internal padding at real sizes. Apply a small local offset only if needed.

- [Checkatrade · Inline banner](https://checkatrade.design/components/inline-banner/) · guideline · Documents a top-aligned leading glyph on multiline messages and centered short rows. · “The glyph and the message share a top-aligned title line, so on multi-line copy the glyph sits beside the first line.”
- [Chassis · Notification](https://chassis-ui.com/react/docs/components/notification/) · guideline · Documents a centered default for the leading icon and start alignment when messages wrap. · “For multi-line messages, add className="align-self-start" to the icon so it aligns with the first line of text instead.”
- [CSS Box Alignment · Aligning items](https://www.w3.org/TR/css-align-3/#align-items-property) · standard · Defines the box-level start alignment used to keep the icon at the beginning of the row. · “Aligns the alignment subject to be flush with the alignment container’s start edge in the appropriate axis.”
- [Apple · Create custom symbols](https://developer.apple.com/videos/play/wwdc2021/10250/) · guideline · Describes typographic alignment built into symbol assets as a way to align artwork alongside text. · “typographic alignment to make sure your symbols look good next to text”

Judgement: The sample bell’s 1px downward offset depends on its artwork, size and text metrics. Start alignment is a box placement, and visual first-line alignment needs a local check.

## layout-7

Claims: Use headings and space for sequential, related material. A card is useful for self-contained items such as independently actionable records. A surface or border can clarify a group boundary or action ownership. Redundant nested outlines can flatten hierarchy.

- [USWDS · Cards](https://designsystem.digital.gov/components/card/) · guideline · Recommends self-contained cards and simple text, headings, or a list when people read sequentially. · “If the reader is meant to read from card to card, consider a list or simple body text and headings.”
- [Cognitive Psychology · Common region](https://e-edu.nbu.bg/pluginfile.php/951829/mod_resource/content/1/Stephen-Palmer%20-%20Common%20region%20-%20A%20new%20principle%20of%20perceptual%20grouping%201992.pdf) · research · Palmer demonstrates that common regions defined by color, texture or an enclosing contour signal grouping. · “within a connected, homogeneously colored or textured region or within an enclosing contour”
- [USWDS · Typography](https://designsystem.digital.gov/components/typography/) · guideline · Describes using smaller gaps to group content and larger gaps to distinguish it. · “Use less whitespace to group elements and more whitespace to distinguish them”
- [Material Design · Cards](https://m1.material.io/components/cards.html) · guideline · Recommends cards for items with distinct supported actions or media of varying size. · “Cards display content composed of different elements whose size or supported actions vary.”

Judgement: A white card on a pale gray background is one treatment for the sample stat panel. The amount of contrast and the number of useful boundaries depend on what grouping or action each edge conveys.

Disagreement: USWDS explicitly lists borders and shadows as typical ways to distinguish cards from the page. A literal reading of the preview’s ‘Don’t’ would reject a boundary USWDS supports when it serves a purpose.

## layout-9

Claims: Reduce large outer gutters or card padding when narrow conditions make them expensive. Keep small internal gaps that communicate relationships, preserve target size and separation, and adapt only the tokens that need it. Check component width as well as viewport width. In the example, changing both insets from 24px to 12px recovers 24px of content width.

- [GOV.UK · Spacing](https://design-system.service.gov.uk/styles/spacing/) · guideline · Documents a responsive scale whose smallest four steps stay fixed across screen sizes and a separate static scale. · “Spacing for the smallest units (0-3) stays the same for all screen sizes.”
- [MDN · CSS container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries) · guideline · Demonstrates adapting a component to the width of the nearest query container. · “The query in the following example will apply styles to elements based on the size of the nearest ancestor with a containment context.”
- [USWDS · Layout grid](https://designsystem.digital.gov/utilities/layout-grid/) · guideline · Demonstrates a grid gutter that grows across a desktop breakpoint. · “The default gap width is 2 units and 4 units at desktop and higher.”
- [WCAG 2.2 · Target size (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) · standard · Defines the accessibility consideration that remains relevant as spacing changes. · “The size of the target for pointer inputs is at least 24 by 24 CSS pixels, except when:”

Judgement: 24px and 12px are example card insets. Choose what changes based on the content and available width.

## layout-10

Claims: Give within-item, between-item and between-section spacing distinct structural roles. Use a more pronounced separation for new groups and repeat the same spacing for equivalent relationships. Check the hierarchy once headings and supporting copy wrap. The example uses 8px, 16px and a 32px section break.

- [IBM Carbon · Spacing](https://www.carbondesignsystem.com/building-blocks/foundations/spacing/overview) · guideline · Connects amount of space to hierarchy and illustrates more space around higher-level headings. · “The amount of space between items creates relationships and hierarchy.”
- [Adobe Spectrum · Layout spacing](https://spectrum.adobe.com/foundations/layout-and-structure/spacing/layout-spacing) · guideline · Uses smaller spacing values for tighter relationships and larger ones to separate independent regions. · “Smaller values create tighter relationships. Larger values create more visual independence.”
- [NN/g · Proximity principle in visual design](https://www.nngroup.com/articles/gestalt-proximity/) · research · Applies proximity to headings and the paragraphs they introduce. · “whitespace around well-designed headings signals which paragraphs they are associated with”
- [Every Layout · The Stack](https://every-layout.dev/layouts/stack/) · practice · Shows how nested vertical stacks can reuse different spacing values at different grouping levels. · “The following two blocks set up alternative Stacks, with different margin values.”

Judgement: The 8px, 16px, and 32px roles are example values. How much of a step a new section needs is a composition judgment.

## layout-11

Claims: Assign intentional stacking order to overlay roles and identify the context that owns each overlay. A transformed ancestor creates a stacking context. Large child z-index values cannot escape it, so moving the demo menu outside the context changes which boxes compete. The browser top layer is painted separately. A suitable portal or native top-layer primitive can address an overlay trapped in a context. Test both visibility and which element gets pointer or keyboard interaction when overlays overlap.

- [CSS · Stacking contexts](https://www.w3.org/TR/CSS2/visuren.html#z-index) · standard · Defines stacking contexts as atomic from the parent context’s perspective. · “A stacking context is atomic from the point of view of its parent stacking context”
- [CSS Transforms · Transform rendering model](https://www.w3.org/TR/css-transforms-1/#transform-rendering) · standard · A non-none transform on an element using the CSS box model creates a stacking context. · “any value other than none for the transform property results in the creation of a stacking context”
- [CSS Positioned Layout · The top layer](https://www.w3.org/TR/css-position-4/#top-layer) · standard · Defines the top layer’s independent painting order above ordinary document boxes. · “the last element in the top layer is rendered on top of everything else.”
- [Bootstrap · Z-index](https://getbootstrap.com/docs/5.3/layout/z-index/) · guideline · Shows how a UI system assigns a scale to overlay roles such as popovers, tooltips and modals. · “a default z-index scale in Bootstrap that’s been designed to properly layer navigation, tooltips and popovers, modals, and more.”
- [React · createPortal](https://react.dev/reference/react-dom/createPortal) · practice · Shows how placing an overlay in a different DOM container can avoid interfering ancestor styles. · “You can use a portal to create a modal dialog that floats above the rest of the page”

Judgement: 9999 and the order of Export relative to Activity are demo values. Product roles and ownership determine the appropriate layer order.

## layout-12

Claims: Reserve clearance in the affected scroll container for sticky headers or footers, including the visible focus indicator. Keep the entire focus target visible after tabbing and bring anchor targets into view beneath sticky UI. Measure the rendered overlap and recheck both scroll directions, nested scrollers, zoom and breakpoints.

- [WCAG 2.2 · Focus not obscured (enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-enhanced.html) · standard · AAA requires the full focused component to be unobscured by author-created content. · “When a user interface component receives keyboard focus, no part of the component is hidden by author-created content.”
- [WCAG technique C43 · scroll-padding](https://www.w3.org/WAI/WCAG22/Techniques/css/C43) · standard · Shows how scroll-container padding makes obscured controls reachable through keyboard focus. · “using CSS padding and scroll-padding properties to create space underneath the site footer”
- [CSS Scroll Snap · Scroll padding](https://www.w3.org/TR/css-scroll-snap-1/#scroll-padding) · standard · Defines insets for regions obscured by overlapping content and their application to scroll-into-view operations. · “This allows the author to exclude regions of the scrollport that are obscured by other content”
- [WCAG 2.2 · Focus not obscured (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) · standard · AA protects against total occlusion and explicitly permits partial occlusion. · “When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content.”
- [CSS-Tricks · Fixed headers and on-page links](https://css-tricks.com/fixed-headers-on-page-links-and-overlapping-content-oh-my/) · practice · Demonstrates clearing a fixed header when following a page jump link. · “scroll-padding-top: 70px; /* height of sticky header */”
- [WCAG 2.2 · Focus visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) · standard · WCAG separately requires a mode in which the keyboard focus indicator is visible. · “Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.”

Judgement: 64px is specific to the demo header. The right clearance follows the rendered header or footer and the space the focus indicator occupies.

Disagreement: WCAG 2.4.11 at AA permits partial obstruction. Full visibility of the focused component aligns with 2.4.12 at AAA. The enhanced criterion measures the component itself and covers a focus indicator only where it is part of that component.

## layout-13

Claims: Reserve space in the first layout for images, videos and embeds with intrinsic dimensions or a preferred display aspect ratio. Match reserved size to the final media box at each breakpoint so neighboring content and controls stay in place as the media loads. Use throttling and an empty cache to check loading behavior, and inspect failed media requests. For layout shifts from font swapping, use size-adjust and font metric overrides to align fallback metrics.

- [web.dev · Optimize Cumulative Layout Shift](https://web.dev/articles/optimize-cls) · practice · Recommends early image and video dimensions or an aspect ratio, and explains shifts from late-inserted embeds. · “Always include width and height size attributes on your images and video elements.”
- [web.dev · The CSS aspect-ratio property](https://web.dev/articles/aspect-ratio) · practice · Shows how aspect-ratio reserves space for responsive embeds and other media. · “Creating intrinsic placeholder containers for images, videos, and embeds”
- [HTML · Dimension attributes](https://html.spec.whatwg.org/multipage/embedded-content-other.html#dimension-attributes) · standard · Defines dimension attributes for the visual content of images and other media elements. · “may be specified to give the dimensions of the visual content”
- [MDN · aspect-ratio](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/aspect-ratio) · guideline · Explains using a supplied ratio before a replaced element’s natural ratio is available. · “then the given ratio is used until the content is loaded”
- [Chrome for Developers · Improved font fallbacks](https://developer.chrome.com/blog/font-fallbacks) · practice · Explains how size and font metric overrides reduce layout shifts from font swaps. · “This reduces or eliminates layout shifts caused by font swapping.”

Judgement: 2:1 is the demonstration photo’s display ratio. Use the ratio or dimensions of the final box at each breakpoint.

## layout-14

Claims: A cover crop can remove meaningful content when image and frame proportions differ. Check all supported ratios, including intermediate widths. Choose an asset-specific focal point or object-position so the subject stays in frame. Check new or mirrored artwork. If positioning one asset cannot preserve the subject or context, supply condition-specific crops via picture and source.

- [HTML · Art direction with the picture element](https://html.spec.whatwg.org/multipage/images.html#art-direction) · standard · Describes supplying different image content or crop according to rendered size. · “Authors might want to show different image content depending on the rendered size of the image.”
- [CSS Images 3 · object-position](https://www.w3.org/TR/css-images-3/#the-object-position) · standard · Defines object-position as the mechanism that aligns replaced content within its box. · “The object-position property determines the alignment of the replaced element inside its box.”
- [Shopify · Image focal points](https://shopify.dev/docs/storefronts/themes/architecture/settings/input-settings#image-focal-points) · guideline · Documents applying focal points to cover crops using object-position. · “A focal point is a position in an image that the merchant wants to remain in view as the image is cropped and adjusted”
- [Google Web Designer · Focal points for responsive images](https://support.google.com/webdesigner/answer/9493710) · guideline · Recommends previewing how the chosen focal point affects different image aspect ratios. · “Switch to the Preview tab to see how the focal point affects image cropping for different image aspect ratios.”

Judgement: The right-center focal point and the 2:1 and 3:4 frames belong to the latch example. Choose coordinates or a crop for the specific artwork.

## color-1

Claims: Reserve the most conspicuous local accent for high-priority information or actions. Neutral nearby chrome can make an accented primary action more distinct. A branded header can coexist with a primary action distinguished by another cue. The 60–30–10 balance is an approximate composition heuristic. UI conformance, priority, and warning emphasis do not depend on hitting a quota.

- [Atlassian · Color roles](https://atlassian.design/foundations/color) · guideline · The brand role can emphasize primary actions. The design system uses a neutral role for secondary UI and navigation. · “Use for primary actions”
- [IBM Design Language · Color](https://www.ibm.com/design/language/color/) · guideline · IBM makes neutral gray dominant in product UI and uses core blue for key actions. · “The neutral gray family is dominant in our UI”
- [GOV.UK · Button emphasis](https://design-system.service.gov.uk/components/button/) · guideline · Competing primary buttons weaken the prominence of the intended next action. · “Having more than one main call to action reduces their impact”
- [NN/g · Visual hierarchy](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/) · practice · Distinctive saturation helps draw attention to important items within surrounding content. · “Bright colors naturally stand out, so use them for important items”
- [Manning · Design for Developers](https://livebook.manning.com/learn/concepts/60-30-10-rule--technique/design-for-developers) · practice · The 60–30–10 split is an approximate allocation guideline. · “The 60:30:10 rule is a color-allocation guideline that assigns approximately 60 percent, 30 percent, and 10 percent”

Judgement: The white-and-gray composition with a blue accent is a local choice. The proportions are a starting point without a measured effect on task success.

## color-4

Claims: Use status colors consistently within the product and pair them with a label, recognizable symbol, or another independent visual cue. Give a destructive action a distinct treatment when it shares a toolbar with a common action such as Like. Red can express affection or danger depending on the visual and product context. A blue Like icon is a choice for the illustrated toolbar.

- [WCAG 2.2 · Use of color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) · standard · Color may supplement a label, symbol, or other visual indication of status or action. · “Color is not used as the only visual means of conveying information”
- [Atlassian · Color roles](https://atlassian.design/foundations/color) · guideline · Document roles for danger, warning, and other meanings and apply them consistently. · “color roles are applied to buttons to differentiate between primary, secondary, warning, or dangerous actions.”
- [GOV.UK · Warning buttons](https://design-system.service.gov.uk/components/button/) · guideline · Context and button text communicate what a serious destructive action does alongside the red warning treatment. · “Make sure the context and button text make clear what will happen”
- [Psychological Research · Implicit color–valence associations](https://pmc.ncbi.nlm.nih.gov/articles/PMC10017663/) · research · Implicit red valence varied across study populations. This supports treating red as context-dependent and does not test the Like/Delete toolbar. · “greater positive perception of the color red in ML China”

Judgement: The blue heart and the decision to preserve red as the strongest local warning cue are product choices. The nearby controls already have distinct symbols and wording.

## color-6

Claims: WCAG 2.2 SC 1.4.11 requires 3:1 against adjacent colors for a visual cue needed to identify an enabled author-styled control or state. A divider can be quieter when it is decorative. A control can omit a distinct border when its other visual information identifies it. Check the actual adjacent colors in each theme and independently check meaningful focus and selection cues. The illustrated neutral-500 edge is about 4.73:1 against white, and the neutral-400 edge is about 6.91:1 against the neutral-900 field fill.

- [WCAG 2.2 · Contrast at control boundaries](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#boundaries) · standard · A boundary used to establish a control's presence must contrast. The page distinguishes this from optional borders and explains which adjacent colors to compare. · “the boundary must have sufficient non-text contrast”
- [WCAG 2.2 · Non-text contrast criterion](https://www.w3.org/TR/WCAG22/#non-text-contrast) · standard · The normative AA requirement sets 3:1 against adjacent colors for visual information required to identify controls and states. · “Visual information required to identify user interface components and states”
- [GitHub Primer · Input border contrast](https://primer.style/accessibility/design-guidance/color-considerations/#input-border-contrast) · guideline · Primer measures the computed input border against the backdrop and uses the fill contrast instead when a visible border is absent. · “Borders of an input must meet a contrast ratio of 3:1.”
- [IBM Carbon · Text input specifications](https://www.carbondesignsystem.com/building-blocks/core/components/text-input/specifications) · guideline · Carbon uses a semantic strong-border token for its text field rather than borrowing a decorative color. · “$border-strong”

Judgement: The neutral token choices and the divider's exact lightness belong to the preview. The required 3:1 threshold applies to the measured pair.

## color-7

Claims: Hover feedback signals the pointer is over an operable control. It is distinct from focus, press, selection, and an operation's result. A same-hue shift, blue-600 to blue-700 in the sample, can distinguish hover from success where green has that meaning nearby. Maintain label and meaningful state contrast. A control must remain identifiable and operable when users can only use keyboard or touch.

- [IBM Carbon · Interaction states](https://www.carbondesignsystem.com/building-blocks/foundations/color/overview) · guideline · Hover is a visual response to pointer position, has its own token, and can be lighter or darker depending on the starting color. · “when a mouse cursor moves over an interactive element.”
- [Atlassian · Color roles](https://atlassian.design/foundations/color) · guideline · Atlassian separates interaction-state modifiers from semantic outcome roles such as success. · “a favorable outcome”
- [WCAG 2.2 · Non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) · standard · Required component cues maintain contrast with adjacent colors in hover. The Understanding page does not require hover to contrast with the resting appearance. · “the component must not lose contrast with the adjacent colors”
- [MDN · Hover media feature](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/hover) · guideline · Some primary inputs cannot conveniently hover, including common touch devices. · “The primary input mechanism cannot hover at all or cannot conveniently hover”

Judgement: The blue-600 to blue-700 step and the risk of mistaking green for success are specific to this design and its neighboring states. No same-hue or darker-only requirement applies.

## color-8

Claims: Define a dark palette by role, including backgrounds, text, graphics, and states. Test contrast where the elements actually meet. Lighter raised surfaces can communicate depth where the shadow has low visibility. Tune brand accents in context. A full-page color inversion also inverts imagery, which can change the meaning of a preview. The sample separates neutral-900 and neutral-800 surfaces and shifts the accent from roughly 91% to 55% HSL saturation.

- [Apple HIG · Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode) · guideline · Apple supplies semantic foreground colors plus base and brighter elevated backgrounds in Dark Mode. · “the elevated colors are brighter, making foreground interfaces appear to advance.”
- [Atlassian · Elevation](https://atlassian.design/foundations/elevation) · guideline · Dark elevation levels are distinguished by lightness with shadows providing additional depth. · “the higher the elevation, the lighter the surface looks.”
- [web.dev · Prefers-color-scheme](https://web.dev/articles/prefers-color-scheme) · practice · Assess artwork individually in each theme. Icons can be inverted selectively and images can be art-directed by theme. · “decide what is the best image at a particular mode”
- [Filter Effects · Invert](https://www.w3.org/TR/filter-effects-1/#funcdef-filter-invert) · standard · The invert filter changes input samples across the filtered rendering. Its full value completely inverts the input, including image colors. · “Inverts the samples in the input image.”
- [IBM Carbon · Color themes](https://www.carbondesignsystem.com/building-blocks/foundations/color/overview) · guideline · Color roles are assigned values per theme, including dark themes. This supports defining roles individually. · “themes specify the color values that serve those roles in the UI.”

Judgement: The neutral-900 page and neutral-800 card and the illustrated reduction from 91% to 55% HSL saturation are palette decisions. Check the resulting contrast and image treatment for the intended content.

## color-9

Claims: WCAG AA requires 4.5:1 for ordinary text and 3:1 for qualifying large text, with specific exceptions for incidental text and logotypes. Large-scale text generally means at least 18pt regular or 14pt bold, or equivalent CJK sizes. Compare unrounded contrast to the threshold using the actual foreground and background, including overlays or variable image areas where letters appear. On white, #737373 measures about 4.7417:1 and #aaaaaa measures about 2.3231:1 using WCAG relative luminance.

- [WCAG 2.2 · Contrast (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) · standard · SC 1.4.3 establishes the text contrast thresholds, large-text definition and exceptions. Compare unrounded values to the thresholds. · “4.499:1 would not meet the 4.5:1 threshold”
- [W3C WAI · Text contrast technique G18](https://www.w3.org/WAI/WCAG22/Techniques/general/G18) · standard · Measure the background adjacent to the letters, including on patterned or shaded images. The stated formula reproduces both gray-on-white sample ratios. · “Measure the relative luminance of the background pixels immediately next to the letter using same formula.”
- [USWDS · Using color](https://designsystem.digital.gov/design-tokens/color/overview/) · guideline · The design system restates the two AA thresholds and describes how to use its color grades in practice. · “The baseline AA contrast standard is 4.5:1 for most text and 3:1 for large text”

## color-10

Claims: Give hover and selection separate state names. Derive them from the same brand color where they should change together. A translucent fill composites with the underlying surface, so its appearance and contrast can vary. An opaque state token can provide a stable fill color. Check rendered labels and retain a selection cue while the row is hovered. The preview uses 10% blue-500 for hover and 15% for selection. Changing the shared source changes both derived fills.

- [W3C · Simple alpha compositing](https://www.w3.org/TR/compositing-1/#simplealphacompositing) · standard · The formula weights foreground and backdrop by alpha. A fully opaque fill removes the backdrop's contribution. · “if the graphic element is fully opaque (αs=1) then no backdrop shows through.”
- [Atlassian · Elevation](https://atlassian.design/foundations/elevation) · guideline · Atlassian illustrates both transparent adaptive and solid surface tokens and names separate interaction states. · “adapt to different elevations”
- [Adobe Spectrum · Design tokens](https://spectrum.adobe.com/page/design-tokens) · guideline · Adobe uses semantic tokens to encode an element's purpose and application and illustrates a named accent hover token. · “Semantic tokens define how design decisions are used throughout the system.”
- [IBM Carbon · Selectable tile states](https://www.carbondesignsystem.com/building-blocks/core/components/tile/specifications) · guideline · Carbon keeps a persistent selection border on both selected and hovered-selected tiles, separately from hover fill. · “Hover selected”

Judgement: Which roles derive from the brand and which alpha values work is an interface decision. The single blue source is a local example.

Disagreement: Atlassian’s Color roles guidance advises against using brand tokens to communicate selection in its system. Carbon's selectable tile shows a separate inverse-border cue.

## color-11

Claims: A narrow inset edge can distinguish a thumbnail from a matching surface. Choose a theme-appropriate tone and omit the decoration when the image boundary is already distinct or full-bleed. A translucent line has less effect when its tone matches the image pixels. A negative outline offset places the line inside the box without taking up layout space. A decorative frame is separate from sufficient focus and selection indicators when the thumbnail is interactive. The sample places a 1px outline inside the thumbnail, using black at 10% on the pale example and white at 10% on the dark example.

- [Adobe Spectrum · Thumbnail](https://spectrum.adobe.com/web/rsp/components/thumbnail) · guideline · Spectrum uses a subtle inset edge when thumbnails might otherwise blend into the surrounding theme. · “A subtle inset border helps distinguish images that might otherwise blend into the product's theme colors.”
- [W3C · Simple alpha compositing](https://www.w3.org/TR/compositing-1/#simplealphacompositing) · standard · The visible result of a translucent edge depends on opacity and the colors being combined. Near-matching source and backdrop colors give little visible distinction. · “The contribution of the backdrop is further reduced based on the opacity”
- [CSS Basic User Interface · Outline offset](https://www.w3.org/TR/css-ui-3/#outline-offset) · standard · A negative outline offset draws the outline inside the border box, and outlines do not affect layout. · “Negative values must cause the outline to shrink into the border box.”
- [WCAG 2.2 · Non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) · standard · A decorative thumbnail edge has no general 3:1 requirement. Focus and meaningful state cues on interactive thumbnails still need sufficient contrast. · “a sufficiently contrasting focus indication”
- [PIE Design System · Thumbnail](https://pie.design/components/thumbnail/web/) · guideline · PIE offers a thumbnail border as an option when the thumbnail container otherwise lacks definition. · “A border can be applied to ensure the container of the thumbnail is visible.”

Judgement: The 1px 10%-opacity treatment, black on pale imagery and white on dark imagery, and the full-bleed exception are framing choices. No decorative outline strength is prescribed.

## color-12

Claims: Use raised treatment where the surface needs to appear above another. Spacing or a divider can separate flat items. A zero-blur shadow with a 1px positive spread draws the sample's crisp outside edge. A close shadow and a wider, softer layer communicate lift. Forced colors suppresses box shadows. Supply a system-color border or outline if the shadow carried an essential boundary or state cue. A tinted shadow can be used as optional art direction. The deep dive recommends a neutral elevation token for reusable surfaces.

- [CSS Backgrounds and Borders · Shadow layers](https://www.w3.org/TR/css-backgrounds-3/#shadow-layers) · standard · CSS supports front-to-back shadow lists. Zero blur gives a sharp edge, positive spread extends the outer edge, and a larger blur softens it. · “If the blur value is zero, the shadow’s edge is sharp.”
- [CSS Color Adjustment · Forced colors](https://www.w3.org/TR/css-color-adjust-1/#forced-colors-properties) · standard · Forced colors computes styled box and text shadows to none and forces applicable colors to a system palette. · “box-shadow and text-shadow compute to none”
- [Atlassian · Elevation](https://atlassian.design/foundations/elevation) · guideline · The elevation system pairs surface and shadow tokens for raised layers and recommends borders or spacing for grouping where sufficient. · “a border or white space would suffice.”
- [Josh W. Comeau · Designing beautiful shadows](https://www.joshwcomeau.com/css/designing-shadows/) · practice · Layered shadows can add depth cues. The article also illustrates tinting a shadow to suit a colored backdrop. · “By layering multiple shadows, we create a bit of the subtlety present in real-life shadows.”
- [MDN · Forced colors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors) · guideline · MDN shows how to restore a shadow-dependent button boundary with a system-color border in forced colors. · “there is a border of the appropriate color”

Judgement: The exact three-layer CSS values and the payment-card elevation treatment are visual choices. Tinted promotional shadows and neutral reusable ones are art direction, with no universal neutral-token requirement.

## comp-1

Claims: Give the principal next action the highest button emphasis within its task group. Use equal visual prominence for neutral choices, such as accept and decline in a consent decision. Independent task groups may each have a primary button. Secondary actions still need readable, clear labels and operable targets. The example uses filled, outline and ghost treatments for three different levels of priority.

- [GitLab Pajamas · Button hierarchy](https://design.gitlab.com/components/button/) · guideline · Primary emphasis is scoped to task context, so independent settings tasks can each have a primary button. · “requiring its own primary button to complete a task”
- [GOV.UK · Button emphasis and usage](https://design-system.service.gov.uk/components/button/) · guideline · Use the default button for the main action and separate it visually from supporting actions. · “Use a default button for the main call to action on a page.”
- [Apple HIG · Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) · guideline · Prominent styling highlights the preferred action within a set, while equal-sized options communicate a coherent set. · “use a more prominent button style for that option and a less prominent style for the remaining ones”
- [USENIX Security · The effect of consent banner design](https://www.usenix.org/conference/usenixsecurity24/presentation/bielova) · research · A randomized experiment found that visually highlighting Decline affected consent decisions, supporting equal treatment when the choice should be neutral. · “a "bright pattern" that highlights the decline option has a substantial effect on users' decisions”
- [IBM Carbon · Button emphasis](https://www.carbondesignsystem.com/building-blocks/core/components/button/guidelines#a-single-high-emphasis-button) · guideline · A high-emphasis action can be grouped with lower-emphasis actions when they belong to the same task. · “A high-emphasis button can be accompanied by medium- and low-emphasis buttons that perform less important actions.”

Judgement: Filled, outline and ghost are example treatments. Their exact assignments and the choice to show three styles depend on the design system.

Disagreement: GOV.UK advises against multiple default buttons on one page, and Carbon generally limits primary buttons to one per screen aside from temporary flows. GitLab explicitly allows a primary button per independent task context.

## comp-2

Claims: Use proportionate safeguards. Offer recovery for reversible removals and explicit confirmation for consequential permanent deletion. Name the affected object, who or what will be affected, and whether it can be recovered. Provide an explicit Cancel action and consider focusing the least destructive option first. The example puts Delete project in a secondary position and uses red for the final confirmation.

- [IBM Carbon · Delete and remove actions](https://v10.carbondesignsystem.com/patterns/common-actions/#delete) · guideline · Carbon reserves confirmation with consequence details for deletion that cannot be undone or easily recreated, and uses different treatments for lower-impact removal. · “Ask for confirmation of the delete, with guidance about what will occur if they delete.”
- [WCAG 2.2 · Error prevention (legal, financial, data)](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html) · standard · For covered submissions including deletion of user-controllable stored data, WCAG allows reversible, checked or confirmed paths. · “A mechanism is available for reviewing, confirming, and correcting information before finalizing the submission.”
- [Apple HIG · Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts) · guideline · An alert is appropriate for uncommon destructive actions without undo, while familiar recoverable deletions can proceed without an alert. · “when people take an uncommon destructive action that they can’t undo, it’s important to display an alert”
- [Fluent · Destructive confirmation dialogs](https://fluent2.microsoft.design/components/web/react/core/dialog/usage/) · guideline · A Delete and Cancel pair responds to a specific title, and the dialog should lead with consequences when they matter. · “If there are consequences to the action, lead with those.”
- [WAI-ARIA APG · Modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) · guideline · Consider starting focus on the least destructive action for a final step that is hard to reverse. · “set focus on the least destructive action”

Judgement: The secondary row placement, ellipsis and red confirm treatment are example design choices. Red is a supporting cue.

Disagreement: WCAG 3.3.4 lists several compliant safeguards, and Apple HIG describes deliberately chosen Empty Trash as a confirmation whose action does not use destructive styling.

## comp-3

Claims: For circular corners and an even edge-to-edge inset, subtract the inset from the outer radius so the arcs share a center. An outer radius of 12px and an inset of 8px yield a 4px inner radius. Two 4px radii at that inset do not share a center. Measure from painted edge to painted edge, including intervening border and padding. Clamp a negative result to zero. Inspect unequal insets and elliptical corners separately.

- [CSS Backgrounds and Borders · Corner shaping](https://www.w3.org/TR/css-backgrounds-3/#corner-shaping) · standard · CSS subtracts border thickness at the padding edge and then subtracts padding at the content edge, flooring at zero and explaining unequal-thickness curves. · “The padding edge (inner border) radius is the outer border radius minus the corresponding border thickness.”
- [GitLab Pajamas · Concentric nested radii](https://design.gitlab.com/product-foundations/border/#keep-nested-radii-concentric) · guideline · The design system explicitly applies the radius-minus-inset rule to nested UI surfaces. · “outer radius - padding = inner radius”
- [Apple SwiftUI · Concentric corners](https://developer.apple.com/documentation/swiftui/edge/corner/style/concentric) · guideline · SwiftUI derives a concentric corner from the container radius and distance between corners, with a square corner at zero. · “the container shape’s corner radius minus the distance between corners. When the system calculates a zero radius, the corner is square.”
- [REI Cedar · Border radius](https://cedar.rei.com/guidelines/radius) · guideline · The design system uses a smaller rounded radius on nested objects. · “The border radius of a nested, rounded object should be smaller than that of its parent.”

Judgement: The 12px outer radius and 8px inset are illustrative choices. Their 4px result follows from the geometry.

## comp-4

Claims: Use consistent, distinct image treatments to distinguish people from other content in a mixed list. Circular person avatars beside rectangular file thumbnails add a visual cue. The association is a design-system convention. Keep an identifying name or label where identity matters, and preserve the entity cue when the image is missing.

- [GitLab Pajamas · Avatar shapes and fallbacks](https://design.gitlab.com/components/avatar/) · guideline · GitLab distinguishes people from group or project assets by shape and documents text labels and fallback treatments. · “A circle is used for a person. shape="circle" is the default.”
- [Fluent · Avatar shapes and variations](https://fluent2.microsoft.design/components/web/react/core/avatar/usage) · guideline · Fluent uses circular containers for individual avatars and square ones for group avatars. · “Standard avatars are circular containers that generally represent an individual.”
- [Atlassian · Avatar usage](https://atlassian.design/components/avatar/usage) · guideline · Atlassian uses circle avatars for people and square avatars for other entities, including projects and repositories. · “Use square avatars to represent other entities, such as a project, repository or space.”
- [W3C WAI · Images with adjacent text](https://www.w3.org/WAI/tutorials/images/decorative/) · guideline · Give identity in adjacent text. A redundant avatar can use empty alternative text to avoid repeating that identity. · “the information provided by the image might already be given using adjacent text”

Judgement: Rectangular document thumbnails and the exact contrast with portrait circles are application choices. The sources establish shape conventions for distinguishing entity types, with no measured improvement shown for this mixed list.

Disagreement: GitHub Primer Brand leaves circle versus square to visual impression and the design aesthetic, illustrating a different convention from assigning shape by entity type. https://primer.github.io/brand/components/Avatar/

## comp-5

Claims: Choose a modal to focus attention and suspend interaction with the underlying page. Choose a nonmodal side panel when comparison or editing requires seeing or interacting with the parent page. A drawer can also be modal. Use a full page when a modal or panel leaves too little working room. Test the smallest supported viewport and onscreen keyboard.

- [Fluent · Inline and overlay drawers](https://fluent2.microsoft.design/components/web/react/core/drawer/usage) · guideline · The design system distinguishes nonmodal side-by-side drawers from overlay drawers that disable main-content interaction by default. · “Use inline drawers when it’s helpful to view and interact with main content and drawer content at the same time.”
- [IBM Carbon · Modal content and sizing](https://www.carbondesignsystem.com/building-blocks/core/components/modal/guidelines#overflow-content) · guideline · Choose a modal size for the contents and use a full page when even the largest modal is cramped. · “If the large modal height is still not enough space then a full page might be needed instead.”
- [WAI-ARIA APG · Modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) · guideline · Modality makes underlying content inert, even when it is visible. · “Windows under a modal dialog are inert.”
- [Apple HIG · Modality](https://developer.apple.com/design/human-interface-guidelines/modality) · guideline · Reserve modality for focus or meaningful decisions, and account for the parent context users suspend. · “use modality only when it helps people focus or make choices”

Judgement: The six-field example is a deliberately cramped modal. Field count and surface placement are task and viewport decisions.

## comp-6

Claims: Identify the invalid field and put specific correction text beside it instead of relying on a distant or disappearing toast. Provide links from a submission error summary to affected fields where useful. Preserve entered values and programmatically associate the message with the field. Use page-level guidance for failures that the user cannot resolve by changing a field.

- [GOV.UK · Error messages](https://design-system.service.gov.uk/components/error-message/) · guideline · Show validation messages beside the field, explain the correction, keep entered values and use a different pattern for service failures. · “Show an error message next to the field and in the Error summary component”
- [GOV.UK · Error summaries](https://design-system.service.gov.uk/components/error-summary/) · guideline · After a validation error, link the summary to the invalid answers and use the same text as the local messages. · “link to each of the answers that have validation errors”
- [WCAG 2.2 · Error suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html) · standard · Where an input error is detected and a correction is known, provide it unless doing so would jeopardize security or the content’s purpose. · “If an input error is automatically detected and suggestions for correction are known, then the suggestions are provided to the user”
- [WCAG 2.2 · Error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html) · standard · WCAG requires identification of the invalid item and a text description. The Understanding document includes techniques for programmatic association. · “the item that is in error is identified and the error is described to the user in text.”
- [Baymard · Adaptive validation error messages](https://baymard.com/research-articles/adaptive-validation-error-messages) · research · Baymard observed better recovery with messages specific to the error, including an email address with an incomplete domain. · “During testing, errors that gave specific details improved the error-recovery time for all users”
- [GOV.UK · Service problem pages](https://design-system.service.gov.uk/patterns/problem-with-the-service-pages/) · guideline · Use a service-level page when an unexpected system problem prevents progress. · “Use this page when there is an unexpected problem with the service.”

Judgement: Below the field is the example placement. The rule calls for clear proximity and association.

Disagreement: GOV.UK requires an error summary even for a single validation error within its services. This rule treats a linked summary as an additional aid, especially for multiple errors.

## comp-7

Claims: Use visible labels for ambiguous actions, and test icon recognition and interpretation with the intended audience before omitting text. Label actions with a short verb and give every icon-only button an accessible name that describes its action. Keep essential labels discoverable without hover, and hide decorative icons from assistive technology when the text already names the control.

- [NN/g · Icon usability](https://www.nngroup.com/articles/icon-usability/) · research · Usability observations show that familiar shapes can have ambiguous meanings. Persistent labels also work where hover is unavailable. · “Icon labels should be visible at all times, without any interaction from the user.”
- [WAI-ARIA APG · Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/) · guideline · Buttons require an accessible label. Icon-only buttons can be named through an appropriate text alternative, aria-label or aria-labelledby. · “The button has an accessible label.”
- [Fluent · Button labels and icons](https://fluent2.microsoft.design/components/web/react/core/button/usage) · guideline · Name the action with brief, active wording and add an object when it clarifies the effect. · “usually a single verb is best but include a noun if it increases clarity”
- [NN/g · Evaluating digital icons](https://www.nngroup.com/articles/how-to-test-digital-icons/) · research · Research separates recognition of a glyph from interpretation of what it does. Test both before omitting visible text. · “Even when an icon is recognized as intended, it can be interpreted in a way that was not intended.”

Judgement: Labeling every toolbar action is the example. The actions with enough contextual meaning to stand alone depend on the audience and task.

## comp-8

Claims: When an expected action is unavailable, show the reason and any actionable prerequisite near the control. Native disabled controls ordinarily leave the tab sequence, so a tooltip attached only to a disabled control is unreliable. Consider allowing submission with actionable validation for correctable input. For permission, selection and pending states, give context specific to the cause. If using aria-disabled to preserve focus, prevent activation explicitly.

- [GitLab Pajamas · Disabled buttons](https://design.gitlab.com/components/button/#disabled) · guideline · Prefer actionable feedback, and if a disabled button is necessary, associate it with explanatory text already on the page. · “linking it to existing on-page text”
- [WAI-ARIA APG · Focusability of disabled controls](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#focusabilityofdisabledcontrols) · guideline · Native disabled controls normally leave the tab order. ARIA can communicate a disabled state while preserving discoverability. · “Browsers remove HTML input elements with the disabled attribute from the tab sequence.”
- [GOV.UK · Button emphasis and usage](https://design-system.service.gov.uk/components/button/) · guideline · Avoid disabled buttons when possible, especially if they obscure how to proceed. · “Disabled buttons have poor contrast and can confuse some users”
- [MDN · aria-disabled](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-disabled) · guideline · Managing disabled semantics with ARIA leaves the author responsible for suppressing the action. · “Web developers must manually ensure such elements have their functionality suppressed when exposed to the disabled state.”
- [GitHub Primer · Tooltip accessibility](https://primer.style/product/components/tooltip/accessibility/) · guideline · A tooltip on a disabled element is inaccessible to keyboard users, and essential information belongs in a more accessible place. · “A Tooltip is not allowed on disabled elements because such elements are not keyboard-accessible.”

Judgement: Putting the explanation directly below the button is an example. The best adjacent placement depends on the control and surrounding content.

Disagreement: Fluent recommends a tooltip for disabled buttons. Maersk does so too. That differs from persistent adjacent copy, and a tooltip needs a focusable trigger to reach keyboard users. https://fluent2.microsoft.design/components/web/react/core/button/usage#tooltips-and-aria-labels · https://designsystem.maersk.com/components/button/index.html

## comp-9

Claims: Acknowledge submission while pending and prevent accidental repeat activation. Keep pending, success and failure distinct. Wait for service confirmation before showing success, expose status to assistive technology, and preserve input for correction. Place a meaningful loading indicator by the trigger and keep the control’s dimensions stable. Client-side gating handles repeat clicks. An idempotent server contract can protect against retries after a lost response.

- [IBM Carbon · Inline loading](https://www.carbondesignsystem.com/building-blocks/core/components/inline-loading/guidelines) · guideline · Show processing state in place. Use distinct messages for pending, success and failure. · “Once the loading status changes to finished, the label should change. For example, when saving is finished, it would read “Saved”.”
- [GitLab Pajamas · Loading buttons](https://design.gitlab.com/components/button/#loading) · guideline · Use a spinner and suppress repeat activation while retaining focusability. · “the button is disabled while the state persists”
- [Stripe · Idempotent requests](https://docs.stripe.com/api/idempotent_requests) · practice · A server can recognize retries that carry the same idempotency key. · “The API supports idempotency for safely retrying requests without accidentally performing the same operation twice.”
- [WCAG 2.2 · Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) · standard · Expose waiting, progress, success and error messages programmatically when they appear without a focus change. · “status messages can be programmatically determined through role or properties”
- [GOV.UK · Error messages](https://design-system.service.gov.uk/components/error-message/) · guideline · Keep accepted and rejected input when users must correct validation errors. · “Keep both passing and failing answers.”

Judgement: The spinner, exact pending copy and fixed button width are implementation choices.

Disagreement: Carbon makes descriptive inline loading text optional. Its general loading guidance uses a three-second threshold for that component, while its inline loading guidance covers short, non-instant operations. https://www.carbondesignsystem.com/building-blocks/core/components/loading/guidelines

## comp-10

Claims: Use a shared icon artboard size for peer toolbar controls. Assess optical weight and alignment at actual size. Drawing, stroke and whitespace can make equal artboards feel different. Size pointer targets separately. The example contrasts 20px peers with drawings at 16px, 20px and 24px.

- [Apple HIG · Icons](https://developer.apple.com/design/human-interface-guidelines/icons) · guideline · Keep interface icons visually consistent and adjust their drawings when optical weight calls for it. · “Depending on the visual weight of an icon, you may need to adjust its dimensions to ensure that it appears visually consistent with other icons.”
- [IBM Carbon · Icon sizing and alignment](https://www.carbondesignsystem.com/building-blocks/foundations/icons/guidelines) · guideline · Use a consistent scale. Carbon has multiple artboard sizes for different text pairings and contexts. · “Be sure icon size is consistent throughout your product.”
- [Adobe Spectrum · Using icons](https://spectrum.adobe.com/foundations/icons-and-illustrations/using-icons) · guideline · Spectrum distinguishes canvas and visible glyph and uses a consistent stroke within a size range. · “Keeping one stroke weight consistent within a size range helps to balance out and contrast the visual weight.”
- [WCAG 2.2 · Target size (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) · standard · The minimum applies to the pointer target independently of the glyph, with stated exceptions including spacing. · “at least 24 by 24 CSS pixels, except when:”

Judgement: 20px is an example artboard size, chosen for this toolbar.

Disagreement: Spectrum uses differing icon scales to communicate hierarchy and context. The rule applies to peer controls with equal roles.

## comp-11

Claims: A single-destination card can offer a link target that fills the visible affordance. Provide separate, independently operable controls for other links, bookmarks, menus or selection. Use a descriptive native link and check keyboard operation, context menus and text selection. An invisible link stretched over content can intercept other controls or mask text selection.

- [HTML · Links and nested interactive content](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-a-element) · standard · An anchor cannot contain interactive descendants such as secondary card actions. · “there must be no interactive content descendant”
- [New York State Design System · Interactive cards](https://designsystem.ny.gov/components/card/) · guideline · Use a whole-surface link for a single destination and keep other controls out of interactive card slots. · “Set href to make the whole card a single link.”
- [Inclusive Components · Cards](https://inclusive-components.design/cards/#thepseudocontenttrick) · practice · A link stretched over the card can interfere with text selection. · “it's now difficult to select the text within the card”
- [WCAG 2.2 · Target size (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) · standard · Larger actionable areas can aid activation, beyond the minimum criterion and its exceptions. · “using larger target sizes will help many people use targets more easily”
- [NICE Design System · Clickable cards](https://design-system.nice.org.uk/components/card/) · guideline · The design system enlarges the hit area while retaining a concise link. · “The click area for card grids wraps the entire card.”

Judgement: How much blank space belongs in the primary target depends on the layout and need for text selection.

Disagreement: NICE advises against wrapping all card content in the anchor because of the screen reader experience. New York State uses a wrapping anchor for a single-link card. Both support a card-sized hit area.

## comp-12

Claims: Include a visible, keyboard-reachable Close or Cancel action and support Escape for dismissible dialogs. Escape should act on the topmost dismissible dialog. Restore focus to the opener or another logical place. Enable outside-click dismissal where its cost is low. Run all dismissal paths through unsaved-work handling when changes could be lost.

- [WAI-ARIA APG · Modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) · guideline · Provide a visible dismissal control in the tab sequence, use Escape to close and restore focus with the documented exceptions. · “a visible element with role button that closes the dialog”
- [Apple HIG · Modality](https://developer.apple.com/design/human-interface-guidelines/modality) · guideline · Handle potential loss of user-generated content whether dismissal starts with a gesture or a button. · “if closing the view could result in the loss of user-generated content”
- [HTML · Dialog light dismiss](https://html.spec.whatwg.org/multipage/interactive-elements.html#attr-dialog-closedby) · standard · HTML allows separate policies for close requests and outside clicks. The default modal policy accepts close requests without light dismissal. · “Close requests or clicks outside close the dialog.”
- [MDN · The dialog element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) · guideline · Native dialogs distinguish light dismissal, Escape or equivalent close requests, and developer-supplied controls. Escape closes the last shown native modal. · “A light dismiss user action, in which the <dialog> is closed when the user clicks or taps outside it.”
- [Fluent · Dialog dismissal](https://fluent2.microsoft.design/components/web/react/core/dialog/usage/#dismissal) · guideline · Ordinary modals support backdrop, Escape and buttons. Alert dialogs require a deliberate footer choice. · “Alert dialogs can only be dismissed by selecting one of the available buttons”

Judgement: Backdrop dismissal is an example for a read-only shortcuts sheet. Its cost depends on the task.

Disagreement: Fluent’s alert-dialog variant requires a footer selection even though ordinary modals support Escape. The rule addresses dialogs intended to be dismissible.

## comp-13

Claims: Identify the chart’s measure, series and time period. Explain the relevant trend or comparison in text. Where readers need individual values, provide a labeled data table or another accessible equivalent with genuine table headers and keyboard-accessible disclosure. Keep the plot, textual conclusion and individual values aligned with the selected period. A simple chart whose full meaning fits in a sentence may need only that textual equivalent.

- [W3C WAI · Complex images](https://www.w3.org/WAI/tutorials/images/complex/) · guideline · A complex chart needs identification and equivalent essential information. The long description can contain values, relationships and trends. · “The long description provides detailed information, including scales, values, relationships and trends that are represented visually.”
- [USWDS · Data visualizations](https://designsystem.digital.gov/components/data-visualizations/) · guideline · Provide a plain-text narrative in addition to access to individual values in an accessible table. · “a data table does not provide an equivalent narrative to a visualization”
- [EuroVis · Rich screen reader experiences for data visualization](https://vis.mit.edu/pubs/rich-screen-reader-vis-experiences/) · research · Tables aid lookup. Text and richer nonvisual representations can support higher-level analysis and exploration. · “While tables provide readers with the ability to hone in on specific data points”
- [W3C WAI · Accessible data tables](https://www.w3.org/WAI/tutorials/tables/) · guideline · Use semantic table headers so people can interpret individual values in context. · “Header cells must be marked up with <th>, and data cells with <td> to make tables accessible.”

Judgement: The chart’s question and example counts are editorial choices. A shared filtered dataset is implementation guidance. The cited sources support equivalent content, leaving its state architecture to the implementer.

## comp-14

Claims: Use a native anchor with an href for navigation, including button-styled links. Use buttons for actions such as submitting, toggling, deleting or opening a dialog, including when completion subsequently navigates. Native anchors supply link semantics and browser affordances for keyboard activation, opening a tab, copying the address and showing a desktop destination preview. A scripted div or ARIA link role alone lacks native link behaviors. Google generally needs anchors with href attributes for reliable link extraction. Next.js Link extends native anchors with client-side routing.

- [HTML · The a element](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-a-element) · standard · An anchor with href represents a hyperlink. · “If the a element has an href attribute, then it represents a hyperlink”
- [WAI-ARIA APG · Link pattern](https://www.w3.org/WAI/ARIA/apg/patterns/link/) · guideline · Native anchors obtain standard navigation and context-menu behavior. ARIA link roles alone do not confer those features. · “standard link behaviors, such as navigation to the link target or context menu actions”
- [WAI-ARIA APG · Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/) · guideline · Buttons trigger operations. Semantics follow the primary purpose of the control. · “A button is a widget that enables users to trigger an action or event”
- [Google Search Central · Crawlable links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable) · practice · Google generally uses anchors with href to extract destinations and cannot reliably extract script-only links. · “with an href attribute. Most links in other formats won't be parsed and extracted by Google's crawlers.”
- [Chrome Help · Link shortcuts](https://support.google.com/chrome/answer/157179) · guideline · Chrome documents platform-specific shortcuts for opening links in another tab. · “Open a link in new background tab ⌘ + Click a link”
- [Next.js · Link](https://nextjs.org/docs/app/api-reference/components/link) · practice · The Link component extends the anchor for client-side routing. · “extends the HTML <a> element to provide prefetching and client-side navigation between routes.”

Judgement: The invoice content and styling are illustrative. URL previews, context-menu wording and shortcuts depend on the browser, platform and input device.

Disagreement: The rule’s URL-change test needs the qualification in its deep dive. APG distinguishes a button’s operation, including form submission, from a link’s navigation function. Save and view is an action even when it leads elsewhere.

## comp-15

Claims: Show the real product or output in a state that demonstrates the headline’s claim. Crop and size the evidence so it remains readable. Prioritize relevant product evidence over generic decoration. Usability studies observed people spending more attention on informative images. Keep the demonstration understandable without hover or animation and provide equivalent text for the image’s meaningful information. The deploy and error increase are illustrative. Review whether readers can locate the promised result in the image.

- [Baymard · Showing the SaaS interface](https://baymard.com/research-articles/highlight-saas-ui#1-images) · research · SaaS usability participants valued actual interfaces. Screenshots helped communicate specific features and benefits. · “images of the UI on digital subscription services sites can highlight particular features and benefits of the product”
- [NN/g · Photos as web content](https://www.nngroup.com/articles/photos-as-web-content/) · research · Eyetracking observations found that people scrutinized information-carrying images relevant to the task and ignored decorative imagery. · “Users pay close attention to photos and other images that contain relevant information but ignore fluffy pictures used to "jazz up" web pages.”
- [W3C WAI · Informative images](https://www.w3.org/WAI/tutorials/images/informative/) · guideline · Alternative text should communicate the result or meaning conveyed by the visual evidence. · “The text alternative should convey the meaning or content that is displayed visually”
- [Baymard · Product images with descriptive text](https://baymard.com/research-articles/product-images-descriptive-text) · research · Product-page usability research supports using visuals with text or graphics to highlight useful features. · “combining images and text, by adding descriptive text or graphics to product images, can be an effective way to communicate”

Judgement: Matching the image to the exact headline moment, choosing the crop and applying the competitor-name test are editorial heuristics. Deploy #418 and the 38% rise illustrate the approach. The studies do not establish a general abandonment effect.

Disagreement: Baymard found that animations and interactive demos can also show the interface effectively, and describes a broader UI introduction as suitable for some homepages. Readable static evidence tied to a specific headline is a stronger editorial standard.

## form-1

Claims: Place labels above text fields when width is limited or label lengths vary so labels can wrap and fields can share a left edge. A shared label column can work when there is room and each field is clearly paired with its label. Keep the label programmatically associated and check for clipping with narrow widths, enlarged text, and longer translations.

- [W3C WAI · Labeling form controls](https://www.w3.org/WAI/tutorials/forms/labels/) · guideline · Covers explicit association, proximity, and the reflow advantages of above-field labels. · “The aim should be to maintain a close and distinct visual relationship between the label and the form control.”
- [Baymard · Field label placement on mobile](https://baymard.com/research-articles/mobile-form-usability-label-position) · research · Checkout usability testing favors above-field labels in mobile portrait mode, with exceptions for short forms and landscape. · “you can have the form fields extend the full width of the display”
- [GOV.UK · Text inputs](https://design-system.service.gov.uk/components/text-input/) · guideline · Recommends placing text-input labels above the controls they describe. · “align labels above the text input they refer to.”
- [UXmatters · Label placement in forms](https://www.uxmatters.com/mt/archives/2006/07/label-placement-in-forms.php) · research · Penzo’s eye-tracking study found better results with aligned side labels than with side labels at uneven distances. · “The right alignment of the labels reduced the overall number of fixations by nearly half”

Judgement: How wide to make a shared label column depends on the form and translations.

Disagreement: Baymard recommends considering side labels in mobile landscape when the on-screen keyboard leaves little vertical space. The rule’s description accommodates side labels, while its Do/Don't captions read more broadly.

## form-2

Claims: Keep a visible, associated label when a field is empty, typed into, or autofilled. A placeholder may show a supplementary example. Instructions needed to complete or review the value stay visible outside the field. Check the accessible field name and the ability to review filled values.

- [HTML · The placeholder attribute](https://html.spec.whatwg.org/multipage/input.html#the-placeholder-attribute) · standard · Defines the placeholder as a hint for an empty input and says to keep the control’s label. · “The placeholder attribute should not be used as an alternative to a label.”
- [NN/g · Placeholders in form fields](https://www.nngroup.com/articles/form-design-placeholders/) · research · Shows how disappearing labels obstruct review and make incorrect autofill harder to catch. · “The lack of labels makes it impossible for customers to glance through the form and make sure that their responses are correct.”
- [W3C WAI · Form instructions](https://www.w3.org/WAI/tutorials/forms/instructions/) · guideline · Explains why instructions and examples needed for review should remain visible after the user enters data. · “it makes it more difficult for users to check their responses”
- [GOV.UK · Text inputs](https://design-system.service.gov.uk/components/text-input/) · guideline · Points to persistent hint text and recommends avoiding placeholders even for examples on GOV.UK services. · “or for hints or examples”

Disagreement: GOV.UK advises against placeholders even for examples. WHATWG permits an example as a short supplemental hint for an empty control.

## form-3

Claims: Where most questions are required, explain the convention before the form and mark optional exceptions in words. Keep visible, programmatic, and server-side requirements consistent. An explained asterisk can communicate a requirement when the requirement is also exposed to assistive technology. Ask only for information the task needs.

- [GOV.UK · Question pages](https://design-system.service.gov.uk/patterns/question-pages/) · guideline · Recommends marking optional fields in words and limits questions to information the service needs. · “in most contexts, add ‘(optional)’ to the labels of optional fields”
- [W3C WAI · Form instructions](https://www.w3.org/WAI/tutorials/forms/instructions/) · guideline · Recommends giving the form’s required and optional convention before the form controls, with relevant instructions in labels. · “Provide such instructions before the <form> element”
- [W3C WAI · Indicating required form fields](https://www.w3.org/WAI/WCAG22/Techniques/html/H90) · standard · Accepts an asterisk when its meaning is explained up front and the symbol is programmatically associated with the field. · “If a symbol is used, the user is advised of its meaning before the first use.”
- [HTML · The required attribute](https://html.spec.whatwg.org/multipage/input.html#the-required-attribute) · standard · Defines native requiredness for controls and the associated missing-value constraint. · “The required attribute is a boolean attribute. When specified, the element is required.”
- [Baymard · Required and optional form fields](https://baymard.com/research-articles/required-optional-form-fields) · research · Reports usability failures with optional-only marking in longer checkout forms and allows exceptions for short forms. · “when encountering forms where only the optional fields were marked, 32% of users during testing had a validation error”

Judgement: The length and complexity at which both kinds of field need individual markers depend on the task.

Disagreement: Baymard recommends labeling both required and optional fields in checkouts and long account-creation forms. GOV.UK advises against asterisks and its custom server-side validation pattern explicitly omits native required to avoid browser validation. See https://design-system.service.gov.uk/patterns/validation/ for the native-required exception.

## form-4

Claims: Use a field’s visible width to signal an answer with a predictable length, and leave room to read valid longer answers. Keep layout width separate from input type and length constraints. Accept supported regional postal formats, including ZIP+4 when appropriate, and preserve leading zeros.

- [Baymard · Matching input widths to expected answers](https://baymard.com/research-articles/form-field-usability-matching-user-expectations) · research · Relates input width to expected text length and identifies short, variable postal codes as a reason for custom sizing. · “making the input field’s width match the expected input is important to the usability of your form.”
- [GOV.UK · Address forms](https://design-system.service.gov.uk/patterns/addresses/) · guideline · Recommends accepting different postcode formats and accommodating longer addresses and international users. · “let users enter postcodes in different formats”
- [GOV.UK · Text inputs](https://design-system.service.gov.uk/components/text-input/) · guideline · Recommends sizing to a predictable answer length and discusses why restrictive maxlength can truncate valid input. · “fixed width inputs for content that has a specific, known length.”
- [HTML · Number input state](https://html.spec.whatwg.org/multipage/input.html#number-state-(type=number)) · standard · Explains why US postal codes are identifiers that should not be implemented as numeric controls. · “credit card numbers or US postal codes.”
- [USPS · Addressing standards](https://pe.usps.com/text/dmm300/602.htm) · guideline · Defines the five-digit ZIP and the longer, hyphenated ZIP+4 format. · “The correct format for a numeric ZIP+4 code is five digits, a hyphen, and four digits.”

Judgement: The illustrated ZIP and street-field widths are design choices that depend on the font, available space, and expected values.

## form-5

Claims: Use radios for mutually exclusive alternatives and checkboxes for independent options. A required native radio group can start empty. It must have a selection for valid submission. Use a named group and distinct option labels, preserve native keyboard behavior, and provide a meaningful None option or reset when needed.

- [HTML · Radio button input state](https://html.spec.whatwg.org/multipage/input.html#radio-button-state-(type=radio)) · standard · Defines radio exclusivity, same-name grouping, and the missing-value state for a required, unanswered group. · “only one control can have its checkedness state set to true.”
- [GOV.UK · Radio buttons](https://design-system.service.gov.uk/components/radios/) · guideline · Recommends against preselecting radios in question flows and discusses providing an explicit None option when valid. · “‘None of the above’ or ‘I do not know’ if they are valid options.”
- [GOV.UK · Checkboxes](https://design-system.service.gov.uk/components/checkboxes/) · guideline · Recommends checkboxes for multiple selections or an independent on/off option. · “Unlike with radios, users can select multiple options from a list of checkboxes.”
- [WAI-ARIA APG · Radio group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) · guideline · Describes initializing all radios unchecked, labeling the group and its items, and arrow-key interaction. · “Some implementations may initialize the set with all buttons in the unchecked state”

Disagreement: An older NN/g article says always to preselect a radio (https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/). Its later article discusses some cases that warrant no default (https://www.nngroup.com/articles/radio-buttons-default-selection/). Native HTML and APG both support an unanswered initial group.

## form-6

Claims: Expose a short set of options when seeing them together helps people compare. A select can save space for a bounded list and may suit a task where the person knows what they are looking for. Consider labels, explanatory detail, available space, and keyboard operation. Consider search for very long vocabularies.

- [NN/g · Does your form need a dropdown?](https://www.nngroup.com/articles/dropdown-list/) · research · Explains the extra interaction cost of hiding choices and the benefit of exposing alternatives for comparison. · “laying out options as buttons surfaces all choices at once, allowing users to scan, compare, and select in one step.”
- [GOV.UK · Select menus](https://design-system.service.gov.uk/components/select/) · guideline · Describes the select as a long-list control and advises reducing the number of options so radios can be considered. · “try asking users questions which will allow you to present them with fewer options.”
- [GOV.UK · Radio buttons](https://design-system.service.gov.uk/components/radios/) · guideline · Provides the radio pattern for a visible list of mutually exclusive alternatives and advises deliberate handling of defaults. · “when users can only select one option from a list.”
- [Baymard · Dropdown usability](https://baymard.com/research-articles/drop-down-usability) · research · Documents usability issues with dropdowns for both very short and long lists and proposes research-specific ranges. · “Drop-downs are generally a poor choice for offering fewer than 5 or more than 10 options”
- [USWDS · Select](https://designsystem.digital.gov/components/select/) · guideline · Recommends radios for short lists and considering a combo box for very long ones. · “If the list of options is very long, consider using a combo box.”

Judgement: There is no universal option-count cutoff. List density and how much comparison the purchasing decision needs determine whether three billing cycles fit.

Disagreement: GOV.UK calls selects a last resort in public services. Baymard finds long dropdowns can be difficult in ecommerce, and NN/g recommends direct entry for familiar free-form values such as age and birth date. Knowing the answer alone does not establish that a long select is a good fit.

## form-7

Claims: Use a switch for an on/off setting whose change takes effect immediately. Use a checkbox for a pending option submitted with the form and make the save boundary apparent. Keep the switch label stable and show the true saved state and a recovery action if persistence fails.

- [Fluent · Switch behavior](https://fluent2.microsoft.design/components/web/react/core/switch/usage) · guideline · Recommends a checkbox when the change waits for a submission step. · “If you need a component that requires a submission step before applying a change”
- [Microsoft Windows · Toggle switches](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/toggles) · guideline · Explicitly distinguishes immediate switches from checkboxes that require a Next or Submit button. · “Use a toggle switch for binary settings when changes become effective immediately after the user changes them.”
- [WAI-ARIA APG · Switch pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/) · guideline · Defines switch state as on/off and requires a stable label across state changes. · “it is critical the label on a switch does not change when its state changes.”
- [IBM Carbon · Toggle](https://www.carbondesignsystem.com/building-blocks/core/components/toggle/guidelines) · guideline · Uses toggle controls for immediately applied settings and suggests a checkbox and button for deferred application. · “Ideal for settings or preferences that can be immediately applied.”

Judgement: The example’s decision to apply Dark mode immediately and defer Email updates belongs to the particular settings flow. The recovery display depends on how persistence can fail.

## form-8

Claims: Wait until Continue or Submit to show a first format error. Let the user finish, type slowly, and move among fields beforehand. Validate submissions on the server regardless of any client-side assistance. Associate each error with its field, announce it when it appears, and clear it when the corrected value is accepted.

- [GOV.UK · Form validation](https://design-system.service.gov.uk/patterns/validation/) · guideline · Advises waiting for a user to attempt the next step, limits earlier validation to researched cases, and requires server validation. · “Do not validate when the user moves away from a field.”
- [Baymard · Inline form validation](https://baymard.com/research-articles/inline-form-validation) · research · Finds that premature validation is disruptive and that errors should clear as soon as the field contains an accepted value. · “error messages are removed as soon as the input is corrected”
- [W3C WAI · Indicating error fields](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA21) · standard · Uses aria-invalid to identify the failed input and aria-describedby to connect it to its message. · “The error message is associated with the field using aria-describedby”
- [W3C WAI · Form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/) · guideline · Shows how to announce newly added validation feedback with an alert or live region. · “set to alert to make assistive technology users aware of this change.”

Judgement: Submission is a default timing choice for this form. Earlier feedback is worth evaluating if delay would cost the user substantial rework.

Disagreement: Baymard supports checking some inputs on field exit in checkout, after people have had a chance to complete the value. GOV.UK allows earlier checks when user research supports them. WAI’s form-notification tutorial also illustrates an expiry input validated on field exit.

## form-9

Claims: Show a real format requirement alongside the field before entry and keep it visible during editing. Give a valid example, associate it with the field, and localize it where formats differ. Accept equivalent values when unambiguous. Review separators, pasted values, and autofill before requiring an input mask. MM / YY is a card-expiry example that matches how many cards print the date.

- [W3C WAI · Form instructions](https://www.w3.org/WAI/tutorials/forms/instructions/) · guideline · Shows how to include a persistent expiry-date format in the label and where to provide separately associated hints. · “indicated by “MM/YYYY” within the same label:”
- [Baymard · Expiration date field formatting](https://baymard.com/research-articles/how-to-format-expiration-date-fields) · research · Reports checkout friction from discrepancies between card and form and recommends a two-digit month and year. · “a 2-digit month and a 2-digit year (e.g., “MM / YY”)”
- [GOV.UK · Form validation](https://design-system.service.gov.uk/patterns/validation/) · guideline · Recommends accepting and normalizing different formats when they convey the same value unambiguously. · “as long as it’s not ambiguous”
- [GOV.UK · Date inputs](https://design-system.service.gov.uk/components/date-input/) · guideline · Gives an example of accepting equivalent formats discovered through user research, including abbreviated or full month names. · “Accept month names written out in full or abbreviated form”
- [WCAG 2.2 · Labels or instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) · standard · Identifies the benefit of showing expected formats and examples before people attempt to enter an answer. · “Providing labels and instructions (including examples of expected data formats) helps all users”

Judgement: The choice of which separators or pasted variants can be normalized safely depends on the field’s format and supported locales.

## form-10

Claims: Use a clear, usually single-column sequence for unrelated form fields. Short parts of one question may share a row when their relationship and order remain clear. Preserve meaningful document and keyboard focus order through responsive reflow and zoom.

- [Baymard · Multicolumn form layouts](https://baymard.com/research-articles/avoid-multi-column-forms) · research · Reports higher error and omission rates in multicolumn checkout forms and illustrates related-field exceptions. · “single-column layouts resulted in fewer skipped fields, misinterpreted fields, and errors compared to multicolumn layouts.”
- [WCAG 2.2 · Meaningful sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html) · standard · Requires a programmatically determinable reading order when sequence affects meaning. · “When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined.”
- [WCAG 2.2 · Focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) · standard · Requires sequential focus to preserve relationships that matter for meaning and operation. · “Focusable components need to receive focus in an order that preserves meaning and operability.”
- [WCAG 2.2 · Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) · standard · Covers retention of information and functionality at narrow viewport equivalents, including under zoom. · “Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions”

Judgement: Which short related fields can share a row depends on the task, locale, and available width.

## form-11

Claims: Reuse an answer required again in the same process by prefilling it or making it available to select. Make reused values reviewable and editable where they may have changed. Ask for consequential unknowns. WCAG 3.3.7 allows exceptions for essential re-entry, security, or invalidated information. It does not require cross-session storage. Use browser autofill metadata as a separate convenience. Browser autofill alone does not satisfy redundant entry.

- [WCAG 2.2 · Redundant entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html) · standard · Requires same-process reuse or selection and explains its exceptions, session boundary, and why browser autocomplete alone is insufficient. · “Data which is "available to select" would need to be on the same page.”
- [GOV.UK · Check answers](https://design-system.service.gov.uk/patterns/check-answers/) · guideline · Recommends showing previously entered values when a user returns to review or change an answer. · “If a user decides to go back to a previous answer, make sure information they’ve already entered is pre-populated.”
- [Baymard · Reusing a shipping address for billing](https://baymard.com/research-articles/set-billing-equal-to-shipping) · research · Checkout testing supports reusing the shipping address with the option to supply a different billing address. · “the billing address should default to the previously entered shipping address”
- [HTML · Autofill field names](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill) · standard · Defines autocomplete as a hint for browser-managed autofill and covers standardized field purposes. · “The autocomplete content attribute can be used to hint to the user agent”

Judgement: Which fields are safe to carry forward depends on provenance and how consequential an outdated or guessed value would be.

## form-12

Claims: Show explicit success feedback only after the submission or save succeeds, and distinguish pending, failed, and successful states. Make inline status available to assistive technology without moving focus unnecessarily or relying on an icon. For a completed transaction, provide a findable record and relevant reference or next steps.

- [W3C WAI · Success feedback after submission](https://www.w3.org/WAI/WCAG22/Techniques/general/G199) · standard · Recommends explicitly confirming a successful submission so users need not search for indirect evidence. · “Check that a feedback message on the screen confirms that the submission was successful.”
- [WCAG 2.2 · Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) · standard · Requires that status updates be available to assistive technology without taking focus when the success criterion applies. · “they can be presented to the user by assistive technologies without receiving focus.”
- [GOV.UK · Confirmation pages](https://design-system.service.gov.uk/patterns/confirmation-pages/) · guideline · Recommends transaction references, next steps, and a way to keep a record. · “a way for users to save a record of the transaction, for example, as a PDF”
- [W3C WAI · Form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/) · guideline · Recommends clear success feedback and illustrates combining visual indicators with textual messages. · “Success messages are also important to confirm task completion.”
- [IBM Carbon · Notifications](https://www.carbondesignsystem.com/building-blocks/core/components/notification/guidelines) · guideline · Describes inline feedback after completion and placing it near the relevant controls or content. · “Inline notifications appear near their related items.”

Judgement: The checkmark, its green color, and the example’s exact message are presentation choices.

## form-13

Claims: Accept one paste of the whole sign-in code, including any leading zeros. A visually segmented code input can meet this goal when a whole paste populates all boxes and corrections remain possible. For digit-only codes, use text input with inputmode=numeric and autocomplete=one-time-code. Keep the value as a string. Test password managers and supported autofill throughout existing-account authentication. WCAG permits qualifying alternative paths, assistance mechanisms, and defined recognition exceptions.

- [WCAG 2.2 · Accessible authentication (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html) · standard · Explains avoiding transcription, allowing password managers and paste, and when a qualifying alternative suffices. · “it should be possible to complete the action without the need to transcribe information.”
- [W3C WAI · Failure to accept a complete code](https://www.w3.org/WAI/WCAG22/Techniques/failures/F109) · standard · Identifies segmented code fields as a potential failure unless they accept a complete paste into the first field and populate the rest. · “unless the user can paste the entire code in the first input, and the remaining inputs are populated automatically”
- [Chrome for Developers · SMS OTP forms](https://developer.chrome.com/docs/modern-web-guidance/guides/forms/sms-otp-form) · practice · Recommends text plus numeric input mode for digit strings, illustrates leading zeros, and covers one-time-code keyboard autofill. · “A one-time passcode is an identifier string that may contain leading zeros (such as 012345)”
- [HTML · Autofill field names](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill) · standard · Defines the one-time-code purpose as a free-form text token for identity verification. · “One-time code used for verifying user identity”

Judgement: Whether to present a single field or a segmented visual treatment is a design choice when both accept and edit the whole code accessibly.

## form-14

Claims: Use input type, inputmode where needed, and an appropriate autocomplete token to expose field purpose and offer the right keyboard and saved values. For email, use type=email, autocomplete=email and spellcheck=false. Suppress unwanted capitalization and spellchecking on identifier fields where the browser would otherwise apply them. Use text with a numeric keyboard for digit identifiers, preserving leading zeros. Reserve number controls for numeric quantities that can sensibly be incremented.

- [WCAG 2.2 · Identify input purpose](https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html) · standard · Requires programmatic purpose for covered user-information fields and explains autocomplete as an HTML technique. · “The purpose of each input field collecting information about the user can be programmatically determined”
- [GOV.UK · Email addresses](https://design-system.service.gov.uk/patterns/email-addresses/) · guideline · Shows type=email for email keyboard support, autocomplete=email for saved addresses, and spellcheck=false to avoid inappropriate checking. · “setting the spellcheck attribute to false so that browsers do not spellcheck the email address”
- [HTML · The inputmode attribute](https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute) · standard · Defines input-mode hints for keyboards, including numeric layouts appropriate for PIN entry. · “The user agent should display a virtual keyboard capable of numeric input. This keyword is useful for PIN entry.”
- [HTML · Autocapitalization](https://html.spec.whatwg.org/multipage/interaction.html#autocapitalization) · standard · Defines the off setting and explains that URL, email, and password input states already suppress autocapitalization. · “No autocapitalization should be applied (all letters should default to lowercase).”
- [HTML · Number input state](https://html.spec.whatwg.org/multipage/input.html#number-state-(type=number)) · standard · Excludes digit identifiers from the number state and suggests testing whether spinbox semantics fit. · “consider whether it would make sense for the input control to have a spinbox interface”
- [Chrome for Developers · SMS OTP forms](https://developer.chrome.com/docs/modern-web-guidance/guides/forms/sms-otp-form) · practice · Recommends a text field with numeric input mode for one-time codes to preserve leading zeros. · “can strip leading zeros”

Judgement: Disabling spellcheck on usernames and codes is a practical choice when those values are identifiers and ordinary spelling suggestions would be unhelpful.

Disagreement: HTML already suppresses autocapitalization for type=email, type=url, and type=password. An explicit autocapitalize=off matters more for plain text identifiers such as usernames.

## form-15

Claims: After failed validation, preserve both valid and invalid submitted answers, including the latest values after a retry. Mark the specific fields that need correction and let people edit them in place. A React function action that resolves, including by returning a validation error, resets uncontrolled fields to their defaults. Use controlled state or return the submitted values with field errors and restore them as defaultValue with useActionState.

- [GOV.UK · Validation pattern](https://design-system.service.gov.uk/patterns/validation/) · guideline · Recommends re-rendering the page with all entered values intact and putting error messages beside invalid fields. · “as the user filled them in”
- [W3C WAI · Describing invalid form input](https://www.w3.org/WAI/WCAG22/Techniques/general/G85) · standard · Illustrates returning the user's data while identifying the incorrect field and covers sensitive-field exceptions. · “The server returns the form, with the user's data still present”
- [React · Preserving form values after an Action](https://react.dev/reference/react-dom/components/form#preserve-form-values-after-an-action) · practice · Documents the uncontrolled reset on a resolved Action and how updated defaultValue props preserve values. · “Returning a validation error instead of throwing also triggers this reset.”
- [React · Validation errors with useActionState](https://react.dev/reference/react/useActionState#displaying-validation-errors-and-preserving-form-values) · practice · Shows returning submitted values with validation errors and using them as the new defaultValue after failed validation. · “Return validation errors and submitted values from the Action to display an error without clearing the affected fields.”
- [Baymard · Retaining entered data after validation errors](https://baymard.com/research-articles/preserve-card-details-on-error) · research · Checkout usability tests document extra effort and abandonment when errors clear valid entered values. · “clearing the credit card field — regardless of where the validation error actually occurred — results in increased effort for all users.”

Disagreement: W3C technique G85 makes an exception for security-related fields where redisplaying data is inappropriate, such as passwords. The rule now keeps only answers people can safely review.

Dropped: https://react.dev/reference/react-dom/components/form#preserving-form-values-after-an-action (The page returns 200, but this fragment does not exist. The verified replacement uses #preserve-form-values-after-an-action.)

## sys-1

Claims: The 900 ms example holds wait time constant. A skeleton previews a predictable layout without measuring progress. Use an indeterminate indicator when progress is unknown and determinate progress when completed work can be measured. Preserve already loaded content during refresh and reserve space for predictable content. Respect reduced motion and make slow or failed requests announceable and recoverable.

- [IBM Carbon · Loading patterns](https://www.carbondesignsystem.com/building-blocks/core/patterns/loading) · guideline · Use skeletons for predictable structured components during initial loading. · “Only use skeleton states on container-based components like tiles and structured lists or data-based components like data tables and cards.”
- [Android Developers · Progress indicators](https://developer.android.com/develop/ui/compose/components/progress) · guideline · Use indeterminate indicators when the wait is unknown. The page also defines measured determinate progress. · “Use indeterminate indicators to show that a process is happening when the wait time is unknown.”
- [NN/g · Skeleton screens](https://www.nngroup.com/articles/skeleton-screens/) · practice · A skeleton communicates the structure people can expect to see. · “Skeleton screens help the user understand that the page is loading, while also communicating what the page will look like.”
- [TanStack Query · Paginated queries](https://tanstack.com/query/latest/docs/framework/react/guides/paginated-queries) · practice · Previously fetched content can remain available while a new request runs. · “The data from the last successful fetch is available while new data is being requested, even though the query key has changed.”
- [WCAG 2.2 · Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) · standard · Waiting and progress states are status information that assistive technology can announce. · “on the waiting state of an application”

Judgement: The 900 ms delay and the shapes of the placeholders are demonstration choices. The example establishes no general speed or satisfaction advantage.

Disagreement: NN/g recommends skeleton screens for full-page loads, favors spinners for individual modules, and says indicators are usually unnecessary below one second. Carbon also allows component skeletons. Treat the 900 ms comparison as an illustration.

## sys-2

Claims: Explain the cause of an empty list, panel, or result set. Distinguish a successful empty result from loading or failure. Offer an available next step suited to the cause, such as first creation, changing filters, or recovery. A desirable empty outcome can use a quiet message without a call to action.

- [IBM Carbon · Empty states](https://www.carbondesignsystem.com/building-blocks/core/patterns/empty-states) · guideline · Empty states have distinct causes and can provide contextual next steps. The guide includes confirmation, error and text-only examples. · “Empty states occur when there is no data to display, often during first-time use or when content has been deleted or is unavailable.”
- [Shopify · Empty state](https://shopify.dev/docs/api/app-home-ui-extension/latest/web-components/feedback-and-status-indicators/empty-state) · guideline · Explain a filtered result and offer a way to change it. The same guidance covers first-item creation. · “Filtered results: Tell merchants that a filter or search matched nothing, and offer a way to change it.”
- [NN/g · Designing empty states in complex applications](https://www.nngroup.com/articles/empty-state-interface-design/) · practice · Blank panes leave system status unclear. Empty regions can offer contextual help, status or action. · “When content does not yet exist for a screen, page, or panel, use the empty state to provide help cues.”

Judgement: The project wording and action label are examples. The right action depends on the available permissions and task.

## sys-3

Claims: Measure the clickable area independently of the visual icon. Padding can expand the target while margins only separate targets. WCAG 2.2 AA generally requires 24 × 24 CSS px, with five exceptions including a defined 24 CSS px circle spacing test. 44 × 44 CSS px is the WCAG AAA enhanced threshold with its own exceptions and a useful target for coarse input. Avoid overlapping expanded hit areas. Native platforms use their own units and target sizes.

- [WCAG 2.2 · Target size (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) · standard · Establishes the AA 24 × 24 CSS px threshold and defines its spacing and other exceptions. · “The size of the target for pointer inputs is at least 24 by 24 CSS pixels, except when:”
- [WCAG 2.2 · Target size (enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html) · standard · Establishes the AAA 44 × 44 CSS px threshold with exceptions and explains why coarse touch benefits from larger targets. · “The size of the target for pointer inputs is at least 44 by 44 CSS pixels except when:”
- [Android Accessibility Help · Touch target size](https://support.google.com/accessibility/android/answer/7101858) · guideline · An icon may have a smaller visual footprint than its touch target. Android's 48 dp recommendation is platform-specific. · “Touch targets extend beyond the visual bounds of an element”
- [Parhi, Karlson & Bederson · One-handed touch target sizes](https://www.cs.umd.edu/hcil/trs/2006-11/2006-11.htm) · research · Experiments on small touchscreens found size recommendations in physical units for discrete and serial one-handed thumb tasks. · “9.2 mm for discrete tasks and targets of 9.6 mm for serial tasks should be sufficiently large for one-handed thumb use”

Judgement: The 16 px glyph and 44 px wrapper are demonstration dimensions. Which important touch controls merit more space is task-dependent.

## sys-4

Claims: Use relative time for elapsed recency and localized absolute date/time for a precise reference or record. Maintain a canonical instant for dated events and keep calendar-only dates independent of time-zone conversion. Make the exact value accessible on touch and keyboard when it matters. Include the relevant time zone when precision requires it.

- [GitLab Pajamas · Date and time](https://design.gitlab.com/content/date-and-time/) · guideline · Differentiates elapsed versus exact time and documents localized dates, viewer time zones and date-only values. · “The absolute format clarifies the precise date and time that something occurred.”
- [GitHub Primer · Relative time](https://primer.style/product/components/relative-time/guidelines/) · guideline · Applies relative time to recent events in context and uses absolute dates for exact calendar points. · “Don't use relative dates for past specific dates.”
- [ECMA-402 · Relative time formatting](https://tc39.es/ecma402/#relativetimeformat-objects) · standard · Intl.RelativeTimeFormat provides localized formatting for elapsed intervals. · “formatting of numbers, absolute and relative dates and times, durations, and lists”
- [ECMA-402 · Date and time formatting](https://tc39.es/ecma402/#datetimeformat-objects) · standard · Intl.DateTimeFormat provides locale-aware absolute date and time formatting and supports a time-zone option. · “identifier of the host environment's time zone”
- [MDN · HTML title attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/title) · guideline · An exact timestamp provided only through a title tooltip is unreliable for touch and keyboard users. · “Use of the title attribute is highly problematic for: People using touch-only devices People navigating with keyboards”

Judgement: The age at which to switch from relative to absolute time and the choice of disclosure depend on the task.

Disagreement: Primer discourages micro formats such as 2mo on mobile or in narrow spaces because they can be ambiguous and poorly read by assistive technology. The demo's 2m ago has the same abbreviation risk. GitLab generally defaults to absolute time with task-specific exceptions.

## sys-5

Claims: Request a semantic color role in components and map role values per theme. Separate roles so visual equality today does not couple later changes. Aliases are available without requiring a fixed number of token layers. On #262626, #f5f5f5 is 13.9:1 and #0f172a is 1.2:1 when rounded to one decimal. Verify text contrast for resolved foreground and background pairs in every theme.

- [IBM Carbon · Color roles and themes](https://www.carbondesignsystem.com/building-blocks/foundations/color/overview) · guideline · Carbon keeps role-based color identifiers constant and changes values across themes. · “A token is the role-based identifier that assigns a color. Unlike hex codes, tokens apply universally across themes.”
- [Adobe Spectrum · Design tokens](https://spectrum.adobe.com/page/design-tokens/) · guideline · Semantic tokens carry intent and can alias primitives. Component-specific tokens are optional when reusable roles suffice. · “They communicate intent and context, making design decisions easier to understand, reuse, and maintain over time.”
- [Design Tokens Community Group · Aliases and references](https://www.designtokens.org/tr/2025.10/format/#aliases-references) · standard · The format supports separate token names and references for the same current value. · “A design token's value can be a reference to another token. The same value can have multiple names or aliases.”
- [WCAG 2.2 · Contrast (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) · standard · Defines the text contrast threshold and explains its application to foreground and background luminance. The demo ratios were computed separately. · “The visual presentation of text and images of text has a contrast ratio of at least 4.5:1, except for the following:”

Judgement: Role names and token layer count depend on the system. Demo colors are illustrative; relative-luminance math gives 13.881 and 1.180 before display rounding.

## sys-6

Claims: Offer immediate Undo for recoverable removal and make it reachable by keyboard. Keep an accessible recovery route after a transient notice vanishes. Define retention and restore the intended state on the service. Ask for confirmation or review when a consequential action cannot reliably be undone.

- [WCAG 2.2 · Error prevention (legal, financial, data)](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html) · standard · For covered actions WCAG permits reversibility, checking, or confirmation. Recovering deleted data is a sufficient technique. · “Provide ways for users to confirm, correct, or reverse important submissions.”
- [W3C WAI · Recover deleted information](https://www.w3.org/WAI/WCAG22/Techniques/general/G99) · standard · Retaining server-side data lets users recover it later, for example through a Trash folder. · “During this time period, the user can request that the data be restored or can retrieve it from the holding area.”
- [WCAG 2.2 · Timing adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html) · standard · A transient Undo notice may time out if another accessible, untimed route to recovery is available. · “Content that operates on a timer does not need to be time adjustable if there is an alternative that does not rely on a timer.”
- [NN/g · Confirmation dialogs](https://www.nngroup.com/articles/confirmation-dialog/) · practice · Reserve interruption for serious actions and consider confirmation for irreversible operations. · “In particular, consider a confirmation dialog before actions that cannot be undone.”
- [Flutter · Display a snackbar](https://docs.flutter.dev/cookbook/design/snackbars) · practice · Place an immediate Undo option alongside short-lived feedback after removal. · “if the user accidentally deletes a message, an action in the SnackBar could allow recovering the message.”
- [Apple Support · Delete files and folders on Mac](https://support.apple.com/guide/mac-help/delete-files-and-folders-on-mac-mchlp1093/mac) · guideline · Finder provides a durable, discoverable Put Back action if the item is still in Trash. · “Drag the item out of the Trash, or select the item, then choose File > Put Back.”

Judgement: Trash is an example recovery mechanism. The retention interval and what happens to restored access or metadata depend on the product.

Disagreement: WCAG 3.3.4 allows reversibility, checking, or review and confirmation for covered actions. It does not prescribe a confirmation dialog for every irreversible action.

## sys-7

Claims: Show the current stage and upcoming work in a long, predictable sequence. Keep a fixed denominator only when the number of steps is reliable. Prefer stage names when branching can change the number of screens. Preserve entered data when people go back or review an earlier step.

- [USWDS · Step indicators](https://designsystem.digital.gov/components/step-indicator/) · guideline · The component is intended for linear flows. Choose another approach if the count depends on answers. · “Long forms with conditional logic. Consider another approach if the number of steps might change due to user input.”
- [GOV.UK · Question pages](https://design-system.service.gov.uk/patterns/question-pages/) · guideline · Test whether progress is useful and include a numeric total only if it is reliable. · “Only include the total number of questions if you can do so reliably.”
- [W3C WAI · Multi-page forms](https://www.w3.org/WAI/tutorials/forms/multi-page/) · guideline · Known totals aid orientation. The guide also recommends preserving entered data when earlier steps can be reviewed. · “If a form has a known number of steps to be completed, a step-by-step indicator can help users orient themselves.”
- [Baymard · Progress indicators for UI/UX](https://baymard.com/blog/progress-indicator-ui-ux) · practice · A progress indicator can communicate where users are and how much work remains in a multi-step process. · “It often shows how many steps remain, so users know what to expect and how far they've come.”

Judgement: Choosing named stages for branching flows is an Axiom default. The appropriate granularity and whether to show a progress cue at all depend on usability testing.

Disagreement: W3C's multi-page forms tutorial also offers approximate progress for branching surveys, including “Step 1 of circa 7”. GOV.UK starts by testing forms without an indicator and adds one when research justifies it.

## sys-8

Claims: Make the whole task operable by keyboard, with WCAG's exception for intrinsically path-dependent input. Prefer native controls and their built-in platform behavior. Tab moves among stops, and arrows typically move within a composite control. Focus order should make sense and focus should be visible. Contain Tab in a modal, dismiss on Escape, and return focus to the invoking control or a logical successor.

- [WCAG 2.2 · Keyboard access](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) · standard · Sets the keyboard operability requirement and describes its path-dependent input exception. · “All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes”
- [WAI-ARIA APG · Keyboard interface practices](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/) · guideline · Documents Tab between components, arrows inside composites, meaningful focus order and visible focus. · “After pressing the Tab key moves focus to a radio button in the group, pressing arrow keys moves focus among the radio buttons”
- [WAI-ARIA APG · Modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) · guideline · Specifies Escape to close, limits Tab to the open modal and describes when focus returns to the opener. · “Escape: Closes the dialog.”
- [W3C WAI · Using HTML controls and links](https://www.w3.org/WAI/WCAG22/Techniques/html/H91) · standard · Native HTML controls and links supply keyboard behavior through the browser. · “User agents provide the keyboard operation of HTML form controls and links.”
- [WAI-ARIA APG · Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/) · guideline · Both Enter and Space activate the standard button widget. · “Space: Activates the button. Enter: Activates the button.”
- [web.dev · Keyboard focus](https://web.dev/learn/accessibility/focus) · practice · Keep focus order logical and give keyboard users a visible focus indicator. · “The default focus order must be logical, intuitive, and match the visual order of a page.”

Judgement: The illustrated key sequence depends on the actual widget and the appropriate focus destination after dismissal.

## sys-9

Claims: Show pending intent immediately for suitable low-risk, reversible actions, then reconcile against the service. Track confirmed data separately from the optimistic UI. Keep the latest intent intact across rapid reversals, retries and late or superseded responses. After a failed save, show the effective state and an explanation, with a retry when useful.

- [React · Optimistic updates and error recovery](https://react.dev/reference/react/useOptimistic) · practice · Shows how to report a failed action while returning the UI to the confirmed value. · “This example shows how to display an error message when a delete fails, and the UI automatically rolls back to show the item again.”
- [TanStack Query · Optimistic updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates) · practice · Documents rollback, retries, rendering pending intent, and avoiding stale fetches that would overwrite it. · “In most cases, it is most useful to pass a rollback function.”
- [Apollo GraphQL · Optimistic mutation results](https://www.apollographql.com/docs/react/performance/optimistic-ui) · practice · Keep optimistic state separate from confirmed cached data, and skip prediction when appropriate. · “Instead, it stores a separate, optimistic version of the object.”
- [React · Out-of-order transition updates](https://react.dev/reference/react/useTransition) · practice · Repeated updates can complete out of order. The page discusses handling ordering when building custom actions. · “When updating the quantity multiple times, it’s possible for the previous requests to finish after later requests causing the quantity to update out of order.”
- [Simon Hearne · Optimistic UI patterns](https://simonhearne.com/2021/optimistic-ui-patterns/) · practice · Demonstrates immediate feedback before the network and discusses retrying a failed favorite action. · “Optimistic UI patterns decouple user feedback from the network.”

Judgement: How low a risk is acceptable, when to retry, and whether to coalesce or serialize rapid changes depend on the action and backend contract.

## sys-10

Claims: Keep still-usable parts of a page when a component or request fails and explain which information is missing. Offer a scoped retry or a usable alternative when possible. Ensure retrying a state-changing request will not duplicate work. Reserve media dimensions and provide an appropriate textual alternative for informative images. Decorative imagery can use empty alt. Show an unavailable required value explicitly rather than presenting a blank or zero.

- [Cloudscape · Errors](https://cloudscape.design/patterns/general/errors/) · guideline · Place the error in the affected component and offer context-appropriate recovery options. · “Show an error alert where a component failed to render.”
- [React · Error boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) · practice · A boundary can replace just the failing part of the interface with a fallback message. · “An Error Boundary is a special component that lets you display some fallback UI instead of the part that crashed”
- [W3C WAI · Choosing image alternatives](https://www.w3.org/WAI/tutorials/images/decision-tree/) · guideline · Informative images need a meaningful equivalent, while decorative images can use an empty alt attribute. · “Use a brief description of the image in a way that conveys that meaning in the alt attribute.”
- [Stripe · Idempotent requests](https://docs.stripe.com/api/idempotent_requests) · practice · An API designed for idempotency supports safe retries without duplicate operations. · “The API supports idempotency for safely retrying requests without accidentally performing the same operation twice.”
- [web.dev · Optimize Cumulative Layout Shift](https://web.dev/articles/optimize-cls) · practice · Reserve media dimensions to stabilize surrounding context while media loads or a fallback is shown. · “Always include width and height size attributes on your images and video elements.”

Judgement: The placeholder and the distinction between an unavailable invoice total and zero are product examples. The appropriate fallback depends on the missing content's role.

## sys-11

Claims: Test the main task at 320 CSS px or at 400% zoom starting from a 1280 CSS px viewport. For vertically scrolling content, avoid requiring sideways reading or hiding content and actions to suppress overflow. Keep genuinely two-dimensional exceptions such as maps or data tables in a separately accessible scroll area. Code only qualifies when the usage or meaning requires it. Prefer intrinsic layout changes and content-driven breakpoints. Preserve text resizing and zoom.

- [WCAG 2.2 · Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) · standard · Defines the 320 CSS px viewport, 400% equivalent, and exception for content that needs two-dimensional layout. · “320 CSS pixels is equivalent to a starting viewport width of 1280 CSS pixels wide at 400% zoom.”
- [W3C WAI · Using grid CSS to reflow columns](https://www.w3.org/WAI/WCAG22/Techniques/css/C32) · standard · Provides an adaptive grid technique and a regression check for content and function at narrow widths. · “For content read horizontally, check that all content and functionality is available without horizontal scrolling.”
- [MDN · CSS overflow](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow) · guideline · Some browsers require a focusable scroll region. Give a focused region a name and role when needed. · “To ensure all keyboard-only users can scroll the container, enable the element to receive focus by setting tabindex="0" on the container.”
- [WCAG 2.2 · Resize text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) · standard · Separately requires text enlargement to 200% without loss of content or functionality. · “text can be resized without assistive technology up to 200 percent without loss of content or functionality.”
- [web.dev · Media queries](https://web.dev/learn/design/media-queries) · practice · Add a breakpoint when the content needs it. · “Choose breakpoints based on the content”

Judgement: 512 px is the demo's deliberate failing minimum width. A single-column layout is one possible solution.

Disagreement: WCAG permits layouts with multiple columns where content fits and can be read without two-dimensional scrolling. A two-dimensional exception depends on usage or meaning. Its code example is a side-by-side comparison.

## sys-13

Claims: List the properties intended to animate and set duration and easing for the state change. A broad transition can interpolate unrelated eligible computed-value changes, such as an explicit width change. An intrinsic size change after a font swap does not by itself establish changed computed width values. Test unrelated layout and theme changes and respect reduced motion.

- [CSS Transitions · Selecting properties to transition](https://www.w3.org/TR/css-transitions-1/#transition-property-property) · standard · The property allows an explicit list; all matches every eligible property. · “the keyword all which indicates that all properties are to be transitioned”
- [CSS Transitions · Starting a transition](https://www.w3.org/TR/css-transitions-1/#starting) · standard · The start conditions require changed computed values and a transitionable value pair. · “the values for the property are transitionable”
- [web.dev · High-performance CSS animations](https://web.dev/articles/animations-guide) · practice · An accidental layout or paint transition can incur additional rendering cost. · “Avoid any property that triggers layout or paint unless it's absolutely necessary.”
- [WCAG 2.2 · Animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) · standard · The AAA criterion calls for a way to disable nonessential interaction-triggered motion. · “Motion animation triggered by interaction can be disabled, unless the animation is essential to the functionality or the information being conveyed.”

Judgement: 150 ms, ease-out, and the chosen properties are example values. Whether any layout transition is intended depends on the interaction.

## sys-15

Claims: Back from a result detail should restore the same query, filters, sort and scroll context with the opened item in view. Put shareable query, filters, sort and page in the URL so refreshes and copied links recreate the logical list view. Keep scroll position in session history or local state, restore after rows exist and avoid a transient empty list on Back. The deep dive recommends replacing history for filter edits so a second Back leaves the list.

- [Baymard Institute · Return users to the same place in the list](https://baymard.com/research-articles/return-same-place) · research · Observed users lose their place and re-scan when Back returns to the top of a product list. · “users are returned to the same place in the product list as they were originally”
- [Baymard Institute · Back button expectations](https://baymard.com/research-articles/back-button-expectations) · research · In ecommerce testing, discrete filter and sort changes are perceived as separate views and may need separate Back steps. · “Tapping “Back” after applying filters should begin removing the applied filters.”
- [Next.js · Adding search and pagination](https://nextjs.org/learn/dashboard-app/adding-search-and-pagination) · practice · Query parameters make search and filters shareable and bookmarkable. The tutorial uses replace for live search edits. · “users can bookmark the current state of the application, including their search queries and filters, for future reference or sharing.”
- [WHATWG HTML · The History interface](https://html.spec.whatwg.org/multipage/nav-history-apis.html#the-history-interface) · standard · The browser exposes session history replacement and scroll restoration. Replacement overwrites the current entry. · “Corresponds to calls to navigate where the history handling behavior ends up as "replace", or to history.replaceState().”
- [MDN · History.scrollRestoration](https://developer.mozilla.org/en-US/docs/Web/API/History/scrollRestoration) · guideline · Native history traversal can restore the scroll position automatically or hand that responsibility to the app. · “The scrollRestoration property of the History interface allows web applications to explicitly set default scroll restoration behavior on history navigation.”
- [web.dev · Back/forward cache](https://web.dev/articles/bfcache) · practice · Eligible document history navigation can return from an in-memory snapshot. App-level caching is a separate implementation choice. · “Loading the previous page is essentially instant, because the entire page can be restored from memory”

Judgement: Keeping scroll and expanded rows outside the shareable URL is a product choice. Copying the URL restores the logical list, so the rule's “same view” is best read as excluding exact scroll position.

Disagreement: Baymard's tests of product lists recommend traversing committed filter and sort states with Back. This conflicts with the deep dive's blanket replaceState recommendation. Next.js demonstrates replacement for live search input, where an entry per keystroke can be undesirable.

## sys-16

Claims: Timed success feedback is suitable when the result remains discoverable through an untimed route. Keep an error or the only Undo or Retry visible until the user acts or dismisses it. Pause any dismissal timer while hovered, focused or hidden. The deep dive proposes resetting the full duration when the person returns. Announce status through an accessible live region and make actions keyboard reachable.

- [IBM Carbon · Notification dismissal](https://www.carbondesignsystem.com/building-blocks/core/components/notification/guidelines) · guideline · Inline notices persist, and actionable notifications have persistence guidance. Timed toasts need an alternative place to access the message or destination. · “Actionable notifications persist until a user dismisses them.”
- [WCAG 2.2 · Timing adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html) · standard · A notification can disappear if there is an untimed alternative. Otherwise an applicable time limit needs an adjustment, extension or exception. · “Content that operates on a timer does not need to be time adjustable if there is an alternative that does not rely on a timer.”
- [Radix Primitives · Toast](https://www.radix-ui.com/primitives/docs/components/toast) · practice · Demonstrates pausing dismissal on hover, keyboard focus and window blur. Timed actions should be safe to ignore. · “Pauses closing on hover, focus and window blur.”
- [Sonner · Toast timer behavior](https://github.com/emilkowalski/sonner/blob/v2.0.7/src/index.tsx) · practice · A production toast library explicitly checks for a hidden document before allowing its dismissal timer to run. · “if (expanded || interacting || isDocumentHidden) {”
- [MDN · Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API) · guideline · Detect whether the document is actually hidden and apply timer policy based on its visibility. · “Fired when the content of a tab has become visible or has been hidden.”
- [WCAG 2.2 · Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) · standard · Announce status through semantic roles or properties without moving focus. · “they can be presented to the user by assistive technologies without receiving focus.”

Judgement: Restarting the full duration and keeping every error until dismissal are Axiom defaults. WCAG allows an untimed alternative or an acceptable timing adjustment.

Disagreement: Radix treats a toast action as safe to ignore and models required responses separately. Radix and Sonner resume the remaining duration after a pause, which differs from the proposed full restart. Carbon also allows some timed toasts if the content or action is available elsewhere.

## a11y-1

Claims: Provide a visible keyboard focus indicator. Keep the browser outline or supply a discernible replacement. Check author-styled focus against adjacent surfaces and in forced colors. A box-shadow-only ring can disappear. WCAG 2.4.11 at AA checks that author-created content does not entirely hide the focused component. :focus-visible uses browser heuristics. A text field can show focus after pointer input. The example uses a 2px outline and 2px offset. WCAG 2.4.13 separately sets an AAA indicator area and contrast test.

- [WCAG 2.2 · Focus visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) · standard · SC 2.4.7 at AA requires a visible focus indicator in a keyboard-operable mode. · “Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.”
- [WCAG 2.2 · Focus not obscured (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) · standard · SC 2.4.11 at AA concerns the focused component itself and author-created obstructions such as sticky regions. · “When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content.”
- [WCAG technique C40 · Two-color focus indicator](https://www.w3.org/WAI/WCAG22/Techniques/css/C40.html) · standard · Covers non-text contrast for an author-created ring and the forced-colors failure mode of using a shadow by itself. · “User agents commonly suppress the box-shadow property in forced-color modes, so authors should avoid relying on box-shadow alone to implement focus indicators.”
- [WCAG 2.2 · Focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html) · standard · SC 2.4.13 at AAA uses an area at least equivalent to a 2 CSS px perimeter and 3:1 change at the same pixels, with exceptions. · “is at least as large as the area of a 2 CSS pixel thick perimeter of the unfocused component or sub-component, and”
- [MDN · :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible) · guideline · Explains the browser heuristic and why a pointer-focused text box can still show a focus ring. · “but when a text box needing user input has focus, focus is indicated.”
- [GOV.UK · Focus state styles](https://design-system.service.gov.uk/get-started/focus-states/) · guideline · Shows a custom treatment designed to remain visible across both dark and light surfaces. · “The yellow has a high contrast with dark backgrounds and the thick black border has a high contrast against light backgrounds.”

Judgement: The example’s 2px offset is a styling choice. The outline recipe still needs checking on the surfaces where it appears.

## a11y-2

Claims: Use a visual cue such as text, shape or pattern when hue communicates an error, state or category. Identify the field with an automatically detected error and describe the problem in text. Associate the error message with its field so the explanation is available to assistive technology. An error icon can supplement the message. A red border alone does not explain the error.

- [WCAG 2.2 · Use of color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) · standard · SC 1.4.1 requires a visible alternative where meaning depends on recognizing or distinguishing hue. · “Use information in addition to color, such as shape or text, to convey meaning.”
- [WCAG 2.2 · Error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html) · standard · SC 3.3.1 requires identifying the item in error and describing the automatically detected error in text. · “If an input error is automatically detected, the item that is in error is identified and the error is described to the user in text.”
- [Adobe Spectrum · Color](https://spectrum.adobe.com/foundations/color/color) · guideline · Shows the rule’s example pattern: an error icon and explanatory text accompanying a red field border. · “For every usage of color as a feedback method, there should be an accompanying label and/or icon to communicate meaning.”
- [GOV.UK · Error message](https://design-system.service.gov.uk/components/error-message/) · guideline · Recommends actionable error text and demonstrates associating it with the relevant input through aria-describedby. · “In the error message explain what went wrong and how to fix it.”

Judgement: The red text and error icon are example choices. The message and an accessible association with the field carry the error information.

## a11y-3

Claims: Space competing touch targets when an unintended tap would be costly. Measure the actual hit areas. In the 84 × 44px button preview, a tap 3px past Cancel lands in the 8px gutter. With no gutter it lands on Delete. WCAG 2.5.8 at AA generally uses a 24 × 24 CSS px target minimum. Its spacing exception checks an undersized target’s centered 24px-diameter circle against nearby targets and corresponding circles. Test the gap for the layout, device and cost of an error. The demo gap is specific to the illustrated hit-test geometry.

- [WCAG 2.2 · Target spacing](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html#spacing) · standard · Defines the 24 × 24 CSS px minimum and the geometric spacing exception for undersized targets. · “The size of the target for pointer inputs is at least 24 by 24 CSS pixels, except when:”
- [ACM ISS · Smartphone touch target spacing](https://drive.google.com/file/d/1nvJ07S8YpaX2OnNJKyVXICGNAWATfWGt/view) · research · Four experiments found that wider gaps tended to reduce unintended taps. The crowd studies found no gap that eliminated distractor effects. This is the author’s paper copy. · “wider gaps tend to help users reduce the task completion time and the rate of accidental taps on unintended items.”
- [ACM MobileHCI · Touch spacing and costly mis-taps](https://drive.google.com/file/d/1g-9XAbrr-qjCXXY-et_-udp4mDCT43ac/view) · research · Experiments with a simulated recovery penalty distinguish the cost of a miss in blank space from tapping an adjacent action. This is the author’s paper copy. · “tapping an empty space (background between distractor and target) carries little risk because users only have to retry tapping the intended target.”
- [Apple HIG · Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility#Mobility) · guideline · Recommends padding between touch controls to reduce wrong activations. · “Include enough padding between elements to reduce the chance that someone taps the wrong control.”
- [web.dev · Accessible tap targets](https://web.dev/articles/accessible-tap-targets) · practice · Offers about 8px as a web design heuristic and explains measuring expanded hit areas in DevTools. · “Touch targets should also be spaced about 8 pixels apart, horizontally and vertically”

Judgement: Axiom chose the 8px gutter and the 3px test miss for this scene. web.dev independently suggests about 8px as a heuristic. The preview and its specific result come from the demo geometry.

## a11y-4

Claims: Provide an equivalent single-pointer action without dragging for author-implemented drag functionality, with exceptions for essential drags and unmodified user-agent behavior. One or more clicks or taps can operate ordering controls, a board destination menu or an alternative slider control. Both input paths should reach the same order, destination or value. Verify keyboard operation separately.

- [WCAG 2.2 · Dragging movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) · standard · SC 2.5.7 at AA defines both exceptions, gives list, board and slider examples, and distinguishes keyboard access. · “single pointer without dragging, unless dragging is essential or the functionality is determined by the user agent and not modified by the author.”
- [WCAG technique G219 · Alternatives to dragging](https://www.w3.org/WAI/WCAG22/Techniques/general/G219) · standard · Gives stepwise arrow controls and destination menus as equivalent single-pointer patterns, including sequences of taps. · “a single tap or click can reveal controls (arrows) to move a target in a stepwise fashion”
- [WCAG 2.2 · Pointer gestures](https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html) · standard · Distinguishes path-based gestures and allows one when the path is essential to the function. · “unless a multipoint or path-based gesture is essential.”
- [Atlassian · Accessible drag and drop](https://atlassian.design/components/pragmatic-drag-and-drop/accessibility-guidelines) · guideline · Shows how a draggable element can expose equivalent outcomes in a button-triggered action menu. · “Draggable entities should have a button that can be used to trigger an inline menu containing outcomes.”
- [Apple HIG · Drag and drop](https://developer.apple.com/design/human-interface-guidelines/drag-and-drop) · guideline · Recommends non-drag alternatives and gives menu commands for moving items. · “Offer alternative ways to accomplish drag-and-drop actions.”

Judgement: The rule’s choice of directly visible Move up and Move down controls suits the short sample list. Equivalent controls can also sit in a menu.

Disagreement: The rule addresses author-implemented dragging. SC 2.5.7 exempts essential dragging and unmodified user-agent behavior. Its Understanding document distinguishes an essential drawn path from a generic drag because the path itself is covered by the separate Pointer Gestures criterion where applicable.

## a11y-5

Claims: Choose heading ranks to express the actual nesting of sections and subsections, such as h1, h2, h3. Use native heading elements where possible. Keep the visual text style independent from rank. Open a subsection one rank deeper. Returning to a shallower rank can close one or more nested sections. Screen reader users can navigate by headings and use ranks to understand section hierarchy.

- [W3C WAI · Headings](https://www.w3.org/WAI/tutorials/page-structure/headings/) · guideline · Explains heading navigation and rank nesting, including why returning to a shallower rank can close subsections. · “Skipping heading ranks can be confusing and should be avoided where possible”
- [WCAG 2.2 · Info and relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) · standard · SC 1.3.1 at A requires making structural relationships available programmatically or in text, with heading markup as a technique. · “Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text.”
- [Scottish Government Design System · Typography](https://designsystem.gov.scot/styles/typography) · guideline · Demonstrates styling an h2 at the h3 size while preserving the correct semantic hierarchy. · “They allow you to make any heading HTML element have the appearance of any other heading level.”
- [WebAIM · Screen Reader User Survey #11](https://webaim.org/projects/screenreadersurvey11/#heading) · research · Reports how useful respondents found heading levels when navigating by headings. The survey used an uncontrolled sample. · “88.3% of respondents find heading levels very or somewhat useful.”

## a11y-6

Claims: WCAG 2.2.2 requires a pause, stop or hide mechanism for nonessential movement, blinking or scrolling that starts automatically, lasts over five seconds and appears alongside other content. The separate auto-updating clause applies alongside other content at any interval unless essential. Adjusting update frequency is an allowed option. Provide an obvious, keyboard-operable rotation control. An explicit pause should hold the current quote after focus leaves, until the reader resumes it. The demo’s four-second changing testimonial illustrates automatic updating.

- [WCAG 2.2 · Pause, stop, hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) · standard · SC 2.2.2 at A distinguishes the five-second motion threshold from auto-updates and describes a pause that persists when focus leaves. · “pause, stop, or hide it or to control the frequency of the update”
- [WAI-ARIA APG · Carousel pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/) · guideline · Calls for a rotation control and explicit user action to resume once keyboard focus has stopped rotation. · “It does not restart unless the user explicitly requests it to do so.”
- [Baymard · Homepage carousels](https://baymard.com/research-articles/homepage-carousel) · research · Usability testing illustrates the problem with changing slides before someone finishes reading and supports prominent controls. · “participants who viewed content in an autorotating carousel were often distressed that the slide changed before they had finished taking it in.”
- [W3C WAI · Carousel animation controls](https://www.w3.org/WAI/tutorials/carousels/animations/#add-playstop-button) · guideline · Shows a keyboard-operable button that stops and resumes animation and updates its label to reflect its action. · “Provide a button to allow users to stop and resume animation.”

Judgement: Four seconds is the demo’s update interval. The exact interval is a product choice governed by the same automatic-update clause.

Disagreement: The older WAI carousel tutorial’s focusout snippet restarts a carousel that was temporarily stopped on focus. The APG advises requiring an explicit restart after keyboard focus stops rotation. Both recommend providing a separate user-operated rotation control.

## a11y-7

Claims: Keep a persistent underline on inline links so readers can find them before interacting, including on visited links. Navigation links can be recognizable from their position and surrounding layout. The G183 alternative uses at least 3:1 contrast against surrounding text. Text-to-background contrast remains a separate check. Where color alone marks an inline link, the deep dive applies G183 as 3:1 contrast with the surrounding text at rest, which is the current technique’s test.

- [WCAG failure F73 · Links identified by color alone](https://www.w3.org/WAI/WCAG22/Techniques/failures/F73) · standard · Explains why hue alone can fail for links embedded in prose and why links in an identifiable navigation area can differ. · “Removing the underline and leaving only the color difference for such links would be a failure”
- [GOV.UK · Links](https://design-system.service.gov.uk/styles/links/) · guideline · Uses underlines by default and allows omitting them when the context already identifies a link. · “Only do this if the context tells the user that the text is a link, even without the underline.”
- [WCAG technique G183 · Contrast with surrounding text](https://www.w3.org/WAI/WCAG22/Techniques/general/G183) · standard · Current sufficient technique tests 3:1 against surrounding non-link text and separately explains text-to-background contrast. · “Check that the color of the link text has a contrast ratio of at least 3:1 against the color of the surrounding non-link text.”
- [Ontario Design System · Links](https://designsystem.ontario.ca/components/detail/links.html) · guideline · Explicitly distinguishes body text links, which are underlined, from major navigation panels, which generally omit underlines. · “Generally, do not underline links when they are in big navigation panels such as:”
- [NN/g · Visualizing links](https://www.nngroup.com/articles/guidelines-for-visualizing-links/) · practice · The current editorial note describes an alternative based on contrast and additional interaction-state indicators. · “Most users today can identify links through color, placement, and context without relying on underlines”

Judgement: Persistent underlining is Axiom’s preferred default for running text. GOV.UK and Ontario adopt it, and WCAG also allows other visually discernible treatments.

Disagreement: G183, updated July 27, 2026, now tests 3:1 contrast with surrounding text alone. Earlier versions also required a non-color cue on hover and focus; the deep dive follows the current test. NN/g’s current editorial note also treats the older underline guidance as a starting point and describes using cues on hover and focus.

## a11y-8

Claims: On modal dialog dismissal, including Escape, normally restore keyboard focus to the invoking control. If the opener disappears, choose a logical place to continue, such as a neighboring row action or a stable list control. Use a dialog or focus primitive’s restoration support where available. Check Escape, Cancel and Save for consistent focus placement.

- [WAI-ARIA APG · Modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) · guideline · Specifies Escape and the default focus return, with exceptions for a missing opener or a more logical next workflow step. · “When a dialog closes, focus returns to the element that invoked the dialog unless either:”
- [WCAG 2.2 · Focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) · standard · An SC 2.4.3 example shows a modal returning focus to the button or its next item in the tab order. · “When the dialog is dismissed, focus returns to the button or the element following the button.”
- [SAP · Focus restore](https://sap.github.io/accessibility-design-tools/doc/Accessibility_Design_Tools_Second_Edition.pdf#page=121) · guideline · Shows returning to the Edit opener after a dialog and choosing a neighboring element after a row is deleted. · “When an interaction is completed, such as dismissing a dialog, popover, or overlay, focus should return to the element that originally triggered the interaction.”
- [Adobe React Aria · FocusScope](https://react-aria.adobe.com/FocusScope) · guideline · Demonstrates a focus primitive that returns focus to the previously focused element when it unmounts. · “restore focus back to the previously focused element when the focus scope unmounts”
- [WHATWG HTML · Hiding a popover](https://html.spec.whatwg.org/multipage/popover.html#hide-popover-algorithm) · standard · Native popovers can restore the previously focused element when closing. Restoration requires the appropriate flag and focus still inside the popover. · “run the focusing steps for previouslyFocusedElement”

Judgement: The exact fallback reflects the workflow. A neighboring row action and New project are examples for this list.

Disagreement: The APG allows focus to continue to a better next step even if the opener still exists, such as focusing the first newly added row. The HTML popover algorithm can leave focus where it already moved outside the popover, so unconditional opener restoration is too broad for all overlays.

## motion-1

Claims: Review a high-frequency action in a repeated, realistic sequence that includes the next input. Shorten or omit an entrance when repeated use makes it delay input or obscure readable results. Make the palette ready to type into while it settles. A shorter fade alone cannot fix late focus. The example gives an occasional modal and a frequently opened palette the same 220 ms entrance to illustrate the effect of repetition.

- [Apple HIG · Motion](https://developer.apple.com/design/human-interface-guidelines/motion) · guideline · Explicitly advises against gating further actions on animation completion, especially when the animation repeats. · “don’t make people wait for an animation to complete before they can do anything”
- [Emil Kowalski · You Don’t Need Animations](https://emilkowal.ski/ui/you-dont-need-animations) · practice · Uses a frequently opened keyboard launcher to argue for an instant entrance. · “If it animated every time I opened it, it would be very annoying.”
- [NN/g · Animation for attention and comprehension](https://www.nngroup.com/articles/animation-usability/) · practice · Uses observed site examples to explain why animations that gate content on repeat visits lengthen tasks. · “Animations that are repeatedly encountered are roadblocks to content and lengthen the amount of time to complete a task.”
- [IBM Carbon · Motion principles and timing](https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview) · guideline · Reserves expressive motion for occasional, important moments and uses more restrained productive motion in routine tasks. · “Reserve expressive motion for occasional, important moments”
- [IJHCS · User perception of animation fluency](https://ir.psych.ac.cn/bitstream/311026/47151/1/User%20perception%20of%20animation%20fluency_%20The%20effect%20of%20time%20duration%20in%20different%20phases%20of%20animated%20transitions%20during%20application%20usage.pdf) · research · Ge et al. distinguish response delay, animation duration and completion time in smartphone tasks. Their results do not establish a command-palette duration. · “the CD and DL had a significant effect on perceived fluency”
- [web.dev · Interaction latency and presentation delay](https://web.dev/articles/optimize-inp) · practice · Distinguishes time to display a responding frame from the full duration of a decorative transition. INP is not a measure of palette readiness. · “the time it takes for the browser to present the next frame which contains the visual result of the interaction.”

Judgement: 220 ms and the choice of an occasional modal versus a heavily repeated palette are illustration settings. The replay tally sums nominal animation duration and cannot establish elapsed user input latency.

Disagreement: Kowalski recommends omitting animation for keyboard-initiated actions altogether. Axiom permits a short entrance if it leaves input and results ready.

## motion-2

Claims: Focus the command palette’s query field on shortcut open so the next keystroke reaches it while the panel is still moving. A keystroke before the focus transfer can reach the previously focused element and produce a different query. Keep both the field and focus indicator usable during entry. Escape must dismiss and restore focus appropriately during entry as well. The current comparison simulates focus at 0 ms vs 180 ms and typing at 90 ms, with a shared 180 ms entrance.

- [WAI-ARIA APG · Modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) · guideline · Moves focus into the modal on opening, handles Escape and generally restores focus to the invoker. The initial target depends on the dialog’s task. · “When a dialog opens, focus moves to an element inside the dialog.”
- [WHATWG HTML · Focus](https://html.spec.whatwg.org/multipage/interaction.html#focus) · standard · Defines where keyboard events are routed, explaining how deferred focus can send the first keystroke elsewhere. · “Keyboard events are always targeted at this focused element.”
- [Apple HIG · Motion](https://developer.apple.com/design/human-interface-guidelines/motion) · guideline · Supports accepting immediate keyboard input while any remaining entrance animation plays. · “don’t make people wait for an animation to complete before they can do anything”
- [WCAG 2.2 · Focus visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) · standard · Supports a visible keyboard focus cue for the query input. · “Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.”
- [Emil Kowalski · You Don’t Need Animations](https://emilkowal.ski/ui/you-dont-need-animations) · practice · Uses keyboard-driven actions to argue for removing the entrance delay entirely. · “The same goes for keyboard-initiated actions.”

Judgement: The 0/180 ms focus cues and 90 ms scripted typing are demonstration values. The current showcase uses an inert, read-only input and scripted tracks, so it cannot verify real keyboard delivery.

Disagreement: Kowalski advises against animation on any keyboard-initiated action. Axiom permits an entrance if focus, input and visibility are ready immediately.

Dropped: https://web.dev/articles/optimize-inp (Weak for this rule. It measures responsiveness through the next paint and does not address initial focus or event routing.)

## motion-3

Claims: Use motion to communicate origin, destination, continuity, a state change or confirmation of success. Match an edge drawer’s motion to its placement and reserve more expressive motion for occasions that warrant attention. A routine dialog bounce adds a second movement whose purpose should be judged in context. Make essential feedback understandable in the resting state when motion is reduced.

- [IBM Carbon · Motion principles and timing](https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview) · guideline · Distinguishes productive motion for routine interaction from expressive motion for significant events. · “Reserve expressive motion for occasional, important moments”
- [Atlassian Design · Applying motion](https://atlassian.design/foundations/motion/applying-motion) · guideline · Prescribes a plausible origin and return direction for linked panels and dropdowns. · “A Dropdown should open from its trigger”
- [Apple HIG · Motion](https://developer.apple.com/design/human-interface-guidelines/motion) · guideline · Gives an example of brief confirmation motion and advises communicating important information through additional cues. · “avoid using it as the only way to communicate important information.”
- [NN/g · The role of animation and motion in UX](https://www.nngroup.com/articles/animation-purpose-ux/) · practice · Discusses motion as lightweight feedback and as a spatial cue that can orient users during overlays and changes of state. · “motion and animation can be helpful and communicative, if used with restraint.”
- [IEEE TVCG · Animated transitions in statistical data graphics](https://idl.uw.edu/papers/animated-transitions) · research · Heer and Robertson found a benefit for correctly designed transitions in chart perception. This is evidence for continuity in chart transformations rather than a dialog comparison. · “animated transitions can significantly improve graphical perception.”
- [WCAG 2.2 · Animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) · standard · Supports a reduced-motion path for nonessential responses, with an exception for motion essential to functionality or information. · “Motion animation triggered by interaction can be disabled”

Judgement: The drawer-versus-bouncing-dialog example changes surface, geometry and motion together. The judgement that this particular routine dialog gains nothing from bounce requires evaluating what the motion communicates.

## motion-4

Claims: At the same distance and duration, the easing curve changes how much travel occurs early. Use stronger ease-out for an entrance that should approach its resting position early. Inspect larger moves for an abrupt jump. At 120 ms in the 360 ms illustration, CSS ease has advanced 57.6% and cubic-bezier(0.23, 1, 0.32, 1) has advanced 87.7%. Keep distance and duration fixed for comparison and use a shared easing token for components with the same motion role.

- [CSS Easing · Cubic Bézier curves](https://www.w3.org/TR/css-easing-1/#cubic-bezier-easing-functions) · standard · Defines the CSS ease control points and how to map input progress to output progress, enabling both percentages to be calculated. · “Input progress values serve as x values of the curve, whilst the y values are the output progress values.”
- [Emil Kowalski · Great Animations](https://emilkowal.ski/ui/great-animations) · practice · Explains why a fast start and gradual settling can make a UI response feel quick. · “It starts fast and slows down at the end”
- [IBM Carbon · Motion principles and timing](https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview) · guideline · Publishes separate entrance curves and reusable design-system easing tokens. The productive entrance uses the quoted curve. · “cubic-bezier(0, 0, 0.38, 0.9)”
- [Microsoft Fluent · Motion](https://fluent2.microsoft.design/motion) · guideline · Defines ease-out’s fast start and slower finish and ties timing to the message the movement should convey. · “start fast and then slow down.”

Judgement: The sample curve is an editorial choice for the specific travel and duration. The two progress values are mathematical results, while improved readability or perceived responsiveness at those values requires observation.

## motion-6

Claims: Use short transitions for menus and nearby controls, starting at 180 ms in the small-menu example. For the same small motion, a 500 ms transition keeps the labels moving longer. Larger changes in distance, size or context can need more time to show the relationship between states. Compare timing at normal speed and use slowed playback to find flashes and jumps. Check when the control becomes usable as well as when it settles.

- [IBM Carbon · Motion principles and timing](https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview) · guideline · Scales time by distance and size and gives 150 ms for short travel and 400 ms for large expansion as system examples. · “the larger the change in distance”
- [Atlassian Design · Applying motion](https://atlassian.design/foundations/motion/applying-motion) · guideline · Pairs this 150 ms entry token with longer tokens for larger transitions, such as 400 ms for page-level movement. · “Interactive emphasis, small entrances (e.g. Popup enter)”
- [NN/g · Executing UX animations](https://www.nngroup.com/articles/animation-duration/) · practice · Advises matching animation duration to complexity and travel, and screening long timings for sluggishness. · “depending on complexity and on how far the element is traveling.”
- [Microsoft Fluent · Motion](https://fluent2.microsoft.design/motion) · guideline · Advocates considering travel and giving larger elements more animation time. · “more time to animate than smaller elements.”
- [Chrome DevTools · Inspecting animations](https://developer.chrome.com/docs/devtools/css/animations) · practice · Documents slow playback, replay and inspecting the animation, supporting the rule’s review method. · “Slow down, replay, or inspect the source code for an animation group.”

Judgement: 180 ms is an Axiom starting point and 500 ms is a comparison for this small menu. External guidance gives different example times and does not establish either as a general cutoff.

## motion-7

Claims: Choose entrance and exit motion separately. A routine toast can arrive long enough to locate and depart quickly once dismissed. The illustrative toast runs 220 ms in and 160 ms out, compared with 360 ms in both directions. Keep a toast readable independently of its animation time and avoid holding up the next input during dismissal. A passive status toast should leave focus on the current task. If dismissal removes a focused control, move focus to a logical surviving control. A meaningful exit such as a drawer returning to its edge may need a different pace to convey where it went.

- [Atlassian Design · Applying motion](https://atlassian.design/foundations/motion/applying-motion) · guideline · Shows separate Flag entrance and exit treatment, at 250 and 200 ms, and explains why routine exits are shorter. · “Exits should be shorter, faster, and less dramatic.”
- [NN/g · Executing UX animations](https://www.nngroup.com/articles/animation-duration/) · practice · Suggests giving entering objects slightly longer than exiting ones and illustrates the asymmetry with popup timing. · “usually need a subtly longer duration than objects disappearing or exiting the screen”
- [IBM Carbon · Motion principles and timing](https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview) · guideline · Differentiates entry from the exit easing of a toaster and gives a neighboring side panel as a case for a different exit curve. · “such as closing a modal or toaster.”
- [WCAG 2.2 · Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) · standard · Supports announcing passive status changes without taking keyboard focus away from the task. · “Let assistive technology notify users about status changes that don't take focus.”
- [WAI-ARIA APG · Alert pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/) · guideline · Supports preserving focus and cautions against automatically disappearing important alerts because users need time to read them. · “It is also important to avoid designing alerts that disappear automatically.”

Judgement: 220/160 ms and 360/360 ms are demo settings. The example changes both total pace and symmetry, so it cannot isolate the benefit of using different timings. Reading time and automatic dismissal policy are separate from exit duration.

## motion-8

Claims: Give a press an immediate visible state using a small scale, fill or border change. Preserve legibility and the hit area. A scale applied to the outer button can reduce or move its hit area, so scale an inner visual surface when bounds must stay fixed. The example compares scales 0.96 and 0.90. The same percentage moves the edges farther on a larger control. Separate press feedback from action commitment and allow pointer release outside to cancel ordinary click activation.

- [Apple HIG · Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) · guideline · Recommends a custom button press state and preserving an adequate target region. · “Without a press state, a button can feel unresponsive”
- [ACM TAP · Towards the temporally perfect virtual button](https://eprints.gla.ac.uk/104653/) · research · Kaaresoja et al. experimentally link short feedback latency to perceived simultaneity and quality for touchscreen button presses. · “visual feedback latency between 30 and 85 ms”
- [CSSOM View · Hit testing transformed elements](https://www.w3.org/TR/cssom-view-1/#dom-document-elementfrompoint) · standard · The elementFromPoint algorithm tests transformed boxes. Applying the scale to the outer button can change which coordinates hit it. · “when applying the transforms that apply to the descendants of the viewport”
- [WCAG 2.2 · Pointer cancellation](https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html) · standard · Distinguishes immediate press feedback from up-event activation that allows cancellation by moving the pointer away before release. · “They normally receive visual feedback when an item is pressed.”
- [CSS Transforms · Transform geometry](https://www.w3.org/TR/css-transforms-1/) · standard · Defines uniform scaling and transformed client rectangles, from which the relative movement of small and large control edges follows. · “Transforms affect the client rectangles”
- [Adobe Spectrum · Motion](https://spectrum.adobe.com/page/motion/) · guideline · Demonstrates scale as a visible down-state cue in a button microinteraction. · “the button scales down on the down state”

Judgement: 0.96 and 0.90 are illustrative values. Readability and the perceived strength of the effect depend on the label, component dimensions and transform origin.

Disagreement: The shorthand `button:active scale(0.96)` can shrink the actual hit region if implemented literally on the interactive element. CSSOM View supports the deep dive’s inner-surface implementation.

## motion-9

Claims: For a text or control surface, start at a size close to its resting geometry. Prefer mild scale plus fade or just fade. The illustration contrasts 0.95 and zero scale with the same fade. At zero scale the panel is not rendered, and early intermediate dimensions are very small. At the same scale factor, larger panels have more pixel travel at their edges. Compare sizes and preserve the final content and focus cue in reduced-motion mode.

- [Headless UI · Popover transitions](https://headlessui.com/react/popover) · guideline · Provides a text-bearing popover example entering at 0.95 scale and zero opacity before settling at full size. · “initial={{ opacity: 0, scale: 0.95 }}”
- [CSS Transforms · Transform geometry](https://www.w3.org/TR/css-transforms-1/) · standard · Defines proportional length scaling and specifies that a non-invertible transform does not display the content, including in a zero-scale example. · “Therefore neither the div box, nor the text in it get displayed.”
- [Microsoft Fluent · Motion](https://fluent2.microsoft.design/motion) · guideline · Models a quick fade for large top-level surfaces as an option that avoids moving a large piece of UI. · “use a quick fade transition instead of moving or sliding UI elements”
- [WCAG 2.2 · Animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) · standard · Supports making interaction-triggered nonessential scaling removable while preserving the information. · “Motion animation triggered by interaction can be disabled”
- [web.dev · Web Animations API improvements](https://web.dev/blog/web-animations) · practice · Provides a contrasting instructional sample of a modal scaling from zero, illustrating that the API can do it. · “transform: scale(0);”

Judgement: 0.95 is a documented example and a reasonable comparison point, with no established universal readability threshold. Both Axiom panes also fade from zero opacity, so the preference concerns geometry once the content becomes visible.

Disagreement: The web.dev API tutorial demonstrates a modal scaling from zero. Its sample shows syntax and playback controls and supplies no readability comparison.

## motion-10

Claims: A scaling popover should grow from the edge or point facing its trigger rather than from the center. Derive that origin from final side and alignment after collision handling, including flipped and offset positioning. Check the point with off-center triggers and in right-to-left layouts. The catalog preview illustrates origin with a fixed example, not a collision.

- [Radix · Popover placement and transform origin](https://www.radix-ui.com/primitives/docs/components/popover) · guideline · Documents a computed transform-origin CSS variable that incorporates offsets, side, alignment and collision handling. · “Use it to animate the content from its computed origin based on side, sideOffset, align, alignOffset and any collisions.”
- [Atlassian Design · Applying motion](https://atlassian.design/foundations/motion/applying-motion) · guideline · Recommends opening a dropdown at the trigger to communicate its spatial relationship. · “A Dropdown should open from its trigger”
- [CSS Transforms · Transform geometry](https://www.w3.org/TR/css-transforms-1/) · standard · Defines how changing the origin changes the point about which a transform acts. · “moves the point of origin”
- [Floating UI · Flip middleware](https://floating-ui.com/docs/flip) · practice · Explains how collision handling can flip the overlay and how horizontal fallback directions change for right-to-left text. · “side axis by flipping it to the opposite side by default.”

Judgement: A trigger-facing origin is a spatial convention for scaling anchored surfaces. Off-center or point-specific alignment and the perceived value of scaling are component decisions.

## motion-11

Claims: Delay first hover so crossing the toolbar does not flash unintended tooltips. Once a tooltip appears, let nearby controls open their tips immediately. Reset the shared warmup after leaving the group and its grace period. The example uses 300 ms initial delay and 0 ms reveal delay while warm, with a 300 ms grace window and a separate 100 ms fade. Reveal the same information on keyboard focus, support Escape and let people hover the revealed tooltip where WCAG applies.

- [React Aria · Tooltip interactions and delays](https://react-aria.adobe.com/Tooltip) · guideline · Documents delayed first hover, immediate subsequent hovers, instant keyboard focus and cooldown reset. · “Once a tooltip is displayed, other tooltips display immediately.”
- [Base UI · Tooltip provider](https://base-ui.com/react/components/tooltip) · guideline · Documents using one provider to coordinate the hover warmup for adjacent tooltip triggers. · “once a tooltip becomes visible, the adjacent tooltips will be shown instantly.”
- [WCAG 2.2 · Content on hover or focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html) · standard · Defines dismissible, hoverable and persistent supplementary content and gives Escape as a tooltip example. · “the pointer can be moved over the additional content without the additional content disappearing”
- [Radix · Tooltip provider and delay](https://www.radix-ui.com/primitives/docs/components/tooltip) · guideline · Documents group-level delay controls, Escape and distinct delayed and instant states. Its defaults are 700 ms initial and 300 ms skip delay. · “Provider to control display delay globally.”
- [NN/g · Timing guidelines for exposing hidden content](https://www.nngroup.com/articles/timing-exposing-content/) · practice · Covers tooltips among hover exposures and recommends a brief pointer pause before first reveal to infer intent. · “Wait 0.3–0.5 seconds.”

Judgement: 300 ms warmup, 300 ms grace and 100 ms fade are per-demo tuning values. Zero means zero added wait, and a brief fade can still follow. The preview uses pointer-events: none on its popup and therefore does not demonstrate pointer travel onto the tooltip.

Disagreement: React Aria defaults to a 1500 ms initial delay and a 500 ms close delay and coordinates cooldown across its implementation. Radix defaults to a 700 ms initial delay and 300 ms skip window. These differ from the example’s 300 ms initial delay and do not prescribe its toolbar boundary.

## motion-12

Claims: On reversal, continue from the control’s visible interpolated position. A CSS transition starts a new movement from the current value after an ordinary state change and shortens qualifying reversals. Restarting fresh keyframes from a fixed endpoint can jump. Retaining an Animation object and reversing playback can keep the current position. The example uses 420 ms for each declared motion. Semantic state and completion callbacks must track the latest action.

- [CSS Transitions · Reversing an interrupted transition](https://www.w3.org/TR/css-transitions-1/#reversing) · standard · The transition algorithm uses the running value as its start and applies a shortening factor to qualifying reversals. · “the current value of the property in the running transition”
- [W3C · Web Animations timing and playback](https://www.w3.org/TR/web-animations-1/) · standard · Specifies reverse() on an existing Animation object by inverting playback rate and continuing playback. · “Inverts the playback rate of this animation and plays it”
- [web.dev · Web Animations API improvements](https://web.dev/blog/web-animations) · practice · Demonstrates reversing a running modal on a repeat click and retargeting an animation with a partial keyframe. · “The new start position is inferred from the current underlying position.”

Judgement: 420 ms is a showcase setting. Smoothness here means continuity of position. A transition restarts its easing for the new leg and can still change velocity abruptly.

## motion-13

Claims: CSS transitions ordinarily need a previous computed style. Provide a from-state with @starting-style for newly rendered content. Use a nested declaration in the target’s style rule or a standalone block with a selector. With equal precedence and specificity, put the starting declaration after the regular one. Keep the regular style visible when the entry is skipped or unsupported. A React effect used solely to flip a hidden base state requires lifecycle and paint coordination. Effects run on the client and are not guaranteed to run after the next paint.

- [CSS Transitions · Defining a starting style](https://www.w3.org/TR/css-transitions-2/#defining-before-change-style) · standard · Defines the missing before-change style behavior, the ordinary cascade and why the starting styles never replace the final state. · “Style rules in @starting-style do not apply to after-change style”
- [MDN · The @starting-style at-rule](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40starting-style) · guideline · Documents the nested and standalone forms and gives examples using opacity 1 in the ordinary visible state. · “They provide starting styles for elements that do not have a previous state”
- [Chrome Developers · Entry and exit animations](https://developer.chrome.com/blog/entry-exit-animations) · practice · Demonstrates declarative CSS entry for inserted rows and explains the source-order requirement for matching specificity. · “place the @starting-style rule after the non-starting-style declarations.”
- [React · When effects run](https://react.dev/reference/react/useEffect#caveats) · practice · Caveats explain variable paint timing and the fact that useEffect cannot reveal content during server rendering. · “Effects only run on the client. They don’t run during server rendering.”

Judgement: Using opacity in the example and preferring CSS over an effect for this simple entrance are implementation choices. The showcase illustrates the endpoints through WAAPI and does not itself exercise insertion or React paint timing.

## motion-14

Claims: Transforms move an element visually without reflowing its neighbors. Use transform and opacity for independent travel. Animate actual dimensions when neighboring content must move. Measure style, layout, paint and dropped frames on representative devices. Profile the scope of rapid drag updates. Unregistered custom properties inherit, so descendants may consume an ancestor write. Use will-change only if profiling shows a benefit. Remove temporary hints and account for stacking contexts.

- [web.dev · High-performance CSS animations](https://web.dev/articles/animations-guide) · practice · Prefer transform and opacity when possible. The guide covers profiling exceptions that trigger layout or paint. · “Avoid any property that triggers layout or paint”
- [CSS Transforms · Transform geometry](https://www.w3.org/TR/css-transforms-1/) · standard · A transform leaves surrounding normal flow unchanged, so it cannot push the next accordion row down. · “does not affect the flow of the content surrounding the transformed element”
- [CSS Will Change · The will-change property](https://www.w3.org/TR/css-will-change-1/#will-change) · standard · The specification recommends sparse hints and requires an early stacking context when the named property would create one. · “specifying that property in will-change must create a stacking context on the element”
- [CSS Custom Properties · Inheritance and substitution](https://www.w3.org/TR/css-variables-1/) · standard · Unregistered custom properties inherit. The specification defines propagation, while the relative cost of each write needs profiling. · “Inherited: yes”

Judgement: The 220ms comparison and choice of drag write target are demonstration and profiling choices. Relative cost depends on the affected subtree, browser and device.

## motion-15

Claims: translateY(100%) moves by the height of the transform reference box. A fixed 40px can leave variable-height content visible. To clear a clipping boundary, include any starting inset as well as the element’s travel. Test short, wrapped and translated content. Remove a dismissed surface from pointer and keyboard interaction.

- [CSS Transforms · Transform geometry](https://www.w3.org/TR/css-transforms-1/) · standard · Defines percentage vertical travel against the reference box height, which makes the travel scale with the moving element. · “relative to the height of the reference box”
- [CSS Overflow · Clip overflow](https://www.w3.org/TR/css-overflow-3/#valdef-overflow-clip) · standard · A clipping container cuts off content at its overflow clip edge. The travel still needs to carry the whole visible surface past that edge. · “the box’s content is clipped to its overflow clip edge”
- [Radix Primitives · Toast swipe animation](https://www.radix-ui.com/primitives/docs/components/toast#animating-swipe-gesture) · practice · Shows an element-relative toast exit on the horizontal axis. The example leaves clearance for a particular inset to the implementer. · “transform: translateX(100%);”
- [HTML · Inert subtrees](https://html.spec.whatwg.org/multipage/interaction.html#inert-subtrees) · standard · Inert nodes are omitted from hit testing and generally cannot receive focus, supporting dismissal independently of the visual exit. · “Inert nodes generally cannot be focused”

Judgement: 150% and 40px are demo values. Whether either clears the boundary depends on the box and inset. A fixed offset can be appropriate for an intentionally partial movement.

## motion-16

Claims: Use (hover: hover) for decorative CSS when the primary pointing device can hover. Primary-device hover support does not identify the input in use on a hybrid. For scripted hover, inspect the current pointer and ignore touch emulation. Make the same action identifiable and operable by touch and keyboard without requiring hover.

- [Media Queries · Hover and pointer capabilities](https://www.w3.org/TR/mediaqueries-4/#mf-interaction) · standard · Defines hover relative to the primary pointing device, with any-hover separately covering other possible pointing devices. · “The hover media feature is used to query the user’s ability to hover over elements on the page with the primary pointing device.”
- [React Aria · useHover](https://react-aria.adobe.com/useHover) · practice · Documents sticky emulated hover on touch and event-based handling for hybrid devices. The API exposes pointerType and the guidance calls for touch alternatives. · “ignores emulated mouse events on touch devices”
- [WCAG 2.2 · Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) · standard · SC 2.1.1 requires a keyboard path for functionality, with an exception for functions that depend on the path of movement. · “operable through a keyboard interface without requiring specific timings”

Judgement: The scale effect is an illustration of optional decoration. The appropriate hover treatment depends on the control.

Disagreement: Media Queries Level 4 also discusses any-hover for optional secondary-pointer enhancements. A primary-hover gate is a conservative default for this effect, rather than a requirement for all hover designs.

## motion-17

Claims: Respect CSS and script reduced-motion preferences by removing unnecessary translation, zoom and rotation. Use a stable final label, icon or other persistent cue. An in-place fade can preserve the transition. WCAG 2.3.3 is Level AAA and requires a way to disable nonessential interaction-triggered motion. Preserve programmatic announcements for qualifying status messages.

- [WCAG 2.2 · Animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) · standard · SC 2.3.3 (AAA) covers disabling nonessential motion triggered by interaction. · “Motion animation triggered by interaction can be disabled”
- [Media Queries Level 5 · Reduced motion preference](https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion) · standard · Defines the operating-system preference consumed by CSS media queries or matchMedia. · “the user has requested the system minimize the amount of non-essential motion it uses”
- [Apple · Reduced Motion evaluation criteria](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/reduced-motion-evaluation-criteria/) · guideline · Recommends substituting nonspatial effects for physical movement when appropriate. · “such as a dissolve, highlight fade, or color shift”
- [WCAG 2.2 · Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) · standard · Ensure qualifying feedback can be announced even if its visual animation is removed. · “status messages can be programmatically determined through role or properties”
- [Apple HIG · Motion](https://developer.apple.com/design/human-interface-guidelines/motion) · guideline · Provide an alternative way to communicate important feedback when movement is optional. · “avoid using it as the only way to communicate important information”

Judgement: The choice of a stable label versus an icon, and whether to use a fade at all, depends on the feedback. The showcased 220ms fade is an example.

## motion-18

Claims: For reversible dismissal, accept sufficient distance or a deliberate fling in an eligible direction. Use recent release-axis movement so a pause or reversal does not count as a stale flick. Test canceled gestures and incidental movement. Offer equivalent single-pointer dismissal without dragging and provide abort or recovery where applicable. The prototype uses a 100ms history, positive speed above 0.5px/ms, or travel above 60% of the rail.

- [Flutter · Swipe dismissal thresholds](https://api.flutter.dev/flutter/widgets/Dismissible/dismissThresholds.html) · practice · Documents a production widget with direction-specific thresholds and a fling that can dismiss without crossing the usual distance threshold. · “Flinging is treated as being equivalent to dragging almost to 1.0”
- [Flutter · Pointer velocity estimation](https://api.flutter.dev/flutter/gestures/VelocityTracker/getVelocityEstimate.html) · practice · The implementation zeros a velocity estimate after a gap since the latest movement sample, supporting expiration of a stale flick. · “Has user recently moved since last sample?”
- [Android Developers · Gesture animation](https://developer.android.com/develop/ui/compose/animation/advanced) · practice · Shows release-axis velocity tracking in a swipe-to-dismiss implementation. Its projected endpoint is an alternative to independent thresholds. · “For fling, Compose provides VelocityTracker to record drag events and calculate velocity.”
- [WCAG 2.2 · Dragging movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) · standard · Provides the basis for a button or other single-pointer equivalent to a custom swipe gesture, subject to the criterion’s exceptions. · “can be achieved by a single pointer without dragging”
- [WCAG 2.2 · Pointer cancellation](https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html) · standard · Up-event completion with a way to abort or undo is one permitted path under SC 2.5.2. · “a mechanism is available to abort the function before completion or to undo the function after completion”
- [Radix Primitives · Toast swipe threshold](https://github.com/radix-ui/primitives/blob/6d5838b754ced22597b874aea58e4c28592abbeb/packages/react/toast/src/toast.tsx#L81-L85) · practice · Provides a production counterexample. Radix Toast checks directional travel at pointer release using a configurable distance threshold. · “Distance in pixels that the swipe must pass before a close is triggered.”

Judgement: The 100ms history, 0.5px/ms speed, 60% travel and decision to accept a flick are prototype and product choices. The sources give precedents and alternative algorithms rather than calibrated thresholds for this rail.

Disagreement: Radix Toast uses a directional distance threshold with a 50px default and no velocity test. This differs from Axiom’s recommendation to also recognize a deliberate flick for a reversible dismissal.

## motion-19

Claims: Bounded, progressively resistant overdrag can signal that a custom surface passed a meaningful edge. Cap the visual excursion, retain a valid underlying value and return to a clear resting position. Keep native overscroll behavior native. Clamp numerical range controls to their valid range.

- [Apple Developer · Designing Fluid Interfaces](https://developer.apple.com/videos/play/wwdc2018/803/) · guideline · Explains rubberbanding as a cue that the interface is still tracking input at a boundary. · “It means we're softly indicating boundaries of the interface.”
- [Motion · Elastic drag constraints](https://motion.dev/docs/react-drag#elastic-constraints) · practice · Shows configurable elasticity beyond bounds for custom draggable elements. · “By default, dragging an element beyond its constraints will "tug" with some elasticity.”
- [HTML · Range input](https://html.spec.whatwg.org/multipage/input.html#range-state-(type=range)) · standard · Defines native range input as a number constrained by a minimum and maximum. · “the range and step constraints are enforced even during user input”
- [CSS Overscroll Behavior · Scroll boundary default actions](https://www.w3.org/TR/css-overscroll-1/#scroll-chaining) · standard · Distinguishes native boundary feedback from scroll chaining so a site can preserve native feedback without duplicating it. · “using the native overscroll affordances are still desirable while scroll chaining is to be prevented”
- [Flutter · Overscroll friction factor](https://api.flutter.dev/flutter/widgets/BouncingScrollPhysics/frictionFactor.html) · practice · A native-style scrolling example illustrates progressively stronger resistance. This is an analogy for the custom card, with native scrolling left to the platform. · “As this value increases, the friction factor decreases quadratically, making further overscroll harder.”

Judgement: The resistance curve, visual cap, settle and where to use elastic feedback are application choices. The references give precedents for the effect without establishing a universal recipe.

## motion-20

Claims: Capture the initiating pointer by pointerId so a drag continues after leaving the handle and other contacts cannot take over. End and clean up on pointerup, pointercancel or lostpointercapture. Direct-manipulation input may capture implicitly. Use touch-action to preserve page gestures outside the component’s axis. Provide a non-drag pointer alternative and a keyboard path.

- [Pointer Events · Pointer capture](https://www.w3.org/TR/pointerevents3/#pointer-capture) · standard · Capture retargets subsequent events for one pointer. The section covers explicit capture, implicit capture and release on pointerup or pointercancel. · “allowing the user to slide the control back and forth even if the pointer slides off of the thumb”
- [Pointer Events · The touch-action property](https://www.w3.org/TR/pointerevents3/#the-touch-action-css-property) · standard · An axis-specific touch-action can keep ordinary page scrolling available while a component claims its drag direction. · “without interfering with vertical panning”
- [WCAG 2.2 · Dragging movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) · standard · A custom slider needs single-pointer operation without dragging, such as clicking or tapping on the track, subject to the criterion’s exceptions. · “can be achieved by a single pointer without dragging”
- [WCAG 2.2 · Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) · standard · Keyboard operability is a separate requirement from the single-pointer alternative. · “operable through a keyboard interface without requiring specific timings”

## motion-21

Claims: Use a CSS transform transition when both states are known. A composited animation can keep moving during a main-thread JavaScript task. A frame-by-frame requestAnimationFrame loop waits for the main thread. Callback gaps do not measure compositor frame delivery. Use Web Animations when the code needs a playback handle. Check compositing in a trace and address long tasks so input can still be processed. The demo uses a 2600ms transition and three 240ms main-thread stalls.

- [web.dev · Why are some animations slow?](https://web.dev/articles/animations-overview) · practice · Explains why eligible CSS and Web Animations can run on the compositor and why layout or paint still involves the main thread. · “if the browser is running some expensive tasks on the main thread, these animations can keep going without being interrupted”
- [W3C · Web Animations timing and playback](https://www.w3.org/TR/web-animations-1/) · standard · Defines script-created animations with declarative performance characteristics and programmatic playback controls. · “it is possible to create animations from script that have the same behavior and performance characteristics as declarative animations”
- [web.dev · Animation smoothness](https://web.dev/articles/smoothness) · practice · Demonstrates that rAF polling reports main-thread gaps and misses some compositor updates. · “it doesn't actually capture all types of animation updates!”
- [web.dev · Interaction latency and presentation delay](https://web.dev/articles/optimize-inp) · practice · Long tasks can make input wait regardless of how smoothly a visual transition runs. · “long tasks on the main thread, which will delay the browser from responding to other user interactions”
- [web.dev · High-performance CSS animations](https://web.dev/articles/animations-guide) · practice · Provides profiling checks for rendering work and dropped frames. · “Avoid any property that triggers layout or paint”

Judgement: The tab indicator and the 2600ms and 240ms experiment values are illustrative. Compositing and frame delivery should be checked on the implementation and target devices.

## motion-24

Claims: Use an ordered stagger when it helps users follow arrivals. Keep offsets short and cap or remove them as the group grows. Total time is item duration plus the interval times the number of gaps. Three 220ms rows finish at 340ms with 60ms intervals and 660ms with 220ms intervals. Keep actionable or focused items visible. A familiar dialog can appear together when title and actions are needed immediately.

- [Fluent 2 · Motion choreography](https://fluent2.microsoft.design/motion/) · guideline · Directly calls for a total duration budget, shorter offsets and simultaneous animations when large groups would take too long. · “Keep in mind the overall duration of the animations and use short offsets between them.”
- [Carbon · Motion choreography](https://www.carbondesignsystem.com/building-blocks/foundations/motion/choreography) · guideline · Gives a concrete design-system precedent for adjusting the delay as item count changes. · “adjusted to ensure that total time is still within 500 ms.”
- [Motion · Staggering animations](https://motion.dev/docs/stagger) · practice · Defines equal incremental delays, from which the total for the last item follows. · “A stagger animation delays each element in a group by a fixed amount, creating a cascading, wave, or ripple effect.”
- [MDN · CSS opacity](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/opacity) · guideline · Explains that invisible rows can still be hit or focused if only opacity changes. · “they still register pointer events and, if the elements are in a tabbing order, they do get focus”
- [WAI-ARIA APG · Modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) · guideline · Initial focus moves into the dialog when it opens. This supports immediate visibility of the focused item, without prescribing synchronous animation for the whole dialog. · “When a dialog opens, focus moves to an element inside the dialog.”
- [Material Design 1 · Motion choreography](https://m1.material.io/motion/choreography.html) · guideline · Historical guideline recommends short overlap so rows start before the prior row finishes. Its timing differs from the Axiom demo. · “Begin each item’s staggered entrance no more than 20ms apart.”

Judgement: The 60ms interval, 220ms row duration and choice to reveal a routine dialog together are treatments. The totals are arithmetic. No cited study establishes an optimum delay for these rows.

Disagreement: Material Design 1 gives a stricter ceiling of 20ms between list entrances and advises against simultaneous arrival in that example. Fluent 2 prefers stagger in most cases and allows simultaneous arrival for very large groups. These are design-system conventions that differ from the demo or from treating stagger as optional for routine arrivals.

## motion-28

Claims: Keep the incoming symbol recognizable during the swap and in its final state. Avoid a blur that obscures its meaning. Use a stable slot to preserve alignment and focus. Choose an immediate swap or a brief shape-preserving transition, including an immediate reduced-motion treatment where appropriate. Expose the resulting control name and state, or announce a qualifying status message.

- [Apple HIG · Icons](https://developer.apple.com/design/human-interface-guidelines/icons) · guideline · Calls for recognizable, simplified glyphs and consistent sizing. This directly supports a readable final state and provides a basis for a stable slot. · “Create a recognizable, highly simplified design.”
- [Material Design 2 · Animated icons](https://m2.material.io/design/iconography/animated-icons.html) · guideline · Shows a subtle fade and scale for routine icon changes to preserve the glyph and reinforce state change. · “Exiting icons simply fade out and entering icons fade in, subtly scaling up in size.”
- [WCAG 2.2 · Name, role, value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) · standard · Requires programmatic exposure of a control’s name and role, user-settable states and values, and their changes. · “the name and role can be programmatically determined”
- [WCAG 2.2 · Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) · standard · An icon reporting a qualifying result must communicate it programmatically without forcing a focus change. · “status messages can be programmatically determined through role or properties”
- [WCAG 2.2 · Animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) · standard · Supports disabling nonessential interaction-triggered motion, including applicable scale or travel in glyph swaps. · “Motion animation triggered by interaction can be disabled”
- [Apple Developer · What’s new in SF Symbols 6](https://developer.apple.com/videos/play/wwdc2024/10188/) · practice · Demonstrates a symbol change that preserves the recognizable base shape by animating only differences such as a slash or badge. · “Magic Replace is a smart transition between two symbols with related shapes.”

Judgement: A fixed-size slot, instantaneous swap versus crossfade, and the preference for sharpness over the demo’s blur depend on visual context. The cited references do not establish a universal blur or timing threshold.

## motion-29

Claims: Render controls that are already available visibly and operably on the first usable paint, including after refresh or focus restoration. Reserve entrance motion for a later meaningful arrival or change. AnimatePresence initial={false} suppresses initial animations only for children present on its first render. The demo compares a 0ms ready state against a 220ms entrance.

- [Emil Kowalski · You Don’t Need Animations](https://emilkowal.ski/ui/you-dont-need-animations) · practice · Uses frequent, goal-directed app launch as an example where immediate availability is preferable to a repeated opening animation. · “I use Raycast hundreds of times a day. If it animated every time I opened it, it would be very annoying.”
- [Apple HIG · Launching](https://developer.apple.com/design/human-interface-guidelines/launching) · guideline · Platform guidance favors getting to the usable app quickly so people can immediately engage. · “People want to start interacting with your app or game right away”
- [Motion · Initial animations in AnimatePresence](https://motion.dev/docs/react-animate-presence#initial) · practice · Documents the exact scope of initial={false}, allowing a later insertion to animate normally. · “AnimatePresence will disable any initial animations on children that are present when the component is first rendered.”
- [WCAG 2.2 · Focus visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) · standard · Supports keeping restored or initial focus visible in keyboard operation, without setting a page-load animation rule. · “Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.”
- [Carbon · Motion choreography](https://www.carbondesignsystem.com/building-blocks/foundations/motion/choreography) · guideline · Recommends introducing stable shell elements first. Its recommendation to introduce the primary button later shows a different priority for choreographed page loading. · “such as static content and header”

Judgement: An immediate first paint is a product default for already-ready controls. The 220ms comparison is illustrative, and the value of animating a later arrival depends on whether it conveys a useful change.

Disagreement: Carbon recommends sequencing page loading where possible and revealing the primary action late to draw attention. If that action was already available, that choreography would differ from Axiom’s ready-on-first-paint default.

## mobile-1

Claims: The background can fill the bottom of the screen while the button sits higher. Adding the inset to the design gap keeps that gap when the inset changes.

- [Apple HIG, Layout](https://developer.apple.com/design/human-interface-guidelines/layout) · guideline · “Respecting the safe area is essential”
- [WebKit, Designing Websites for iPhone X](https://webkit.org/blog/7929/designing-websites-for-iphone-x/) · guideline · “Safe area insets are not a replacement for margins.”
- [WWDC21, Design for Safari 15](https://developer.apple.com/videos/play/wwdc2021/10029/) · guideline · “the safe area starts above it.”
- [Android, Window insets](https://developer.android.com/develop/ui/compose/system/insets) · guideline · “Edge-to-edge is enforced on Android 15 and higher once your app targets SDK 35”
- [Android, Edge-to-edge design](https://developer.android.com/design/ui/mobile/guides/layout-and-content/edge-to-edge) · guideline · “System bar insets apply to UI that is both tappable”
- [MDN, env()](https://developer.mozilla.org/en-US/docs/Web/CSS/env) · standard · “where it is safe to place content”

Judgement: The bottom inset, action height and ordinary padding are fixture values. A real safe-area intersection alone does not establish who receives a tap.

## mobile-2

Claims: The small viewport describes the opening with the browser controls expanded. A dynamic viewport follows the space available as the controls move.

- [web.dev, The large, small, and dynamic viewport units](https://web.dev/blog/viewport-units) · guideline · “The sizes of these viewport-percentage units are fixed (and therefore stable) unless the viewport itself is resized.”
- [CSS Values and Units 4](https://www.w3.org/TR/css-values-4/#viewport-relative-lengths) · standard · “such content might be hidden behind such interfaces when they are expanded”
- [WWDC21, Design for Safari 15](https://developer.apple.com/videos/play/wwdc2021/10029/) · guideline · “As the tab bar minimizes, the dimensions of the safe area change.”

Judgement: The toolbar endpoints illustrate one window. The host determines the actual sizes and when its dynamic viewport updates.

## mobile-3

Hoober reports greater touch dispersion in the corners of the screen. The 60 px Close target and the uniform square of sample offsets are choices for this comparison. Personal trials count the action that actually ran. [Design for Fingers, Touch, and People, Part 3](https://www.uxmatters.com/mt/archives/2017/07/design-for-fingers-touch-and-people-part-3.php)

## mobile-4

One-handed reach varies with device size and grip. The adjustable arc tests the distance from a selected pivot to the center of Save. A person can reach beyond it or fall short. [Understanding single-handed mobile device interaction](https://www.cs.umd.edu/hcil/trs/2006-02/2006-02.htm)

## mobile-5

Completing a button action on release lets someone abandon a press. The inbox keeps the pressed appearance separate from opening the message. Its 120 px replay represents one scrolling gesture. [W3C · Understanding pointer cancellation](https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html)

## mobile-6

Recognizing a possible second tap can delay the first action. The comparison schedules its own 300 ms wait and measures elapsed handler time. WebKit describes separate browser optimizations for fast taps. [WebKit · More responsive tapping on iOS](https://webkit.org/blog/5610/more-responsive-tapping-on-ios/)

## mobile-20

The pinned [WebKit implementation](https://raw.githubusercontent.com/WebKit/WebKit/77899089cc29f732abe2c258e19c970c0df364e3/Source/WebKit/UIProcess/API/ios/WKWebViewIOS.mm) includes a 16 px reference size and clamps the target scale. The comparison illustrates the unclamped ratio of 16 to 14. Inspect records the host page’s viewport scale separately.

## mobile-21

The [Chrome viewport guide](https://developer.chrome.com/blog/viewport-resize-behavior) describes three keyboard resize policies. The 844 px window and 336 px keyboard are example rectangles. Layout resize leaves both composers visible. Visual-only resize can leave the layout-anchored composer covered.

## mobile-22

[Apple’s typography tables](https://developer.apple.com/design/human-interface-guidelines/typography) give Body a size of 17 pt at Large and 53 pt at AX5. The in-page setting supplies those fixture values. Test system preference changes separately on a device.

## mobile-23

The [Android 14.0.0 r1 conversion table](https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-14.0.0_r1/core/java/android/content/res/FontScaleConverterFactory.java) maps 14 sp to 26 dp and 20 sp to 34 dp at 200%. The comparison applies both values, wraps the payment label in a 160-unit column and measures its line boxes against the row.

## mobile-12

Android describes Back starting at either side edge. The trimmer models a 24-unit band so the same inward drag can reach the handle or reveal the previous screen. Devices supply their own gesture insets. [Android gesture navigation](https://developer.android.com/develop/ui/views/touch-and-input/gestures/gesturenav)

## mobile-13

The browser checks touch-action on the target and its ancestors when deciding whether it can pan. The photo divider permits vertical panning in one pane. Its replay sets the article’s scroll offset directly. [Pointer Events, the touch-action property](https://www.w3.org/TR/pointerevents3/#the-touch-action-css-property)

## mobile-14

Apple recommends making context menu actions available through the main interface. Both photos support the same long press. More exposes those actions to someone using ordinary taps. [Apple HIG, Context menus](https://developer.apple.com/design/human-interface-guidelines/context-menus)

## mobile-15

Apple illustrates projecting the release point of a thrown object. The sheet extrapolates 0.2 seconds from release and chooses among three authored stops. Those values belong to the example. [Designing Fluid Interfaces](https://developer.apple.com/videos/play/wwdc2018/803/)

The four gesture examples use Galileo’s 7 December 1992 photograph of the Moon, courtesy of NASA/JPL/USGS and in the public domain. [NASA/JPL Photojournal PIA00405, Earth’s Moon](https://science.nasa.gov/photojournal/earths-moon)

## mobile-7

Visible labels expose the available destinations before anyone opens a menu. The example counts actual activations from Home to Orders. Its result depends on these four destinations and their placement. [NN/g navigation study](https://www.nngroup.com/articles/hamburger-menus/) · [Apple tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)

## mobile-8

Saving each tab’s stack lets the reader return to the same product after visiting Bag. The example also stores the heading of the visible passage so that resizing text can preserve a reading location. [Android multiple back stacks](https://developer.android.com/guide/navigation/backstack/multi-back-stacks) · [Apple tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)

## mobile-9

A navigable sheet needs consistent dismissal through Back and its visible Close control. This fixture keeps the café selection on the map and restores focus to the pin. Direct entry uses the map as its fallback destination. [NN/g bottom sheets](https://www.nngroup.com/articles/bottom-sheet/) · [Apple sheets](https://developer.apple.com/design/human-interface-guidelines/sheets)

## mobile-10

Back progress previews the previous destination. Cancellation restores the current one. The example keeps the route, text and caret until completion. Its untimed controls send explicit navigation events. [Android predictive Back](https://developer.android.com/guide/navigation/custom-back/predictive-back-gesture) · [UIKit interactive pop](https://developer.apple.com/documentation/uikit/uinavigationcontroller/interactivepopgesturerecognizer)

## mobile-11

The adaptive navigation suite can choose a bottom bar for compact width, compact height or tabletop posture. The example applies that policy to a resizable app window on a 700 dp device and retains the selected destination. [Android adaptive navigation](https://developer.android.com/develop/adaptive-apps/guides/build-adaptive-navigation) · [Android window size classes](https://developer.android.com/develop/adaptive-apps/guides/use-window-size-classes)

## mobile-16

The activity log is an independent scroll container. Its parent article keeps its own reading position. A fresh gesture on the article can still move it. Inspect reports each element’s actual scroll offset. The replay models one boundary crossing. [CSS Overscroll Behavior Level 1](https://www.w3.org/TR/css-overscroll-1/)

## mobile-17

The departure list starts on row 25. Its downward flick can run out of list before the gesture ends. The fixture lets the reader compare ownership at pointer down with transfer at the boundary, then try a fresh pull from the top. Projection and dismissal thresholds are fixture choices. [Building a drawer component](https://emilkowal.ski/ui/building-a-drawer-component) · [Android Material BottomSheetBehavior](https://developer.android.com/reference/com/google/android/material/bottomsheet/BottomSheetBehavior)

## mobile-18

Both sheets expand to the same height. Their twelve options occupy more space than the expanded body. A bounded scrolling list can bring Wheelchair access above the bottom inset and into keyboard reach. Closing returns focus to Visit options. [UIKit sheet detents](https://developer.apple.com/documentation/uikit/uisheetpresentationcontroller/detents) · [W3C modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

## mobile-19

The shoe sheet previews the result count from the pending size, colour and price filters. Committing the draft on Apply lets the shopper finish the three choices in one visit. Both variants show the applied filters alongside the results. [Baymard mobile filtering research](https://baymard.com/guidelines/1125-apply-buttons-in-mobile-filtering-interfaces) · [eBay filtering patterns](https://playbook.ebay.com/design-system/patterns/filtering-patterns)

## mobile-24

During a drag the finger obscures content around the contact point. This fixture keeps a 4 px gap above a modelled pad and moves the readout below the track when the top inset leaves too little room. Physical pad size depends on display calibration. [Hoober, Design for Fingers, Touch, and People, Part 2](https://www.uxmatters.com/mt/archives/2017/05/design-for-fingers-touch-and-people-part-2.php)

## mobile-25

A bag quantity gives the shopper a result they can read again after adding an item. Both panes save the item. Only one exposes the update at the point of action. The optional vibration request describes a simulated cue. Confirming a felt vibration requires a device trial. [Apple, Playing haptics](https://developer.apple.com/design/human-interface-guidelines/playing-haptics) · [Vibration API](https://www.w3.org/TR/vibration/)

## mobile-26

Material 3 Scaffold includes the floating action button in its calculation of the snackbar offset. This inbox uses a shared 56-unit button size and tests the actual receiver at Undo’s center after the archive notice wraps. [AndroidX Scaffold implementation](https://raw.githubusercontent.com/androidx/androidx/cc19260e63cb6987f899a15feef625db9823b854/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Scaffold.kt) · [Compose snackbar](https://developer.android.com/develop/ui/compose/components/snackbar)
