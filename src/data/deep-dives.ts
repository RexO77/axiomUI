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
  // ── Typography & text ─────────────────────────────────────────────
  "typo-1": {
    whyItMatters: "In an invite dialog, the title and actions belong to the same conversation. A writer who knows the team uses sentence case can write “Invite your team” without deciding whether “your” counts as a title word. Keeping “Sign in with GitHub” intact also preserves the service’s own spelling.",
    riskWhenIgnored: "A blanket lowercase transform can silently turn GitHub into Github or change an acronym. In translated copy the same transform can undo an editor’s language-specific choices.",
    implementationNotes: [
      "Write the final casing in the localized string.",
      "Keep a short list of the product names and abbreviations writers actually encounter.",
      "Use the invite dialog to review a title and an action together.",
    ],
    reviewPrompts: [
      "Does the label follow the convention for this language?",
      "Does a named service retain its own spelling?",
      "Will the localized string reach the screen as written?",
    ],
  },
  "typo-2": {
    whyItMatters: "The difference between 0 and 0.05em accumulates across the letters of a long navigation label. Extra space can separate crowded strokes. A face with generous sidebearings can already have enough room.",
    riskWhenIgnored: "A tracking value copied from a larger heading can push a small label onto a second line. Applying the same treatment across scripts can interfere with expected spacing and joining.",
    implementationNotes: [
      "Compare the same label at its actual weight and size with 0 and 0.05em tracking.",
      "Check the longest localized label at the narrowest supported width.",
      "Allow reader spacing overrides to expand the label without clipping it.",
    ],
    reviewPrompts: [
      "Do adjacent forms stay distinct at the rendered size?",
      "Does the label fit when the reader increases spacing?",
      "Is this treatment appropriate for the script being displayed?",
    ],
  },
  "typo-3": {
    whyItMatters: "A paragraph asks the reader to move repeatedly from the end of one line to the start of the next. In the sample, 24px leading gives a 16px face more separation than 18px. Compare a full paragraph because single-line labels reveal little about that return.",
    riskWhenIgnored: "Tight leading can bring tall marks and descenders on neighboring lines together. Fixing the text container’s height then clips content when a reader increases line spacing.",
    implementationNotes: [
      "Set a unitless line-height so it follows changes in text size.",
      "Try both short and wide measures using the fonts and scripts you ship.",
      "Check that the page tolerates the WCAG text-spacing overrides, including line height of 1.5 times the font size.",
    ],
    reviewPrompts: [
      "Can you follow the next line throughout a realistic paragraph?",
      "Do accents and descenders clear adjacent lines?",
      "When spacing increases, is all text still present and usable?",
    ],
  },
  "typo-4": {
    whyItMatters: "At 22px, the sample’s 24px lines form a compact heading. Increasing the leading to 33px changes the relationship between its two lines even though the words and weight stay the same. A font with taller marks can need more room for the same title.",
    riskWhenIgnored: "A one-line mockup can hide collisions until a heading wraps in translation. Excess leading can make the second line look as closely related to the following paragraph as to the first line.",
    implementationNotes: [
      "Set separate heading and body tokens when they serve different reading tasks.",
      "Try a long title with capitals, accents, and descenders.",
      "Compare the space within the heading with the space between it and the body.",
    ],
    reviewPrompts: [
      "Do both lines still read as one title?",
      "Do accented capitals and descending marks clear adjacent lines?",
      "Does the heading remain intact when enlarged?",
    ],
  },
  "typo-5": {
    whyItMatters: "In the landing card, changing from Arial to Verdana announces a change of texture without explaining why. A consistent family already has size, weight, and position available to mark the transition from title to description. A second face earns its place when readers encounter a different kind of content.",
    riskWhenIgnored: "Two interchangeable body styles can creep into adjacent screens and wrap the same string differently. Conversely, forcing one font across every language can introduce unpredictable fallback within a word.",
    implementationNotes: [
      "Name the role a new family will serve before adding it.",
      "Check the heading and body together at their final sizes and widths.",
      "Inspect fallback coverage in the languages your product supports.",
    ],
    reviewPrompts: [
      "Where does the change of family signal a change of role?",
      "Could the existing family express the same distinction?",
      "Which face actually renders the localized copy?",
    ],
  },
  "typo-6": {
    whyItMatters: "The email in the member row is secondary to the name, yet it can be the detail that distinguishes two people. A 14px muted email can support that decision. Both reducing the size and reducing the contrast affect whether the address can be read.",
    riskWhenIgnored: "The two sample rows vary size and color together. Passing a contrast check cannot tell you whether the smaller address is easy to distinguish, and a comfortable type size cannot rescue insufficient contrast.",
    implementationNotes: [
      "Start with the address at a readable size, then reduce its emphasis one property at a time.",
      "Measure the final text and surface pair in both themes.",
      "Try two people with the same display name and different addresses.",
    ],
    reviewPrompts: [
      "Can a reader distinguish the people by their addresses?",
      "Does the muted text meet the applicable contrast threshold?",
      "Does the intended order survive zoom and theme changes?",
    ],
  },
  "typo-7": {
    whyItMatters: "The amounts in the preview already share a right edge. Equal-width digits keep the two decimal places aligned even as narrow 1s give way to wider 8s. Account numbers and phone numbers are identifiers and invite different grouping decisions.",
    riskWhenIgnored: "A column mixing whole amounts, two decimals, currency suffixes, and negative signs can look neatly right-aligned while its decimal marks still wander. Adding trailing zeroes to measurements can falsely imply precision.",
    implementationNotes: [
      "Format comparable currency values consistently for the locale.",
      "Give amounts a common alignment edge and verify the font provides tabular figures.",
      "Use explicit decimal alignment when different precision levels carry meaning.",
    ],
    reviewPrompts: [
      "Do the decimal marks line up in representative amounts?",
      "Do negative values and localized currency symbols still fit?",
      "Would adding a zero change what the number implies?",
    ],
  },
  "typo-8": {
    whyItMatters: "The changelog heading can sit in the center while its paragraph starts repeatedly at the same edge. As the measure narrows, centering gives each line a different starting point. Logical alignment preserves the intended edge when the paragraph changes direction.",
    riskWhenIgnored: "A two-word empty-state message can grow into a four-line instruction after translation. The centered composition that suited the short phrase now asks the reader to find a new starting point on each line.",
    implementationNotes: [
      "Use text-align: start for ordinary prose and set the correct language direction.",
      "Review centered content with longer translations.",
      "Check a narrow measure and enlarged text before making an exception.",
    ],
    reviewPrompts: [
      "Can the reader return to a consistent starting edge?",
      "Does right-to-left text follow its own reading direction?",
      "Is the centered treatment still suitable at its longest length?",
    ],
  },
  "typo-9": {
    whyItMatters: "In the digest card, a bold metadata line competes with the title although the metadata is less important. Four weights can work across a product. In this small card the problem is where the emphasis lands.",
    riskWhenIgnored: "A different weight on every line can make incidental details look like actions or headings. A font that lacks a requested weight can make two nominally distinct roles render alike.",
    implementationNotes: [
      "Map weights to roles such as heading, body, and emphasis.",
      "Compare those roles together using the loaded font at actual size.",
      "Where two weights look alike, try spacing or a clearer level of type.",
    ],
    reviewPrompts: [
      "Which text should the reader encounter first?",
      "Does incidental metadata compete with the heading?",
      "Do adjacent weights remain distinct in the loaded font?",
    ],
  },
  "typo-10": {
    whyItMatters: "A file list must accommodate a long name and a size column in the same row. Ellipsis preserves the column boundary while indicating omitted text. The omitted part may include the version or extension that distinguishes two files.",
    riskWhenIgnored: "A row of identically shortened filenames can make choosing a file guesswork. A hover-only title leaves people on touchscreens without a way to resolve the ambiguity.",
    implementationNotes: [
      "Try wrapping first for instructions and error messages.",
      "For a single-line filename, give its flex item room to shrink and apply the truncate utility.",
      "Provide access to the full name through a details view or another keyboard- and touch-operable action.",
    ],
    reviewPrompts: [
      "Can two files with the same prefix still be distinguished?",
      "Can keyboard and touch users reveal the complete value?",
      "Do the size and actions stay accessible at narrow widths?",
    ],
  },
  "typo-11": {
    whyItMatters: "The alert asks the reader to recognize a sign-in and inspect its supporting detail. The large x-height of one face can make it read differently from another at the same CSS size. The 16px/12px pair in the preview illustrates a hierarchy and needs a reading check in context.",
    riskWhenIgnored: "Shrinking an alert to 11px with 9px detail buys space by making the information harder to inspect. Enlarging it may expose a second problem if the row has a fixed height.",
    implementationNotes: [
      "Start with a tested body token and relative units.",
      "Try the smallest supporting text using the actual content on a representative device.",
      "Check enlargement to 200% and allow the row to grow.",
    ],
    reviewPrompts: [
      "Can the reader make the decision using the smallest essential line?",
      "At 200% enlargement, are all details and actions available?",
      "Could moving or wrapping a detail recover space?",
    ],
  },
  "typo-12": {
    whyItMatters: "The 19ch sample lets the browser choose two more even lines. The same setting on a different heading may move a name, number, or modifier away from the words it belongs with. Line shapes and meaning both deserve a check.",
    riskWhenIgnored: "Hard-coded breaks fitted to one title can fragment a translation or waste an entire line on a smaller screen. A balanced arrangement can also look awkward when its break cuts across a phrase.",
    implementationNotes: [
      "Compare natural and balanced breaks in the actual heading width.",
      "Review short, long, and translated headings.",
      "Keep natural wrapping when it already preserves the phrase.",
    ],
    reviewPrompts: [
      "Does the title read naturally across the break?",
      "How does the longest translated heading wrap?",
      "Does the layout still work with ordinary wrapping?",
    ],
  },
  "typo-13": {
    whyItMatters: "The example fixes the card measure and changes one CSS property. Some engines primarily rebalance the final lines, while others consider breaks earlier in the paragraph. The value requests better wrapping and leaves the exact line breaks to the browser.",
    riskWhenIgnored: "If a card depends on a particular word moving to its last line, a change of font, translation, or browser can expose clipping. The problem belongs to the card height if an extra line would hide content.",
    implementationNotes: [
      "Let the card grow with its text.",
      "Compare pretty with ordinary wrapping at the card widths the grid produces.",
      "Review captions in more than one engine before declaring the final line fixed.",
    ],
    reviewPrompts: [
      "Does the closing phrase read naturally?",
      "Can the description gain a line without losing its action?",
      "Does ordinary wrapping still give a usable result?",
    ],
  },

  "typo-14": {
    whyItMatters: "On an English restaurant list, a Hebrew name may sit directly before a dash and a number. The browser resolves these characters using their neighbors. Marking the name as its own span of directional text lets the number stay with the English word “reviews”. The same issue arises with a Latin name on a Hebrew page.",
    riskWhenIgnored: "A restaurant can appear to have a number in its name, or the dash can move to the wrong side of the count. Aligning the whole row to the reading start leaves the ambiguous character sequence intact.",
    implementationNotes: [
      "Set the document’s base direction for the interface language. The language attribute alone does not set direction.",
      "Wrap an inserted name of unknown direction in `<bdi>`. A tightly wrapped element with `dir=\"auto\"` can also isolate the name. Keep the separator and count outside that wrapper.",
      "Keep the sentence in translation resources so the translator can position the name and count. Keep the name in its original character order.",
    ],
    reviewPrompts: [
      "In an English row with a Hebrew name, does the count read as part of the review phrase?",
      "Does a Latin name keep its own order in a Hebrew row?",
      "Have readers of each language checked the punctuation at the displayed size?",
    ],
  },

  // ── Layout & spacing ─────────────────────────────────────────────
  "layout-1": {
    whyItMatters: "The settings cards compare 16px padding and 8px gaps with 13px and 5px. A shared scale gives the next person building a settings row a known starting point. The reason to reuse 8px is the relationship between items, even when an equally tidy number would fit the grid.",
    riskWhenIgnored: "Repeatedly inventing nearly identical gaps makes changes expensive. Conversely, rounding a 1px border or a text container’s intrinsic height onto the spacing grid can visibly damage it.",
    implementationNotes: [
      "Choose tokens for common spaces within a group and between groups.",
      "Reuse one token wherever the same relationship recurs.",
      "Keep optical adjustments local and explain what required them.",
    ],
    reviewPrompts: [
      "Do comparable components use the same spacing step?",
      "Does each larger gap represent a different relationship?",
      "Would rounding this exception improve the result?",
    ],
  },
  "layout-2": {
    whyItMatters: "A 95ch canvas can accommodate a wide table and a narrower reading column. The sample caps the paragraph at 45ch. Its character count varies with the font and words, even when the CSS width stays fixed.",
    riskWhenIgnored: "A paragraph that inherits the width of a dashboard can grow very long on a wide display. Hard-coding its minimum width to preserve an ideal measure can create horizontal scrolling at zoom.",
    implementationNotes: [
      "Set a maximum inline size on the article text while allowing the column to shrink.",
      "Count characters on several full lines of representative material.",
      "Review translated text and the largest supported text size.",
    ],
    reviewPrompts: [
      "Does the paragraph retain a comfortable measure on a wide display?",
      "Can the column shrink to fit a narrow viewport?",
      "Do tables and figures have the width their content needs?",
    ],
  },
  "layout-3": {
    whyItMatters: "The form has two different distances to communicate. An 8px label gap and a 24px field gap make the next pair visible. The accessible name and grouping still come from the markup, including a fieldset and legend for related choices.",
    riskWhenIgnored: "When the same 16px separates every row, a label between two fields can appear to describe either one. Adding an error or wrapping the label can make the ambiguity worse.",
    implementationNotes: [
      "Give labels and their fields a shared group container.",
      "Keep hints and errors within the group for the affected field.",
      "Try a multiline label and inspect the space before the next field.",
    ],
    reviewPrompts: [
      "Which control does each visible label describe?",
      "Does the accessible name match the visible label?",
      "When an error appears, is the next group still distinct?",
    ],
  },
  "layout-4": {
    whyItMatters: "In the play button, the visible mass of a right-facing glyph can sit toward the vertical edge of the triangle. Comparing the centered glyph with a 2px nudge exposes the difference between the SVG box and the marks inside it. Padding built into the icon artwork affects the result.",
    riskWhenIgnored: "Applying the same offset to every icon can make a symmetric pause symbol jump sideways when playback starts. A mirrored arrow can even need a correction in the opposite direction.",
    implementationNotes: [
      "Compare the glyph with a centered guide at the actual button size.",
      "Check the paired state, such as play and pause.",
      "Move the artwork inside the control and preserve the hit area.",
    ],
    reviewPrompts: [
      "Does the artwork appear centered with the guide removed?",
      "Does the control stay visually stable as its icon changes?",
      "Is the offset specific to this glyph and size?",
    ],
  },
  "layout-5": {
    whyItMatters: "With 8px block padding, the sample compares 8px and 16px at each side of the label. The second shape gives the word more lateral breathing room. Icon-only buttons, toolbar commands, and full-width actions answer different constraints.",
    riskWhenIgnored: "A strict ratio can make a translated button exceed its container or allow a compact control to miss its target-size requirement. Measuring padding alone leaves out both the text and the clickable area.",
    implementationNotes: [
      "Use a button-size token that accounts for the line height.",
      "Test the shortest and longest supported labels, including an optional icon.",
      "Measure the actual target and spacing under the relevant accessibility requirement.",
    ],
    reviewPrompts: [
      "Does the label have enough space beside it?",
      "Can the button wrap or grow when text enlarges?",
      "How large is the area that actually responds?",
    ],
  },
  "layout-6": {
    whyItMatters: "The bell introduces “Backup complete”. Its location should remain stable when the supporting detail grows from one to three lines. Aligning the items at the start and tuning the bell against the title gives that relationship a fixed reference.",
    riskWhenIgnored: "Centering the bell across the entire group can leave it beside a continuation of the description. A top-aligned box can also look high if the icon artwork has unusual internal padding.",
    implementationNotes: [
      "Identify the line the glyph introduces.",
      "Anchor the icon to that first line, then inspect the artwork and font at their real sizes.",
      "Test the row with a long description and larger text.",
    ],
    reviewPrompts: [
      "Does the bell still sit beside the title after a wrap?",
      "Does the artwork look aligned inside its SVG box?",
      "Would a single-line version need a different treatment?",
    ],
  },
  "layout-7": {
    whyItMatters: "In the stat panel, four nested outlines give the wrapper, label, and two values similar visual status. One surface can hold the same material together. In a grid of independently actionable records, a repeated border can instead clarify where each item begins and ends.",
    riskWhenIgnored: "Removing all outlines can hide the bounds of separate interactive items. Adding a frame to every label makes it harder to see which pieces share a single action.",
    implementationNotes: [
      "Identify whether a group is an independent item, a section, or a control.",
      "Try a heading and a change in spacing before adding an inner frame.",
      "Keep the boundary when its removal obscures an action or ownership.",
    ],
    reviewPrompts: [
      "What does this edge tell the reader?",
      "Can the items be reordered independently?",
      "Can a reader tell which action belongs to each item?",
    ],
  },
  "layout-8": {
    whyItMatters: "The preview changes only the gap between rows in a two-by-two grid. At 8px across and 24px down, the cells begin to look like two horizontal pairs. That is a useful distinction when the pairs belong together.",
    riskWhenIgnored: "An unexplained row break can suggest a grouping that the content does not support. Enforcing square gutters everywhere can also crowd rows of captions or separate a label from its value.",
    implementationNotes: [
      "Identify the units a reader should compare or scan together.",
      "Apply a consistent row gap and a consistent column gap.",
      "Inspect actual captions and unequal card heights before linking both axes to one token.",
    ],
    reviewPrompts: [
      "Does the pattern imply rows, columns, or independent cards?",
      "Is that grouping meaningful in the content?",
      "What happens to the gutters when the grid loses a column?",
    ],
  },
  "layout-9": {
    whyItMatters: "A card with 24px padding on both sides spends 48px of its width before the first word is set. In a narrow slot, using 12px on each side gives the copy another 24px. The same change can be unnecessary inside a compact form field.",
    riskWhenIgnored: "Holding on to a wide gutter can push an action onto a second line. Scaling every gap down indiscriminately can crowd touch targets or erase a group boundary.",
    implementationNotes: [
      "Compare the content area at the narrowest and widest widths.",
      "Use responsive tokens for large insets and static ones for stable internal relationships.",
      "Check the card inside a narrow desktop column as well as on a phone.",
    ],
    reviewPrompts: [
      "Which gutter costs useful reading space?",
      "Do interactive targets retain enough size and separation?",
      "Does the layout work when a card narrows independently of the viewport?",
    ],
  },
  "layout-10": {
    whyItMatters: "The example uses 8px, 16px, and 32px to distinguish three levels. The important property is the separation between those levels. A well-chosen scale can include intermediate steps or different increments and still explain the same hierarchy.",
    riskWhenIgnored: "A section break close in size to an ordinary row gap can make two groups run together. Multiples of a single unit can still produce that problem if the wrong token is assigned.",
    implementationNotes: [
      "Give the smallest gap to closely related details.",
      "Pick a visibly larger step for new groups and sections.",
      "Inspect the rhythm after headings wrap and content grows.",
    ],
    reviewPrompts: [
      "Where does one item end and the next section begin?",
      "Do repeated sections have consistent spacing?",
      "Does a larger break correspond to a meaningful boundary?",
    ],
  },
  "layout-11": {
    whyItMatters: "The two diagrams put the modal above the dropdown. Both sets of numbers achieve that ordering in the same context. Role names explain the decision to the next author. Native dialogs and popovers in the top layer follow a different stacking mechanism.",
    riskWhenIgnored: "A dropdown inside a transformed ancestor can stay under a sticky header even with z-index 9999. Raising the number conceals the actual question of where the dropdown belongs in the document.",
    implementationNotes: [
      "List which overlays may appear together and which must take input.",
      "Inspect ancestor stacking contexts before changing a layer value.",
      "Use a suitable portal or a native top-layer primitive when the overlay must escape its context.",
    ],
    reviewPrompts: [
      "Which context owns each competing element?",
      "Does the visual order match focus and pointer behavior?",
      "Can feedback for an action still be seen inside the active dialog?",
    ],
  },

  // ── Color & depth ────────────────────────────────────────────────
  "color-1": {
    whyItMatters: "In the sample, the New report action shares its blue with the header and navigation. Keeping the surrounding chrome neutral makes the button’s fill distinctive. A branded masthead can work just as well if another cue identifies the primary action.",
    riskWhenIgnored: "A palette quota can reward the wrong change. Shrinking a warning to hit a target percentage could make the most important information on the screen less visible.",
    implementationNotes: [
      "Identify the decision the page supports.",
      "Compare the action with nearby elements using the same accent.",
      "Check status, navigation, and content on a representative screen before changing the palette.",
    ],
    reviewPrompts: [
      "Which item should a reader find first?",
      "Where else does its accent appear nearby?",
      "Can the intended action still be identified without color?",
    ],
  },
  "color-2": {
    whyItMatters: "On the white card, #0f172a measures about 17.9:1 and black measures 21:1. Both exceed the enhanced threshold for ordinary text. The difference the example demonstrates is whether the card follows its chosen ink color. Neither measurement predicts an individual reader’s comfort.",
    riskWhenIgnored: "A hard-coded color can look fine in a single light-theme card, then disappear when its surface switches to a darker theme. A search-and-replace that removes all black can also defeat a deliberately high-contrast palette.",
    implementationNotes: [
      "Define semantic text and surface tokens together.",
      "Measure the rendered pair in each supported theme.",
      "Respect the reader’s contrast settings and check the UI when system colors take over.",
    ],
    reviewPrompts: [
      "Does the card use the expected text role?",
      "What ratio does the pair produce on this surface?",
      "Do important details remain visible in increased-contrast settings?",
    ],
  },
  "color-3": {
    whyItMatters: "Both samples use the same offsets, blur, and opacity. Changing just the tint lets you judge whether the promo card belongs to the campaign’s indigo treatment. The choice communicates an art direction. Other surfaces can share one neutral elevation token.",
    riskWhenIgnored: "A literal brand-colored glow on every dropdown and dialog can compete with focus indicators or suggest a special state. A one-off black shadow on a campaign card can also drift from its intended treatment.",
    implementationNotes: [
      "Choose a shadow role and compare its appearance on the actual surrounding surface.",
      "Hold blur, offset, and opacity constant while judging the tint.",
      "Check whether the group boundary remains clear when forced colors remove shadows.",
    ],
    reviewPrompts: [
      "Does this shadow represent ordinary elevation or a specific visual treatment?",
      "Does it compete with focus or selection cues?",
      "Can the content stand on its own when shadows disappear?",
    ],
  },
  "color-4": {
    whyItMatters: "The feed places Like and Delete next to one another. Keeping their symbols and wording distinct allows the team to choose a heart color suited to the product. If red is the strongest warning cue in this toolbar, spending it on both items weakens that local distinction.",
    riskWhenIgnored: "A reader who cannot distinguish the colors can lose the difference between two otherwise identical status marks. Recoloring an ambiguous control addresses only one part of the problem.",
    implementationNotes: [
      "Name the product’s status roles and specify the accompanying text or shape.",
      "Check dangerous actions beside common actions in the same toolbar.",
      "Review the task with color removed.",
    ],
    reviewPrompts: [
      "How does a reader identify the dangerous action?",
      "Could the same accent describe different states within this row?",
      "Which cue remains if the two hues look identical?",
    ],
  },
  "color-5": {
    whyItMatters: "The settings summary already positions a label and value on each row. Its rules can be subtle because removing them leaves the rows identifiable. An otherwise unmarked text field has a different job for its outline.",
    riskWhenIgnored: "Treating all borders as decorative can make inputs disappear. Treating every divider like a control edge can make a dense table look dominated by its grid.",
    implementationNotes: [
      "Remove the line temporarily and identify which information disappears with it.",
      "Use a decorative token for redundant separators.",
      "For essential components or graphical boundaries, measure contrast with the adjacent colors.",
    ],
    reviewPrompts: [
      "Can a reader still pair each label with its value?",
      "Is this boundary decorative or required to locate something?",
      "Do changes in surface color alter that answer?",
    ],
  },
  "color-6": {
    whyItMatters: "The blank area where a teammate’s address goes needs to look editable before anyone reaches it. On white, a pale gray input edge can look stronger than a divider and still miss 3:1. The action labeled Cancel may be identifiable from its content and context without a visible border.",
    riskWhenIgnored: "Reusing a decorative divider token for a field can leave the reader with a label and an apparently blank page. Making only its focused outline visible helps keyboard navigation after focus arrives and leaves the resting field hard to find.",
    implementationNotes: [
      "Identify which visual feature makes the resting input recognizable.",
      "Measure that feature against its adjacent surface, including themed variants.",
      "Test focus and selected states separately from the resting control.",
    ],
    reviewPrompts: [
      "Without the border, can a reader still find the field?",
      "Does the required cue reach 3:1 on the adjacent surface?",
      "Are focused and selected controls identifiable by their own cues?",
    ],
  },
  "color-7": {
    whyItMatters: "Hover changes what the pointer is over. It does not submit the form. In the example a blue button deepens on hover. Turning it green could resemble the confirmation treatment used after a successful action. In another system a deliberate hue change may be a recognizable brand interaction.",
    riskWhenIgnored: "If hover alone makes a button look selected or complete, a person can misread the state before acting. A touch user may never see a hover cue at all.",
    implementationNotes: [
      "Define resting, hover, pressed, focus, and completed states separately.",
      "Inspect the label and icon contrast through each state.",
      "Ensure the action can be identified and operated with touch and keyboard.",
    ],
    reviewPrompts: [
      "What does the color change communicate here?",
      "Is completion still distinct from hovering?",
      "Can the control be found before hover occurs?",
    ],
  },
  "color-8": {
    whyItMatters: "In the storage card, the raised panel needs to separate from its page and the usage bar needs to stay legible on its track. Those are two different color decisions. A page-wide inversion would also change the colors of the image preview.",
    riskWhenIgnored: "A newly themed panel may look convincing on its own while merging into the page behind it. An inverted thumbnail can misrepresent the file a person is choosing.",
    implementationNotes: [
      "Compare page, card, and overlay colors as a stack.",
      "Measure text, icons, and meaningful graph elements on their own surfaces.",
      "Inspect photos and illustrative or monochrome assets separately.",
    ],
    reviewPrompts: [
      "Are the surface boundaries clear at each level?",
      "Can the usage indicator be read on the dark track?",
      "Is the preview still a faithful representation of the file?",
    ],
  },
  "color-9": {
    whyItMatters: "On white, #737373 is about 4.74:1. The helper text passes at its regular size. The other sample, #aaaaaa, is about 2.32:1. The labels round these measurements for display. A measured 4.49:1 still fails the 4.5:1 threshold.",
    riskWhenIgnored: "Assuming that every gray in a palette has a fixed rating misses the second color in the calculation. A pair that passes on white can fail on a tinted input or a lighter part of a photo.",
    implementationNotes: [
      "Measure the final foreground and background colors, accounting for transparency.",
      "Use the large-text allowance at 18pt regular or 14pt bold and above, or equivalent sizes for CJK fonts.",
      "Check helper text, placeholders, and active state labels. Incidental text and logotypes have specific exceptions.",
    ],
    reviewPrompts: [
      "What measured pair supports the verdict?",
      "If large-text thresholds are used, what size and weight qualify it?",
      "Does it pass at the least contrasting background behind the letters?",
    ],
  },
  "color-10": {
    whyItMatters: "The nav sample derives two tints from the same blue. Alpha mixes the source color with whatever is underneath, so an identical value produces different colors over light and dark panels. A change to the brand updates a derived tint but does not guarantee readable text or visible selection.",
    riskWhenIgnored: "An opaque light-blue value reused on a dark sidebar can look like a stray light-theme row. A very faint translucent fill can cause the opposite problem and leave selection hard to distinguish.",
    implementationNotes: [
      "Name hover and selected backgrounds separately.",
      "Use a shared source where those roles intentionally track the brand.",
      "Check the composited result on every supported surface and retain a persistent selected cue.",
    ],
    reviewPrompts: [
      "Does the selected row stay distinguishable from a hovered row?",
      "Can the label still be read over the composited fill?",
      "Which states should change when the brand color changes?",
    ],
  },
  "color-11": {
    whyItMatters: "The preview places pale and dark thumbnails on matching surfaces. A translucent dark line separates the pale edge, while a light line can separate the dark edge. The line serves as a framing detail unless it also identifies a control or a selected state.",
    riskWhenIgnored: "A dark outline can disappear against a dark crop. A stronger border around every photo can introduce an unintended selection cue or obscure detail along the crop edge.",
    implementationNotes: [
      "Test actual images with pale, dark, and transparent edges.",
      "Keep the line inside the thumbnail if preserving its external dimensions matters.",
      "Use a separate, accessible indication for focus and selection.",
    ],
    reviewPrompts: [
      "Is the edge difficult to locate in this crop?",
      "Does the line remain subordinate to the image?",
      "Can people distinguish the frame from focus or selection?",
    ],
  },
  "color-12": {
    whyItMatters: "The payment cards use a zero-blur shadow with a 1px spread to draw the edge and a second blurred shadow to suggest lift. The first layer extends outside the box. Either shadows or outlines can suit payment methods, depending on whether the design treats them as raised cards or rows.",
    riskWhenIgnored: "Forced-color modes suppress box shadows. If a shadow is the sole cue that a field or selected card exists, that distinction can disappear even while its content remains visible.",
    implementationNotes: [
      "Decide whether the surface is raised, flat, or selected.",
      "Use the corresponding elevation token and examine it on each theme surface.",
      "Supply a visible system-color border or outline in forced colors when the boundary carries meaning.",
    ],
    reviewPrompts: [
      "What relationship does elevation communicate here?",
      "Does the boundary remain visible when shadows are suppressed?",
      "Can selection be distinguished from ordinary elevation?",
    ],
  },

  // ── Components & actions ─────────────────────────────────────────
  "comp-1": {
    whyItMatters: "In a project editor, Save, Cancel and Preview sit together but do different jobs. Giving Save a distinct treatment helps someone who has finished editing find their way out. A screen can contain several independent tasks with their own action groups.",
    riskWhenIgnored: "A filled “Accept” next to a faint “Decline” can steer a decision about consent. Equal prominence is appropriate when the choice belongs to the person making it.",
    implementationNotes: [
      "Group controls by the task they affect.",
      "Use one prominent button within a group that has a clear next step.",
      "Check that secondary actions remain legible, reachable and honestly labeled.",
    ],
    reviewPrompts: [
      "What is someone trying to finish here?",
      "Can someone who wants to cancel find that option?",
      "Is there a reason to recommend one of these choices?",
    ],
  },
  "comp-2": {
    whyItMatters: "“Delete project” can mean removing a shortcut, sending a project to Trash, or erasing a shared workspace for everyone. Two red buttons can conceal three very different consequences. Name the object, scope and recovery path where the decision is made.",
    riskWhenIgnored: "Someone who only meant to clean up their own sidebar could erase files their team still uses. A generic “Are you sure?” gives them little reason to reconsider.",
    implementationNotes: [
      "Distinguish leaving a project from deleting it for everyone.",
      "Name the affected project and whether recovery is possible in the confirmation.",
      "Offer an explicit Cancel action and consider initial focus on the least destructive choice.",
    ],
    reviewPrompts: [
      "Whose data changes?",
      "Could the confirmation be mistaken for a harmless removal?",
      "Can someone back out using only the keyboard?",
    ],
  },
  "comp-3": {
    whyItMatters: "The centers of two circular arcs coincide when their radii differ by the inset. Measure between the edges you want to align. A border can add to the distance between a card’s outer edge and the child’s edge.",
    riskWhenIgnored: "Matching token names alone can leave the diagonal gap around a corner visibly wider or narrower than the straight gutter.",
    implementationNotes: [
      "Measure from painted edge to painted edge, including any intervening border.",
      "Subtract the inset and use zero if the result would be negative.",
      "Inspect other corner shapes separately, especially unequal insets and elliptical radii.",
    ],
    reviewPrompts: [
      "Which two edges should track each other?",
      "Has the border been included in their separation?",
      "Does the corner still read as an even inset at the smallest component size?",
    ],
  },
  "comp-4": {
    whyItMatters: "A person, a workspace and a file can all have an uploaded image. A consistent crop helps readers distinguish the kinds of items before examining each image. Shape gets its meaning from repeated use within the product.",
    riskWhenIgnored: "If a document cover and a profile picture have identical crops and the same generic label, the destination may be unclear even after the image loads.",
    implementationNotes: [
      "Choose separate treatments for the entity types people actually need to distinguish.",
      "Show the person’s name or another meaningful identifier alongside the picture when identity matters.",
      "Keep the fallback for a missing photo recognizable as the same kind of item.",
    ],
    reviewPrompts: [
      "Can a reader distinguish a person from a file without recognizing the photo?",
      "How does a team avatar differ from an individual in this system?",
      "Does a missing image preserve the same identity cue?",
    ],
  },
  "comp-5": {
    whyItMatters: "A drawer describes placement. Modality describes whether someone can continue using the rest of the interface. A side-by-side editor can keep a record in view while a person changes it, but a modal drawer still blocks interaction with that record.",
    riskWhenIgnored: "If an editor asks someone to copy a value from a table behind a modal, the needed information can be visible yet unreachable. A narrow drawer can create the same trouble by obscuring the table.",
    implementationNotes: [
      "Identify which background information the task requires.",
      "Choose a nonmodal split view when the task requires interaction with both surfaces.",
      "Test a long field, the onscreen keyboard and the smallest supported viewport before committing to the panel.",
    ],
    reviewPrompts: [
      "Can the user see the information needed to finish?",
      "Can they interact with the underlying page when the task calls for it?",
      "Would a dedicated page give a complex task a clearer sequence?",
    ],
  },
  "comp-6": {
    whyItMatters: "A notice at the top can say a form failed. The message beside Work email can tell someone that the domain is missing. These serve different purposes and can work together.",
    riskWhenIgnored: "A disappearing notice leaves someone who needs more time with the same rejected value and no explanation. A network outage described as a field error sends them looking for a correction they cannot make.",
    implementationNotes: [
      "Preserve the value and put the specific correction by the field.",
      "Associate the message with the control, for example with aria-describedby.",
      "Keep a persistent service-level message when a system failure prevents progress.",
    ],
    reviewPrompts: [
      "Can someone find the field from the summary?",
      "Does the message explain a correction the user can actually make?",
      "Can someone returning to the field still read the error?",
    ],
  },
  "comp-7": {
    whyItMatters: "A box with a downward arrow can mean Download, Move or Archive. Beside “Archive,” the same shape helps a returning user scan the toolbar without asking a first-time user to guess.",
    riskWhenIgnored: "A tooltip that clarifies Archive on hover provides little help to someone choosing an action on a touchscreen. An accessible name helps assistive technology but does not teach the glyph to a sighted newcomer.",
    implementationNotes: [
      "Use a short verb for each action whose consequence is ambiguous.",
      "Name icon-only controls and hide purely decorative icons from assistive technology.",
      "Try representative tasks with new and experienced users before dropping visible labels.",
    ],
    reviewPrompts: [
      "What else might this glyph mean in this context?",
      "Can someone identify the action without hover?",
      "Does the accessible name match the visible action?",
    ],
  },
  "comp-8": {
    whyItMatters: "A disabled Export button may mean the selection is empty, the user lacks permission, or a request is still running. Each state calls for a different response. Native disabled buttons normally leave the tab sequence, so a tooltip attached only to the button is easy to miss.",
    riskWhenIgnored: "“Not available” leaves someone hunting through a form. “Select at least one row to export” points to an action they can take.",
    implementationNotes: [
      "Prefer a persistent explanation at the point of need.",
      "When the user can submit and then correct errors, consider leaving the action available and explaining the errors on submission.",
      "If using aria-disabled to retain focusability, suppress activation in the handler and check every input method.",
    ],
    reviewPrompts: [
      "Is the cause apparent before trying the control?",
      "Does the explanation say what can change the state?",
      "Can keyboard and touch users find it?",
    ],
  },
  "comp-9": {
    whyItMatters: "A submit control has two audiences. The person needs to know whether the request started, and the service needs to know whether a retry represents the same operation. A spinner can answer the first question. The server must handle the second.",
    riskWhenIgnored: "A connection can drop after a payment succeeds but before the receipt reaches the browser. Disabling the original button cannot make a later retry safe.",
    implementationNotes: [
      "Keep a meaningful label and preserve the button’s dimensions during loading.",
      "Prevent duplicate activation while pending and give important operations an idempotent server contract.",
      "Expose a meaningful status, preserve input on failure and tell the user how to recover.",
    ],
    reviewPrompts: [
      "Does the user know the request is still pending?",
      "Can a retry create the same order twice?",
      "Can someone recover after a timeout without re-entering the form?",
    ],
  },
  "comp-10": {
    whyItMatters: "A 20px artboard can hold a compact solid shape or an open outline. Matching the boxes establishes a baseline. Matching the apparent scale also requires looking at the drawings, stroke weights and internal whitespace.",
    riskWhenIgnored: "A 24px trash icon beside a 16px archive icon can give a secondary action more emphasis purely through size. Enlarging the glyph alone still leaves its clickable area uncertain.",
    implementationNotes: [
      "Choose one artboard size for a peer group.",
      "Review thin, dense and asymmetric glyphs beside each other at their rendered size.",
      "Adjust optical imbalance within the icon family while keeping focus and pointer targets consistent.",
    ],
    reviewPrompts: [
      "Which actions belong to the same group?",
      "Does one glyph dominate without a reason?",
      "Can the button remain easy to hit even when the drawing is small?",
    ],
  },
  "comp-11": {
    whyItMatters: "If the image, heading and whitespace all advertise the same destination, a generous target matches that promise. Cards containing a menu, a checkbox or another link require distinct interaction areas.",
    riskWhenIgnored: "An invisible link stretched over an entire card can intercept its Save button or block selecting a tracking number. A generic clickable container can also lose native link features such as opening in a new tab.",
    implementationNotes: [
      "Use a native link with a concise, descriptive name for navigation.",
      "Keep other interactive elements outside that link, with independently reachable targets.",
      "Check the image, padding, text selection, context menu and keyboard focus in the rendered card.",
    ],
    reviewPrompts: [
      "Does the visual affordance agree with the clickable area?",
      "Can each secondary action be operated independently?",
      "Can readers select text that they may need to copy?",
    ],
  },
  "comp-12": {
    whyItMatters: "The shortcuts sheet in the example contains reference material. Closing it loses nothing, so outside-click dismissal is convenient. An editor containing an unsaved draft needs a decision about saving or discarding the work, regardless of how dismissal starts.",
    riskWhenIgnored: "A backdrop-only exit leaves no obvious control to focus. Closing on every outside tap can create the opposite problem when a slight miss discards edits.",
    implementationNotes: [
      "Include a labeled dismissal control in the dialog’s tab sequence.",
      "Make Escape act on the topmost dismissible overlay and return focus to a logical place.",
      "Route all dismissal paths through the same unsaved-work handling.",
    ],
    reviewPrompts: [
      "Can a keyboard user discover how to leave?",
      "What happens to an unsaved edit after Escape or a backdrop click?",
      "Where does focus land after dismissal?",
    ],
  },

  "comp-13": {
    whyItMatters: "A support lead reviewing ticket volume has two questions. Which queue grew this quarter, and how many billing tickets arrived in March? A short trend sentence answers the first. A table with row and column headers lets the reader look up the second without estimating a bar’s height.",
    riskWhenIgnored: "“Bar chart of support tickets” identifies the graphic but omits its finding. A table left on January through March after the chart switches to April through June can give a precise answer for the wrong period.",
    implementationNotes: [
      "Write the question the chart should answer. Name the measure, time period and series where the reader encounters the chart.",
      "Summarize the meaningful change in words. Include structured values when the reader needs to look them up. A simple chart whose entire point fits in a sentence may need only that sentence.",
      "Build the plot, summary and table from the same filtered data. Give data tables real headers and make the control that reveals them keyboard accessible.",
    ],
    reviewPrompts: [
      "With the bars hidden, which queue grew over the selected period?",
      "Can a reader find March’s billing count and identify its unit using the table headers?",
      "After changing the quarter, do the plotted values, summary and table still agree?",
    ],
  },

  // ── Forms & inputs ───────────────────────────────────────────────
  "form-1": {
    whyItMatters: "In the billing form, “Billing address” is longer than “Full name.” Putting each label directly above its control gives the controls a shared left edge even as either label wraps. On a wide, dense editor a shared label column can achieve the same alignment.",
    riskWhenIgnored: "Giving each side label only its own text width makes the input column jump from row to row. Truncating labels to fix the alignment can hide the distinction between two questions.",
    implementationNotes: [
      "Give each field a programmatic label.",
      "Leave space for long labels and instructions to wrap.",
      "Inspect the association at a narrow width, with larger text and in a supported language with longer strings.",
    ],
    reviewPrompts: [
      "Can someone match each label to its control at a glance?",
      "Does the full label survive reflow?",
      "Does the accessible name still make sense when read on its own?",
    ],
  },
  "form-2": {
    whyItMatters: "Returning to a filled address form, “London” could be the city of birth or a delivery destination. The field’s value cannot reliably tell the reader which question it answered.",
    riskWhenIgnored: "A browser can fill several fields before the user sees the placeholders. A screen full of values without labels becomes difficult to check or correct.",
    implementationNotes: [
      "Associate each visible label with its control.",
      "Keep essential format instructions visible outside the placeholder.",
      "Review the form empty, partially filled and autofilled.",
    ],
    reviewPrompts: [
      "Can someone identify each filled field?",
      "Can they find its instructions while editing?",
      "Does a screen reader announce the same purpose as the visible label?",
    ],
  },
  "form-3": {
    whyItMatters: "“Phone (optional)” answers a practical question before someone looks up their number. An asterisk can also communicate a requirement when its meaning is explained before the form and exposed to assistive technology.",
    riskWhenIgnored: "Marking Phone as required while the service accepts an empty value invites unnecessary disclosure. Leaving a truly required field unmarked under an unclear convention produces avoidable errors at submission.",
    implementationNotes: [
      "Ask only for information the task needs.",
      "State the marking convention before the first field and label exceptions consistently.",
      "Set native required semantics on required controls and verify the server enforces the same contract.",
    ],
    reviewPrompts: [
      "Can someone tell which questions may be skipped?",
      "Do announced and visual requirements agree?",
      "Will the service accept a blank optional answer?",
    ],
  },
  "form-4": {
    whyItMatters: "Street addresses vary substantially in length. A compact ZIP field in a US-specific example suggests a short answer, while a wider street field leaves room to read an address during review. Width and allowed length are separate decisions.",
    riskWhenIgnored: "A five-character maximum copied from a compact example can reject ZIP+4 or international postal codes. A plausible-looking field width alone does not explain those restrictions.",
    implementationNotes: [
      "Choose the width from representative answers, including longer valid ones.",
      "Set length restrictions only when the data contract requires them.",
      "Accept common formatting variations and preserve leading zeroes in postal codes.",
    ],
    reviewPrompts: [
      "Which regions and formats does this form support?",
      "Is a valid longer answer still readable?",
      "Does the backend accept the same formats as the field?",
    ],
  },
  "form-5": {
    whyItMatters: "Selecting Pro should replace Starter because one subscription has one plan. Independent add-ons have different behavior: choosing storage need not change the support option.",
    riskWhenIgnored: "Two checked plans leave the purchaser unable to predict the charge. Silently unchecking a neighboring checkbox also makes an independent-looking choice behave unexpectedly.",
    implementationNotes: [
      "Name the group and give each option a distinct label.",
      "Put native radios with the same purpose in the same named group.",
      "For an optional choice that must be clearable, provide a meaningful None option or another clear reset.",
    ],
    reviewPrompts: [
      "Can more than one answer be valid?",
      "Can a person leave an optional question unanswered after changing their mind?",
      "Does keyboard selection follow the native control pattern?",
    ],
  },
  "form-6": {
    whyItMatters: "Monthly, yearly and every two years are easier to compare when all three billing cycles are in view. The benefit comes from seeing alternatives or descriptions together. A count of four or five by itself says little about the task.",
    riskWhenIgnored: "A collapsed select can hide a meaningful price or eligibility difference. Dozens of expanded radio rows can make a familiar item arduous to locate.",
    implementationNotes: [
      "Consider option length, explanatory detail and available vertical space.",
      "Use a native select for an appropriate compact list and consider search for a long familiar vocabulary.",
      "Preserve keyboard use, focus visibility and a clear group label.",
    ],
    reviewPrompts: [
      "Can someone compare the important differences before choosing?",
      "Does a long list support finding a known answer?",
      "Can the choice be made on a phone and with a keyboard?",
    ],
  },
  "form-7": {
    whyItMatters: "Dark mode gives immediate evidence when the theme changes. A subscription preference in an account form may still require Save. The visual position of a toggle alone cannot explain whether an update reached the service.",
    riskWhenIgnored: "Someone who turns on product emails and leaves before pressing Save may believe they subscribed. An instantly applied change that fails to save needs equally clear recovery.",
    implementationNotes: [
      "Use a stable setting label as a switch changes state.",
      "Use a checkbox for a pending choice when that matches the surrounding form.",
      "If saving fails, show the actual saved state and an appropriate recovery action.",
    ],
    reviewPrompts: [
      "Which settings take effect immediately?",
      "Is the save boundary visible?",
      "Does the announced state match the value that will persist?",
    ],
  },
  "form-8": {
    whyItMatters: "An incomplete email such as “maya@” is expected halfway through typing. Treating that intermediate state as a failure produces a message the user cannot resolve except by continuing the entry they already intended to make.",
    riskWhenIgnored: "A form that validates only on blur can miss submission from the final field. A message that keeps returning on every key can interrupt someone who is already correcting the problem.",
    implementationNotes: [
      "Validate on submission, including on the server.",
      "Reserve field-exit validation for complete-looking entries where the feedback is worth the interruption.",
      "Keep errors associated with the input and avoid repeating live announcements for each keystroke.",
    ],
    reviewPrompts: [
      "Can someone start an address without an error flash?",
      "Does submitting from the final field still catch a problem?",
      "Does the error clear when the entered address is accepted?",
    ],
  },
  "form-9": {
    whyItMatters: "A card can print its expiry as “03/27.” A nearby MM / YY hint lets the user match the two parts to the field. If the service can normalize spaces and separators, making the user reproduce them adds no information.",
    riskWhenIgnored: "A form that first reveals its expiry format in an error message has charged an extra submission attempt for an instruction it could have given earlier.",
    implementationNotes: [
      "Show the hint before entry and keep it available during editing.",
      "Associate the hint with the field and localize it for the supported formats.",
      "Test paste, autofill and common variations before adding a restrictive input mask.",
    ],
    reviewPrompts: [
      "Can someone enter a valid answer on their first attempt?",
      "Which variations can be normalized safely?",
      "Does the error show an example that this particular field accepts?",
    ],
  },
  "form-10": {
    whyItMatters: "In a two-column form, someone may scan across rows while Tab moves down the first column. Choosing one clear sequence reduces the need to reconstruct the form’s order. A compact group such as parts of one date can still read as one question.",
    riskWhenIgnored: "A user following the visible sequence may discover a required question several fields later when the keyboard moves somewhere unexpected. Zoom can make that mismatch more disorienting.",
    implementationNotes: [
      "Arrange fields in meaningful document order before applying a grid.",
      "Pair fields only when the task and supported locales give the grouping a clear meaning.",
      "Test the sequence at full width, narrow width and with enlarged text.",
    ],
    reviewPrompts: [
      "Can someone predict the next question?",
      "Does Tab preserve a meaningful order after reflow?",
      "Do the grouped fields belong together in the locales supported?",
    ],
  },
  "form-11": {
    whyItMatters: "The itinerary already holds the booking date. Asking the traveler to recall it on the next screen adds work and invites a conflicting answer. Offer the date for review. A country inferred from the browser language has a different origin and deserves a question.",
    riskWhenIgnored: "A wrong prefilled destination can survive review precisely because the form looks complete. Defaulting an effective date to today can also create an unintended commitment.",
    implementationNotes: [
      "For a repeated required answer within one process, prefill it or make the prior answer available to select. WCAG 3.3.7 allows exceptions for essential re-entry, security, and information that has become invalid.",
      "Give browser autofill the correct field metadata as a separate convenience. A browser may have no saved value for the date supplied earlier in this booking.",
      "Ask for a consequential unknown, and let people review a known answer before committing. The repeated-entry criterion does not require storing personal answers between visits.",
    ],
    reviewPrompts: [
      "Where did this answer come from?",
      "Can someone review and change it before submitting?",
      "What happens if the form’s guess is wrong?",
    ],
  },
  "form-12": {
    whyItMatters: "An unchanged edit form can look identical before and after a successful save. “Saved successfully” distinguishes those states. A booking may require more, such as the reference needed to make a change.",
    riskWhenIgnored: "A generic success message shown when a request starts can contradict a later rejection. Clearing the fields early also destroys the information needed to try again.",
    implementationNotes: [
      "Distinguish pending, saved and failed states.",
      "Announce a meaningful inline completion message without moving focus unnecessarily.",
      "For a completed transaction, provide a durable confirmation and explain what happens next.",
    ],
    reviewPrompts: [
      "Was success confirmed by the service?",
      "Can someone perceive the outcome without seeing the icon?",
      "Can they recover the reference or next step later?",
    ],
  },

  "form-13": {
    whyItMatters: "A person signing in can copy a code from their authenticator once. If six boxes each accept one character, pasting 012345 into the first box may leave only 0. The visual grouping can stay the same while one text field accepts the complete code.",
    riskWhenIgnored: "The person must look back and forth between the sign-in page and the authenticator. Casting a code to a number introduces a second failure by dropping its leading zero, even when all six characters were pasted.",
    implementationNotes: [
      "For a digit-only code, use a labeled text field with `inputmode=\"numeric\"` and `autocomplete=\"one-time-code\"`. Carry the value as a string through submission.",
      "If the design uses separate input boxes, distribute a full paste in order and allow keyboard correction. Verify paste with a code copied from the source users actually receive.",
      "Check the entire existing-account sign-in flow, including password-manager fill. WCAG 2.2 allows an assisting mechanism or another qualifying path when a step requires a cognitive test; the criterion also has specific recognition exceptions.",
    ],
    reviewPrompts: [
      "Can a person paste 012345 once, correct a digit and submit the intended string?",
      "Does signing in with a saved password work before the code step?",
      "If transcription is required on one path, which available path lets someone complete authentication without it?",
    ],
  },

  // ── System & logic ───────────────────────────────────────────────
  "sys-1": {
    whyItMatters: "Both example panes wait 900ms. One reserves the spaces where the title and content will appear. The other communicates activity alone. The skeleton gives an early map of the page, without measuring the request’s progress.",
    riskWhenIgnored: "A skeleton shaped like a dense list can be misleading if the result is an empty search. A spinner that replaces the whole page during a background refresh also removes information someone could still use.",
    implementationNotes: [
      "Preserve useful loaded content during refresh.",
      "Reserve space for predictable content and respect reduced-motion preferences.",
      "Give slow or failed operations an accessible status and a recovery path.",
    ],
    reviewPrompts: [
      "Does the loading treatment accurately describe what is known?",
      "Can someone keep using content that has already loaded?",
      "What appears if the request fails or returns no records?",
    ],
  },
  "sys-2": {
    whyItMatters: "An empty project list, an empty search result and a failed request can all paint the same blank rectangle. The first may invite creation, the second may invite a different query, and the third needs recovery.",
    riskWhenIgnored: "A “Create project” button shown after a failed fetch implies there are no projects. Someone may duplicate work while their existing records remain temporarily unavailable.",
    implementationNotes: [
      "Represent loading, failure and a successful empty response separately.",
      "Match the explanation to the cause and the action to the person’s permissions.",
      "Allow a quiet confirmation when an empty inbox or completed queue is a desirable outcome.",
    ],
    reviewPrompts: [
      "Which state produced the empty view?",
      "Can this person actually perform the suggested action?",
      "Would a message alone be sufficient?",
    ],
  },
  "sys-3": {
    whyItMatters: "A 16px glyph can sit inside a 44px button and retain its intended visual scale. Enlarging the hit box helps at the moment the pointer arrives. Adding a margin gives separation but leaves the clickable area itself unchanged.",
    riskWhenIgnored: "A small Delete icon next to a clickable file row can turn a near miss into opening the file. Enlarging the target into its neighbor creates a different ambiguity about which action owns the overlap.",
    implementationNotes: [
      "Measure the actual interactive box in CSS pixels.",
      "For undersized targets, check the spacing or another exception in WCAG 2.5.8 rather than counting any gap as sufficient.",
      "Consider 44 × 44 CSS px for important touch controls. WCAG 2.5.5 uses that size at AAA with its own exceptions.",
    ],
    reviewPrompts: [
      "Where does the click actually land around the glyph?",
      "Does an adjacent action overlap its target?",
      "Can someone reliably hit it on the intended input devices?",
    ],
  },
  "sys-4": {
    whyItMatters: "“Two minutes ago” answers whether a file has just changed. Comparing an invoice with a bank record requires a stable date and sometimes a time zone. A single timestamp can support both views without changing the underlying instant.",
    riskWhenIgnored: "Relative labels become ambiguous in a screenshot or an audit trail. A raw UTC string can also hide a day boundary for someone working in another zone.",
    implementationNotes: [
      "Store an unambiguous instant for events and handle calendar-only dates as dates.",
      "Format for the reader’s locale and specify the relevant time zone for exact records.",
      "Offer a persistent detail or focusable disclosure when a relative label needs an exact counterpart.",
    ],
    reviewPrompts: [
      "Is the task about recency or a specific point in time?",
      "Which time zone determines the displayed date?",
      "Can someone obtain the exact time without a mouse?",
    ],
  },
  "sys-5": {
    whyItMatters: "A Save button and an overdue invoice can happen to share a hue today. Their meanings can diverge in the next theme. A named role allows each to change independently even when both point at the same palette entry.",
    riskWhenIgnored: "Reusing a button-specific color token for a warning quietly couples the two features. A brand update to the button then changes the warning’s meaning and contrast.",
    implementationNotes: [
      "Identify roles that need independent control across themes.",
      "Use aliases where the design system needs that indirection, rather than requiring three layers for every value.",
      "Check the resolved foreground and background pairs in each supported theme.",
    ],
    reviewPrompts: [
      "What intent does this component request?",
      "Can the warning change without changing the action?",
      "Do aliases resolve to legible pairs in every theme?",
    ],
  },
  "sys-6": {
    whyItMatters: "A short Undo notice is convenient for the person who catches a mistake immediately. A Trash folder covers someone who returns later or needs more time to reach the control. Both depend on the service retaining enough state to restore the original item.",
    riskWhenIgnored: "A five-second notice as the only recovery route can expire before a keyboard or screen-reader user reaches it. Client-side restoration can also mislead if the server has already erased the item or its permissions.",
    implementationNotes: [
      "Define what restoration recovers and for how long.",
      "Make Undo keyboard accessible and provide durable recovery when the transient control is missed.",
      "Reserve a confirmation or review step for consequences that cannot be undone.",
    ],
    reviewPrompts: [
      "Can the item be restored after the notice vanishes?",
      "Do restored content and access match their prior state?",
      "Does the user know when deletion becomes permanent?",
    ],
  },
  "sys-7": {
    whyItMatters: "“Step 2 of 4” is useful in a fixed sequence because the denominator is credible. In a branching application the same answer could add dependents, documents or eligibility questions, making a confident total misleading.",
    riskWhenIgnored: "A progress bar that moves backward after a new section appears can make completing an answer feel like losing progress. Counting every field as a step can also exaggerate the remaining effort.",
    implementationNotes: [
      "Use the terms people recognize for major stages.",
      "Show a reliable total only when the route is known.",
      "Preserve completed answers when users review or return to an earlier stage.",
    ],
    reviewPrompts: [
      "Can the person identify the current task?",
      "Does the stated total remain accurate on each branch?",
      "Can they review an earlier answer without losing later work?",
    ],
  },
  "sys-8": {
    whyItMatters: "A button commonly accepts Enter or Space, whereas a link normally follows its destination on Enter. A radio group may be one Tab stop with arrow navigation inside. Matching those expectations gives a person a usable path without making every child a separate stop.",
    riskWhenIgnored: "A modal whose actions are missing from the tab sequence can leave the keyboard behind the overlay. Conversely, a long toolbar with a separate stop for every possible child can make repeated navigation expensive.",
    implementationNotes: [
      "Keep a meaningful focus order and a visible focus indicator.",
      "Implement the keyboard pattern for the actual widget, including arrow keys in composites where specified.",
      "Contain Tab within an open modal, support Escape and restore focus to the opener or a logical successor.",
    ],
    reviewPrompts: [
      "Can the task be completed end to end without a pointer?",
      "Which keys does this control’s role lead users to expect?",
      "After dismissal, can the person continue from a sensible location?",
    ],
  },
  "sys-9": {
    whyItMatters: "Filling a heart at the tap gives immediate feedback. The saved favorite is a separate fact that the server confirms later. Designing both states forces the team to decide what the person sees if the connection drops or they tap again.",
    riskWhenIgnored: "If the first response arrives after a second tap, applying responses in arrival order can reverse the person’s latest choice. A silent rollback can leave someone convinced an item is saved when it is absent from Favorites.",
    implementationNotes: [
      "Track pending intent separately from confirmed state.",
      "Reconcile retries and out-of-order responses with the latest intended value.",
      "If persistence fails, show the actual state with a concise explanation and an appropriate retry.",
    ],
    reviewPrompts: [
      "Is the result safe to predict?",
      "Does a rapid second action survive a late response?",
      "Can the person tell what was actually saved after failure?",
    ],
  },
  "sys-10": {
    whyItMatters: "A missing decorative image and a missing invoice total have very different consequences. Reserving media dimensions can keep a product grid stable. A missing required value needs an explicit unavailable state so nobody mistakes a blank for zero.",
    riskWhenIgnored: "A decorative placeholder used in place of a diagram can hide the only explanation of a task. An unrestricted retry on a nonrepeatable action can also duplicate the operation.",
    implementationNotes: [
      "Reserve image dimensions and provide an appropriate text alternative for informative images.",
      "Keep usable content in place and distinguish failure from loading or an empty result.",
      "Offer a scoped retry for recoverable failures and an alternative for persistent ones.",
    ],
    reviewPrompts: [
      "What information does the missing resource carry?",
      "Can the rest of the task continue safely?",
      "Is another attempt likely to help, and is it safe to repeat?",
    ],
  },
  "sys-11": {
    whyItMatters: "A sidebar can stop fitting because its labels grow, the text is enlarged or the surrounding container narrows. Device names do not capture any of those conditions. A useful breakpoint describes a change the content needs.",
    riskWhenIgnored: "A layout tuned only on a list of popular phone widths can wrap an action bar or clip a label between those widths. Extra tiers are justified when each one addresses a distinct problem.",
    implementationNotes: [
      "Test continuous ranges with real content, translations and larger text.",
      "Prefer intrinsic wrapping or layout sizing when it solves the problem without a query.",
      "Use a container query when the relevant constraint is a component’s allocated space.",
    ],
    reviewPrompts: [
      "What breaks immediately before this change?",
      "Does the layout recover on both sides of the threshold?",
      "Does an embedded instance still work in a narrower parent?",
    ],
  },
  "sys-13": {
    whyItMatters: "Suppose a button animates its hover color and scale. Later a layout state changes its explicit width. With a general transition the width can interpolate too, while an explicit property list allows it to settle immediately.",
    riskWhenIgnored: "A button that stretches for 150ms while adjacent controls reposition can make a layout update look unfinished. A font swap changing intrinsic dimensions alone does not establish a transition between explicit width values.",
    implementationNotes: [
      "Define the intended properties, duration and easing for each state change.",
      "Exercise unrelated layout and theme changes while the control is mounted.",
      "Respect reduced motion where animation would distract or disorient.",
    ],
    reviewPrompts: [
      "Which computed values are intended to interpolate?",
      "Does an unrelated explicit width change stretch the control?",
      "Does the rest of the interface settle as expected?",
    ],
  },
  "sys-14": {
    whyItMatters: "A browser may use a hint to prepare for a change before the interaction starts. What it reserves depends on its implementation. A hint is neither a request for a guaranteed GPU layer nor evidence that a slowdown has been fixed.",
    riskWhenIgnored: "Putting a valid transform hint on every card can reserve resources for dozens of items that stay still. Some hints can also create a stacking context before the animation begins and change how overlays paint.",
    implementationNotes: [
      "Compare a representative interaction with and without the hint.",
      "Apply it to the measured element with enough lead time for the browser to prepare.",
      "Remove temporary hints when the interaction settles and recheck stacking and resource use.",
    ],
    reviewPrompts: [
      "Which trace identifies the problem?",
      "Does this hint improve that interaction on the target device?",
      "How many elements retain the hint when idle?",
    ],
  },

  // ── Motion & interaction ────────────────────────────────────────
  "motion-1": {
    whyItMatters: "A command palette has a useful test: open it and type the first letter in one motion. A palette can still be settling when the query arrives. If the field already has focus and the first result is readable, the entrance costs less than one that hides the result or defers input.",
    riskWhenIgnored: "If the first keystroke lands in the page behind the palette, shortening the fade alone leaves the interaction broken.",
    implementationNotes: [
      "Identify a repeated task and the next input it invites.",
      "Make its destination ready as soon as the action succeeds.",
      "Compare an immediate entrance with the current one over a sequence of realistic tasks.",
    ],
    reviewPrompts: [
      "Where does the first keystroke land?",
      "Does anything move under the pointer as the user reaches for the next action?",
      "What does the entrance explain on the tenth open?",
    ],
  },
  "motion-2": {
    whyItMatters: "Opening a palette and typing a query is one keyboard sequence. If focus moves only after the entrance finishes, the first characters can reach the previous control. A brief visual transition is compatible with immediate keyboard ownership.",
    riskWhenIgnored: "A missing first character sends the user into a different set of results. Escape during entry can also leave focus behind a closing overlay.",
    implementationNotes: [
      "Choose the initial focus target when mounting the panel.",
      "Keep the input and its focus indicator visible while typing.",
      "Open, type and dismiss without pausing between keys.",
    ],
    reviewPrompts: [
      "Does the first character appear in the query?",
      "Where does focus return after Escape during entry?",
      "Can the user see the currently focused control throughout?",
    ],
  },
  "motion-3": {
    whyItMatters: "An edge drawer can teach its relationship to the page in a single opening. The direction and resting position tell the same story. A bounce on a routine dialog adds a second movement after the dialog is already in place. Decide what that second movement conveys.",
    riskWhenIgnored: "Movement that repeats with every minor update can compete with the item the user is trying to read. Essential feedback also needs a recognizable end state.",
    implementationNotes: [
      "Describe the change the user should notice.",
      "Match a directional transition to the panel’s actual placement.",
      "Compare the transition with an immediate change and inspect what information disappears.",
    ],
    reviewPrompts: [
      "Can someone explain where the drawer went?",
      "Does the animation call attention to the right event?",
      "Does the end state communicate the result with reduced motion enabled?",
    ],
  },
  "motion-4": {
    whyItMatters: "At the same duration, changing the curve redistributes the travel. One third of the way through this 360ms example, CSS ease covers about 58% of the distance and the stronger curve covers about 88%. Both finish at the same time. The choice changes how long the content stays far from its destination.",
    riskWhenIgnored: "A curve tuned for an 8px menu entrance can produce a jarring first movement on a wide panel. A keyword curve may already suit a short move.",
    implementationNotes: [
      "Keep distance and duration fixed for the comparison.",
      "Check the early movement at the largest supported distance.",
      "Reuse a token for components with the same motion and purpose.",
    ],
    reviewPrompts: [
      "How far has the panel moved when the user starts reading?",
      "Does the largest instance appear to jump?",
      "Does a simpler curve communicate the same transition?",
    ],
  },
  "motion-5": {
    whyItMatters: "Easing changes displacement over time. A slow-starting curve can move a short distance so gradually that its first frames appear still. An immediate change to the trigger or panel can acknowledge the action even if a subsequent element accelerates.",
    riskWhenIgnored: "When the release of a busy button and the start of a menu both change imperceptibly, the user has little visible evidence of which state the interface has reached.",
    implementationNotes: [
      "Check the first few frames at the actual travel distance.",
      "Acknowledge the action at its source if the destination needs time to appear.",
      "Evaluate entrance and exit curves separately.",
    ],
    reviewPrompts: [
      "What is the first visible response to the press?",
      "Does the trigger still provide feedback with animation disabled?",
      "Does the exit communicate where the panel is going?",
    ],
  },
  "motion-6": {
    whyItMatters: "A menu opened beside its trigger has little ground to cover. Stretching the same motion from 180ms to 500ms leaves its labels moving for longer. A large change of view may need more time to show the relationship between the starting and ending positions.",
    riskWhenIgnored: "A fixed duration applied across a product can make a small menu linger and a full-width panel rush across the screen.",
    implementationNotes: [
      "Group motion tokens by role and travel distance.",
      "Test the smallest and largest instances of the component.",
      "Measure when content is usable separately from when it comes to rest.",
    ],
    reviewPrompts: [
      "Can a user select an item while the menu opens?",
      "Is the destination easy to follow on a wide screen?",
      "Does the transition still help after several uses?",
    ],
  },
  "motion-7": {
    whyItMatters: "On entry, a toast introduces information. On dismissal, the next task may already be underway. The example gives entry 220ms and exit 160ms. A dismissal that visibly returns an object to its destination may warrant more time than a routine fade.",
    riskWhenIgnored: "An exit can block the next click if its invisible layer still intercepts input. An exit that is too brief can hide where the object went.",
    implementationNotes: [
      "Set aside enough time to read a message before its dismissal begins.",
      "Keep focus on the person’s current task when a passive status toast appears or disappears. If a person dismisses it from a focused toast action, move focus to a logical surviving control.",
      "Interrupt an entrance with a dismissal and check the result.",
    ],
    reviewPrompts: [
      "Can the message be read before it goes away?",
      "Where does the next click or keystroke go?",
      "Does the destination of a moving item remain clear?",
    ],
  },
  "motion-8": {
    whyItMatters: "Feedback on contact lets a person see which control is under their finger. A small scale change can suit a compact icon button. The same factor moves the edges of a wide button much farther, and scaling the actual hit target can move it out from under a pointer near the edge.",
    riskWhenIgnored: "Committing a destructive action on pointer down can take away the chance to slide off and cancel before release.",
    implementationNotes: [
      "Apply decorative scale to an inner surface when the outer hit area should stay fixed.",
      "Use the native activation event for the action and the pressed state for feedback.",
      "Check keyboard activation, release outside and reduced motion.",
    ],
    reviewPrompts: [
      "Can a press near an edge finish or cancel predictably?",
      "Is the label still sharp and readable while held?",
      "Can the pressed state be recognized without movement?",
    ],
  },
  "motion-9": {
    whyItMatters: "Scaling a menu from zero makes every line pass through sizes too small to read. Starting at 95% of the final size keeps the text close to its resting geometry. On a small status glyph, the same relative change represents much less travel in pixels.",
    riskWhenIgnored: "A person can reach for a control before its moving edges align with the visible destination. Oversized scaling also adds motion to a routine action.",
    implementationNotes: [
      "Compare the same scale change on the smallest and largest surfaces.",
      "Try opacity alone when text moves noticeably.",
      "Keep the final position and focus cue visible when motion is reduced.",
    ],
    reviewPrompts: [
      "Can the user identify the menu as it appears?",
      "How far do its outer edges travel?",
      "Does scaling add information beyond the fade?",
    ],
  },
  "motion-10": {
    whyItMatters: "A menu may open below its button in the middle of a page and above it at the bottom. A hardcoded top edge looks plausible in the first case and makes the second menu grow away from its button. The resolved placement gives the animation a stable reference.",
    riskWhenIgnored: "A flipped panel can slide visually toward its trigger while the placement arrow points the other way. The two cues disagree.",
    implementationNotes: [
      "Choose the origin after placement and collision handling.",
      "Use the positioning library’s resolved origin if it provides one.",
      "Check alignment for offset triggers and right-to-left layouts.",
    ],
    reviewPrompts: [
      "Does the origin stay on the correct edge when the menu flips?",
      "Does it line up with an off-center trigger?",
      "Would a simple fade work better for a dialog without an anchor?",
    ],
  },
  "motion-11": {
    whyItMatters: "Hovering briefly while traveling to another control is different from pausing to read a label. A short warmup handles the first case. A shared cooldown lets someone move between neighboring tools before that delay starts again. Keyboard focus is deliberate and can reveal the tip immediately.",
    riskWhenIgnored: "Independent delays make a row of unfamiliar icons tedious to inspect. Hiding a tip as soon as the pointer leaves its trigger can also prevent someone from moving over the text to read it.",
    implementationNotes: [
      "Share one warmup state across neighboring triggers.",
      "Provide the information on keyboard focus and allow Escape to dismiss it.",
      "Keep the tip open while the pointer is over the trigger or its content where WCAG hover-content requirements apply.",
    ],
    reviewPrompts: [
      "Does a pass across unopened tools avoid a flash of unwanted tips?",
      "Can someone travel from a trigger onto its tip?",
      "After leaving and returning, does the initial delay reset?",
    ],
  },
  "motion-12": {
    whyItMatters: "A toggle may receive another click before it finishes moving. A CSS transition uses the current interpolated value when the target changes. Replaying a new animation from a fixed endpoint loses that position. A retained Web Animation can reverse its timeline, preserving continuity.",
    riskWhenIgnored: "An interrupted toggle can jump ahead to a state it never visibly reached, then move back toward the requested one.",
    implementationNotes: [
      "Use a transition for two stable CSS states.",
      "For a richer sequence, retain the Animation object and reverse or update it deliberately.",
      "Try repeatedly changing direction during the first and last portions of travel.",
    ],
    reviewPrompts: [
      "Does the object jump when its destination changes?",
      "Does the semantic state reflect the latest input?",
      "Can a stale completion handler undo a newer choice?",
    ],
  },
  "motion-13": {
    whyItMatters: "A transition normally needs a previous computed style. A newly rendered row may have none. A starting style supplies that missing state in the cascade and lets the row settle into its normal style. A second render solely to toggle an animation class adds timing to coordinate.",
    riskWhenIgnored: "A base style that keeps the row transparent until an effect runs can leave real content invisible when the script is delayed.",
    implementationNotes: [
      "Define final opacity and position in the normal rule.",
      "Place the starting declaration inside the row’s style rule, or target the row with a selector inside a standalone @starting-style block. At equal specificity, put the starting rule after the final declaration so its starting value wins.",
      "Insert successive rows and test with animation disabled.",
    ],
    reviewPrompts: [
      "Does the row appear on its first insertion?",
      "Is its ordinary computed style visible?",
      "Does removing the animation leave the information accessible?",
    ],
  },
  "motion-14": {
    whyItMatters: "A translated element keeps its original place in normal flow. This is useful for an overlay, but translating accordion content cannot push the following paragraph down. Height changes can do that work, with a layout cost that depends on the affected subtree and device.",
    riskWhenIgnored: "Substituting a transform for a height change can leave a gap or make two controls overlap. A large layout animation can miss frames during input.",
    implementationNotes: [
      "Decide whether neighboring content should move.",
      "Use transform for independent travel and real layout when reflow is part of the result.",
      "Record layout, paint and dropped frames on a representative device.",
    ],
    reviewPrompts: [
      "Are surrounding elements in the right places throughout?",
      "Can the keyboard still reach each visible control?",
      "What does the performance trace show while other work runs?",
    ],
  },
  "motion-15": {
    whyItMatters: "translateY(100%) moves an element by the height of its transform reference box. If a toast starts inset from the edge, moving one full height can leave that inset visible. An exit distance can combine a percentage with the known offset, or a surrounding container can clip the travel.",
    riskWhenIgnored: "One fixed offset can hide a short message yet leave part of a translated or multi-line message on screen. A visually hidden control may also remain focusable.",
    implementationNotes: [
      "Identify the edge or clipping boundary the object must cross.",
      "Test short, wrapped and translated content with the actual inset.",
      "Remove the dismissed surface from interaction when its state changes.",
    ],
    reviewPrompts: [
      "Does the tallest toast clear the boundary?",
      "Does the shortest toast also clear its inset?",
      "Can focus reach the dismissed content?",
    ],
  },
  "motion-16": {
    whyItMatters: "The hover media feature describes the primary pointing mechanism. A laptop with a trackpad and touch screen can satisfy this query while the person is tapping. The query is suitable for a CSS enhancement. An event-driven interaction that depends on the current pointer needs to inspect that event.",
    riskWhenIgnored: "If the only sign of an action appears on hover, a person using a keyboard or touch screen can miss it. Synthesized hover can also leave decoration active after a tap.",
    implementationNotes: [
      "Use (hover: hover) for primary-pointer hover decoration.",
      "For scripted hover behavior, check the current pointer type and handle keyboard focus separately.",
      "Test with a mouse and touch on the same device.",
    ],
    reviewPrompts: [
      "Can the control be identified before hovering?",
      "Does the action work with focus and activation from a keyboard?",
      "What happens when the user switches from trackpad to touch?",
    ],
  },
  "motion-17": {
    whyItMatters: "Large movement can cause discomfort for some users. A message can arrive at its final location immediately and still communicate that an action succeeded. WCAG 2.3.3, a Level AAA criterion, addresses the ability to disable interaction-triggered motion animation unless it is essential.",
    riskWhenIgnored: "Removing an animated checkmark without leaving a result can make a successful action indistinguishable from one that failed. An opacity change alone may also be too subtle to carry the message.",
    implementationNotes: [
      "Start with the final content and add movement only when appropriate.",
      "Honor the reduced-motion preference in CSS and scripted animations.",
      "Preserve status announcements for results that assistive technology should report.",
    ],
    reviewPrompts: [
      "With motion reduced, what tells the user the action succeeded?",
      "Do both CSS and JavaScript honor a preference change?",
      "Which movements are essential to the information or function?",
    ],
  },
  "motion-18": {
    whyItMatters: "Dragging slowly past a visible threshold gives a person spatial feedback. A fast flick in the dismissal direction can express the same intent with less travel. An old velocity sample can misread a drag that moved quickly, paused and then released.",
    riskWhenIgnored: "High sensitivity can dismiss an item during scrolling or a small correction. If the gesture is the only way to dismiss, people who cannot drag have no equivalent action.",
    implementationNotes: [
      "Measure recent movement along the dismissal axis and settle on release.",
      "Test a quick flick, slow drag, reversal and flick followed by a pause.",
      "Offer an ordinary dismiss control and a way to recover where loss matters.",
    ],
    reviewPrompts: [
      "Does a stationary release below the distance threshold keep the card?",
      "Does a canceled pointer leave the item intact?",
      "Can someone complete the same action with a single tap or click?",
    ],
  },
  "motion-19": {
    whyItMatters: "When pulling past the end of a scrollable surface, decreasing movement per pixel of pull can make the boundary tangible. A slider that represents a numerical value has a different job. A thumb beyond its maximum may imply a value the control cannot store.",
    riskWhenIgnored: "Unbounded overdrag can resemble valid progress. A spring that settles far from the value the application commits makes the control feel inaccurate.",
    implementationNotes: [
      "Choose which bounds belong to the model and which permit a visual overshoot.",
      "Cap visual travel beyond the edge and preserve the valid underlying value.",
      "Give a clear release destination and a reduced-motion settle.",
    ],
    reviewPrompts: [
      "What does movement beyond the edge mean here?",
      "Can someone mistake overshoot for a valid value?",
      "Does releasing or canceling show the correct resting state?",
    ],
  },
  "motion-20": {
    whyItMatters: "Pointer capture retargets events for a particular active pointer to the capture element. A mouse drag can then continue outside the handle. Direct-manipulation devices may supply implicit capture, so a touch demo alone can conceal a missing capture path.",
    riskWhenIgnored: "If a second contact overwrites the active pointer or a canceled drag follows the commit path, the handle can jump or submit an unintended change.",
    implementationNotes: [
      "Record the active pointerId and capture it when the drag starts.",
      "Choose touch-action to preserve the page gestures the control does not own.",
      "Handle pointerup, pointercancel and lostpointercapture with idempotent cleanup.",
      "For a slider, let a tap on the track set the value as well. Check the keyboard path and the single-pointer path separately.",
    ],
    reviewPrompts: [
      "Does a mouse drag continue outside the handle?",
      "Can a second finger take over unexpectedly?",
      "Can scrolling, cancellation or loss of capture leave the control stuck?",
    ],
  },
  "motion-21": {
    whyItMatters: "The example moves both indicators across the same distance. One gets a destination once. The other receives a transform write in each animation-frame callback. During a long JavaScript task those callbacks cannot run. The second indicator advances to the current position when the thread becomes available.",
    riskWhenIgnored: "A smoothly moving indicator can mask an unresponsive application. Keyboard input and event handlers can still wait behind the same long task.",
    implementationNotes: [
      "Use a transition when the start and destination are known.",
      "Record the animation and check whether the browser actually composites it.",
      "Break up or remove long main-thread tasks so input can be handled promptly.",
    ],
    reviewPrompts: [
      "Which updates require JavaScript on every frame?",
      "Does the indicator actually keep moving on the target device?",
      "Can the user activate the destination during the work?",
    ],
  },
  "motion-22": {
    whyItMatters: "A timer scheduled every 80ms can send only about twelve or thirteen position updates a second, even when the display can present more. The Web Animations API accepts the start and end transforms together and returns a controller. It can keep playback aligned with the animation timeline without per-frame script writes.",
    riskWhenIgnored: "When a component unmounts or a later action supersedes the first, an old completion callback can restore the wrong end state. Choosing an animation API alone does not resolve ownership.",
    implementationNotes: [
      "Store the Animation handle while the operation is active.",
      "Handle cancellation separately from successful completion.",
      "Profile the chosen properties and use per-frame scripting only when the state really depends on live input.",
    ],
    reviewPrompts: [
      "Can playback reverse or pause without creating another competing animation?",
      "What state remains after cancellation?",
      "Is a coarse timer visibly stepping through an otherwise continuous movement?",
    ],
  },
  "motion-23": {
    whyItMatters: "Unregistered custom properties normally inherit. A variable genuinely shared by many items can be useful. When only one card needs a per-frame offset, setting it on the list can enlarge the scope of invalidation. The browser, subtree and actual consumers determine the cost.",
    riskWhenIgnored: "A tiny benchmark can exaggerate the effect in either direction. Forced computed-style reads include synchronization overhead, and rounded timing values can make ratios unstable.",
    implementationNotes: [
      "Identify which elements actually consume the drag offset.",
      "Compare a local transform, a local variable, or a registered non-inheriting property when appropriate.",
      "Profile the real subtree on representative hardware and measure input as well as style work.",
    ],
    reviewPrompts: [
      "Which descendants need to change with the card?",
      "Does the trace show style work outside those consumers?",
      "Does the difference remain on representative content and hardware?",
    ],
  },
  "motion-24": {
    whyItMatters: "Three rows with a 220ms entrance and 60ms between starts finish in 340ms. At 220ms between starts, the last finishes at 660ms. Extending either pattern to a long list changes when later items can be seen, even if the first row feels responsive.",
    riskWhenIgnored: "A search result can already accept clicks while its opacity is zero. Keyboard focus can also advance to a row that has not become visible.",
    implementationNotes: [
      "Compute the last finish as item duration plus the interval times the number of gaps.",
      "Limit the animated group or start remaining items together.",
      "Ensure a focused or actionable item is visible immediately.",
    ],
    reviewPrompts: [
      "How long does the last useful item take to appear?",
      "What happens when the list has thirty items?",
      "Can someone tab to or click an invisible result?",
    ],
  },
  "motion-25": {
    whyItMatters: "Slower playback separates changes that overlap in real time. A discontinuity in opacity can be easy to locate by scrubbing, even when it appears only as a flash during ordinary use. A slowed recording cannot tell you how responsive the shipped interaction feels.",
    riskWhenIgnored: "Fixing every visible difference between two property curves can remove an intentional offset. Designing only at quarter speed can also disguise an entrance that is too long.",
    implementationNotes: [
      "Compare the endpoints before changing the curves.",
      "Scrub through the frame where a flash or jump appears.",
      "Replay at the intended speed and interrupt the interaction with a second input.",
    ],
    reviewPrompts: [
      "Which property creates the unexpected frame?",
      "Is an offset deliberate and useful at normal speed?",
      "Does a real input interrupt the sequence cleanly?",
    ],
  },
  "motion-26": {
    whyItMatters: "A heading, supporting detail and action can arrive in stages to introduce a new workflow. An experienced user reopening the same confirmation dialog already knows its structure and may want the action immediately. Reading order and labels carry the hierarchy even with animation turned off.",
    riskWhenIgnored: "An action that receives focus while it is still transparent can leave a keyboard user unable to see where they are. A late title can also arrive after the user starts reading its body.",
    implementationNotes: [
      "Choose the specific relationship the sequence should communicate.",
      "Keep the title and initially focused control visible on open.",
      "Compare the staged version with a single entrance during repeated use.",
    ],
    reviewPrompts: [
      "What information does the order reveal?",
      "Can the user see and use the initial focus target immediately?",
      "Does the hierarchy remain clear with every group displayed together?",
    ],
  },
  "motion-27": {
    whyItMatters: "On a routine dismissal, attention often belongs to the content behind or beside the departing item. Here a 12px lift and fade remove a control in 150ms. A drawer returning to its screen edge or a card moving into an archive can use more travel to show where it went.",
    riskWhenIgnored: "Exaggerated motion can compete with the next task. Removing an item too abruptly can also make an important change in position difficult to follow.",
    implementationNotes: [
      "Identify what the user should look at after dismissal.",
      "Remove the outgoing item from interaction when appropriate.",
      "Keep nearby content stable or show clearly how it moves into the vacated space.",
    ],
    reviewPrompts: [
      "Where does the next action take place?",
      "Does the departure explain a destination when one exists?",
      "Can the leaving element still block input after it disappears?",
    ],
  },
  "motion-28": {
    whyItMatters: "Two glyphs in one stable slot can communicate a state change without shifting the label or the pointer target. A transition can show that one replaces the other, but the durable evidence is the resulting state. Someone who looks back after the animation finishes should still know what happened.",
    riskWhenIgnored: "An icon can animate beautifully and still leave an assistive-technology user unaware of completion. A long blur can also obscure the one cue a sighted user needs.",
    implementationNotes: [
      "Keep both glyphs inside one fixed-size slot.",
      "Give the resulting control or status an appropriate accessible name, state or announcement.",
      "Test rapid reversals, the smallest rendered size and an immediate reduced-motion swap.",
    ],
    reviewPrompts: [
      "Can someone identify the final state after looking away?",
      "Does the control retain its name and focus during the swap?",
      "Does the glyph remain understandable without movement?",
    ],
  },
  "motion-29": {
    whyItMatters: "On refresh, a persistent control has no preceding on-screen position to transition from. Delaying its opacity hides something the application already knows how to render. Content that genuinely arrives later can use an entrance to show what changed.",
    riskWhenIgnored: "On a frequently revisited screen, entrance effects can briefly hide the controls needed to resume work or make a restored focus target difficult to locate.",
    implementationNotes: [
      "Render the initial state visibly in the first usable page.",
      "With Motion for React, AnimatePresence initial={false} skips initial animations on children present at first render.",
      "Test refresh, restored state and a later insertion separately.",
    ],
    reviewPrompts: [
      "Which content is known before the first render?",
      "Can the user locate the initial focus target immediately?",
      "Does the later insertion still communicate a meaningful change?",
    ],
  },

  // ── Accessibility & inclusivity ──────────────────────────────────
  "a11y-1": {
    whyItMatters: "A person tabbing across a billing dialog needs to tell whether the next activation will choose Cancel or Delete. The browser’s native indication can do that. Replacing it makes the product responsible for preserving that information in its custom colors and high-contrast modes.",
    riskWhenIgnored: "A ring with sufficient contrast on white can disappear against a nearby fill or be clipped by an overflow container. A box shadow alone may also disappear in forced-colors mode.",
    implementationNotes: [
      "Keep the native outline or supply an equally discernible indicator.",
      "Check author-styled focus against the relevant adjacent colors and test forced colors.",
      "Tab past sticky headers and footers in both directions. WCAG 2.4.11 at AA also addresses focused components entirely hidden by author-created content.",
      "Use :focus-visible where appropriate and respect the browser’s input heuristics, including text controls focused by pointer.",
    ],
    reviewPrompts: [
      "Can someone locate focus throughout the keyboard path?",
      "Is the indicator distinguishable wherever it is drawn?",
      "Does it remain visible under zoom, clipping and forced colors?",
    ],
  },
  "a11y-2": {
    whyItMatters: "Changing a border from gray to red marks a difference in hue, but it tells someone little about how to correct a card number. A specific message conveys both the affected field and the reason for the rejection. An icon can make that message easier to find.",
    riskWhenIgnored: "Two equally dark status dots can be indistinguishable in monochrome. Even someone who distinguishes both colors may still have to remember which one means pending.",
    implementationNotes: [
      "Use text, shape, pattern or another suitable cue for the meaning carried by color.",
      "Identify form errors in text and associate the explanation with the control.",
      "Inspect without color and check labels with assistive technology.",
    ],
    reviewPrompts: [
      "Can someone tell the two states apart without their hues?",
      "Does the message explain what needs correcting?",
      "Does the nonvisual presentation carry the same meaning?",
    ],
  },
  "a11y-3": {
    whyItMatters: "The preview places a tap three pixels past Cancel. With an eight-pixel gap it lands on neither button. With adjacent buttons it lands on Delete. Both targets are already 44px high, so the example illustrates error tolerance beyond simply meeting a size criterion.",
    riskWhenIgnored: "A toolbar can show ample space between visible glyphs while their invisible hit boxes overlap. Conversely, adjacent large segments can be usable without an eight-pixel gap.",
    implementationNotes: [
      "Measure hit areas as well as glyphs.",
      "For targets below 24 × 24 CSS px, apply the WCAG 2.5.8 spacing test or its other exceptions.",
      "Separate high-cost competing actions and try the arrangement on the intended touchscreen.",
    ],
    reviewPrompts: [
      "Where does a near miss land?",
      "Do expanded hit areas overlap?",
      "Is the protection appropriate to the cost of choosing the wrong action?",
    ],
  },
};
