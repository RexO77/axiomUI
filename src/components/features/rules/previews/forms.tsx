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

function Label({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div
            className={cn(
                "text-[10px] font-medium text-neutral-600 dark:text-neutral-300",
                className
            )}
        >
            {children}
        </div>
    );
}

function Ann({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <span
            className={cn(
                "font-mono text-[9px] tabular-nums text-neutral-400 dark:text-neutral-500",
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
            <Ann className="text-blue-500 dark:text-blue-400">{label}</Ann>
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
                </PreviewFrame>
            );
        }

        // Two moments of the same email field: before typing, five characters in.
        case "form-2": {
            if (variant === "do") {
                return (
                    <PreviewFrame size={size} className="flex flex-col justify-center gap-3">
                        <div className="space-y-1">
                            <div className="flex items-baseline justify-between">
                                <Label>Work email</Label>
                                <Ann>0 chars</Ann>
                            </div>
                            <Shell>
                                <Value muted>you@company.com</Value>
                            </Shell>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-baseline justify-between">
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
                        <div className="flex justify-end">
                            <Ann>0 chars</Ann>
                        </div>
                        <Shell>
                            <Value muted>Email address</Value>
                        </Shell>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-end">
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
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size} className="flex flex-col justify-center gap-1.5">
                    {field(<>Full name{asterisk}</>, "Maya Chen")}
                    {field(<>Email{asterisk}</>, "maya@company.com")}
                    {field(<>Phone{asterisk}</>)}
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
                        <Label className="font-semibold text-neutral-700 dark:text-neutral-200">
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
                            <Label className="font-semibold text-neutral-700 dark:text-neutral-200">
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
                        <Label className="font-semibold text-neutral-700 dark:text-neutral-200">
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

        // Same settings card; only the deferred option's control changes.
        case "form-7": {
            return (
                <PreviewFrame size={size} className="flex flex-col justify-center gap-2.5">
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
                            {variant === "do" ? <Checkbox on /> : <Switch on />}
                        </div>
                    </div>
                    <MiniButton label="Save changes" variant="primary" size={size} className="w-full" />
                </PreviewFrame>
            );
        }

        // Two moments of the same email entry; only when the error fires changes.
        case "form-8": {
            if (variant === "do") {
                return (
                    <PreviewFrame size={size} className="flex flex-col justify-center gap-1">
                        <Label>Email</Label>
                        <Shell tone="focus">
                            <Value>maya@ac</Value>
                            <Caret />
                        </Shell>
                        <div className="flex h-3.5 items-center justify-end">
                            <Ann>typing</Ann>
                        </div>
                        <Shell>
                            <Value>maya@acme</Value>
                        </Shell>
                        <div className="flex h-3.5 items-center justify-between">
                            <ErrorNote>Enter a valid email</ErrorNote>
                            <Ann>after blur</Ann>
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size} className="flex flex-col justify-center gap-1">
                    <Label>Email</Label>
                    <Shell tone="error">
                        <Value>m</Value>
                        <Caret />
                    </Shell>
                    <div className="flex h-3.5 items-center justify-between">
                        <ErrorNote>Enter a valid email</ErrorNote>
                        <Ann>keystroke 1</Ann>
                    </div>
                    <Shell tone="error">
                        <Value>ma</Value>
                        <Caret />
                    </Shell>
                    <div className="flex h-3.5 items-center justify-between">
                        <ErrorNote>Enter a valid email</ErrorNote>
                        <Ann>keystroke 2</Ann>
                    </div>
                </PreviewFrame>
            );
        }

        // Same card row; the expiry field either states its pattern or rejects a guess.
        case "form-9": {
            const isDo = variant === "do";
            return (
                <PreviewFrame size={size} className="flex flex-col justify-center gap-2.5">
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
                    <div className="flex gap-2.5">
                        <div className="min-w-0 flex-1 space-y-1">
                            <Label>Expiry</Label>
                            {isDo ? (
                                <Shell>
                                    <Value muted mono>
                                        MM / YY
                                    </Value>
                                </Shell>
                            ) : (
                                <Shell tone="error">
                                    <Value>March 2027</Value>
                                </Shell>
                            )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                            <Label>CVC</Label>
                            <Shell>{isDo ? <Value muted mono>123</Value> : null}</Shell>
                        </div>
                    </div>
                    {isDo ? null : <ErrorNote>Invalid expiry</ErrorNote>}
                </PreviewFrame>
            );
        }

        // Same fields, numbered in tab order: one straight path vs a zigzag grid.
        case "form-10": {
            const cell = (order: number, label: string) => (
                <div className="min-w-0 space-y-0.5">
                    <div className="flex items-baseline gap-1">
                        <Ann className="text-blue-500 dark:text-blue-400">{order}</Ann>
                        <Label className="truncate">{label}</Label>
                    </div>
                    <Shell compact />
                </div>
            );
            if (variant === "do") {
                return (
                    <PreviewFrame size={size} className="flex flex-col justify-center gap-1.5">
                        {cell(1, "City")}
                        {cell(2, "Password")}
                        {cell(3, "Phone")}
                    </PreviewFrame>
                );
            }
            // Column-major tab order: the visual rows read 1 · 3 · 5 and 2 · 4 · 6.
            return (
                <PreviewFrame size={size} className="flex flex-col justify-center">
                    <div className="grid grid-cols-3 gap-x-2 gap-y-1.5">
                        {cell(1, "City")}
                        {cell(3, "Password")}
                        {cell(5, "Phone")}
                        {cell(2, "Full name")}
                        {cell(4, "Email")}
                        {cell(6, "ZIP")}
                    </div>
                </PreviewFrame>
            );
        }

        // Same signup step: locale has already answered vs a 195-entry scroll.
        case "form-11": {
            if (variant === "do") {
                return (
                    <PreviewFrame size={size} className="flex flex-col justify-center gap-2.5">
                        <div className="space-y-1">
                            <div className="flex items-baseline justify-between">
                                <Label>Country</Label>
                                <Ann className="text-blue-500 dark:text-blue-400">en-IN locale</Ann>
                            </div>
                            <Shell>
                                <Value>India</Value>
                                <Chevron />
                            </Shell>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-baseline justify-between">
                                <Label>Start date</Label>
                                <Ann className="text-blue-500 dark:text-blue-400">today</Ann>
                            </div>
                            <Shell>
                                <Value mono>10/08/2026</Value>
                                <CalendarDays
                                    size={12}
                                    strokeWidth={1.5}
                                    aria-hidden
                                    className="ml-auto shrink-0 text-neutral-400 dark:text-neutral-500"
                                />
                            </Shell>
                        </div>
                    </PreviewFrame>
                );
            }
            return (
                <PreviewFrame size={size} className="flex flex-col justify-center gap-1">
                    <Label>Country</Label>
                    <Shell tone="focus">
                        <Value muted>Select country…</Value>
                        <Chevron open />
                    </Shell>
                    <div className="relative rounded-md border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <span className="absolute right-1 top-1 h-4 w-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                        {["Afghanistan", "Albania", "Algeria"].map((country) => (
                            <div
                                key={country}
                                className="px-2 py-1 text-[10px] text-neutral-700 dark:text-neutral-200"
                            >
                                {country}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end">
                        <Ann>195 options · A–Z</Ann>
                    </div>
                </PreviewFrame>
            );
        }

        // Same settings save: explicit confirmation vs a silently reset field.
        case "form-12": {
            const isDo = variant === "do";
            return (
                <PreviewFrame size={size} className="flex flex-col justify-center gap-2.5">
                    <div className="space-y-1">
                        <Label>Display name</Label>
                        <Shell>{isDo ? <Value>Maya Chen</Value> : null}</Shell>
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
                </PreviewFrame>
            );
        }

        default:
            return null;
    }
};
