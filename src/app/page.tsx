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

/**
 * What the prerendered HTML shows until the sidebar hydrates: the mobile
 * header bar and the floating desktop panel, at the live components' exact
 * geometry and surface, with nothing inside. The frame never moves; only its
 * contents arrive.
 */
function SidebarFrame() {
  return (
    <>
      <div
        aria-hidden="true"
        className="sticky top-0 z-40 h-[61px] border-b border-neutral-200 bg-white/80 backdrop-blur-md md:hidden dark:border-neutral-800 dark:bg-neutral-900/80"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 left-0 z-[80] hidden w-[312px] md:block"
      >
        <div className="panel-shadow absolute bottom-5 left-5 top-5 w-[280px] rounded-[28px] border border-neutral-200/80 bg-white/95 dark:border-neutral-800/80 dark:bg-neutral-900/95" />
      </div>
    </>
  );
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
    <div className="flex min-h-screen flex-col bg-neutral-50 md:flex-row dark:bg-neutral-950">
      {/* Temporary: SkillBonus inside the sidebar still calls useSearchParams,
          which would bail the whole page out of the prerender. Delete this
          boundary once it reads window.location.search instead. */}
      <Suspense fallback={<SidebarFrame />}>
        <Sidebar />
      </Suspense>

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

          <section
            ref={rulesContainerRef}
            aria-label="Rule catalog"
            className="space-y-8 outline-none md:space-y-10"
            id="rulesContainer"
            tabIndex={-1}
          >
            {grouped.length === 0 ? (
              <div className="glass reveal mx-auto w-full max-w-[920px] rounded-2xl p-10 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <SearchX aria-hidden="true" className="h-6 w-6 text-neutral-400 dark:text-neutral-500" />
                </div>
                <h2 className="break-words text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  No rules match “{query.trim()}”
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-pretty text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                  Try a broader term — “button”, “font”, or “color” — or clear the
                  search to see all {rules.length} rules.
                </p>
                <button
                  type="button"
                  onClick={clearSearch}
                  className="pressable mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-neutral-200 bg-white px-4 text-xs font-medium text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-950 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:border-neutral-500 dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
                >
                  Clear search
                </button>
              </div>
            ) : (
              grouped.map((group) => (
                <section
                  key={group.id}
                  id={group.id}
                  className="mx-auto w-full max-w-[920px] scroll-mt-20 md:scroll-mt-10"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-6 shrink-0 items-center justify-center sm:h-8">
                        <CategoryIcon
                          categoryId={group.id}
                          className="h-5 w-5 -translate-y-px"
                        />
                      </span>
                      <h2 className="text-xl font-semibold leading-7 text-neutral-900 sm:text-2xl sm:leading-8 dark:text-neutral-100">
                        {group.name}
                      </h2>
                    </div>

                    <span className="whitespace-nowrap rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium tabular-nums text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
                      {group.rules.length} {group.rules.length === 1 ? "rule" : "rules"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:mt-6 md:gap-6">
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

          <footer className="glass mx-auto w-full max-w-[920px] rounded-2xl px-8 py-7 text-center">
            <div aria-hidden="true" className="mx-auto mb-4 h-px w-10 bg-neutral-200 dark:bg-neutral-800" />
            <p className="text-pretty text-sm leading-6 text-neutral-500 dark:text-neutral-400">
              Built for consistency. Break rules only after mastering them.
            </p>
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
