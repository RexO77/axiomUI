// design-system: strict
import { resolveRuleId, rules, type Rule } from "@/data/ui-logic";
import { synonyms, type Synonym } from "@/data/synonyms";

/**
 * Fold typographic quotes on both sides of the match: a smart-punctuation
 * keyboard and the catalog’s quoted UI copy must find the same rules as ASCII.
 */
function fold(text: string): string {
    return text.toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
}

/**
 * Folded text reduced to words separated by single spaces. Hyphens, slashes,
 * brackets and other punctuation become word breaks, so "line-height",
 * "line height" and "(line height)" are the same words. Kept inside a word:
 * letters, digits, an apostrophe between letters (don't) and a point between
 * digits (1.5x).
 */
function words(text: string): string {
    return fold(text)
        .replace(/[^a-z0-9.']+/g, " ")
        .replace(/\.(?!\d)|(?<!\d)\./g, " ")
        .replace(/'(?![a-z])|(?<![a-z])'/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * The query as terms that must all match. Quoted text ("saved changes") and
 * hyphenated words (line-height, 60-30-10) stay together as phrases; every
 * other word is its own term.
 */
export function queryTerms(query: string): string[] {
    const terms: string[] = [];
    const folded = fold(query);
    const rest = folded.replace(/"([^"]*)"?/g, (_, quoted: string) => {
        const phrase = words(quoted);
        if (phrase) terms.push(phrase);
        return " ";
    });
    for (const chunk of rest.split(/\s+/)) {
        const term = words(chunk);
        if (term) terms.push(term);
    }
    return terms;
}

/**
 * A term matches where a word starts with it: "kern" finds "kerning", "row"
 * does not find "arrow". A phrase must run in order from a word start.
 */
function contains(haystack: string, term: string): boolean {
    return haystack.includes(` ${term}`);
}

// ── Synonyms ─────────────────────────────────────────────────────────

/**
 * The phrase with its last word made plural: "media query" → "media queries",
 * "focus ring" → "focus rings", "ellipsis" → "ellipses", "box" → "boxes".
 */
export function pluralise(phrase: string): string {
    if (/[b-df-hj-np-tv-z]y$/.test(phrase)) return `${phrase.slice(0, -1)}ies`;
    if (/is$/.test(phrase)) return `${phrase.slice(0, -2)}es`;
    if (/(?:s|x|z|ch|sh)$/.test(phrase)) return `${phrase}es`;
    return `${phrase}s`;
}

function synonymFor(terms: readonly string[]): Synonym | null {
    const whole = terms.join(" ");
    if (!whole) return null;
    return (
        synonyms.find((synonym) => whole === synonym.phrase || whole === pluralise(synonym.phrase)) ?? null
    );
}

// ── Rule ids ─────────────────────────────────────────────────────────

const ruleIds = new Set(rules.map((rule) => rule.id));

/**
 * The rule the whole query names by id, however it is spelled ("motion-1",
 * "Motion 1", "motion  1"), with a retired id resolved to the rule that
 * absorbed it ("sys-12" → "motion-3"). Null when the query is not an id.
 */
function namedRuleId(terms: readonly string[]): string | null {
    if (terms.length === 0) return null;
    const id = resolveRuleId(terms.join(" ").replace(/ /g, "-"));
    return id && ruleIds.has(id) ? id : null;
}

/** A query read once: its terms, the synonym it spells and the rule id it names. */
type ParsedQuery = { terms: string[]; synonym: Synonym | null; named: string | null };

function parse(rawQuery: string): ParsedQuery {
    const terms = queryTerms(rawQuery.slice(0, MAX_QUERY_LENGTH)).slice(0, MAX_TERMS);
    return { terms, synonym: synonymFor(terms), named: namedRuleId(terms) };
}

// ── Matching ─────────────────────────────────────────────────────────

export type MatchField = "id" | "title" | "summary" | "do" | "dont" | "tags" | "synonym";

export type MatchReason = {
    field: MatchField;
    /** Ready to show beside a result: "In summary", "In Do", "Also known as “kerning”". */
    label: string;
};

export type SearchHit = {
    rule: Rule;
    /** Higher is better. Only meaningful for ordering hits of one query. */
    score: number;
    /** Why the rule matched, strongest first. */
    reasons: MatchReason[];
};

type Indexed = {
    rule: Rule;
    order: number;
    fields: Record<Exclude<MatchField, "synonym">, string>;
};

/** Field weights for ranking inside a tier. */
const WEIGHT = { title: 8, tags: 4, summary: 2, do: 1, dont: 1, id: 1 } as const;

const FIELD_LABEL: Record<Exclude<MatchField, "synonym">, string> = {
    id: "Rule id",
    title: "In title",
    summary: "In summary",
    do: "In Do",
    dont: "In Don't",
    tags: "In tags",
};

const index: Indexed[] = rules.map((rule, order) => ({
    rule,
    order,
    fields: {
        title: ` ${words(rule.title)}`,
        summary: ` ${words(rule.desc)}`,
        do: ` ${words(rule.do)}`,
        dont: ` ${words(rule.dont)}`,
        tags: ` ${rule.tags.map(words).join(" , ")}`,
        // The id's words, so "motion 1" and "typo" reach rules by their id.
        id: ` ${words(rule.id)}`,
    },
}));

const FIELD_ORDER = ["title", "tags", "summary", "do", "dont", "id"] as const;

/**
 * The share of the title's words the query's title terms account for, kept
 * under 1 so it only breaks ties between equal field weights: for "contrast",
 * "Accessible contrast ratios" (a third) ranks above "Double contrast for
 * borders" (a quarter).
 */
function titleCoverage(title: string, terms: readonly string[]): number {
    const total = title.trim().split(" ").length;
    let covered = 0;
    for (const term of terms) if (contains(title, term)) covered += term.split(" ").length;
    return Math.min(covered, total) / total / 2;
}

function hitFor(entry: Indexed, { terms, synonym, named }: ParsedQuery): SearchHit | null {
    const { rule, fields } = entry;
    const exactId = named === rule.id;
    const bySynonym = synonym?.ruleIds.includes(rule.id) ?? false;

    // Every term has to land somewhere in the rule (AND across terms).
    let allTerms = terms.length > 0;
    let weight = 0;
    const matchedFields = new Set<(typeof FIELD_ORDER)[number]>();
    for (const term of terms) {
        let best = 0;
        for (const field of FIELD_ORDER) {
            if (contains(fields[field], term)) {
                matchedFields.add(field);
                best = Math.max(best, WEIGHT[field]);
            }
        }
        if (best === 0) allTerms = false;
        weight += best;
    }

    if (!exactId && !bySynonym && !allTerms) return null;

    const reasons: MatchReason[] = [];
    if (exactId) reasons.push({ field: "id", label: FIELD_LABEL.id });
    if (allTerms) {
        for (const field of FIELD_ORDER) {
            if (matchedFields.has(field) && !(field === "id" && exactId)) reasons.push({ field, label: FIELD_LABEL[field] });
        }
    }
    if (bySynonym) {
        reasons.push({ field: "synonym", label: `Also known as “${synonym!.phrase}”` });
    }

    // Tiers: exact id, then every term in the title, then a synonym, then the rest.
    const titleHasAll = allTerms && terms.every((term) => contains(fields.title, term));
    const tier = exactId ? 3 : titleHasAll ? 2 : bySynonym ? 1 : 0;
    return { rule, score: tier * 1000 + (allTerms ? weight + titleCoverage(fields.title, terms) : 0), reasons };
}

/**
 * Longest query the search reads, in characters, and most terms it matches.
 * The URL already trims ?q to 100; this keeps a pasted wall of text from
 * running every term over the whole catalog.
 */
export const MAX_QUERY_LENGTH = 100;
const MAX_TERMS = 12;

/**
 * Ranked search for the palette: best match first, catalog order on ties.
 * Terms are AND-matched across title, summary, Do, Don't, tags and the id's
 * words; a query that is a rule id (or a retired one) ranks that rule first,
 * then title matches; a whole-query synonym adds its rules. A blank query
 * returns nothing (callers show their own empty state).
 */
export function searchRules(rawQuery: string): SearchHit[] {
    const query = parse(rawQuery);
    if (query.terms.length === 0) return [];
    const hits: { hit: SearchHit; order: number }[] = [];
    for (const entry of index) {
        const hit = hitFor(entry, query);
        if (hit) hits.push({ hit, order: entry.order });
    }
    hits.sort((a, b) => b.hit.score - a.hit.score || a.order - b.order);
    return hits.map(({ hit }) => hit);
}
