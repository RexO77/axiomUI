// design-system: strict
"use client";

import {
  Suspense,
  useCallback,
  useDeferredValue,
  useEffect,
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
 * view: on a deep link, a click, or arrow-key paging inside the drawer. Below
 * xl the drawer covers the grid and there is nothing to keep in view.
 *
 * A neighbour glides into view. A card more than two screens away (a deep
 * link, mostly) is jumped to: travelling half the catalog is motion for its
 * own sake, and cards skipped by content-visibility only have a placeholder
 * height, so a long smooth scroll aims at a stale position. The jump is
 * re-aimed one frame later, once the card has rendered at its real height.
 */
function useKeepActiveCardInView(activeRuleId: string | null) {
  useEffect(() => {
    if (!activeRuleId || !window.matchMedia("(min-width: 1280px)").matches) {
      return;
    }

    const card = document.getElementById(`rule-${activeRuleId}`);
    if (!card) {
      return;
    }

    const far = Math.abs(card.getBoundingClientRect().top) > window.innerHeight * 2;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!far && !reduced) {
      card.scrollIntoView({ block: "nearest", behavior: "smooth" });
      return;
    }

    card.scrollIntoView({ block: "nearest" });
    const frameId = requestAnimationFrame(() => card.scrollIntoView({ block: "nearest" }));
    return () => cancelAnimationFrame(frameId);
  }, [activeRuleId]);
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

  const openRule = useCallback((ruleId: string) => {
    // Start the async prose chunk before the state update renders the drawer.
    void import("@/data/deep-dive-builder");
    setActiveRuleId(ruleId);
    syncRuleParam(ruleId);
  }, [syncRuleParam, setActiveRuleId]);

  const closeRule = useCallback(() => {
    setActiveRuleId(null);
    syncRuleParam(null);
  }, [syncRuleParam, setActiveRuleId]);

  const filteredRules = useMemo(() => filterRules(query), [query]);

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
    <div className="flex min-h-screen flex-col bg-canvas md:flex-row">
      <Sidebar />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1"
      >
        <div
          className="main-lane-shell w-full space-y-8 px-3 py-5 sm:px-4 sm:py-7 md:space-y-12 md:py-8"
          data-drawer-open={activeRuleId ? "true" : undefined}
        >
          <div className="mx-auto w-full max-w-[920px]">
            <Header />
          </div>

          <MatchAnnouncer query={query} count={filteredRules.length} />

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
                  No rules match “{query.trim()}”
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

          <footer className="mx-auto flex w-full max-w-[920px] flex-col gap-2 pt-6 pb-10 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <p className="text-pretty leading-6">
              Built for consistency. Break rules only after mastering them.
            </p>
            <ul className="-mx-2 flex flex-wrap items-center">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-flex min-h-11 items-center rounded-full px-2 hover:text-ink sm:min-h-8"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </footer>
        </div>
      </main>

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
