"use client";

import {
  AlertTriangle,
  CheckCircle2,
  X,
  XCircle,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect } from "react";
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

  // Vaul doesn't forward modal={false} to its underlying Radix Dialog, so the
  // dismissable layer locks the page with `body { pointer-events: none }` every
  // time the drawer opens — which kills clicks on the rule cards, so you can't
  // click another card to switch the panel. Vaul's own reset only runs once on
  // mount, so it never fires on later opens. Keep the body interactive while the
  // (non-modal) drawer is open, re-asserting if Radix re-applies the lock.
  useEffect(() => {
    if (!isOpen) return;
    const body = document.body;
    const unlock = () => {
      if (body.style.pointerEvents === "none") body.style.pointerEvents = "";
    };
    unlock();
    const observer = new MutationObserver(unlock);
    observer.observe(body, { attributes: true, attributeFilter: ["style"] });
    return () => {
      observer.disconnect();
      body.style.pointerEvents = "";
    };
  }, [isOpen]);

  const summary = findTextSection(activeDeepDive, "Summary") ?? activeRule?.desc ?? "";
  const whyItMatters = findTextSection(activeDeepDive, "Why it matters");
  const riskWhenIgnored = findTextSection(activeDeepDive, "Risk when ignored");
  const implementationNotes = findListSection(activeDeepDive, "Implementation notes");
  const reviewPrompts = findListSection(activeDeepDive, "Design review prompts");
  const recommended = findCodeSection(activeDeepDive, "Recommended") ?? activeRule?.do ?? "";
  const avoid = findCodeSection(activeDeepDive, "Avoid") ?? activeRule?.dont ?? "";

  return (
    <Drawer.Root
      direction="right"
      modal={false}
      noBodyStyles
      disablePreventScroll
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && activeRuleId) {
          tapMedium();
          onClose();
        }
      }}
    >
      <Drawer.Portal>
        <Drawer.Content
          className="fixed inset-y-0 right-0 z-[90] flex w-full overscroll-contain p-0 outline-none xl:inset-y-6 xl:right-6 xl:w-[min(40vw,480px)]"
          style={{ "--initial-transform": "100%" } as CSSProperties}
        >
          <div className="ml-auto flex h-full w-full flex-col overflow-hidden rounded-none border border-neutral-200/80 bg-white/95 shadow-[0_24px_80px_rgba(0,0,0,0.14)] xl:rounded-[28px] dark:border-neutral-800/80 dark:bg-neutral-900/95 dark:shadow-[0_28px_90px_rgba(0,0,0,0.42)]">
            <Drawer.Title className="sr-only">{activeRule?.title ?? "Rule details"}</Drawer.Title>

            <div className="drawer-scroll flex-1 overflow-y-auto px-5 pb-8 sm:px-7">
              {activeRule ? (
                <div key={activeRule.id} className="rule-drawer-content space-y-10 pt-6 pb-12 sm:space-y-12 sm:pt-8 lg:pb-14">
                  <Drawer.Description className="sr-only">
                    {summary}
                  </Drawer.Description>

                  <header className="rule-drawer-stagger relative">
                    <Drawer.Close className="absolute right-0 top-0 inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100">
                      <X aria-hidden="true" className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </Drawer.Close>

                    <div className="max-w-3xl pr-12">
                      <h3 className="text-3xl font-semibold leading-tight text-neutral-900 sm:text-4xl dark:text-neutral-50">
                        {activeRule.title}
                      </h3>
                      <p className="mt-5 text-base leading-7 text-neutral-600 sm:text-lg sm:leading-8 dark:text-neutral-300">
                        {summary}
                      </p>
                    </div>
                  </header>

                  <div className="grid gap-10">
                    <section className="rule-drawer-stagger space-y-10">
                      <div className="grid gap-x-8 gap-y-8">
                        <article>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-200">
                              Recommended
                            </p>
                          </div>
                          <div className="mt-5">
                            <RulePreview rule={activeRule} variant="do" size="lg" />
                          </div>
                          <p className="mt-4 font-mono text-sm leading-6 text-neutral-500 dark:text-neutral-400">
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
                          <div className="mt-5">
                            <RulePreview rule={activeRule} variant="dont" size="lg" />
                          </div>
                          <p className="mt-4 font-mono text-sm leading-6 text-neutral-500 dark:text-neutral-500">
                            {avoid}
                          </p>
                        </article>
                      </div>

                      {implementationNotes.length > 0 ? (
                        <article>
                          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                            How to apply it
                          </p>
                          <ol className="mt-5 space-y-4">
                            {implementationNotes.map((item, index) => (
                              <li key={`${item}-${index}`} className="flex gap-4">
                                <span className="mt-0.5 w-5 shrink-0 text-right text-sm text-neutral-400 dark:text-neutral-500">
                                  {index + 1}
                                </span>
                                <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{item}</p>
                              </li>
                            ))}
                          </ol>
                        </article>
                      ) : null}
                    </section>

                    <aside className="rule-drawer-stagger space-y-9">
                      {whyItMatters ? (
                        <article>
                          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Why it works</p>
                          <p className="mt-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{whyItMatters}</p>
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
                          <p className="mt-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{riskWhenIgnored}</p>
                        </article>
                      ) : null}

                      {reviewPrompts.length > 0 ? (
                        <article>
                          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Review questions</p>
                          <ol className="mt-4 space-y-4">
                            {reviewPrompts.map((item, index) => (
                              <li key={`${item}-${index}`} className="flex gap-4">
                                <span className="mt-0.5 w-5 shrink-0 text-right text-sm text-neutral-400 dark:text-neutral-500">
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
