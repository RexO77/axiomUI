import { describe, expect, it, vi } from "vitest";
import { accessibilityCollection, railCategories, railOrder } from "@/data/taxonomy";
import {
  catalogDeck,
  categoryHandoff,
  collectionDeck,
  deckContaining,
  deckFor,
  deckNeighbours,
  deckPosition,
  normaliseQuery,
  resolveEntryDeck,
  searchDeck,
  sectionJump,
  stepRule,
} from "@/lib/navigation/deck";
import {
  currentUrl,
  exitAction,
  galleryState,
  holdHistory,
  historyEntry,
  jumpFromRule,
  openFromGallery,
  readAxiomState,
  saveScroll,
  scrollToRestore,
  stampLoad,
  stepInRule,
  writeHistory,
  type AxiomState,
  type HistoryWrite,
} from "@/lib/navigation/history";
import { createRoutes, routes } from "@/lib/navigation/routes";
import { searchRules } from "@/lib/rule-search";

const ids = (deck: { rules: readonly { id: string }[] }) => deck.rules.map((rule) => rule.id);

describe("catalog routes", () => {
  it("builds the same URLs at the site root and under a base path, never with an empty path", () => {
    expect(routes.galleryHref()).toBe("/");
    expect(routes.ruleHref("motion-7")).toBe("/rules/motion-7");
    expect(routes.galleryHref({ show: "do", q: "" })).toBe("/");
    expect(routes.galleryHref({ hash: "rule-a11y-1" })).toBe("/#rule-a11y-1");
    for (const base of ["/docs", "/docs/", "docs"]) {
      const nested = createRoutes(base);
      expect(nested.base).toBe("/docs");
      expect(nested.galleryHref()).toBe("/docs");
      expect(nested.galleryHref({ q: "focus & labels", show: "dont", collection: "accessibility", hash: "rule-a11y-1" }))
        .toBe("/docs?q=focus+%26+labels&show=dont&collection=accessibility#rule-a11y-1");
      expect(nested.ruleHref("a/b", { q: "focus" })).toBe("/docs/rules/a%2Fb?q=focus");
    }
    expect(createRoutes("/").base).toBe("");
  });

  it("parses the same view and query state on both bases", () => {
    const expected = { view: "rule", ruleId: "a11y-1", q: "focus", show: "dont", collection: "accessibility" };
    const search = "?q=focus&show=dont&collection=accessibility";
    expect(routes.parseLocation("/rules/a11y-1", search)).toEqual(expected);
    expect(createRoutes("/docs").parseLocation("/docs/rules/a11y-1/", search)).toEqual(expected);
    expect(routes.parseLocation("/", "?show=invalid")).toEqual({ view: "gallery", ruleId: null, q: "", show: "do", collection: null });
    expect(routes.parseLocation("/", "?collection=accessibility").collection).toBe("accessibility");
    expect(routes.parseLocation("/rules/%E0%A4%A").ruleId).toBeNull();
    expect(createRoutes("/docs").parseLocation("/docs-other/rules/motion-7").ruleId).toBeNull();
    expect(createRoutes("/docs").parseLocation("/docs").view).toBe("gallery");
  });

  it("reads the last ?rule= at the wall, resolves aliases, and ignores ?rule= anywhere else", () => {
    expect(routes.parseLocation("/", "?rule=motion-7&q=focus")).toMatchObject({ view: "rule", ruleId: "motion-7", q: "focus" });
    expect(routes.parseLocation("/", "?rule=color-1&rule=motion-7").ruleId).toBe("motion-7");
    expect(routes.parseLocation("/", "?rule=sys-12").ruleId).toBe("motion-3");
    expect(routes.parseLocation("/rules/sys-12").ruleId).toBe("motion-3");
    expect(createRoutes("/docs").parseLocation("/docs", "?rule=color-1").ruleId).toBe("color-1");
    expect(routes.parseLocation("/rules/color-1", "?rule=motion-7").ruleId).toBe("color-1");
    for (const search of ["?rule=", "?rule=valueOf", "?rule=MOTION-7", "?rule=motion-7&rule=", "?rule=../x"]) {
      expect(routes.parseLocation("/", search), search).toMatchObject({ view: "gallery", ruleId: null });
    }
  });
});

describe("decks follow the wall", () => {
  it("pages the catalog in rail order, counting within the category", () => {
    expect(catalogDeck.rules).toBe(railOrder);
    expect(deckPosition(catalogDeck, "a11y-1")).toMatchObject({ category: "system", total: railCategories.find((c) => c.id === "system")!.rules.length });
    expect(deckPosition(catalogDeck, railOrder[0].id)).toMatchObject({ index: 1, label: `1 of ${railCategories[0].rules.length}` });
    expect(deckPosition(catalogDeck, "unknown")).toBeNull();
  });

  it("never wraps and handles absent rules", () => {
    expect(stepRule(catalogDeck, railOrder[0].id, -1)).toBeNull();
    expect(stepRule(catalogDeck, railOrder.at(-1)!.id, 1)).toBeNull();
    expect(deckNeighbours(catalogDeck, "unknown")).toEqual({ prev: null, next: null });
    expect(stepRule(searchDeck("zzqx"), "motion-1", 1)).toBeNull();
  });

  it("sorts search hits into wall order, not relevance order", () => {
    expect(ids(searchDeck("border"))).toEqual(["layout-7", "a11y-2", "color-6", "color-12", "motion-8"]);
    const relevance = searchRules("border").map((hit) => hit.rule.id);
    expect(relevance).not.toEqual(ids(searchDeck("border")));
    expect([...relevance].sort()).toEqual([...ids(searchDeck("border"))].sort());
    const deck = searchDeck("border");
    expect(deckPosition(deck, "color-6")).toMatchObject({ index: 3, total: 5, label: "3 of 5" });
    expect(stepRule(deck, "layout-7", 1)?.id).toBe("a11y-2");
  });

  it("walks sections of the wall-ordered border deck", () => {
    const deck = searchDeck("border");
    expect(sectionJump(deck, "layout-7", 1)?.id).toBe("a11y-2");
    expect(sectionJump(deck, "a11y-2", 1)?.id).toBe("motion-8");
    expect(sectionJump(deck, "color-6", 1)?.id).toBe("motion-8");
    expect(sectionJump(deck, "color-6", -1)?.id).toBe("layout-7");
    expect(sectionJump(deck, "a11y-2", -1)?.id).toBe("layout-7");
    expect(sectionJump(deck, "layout-7", -1)).toBeNull();
    expect(sectionJump(deck, "motion-8", 1)).toBeNull();
    expect(sectionJump(deck, "typo-1", 1)).toBeNull();
  });

  it("jumps catalog sections without wrapping", () => {
    const [first, second] = railCategories;
    expect(sectionJump(catalogDeck, first.rules[3].id, 1)).toBe(second.rules[0]);
    expect(sectionJump(catalogDeck, second.rules[3].id, -1)).toBe(first.rules[0]);
    expect(sectionJump(catalogDeck, first.rules[3].id, -1)).toBe(first.rules[0]);
    expect(sectionJump(catalogDeck, second.rules[0].id, -1)).toBe(first.rules[0]);
    expect(sectionJump(catalogDeck, first.rules[0].id, -1)).toBeNull();
    expect(sectionJump(catalogDeck, railOrder.at(-1)!.id, 1)).toBeNull();
  });

  it("keeps a no-match query empty, reads a blank one as the catalog, and normalises and memoises by query", () => {
    expect(searchDeck("zzqx").rules).toEqual([]);
    expect(searchDeck("")).toBe(catalogDeck);
    expect(searchDeck("   ")).toBe(catalogDeck);
    expect(searchDeck(" \t ")).toBe(deckFor({ q: " \t " }));
    expect(deckFor({ q: "zzqx" })).toMatchObject({ kind: "search", rules: [] });
    expect(deckFor({ q: "   " })).toBe(catalogDeck);
    expect(deckFor({})).toBe(catalogDeck);
    expect(normaliseQuery("  focus \t  ring ")).toBe("focus ring");
    expect(searchDeck("  focus   ring ")).toBe(searchDeck("focus ring"));
    expect(searchDeck("focus ring").q).toBe("focus ring");
  });

  it("pages a collection in its own order, and a ?q wins over ?collection", () => {
    const deck = collectionDeck("accessibility");
    expect(ids(deck)).toEqual(accessibilityCollection.ruleIds);
    expect(deckFor({ collection: "accessibility" })).toBe(deck);
    expect(deckFor({ q: "toast", collection: "accessibility" }).kind).toBe("search");
    expect(deckPosition(deck, deck.rules.at(-1)!.id)?.index).toBe(deck.rules.length);
    expect(collectionDeck("missing").rules).toEqual([]);
    expect(sectionJump(deck, "a11y-1", 1)?.id).toBe("color-9");
    expect(sectionJump(deck, "comp-12", -1)?.id).toBe("a11y-1");
  });

  it("resolves a stale ?q and an out-of-deck rule to the catalog", () => {
    const stale = searchDeck("zzqx");
    expect(deckContaining(stale, "motion-7")).toBeNull();
    expect(resolveEntryDeck(stale, "motion-7")).toBe(catalogDeck);
    const filtered = searchDeck("border");
    expect(resolveEntryDeck(filtered, "a11y-2")).toBe(filtered);
    expect(resolveEntryDeck(filtered, "typo-3")).toBe(catalogDeck);
    expect(resolveEntryDeck(collectionDeck("accessibility"), "motion-7")).toBe(catalogDeck);
  });

  it("offers the category handoff on the catalog deck only", () => {
    const [first, second] = railCategories;
    expect(categoryHandoff(catalogDeck, first.rules.at(-1)!.id)).toMatchObject({ rule: second.rules[0], category: second.id, count: second.rules.length });
    expect(categoryHandoff(catalogDeck, first.rules[0].id)).toBeNull();
    expect(categoryHandoff(catalogDeck, railOrder.at(-1)!.id)).toBeNull();
    expect(stepRule(searchDeck("border"), "layout-7", 1)?.id).toBe("a11y-2");
    expect(categoryHandoff(searchDeck("border"), "layout-7")).toBeNull();
    const collection = collectionDeck("accessibility");
    for (const rule of collection.rules) expect(categoryHandoff(collection, rule.id)).toBeNull();
  });
});

/** A browser-like history: entries, an index, and the state each write left. */
function fakeHistory(initial: unknown = { __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: {} }) {
  const entries: { state: unknown; url: string }[] = [{ state: initial, url: "/" }];
  let index = 0;
  const history = {
    get state() {
      return entries[index].state;
    },
    pushState: vi.fn((state: unknown, _unused: string, url?: string | URL | null) => {
      entries.splice(index + 1, entries.length, { state, url: String(url) });
      index += 1;
    }),
    replaceState: vi.fn((state: unknown, _unused: string, url?: string | URL | null) => {
      entries[index] = { state, url: String(url) };
    }),
    go(delta: number) {
      index += delta;
    },
    /** What Next does after our write: add its keys beside ours. */
    nextPatches() {
      entries[index].state = { ...(entries[index].state as object), __NA: true, _N: true, __PRIVATE_NEXTJS_INTERNALS_TREE: {} };
    },
    entries,
  };
  return history;
}

function apply(history: ReturnType<typeof fakeHistory>, write: HistoryWrite, url: string) {
  writeHistory(write.mode, write.axiom, url, history);
  history.nextPatches();
}

describe("history recipe", () => {
  it("writes a fresh state holding only our key, whatever the entry held", () => {
    const history = fakeHistory();
    history.nextPatches();
    const writes: HistoryWrite[] = [...openFromGallery(), jumpFromRule(history.state), stepInRule(history.state), saveScroll(history.state, "a", 10), stampLoad("rule")];
    for (const write of writes) writeHistory(write.mode, write.axiom, "/rules/typo-1", history);
    const calls = [...history.pushState.mock.calls, ...history.replaceState.mock.calls];
    expect(calls).toHaveLength(writes.length);
    for (const [state, , url] of calls) {
      expect(Object.keys(state as object)).toEqual(["axiom"]);
      for (const key of ["__NA", "_N", "__PRIVATE_NEXTJS_INTERNALS_TREE"]) expect(state).not.toHaveProperty(key);
      expect(url).toBe("/rules/typo-1");
    }
    expect(Object.keys(historyEntry(galleryState).axiom)).toEqual(["view", "depth", "scroll"]);
  });

  it("drops writes while the router navigates for the shell, and writes again once released", () => {
    const history = fakeHistory();
    holdHistory(true);
    try {
      writeHistory("replace", saveScroll(history.state, "typo-1", 120).axiom, "/rules/typo-1", history);
      writeHistory("push", jumpFromRule(history.state).axiom, "/rules/typo-2", history);
      expect(history.replaceState).not.toHaveBeenCalled();
      expect(history.pushState).not.toHaveBeenCalled();
    } finally {
      holdHistory(false);
    }
    writeHistory("replace", galleryState, "/", history);
    expect(history.replaceState).toHaveBeenCalledOnce();
  });

  it("refuses an empty or cross-origin URL", () => {
    const history = fakeHistory();
    for (const url of ["", "rules/a", "//evil.test/x", "https://evil.test/"]) {
      expect(() => writeHistory("replace", galleryState, url, history), url).toThrow(TypeError);
    }
    expect(history.replaceState).not.toHaveBeenCalled();
    expect(currentUrl({ pathname: "/rules/a", search: "?q=x", hash: "#top" })).toBe("/rules/a?q=x#top");
    expect(currentUrl({ pathname: "", search: "", hash: "" })).toBe("/");
  });

  it("uses window.history at call time when no target is given", () => {
    const history = fakeHistory();
    vi.stubGlobal("window", { history });
    try {
      writeHistory("push", { view: "rule", depth: 1, scroll: null }, "/rules/a");
      expect(history.pushState).toHaveBeenCalledOnce();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("counts depth: open from the wall is 1, a Related jump adds 1, paging keeps it", () => {
    const history = fakeHistory();
    const [gallery, open] = openFromGallery();
    apply(history, gallery, "/");
    apply(history, open, "/rules/typo-3");
    expect(readAxiomState(history.state)?.depth).toBe(1);
    apply(history, jumpFromRule(history.state), "/rules/layout-2");
    expect(readAxiomState(history.state)?.depth).toBe(2);
    apply(history, stepInRule(history.state), "/rules/layout-3");
    expect(readAxiomState(history.state)).toEqual({ view: "rule", depth: 2, scroll: null });
    expect(history.entries.map((entry) => entry.url)).toEqual(["/", "/rules/typo-3", "/rules/layout-3"]);
  });

  it("wall → A → Related → B → Esc goes back two entries to the wall", () => {
    const history = fakeHistory();
    for (const write of openFromGallery()) apply(history, write, write.mode === "push" ? "/rules/typo-3" : "/");
    apply(history, jumpFromRule(history.state), "/rules/layout-2");
    const action = exitAction(history.state, "layout-2", catalogDeck);
    expect(action).toEqual({ type: "back", delta: 2 });
    if (action.type === "back") history.go(-action.delta);
    expect(history.entries[0].url).toBe("/");
    expect(readAxiomState(history.state)?.view).toBe("gallery");
  });

  it("replaces to the wall, anchored on the tile, when nothing is below or the wall's deck lacks the rule", () => {
    const below = historyEntry({ view: "rule", depth: 1, scroll: null });
    expect(exitAction(below, "typo-3", searchDeck("zzqx"))).toEqual({ type: "replace", href: "/#rule-typo-3", axiom: galleryState });
    expect(exitAction(null, "typo-3", catalogDeck, { q: "toast", show: "dont" }, createRoutes("/docs")))
      .toEqual({ type: "replace", href: "/docs?q=toast&show=dont#rule-typo-3", axiom: galleryState });
    expect(exitAction({ axiom: { view: "rule", depth: "2" } }, "typo-3", catalogDeck).type).toBe("replace");
  });

  it("stamps a reload depth 0, so Esc replaces in place and a later jump stays at 0", () => {
    const history = fakeHistory({ axiom: { view: "rule", depth: 3, scroll: { id: "typo-3", top: 400 } } });
    apply(history, stampLoad("rule"), "/rules/typo-3");
    expect(readAxiomState(history.state)).toEqual({ view: "rule", depth: 0, scroll: null });
    expect(exitAction(history.state, "typo-3", catalogDeck).type).toBe("replace");
    apply(history, jumpFromRule(history.state), "/rules/layout-2");
    expect(readAxiomState(history.state)?.depth).toBe(0);
    expect(exitAction(history.state, "layout-2", catalogDeck).type).toBe("replace");
    expect(stampLoad("gallery").axiom).toBe(galleryState);
  });

  it("stores the sheet's scroll with its rule id and restores it only for that rule", () => {
    const history = fakeHistory();
    for (const write of openFromGallery()) apply(history, write, write.mode === "push" ? "/rules/typo-3" : "/");
    apply(history, saveScroll(history.state, "typo-3", 640), "/rules/typo-3");
    expect(readAxiomState(history.state)).toEqual({ view: "rule", depth: 1, scroll: { id: "typo-3", top: 640 } });
    expect(scrollToRestore(history.state, "typo-3")).toBe(640);
    expect(scrollToRestore(history.state, "typo-4")).toBeNull();
    apply(history, stepInRule(history.state), "/rules/typo-4");
    expect(readAxiomState(history.state)?.scroll).toBeNull();
    expect(jumpFromRule(history.state).axiom.scroll).toBeNull();
  });

  it("validates whatever an entry holds", () => {
    for (const state of [null, undefined, 1, [], {}, { axiom: null }, { axiom: { view: "sheet" } }]) {
      expect(readAxiomState(state)).toBeNull();
    }
    const read = (axiom: unknown) => readAxiomState({ axiom }) as AxiomState;
    expect(read({ view: "rule", depth: -2, scroll: { id: "a", top: NaN } })).toEqual({ view: "rule", depth: 0, scroll: null });
    expect(read({ view: "rule", depth: 1.5, scroll: { id: "a", top: -4 } })).toEqual({ view: "rule", depth: 0, scroll: { id: "a", top: 0 } });
    expect(read({ view: "gallery", depth: 4 })).toEqual({ view: "gallery", depth: 0, scroll: null });
  });

  it("round-trips a panel offset and Related link with the sheet position, including old entries", () => {
    const write = saveScroll({ axiom: { view: "rule", depth: 2 } }, "typo-3", 50, 286, "type-2");
    const restored = readAxiomState(historyEntry(write.axiom));
    expect(restored).toEqual({ view: "rule", depth: 2, scroll: { id: "typo-3", top: 50, panelTop: 286, relatedId: "type-2" } });
    expect(scrollToRestore({ axiom: restored }, "typo-4")).toBeNull();
    for (const optional of [{}, { panelTop: -10, relatedId: 4 }, { panelTop: Infinity, relatedId: "" }]) {
      const state = { axiom: { view: "rule", depth: 1, scroll: { id: "typo-3", top: 50, ...optional } } };
      expect(readAxiomState(state)?.scroll).toEqual({ id: "typo-3", top: 50 });
    }
  });
});
