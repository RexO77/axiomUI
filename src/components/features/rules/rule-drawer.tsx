"use client";

import { Drawer } from "vaul";
import type { Rule } from "@/data/ui-logic";
import { buildDeepDive } from "@/data/ui-logic";

interface RuleDrawerProps {
    activeRule: Rule | null;
    activeCategoryName: string;
    activeRuleId: string | null;
    onClose: () => void;
}

export function RuleDrawer({ activeRule, activeCategoryName, activeRuleId, onClose }: RuleDrawerProps) {
    const activeDeepDive = activeRule ? buildDeepDive(activeRule) : [];
    const isOpen = Boolean(activeRuleId);

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
    );
}
