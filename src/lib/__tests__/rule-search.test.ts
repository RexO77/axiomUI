import { describe, expect, it } from "vitest";
import { rules } from "@/data/ui-logic";
import { accessibilityCollection } from "@/data/taxonomy";
import { queryTerms, MAX_QUERY_LENGTH, pluralise, searchRules } from "@/lib/rule-search";

const ranked = (query: string) => searchRules(query).map((hit) => hit.rule.id);

describe("queryTerms", () => {
  it("splits words, keeps quoted text and hyphenated words as phrases", () => {
    expect(queryTerms("  Focus   RING ")).toEqual(["focus", "ring"]);
    expect(queryTerms("line-height body")).toEqual(["line height", "body"]);
    expect(queryTerms("“saved successfully” form")).toEqual(["saved successfully", "form"]);
    expect(queryTerms("/focus")).toEqual(["focus"]);
    expect(queryTerms("don’t")).toEqual(["don't"]);
    expect(queryTerms("1.5x")).toEqual(["1.5x"]);
  });
});

describe("searchRules", () => {
  it("returns nothing for a blank query", () => {
    expect(searchRules("")).toEqual([]);
    expect(searchRules("   ")).toEqual([]);
  });

  it("AND-matches every term", () => {
    const hits = searchRules("pending button");
    expect(hits.length).toBeGreaterThan(0);
    for (const { rule } of hits) {
      const text = [rule.title, rule.desc, rule.do, rule.dont, ...rule.tags].join(" ").toLowerCase();
      expect(text).toContain("pending");
      expect(text).toMatch(/button/);
    }
    expect(searchRules("pending button").length).toBeLessThan(searchRules("button").length);
  });

  it("matches at word starts, so a fragment inside a word doesn't count", () => {
    expect(ranked("kern")).toEqual([]);
    expect(ranked("track")).toContain("typo-2");
    expect(ranked("row")).not.toContain("layout-4");
  });

  it("treats hyphens, spaces and brackets alike", () => {
    expect(ranked("line-height")).toEqual(ranked('"line height"'));
    expect(ranked("line height")).toEqual(expect.arrayContaining(ranked("line-height")));
    expect(ranked("line-height").slice(0, 2).sort()).toEqual(["typo-3", "typo-4"]);
    expect(ranked("z-index")).toEqual(["layout-11"]);
    expect(ranked("60-30-10")).toEqual(["color-1"]);
  });

  it("ignores a typed slash, so “/focus” finds the focus rules", () => {
    expect(ranked("/focus")[0]).toBe("a11y-1");
  });

  it("ranks title matches first", () => {
    const hits = searchRules("focus");
    expect(hits[0].rule.id).toBe("a11y-1");
    expect(hits[0].reasons[0]).toEqual({ field: "title", label: "In title" });
    // Every title match outranks every hit that matched elsewhere.
    const inTitle = hits.map((hit) => /focus/i.test(hit.rule.title));
    expect(inTitle.indexOf(false)).toBe(inTitle.filter(Boolean).length);
  });

  it("ranks an exact id first", () => {
    expect(ranked("motion-12")).toEqual(["motion-12"]);
    expect(ranked("MOTION-1")[0]).toBe("motion-1");
    expect(searchRules("motion-12")[0].reasons[0]).toEqual({ field: "id", label: "Rule id" });
  });

  it("reads an id typed as words, and ranks that rule first", () => {
    expect(ranked("motion 1")[0]).toBe("motion-1");
    expect(ranked("Typo 1")[0]).toBe("typo-1");
    expect(searchRules("typo 1")[0].reasons).toEqual([{ field: "id", label: "Rule id" }]);
    // The id's words are a field of their own, so a category prefix reaches its rules.
    expect(ranked("typo")).toEqual(expect.arrayContaining(rules.filter((rule) => rule.id.startsWith("typo-")).map((rule) => rule.id)));
  });

  it("finds a retired id's successor", () => {
    expect(ranked("sys-12")[0]).toBe("motion-3");
    expect(ranked("SYS 12")[0]).toBe("motion-3");
    expect(searchRules("sys-12")[0].reasons[0]).toEqual({ field: "id", label: "Rule id" });
  });

  it("among equal matches, ranks the title the query covers most of first", () => {
    // The same term covers more of “Accessible contrast ratios” than the longer control-edge title.
    expect(ranked("contrast").slice(0, 2)).toEqual(["color-9", "color-6"]);
    // A tiebreak only: it never lifts a hit over one with a stronger field.
    for (const query of ["contrast", "focus", "toast", "line height", "motion"]) {
      const hits = searchRules(query);
      for (let i = 1; i < hits.length; i++) {
        expect(Math.floor(hits[i - 1].score)).toBeGreaterThanOrEqual(Math.floor(hits[i].score));
      }
    }
  });

  it("is deterministic: ties keep catalog order", () => {
    const hits = searchRules("contrast");
    for (let i = 1; i < hits.length; i++) {
      if (hits[i - 1].score === hits[i].score) {
        expect(rules.indexOf(hits[i - 1].rule)).toBeLessThan(rules.indexOf(hits[i].rule));
      }
      expect(hits[i - 1].score).toBeGreaterThanOrEqual(hits[i].score);
    }
  });
});

describe("synonyms", () => {
  it.each([
    ["kerning", ["typo-2"]],
    ["leading", ["typo-3", "typo-4"]],
    ["loading button", ["comp-9"]],
    ["toast", ["comp-6", "motion-15", "sys-16"]],
    ["line length", ["layout-2"]],
    ["focus ring", ["a11y-1"]],
    ["focus rings", ["a11y-1"]],
    ["hitbox", ["sys-3", "a11y-3", "comp-11"]],
    ["tap area", ["sys-3", "a11y-3"]],
    ["tab order", ["sys-8", "a11y-1"]],
    ["ellipsis", ["typo-10"]],
    ["orphan", ["typo-12", "typo-13"]],
    ["dark theme", ["color-8", "color-11"]],
    ["helper text", ["form-9", "comp-8"]],
    ["onblur", ["form-8"]],
    ["prefill", ["form-11"]],
    ["stepper", ["sys-7"]],
    ["rollback", ["sys-9", "sys-6"]],
    ["fallback", ["sys-10"]],
    ["rubber band", ["motion-19"]],
    ["rubber-band", ["motion-19"]],
    ["overscroll", ["motion-19"]],
    ["first render", ["motion-29"]],
  ])("“%s” finds %j", (query, expected) => {
    const found = ranked(query);
    for (const id of expected) expect(found, query).toContain(id);
    // Synonym hits outrank rules that merely mention a word of the query.
    expect(found.slice(0, expected.length).sort()).toEqual([...expected].sort());
  });

  it("reads the plural of a phrase's last word", () => {
    expect(pluralise("media query")).toBe("media queries");
    expect(pluralise("accessibility")).toBe("accessibilities");
    expect(pluralise("focus ring")).toBe("focus rings");
    expect(pluralise("ellipsis")).toBe("ellipses");
    expect(pluralise("hotkey")).toBe("hotkeys");
    expect(pluralise("a11y")).toBe("a11ys");
    expect(ranked("media queries").slice(0, 2).sort()).toEqual(["motion-16", "sys-11"]);
    expect(ranked("media querys")).toEqual([]);
    for (const id of accessibilityCollection.ruleIds) expect(ranked("accessibilities")).toContain(id);
  });

  it("maps a11y and accessibility to the 16-rule collection", () => {
    expect(ranked("a11y").sort()).toEqual([...accessibilityCollection.ruleIds].sort());
    for (const id of accessibilityCollection.ruleIds) expect(ranked("accessibility")).toContain(id);
  });

  it("fires only on the whole phrase", () => {
    expect(ranked("length")).not.toContain("layout-2");
    expect(ranked("rubber")).toEqual([]);
    expect(ranked("kerning caps")).toEqual([]);
  });

  it("says why a rule matched", () => {
    const reasons = (id: string, query: string) => searchRules(query).find((hit) => hit.rule.id === id)?.reasons ?? [];
    expect(reasons("typo-2", "kerning")).toEqual([{ field: "synonym", label: "Also known as “kerning”" }]);
    expect(reasons("comp-6", "toast").map((r) => r.label)).toEqual(["In Don't", "Also known as “toast”"]);
    expect(reasons("typo-2", "zzqx")).toEqual([]);
  });
});

describe("searchRules input limits", () => {
  it("reads only the first MAX_QUERY_LENGTH characters", () => {
    const padded = "kerning" + " ".repeat(MAX_QUERY_LENGTH) + "zzqx";
    expect(searchRules(padded).map((hit) => hit.rule.id)).toEqual(
      searchRules("kerning").map((hit) => hit.rule.id),
    );
  });

  it("stays fast on a pasted wall of terms", () => {
    const wall = Array.from({ length: 50_000 }, (_, i) => `w${i}`).join(" ");
    const started = performance.now();
    searchRules(wall);
    expect(performance.now() - started).toBeLessThan(200);
  });
});
