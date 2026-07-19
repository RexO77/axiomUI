export type RuleDeepDive = {
  /** Replaces the category-template "Why it matters" paragraph. */
  whyItMatters?: string;
  /** Replaces the category-template "Risk when ignored" paragraph.
   *  Write it complete — the template's `Anti-pattern example: ${rule.dont}.`
   *  suffix is NOT appended to overrides. */
  riskWhenIgnored?: string;
  /** Replaces ALL implementation notes (template notes are not merged in). */
  implementationNotes?: string[];
  /** Replaces ALL review prompts. */
  reviewPrompts?: string[];
};

export const ruleDeepDives: Record<string, RuleDeepDive> = {
  // ── Typography & Text ─────────────────────────────────────────────
  "typo-1": {
    whyItMatters: "Readers recognize whole words by their shape, the ascender and descender pattern, not letter by letter. Title Case flattens that shape by capitalizing every word, forcing the eye back into slower letter-by-letter decoding. Sentence case keeps only one capital, preserving the silhouette a fluent reader scans.",
    riskWhenIgnored: "Buttons and headers read slower and feel more formal than intended. Long labels like Create New Account From Existing Template become a wall of jarring capitals that stalls scanning at every capitalized word.",
    implementationNotes: [
      "Set button and label copy to sentence case: Create new account, not Create New Account.",
      "Capitalize only the first word and proper nouns.",
      "Enforce via a lint rule or CMS transform, not manual review.",
      "Audit existing headers and nav items for stray Title Case.",
    ],
    reviewPrompts: [
      "Is only the first word (and proper nouns) capitalized in this label?",
      "Do buttons and headers avoid capitalizing every word?",
      "Does the copy match sentence case across similar components on the page?",
    ],
  },
  "typo-2": {
    whyItMatters: "Uppercase letters are all the same height with no ascenders or descenders, so words lose the silhouette readers rely on for fast recognition. Tight tracking makes letters visually collide, compounding the loss. Adding tracking, around 0.05em, opens breathing room between letters so the eye can still separate them.",
    riskWhenIgnored: "Uppercase labels at default tracking look cramped and letters visually merge, especially in condensed or bold weights. Small uppercase text like tab labels or badges becomes noticeably harder to parse at a glance.",
    implementationNotes: [
      "Apply tracking-wider (0.05em) to any uppercase text.",
      "Never leave uppercase at tracking-normal (0em).",
      "Pair uppercase treatments with a smaller font size, since tracking adds visual width.",
      "Check condensed and bold uppercase styles first, since they collide most.",
    ],
    reviewPrompts: [
      "Does every uppercase text element have added letter-spacing?",
      "Do uppercase labels avoid feeling cramped or merged together?",
      "Is tracking consistent across all uppercase instances in the UI?",
    ],
  },
  "typo-3": {
    whyItMatters: "During reading, the eye jumps in saccades along a line then sweeps back down-left to find the next line. That return sweep needs enough vertical gap to land on the correct row without ambiguity. A ratio near 1.5x, 24px leading for 16px text, gives that gap without severing the visual connection between lines.",
    riskWhenIgnored: "Cramped body text at 18px leading on 16px type causes readers to lose their place on the return sweep, re-reading lines or skipping them. Paragraphs feel dense and tiring past a few lines.",
    implementationNotes: [
      "Set body text line-height to roughly 1.5x size: 16px text gets 24px line-height.",
      "Never compress below 1.2x for paragraph-length copy.",
      "Test with real multi-line paragraphs, not single lines.",
      "Adjust slightly narrower for wide columns, slightly looser for narrow ones.",
    ],
    reviewPrompts: [
      "Is body line-height roughly 1.5x the font size?",
      "Can you track from the end of one line to the start of the next without losing your place?",
      "Does dense paragraph text avoid feeling cramped?",
    ],
  },
  "typo-4": {
    whyItMatters: "Large type already has generous space between ascenders and descenders, so the extra gap 1.5x line-height adds becomes wasted air rather than reading aid. Tightening to 1.1x-1.2x, 38px for 32px type, keeps multi-word headings visually grouped as one unit instead of drifting into separate floating lines.",
    riskWhenIgnored: "A 32px heading set at 48px line-height leaves a visible gap between wrapped lines, making a two-line headline read as two unrelated statements instead of one thought.",
    implementationNotes: [
      "Set heading line-height to about 1.1-1.2x size: 32px text gets 38px line-height.",
      "Never reuse body line-height ratios (1.5x) on headings.",
      "Tighten further as size increases past 40px.",
      "Check multi-line headings specifically, since single-line ones hide the problem.",
    ],
    reviewPrompts: [
      "Does line-height tighten as heading size increases?",
      "Do multi-line headings read as one grouped statement, not separate floating lines?",
      "Is a 32px heading close to 38px line-height rather than 48px?",
    ],
  },
  "typo-5": {
    whyItMatters: "Each typeface carries its own rhythm of stroke contrast, x-height, and spacing; mixing two sans-serifs like Roboto and Open Sans puts two similar-but-different rhythms side by side, which reads as a mismatch rather than a deliberate contrast. A serif-plus-sans pairing signals hierarchy through genuine structural difference, or one typeface removes the risk entirely.",
    riskWhenIgnored: "Two similar sans-serifs next to each other look like a font-loading bug rather than a design choice, especially at similar weights and sizes, and teams end up debating which one is off with no clear answer.",
    implementationNotes: [
      "Default to one typeface for everything, like Inter, across headings and body.",
      "If pairing, use exactly one serif for headings and one sans for body.",
      "Never combine two sans-serifs such as Roboto and Open Sans.",
      "Limit any project to two typefaces total, no exceptions.",
    ],
    reviewPrompts: [
      "Does the page use one typeface, or a clear serif-plus-sans pair?",
      "Are there two different sans-serif fonts appearing anywhere?",
      "Would a viewer describe the pairing as intentional contrast, not a mismatch?",
    ],
  },
  "typo-6": {
    whyItMatters: "Legibility depends on contrast ratio against the background, not on letter size; a 14px neutral-500 string can still clear WCAG's minimum comfortably while a 10px black string strains acuity regardless of contrast. De-emphasizing through color lowers visual weight while keeping the text readable at normal viewing distance.",
    riskWhenIgnored: "Shrinking secondary text below 12px to signal less important pushes it below comfortable reading size, so users lean toward the screen or zoom in, especially on mobile viewports.",
    implementationNotes: [
      "Use text-neutral-500 at 14px to de-emphasize, not a smaller black size.",
      "Never drop text size below 12px to indicate hierarchy.",
      "Keep contrast ratio checked even after lightening color, not just below 10px black.",
      "Reserve size reduction for genuine label/caption roles, not emphasis level.",
    ],
    reviewPrompts: [
      "Is secondary text de-emphasized with a lighter color rather than a smaller size?",
      "Does any text on the page fall below 12px?",
      "Does lightened secondary text still meet a comfortable contrast ratio?",
    ],
  },
  "typo-7": {
    whyItMatters: "Proportional fonts give each digit a different width, so a column of prices drifts out of vertical alignment as digit widths vary row to row. Tabular nums fix every digit to the same width, letting decimal points and place values stack into a clean vertical line the eye can scan down.",
    riskWhenIgnored: "In a proportional table, 1 takes less width than 8, so decimal points shift left and right down the column, and comparing two prices at a glance becomes an actual counting exercise.",
    implementationNotes: [
      "Apply font-variant-numeric: tabular-nums to any numeric table or list.",
      "Right-align number columns so digits stack from the decimal outward.",
      "Never leave numeric tables on standard proportional sans figures.",
      "Test alignment with a mix of 1-digit and multi-digit values in the same column.",
    ],
    reviewPrompts: [
      "Do decimal points line up vertically down the column?",
      "Is font-variant-numeric: tabular-nums applied to numeric tables?",
      "Are number columns right-aligned rather than left or center?",
    ],
  },
  "typo-8": {
    whyItMatters: "After each line, the eye needs a fixed anchor point to find the start of the next one; a left edge gives it that consistent anchor, while centered text puts the start of every line at a different horizontal position. That forces a fresh search on every return sweep instead of a reflexive jump.",
    riskWhenIgnored: "A centered multi-line paragraph forces readers to hunt for where the next line begins each time, so scanning speed drops and users often stop reading before the paragraph ends.",
    implementationNotes: [
      "Left-align any paragraph longer than one line.",
      "Reserve centered text for short headlines only, not body copy.",
      "Check marketing and empty-state copy specifically, where centering creeps in.",
      "Convert any centered paragraph over two lines to left alignment.",
    ],
    reviewPrompts: [
      "Is multi-line paragraph text left-aligned?",
      "Is centered text limited to short, one or two line headlines?",
      "Can you find the start of each wrapped line without searching?",
    ],
  },
  "typo-9": {
    whyItMatters: "Hierarchy works by contrast: two weights, say Regular and Semibold, create one unambiguous distinction between normal and emphasized text. Adding Light, Medium, and Bold into the same interface gives every weight a neighbor close enough to blur into it, so the contrast that signals importance disappears.",
    riskWhenIgnored: "With five weights in play, a Medium label and a Regular label sit close enough in visual weight that users can't tell which one is meant to stand out, and hierarchy collapses across the screen.",
    implementationNotes: [
      "Restrict a typeface to two weights: Regular and Semibold.",
      "Never introduce Light, Medium, and Bold alongside them.",
      "Reassign any Medium-weight text to either Regular or Semibold.",
      "Audit a full screen for weight count before adding a new one.",
    ],
    reviewPrompts: [
      "Does the interface use at most two font weights?",
      "Is it obvious which text is emphasized versus normal at a glance?",
      "Are there any Light or Medium weights that could collapse into Regular?",
    ],
  },
  "typo-10": {
    whyItMatters: "Layout containers have fixed dimensions, but real content, names, filenames, descriptions, is unbounded in length, so every text container needs an explicit overflow plan. Ellipsis truncation (text-ellipsis, overflow-hidden) signals more exists while keeping the layout grid intact, unlike overflow that pushes neighboring elements around.",
    riskWhenIgnored: "An unhandled long filename or title overflows its card, pushing adjacent buttons off-screen or breaking the row's alignment, and the layout looks broken rather than merely full.",
    implementationNotes: [
      "Apply text-ellipsis and overflow-hidden to any container with variable-length text.",
      "Never let text overflow and break surrounding layout.",
      "Choose wrap or fade instead of ellipsis where truncation would hide meaning, like file extensions.",
      "Test every text container with the longest realistic string, not placeholder text.",
    ],
    reviewPrompts: [
      "Does long text truncate with an ellipsis instead of overflowing?",
      "Does the layout stay intact when text content is unusually long?",
      "Was truncation tested with a realistic worst-case string, not just short placeholders?",
    ],
  },
  "typo-11": {
    whyItMatters: "Below roughly 12px, character strokes approach the resolution limit of typical viewing distance and screen density, so letterforms blur together rather than staying distinct. The 14px mobile / 12px desktop floors exist because mobile is held closer but viewed in more variable light, while desktop sits farther but under steadier conditions.",
    riskWhenIgnored: "Body text set at 11px on mobile forces users to zoom in or hold the phone closer to read comfortably, and subtext dropping to 9px becomes illegible for anyone with even mild vision strain.",
    implementationNotes: [
      "Set body text to at least 16px, subtext no smaller than 12px, per the do example.",
      "Never drop body below 14px on mobile or 12px on desktop.",
      "Never let subtext fall below 12px under any circumstance.",
      "Check dense data screens first, where shrinking type is the easiest shortcut.",
    ],
    reviewPrompts: [
      "Is body text at least 14px on mobile and 12px on desktop?",
      "Does subtext stay at or above 12px everywhere?",
      "Can the smallest text on screen be read without zooming?",
    ],
  },
  "typo-12": {
    whyItMatters: "Default browser wrapping breaks a heading purely on available width, which often strands a single word alone on the last line. text-wrap: balance redistributes words across all lines so each one is closer to equal length, producing breaks that look chosen rather than accidental, the same instinct a designer applies manually in Figma.",
    riskWhenIgnored: "A two-line heading wraps to three words then one lonely orphaned word, and that ragged, unbalanced shape reads as unpolished even though the copy itself is fine.",
    implementationNotes: [
      "Apply text-wrap: balance to h1, h2, and h3 elements.",
      "Rely on it instead of manually inserting line breaks for short headings.",
      "Skip it on long, multi-sentence headings where the browser limit kicks in anyway.",
      "Check every heading at multiple viewport widths, since balance recalculates per width.",
    ],
    reviewPrompts: [
      "Do short headings avoid leaving a single orphaned word on the last line?",
      "Is text-wrap: balance applied to h1/h2/h3 elements?",
      "Do heading line breaks look intentional rather than accidental?",
    ],
  },
  "typo-13": {
    whyItMatters: "Balance evens out every line in a block, which gets expensive and unnecessary for longer copy; pretty wrapping instead only prevents the specific case of a lone short word stranded on the final line, leaving earlier lines at their natural browser-determined length. It targets captions and card copy where only the last line's orphan risk matters.",
    riskWhenIgnored: "A card description wraps cleanly except the last line drops to one dangling word, like today. sitting alone below a full paragraph, which reads as a layout glitch on repeat visits.",
    implementationNotes: [
      "Apply text-wrap: pretty to description, caption, and list item text.",
      "Use balance instead for short headings, not pretty.",
      "Never leave short-to-medium body copy on default wrap where orphans can appear.",
      "Check card grids specifically, since varying card widths surface orphans inconsistently.",
    ],
    reviewPrompts: [
      "Does card or caption copy avoid a single dangling word on its last line?",
      "Is text-wrap: pretty applied to description and list item text?",
      "Do earlier lines in the paragraph keep their natural length rather than being force-balanced?",
    ],
  },

  // ── Layout & Spacing ─────────────────────────────────────────────
  "layout-1": {
    whyItMatters: "The 4pt grid turns spacing into a shared vocabulary: every value is a multiple of the base unit, so any two components snap into alignment without negotiation. It also plays nicer with device pixel ratios — 4, 8, 16 scale cleanly at 1x, 2x, and 3x, while odd numbers like 13 round unpredictably. This is systemic scale design, not personal taste.",
    riskWhenIgnored: "Once one component uses 13px padding, every neighboring component built to the 4pt scale misaligns by a few pixels, and the drift compounds across nested containers until edges visibly stair-step down the page.",
    implementationNotes: [
      "Restrict every spacing value to the do list: 4, 8, 16, 24, 32, 48px.",
      "Reject 13px, 21px, 5px on sight — round to the nearest multiple of 4.",
      "Encode the scale in Tailwind config or CSS variables so arbitrary values need an explicit escape hatch.",
      "Audit existing components for legacy odd-numbered padding or margin and normalize them.",
    ],
    reviewPrompts: [
      "Does every margin and padding value divide evenly by 4?",
      "Do adjacent components share the same base spacing unit?",
      "Are there any hardcoded odd pixel values, like 13px or 5px, in the styles?",
    ],
  },
  "layout-2": {
    whyItMatters: "Line length governs how far the eye travels before jumping back to find the next line's start. At 45-75 characters, roughly 65ch, that return sweep stays short enough that readers rarely lose their place; past that range, saccade length and re-fixation errors climb.",
    riskWhenIgnored: "Setting width: 100% on a 27-inch monitor stretches a paragraph past 120 characters per line, so readers skip lines or reread the same one twice, and time-on-page for long-form content quietly drops.",
    implementationNotes: [
      "Cap body copy with max-w-prose, which targets roughly 65 characters per line.",
      "Never let paragraph containers inherit width: 100% on wide viewports.",
      "Test copy blocks at 1440px-plus widths, not just mobile breakpoints.",
      "Apply the cap to text content specifically, not to images, tables, or full-bleed sections.",
    ],
    reviewPrompts: [
      "Can you count roughly 45-75 characters per line of body text at the widest breakpoint?",
      "Does any paragraph stretch edge-to-edge on a large monitor?",
      "Is max-w-prose, or an equivalent character-based cap, applied to text containers?",
    ],
  },
  "layout-3": {
    whyItMatters: "This is Gestalt's law of proximity: the eye reads spatial closeness as relatedness before it reads borders or lines. A tight gap-2 between a label and its input signals these belong together; a wider gap-6 before the next label signals a new group starts here.",
    riskWhenIgnored: "Set every gap to gap-4 uniformly and a label ends up equidistant from its own input and the next label, so users can't tell which label belongs to which field and start mis-tabbing between them.",
    implementationNotes: [
      "Use gap-2 between a label and its input, and gap-6 before the next label, per the do example.",
      "Never apply one flat gap value, like gap-4 everywhere, across both relationships.",
      "Make the gap between groups clearly larger than the gap inside a group.",
      "Rely on space, not divider lines, as the primary grouping signal.",
    ],
    reviewPrompts: [
      "Is the gap between a label and its input visibly smaller than the gap before the next label?",
      "Could a user tell which label belongs to which field with all borders removed?",
      "Are related items grouped by whitespace rather than by a line separator?",
    ],
  },
  "layout-4": {
    whyItMatters: "A play triangle's mass sits toward its point, so centering its bounding box mathematically leaves the visual weight skewed left; nudging it 1-2px right realigns perceived center with true center. This is the same optical-weight correction typefaces apply to round letterforms that overshoot the baseline.",
    riskWhenIgnored: "Center a play icon by its bounding box alone and it reads as off-center inside its button, a defect reviewers will flag even when the CSS math is technically correct.",
    implementationNotes: [
      "Nudge asymmetric icons, like the Play triangle, 1-2px toward their visual weight, per the do example.",
      "Don't trust absolute centering, such as margin: auto, as the final check for asymmetric shapes.",
      "Verify alignment by eye, not by inspecting computed box dimensions.",
      "Apply the same correction to any icon with uneven mass: arrows, chevrons, triangles.",
    ],
    reviewPrompts: [
      "Does the icon look centered when you squint at it, not just measure it?",
      "Has an asymmetric icon like Play been nudged off mathematical center?",
      "Would swapping in a symmetric icon reveal a now mis-centered container?",
    ],
  },
  "layout-5": {
    whyItMatters: "Text is wider than it is tall, so equal padding on both axes, like py-2 px-2, leaves a button that reads as visually square and cramped around its label. Keeping horizontal padding at 1.5x to 2x vertical, such as py-2 px-4 (8px / 16px), restores a proportion that matches the text's own shape.",
    riskWhenIgnored: "Apply py-2 px-2 to a text button and the label crowds both edges evenly while vertical space looks generous by comparison, giving the button a squat, tile-like shape instead of one that reads as clickable.",
    implementationNotes: [
      "Default to py-2 px-4, 8px vertical and 16px horizontal, matching the do example.",
      "Keep horizontal padding between 1.5x and 2x the vertical value for any text button.",
      "Never apply equal padding, like py-2 px-2, to a button containing a text label.",
      "Reserve equal padding for icon-only buttons, where the content is symmetric.",
    ],
    reviewPrompts: [
      "Is the horizontal padding noticeably larger than the vertical padding on this button?",
      "Does the button look square or cramped rather than proportioned around its label?",
      "Do icon-only buttons use different, equal padding compared to text buttons?",
    ],
  },
  "layout-6": {
    whyItMatters: "Line height includes leading above and below the letterforms, but an icon carries no leading of its own, so centering it against full line height sits it a few pixels lower than the text's cap height. Aligning to cap height instead matches where the letters' visual mass actually starts.",
    riskWhenIgnored: "Flex-center an icon against a label with generous line-height and the icon appears to float slightly below the text, a mismatch obvious in any icon-plus-label button or nav item once you look for it.",
    implementationNotes: [
      "Align icons to the text's cap height, not the full line-height box, per the rule.",
      "Don't assume flex-center, align-items: center, is correct by default — it fails when line-height runs large relative to font size.",
      "Check alignment visually against the top of capital letters, not against computed heights.",
      "Adjust with a small negative margin or transform when auto-centering falls short.",
    ],
    reviewPrompts: [
      "Does the icon's optical center line up with the cap height of the adjacent text?",
      "Does the icon look like it's sitting slightly low or high relative to the label?",
      "Was the alignment verified by eye rather than trusting flex-center alone?",
    ],
  },
  "layout-7": {
    whyItMatters: "Separation between sections needs one contrast channel, not two stacked together. A white card on a light-grey background already reads as a distinct region through figure-ground contrast; adding a border on top is redundant and starts competing with the content it's meant to frame.",
    riskWhenIgnored: "Wrap a white card in a grey border on an already-white page and the border becomes the loudest element on screen, drawing more attention than the content it boxes in, while the page reads as a grid of boxes rather than a layout.",
    implementationNotes: [
      "Separate sections with a background-color shift, like a white card on a light-grey page, per the do example.",
      "Drop the border when a background-color difference already exists.",
      "Reserve borders for cases with no background contrast available.",
      "Test by removing borders temporarily — if sections still read as separate, the border wasn't needed.",
    ],
    reviewPrompts: [
      "Is background-color contrast, rather than a border, doing the work of separating this section?",
      "Would sections still look distinct if every border line were removed?",
      "Is there a box with a border sitting on top of an already-contrasting background?",
    ],
  },
  "layout-8": {
    whyItMatters: "A layout region reads as one system when a single gap value repeats in every direction; the eye calibrates to that rhythm and treats any deviation as a mistake, not a variation. Mixing gap-6 rows with gap-3 columns breaks that calibration because the grid no longer has one unit to measure by.",
    riskWhenIgnored: "Set rows to gap-6 and columns to gap-3 in the same card grid and the layout reads as accidentally uneven, with cards sitting closer together side-to-side than top-to-bottom for no visible reason.",
    implementationNotes: [
      "Pick one gutter size per layout region and apply it in every direction, like gap-6 throughout in the do example.",
      "Don't mix values, such as gap-6 rows with gap-3 columns, within the same grid.",
      "Extend the same gutter value to nested grids in that region unless there's a clear hierarchy reason not to.",
      "Audit grid and flex gap properties for row-gap versus column-gap mismatches.",
    ],
    reviewPrompts: [
      "Is the same gap value used for both rows and columns in this grid?",
      "Do any two adjacent grids in the same region use different gutter sizes?",
      "Does the spacing rhythm feel like one system rather than several stitched together?",
    ],
  },
  "layout-9": {
    whyItMatters: "Padding that stays fixed while the viewport shrinks eats a growing share of available width, so p-6 on a 1440px screen and the same p-6 on a 375px phone aren't equivalent — one is a rounding error, the other is a fifth of the screen. Scaling padding down per breakpoint, p-6 lg down to p-4 md down to p-3 sm, keeps the proportion constant, not just the pixel value.",
    riskWhenIgnored: "Ship p-6 at every breakpoint and on a small phone the content area shrinks to a narrow column squeezed between two thick padding bands, forcing text to wrap awkwardly or truncate.",
    implementationNotes: [
      "Scale padding down per breakpoint: p-6 at lg, p-4 at md, p-3 at sm, matching the do example.",
      "Never hardcode one padding value, like p-6, across every breakpoint.",
      "Reduce margins alongside padding, not just container padding, for full proportional scaling.",
      "Check the smallest supported viewport first — that's where fixed spacing does the most damage.",
    ],
    reviewPrompts: [
      "Does padding visibly shrink from desktop to tablet to mobile breakpoints?",
      "Is any padding or margin value identical at every breakpoint?",
      "Does content on the smallest screen retain a reasonable amount of usable width?",
    ],
  },
  "layout-10": {
    whyItMatters: "Section gaps that follow a defined scale, like 24 to 48 to 72, double at each step, so the jump between any two gaps stays proportional and predictable. A sequence like gap-6 to gap-10 to gap-14 increases by uneven absolute amounts, leaving no consistent ratio for the eye to lock onto.",
    riskWhenIgnored: "Space sections at gap-6, then gap-10, then gap-14 and the page's rhythm feels arbitrary — sections seem randomly spaced apart, and users can't sense which gaps mark a major break versus a minor one.",
    implementationNotes: [
      "Use a multiplicative scale for section gaps, like gap-6 to gap-12 to gap-18, per the do example.",
      "Avoid arbitrary increments, such as gap-6, gap-10, gap-14, that share no consistent ratio.",
      "Reserve the largest gap in the scale for major section breaks, and the smallest for closely related content.",
      "Document the scale once, in spacing tokens, so every page reuses the same three or four-step system.",
    ],
    reviewPrompts: [
      "Do the gaps between sections follow a consistent, multiplying scale?",
      "Can you tell which section breaks are major versus minor just from the gap size?",
      "Are any two adjacent section gaps an arbitrary, non-scaled amount apart?",
    ],
  },
  "layout-11": {
    whyItMatters: "Z-index only resolves relative to other values within the same stacking context, so arbitrary numbers like 9999 guarantee nothing — a new stacking context can bury it under a lower value elsewhere. A defined scale, base 0, dropdown 100, sticky 200, modal 300, toast 400, keeps stacking order legible and stops ad hoc escalation.",
    riskWhenIgnored: "Once one component ships with z-index: 9999 to win, the next fix ships 99999 to beat it, and eventually a toast renders behind a modal because nobody knows which arbitrary number currently wins.",
    implementationNotes: [
      "Assign layers from the fixed scale only, z-dropdown 100, z-modal 300, and so on, per the do example.",
      "Ban arbitrary values like z-index: 9999 anywhere in the codebase.",
      "Centralize the scale as CSS variables or design tokens so every component references the same source.",
      "Add new layers between existing steps, like 150, rather than inventing values above the top of the scale.",
    ],
    reviewPrompts: [
      "Does every stacked element, dropdown, sticky header, modal, toast, use a value from the defined scale?",
      "Is there any arbitrary z-index value like 9999 anywhere in the styles?",
      "Do toasts and modals stack in the correct visual order when triggered together?",
    ],
  },

  // ── Color & Depth ────────────────────────────────────────────────
  "color-1": {
    whyItMatters: "The 60-30-10 split works because it establishes a clear visual hierarchy before anyone reads a word: the eye scans large neutral fields first, then the 30% secondary layer, then lands on the 10% primary accent last. That ordering mirrors how attention naturally moves from ground to figure. Break the ratio and every element competes for the same weight.",
    riskWhenIgnored: "When primary color creeps past 10% into headers and sidebars, users can no longer tell which blue element is the actual call to action versus decoration, so click-through drops on the real button.",
    implementationNotes: [
      "Audit every screen for blue usage - it should read as rare, not ambient.",
      "Keep backgrounds and body text in the 60% neutral layer.",
      "Move borders and subtitles into the 30% secondary layer.",
      "Reserve primary color for one action per view, not headers or nav.",
    ],
    reviewPrompts: [
      "Does the primary color appear in only one or two places on screen?",
      "Is the background/text neutral rather than tinted?",
      "Can you identify the single most important action in under 2 seconds?",
    ],
  },
  "color-2": {
    whyItMatters: "Pure #000000 against a white background creates the maximum possible luminance jump the eye can register, which is why text set in true black vibrates and causes eye strain during long reads. Swapping in neutral-900 (#0f172a) lowers the luminance delta while keeping contrast well above WCAG minimums, trading harshness for legibility.",
    riskWhenIgnored: "Long-form text set in #000000 on white produces visible halation around letterforms, and users report the page feels harsh or fatiguing after a few paragraphs.",
    implementationNotes: [
      "Replace any #000000 text or background with neutral-900 (#0f172a).",
      "Check every dark-mode surface and body-copy color token for stray #000.",
      "Pair the dark neutral with off-white backgrounds, not pure #ffffff, for less strain.",
      "Grep the codebase for #000000 and #000 literals before shipping.",
    ],
    reviewPrompts: [
      "Is any text or background using literal #000000?",
      "Does dark text look soft rather than vibrating against its background?",
      "Are dark tokens using a blue-grey like neutral-900 instead of true black?",
    ],
  },
  "color-3": {
    whyItMatters: "In physical environments, shadows are tinted by ambient bounce light and the color of nearby surfaces, never neutral grey - that's why shadow-indigo-500/20 under an indigo element reads as believable while shadow-black/20 reads as a flat drop-shadow filter. Mixing brand hue into the shadow simulates that light-source physics instead of faking depth with pure darkness.",
    riskWhenIgnored: "A grey shadow under a saturated colored card looks pasted on rather than lifted off the page, making elevated elements feel like flat cutouts instead of physical objects.",
    implementationNotes: [
      "Swap shadow-black/20 for a hue-matched shadow like shadow-indigo-500/20.",
      "Match the shadow tint to the element's own dominant color, not a global default.",
      "Keep opacity low (10-20%) so the tint reads as ambient, not a color cast.",
      "Test shadows against both light and dark surfaces for believability.",
    ],
    reviewPrompts: [
      "Does the shadow under a colored element pick up that element's hue?",
      "Would the shadow look wrong if swapped for flat black?",
      "Does the elevated element feel like it is floating rather than pasted on?",
    ],
  },
  "color-4": {
    whyItMatters: "Red, green, and yellow carry pre-attentive semantic association - users decode them as error, success, and warning before reading any label, a learned pattern from traffic lights and status systems everywhere. Using red decoratively on a Like button hijacks that association and forces the brain to momentarily interpret the icon as an alert.",
    riskWhenIgnored: "A red heart icon on a Like button makes new users hesitate or read it as a delete/error affordance, measurably increasing misclicks and support questions about broken states.",
    implementationNotes: [
      "Recolor decorative icons like Like buttons in blue, purple, or brand color.",
      "Reserve red exclusively for error states and destructive actions.",
      "Reserve green exclusively for success confirmations, not generic accents.",
      "Audit every red/green/yellow instance and ask if it is truly status.",
    ],
    reviewPrompts: [
      "Is red used anywhere besides errors or destructive actions?",
      "Is green used anywhere besides success confirmation?",
      "Would a user mistake a decorative icon for a system status signal?",
    ],
  },
  "color-5": {
    whyItMatters: "Border weight should track the same contrast step-down as your text hierarchy: if body text sits at neutral-900, a border at neutral-200 stays clearly subordinate, while neutral-400 jumps too many steps and starts competing with content for attention. This is simultaneous contrast at work - a border reads heavier next to light fills than the same value would in isolation.",
    riskWhenIgnored: "Neutral-400 borders around every card and input create a grid of heavy lines that visually outweighs the text inside, so the layout reads as a spreadsheet of boxes rather than content.",
    implementationNotes: [
      "Set default dividers and card borders to neutral-200.",
      "Never jump to neutral-400 for standard borders - reserve heavier steps for emphasis.",
      "Check border weight relative to your body text color, not in isolation.",
      "Scan the page for any border that draws the eye before the content does.",
    ],
    reviewPrompts: [
      "Do borders fade into the background rather than framing it heavily?",
      "Is any border darker than neutral-200 without a specific reason?",
      "Does content draw more attention than the dividers around it?",
    ],
  },
  "color-6": {
    whyItMatters: "An outline button has no fill to separate it from the page, so its border is the only edge cue - neutral-100 sits too close in luminance to a white surface to register, while neutral-300 clears the perceptual threshold needed for double contrast against both the background and the label text. Interactive borders need a stronger step than passive dividers doing decorative separation.",
    riskWhenIgnored: "An outline button styled with border-neutral-100 nearly disappears on a white card, so users hover past it without realizing it is clickable and abandon the flow looking for the real action.",
    implementationNotes: [
      "Set outline buttons and input fields to border-neutral-300.",
      "Never reuse the subtle neutral-100 divider border on interactive elements.",
      "Verify the border is visible at a glance on both white and off-white surfaces.",
      "Increase to neutral-400+ only if the surface itself is already off-white.",
    ],
    reviewPrompts: [
      "Can you spot the outline button's border without focusing hard?",
      "Is the interactive border visibly darker than passive divider borders?",
      "Does the input field read as clickable/editable at a glance?",
    ],
  },
  "color-7": {
    whyItMatters: "Shifting hue on hover, like blue to green, forces the brain to re-identify the color category entirely, while stepping blue-600 to blue-700 only changes lightness within a category already recognized. Staying within one hue keeps the interaction legible as the same element deepening, not a different colored object appearing.",
    riskWhenIgnored: "A button that shifts from blue to green on hover reads as a state change - like a status flipping to success - rather than a hover effect, confusing users about whether an action already completed.",
    implementationNotes: [
      "Step hover states within the same hue, e.g. blue-600 to blue-700.",
      "Never cross into a different color family like blue to green on interaction.",
      "Adjust only lightness or saturation for hover/active/pressed states.",
      "Check every interactive color transition for accidental hue shifts.",
    ],
    reviewPrompts: [
      "Does the hover color stay in the same hue family as the resting state?",
      "Could the hover state be mistaken for a status change like success?",
      "Is only the lightness/saturation shifting on interaction, not the hue?",
    ],
  },
  "color-8": {
    whyItMatters: "Dark mode is not photographic negative - it requires flipping the elevation model so lighter surfaces read as closer (gray-900 base, gray-800 card, lighter still for modals), while brand colors need desaturating because fully saturated hues vibrate painfully against dark backgrounds due to simultaneous contrast. Literally inverting filters ignores both of these perceptual shifts.",
    riskWhenIgnored: "Running filter: invert(1) on a page turns photos into film negatives and makes saturated brand blue glow like a highlighter, making the whole UI look broken rather than themed.",
    implementationNotes: [
      "Build a real dark palette: gray-900 background, gray-800 card surfaces.",
      "Desaturate brand colors specifically for dark mode, do not reuse light-mode hex values.",
      "Make elevated surfaces lighter than their base, not darker as in light mode.",
      "Never apply filter: invert(1) to the page as a shortcut.",
    ],
    reviewPrompts: [
      "Do elevated cards appear lighter than the page background in dark mode?",
      "Are brand colors visibly desaturated compared to the light theme?",
      "Do images and photos render normally, not as inverted negatives?",
    ],
  },
  "color-9": {
    whyItMatters: "WCAG AA sets a measurable floor - 4.5:1 luminance contrast for body text and 3:1 for large text - because below those ratios a meaningful percentage of users with low vision physically cannot resolve the letterforms. Light grey like #aaa on #fff sits around 2.3:1, which is a guess that fails the math, not a subjective style choice.",
    riskWhenIgnored: "Body copy set in #aaa on white measures under 2.5:1 contrast, so users with even mild vision impairment squint or give up reading it, and automated accessibility audits flag the page as non-compliant.",
    implementationNotes: [
      "Run every text/background pairing through a contrast checker, target 4.5:1 for body.",
      "Allow 3:1 only for large text (18px+ bold or 24px+ regular).",
      "Replace guessed greys like #aaa on #fff with a checked, darker value.",
      "Re-check contrast whenever a background or text color token changes.",
    ],
    reviewPrompts: [
      "Has every text color been checked against a contrast ratio tool?",
      "Does body text measure at least 4.5:1 against its background?",
      "Is any light grey text on white used without a verified ratio?",
    ],
  },
  "color-10": {
    whyItMatters: "Deriving hover and tint states from opacity, like bg-blue-500/10, keeps every state mathematically tied to one source color, so the palette scales without designers inventing a new hex like #e8f0fe for each surface. This is a systems argument, not just convenience: opacity states stay correct automatically if the brand color ever changes.",
    riskWhenIgnored: "A codebase full of one-off hex tints like #e8f0fe, #eaf1fd, #e6effd for slightly different components will drift out of sync the moment the brand blue updates, leaving stale-looking mismatched tints scattered across the app.",
    implementationNotes: [
      "Replace custom tint hexes like #e8f0fe with bg-blue-500/10.",
      "Derive hover, pressed, and subtle backgrounds all from opacity of one base color.",
      "Never hand-pick a new hex for a state that opacity could produce.",
      "Search the codebase for one-off light-tint hex values and consolidate them.",
    ],
    reviewPrompts: [
      "Are tint backgrounds built from opacity of the base color, not new hexes?",
      "Would updating the brand color automatically update all its tint states?",
      "Are there multiple near-identical light-blue hexes scattered in the styles?",
    ],
  },
  "color-11": {
    whyItMatters: "Photographic content often has soft or light-colored edges that blend into a light UI background, so a subtle inset outline is needed purely for edge definition, not decoration. Pure black at low opacity (outline-black/10) works in light mode because it darkens any edge color uniformly, while pure white/10 does the same job in dark mode - a mid-tone like slate-900/10 fails to invert correctly and looks muddy on dark surfaces.",
    riskWhenIgnored: "A light product photo dropped on a white card with no outline, or the wrong slate-900/10 outline in dark mode, has invisible edges that bleed into the surrounding page, making the image look uncropped or accidentally transparent.",
    implementationNotes: [
      "Apply outline-black/10 to images in light mode for edge definition.",
      "Switch to outline-white/10 for the same images in dark mode.",
      "Never substitute a mid-tone like slate-900/10, which does not adapt across themes.",
      "Check images with light and dark edges against both theme backgrounds.",
    ],
    reviewPrompts: [
      "Does every image have a subtle outline separating it from the background?",
      "Does the outline switch from black-based to white-based in dark mode?",
      "Are any images using a slate or grey outline instead of pure black/white?",
    ],
  },
  "color-12": {
    whyItMatters: "A layered shadow stack like 0 0 0 1px rgb(0 0 0 / 6%), 0 2px 4px rgb(0 0 0 / 4%) supplies both edge definition and perceived elevation in one property, mimicking how ambient occlusion softens real-world edges - a hard border can only ever supply the edge, not the lift. This lets a card look raised without the visual weight of a stroke competing with its content.",
    riskWhenIgnored: "Stacking a heavy 1px border on every card in a dense list, like a table of nested panels, makes the layout look like a spreadsheet of boxes with no sense of which surface actually sits above another.",
    implementationNotes: [
      "Replace heavy card borders with a layered shadow like 0 0 0 1px rgb(0 0 0 / 6%), 0 2px 4px rgb(0 0 0 / 4%).",
      "Use the 1px inset layer for edge crispness and the blurred layer for elevation.",
      "Drop the hard border entirely once the shadow stack reads clearly.",
      "Reserve visible borders for cases needing a hard boundary, like selected states.",
    ],
    reviewPrompts: [
      "Do raised cards use layered shadows instead of a hard border?",
      "Can you tell which surface is elevated without a visible stroke?",
      "Does the card edge look soft and lifted rather than sharply outlined?",
    ],
  },

  // ── Components & Actions ─────────────────────────────────────────
  "comp-1": {
    whyItMatters: "One Primary Action per screen prevents decision paralysis: users scan for the single filled button as the obvious next step. When multiple filled buttons compete, the eye has no anchor and hesitates. The 1 Filled + 2 Ghost pattern encodes a visual hierarchy that maps directly to decision importance.",
    riskWhenIgnored: "Three filled buttons side-by-side force users to read every label before acting, slowing task completion and increasing wrong-button clicks in high-stakes flows like checkout.",
    implementationNotes: [
      "Set exactly one button to Filled per screen and demote the rest to Outline or Text Link.",
      "Reserve the Filled slot for the action you want most users to take.",
      "Audit forms and dialogs for accidental duplicate Filled buttons before shipping.",
      "If two actions feel equally important, that signals a flow problem, not a styling one.",
    ],
    reviewPrompts: [
      "Is there exactly one Filled Button visible on this screen?",
      "Are secondary actions styled as Ghost or Text Link, not Filled?",
      "Does the Filled button match the action most users should take next?",
    ],
  },
  "comp-2": {
    whyItMatters: "A giant red button sitting in the main UI primes users for loss aversion anxiety on every glance, yet its constant visibility also breeds habituation, so the warning eventually stops registering. Splitting the action into a neutral grey trigger and a red confirm step puts the alarm exactly once, at the moment it can prevent a mistake.",
    riskWhenIgnored: "A prominent red Delete button next to routine controls gets hit by muscle memory or a stray tap, and without a confirm step the destructive action fires immediately, destroying data with no recovery path.",
    implementationNotes: [
      "Style the initial trigger as a Grey Delete button, matching surrounding secondary actions.",
      "Move the red styling exclusively to the Confirm button inside the modal.",
      "Never let the red state appear anywhere outside the confirmation step.",
      "Add a short description of what will be lost inside the confirmation modal.",
    ],
    reviewPrompts: [
      "Is the initial Delete trigger grey rather than red?",
      "Does clicking Delete open a confirmation step before anything is removed?",
      "Is red reserved only for the final Confirm button?",
    ],
  },
  "comp-3": {
    whyItMatters: "Concentric corners only read as parallel when Outer Radius equals Inner Radius plus Padding, a geometric nesting rule borrowed from how circles offset from a shared center. Break the formula and the eye detects the mismatch as visual noise even if it cannot name the problem.",
    riskWhenIgnored: "An outer radius of 4px wrapped around an inner radius of 4px with padding between them creates a pinched, uneven gap that looks like a spacing bug rather than an intentional design choice.",
    implementationNotes: [
      "Calculate Outer Radius as Inner Radius plus Padding, e.g. Outer 12px = Inner 4px + Padding 8px.",
      "Never set outer and inner radius to the same value when padding sits between them.",
      "Recalculate the outer radius any time padding changes on a nested component.",
      "Check card-in-card, tab-in-container, and badge-in-button patterns specifically.",
    ],
    reviewPrompts: [
      "Does the outer radius equal inner radius plus the padding between them?",
      "Do the nested corners look concentric rather than pinched?",
      "Was the radius recalculated after any recent padding change?",
    ],
  },
  "comp-4": {
    whyItMatters: "Shape carries meaning before users read a single label: circles read as organic and human, rectangles read as structured content. Putting a person in a circle and a document in a rect lets users sort avatars from files at a glance, relying on shape recognition instead of parsing text.",
    riskWhenIgnored: "A user avatar rendered as a square gets mentally grouped with file thumbnails and folder icons, so users skim past a real person's profile picture thinking it is just another content tile.",
    implementationNotes: [
      "Render every user avatar as a circle, with no exceptions for team or group avatars.",
      "Keep content types like documents and projects as squares or rects.",
      "Never crop a user photo into a square shape, even for compact list rows.",
      "Apply the same circle treatment consistently across profile, comment, and mention UI.",
    ],
    reviewPrompts: [
      "Is every user avatar displayed as a circle?",
      "Are document or project thumbnails shown as squares or rects, not circles?",
      "Is the circle-for-people rule applied consistently across the whole screen?",
    ],
  },
  "comp-5": {
    whyItMatters: "Modals interrupt and hide the background, which fits a short focused decision like a delete confirmation but actively works against tasks that need context, like editing a profile. Drawers keep the underlying screen visible so users retain their mental model of where they are while working through longer content.",
    riskWhenIgnored: "Cramming complex settings into a small modal forces users to scroll a cramped box while losing sight of the page they came from, leading to abandoned edits and repeated re-opening of the dialog.",
    implementationNotes: [
      "Use a Modal only for short, focused decisions like Delete Confirm.",
      "Use a Drawer for context-heavy tasks like Edit Profile where background visibility matters.",
      "Treat rising form field count as a signal to move from Modal to Drawer.",
      "Never shrink a multi-section settings form into a small modal to save engineering time.",
    ],
    reviewPrompts: [
      "Is this Modal reserved for a short, single decision rather than a complex task?",
      "Does the Drawer keep the background page visible while editing?",
      "Would this task feel cramped if forced into a small modal?",
    ],
  },
  "comp-6": {
    whyItMatters: "Toasts float above the whole screen and fit system-level updates like a save confirmation, but that same detachment from any specific element makes them useless for pointing at one wrong field. Inline errors sit right where the mistake lives, so the fix location and the error message are never more than a glance apart.",
    riskWhenIgnored: "Showing an invalid email error as a toast leaves users staring at a form with no visible red flag, so they resubmit blind and the same toast reappears without ever revealing which field is wrong.",
    implementationNotes: [
      "Use a Toast for system-level updates like a network error or Saved confirmation.",
      "Use an Inline error directly beneath the field for issues like an invalid email.",
      "Never route field-specific validation errors through the toast system.",
      "Keep inline errors visible until the specific field is corrected.",
    ],
    reviewPrompts: [
      "Do system-level updates like save confirmations appear as toasts?",
      "Does the invalid email error show inline, next to the field itself?",
      "Is any field-specific error message sitting far from its field?",
    ],
  },
  "comp-7": {
    whyItMatters: "Recognition beats recall for only a handful of icons, like a trash can or a search glass, that decades of software have made truly universal. An archive icon without a label asks users to recall an uncommon meaning from memory, so pairing Icon plus Archive label turns a guess into instant recognition.",
    riskWhenIgnored: "An icon-only toolbar with an ambiguous archive glyph gets clicked hesitantly or hovered repeatedly as users try to decode its meaning, slowing down routine actions across the whole toolbar.",
    implementationNotes: [
      "Pair every ambiguous icon with a visible text label, like Icon + Archive.",
      "Reserve icon-only treatment for a short list of truly universal icons.",
      "Test each icon by asking if a first-time user could name its action unaided.",
      "Add labels to toolbar actions rather than relying on tooltips alone.",
    ],
    reviewPrompts: [
      "Does the archive action show both an icon and a text label?",
      "Is the toolbar free of icon-only buttons for non-universal actions?",
      "Could a first-time user name each icon's action without hovering?",
    ],
  },
  "comp-8": {
    whyItMatters: "A disabled control with no explanation breaks the user's mental model of cause and effect, since nothing on screen explains why the button will not respond. Adding a tooltip or helper text restores that missing link, turning a dead end into a clear next step toward enabling the action.",
    riskWhenIgnored: "A greyed-out submit button with no accompanying text leaves users clicking it repeatedly or assuming the page is broken, generating support tickets that could have been avoided with one line of helper text.",
    implementationNotes: [
      "Pair every disabled button with helper text or a tooltip explaining why.",
      "State what the user needs to do to enable the control, not just that it is disabled.",
      "Never ship a greyed-out button with zero surrounding context.",
      "Place the helper text close enough to the button that the connection is obvious.",
    ],
    reviewPrompts: [
      "Does this disabled button have visible helper text or a tooltip?",
      "Does that text explain what would enable the button?",
      "Is any greyed-out control missing an explanation nearby?",
    ],
  },
  "comp-9": {
    whyItMatters: "A static button during an async submit gives no feedback that the click registered, so users interpret silence as failure and click again, firing duplicate requests. A spinner plus disabled state closes that feedback loop immediately, showing the system received the action and is working on it.",
    riskWhenIgnored: "A save button that stays static and clickable during submission invites a second click before the first request resolves, creating duplicate records or double-charged actions on the backend.",
    implementationNotes: [
      "Swap the button label for a spinner the instant submission starts.",
      "Disable the button during submit so re-clicks are impossible.",
      "Restore the normal state only after the async action resolves or fails.",
      "Never leave a submit button static and clickable while a request is in flight.",
    ],
    reviewPrompts: [
      "Does the button show a spinner while the async action is in progress?",
      "Is the button disabled during submission, blocking a second click?",
      "Does the button return to normal only after the request completes?",
    ],
  },
  "comp-10": {
    whyItMatters: "Same-context icons need one shared size because the eye reads size variance as a signal of importance or hierarchy, even when none is intended. Mixing 16px, 20px, and 24px icons in one toolbar sends a false hierarchy signal, making users hunt for meaning in a difference that is really just inconsistency.",
    riskWhenIgnored: "A toolbar mixing 16px and 24px icons makes some actions look more prominent than others for no reason, causing users to misjudge which controls are primary versus minor.",
    implementationNotes: [
      "Standardize every toolbar icon to a single size, like 20px, across the context.",
      "Audit nav bars and toolbars for stray 16px or 24px icons mixed in.",
      "Apply size changes at the icon-set level, not per individual icon.",
      "Keep size variance reserved for genuinely different contexts, like nav versus inline.",
    ],
    reviewPrompts: [
      "Are all icons in this toolbar rendered at the same size?",
      "Is there any 16px, 20px, or 24px icon mixed in with a different size nearby?",
      "Does icon size stay consistent across this entire navigation context?",
    ],
  },
  "comp-11": {
    whyItMatters: "Fitts's law says a larger, closer target is faster and easier to hit, so a full card click area turns the entire surface into one generous target instead of forcing precision onto a small title link. Shrinking the target to just the title text ignores decades of pointing-device research for no visual gain.",
    riskWhenIgnored: "A card where only the title text is clickable makes users miss the target repeatedly when clicking the image or whitespace, producing frustrated re-clicks and a sense that the card is unresponsive.",
    implementationNotes: [
      "Wrap the entire card in the click handler, not just the title text.",
      "Keep any internal links, like a secondary action button, as separate stop-propagation targets.",
      "Add a hover state across the full card to confirm the click area visually.",
      "Test by clicking the image and empty padding, not just the title.",
    ],
    reviewPrompts: [
      "Does clicking anywhere on the card, not just the title, trigger navigation?",
      "Is there a hover state confirming the full card is the target?",
      "Do secondary links inside the card still work independently of the card click?",
    ],
  },
  "comp-12": {
    whyItMatters: "Overlays trap users in a temporary context, so they need multiple redundant exits because different users reach for different habits: some hunt for an X button, others hit Escape, others click outside. Supporting the X button, backdrop click, and Escape key together respects all three mental models at once instead of forcing one.",
    riskWhenIgnored: "A modal with no close button that only responds to backdrop clicks leaves keyboard-first and touch users stuck, unable to find any visible way out and forced to refresh the page to escape.",
    implementationNotes: [
      "Add a visible X button to every modal, drawer, and popover.",
      "Wire backdrop click to close the overlay in addition to the X button.",
      "Bind the Escape key to close the overlay as a third redundant exit.",
      "Never ship an overlay relying on just one of these three close methods.",
    ],
    reviewPrompts: [
      "Is there a visible X button on this overlay?",
      "Does clicking the backdrop close the overlay?",
      "Does pressing Escape also close the overlay?",
    ],
  },

  // ── Forms & Inputs ───────────────────────────────────────────────
  "form-1": {
    whyItMatters: "Reading a top-aligned label takes one downward eye movement instead of the left-to-right jump a side label forces, so scanning stays on a single vertical axis. It also survives translation, since a German or Finnish label can wrap to two lines without colliding with the input box. On narrow viewports it is the only layout that does not force label truncation.",
    riskWhenIgnored: "A left-aligned label meets a long translated string and either truncates or wraps under the input, misaligning every field below it, so a German build shows staggered, unreadable rows.",
    implementationNotes: [
      "Place every label directly above its input, never to the left, even on desktop.",
      "Let labels wrap to a second line instead of truncating with an ellipsis.",
      "Keep label-to-input gap consistent across all fields (e.g. 4-8px).",
      "Test the layout with a long locale string like Rechnungsadresse.",
    ],
    reviewPrompts: [
      "Is every label positioned above its input rather than beside it?",
      "Does a long translated label wrap cleanly without overlapping the input?",
      "Is the label-to-input spacing consistent across all fields on the form?",
    ],
  },
  "form-2": {
    whyItMatters: "Placeholder text vanishes the instant a user types the first character, so the field's identity has to be held in working memory for the rest of the entry. Working memory for that kind of transient detail is fragile, especially on longer forms or when a user gets interrupted mid-field. A persistent label keeps the field's purpose visible the entire time, while the placeholder is free to hold a format example instead.",
    riskWhenIgnored: "A user tabs back to a field after being interrupted and finds an empty box with no label, so they cannot tell if it is the email field or the name field without retyping to check.",
    implementationNotes: [
      "Always render a persistent label like Email above the field, never only a placeholder.",
      "Reserve the placeholder for a format example, such as you@example.com.",
      "Never let the placeholder be the only text identifying the field.",
      "Check that the label remains visible after the user starts typing.",
    ],
    reviewPrompts: [
      "Does a persistent label stay visible after text is entered?",
      "Is the placeholder used only for an example format, not as the field name?",
      "Would the field's purpose still be clear if the input were fully typed over?",
    ],
  },
  "form-3": {
    whyItMatters: "Marking every field with a red asterisk adds a decoding step to each row: the eye has to check the symbol, recall what it means, then read the label. When 90% of fields share that state, the asterisk stops carrying information and just becomes visual noise the user has to filter out. Flagging only the exceptions, like Phone Number (Optional), cuts the number of symbols to parse to almost zero.",
    riskWhenIgnored: "A ten-field form shows nine asterisks and users start ignoring them entirely, so the one truly optional field gets filled in anyway, adding friction the form was trying to avoid.",
    implementationNotes: [
      "Label optional fields directly, e.g. Phone Number (Optional), and leave required fields unmarked.",
      "Remove asterisks from Name, Email, Address, City, and any other required field.",
      "Only introduce a required marker if optional fields outnumber required ones.",
      "Scan the form for asterisk density before shipping; more than one or two is a signal to invert the pattern.",
    ],
    reviewPrompts: [
      "Are optional fields the only ones carrying an explicit marker?",
      "Is the form free of asterisks on the majority of required fields?",
      "Can a user tell which fields are optional without reading every label?",
    ],
  },
  "form-4": {
    whyItMatters: "An input's width is a visual promise about how much content belongs inside it, so a short field like a zip code should look short and a long field like a street address should look long. This uses affordance the same way a small jar signals it holds less than a large one. Full-width inputs for short answers break that promise and leave users unsure if they missed something.",
    riskWhenIgnored: "A full-width zip code input makes users wonder whether they are supposed to enter more than five digits, so they hesitate or re-check the field before submitting.",
    implementationNotes: [
      "Size the Zip code input short and the Address input long, matching expected content length.",
      "Never stretch a short-answer field to full container width.",
      "Base width on the realistic maximum character count for that data type.",
      "Pair width sizing with format hints for fields like zip or phone.",
    ],
    reviewPrompts: [
      "Does the zip code field look noticeably shorter than the address field?",
      "Is any short-answer input stretched to the full width of the form?",
      "Does each input's width roughly match its expected content length?",
    ],
  },
  "form-5": {
    whyItMatters: "Radio buttons and checkboxes carry different built-in signifiers: a circle means one exclusive choice, a square means any number of independent choices. Pick Plan is a mutually exclusive decision, so it needs the circle. Swapping in checkboxes contradicts decades of learned convention and forces users to re-derive the selection rule from scratch instead of recognizing it instantly.",
    riskWhenIgnored: "A checkbox list for Pick Plan lets a user tap two plan options at once, so the form either silently keeps only the last selection or submits an invalid multi-plan state.",
    implementationNotes: [
      "Use radio buttons for Pick Plan since only one plan can be active at a time.",
      "Reserve checkboxes for choices where multiple selections are valid simultaneously.",
      "Never let two checkbox options in the same group behave as mutually exclusive.",
      "Audit any checkbox group that only ever allows one item checked; convert it to radios.",
    ],
    reviewPrompts: [
      "Are mutually exclusive choices like Pick Plan shown as radio buttons, not checkboxes?",
      "Can more than one option be selected where only one choice makes sense?",
      "Does the control's shape (circle vs square) match how many can be selected?",
    ],
  },
  "form-6": {
    whyItMatters: "A dropdown hides its options behind a click, so choosing among them takes two interactions and forces recall of what was inside before the user opened it. Radio buttons for a small set expose every option in one glance, turning the decision into simple recognition. Below roughly five options, the extra click a dropdown demands outweighs the space it saves.",
    riskWhenIgnored: "A three-option dropdown adds an unnecessary click and hides the choices from view, so users have to open the menu just to see what they can even pick.",
    implementationNotes: [
      "Render fewer than five options as radio buttons instead of a dropdown.",
      "Reserve dropdowns for long option lists where showing everything would overwhelm the layout.",
      "Count the actual number of choices before picking the control, not just habit.",
      "Watch for the extra click a dropdown adds and eliminate it below the five-option threshold.",
    ],
    reviewPrompts: [
      "If a field has fewer than five options, are they shown as radio buttons?",
      "Does choosing an option require an extra click to open a menu first?",
      "Are all available choices visible without any interaction for short lists?",
    ],
  },
  "form-7": {
    whyItMatters: "A switch's visual language comes from a physical light switch: flipping it fires an immediate, standalone effect, which is why Dark Mode as a switch feels correct. A checkbox instead signals select now, submit later, matching a form's pending Subscribe to newsletter choice that only takes effect on submit. Putting a switch on the newsletter option creates a signifier mismatch, implying an action that has not actually happened yet.",
    riskWhenIgnored: "A newsletter switch looks flipped on but the change has not been saved until the whole form submits, so a user assumes they are already subscribed and never notices if the submit fails.",
    implementationNotes: [
      "Use a switch for Dark Mode since it applies the moment it is toggled.",
      "Use a checkbox for Subscribe to newsletter since it only takes effect at submission.",
      "Never use a switch for any setting that waits on a separate submit action.",
      "Confirm each switch produces an immediate, visible effect the instant it is toggled.",
    ],
    reviewPrompts: [
      "Does every switch on the screen take effect immediately when toggled?",
      "Is Subscribe to newsletter presented as a checkbox rather than a switch?",
      "Are there any switches whose effect only applies after a later submit?",
    ],
  },
  "form-8": {
    whyItMatters: "Validating on every keystroke interrupts a user mid-thought, flashing an error while they have only typed the first character of a valid entry. Waiting until the field loses focus, on blur, respects the fact that a partial input is not yet a wrong input. This timing distinguishes between still-composing and finished, which is the actual moment an error becomes meaningful.",
    riskWhenIgnored: "An email field flashes an invalid error the instant a user types the letter j, so they see red before they have had a chance to finish typing their own address.",
    implementationNotes: [
      "Trigger validation errors only after the user leaves the field (on blur).",
      "Never fire an error message on the first character typed.",
      "Allow real-time positive feedback (like a checkmark) once the field is valid, but keep negative feedback deferred.",
      "Test by typing slowly into a required field and confirming no error appears mid-entry.",
    ],
    reviewPrompts: [
      "Does the error message wait until the user leaves the field before appearing?",
      "Does typing the first character ever trigger a visible error?",
      "Is validation timing consistent across every field on the form?",
    ],
  },
  "form-9": {
    whyItMatters: "A strict input pattern, like a two-digit month and year, is invisible until the user guesses wrong, so showing the MM / YY hint upfront turns a trial-and-error task into a fill-in-the-blank one. This front-loads the format constraint instead of revealing it only after a failed submission. Hints reduce the number of rejected attempts on fields with rigid formatting rules.",
    riskWhenIgnored: "A card expiry field with no hint gets entered as 2027 or March 27, both rejected, so the user resubmits multiple times before landing on the exact MM / YY pattern the system expects.",
    implementationNotes: [
      "Show the MM / YY hint directly in or beside any field with a strict format.",
      "Never leave a pattern-constrained field without an example of the expected format.",
      "Place the hint where it stays visible while typing, not just in a tooltip that disappears.",
      "Apply this to any rigid pattern: phone numbers, postal codes, card numbers.",
    ],
    reviewPrompts: [
      "Does every strictly formatted field show an example like MM / YY nearby?",
      "Is the hint visible while the user is actively typing, not hidden in a tooltip?",
      "Would a first-time user know the exact expected format without guessing?",
    ],
  },
  "form-10": {
    whyItMatters: "A single column keeps every field on one vertical scanning path, so the eye moves straight down without jumping across columns to figure out what comes next. Three columns of unrelated fields break that path and force the user to decide, at each row, whether to read left-to-right or top-to-bottom. Logically paired fields, like First and Last name, are the one exception because they read as a single unit rather than separate decisions.",
    riskWhenIgnored: "A three-column form places City next to Password next to Phone, so users lose their place mid-form and skip fields because the reading order is ambiguous.",
    implementationNotes: [
      "Stack unrelated fields in a single column rather than spreading them across three.",
      "Only pair fields side by side when they are logically linked, like City and State.",
      "Never split unrelated fields like address and payment info into parallel columns.",
      "Check the tab order matches the single top-to-bottom visual path.",
    ],
    reviewPrompts: [
      "Are unrelated fields stacked in a single column rather than side by side?",
      "Are only logically paired fields (like First/Last name) placed next to each other?",
      "Does the tab order move straight down without jumping between columns?",
    ],
  },
  "form-11": {
    whyItMatters: "Every keystroke a user does not have to make is friction removed, and a smart default like country auto-detected from locale replaces a 200-option scroll with a single confirmable guess. This works because most users match the common case, so pre-filling the likely answer turns a search task into a verification task. An empty dropdown with 200+ options forces every user to scroll and search even when the answer is predictable.",
    riskWhenIgnored: "A signup form shows an empty country dropdown with 200+ entries, so users scroll or type to search for their own country every single time, even though locale data already knows the answer.",
    implementationNotes: [
      "Auto-detect and pre-select country from the user's locale instead of leaving it empty.",
      "Default date pickers to today's date rather than a blank calendar.",
      "Never leave a long list (200+ options) unselected when a reasonable default is inferable.",
      "Always let the user override the default; never lock the pre-filled value.",
    ],
    reviewPrompts: [
      "Is the country field pre-filled based on locale instead of shown empty?",
      "Do date pickers default to today's date rather than opening blank?",
      "Can the user still change any pre-filled default before submitting?",
    ],
  },
  "form-12": {
    whyItMatters: "The absence of an error is not the same signal as confirmation of success, so a form that just resets silently leaves users to infer success from nothing happening. An explicit green checkmark with Saved successfully closes the loop the user opened by submitting, giving positive proof rather than an inferred guess. This matters most after actions with real consequences, where uncertainty about whether it worked drives repeat submissions.",
    riskWhenIgnored: "A settings form resets silently after saving, so the user assumes it failed and clicks submit again, potentially double-processing the update.",
    implementationNotes: [
      "Show a green checkmark with the message Saved successfully after a successful submission.",
      "Never let the form just reset silently as the only sign of completion.",
      "Keep the success state visible long enough to register, not a flash reset.",
      "Apply this to any state-changing action, not just full-page form submits.",
    ],
    reviewPrompts: [
      "Does a successful submission show explicit confirmation like a checkmark and message?",
      "Is silent form reset ever the only feedback given after submitting?",
      "Does the success message stay visible long enough for the user to notice it?",
    ],
  },

  // ── System & Logic ───────────────────────────────────────────────
  "sys-1": {
    whyItMatters: "Perceived-performance research shows a grey layout pulse mimicking the final content structure reads as progress in motion, while a spinning wheel is an abstract token unrelated to what is loading. Skeletons prime the eye for where text and images will land, cutting perceived wait time even when actual load time is identical.",
    riskWhenIgnored: "A giant spinner gives no sense of layout or progress, so waits over a couple seconds feel longer and users bounce, visible as repeated reload clicks during load.",
    implementationNotes: [
      "Replace spinners with grey bars matching the shape of each content block, image, title, body.",
      "Pulse the bars at a slow, consistent rate (1.5-2s cycle) so it reads as alive, not stuck.",
      "Match skeleton block dimensions to real content so nothing shifts when it swaps in.",
      "Swap skeleton for content directly, never fade to blank first.",
    ],
    reviewPrompts: [
      "Does the loading state show grey bars shaped like the final layout instead of a spinner?",
      "Does the skeleton match the real content dimensions with no layout jump on load?",
      "Is there any full-screen spinner used for initial content loading?",
    ],
  },
  "sys-2": {
    whyItMatters: "Every empty state is a moment of doubt: did something break, or is there genuinely nothing here yet. The three-part structure, what is missing, why, and how to fix it, turns a dead end into a next action, shown by No Projects paired with a Create Project button rather than a bare white box.",
    riskWhenIgnored: "A blank white box leaves users unsure if the page is broken or still loading, so they abandon the screen or file a support ticket instead of taking the obvious next action.",
    implementationNotes: [
      "Pair every empty state with an explicit message like No Projects plus a Create Project button.",
      "State what is missing in the heading, not just a vague icon.",
      "Add a one-line reason when relevant, such as no results match your filters.",
      "Always include a primary action button, never leave the fix implicit.",
    ],
    reviewPrompts: [
      "Does the empty screen name what is missing instead of showing a blank box?",
      "Is there a visible button or link telling the user how to fix it?",
      "Would a first-time user know this state is intentional, not a bug?",
    ],
  },
  "sys-3": {
    whyItMatters: "Fitts's law states that time to hit a target is a function of its size and distance, so a 44x44px minimum keeps taps fast and error-free on coarse pointers like fingertips. A 40px button plus margin clears this bar; a bare text link with no padding forces precise aiming, especially on mobile.",
    riskWhenIgnored: "Small unpadded tap targets cause mis-taps on adjacent elements, visible as users repeatedly tapping the wrong row or link on touch devices.",
    implementationNotes: [
      "Size every tappable control to at least 44x44px, using the 40px button plus margin pattern as baseline.",
      "Add invisible padding around small icons or links rather than shrinking the visual size.",
      "Increase spacing between adjacent targets so accidental taps hit only one element.",
      "Test specifically on pointer-coarse touch breakpoints, not just mouse.",
    ],
    reviewPrompts: [
      "Is every tappable element at least 44x44px including padding?",
      "Are text links given padding rather than left as bare underlined text?",
      "On a touch screen, can adjacent targets be tapped without hitting the wrong one?",
    ],
  },
  "sys-4": {
    whyItMatters: "Temporal distance changes how people process time: recent events are judged relative to now, 2 hours ago, while distant ones need an anchor in absolute time, 12 Jan 2024, to stay meaningful. Activity feeds benefit from relative recency cues; historical records need the fixed date so context survives after the moment passes.",
    riskWhenIgnored: "Showing 12/01/2024 14:02 on a live comment thread forces users to do mental math to judge recency, visible as users misreading stale content as fresh.",
    implementationNotes: [
      "Use relative timestamps like 2m ago for comments and activity feeds under a day or two old.",
      "Switch to absolute dates such as 12 Jan 2024 once an item ages past that window.",
      "Show the absolute date in a tooltip on hover over any relative timestamp.",
      "Always use absolute dates for invoices, contracts, and other historical records.",
    ],
    reviewPrompts: [
      "Do recent activity items show relative time like 2m ago rather than a full date?",
      "Do historical or archival records show a fixed absolute date?",
      "Does hovering a relative timestamp reveal the exact date and time?",
    ],
  },
  "sys-5": {
    whyItMatters: "Naming tokens by what they are, Blue-500, keeps the base palette stable while semantic aliases like Primary-Color map meaning on top, so a rebrand only touches the alias layer. Naming directly by function, such as button-blue, hardcodes intent into the value and breaks the moment that color is reused elsewhere.",
    riskWhenIgnored: "When button-blue gets reused for a warning banner, changing the brand blue silently recolors unrelated warning states, visible as wrong colors appearing after a rebrand.",
    implementationNotes: [
      "Structure tokens in three layers: Color Palette, Blue-500, to Semantic Alias, to Component usage.",
      "Name base tokens by hue and value, never by the component that consumes them.",
      "Keep function-specific names like button-blue out of the base palette entirely.",
      "Point component styles at the semantic alias layer, not the raw palette value.",
    ],
    reviewPrompts: [
      "Are base color tokens named by hue and value rather than by function?",
      "Is there a semantic alias layer between raw colors and component styles?",
      "Would rebranding the primary color require touching more than the alias layer?",
    ],
  },
  "sys-6": {
    whyItMatters: "Loss aversion means users fear irreversible actions more than they warrant, so a five-second Undo window after Deleted converts a scary permanent action into a safely reversible one. Instant permanent deletion offers no recovery path and leans entirely on a confirmation dialog to prevent mistakes.",
    riskWhenIgnored: "Deleting instantly with no undo means one accidental click destroys data permanently, visible as support requests asking to recover something removed seconds earlier.",
    implementationNotes: [
      "Show a Deleted, Undo (5s) toast immediately instead of a confirm-then-delete dialog.",
      "Delay the actual destructive server call until the undo window closes.",
      "Make the undo control large and easy to hit within the toast.",
      "Reserve confirmation dialogs for actions too costly or complex to undo after the fact.",
    ],
    reviewPrompts: [
      "After deleting, does an Undo option appear for a few seconds before it is final?",
      "Is the destructive action delayed on the server until the undo window passes?",
      "Is the undo control easy to tap within the toast?",
    ],
  },
  "sys-7": {
    whyItMatters: "Anxiety in multi-step flows comes from not knowing how much is left, so a Step 2 of 4 indicator gives users a mental model of remaining effort and reduces abandonment. Flows with no progress indicator feel open-ended, and task-completion research shows drop-off rises the longer a flow feels unbounded.",
    riskWhenIgnored: "A checkout or onboarding flow with no progress indicator feels like it could go on forever, visible as users abandoning midway through longer forms.",
    implementationNotes: [
      "Show a Step 2 of 4 style indicator on any flow with three or more steps.",
      "Keep the total step count visible and fixed, do not let it change mid-flow.",
      "Allow users to see or jump back to completed steps when possible.",
      "Skip progress indicators only for flows under three steps.",
    ],
    reviewPrompts: [
      "Does a flow with three or more steps show a current step and total count?",
      "Does the total number of steps stay fixed as the user progresses?",
      "Can the user tell how much is left at every point in the flow?",
    ],
  },
  "sys-8": {
    whyItMatters: "Keyboard accessibility is a parallel input model, not an extra layer on mouse interaction: Tab moves focus, Enter or Space activates, Escape dismisses, mirroring how screen reader and switch-device users navigate exclusively. Click-only interactions with no keyboard path lock these users out of core functionality entirely.",
    riskWhenIgnored: "A modal built with click-only handlers traps keyboard users who can never close it, visible as focus getting stuck with no way to Tab out or press Escape to dismiss.",
    implementationNotes: [
      "Verify every interactive element completes the Tab, Enter, Esc flow, not just click handlers.",
      "Add visible focus rings so keyboard position is never invisible.",
      "Wire Escape to dismiss modals, dropdowns, and popovers consistently.",
      "Trap focus inside open modals so Tab does not leak to background content.",
    ],
    reviewPrompts: [
      "Can every interactive element be reached by pressing Tab alone?",
      "Does pressing Enter or Space activate the focused element?",
      "Does pressing Escape dismiss the current modal or menu?",
    ],
  },
  "sys-9": {
    whyItMatters: "For low-risk, high-frequency actions like favoriting, updating the UI immediately and reconciling with the server afterward removes the perceived latency of a round trip, since the heart fills instantly rather than waiting on a spinner. This trades a rare silent rollback for a consistently snappy feel on actions users repeat often.",
    riskWhenIgnored: "Showing a spinner on every like button click makes a trivial action feel heavy, visible as users hesitating or double-tapping while waiting for it to resolve.",
    implementationNotes: [
      "Update the heart or toggle state instantly on click, syncing to the server asynchronously.",
      "Reserve optimistic updates for low-risk, reversible actions like likes or favorites.",
      "Silently roll back and notify only if the background sync actually fails.",
      "Never show a loading spinner for single-tap toggle interactions.",
    ],
    reviewPrompts: [
      "Does the like or favorite icon change state instantly on tap?",
      "Is there no spinner shown while a toggle action syncs in the background?",
      "Does a failed sync roll back the state without a jarring error dialog?",
    ],
  },
  "sys-10": {
    whyItMatters: "Graceful degradation treats network and asset failures as expected events rather than exceptions, so a broken image gets a placeholder plus retry option instead of the browser's default broken-icon glyph. This keeps the interface looking intentional even when a CDN, image, or API call fails.",
    riskWhenIgnored: "An unhandled failed image request shows the browser's broken-icon glyph or a blank gap, visible as broken image icons scattered across a page after a CDN hiccup.",
    implementationNotes: [
      "Render a placeholder image with a retry option whenever an image or API call fails.",
      "Catch failed fetches and show a fallback state, never let a request fail silently to blank.",
      "Give the retry action a clear label and keep the surrounding layout stable.",
      "Test degraded states deliberately by blocking network requests in dev tools.",
    ],
    reviewPrompts: [
      "Does a failed image load show a placeholder with a retry option?",
      "Is there no raw broken-image icon or blank gap anywhere on the page?",
      "Can the user manually retry a failed load without reloading the whole page?",
    ],
  },
  "sys-11": {
    whyItMatters: "Capping breakpoints at mobile, tablet, and desktop, sub-640px, 640-1024px, above 1024px, matches how layouts actually need to reflow, column count and density, rather than chasing every physical device size. Designing for eight-plus breakpoints multiplies maintenance cost for visual differences most users never notice.",
    riskWhenIgnored: "Chasing device-specific breakpoints instead of the three-tier system produces inconsistent spacing across similar widths, visible as a layout fine on one phone but cramped on another of similar size.",
    implementationNotes: [
      "Define exactly three breakpoints, sm 640px, md 1024px, lg 1280px, and design layouts around those.",
      "Reflow column count and density at each of the three tiers, not at every device width.",
      "Avoid adding breakpoints for specific devices or aspect ratios.",
      "Test layouts at the boundary widths, 640px and 1024px, rather than exact device dimensions.",
    ],
    reviewPrompts: [
      "Does the layout use only mobile, tablet, and desktop breakpoints?",
      "Does resizing near 640px or 1024px show a clean, intentional reflow?",
      "Is there no layout logic targeting a specific device or screen model?",
    ],
  },
  "sys-12": {
    whyItMatters: "Every animation should map to one job: orientation, where am I, feedback, did it work, or continuity, what changed, like a page slide signaling spatial movement between views. A bouncing logo on load serves none of these and just adds motion without communicating anything to the user.",
    riskWhenIgnored: "Decorative motion with no functional purpose, like a bouncing logo on every load, trains users to ignore animation entirely, visible as users missing real feedback cues like error shakes.",
    implementationNotes: [
      "Before adding any animation, name which job it does, orientation, feedback, or continuity.",
      "Use directional slides for navigation to convey spatial orientation between views.",
      "Cut any animation that exists purely for flair, like a bouncing logo on load.",
      "Reserve punchier motion for feedback moments so it stands out from routine transitions.",
    ],
    reviewPrompts: [
      "Can every animation on screen be tied to orientation, feedback, or continuity?",
      "Does navigating between views use motion that shows spatial direction?",
      "Is there no animation that plays purely for decoration on every load?",
    ],
  },
  "sys-13": {
    whyItMatters: "Specifying transition-property explicitly, scale and background-color, ensures only intended properties animate, while transition: all animates every property that changes, including ones altered by unrelated state updates like a font load. This causes unexpected elements to visibly glide when they should snap instantly.",
    riskWhenIgnored: "Using transition: all means an unrelated style change, like a width recalculation from a font swap, animates unexpectedly, visible as elements sliding on their own when nothing about them was meant to change.",
    implementationNotes: [
      "Replace transition: all with an explicit list such as transition-property: scale, background-color.",
      "Audit each transitioning component for the exact properties that should animate.",
      "Set explicit duration and easing per property group rather than one blanket rule.",
      "Watch for unrelated properties, width, font, animating unintentionally during QA.",
    ],
    reviewPrompts: [
      "Does the CSS specify exact transition properties instead of transition: all?",
      "Do unrelated style changes on the element happen instantly, without animating?",
      "Does only the intended property, like scale or color, visibly animate on interaction?",
    ],
  },
  "sys-14": {
    whyItMatters: "will-change: transform, opacity is a hint that promotes an element to its own GPU compositor layer ahead of an expected animation, but will-change: all or broad use forces the browser to allocate compositor memory for elements that never need it. It should appear only right before a real, observed first-frame stutter, then get removed.",
    riskWhenIgnored: "Applying will-change broadly or with all creates excess compositor layers that consume GPU memory, visible as sluggish scrolling on pages with many elements.",
    implementationNotes: [
      "Apply will-change: transform, opacity only to elements about to animate, never will-change: all.",
      "Add it just before the animation starts and remove it once the animation finishes.",
      "Reserve it for confirmed first-frame stutter, not as a default optimization.",
      "Limit compositor-promoted properties to transform and opacity, the compositor-friendly ones.",
    ],
    reviewPrompts: [
      "Is will-change scoped to transform and opacity rather than set to all?",
      "Is will-change removed from elements once their animation completes?",
      "Was will-change added only after an observed stutter, not applied by default?",
    ],
  },

  // ── Motion & Interaction ────────────────────────────────────────
  "motion-1": {
    whyItMatters: "Frequency sets the motion budget: a command palette fires dozens of times an hour, so any delay compounds through habituation, while a modal seen once a session can afford standard motion. Map interaction frequency to duration before choosing an easing curve.",
    riskWhenIgnored: "A command palette animated like a rare modal turns a routine keystroke into a 300ms wait on every invocation, and power users start perceiving the whole app as sluggish.",
    implementationNotes: [
      "Apply full standard motion only to rare surfaces like a first-run modal, matching the do example.",
      "Audit every animated surface for weekly-or-more usage and shorten or strip motion above that threshold.",
      "Time the command palette open path separately from onboarding modals in your motion tokens.",
      "Recheck a surface's motion once it moves from rare to daily use, like a settings panel becoming a habit.",
    ],
    reviewPrompts: [
      "Does the command palette open without any perceptible delay?",
      "Does a rarely-seen modal still use full, unhurried motion instead of feeling clipped?",
      "Do frequently repeated actions feel faster than one-off actions?",
    ],
  },
  "motion-2": {
    whyItMatters: "Keyboard input assumes near-zero perceived latency, since repetition amplifies any added delay into visible lag. Shortcuts, palette toggles, and focus moves must resolve without waiting on a transition to finish.",
    riskWhenIgnored: "A shortcut that waits for a slide-in transition before revealing its result trains users to distrust the keyboard path, and they fall back to slower mouse navigation.",
    implementationNotes: [
      "Make shortcut response immediate, per the do example, by updating state before or independent of any animation.",
      "Never gate command palette open or close on a transition-end event.",
      "Move focus synchronously and animate only the focus ring afterward, not the move itself.",
      "Test rapid repeated keypresses to confirm no animation backlog queues up.",
    ],
    reviewPrompts: [
      "Does pressing a shortcut show its result instantly, with no visible wait?",
      "Does the command palette open on keypress without a delay?",
      "Does focus move immediately when triggered from the keyboard?",
    ],
  },
  "motion-3": {
    whyItMatters: "Every animation should serve one of five jobs: orientation, feedback, explanation, continuity, or softening a jarring change. A drawer sliding from its trigger shows origin and continuity; a bounce with no such job is just noise competing for attention.",
    riskWhenIgnored: "Decorative motion added to every load screen without a job desensitizes users to real signals, so when an important state change happens, they no longer notice it.",
    implementationNotes: [
      "Before animating, name which of the five purposes it serves; if none apply, cut it, per the do and dont contrast.",
      "Keep drawer motion originating visually from the element that opened it.",
      "Remove bounce or flourish effects that run on every page load regardless of context.",
      "Note the one-line purpose for each animation in code comments or the design file.",
    ],
    reviewPrompts: [
      "Can you name the specific purpose of each animation on this screen?",
      "Does the drawer visually originate from the element that triggered it?",
      "Is any motion present purely for decoration with no functional role?",
    ],
  },
  "motion-4": {
    whyItMatters: "Default browser easings are nearly linear and read as mechanical. cubic-bezier(0.23, 1, 0.32, 1) front-loads velocity so entrances feel intentional and alive rather than generic default-CSS motion.",
    riskWhenIgnored: "Using ease-in on a dropdown makes it crawl into view at the exact moment users expect it to appear, reading as unresponsive despite an equal total duration.",
    implementationNotes: [
      "Replace default eases with cubic-bezier(0.23, 1, 0.32, 1) for entrances, as in the do example.",
      "Reserve ease-in-out only for elements moving between two on-screen positions.",
      "Never apply ease-in to a dropdown or any first-appearance element.",
      "Store the custom curve as a shared token so every entrance reuses the same feel.",
    ],
    reviewPrompts: [
      "Do entrances feel snappy rather than sluggish at the start?",
      "Is the same custom easing curve reused consistently across similar components?",
      "Does any dropdown or menu visibly crawl in with ease-in?",
    ],
  },
  "motion-5": {
    whyItMatters: "Ease-in holds near-zero velocity at frame one, the exact instant a user expects visual confirmation their click landed. UI entrances and responses need ease-out so movement starts fast and settles, confirming the action registered immediately.",
    riskWhenIgnored: "A menu opened with ease-in appears to hang for its first frames before accelerating, so users click again assuming the first press missed, causing duplicate triggers.",
    implementationNotes: [
      "Swap ease-in for ease-out on every UI entrance, matching the do example.",
      "Audit existing dropdown, menu, and toast transitions for lingering ease-in curves.",
      "Treat any curve starting at zero velocity as a bug, not a style choice.",
      "Reserve ease-in exclusively for exits, where a slow-then-fast departure is acceptable.",
    ],
    reviewPrompts: [
      "Does the menu begin moving immediately when opened, with no slow start?",
      "Do any UI responses appear to hesitate before they begin animating?",
      "Is ease-in absent from all entrance and response animations?",
    ],
  },
  "motion-6": {
    whyItMatters: "Everyday transitions like a 180ms dropdown stay under the threshold where motion reads as responsive rather than deliberate; a 500ms popover crosses into feeling like a loading state instead of an instant UI reaction.",
    riskWhenIgnored: "A 500ms popover triggered on every hover adds up across dozens of daily uses, making the whole product feel padded and slow even though nothing is actually loading.",
    implementationNotes: [
      "Cap dropdown transitions at 180ms and popovers well under 300ms, per the do example.",
      "Flag any transition duration above 300ms in code review as a motion violation.",
      "Reserve durations closer to 300ms for larger surfaces like page transitions, not small popovers.",
      "Measure the rendered duration, not just the declared value, since easing can extend perceived length.",
    ],
    reviewPrompts: [
      "Does the dropdown finish opening in under 200ms?",
      "Does any popover or menu take half a second or longer to appear?",
      "Do small UI transitions feel snappy rather than deliberate?",
    ],
  },
  "motion-7": {
    whyItMatters: "Entrances can run slightly slower, 220ms, to give users time to register a new element, but exits should be faster, 160ms, since nothing new needs comprehension and a lingering exit blocks the next action.",
    riskWhenIgnored: "Using the same slow timing for both directions makes closing a panel feel as sluggish as opening it, so dismissing things quickly reads as an unresponsive interface.",
    implementationNotes: [
      "Set enter to 220ms and exit to 160ms as separate tokens, matching the do example.",
      "Never reuse a single duration variable for both enter and exit states.",
      "Bias any asymmetry toward faster exits, never slower ones.",
      "Test rapid open-close cycles to confirm exits never lag behind input.",
    ],
    reviewPrompts: [
      "Does closing an element feel faster than opening it?",
      "Are enter and exit using different, deliberately chosen durations?",
      "Does dismissing a panel ever feel like it takes as long as opening it?",
    ],
  },
  "motion-8": {
    whyItMatters: "A pressable control needs a visible response within the same frame as the tap. button:active scale(0.96) gives enough compression to register as touched without looking crushed; too aggressive a scale, or none at all, leaves users unsure the tap landed.",
    riskWhenIgnored: "A button with no active state or an overly aggressive scale(0.9) makes every tap feel uncertain, so users tap twice to confirm the interface responded, doubling accidental submissions.",
    implementationNotes: [
      "Apply scale(0.96) on :active for all pressable controls, per the do example.",
      "Never scale below roughly 0.93 or omit an active state entirely.",
      "Trigger the press effect on pointerdown, not on click, so feedback is instant.",
      "Pair the scale with a subtle shadow or brightness shift for reinforcement on larger buttons.",
    ],
    reviewPrompts: [
      "Does every button visibly compress when pressed?",
      "Does the press effect feel subtle rather than jarring or exaggerated?",
      "Does feedback appear the instant you press down, not after release?",
    ],
  },
  "motion-9": {
    whyItMatters: "Objects in the physical world do not grow from nothing. scale(0.95) with opacity 0 keeps an element feeling already present and just becoming visible, preserving a sense of physicality; scale(0) reads as conjuring something from a single point.",
    riskWhenIgnored: "An element animating in from scale(0) appears to burst into existence from a single pixel, drawing exaggerated attention instead of feeling like a natural appearance.",
    implementationNotes: [
      "Start entrances at scale(0.95) combined with opacity 0, matching the do example.",
      "Never set an initial or keyframe scale value of 0.",
      "Keep the starting scale close to 1, roughly 0.9 to 0.97, so growth is barely perceptible.",
      "Pair scale with opacity so the object fades in as it settles rather than popping.",
    ],
    reviewPrompts: [
      "Does the element appear to already be nearly full-size as it fades in?",
      "Is there any element that visibly grows from a single point or zero size?",
      "Does the entrance feel like a subtle settle rather than a dramatic pop?",
    ],
  },
  "motion-10": {
    whyItMatters: "A popover anchored to a button should scale from that trigger's transform-origin so the motion maps spatially to its source, reinforcing the link between click and result. Center-origin scaling suits modals, which have no single anchor, but applying it to anchored UI severs that spatial logic.",
    riskWhenIgnored: "A popover that scales from center instead of its trigger appears to materialize disconnected from the button that opened it, forcing users to visually search for the connection.",
    implementationNotes: [
      "Set transform-origin to the trigger element's position, per the do example.",
      "Reserve center-origin scaling exclusively for modals with no single anchor point.",
      "Calculate origin dynamically if the trigger can appear in different screen positions.",
      "Recheck origin behavior when a popover is repositioned by collision detection near screen edges.",
    ],
    reviewPrompts: [
      "Does the popover visually grow out of the element that triggered it?",
      "Does a modal scale from the center of the screen rather than an edge?",
      "Does any anchored menu appear to originate from the wrong location?",
    ],
  },
  "motion-11": {
    whyItMatters: "The first tooltip in a session can carry a short delay to avoid firing on accidental hover, but once a user is already exploring, skipping that delay for adjacent tooltips respects the established intent and keeps a toolbar feeling continuous rather than stuttering per item.",
    riskWhenIgnored: "Every toolbar icon re-imposing the same hover delay makes scanning a row of tools feel like restarting a wait each time, so users abandon hover exploration and hunt for labels another way.",
    implementationNotes: [
      "Skip the delay for any tooltip triggered shortly after another, per the do example.",
      "Keep a short shared window, roughly 1 to 1.5 seconds, after the last tooltip closes before resetting to first-open behavior.",
      "Reserve the initial delay only for the very first tooltip in a session.",
      "Test moving quickly across a toolbar to confirm no per-item delay reappears.",
    ],
    reviewPrompts: [
      "Does the first tooltip in a session wait briefly before appearing?",
      "Do adjacent tooltips appear instantly once you're already hovering the toolbar?",
      "Does every toolbar item impose its own separate hover delay?",
    ],
  },
  "motion-12": {
    whyItMatters: "CSS transitions retarget mid-flight, so a transform transition over 200ms can reverse direction smoothly if a toggle fires again before finishing. Keyframe animations restart from their defined 0% state on re-trigger, producing a visible snap backward under rapid interaction.",
    riskWhenIgnored: "A keyframe-based toggle clicked rapidly resets to its start position every time, so the control visibly jumps backward instead of reversing smoothly, making the interaction feel broken.",
    implementationNotes: [
      "Use transition: transform 200ms for any toggle or state flip, per the do example.",
      "Replace keyframe animations on rapidly-triggerable controls with transition-based ones.",
      "Reserve @keyframes for animations that always run to completion uninterrupted, like a one-time success checkmark.",
      "Test by rapidly re-triggering the control to confirm it retargets instead of snapping.",
    ],
    reviewPrompts: [
      "Does rapidly re-toggling the control reverse smoothly instead of snapping back?",
      "Is a CSS transition, not a keyframe animation, driving this interruptible state?",
      "Does the animation ever visibly jump to a start position under fast clicking?",
    ],
  },
  "motion-13": {
    whyItMatters: "@starting-style lets the browser animate from a defined starting visual state the moment an element mounts, instead of mounting at its final state and forcing a useEffect to flip a class on the next tick. That extra JS round-trip is fragile and can flash the unanimated final state first.",
    riskWhenIgnored: "Relying on useEffect to trigger entry means a slow re-render or effect timing hiccup makes the element flash into place fully formed before the animation class applies, producing an inconsistent, sometimes-broken entrance.",
    implementationNotes: [
      "Define @starting-style with opacity and transform values, per the do example.",
      "Remove any useEffect solely dedicated to toggling an entry-animation class.",
      "Check browser support and provide a JS fallback only where @starting-style is unavailable.",
      "Confirm the starting-style values match the same properties animated in the base transition.",
    ],
    reviewPrompts: [
      "Does the element animate in immediately on mount without a visible flash?",
      "Is entry animation declared in CSS rather than triggered by a JS effect?",
      "Does the entrance ever appear to snap into its final state before animating?",
    ],
  },
  "motion-14": {
    whyItMatters: "Transform and opacity run on the compositor thread and skip layout and paint entirely, so translateY plus opacity stays smooth even under heavy main-thread load. Animating height or top forces layout recalculation on every frame, competing with whatever else the page is doing.",
    riskWhenIgnored: "Animating height and top on a growing panel causes visible jank and dropped frames whenever the main thread is busy with data fetching or rendering, making the motion look choppy under real-world load.",
    implementationNotes: [
      "Animate translateY plus opacity for movement and appearance, per the do example.",
      "Replace any animated height, top, left, width, padding, or margin with a transform equivalent.",
      "Use a fixed or measured wrapper size if content height needs to appear to change.",
      "Profile with the browser's performance panel to confirm no layout thrashing during the animation.",
    ],
    reviewPrompts: [
      "Does the animation stay smooth even while other work is happening on the page?",
      "Is movement driven by transform and opacity rather than top, left, or size properties?",
      "Does any panel visibly stutter as it grows or shrinks in height?",
    ],
  },
  "motion-15": {
    whyItMatters: "translateY(100%) is relative to the element's own rendered size, so a toast or drawer slides fully offscreen regardless of its content length, while a hardcoded pixel offset assumes one fixed height and breaks the moment content changes.",
    riskWhenIgnored: "A drawer using a hardcoded pixel offset leaves a visible sliver on screen the moment its content grows taller than the value the offset assumed, exposing part of the panel that should be hidden.",
    implementationNotes: [
      "Use translateY(100%) for offscreen positioning, per the do example.",
      "Replace any hardcoded pixel offset used for hide or show positioning.",
      "Re-verify percentage transforms after adding dynamic content that can change element height.",
      "Combine with a transform-origin check if the same element also scales.",
    ],
    reviewPrompts: [
      "Does the drawer or toast fully leave the screen regardless of its content length?",
      "Is positioning driven by a percentage transform rather than a fixed pixel value?",
      "Does any hidden panel show a visible sliver when its content changes size?",
    ],
  },
  "motion-16": {
    whyItMatters: "Hover is a mouse-era signal: only pointers with (hover: hover) can rest on a target without committing to it, so gating motion behind that media query keeps intent honest. Touch devices fire hover on tap-and-hold or right after a tap, which is a tap pretending to be a hover. Scoping scale, glow, or lift transitions inside @media (hover: hover) prevents that false signal from ever reaching motion code.",
    riskWhenIgnored: "A tap on a touch screen triggers the hover scale, then the tap-through triggers the active state a frame later, producing a visible double-animation stutter on first touch.",
    implementationNotes: [
      "Wrap hover transitions in @media (hover: hover) and, ideally, (pointer: fine).",
      "Never rely on :hover alone to gate transform or box-shadow motion.",
      "Test on an actual touch device, not just a resized desktop browser.",
      "Keep tap feedback (active/focus states) fully separate from hover feedback.",
    ],
    reviewPrompts: [
      "Does tapping a card on a touch device skip the hover animation entirely?",
      "Does the hover effect still play correctly with a mouse on desktop?",
      "Is there a separate, immediate feedback state for touch taps?",
    ],
  },
  "motion-17": {
    whyItMatters: "prefers-reduced-motion exists for vestibular disorders under WCAG 2.3.3, where large or spinning movement can trigger real physical symptoms, not just annoyance. The fix is not silence: users still need to know a state changed, so opacity, color, or instant swaps carry that signal instead of translation or scaling. Fading in place preserves the feedback loop while removing the motion that causes harm.",
    riskWhenIgnored: "A user with the OS setting enabled toggles a control and sees nothing happen because the animation was stripped with no fallback, leaving them unsure if the action registered.",
    implementationNotes: [
      "Wrap movement-based transitions in a prefers-reduced-motion: reduce check and swap in opacity-only fades.",
      "Never let @media (prefers-reduced-motion: reduce) simply delete all feedback.",
      "Replace slides and scales with instant or near-instant state changes plus a color or opacity cue.",
      "Test every animated component with the OS reduced-motion setting toggled on.",
    ],
    reviewPrompts: [
      "With reduced motion enabled, does the interface still confirm the action happened?",
      "Is movement removed while opacity or color feedback remains?",
      "Does no component silently do nothing when reduced motion is on?",
    ],
  },
  "motion-18": {
    whyItMatters: "Physical gestures carry momentum, and a fast flick expresses as much intent as a slow drag that covers more pixels. Judging dismissal purely on distance ignores velocity, the same physics principle behind momentum scrolling, so a quick short flick should still cross the dismiss threshold. Combining distance OR velocity checks respects how users actually flick cards and sheets away.",
    riskWhenIgnored: "A user flicks a card quickly but only a short distance, the gesture snaps back because it did not clear the distance threshold, and the interaction feels unresponsive or broken.",
    implementationNotes: [
      "Dismiss when either distance or velocity crosses its threshold, not distance alone.",
      "Read pointer velocity from the gesture library's velocity output on release.",
      "Set a velocity threshold that catches quick short flicks a static swipe distance would miss.",
      "Test with deliberately short, fast flicks in addition to slow full-distance drags.",
    ],
    reviewPrompts: [
      "Does a quick short flick dismiss the element even without reaching full distance?",
      "Does a slow drag still dismiss once it crosses the distance threshold?",
      "Does an accidental slow small nudge correctly snap back instead of dismissing?",
    ],
  },
  "motion-19": {
    whyItMatters: "A hard stop at a drag boundary reads as hitting an invisible wall, breaking the illusion of a physical object. Applying increasing friction or damping past the edge, the same rubber-banding logic behind iOS scroll overscroll, tells the user where the boundary is while still following their finger. The resistance itself becomes the feedback, no separate indicator needed.",
    riskWhenIgnored: "A user drags a panel past its edge, the content freezes dead against their finger movement, and the drag feels like it hit a physical wall rather than a UI limit.",
    implementationNotes: [
      "Apply increasing friction past the edge instead of clamping position outright.",
      "Scale resistance with overdrag distance so it gets harder to pull the further past the boundary.",
      "Never let the dragged element's position simply stop updating at the limit.",
      "Spring the element back to the boundary on release using the same damped curve.",
    ],
    reviewPrompts: [
      "Does dragging past the edge still move slightly, with rising resistance, instead of stopping dead?",
      "Does releasing past the boundary spring the element back smoothly?",
      "Does the resistance feel proportional to how far past the edge the drag goes?",
    ],
  },
  "motion-20": {
    whyItMatters: "Once a drag starts, the element should keep tracking that one pointer even if it strays outside the element's bounds or a second finger touches down. setPointerCapture on drag start redirects all subsequent pointer events to the dragged element regardless of what is under the cursor, which is exactly the pointer capture semantics browsers expose for this case. Without it, moving fast enough to leave the element's hit area silently drops the gesture.",
    riskWhenIgnored: "A user drags quickly and their pointer slips outside the element's bounding box mid-gesture, the drag handler stops receiving events, and the element abruptly freezes or drops.",
    implementationNotes: [
      "Call setPointerCapture on the drag target inside the pointerdown handler.",
      "Release capture explicitly on pointerup or pointercancel.",
      "Ignore additional pointer IDs that arrive while a capture is active.",
      "Verify the element keeps tracking the pointer even when dragged outside its own bounds.",
    ],
    reviewPrompts: [
      "Does the drag keep following the pointer even when it moves outside the element's edges?",
      "Does introducing a second touch during a drag leave the first drag unaffected?",
      "Does releasing the pointer cleanly end the drag without a stuck or jumping element?",
    ],
  },
  "motion-21": {
    whyItMatters: "CSS transitions run on the compositor thread, independent of the JavaScript main thread, so a tab-switch animation defined with a CSS transition keeps its timing even while a script is busy parsing data or handling a heavy event. A setInterval-driven animation for the same predetermined motion competes for the same thread as everything else, so its frame timing degrades under load. Predetermined, fixed-endpoint motion belongs in CSS specifically because its timing has no dependency on runtime state.",
    riskWhenIgnored: "A heavy JavaScript task runs while a JS-driven animation is playing, the interval callbacks get delayed or dropped, and the tab motion visibly stutters or jumps to its end state.",
    implementationNotes: [
      "Use a CSS transition for the tab motion instead of a setInterval-based JS animation.",
      "Reserve JavaScript-driven timing for motion that needs runtime values, not fixed endpoints.",
      "Confirm the CSS transition keeps its frame rate while simulating a busy main thread.",
      "Animate only transform and opacity in the CSS rule to stay off layout-triggering properties.",
    ],
    reviewPrompts: [
      "Does the tab motion stay smooth when the main thread is artificially busy?",
      "Is the animation defined as a CSS transition rather than a JS interval or rAF loop?",
      "Does the motion have a fixed, predetermined timing rather than depending on live data?",
    ],
  },
  "motion-22": {
    whyItMatters: "Some motion needs runtime decisions, like animating to a value only known after a fetch resolves, and that is exactly what the Web Animations API is for. element.animate driving transform or opacity still runs on the compositor, preserving CSS-level performance, while giving JavaScript control to start, reverse, or chain animations based on live state. A setInterval-based layout animation gets neither the runtime flexibility done properly nor the compositor performance.",
    riskWhenIgnored: "A programmatic animation is built with setInterval adjusting a layout property like top or width, causing forced synchronous layout recalculation every frame and visible jank under any load.",
    implementationNotes: [
      "Drive programmatic motion with element.animate() targeting transform and opacity.",
      "Never reach for setInterval to animate a layout-affecting property.",
      "Use the returned Animation object's play, pause, and reverse methods for runtime control.",
      "Chain or update keyframes only after the values needed are actually known.",
    ],
    reviewPrompts: [
      "Does the programmatic animation stay smooth when triggered by dynamic runtime data?",
      "Is the animation built with the Web Animations API rather than setInterval or setTimeout loops?",
      "Are only transform and opacity being animated, not width, top, or other layout properties?",
    ],
  },
  "motion-23": {
    whyItMatters: "Setting a CSS custom property like --swipe-amount on a parent element forces the browser to recompute styles for every descendant that references it, since custom property invalidation cascades down the whole subtree on each update. Writing directly to element.style.transform touches only that one element's compositor layer. For a value updating every drag frame, that difference is the gap between 60fps and a dropped-frame stutter.",
    riskWhenIgnored: "A drag handler updates a --swipe-amount variable on a parent container every pointermove, style recalculation cascades to every child that reads it, and the drag visibly stutters under a large or nested DOM tree.",
    implementationNotes: [
      "Write drag distance straight to element.style.transform on the dragged element.",
      "Never update a shared custom property on a parent as the per-frame drag value.",
      "Confirm no descendant styles reference a variable that changes every pointermove.",
      "Profile style recalculation in devtools while dragging to confirm it stays scoped to one element.",
    ],
    reviewPrompts: [
      "Is the drag transform written directly to the dragged element's style, not a parent variable?",
      "Does dragging stay smooth even inside a deeply nested or large DOM subtree?",
      "Does devtools performance recording show no wide style recalculation during the drag?",
    ],
  },
  "motion-24": {
    whyItMatters: "Staggered entrances help users chunk a group of items as one related unit arriving together, a known cognitive benefit of sequential reveal. But that benefit only holds if delays stay in the 30-80ms range per item; push much beyond that and the stagger becomes a cascade the user has to sit through before anything is usable. Short per-item delays keep the rhythm perceptible without blocking interaction.",
    riskWhenIgnored: "A list of ten items staggers in at 200ms per item, the user tries to click the fifth item while it is still animating, and the interface reads as sluggish and unresponsive for over a second.",
    implementationNotes: [
      "Set stagger delay between 30ms and 80ms per item, never open-ended cascades.",
      "Cap total stagger duration so the last item is interactive well under a second.",
      "Only stagger grouped entrances where the rhythm actually reads as related, not every list.",
      "Allow pointer and keyboard interaction on already-revealed items before the stagger finishes.",
    ],
    reviewPrompts: [
      "Is the delay between staggered items within roughly 30-80ms rather than a long cascade?",
      "Can the user interact with earlier items while later ones are still animating in?",
      "Does the stagger actually improve the sense of a related group, not just delay the UI?",
    ],
  },
  "motion-25": {
    whyItMatters: "Motion flaws like a wrong transform-origin, unsynced property timing, or a muddy color blend are often invisible at full speed but obvious once slowed to 2x-5x duration, since human perception can't parse sub-200ms discrepancies at normal playback. Reviewing in slow time exposes exactly which property lags, which easing curve snaps instead of glides, and where a blend passes through an ugly intermediate hue. This is a review technique, not a shipped behavior.",
    riskWhenIgnored: "An entrance animation has its scale and opacity slightly out of sync, it looks fine at full speed in a quick check, and it ships with a barely-perceptible but bothersome mismatch that only shows up slowed down.",
    implementationNotes: [
      "Slow the animation to 2x-5x its normal duration using devtools or a temporary multiplier.",
      "Check transform-origin, easing shape, and property sync at the slowed rate.",
      "Watch color transitions specifically for muddy or unintended intermediate blends.",
      "Never sign off on a new animation having only watched it at full speed.",
    ],
    reviewPrompts: [
      "Was this animation reviewed at 2x-5x its normal duration before shipping?",
      "Do all animated properties stay synchronized when played back slowly?",
      "Does any color transition pass through an unintended muddy blend when slowed down?",
    ],
  },
  "motion-26": {
    whyItMatters: "A title, supporting copy, and action buttons are semantically separate pieces, so animating an entire panel as one fading block erases that distinction and asks the eye to parse everything at once. Splitting them into staggered groups at 80-100ms apart lets each piece register as its own idea in sequence, mirroring how a reader's attention naturally moves from heading to body to action. This is the panel-level counterpart to per-item list stagger, applied to content roles instead of repeated items.",
    riskWhenIgnored: "A modal fades in as one container, the title, body text, and buttons all appear simultaneously, and users report the panel feels like a flash of content rather than something they read.",
    implementationNotes: [
      "Split the panel into title, copy, and action groups with roughly 80-100ms stagger between them.",
      "Never wrap the whole panel in a single fade or scale as though it were one object.",
      "Order the stagger to match reading order: title first, then copy, then actions.",
      "Keep each group's individual animation short so the full sequence still resolves quickly.",
    ],
    reviewPrompts: [
      "Do the title, copy, and actions animate in as separate staggered groups?",
      "Does the stagger order follow natural reading order, top to bottom?",
      "Does the whole panel avoid animating in as one single fading block?",
    ],
  },
  "motion-27": {
    whyItMatters: "An exit only needs to signal that something is leaving, not draw the eye the way an entrance does, so it should be quieter than the interruptible spring-in it likely mirrored. A short 150ms duration with a small fixed translateY(-12px) and fade to opacity 0 removes the element without disrupting the surrounding layout's context. A dramatic translateY(-100%) with scale(0.5) instead behaves like a second entrance in reverse, competing for attention it doesn't need.",
    riskWhenIgnored: "A toast exits by scaling down to zero and flying off the full width of the screen, drawing the eye away from the next thing the user should focus on, and the surrounding content feels like it jumped.",
    implementationNotes: [
      "Exit with opacity 0 and a small translateY(-12px) over about 150ms.",
      "Never use large-magnitude exits like translateY(-100%) or scale(0.5).",
      "Keep exit duration shorter than the matching enter animation.",
      "Confirm the exit doesn't shift or reflow unrelated surrounding layout.",
    ],
    reviewPrompts: [
      "Does the exit use a small translate and fade rather than a dramatic scale or slide?",
      "Is the exit noticeably quicker than the element's entrance animation?",
      "Does surrounding content stay stable in place while the element exits?",
    ],
  },
  "motion-28": {
    whyItMatters: "An icon appearing, disappearing, or swapping state is a small but meaningful signal, and toggling display: none to display: block skips straight to the end state with no transition to interpret. Animating scale from 0.25 to 1 alongside opacity 0 to 1 and blur from 4px to 0 gives the eye a brief, legible motion to track instead of a jump cut. This mirrors why enter and exit motion matters at panel scale, just applied to the smallest interactive units on screen.",
    riskWhenIgnored: "A status icon swaps instantly via display toggling when a task completes, and users scanning the screen miss the change entirely because there was no motion to catch their attention.",
    implementationNotes: [
      "Animate icon scale from 0.25 to 1 with opacity 0 to 1 and blur 4px to 0 on appear.",
      "Never swap icon visibility with a plain display: none to display: block toggle.",
      "Reverse the same scale, opacity, and blur values for the disappear case.",
      "Keep the animation quick enough that it reads as a state change, not a delay.",
    ],
    reviewPrompts: [
      "Does the icon scale and fade in rather than snapping into view?",
      "Is a blur-to-sharp transition visible as the icon appears?",
      "Does the icon disappear with a matching animated transition instead of vanishing instantly?",
    ],
  },
  "motion-29": {
    whyItMatters: "Entrance motion exists to mark a change the user caused after the page is already interactive, not to narrate the first render. Setting AnimatePresence initial={false} distinguishes the initial-mount case from later state changes, so default-state UI appears immediately while the same component still animates properly on subsequent opens. Without that distinction, every component that could animate on state change also replays that animation on page load, whether or not the user asked for it.",
    riskWhenIgnored: "A modal that defaults to open animates in from scratch on every page load or refresh, making the app feel like it is still loading even after content is ready.",
    implementationNotes: [
      "Set initial={false} on AnimatePresence for components that can be open on first render.",
      "Verify the same component still animates correctly on later state changes, not just skips motion permanently.",
      "Never let a modal or panel play its enter animation on initial page load.",
      "Distinguish first-mount state explicitly from subsequent user-triggered state changes.",
    ],
    reviewPrompts: [
      "Does content that is open by default appear instantly on first page load, without an enter animation?",
      "Does that same component still animate normally when the user closes and reopens it later?",
      "Is initial={false} set on AnimatePresence for this component?",
    ],
  },

  // ── Accessibility & Inclusivity ──────────────────────────────────
  "a11y-1": {
    whyItMatters: "The default focus ring is browser chrome, and outline: none strips it with nothing standing in for it. focus-visible:ring-2 ring-blue-500 restores a visible marker only during keyboard navigation, satisfying WCAG 2.4.7 Focus Visible without adding a ring on every mouse click.",
    riskWhenIgnored: "A keyboard user tabs through the page with no way to see which element holds focus, so they lose their place and can't tell what Enter or Space will activate next.",
    implementationNotes: [
      "Replace outline: none with focus-visible:ring-2 ring-blue-500 on every interactive element.",
      "Never ship outline: none without a replacement ring, border, or glow in the same rule.",
      "Confirm the ring only appears on focus-visible, not on every mouse click.",
      "Check ring-blue-500 has enough contrast against the element's background.",
    ],
    reviewPrompts: [
      "Does tabbing through the page show a visible ring on the focused element?",
      "Is outline: none ever applied without ring-2 or an equivalent replacement?",
      "Does clicking with a mouse stay ring-free while tabbing shows the ring?",
    ],
  },
  "a11y-2": {
    whyItMatters: "About 1 in 12 men have some form of color vision deficiency, so a red border alone reads as just a slightly different gray to them. Pairing red text with an error icon and an explicit message gives a second and third channel, meeting WCAG 1.4.1 use-of-color.",
    riskWhenIgnored: "A colorblind user submits a form, sees only a red-tinted input with no icon or text, and has no idea which field failed or why.",
    implementationNotes: [
      "Pair red text with an error icon and a written message, not just a red border on the input.",
      "Never let a red border on the input be the only indicator of an error state.",
      "Add a distinct icon shape (not just a red-tinted version of the same icon) for errors.",
      "Write out the error message in text, don't rely on the reader inferring meaning from color alone.",
    ],
    reviewPrompts: [
      "Does every red-flagged input show an icon and message, not just a colored border?",
      "In grayscale, can you still tell which field has an error?",
      "Is the error text specific, not just a color change with no words?",
    ],
  },
  "a11y-3": {
    whyItMatters: "An adult fingertip covers roughly 8-10mm of screen, far more than the visible tap area, so buttons touching edge-to-edge sit closer together than a finger can reliably discriminate. An 8px+ gap between adjacent touch targets gives the pad enough margin to land on one control without straddling its neighbor.",
    riskWhenIgnored: "A user taps a button but their fingertip overlaps the edge of the adjacent one, triggering the wrong action, so they end up correcting a mis-tap on every attempt.",
    implementationNotes: [
      "Add at least 8px of gap between adjacent touch targets, never let them sit edge-to-edge.",
      "Audit button groups and toolbars specifically, they're where edge-to-edge spacing creeps in first.",
      "Use gap-2 (8px) or greater in flex/grid layouts holding multiple tappable controls.",
      "Test on an actual phone screen, not just a mouse cursor, to catch mis-tap risk.",
    ],
    reviewPrompts: [
      "Is there at least 8px of visible space between adjacent buttons?",
      "Do any buttons in a row or toolbar touch edge-to-edge with no gap?",
      "On a real touchscreen, can you tap one button without brushing its neighbor?",
    ],
  },
};
