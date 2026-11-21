// design-system: strict
//
// How the shell groups and orders the catalog.
//
// This is a VIEW over `ui-logic.ts`. Rule ids and their `category` field never
// change here: the skills, `llms.txt` and a rule page's metadata keywords keep
// reading the original eight categories. The rail, the gallery sections, the
// sidebar, the palette and the rule view read this module, and so do a rule
// page's breadcrumb and structured data and its social card's eyebrow, so
// what a crawler and a share read matches what the page shows.

import { categories, rules, type Rule } from "@/data/ui-logic";

/** Rail, sidebar and palette label for every source category. Full names stay as sheet titles. */
export const categoryShort: Readonly<Record<string, string>> = {
  typography: "Typography",
  layout: "Layout",
  color: "Color",
  components: "Components",
  forms: "Forms",
  system: "System",
  motion: "Motion",
  accessibility: "Accessibility",
};

/**
 * Accessibility is a collection, not a rail category: its rules are drawn from
 * every category, so the three that only it owned are re-homed for the rail. Their ids, URLs and
 * `rule.category` are unchanged.
 */
export const railHome: Readonly<Record<string, string>> = {
  "a11y-1": "system",
  "a11y-3": "system",
  "a11y-2": "color",
  "a11y-4": "motion",
  "a11y-5": "typography",
  "a11y-6": "motion",
  "a11y-7": "color",
  "a11y-8": "components",
};

/** The seven rail categories, in rail order. */
export const railCategoryIds = [
  "typography",
  "layout",
  "color",
  "components",
  "forms",
  "system",
  "motion",
] as const;

export type RailCategoryId = (typeof railCategoryIds)[number];

export type RuleGroup = {
  /** Section header inside the category; null when the category has no sub-groups. */
  label: string | null;
  ruleIds: readonly string[];
};

/**
 * Sub-groups (section headers only, never routes) and learning order per rail
 * category. Each sequence doubles as the order the category is read in: the
 * foundations a later rule builds on come first.
 *
 * The re-homed a11y rules sit beside the rule they extend: a11y-3 after
 * sys-3, a11y-1 after sys-8, a11y-2 and a11y-7 after color-4, a11y-5 after
 * typo-9, a11y-8 after comp-12, a11y-6 after motion-17, a11y-4 after motion-18.
 */
const groupsByCategory: Record<RailCategoryId, RuleGroup[]> = {
  typography: [
    { label: "Type foundations", ruleIds: [...ids("typo", 5, 9), "a11y-5", ...ids("typo", 11, 6, 1, 2)] },
    { label: "Reading and wrapping", ruleIds: ids("typo", 3, 4, 15, 8, 14, 7, 10, 12, 13) },
  ],
  layout: [{ label: null, ruleIds: ids("layout", 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14) }],
  color: [
    {
      label: null,
      ruleIds: [
        ...ids("color", 1, 4),
        "a11y-2",
        "a11y-7",
        ...ids("color", 6, 7, 8, 9, 10, 11, 12),
      ],
    },
  ],
  components: [
    {
      label: null,
      ruleIds: [...ids("comp", 1, 15, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 12), "a11y-8", "comp-13"],
    },
  ],
  forms: [{ label: null, ruleIds: ids("form", 1, 2, 3, 4, 14, 5, 6, 7, 8, 15, 9, 10, 11, 12, 13) }],
  system: [
    { label: "State, progress and recovery", ruleIds: ids("sys", 2, 1, 7, 15, 4, 9, 10, 16, 6) },
    {
      label: "Interaction infrastructure",
      ruleIds: ["sys-5", "sys-11", "sys-3", "a11y-3", "sys-8", "a11y-1", "sys-13"],
    },
  ],
  motion: [
    { label: "Intent and input preferences", ruleIds: [...ids("motion", 3, 1, 2, 17), "a11y-6", "motion-16"] },
    { label: "Timing and feedback", ruleIds: ids("motion", 6, 4, 8, 11) },
    {
      label: "Entrances, exits and continuity",
      ruleIds: ids("motion", 29, 9, 10, 7, 24, 28),
    },
    { label: "Animation implementation", ruleIds: ids("motion", 14, 12, 13, 15, 21) },
    { label: "Direct manipulation", ruleIds: [...ids("motion", 18), "a11y-4", ...ids("motion", 19, 20)] },
  ],
};

function ids(prefix: string, ...numbers: number[]): string[] {
  return numbers.map((n) => `${prefix}-${n}`);
}

const ruleById = new Map(rules.map((rule) => [rule.id, rule]));
const categoryName = new Map(categories.map((category) => [category.id, category.name]));

function lookup(id: string): Rule {
  const rule = ruleById.get(id);
  if (!rule) {
    throw new Error(`taxonomy: unknown rule id "${id}"`);
  }
  return rule;
}

export type RailCategory = {
  id: RailCategoryId;
  /** Full name, for sheet titles ("Typography & text"). */
  name: string;
  /** Rail, sidebar and palette label ("Typography"). */
  short: string;
  groups: readonly { label: string | null; rules: readonly Rule[] }[];
  /** Every rule in the category, in learning order. */
  rules: readonly Rule[];
};

/** The rail's seven categories, each with its rules in learning order. */
export const railCategories: readonly RailCategory[] = railCategoryIds.map((id) => {
  const groups = groupsByCategory[id].map((group) => ({
    label: group.label,
    rules: group.ruleIds.map(lookup),
  }));
  return {
    id,
    name: categoryName.get(id) ?? id,
    short: categoryShort[id],
    groups,
    rules: groups.flatMap((group) => group.rules),
  };
});

/** All catalog rules in rail order: categories in rail order, each in learning order. */
export const railOrder: readonly Rule[] = railCategories.flatMap((category) => category.rules);

const railIndex = new Map(railOrder.map((rule, index) => [rule.id, index]));
const railCategoryByRule = new Map(
  railCategories.flatMap((category) => category.rules.map((rule) => [rule.id, category] as const)),
);

/** The rail category a rule is shown under (its own category, unless re-homed). */
export function railCategoryOf(ruleOrId: Rule | string): RailCategoryId {
  const id = typeof ruleOrId === "string" ? ruleOrId : ruleOrId.id;
  const category = railCategoryByRule.get(id);
  if (!category) {
    throw new Error(`taxonomy: unknown rule id "${id}"`);
  }
  return category.id;
}

/** The rail category's data, by id. */
export function railCategory(id: RailCategoryId): RailCategory {
  return railCategories.find((category) => category.id === id)!;
}

/** Position in rail order (0-based), for stable sorting. -1 for an unknown id. */
export function railRank(id: string): number {
  return railIndex.get(id) ?? -1;
}

/**
 * Where a rule sits inside its rail category: 1-based `index` of `total`, and
 * its neighbours within that category, null at either end. This is position
 * inside one category only; paging across categories (J/K, the pager) reads
 * the deck in src/lib/navigation/deck.ts.
 */
export function railPosition(id: string): {
  category: RailCategoryId;
  index: number;
  total: number;
  prev: Rule | null;
  next: Rule | null;
} {
  const category = railCategoryByRule.get(id);
  if (!category) {
    throw new Error(`taxonomy: unknown rule id "${id}"`);
  }
  const at = category.rules.findIndex((rule) => rule.id === id);
  return {
    category: category.id,
    index: at + 1,
    total: category.rules.length,
    prev: category.rules[at - 1] ?? null,
    next: category.rules[at + 1] ?? null,
  };
}

// ── Collections ──────────────────────────────────────────────────────

export type Collection = {
  id: string;
  name: string;
  groups: readonly RuleGroup[];
  ruleIds: readonly string[];
};

function collection(id: string, name: string, groups: RuleGroup[]): Collection {
  for (const group of groups) {
    group.ruleIds.forEach(lookup);
  }
  return { id, name, groups, ruleIds: groups.flatMap((group) => group.ruleIds) };
}

/**
 * The rules in the accessibility review, drawn from every category and
 * grouped by what the review checks.
 */
export const accessibilityCollection = collection("accessibility", "Accessibility", [
  { label: "Keyboard and focus", ruleIds: ["a11y-1", "sys-8", "comp-12", "a11y-8", "layout-12", "a11y-4"] },
  {
    label: "Reading visual information",
    ruleIds: ["color-9", "color-6", "typo-6", "typo-11", "a11y-2", "a11y-7", "a11y-5", "comp-13"],
  },
  { label: "Labels and input assistance", ruleIds: ["form-2", "comp-7", "comp-8", "form-14", "form-13"] },
  { label: "Targets, timing and motion", ruleIds: ["sys-3", "a11y-3", "motion-17", "a11y-6", "sys-16"] },
]);

/** These three comparisons operate on text or data rather than timed tracks. */
export const workedExampleIds: readonly string[] = ["typo-14", "comp-13", "form-13"];
export const liveDemoCollection = collection("live", "Live demos", [
  {
    label: null,
    ruleIds: [...rules.filter((rule) => rule.category === "motion").map((rule) => rule.id), "color-7", "comp-9", "sys-1", "sys-9", ...workedExampleIds],
  },
]);

export const collections: readonly Collection[] = [accessibilityCollection, liveDemoCollection];

const liveDemoIds = new Set(liveDemoCollection.ruleIds);

/** True when the rule's comparison is interactive. */
export function hasLiveDemo(id: string): boolean {
  return liveDemoIds.has(id);
}

// ── Compare ──────────────────────────────────────────────────────────

export type CompareKind = "aligned" | "structural";

/**
 * Each rule's comparison, classified by reading its previews and demos. "aligned": Do and Don't
 * are the same vignette with one property changed, so the elements sit in the
 * same place and Flip works as a blink comparator. "structural": the panes
 * differ in composition (a different component, elements added or removed),
 * so Flip would only jump between two layouts.
 *
 * Live-demo rules are classified by their showcase scenes; Stage never offers
 * Flip on them (see `suggestsFlip`).
 */
export const structuralRuleIds: ReadonlySet<string> = new Set([
  // components
  "comp-2", // a confirm dialog vs an empty "no confirm step" box
  "comp-5", // side drawer vs centred modal
  "comp-6", // inline error under the field vs a toast in the corner
  "comp-7", // labels widen the toolbar, so the icons move
  "comp-13", // a chart with a summary and data table vs the chart alone
  "comp-15", // a product crop vs floating avatars, a check and blobs
  // forms
  "form-1", // labels above vs labels beside the inputs
  "form-6", // a list of radios vs one dropdown
  "form-10", // one column vs a two-column grid
  "form-13", // one whole-code field vs six individual digit fields
  "form-14", // an email keyboard with an autofill suggestion vs a plain keyboard
  // system
  "sys-1", // skeleton bars vs a centred spinner
  "sys-2", // an empty state with a next step vs a blank panel
  "sys-6", // an extra row and a different toast
  "sys-7", // a step label and progress bar push the form down
  "sys-10", // a fallback block with Retry vs an inline broken glyph
  "sys-11", // fields stacked in the viewport vs a row that overflows it
  "sys-16", // the error toast vs an empty dashed outline where it was
  // accessibility
  "a11y-4", // the list has move buttons only in Do
  "a11y-6", // the strip has a pause control only in Do
  // motion (showcase scenes)
  "motion-1", // modal vs command palette
  "motion-3", // edge panel vs centred modal
  "motion-14", // toast vs a growing box
]);

/** Every rule's compare kind. A test holds that all rules are classified exactly once. */
export const compareKind: Readonly<Record<string, CompareKind>> = Object.fromEntries(
  rules.map((rule) => [rule.id, structuralRuleIds.has(rule.id) ? "structural" : "aligned"]),
);

export const alignedRuleIds: ReadonlySet<string> = new Set(
  rules.filter((rule) => compareKind[rule.id] === "aligned").map((rule) => rule.id),
);

/** Whether Stage shows "Hold Space to flip": aligned, and static (live demos have no Flip). */
export function suggestsFlip(id: string): boolean {
  return compareKind[id] === "aligned" && !hasLiveDemo(id);
}
