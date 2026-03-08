"use client";

import {
  AlertTriangle,
  BoxSelect,
  CheckCircle2,
  Cpu,
  Eye,
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
import { useHaptics } from "@/hooks/use-haptics";

interface RuleDrawerProps {
  activeRule: Rule | null;
  activeCategoryName: string;
  activeRuleId: string | null;
  onClose: () => void;
}

const categoryIcons: Record<string, LucideIcon> = {
  typography: Type,
  layout: LayoutGrid,
  color: Palette,
  components: BoxSelect,
  forms: TextCursorInput,
  system: Cpu,
  accessibility: Eye,
};

export function RuleDrawer({ activeRule, activeCategoryName, activeRuleId, onClose }: RuleDrawerProps) {
  const { tapMedium } = useHaptics();
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

  const CategoryIcon = activeRule ? categoryIcons[activeRule.category] ?? Sparkles : Sparkles;
  const categoryLabel = activeCategoryName || "Design Rule";

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && activeRuleId) {
          tapMedium();
          onClose();
        }
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-neutral-950/50 backdrop-blur-[1px] dark:bg-black/60" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 h-[96dvh] overscroll-contain rounded-t-[24px] border border-neutral-200 bg-neutral-50 outline-none sm:h-[94vh] dark:border-neutral-800 dark:bg-neutral-950">
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col px-4 pb-4 sm:pb-6 md:px-8">
            <Drawer.Title className="sr-only">{activeRule?.title ?? "Rule details"}</Drawer.Title>

            <div className="flex justify-center py-3 sm:py-4">
              <Drawer.Handle className="h-1.5 w-14 rounded-full bg-neutral-300 dark:bg-neutral-600" />
            </div>

            <div className="drawer-scroll flex-1 overflow-y-auto pb-2">
              {activeRule ? (
                <div className="space-y-4 sm:space-y-6">
                  <section className="relative rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 md:p-7 dark:border-neutral-800 dark:bg-neutral-900">
                    <Drawer.Close className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 transition-colors hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-neutral-600">
                      <X aria-hidden="true" className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </Drawer.Close>

                    <div className="pr-12">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                          <CategoryIcon aria-hidden="true" className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 max-w-3xl">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                            Rule Deep Dive
                          </p>
                          <h3 className="mt-2 text-2xl font-semibold leading-tight text-neutral-900 sm:text-3xl dark:text-neutral-50">
                            {activeRule.title}
                          </h3>
                          <p className="mt-3 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
                            {summary}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      <MetaBlock label="Category" value={categoryLabel} featured />
                      <MetaBlock label="Signals" value={`${activeRule.tags.length} pattern cues`} />
                      <MetaBlock label="Rule ID" value={activeRule.id} />
                    </div>
                  </section>

                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-6">
                    <section className="space-y-4 sm:space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <article className="rounded-2xl border border-emerald-200/70 bg-white p-4 sm:p-5 dark:border-emerald-900/40 dark:bg-neutral-900">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-200">
                              Recommended
                            </p>
                          </div>
                          <div className="mt-4">
                            <RulePreview rule={activeRule} variant="do" size="lg" />
                          </div>
                          <code className="mt-3 block rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200">
                            {recommended}
                          </code>
                        </article>

                        <article className="rounded-2xl border border-rose-200/70 bg-white p-4 sm:p-5 dark:border-rose-900/40 dark:bg-neutral-900">
                          <div className="flex items-center gap-2">
                            <XCircle aria-hidden="true" className="h-4 w-4 text-rose-600 dark:text-rose-300" />
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-700 dark:text-rose-200">
                              Avoid
                            </p>
                          </div>
                          <div className="mt-4">
                            <RulePreview rule={activeRule} variant="dont" size="lg" />
                          </div>
                          <code className="mt-3 block rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300">
                            {avoid}
                          </code>
                        </article>
                      </div>

                      {implementationNotes.length > 0 ? (
                        <article className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
                          <div className="flex items-center gap-2">
                            <ListChecks aria-hidden="true" className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
                              Implementation Playbook
                            </p>
                          </div>
                          <ol className="mt-4 space-y-3">
                            {implementationNotes.map((item, index) => (
                              <li key={`${item}-${index}`} className="flex gap-3">
                                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-[11px] font-semibold text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                                  {index + 1}
                                </span>
                                <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{item}</p>
                              </li>
                            ))}
                          </ol>
                        </article>
                      ) : null}

                      {riskWhenIgnored ? (
                        <article className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 sm:p-6 dark:border-amber-900/50 dark:bg-amber-950/20">
                          <div className="flex items-center gap-2">
                            <AlertTriangle aria-hidden="true" className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-800 dark:text-amber-200">
                              Risk If Ignored
                            </p>
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-amber-900 dark:text-amber-100">{riskWhenIgnored}</p>
                        </article>
                      ) : null}
                    </section>

                    <aside className="space-y-4 sm:space-y-6">
                      {whyItMatters ? (
                        <article className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
                          <div className="flex items-center gap-2">
                            <Sparkles aria-hidden="true" className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
                              Why This Works
                            </p>
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{whyItMatters}</p>
                        </article>
                      ) : null}

                      {relatedSignals.length > 0 ? (
                        <article className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
                          <div className="flex items-center gap-2">
                            <Tags aria-hidden="true" className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
                              Related Signals
                            </p>
                          </div>
                          <ul className="mt-4 space-y-2">
                            {relatedSignals.map((item, index) => (
                              <li
                                key={`${item}-${index}`}
                                className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm leading-relaxed text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                              >
                                {item}
                              </li>
                            ))}
                          </ul>
                        </article>
                      ) : null}

                      {reviewPrompts.length > 0 ? (
                        <article className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
                          <div className="flex items-center gap-2">
                            <Sparkles aria-hidden="true" className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
                              Design Review Prompts
                            </p>
                          </div>
                          <ol className="mt-4 space-y-3">
                            {reviewPrompts.map((item, index) => (
                              <li key={`${item}-${index}`} className="flex gap-3">
                                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-[11px] font-semibold text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                                  {index + 1}
                                </span>
                                <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{item}</p>
                              </li>
                            ))}
                          </ol>
                        </article>
                      ) : null}
                    </aside>
                  </div>
                </div>
              ) : (
                <div className="mx-auto mt-16 max-w-xl rounded-2xl border border-neutral-200 bg-white p-10 text-center dark:border-neutral-800 dark:bg-neutral-900">
                  <h3 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Select a Rule</h3>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                    Open a rule card to view implementation guidance and visual comparisons.
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

function MetaBlock({ label, value, featured = false }: { label: string; value: string; featured?: boolean }) {
  return (
    <div
      className={
        featured
          ? "rounded-xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5 sm:col-span-2 xl:col-span-1 dark:border-neutral-700 dark:bg-neutral-800/70"
          : "rounded-xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5 dark:border-neutral-700 dark:bg-neutral-800/70"
      }
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
        {label}
      </p>
      <p className="mt-2 text-base font-medium text-neutral-900 dark:text-neutral-100">{value}</p>
    </div>
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
