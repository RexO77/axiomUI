import type { ReactNode } from "react";
import {
    CalendarDays,
    Check,
    ChevronDown,
    ChevronUp,
    CircleAlert,
    CircleCheck,
    CreditCard,
} from "lucide-react";

import {
    MiniButton,
    PreviewFrame,
    type PreviewRenderer,
} from "@/components/features/rules/preview-primitives";
import { cn } from "@/lib/utils";

// Authored previews for form-1..form-12.
// Every pane is the same scene as its sibling; exactly one variable changes.
// Local field anatomy lives here so inputs read as real fields, not empty boxes.

type ShellTone = "default" | "focus" | "error";

function Shell({
    tone = "default",
    compact = false,
    className,
    children,
}: {
    tone?: ShellTone;
    compact?: boolean;
    className?: string;
    children?: ReactNode;
}) {
    return (
        <div
            className={cn(
                "flex min-w-0 items-center gap-1.5 rounded-md border bg-white px-2 dark:bg-neutral-900",
                compact ? "h-5" : "h-7",
                tone === "default" && "border-neutral-300 dark:border-neutral-700",
                tone === "focus" &&
                    "border-blue-500 ring-2 ring-blue-500/20 dark:border-blue-400 dark:ring-blue-400/20",
                tone === "error" &&
                    "border-rose-500 ring-2 ring-rose-500/15 dark:border-rose-400 dark:ring-rose-400/20",
                className
            )}
        >
            {children}
        </div>
    );
}

function Value({
    children,
    muted = false,
    mono = false,
    className,
}: {
    children?: ReactNode;
    muted?: boolean;
    mono?: boolean;
    className?: string;
}) {
    return (
        <span
            className={cn(
                "truncate text-[11px]",
                mono && "font-mono tabular-nums",
                muted
                    ? "text-neutral-400 dark:text-neutral-500"
                    : "text-neutral-900 dark:text-neutral-100",
                className
            )}
        >
            {children}
        </span>
    );
}

function Caret() {
    return <span className="h-3.5 w-px shrink-0 bg-blue-500 dark:bg-blue-400" />;
}

// `strong` is a prop rather than a className override because `cn` is plain
// concatenation: CSS resolves conflicts by stylesheet order, not argument
// order, so a caller passing `font-semibold text-neutral-700` lost to the
// defaults below and rendered unchanged. A variant cannot lose that way.
// Layout-only overrides (shrink-0, truncate) never conflict and still pass through.
function Label({
    children,
    className,
    strong = false,
}: {
    children: ReactNode;
    className?: string;
    strong?: boolean;
}) {
    return (
        <div
            className={cn(
                "text-[10px]",
                strong
                    ? "font-semibold text-neutral-700 dark:text-neutral-200"
                    : "font-medium text-neutral-600 dark:text-neutral-300",
                className
            )}
        >
            {children}
        </div>
    );
}

// `tone` is a prop for the same reason as Label's `strong`: a caller's accent
// colour lost to the muted default by stylesheet order, so three accent
// annotations in this file rendered grey.
function Ann({
    children,
    className,
    tone = "muted",
}: {
    children: ReactNode;
    className?: string;
    tone?: "muted" | "accent";
}) {
    return (
        <span
            className={cn(
                "font-mono text-[9px] tabular-nums",
                tone === "accent"
                    ? "text-blue-500 dark:text-blue-400"
                    : "text-neutral-400 dark:text-neutral-500",
                className
            )}
        >
            {children}
        </span>
    );
}

function ErrorNote({ children }: { children: ReactNode }) {
    return (
        <span className="flex items-center gap-1 text-[10px] font-medium text-rose-600 dark:text-rose-400">
            <CircleAlert size={11} strokeWidth={2} aria-hidden />
            {children}
        </span>
    );
}

function Radio({ on }: { on?: boolean }) {
    return (
        <span
            aria-hidden
            className={cn(
                "flex size-3.5 shrink-0 items-center justify-center rounded-full border bg-white dark:bg-neutral-900",
                on
                    ? "border-blue-500 dark:border-blue-400"
                    : "border-neutral-300 dark:border-neutral-600"
            )}
        >
            {on ? <span className="size-1.5 rounded-full bg-blue-500 dark:bg-blue-400" /> : null}
        </span>
    );
}

function Checkbox({ on }: { on?: boolean }) {
    return (
        <span
            aria-hidden
            className={cn(
                "flex size-3.5 shrink-0 items-center justify-center rounded-[4px] border",
                on
                    ? "border-blue-500 bg-blue-500 text-white dark:border-blue-400 dark:bg-blue-400"
                    : "border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-900"
            )}
        >
            {on ? <Check size={10} strokeWidth={3} /> : null}
        </span>
    );
}

function Switch({ on }: { on?: boolean }) {
    return (
        <span
            aria-hidden
            className={cn(
                "relative h-4 w-7 shrink-0 rounded-full",
                on ? "bg-blue-500 dark:bg-blue-400" : "bg-neutral-300 dark:bg-neutral-700"
            )}
        >
            <span
                className={cn(
                    "absolute top-0.5 size-3 rounded-full bg-white",
                    on ? "right-0.5" : "left-0.5"
                )}
            />
        </span>
    );
}

function Chevron({ open = false }: { open?: boolean }) {
    const Icon = open ? ChevronUp : ChevronDown;
    return (
        <Icon
            size={12}
            strokeWidth={1.5}
            aria-hidden
            className="ml-auto shrink-0 text-neutral-400 dark:text-neutral-500"
        />
    );
}

function ChoiceRow({
    control,
    label,
    trail,
}: {
    control: ReactNode;
    label: string;
    trail?: ReactNode;
}) {
    return (
        <div className="flex items-center gap-2">
            {control}
            <span className="truncate text-[11px] text-neutral-700 dark:text-neutral-200">
                {label}
            </span>
            {trail ? <span className="ml-auto">{trail}</span> : null}
        </div>
    );
}

// Accent width bracket + readout — the measurement artifact for form-4.
function WidthBracket({ label, widthClass }: { label: string; widthClass: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <span
                className={cn(
                    "h-1 rounded-none border-x border-b border-blue-500/70 dark:border-blue-400/70",
                    widthClass
                )}
            />
            <Ann tone="accent">{label}</Ann>
        </div>
    );
}

export const formPreviews: PreviewRenderer = (ruleId, variant, size) => {
    switch (ruleId) {
        // Label placement: identical checkout fields; only the label moves.
        case "form-1": {
            if (variant === "do") {
                return (
                    <PreviewFrame size={size} className="flex flex-col justify-center gap-2.5">
                        <div className="space-y-1">
                            <Label>Full name</Label>
                            <Shell>
                                <Value>Priya Sharma</Value>
                            </Shell>
                        </div>
                        <div className="space-y-1">
                            <Label>Billing address</Label>
                            <Shell>
                                <Value>2261 Market St</Value>
                            </Shell>
                        </div>
                        <Ann>inputs share one left edge</Ann>
                    </PreviewFrame>
                );
            }
            // Side labels of different lengths shove the inputs out of alignment.
            return (
                <PreviewFrame size={size} className="flex flex-col justify-center gap-2.5">
                    <div className="flex items-center gap-2">
                        <Label className="shrink-0">Full name</Label>
                        <Shell className="flex-1">
                            <Value>Priya Sharma</Value>
                        </Shell>
                    </div>
                    <div className="flex items-center gap-2">
                        <Label className="shrink-0">Billing address</Label>
                        <Shell className="flex-1">
                            <Value>2261 Market St</Value>
                        </Shell>
                    </div>
                    <Ann>inputs start at 2 different edges</Ann>
                </PreviewFrame>
            );
        }

        // Two moments of the same email field: before typing, five characters in.
        case "form-2": {
            if (variant === "do") {
                return (
                    <PreviewFrame size={size} className="flex flex-col justify-center gap-3">
                        <div className="space-y-1">
                            <div className="flex h-3.5 items-baseline justify-between">
                                <Label>Work email</Label>
                                <Ann>0 chars</Ann>
                            </div>
                            <Shell>
                                <Value muted>you@company.com</Value>
                            </Shell>
                        </div>
                        <div className="space-y-1">
                            <div className="flex h-3.5 items-baseline justify-between">
                                <Label>Work email</Label>
                                <Ann>5 chars</Ann>
                            </div>
                            <Shell tone="focus">
                                <Value>maya@</Value>
                                <Caret />
                            </Shell>
                        </div>
                    </PreviewFrame>
                );
            }
            // Placeholder was the only label; one keystroke and the field is anonymous.
            return (
                <PreviewFrame size={size} className="flex flex-col justify-center gap-3">
                    <div className="space-y-1">
                        <div className="flex h-3.5 items-baseline justify-end">
                            <Ann>0 chars</Ann>
                        </div>
                        <Shell>
                            <Value muted>Email address</Value>
                        </Shell>
                    </div>
                    <div className="space-y-1">
                        <div className="flex h-3.5 items-baseline justify-end">
                            <Ann>5 chars</Ann>
                        </div>
                        <Shell tone="focus">
                            <Value>maya@</Value>
                            <Caret />
                        </Shell>
                    </div>
                </PreviewFrame>
            );
        }

        // Same three contact fields; only the exception gets marked.
        case "form-3": {
            const asterisk = <span className="text-rose-500 dark:text-rose-400"> *</span>;
            const optional = (
                <span className="font-normal text-neutral-400 dark:text-neutral-500">
                    {" "}
                    (Optional)
                </span>
            );
            const field = (label: ReactNode, value?: string) => (
                <div className="space-y-0.5">
                    <Label>{label}</Label>
                    <Shell compact>{value ? <Value className="text-[10px]">{value}</Value> : null}</Shell>
                </div>
            );
            if (variant === "do") {
                return (
                    <PreviewFrame size={size} className="flex flex-col justify-center gap-1.5">
                        {field("Full name", "Maya Chen")}
                        {field("Email", "maya@company.com")}
                        {field(<>Phone{optional}</>)}
                        <Ann>1 marker on 3 fields</Ann>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size} className="flex flex-col justify-center gap-1.5">
                    {field(<>Full name{asterisk}</>, "Maya Chen")}
                    {field(<>Email{asterisk}</>, "maya@company.com")}
                    {field(<>Phone{asterisk}</>)}
                    <Ann>3 markers on 3 fields — none informs</Ann>
                </PreviewFrame>
            );
        }

        // Same address form; the ZIP field either keeps or breaks its width promise.
        case "form-4": {
            const zipWide = variant === "dont";
            return (
                <PreviewFrame size={size} className="flex flex-col justify-center gap-2.5">
                    <div className="space-y-1">
                        <Label>Street address</Label>
                        <Shell>
                            <Value>2261 Market Street</Value>
                        </Shell>
                    </div>
                    <div className="space-y-1">
                        <Label>ZIP</Label>
                        <Shell className={zipWide ? "w-full" : "w-20"}>
                            <Value mono>94114</Value>
                        </Shell>
                        <WidthBracket label="5 chars" widthClass="w-20" />
                    </div>
                </PreviewFrame>
            );
        }

        // One exclusive decision; circle anatomy vs squares allowing an invalid pair.
        case "form-5": {
            const isDo = variant === "do";
            const Control = isDo ? Radio : Checkbox;
            return (
                <PreviewFrame size={size} className="flex flex-col justify-center gap-2">
                    <div className="flex items-baseline justify-between">
                        <Label strong>
                            Pick a plan
                        </Label>
                        <Ann>{isDo ? "1 selected" : "2 selected"}</Ann>
                    </div>
                    <ChoiceRow control={<Control />} label="Starter" trail={<Ann>$0/mo</Ann>} />
                    <ChoiceRow control={<Control on />} label="Pro" trail={<Ann>$12/mo</Ann>} />
                    <ChoiceRow
                        control={<Control on={!isDo} />}
                        label="Business"
                        trail={<Ann>$24/mo</Ann>}
                    />
                </PreviewFrame>
            );
        }

        // Three billing options: all visible at a glance vs hidden behind a click.
        case "form-6": {
            if (variant === "do") {
                return (
                    <PreviewFrame size={size} className="flex flex-col justify-center gap-2">
                        <div className="flex items-baseline justify-between">
                            <Label strong>
                                Billing cycle
                            </Label>
                            <Ann>3 of 3 visible</Ann>
                        </div>
                        <ChoiceRow control={<Radio />} label="Monthly" />
                        <ChoiceRow control={<Radio on />} label="Yearly" />
                        <ChoiceRow control={<Radio />} label="Every 2 years" />
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size} className="flex flex-col justify-center gap-2">
                    <div className="flex items-baseline justify-between">
                        <Label strong>
                            Billing cycle
                        </Label>
                        <Ann>0 of 3 visible</Ann>
                    </div>
                    <Shell>
                        <Value muted>Select cycle</Value>
                        <Chevron />
                    </Shell>
                    <div className="flex justify-end">
                        <Ann>+1 click to see options</Ann>
                    </div>
                </PreviewFrame>
            );
        }

        // Same settings card, same Save button below it; only the second
        // row's control changes. Dark mode stays a switch in both panes
        // because it really does apply the instant you flip it.
        case "form-7": {
            const isDo = variant === "do";
            return (
                <PreviewFrame size={size} className="flex flex-col justify-center gap-2">
                    <div className="divide-y divide-neutral-200 rounded-md border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
                        <div className="flex items-center justify-between gap-2 px-2.5 py-1.5">
                            <span className="truncate text-[11px] text-neutral-700 dark:text-neutral-200">
                                Dark mode
                            </span>
                            <Switch on />
                        </div>
                        <div className="flex items-center justify-between gap-2 px-2.5 py-1.5">
                            <span className="truncate text-[11px] text-neutral-700 dark:text-neutral-200">
                                Email me product updates
                            </span>
                            {/* Dashed accent marks the one control under test,
                                so the eye is not left comparing two switches. */}
                            <span className="flex shrink-0 items-center justify-center rounded-[6px] border border-dashed border-blue-500/60 p-1 dark:border-blue-400/60">
                                {isDo ? <Checkbox on /> : <Switch on />}
                            </span>
                        </div>
                    </div>
                    <MiniButton label="Save changes" variant="primary" size={size} className="w-full" />
                    <Ann>
                        {isDo
                            ? "checkbox waits for Save — applies on submit"
                            : "switch reads as applied — but Save is still there"}
                    </Ann>
                </PreviewFrame>
            );
        }

        // The same half-typed value at the same two moments — mid-entry and
        // after blur. Only the moment the error fires changes: the do pane
        // holds it until the user has finished, the don't pane fires while
        // the caret is still in the field.
        case "form-8": {
            const isDo = variant === "do";
            const error = <ErrorNote>Email is missing a domain</ErrorNote>;
            return (
                <PreviewFrame size={size} className="flex flex-col justify-center gap-1">
                    <Label>Email</Label>
                    <Shell tone={isDo ? "focus" : "error"}>
                        <Value>maya@</Value>
                        <Caret />
                    </Shell>
                    <div className="flex h-3.5 items-center gap-2">
                        <span className="min-w-0 flex-1">{isDo ? null : error}</span>
                        <Ann>while typing · 5 chars</Ann>
                    </div>
                    <Shell tone="error">
                        <Value>maya@</Value>
                    </Shell>
                    <div className="flex h-3.5 items-center gap-2">
                        <span className="min-w-0 flex-1">{error}</span>
                        <Ann>after blur</Ann>
                    </div>
                </PreviewFrame>
            );
        }

        // Same card, same expiry field, same 96px width. The one variable is
        // whether the pattern is stated before the user types or discovered
        // only by failing — so the do pane's value is what the hint bought.
        case "form-9": {
            const isDo = variant === "do";
            return (
                <PreviewFrame size={size} className="flex flex-col justify-center gap-2">
                    <div className="space-y-1">
                        <Label>Card number</Label>
                        <Shell>
                            <CreditCard
                                size={12}
                                strokeWidth={1.5}
                                aria-hidden
                                className="shrink-0 text-neutral-400 dark:text-neutral-500"
                            />
                            <Value mono>4242 4242 4242 4242</Value>
                        </Shell>
                    </div>
                    <div className="space-y-1">
                        <div className="flex h-3.5 items-baseline justify-between gap-2">
                            <Label>Expiry</Label>
                            {isDo ? (
                                <Ann tone="accent">MM / YY</Ann>
                            ) : null}
                        </div>
                        <Shell tone={isDo ? "default" : "error"} className="w-24">
                            <Value mono>{isDo ? "03 / 27" : "March 2027"}</Value>
                        </Shell>
                    </div>
                    {/* Reserved so both panes keep the same geometry. */}
                    <div className="flex h-3.5 items-center">
                        {isDo ? null : <ErrorNote>Enter the expiry as MM / YY</ErrorNote>}
                    </div>
                    <Ann>
                        {isDo
                            ? "hint before entry — accepted first try"
                            : "no hint — the format arrives with the error"}
                    </Ann>
                </PreviewFrame>
            );
        }

        // The same four filled fields in the same order in both panes; only
        // the column count changes. The blue ordinals are the tab path, so
        // the don't pane shows the eye reading 1 → 3 while Tab goes 1 → 2.
        case "form-10": {
            const cell = (order: number, label: string, value: string) => (
                <div key={label} className="min-w-0 space-y-0.5">
                    <div className="flex items-baseline gap-1">
                        <Ann tone="accent">{order}</Ann>
                        <Label className="truncate">{label}</Label>
                    </div>
                    <Shell compact>
                        <Value className="text-[10px]">{value}</Value>
                    </Shell>
                </div>
            );
            const fields: [number, string, string][] = [
                [1, "Full name", "Maya Chen"],
                [2, "Work email", "maya@acme.com"],
                [3, "Company", "Acme Design"],
                [4, "Phone", "+1 415 555 0182"],
            ];
            if (variant === "do") {
                return (
                    <PreviewFrame size={size} className="flex flex-col justify-center gap-1.5">
                        {fields.map(([order, label, value]) => cell(order, label, value))}
                        <Ann>1 column · eye and Tab agree</Ann>
                    </PreviewFrame>
                );
            }
            // Two stacked columns: Tab walks down column 1 before column 2,
            // so the top visual row is stops 1 and 3.
            return (
                <PreviewFrame size={size} className="flex flex-col justify-center gap-1.5">
                    <div className="grid grid-cols-2 gap-x-2.5">
                        <div className="min-w-0 space-y-1.5">
                            {fields.slice(0, 2).map(([order, label, value]) => cell(order, label, value))}
                        </div>
                        <div className="min-w-0 space-y-1.5">
                            {fields.slice(2).map(([order, label, value]) => cell(order, label, value))}
                        </div>
                    </div>
                    <Ann>2 columns · eye reads 1 → 3, Tab goes 1 → 2</Ann>
                </PreviewFrame>
            );
        }

        // The same two signup fields in both panes. The one variable is
        // whether the answer the app already holds — the request locale, the
        // system clock — arrives in the field or is left for the user to hunt.
        case "form-11": {
            const isDo = variant === "do";
            const note = (filled: string, empty: string) => (
                <Ann tone={isDo ? "accent" : "muted"}>
                    {isDo ? filled : empty}
                </Ann>
            );
            return (
                <PreviewFrame size={size} className="flex flex-col justify-center gap-2.5">
                    <div className="space-y-1">
                        <div className="flex h-3.5 items-baseline justify-between gap-2">
                            <Label>Country</Label>
                            {note("from en-IN locale", "195 options · A–Z")}
                        </div>
                        <Shell>
                            <Value muted={!isDo}>{isDo ? "India" : "Select country…"}</Value>
                            <Chevron />
                        </Shell>
                    </div>
                    <div className="space-y-1">
                        <div className="flex h-3.5 items-baseline justify-between gap-2">
                            <Label>Start date</Label>
                            {note("today", "no default")}
                        </div>
                        <Shell>
                            <Value muted={!isDo} mono>
                                {isDo ? "07 Sep 2026" : "dd/mm/yyyy"}
                            </Value>
                            <CalendarDays
                                size={12}
                                strokeWidth={1.5}
                                aria-hidden
                                className="ml-auto shrink-0 text-neutral-400 dark:text-neutral-500"
                            />
                        </Shell>
                    </div>
                    <Ann>{isDo ? "0 taps to accept both" : "2 lookups before you start"}</Ann>
                </PreviewFrame>
            );
        }

        // The same field holding the same saved value at the same moment —
        // one beat after Save. Only the confirmation changes, so the don't
        // pane is a screen that cannot tell you whether anything happened.
        case "form-12": {
            const isDo = variant === "do";
            return (
                <PreviewFrame size={size} className="flex flex-col justify-center gap-2.5">
                    <div className="space-y-1">
                        <div className="flex h-3.5 items-baseline justify-between gap-2">
                            <Label>Display name</Label>
                            <Ann>after Save</Ann>
                        </div>
                        <Shell>
                            <Value>Maya Chen</Value>
                        </Shell>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <MiniButton label="Save changes" variant="primary" size={size} />
                        {isDo ? (
                            <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                                <CircleCheck size={12} strokeWidth={1.75} aria-hidden />
                                Saved successfully
                            </span>
                        ) : null}
                    </div>
                    <Ann>
                        {isDo ? "1 signal — the save is confirmed" : "0 signals — no way to tell"}
                    </Ann>
                </PreviewFrame>
            );
        }

        default:
            return null;
    }
};
