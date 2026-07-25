import { ruleDeepDives } from "@/data/deep-dives";
import type { DeepDiveSection, Rule } from "@/data/ui-logic";

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
  motion: {
    impact:
      "Good motion explains state, gives feedback, and preserves orientation while making the product feel faster instead of heavier.",
    failureMode:
      "Unscoped motion creates lag, jank, accessibility problems, and repeated interactions that feel disconnected from the user's intent.",
    implementation: [
      "Decide whether the interaction should animate based on frequency before choosing timing or easing.",
      "Use custom easing tokens: strong ease-out for entry, ease-in-out for movement, linear for constant progress.",
      "Animate transform and opacity first, gate hover motion to fine pointers, and preserve a reduced-motion path.",
      "Test repeated triggers, keyboard paths, mobile gestures, and slow-motion playback before shipping.",
    ],
    reviewPrompts: [
      "Will users see this animation dozens of times per day?",
      "Does the first frame respond immediately to the user's action?",
      "Are easing, duration, origin, and exit timing matched to the component's job?",
      "Does the interaction stay smooth under load and respectful under reduced motion?",
    ],
  },
  accessibility: {
    impact:
      "Accessible design widens your audience and ensures no user is blocked by physical, cognitive, or situational limitations.",
    failureMode:
      "Inaccessible interfaces exclude users, invite legal risk, and signal that inclusivity is an afterthought.",
    implementation: [
      "Test every interactive element with keyboard-only navigation before shipping.",
      "Run automated contrast checks and screen-reader audits as part of the design review.",
    ],
    reviewPrompts: [
      "Can a keyboard-only user complete this flow without a mouse?",
      "Does meaning survive when color is removed (greyscale test)?",
      "Are touch targets large enough and spaced well for motor-impaired users?",
    ],
  },
};

export function buildDeepDive(rule: Rule): DeepDiveSection[] {
  const deepDive = categoryDeepDive[rule.category] ?? defaultDeepDive;
  const override = ruleDeepDives[rule.id];

  return [
    {
      type: "text",
      title: "Summary",
      content: rule.desc,
    },
    {
      type: "text",
      title: "Why it matters",
      content: override?.whyItMatters ?? deepDive.impact,
    },
    {
      type: "text",
      title: "Risk when ignored",
      content:
        override?.riskWhenIgnored ??
        `${deepDive.failureMode} Anti-pattern example: ${rule.dont}.`,
    },
    {
      type: "list",
      title: "Implementation notes",
      items: override?.implementationNotes ?? buildImplementationNotes(rule, deepDive),
    },
    {
      type: "list",
      title: "Design review prompts",
      items: override?.reviewPrompts ?? deepDive.reviewPrompts,
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

function buildImplementationNotes(rule: Rule, deepDive: CategoryDeepDive): string[] {
  const primaryInstruction =
    rule.id === "typo-1"
      ? `Use sentence case for labels people read as phrases: "${rule.do}".`
      : `Prefer "${rule.do}" when this pattern appears in product UI.`;

  return [
    primaryInstruction,
    `Check nearby examples for the opposite pattern: "${rule.dont}" should feel intentionally avoided, not casually mixed in.`,
    ...deepDive.implementation,
  ];
}
