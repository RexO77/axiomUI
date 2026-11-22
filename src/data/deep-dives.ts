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
    whyItMatters: "A small amount of extra space gives the uppercase Account label more separation between strokes. A face with generous sidebearings can already have enough room.",
    riskWhenIgnored: "A tracking value copied from a larger heading can push a small label onto a second line. A fixed-width, single-line label can clip when someone increases text spacing.",
    implementationNotes: [
      "Compare the font’s default spacing with USWDS’s 0.025em token for short caps at the actual weight and size.",
      "Check the longest localized label at the narrowest supported width.",
      "Apply the WCAG 1.4.12 text-spacing overrides and check that the label can expand without clipping.",
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
      "Try short and wide measures in the scripts you ship. WCAG 1.4.8 (AAA) calls for a way to get at least 1.5 line spacing in blocks of text.",
      "Apply the WCAG 1.4.12 text-spacing overrides to catch clipping in fixed-height text containers.",
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
    whyItMatters: "The email is secondary to the name, yet it can be the detail that distinguishes two people. At 14px, the address in the member row is easier to read than the same address at 10px.",
    riskWhenIgnored: "If two people share a display name, a hard-to-read address can lead someone to invite the wrong person.",
    implementationNotes: [
      "Start with a readable text size for any detail someone needs to make a choice.",
      "Hold weight and ink steady when comparing sizes in the shipped font.",
      "Try two people with the same display name and different addresses.",
    ],
    reviewPrompts: [
      "Can a reader distinguish the people by their addresses?",
      "Can you read the address at the normal zoom level?",
      "Can a longer address still be read when text is enlarged?",
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
  "typo-15": {
    whyItMatters: "In the two-line headline, tighter tracking compresses the gap between the o and g in together. The same em value moves the letters farther in pixels as the heading gets larger, so check the spacing again when the size changes.",
    riskWhenIgnored: "Neighboring strokes can nearly join in a large headline, making pairs of letters harder to distinguish during a quick read.",
    implementationNotes: [
      "Search heading styles for letter-spacing, letterSpacing, and tracking- classes. Inspect the computed spacing on the rendered headline after the webfont loads.",
      "Keep the font, weight, size, and line breaks fixed while trying small tracking adjustments.",
      "Check the narrowest gaps between neighboring glyphs in the actual headline and its translations at each display size.",
    ],
    reviewPrompts: [
      "Open the hero at its largest breakpoint, wait for the webfont, and toggle the tracking declaration in DevTools. Is there still a visible gap between the closest strokes with the declaration on?",
      "Which letter pair comes closest at the smaller heading size?",
      "Do the closest pairs in translated headlines still have visible space between them?",
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
    whyItMatters: "A 95ch canvas can accommodate a wide table and a narrower reading column. The sample caps the column at 52ch to fit about 65 characters per full line. The exact count depends on the font and the words.",
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
      "A gap implies a group. Keep gaps equal between equivalent siblings, then check that a multiline label still reads with its own field.",
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
    whyItMatters: "Both panes keep the first two gaps at 8px and 16px. A 32px section break makes the next heading read as a new group. When the break repeats the 16px gap, the heading looks like the next item in the same group.",
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
    whyItMatters: "The Export menu has z-index 9999 in both panes. Inside the transformed panel, that number only orders it within the panel, so Activity can cover it. Moving the menu outside the panel lets it stack directly against Activity.",
    riskWhenIgnored: "Activity can cover part of the Export menu and take pointer input where a menu item should be clickable.",
    implementationNotes: [
      "List which overlays may appear together and which must take input.",
      "Inspect ancestor stacking contexts before changing a layer value.",
      "Use a suitable portal or a native top-layer primitive when the overlay must escape its context.",
    ],
    reviewPrompts: [
      "Which context owns each competing element?",
      "Does the visual order match focus and pointer behavior?",
      "Can you select every Export item with the menu open over Activity?",
    ],
  },
  "layout-12": {
    whyItMatters: "The Account settings header stays in place when you Tab to Work email. A 64px inset leaves the field and its focus ring visible below the header. An in-page link to a heading needs the same clearance.",
    riskWhenIgnored: "The Work email field can receive keystrokes while the header hides it. An anchor link can appear to land in the wrong section when its heading is covered.",
    implementationNotes: [
      "Search for sticky and fixed headers, then identify the scroll container they overlap. In DevTools, compare the focused element’s bounds with the header’s bottom edge.",
      "Set scroll-padding-block-start on that container using the header’s rendered height. Include any space needed for the focus outline and account for a sticky footer at the block end.",
      "Check the inset when the header wraps, switches at a breakpoint, or sits inside a nested scroller.",
    ],
    reviewPrompts: [
      "Scroll until the header sticks, open an in-page link to a heading, then Tab forward and Shift+Tab back through the nearby fields. Do the heading and each focus ring clear the header?",
      "At 200% zoom, does the inset still match the header’s height?",
      "Inside a scrollable panel, are targets clear of both the sticky header and footer?",
    ],
  },
  "layout-13": {
    whyItMatters: "Both panes show the cabin photo while it’s still loading and its dimensions are known. Reserving that space on the first render keeps View details in place. The dashed button records where it was before the unreserved image took up space.",
    riskWhenIgnored: "The button can move away from the pointer just as someone goes to open the details. On a longer page, another control can take its place.",
    implementationNotes: [
      "Search for img, video, and iframe elements. With cache disabled and the network throttled, check whether each element’s box has a height before its response arrives.",
      "Set image width and height to the intrinsic dimensions, or reserve the displayed aspect ratio on a wrapper when an embed or crop has its own shape. Match the placeholder to the final size at each breakpoint.",
      "For shifts caused by swapping fonts, match fallback metrics with size-adjust and font metric overrides.",
    ],
    reviewPrompts: [
      "Disable cache, throttle the network, and reload. Keep the pointer over View details while the image starts loading and finishes rendering. Does the button stay under the pointer?",
      "Does the placeholder match the final crop at both narrow and wide widths?",
      "Does the same space remain reserved when the media request fails?",
    ],
  },
  "layout-14": {
    whyItMatters: "The wide cabin photo shows the brass latch on the right. The narrow center crop cuts it out. Shifting the crop toward the right keeps the latch visible in both frames.",
    riskWhenIgnored: "A narrow detail card can show only cabin siding when the image is meant to help someone identify the latch.",
    implementationNotes: [
      "Search for object-cover, object-fit: cover, and background-size: cover. Open each use at its narrowest frame and inspect which part of the source gets cut off.",
      "Set object-position for the subject in that asset. Check replacement images and artwork mirrored for other locales.",
      "Use a dedicated crop with picture and source when one focal point can’t keep the whole subject visible across ratios.",
    ],
    reviewPrompts: [
      "Load the same image in the 2:1 and 3:4 frames. Is the full brass latch visible in both?",
      "Resize between the supported widths. Does any intermediate crop cut through the subject?",
      "If the subject needs its surroundings for context, is there enough room for both at the narrowest ratio?",
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
  "color-6": {
    whyItMatters: "The blank area where a teammate’s address goes needs to look editable before anyone reaches it. On white, a pale gray input edge can look stronger than a divider and still miss 3:1. The divider beside it can stay quiet, because the content on either side already reads as separate. The action labeled Cancel may be identifiable from its content and context without a visible border.",
    riskWhenIgnored: "Reusing a decorative divider token for a field can leave the reader with a label and an apparently blank page. Making only its focused outline visible helps keyboard navigation after focus arrives and leaves the resting field hard to find.",
    implementationNotes: [
      "Identify which visual feature makes the resting input recognizable.",
      "Measure that feature against its adjacent surface, including themed variants.",
      "Hide each line in turn. If the rows still read as separate, the line is decorative and can use a quiet divider token. If a field or a graphic disappears with it, the line is essential and needs 3:1.",
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
      "A shadow tinted with the surface’s own hue, such as indigo under an indigo promotion, is optional art direction for a one-off branded surface. Keep reusable cards, menus and dialogs on the neutral elevation token, where a colored glow can read as focus or a special state.",
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
  "comp-14": {
    whyItMatters: "Someone reconciling accounts often wants three invoices open side by side. When “View invoice” is an `<a href>`, right-click offers Open link in new tab, hovering shows acme.app/invoices/1042 in the status bar, and Cmd-click or middle-click opens it without any extra code. The same control built as a div that calls `router.push` looks identical, but the browser never learns it leads anywhere, so right-click shows the page menu and hovering shows no address.",
    riskWhenIgnored: "Cmd-click on the div does nothing, so the reader has to open each invoice, press Back and find their place again. Screen-reader users who list the page’s links never find it, Copy link address is missing when someone wants to send the invoice to a colleague, and crawlers do not follow it.",
    implementationNotes: [
      "Render navigation as a native `<a>` with a real `href`. Router link components such as Next.js `<Link>` render one and still navigate on the client. Style it as a button if the design calls for one; the element stays a link.",
      "To find violations, search for click handlers that navigate: `grep -rnE \"onClick=.*(router\\.(push|replace)|navigate\\(|location\\.(href|assign))\" src`. Any match on an element other than `<a href>` is a candidate. In the DOM, check that every control whose click changes the URL matches `a[href]`, and flag `<a>` without `href` or `[role=link]` on a div.",
      "Keep `<button>` for work on the current page: submitting, opening a menu or dialog, toggling, deleting. An action that ends by navigating, such as Save and view, stays a button and navigates only after it succeeds.",
    ],
    reviewPrompts: [
      "Right-click the control. Does the menu offer Open link in new tab and Copy link address?",
      "Hover the control, then Cmd-click or middle-click it. Does the status bar show the destination, and does a new tab open while this page stays where it was?",
      "Does anything styled as a button change the URL, or anything styled as a link only change the current page?",
    ],
  },
  "comp-15": {
    whyItMatters: "“Find the deploy that broke checkout” is a claim a visitor can check. A crop of the deploy list with #418 flagged beside a 38% rise in checkout errors lets them see the product keep the promise before reading a word of copy. Eye-tracking studies by Nielsen Norman Group found that people study images that carry information, such as real products and real people, and skip generic decorative imagery.",
    riskWhenIgnored: "Floating avatars, a green check and soft blobs would sit just as well under a competitor’s headline, so the most prominent element on the page tells the visitor nothing. They have to take the claim on trust or scroll to find out what the product looks like, and a skeptical evaluator often leaves first.",
    implementationNotes: [
      "Choose the frame from the headline: the screen and state where the promised result is visible. Use real or realistic data, then crop and enlarge until the evidence is readable at the size the image ships.",
      "Keep the proof legible without hover or animation. Mark the result with the product’s own highlight, and write alt text that states what the image shows, such as “Deploy 418 flagged as the cause of a 38% rise in checkout errors”.",
      "To find violations, open each hero and feature section and list what the image depicts. Flag images whose files or components are named like `blob`, `gradient`, `avatars`, `illustration` or `abstract`, and heroes where no element of the product’s interface or output appears. Alt text that is empty or generic, such as “dashboard” or “team”, is a second signal.",
    ],
    reviewPrompts: [
      "Cover the headline. What does the image alone show the product doing?",
      "Swap a competitor’s name into the headline. Does the image still fit? If so, it proves nothing.",
      "Point to the exact spot in the image that delivers the headline’s promise. Can someone else find it at the size the image ships?",
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
    whyItMatters: "An incomplete email such as “maya@” is expected halfway through typing. Pressing Continue tells the form the person is ready for it to check the address.",
    riskWhenIgnored: "A premature error can interrupt someone who types slowly or moves between fields before finishing an answer.",
    implementationNotes: [
      "Validate on submission, including on the server.",
      "Let people move between fields before submission without triggering new format errors.",
      "Associate each error with its field and clear it when the correction is accepted. Announce the message once when it appears.",
    ],
    reviewPrompts: [
      "Can someone type maya@ and Tab away before submitting without seeing an error?",
      "Does pressing Continue with that same value show the format error?",
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
  "form-14": {
    whyItMatters: "A phone can put @ on the first keyboard layer for Work email and offer an address the person has already saved. Declaring the field’s purpose gives the browser the information it needs to offer both.",
    riskWhenIgnored: "A generic field can capitalize the first letter, hide @ behind a keyboard switch, and leave people to type the entire address.",
    implementationNotes: [
      "Inspect generated inputs for type, inputmode, and autocomplete. Start with all fields labeled Email, Username, Card number, or Code, including fields rendered by shared components.",
      "Use type=email and autocomplete=email for an email field. Turn off spellcheck and autocapitalize for emails, usernames, and codes. Use the autocomplete token that matches the field’s purpose, such as username or one-time-code.",
      "Use type=text with inputmode=numeric for digit strings such as card numbers and numeric codes. Keep them as strings so leading zeros survive. Reserve type=number for quantities that can be incremented.",
    ],
    reviewPrompts: [
      "On a phone with a saved autofill address, tap Work email, check for @ and the saved address, then type maya@. Does the name stay lowercase?",
      "Does the sign-in field declare the purpose the browser’s credential manager expects?",
      "If you enter 012345 in a numeric code field, does the first zero reach the form submission?",
    ],
  },
  "form-15": {
    whyItMatters: "When Work email comes back with a format error, leaving maya@ in place lets the person see what was missing and finish the address. Preserving Full name and Company lets them submit again after that one correction.",
    riskWhenIgnored: "A reset erases the address the error refers to and makes the person re-enter answers that already passed validation.",
    implementationNotes: [
      "Search for <form action=, formAction=, and reset() in submit handlers. In React 19, an action that completes without throwing resets uncontrolled inputs by default, even when it returns a validation error.",
      "Keep fields controlled in local state, or return the submitted values alongside field errors from the action. With useActionState, pass those returned values to the inputs as their new defaultValue.",
      "Keep the inline error attached to Work email and let the person edit that answer in place before submitting again.",
    ],
    reviewPrompts: [
      "Enter Maya Chen, maya@, and Acme Design in a form whose validation runs after submission. Press Continue and wait for the Work email error. Are all three values still in their fields?",
      "Can you finish the address and submit again by editing only Work email?",
      "Does a failed response after a second attempt preserve the most recently submitted values?",
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
    whyItMatters: "The invoice card asks for the text role, which resolves to #f5f5f5 on the dark theme and measures 13.9:1 on its #262626 surface. The same card with the light theme’s #0f172a written into it keeps that ink after the switch and measures 1.2:1, so the invoice number all but vanishes. Roles also keep features apart: a Save button and an overdue warning can share a blue today and still change separately in the next theme.",
    riskWhenIgnored: "A literal hex looks right on the theme it was picked on and fails on the next one, usually discovered by a user in dark mode. Reusing a button-specific token for a warning couples the two, so a brand update to the button changes the warning’s meaning and contrast as well.",
    implementationNotes: [
      "Define roles for text, muted text, surfaces, borders and states, and give each a value per theme. Components ask for the role. Use aliases where the system needs that indirection rather than three layers for every value.",
      "To find literal colors in components, search outside the token files: `grep -rnE \"#[0-9a-fA-F]{3,8}\\b|rgb\\(|hsl\\(|text-\\[#|bg-\\[#\" src/components`. Each match either becomes a role or is a deliberate fixed color, such as a brand logo, with a comment saying so.",
      "Render each screen in every supported theme and measure the resolved text and surface pairs. Check that a deliberately high-contrast palette and forced colors still show every boundary.",
    ],
    reviewPrompts: [
      "Switch the theme. Does any text or icon keep its light-theme color?",
      "Which role does this component request, and can the warning change without the action changing with it?",
      "Do the resolved pairs clear 4.5:1 for text in every theme?",
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
    whyItMatters: "A 1280px window zoomed to 400% lays out like a 320 CSS px phone, so the people who enlarge text get the narrowest layout there is. In the example, one row keeps Street and Postcode side by side with a 512px minimum. The page then scrolls sideways and Continue sits past the right edge.",
    riskWhenIgnored: "Someone reading at 400% scrolls left and right on every line and may never see the action. Hiding the overflow with `overflow-x: hidden` on the page removes the scrollbar but not the problem, so Continue becomes unreachable instead of hard to find.",
    implementationNotes: [
      "Find it: at 320 CSS px run `document.documentElement.scrollWidth > window.innerWidth` in the console, then inspect the widest element. In code, search for `min-width` above 320px, fixed widths on rows, `whitespace-nowrap` on long labels, and `overflow-x: hidden` on html or body. A viewport tag with `user-scalable=no` or `maximum-scale=1` blocks the zoom this test simulates, so remove it.",
      "Let content choose breakpoints: resize until something breaks, then prefer intrinsic fixes (wrapping, `minmax()` grids, container queries) before adding a device-sized query.",
      "Two-dimensional content is excepted. Give a data table, map or diagram its own scroll region with a visible scrollbar, a label and keyboard access (`tabindex=\"0\"`), and keep the rest of the page in one column.",
    ],
    reviewPrompts: [
      "At 320 CSS px, does `document.documentElement.scrollWidth` equal the viewport width?",
      "Zoom a 1280px window to 400% and complete the main task. Did any step need sideways scrolling?",
      "Which element sets the overflowing width, and does it need that width?",
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
  "sys-15": {
    whyItMatters: "A collections clerk filters invoices to Overdue, sorts by due date, scrolls to row 37 and opens Northwind’s invoice. Pressing Back should put them on that same row with the filter and sort still applied, so they can open row 38 next. Baymard found that sites which reset the list to the top force people to scroll and re-scan for the item they just viewed, and that users read this as the site being broken.",
    riskWhenIgnored: "Back lands on All invoices, sorted by newest, at row 1. The clerk has to reapply the filter, re-sort and scroll for every invoice they check, and on a long list they lose track of which ones they have already handled. A refresh or a shared link drops the view the same way.",
    implementationNotes: [
      "Keep shareable view state, such as the query, filters, sort and page, in the URL (for example `?status=overdue&sort=due`), and render the list from it. Update it with `history.replaceState` or the router’s replace so changing a filter does not stack a Back step per click.",
      "Keep scroll position and expanded rows out of the URL. Let the browser restore scroll (`history.scrollRestoration` stays `auto`), or save the position with the history entry and restore it once the rows have rendered. Keep the list data cached so Back does not refetch and render an empty list first.",
      "To find violations, search for filter, sort and search state held only in component state, such as `useState` for a filter with no matching `useSearchParams` or `URLSearchParams`, and for `history.scrollRestoration = \"manual\"` or a `window.scrollTo(0, 0)` that runs on every route change.",
    ],
    reviewPrompts: [
      "Filter the list, sort it, scroll down, open row 37 and press Back. Is row 37 in view with the same filter and sort?",
      "Copy the URL while the list is filtered and paste it into a new tab. Does the same view load?",
      "Change the filter three times, open an item and press Back twice. Does the first Back return to the list and the second leave it?",
    ],
  },
  "sys-16": {
    whyItMatters: "Six seconds after an upload fails, the toast reporting it is the only place that offers Retry. If it is still on screen, the person can retry when they notice. If a five-second timer has already removed it, the failure and the way to fix it are both gone. A success message such as Saved can time out safely, because the saved result is visible elsewhere.",
    riskWhenIgnored: "Someone who looked away, is reading with a screen magnifier or takes longer to reach the toast with a keyboard finds an empty corner and no sign the file was not uploaded. WCAG 2.2.1 (Timing Adjustable) asks that people can turn off, adjust or extend time limits, and a timed toast holding the only Retry is such a limit.",
    implementationNotes: [
      "Give each message a dismissal policy by type. Success confirmations whose result is visible elsewhere may close after a few seconds. Errors and any message holding the only Undo or Retry stay until the person acts on it or closes it, as Carbon’s inline and actionable notifications do.",
      "Pause any timer while the message is hovered or holds focus, and while the tab is hidden (`document.visibilityState === \"hidden\"`). Restart it, not resume a nearly expired one, when the person leaves. Announce the message through a live region, and make its actions reachable from the keyboard.",
      "To find violations, search for toast calls with a duration on an error or an action: `grep -rnE \"toast\\.(error|warning)|duration:|setTimeout\\(.*(dismiss|close)\" src`. Flag any error toast with a finite duration and any toast whose Undo or Retry has no other route, such as a Trash folder or a retry control on the item.",
    ],
    reviewPrompts: [
      "Trigger the failure, then wait ten seconds without touching anything. Are the error and Retry still on screen?",
      "Trigger it again, rest the pointer on the toast, then tab to it. Does it stay put while hovered or focused?",
      "Trigger it, switch to another tab for a minute and come back. Is the message still there?",
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
    whyItMatters: "Opening a palette and typing a query is one keyboard sequence. Both palettes share the same entrance, and the field focused on open receives the first keystrokes. Waiting for the panel to settle can send those characters to the previous control.",
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
      "Check the first few frames at the actual travel distance. An ease-in can make the start of a short entrance look still, even after the user has acted.",
      "Reuse a token for components with the same motion and purpose.",
    ],
    reviewPrompts: [
      "How far has the panel moved when the user starts reading?",
      "Does the largest instance appear to jump?",
      "Does a simpler curve communicate the same transition?",
    ],
  },
  "motion-6": {
    whyItMatters: "A menu opened beside its trigger has little ground to cover. Stretching the same motion from 180ms to 500ms leaves its labels moving for longer. A large change of view may need more time to show the relationship between the starting and ending positions.",
    riskWhenIgnored: "A fixed duration applied across a product can make a small menu linger and a full-width panel rush across the screen.",
    implementationNotes: [
      "Group motion tokens by role and travel distance.",
      "Test the smallest and largest instances of the component.",
      "Measure when content becomes usable and when it comes to rest. Slow playback to find a flash or jump, then replay at normal speed to judge the timing.",
    ],
    reviewPrompts: [
      "Can a user select an item while the menu opens?",
      "Is the destination easy to follow on a wide screen?",
      "Does the transition still help after several uses?",
    ],
  },
  "motion-7": {
    whyItMatters: "A toast introduces information on entry, but by dismissal the next task may already be underway. The example gives entry 220ms and exit 160ms. A drawer returning to its edge or a card moving into an archive may need more time and travel to show where it went.",
    riskWhenIgnored: "An exit can block the next click if its invisible layer still intercepts input. An exit that is too brief can hide where the object went.",
    implementationNotes: [
      "Leave enough time to read a message. For routine dismissals, use a short fade or small movement so the next action gets the attention.",
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
      "Use transform for independent travel and real layout when reflow is part of the result. Record layout, paint and dropped frames on a representative device.",
      "During a real drag, profile style invalidation as well as input latency. Check which descendants consume the changing value, and compare a write on the dragged element with an inherited custom property on the whole list.",
      "Compare traces with and without will-change. If it helps, hint only the measured element and remove the hint when the interaction settles. Check whether a hint such as will-change: transform creates a stacking context before the animation and changes how overlays paint.",
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
      "Use @media (prefers-reduced-motion: reduce) in CSS and matchMedia(\"(prefers-reduced-motion: reduce)\") for scripted animations.",
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
    whyItMatters: "When a custom draggable card reaches a meaningful limit, moving it less for each additional pixel of pull can make the boundary tangible. A thumb beyond a slider’s maximum can imply a value the control cannot store, so keep numerical sliders in their valid range.",
    riskWhenIgnored: "Unbounded overdrag can resemble valid progress. A spring that settles far from the value the application commits makes the control feel inaccurate.",
    implementationNotes: [
      "Define the visual limit from a meaningful boundary such as a drawer’s last snap point.",
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
      "Record the active pointerId and call setPointerCapture(pointerId) on the drag element when the drag starts.",
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
      "Use a transition when the start and destination are known. For scripted pause, reverse or cancellation, element.animate() returns an Animation controller. Keep that handle and handle cancellation separately from completion.",
      "Record the animation and check whether the browser actually composites it.",
      "Break up or remove long main-thread tasks so input can be handled promptly.",
    ],
    reviewPrompts: [
      "Which updates require JavaScript on every frame?",
      "Does the indicator actually keep moving on the target device?",
      "Can the user activate the destination during the work?",
    ],
  },
  "motion-24": {
    whyItMatters: "Three rows with a 220ms entrance and 60ms between starts finish in 340ms. At 220ms between starts, the last finishes at 660ms. Extending either pattern to a long list changes when later items can be seen, even if the first row feels responsive.",
    riskWhenIgnored: "A search result can already accept clicks while its opacity is zero. Keyboard focus can also advance to a row that has not become visible.",
    implementationNotes: [
      "Sequence items only when their order explains a relationship or change. Show a familiar dialog together when people need its title and action immediately.",
      "Budget for the last useful item. For an even stagger, add the item duration to the interval times the number of gaps. Cap the animated group or start the remaining items together.",
      "Ensure a focused or actionable item is visible immediately.",
    ],
    reviewPrompts: [
      "How long does the last useful item take to appear?",
      "What happens when the list has thirty items?",
      "Can someone tab to or click an invisible result?",
    ],
  },
  "motion-28": {
    whyItMatters: "Two glyphs in one stable slot can communicate a state change without shifting the label or pointer target. In the matched crossfades, the sharp check is recognizable sooner than the blurred one. The final state still needs to make sense to someone who looks back after the transition.",
    riskWhenIgnored: "An icon can animate beautifully and still leave an assistive-technology user unaware of completion. A long blur can also obscure the one cue a sighted user needs.",
    implementationNotes: [
      "Keep both glyphs inside one fixed-size slot. Swap instantly if the state is already clear, or use a short crossfade that keeps the incoming glyph legible at its actual size.",
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
  "a11y-4": {
    whyItMatters: "Moving Book room up one place takes a single tap when the row has a Move up button. Keeping that path alongside the drag handle lets someone change the order without holding a pointer down while moving it.",
    riskWhenIgnored: "Someone who can tap a task but can’t hold it steady while dragging may release it into the wrong position or leave the list unchanged.",
    implementationNotes: [
      "Search for draggable, onDragEnd and pointer handlers that change positions. For each outcome, trace a click or tap path to the same update.",
      "Use Move up and Move down for a list, a destination menu for a board, or step buttons or a value field for a slider. A sequence of individual clicks or taps can reach the same outcome as one drag.",
      "WCAG 2.5.7 excepts essential drags, such as drawing a freehand path, and unmodified browser behavior. Check keyboard access separately under sys-8.",
    ],
    reviewPrompts: [
      "On a touch screen, tap Move up once on Book room in position 2. Does it reach position 1 without holding or dragging?",
      "Can taps reach every destination or value the drag can reach?",
      "Do both input paths produce the same saved order or value?",
    ],
  },
  "a11y-5": {
    whyItMatters: "In Settings, Invoices belongs inside Billing. A screen reader’s heading list exposes that relationship when Settings is level 1, Billing is level 2 and Invoices is level 3.",
    riskWhenIgnored: "When Billing and Invoices are both level 4 for their smaller type, the list skips levels 2 and 3 and presents the two as peers. Someone jumping to a level 2 section won’t find Billing.",
    implementationNotes: [
      "Inspect the rendered h1–h6 elements and any role=heading with aria-level in DOM order. Compare each level with the section the heading introduces.",
      "Use native heading elements and give design system components separate heading-level and text-style props.",
      "Go down one level when opening a subsection. After finishing it, return to the level of the next section, even if that closes several nested sections.",
    ],
    reviewPrompts: [
      "Open Settings, then open the screen reader’s heading list. Does it read Settings at level 1, Billing at level 2 and Invoices at level 3?",
      "If the designer shrinks Billing, does it stay a level 2 heading?",
      "Do sections at the same depth use the same heading level?",
    ],
  },
  "a11y-6": {
    whyItMatters: "The testimonial strip replaces the quote while someone is reading the shared-calendar instructions just below it. Pause holds the current quote so the person can finish either passage at their own pace.",
    riskWhenIgnored: "A reader can lose the end of a testimonial before finishing the sentence, and each replacement can draw attention away from the instructions.",
    implementationNotes: [
      "Search for autoplay, setInterval and polling callbacks in carousels, tickers and live feeds. Follow each start path and check which user control can stop the visible change.",
      "Put a visible, keyboard-operable Pause control with the strip and show whether rotation is paused. Keep it paused until the reader resumes it.",
      "WCAG 2.2.2 applies the five-second threshold to automatic movement, blinking or scrolling alongside other content. Automatic updates alongside other content have their own clause at any interval, including the option to control update frequency. Both clauses except essential activity.",
    ],
    reviewPrompts: [
      "Load the strip, wait for a quote to change, then use Tab and Space to pause it. After two four-second intervals, is the same quote still visible?",
      "Does the strip stay paused when focus leaves the control?",
      "Can someone tell that the strip is paused before resuming it?",
    ],
  },
  "a11y-7": {
    whyItMatters: "The sharing guide is linked inside a sentence about file access. The underline marks where the link begins and ends, even when its blue looks like the surrounding ink.",
    riskWhenIgnored: "A reader who can’t distinguish the two hues can read the sentence and miss the route to the sharing guide.",
    implementationNotes: [
      "Inspect prose links with a DOM query for p a[href] and check their computed text-decoration-line. Check for a reset such as no-underline or text-decoration: none in the default and visited states.",
      "Keep underlines on prose links at rest. Navigation menus can omit them when placement already makes their links recognizable.",
      "If you use the G183 alternative, give the link at least 3:1 contrast against the surrounding text and add a non-color cue on both hover and keyboard focus. Check contrast against the background separately.",
    ],
    reviewPrompts: [
      "Turn on grayscale, move the pointer off the paragraph and read the sentence. Can you find the sharing guide link before interacting with it?",
      "Does a visited inline link retain an underline or a sufficient visual cue at rest?",
      "If a prose link uses G183, does the contrast pass at rest, and does the cue appear on both hover and focus?",
    ],
  },
  "a11y-8": {
    whyItMatters: "After closing the edit dialog for Quarterly report, someone using a keyboard is still working in that project row. Returning focus to Edit keeps their place so they can continue through the project list.",
    riskWhenIgnored: "If focus falls back to the page body, the next Tab can land on New project at the top and make the user search for the row again.",
    implementationNotes: [
      "Use the overlay primitive’s focus restoration if it provides it. For custom overlays, remember the opener and restore focus after the background is available again.",
      "Inspect document.activeElement after Escape, cancel and save. A body result or a jump to the first page control on the next Tab can reveal dropped focus.",
      "If saving or deleting removes the opener, focus an action in the next row once the list updates. If no row remains, use a stable control such as New project.",
    ],
    reviewPrompts: [
      "Tab to Edit for Quarterly report, press Enter, then Esc. Is the focus outline back on Edit before you press Tab again?",
      "Do Cancel and Save also put focus where the task should continue?",
      "Delete the row from the dialog. Does focus land on the next logical control after the row disappears?",
    ],
  },
};
