/**
 * The two comparison panes every rule is taught through.
 *
 * These two words appear on the rule card, in the drawer, on the detail page,
 * in the showcase pane chrome, in the page's JSON-LD `HowToStep` names, and on
 * the social image. They were previously hand-typed at six sites, which is how
 * three different vocabularies ("Do this"/"Avoid this", "Do"/"Don't",
 * "Recommended"/"Avoid") ended up visible within one scroll.
 *
 * They also match the data's own field names (`rule.do` / `rule.dont`) and the
 * clipboard and markdown exports, so what a reader copies matches what they saw.
 *
 * No "use client": a server component (the detail page, the social image) and a
 * client component (the card, the drawer) both import this.
 */
export const VERDICT_LABEL = {
  do: "Do",
  dont: "Don't",
} as const;

export type Verdict = keyof typeof VERDICT_LABEL;
