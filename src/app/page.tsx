"use client";

import type { CSSProperties } from "react";
import { useMemo } from "react";
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

const overviewCards = [
  {
    label: "Coverage",
    detail: "Curated rules grounded in product UI best practices.",
  },
  {
    label: "Structure",
    detail: "Typography, layout, color, components, forms, and system logic.",
  },
  {
    label: "Usage",
    detail: "Fast scanning, tag filters, and encoded do/don't patterns.",
  },
];

const categoryIcons = new Map([
  ["typography", Type],
  ["layout", LayoutGrid],
  ["color", Palette],
  ["components", BoxSelect],
  ["forms", TextCursorInput],
  ["system", Cpu],
]);

export default function Home() {
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

  let delayIndex = 0;

  return (
    <div className="mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 gap-6 px-4 pb-16 pt-6 md:grid-cols-[280px_minmax(0,1fr)] md:px-6">
      <aside className="glass flex flex-col rounded-2xl p-5 md:sticky md:top-6 md:h-[calc(100vh-3rem)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
              <Layers aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-700 dark:text-slate-400">axiom</p>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                UI Logic Repository
              </h1>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="searchInput"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-400"
            >
              Search
            </label>
            <div className="relative mt-2">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-700 dark:text-slate-500"
              />
              <input
                type="search"
                id="searchInput"
                name="search"
                autoComplete="off"
                placeholder="Search “button”…"
                value={query}
                onChange={(event) => {
                  const nextQuery = event.target.value;
                  if (nextQuery === query) {
                    return;
                  }
                  updateParams({ q: nextQuery });
                }}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-500 shadow-sm outline-none transition focus-visible:border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus-visible:border-slate-600 dark:focus-visible:ring-slate-700"
              />
            </div>
            <p className="mt-2 text-xs text-slate-700 dark:text-slate-400">
              {filteredRules.length} decisions shown
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-700 dark:text-slate-400">
              Snapshot
            </p>
            <div className="mt-3 grid gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-400">Decision Count</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {rules.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-400">Categories</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {categories.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-400">Last Updated</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-1 flex-col overflow-hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-400">
            Categories
          </p>
          <nav className="sidebar-scroll mt-3 flex-1 space-y-1 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-slate-100 dark:group-hover:text-slate-900">
                  {(() => {
                    const Icon = categoryIcons.get(cat.id) ?? Layers;
                    return <Icon aria-hidden="true" className="h-4 w-4" />;
                  })()}
                </span>
                <span>{cat.name}</span>
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-auto rounded-xl border border-slate-200 bg-slate-900 px-4 py-4 text-white dark:border-slate-700 dark:bg-slate-950">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Guidance</p>
          <p className="mt-2 text-sm text-slate-200">
            Treat every decision as a repeatable system. Break the rule only after you
            understand it.
          </p>
        </div>
      </aside>

      <main id="main-content" tabIndex={-1} className="space-y-12">
        <header className="glass rounded-3xl p-8 md:p-12">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-700 dark:text-slate-400">
            <span className="chip rounded-full px-3 py-1">Design Systems</span>
            <span className="chip rounded-full px-3 py-1">Product Heuristics</span>
            <span className="chip rounded-full px-3 py-1">UX Logic</span>
          </div>
          <h2 className="mt-6 text-4xl font-semibold text-slate-900 md:text-5xl dark:text-slate-100">
            The Decision Engine Behind Sharp, Consistent Interfaces.
          </h2>
          <p className="mt-4 max-w-2xl text-base text-slate-900 md:text-lg dark:text-slate-300">
            Stop relying on intuition. This repository captures the micro-decisions that
            define durable design systems across typography, layout, color, and interaction
            patterns.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              type="button"
            >
              Start Exploring
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800"
              type="button"
            >
              <Download aria-hidden="true" className="h-4 w-4" />
              Export Notes
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {overviewCards.map((item) => (
            <div key={item.label} className="glass rounded-2xl p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-800 dark:text-slate-400">
                {item.label}
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {item.label === "Coverage"
                  ? `${rules.length} decisions`
                  : item.label === "Structure"
                    ? `${categories.length} systems`
                    : "Reference-ready"}
              </h3>
              <p className="mt-2 text-sm text-slate-800 dark:text-slate-400">{item.detail}</p>
            </div>
          ))}
        </section>

        <section className="space-y-10" id="rulesContainer">
          {grouped.length === 0 ? (
            <div className="glass reveal rounded-2xl p-10 text-center" style={{ "--delay": "40ms" } as CSSProperties}>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <SearchX aria-hidden="true" className="h-7 w-7 text-slate-700 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                No Logical Decisions Found
              </h3>
              <p className="mt-2 text-sm text-slate-800 dark:text-slate-400">
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
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-700 dark:text-slate-400">
                        {group.id}
                      </p>
                      <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
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
                            <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                              {rule.title}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {rule.tags.map((tag) => (
                                <span
                                  key={`${rule.id}-${tag}`}
                                  className="chip rounded-full px-3 py-1 text-xs font-medium text-slate-800 dark:text-slate-300"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          <p className="mt-4 text-sm leading-relaxed text-slate-900 dark:text-slate-300">
                            {rule.desc}
                          </p>

                          <div className="mt-6 grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-400/30 dark:bg-emerald-950/40">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-emerald-600" />
                                <span className="badge-do rounded-full px-3 py-1 text-[11px] font-semibold uppercase">
                                  Do this
                                </span>
                              </div>
                              <code className="mt-3 block rounded-lg border border-emerald-100 bg-white/70 px-3 py-2 text-sm text-slate-800 dark:border-emerald-400/30 dark:bg-emerald-950/40 dark:text-emerald-100">
                                {rule.do}
                              </code>
                            </div>
                            <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-4 dark:border-rose-400/30 dark:bg-rose-950/40">
                              <div className="flex items-center gap-2">
                                <XCircle aria-hidden="true" className="h-4 w-4 text-rose-600" />
                                <span className="badge-dont rounded-full px-3 py-1 text-[11px] font-semibold uppercase">
                                  Avoid this
                                </span>
                              </div>
                              <code className="mt-3 block rounded-lg border border-rose-100 bg-white/70 px-3 py-2 text-sm text-slate-800 opacity-70 dark:border-rose-400/30 dark:bg-rose-950/40 dark:text-rose-100">
                                {rule.dont}
                              </code>
                            </div>
                          </div>
                          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm dark:border-slate-700">
                            <span className="text-xs uppercase tracking-[0.2em] text-slate-700 dark:text-slate-500">
                              Deep Dive
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (rule.id !== activeRuleId) {
                                  updateParams({ rule: rule.id });
                                }
                              }}
                              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
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

        <footer className="glass rounded-2xl p-8 text-center text-sm text-slate-700 dark:text-slate-400">
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
          <Drawer.Overlay className="fixed inset-0 bg-slate-950/50 dark:bg-black/70" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 h-[90vh] overscroll-contain rounded-t-3xl border border-slate-200 bg-white shadow-2xl outline-none dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-full max-w-4xl flex-col">
              <Drawer.Title className="sr-only">
                {activeRule?.title ?? "Rule Details"}
              </Drawer.Title>
              <div className="flex justify-center pt-4">
                <Drawer.Handle className="h-1.5 w-14 rounded-full bg-slate-300 dark:bg-slate-600" />
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 px-8 py-6 dark:border-slate-800">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-700 dark:text-slate-500">
                    {activeCategoryName}
                  </p>
                  <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                    {activeRule?.title ?? "Select a Rule"}
                  </h3>
                </div>
                <Drawer.Close className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-800">
                  Close
                </Drawer.Close>
              </div>
              <div className="flex-1 space-y-6 overflow-y-auto px-8 py-6">
                {activeRule ? (
                  <div className="flex flex-wrap gap-2">
                    {activeRule.tags.map((tag) => (
                      <span
                        key={`${activeRule.id}-${tag}`}
                        className="chip rounded-full px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300"
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
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-700 dark:text-slate-500">
                            {section.title}
                          </p>
                        ) : null}
                        <p className="mt-2 text-sm leading-relaxed text-slate-900 dark:text-slate-300">
                          {section.content}
                        </p>
                      </div>
                    );
                  }

                  if (section.type === "list") {
                    return (
                      <div key={`${activeRuleId}-${section.title ?? "list"}`}>
                        {section.title ? (
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-700 dark:text-slate-500">
                            {section.title}
                          </p>
                        ) : null}
                        <ul className="mt-3 space-y-2 text-sm text-slate-900 dark:text-slate-300">
                          {section.items.map((item) => (
                            <li key={item} className="flex gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-700 dark:bg-slate-500" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }

                  return (
                    <div key={`${activeRuleId}-${section.title ?? "code"}`}>
                      {section.title ? (
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-700 dark:text-slate-500">
                          {section.title}
                        </p>
                      ) : null}
                      <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-900 px-5 py-4 text-sm text-slate-100 dark:border-slate-800 dark:bg-slate-950">
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
