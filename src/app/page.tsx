"use client";

import type { CSSProperties } from "react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BoxSelect,
  CheckCircle2,
  Cpu,
  Download,
  Expand,
  Layers,
  LayoutGrid,
  Palette,
  Search,
  SearchX,
  TextCursorInput,
  Type,
  XCircle,
} from "lucide-react";
import { Drawer } from "vaul";
import { buildDeepDive, categories, rules } from "@/data/ui-logic";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const tips = [
  "Treat every decision as a repeatable system.",
  "Break the rule only after you understand it.",
  "Typography, layout, color, components, forms, and system logic.",
  "Fast scanning, tag filters, and encoded do/don't patterns.",
  "Curated rules grounded in product UI best practices.",
];

const categoryIcons = new Map([
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
  const isDrawerOpen = Boolean(activeRuleId);
  const searchLower = query.trim().toLowerCase();

  const updateParams = (updates: { q?: string; rule?: string | null }) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (updates.q !== undefined) {
      if (updates.q) {
        nextParams.set("q", updates.q);
      } else {
        nextParams.delete("q");
      }
    }

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

  const activeDeepDive = activeRule ? buildDeepDive(activeRule) : [];
  const formattedDate = useMemo(() => {
    const parts = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
    }).formatToParts(new Date());
    const lookup = parts.reduce<Record<string, string>>((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});
    return `${lookup.weekday} ${lookup.month} ${lookup.day}`;
  }, []);

  // Rotating tips
  const [tipIndex, setTipIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  let delayIndex = 0;

  return (
    <div className="mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 gap-6 px-4 pb-16 pt-6 md:grid-cols-[280px_minmax(0,1fr)] md:px-6">
      <aside className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 transition-colors duration-200 md:sticky md:top-6 md:h-[calc(100vh-3rem)] dark:border-neutral-800 dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
              <Layers aria-hidden="true" className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">axiom</p>
              <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                UI Logic
              </h1>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Search */}
        <div className="mt-6">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
            />
            <input
              type="search"
              id="searchInput"
              name="search"
              autoComplete="off"
              placeholder="Search decisions..."
              value={query}
              onChange={(event) => {
                const nextQuery = event.target.value;
                if (nextQuery === query) {
                  return;
                }
                updateParams({ q: nextQuery });
              }}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors duration-200 focus:border-neutral-300 focus:bg-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-600 dark:focus:bg-neutral-800"
            />
          </div>
          <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
            {filteredRules.length} decisions
          </p>
        </div>

        {/* Categories */}
        <div className="mt-6 flex flex-1 flex-col overflow-hidden">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
            Categories
          </p>
          <nav className="sidebar-scroll mt-3 flex-1 space-y-0.5 overflow-y-auto">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="group flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm text-neutral-600 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-100 text-neutral-500 transition-colors duration-150 group-hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:group-hover:bg-neutral-700">
                  {(() => {
                    const Icon = categoryIcons.get(cat.id) ?? Layers;
                    return <Icon aria-hidden="true" className="h-3.5 w-3.5" />;
                  })()}
                </span>
                <span className="font-medium">{cat.name}</span>
              </a>
            ))}
          </nav>
        </div>

        {/* Tip */}
        <div className="mt-4 rounded-lg bg-neutral-100 px-4 py-3 dark:bg-neutral-800">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Tip</p>
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 transition-opacity duration-300 dark:text-neutral-300">
            {tips[tipIndex]}
          </p>
        </div>
      </aside>

      <main id="main-content" tabIndex={-1} className="space-y-12">
        <header className="glass rounded-3xl p-8 md:p-12">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">
            <span className="chip rounded-full px-3 py-1">Design Systems</span>
            <span className="chip rounded-full px-3 py-1">Product Heuristics</span>
            <span className="chip rounded-full px-3 py-1">UX Logic</span>
          </div>
          <h2 className="mt-6 text-4xl font-semibold text-neutral-900 md:text-5xl dark:text-neutral-100">
            The Decision Engine Behind Sharp, Consistent Interfaces.
          </h2>
          <p className="mt-4 max-w-2xl text-base text-neutral-600 md:text-lg dark:text-neutral-300">
            Stop relying on intuition. This repository captures the micro-decisions that
            define durable design systems across typography, layout, color, and interaction
            patterns.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              type="button"
            >
              Start Exploring
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-semibold text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
              type="button"
            >
              <Download aria-hidden="true" className="h-4 w-4" />
              Export Notes
            </button>
          </div>
        </header>

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
              const Icon = categoryIcons.get(group.id) ?? Layers;
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
                        <article
                          key={rule.id}
                          className="rule-card glass reveal rounded-2xl p-6"
                          style={{ "--delay": `${delayIndex * 40}ms` } as CSSProperties}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <h4 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                              {rule.title}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {rule.tags.map((tag) => (
                                <span
                                  key={`${rule.id}-${tag}`}
                                  className="chip rounded-full px-3 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                            {rule.desc}
                          </p>

                          <div className="mt-6 grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/50">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                                  Do this
                                </span>
                              </div>
                              <code className="mt-3 block rounded-lg border border-emerald-100 bg-white px-3 py-2 text-sm text-neutral-700 dark:border-emerald-900 dark:bg-neutral-900 dark:text-neutral-200">
                                {rule.do}
                              </code>
                            </div>
                            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/50">
                              <div className="flex items-center gap-2">
                                <XCircle aria-hidden="true" className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                                <span className="rounded-full bg-rose-100 px-3 py-1 text-[11px] font-semibold uppercase text-rose-700 dark:bg-rose-900 dark:text-rose-300">
                                  Avoid this
                                </span>
                              </div>
                              <code className="mt-3 block rounded-lg border border-rose-100 bg-white px-3 py-2 text-sm text-neutral-500 line-through dark:border-rose-900 dark:bg-neutral-900 dark:text-neutral-400">
                                {rule.dont}
                              </code>
                            </div>
                          </div>
                          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-4 text-sm dark:border-neutral-700">
                            <span className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-500">
                              Deep Dive
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (rule.id !== activeRuleId) {
                                  updateParams({ rule: rule.id });
                                }
                              }}
                              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-sm font-semibold text-neutral-700 transition-colors duration-200 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-neutral-500"
                            >
                              <Expand aria-hidden="true" className="h-4 w-4" />
                              More About This
                            </button>
                          </div>
                        </article>
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
      </main>

      <Drawer.Root
        open={isDrawerOpen}
        onOpenChange={(open) => {
          if (!open && activeRuleId) {
            updateParams({ rule: null });
          }
        }}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-neutral-950/50 dark:bg-black/70" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 h-[90vh] overscroll-contain rounded-t-3xl border border-neutral-200 bg-white outline-none dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mx-auto flex h-full max-w-4xl flex-col">
              <Drawer.Title className="sr-only">
                {activeRule?.title ?? "Rule Details"}
              </Drawer.Title>
              <div className="flex justify-center pt-4">
                <Drawer.Handle className="h-1.5 w-14 rounded-full bg-neutral-300 dark:bg-neutral-600" />
              </div>
              <div className="flex items-center justify-between border-b border-neutral-200 px-8 py-6 dark:border-neutral-800">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-500">
                    {activeCategoryName}
                  </p>
                  <h3 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                    {activeRule?.title ?? "Select a Rule"}
                  </h3>
                </div>
                <Drawer.Close className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:bg-neutral-800">
                  Close
                </Drawer.Close>
              </div>
              <div className="flex-1 space-y-6 overflow-y-auto px-8 py-6">
                {activeRule ? (
                  <div className="flex flex-wrap gap-2">
                    {activeRule.tags.map((tag) => (
                      <span
                        key={`${activeRule.id}-${tag}`}
                        className="chip rounded-full px-3 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                {activeDeepDive.map((section) => {
                  if (section.type === "text") {
                    return (
                      <div key={`${activeRuleId}-${section.title ?? section.content}`}>
                        {section.title ? (
                          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-500">
                            {section.title}
                          </p>
                        ) : null}
                        <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                          {section.content}
                        </p>
                      </div>
                    );
                  }

                  if (section.type === "list") {
                    return (
                      <div key={`${activeRuleId}-${section.title ?? "list"}`}>
                        {section.title ? (
                          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-500">
                            {section.title}
                          </p>
                        ) : null}
                        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-neutral-600 dark:text-neutral-300">
                          {section.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  }

                  return (
                    <div key={`${activeRuleId}-${section.title ?? "code"}`}>
                      {section.title ? (
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-700 dark:text-neutral-500">
                          {section.title}
                        </p>
                      ) : null}
                      <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-neutral-200 bg-neutral-100 px-5 py-4 text-sm text-neutral-800 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100">
                        <code>{section.code}</code>
                      </pre>
                    </div>
                  );
                })}
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}

function HomeLoading() {
  return (
    <div className="mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 gap-6 px-4 pb-16 pt-6 md:grid-cols-[280px_minmax(0,1fr)] md:px-6">
      <aside className="glass flex flex-col rounded-2xl p-5 md:sticky md:top-6 md:h-[calc(100vh-3rem)]">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-neutral-200 dark:bg-neutral-700" />
            <div className="space-y-2">
              <div className="h-3 w-16 rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="h-4 w-32 rounded bg-neutral-200 dark:bg-neutral-700" />
            </div>
          </div>
        </div>
      </aside>
      <main className="space-y-12">
        <div className="glass rounded-3xl p-8 md:p-12 animate-pulse">
          <div className="h-8 w-48 rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="mt-6 h-12 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="mt-4 h-6 w-1/2 rounded bg-neutral-200 dark:bg-neutral-700" />
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
