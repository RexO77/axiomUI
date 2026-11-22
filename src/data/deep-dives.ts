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
    whyItMatters: "“Invite your team” and “Skip for now” follow the same casing rule. Product names keep their own capitals, as in “Sign in with GitHub”.",
    riskWhenIgnored: "A lowercase transform turns GitHub into github. It can also change acronyms and override a translator’s capitalization.",
    implementationNotes: [
      "Write the final casing in the localized string.",
      "List product names and abbreviations with their official capitalization.",
      "Check the casing of a dialog’s title and buttons together.",
    ],
    reviewPrompts: [
      "Does the label follow the convention for this language?",
      "Does a named service retain its own spelling?",
      "Does a casing helper or CSS text-transform change the translated text?",
    ],
  },
  "typo-2": {
    whyItMatters: "A little extra spacing separates the letters in ACCOUNT. Some fonts already leave enough room between capitals at their default spacing.",
    riskWhenIgnored: "A tracking value copied from a larger heading can push a small label onto a second line. A fixed-width, single-line label can clip when someone increases text spacing.",
    implementationNotes: [
      "At the label’s actual size and weight, compare the default spacing with the U.S. Web Design System’s 0.025em for short uppercase labels.",
      "Check the longest localized label at the narrowest supported width.",
      "Apply the WCAG 1.4.12 text-spacing overrides and check that the label can expand without clipping.",
    ],
    reviewPrompts: [
      "Can you tell neighboring capitals apart at this size?",
      "Does the label fit when the reader increases spacing?",
      "Does the label’s script use capitals that need extra spacing?",
    ],
  },
  "typo-3": {
    whyItMatters: "Read the whole paragraph at 16px. Compare how easily you find the next line with a 24px line height and an 18px line height.",
    riskWhenIgnored: "With tight line spacing, descenders can touch accents on the line below. Increasing the spacing can push text outside a fixed-height box. If the box hides overflow, it clips the text.",
    implementationNotes: [
      "Set a unitless line-height so it follows changes in text size.",
      "Try narrow and wide paragraphs in each script you support. WCAG 1.4.8 (AAA) calls for a way to get at least 1.5 line spacing in blocks of text.",
      "Apply the WCAG 1.4.12 text-spacing overrides to catch clipping in fixed-height text containers.",
    ],
    reviewPrompts: [
      "Can you find the next line in a full paragraph without losing your place?",
      "Do accents and descenders clear adjacent lines?",
      "When spacing increases, is all text still present and usable?",
    ],
  },
  "typo-4": {
    whyItMatters: "In the 22px heading, a 24px line height keeps the two lines close. At 33px they look farther apart. A font with taller accents may need that extra room.",
    riskWhenIgnored: "A one-line mockup can hide collisions until a translated heading wraps. Too much line spacing can make its second line look like part of the paragraph below.",
    implementationNotes: [
      "Give headings their own line-height token when they need tighter spacing than paragraphs.",
      "Try a long title with capitals, accents, and descenders.",
      "Compare the space within the heading with the space between it and the body.",
    ],
    reviewPrompts: [
      "Do both lines still read as one title?",
      "Do accented capitals and descending marks clear adjacent lines?",
      "When you enlarge the heading, do all its lines stay visible and clear of the paragraph below?",
    ],
  },
  "typo-5": {
    whyItMatters: "The card’s heading is already larger and heavier than its description. Switching from Arial to Verdana adds little. A monospace font for code would signal a different kind of content.",
    riskWhenIgnored: "Two body fonts can wrap the same text differently on neighboring screens. If a font lacks characters for a language, another font can appear mid-word.",
    implementationNotes: [
      "Name the role a new family will serve before adding it.",
      "Check the heading and body together at their final sizes and widths.",
      "Inspect fallback coverage in the languages your product supports.",
    ],
    reviewPrompts: [
      "What job does the second font family do?",
      "Could the existing family express the same distinction?",
      "Which face actually renders the localized copy?",
    ],
  },
  "typo-6": {
    whyItMatters: "When two members share a name, check the email address. The same address is easier to read at 14px than at 10px.",
    riskWhenIgnored: "If two people share a display name, a hard-to-read address can lead someone to invite the wrong person.",
    implementationNotes: [
      "Start with a readable text size for any detail someone needs to make a choice.",
      "Keep the font, weight, and text color the same when comparing sizes.",
      "Try two people with the same display name and different addresses.",
    ],
    reviewPrompts: [
      "Can a reader distinguish the people by their addresses?",
      "Can you read the address at the normal zoom level?",
      "Can a longer address still be read when text is enlarged?",
    ],
  },
  "typo-7": {
    whyItMatters: "Both examples right-align prices to two decimal places. With proportional digits, the 1 and 8 take different widths, so .10 and .08 can start at different points. Tabular digits line up the decimal points.",
    riskWhenIgnored: "Even right-aligned amounts can have uneven decimal points if some are whole numbers, others have two decimals, or currency symbols follow the amount. Adding zeros to measurements can imply more precision than you have.",
    implementationNotes: [
      "Format comparable currency values consistently for the locale.",
      "Give amounts a common alignment edge and verify the font provides tabular figures.",
      "When measurements use different numbers of decimal places, align them on the decimal point.",
    ],
    reviewPrompts: [
      "Do the decimal marks line up in representative amounts?",
      "Do negative values and localized currency symbols still fit?",
      "Would adding a zero change what the number implies?",
    ],
  },
  "typo-8": {
    whyItMatters: "The changelog heading stays centered in both examples. In the left-aligned paragraph, each line starts at the guide. In the centered paragraph, the starting point changes with the line length.",
    riskWhenIgnored: "A two-word message can grow to four lines in translation. If it’s centered, the reader has to find the start of each line again.",
    implementationNotes: [
      "Set the paragraph’s direction with dir when needed. Use text-align: start to align it to that edge.",
      "Review centered content with longer translations.",
      "Before centering a passage, read it in a narrow column and with enlarged text.",
    ],
    reviewPrompts: [
      "Can the reader return to a consistent starting edge?",
      "Does right-to-left text follow its own reading direction?",
      "Is the centered text still easy to read in its longest translation?",
    ],
  },
  "typo-9": {
    whyItMatters: "With four weights in the digest card, “12 recipients” is bolder than “Weekly digest”. Giving the count regular weight lets the title and action stand out.",
    riskWhenIgnored: "A bold recipient count can look like a heading, while “Edit schedule” can look like body text. If the font lacks a requested weight, two roles may look alike.",
    implementationNotes: [
      "Map weights to roles such as heading, body, and emphasis.",
      "Compare those roles together using the loaded font at actual size.",
      "If two weights look alike, distinguish the roles with size or spacing.",
    ],
    reviewPrompts: [
      "Which text should the reader encounter first?",
      "Does incidental metadata compete with the heading?",
      "Do adjacent weights remain distinct in the loaded font?",
    ],
  },
  "typo-10": {
    whyItMatters: "An ellipsis keeps the file size visible, but it can hide the version or extension that tells two files apart.",
    riskWhenIgnored: "A row of identically shortened filenames can make choosing a file guesswork. A hover-only title leaves people on touchscreens without a way to resolve the ambiguity.",
    implementationNotes: [
      "Try wrapping first for instructions and error messages.",
      "Apply min-w-0 and truncate to the filename in its flex row.",
      "Provide access to the full name through a details view or another keyboard- and touch-operable action.",
    ],
    reviewPrompts: [
      "Can two files with the same prefix still be distinguished?",
      "Can keyboard and touch users reveal the complete value?",
      "At narrow widths, can you still see the file size?",
    ],
  },
  "typo-11": {
    whyItMatters: "The time and location help you recognize the sign-in. Check that the 12px details are legible alongside the 16px message. Fonts with taller lowercase letters can look larger at the same size.",
    riskWhenIgnored: "The 11px alert has 9px text for the time and place, the details that help identify the sign-in. A fixed-height row can clip those details when someone enlarges the text.",
    implementationNotes: [
      "Set the body text size in a relative unit such as rem.",
      "Try the smallest supporting text using the actual content on a representative device.",
      "Check enlargement to 200% and allow the row to grow.",
    ],
    reviewPrompts: [
      "Can you read the time and location well enough to recognize the sign-in?",
      "At 200% enlargement, are all details and actions available?",
      "Could moving or wrapping a detail recover space?",
    ],
  },
  "typo-12": {
    whyItMatters: "In the 19ch heading, ordinary wrapping can leave “project” alone. Balanced wrapping gives the two lines more even lengths. Check that a break still keeps names and phrases together.",
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
    whyItMatters: "At 23ch, ordinary wrapping can leave “work.” alone on the last line. With text-wrap: pretty, “your work.” can stay together. The exact break depends on the browser.",
    riskWhenIgnored: "A translation, font change, or different browser can add a line. If the card has a fixed height, the last line may be clipped.",
    implementationNotes: [
      "Let the card grow with its text.",
      "Compare pretty with ordinary wrapping at the card widths the grid produces.",
      "Check the last line in each browser you support.",
    ],
    reviewPrompts: [
      "Does the closing phrase read naturally?",
      "Can the description gain a line without clipping anything in the card?",
      "Does ordinary wrapping still give a usable result?",
    ],
  },

  "typo-14": {
    whyItMatters: "In the English list, the dash and 5 can appear before the Hebrew name. Isolating just the name keeps the 5 with “reviews”. The same issue can arise with an English name in a Hebrew list.",
    riskWhenIgnored: "A misplaced dash or count can make the number look like part of the restaurant’s name. Changing the row’s alignment leaves that order unchanged.",
    implementationNotes: [
      "Set the document’s base direction for the interface language. The language attribute alone does not set direction.",
      "Wrap just the name in `<bdi>` if its direction is unknown. If it already has its own wrapper, use `dir=\"auto\"` on that element. Leave the dash and count outside.",
      "Keep the sentence in translation resources so the translator can position the name and count. Keep the name in its original character order.",
    ],
    reviewPrompts: [
      "In an English row with a Hebrew name, does the count read as part of the review phrase?",
      "Does a Latin name keep its own order in a Hebrew row?",
      "Have readers of each language checked the punctuation at the displayed size?",
    ],
  },
  "typo-15": {
    whyItMatters: "Compare the o and g in “together”. At 38px, -0.015em removes 0.57px between letters and -0.05em removes 1.9px. Check the gap again at larger sizes.",
    riskWhenIgnored: "Neighboring strokes can nearly join in a large headline, making pairs of letters harder to distinguish during a quick read.",
    implementationNotes: [
      "Search heading styles for letter-spacing, letterSpacing, and tracking- classes. Inspect the computed spacing on the rendered headline after the webfont loads.",
      "Keep the font, weight, size, and line breaks fixed while trying small tracking adjustments.",
      "Check the narrowest gaps between neighboring glyphs in the actual headline and its translations at each display size.",
    ],
    reviewPrompts: [
      "Once the font loads, check the heading at its largest size. With letter spacing applied, can you still see a gap between the closest strokes?",
      "Which letter pair comes closest at the smaller heading size?",
      "Do the closest pairs in translated headlines still have visible space between them?",
    ],
  },

  // ── Layout & spacing ─────────────────────────────────────────────
  "layout-1": {
    whyItMatters: "One settings card uses 16px padding and 8px gaps. The other uses 13px padding and 5px gaps. Reusing the same gap between related items keeps new settings rows consistent.",
    riskWhenIgnored: "Slightly different gaps are harder to change together. Rounding a 1px border up to 4px makes it heavy, and forcing text into a fixed height can clip it.",
    implementationNotes: [
      "Choose tokens for common spaces within a group and between groups.",
      "Reuse one token wherever the same relationship recurs.",
      "Keep optical adjustments local and explain what required them.",
    ],
    reviewPrompts: [
      "Do comparable components use the same spacing step?",
      "Does each larger gap represent a different relationship?",
      "Would the nearest grid step look better than this off-grid value?",
    ],
  },
  "layout-2": {
    whyItMatters: "The sample page is 95ch wide. Its 52ch text column fits about 60 to 65 characters per full line in SF Pro or Inter, depending on the words.",
    riskWhenIgnored: "When a paragraph spans a wide dashboard, readers can lose their place between lines. A fixed minimum width can force them to scroll sideways when they zoom in.",
    implementationNotes: [
      "Set a maximum inline size on the article text while allowing the column to shrink.",
      "Count characters on a few full lines of real copy.",
      "Review translated text and the largest supported text size.",
    ],
    reviewPrompts: [
      "On a wide screen, do full lines of English text stay near 65 characters?",
      "Can the column shrink to fit a narrow viewport?",
      "Do tables and figures have the width their content needs?",
    ],
  },
  "layout-3": {
    whyItMatters: "Each label sits 8px above its input, with 24px between fields. That spacing shows which input the label describes. Connect each label to its input in the markup. Use a fieldset and legend to name a group of related choices.",
    riskWhenIgnored: "When the same 16px separates every row, a label between two fields can appear to describe either one. Adding an error or wrapping the label can make the ambiguity worse.",
    implementationNotes: [
      "Give labels and their fields a shared group container.",
      "Keep hints and errors within the group for the affected field.",
      "Use the same gap between field groups. Check that a label still looks paired with its input when it wraps.",
    ],
    reviewPrompts: [
      "Which control does each visible label describe?",
      "Does the accessible name match the visible label?",
      "When an error appears, is the next group still distinct?",
    ],
  },
  "layout-4": {
    whyItMatters: "The right-facing play triangle carries more weight on the left. Even with its SVG box centered, the triangle can look off-center. Here, a 2px shift to the right balances it.",
    riskWhenIgnored: "Applying the same offset to every icon can make a symmetric pause symbol jump sideways when playback starts. A mirrored arrow can even need a correction in the opposite direction.",
    implementationNotes: [
      "Compare the glyph with a centered guide at the actual button size.",
      "Check the paired state, such as play and pause.",
      "Move the icon within the button so the hit area stays put.",
    ],
    reviewPrompts: [
      "Does the artwork appear centered with the guide removed?",
      "Does the control stay visually stable as its icon changes?",
      "Is the offset specific to this glyph and size?",
    ],
  },
  "layout-5": {
    whyItMatters: "Both buttons have 8px above and below “Get started”. Increasing the side padding from 8px to 16px gives the label room without making the button taller. Icon-only, toolbar and full-width buttons need their own sizing.",
    riskWhenIgnored: "A long translated label can overflow even with the same padding ratio. A compact button can meet that ratio and still be too small to tap.",
    implementationNotes: [
      "Use a button-size token that accounts for the line height.",
      "Test the shortest and longest supported labels, including an optional icon.",
      "Measure the clickable area. If it falls below 24 × 24 CSS pixels, check the spacing test or another exception in WCAG 2.5.8.",
    ],
    reviewPrompts: [
      "Does the label have enough space beside it?",
      "Can the button wrap or grow when text enlarges?",
      "How large is the clickable area?",
    ],
  },
  "layout-6": {
    whyItMatters: "The bell belongs beside “Backup complete”, even when the description wraps. In this row, aligning the bell to the top and moving it down 1px lines it up with the title.",
    riskWhenIgnored: "Center the bell on the whole text block and it drops beside the description. With top alignment, check the space inside the SVG too. It affects where the bell appears.",
    implementationNotes: [
      "Find the line the icon belongs to, usually the title.",
      "Anchor the icon to that first line, then inspect the artwork and font at their real sizes.",
      "Test the row with a long description and larger text.",
    ],
    reviewPrompts: [
      "Does the bell still sit beside the title after a wrap?",
      "Does the artwork look aligned inside its SVG box?",
      "Would the bell look centered beside a single line of text?",
    ],
  },
  "layout-7": {
    whyItMatters: "Four borders give the panel, the “This week” heading and the two stats equal weight. A contrasting background separates each stat, and the heading groups them. Borders can help when each item has its own action.",
    riskWhenIgnored: "Removing all outlines can hide the bounds of separate interactive items. Adding a frame to every label makes it harder to see which pieces share a single action.",
    implementationNotes: [
      "Identify whether a group is an independent item, a section, or a control.",
      "Try a heading and a change in spacing before adding an inner frame.",
      "Keep the border if it shows which item an action belongs to.",
    ],
    reviewPrompts: [
      "Which items does this border group together?",
      "Can you tell that both stats belong to “This week”?",
      "Can a reader tell which action belongs to each item?",
    ],
  },
  "layout-9": {
    whyItMatters: "On the 72px card, 24px of padding on each side takes up 48px. Reducing it to 12px per side gives the content 24px more room. The wider card keeps its 24px padding.",
    riskWhenIgnored: "Holding on to a wide gutter can push an action onto a second line. Scaling every gap down indiscriminately can crowd touch targets or erase a group boundary.",
    implementationNotes: [
      "Compare the content area at the narrowest and widest widths.",
      "Let outer padding shrink with the card. Keep the gap between a label and its control consistent.",
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
    riskWhenIgnored: "A section break close in size to an ordinary row gap can make two groups run together. Even on a 4px grid, a section break needs more space than a row gap.",
    implementationNotes: [
      "Give the smallest gap to closely related details.",
      "Pick a visibly larger step for new groups and sections.",
      "Inspect the rhythm after headings wrap and content grows.",
    ],
    reviewPrompts: [
      "Where does one item end and the next section begin?",
      "Do repeated sections have consistent spacing?",
      "Does each section start with a larger gap than the items inside it?",
    ],
  },
  "layout-11": {
    whyItMatters: "The Export menu has z-index 9999 in both examples. Inside the transformed panel, it sits behind Activity because the whole panel does. Outside the panel, the same 9999 places the menu above Activity.",
    riskWhenIgnored: "Activity covers the right side of the Export menu. In a working menu, clicks in that area would miss the menu items.",
    implementationNotes: [
      "List which overlays may appear together and which must take input.",
      "Inspect ancestor stacking contexts before changing a layer value.",
      "To move a menu outside its panel’s stacking context, render it in a portal outside the panel or open it as a native popover.",
    ],
    reviewPrompts: [
      "Which stacking context contains Export, and which contains Activity?",
      "Does the visual order match focus and pointer behavior?",
      "Can you select every Export item with the menu open over Activity?",
    ],
  },
  "layout-12": {
    whyItMatters: "With a 64px scroll inset, the focused “Work email” field and its outline sit below the 64px “Account settings” header. An in-page link to a heading needs the same clearance.",
    riskWhenIgnored: "The Work email field can receive keystrokes while the header hides it. An anchor link can appear to land in the wrong section when its heading is covered.",
    implementationNotes: [
      "Search for sticky and fixed headers, then identify the scroll container they overlap. In DevTools, compare the focused element’s bounds with the header’s bottom edge.",
      "Set scroll-padding-block-start to the header’s rendered height, plus room for an outside focus outline. For a sticky footer, set scroll-padding-block-end too.",
      "Check the inset when the header wraps, switches at a breakpoint, or sits inside a nested scroller.",
    ],
    reviewPrompts: [
      "Scroll until the header sticks, open an in-page link to a heading, then Tab forward and Shift+Tab back through the nearby fields. Do the heading and each focus ring clear the header?",
      "At 200% zoom, does the inset still match the header’s height?",
      "Inside a scrollable panel, are targets clear of both the sticky header and footer?",
    ],
  },
  "layout-13": {
    whyItMatters: "The dashed “View details” outline marks the button’s starting position. The solid button shows where it lands once the image takes up space. Reserve the 2:1 image area and the two positions coincide.",
    riskWhenIgnored: "The button can move away from the pointer just as someone goes to open the details. On a longer page, another control can take its place.",
    implementationNotes: [
      "Search for img, video, and iframe elements. With cache disabled and the network throttled, check whether each element’s box has a height before its response arrives.",
      "Set image width and height to the intrinsic dimensions, or reserve the displayed aspect ratio on a wrapper when an embed or crop has its own shape. Match the placeholder to the final size at each breakpoint.",
      "Keep the space reserved if the media request fails so nearby controls stay in place.",
    ],
    reviewPrompts: [
      "On a page with a loading image, disable the cache, throttle the network and reload. Place the pointer over the button below the image. Does it stay under the pointer as the image loads?",
      "Does the placeholder match the final crop at both narrow and wide widths?",
      "Does the same space remain reserved when the media request fails?",
    ],
  },
  "layout-14": {
    whyItMatters: "The wide cabin image shows the brass latch on the right. A centered crop cuts it out of the narrow frame. Right alignment keeps it visible in both frames.",
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
    whyItMatters: "New report is the only blue button against the neutral header and sidebar. When both are blue too, the button is harder to spot. A branded header can still work if size or placement draws attention to the main action.",
    riskWhenIgnored: "Shrinking a warning to fit the 60-30-10 split can make it easier to miss.",
    implementationNotes: [
      "Name the action or information people should notice first.",
      "Compare the action with nearby elements using the same accent.",
      "Check status, navigation, and content on a representative screen before changing the palette.",
    ],
    reviewPrompts: [
      "Which item should a reader find first?",
      "Where else does its accent appear nearby?",
      "Can you still find the main action in grayscale?",
    ],
  },
  "color-4": {
    whyItMatters: "The heart identifies Like. The trash icon and Delete label identify the destructive action. A blue heart leaves Delete as the only red action in the row.",
    riskWhenIgnored: "When two status indicators differ only in color, people who cannot distinguish the hues may mistake one status for the other. Give each a label or distinct shape.",
    implementationNotes: [
      "List each status and the label or symbol that identifies it.",
      "Check rows where destructive actions sit beside everyday ones.",
      "Review the task with color removed.",
    ],
    reviewPrompts: [
      "How does a reader identify the dangerous action?",
      "Does one color mean two things in this row?",
      "Which cue remains if the two hues look identical?",
    ],
  },
  "color-6": {
    whyItMatters: "The email field needs to look editable even before it has focus. If its border is the only cue, check for 3:1 against the background. Spacing already separates the sections, so their divider can be fainter. The Cancel label and its position beside Send invite help identify the button.",
    riskWhenIgnored: "With a faint border, the email address can look like ordinary text. A focus ring helps only after someone reaches the field.",
    implementationNotes: [
      "Before the field has focus, what identifies it as editable? Check its border, fill or underline.",
      "Measure its contrast against the surrounding surface in each theme.",
      "Hide each line in turn. If the groups are still clear, the divider can be faint. If people need the line to recognize a control or understand a graphic, check for at least 3:1 against the adjacent color.",
      "Test focus and selected states separately from the resting control.",
    ],
    reviewPrompts: [
      "Without the border, can a reader still find the field?",
      "Does the feature that identifies the field reach 3:1 against its background?",
      "Are focused and selected controls identifiable by their own cues?",
    ],
  },
  "color-7": {
    whyItMatters: "The blue button darkens when the pointer moves over it. If green signals success elsewhere, turning the button green on hover can make it look as though the action already happened.",
    riskWhenIgnored: "If hover alone makes a button look selected or complete, a person can misread the state before acting. A touch user may never see a hover cue at all.",
    implementationNotes: [
      "Define resting, hover, pressed, focus, and completed states separately.",
      "Inspect the label and icon contrast through each state.",
      "Check that people can find and use the button with a touchscreen or keyboard.",
    ],
    reviewPrompts: [
      "What does the color change communicate here?",
      "Can you tell when the action has succeeded and when the pointer is just hovering?",
      "Can the control be found before hover occurs?",
    ],
  },
  "color-8": {
    whyItMatters: "The lighter storage card stands out against the dark page. A muted blue keeps the usage bar visible on its track. Inverting the whole page also turns the file thumbnail into a negative.",
    riskWhenIgnored: "A newly themed panel may look convincing on its own while merging into the page behind it. An inverted thumbnail can misrepresent the file a person is choosing.",
    implementationNotes: [
      "Compare page, card, and overlay colors as a stack.",
      "Check the contrast of text, icons and chart marks against their backgrounds.",
      "Inspect photos and illustrative or monochrome assets separately.",
    ],
    reviewPrompts: [
      "Are the surface boundaries clear at each level?",
      "Can you see the usage bar against the dark track?",
      "Does the thumbnail preserve the colors of the original file?",
    ],
  },
  "color-9": {
    whyItMatters: "On white, #737373 measures about 4.74:1 and passes for the 10px helper text. The lighter #aaaaaa measures about 2.32:1 and fails. The labels round for display. A measured 4.49:1 still falls below 4.5:1.",
    riskWhenIgnored: "Contrast depends on both colors. Gray text that passes on white can fail on a tinted field or where a photo is close to the same gray.",
    implementationNotes: [
      "Measure the final foreground and background colors, accounting for transparency.",
      "The 3:1 threshold starts at 18pt (24px) for regular text or 14pt (about 18.7px) for bold text. Use the equivalent sizes for CJK fonts.",
      "Check helper text, placeholders and labels on enabled controls. Exceptions include text on disabled controls, purely decorative text and text in logos.",
    ],
    reviewPrompts: [
      "Which text and background colors did you measure, and what was their contrast ratio?",
      "If you used the large-text threshold, do the font size and weight qualify?",
      "Where the text blends most into the background, does the contrast still pass?",
    ],
  },
  "color-10": {
    whyItMatters: "Hover and selection use the same blue at different opacities. Each fill blends with the surface behind it, so the same tint looks different on light and dark. After a brand color change, check that the labels and selected row still stand out.",
    riskWhenIgnored: "A fixed light blue such as #e8f0fe stays light on a dark sidebar. A translucent fill can go too far the other way and leave the selected row hard to see.",
    implementationNotes: [
      "Name hover and selected backgrounds separately.",
      "Use the brand color as the base if both fills should change with it.",
      "Check each fill against every background where it appears. Keep the selected row recognizable after the pointer leaves, for example with heavier text.",
    ],
    reviewPrompts: [
      "Does the selected row stay distinguishable from a hovered row?",
      "Can the label still be read over the composited fill?",
      "Which states should change when the brand color changes?",
    ],
  },
  "color-11": {
    whyItMatters: "The pale thumbnail blends into white, and the dark thumbnail blends into charcoal. A black outline at 10% opacity defines the pale edge. White at 10% defines the dark one. Keep this frame distinct from focus or selection.",
    riskWhenIgnored: "A dark outline can disappear against a dark photo. A heavy border around every thumbnail can hide detail at the edge or make every image look selected.",
    implementationNotes: [
      "Test actual images with pale, dark, and transparent edges.",
      "Set outline-offset to -1px to draw the 1px outline inside the thumbnail.",
      "Give keyboard focus and selection their own visible cues.",
    ],
    reviewPrompts: [
      "Is the edge difficult to locate in this crop?",
      "Does the outline draw more attention than the thumbnail?",
      "Can people distinguish the frame from focus or selection?",
    ],
  },
  "color-12": {
    whyItMatters: "Each payment card uses three shadows. A zero-blur ring with a 1px spread draws the edge, a tight shadow sits just below it, and a wider, softer shadow makes the card look raised. Flat payment rows may need only a divider.",
    riskWhenIgnored: "Forced-colors mode removes box shadows. If a shadow alone marks a field or a selected card, people can still see the content but may miss the field edge or selection.",
    implementationNotes: [
      "Decide whether the card should look raised or flat. Give selection its own cue.",
      "Use the corresponding elevation token and examine it on each theme surface.",
      "Use the neutral elevation token on shared cards, menus and dialogs. Save tinted shadows for one-off promotions where the glow won’t be mistaken for focus or selection.",
      "Where the edge matters, add a transparent outline. It remains visible in forced-colors mode when box shadows disappear.",
    ],
    reviewPrompts: [
      "What relationship does elevation communicate here?",
      "Does the boundary remain visible when shadows are suppressed?",
      "Can you tell a selected card from one that is only raised?",
    ],
  },

  // ── Components & actions ─────────────────────────────────────────
  "comp-1": {
    whyItMatters: "Publish, Preview and Discard sit together. Filling only Publish makes the next step easy to find. A separate task on the same screen can have its own primary button.",
    riskWhenIgnored: "Three filled buttons give Discard as much weight as Publish. In a consent prompt, equal weight is deliberate. Accept and Decline should be equally easy to find.",
    implementationNotes: [
      "Group controls by the task they affect.",
      "Use one prominent button within a group that has a clear next step.",
      "Check that secondary actions remain legible, reachable and honestly labeled.",
    ],
    reviewPrompts: [
      "What is someone trying to finish here?",
      "Can readers find Discard when they want to abandon their edits?",
      "Is there a reason to recommend one of these choices?",
    ],
  },
  "comp-2": {
    whyItMatters: "“Delete project” could remove a shortcut, move a project to Trash or erase it for the whole team. Before someone confirms, say which project they’ll lose, who’s affected and whether they can restore it.",
    riskWhenIgnored: "Someone who only meant to clean up their own sidebar could erase files their team still uses. A generic “Are you sure?” gives them little reason to reconsider.",
    implementationNotes: [
      "Distinguish leaving a project from deleting it for everyone.",
      "Name the affected project and whether recovery is possible in the confirmation.",
      "Include a Cancel button. For permanent deletion, give it initial focus so an accidental Enter cancels.",
    ],
    reviewPrompts: [
      "Whose data changes?",
      "Could the confirmation be mistaken for a harmless removal?",
      "Can someone back out using only the keyboard?",
    ],
  },
  "comp-3": {
    whyItMatters: "The gap stays even around a circular corner when both curves share a center. Here, 7px of padding and a 1px border make an 8px inset. Subtract that from the 12px outer radius to get 4px.",
    riskWhenIgnored: "Giving both the card and the field a 4px radius makes the corner gap wider than the 8px gap along the sides.",
    implementationNotes: [
      "Measure from painted edge to painted edge, including any intervening border.",
      "Subtract the inset from the outer radius. Use zero if the result is negative.",
      "Check the curves separately when the insets differ or the corners are elliptical.",
    ],
    reviewPrompts: [
      "Which two edges should track each other?",
      "Did you include the border in the inset?",
      "Does the corner still read as an even inset at the smallest component size?",
    ],
  },
  "comp-4": {
    whyItMatters: "A profile picture and a file thumbnail can both be photos. Consistent shapes let readers tell them apart even before they recognize the image.",
    riskWhenIgnored: "When both tiles are rounded squares, readers have to inspect the contents or read the names to tell a person from a file.",
    implementationNotes: [
      "Give people and files distinct shapes wherever readers need to tell them apart.",
      "Show the person’s name or another meaningful identifier alongside the picture when identity matters.",
      "If a profile photo is missing, keep the initials in the same circle.",
    ],
    reviewPrompts: [
      "Can a reader distinguish a person from a file without recognizing the photo?",
      "How does a team avatar differ from an individual in this system?",
      "Does a missing image preserve the same identity cue?",
    ],
  },
  "comp-5": {
    whyItMatters: "A side panel can be modal or nonmodal. Both can leave the record visible. Only a nonmodal panel lets someone use the record while editing.",
    riskWhenIgnored: "The small dialog shows just one of six profile fields and dims the record behind it. A side panel can also get in the way if it covers a value someone needs.",
    implementationNotes: [
      "Identify which background information the task requires.",
      "Use a nonmodal side panel when people need to work in the form and the record beside it.",
      "Test a long field, the onscreen keyboard and the smallest supported viewport before committing to the panel.",
    ],
    reviewPrompts: [
      "Can the user see the information needed to finish?",
      "Can they interact with the underlying page when the task calls for it?",
      "Would a full page give this task enough room?",
    ],
  },
  "comp-6": {
    whyItMatters: "A summary can link to each field with an error. Under Email, “Add the domain after @” tells someone how to fix maya@.",
    riskWhenIgnored: "When an error notice fades, the rejected value stays and its explanation disappears. A network outage shown as a field error sends people looking for a fix they can’t make.",
    implementationNotes: [
      "Preserve the value and put the specific correction by the field.",
      "Associate the message with the control, for example with aria-describedby.",
      "If the service fails, keep a message visible at the form level.",
    ],
    reviewPrompts: [
      "Can someone find the field from the summary?",
      "Does the message explain a correction the user can actually make?",
      "Can someone returning to the field still read the error?",
    ],
  },
  "comp-7": {
    whyItMatters: "The box with a lid could mean storage or Archive. The label “Archive” tells newcomers what it does, while returning users can scan for the icon.",
    riskWhenIgnored: "Someone tapping the toolbar can miss a label shown only on hover. A screen reader can announce an icon’s name, but a sighted newcomer still needs a visible clue.",
    implementationNotes: [
      "Put a short verb beside any icon whose action is unclear.",
      "Name icon-only controls and hide purely decorative icons from assistive technology.",
      "Before removing a label, check that new and returning users can find the action without it.",
    ],
    reviewPrompts: [
      "What else could this icon mean here?",
      "Can someone identify the action without hover?",
      "Does the accessible name match the visible action?",
    ],
  },
  "comp-8": {
    whyItMatters: "Export CSV might be disabled because the plan excludes it, nothing is selected or an export is running. Keyboard users skip native disabled buttons when tabbing, so a tooltip on the button can go unseen.",
    riskWhenIgnored: "Without an explanation, people may look for a missing selection. “Available on the Pro plan” tells them why Export CSV is disabled.",
    implementationNotes: [
      "Keep the reason visible beside the disabled control.",
      "When a form can explain errors on submission, consider keeping Submit available so people can find out what needs fixing.",
      "If you use `aria-disabled` to keep a control focusable, block activation in its handler. Check mouse, keyboard and touch.",
    ],
    reviewPrompts: [
      "Is the cause apparent before trying the control?",
      "Does the explanation say what can change the state?",
      "Can keyboard and touch users find it?",
    ],
  },
  "comp-9": {
    whyItMatters: "A spinner tells someone their order is being submitted. If the connection drops and they retry, the server still needs to recognize the original order.",
    riskWhenIgnored: "A connection can drop after a payment succeeds but before the receipt reaches the browser. Disabling the original button cannot make a later retry safe.",
    implementationNotes: [
      "Keep the button the same size and announce the pending state to screen readers, for example “Submitting…”.",
      "Block repeat submissions while a request is pending. Have the server recognize retries so the same order or payment goes through only once.",
      "Announce success only after confirmation. If the request fails, keep the entered values and explain how to retry.",
    ],
    reviewPrompts: [
      "Does the user know the request is still pending?",
      "Can a retry create the same order twice?",
      "Can someone recover after a timeout without re-entering the form?",
    ],
  },
  "comp-10": {
    whyItMatters: "Two icons on 20px artboards can look different in size or weight. Compare the strokes and the space around each drawing at toolbar size.",
    riskWhenIgnored: "At 24px, Delete draws more attention than the 16px Archive icon. Check the button separately to see how much of the toolbar responds to a click.",
    implementationNotes: [
      "Start icons in the same toolbar group on the same size artboard.",
      "Review thin, dense and asymmetric glyphs beside each other at their rendered size.",
      "Adjust drawings that look too heavy or light. Keep button hit areas and focus indicators consistent.",
    ],
    reviewPrompts: [
      "Which actions belong to the same group?",
      "Does one glyph dominate without a reason?",
      "Can the button remain easy to hit even when the drawing is small?",
    ],
  },
  "comp-11": {
    whyItMatters: "If the image, title and padding all suggest one link, readers expect any of them to open it. A menu, checkbox or second link needs its own target.",
    riskWhenIgnored: "If only the title is linked, clicking the card’s padding does nothing. Stretching a link over a Save button can block that button or prevent text selection. A clickable div also loses the browser’s link menu.",
    implementationNotes: [
      "Use a native link with a concise, descriptive name for navigation.",
      "Keep buttons, checkboxes and other links outside the card link so each can receive clicks and keyboard focus.",
      "Check the image, padding, text selection, context menu and keyboard focus in the rendered card.",
    ],
    reviewPrompts: [
      "Can readers click anywhere the card looks clickable?",
      "Can each secondary action be operated independently?",
      "Can readers select text that they may need to copy?",
    ],
  },
  "comp-12": {
    whyItMatters: "Closing the Keyboard shortcuts dialog loses no work, so a click outside can close it. In an editor, preserve the draft or ask what to do with unsaved changes before closing.",
    riskWhenIgnored: "A backdrop-only exit gives keyboard users no Close button to focus. In an editor, one stray click outside can discard a draft.",
    implementationNotes: [
      "Include a labeled dismissal control in the dialog’s tab sequence.",
      "Have Escape close the topmost dismissible dialog. Return focus to its opener if it’s still available, or to the next control in the task.",
      "Check for unsaved edits whether someone uses Close, Escape or a click outside.",
    ],
    reviewPrompts: [
      "Can a keyboard user discover how to leave?",
      "What happens to an unsaved edit after Escape or a backdrop click?",
      "Where does focus land after dismissal?",
    ],
  },

  "comp-13": {
    whyItMatters: "A support lead reviewing ticket volume has two questions. Which queue grew this quarter, and how many billing tickets arrived in March? A short trend sentence answers the first. A table with row and column headers lets the reader look up the second without estimating a bar’s height.",
    riskWhenIgnored: "“Bar chart of monthly support tickets, Jan–Mar” identifies the graphic but omits its finding. A table left on January through March after the chart switches to April through June can give a precise answer for the wrong period.",
    implementationNotes: [
      "Write the question the chart should answer. Name the measure, period and series in its title or caption.",
      "Summarize the meaningful change in words. Include structured values when the reader needs to look them up. A simple chart whose entire point fits in a sentence may need only that sentence.",
      "Build the plot, summary and table from the same filtered data. Give data tables real headers and make the control that reveals them keyboard accessible.",
    ],
    reviewPrompts: [
      "With the bars hidden, which queue grew over the selected period?",
      "With January through March selected, can readers find March’s Billing count and tell it represents tickets?",
      "After changing the quarter, do the plotted values, summary and table still agree?",
    ],
  },
  "comp-14": {
    whyItMatters: "To compare three invoices, a reader can open each in a new tab and keep the list in place. A native link shows its address on hover and offers a link menu. A div that calls `router.push` gets the page menu instead.",
    riskWhenIgnored: "Command-clicking a div that calls `router.push` can open the invoice in the current tab. “View invoice” is missing from a screen reader’s list of links, and the browser offers no link address to copy.",
    implementationNotes: [
      "Render navigation as a native `<a>` with a real `href`. Router link components such as Next.js `<Link>` render one and still navigate on the client. Style it as a button if the design calls for one; the element stays a link.",
      "Inspect controls meant for navigation in the rendered page. For “View invoice”, check for an `a[href]` whose address opens that invoice. A Save button can redirect after saving.",
      "Keep `<button>` for work on the current page: submitting, opening a menu or dialog, toggling, deleting. An action that ends by navigating, such as Save and view, stays a button and navigates only after it succeeds.",
    ],
    reviewPrompts: [
      "Right-click the control. Does the menu offer Open link in new tab and Copy link address?",
      "Does hovering show the invoice address? Can you open it in another tab with Command-click on macOS, Ctrl-click on Windows or Linux, or a middle click?",
      "Does “View invoice” expose a link to the invoice? Does “Save” submit the changes before leaving the page?",
    ],
  },
  "comp-15": {
    whyItMatters: "The deploy list flags #418 beside a 38% rise in checkout errors. That row shows how the product helps someone find the deploy linked to the increase. In Nielsen Norman Group’s eye-tracking studies, people examined informative images and often passed over decorative ones.",
    riskWhenIgnored: "The headline promises to identify the deploy linked to checkout errors. The floating avatars and green check show neither the deploy nor the error.",
    implementationNotes: [
      "Choose the frame from the headline: the screen and state where the promised result is visible. Use real or realistic data, then crop and enlarge until the evidence is readable at the size the image ships.",
      "Keep the proof legible without hover or animation. Mark the result with the product’s own highlight, and write alt text that states what the image shows, such as “Deploy #418 flagged beside a 38% rise in checkout errors”.",
      "For each product claim, find the detail in the image that supports it. If it appears only in the image, describe it in the alt text.",
    ],
    reviewPrompts: [
      "Cover the headline. What does the image alone show the product doing?",
      "Swap a competitor’s name into the headline. Does the image still fit? If so, it proves nothing.",
      "At the smallest display size, can readers identify the flagged deploy and read the change in checkout errors?",
    ],
  },

  // ── Forms & inputs ───────────────────────────────────────────────
  "form-1": {
    whyItMatters: "In the billing form, “Billing address” is longer than “Full name.” Putting each label directly above its control gives the controls a shared left edge even as either label wraps. On a wide, dense editor a shared label column can achieve the same alignment.",
    riskWhenIgnored: "Giving each side label only its own text width makes the input column jump from row to row. Truncating labels to fix the alignment can hide the distinction between two questions.",
    implementationNotes: [
      "Connect each visible label to its field. In HTML, match the label’s for attribute to the field’s id.",
      "Leave space for long labels and instructions to wrap.",
      "At narrow widths and with larger text, check that each label stays with its field. Repeat with a longer translation.",
    ],
    reviewPrompts: [
      "Can someone match each label to its control at a glance?",
      "Can you still read the whole label when it wraps?",
      "Does the accessible name still make sense when read on its own?",
    ],
  },
  "form-2": {
    whyItMatters: "In a filled form, “London” could be a birthplace or a delivery city. A visible label tells you which answer you’re checking.",
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
    whyItMatters: "Labeling Phone as optional tells people they can skip it. If you use an asterisk, explain it before the first field and make sure screen readers announce which fields are required.",
    riskWhenIgnored: "Someone may share a phone number just because it looks required. If a required field looks optional, they may discover the mistake only after submitting.",
    implementationNotes: [
      "Ask only for information the task needs.",
      "State the marking convention before the first field and label exceptions consistently.",
      "Set the required attribute on required fields and check that the server rejects them when empty.",
    ],
    reviewPrompts: [
      "Can someone tell which questions may be skipped?",
      "Do announced and visual requirements agree?",
      "Will the service accept a blank optional answer?",
    ],
  },
  "form-4": {
    whyItMatters: "A short ZIP field suggests a short answer. A wider street address field gives people room to reread what they typed. Choose the character limit separately from the width.",
    riskWhenIgnored: "A five-character limit rejects ZIP+4 and longer postal codes such as SW1A 1AA. Keep the field compact without cutting off valid answers.",
    implementationNotes: [
      "Choose the width from representative answers, including longer valid ones.",
      "Set length restrictions only when the data contract requires them.",
      "Accept common formatting variations and preserve leading zeros in postal codes.",
    ],
    reviewPrompts: [
      "Which regions and formats does this form support?",
      "Is a valid longer answer still readable?",
      "Does the backend accept the same formats as the field?",
    ],
  },
  "form-5": {
    whyItMatters: "A subscription has one plan, so choosing Business should clear Pro. Add-ons are independent. Selecting extra storage leaves the support option alone.",
    riskWhenIgnored: "With two plans checked, will you pay $12 for Pro, $24 for Business or $36 for both? If choosing one clears the other, use radio buttons.",
    implementationNotes: [
      "Name the group and give each option a distinct label.",
      "Give the radio buttons for each question their own shared name attribute.",
      "For an optional choice that must be clearable, provide a meaningful None option or another clear reset.",
    ],
    reviewPrompts: [
      "Can more than one answer be valid?",
      "Can a person leave an optional question unanswered after changing their mind?",
      "Does keyboard selection follow the native control pattern?",
    ],
  },
  "form-6": {
    whyItMatters: "Showing all three billing cycles lets people compare them before choosing. With four or five options, consider which differences people need to see together.",
    riskWhenIgnored: "A closed dropdown can hide a price difference. Dozens of radio buttons can make a familiar answer, such as a country, slow to find.",
    implementationNotes: [
      "Show options together when there is room for the details people need to compare, such as prices.",
      "Use a native dropdown when space is tight and people know which option they want. For long lists, consider adding search.",
      "Preserve keyboard use, focus visibility and a clear group label.",
    ],
    reviewPrompts: [
      "Can someone compare the important differences before choosing?",
      "Does a long list support finding a known answer?",
      "Can the choice be made on a phone and with a keyboard?",
    ],
  },
  "form-7": {
    whyItMatters: "Switching on Dark mode changes the theme immediately. “Email me product updates” waits for Save changes. A switch there can make a pending subscription look active.",
    riskWhenIgnored: "Someone who leaves before pressing Save changes may think they subscribed to product updates. If an instant save fails, show which setting is still active.",
    implementationNotes: [
      "Keep the switch label “Dark mode” in both states. Let the switch indicate on or off.",
      "Use a checkbox for an option that takes effect when the form is saved.",
      "If saving fails, show the stored setting and how to try again.",
    ],
    reviewPrompts: [
      "Which settings take effect immediately?",
      "Can you tell which settings wait for Save changes?",
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
    whyItMatters: "A card might show 03/27 as its expiry date. A nearby MM / YY hint lets the user match the two parts to the field. If the form can read the expiry with or without spaces, accept both.",
    riskWhenIgnored: "Someone who enters “March 2027” has to change it to “03 / 27” and submit again. Showing MM / YY beside the field would save that attempt.",
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
    whyItMatters: "In the two-column form, Company sits beside Full name, but Tab moves down to Work email. One column gives both paths the same order. Parts of one date can still share a row.",
    riskWhenIgnored: "Someone reading across a row can lose their place when Tab moves down instead. At high zoom, the next field may be outside the area they were reading.",
    implementationNotes: [
      "Arrange fields in meaningful document order before applying a grid.",
      "Group fields that belong together, such as the parts of a date. Use the order people expect in each supported locale.",
      "Test the sequence at full width, narrow width and with enlarged text.",
    ],
    reviewPrompts: [
      "Can someone predict the next question?",
      "Does Tab preserve a meaningful order after reflow?",
      "Do the grouped fields belong together in the locales supported?",
    ],
  },
  "form-11": {
    whyItMatters: "The itinerary already has the start date. Show it so the traveler can confirm or change it. Ask for the country if the only clue is the browser language.",
    riskWhenIgnored: "A traveler may overlook the wrong country in a form that looks complete. Defaulting the start date to today can book a trip for the wrong day.",
    implementationNotes: [
      "If a later step requires an earlier answer, prefill it or offer it for selection. WCAG 3.3.7 allows re-entry when it is essential, needed for security, or the earlier answer is no longer valid.",
      "Set up browser autofill, too. The browser may have a saved address even if it has no record of the date entered earlier in this booking.",
      "Ask when a wrong guess could affect the booking. Let travelers review earlier answers before confirming. WCAG 3.3.7 applies within one process. It does not require storing answers between visits.",
    ],
    reviewPrompts: [
      "Where did this answer come from?",
      "Can someone review and change it before submitting?",
      "What happens if the form’s guess is wrong?",
    ],
  },
  "form-12": {
    whyItMatters: "After Save changes, Display name still reads Maya Chen. The message beside the button confirms the save. For a booking, include the reference travelers need to make changes later.",
    riskWhenIgnored: "A success message shown when saving starts can be wrong if the request fails. Clearing the fields then also erases what the person needs to try again.",
    implementationNotes: [
      "Distinguish pending, saved and failed states.",
      "Announce the inline save message through a live region so focus can stay on the current control.",
      "After a transaction, explain what happens next and give people a confirmation they can save or find again.",
    ],
    reviewPrompts: [
      "Was success confirmed by the service?",
      "Can someone perceive the outcome without seeing the icon?",
      "Can they recover the reference or next step later?",
    ],
  },

  "form-13": {
    whyItMatters: "A person signing in can copy a code from their authenticator once. If six boxes each accept one character, pasting 012345 into the first box may leave only 0. The visual grouping can stay the same while one text field accepts the complete code.",
    riskWhenIgnored: "If pasting fills just one box, the person must type the other five digits. Even when all six arrive, converting 012345 to a number drops the leading zero.",
    implementationNotes: [
      "For a digit-only code, use a labeled text field with `inputmode=\"numeric\"` and `autocomplete=\"one-time-code\"`. Carry the value as a string through submission.",
      "If the design uses separate input boxes, distribute a full paste in order and allow keyboard correction. Verify paste with a code copied from the source users actually receive.",
      "Test every sign-in step for an existing account, including password-manager fill. For a one-time code, accepting a full paste is one way to meet WCAG 2.2 criterion 3.3.8.",
    ],
    reviewPrompts: [
      "Can you paste 012345, correct a digit and submit the code with its leading zero intact?",
      "Does signing in with a saved password work before the code step?",
      "If one sign-in method requires retyping the code, which method lets someone skip that step?",
    ],
  },
  "form-14": {
    whyItMatters: "An email field can put @ on the phone’s main keyboard. With `autocomplete=email`, the browser can also suggest a saved email address.",
    riskWhenIgnored: "A generic field can capitalize the first letter, hide @ behind a keyboard switch, and leave people to type the entire address.",
    implementationNotes: [
      "Inspect generated inputs for type, inputmode, and autocomplete. Start with all fields labeled Email, Username, Card number, or Code, including fields rendered by shared components.",
      "For email fields, set `type=email` and `autocomplete=email`. Turn off spellcheck and automatic capitalization for email addresses, usernames and codes. Use the matching autocomplete token, such as `username` or `one-time-code`.",
      "Use `type=text` with `inputmode=numeric` for card numbers and numeric codes. Keep the value as text to preserve leading zeros. Reserve `type=number` for quantities people can increase or decrease.",
    ],
    reviewPrompts: [
      "On a phone with a saved email address, tap Work email. Is @ on the main keyboard? Is the saved address offered? Type maya@. Does the m stay lowercase?",
      "Does the sign-in field declare the purpose the browser’s credential manager expects?",
      "If you enter 012345 in a numeric code field, does the first zero reach the form submission?",
    ],
  },
  "form-15": {
    whyItMatters: "When Work email comes back with a format error, leaving maya@ in place lets the person see what was missing and finish the address. Preserving Full name and Company lets them submit again after that one correction.",
    riskWhenIgnored: "A reset erases the address the error refers to and makes the person re-enter answers that already passed validation.",
    implementationNotes: [
      "Check forms that pass a function to action or formAction, and submit handlers that call reset(). In React 19, an action that returns validation errors still completes normally and resets uncontrolled fields.",
      "Keep fields controlled in local state, or return only the values needed to restore the form. With useActionState, return those values with the field errors and use them as the new defaultValue. Keep passwords out of the response.",
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
    whyItMatters: "Both previews wait 900ms. The skeleton reserves three lines at their final widths, so the text lands in place. The spinner shows activity. Neither tells you how much work remains.",
    riskWhenIgnored: "A skeleton full of rows promises results even when the search may be empty. A spinner that replaces the page during a refresh hides content someone may still be reading.",
    implementationNotes: [
      "Preserve useful loaded content during refresh.",
      "Match the skeleton to the incoming layout. Turn off its pulse when someone requests reduced motion.",
      "Announce a slow load or failure in a live region. Offer Retry when another attempt can help.",
    ],
    reviewPrompts: [
      "When the content arrives, does it fit the space the skeleton reserved?",
      "Can someone keep using content that has already loaded?",
      "What appears if the request fails or returns no records?",
    ],
  },
  "sys-2": {
    whyItMatters: "A blank project list can mean there are no projects, no search matches or a loading error. Offer New project for the first, a way to change the search for the second and Retry for the third.",
    riskWhenIgnored: "Showing “New project” after a failed request suggests there are no projects. Someone may recreate a project that already exists.",
    implementationNotes: [
      "Represent loading, failure and a successful empty response separately.",
      "Match the explanation to the cause and the action to the person’s permissions.",
      "If the queue is empty because the work is finished, “All caught up” is enough.",
    ],
    reviewPrompts: [
      "Which state produced the empty view?",
      "Can this person actually perform the suggested action?",
      "Would a message alone be sufficient?",
    ],
  },
  "sys-3": {
    whyItMatters: "A 16px icon can fit inside a 44px button. Padding inside the button gives a tap more room to land. Margin separates neighboring buttons without enlarging either target.",
    riskWhenIgnored: "A tap just outside Delete can hit Download. Give each button enough room to grow without overlapping its neighbor.",
    implementationNotes: [
      "Measure the actual interactive box in CSS pixels.",
      "For the WCAG 2.5.8 spacing exception, center a circle 24 CSS pixels across on each undersized target’s bounding box. The circle must not overlap another target or another such circle. Otherwise, check whether another exception applies.",
      "Consider 44 × 44 CSS pixels for important touch controls. WCAG 2.5.5 uses that size at AAA with its own exceptions.",
    ],
    reviewPrompts: [
      "Where does the click actually land around the glyph?",
      "Does an adjacent action overlap its target?",
      "Can someone reliably hit it on the intended input devices?",
    ],
  },
  "sys-4": {
    whyItMatters: "“2m ago” tells you how recently Maya pushed to main. Matching an invoice to a bank record needs an exact date and sometimes a time zone. One stored timestamp can supply either format.",
    riskWhenIgnored: "Relative labels become ambiguous in a screenshot or an audit trail. A raw UTC string can also hide a day boundary for someone working in another zone.",
    implementationNotes: [
      "Store events as unambiguous instants. Store calendar dates, such as birthdays, without a time or time zone.",
      "Format for the reader’s locale and specify the relevant time zone for exact records.",
      "Show the exact time alongside the relative label or behind a control people can open by touch or keyboard.",
    ],
    reviewPrompts: [
      "Is the task about recency or a specific point in time?",
      "Which time zone determines the displayed date?",
      "Can someone obtain the exact time without a mouse?",
    ],
  },
  "sys-5": {
    whyItMatters: "The invoice card asks for the text role, which resolves to #f5f5f5 on the dark theme and measures 13.9:1 on its #262626 surface. The same card with the light theme’s #0f172a written into it keeps that ink after the switch and measures 1.2:1, so the invoice number all but vanishes. Roles also keep features apart: a Save button and an overdue warning can share a blue today and still change separately in the next theme.",
    riskWhenIgnored: "A fixed text color that works on a light surface can disappear on a dark one. If a warning uses the button’s color token, restyling the button also changes the warning.",
    implementationNotes: [
      "Define roles for text, muted text, surfaces, borders and states, and give each a value per theme. Components ask for the role. Use aliases where the system needs that indirection rather than three layers for every value.",
      "To find literal colors in components, search outside the token files: `grep -rnE \"#[0-9a-fA-F]{3,8}\\b|rgb\\(|hsl\\(|text-\\[#|bg-\\[#\" src/components`. Each match either becomes a role or is a deliberate fixed color, such as a brand logo, with a comment saying so.",
      "Render each screen in every supported theme and measure the resolved text and surface pairs. Check that a deliberately high-contrast palette and forced colors still show every boundary.",
    ],
    reviewPrompts: [
      "When you switch themes, can you still read the text and recognize the icons against their backgrounds?",
      "Which role does this component request, and can the warning change without the action changing with it?",
      "Does the invoice text have at least 4.5:1 contrast against its card in every theme?",
    ],
  },
  "sys-6": {
    whyItMatters: "Undo helps someone who notices a deletion right away. Trash lets them restore the file later. Both depend on the server keeping the file and its sharing settings.",
    riskWhenIgnored: "A five-second notice as the only recovery route can expire before a keyboard or screen-reader user reaches it. Putting the row back on screen is misleading if the server has already deleted the file or its permissions.",
    implementationNotes: [
      "Decide how long Trash keeps the file and whether restoring it also restores its comments and sharing settings.",
      "Make Undo reachable by keyboard and keep the item in Trash after the message closes.",
      "Reserve a confirmation or review step for consequences that cannot be undone.",
    ],
    reviewPrompts: [
      "Can the item be restored after the notice vanishes?",
      "Do restored content and access match their prior state?",
      "Does the user know when deletion becomes permanent?",
    ],
  },
  "sys-7": {
    whyItMatters: "“Step 2 of 4” tells someone at Shipping how much checkout remains. In an application, adding a dependent might add another section. Show stage names until the total is known.",
    riskWhenIgnored: "A progress bar that moves backward after a new section appears can make completing an answer feel like losing progress. Counting every field as a step can also exaggerate the remaining effort.",
    implementationNotes: [
      "Name the stages people recognize, such as Shipping, Payment and Review.",
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
    whyItMatters: "Enter or Space activates a button. Enter follows a link. In a radio group, Tab enters the group and arrow keys move between options.",
    riskWhenIgnored: "In the preview, Tab skips Archive and Escape cannot close the dialog. In a long toolbar, a Tab stop on every button forces someone to cross the whole toolbar to leave it.",
    implementationNotes: [
      "Keep a meaningful focus order and a visible focus indicator.",
      "Follow the keyboard pattern for the widget. For tabs, menus and radio groups, support arrow keys within the group.",
      "Keep Tab inside an open modal and close it on Escape. Return focus to the control that opened it, or to the next logical control if the opener is gone.",
    ],
    reviewPrompts: [
      "Can the task be completed end to end without a pointer?",
      "Which keys does this control’s role lead users to expect?",
      "After dismissal, can the person continue from a sensible location?",
    ],
  },
  "sys-9": {
    whyItMatters: "The heart starts filling at 0ms. Synced starts appearing at 700ms. Between those events, the save can fail or the person can change their mind.",
    riskWhenIgnored: "An older reply can undo a second tap if you apply replies in arrival order. If the heart empties silently after a failed save, someone who looked away may still think they liked the post.",
    implementationNotes: [
      "Track what the person last chose and what the server last confirmed.",
      "If someone taps twice, keep the second choice even if the first reply arrives last. Apply the same rule to retries.",
      "If saving fails, show the last confirmed state, explain what failed and offer Retry when another attempt can help.",
    ],
    reviewPrompts: [
      "Is the action low-risk and reversible enough to show before the server confirms it?",
      "If someone taps twice, can a late reply undo their second tap?",
      "Can the person tell what was actually saved after failure?",
    ],
  },
  "sys-10": {
    whyItMatters: "Reserve space for a failed image so the article title stays in place. For a missing invoice total, show that the amount is unavailable so nobody reads a blank as zero.",
    riskWhenIgnored: "A placeholder where a setup diagram failed can hide the only instructions. Retrying a payment that already went through can charge someone twice.",
    implementationNotes: [
      "Set image dimensions or an aspect ratio. Give informative images alt text that conveys what the reader needs from them.",
      "Keep usable content in place and distinguish failure from loading or an empty result.",
      "Put Retry on the part that failed. If another attempt is unlikely to help, offer another route, such as a download link.",
    ],
    reviewPrompts: [
      "What information does the missing resource carry?",
      "Can the rest of the task continue safely?",
      "Is another attempt likely to help, and is it safe to repeat?",
    ],
  },
  "sys-11": {
    whyItMatters: "At 400% zoom, a viewport that started at 1280 CSS pixels has 320 CSS pixels of layout width. Keeping Street and Postcode side by side forces a 512px row and pushes Continue off screen. Stacking the fields keeps it in view.",
    riskWhenIgnored: "Someone reading at 400% scrolls left and right on every line and may never see the action. Hiding the overflow with `overflow-x: hidden` on the page removes the scrollbar but not the problem, so Continue becomes unreachable instead of hard to find.",
    implementationNotes: [
      "At 320 CSS pixels, check `document.documentElement.scrollWidth > document.documentElement.clientWidth`. Inspect fixed-width rows, `min-width` above 320px and labels that cannot wrap. Even if the widths match, check whether `overflow-x: hidden` clips a control. Remove viewport settings such as `user-scalable=no` or `maximum-scale=1` that can restrict mobile zoom.",
      "Let content choose breakpoints: resize until something breaks, then prefer intrinsic fixes (wrapping, `minmax()` grids, container queries) before adding a device-sized query.",
      "If a table, map or diagram needs two dimensions to make sense, give it a labeled scroll region people can use by keyboard. Let text wrap inside table cells and keep the rest of the page within the viewport.",
    ],
    reviewPrompts: [
      "At 320 CSS pixels, does `document.documentElement.scrollWidth` equal the viewport width?",
      "Zoom a 1280px viewport to 400% and complete the main task. Do you have to scroll the page sideways?",
      "Which element sets the overflowing width, and does it need that width?",
    ],
  },
  "sys-13": {
    whyItMatters: "The Save changes button animates its scale and background color. When the layout sets a new width, `transition: all` animates that too. Listing only `scale` and `background-color` lets the width change immediately.",
    riskWhenIgnored: "A button that stretches for 150ms makes a layout change look unfinished. Test by changing the button between two explicit widths. A font swap alone doesn’t set a new width.",
    implementationNotes: [
      "Define the intended properties, duration and easing for each state change.",
      "With the control on screen, switch themes and change the layout. Watch which properties animate.",
      "When someone requests reduced motion, remove the scale animation and keep the color cue.",
    ],
    reviewPrompts: [
      "Which properties should animate, and are those the only ones listed?",
      "Does an unrelated explicit width change stretch the control?",
      "When the button changes width, do neighboring controls move straight to their final positions?",
    ],
  },
  "sys-15": {
    whyItMatters: "A clerk opens Northwind’s invoice at row 37 of the overdue list. Back should return to that row with the due-date sort intact so they can check row 38 next. Baymard observed shoppers having to find a product again when Back returned them to the top.",
    riskWhenIgnored: "Back returns to row 1 of All invoices, sorted by newest. The clerk must restore the filter and sort, then find their place again. If the URL also omits those settings, a colleague opening the link sees a different list.",
    implementationNotes: [
      "Keep shareable view state, such as the query, filters, sort and page, in the URL (for example `?status=overdue&sort=due`), and render the list from it. Update it with `history.replaceState` or the router’s replace so changing a filter does not stack a Back step per click.",
      "Keep scroll position and expanded rows out of the URL. Let the browser restore scroll (`history.scrollRestoration` stays `auto`), or save the position with the history entry and restore it once the rows have rendered. Keep the list data cached so Back does not refetch and render an empty list first.",
      "To find violations, search for filter, sort and search state held only in component state, such as `useState` for a filter with no matching `useSearchParams` or `URLSearchParams`, and for `history.scrollRestoration = \"manual\"` or a `window.scrollTo(0, 0)` that runs on every route change.",
    ],
    reviewPrompts: [
      "Filter the list, sort it, scroll down, open row 37 and press Back. Is row 37 in view with the same filter and sort?",
      "Open the filtered list’s URL in a new tab. Do the search, filters, sort and page match?",
      "Start on another page, open the list, change the filter three times and open an item. Does Back return to the filtered list, then to the starting page?",
    ],
  },
  "sys-16": {
    whyItMatters: "Six seconds after the upload failed, one preview still offers Retry. In the other, the message disappeared after five seconds and took the only Retry button with it. A success message can time out when the saved result is visible elsewhere.",
    riskWhenIgnored: "Someone who looked away, is reading with a screen magnifier or takes longer to reach the toast with a keyboard finds an empty corner and no sign the file was not uploaded. WCAG 2.2.1 (Timing Adjustable) asks that people can turn off, adjust or extend time limits, and a timed toast holding the only Retry is such a limit.",
    implementationNotes: [
      "Give each message a dismissal policy by type. Success confirmations whose result is visible elsewhere may close after a few seconds. Errors and any message holding the only Undo or Retry stay until the person acts on it or closes it, as Carbon’s inline and actionable notifications do.",
      "Pause any timer while the message is hovered or holds focus, and while the tab is hidden (`document.visibilityState === \"hidden\"`). Restart the full timer once the tab is visible and neither the pointer nor keyboard focus is on the message. Announce the message through a live region, and make its actions reachable from the keyboard.",
      "Check error messages and messages offering Undo or Retry for dismissal timers, including library defaults. Flag any error that times out. If Undo or Retry times out, check where the person can still take that action.",
    ],
    reviewPrompts: [
      "Trigger the failure, then wait ten seconds without touching anything. Are the error and Retry still on screen?",
      "Show a timed confirmation. Does it stay visible past its timeout while the pointer rests on it? Repeat with keyboard focus on an action.",
      "Show a timed confirmation and switch tabs for a minute. When you return, is the message still there for its full timeout?",
    ],
  },

  // ── Motion & interaction ────────────────────────────────────────
  "motion-1": {
    whyItMatters: "Open the dialog once and its entrance takes 220ms. Open the command palette ten times and the same entrance adds up to 2.2 seconds. The tally shows how often people see a motion they already know.",
    riskWhenIgnored: "A palette that hides its results during entry makes people wait on every search, even when they know which command they want.",
    implementationNotes: [
      "Identify a repeated task and the next input it invites.",
      "Shorten or skip the entrance on panels people open repeatedly.",
      "Compare an immediate entrance with the current one over a sequence of realistic tasks.",
    ],
    reviewPrompts: [
      "How soon can someone use the first result after opening the palette?",
      "Does anything move under the pointer as the user reaches for the next action?",
      "What does the entrance explain on the tenth open?",
    ],
  },
  "motion-2": {
    whyItMatters: "Both palettes take 180ms to open. Halfway through, the example types “op”. The field focused on open shows both letters. The field focused after the entrance stays empty.",
    riskWhenIgnored: "A missing first character sends the user into a different set of results. Escape during entry can also leave focus behind a closing overlay.",
    implementationNotes: [
      "Focus the field as soon as the panel mounts.",
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
    whyItMatters: "The Details panel slides in from the right, showing which edge it belongs to. The dialog grows to 115% of its final size and shrinks back. That bounce draws attention to the frame while someone is trying to read.",
    riskWhenIgnored: "A bounce on every open draws attention back to the dialog frame while someone is trying to read its contents.",
    implementationNotes: [
      "Describe the change the user should notice.",
      "Match a directional transition to the panel’s actual placement.",
      "Compare the transition with an immediate change and inspect what information disappears.",
    ],
    reviewPrompts: [
      "Can someone tell which edge the Details panel came from?",
      "Does the animation call attention to the right event?",
      "Does the end state communicate the result with reduced motion enabled?",
    ],
  },
  "motion-4": {
    whyItMatters: "Both curves finish in 360ms. At 120ms, CSS ease has covered about 58% of the distance and the stronger ease-out about 88%. The stronger curve keeps the panel near its final position for longer.",
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
      "Keep the toast visible long enough to read. When someone dismisses it, use a short fade or slide.",
      "Keep focus where it is when a passive toast appears or disappears. If someone dismisses it with a focused button inside the toast, move focus to the next control for their task.",
      "Dismiss the toast mid-entrance. Does it leave from its current position?",
    ],
    reviewPrompts: [
      "Can the message be read before it goes away?",
      "Where does the next click or keystroke go?",
      "Does the destination of a moving item remain clear?",
    ],
  },
  "motion-8": {
    whyItMatters: "Feedback on contact shows that the button registered the press. A small scale change can suit a compact icon button. The same factor moves the edges of a wide button much farther, and scaling the actual hit target can move it out from under a pointer near the edge.",
    riskWhenIgnored: "Committing a destructive action on pointer down can take away the chance to slide off and cancel before release.",
    implementationNotes: [
      "Apply decorative scale to an inner surface when the outer hit area should stay fixed.",
      "Run the button’s action on click. Use :active for the pressed appearance.",
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
    riskWhenIgnored: "As a menu grows from zero, its items move under the pointer. Someone reaching for a familiar item can hit the next row instead.",
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
    whyItMatters: "A menu below its button grows from its top edge. If it opens above the button, use its bottom edge. Keeping the origin at the top makes the menu grow toward the button from the wrong side.",
    riskWhenIgnored: "If a menu opens above its button but grows from its top edge, it looks as though it came from farther up the page.",
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
    whyItMatters: "The first delay keeps tooltips from flashing as the pointer crosses the toolbar. Once a tooltip opens, a short grace period lets someone cross gaps between buttons without waiting again. Keyboard focus can show the tooltip immediately.",
    riskWhenIgnored: "Independent delays make a row of unfamiliar icons tedious to inspect. Hiding a tip as soon as the pointer leaves its trigger can also prevent someone from moving over the text to read it.",
    implementationNotes: [
      "Share the first-hover delay across neighboring toolbar buttons.",
      "Provide the information on keyboard focus and allow Escape to dismiss it.",
      "Keep the tip open while the pointer is over the trigger or its content where WCAG hover-content requirements apply.",
    ],
    reviewPrompts: [
      "Do any tooltips flash when you move quickly across the toolbar?",
      "Can someone travel from a trigger onto its tip?",
      "After leaving and returning, does the initial delay reset?",
    ],
  },
  "motion-12": {
    whyItMatters: "Select Move cards twice before the cards finish moving. The CSS transition turns back from its current position. Restarting keyframes from a fixed endpoint makes the card jump. With the Web Animations API, keep the Animation object and call reverse() on it.",
    riskWhenIgnored: "An interrupted toggle can jump ahead to a state it never visibly reached, then move back toward the requested one.",
    implementationNotes: [
      "Use a transition for two stable CSS states.",
      "For a richer sequence, retain the Animation object and reverse or update it deliberately.",
      "Try repeatedly changing direction during the first and last portions of travel.",
    ],
    reviewPrompts: [
      "Does the object jump when its destination changes?",
      "After two quick reversals, does the control’s accessible state match its final setting?",
      "Can a stale completion handler undo a newer choice?",
    ],
  },
  "motion-13": {
    whyItMatters: "When a row first appears, the browser may have no previous style to transition from. @starting-style supplies one, so the row can animate into its normal style without a second render to change its class.",
    riskWhenIgnored: "If a row stays transparent until a script reveals it, someone can tab to its controls before seeing them.",
    implementationNotes: [
      "Define final opacity and position in the normal rule.",
      "Write the row’s final style first. Then nest @starting-style inside the row’s rule, or put the row selector inside a separate @starting-style block. At equal specificity, the later starting value wins on entry.",
      "Insert successive rows and test with animation disabled.",
    ],
    reviewPrompts: [
      "Does the row appear on its first insertion?",
      "Can you see the row before a script runs to reveal it?",
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
    whyItMatters: "translateY(100%) moves a toast by its own height. If it starts 10px above the bottom edge, its top 10px can still be visible. Add the gap to the exit distance or clip the toast at its starting bottom edge.",
    riskWhenIgnored: "A fixed exit distance can hide a short message but leave a longer, localized or wrapped message on screen. Even after the toast disappears, its controls can still receive focus.",
    implementationNotes: [
      "Identify the edge or clipping boundary the object must cross.",
      "Test short, wrapped and localized messages with the actual inset.",
      "Remove the dismissed surface from interaction when its state changes.",
    ],
    reviewPrompts: [
      "Does the tallest toast clear the boundary?",
      "Does the shortest toast also clear its inset?",
      "Can focus reach the dismissed content?",
    ],
  },
  "motion-16": {
    whyItMatters: "The hover media query describes the primary pointing device. A laptop with a trackpad can match it even while someone taps the screen. For scripted hover, check pointerType on the event.",
    riskWhenIgnored: "If the only sign of an action appears on hover, a person using a keyboard or touch screen can miss it. A tap can leave a button looking hovered after the finger lifts.",
    implementationNotes: [
      "Use (hover: hover) to check whether the primary pointing device can hover.",
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
    whyItMatters: "Large movements can cause discomfort. A confirmation toast can fade in place and still show that the action succeeded. WCAG 2.3.3 (Level AAA) requires a way to disable nonessential motion triggered by interaction.",
    riskWhenIgnored: "If success appears only as an animated checkmark, removing the animation can erase the confirmation. Keep a message or icon visible after the fade.",
    implementationNotes: [
      "Build the final state first. Add movement inside @media (prefers-reduced-motion: no-preference).",
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
    whyItMatters: "A slow drag past the 60% line and a short flick faster than 0.5 px/ms toward the edge both dismiss the card. Measure speed just before release so a drag that ends in a pause doesn’t count as a flick.",
    riskWhenIgnored: "High sensitivity can dismiss an item during scrolling or a small correction. If the gesture is the only way to dismiss, people who cannot drag have no equivalent action.",
    implementationNotes: [
      "Measure recent movement along the dismissal axis and settle on release.",
      "Test a quick flick, slow drag, reversal and flick followed by a pause.",
      "Provide a Dismiss button. If dismissal removes something important, let people undo it.",
    ],
    reviewPrompts: [
      "Does a stationary release below the distance threshold keep the card?",
      "Does a canceled pointer leave the item intact?",
      "Can someone complete the same action with a single tap or click?",
    ],
  },
  "motion-19": {
    whyItMatters: "Past a card’s drag limit, each extra pixel of pull moves the card a little less. A slider thumb that moves past its maximum suggests a value it cannot save, so keep it within range.",
    riskWhenIgnored: "Dragging past a slider’s limit can suggest a value it cannot save. On release, the control should show the saved value.",
    implementationNotes: [
      "Define the visual limit from a meaningful boundary such as a drawer’s last snap point.",
      "Cap visual travel beyond the edge and preserve the valid underlying value.",
      "Return the card to its resting position on release. With reduced motion enabled, return it immediately.",
    ],
    reviewPrompts: [
      "What does movement beyond the edge mean here?",
      "Can someone mistake overshoot for a valid value?",
      "Does releasing or canceling show the correct resting state?",
    ],
  },
  "motion-20": {
    whyItMatters: "Pointer capture keeps sending the drag element events from the pointer that started the drag, even outside the handle. Touch input can capture a pointer automatically, so also test with a mouse.",
    riskWhenIgnored: "If a second contact overwrites the active pointer or a canceled drag follows the commit path, the handle can jump or submit an unintended change.",
    implementationNotes: [
      "Record the active pointerId and call setPointerCapture(pointerId) on the drag element when the drag starts.",
      "Choose touch-action for the gestures the page still needs. On a horizontal drag surface, pan-y preserves vertical scrolling.",
      "Clean up on pointerup, pointercancel and lostpointercapture. Make cleanup safe to run twice. If release triggers an action, skip it on cancellation.",
      "For a slider, let a tap on the track set the value as well. Check the keyboard path and the single-pointer path separately.",
    ],
    reviewPrompts: [
      "Does a mouse drag continue outside the handle?",
      "Can a second finger take over unexpectedly?",
      "Can scrolling, cancellation or loss of capture leave the control stuck?",
    ],
  },
  "motion-21": {
    whyItMatters: "Both cards travel the same distance. The CSS transition gets its destination once. JavaScript moves the other card in requestAnimationFrame callbacks. A long task blocks those callbacks, so that card pauses and then jumps ahead.",
    riskWhenIgnored: "A smoothly moving indicator can mask an unresponsive application. Keyboard input and event handlers can still wait behind the same long task.",
    implementationNotes: [
      "Use a transition when the endpoints are known. For scripted playback, keep the Animation object returned by element.animate() so you can pause, reverse or cancel it. Handle cancellation separately from completion.",
      "Record the animation and check whether the browser actually composites it.",
      "Break up or remove long main-thread tasks so input can be handled promptly.",
    ],
    reviewPrompts: [
      "Which updates require JavaScript on every frame?",
      "Does the indicator actually keep moving on the target device?",
      "How long does a click or keypress wait during a long task?",
    ],
  },
  "motion-24": {
    whyItMatters: "Three rows with a 220ms entrance and 60ms between starts finish in 340ms. At 220ms between starts, the last finishes at 660ms. With thirty rows, the last would finish at 1,960ms or 6,600ms respectively.",
    riskWhenIgnored: "A search result can already accept clicks while its opacity is zero. Keyboard focus can also advance to a row that has not become visible.",
    implementationNotes: [
      "Sequence items only when their order explains a relationship or change. Show a familiar dialog together when people need its title and action immediately.",
      "Budget for the last useful item. For evenly spaced starts, the last row finishes at duration + interval × (rows − 1). Cap the animated group or start the remaining items together.",
      "Show each row before it can receive focus or clicks.",
    ],
    reviewPrompts: [
      "When does the last row finish its entrance?",
      "What happens when the list has thirty items?",
      "Can someone tab to or click an invisible result?",
    ],
  },
  "motion-28": {
    whyItMatters: "Two glyphs in one stable slot can communicate a state change without shifting the label or pointer target. In the matched crossfades, the sharp check is recognizable sooner than the blurred one. The final state still needs to make sense to someone who looks back after the transition.",
    riskWhenIgnored: "A checkmark alone can leave a screen reader user unaware that the action succeeded. Blurring it also makes the confirmation harder to recognize as it appears.",
    implementationNotes: [
      "Keep both glyphs inside one fixed-size slot. Swap instantly if the state is already clear, or use a short crossfade that keeps the incoming glyph legible at its actual size.",
      "Give the resulting control or status an appropriate accessible name, state or announcement.",
      "Test rapid reversals, the smallest rendered size and an immediate reduced-motion swap.",
    ],
    reviewPrompts: [
      "Can someone identify the final state after looking away?",
      "Does focus stay on the control, and does its accessible name still describe its action?",
      "Does the glyph remain understandable without movement?",
    ],
  },
  "motion-29": {
    whyItMatters: "On refresh, a persistent control has no preceding on-screen position to transition from. Fading it in hides a control the page could already show. Content that genuinely arrives later can use an entrance to show what changed.",
    riskWhenIgnored: "On a frequently revisited screen, entrance effects can briefly hide the controls needed to resume work or make a restored focus target difficult to locate.",
    implementationNotes: [
      "Show ready controls at full opacity and in their final position on first paint.",
      "With Motion for React, AnimatePresence initial={false} skips initial animations on children present at first render.",
      "Test refresh, restored state and a later insertion separately.",
    ],
    reviewPrompts: [
      "Which content is known before the first render?",
      "Can the user locate the initial focus target immediately?",
      "When a new item appears, can you tell what was added?",
    ],
  },

  // ── Accessibility & inclusivity ──────────────────────────────────
  "a11y-1": {
    whyItMatters: "The outline on Save changes shows which button Enter will activate. If you replace the browser’s outline, check yours on every background and in high-contrast modes.",
    riskWhenIgnored: "A focus ring can disappear against a colored background or be clipped by a parent with overflow: hidden. Forced-colors mode can also hide a ring drawn with box-shadow alone.",
    implementationNotes: [
      "Keep the browser’s focus outline or replace it with one that’s just as easy to see.",
      "Check a custom focus ring against every color it touches and in forced-colors mode.",
      "Use Tab and Shift+Tab to move past sticky headers and footers. Check that neither completely hides the focused control (WCAG 2.4.11, level AA).",
      "Use :focus-visible to follow the browser’s focus cues. Clicking a text field can show the focus ring too.",
    ],
    reviewPrompts: [
      "As you tab through the page, can you always see which control has focus?",
      "Is the indicator distinguishable wherever it is drawn?",
      "Does it remain visible under zoom, clipping and forced colors?",
    ],
  },
  "a11y-2": {
    whyItMatters: "“Card number needs 16 digits, not 14” tells the reader which field to fix and why. The icon helps them find the message even in grayscale.",
    riskWhenIgnored: "In grayscale, the red border looks gray. Without a message, the reader has to guess what’s wrong with the card number.",
    implementationNotes: [
      "Use text, shape, pattern or another suitable cue for the meaning carried by color.",
      "Explain the error in text and connect the message to the field, for example with aria-describedby.",
      "View the field in grayscale. Then focus it with a screen reader and listen for the error message.",
    ],
    reviewPrompts: [
      "Can you tell the two states apart in grayscale?",
      "Does the message explain what needs correcting?",
      "When you focus the field with a screen reader, do you hear the error message?",
    ],
  },
  "a11y-3": {
    whyItMatters: "Both buttons are 44px tall. A tap 3px past Cancel lands in the 8px gap. When the buttons touch, the same tap lands on Delete.",
    riskWhenIgnored: "Toolbar icons can look well spaced while their hit areas overlap. Large adjacent buttons can be easy to tap without an 8px gap.",
    implementationNotes: [
      "Measure hit areas as well as glyphs.",
      "If a target falls short of 24 × 24 CSS pixels, check the spacing exception in WCAG 2.5.8. Center a 24px-diameter circle on each undersized target’s bounding box. Unless another exception applies, each circle must avoid overlapping other targets and other undersized targets’ circles.",
      "Separate actions that are costly to confuse, such as Cancel and Delete. Test them on the intended touchscreen.",
    ],
    reviewPrompts: [
      "Where does a near miss land?",
      "Do expanded hit areas overlap?",
      "Could a tap just past Cancel trigger Delete?",
    ],
  },
  "a11y-4": {
    whyItMatters: "One tap on Move up moves Book room one place. Someone who can tap but struggles to hold and drag can still reorder the list.",
    riskWhenIgnored: "Someone who can tap a task but can’t hold it steady while dragging may release it into the wrong position or leave the list unchanged.",
    implementationNotes: [
      "Search for draggable, onDragEnd and pointer handlers that change positions. For each outcome, trace a click or tap path to the same update.",
      "Use Move up and Move down for a list, a destination menu for a board, or step buttons or a value field for a slider. A sequence of individual clicks or taps can reach the same outcome as one drag.",
      "WCAG 2.5.7 allows exceptions for essential dragging and drag behavior the browser provides unchanged. Check keyboard access separately under sys-8.",
    ],
    reviewPrompts: [
      "In your reorderable list, tap Move up once on the item in position 2. Does it move to position 1?",
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
      "Give each subsection the next heading level, such as h3 under h2. When the subsection ends, use the level of the next section.",
    ],
    reviewPrompts: [
      "Open your page’s heading list in a screen reader. Do the levels show how sections nest, as Settings (1), Billing (2) and Invoices (3) do here?",
      "If the designer shrinks Billing, does it stay a level 2 heading?",
      "Do sections at the same depth use the same heading level?",
    ],
  },
  "a11y-6": {
    whyItMatters: "The testimonial strip replaces the quote while someone is reading the shared-calendar instructions just below it. Pause holds the current quote so the person can finish either passage at their own pace.",
    riskWhenIgnored: "A quote can change before someone finishes reading it. Each change can also distract them from the calendar instructions.",
    implementationNotes: [
      "Search for autoplay, setInterval and polling callbacks in carousels, tickers and live feeds. Follow each start path and check which user control can stop the visible change.",
      "Put a visible, keyboard-operable Pause control with the strip and show whether rotation is paused. Keep it paused until the reader resumes it.",
      "For nonessential content that starts automatically alongside other content, WCAG 2.2.2 sets two tests. Movement, blinking or scrolling lasting over 5 seconds needs a way to pause, stop or hide it. Automatic updates need one of those controls at any interval, or a way to change the frequency.",
    ],
    reviewPrompts: [
      "In your own rotating strip, tab to Pause and press Space. With a 4-second interval, does the same quote stay visible for two intervals?",
      "Does the strip stay paused when focus leaves the control?",
      "Can someone tell that the strip is paused before resuming it?",
    ],
  },
  "a11y-7": {
    whyItMatters: "The sharing guide is linked inside a sentence about file access. The underline marks where the link begins and ends, even when its blue looks like the surrounding ink.",
    riskWhenIgnored: "Someone who can’t distinguish the link color may read “sharing guide” without realizing it opens the guide.",
    implementationNotes: [
      "Check inline links in paragraphs, lists and captions. Look for no-underline or text-decoration: none in the default and visited states.",
      "Keep underlines on prose links at rest. Navigation menus can omit them when placement already makes their links recognizable.",
      "If color alone marks an inline link, WCAG technique G183 calls for at least 3:1 contrast with the surrounding text. Check both text colors against the background separately.",
    ],
    reviewPrompts: [
      "Turn on grayscale, move the pointer off the paragraph and read the sentence. Can you find the sharing guide link before interacting with it?",
      "Does a visited inline link retain an underline or a sufficient visual cue at rest?",
      "If color alone marks a link, does it reach 3:1 contrast with surrounding text before anyone interacts with it?",
    ],
  },
  "a11y-8": {
    whyItMatters: "After closing the edit dialog for Quarterly report, someone using a keyboard is still working in that project row. Returning focus to Edit keeps their place so they can continue through the project list.",
    riskWhenIgnored: "If focus falls back to the page body, the next Tab can land on New project at the top and make the user search for the row again.",
    implementationNotes: [
      "Use your dialog component’s built-in focus restoration if available. For a custom dialog, save the opener and focus it once the page behind the dialog can receive focus again.",
      "Check document.activeElement after Escape, Cancel and Save. If focus falls to the page body or the next Tab jumps to the first control, check where the dialog restores focus.",
      "If deleting a row removes its Edit button, focus Edit in the next row. Use the previous row if you deleted the last one, or New project if the list is empty.",
    ],
    reviewPrompts: [
      "In your project list, open an edit dialog with the keyboard and press Escape. Is focus back on the row’s Edit button before you press Tab again?",
      "Do Cancel and Save also put focus where the task should continue?",
      "If your dialog can delete a row, try deleting the last one. Can you continue from the previous row or, in an empty list, from New project?",
    ],
  },
  "mobile-1": {
    whyItMatters: "The background can fill the bottom of the screen while the button sits higher. Adding the inset to the design gap keeps that gap when the inset changes.",
    riskWhenIgnored: "Pay ends at 832 in an 844-unit screen. With a 34-unit bottom inset, the last 22 units of the button fall inside the system region.",
    implementationNotes: [
      "iOS — Anchor the foreground to the safe-area layout guide and let the bar background extend beneath it.",
      "Android — Read window insets for the current navigation mode. With Material 3 Scaffold, apply and consume the supplied content padding once.",
      "Web — For a full-bleed viewport, add the affected env(safe-area-inset-*) value to the design gap.",
    ],
    reviewPrompts: [
      "Does Pay keep its ordinary padding at zero inset?",
      "After rotation, does the whole target clear the cutout?",
      "Is Scaffold padding consumed exactly once?",
    ],
  },
  "mobile-2": {
    whyItMatters: "The small viewport describes the opening with the browser controls expanded. A dynamic viewport follows the space available as the controls move.",
    riskWhenIgnored: "An 844 px panel places its last 48 px behind an 88 px toolbar. A reader can miss Continue before they have even started scrolling.",
    implementationNotes: [
      "iOS — In Safari, check the opening screen with the address bar expanded and after it retracts.",
      "Android — Repeat in Chrome with controls expanded and re-expanded. Native layouts use their window bounds and insets.",
      "Web — Use svh for a stable opening section and dvh for a shell that follows current space. Let longer content grow or scroll.",
    ],
    reviewPrompts: [
      "Can you reach Continue on first load with the bar open?",
      "Does retracting and restoring the bar hide an action?",
      "Can a longer opening section scroll?",
    ],
  },
  "mobile-3": {
    whyItMatters: "A corner gives a misplaced tap fewer places to land. Extra responding space can catch a tap that misses the same glyph in a smaller box.",
    riskWhenIgnored: "The user touches beside Close and the overlay stays open.",
    implementationNotes: [
      "iOS — Keep the corner control inside the usable safe area. Apple recommends a 44 pt hit region for ordinary controls.",
      "Android — Reserve at least 48 × 48 dp for ordinary independent controls. Account for implicit touch expansion when placing neighbors.",
      "Web — Inspect the actual responding box. The fixture’s 60 CSS px is an example. WCAG 2.5.8 specifies a separate 24 CSS px test with exceptions.",
    ],
    reviewPrompts: [
      "Replay the tap 26 CSS px to the right of Close. Which box contains that point?",
      "Compare the seeded cloud with your own taps. Which result describes your hand?",
      "Does extra padding encroach on a neighboring target?",
    ],
  },
  "mobile-4": {
    whyItMatters: "Placing a repeated action within the current grip saves a stretch on every use.",
    riskWhenIgnored: "A top-corner Save makes someone shift their grip to finish each edit.",
    implementationNotes: [
      "iOS — Keep standard navigation controls in familiar positions. Test the placement of a frequent task action with either hand.",
      "Android — For a primary floating action, account for the gesture bar and the hand reaching across the screen.",
      "Web — Use logical alignment for language direction. Offer handedness only as a control in the teaching model.",
    ],
    reviewPrompts: [
      "Does Save stay reachable with either hand?",
      "Move the thumb pivot and switch hands. Does the center of Save still sit inside the arc?",
      "Can someone complete the task on the larger screen?",
    ],
  },
  "mobile-5": {
    whyItMatters: "Contact is the start of both a tap and a scroll. Waiting for release lets the scroll view cancel activation.",
    riskWhenIgnored: "Dragging up from a message row opens the message before the inbox can scroll.",
    implementationNotes: [
      "iOS — Use the control’s highlighted state and normal activation event. Let the scroll view resolve the movement.",
      "Android — Use the Material press indication and distinguish press, cancellation and completed click.",
      "Web — Use click for activation. Clear custom pressed visuals on cancellation, and preserve ordinary panning and keyboard activation.",
    ],
    reviewPrompts: [
      "Start a scroll on Tide tables. Does the inbox move, or does the message open under your finger?",
      "Does a canceled press clear its highlight?",
      "Does a completed tap open exactly once?",
    ],
  },
  "mobile-6": {
    whyItMatters: "Separate Open and Like controls let each tap have one meaning.",
    riskWhenIgnored: "A timer delays every ordinary open even for someone who never uses double tap.",
    implementationNotes: [
      "iOS — A recognizer required to wait for a double tap can delay the single-tap action.",
      "Android — Use confirmed-single-tap recognition only when distinguishing a double tap matters to the same control.",
      "Web — Responsive pages support fast taps. A CSS touch-action value cannot remove a timer written by the app.",
    ],
    reviewPrompts: [
      "Compare the scheduled 300 ms wait with the elapsed time between the tap handler and Open.",
      "Can Like still be reached independently?",
      "Can both actions be invoked with the keyboard?",
    ],
  },
  "mobile-7": {
    whyItMatters: "A visible Orders tab gives the reader a destination to aim for on the first tap.",
    riskWhenIgnored: "From Home, hiding Orders adds a stop at Menu before the reader can see and choose Orders.",
    implementationNotes: [
      "iOS — Use labelled tabs for peer sections. Put an action such as Compose in the screen’s action controls.",
      "Android — A Material navigation bar suits three to five peer destinations. Larger windows may use a rail.",
      "Web — Use navigation links with stable URLs and aria-current. A visible row can work as well as a bottom bar.",
    ],
    reviewPrompts: [
      "How many activations take you from Home to Orders?",
      "Can you identify the current destination?",
      "Does each peer destination retain its label?",
    ],
  },
  "mobile-8": {
    whyItMatters: "Each tab can preserve its own route and reading anchor while another tab is active.",
    riskWhenIgnored: "If switching tabs remounts Shop at its root, returning from Bag lands the reader in the catalog. They have to find the atlas and its returns policy again.",
    implementationNotes: [
      "iOS — Keep the selected destination and its navigation state. Treat reselecting the active tab as a separate interaction.",
      "Android — Save and restore independent navigation stacks for peer flows. Also restore the list or detail scroll state.",
      "Web — Store a route and reading anchor per destination and restore after content layout. Preserve browser history behavior.",
    ],
    reviewPrompts: [
      "Does Shop reopen product 18?",
      "Is the Returns passage visible again?",
      "What happens if the text size changes while you are away?",
    ],
  },
  "mobile-9": {
    whyItMatters: "The map and its selected pin supply the context for café details. Closing one layer preserves that context.",
    riskWhenIgnored: "Back removes the map while the details sheet is still open.",
    implementationNotes: [
      "iOS — Use a visible Cancel or Close and native sheet dismissal. Guard unsaved work according to the task.",
      "Android — Let the topmost modal sheet consume a completed system Back before the parent route.",
      "Web — Where a sheet is represented in history, handle Back, Forward and explicit close consistently. Escape and Close restore focus.",
    ],
    reviewPrompts: [
      "Does Back dismiss the top sheet first?",
      "Does focus return to the selected pin?",
      "After an explicit Close, does Back leave the map and Forward restore the right layer? Try a direct link as well.",
    ],
  },
  "mobile-10": {
    whyItMatters: "Someone can start Back to see what lies underneath a reply, then change their mind. Keeping the draft route alive lets them resume typing at the same character.",
    riskWhenIgnored: "Popping at gesture start discards the draft even when the reader cancels.",
    implementationNotes: [
      "iOS — Use the navigation controller’s interactive pop when available and respect its cancellation.",
      "Android — Drive the preview from predictive Back progress. Restore on cancel and pop once on completion.",
      "Web — Leave browser Back available. Replay in-app navigation in a local stack within the teaching frame.",
    ],
    reviewPrompts: [
      "Does canceling Back preserve the caret?",
      "Does the draft survive cancellation?",
      "How many routes are removed on completion?",
    ],
  },
  "mobile-11": {
    whyItMatters: "The space available to an app can change while the physical display stays the same.",
    riskWhenIgnored: "A rail sized for the full display takes a column away from the saved book when the app shares the screen.",
    implementationNotes: [
      "iOS — Allow tabs or a sidebar to adapt to the scene’s available space.",
      "Android — The documented navigation suite uses a bar for compact width, compact height or tabletop posture. Test all three conditions.",
      "Web — Measure the viewport or container and choose the break where these links fit. Preserve each link’s address.",
    ],
    reviewPrompts: [
      "Which surface appears at 599 and 600 dp?",
      "Does compact height change that decision?",
      "Does Saved remain selected through the resize?",
    ],
  },
  "mobile-12": {
    whyItMatters: "The system can reserve an edge for starting Back. A trim handle inside that region can lose the first movement before the clip editor receives a drag.",
    riskWhenIgnored: "An inward swipe on the handle can reveal the previous screen before the clip changes.",
    implementationNotes: [
      "iOS — Respect the leading-edge navigation gesture, including in mirrored layouts, and the bottom Home gesture.",
      "Android — Either side edge may own Back in gesture mode. Read gesture insets and leave mandatory system gestures available.",
      "Web — Use an inset handle plus a visible alternative. There is no portable CSS value for an OS Back recognizer’s width.",
    ],
    reviewPrompts: [
      "Who receives the first inward drag?",
      "With the right edge selected, can you shorten the clip using the step buttons?",
      "Does the leading edge move with the reading direction?",
    ],
  },
  "mobile-13": {
    whyItMatters: "A horizontal adjustment and a vertical pan can share a starting point if the browser knows which movement it may take.",
    riskWhenIgnored: "With touch-action set to none, a vertical swipe that begins on the photo divider leaves the reader on the same paragraph.",
    implementationNotes: [
      "iOS — Use native directional recognition or test Safari’s real pan takeover on a touch device.",
      "Android — Keep the parent’s vertical scroll available across the horizontal control. Test Chrome with a finger.",
      "Web — Apply touch-action: pan-y pinch-zoom to the custom drag surface. Release drag state on pointercancel or lost capture.",
    ],
    reviewPrompts: [
      "Can a vertical swipe start on the handle?",
      "Does a horizontal drag still move the divider?",
      "What happens to the drag when its pointer is canceled?",
    ],
  },
  "mobile-14": {
    whyItMatters: "A visible menu lets a reader discover an action without first knowing a gesture.",
    riskWhenIgnored: "A reader can tap the photo, find no actions and leave without adding it to favorites. A swipe-only Archive action has the same discovery problem.",
    implementationNotes: [
      "iOS — Expose context-menu items through the main interface too. Keep ordinary link previews available elsewhere.",
      "Android — Offer an accessible overflow menu or selection control for actions reachable by a long press.",
      "Web — Use a real button with an accessible name and keyboard-operable menu. Scope any custom callout suppression to the affected item.",
    ],
    reviewPrompts: [
      "Can someone add the photo to favorites through More, then return to the same photo?",
      "Does scrolling cancel a pending long press?",
      "Can a keyboard reach and dismiss the same actions?",
    ],
  },
  "mobile-15": {
    whyItMatters: "Both paths lift the sheet 40 px. Projecting another 0.2 seconds of travel puts the fast release near the half stop and the slow release near peek.",
    riskWhenIgnored: "A fast flick settles back at the starting stop because its release point was still near peek.",
    implementationNotes: [
      "iOS — UIKit offers detents. Apple’s fluid-interface example projects a thrown object’s endpoint. A custom sheet can borrow that idea.",
      "Android — Prefer the platform’s sheet behavior. Tune custom settling against Android motion on a device.",
      "Web — Estimate recent release velocity, clamp the projected stop, and expose each rest position through a button.",
    ],
    reviewPrompts: [
      "At a 160 px release height, which stop does the quick flick select?",
      "Where does the slow release settle?",
      "Can each stop also be reached with a button?",
    ],
  },
  "mobile-16": {
    whyItMatters: "The activity log ends at Gates opened. Keeping a fresh swipe inside that log lets the reader pick up the article at the same sentence.",
    riskWhenIgnored: "A second swipe at the bottom of the log unexpectedly moves the article.",
    implementationNotes: [
      "iOS — Check Safari at both boundaries, including a log too short to scroll. Local bounce varies.",
      "Android — Distinguish local overscroll feedback from moving the parent or triggering browser refresh.",
      "Web — Set overscroll-behavior-y on the actual scrolling element. Modal focus, inertness and document scroll locking need separate handling.",
    ],
    reviewPrompts: [
      "Swipe over Gates opened, then over the article text. Which scroll offset changes each time?",
      "Does scrolling outside the log move the article?",
      "What happens when the log is too short to scroll?",
    ],
  },
  "mobile-17": {
    whyItMatters: "Remembering where a drag began gives a list flick one job until release.",
    riskWhenIgnored: "A traveller flicks back from departure 25 to check the first train. If the sheet takes over at the top, the timetable disappears before they can read it.",
    implementationNotes: [
      "iOS — Use native scroll and sheet coordination. Check the content and the grabber separately.",
      "Android — Use the nested-scrolling child and the sheet’s state to decide who receives a drag.",
      "Web — For a custom sheet, remember which surface owned the gesture at its start. Provide a Close button and avoid binding dismissal to every downward move.",
    ],
    reviewPrompts: [
      "After a flick from departure 25, can you read the first departure without reopening the sheet?",
      "Is the sheet still open when the list reaches the top?",
      "Can a fresh pull from the top dismiss it?",
    ],
  },
  "mobile-18": {
    whyItMatters: "An expanded sheet can still be shorter than its contents. Its body needs enough scroll range to bring the last option into view.",
    riskWhenIgnored: "Wheelchair access is option 12. Expanding the sheet exposes more rows, but its last option stays below the bottom edge until the body can scroll.",
    implementationNotes: [
      "iOS — Use available detents and keep a tappable way to expand or close the sheet.",
      "Android — Partially expanded and expanded states depend on available space. Give the expanded content an actual scroll range.",
      "Web — Keep modal focus inside the sheet. Use a bounded, scrollable body and return focus to the opener.",
    ],
    reviewPrompts: [
      "Can you select Wheelchair access after expanding?",
      "Can you reach and select the final row with Tab as well as by scrolling?",
      "Where does focus return after Close?",
    ],
  },
  "mobile-19": {
    whyItMatters: "A shopper looking for black shoes in size 9 under $120 can see how many pairs match while all three choices are still in front of them.",
    riskWhenIgnored: "The sheet closes between choices and makes the shopper find the remaining filters again.",
    implementationNotes: [
      "iOS — Keep the sheet’s pending selection while the person reviews the count and allow Cancel to discard it.",
      "Android — Keep Apply reachable above the current bottom inset and preserve the list behind the modal.",
      "Web — Derive the result count from the same predicate as the result list. Handle zero results and clearing a filter.",
    ],
    reviewPrompts: [
      "How many times must you reopen the filters?",
      "Does Cancel discard pending choices?",
      "Does the count on Show pairs match the list after applying, even when no pairs match?",
    ],
  },
  "mobile-20": {
    whyItMatters: "A legible postcode field lets the reader check the street and city while they type.",
    riskWhenIgnored: "Focusing a small field may zoom the page and move nearby controls out of view.",
    implementationNotes: [
      "iOS — This comparison concerns Safari’s focus heuristic. Use native text styles in UIKit and SwiftUI fields.",
      "Android — Use native scalable text for Android fields. The iPhone focus heuristic establishes no Android size threshold.",
      "Web — Check the computed field size, for example max(1rem, 16px). Keep pinch zoom enabled in both conditions.",
    ],
    reviewPrompts: [
      "What is the field’s computed size before focus?",
      "Does pinch zoom still work?",
      "On an iPhone, what scale does Safari report before focus, after focus and after blur?",
    ],
  },
  "mobile-21": {
    whyItMatters: "The visible editing rectangle may shrink or move while the layout viewport keeps its height.",
    riskWhenIgnored: "The draft still receives text while the caret and Send button sit behind the software keyboard.",
    implementationNotes: [
      "iOS — Use the keyboard layout guide in native layouts. Check the undocked and external keyboard cases independently.",
      "Android — Use IME insets in native layouts. Verify the browser and WebView separately when choosing a resize policy.",
      "Web — Start with a scrollable form. A pinned shell can follow top-level visualViewport height and offset, or reflow when a supported resizes-content policy is active.",
    ],
    reviewPrompts: [
      "Can you see the last line while typing?",
      "Can you tap Send while the keyboard is open and see your last line arrive in the conversation?",
      "Does the composer return when a hardware keyboard is used?",
    ],
  },
  "mobile-22": {
    whyItMatters: "A reader who uses enlarged text needs the pickup instructions to grow when they change the setting.",
    riskWhenIgnored: "Fixed text stays small even though the reader changed the system setting.",
    implementationNotes: [
      "iOS — Use Dynamic Type styles or scale custom fonts with UIFontMetrics. Test an accessibility size.",
      "Android — Use sp for text and line height. Android 14 introduced nonlinear scaling up to 200%.",
      "Web — Respect browser text resize and zoom. In Safari, test -apple-system-body where an OS-linked text style is intended. Relative sizes alone do not prove OS integration.",
    ],
    reviewPrompts: [
      "Does the actual label respond to a larger setting?",
      "In the iOS fixture, does Body grow from 17 pt to 53 pt at AX5?",
      "Does the platform’s text conversion apply to line height too?",
    ],
  },
  "mobile-23": {
    whyItMatters: "A minimum row height leaves room for the line boxes a larger label needs.",
    riskWhenIgnored: "The last words of a payment option disappear inside its fixed row.",
    implementationNotes: [
      "iOS — Test a large accessibility size. Stack secondary information when inline text no longer fits.",
      "Android — Use a minimum row height and the platform’s sp conversion for text and line height.",
      "Web — Allow wrapping and intrinsic height. Test 200% text resize and the separate 320 CSS px reflow check in sys-11.",
    ],
    reviewPrompts: [
      "Is the full business-account label readable at 200%?",
      "Can you still select the wrapped option?",
      "At 200% in the Android 14 fixture, do the 34 dp lines fit inside the payment row?",
    ],
  },
  "mobile-24": {
    whyItMatters: "The track tells you which way to drag. The price tells you when to stop. If the thumb holds the only number, you have to lift your finger to check it.",
    riskWhenIgnored: "The price can change while the shopper’s finger covers the only readout.",
    implementationNotes: [
      "iOS — A floating preview can keep precision feedback visible while the finger is down.",
      "Android — Use a slider value indicator or a nearby visible readout for the current value.",
      "Web — Keep the value available to keyboard and assistive input, including meaningful units on a range control.",
    ],
    reviewPrompts: [
      "Can you read the price throughout the drag?",
      "When the bubble would cross the top inset, does the price move to a clear spot?",
      "Can the price also be changed from the keyboard?",
    ],
  },
  "mobile-25": {
    whyItMatters: "After Add to bag, show the new quantity where the shopper can check it. Announce that same change while keyboard focus stays on Add.",
    riskWhenIgnored: "Someone adds an item twice because the first addition appeared to do nothing.",
    implementationNotes: [
      "iOS — Use optional system feedback when appropriate. WebKit documents haptics on its native switch in Safari 18.",
      "Android — Honor the device’s haptic preferences. Confirm the state even when vibration is unavailable.",
      "Web — Feature-detect optional vibration. Expose a visible confirmation and announce the update when the result is outside focus.",
    ],
    reviewPrompts: [
      "Is the new bag count visible with vibration off?",
      "After a second Add, does the status announce the new quantity once?",
      "Does opening the bag show the added item?",
    ],
  },
  "mobile-26": {
    whyItMatters: "The archive notice and the Compose button share the bottom edge of the inbox. Reserve the button’s height and a gap before placing the notice, including when its message wraps.",
    riskWhenIgnored: "A tap intended to restore the message opens a draft instead.",
    implementationNotes: [
      "iOS — Where the app uses a banner or action bar, check its entire hit area against other controls.",
      "Android — Material 3 Scaffold coordinates the measured snackbar, floating action button and bottom bar.",
      "Web — Reserve space from measured heights and insets. Test the longest translation and enlarged text.",
    ],
    reviewPrompts: [
      "Does a tap in the center of Undo restore the message?",
      "After Undo restores the message, can Compose still open a draft?",
      "Does the translated two-line message clear both targets?",
    ],
  },
};
