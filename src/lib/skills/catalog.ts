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
 * Tags, and named rules a tag cannot reach, that pull a rule filed under
 * another category into a domain skill, so a skill whose trigger covers a
 * topic also carries every rule about it.
 */
const crossListing: Record<string, { tags: Set<string>; ruleIds?: string[]; note: string }> = {
  mobile: {
    tags: new Set(),
    ruleIds: ["sys-3", "a11y-3", "motion-8", "form-14"],
    note: "These lessons cover target size, spacing, pressed feedback and field hints used throughout the phone tasks.",
  },
  typography: {
    tags: new Set(["Headings", "Readability"]),
    note: "Line measure and heading levels are filed under layout and accessibility, but they are set alongside size, leading and weight.",
  },
  layout: {
    tags: new Set(["Bidirectional text"]),
    ruleIds: ["sys-11"],
    note: "Text direction affects where names, separators and counts sit in a localized row. At narrow widths, check that the row reflows and its contents stay visible.",
  },
  accessibility: {
    tags: new Set(["Accessibility", "WCAG", "Keyboard"]),
    ruleIds: ["sys-11"],
    note: "These rules cover accessibility decisions filed under other domains. Check each rule’s conditions and exceptions before reporting a conformance failure.",
  },
  motion: {
    tags: new Set(["Motion", "Gestures"]),
    note: "These rules from other domains cover which properties a transition animates, a pause control for motion that runs on its own, and a click or tap path for every drag.",
  },
};

type DomainCopy = Pick<SkillSpec, "summary" | "description" | "lead" | "aliases">;

/**
 * Authored copy per category. A category added to `ui-logic.ts` without an
 * entry here gets no skill, and the catalog test fails until one is written.
 */
const domainCopy: Record<string, DomainCopy> = {
  mobile: {
    summary: "Phone layouts, touch input, navigation, sheets, text size and feedback.",
    description: "Use Axiom UI’s mobile guidance to fit actions above system and browser bars, handle taps, swipes and Back, preserve tab state, coordinate sheets and scrolling, keep editing controls in view, respect text size or confirm actions on iOS, Android and mobile web.",
    lead: "Start at checkout with the system bars visible. Try Pay, rotate the phone and try again. Then follow the same task with a keyboard open or text enlarged. Record the platform, available window and control that received the input.",
    aliases: ["mobile", "phone"],
  },
  typography: {
    summary: "Interface text, from labels and display headings to long passages and mixed-direction names.",
    description:
      "Use Axiom UI’s typography guidance to choose typefaces and weights by role, set line height and measure, review casing in English labels, space short uppercase Latin labels, tighten display headings without crowding letters, choose heading levels by outline, align comparable figures, preserve meaning under truncation, tune heading and paragraph wrapping, or isolate a name in mixed-direction text.",
    lead: "Start with a real string in the typeface and language that will appear on screen. A two-line heading, an amount that changes and a name beside a review count each expose a different failure. Record the text’s role and the conditions you tested before reusing its settings in other components.",
    aliases: ["typography", "type"],
  },
  layout: {
    summary: "Grouping, measure, padding, alignment, sticky headers, media space, crops and reflow.",
    description:
      "Use Axiom UI’s layout guidance when choosing a spacing scale, setting line measure and container widths, grouping fields and labels, fitting padding around controls, optically aligning glyphs, choosing cards, dividers or space as a group boundary, adapting gutters and reflowing at narrow widths, keeping anchors and focus clear of sticky headers, reserving space for images and embeds, keeping a subject in each crop, reviewing mixed-direction rows, or resolving stacking contexts.",
    lead: "Compare the distance from a field to its own label with the distance to the next field. Narrow the viewport to 320px with the longest label the product supports, then reload on a throttled connection and follow an in-page link under the sticky header.",
    aliases: ["layout", "spacing"],
  },
  color: {
    summary: "Accent and status roles, text and control contrast, hover feedback, dark themes and elevation.",
    description:
      "Use Axiom UI’s color guidance when assigning accent and status roles, checking text or control contrast, designing hover and selected states, adapting a palette to dark surfaces, compositing translucent colors, defining image edges, or choosing borders and shadows for elevation.",
    lead: "Identify what the color needs to communicate. A divider can be quiet when the rows are already distinct. If an enabled text field needs its outline to be identifiable, check for at least 3:1 contrast against the adjacent color. Measure the actual rendered pair, including the surface beneath a translucent fill.",
    aliases: ["color", "colour"],
  },
  components: {
    summary: "Action hierarchy, links and buttons, product evidence, overlays, button states and charts.",
    description:
      "Use Axiom UI’s component guidance when prioritizing actions within a task, choosing a link or a button, pairing a headline with evidence from the product, confirming deletion, nesting corners, representing people and files, choosing inline or overlay surfaces, placing errors, labeling icons, explaining disabled or pending actions, sizing card links, dismissing overlays, or providing chart summaries and accessible data.",
    lead: "Link the project name to its details page. Give Archive its own button. In a chart, identify whether readers need a trend, an exact value, or both before deciding how much information to show alongside it.",
    aliases: ["components", "comp"],
  },
  forms: {
    summary: "Field labels, input purpose, choices, validation, retaining answers after errors and sign-in codes.",
    description:
      "Use Axiom UI’s form guidance when placing labels, marking required or optional fields, sizing fields for plausible answers, declaring input type, keyboard and autocomplete, choosing radios, checkboxes, switches or selects, timing validation, keeping answers after a failed submission, writing format hints, reusing previously entered answers, confirming a submission, or testing paste and autofill for sign-in codes.",
    lead: "Follow an answer from entry through submission. Check the label, format hint, keyboard and autofill suggestions. Submit an invalid answer and check that the form explains how to correct it and retains the other entries. For a sign-in code, paste one beginning with zero and check the submitted value.",
    aliases: ["forms", "form", "inputs"],
  },
  system: {
    summary: "Loading, empty states, error recovery, return to results, hit areas, keyboard, reflow and motion.",
    description:
      "Use Axiom UI’s system guidance when designing loading and empty states, multi-step progress, recovering when part of a view fails, retry behavior, undo, optimistic updates, keeping an error and its only recovery action on screen, returning people to the result they opened, dates and times, semantic color tokens, hit areas for touch and pointer, keyboard behavior within controls, reflow at narrow widths, or which properties a transition animates.",
    lead: "Trace one action through success, delay and failure. If the interface shows a change as saved before the server replies, test a failed request. Keep later successful changes intact and leave the error and its Retry action visible until the user acts or dismisses it. Then open an item from a filtered list and press Back: the same filters and position should return.",
    aliases: ["system", "states"],
  },
  motion: {
    summary: "Timing, easing, interruption, gestures, reduced motion and browser animation performance.",
    description:
      "Use Axiom UI’s motion guidance when deciding whether to animate, choosing easing or timing, coordinating entrance and exit, anchoring popovers, handling tooltip delays, redirecting interrupted motion, supporting drag and swipe with a click or tap alternative, pausing motion that runs on its own, reducing motion, or diagnosing dropped frames. It covers CSS transitions, starting styles, the Web Animations API, property selection and will-change.",
    lead: "Choose a transition for a specific change of state and try it at the speed someone would actually use the control. Open a command palette by shortcut and start typing immediately. The first keystroke should reach the field even while the panel animates. To review a transition, play it at 10% or 25% speed in the browser's animation tools (the Animations panel in Chrome DevTools) to check its origin, path and easing, then try the interaction at full speed. Interrupt the transition, enable reduced motion and check for dropped frames.",
    aliases: ["motion", "animation"],
  },
  accessibility: {
    summary: "Keyboard focus, targets, contrast, links, headings, drag alternatives, pause controls and reflow.",
    description:
      "Use Axiom UI’s accessibility guidance to check keyboard focus, its visibility and its return when an overlay closes, target size and spacing, text and control contrast, meaning beyond color, underlined links in running text, heading levels, a click path for every drag, pausing content that moves on its own, field labels and input purpose, accessible authentication, chart alternatives, modal dismissal, reflow at 320 CSS pixels and reduced motion. Consult the sources on the linked rule page when checking a conformance claim.",
    lead: "Follow a task with the input method or presentation the rule addresses. Close a dialog with Escape and note where focus lands, reorder a list without dragging, paste a sign-in code from the clipboard, or zoom a viewport 1280 CSS pixels wide to 400% and complete the task without scrolling the page sideways. A wide table or map may scroll within its own region. For a WCAG finding, identify the applicable success criterion, its level and exceptions, and record what happened on the tested path.",
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
  const named = new Set(listing.ruleIds ?? []);
  return rules
    .filter(
      (rule) =>
        rule.category !== categoryId && (named.has(rule.id) || rule.tags.some((tag) => listing.tags.has(tag)))
    )
    .map((rule) => rule.id);
}

const coreSkills: SkillSpec[] = [
  {
    name: "axiomui",
    group: "core",
    title: "Axiom UI rules",
    summary: "Every Axiom UI rule, indexed by domain, with full reasoning one file away.",
    description:
      "Axiom UI's library of {{ruleCount}} UI design rules, each with a Do/Don’t pair, a canonical URL, and full reasoning. Use these rules to choose between UI treatments or find values for type, spacing, color, contrast or motion. They also cover components, forms, states and accessibility. Use this skill when a request names Axiom UI or a rule ID such as typo-1 or motion-12. To change an existing interface, use axiomui-website-upgrade only if it is installed; otherwise apply the rules here. For a review without edits, use axiomui-audit only if it is installed; otherwise review with this library.",
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
    summary: "A step-by-step guide to improving an existing interface in code using Axiom UI rules.",
    description:
      "Use Axiom UI’s rules to improve an existing website, dashboard or design system in code. Choose this skill to improve a generic page, fix a cramped layout, clarify forms and states, or improve hierarchy, typography, spacing, components, accessibility, responsive behavior or motion. Use it when a review should end in code changes. For a review without edits, use axiomui-audit only if it is installed; otherwise review with the included rules. For values while building new UI, use axiomui only if it is installed; otherwise consult the included rule library.",
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
      "Reviews an existing interface against Axiom UI's {{ruleCount}} UI design rules and reports prioritized findings, each tied to a rule ID, a location, and a concrete fix, without editing code. Use when asked to review, audit, critique, or grade a page, component, pull request diff, screenshot, or design system for visual quality, consistency, usability, or accessibility; when preparing a pre-ship design QA pass; or when a review must cite specific, checkable rules instead of opinions. For code changes, use axiomui-website-upgrade only if it is installed; otherwise provide the report for a separate implementation task.",
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
      "2d9777f87eed3ecfa55b7f5b6ac35604729a7ab56463927cec29c037b5a0d312",
    ],
  },
];
