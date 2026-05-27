"use client";

import {
  AlertTriangle,
  CheckCircle2,
  X,
  XCircle,
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

export function RuleDrawer({ activeRule, activeRuleId, onClose }: RuleDrawerProps) {
  const { tapMedium } = useHaptics();
  const activeDeepDive = activeRule ? buildDeepDive(activeRule) : [];
  const isOpen = Boolean(activeRuleId);

  const summary = findTextSection(activeDeepDive, "Summary") ?? activeRule?.desc ?? "";
  const whyItMatters = findTextSection(activeDeepDive, "Why it matters");
  const riskWhenIgnored = findTextSection(activeDeepDive, "Risk when ignored");
  const implementationNotes = findListSection(activeDeepDive, "Implementation notes");
  const reviewPrompts = findListSection(activeDeepDive, "Design review prompts");
  const recommended = findCodeSection(activeDeepDive, "Recommended") ?? activeRule?.do ?? "";
  const avoid = findCodeSection(activeDeepDive, "Avoid") ?? activeRule?.dont ?? "";

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
                <div className="mx-auto max-w-5xl space-y-8 pb-8">
                  <Drawer.Description className="sr-only">
                    {summary}
                  </Drawer.Description>

                  <header className="relative pt-2 sm:pt-4">
                    <Drawer.Close className="absolute right-0 top-0 inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100">
                      <X aria-hidden="true" className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </Drawer.Close>

                    <div className="max-w-3xl pr-12">
                      <h3 className="text-3xl font-semibold leading-tight text-neutral-900 sm:text-4xl dark:text-neutral-50">
                        {activeRule.title}
                      </h3>
                      <p className="prose-justify mt-4 text-base leading-7 text-neutral-600 sm:text-lg sm:leading-8 dark:text-neutral-300">
                        {summary}
                      </p>
                    </div>
                  </header>

                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-6">
                    <section className="space-y-8">
                      <div className="grid gap-x-6 gap-y-6 md:grid-cols-2">
                        <article>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-200">
                              Recommended
                            </p>
                          </div>
                          <div className="mt-4">
                            <RulePreview rule={activeRule} variant="do" size="lg" />
                          </div>
                          <p className="mt-3 font-mono text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                            {recommended}
                          </p>
                        </article>

                        <article>
                          <div className="flex items-center gap-2">
                            <XCircle aria-hidden="true" className="h-4 w-4 text-rose-600 dark:text-rose-300" />
                            <p className="text-xs font-semibold text-rose-700 dark:text-rose-200">
                              Avoid
                            </p>
                          </div>
                          <div className="mt-4">
                            <RulePreview rule={activeRule} variant="dont" size="lg" />
                          </div>
                          <p className="mt-3 font-mono text-sm leading-6 text-neutral-500 dark:text-neutral-500">
                            {avoid}
                          </p>
                        </article>
                      </div>

                      {implementationNotes.length > 0 ? (
                        <article>
                          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                            How to apply it
                          </p>
                          <ol className="mt-4 space-y-3">
                            {implementationNotes.map((item, index) => (
                              <li key={`${item}-${index}`} className="flex gap-3">
                                <span className="mt-0.5 w-5 shrink-0 text-right text-sm text-neutral-400 dark:text-neutral-500">
                                  {index + 1}
                                </span>
                                <p className="prose-justify text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{item}</p>
                              </li>
                            ))}
                          </ol>
                        </article>
                      ) : null}
                    </section>

                    <aside className="space-y-7 lg:pl-4">
                      {whyItMatters ? (
                        <article>
                          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Why it works</p>
                          <p className="prose-justify mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{whyItMatters}</p>
                        </article>
                      ) : null}

                      {riskWhenIgnored ? (
                        <article>
                          <div className="flex items-center gap-2">
                            <AlertTriangle aria-hidden="true" className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                            <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                              What breaks
                            </p>
                          </div>
                          <p className="prose-justify mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{riskWhenIgnored}</p>
                        </article>
                      ) : null}

                      {reviewPrompts.length > 0 ? (
                        <article>
                          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Review questions</p>
                          <ol className="mt-3 space-y-3">
                            {reviewPrompts.map((item, index) => (
                              <li key={`${item}-${index}`} className="flex gap-3">
                                <span className="mt-0.5 w-5 shrink-0 text-right text-sm text-neutral-400 dark:text-neutral-500">
                                  {index + 1}
                                </span>
                                <p className="prose-justify text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{item}</p>
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
                  <p className="prose-justify mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
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
