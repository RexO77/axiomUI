import { categories, rules, type Rule } from "@/data/ui-logic";
import { siteConfig } from "@/lib/site";

/**
 * The agent skills Axiom UI ships: names, triggers, summaries and which rules each
 * one bundles. The generator (`render.ts`), the npm CLI's `catalog.json` and the
 * site's install modal all read this list, so a skill cannot be described one
 * way on the site and shipped another way.
 *
 * Client-safe on purpose: it imports only `ui-logic` and `site`, never
 * `deep-dives`, so the modal can list skills without pulling the prose in.
 */

export type SkillGroup = "core" | "domain";
export type SkillTemplate = "axiomui" | "axiomui-website-upgrade" | "axiomui-audit" | "domain";

export type SkillSpec = {
  name: string;
  group: SkillGroup;
  title: string;
  /** At most 100 characters, sentence case. Shown in the modal and `axiomui list`. */
  summary: string;
  /** The trigger agents match against. `{{ruleCount}}` is the only placeholder allowed. */
  description: string;
  /** Short names the CLI accepts in place of `name`. The first is the one the docs show. */
  aliases: string[];
  template: SkillTemplate;
  /** Domain skills only: the category the skill is built from. */
  categoryId: string | null;
  /** Domain skills only: the opening paragraph of SKILL.md. */
  lead: string | null;
  /** Rules this skill is home to, in data order. Core skills are home to none. */
  homeRuleIds: string[];
  /** Rules from other categories that a domain skill also carries. */
  crossListedRuleIds: string[];
  /** Why the cross-listed rules belong here. Null when there are none. */
  crossListedNote: string | null;
};

export const skillAuthor = "Nischal Skanda";
export const skillsRepo = "RexO77/axiomUI";
export const skillsRepoUrl = `https://github.com/${skillsRepo}`;
export const skillsTreeUrl = `${skillsRepoUrl}/tree/main/skills`;
export const skillsCliCommand = `npx skills add ${skillsRepo}`;

/** Words the CLI accepts in place of skill names. Aliases must not collide with these. */
export const skillGroupWords = ["core", "domains", "all"] as const;

/**
 * Tags that pull a rule filed under another category into a domain skill, so
 * a skill whose trigger covers a topic also carries every rule about it.
 */
const crossListing: Record<string, { tags: Set<string>; note: string }> = {
  accessibility: {
    tags: new Set(["Accessibility", "WCAG", "Keyboard"]),
    note: "These rules are filed under other domains but decide accessibility outcomes. Hold them to the same floor.",
  },
  motion: {
    tags: new Set(["Motion"]),
    note: "These rules are filed under other domains but decide what a transition costs. Apply them to every animation.",
  },
};

type DomainCopy = Pick<SkillSpec, "summary" | "description" | "lead" | "aliases">;

/**
 * Authored copy per category. A category added to `ui-logic.ts` without an
 * entry here gets no skill, and the catalog test fails until one is written.
 */
const domainCopy: Record<string, DomainCopy> = {
  typography: {
    summary: "Casing, tracking, line height, weights, figures and wrapping for interface text.",
    description:
      "Axiom UI's typography rules for interface text, with Do/Don't values and reasoning. Use when choosing or limiting fonts and weights, setting body or heading line-height, adding tracking to uppercase labels, applying sentence case to buttons and headings, de-emphasizing secondary text, aligning numbers with tabular figures, setting a minimum body size, balancing headings, wrapping or truncating text, or reviewing UI code for typography problems.",
    lead: "Interface text is scanned in fragments: a button, a label, a number in a table, a heading over a card. These rules fix casing, tracking, line height, weight, figures and wrapping so each fragment reads correctly on the first pass. Set every value once, as a token or a shared utility, and apply it everywhere. A typography fix made on one screen is next month's inconsistency.",
    aliases: ["typography", "type"],
  },
  layout: {
    summary: "Spacing scale, measure, proximity, optical alignment, gutters and z-index.",
    description:
      "Axiom UI's layout and spacing rules, with Do/Don't values and reasoning. Use when choosing a spacing scale or 4pt grid, setting text measure and container widths, grouping elements by proximity, sizing button padding, optically centering icons and content, deciding whether a section needs a card, keeping gutters consistent, scaling spacing across breakpoints, keeping vertical rhythm, defining a z-index scale, or reviewing a layout that feels cramped, loose, or misaligned.",
    lead: "Spacing carries meaning. Distance tells the reader what belongs together, measure sets how comfortably a paragraph reads, and alignment tells the eye what is related. These rules fix the scale, the gaps and the stacking order so structure comes from whitespace first, and from borders, cards and backgrounds only when whitespace cannot do the job.",
    aliases: ["layout", "spacing"],
  },
  color: {
    summary: "Palette balance, contrast, semantic status, hover, dark mode and depth.",
    description:
      "Axiom UI's color and depth rules, with Do/Don't values and reasoning. Use when building a palette or applying the 60-30-10 balance, picking text and border colors, checking WCAG contrast, mapping semantic status colors, designing hover states, deriving a dark mode, tinting shadows, choosing between shadows and borders, outlining images, or reviewing UI that looks harsh, muddy, flat, or low contrast.",
    lead: "Color is a budget. Spend it on meaning and on the next action, and let neutral structure carry everything else. These rules set palette balance, contrast floors with their ratios, status semantics, hover behavior, dark mode and depth. Measure contrast instead of judging it by eye, and derive states from the base color instead of hand-picking new ones.",
    aliases: ["color", "colour"],
  },
  components: {
    summary: "Button hierarchy, overlays, radii, icon buttons, disabled and loading states.",
    description:
      "Axiom UI's component and action rules, with Do/Don't values and reasoning. Use when setting button hierarchy or styling destructive actions, choosing between a modal and a drawer or a toast and an inline error, computing nested border radii, labeling icon buttons, explaining disabled states, adding loading states to buttons, sizing icons consistently, making whole cards clickable, adding close affordances to overlays, or reviewing component code for interaction consistency.",
    lead: "Components teach the interaction model, and every screen that breaks the pattern makes the user relearn it. These rules decide which action leads, which container an interruption belongs in, how a control explains itself when it is disabled or busy, and how geometry such as nested radii, icon size and hit area stays consistent. Fix the shared primitive, not the one instance you happened to see.",
    aliases: ["components", "comp"],
  },
  forms: {
    summary: "Labels, field sizing, control choice, validation timing, hints and defaults.",
    description:
      "Axiom UI's form and input rules, with Do/Don't values and reasoning. Use when building or reviewing forms; placing labels, marking optional fields, sizing inputs to their expected content, choosing between checkboxes, radios, switches, and dropdowns, timing validation, writing format hints, picking smart defaults, laying out single-column forms, or confirming a successful submission.",
    lead: "Every field is a question that costs the user effort. These rules keep labels visible while typing, size inputs to the answer they expect, match the control to the shape of the choice, and time validation so an error helps the user instead of interrupting them. Then they close the loop with a visible success state.",
    aliases: ["forms", "form", "inputs"],
  },
  system: {
    summary: "Loading, empty and error states, undo, optimistic updates, tokens and breakpoints.",
    description:
      "Axiom UI's rules for system feedback and product logic, with Do/Don't values and reasoning. Use when designing loading skeletons, empty states, progress for multi-step flows, undo for destructive actions, optimistic updates, or graceful degradation when a request or an image fails, or when settling date formats, design token naming, or a breakpoint strategy.",
    lead: "System rules govern what the interface does between the user's actions: while it loads, when there is nothing to show, when a request fails, and after a mistake. They also cover the plumbing that keeps behavior predictable across a product, such as token naming, breakpoints, date formats, target sizes and the scope of transitions. Design every state as part of the feature, not as cleanup after it.",
    aliases: ["system", "states"],
  },
  motion: {
    summary: "Exact durations, easing and gesture physics for UI motion.",
    description:
      "Axiom UI's motion and interaction rules, with exact durations, easing curves, and reasoning. Use when adding, tuning, or reviewing UI animation; deciding whether something should animate at all, choosing easing and duration, building enter and exit transitions, press feedback, popovers and tooltips, interruptible transitions, gesture and drag physics, reduced-motion fallbacks, or staggering, or fixing motion that feels slow, janky, or decorative. Covers CSS transitions and which properties to transition, @starting-style, WAAPI, will-change, and transform and opacity performance.",
    lead: "Motion is feedback and orientation, never decoration. Decide first whether an interaction should animate at all, based on how often it happens and how it was triggered. Only then choose duration, easing, origin and exit timing. The values below are exact. Use them as written unless the project already defines motion tokens, and keep every animation interruptible, cheap to render and meaningful under reduced motion.",
    aliases: ["motion", "animation"],
  },
  accessibility: {
    summary: "Focus, contrast, target size, keyboard paths, labels and reduced motion.",
    description:
      "Axiom UI's accessibility rules plus the related rules from other domains, with Do/Don't values and reasoning. Use when checking focus-visible indicators, color-independent status signals, touch target size and spacing, contrast for text and borders, keyboard navigation and instant keyboard actions, labels instead of placeholders, overlay close affordances, or reduced-motion behavior, and when reviewing UI for WCAG issues.",
    lead: "Accessibility is not a separate layer added at the end. It is the same interface held to a floor you can measure. This skill gathers Axiom UI's accessibility rules together with the related rules from color, components, forms, system and motion, so one pass covers focus, contrast, target size, keyboard paths, labels and reduced motion. Verify with a keyboard and a contrast checker, not by reading the code.",
    aliases: ["accessibility", "a11y"],
  },
};

function ruleIdsInCategory(categoryId: string): string[] {
  return rules.filter((rule) => rule.category === categoryId).map((rule) => rule.id);
}

function crossListedFor(categoryId: string): string[] {
  const listing = crossListing[categoryId];
  if (!listing) {
    return [];
  }
  return rules
    .filter((rule) => rule.category !== categoryId && rule.tags.some((tag) => listing.tags.has(tag)))
    .map((rule) => rule.id);
}

const coreSkills: SkillSpec[] = [
  {
    name: "axiomui",
    group: "core",
    title: "Axiom UI rules",
    summary: "Every Axiom UI rule, indexed by domain, with full reasoning one file away.",
    description:
      "Axiom UI's library of {{ruleCount}} UI design rules, each with a Do/Don't pair, a canonical URL, and full reasoning. Use when building new interface code and a concrete, citable value is needed for type, spacing, color and contrast, buttons and overlays, form fields and validation, loading and empty states, animation timing and easing, or accessibility; when the user mentions Axiom UI or cites a rule id such as typo-1 or motion-12; or when two UI treatments are on the table and the choice should rest on an established rule rather than taste. To change an existing interface, use axiomui-website-upgrade only if it is installed; otherwise apply the rules here. For a review without edits, use axiomui-audit only if it is installed; otherwise review with this library.",
    aliases: ["rules", "router"],
    template: "axiomui",
    categoryId: null,
    lead: null,
    homeRuleIds: [],
    crossListedRuleIds: [],
    crossListedNote: null,
  },
  {
    name: "axiomui-website-upgrade",
    group: "core",
    title: "Website upgrade playbook",
    summary: "A playbook for upgrading a real interface in code, backed by every Axiom UI rule.",
    description:
      "Changes an existing website, landing page, dashboard, SaaS product, or design system in code, using Axiom UI's rules as the standard. Use when an existing interface feels cluttered, flat, inconsistent, cramped, visually misaligned, unresponsive, hard to scan, or insufficiently polished; when asked to refine, fix, or polish its hierarchy, typography, spacing, components, forms, states, accessibility, responsive behavior, or motion; or when a critique should end in implemented changes. For a review without edits, use axiomui-audit only if it is installed; otherwise review with the included rules. For values while building new UI, use axiomui only if it is installed; otherwise consult the included rule library.",
    aliases: ["upgrade", "playbook"],
    template: "axiomui-website-upgrade",
    categoryId: null,
    lead: null,
    homeRuleIds: [],
    crossListedRuleIds: [],
    crossListedNote: null,
  },
  {
    name: "axiomui-audit",
    group: "core",
    title: "Design audit",
    summary: "A read-only design review where every finding cites a rule, a location and a fix.",
    description:
      "Reviews an existing interface against Axiom UI's {{ruleCount}} UI design rules and reports prioritized findings, each tied to a rule id, a location, and a concrete fix, without editing code. Use when asked to review, audit, critique, or grade a page, component, pull request diff, screenshot, or design system for visual quality, consistency, usability, or accessibility; when preparing a pre-ship design QA pass; or when a review must cite specific, checkable rules instead of opinions. For code changes, use axiomui-website-upgrade only if it is installed; otherwise provide the report for a separate implementation task.",
    aliases: ["audit", "review"],
    template: "axiomui-audit",
    categoryId: null,
    lead: null,
    homeRuleIds: [],
    crossListedRuleIds: [],
    crossListedNote: null,
  },
];

const domainSkills: SkillSpec[] = categories.flatMap((category) => {
  const copy = domainCopy[category.id];
  if (!copy) {
    return [];
  }
  return [
    {
      name: `axiomui-${category.id}`,
      group: "domain" as const,
      title: category.name,
      ...copy,
      template: "domain" as const,
      categoryId: category.id,
      homeRuleIds: ruleIdsInCategory(category.id),
      crossListedRuleIds: crossListedFor(category.id),
      crossListedNote: crossListing[category.id]?.note ?? null,
    },
  ];
});

/** Every skill, core first, then one per category in data order. */
export const skillCatalog: SkillSpec[] = [...coreSkills, ...domainSkills];

/** Categories with no authored domain copy. The catalog test asserts this is empty. */
export const categoriesWithoutSkill = categories
  .filter((category) => !domainCopy[category.id])
  .map((category) => category.id);

export function findSkill(name: string): SkillSpec | undefined {
  return skillCatalog.find((skill) => skill.name === name);
}

/** The description with its one allowed placeholder expanded. */
export function skillDescription(skill: SkillSpec): string {
  return skill.description.replaceAll("{{ruleCount}}", String(rules.length));
}

/** Every rule a skill carries: all of them for core skills, home plus cross-listed for a domain. */
export function skillRules(skill: SkillSpec): Rule[] {
  if (skill.group === "core") {
    return rules;
  }
  const ids = new Set([...skill.homeRuleIds, ...skill.crossListedRuleIds]);
  return rules.filter((rule) => ids.has(rule.id));
}

/** The available GitHub install command for one canonical skill. */
export function skillInstallCommand(skill: SkillSpec): string {
  return `${skillsCliCommand} --skill ${skill.name}`;
}

export function ruleUrl(ruleId: string): string {
  return `${siteConfig.origin}/rules/${ruleId}`;
}

/**
 * Skills that were distributed under another name. The hashes identify
 * unedited copies of the old site download, so the CLI can offer to replace a
 * pristine one and never touches an edited one.
 */
export const legacySkills = [
  {
    name: "axiom-website-upgrade",
    replacedBy: "axiomui-website-upgrade",
    // Recognize pristine legacy downloads from earlier distributed checkpoints.
    sha256: [
      "2fb82553a092d07b3d28d930cfed30df0b50f87221ee2e703a5bd05cced0fa29",
      "2dc29a20cfd89ea3c60640d20f03184645c3397d921f93a755caed673b1519c3",
      "7e0a18d842c987621aa8f0e4e250217f5fcf0e2806b09d75b49cec571feb9bac",
    ],
  },
];
