import type { ReactNode } from "react";

import type { Rule } from "@/data/ui-logic";
import { cn } from "@/lib/utils";

type Variant = "do" | "dont";
type PreviewSize = "sm" | "lg";

interface RulePreviewProps {
    rule: Rule;
    variant: Variant;
    size?: PreviewSize;
}

export function RulePreview({ rule, variant, size = "sm" }: RulePreviewProps) {
    const preview = getRulePreview(rule.id, variant, size);
    if (preview) {
        return preview;
    }

    return (
        <GenericPreview
            label={variant === "do" ? rule.do : rule.dont}
            size={size}
        />
    );
}

function getRulePreview(ruleId: string, variant: Variant, size: PreviewSize): ReactNode | null {
    switch (ruleId) {
        // Typography
        case "typo-1":
            return (
                <PreviewFrame size={size} className="flex items-center justify-center">
                    <MiniButton
                        label={variant === "do" ? "Create new account" : "Create New Account"}
                        variant="primary"
                        size={size}
                    />
                </PreviewFrame>
            );
        case "typo-2":
            return (
                <PreviewFrame size={size} className="flex items-center justify-center">
                    <span
                        className={cn(
                            textClass(size),
                            "font-semibold uppercase text-neutral-700 dark:text-neutral-200",
                            variant === "do" ? "tracking-[0.22em]" : "tracking-normal"
                        )}
                    >
                        SETTINGS
                    </span>
                </PreviewFrame>
            );
        case "typo-3":
            return (
                <PreviewFrame size={size}>
                    <p
                        className={cn(
                            textClass(size),
                            "max-w-[170px] text-neutral-700 dark:text-neutral-200",
                            variant === "do" ? "leading-relaxed" : "leading-tight"
                        )}
                    >
                        Body text should breathe for readability.
                    </p>
                </PreviewFrame>
            );
        case "typo-4":
            return (
                <PreviewFrame size={size}>
                    <p
                        className={cn(
                            size === "lg" ? "text-sm" : "text-xs",
                            "font-semibold text-neutral-800 dark:text-neutral-100",
                            variant === "do" ? "leading-tight" : "leading-relaxed"
                        )}
                    >
                        Headings should stay compact.
                    </p>
                </PreviewFrame>
            );
        case "typo-5":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="space-y-1">
                            <span
                                style={{ fontFamily: "var(--font-source-serif)" }}
                                className={cn(
                                    size === "lg" ? "text-sm" : "text-xs",
                                    "font-semibold text-neutral-800 dark:text-neutral-100"
                                )}
                            >
                                Serif Heading
                            </span>
                            <span
                                style={{ fontFamily: "var(--font-manrope)" }}
                                className={cn(textClass(size), "text-neutral-600 dark:text-neutral-300")}
                            >
                                Sans body copy
                            </span>
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size}>
                    <div className="space-y-1">
                        <span className={cn(textClass(size), "font-light text-neutral-500 dark:text-neutral-400")}>
                            Light sans
                        </span>
                        <span className={cn(textClass(size), "font-medium text-neutral-700 dark:text-neutral-200")}>
                            Medium sans
                        </span>
                        <span className={cn(textClass(size), "font-bold text-neutral-800 dark:text-neutral-100")}>
                            Bold sans
                        </span>
                    </div>
                </PreviewFrame>
            );
        case "typo-6":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="space-y-1">
                            <span className={cn(textClass(size), "text-neutral-800 dark:text-neutral-100")}>
                                Primary label
                            </span>
                            <span className={cn(textClass(size), "text-neutral-400 dark:text-neutral-500")}>
                                Secondary label
                            </span>
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size}>
                    <div className="space-y-1">
                        <span className={cn(textClass(size), "text-neutral-800 dark:text-neutral-100")}>
                            Primary label
                        </span>
                        <span
                            className={cn(
                                size === "lg" ? "text-[10px]" : "text-[9px]",
                                "text-neutral-800 dark:text-neutral-100"
                            )}
                        >
                            Tiny secondary
                        </span>
                    </div>
                </PreviewFrame>
            );
        case "typo-7":
            return (
                <PreviewFrame size={size}>
                    <div className="grid grid-cols-2 gap-2 font-mono">
                        <span className="text-neutral-500 dark:text-neutral-400">Jan</span>
                        <span
                            className={cn(
                                variant === "do" ? "text-right" : "text-left",
                                "text-neutral-700 dark:text-neutral-200"
                            )}
                        >
                            1,200
                        </span>
                        <span className="text-neutral-500 dark:text-neutral-400">Feb</span>
                        <span
                            className={cn(
                                variant === "do" ? "text-right" : "text-left",
                                "text-neutral-700 dark:text-neutral-200"
                            )}
                        >
                            320
                        </span>
                    </div>
                </PreviewFrame>
            );
        case "typo-8":
            return (
                <PreviewFrame size={size}>
                    <p
                        className={cn(
                            textClass(size),
                            "max-w-[170px] text-neutral-700 dark:text-neutral-200",
                            variant === "do" ? "text-left" : "text-center"
                        )}
                    >
                        Multi-line copy scans faster when left aligned.
                    </p>
                </PreviewFrame>
            );
        case "typo-9":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="space-y-1">
                            <span className={cn(textClass(size), "font-normal text-neutral-600 dark:text-neutral-300")}>
                                Regular
                            </span>
                            <span className={cn(textClass(size), "font-semibold text-neutral-800 dark:text-neutral-100")}>
                                Semibold
                            </span>
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size}>
                    <div className="space-y-1">
                        <span className={cn(textClass(size), "font-light text-neutral-500 dark:text-neutral-400")}>
                            Light
                        </span>
                        <span className={cn(textClass(size), "font-normal text-neutral-600 dark:text-neutral-300")}>
                            Regular
                        </span>
                        <span className={cn(textClass(size), "font-medium text-neutral-700 dark:text-neutral-200")}>
                            Medium
                        </span>
                        <span className={cn(textClass(size), "font-bold text-neutral-800 dark:text-neutral-100")}>
                            Bold
                        </span>
                    </div>
                </PreviewFrame>
            );

        // Layout
        case "layout-1":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size} className="flex items-center justify-center">
                        <div className="flex items-center gap-2">
                            <MiniBlock />
                            <MiniBlock />
                            <MiniBlock />
                            <MiniBlock />
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size} className="flex items-center justify-center">
                    <div className="flex items-center">
                        <MiniBlock />
                        <MiniBlock className="ml-1" />
                        <MiniBlock className="ml-3" />
                        <MiniBlock className="ml-2" />
                    </div>
                </PreviewFrame>
            );
        case "layout-2":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="max-w-[130px] space-y-1">
                            <MiniLine widthClass="w-full" />
                            <MiniLine widthClass="w-5/6" />
                            <MiniLine widthClass="w-4/6" />
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size}>
                    <div className="space-y-1">
                        <MiniLine widthClass="w-full" />
                        <MiniLine widthClass="w-full" />
                        <MiniLine widthClass="w-full" />
                    </div>
                </PreviewFrame>
            );
        case "layout-3":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <MiniLabel label="Email" size={size} />
                                <MiniInput size={size} />
                            </div>
                            <div className="space-y-1">
                                <MiniLabel label="Password" size={size} />
                                <MiniInput size={size} />
                            </div>
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size}>
                    <div className="space-y-1">
                        <MiniLabel label="Email" size={size} />
                        <MiniInput size={size} />
                        <MiniLabel label="Password" size={size} />
                        <MiniInput size={size} />
                    </div>
                </PreviewFrame>
            );
        case "layout-4":
            return (
                <PreviewFrame size={size} className="flex items-center justify-center">
                    <MiniPlayCircle nudge={variant === "do"} />
                </PreviewFrame>
            );
        case "layout-5":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size} className="flex items-center justify-center">
                        <div className="h-7 w-24 rounded-md bg-neutral-900 dark:bg-neutral-100" />
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size} className="flex items-center justify-center">
                    <div className="h-7 w-14 rounded-md bg-neutral-900 dark:bg-neutral-100" />
                </PreviewFrame>
            );
        case "layout-6":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="flex items-start gap-2">
                            <div className="mt-0.5 h-3 w-3 rounded-sm bg-neutral-400 dark:bg-neutral-500" />
                            <div>
                                <span className={cn(textClass(size), "text-neutral-700 dark:text-neutral-200")}>
                                    Icon aligned
                                </span>
                            </div>
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size}>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-sm bg-neutral-400 dark:bg-neutral-500" />
                        <div>
                            <span className={cn(textClass(size), "text-neutral-700 dark:text-neutral-200")}>
                                Icon centered
                            </span>
                        </div>
                    </div>
                </PreviewFrame>
            );
        case "layout-7":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size} className="bg-neutral-50 dark:bg-neutral-950">
                        <div className="rounded-md bg-white p-2 dark:bg-neutral-900">
                            <MiniLine widthClass="w-2/3" />
                            <div className="mt-2">
                                <MiniLine widthClass="w-full" className="h-1.5" />
                            </div>
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size}>
                    <div className="rounded-md border border-neutral-300 bg-white p-2 dark:border-neutral-700 dark:bg-neutral-900">
                        <MiniLine widthClass="w-2/3" />
                        <div className="mt-2">
                            <MiniLine widthClass="w-full" className="h-1.5" />
                        </div>
                    </div>
                </PreviewFrame>
            );
        case "layout-8":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="grid grid-cols-2 gap-2">
                            <MiniBlock className="h-6 w-full" />
                            <MiniBlock className="h-6 w-full" />
                            <MiniBlock className="h-6 w-full" />
                            <MiniBlock className="h-6 w-full" />
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size}>
                    <div className="grid grid-cols-2 gap-x-1 gap-y-4">
                        <MiniBlock className="h-6 w-full" />
                        <MiniBlock className="h-6 w-full" />
                        <MiniBlock className="h-6 w-full" />
                        <MiniBlock className="h-6 w-full" />
                    </div>
                </PreviewFrame>
            );

        // Color
        case "color-1":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="flex h-3 w-full overflow-hidden rounded">
                            <div className="flex-[6] bg-neutral-200 dark:bg-neutral-800" />
                            <div className="flex-[3] bg-neutral-300 dark:bg-neutral-700" />
                            <div className="flex-[1] bg-blue-500" />
                        </div>
                        <div className="mt-2 flex gap-2">
                            <MiniPill label="Neutral" size={size} />
                            <MiniPill label="Accent" size={size} tone="accent" />
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size}>
                    <div className="flex h-3 w-full overflow-hidden rounded">
                        <div className="flex-1 bg-blue-500" />
                        <div className="flex-1 bg-blue-400" />
                        <div className="flex-1 bg-blue-600" />
                    </div>
                    <div className="mt-2 flex gap-2">
                        <MiniPill label="All accent" size={size} tone="accent" />
                    </div>
                </PreviewFrame>
            );
        case "color-2":
            return (
                <PreviewFrame size={size} className="flex items-center justify-center gap-3 dark:bg-neutral-100">
                    <span
                        className={cn(
                            size === "lg" ? "text-sm" : "text-xs",
                            variant === "do" ? "text-neutral-900" : "text-black",
                            "font-semibold"
                        )}
                    >
                        Aa
                    </span>
                    <span
                        className={cn(
                            size === "lg" ? "text-sm" : "text-xs",
                            variant === "do" ? "text-neutral-500" : "text-neutral-900",
                            "font-medium"
                        )}
                    >
                        Text
                    </span>
                </PreviewFrame>
            );
        case "color-3":
            return (
                <PreviewFrame size={size} className="flex items-center justify-center">
                    <div
                        className="h-10 w-16 rounded-md bg-white dark:bg-neutral-900"
                        style={{
                            boxShadow:
                                variant === "do"
                                    ? "0 10px 18px rgba(99, 102, 241, 0.25)"
                                    : "0 10px 18px rgba(0, 0, 0, 0.25)",
                        }}
                    />
                </PreviewFrame>
            );
        case "color-4":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="flex items-center gap-2">
                            <MiniPill label="Like" size={size} tone="accent" />
                            <MiniPill label="Error" size={size} tone="danger" />
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size}>
                    <div className="flex items-center gap-2">
                        <MiniPill label="Like" size={size} tone="danger" />
                        <MiniPill label="Error" size={size} tone="danger" />
                    </div>
                </PreviewFrame>
            );
        case "color-5":
            return (
                <PreviewFrame size={size}>
                    <div
                        className={cn(
                            "rounded-md bg-white p-2 dark:bg-neutral-900",
                            variant === "do"
                                ? "border border-neutral-200 dark:border-neutral-700"
                                : "border border-neutral-400 dark:border-neutral-600"
                        )}
                    >
                        <MiniLine widthClass="w-2/3" />
                    </div>
                </PreviewFrame>
            );
        case "color-6":
            return (
                <PreviewFrame size={size} className="flex items-center justify-center">
                    <span
                        className={cn(
                            "inline-flex items-center justify-center rounded-md px-3 py-1 text-[10px] font-semibold",
                            variant === "do"
                                ? "border border-neutral-300 text-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
                                : "border border-neutral-100 text-neutral-500 dark:border-neutral-800 dark:text-neutral-400"
                        )}
                    >
                        Outline
                    </span>
                </PreviewFrame>
            );
        case "color-7":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-10 rounded-md bg-blue-500" />
                            <span className="text-neutral-400">-&gt;</span>
                            <div className="h-6 w-10 rounded-md bg-blue-600" />
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size}>
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-10 rounded-md bg-blue-500" />
                        <span className="text-neutral-400">-&gt;</span>
                        <div className="h-6 w-10 rounded-md bg-emerald-500" />
                    </div>
                </PreviewFrame>
            );

        // Components
        case "comp-1":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="flex flex-wrap gap-2">
                            <MiniButton label="Primary" variant="primary" size={size} />
                            <MiniButton label="Secondary" variant="secondary" size={size} />
                            <MiniButton label="Tertiary" variant="ghost" size={size} />
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size}>
                    <div className="flex flex-wrap gap-2">
                        <MiniButton label="Primary" variant="primary" size={size} />
                        <MiniButton label="Primary" variant="primary" size={size} />
                        <MiniButton label="Primary" variant="primary" size={size} />
                    </div>
                </PreviewFrame>
            );
        case "comp-2":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="flex items-center gap-2">
                            <MiniButton label="Delete" variant="secondary" size={size} />
                            <MiniButton label="Confirm" variant="danger" size={size} />
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size} className="flex items-center justify-center">
                    <MiniButton label="Delete" variant="danger" size={size} />
                </PreviewFrame>
            );
        case "comp-3":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="rounded-2xl border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
                            <div className="rounded-lg bg-neutral-100 p-2 dark:bg-neutral-800">
                                <MiniLine widthClass="w-3/4" />
                            </div>
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size}>
                    <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
                        <div className="rounded-lg bg-neutral-100 p-2 dark:bg-neutral-800">
                            <MiniLine widthClass="w-3/4" />
                        </div>
                    </div>
                </PreviewFrame>
            );
        case "comp-4":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size} className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <MiniAvatar shape="circle" size={size} />
                            <span className={cn(textClass(size), "text-neutral-600 dark:text-neutral-300")}>User</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MiniAvatar shape="square" size={size} />
                            <span className={cn(textClass(size), "text-neutral-600 dark:text-neutral-300")}>File</span>
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size} className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <MiniAvatar shape="square" size={size} />
                        <span className={cn(textClass(size), "text-neutral-600 dark:text-neutral-300")}>User</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MiniAvatar shape="square" size={size} />
                        <span className={cn(textClass(size), "text-neutral-600 dark:text-neutral-300")}>File</span>
                    </div>
                </PreviewFrame>
            );
        case "comp-5":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size} className="flex gap-2">
                        <div className="relative flex-1 overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-900">
                            <div className="absolute inset-0 bg-neutral-200/60 dark:bg-neutral-800/60" />
                            <div className="relative mx-auto mt-2 w-[80%] rounded-md border border-neutral-200 bg-white p-2 dark:border-neutral-700 dark:bg-neutral-900">
                                <MiniLine widthClass="w-2/3" />
                                <div className="mt-2 flex gap-1">
                                    <MiniButton label="Cancel" variant="secondary" size={size} />
                                    <MiniButton label="Confirm" variant="primary" size={size} />
                                </div>
                            </div>
                        </div>
                        <div className="relative flex-1 overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-900">
                            <div className="absolute left-2 top-2 space-y-1">
                                <MiniLine widthClass="w-10" />
                                <MiniLine widthClass="w-8" />
                            </div>
                            <div className="absolute right-0 top-0 h-full w-[70%] rounded-l-md border border-neutral-200 bg-white p-2 dark:border-neutral-700 dark:bg-neutral-900">
                                <MiniLine widthClass="w-3/4" />
                                <div className="mt-2 space-y-1">
                                    <MiniLine widthClass="w-full" />
                                    <MiniLine widthClass="w-5/6" />
                                </div>
                            </div>
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size}>
                    <div className="rounded-md border border-neutral-200 bg-white p-2 dark:border-neutral-700 dark:bg-neutral-900">
                        <MiniLine widthClass="w-2/3" />
                        <div className="mt-2 space-y-1">
                            <MiniLine widthClass="w-full" />
                            <MiniLine widthClass="w-full" />
                            <MiniLine widthClass="w-5/6" />
                        </div>
                        <div className="mt-2">
                            <MiniButton label="Save" variant="primary" size={size} />
                        </div>
                    </div>
                </PreviewFrame>
            );
        case "comp-6":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="space-y-1">
                            <MiniLabel label="Email" size={size} />
                            <MiniInput size={size} />
                            <span className={cn(textClass(size), "text-rose-600 dark:text-rose-400")}>
                                Invalid email
                            </span>
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size} className="flex items-start justify-between">
                    <div>
                        <MiniLine widthClass="w-24" />
                        <div className="mt-2">
                            <MiniLine widthClass="w-32" />
                        </div>
                    </div>
                    <MiniPill label="Invalid email" size={size} tone="danger" />
                </PreviewFrame>
            );
        case "comp-7":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-md bg-neutral-200 dark:bg-neutral-700" />
                            <span className={cn(textClass(size), "font-semibold text-neutral-700 dark:text-neutral-200")}>
                                Archive
                            </span>
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size}>
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-neutral-200 dark:bg-neutral-700" />
                        <div className="h-6 w-6 rounded-md bg-neutral-200 dark:bg-neutral-700" />
                        <div className="h-6 w-6 rounded-md bg-neutral-200 dark:bg-neutral-700" />
                    </div>
                </PreviewFrame>
            );
        case "comp-8":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="space-y-1">
                            <MiniButton label="Export" variant="disabled" size={size} />
                            <span className={cn(textClass(size), "text-neutral-500 dark:text-neutral-400")}>
                                Upgrade to enable
                            </span>
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size} className="flex items-center justify-center">
                    <MiniButton label="Export" variant="disabled" size={size} />
                </PreviewFrame>
            );

        // Forms
        case "form-1":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="space-y-1">
                            <MiniLabel label="Email" size={size} />
                            <MiniInput size={size} />
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size}>
                    <div className="flex items-center gap-2">
                        <MiniLabel label="Email" size={size} />
                        <MiniInput size={size} />
                    </div>
                </PreviewFrame>
            );
        case "form-2":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="space-y-1">
                            <MiniLabel label="Email" size={size} />
                            <div className="relative">
                                <MiniInput size={size} />
                                <span
                                    className={cn(
                                        textClass(size),
                                        "absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
                                    )}
                                >
                                    you@example.com
                                </span>
                            </div>
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size}>
                    <div className="space-y-1">
                        <div className="relative">
                            <MiniInput size={size} />
                            <span
                                className={cn(
                                    textClass(size),
                                    "absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
                                )}
                            >
                                Email address
                            </span>
                        </div>
                    </div>
                </PreviewFrame>
            );
        case "form-3":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="flex items-center gap-2">
                            <MiniLabel label="Phone" size={size} />
                            <MiniPill label="Optional" size={size} />
                        </div>
                        <div className="mt-2">
                            <MiniInput size={size} />
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size}>
                    <div className="space-y-1">
                        <span className={cn(textClass(size), "text-neutral-600 dark:text-neutral-300")}>Name*</span>
                        <span className={cn(textClass(size), "text-neutral-600 dark:text-neutral-300")}>Email*</span>
                        <span className={cn(textClass(size), "text-neutral-600 dark:text-neutral-300")}>Address*</span>
                    </div>
                </PreviewFrame>
            );
        case "form-4":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="space-y-1">
                            <MiniLabel label="Zip" size={size} />
                            <MiniInput size={size} widthClass="w-24" />
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size}>
                    <div className="space-y-1">
                        <MiniLabel label="Zip" size={size} />
                        <MiniInput size={size} />
                    </div>
                </PreviewFrame>
            );
        case "form-5":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <MiniRadio checked size={size} />
                                <span className={cn(textClass(size), "text-neutral-700 dark:text-neutral-200")}>Plan A</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MiniRadio size={size} />
                                <span className={cn(textClass(size), "text-neutral-700 dark:text-neutral-200")}>Plan B</span>
                            </div>
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size}>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <MiniCheckbox checked size={size} />
                            <span className={cn(textClass(size), "text-neutral-700 dark:text-neutral-200")}>Plan A</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MiniCheckbox size={size} />
                            <span className={cn(textClass(size), "text-neutral-700 dark:text-neutral-200")}>Plan B</span>
                        </div>
                    </div>
                </PreviewFrame>
            );
        case "form-6":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <MiniRadio checked size={size} />
                                <span className={cn(textClass(size), "text-neutral-700 dark:text-neutral-200")}>Option 1</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MiniRadio size={size} />
                                <span className={cn(textClass(size), "text-neutral-700 dark:text-neutral-200")}>Option 2</span>
                            </div>
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size}>
                    <div className="flex items-center justify-between rounded-md border border-neutral-200 bg-white px-2 py-1.5 dark:border-neutral-700 dark:bg-neutral-900">
                        <span className={cn(textClass(size), "text-neutral-500 dark:text-neutral-400")}>
                            Select option
                        </span>
                        <span className="text-neutral-400">v</span>
                    </div>
                </PreviewFrame>
            );
        case "form-7":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="flex items-center gap-2">
                            <MiniSwitch on size={size} />
                            <span className={cn(textClass(size), "text-neutral-700 dark:text-neutral-200")}>Dark mode</span>
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size}>
                    <div className="flex items-center gap-2">
                        <MiniSwitch on size={size} />
                        <span className={cn(textClass(size), "text-neutral-700 dark:text-neutral-200")}>Subscribe</span>
                    </div>
                </PreviewFrame>
            );
        case "form-8":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="space-y-1">
                            <MiniLabel label="Username" size={size} />
                            <MiniInput size={size} />
                            <MiniPill label="Looks good" size={size} tone="success" />
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size}>
                    <div className="space-y-1">
                        <MiniLabel label="Username" size={size} />
                        <MiniInput size={size} />
                        <span className={cn(textClass(size), "text-rose-600 dark:text-rose-400")}>
                            Too short
                        </span>
                    </div>
                </PreviewFrame>
            );
        case "form-9":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="space-y-1">
                            <MiniLabel label="Expiry" size={size} />
                            <div className="relative">
                                <MiniInput size={size} />
                                <span
                                    className={cn(
                                        textClass(size),
                                        "absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
                                    )}
                                >
                                    MM / YY
                                </span>
                            </div>
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size}>
                    <div className="space-y-1">
                        <MiniLabel label="Expiry" size={size} />
                        <MiniInput size={size} />
                    </div>
                </PreviewFrame>
            );

        // System
        case "sys-1":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="space-y-2">
                            <MiniLine widthClass="w-2/3" />
                            <MiniLine widthClass="w-full" />
                            <MiniLine widthClass="w-5/6" />
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size} className="flex items-center justify-center">
                    <div className="h-6 w-6 rounded-full border-2 border-neutral-300 border-t-transparent dark:border-neutral-600" />
                </PreviewFrame>
            );
        case "sys-2":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size} className="flex flex-col items-center justify-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                        <MiniLine widthClass="w-24" />
                        <MiniButton label="Create" variant="primary" size={size} />
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size} className="flex items-center justify-center">
                    <div className="h-12 w-20 rounded-md border border-neutral-200 dark:border-neutral-700" />
                </PreviewFrame>
            );
        case "sys-3":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size} className="flex items-center justify-center">
                        <MiniButton label="Tap target" variant="primary" size={size} />
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size} className="flex items-center justify-center">
                    <span className={cn(textClass(size), "text-neutral-500 dark:text-neutral-400")}>Tiny link</span>
                </PreviewFrame>
            );
        case "sys-4":
            return (
                <PreviewFrame size={size} className="flex items-center justify-center">
                    <span className={cn(textClass(size), "text-neutral-700 dark:text-neutral-200") }>
                        {variant === "do" ? "2m ago" : "12/01/2024 14:02"}
                    </span>
                </PreviewFrame>
            );
        case "sys-5":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="flex items-center gap-2">
                            <MiniPill label="Blue-500" size={size} />
                            <span className="text-neutral-400">-&gt;</span>
                            <MiniPill label="Primary" size={size} tone="accent" />
                            <span className="text-neutral-400">-&gt;</span>
                            <MiniPill label="Button" size={size} />
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size} className="flex items-center justify-center">
                    <span className={cn(textClass(size), "font-mono text-neutral-600 dark:text-neutral-300")}>
                        $button-blue
                    </span>
                </PreviewFrame>
            );
        case "sys-6":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="flex items-center justify-between rounded-full border border-neutral-200 bg-white px-3 py-1 dark:border-neutral-700 dark:bg-neutral-900">
                            <span className={cn(textClass(size), "text-neutral-700 dark:text-neutral-200")}>Deleted</span>
                            <MiniPill label="Undo" size={size} tone="accent" />
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size} className="flex items-center justify-center">
                    <span className={cn(textClass(size), "text-neutral-500 dark:text-neutral-400")}>
                        Deleted
                    </span>
                </PreviewFrame>
            );
        case "sys-7":
            if (variant === "do") {
                return (
                    <PreviewFrame size={size}>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                <MiniDot active size={size} />
                                <MiniDot active size={size} />
                                <MiniDot size={size} />
                                <MiniDot size={size} />
                            </div>
                            <span className={cn(textClass(size), "text-neutral-600 dark:text-neutral-300")}>Step 2 of 4</span>
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size} className="flex items-center justify-center">
                    <MiniLine widthClass="w-32" />
                </PreviewFrame>
            );
        default:
            return null;
    }
}

function GenericPreview({ label, size }: { label: string; size: PreviewSize }) {
    return (
        <PreviewFrame size={size}>
            <div className="flex items-center justify-between">
                <MiniLine widthClass="w-16" />
                <MiniPill label="UI" size={size} />
            </div>
            <div className="mt-2 space-y-1">
                <MiniLine widthClass="w-full" />
                <MiniLine widthClass="w-5/6" />
            </div>
            <div className="mt-2">
                <MiniButton label={label} variant="secondary" size={size} className="max-w-full" />
            </div>
        </PreviewFrame>
    );
}

function PreviewFrame({
    children,
    size,
    className,
}: {
    children: ReactNode;
    size: PreviewSize;
    className?: string;
}) {
    return (
        <div
            aria-hidden="true"
            className={cn(
                "relative overflow-hidden rounded-lg border border-neutral-200 bg-white text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200",
                size === "lg" ? "min-h-[96px] p-3 text-xs" : "min-h-[72px] p-2 text-[10px]",
                className
            )}
        >
            {children}
        </div>
    );
}

function MiniButton({
    label,
    variant,
    size,
    className,
}: {
    label: string;
    variant: "primary" | "secondary" | "ghost" | "danger" | "disabled";
    size: PreviewSize;
    className?: string;
}) {
    return (
        <span
            className={cn(
                "inline-flex max-w-full items-center justify-center truncate rounded-md font-semibold",
                size === "lg" ? "px-3 py-1.5 text-xs" : "px-2.5 py-1 text-[10px]",
                variant === "primary" && "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900",
                variant === "secondary" &&
                    "border border-neutral-300 text-neutral-700 dark:border-neutral-700 dark:text-neutral-200",
                variant === "ghost" && "text-neutral-500 dark:text-neutral-400",
                variant === "danger" && "bg-rose-600 text-white",
                variant === "disabled" && "bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500",
                className
            )}
        >
            {label}
        </span>
    );
}

function MiniInput({ size, widthClass = "w-full" }: { size: PreviewSize; widthClass?: string }) {
    return (
        <div
            className={cn(
                "rounded-md border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900",
                size === "lg" ? "h-6" : "h-5",
                widthClass
            )}
        />
    );
}

function MiniLabel({ label, size }: { label: string; size: PreviewSize }) {
    return (
        <span
            className={cn(
                "font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400",
                size === "lg" ? "text-[10px]" : "text-[9px]"
            )}
        >
            {label}
        </span>
    );
}

function MiniLine({
    widthClass,
    className,
}: {
    widthClass: string;
    className?: string;
}) {
    return <div className={cn("h-2 rounded bg-neutral-200 dark:bg-neutral-800", widthClass, className)} />;
}

function MiniBlock({ className }: { className?: string }) {
    return <div className={cn("h-4 w-4 rounded bg-neutral-300 dark:bg-neutral-700", className)} />;
}

function MiniAvatar({ shape, size }: { shape: "circle" | "square"; size: PreviewSize }) {
    return (
        <div
            className={cn(
                shape === "circle" ? "rounded-full" : "rounded-md",
                size === "lg" ? "h-7 w-7" : "h-6 w-6",
                "bg-neutral-300 dark:bg-neutral-700"
            )}
        />
    );
}

function MiniSwitch({ on, size }: { on?: boolean; size: PreviewSize }) {
    return (
        <div
            className={cn(
                "relative rounded-full",
                size === "lg" ? "h-4 w-8" : "h-3.5 w-7",
                on ? "bg-neutral-900 dark:bg-neutral-100" : "bg-neutral-300 dark:bg-neutral-700"
            )}
        >
            <span
                className={cn(
                    "absolute top-0.5 block rounded-full bg-white",
                    size === "lg" ? "h-3 w-3" : "h-2.5 w-2.5",
                    on ? "right-0.5" : "left-0.5"
                )}
            />
        </div>
    );
}

function MiniCheckbox({ checked, size }: { checked?: boolean; size: PreviewSize }) {
    return (
        <div
            className={cn(
                "flex items-center justify-center rounded-sm border",
                size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5",
                checked
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                    : "border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-900"
            )}
        >
            {checked ? <span className="block h-1.5 w-1.5 rounded-sm bg-white dark:bg-neutral-900" /> : null}
        </div>
    );
}

function MiniRadio({ checked, size }: { checked?: boolean; size: PreviewSize }) {
    return (
        <div
            className={cn(
                "flex items-center justify-center rounded-full border",
                size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5",
                checked
                    ? "border-neutral-900 bg-neutral-900 dark:border-neutral-100 dark:bg-neutral-100"
                    : "border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-900"
            )}
        >
            {checked ? <div className="h-1.5 w-1.5 rounded-full bg-white dark:bg-neutral-900" /> : null}
        </div>
    );
}

function MiniDot({ active, size }: { active?: boolean; size: PreviewSize }) {
    return (
        <span
            className={cn(
                "rounded-full",
                size === "lg" ? "h-2.5 w-2.5" : "h-2 w-2",
                active ? "bg-neutral-900 dark:bg-neutral-100" : "bg-neutral-300 dark:bg-neutral-700"
            )}
        />
    );
}

function MiniPill({
    label,
    size,
    tone = "neutral",
}: {
    label: string;
    size: PreviewSize;
    tone?: "neutral" | "accent" | "danger" | "success";
}) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 font-semibold",
                size === "lg" ? "text-[10px]" : "text-[9px]",
                tone === "neutral" &&
                    "border-neutral-200 bg-neutral-100 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
                tone === "accent" &&
                    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
                tone === "danger" &&
                    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300",
                tone === "success" &&
                    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
            )}
        >
            {label}
        </span>
    );
}

function MiniPlayCircle({ nudge }: { nudge: boolean }) {
    return (
        <div className="relative h-12 w-12 rounded-full border border-neutral-300 dark:border-neutral-700">
            <span
                className="absolute left-1/2 top-1/2 block h-0 w-0 -translate-x-1/2 -translate-y-1/2 border-y-[6px] border-y-transparent border-l-[10px] border-l-neutral-700 dark:border-l-neutral-200"
                style={nudge ? { left: "calc(50% + 1px)" } : undefined}
            />
        </div>
    );
}

function textClass(size: PreviewSize) {
    return size === "lg" ? "text-xs" : "text-[10px]";
}
