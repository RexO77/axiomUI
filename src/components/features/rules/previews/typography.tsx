import type { ReactNode } from "react";

import { CreditCard, FileText, History, Settings, ShieldAlert, Users } from "lucide-react";

import {
    PreviewFrame,
    type PreviewRenderer,
} from "@/components/features/rules/preview-primitives";
import { cn } from "@/lib/utils";

// Authored previews for typo-1..typo-13.
// Every pair is a controlled experiment: the same UI vignette in both panes,
// with exactly one typographic variable changed. Type is the protagonist, so
// the previews render real copy at honest sizes and annotate the measurement
// that proves the point.

const ACCENT_TEXT = "text-blue-500 dark:text-blue-400";
const ACCENT_BG = "bg-blue-500 dark:bg-blue-400";

/** Mono measurement annotation — the evidence artifact of the static previews. */
function Spec({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <span
            className={cn(
                "font-mono text-[10px] tabular-nums text-neutral-400 dark:text-neutral-500",
                className
            )}
        >
            {children}
        </span>
    );
}

function NavRow({ icon, label, active }: { icon: ReactNode; label: string; active?: boolean }) {
    return (
        <div
            className={cn(
                "flex items-center gap-2 rounded-sm px-1.5 py-1 text-[12px] text-neutral-600 dark:text-neutral-300",
                active &&
                    "bg-neutral-100 font-semibold text-neutral-900 dark:bg-neutral-800/60 dark:text-neutral-50"
            )}
        >
            {icon}
            {label}
        </div>
    );
}

function FileRow({ name, meta, overflow }: { name: string; meta: string; overflow?: boolean }) {
    return (
        <div className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-900">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-neutral-100 dark:bg-neutral-800">
                <FileText
                    aria-hidden
                    className="size-3.5 stroke-[1.5] text-neutral-500 dark:text-neutral-400"
                />
            </span>
            <span
                className={cn(
                    "text-[12px] text-neutral-800 dark:text-neutral-100",
                    overflow ? "whitespace-nowrap" : "min-w-0 flex-1 truncate"
                )}
            >
                {name}
            </span>
            <Spec className="ml-auto shrink-0">{meta}</Spec>
        </div>
    );
}

/** One line of the weight-audit card (typo-9): copy left, weight tag right. */
function WeightRow({
    text,
    base,
    weightClass,
    tag,
}: {
    text: string;
    base: string;
    weightClass: string;
    tag: string;
}) {
    return (
        <div className="flex items-baseline justify-between gap-3">
            <span className={cn(base, weightClass)}>{text}</span>
            <Spec className="shrink-0">{tag}</Spec>
        </div>
    );
}

export const typographyPreviews: PreviewRenderer = (ruleId, variant, size) => {
    const isDo = variant === "do";

    switch (ruleId) {
        // Sentence case is king — the same invite dialog; only the casing of
        // the title and buttons changes. Body copy stays constant.
        case "typo-1": {
            const copy = isDo
                ? { title: "Invite your team", skip: "Skip for now", cta: "Send invites" }
                : { title: "Invite Your Team", skip: "Skip For Now", cta: "Send Invites" };
            return (
                <PreviewFrame size={size} className="flex items-center justify-center">
                    <div className="w-full max-w-[230px] rounded-md border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <p className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-50">
                            {copy.title}
                        </p>
                        <p className="mt-1 text-[11px] leading-[1.5] text-neutral-500 dark:text-neutral-400">
                            Everyone gets an email with a join link
                        </p>
                        <div className="mt-3 flex items-center justify-end gap-2">
                            <span className="rounded-sm px-2 py-1 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                                {copy.skip}
                            </span>
                            <span className="rounded-sm bg-neutral-900 px-2.5 py-1 text-[11px] font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900">
                                {copy.cta}
                            </span>
                        </div>
                    </div>
                </PreviewFrame>
            );
        }

        // Letter spacing on caps — the same sidebar nav group; only the
        // tracking on the uppercase section label changes.
        case "typo-2":
            return (
                <PreviewFrame size={size} className="flex items-center justify-center">
                    <div className="w-full max-w-[190px]">
                        <div className="flex items-baseline justify-between gap-2">
                            <span
                                className={cn(
                                    "text-[10px] font-semibold uppercase",
                                    ACCENT_TEXT,
                                    isDo ? "tracking-[0.05em]" : "tracking-normal"
                                )}
                            >
                                Account settings
                            </span>
                            <Spec>{isDo ? "+0.05em" : "0em"}</Spec>
                        </div>
                        <div className="mt-2.5 space-y-1">
                            <NavRow
                                icon={
                                    <Settings
                                        aria-hidden
                                        className="size-3.5 stroke-[1.5] text-neutral-400 dark:text-neutral-500"
                                    />
                                }
                                label="Profile"
                                active
                            />
                            <NavRow
                                icon={
                                    <Users
                                        aria-hidden
                                        className="size-3.5 stroke-[1.5] text-neutral-400 dark:text-neutral-500"
                                    />
                                }
                                label="Members"
                            />
                            <NavRow
                                icon={
                                    <CreditCard
                                        aria-hidden
                                        className="size-3.5 stroke-[1.5] text-neutral-400 dark:text-neutral-500"
                                    />
                                }
                                label="Billing"
                            />
                        </div>
                    </div>
                </PreviewFrame>
            );

        // Line height for body — the same 16px paragraph; only the leading
        // changes, and the mono tag states the exact ratio.
        case "typo-3":
            return (
                <PreviewFrame size={size} className="flex flex-col justify-center">
                    <Spec className="block">
                        16px / {isDo ? "24px" : "18px"} ·{" "}
                        <span className={ACCENT_TEXT}>{isDo ? "1.5" : "1.13"}</span>
                    </Spec>
                    <p
                        className={cn(
                            "mt-2 max-w-[240px] text-[16px] text-neutral-800 dark:text-neutral-100",
                            isDo ? "leading-[24px]" : "leading-[18px]"
                        )}
                    >
                        Your changes save automatically and sync to everyone on your team in real
                        time.
                    </p>
                </PreviewFrame>
            );

        // Line height for headings — the same 22px two-line hero heading;
        // only the leading changes.
        case "typo-4":
            return (
                <PreviewFrame size={size} className="flex flex-col justify-center">
                    <Spec className="block">
                        22px / {isDo ? "24px" : "33px"} ·{" "}
                        <span className={ACCENT_TEXT}>{isDo ? "1.1" : "1.5"}</span>
                    </Spec>
                    <p
                        className={cn(
                            "mt-2 max-w-[14ch] text-[22px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-neutral-50",
                            isDo ? "leading-[24px]" : "leading-[33px]"
                        )}
                    >
                        Everything in one workspace
                    </p>
                    <p className="mt-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                        Docs, tasks, and chat together
                    </p>
                </PreviewFrame>
            );

        // The 2-font limit — the same landing card. The recommended pane uses
        // one family throughout; the avoid pane mixes two competing sans faces.
        case "typo-5":
            return (
                <PreviewFrame size={size} className="flex items-center justify-center">
                    <div className="w-full max-w-[230px]">
                        <Spec className="block">{isDo ? "1 family" : "2 competing sans"}</Spec>
                        <p
                            className="mt-2 text-[17px] font-semibold leading-snug text-neutral-900 dark:text-neutral-50"
                            style={{
                                fontFamily: isDo
                                    ? "var(--font-manrope)"
                                    : "Arial, sans-serif",
                            }}
                        >
                            Meet your calmer inbox
                        </p>
                        <p
                            className="mt-1.5 text-[12px] leading-[1.5] text-neutral-500 dark:text-neutral-400"
                            style={{ fontFamily: isDo ? "var(--font-manrope)" : "Verdana, sans-serif" }}
                        >
                            Focused messages first, everything else on your schedule
                        </p>
                    </div>
                </PreviewFrame>
            );

        // De-emphasize with color, not size — the same member row; only the
        // email's treatment changes: lighter at full size vs tiny at full ink.
        case "typo-6":
            return (
                <PreviewFrame size={size} className="flex items-center justify-center">
                    <div className="flex w-full max-w-[250px] items-center gap-2.5 rounded-md border border-neutral-200 bg-white p-2.5 dark:border-neutral-800 dark:bg-neutral-900">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-semibold text-neutral-600 dark:bg-neutral-700 dark:text-neutral-200">
                            AC
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-semibold leading-tight text-neutral-900 dark:text-neutral-50">
                                Amara Chen
                            </p>
                            <p
                                className={cn(
                                    "truncate leading-tight",
                                    isDo
                                        ? "text-[14px] text-neutral-500 dark:text-neutral-400"
                                        : "text-[10px] text-neutral-900 dark:text-neutral-50"
                                )}
                            >
                                amara@lumen.co
                            </p>
                        </div>
                        <Spec className="shrink-0 text-right">
                            {isDo ? "14px" : "10px"}
                            <br />
                            {isDo ? "neutral-500" : "neutral-900"}
                        </Spec>
                    </div>
                </PreviewFrame>
            );

        // Numeric alignment — the same order summary; only the amount column
        // changes: right-aligned tabular figures vs left-aligned proportional.
        case "typo-7": {
            const lines: Array<[string, string]> = [
                ["Subtotal", "$1,284.00"],
                ["Shipping", "$24.50"],
                ["Tax", "$102.72"],
            ];
            const amountClass = cn(
                "w-[72px] shrink-0 text-[12px] text-neutral-800 dark:text-neutral-100",
                isDo ? "text-right tabular-nums" : "text-left"
            );
            return (
                <PreviewFrame size={size} className="flex items-center justify-center">
                    <div className="w-full max-w-[210px]">
                        <div className="flex items-baseline justify-between gap-2">
                            <span className="text-[11px] font-semibold text-neutral-900 dark:text-neutral-50">
                                Order summary
                            </span>
                            <Spec>{isDo ? "tabular-nums" : "proportional"}</Spec>
                        </div>
                        <div className="mt-2 space-y-1">
                            {lines.map(([label, amount]) => (
                                <div key={label} className="flex items-baseline justify-between gap-2">
                                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                        {label}
                                    </span>
                                    <span className={amountClass}>{amount}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-1.5 flex items-baseline justify-between gap-2 border-t border-neutral-200 pt-1.5 dark:border-neutral-800">
                            <span className="text-[11px] font-semibold text-neutral-900 dark:text-neutral-50">
                                Total
                            </span>
                            <span className={cn(amountClass, "font-semibold")}>$1,411.22</span>
                        </div>
                    </div>
                </PreviewFrame>
            );
        }

        // Left align body copy — the same changelog blurb under a centered
        // headline; only the paragraph alignment changes. The accent guide
        // marks the consistent left anchor the eye returns to.
        case "typo-8":
            return (
                <PreviewFrame size={size} className="flex items-center justify-center">
                    <div className="w-full max-w-[210px]">
                        <p className="text-center text-[12px] font-semibold text-neutral-900 dark:text-neutral-50">
                            Changelog
                        </p>
                        <div className="relative mt-1.5">
                            {isDo ? (
                                <span
                                    aria-hidden
                                    className={cn(
                                        "absolute -left-2 top-0.5 bottom-0.5 w-px",
                                        ACCENT_BG
                                    )}
                                />
                            ) : null}
                            <p
                                className={cn(
                                    "text-[12px] leading-[1.5] text-neutral-600 dark:text-neutral-300",
                                    isDo ? "text-left" : "text-center"
                                )}
                            >
                                Track every release, assign owners, and see what shipped without
                                leaving your dashboard.
                            </p>
                        </div>
                    </div>
                </PreviewFrame>
            );

        // Limit font weights — the same digest settings card; only the weight
        // assignments change, and each line carries its weight as evidence.
        case "typo-9": {
            const rows: Array<{ text: string; base: string; doW: string; dontW: string }> = [
                {
                    text: "Email notifications",
                    base: "text-[10px] uppercase tracking-[0.05em] text-neutral-400 dark:text-neutral-500",
                    doW: "font-semibold",
                    dontW: "font-light",
                },
                {
                    text: "Weekly digest",
                    base: "text-[13px] text-neutral-900 dark:text-neutral-50",
                    doW: "font-semibold",
                    dontW: "font-bold",
                },
                {
                    text: "A summary of team activity every Monday",
                    base: "text-[11px] text-neutral-600 dark:text-neutral-300",
                    doW: "font-normal",
                    dontW: "font-normal",
                },
                {
                    text: "Sent to 12 people",
                    base: "text-[10px] text-neutral-400 dark:text-neutral-500",
                    doW: "font-normal",
                    dontW: "font-medium",
                },
                {
                    text: "Edit schedule",
                    base: "text-[11px] text-neutral-900 dark:text-neutral-50",
                    doW: "font-semibold",
                    dontW: "font-semibold",
                },
            ];
            const tagFor = (weightClass: string) =>
                weightClass === "font-light"
                    ? "300"
                    : weightClass === "font-normal"
                      ? "400"
                      : weightClass === "font-medium"
                        ? "500"
                        : weightClass === "font-semibold"
                          ? "600"
                          : "700";
            return (
                <PreviewFrame size={size} className="flex items-center justify-center">
                    <div className="w-full max-w-[230px] space-y-1.5">
                        {rows.map((row) => {
                            const weightClass = isDo ? row.doW : row.dontW;
                            return (
                                <WeightRow
                                    key={row.text}
                                    text={row.text}
                                    base={row.base}
                                    weightClass={weightClass}
                                    tag={tagFor(weightClass)}
                                />
                            );
                        })}
                    </div>
                </PreviewFrame>
            );
        }

        // Truncation strategy — the same two-row file list; only the long
        // filename's overflow plan changes: ellipsis vs breaking the row.
        case "typo-10":
            return (
                <PreviewFrame size={size} className="flex flex-col justify-center gap-1.5">
                    <FileRow name="Team-photo.jpg" meta="1.8 MB" />
                    <FileRow
                        name="2025-annual-report-board-review-final-v3.pdf"
                        meta="4.2 MB"
                        overflow={!isDo}
                    />
                </PreviewFrame>
            );

        // Minimum body size — the same security alert; only the font sizes
        // change, each line tagged with its rendered size.
        case "typo-11":
            return (
                <PreviewFrame size={size} className="flex items-center justify-center">
                    <div className="flex w-full max-w-[250px] items-start gap-2.5 rounded-md border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-neutral-100 dark:bg-neutral-800">
                            <ShieldAlert
                                aria-hidden
                                className="size-3.5 stroke-[1.5] text-neutral-500 dark:text-neutral-400"
                            />
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2">
                                <p
                                    className={cn(
                                        "leading-[1.4] text-neutral-900 dark:text-neutral-50",
                                        isDo ? "text-[16px]" : "text-[11px]"
                                    )}
                                >
                                    New sign-in on Chrome
                                </p>
                                <Spec className="shrink-0">{isDo ? "16px" : "11px"}</Spec>
                            </div>
                            <div className="mt-0.5 flex items-baseline justify-between gap-2">
                                <p
                                    className={cn(
                                        "leading-[1.4] text-neutral-500 dark:text-neutral-400",
                                        isDo ? "text-[12px]" : "text-[9px]"
                                    )}
                                >
                                    2 min ago · London, UK
                                </p>
                                <Spec className="shrink-0">{isDo ? "12px" : "9px"}</Spec>
                            </div>
                        </div>
                    </div>
                </PreviewFrame>
            );

        // Balance short headings — the same page header in a narrow column;
        // only the wrapping strategy changes, orphan vs even lines.
        case "typo-12":
            return (
                <PreviewFrame size={size} className="flex flex-col justify-center">
                    <Spec className="block">
                        text-wrap: {isDo ? "balance" : "auto"}
                    </Spec>
                    <p
                        className={cn(
                            "mt-2 max-w-[19ch] text-[17px] font-semibold leading-snug tracking-[-0.01em] text-neutral-900 dark:text-neutral-50",
                            isDo && "text-balance"
                        )}
                    >
                        Everything your team ships in one place
                    </p>
                    <p className="mt-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                        Releases, docs, and decisions together
                    </p>
                </PreviewFrame>
            );

        // Pretty wrap UI copy — the same feature card; only the description's
        // wrapping changes, dangling last word vs a settled final line.
        case "typo-13":
            return (
                <PreviewFrame size={size} className="flex items-center justify-center">
                    <div className="w-full max-w-[230px] rounded-md border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center gap-2">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-neutral-100 dark:bg-neutral-800">
                                <History
                                    aria-hidden
                                    className="size-3.5 stroke-[1.5] text-neutral-500 dark:text-neutral-400"
                                />
                            </span>
                            <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-neutral-900 dark:text-neutral-50">
                                Automatic backups
                            </span>
                            <Spec className="shrink-0">{isDo ? "pretty" : "auto"}</Spec>
                        </div>
                        <p
                            className={cn(
                                "mt-1.5 max-w-[24ch] text-[12px] leading-[1.5] text-neutral-500 dark:text-neutral-400",
                                isDo && "text-pretty"
                            )}
                        >
                            Backups run hourly and restore with a single click.
                        </p>
                    </div>
                </PreviewFrame>
            );

        default:
            return null;
    }
};
