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

export type RuleSource = Readonly<{ title: string; href: `https://${string}` }>;

/** The four section headings, in reading order. Shared by the view and its tests. */
export const PROSE_HEADINGS = Object.freeze({
  how: "How to apply it",
  why: "Why it works",
  breaks: "What breaks",
  review: "Before you ship",
});
