/**
 * One rule's deep dive under today's four section names, as the rule view
 * shows it. Prose-free on purpose: client code imports this
 * type, never the builder, so the corpus stays on the server.
 *
 *   how     How to apply it   (implementation notes, in order)
 *   why     Why it works
 *   breaks  What breaks
 *   review  Before you ship   (review prompts)
 */
export type RuleProse = Readonly<{
  id: string;
  how: readonly string[];
  why: string;
  /** Older cached rule payloads predate references. */
  sources?: readonly RuleSource[];
  breaks: string;
  review: readonly string[];
}>;

/**
 * What a source is, so a reader sees what backs a rule: a web or
 * accessibility standard, a platform or design-system guideline, research
 * (usability studies, papers), or practitioner writing.
 */
export type SourceKind = "standard" | "guideline" | "research" | "practice";
export const SOURCE_KIND_LABEL: Readonly<Record<SourceKind, string>> = Object.freeze({
  standard: "Standard",
  guideline: "Guideline",
  research: "Research",
  practice: "Practice",
});

export type RuleSource = Readonly<{ title: string; href: `https://${string}`; kind?: SourceKind }>;

/** The four section headings, in reading order. Shared by the view and its tests. */
export const PROSE_HEADINGS = Object.freeze({
  how: "How to apply it",
  why: "Why it works",
  breaks: "What breaks",
  review: "Before you ship",
});
