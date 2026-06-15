"use client";

import {
  AlertTriangle,
  CheckCircle2,
  X,
  XCircle,
} from "lucide-react";
import type { CSSProperties, UIEvent } from "react";
import { useEffect, useRef } from "react";
import { Drawer } from "vaul";
import { RulePreview } from "@/components/features/rules/rule-preview";
import { CopyRuleButton } from "@/components/features/rules/copy-rule-button";
import type { DeepDiveSection, Rule } from "@/data/ui-logic";
import { buildDeepDive } from "@/data/ui-logic";
import { useHaptics } from "@/hooks/use-haptics";

interface RuleDrawerProps {
  activeRule: Rule | null;
  activeCategoryName: string;
  activeRuleId: string | null;
  onClose: () => void;
}

// Single source of truth for the icon-only close control so focus, size, and
// label stay in sync across the loaded and empty states.
function DrawerCloseButton({ className = "" }: { className?: string }) {
  return (
    <Drawer.Close
      className={`inline-flex size-11 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100 dark:focus-visible:ring-neutral-500 ${className}`}
    >
      <X aria-hidden="true" className="h-5 w-5" />
      <span className="sr-only">Close</span>
    </Drawer.Close>
  );
}

export function RuleDrawer({ activeRule, activeCategoryName, activeRuleId, onClose }: RuleDrawerProps) {
  const { tapMedium } = useHaptics();
  const activeDeepDive = activeRule ? buildDeepDive(activeRule) : [];
  const isOpen = Boolean(activeRuleId);
  const headerRef = useRef<HTMLDivElement>(null);
  const restoreBlur = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Sticky-header behaviour for the right pane: surface a hairline once the
  // content scrolls under the bar, and lighten its backdrop blur while the
  // pane is in motion — heavy blur during scroll smears the moving content and
  // taxes the GPU. Full blur fades back ~120ms after the scroll settles. Driven
  // imperatively off the header node so per-frame scroll events never re-render.
  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const header = headerRef.current;
    if (!header) return;
    header.dataset.stuck = event.currentTarget.scrollTop > 4 ? "true" : "false";
    // Set backdrop-filter directly (not via a CSS var) so the transition on
    // .drawer-sticky-header actually animates — changing an unregistered custom
    // property updates the dependent property instantly, with no fade.
    header.style.backdropFilter = "blur(6px)";
    header.style.webkitBackdropFilter = "blur(6px)";
    clearTimeout(restoreBlur.current);
    restoreBlur.current = setTimeout(() => {
      header.style.backdropFilter = "blur(24px)";
      header.style.webkitBackdropFilter = "blur(24px)";
    }, 120);
  };

  useEffect(() => () => clearTimeout(restoreBlur.current), []);

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
          <div className="panel-shadow ml-auto flex h-full w-full flex-col overflow-hidden rounded-none border border-neutral-200/80 bg-white/95 xl:rounded-[28px] dark:border-neutral-800/80 dark:bg-neutral-900/95">
            <Drawer.Title className="sr-only">{activeRule?.title ?? "Rule details"}</Drawer.Title>

            <div onScroll={handleScroll} className="drawer-scroll flex-1 overflow-y-auto px-5 pb-8 sm:px-7">
              {activeRule ? (
                <>
                  {/* Sticky header: keeps the category + copy/close reachable
                      while the body scrolls. Bleeds past the scroll padding so
                      its backdrop spans the full pane width. */}
                  <div
                    ref={headerRef}
                    data-stuck="false"
                    className="drawer-sticky-header sticky top-0 z-20 -mx-5 flex items-center justify-between gap-3 border-b border-transparent bg-white/70 px-5 py-3.5 data-[stuck=true]:border-neutral-200/80 sm:-mx-7 sm:px-7 dark:bg-neutral-900/70 dark:data-[stuck=true]:border-neutral-800/80"
                  >
                    {activeCategoryName ? (
                      <p className="min-w-0 truncate text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        {activeCategoryName}
                      </p>
                    ) : (
                      <span aria-hidden="true" />
                    )}
                    <div className="flex shrink-0 items-center gap-1">
                      <CopyRuleButton key={activeRule.id} rule={activeRule} variant="icon" />
                      <DrawerCloseButton />
                    </div>
                  </div>

                  <div className="rule-drawer-content space-y-10 pt-4 pb-12 sm:space-y-12 sm:pt-5 lg:pb-14">
                    <Drawer.Description className="sr-only">
                      {summary}
                    </Drawer.Description>

                    {/* Keyed by category so the header only re-animates when the
                        category changes; switching rules within a category leaves it put. */}
                    <header key={activeRule.category} className="rule-drawer-stagger">
                      <h2 className="text-2xl font-semibold leading-tight text-neutral-900 sm:text-3xl dark:text-neutral-50">
                        {activeRule.title}
                      </h2>
                      <p className="mt-4 text-base leading-7 text-neutral-600 sm:leading-8 dark:text-neutral-300">
                        {summary}
                      </p>
                    </header>

                  {/* Keyed by rule so the body re-animates on every rule change,
                      even when the header stays put within a category. */}
                  <div key={activeRule.id} className="grid gap-10">
                    <section className="rule-drawer-stagger space-y-10">
                      <div className="grid gap-x-8 gap-y-8">
                        <article>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                            <h3 className="drawer-label text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                              Recommended
                            </h3>
                          </div>
                          <div className="mt-4">
                            <RulePreview rule={activeRule} variant="do" size="lg" animate />
                          </div>
                          <p className="mt-4 font-mono text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                            {recommended}
                          </p>
                        </article>

                        <article>
                          <div className="flex items-center gap-2">
                            <XCircle aria-hidden="true" className="h-4 w-4 text-rose-600 dark:text-rose-300" />
                            <h3 className="drawer-label text-xs font-semibold text-rose-800 dark:text-rose-200">
                              Avoid
                            </h3>
                          </div>
                          <div className="mt-4">
                            <RulePreview rule={activeRule} variant="dont" size="lg" animate />
                          </div>
                          <p className="mt-4 font-mono text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                            {avoid}
                          </p>
                        </article>
                      </div>

                      {implementationNotes.length > 0 ? (
                        <article>
                          <h3 className="drawer-label text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                            How to apply it
                          </h3>
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
                          <h3 className="drawer-label text-xs font-semibold text-neutral-600 dark:text-neutral-300">Why it works</h3>
                          <p className="mt-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{whyItMatters}</p>
                        </article>
                      ) : null}

                      {riskWhenIgnored ? (
                        <article>
                          <div className="flex items-center gap-2">
                            <AlertTriangle aria-hidden="true" className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                            <h3 className="drawer-label text-xs font-semibold text-amber-800 dark:text-amber-200">
                              What breaks
                            </h3>
                          </div>
                          <p className="mt-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{riskWhenIgnored}</p>
                        </article>
                      ) : null}

                      {reviewPrompts.length > 0 ? (
                        <article>
                          <h3 className="drawer-label text-xs font-semibold text-neutral-600 dark:text-neutral-300">Review questions</h3>
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
                </>
              ) : (
                <div className="relative pt-6">
                  <DrawerCloseButton className="absolute right-0 top-0" />
                  <div className="mx-auto mt-16 max-w-xl rounded-2xl border border-neutral-200 bg-white p-10 text-center dark:border-neutral-800 dark:bg-neutral-900">
                    <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Select a Rule</h2>
                    <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                      Open a rule card to view implementation guidance and visual comparisons.
                    </p>
                    <Drawer.Close className="mt-6 inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-neutral-100 px-5 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:focus-visible:ring-neutral-500">
                      <X aria-hidden="true" className="h-3.5 w-3.5" />
                      Close panel
                    </Drawer.Close>
                  </div>
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
