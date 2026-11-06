// design-system: strict
"use client";

import {
  Suspense,
  useCallback,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";

import { categories, resolveRuleId, rules } from "@/data/ui-logic";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { RuleCard } from "@/components/features/rules/rule-card";
import { RuleDrawer } from "@/components/features/rules/rule-drawer";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/ui/category-icon";
import { SearchProvider, useSearch } from "@/components/providers/search-provider";
import { filterRules } from "@/lib/rule-search";
import { REDUCED_MOTION_QUERY } from "@/lib/media";
import {
  captureReadingAnchor,
  glideToCard,
  stopGlide,
  findReadingAnchor,
  restoreReadingAnchor,
  settleReadingAnchor,
  type ReadingAnchor,
} from "@/lib/reading-anchor";

/**
 * The only reader of `?rule=` on this page. `useSearchParams` makes the static
 * prerender bail out to the nearest Suspense boundary, so it lives in a leaf
 * that renders nothing: the boundary around it falls back to null and the whole
 * catalog above it still ships in the HTML.
 */
function RuleParamSync({ onChange }: { onChange: (id: string | null) => void }) {
  const ruleId = resolveRuleId(useSearchParams().get("rule"));

  useEffect(() => {
    onChange(ruleId);
  }, [ruleId, onChange]);

  return null;
}

const FOOTER_LINKS = [
  { label: "Nischal Skanda", href: "https://www.nischal.fyi/" },
  { label: "GitHub", href: "https://github.com/RexO77/axiomUI" },
  { label: "llms.txt", href: "/llms.txt" },
];

/** How long typing has to pause before the match count is announced. */
const ANNOUNCE_DELAY_MS = 300;

function matchMessage(count: number) {
  if (count === 0) return "No rules match";
  return count === 1 ? "1 rule matches" : `${count} rules match`;
}

/**
 * Screen-reader echo of the search result. It waits for typing to settle so
 * a reader hears one count per pause rather than one per keystroke, and goes
 * quiet when the query clears.
 */
function MatchAnnouncer({ query, count }: { query: string; count: number }) {
  const [message, setMessage] = useState("");
  const active = query.trim() !== "";

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setMessage(active ? matchMessage(count) : ""),
      ANNOUNCE_DELAY_MS
    );
    return () => window.clearTimeout(timeoutId);
  }, [active, count, query]);

  return (
    <p role="status" className="sr-only">
      {message}
    </p>
  );
}

/**
 * At xl the drawer docks beside the grid, so the open rule's card stays in
 * view when it changes under an already-open drawer: arrow-key paging, or a
 * deep link on load. Opening from a click needs nothing: the card is already
 * where the reader is looking, and the dock keeps it there (useDockAnchor).
 *
 * Paging inside the open drawer always glides (glideToCard): the next card
 * is the neighbour. Measuring the distance mid-glide would read a neighbour
 * as far away and teleport the page.
 *
 * A deep link to a card more than two screens away is jumped to instead:
 * travelling half the catalog is motion for its own sake, and cards skipped by
 * content-visibility only have a placeholder height, so a long smooth scroll
 * aims at a stale position. The jump is re-aimed one frame later, once the
 * card has rendered at its real height.
 */
function useKeepActiveCardInView(activeRuleId: string | null) {
  const previousId = useRef<string | null>(null);

  useEffect(() => stopGlide, []);

  useEffect(() => {
    const wasOpen = previousId.current !== null;
    previousId.current = activeRuleId;

    if (!activeRuleId) {
      stopGlide();
      return;
    }
    if (!window.matchMedia("(min-width: 1280px)").matches) {
      return;
    }

    const card = document.getElementById(`rule-${activeRuleId}`);
    if (!card) {
      return;
    }

    const reduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;

    if (wasOpen) {
      if (reduced) card.scrollIntoView({ block: "nearest" });
      else glideToCard(card);
      return;
    }

    const { top, bottom } = card.getBoundingClientRect();
    if (bottom > 0 && top < window.innerHeight) {
      return;
    }

    const far = Math.abs(top) > window.innerHeight * 2;

    if (!far && !reduced) {
      glideToCard(card);
      return;
    }

    card.scrollIntoView({ block: "nearest" });
    const frameId = requestAnimationFrame(() => card.scrollIntoView({ block: "nearest" }));
    return () => cancelAnimationFrame(frameId);
  }, [activeRuleId]);
}

/**
 * The docked panel's exit (duration-medium, 220ms) plus a frame of slack.
 * Under reduced motion the panel leaves at once, so there is nothing to wait
 * out and the lane widens in the same commit (closeRule).
 */
const UNDOCK_DELAY_MS = 240;

/**
 * Docking the drawer at xl narrows the lane, which re-wraps every visible
 * card and changes their heights. Two rules keep that from reading as a jolt:
 *
 * - The lane changes width only while the panel is off screen: at once on
 *   open (the panel waits a frame before it slides in), and only after the
 *   exit on close. The panel never moves over a grid that is re-laying out.
 * - Whatever card the reader is looking at keeps its top edge where it was
 *   across the change (reading-anchor), so the page never jumps by the
 *   height the cards gained or lost.
 */
function useDockAnchor(docked: boolean) {
  useLayoutEffect(() => {
    restoreReadingAnchor();
  }, [docked]);

  return captureReadingAnchor;
}

export default function Home() {
  const pathname = usePathname();
  const [activeRuleId, setActiveRuleId] = useState<string | null>(null);
  const deferredRuleId = useDeferredValue(activeRuleId);

  return (
    <SearchProvider>
      <Suspense fallback={null}>
        <RuleParamSync onChange={setActiveRuleId} />
      </Suspense>
      <HomeBody
        pathname={pathname}
        activeRuleId={activeRuleId}
        setActiveRuleId={setActiveRuleId}
        deferredRuleId={deferredRuleId}
      />
    </SearchProvider>
  );
}

function HomeBody({
  pathname,
  activeRuleId,
  setActiveRuleId,
  deferredRuleId,
}: {
  pathname: string;
  activeRuleId: string | null;
  setActiveRuleId: (id: string | null) => void;
  deferredRuleId: string | null;
}) {
  const { query, setQuery } = useSearch();
  // The grid filters on the deferred query, so a keystroke paints the field
  // at once and the 105-card re-render follows when the main thread is free.
  const deferredQuery = useDeferredValue(query);
  const rulesContainerRef = useRef<HTMLElement>(null);

  function clearSearch() {
    setQuery("");
    requestAnimationFrame(() => {
      rulesContainerRef.current?.focus({ preventScroll: true });
    });
  }

  const syncRuleParam = useCallback((ruleId: string | null) => {
    const nextParams = new URLSearchParams(window.location.search);

    if (ruleId) {
      nextParams.set("rule", ruleId);
    } else {
      nextParams.delete("rule");
    }

    const next = nextParams.toString();
    const nextUrl = `${pathname}${next ? `?${next}` : ""}${window.location.hash}`;

    window.history.replaceState(null, "", nextUrl);
  }, [pathname]);

  // The lane stays docked through the panel's exit, then widens (see useDockAnchor).
  const [holdDock, setHoldDock] = useState(false);
  const docked = Boolean(activeRuleId) || holdDock;
  const captureDockAnchor = useDockAnchor(docked);

  // The card the reader just closed is what they are looking at when the lane
  // widens, so it is the one held in place.
  const closedRuleId = useRef<string | null>(null);

  useEffect(() => {
    if (!holdDock || activeRuleId) return;
    const timeoutId = window.setTimeout(() => {
      captureDockAnchor(closedRuleId.current);
      setHoldDock(false);
    }, UNDOCK_DELAY_MS);
    return () => window.clearTimeout(timeoutId);
  }, [holdDock, activeRuleId, captureDockAnchor]);

  // Read through a ref so openRule keeps one identity: it is every card's
  // onDeepDive, and a new function would re-render all of them (memo) on
  // each open and close.
  const dockedRef = useRef(docked);
  useLayoutEffect(() => {
    dockedRef.current = docked;
  }, [docked]);

  const openRule = useCallback((ruleId: string) => {
    // Start the async prose chunk before the state update renders the drawer.
    void import("@/data/deep-dive-builder");
    if (!dockedRef.current) captureDockAnchor(ruleId);
    setHoldDock(false);
    setActiveRuleId(ruleId);
    syncRuleParam(ruleId);
  }, [captureDockAnchor, syncRuleParam, setActiveRuleId]);

  const closeRule = useCallback(() => {
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) {
      captureDockAnchor(activeRuleId);
    } else {
      closedRuleId.current = activeRuleId;
      setHoldDock(true);
    }
    setActiveRuleId(null);
    syncRuleParam(null);
  }, [activeRuleId, captureDockAnchor, syncRuleParam, setActiveRuleId]);

  const filteredRules = useMemo(() => filterRules(deferredQuery), [deferredQuery]);

  // Filtering shortens the page. A reader scrolled deep into the catalog
  // would be clamped to the new bottom, mid-results or past them, so the
  // first results are brought into view in the same commit that renders
  // them. Where they were reading is kept, and clearing the search returns
  // them there, before either change paints.
  const preSearch = useRef<{ scrollY: number; anchor: ReadingAnchor | null } | null>(null);
  // Whether the committed grid is filtered, as of the last deferred commit.
  const filteredGrid = useRef(false);

  useLayoutEffect(() => {
    // `query` commits before `deferredQuery` re-renders the grid, so this
    // still sees the unfiltered page.
    if (query.trim()) {
      if (!preSearch.current) {
        preSearch.current = { scrollY: window.scrollY, anchor: findReadingAnchor(null) };
      }
    } else if (!filteredGrid.current) {
      // Typed and deleted before the grid ever filtered: nothing moved, and
      // the next search must snapshot where the reader is by then.
      preSearch.current = null;
    }
  }, [query]);

  // A blank query (a typed space) keeps every rule, so it counts as no search.
  const searching = deferredQuery.trim() !== "";

  useLayoutEffect(() => {
    filteredGrid.current = searching;
    if (!searching) {
      const saved = preSearch.current;
      preSearch.current = null;
      if (!saved) return;
      window.scrollTo({ top: saved.scrollY, behavior: "instant" });
      // Cards that re-mount above the reader start at their placeholder
      // height, so the same scrollY can land a little off the card they left.
      const el = rulesContainerRef.current;
      if (saved.anchor && el) return settleReadingAnchor(saved.anchor, el);
      return;
    }

    const el = rulesContainerRef.current;
    if (!el) return;
    // The first results may have been skipped by content-visibility, which
    // would paint them blank for a frame as they arrive. Render them now.
    const first = Array.from(el.querySelectorAll<HTMLElement>("article.rule-card")).slice(0, 3);
    first.forEach((card) => {
      card.style.contentVisibility = "visible";
    });
    // Land 16px below the sticky mobile header (zero tall from md up), the
    // same place the sheet's search submit aims, so it adds no second move.
    const header = document.querySelector<HTMLElement>("[data-sticky-header]");
    const offset = (header?.offsetHeight ?? 0) + 16;
    const top = el.getBoundingClientRect().top;
    if (top < offset) window.scrollTo({ top: top + window.scrollY - offset, behavior: "instant" });

    let second = 0;
    const frame = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => first.forEach((card) => {
        card.style.contentVisibility = "";
      }));
    });
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(second);
      first.forEach((card) => {
        card.style.contentVisibility = "";
      });
    };
  }, [deferredQuery, searching]);

  useKeepActiveCardInView(activeRuleId);

  const grouped = useMemo(
    () =>
      categories
        .map((cat) => ({
          ...cat,
          rules: filteredRules.filter((rule) => rule.category === cat.id),
        }))
        .filter((group) => group.rules.length > 0),
    [filteredRules]
  );

  const categoryById = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category.name]));
  }, []);

  const activeRule = useMemo(() => {
    return rules.find((rule) => rule.id === deferredRuleId) ?? null;
  }, [deferredRuleId]);

  const activeCategoryName = activeRule
    ? categoryById.get(activeRule.category) ?? ""
    : "";

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-canvas md:flex-row">
      <Sidebar />

      {/* The lane holds both landmarks: main for the catalog, and the footer
          after it as contentinfo, at the same width and spacing. */}
      <div
        className="main-lane-shell w-full flex-1 space-y-8 px-3 py-5 sm:px-4 sm:py-7 md:space-y-12 md:py-8"
        data-drawer-open={docked ? "true" : undefined}
      >
        {/* Focus lands here from the skip link and when the drawer closes;
            it is a landmark, not a control, so it takes no ring. */}
        <main
          id="main-content"
          tabIndex={-1}
          className="space-y-8 outline-none md:space-y-12"
        >
          <div className="mx-auto w-full max-w-[920px]">
            <Header />
          </div>

          <MatchAnnouncer query={deferredQuery} count={filteredRules.length} />

          <section
            ref={rulesContainerRef}
            aria-label="Rule catalog"
            className="space-y-14 outline-none md:space-y-20"
            id="rulesContainer"
            tabIndex={-1}
          >
            {grouped.length === 0 ? (
              <div className="glass reveal mx-auto w-full max-w-[920px] rounded-card p-10 text-center">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-fill">
                  <SearchX aria-hidden="true" className="size-6 text-ink-faint" />
                </div>
                <h2 className="break-words text-lg font-semibold text-ink">
                  No rules match “{deferredQuery.trim()}”
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-pretty text-sm leading-6 text-ink-secondary">
                  Try a broader term — “button”, “font”, or “color” — or clear the
                  search to see all {rules.length} rules.
                </p>
                <Button variant="secondary" onClick={clearSearch} className="mt-6">
                  Clear search
                </Button>
              </div>
            ) : (
              grouped.map((group) => (
                <section
                  key={group.id}
                  id={group.id}
                  className="mx-auto w-full max-w-[920px] scroll-mt-20 md:scroll-mt-10"
                >
                  {/* The count sits on the heading's baseline: the heading is the
                      row's only baseline participant (self-baseline), so the
                      icon can stay optically centred on the heading's line. */}
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-6 shrink-0 items-center justify-center sm:h-8">
                        <CategoryIcon
                          categoryId={group.id}
                          className="h-5 w-5 -translate-y-px"
                        />
                      </span>
                      <h2 className="self-baseline text-xl font-semibold leading-7 text-ink sm:text-2xl sm:leading-8">
                        {group.name}
                      </h2>
                    </div>

                    <span className="whitespace-nowrap text-sm tabular-nums text-ink-muted">
                      {group.rules.length} {group.rules.length === 1 ? "rule" : "rules"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:gap-6">
                    {group.rules.map((rule) => (
                      <RuleCard
                        key={rule.id}
                        rule={rule}
                        isActive={rule.id === activeRuleId}
                        onDeepDive={openRule}
                      />
                    ))}
                  </div>
                </section>
              ))
            )}
          </section>
        </main>

        <footer className="mx-auto flex w-full max-w-[920px] flex-col gap-2 pt-6 pb-10 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p className="text-pretty leading-6">
            Built for consistency. Break rules only after mastering them.
          </p>
          <ul className="-mx-2 flex flex-wrap items-center">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="inline-flex min-h-11 items-center rounded-full px-2 hover:text-ink [@media(pointer:fine)]:min-h-8"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </footer>
      </div>

      <RuleDrawer
        activeRule={activeRule}
        activeCategoryName={activeCategoryName}
        activeRuleId={activeRuleId}
        contentPending={Boolean(activeRuleId && activeRuleId !== deferredRuleId)}
        onClose={closeRule}
        onNavigate={openRule}
      />
    </div>
  );
}
