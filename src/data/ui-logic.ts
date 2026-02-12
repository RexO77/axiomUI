export type Category = {
  id: string;
  name: string;
};

export type Rule = {
  category: string;
  title: string;
  id: string;
  desc: string;
  do: string;
  dont: string;
  tags: string[];
};

export type DeepDiveSection =
  | { type: "text"; title?: string; content: string }
  | { type: "list"; title?: string; items: string[] }
  | { type: "code"; title?: string; code: string; language?: string };

export const categories: Category[] = [
  { id: "typography", name: "Typography & Text" },
  { id: "layout", name: "Layout & Spacing" },
  { id: "color", name: "Color & Depth" },
  { id: "components", name: "Components & Actions" },
  { id: "forms", name: "Forms & Inputs" },
  { id: "system", name: "System & Logic" },
];

export const rules: Rule[] = [
  {
    category: "typography",
    title: "Sentence Case Is King",
    id: "typo-1",
    desc: "Never use Title Case for buttons, labels, or headers. It slows down reading speed by disrupting word shapes.",
    do: "Create new account",
    dont: "Create New Account",
    tags: ["Buttons", "Headers"],
  },
  {
    category: "typography",
    title: "Letter Spacing on Caps",
    id: "typo-2",
    desc: "If text is uppercase, always add letter-spacing (tracking) to improve legibility. Uppercase letters have no natural rhythm.",
    do: "tracking-wider (0.05em)",
    dont: "tracking-normal (0em)",
    tags: ["Labels", "Navigation"],
  },
  {
    category: "typography",
    title: "Line Height Math (Body)",
    id: "typo-3",
    desc: "For body text, line-height should be ~1.5x the font size for readability.",
    do: "Size: 16px / Line-height: 24px",
    dont: "Size: 16px / Line-height: 18px",
    tags: ["Paragraphs"],
  },
  {
    category: "typography",
    title: "Line Height Math (Headings)",
    id: "typo-4",
    desc: "As text gets bigger, line-height gets tighter. Headings should be ~1.1x or 1.2x.",
    do: "Size: 32px / Line-height: 38px",
    dont: "Size: 32px / Line-height: 48px",
    tags: ["H1", "H2"],
  },
  {
    category: "typography",
    title: "The 2-Font Limit",
    id: "typo-5",
    desc: "You rarely need more than 1 typeface. If you must pair, use 1 Serif (Headings) + 1 Sans (Body). Never 2 Sans-serifs.",
    do: "Inter (Everything)",
    dont: "Roboto + Open Sans",
    tags: ["System"],
  },
  {
    category: "typography",
    title: "De-emphasize with Color, not Size",
    id: "typo-6",
    desc: "To make secondary text less important, lighten the color (neutral-500) rather than shrinking the size below 12px.",
    do: "Text-neutral-500 (14px)",
    dont: "Text-black (10px)",
    tags: ["Refactoring UI", "Hierarchy"],
  },
  {
    category: "typography",
    title: "Numeric Alignment",
    id: "typo-7",
    desc: "Use tabular nums (monospaced numbers) or right-align numbers in tables so decimals align.",
    do: "font-variant-numeric: tabular-nums",
    dont: "Standard proportional sans",
    tags: ["Tables", "Data"],
  },
  {
    category: "typography",
    title: "Left Align Body Copy",
    id: "typo-8",
    desc: "Center-aligned paragraphs slow scanning. Reserve center alignment for short headlines only.",
    do: "Left-aligned paragraph text",
    dont: "Centered multi-line paragraph",
    tags: ["Readability", "Alignment"],
  },
  {
    category: "typography",
    title: "Limit Font Weights",
    id: "typo-9",
    desc: "Use at most two weights per typeface (Regular + Semibold). Too many weights weaken hierarchy.",
    do: "Regular + Semibold",
    dont: "Light + Regular + Medium + Semibold + Bold",
    tags: ["Hierarchy", "Consistency"],
  },
  {
    category: "layout",
    title: "The 4pt Grid System",
    id: "layout-1",
    desc: "Every margin, padding, and height must be divisible by 4. Stop picking random numbers.",
    do: "4px, 8px, 16px, 24px, 32px, 48px",
    dont: "13px, 21px, 5px",
    tags: ["Spacing", "Consistency"],
  },
  {
    category: "layout",
    title: "Text Width Limits",
    id: "layout-2",
    desc: "Lines of text should be 45-75 characters long. Anything longer fatigues the eye.",
    do: "max-w-prose (approx 65ch)",
    dont: "width: 100% on a 27 inch monitor",
    tags: ["Readability"],
  },
  {
    category: "layout",
    title: "Group by Proximity",
    id: "layout-3",
    desc: "Items related to each other should be closer than items that aren't. Space > Lines.",
    do: "Label (gap-2) Input (gap-6) Next Label",
    dont: "Label (gap-4) Input (gap-4) Next Label",
    tags: ["Gestalt", "Forms"],
  },
  {
    category: "layout",
    title: "Visual vs Mathematical Center",
    id: "layout-4",
    desc: "Icons with asymmetric weight (like a Play triangle) look off-center if mathematically centered.",
    do: "Nudge Play icon right 1-2px",
    dont: "Absolute center",
    tags: ["Icons", "Polish"],
  },
  {
    category: "layout",
    title: "Button Padding Formula",
    id: "layout-5",
    desc: "Horizontal padding should be roughly 1.5x - 2x the Vertical padding.",
    do: "Py-2 Px-4 (8px / 16px)",
    dont: "Py-2 Px-2 (Square padding looks odd on text)",
    tags: ["Buttons"],
  },
  {
    category: "layout",
    title: "Optical Alignment of Icons",
    id: "layout-6",
    desc: "When placing an icon next to text, align the icon to the Cap Height of the text, not the full line height.",
    do: "Visual check alignment",
    dont: "Flex-center automatically (sometimes fails)",
    tags: ["Icons"],
  },
  {
    category: "layout",
    title: "The Container Fallacy",
    id: "layout-7",
    desc: "Don't put everything in a box with a border. Use background color or just whitespace to separate sections.",
    do: "White card on light grey bg",
    dont: "White card with grey border on white bg",
    tags: ["Refactoring UI"],
  },
  {
    category: "layout",
    title: "Consistent Gutters",
    id: "layout-8",
    desc: "Use a single gutter size within a layout region. Mixed gaps feel accidental.",
    do: "Cards: gap-6 throughout",
    dont: "Rows gap-6, columns gap-3",
    tags: ["Grids", "Consistency"],
  },
  {
    category: "color",
    title: "60-30-10 Rule",
    id: "color-1",
    desc: "60% Neutral (Bg/Text), 30% Secondary (Borders/Subtitles), 10% Primary (Action color).",
    do: "Mostly whites/greys, splashes of blue",
    dont: "Blue header, blue sidebar, blue buttons",
    tags: ["Balance"],
  },
  {
    category: "color",
    title: "Never Pure Black",
    id: "color-2",
    desc: "Pure black (#000000) creates eye strain against white. Use a very dark grey or blue-grey.",
    do: "neutral-900 (#0f172a)",
    dont: "#000000",
    tags: ["Contrast"],
  },
  {
    category: "color",
    title: "Colored Shadows",
    id: "color-3",
    desc: "Shadows in real life are rarely grey. They pick up the color of the object. Mix your brand color into the shadow.",
    do: "shadow-indigo-500/20",
    dont: "shadow-black/20",
    tags: ["Depth", "Vibe"],
  },
  {
    category: "color",
    title: "Semantic Colors",
    id: "color-4",
    desc: "Don't use Red/Green/Yellow for decoration. Reserve them for status (Error/Success/Warning).",
    do: "Blue/Purple/Brand for accents",
    dont: "Red icon for a 'Like' button",
    tags: ["Meaning"],
  },
  {
    category: "color",
    title: "Border Colors",
    id: "color-5",
    desc: "Borders should be subtle. If your text is neutral-900, your borders should be neutral-200.",
    do: "Border-neutral-200",
    dont: "Border-neutral-400 (Too heavy)",
    tags: ["Subtlety"],
  },
  {
    category: "color",
    title: "Double Contrast for Borders",
    id: "color-6",
    desc: "If a button is an outline, the border needs to be darker than a regular divider to be visible.",
    do: "Border-neutral-300 for inputs/buttons",
    dont: "Border-neutral-100",
    tags: ["Accessibility"],
  },
  {
    category: "color",
    title: "Hover = Same Hue",
    id: "color-7",
    desc: "Hover and active states should stay within the same hue. Only change lightness or saturation.",
    do: "Blue-600 -> Blue-700",
    dont: "Blue -> Green on hover",
    tags: ["States", "Consistency"],
  },
  {
    category: "components",
    title: "Action Hierarchy",
    id: "comp-1",
    desc: "One Primary Action per screen. Everything else is Secondary (Outline) or Tertiary (Text Link).",
    do: "1 Filled Button, 2 Ghost Buttons",
    dont: "3 Filled Buttons side-by-side",
    tags: ["Buttons"],
  },
  {
    category: "components",
    title: "Destructive Actions",
    id: "comp-2",
    desc: "Delete buttons shouldn't always be big and red. It invites accidental clicks. Use secondary style + confirmation modal.",
    do: "Grey 'Delete' button -> Red Confirm",
    dont: "Giant Red 'Delete' button in main UI",
    tags: ["UX"],
  },
  {
    category: "components",
    title: "Nested Radius Formula",
    id: "comp-3",
    desc: "Outer Radius = Inner Radius + Padding. This makes concentric corners look mathematically parallel.",
    do: "Outer 12px = Inner 4px + Padding 8px",
    dont: "Outer 4px / Inner 4px (Looks pinched)",
    tags: ["Polish", "Math"],
  },
  {
    category: "components",
    title: "Avatars Are Circles",
    id: "comp-4",
    desc: "Humans are organic. Put avatars in circles. Content (Documents/Projects) should be squares/rects.",
    do: "User = Circle / File = Rect",
    dont: "User = Square",
    tags: ["Semantics"],
  },
  {
    category: "components",
    title: "Modal vs Drawer",
    id: "comp-5",
    desc: "Use Modals for short, focused decisions (Are you sure?). Use Drawers for context-heavy tasks where you need to see the background.",
    do: "Delete Confirm = Modal / Edit Profile = Drawer",
    dont: "Edit complex settings = Small Modal",
    tags: ["Patterns"],
  },
  {
    category: "components",
    title: "Toast vs Inline Error",
    id: "comp-6",
    desc: "Toasts are for system-level updates (Saved!). Inline errors are for specific field fixes.",
    do: "Network error = Toast / Invalid email = Inline",
    dont: "Invalid email = Toast (Too far from context)",
    tags: ["Feedback"],
  },
  {
    category: "components",
    title: "Icon + Label for Ambiguous Actions",
    id: "comp-7",
    desc: "Icons are only universal for a few actions. Add labels for everything else to avoid guesswork.",
    do: "Icon + Archive label",
    dont: "Icon-only toolbar",
    tags: ["Clarity", "Navigation"],
  },
  {
    category: "components",
    title: "Disabled Needs a Reason",
    id: "comp-8",
    desc: "Disabled controls without explanation feel broken. Add a tooltip or helper text.",
    do: "Disabled button + helper text",
    dont: "Greyed-out button with no context",
    tags: ["Feedback", "Accessibility"],
  },
  {
    category: "forms",
    title: "Labels Top Aligned",
    id: "form-1",
    desc: "Top-aligned labels work best on mobile and allow for variable label length (translation friendly).",
    do: "Label above Input",
    dont: "Label left of Input (Desktop only)",
    tags: ["Layout"],
  },
  {
    category: "forms",
    title: "No Placeholders as Labels",
    id: "form-2",
    desc: "Placeholders disappear when you type. Users forget what the field was. Use persistent labels.",
    do: "Label: Email / Placeholder: you@example.com",
    dont: "Placeholder: Email Address",
    tags: ["UX", "Accessibility"],
  },
  {
    category: "forms",
    title: "Mark Optional, Not Required",
    id: "form-3",
    desc: "If 90% of fields are required, don't put red asterisks everywhere. Just mark the exceptions as (Optional).",
    do: "Phone Number (Optional)",
    dont: "Name* Email* Address* City*",
    tags: ["Noise Reduction"],
  },
  {
    category: "forms",
    title: "Input Width Hints",
    id: "form-4",
    desc: "The width of the input should hint at the expected content length.",
    do: "Zip code = Short input / Address = Long input",
    dont: "Zip code = Full width input",
    tags: ["Affordance"],
  },
  {
    category: "forms",
    title: "Checkbox vs Radio",
    id: "form-5",
    desc: "Radio = Select ONE. Checkbox = Select MANY. Never mix this mental model.",
    do: "Pick Plan: Radio",
    dont: "Pick Plan: Checkbox",
    tags: ["Logic"],
  },
  {
    category: "forms",
    title: "Dropdown vs Radio",
    id: "form-6",
    desc: "If you have < 5 options, show them all as Radio buttons. Don't hide them in a dropdown.",
    do: "3 Options = Radios",
    dont: "3 Options = Dropdown (Extra click)",
    tags: ["Efficiency"],
  },
  {
    category: "forms",
    title: "Switch vs Checkbox",
    id: "form-7",
    desc: "Switches imply immediate activation (like a light switch). Checkboxes imply 'Select now, Submit later'.",
    do: "Dark Mode = Switch",
    dont: "Subscribe to newsletter = Switch",
    tags: ["Semantics"],
  },
  {
    category: "forms",
    title: "Validate on Blur",
    id: "form-8",
    desc: "Inline validation should trigger after the user finishes a field, not on every keystroke.",
    do: "Error appears after leaving field",
    dont: "Error flashes on first character",
    tags: ["Validation", "Timing"],
  },
  {
    category: "forms",
    title: "Format Hints",
    id: "form-9",
    desc: "Show an example or format hint when a strict pattern is required.",
    do: "MM / YY hint",
    dont: "No format hint",
    tags: ["Clarity", "Data Entry"],
  },
  {
    category: "system",
    title: "Skeleton Loading",
    id: "sys-1",
    desc: "Spinners draw attention to the waiting. Skeletons (grey bars) imply progress and structure.",
    do: "Grey layout pulse",
    dont: "Giant spinning wheel",
    tags: ["Perceived Performance"],
  },
  {
    category: "system",
    title: "Empty States",
    id: "sys-2",
    desc: "Never leave a blank screen. Tell the user (1) What is missing, (2) Why, and (3) How to fix it.",
    do: "No Projects + 'Create Project' Button",
    dont: "Empty white box",
    tags: ["Onboarding"],
  },
  {
    category: "system",
    title: "Click Targets (Fitts's Law)",
    id: "sys-3",
    desc: "Interactive elements must be at least 44x44px (pointer-coarse) or large enough to hit easily.",
    do: "Button height 40px + margin",
    dont: "Text link with no padding",
    tags: ["Accessibility"],
  },
  {
    category: "system",
    title: "Date Formats",
    id: "sys-4",
    desc: "Use Relative dates (2 hours ago) for activity feeds. Use Absolute dates (12 Jan 2024) for historical records.",
    do: "Comment: 2m ago",
    dont: "Comment: 12/01/2024 14:02",
    tags: ["Context"],
  },
  {
    category: "system",
    title: "Design Tokens Naming",
    id: "sys-5",
    desc: "Name colors by what they ARE (Blue-500), not what they DO (Primary-Color). Aliases handle the 'Do' part.",
    do: "Color Palette -> Semantic Alias -> Component",
    dont: "Variable: $button-blue",
    tags: ["Atomic Design"],
  },
  {
    category: "system",
    title: "Undo Destructive Actions",
    id: "sys-6",
    desc: "When possible, offer a short undo window instead of a permanent deletion.",
    do: "Deleted -> Undo (5s)",
    dont: "Permanent delete instantly",
    tags: ["Safety", "Recovery"],
  },
  {
    category: "system",
    title: "Show Progress for Multi-Step",
    id: "sys-7",
    desc: "If a flow has 3+ steps, show progress to reduce anxiety.",
    do: "Step 2 of 4",
    dont: "No progress indicator",
    tags: ["Flow", "Guidance"],
  },
];

type CategoryDeepDive = {
  impact: string;
  failureMode: string;
  implementation: string[];
  reviewPrompts: string[];
};

const defaultDeepDive: CategoryDeepDive = {
  impact:
    "It keeps the interface easier to scan and lowers decision fatigue, especially for first-time users.",
  failureMode:
    "The surface starts to feel inconsistent, and users need more effort to parse what matters.",
  implementation: [
    "Codify the decision into reusable components or tokens instead of one-off fixes.",
    "Run a quick responsive check so the pattern remains clear on compact screens.",
  ],
  reviewPrompts: [
    "Can a new user understand the intent in under two seconds?",
    "Does the pattern remain consistent across other similar screens?",
    "Is the most important action or information still visually dominant?",
  ],
};

const categoryDeepDive: Record<string, CategoryDeepDive> = {
  typography: {
    impact:
      "Stronger typography improves reading rhythm and comprehension speed while reducing visual noise.",
    failureMode:
      "Inconsistent type scales and casing make copy harder to scan and weaken hierarchy.",
    implementation: [
      "Use one body style and one heading style as the default baseline for this pattern.",
      "Verify line-height and tracking in real content, not lorem ipsum.",
    ],
    reviewPrompts: [
      "Can this text be scanned quickly without rereading?",
      "Are case, weight, and spacing consistent with nearby components?",
      "Does secondary copy de-emphasize through color before size?",
    ],
  },
  layout: {
    impact:
      "Clear spatial rhythm helps users find relationships between elements without extra labels or borders.",
    failureMode:
      "Random spacing breaks grouping cues and makes interfaces feel accidental.",
    implementation: [
      "Anchor spacing to a single grid scale and avoid one-off values.",
      "Check proximity: related elements should be closer than unrelated ones.",
    ],
    reviewPrompts: [
      "Do grouping and spacing explain structure without additional text?",
      "Are gutters and section spacing consistent across the view?",
      "Does alignment still look right when content length changes?",
    ],
  },
  color: {
    impact:
      "Intentional color usage improves focus, preserves semantic meaning, and builds visual depth.",
    failureMode:
      "Over-saturated or misused colors compete for attention and obscure status meaning.",
    implementation: [
      "Reserve semantic colors for status states, not decoration.",
      "Use neutral structure first, then add accent color only where action is needed.",
    ],
    reviewPrompts: [
      "Is accent color limited to high-value interactions?",
      "Do hover and active states stay within the same hue family?",
      "Are borders and text contrast balanced without becoming heavy?",
    ],
  },
  components: {
    impact:
      "Predictable component behavior reduces hesitation and keeps interaction models learnable.",
    failureMode:
      "Mixed interaction patterns force users to relearn common actions on every screen.",
    implementation: [
      "Define one primary action and downgrade secondary actions appropriately.",
      "Align control type with intent (modal vs drawer, switch vs checkbox, etc.).",
    ],
    reviewPrompts: [
      "Is there a single obvious primary action?",
      "Does each control match the user's mental model for that task?",
      "Could this action be misfired or misunderstood without extra context?",
    ],
  },
  forms: {
    impact:
      "Better form patterns reduce input friction and improve completion rates.",
    failureMode:
      "Hidden requirements and ambiguous controls create errors and abandonment.",
    implementation: [
      "Expose label, format hints, and validation timing close to each field.",
      "Use control types that match selection logic (one vs many, immediate vs deferred).",
    ],
    reviewPrompts: [
      "Can users identify what each field expects before typing?",
      "Do validation messages appear at the right time and location?",
      "Are mobile interactions and hit targets comfortable?",
    ],
  },
  system: {
    impact:
      "Strong system feedback builds trust by making app state and progress predictable.",
    failureMode:
      "Missing or vague feedback leaves users unsure what happened or what to do next.",
    implementation: [
      "Pair every long-running or risky action with visible state feedback.",
      "Use recovery affordances where mistakes are likely (undo, confirmations, clear next steps).",
    ],
    reviewPrompts: [
      "Does the interface explain current status without relying on assumptions?",
      "Is there a clear recovery path when an action fails?",
      "Would this flow feel safe for irreversible actions?",
    ],
  },
};

const baseTips = [
  "Use this decision consistently across the product surface.",
  "Validate in both desktop and mobile contexts.",
  "Break the rule only when you can articulate a measurable UX gain.",
];

export function buildDeepDive(rule: Rule): DeepDiveSection[] {
  const deepDive = categoryDeepDive[rule.category] ?? defaultDeepDive;
  const relatedSignals =
    rule.tags.length > 0
      ? rule.tags.map((tag) => `${tag}: keep this pattern aligned.`)
      : ["Cross-check this decision with adjacent components."];

  return [
    {
      type: "text",
      title: "Summary",
      content: rule.desc,
    },
    {
      type: "text",
      title: "Why it matters",
      content: deepDive.impact,
    },
    {
      type: "text",
      title: "Risk when ignored",
      content: `${deepDive.failureMode} Anti-pattern example: ${rule.dont}.`,
    },
    {
      type: "list",
      title: "Implementation notes",
      items: [`Default pattern: ${rule.do}`, ...deepDive.implementation, ...baseTips],
    },
    {
      type: "list",
      title: "Design review prompts",
      items: deepDive.reviewPrompts,
    },
    {
      type: "list",
      title: "Related signals",
      items: relatedSignals,
    },
    {
      type: "code",
      title: "Recommended",
      language: "text",
      code: rule.do,
    },
    {
      type: "code",
      title: "Avoid",
      language: "text",
      code: rule.dont,
    },
  ];
}
