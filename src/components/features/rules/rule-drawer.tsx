"use client";

import {
  AlertTriangle,
  BoxSelect,
  CheckCircle2,
  Cpu,
  LayoutGrid,
  ListChecks,
  Palette,
  Sparkles,
  Tags,
  TextCursorInput,
  Type,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Drawer } from "vaul";
import { RulePreview } from "@/components/features/rules/rule-preview";
import type { DeepDiveSection, Rule } from "@/data/ui-logic";
import { buildDeepDive } from "@/data/ui-logic";

interface RuleDrawerProps {
  activeRule: Rule | null;
  activeCategoryName: string;
  activeRuleId: string | null;
  onClose: () => void;
}

type DrawerTheme = {
  hero: string;
  glow: string;
  badge: string;
  panel: string;
};

const defaultTheme: DrawerTheme = {
  hero:
    "border-neutral-200 bg-gradient-to-br from-neutral-100 via-white to-neutral-50 dark:border-neutral-700 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-950",
  glow:
    "bg-gradient-to-br from-neutral-200/70 via-white/50 to-transparent dark:from-neutral-700/50 dark:via-neutral-800/20 dark:to-transparent",
  badge:
    "border-neutral-200 bg-white/80 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-200",
  panel:
    "border-neutral-200 bg-white/90 dark:border-neutral-700 dark:bg-neutral-900/80",
};

const categoryThemes: Record<string, DrawerTheme> = {
  typography: {
    hero:
      "border-sky-200/80 bg-gradient-to-br from-sky-100 via-white to-cyan-100 dark:border-sky-900/70 dark:from-sky-950/40 dark:via-neutral-900 dark:to-cyan-950/40",
    glow:
      "bg-gradient-to-br from-sky-300/40 via-cyan-200/40 to-transparent dark:from-sky-500/20 dark:via-cyan-500/20 dark:to-transparent",
    badge:
      "border-sky-200 bg-sky-50/90 text-sky-700 dark:border-sky-900/70 dark:bg-sky-950/60 dark:text-sky-200",
    panel:
      "border-sky-200/80 bg-white/90 dark:border-sky-900/70 dark:bg-neutral-900/80",
  },
  layout: {
    hero:
      "border-amber-200/80 bg-gradient-to-br from-amber-100 via-white to-orange-100 dark:border-amber-900/70 dark:from-amber-950/40 dark:via-neutral-900 dark:to-orange-950/40",
    glow:
      "bg-gradient-to-br from-amber-300/40 via-orange-200/40 to-transparent dark:from-amber-500/20 dark:via-orange-500/20 dark:to-transparent",
    badge:
      "border-amber-200 bg-amber-50/90 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/60 dark:text-amber-200",
    panel:
      "border-amber-200/80 bg-white/90 dark:border-amber-900/70 dark:bg-neutral-900/80",
  },
  color: {
    hero:
      "border-teal-200/80 bg-gradient-to-br from-teal-100 via-white to-cyan-100 dark:border-teal-900/70 dark:from-teal-950/40 dark:via-neutral-900 dark:to-cyan-950/40",
    glow:
      "bg-gradient-to-br from-teal-300/40 via-cyan-200/40 to-transparent dark:from-teal-500/20 dark:via-cyan-500/20 dark:to-transparent",
    badge:
      "border-teal-200 bg-teal-50/90 text-teal-700 dark:border-teal-900/70 dark:bg-teal-950/60 dark:text-teal-200",
    panel:
      "border-teal-200/80 bg-white/90 dark:border-teal-900/70 dark:bg-neutral-900/80",
  },
  components: {
    hero:
      "border-orange-200/80 bg-gradient-to-br from-orange-100 via-white to-amber-100 dark:border-orange-900/70 dark:from-orange-950/40 dark:via-neutral-900 dark:to-amber-950/40",
    glow:
      "bg-gradient-to-br from-orange-300/40 via-amber-200/40 to-transparent dark:from-orange-500/20 dark:via-amber-500/20 dark:to-transparent",
    badge:
      "border-orange-200 bg-orange-50/90 text-orange-700 dark:border-orange-900/70 dark:bg-orange-950/60 dark:text-orange-200",
    panel:
      "border-orange-200/80 bg-white/90 dark:border-orange-900/70 dark:bg-neutral-900/80",
  },
  forms: {
    hero:
      "border-emerald-200/80 bg-gradient-to-br from-emerald-100 via-white to-lime-100 dark:border-emerald-900/70 dark:from-emerald-950/40 dark:via-neutral-900 dark:to-lime-950/40",
    glow:
      "bg-gradient-to-br from-emerald-300/40 via-lime-200/40 to-transparent dark:from-emerald-500/20 dark:via-lime-500/20 dark:to-transparent",
    badge:
      "border-emerald-200 bg-emerald-50/90 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/60 dark:text-emerald-200",
    panel:
      "border-emerald-200/80 bg-white/90 dark:border-emerald-900/70 dark:bg-neutral-900/80",
  },
  system: {
    hero:
      "border-blue-200/80 bg-gradient-to-br from-blue-100 via-white to-cyan-100 dark:border-blue-900/70 dark:from-blue-950/40 dark:via-neutral-900 dark:to-cyan-950/40",
    glow:
      "bg-gradient-to-br from-blue-300/40 via-cyan-200/40 to-transparent dark:from-blue-500/20 dark:via-cyan-500/20 dark:to-transparent",
    badge:
      "border-blue-200 bg-blue-50/90 text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/60 dark:text-blue-200",
    panel:
      "border-blue-200/80 bg-white/90 dark:border-blue-900/70 dark:bg-neutral-900/80",
  },
};

const categoryIcons: Record<string, LucideIcon> = {
  typography: Type,
  layout: LayoutGrid,
  color: Palette,
  components: BoxSelect,
  forms: TextCursorInput,
  system: Cpu,
};

export function RuleDrawer({ activeRule, activeCategoryName, activeRuleId, onClose }: RuleDrawerProps) {
  const activeDeepDive = activeRule ? buildDeepDive(activeRule) : [];
  const isOpen = Boolean(activeRuleId);

  const summary = findTextSection(activeDeepDive, "Summary") ?? activeRule?.desc ?? "";
  const whyItMatters = findTextSection(activeDeepDive, "Why it matters");
  const riskWhenIgnored = findTextSection(activeDeepDive, "Risk when ignored");
  const implementationNotes = findListSection(activeDeepDive, "Implementation notes");
  const reviewPrompts = findListSection(activeDeepDive, "Design review prompts");
  const relatedSignals = findListSection(activeDeepDive, "Related signals");
  const recommended = findCodeSection(activeDeepDive, "Recommended") ?? activeRule?.do ?? "";
  const avoid = findCodeSection(activeDeepDive, "Avoid") ?? activeRule?.dont ?? "";

  const theme = activeRule ? categoryThemes[activeRule.category] ?? defaultTheme : defaultTheme;
  const CategoryIcon = activeRule ? categoryIcons[activeRule.category] ?? Sparkles : Sparkles;
  const categoryLabel = activeCategoryName || "Design Rule";

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && activeRuleId) {
          onClose();
        }
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-neutral-950/60 backdrop-blur-[2px] dark:bg-black/70" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 h-[92vh] overscroll-contain rounded-t-[32px] border border-neutral-200 bg-neutral-50 outline-none dark:border-neutral-800 dark:bg-neutral-950">
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col px-4 pb-4 md:px-8">
            <Drawer.Title className="sr-only">{activeRule?.title ?? "Rule details"}</Drawer.Title>

            <div className="flex justify-center py-4">
              <Drawer.Handle className="h-1.5 w-14 rounded-full bg-neutral-300 dark:bg-neutral-600" />
            </div>

            <div className="flex-1 overflow-y-auto pb-4">
              {activeRule ? (
                <div className="space-y-6">
                  <section className={`relative overflow-hidden rounded-3xl border p-5 md:p-7 ${theme.hero}`}>
                    <div className={`pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full blur-3xl ${theme.glow}`} />

                    <div className="relative space-y-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${theme.badge}`}>
                            <CategoryIcon aria-hidden="true" className="h-5 w-5" />
                          </div>
                          <div className="max-w-3xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-300">
                              Rule Deep Dive
                            </p>
                            <h3 className="mt-2 text-3xl font-semibold leading-tight text-neutral-900 dark:text-neutral-50">
                              {activeRule.title}
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                              {summary}
                            </p>
                          </div>
                        </div>

                        <Drawer.Close className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white/90 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-neutral-400 hover:bg-white dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-200 dark:hover:border-neutral-500 dark:hover:bg-neutral-900">
                          <X aria-hidden="true" className="h-4 w-4" />
                          Close
                        </Drawer.Close>
                      </div>

                      <div className="grid gap-3 md:grid-cols-3">
                        <div className={`rounded-2xl border p-4 ${theme.panel}`}>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                            Category
                          </p>
                          <p className="mt-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">{categoryLabel}</p>
                        </div>
                        <div className={`rounded-2xl border p-4 ${theme.panel}`}>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                            Signals
                          </p>
                          <p className="mt-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                            {activeRule.tags.length} pattern cues
                          </p>
                        </div>
                        <div className={`rounded-2xl border p-4 ${theme.panel}`}>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                            Rule ID
                          </p>
                          <p className="mt-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">{activeRule.id}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                    <section className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <article className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 dark:border-emerald-900/80 dark:from-emerald-950/50 dark:to-neutral-900">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-200">
                              Recommended
                            </p>
                          </div>
                          <div className="mt-4">
                            <RulePreview rule={activeRule} variant="do" size="lg" />
                          </div>
                          <code className="mt-3 block rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm text-neutral-700 dark:border-emerald-900 dark:bg-neutral-900 dark:text-neutral-200">
                            {recommended}
                          </code>
                        </article>

                        <article className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-5 dark:border-rose-900/80 dark:from-rose-950/50 dark:to-neutral-900">
                          <div className="flex items-center gap-2">
                            <XCircle aria-hidden="true" className="h-4 w-4 text-rose-600 dark:text-rose-300" />
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700 dark:text-rose-200">
                              Avoid
                            </p>
                          </div>
                          <div className="mt-4">
                            <RulePreview rule={activeRule} variant="dont" size="lg" />
                          </div>
                          <code className="mt-3 block rounded-xl border border-rose-100 bg-white px-3 py-2 text-sm text-neutral-600 dark:border-rose-900 dark:bg-neutral-900 dark:text-neutral-300">
                            {avoid}
                          </code>
                        </article>
                      </div>

                      <article className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center gap-2">
                          <ListChecks aria-hidden="true" className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                            Implementation Playbook
                          </p>
                        </div>
                        <ul className="mt-4 space-y-3">
                          {implementationNotes.map((item, index) => (
                            <li key={`${item}-${index}`} className="flex gap-3">
                              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[11px] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                                {index + 1}
                              </span>
                              <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{item}</p>
                            </li>
                          ))}
                        </ul>
                      </article>

                      {riskWhenIgnored ? (
                        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/70 dark:bg-amber-950/30">
                          <div className="flex items-center gap-2">
                            <AlertTriangle aria-hidden="true" className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800 dark:text-amber-200">
                              Risk If Ignored
                            </p>
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-amber-900 dark:text-amber-100">{riskWhenIgnored}</p>
                        </article>
                      ) : null}
                    </section>

                    <aside className="space-y-6">
                      {whyItMatters ? (
                        <article className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                          <div className="flex items-center gap-2">
                            <Sparkles aria-hidden="true" className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                              Why This Works
                            </p>
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{whyItMatters}</p>
                        </article>
                      ) : null}

                      <article className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center gap-2">
                          <Tags aria-hidden="true" className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                            Related Signals
                          </p>
                        </div>
                        <div className="mt-4 space-y-2">
                          {relatedSignals.map((item, index) => (
                            <p
                              key={`${item}-${index}`}
                              className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm leading-relaxed text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                            >
                              {item}
                            </p>
                          ))}
                        </div>
                      </article>

                      <article className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center gap-2">
                          <Sparkles aria-hidden="true" className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                            Design Review Prompts
                          </p>
                        </div>
                        <ul className="mt-4 space-y-3">
                          {reviewPrompts.map((item, index) => (
                            <li key={`${item}-${index}`} className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm leading-relaxed text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </article>
                    </aside>
                  </div>
                </div>
              ) : (
                <div className="mx-auto mt-16 max-w-xl rounded-3xl border border-neutral-200 bg-white p-10 text-center dark:border-neutral-800 dark:bg-neutral-900">
                  <h3 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Select a Rule</h3>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                    Open any card to view a richer deep dive with implementation guidance and visual comparisons.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function findTextSection(sections: DeepDiveSection[], title: string): string | null {
  const section = sections.find((item) => item.type === "text" && item.title === title);
  return section?.type === "text" ? section.content : null;
}

function findListSection(sections: DeepDiveSection[], title: string): string[] {
  const section = sections.find((item) => item.type === "list" && item.title === title);
  return section?.type === "list" ? section.items : [];
}

function findCodeSection(sections: DeepDiveSection[], title: string): string | null {
  const section = sections.find((item) => item.type === "code" && item.title === title);
  return section?.type === "code" ? section.code : null;
}
