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
  typography: {
    tags: new Set(["Headings", "Readability"]),
    note: "Line measure and heading levels are filed under layout and accessibility, but they are set alongside size, leading and weight.",
  },
  layout: {
    tags: new Set(["Bidirectional text"]),
    ruleIds: ["sys-11"],
    note: "Text direction affects where names, separators and counts sit in a localized row. Reflow at narrow widths decides where the layout recomposes.",
  },
  accessibility: {
    tags: new Set(["Accessibility", "WCAG", "Keyboard"]),
    ruleIds: ["sys-11"],
    note: "These rules cover specific accessibility decisions in other domains. Check the conditions and exceptions in each rule before making a conformance finding.",
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
  typography: {
    summary: "Interface text, from labels and display headings to long passages and mixed-direction names.",
    description:
      "Use Axiom UI’s typography guidance to choose typefaces and weights by role, set line height and measure, review casing in English labels, space short uppercase Latin labels, tighten display headings without crowding letters, choose heading levels by outline, align comparable figures, preserve meaning under truncation, tune heading and paragraph wrapping, or isolate a name in mixed-direction text.",
    lead: "Start with a real string in the typeface and language that will appear on screen. A two-line heading, an amount that changes and a name beside a review count each expose a different failure. Record the role and the conditions you tested before sharing its type settings across components.",
    aliases: ["typography", "type"],
  },
  layout: {
    summary: "Grouping, measure, padding, alignment, sticky headers, media space, crops and reflow.",
    description:
      "Use Axiom UI’s layout guidance when choosing a spacing scale, setting line measure and container widths, grouping fields and labels, fitting padding around controls, optically aligning glyphs, choosing cards, dividers or space as a group boundary, adapting gutters and reflowing at narrow widths, keeping anchors and focus clear of sticky headers, reserving space for images and embeds, keeping a subject in each crop, reviewing mixed-direction rows, or resolving stacking contexts.",
    lead: "Compare the distance from a field to its own label with the distance to the next field. Narrow the viewport to 320px with the longest label the product supports, then reload on a throttled connection and follow an in-page link under the sticky header. Those checks reveal whether spacing communicates relationships, whether the layout still fits, and whether media and fixed bars push content out of view.",
    aliases: ["layout", "spacing"],
  },
  color: {
    summary: "Accent and status roles, text and control contrast, hover feedback, dark themes and elevation.",
    description:
      "Use Axiom UI’s color guidance when assigning accent and status roles, checking text or control contrast, designing hover and selected states, adapting a palette to dark surfaces, compositing translucent colors, defining image edges, or choosing borders and shadows for elevation.",
    lead: "Identify what the color needs to communicate. A divider can be quiet when the rows are already distinct. An outline that identifies the only visible text field needs enough contrast against its surroundings. Measure the actual rendered pair, including the surface beneath a translucent fill.",
    aliases: ["color", "colour"],
  },
  components: {
    summary: "Action hierarchy, links and buttons, product evidence, overlays, button states and charts.",
    description:
      "Use Axiom UI’s component guidance when prioritizing actions within a task, choosing a link or a button, pairing a headline with evidence from the product, confirming deletion, nesting corners, representing people and files, choosing inline or overlay surfaces, placing errors, labeling icons, explaining disabled or pending actions, sizing card links, dismissing overlays, or providing chart summaries and accessible data.",
    lead: "Judge the component in the task that contains it. A project card might open details, a link to another URL, and also offer an independent Archive action, a button. Give each a distinct target. In a chart, identify whether readers need a trend, an exact value, or both before deciding how much information to show alongside it.",
    aliases: ["components", "comp"],
  },
  forms: {
    summary: "Labels, input purpose, choice controls, validation, kept answers, submission and sign-in codes.",
    description:
      "Use Axiom UI’s form guidance when placing labels, marking required or optional fields, sizing fields for plausible answers, declaring input type, keyboard and autocomplete, choosing radios, checkboxes, switches or selects, timing validation, keeping answers after a failed submission, writing format hints, reusing previously entered answers, confirming a submission, or testing paste and autofill for sign-in codes.",
    lead: "Follow an answer from entry through submission. Check which keyboard and autofill the field offers, where its label and format are explained, when the user has enough information to correct it, and whether every answer survives a rejected submission and the next step. A pasted sign-in code beginning with zero is one useful test of the entire path.",
    aliases: ["forms", "form", "inputs"],
  },
  system: {
    summary: "Loading, empty and error states, recovery, back to results, targets, keyboard, reflow, transitions.",
    description:
      "Use Axiom UI’s system guidance when designing loading and empty states, multi-step progress, timeout and retry behavior, undo, optimistic updates, keeping an error and its only recovery action on screen, returning people to the result they opened, dates and times, semantic color tokens, hit areas for touch and pointer, keyboard behavior within controls, reflow at narrow widths, or which properties a transition animates.",
    lead: "Trace one action through success, delay and failure. If a saved state appears before the server replies, decide what the reader sees when the request fails or another change has already succeeded, and keep the failure and its Retry on screen until someone acts. Then open an item from a filtered list and press Back: the same filters and position should return.",
    aliases: ["system", "states"],
  },
  motion: {
    summary: "Timing, easing, interruption, gestures, reduced motion and browser animation performance.",
    description:
      "Use Axiom UI’s motion guidance when deciding whether to animate, choosing easing or timing, coordinating entrance and exit, anchoring popovers, handling tooltip delays, redirecting interrupted motion, supporting drag and swipe with a click or tap alternative, pausing motion that runs on its own, reducing motion, or diagnosing dropped frames. It covers CSS transitions, starting styles, the Web Animations API, property selection and will-change.",
    lead: "Choose a transition for a specific change of state and try it at the speed someone would actually use the control. A repeated shortcut can keep its content ready immediately. A panel can use motion to explain where it came from. To review a transition, play it at 10% or 25% speed in the browser's animation tools (the Animations panel in Chrome DevTools) to check its origin, path and easing, then judge it again at full speed, where timing is felt. Then test interruption, reduced motion and actual frame delivery.",
    aliases: ["motion", "animation"],
  },
  accessibility: {
    summary: "Focus and its return, targets, contrast, links, headings, drag alternatives, pausing and reflow.",
    description:
      "Use Axiom UI’s accessibility guidance to check keyboard focus, its visibility and its return when an overlay closes, target size and spacing, text and control contrast, meaning beyond color, underlined links in running text, heading levels, a click path for every drag, pausing content that moves on its own, field labels and input purpose, accessible authentication, chart alternatives, modal dismissal, reflow at 320 CSS px and reduced motion. Consult the sources on the linked rule page when checking a conformance claim.",
    lead: "Follow a task with the input method or presentation the rule addresses. Close a dialog with Escape and note where focus lands, reorder a list without dragging, paste a sign-in code from the clipboard, or zoom to 400% at 1280px wide and check that nothing scrolls sideways. For a WCAG finding, identify the applicable success criterion, its level and exceptions, and record what happened on the tested path.",
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
      "Changes an existing website, landing page, dashboard, SaaS product, or design system in code, using Axiom UI's rules as the standard. Use when an existing interface feels sloppy, generic, cluttered, flat, inconsistent, cramped, visually misaligned, unresponsive, hard to scan, or insufficiently polished; when asked to make a site look better, or to refine, fix, or polish its hierarchy, typography, spacing, components, forms, states, accessibility, responsive behavior, or motion; or when a critique should end in implemented changes. For a review without edits, use axiomui-audit only if it is installed; otherwise review with the included rules. For values while building new UI, use axiomui only if it is installed; otherwise consult the included rule library.",
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
