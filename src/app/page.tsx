"use client";

import type { CSSProperties } from "react";
import { Suspense, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Layers, SearchX } from "lucide-react";

import { categories, rules } from "@/data/ui-logic";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { RuleCard } from "@/components/features/rules/rule-card";
import { RuleDrawer } from "@/components/features/rules/rule-drawer";

// Re-importing cleanly for section icons (kept local for now)
import {
  BoxSelect,
  Cpu,
  LayoutGrid,
  Palette,
  TextCursorInput,
  Type,
} from "lucide-react";

const sectionIcons = new Map([
  ["typography", Type],
  ["layout", LayoutGrid],
  ["color", Palette],
  ["components", BoxSelect],
  ["forms", TextCursorInput],
  ["system", Cpu],
]);

function HomeContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const query = searchParams.get("q") ?? "";
  const activeRuleId = searchParams.get("rule");
  const searchLower = query.trim().toLowerCase();

  const updateParams = (updates: { rule?: string | null }) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (updates.rule !== undefined) {
      if (updates.rule) {
        nextParams.set("rule", updates.rule);
      } else {
        nextParams.delete("rule");
      }
    }

    const next = nextParams.toString();
    const nextUrl = next ? `${pathname}?${next}` : pathname;
    router.replace(nextUrl, { scroll: false });
  };

  const filteredRules = useMemo(() => {
    if (!searchLower) {
      return rules;
    }

    return rules.filter(
      (rule) =>
        rule.title.toLowerCase().includes(searchLower) ||
        rule.desc.toLowerCase().includes(searchLower) ||
        rule.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  }, [searchLower]);

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
    return rules.find((rule) => rule.id === activeRuleId) ?? null;
  }, [activeRuleId]);

  const activeCategoryName = activeRule
    ? categoryById.get(activeRule.category) ?? ""
    : "";

  let delayIndex = 0;

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 md:flex-row dark:bg-neutral-950">
      <Sidebar filteredCount={filteredRules.length} />

      <main id="main-content" tabIndex={-1} className="flex-1 md:pl-[280px]">
        <div className="mx-auto max-w-5xl space-y-12 px-4 py-8 md:px-12">
          <Header />

          <section className="space-y-10" id="rulesContainer">
            {grouped.length === 0 ? (
              <div className="glass reveal rounded-2xl p-10 text-center" style={{ "--delay": "40ms" } as CSSProperties}>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <SearchX aria-hidden="true" className="h-7 w-7 text-neutral-400 dark:text-neutral-500" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  No Logical Decisions Found
                </h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  Try searching for “button”, “font”, or “color”.
                </p>
              </div>
            ) : (
              grouped.map((group) => {
                const Icon = sectionIcons.get(group.id) ?? Layers;
                delayIndex += 1;
                return (
                  <section
                    key={group.id}
                    id={group.id}
                    className="reveal scroll-mt-10"
                    style={{ "--delay": `${delayIndex * 40}ms` } as CSSProperties}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900">
                        <Icon aria-hidden="true" className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                          {group.id}
                        </p>
                        <h3 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                          {group.name}
                        </h3>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-6">
                      {group.rules.map((rule) => {
                        delayIndex += 1;
                        return (
                          <RuleCard
                            key={rule.id}
                            rule={rule}
                            activeRuleId={activeRuleId}
                            onDeepDive={(id) => updateParams({ rule: id })}
                            style={{ "--delay": `${delayIndex * 40}ms` } as CSSProperties}
                          />
                        );
                      })}
                    </div>
                  </section>
                );
              })
            )}
          </section>

          <footer className="glass rounded-2xl p-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Built for consistency. Break rules only after mastering them.
          </footer>
        </div>
      </main>

      <RuleDrawer
        activeRule={activeRule}
        activeCategoryName={activeCategoryName}
        activeRuleId={activeRuleId}
        onClose={() => updateParams({ rule: null })}
      />
    </div>
  );
}

function HomeLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 md:flex-row dark:bg-neutral-950">
      {/* Mobile Header Skeleton */}
      <div className="sticky top-0 z-40 flex h-[60px] items-center justify-between border-b border-neutral-200 bg-white/80 px-4 backdrop-blur-md md:hidden dark:border-neutral-800 dark:bg-neutral-900/80">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
        <div className="h-9 w-9 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
      </div>

      {/* Desktop Sidebar Skeleton */}
      <aside className="hidden border-r border-neutral-200 bg-white md:fixed md:inset-y-0 md:flex md:w-[280px] dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex h-full w-full flex-col p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
              <div className="space-y-2">
                <div className="h-3 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-4 w-32 rounded bg-neutral-200 dark:bg-neutral-800" />
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 md:pl-[280px]">
        <div className="mx-auto max-w-5xl space-y-12 px-4 py-8 md:px-12">
          <div className="glass animate-pulse rounded-3xl p-8 md:p-12">
            <div className="h-8 w-48 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="mt-6 h-12 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="mt-4 h-6 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  );
}
