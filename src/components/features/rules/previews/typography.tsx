import type { ReactNode } from "react";

import { RestaurantReview } from "./reading-examples";

import { CreditCard, FileText, History, Settings, ShieldAlert, Users } from "@/components/ui/icons";

import {
    Annotation,
    ANNOTATION_INK,
    PRODUCT_MUTED,
    PreviewFrame,
    type PreviewRenderer,
} from "@/components/features/rules/preview-primitives";
import { cn } from "@/lib/utils";

// Authored previews for typo-1..typo-15.
// Every pair is a controlled experiment: the same UI vignette in both panes,
// with exactly one typographic variable changed. Type is the protagonist, so
// the previews render real copy at honest sizes and annotate the measurement
// that proves the point.

// Blue-600 keeps small measurement text above 4.5:1 on white.
// Graphical rules and bars keep blue-500.
const ACCENT_TEXT = "text-blue-600 dark:text-blue-400";
const ACCENT_BG = "bg-blue-500 dark:bg-blue-400";

const SPEC = "font-mono text-[10px] tabular-nums";

/** Mono measurement annotation — the evidence artifact of the static previews. */
function Spec({ children, className }: { children: ReactNode; className?: string }) {
    return <Annotation className={cn(SPEC, ANNOTATION_INK, className)}>{children}</Annotation>;
}

// The two states are alternatives, never stacked: cn() is plain concatenation,
// so an active dark:text-neutral-50 beside the base dark:text-neutral-300 lost
// by stylesheet order and the active row rendered as dim as the rest.
function NavRow({ icon, label, active }: { icon: ReactNode; label: string; active?: boolean }) {
    return (
        <div
            className={cn(
                "flex items-center gap-2 rounded-sm px-1.5 py-1 text-[12px]",
                active
                    ? "bg-neutral-100 font-semibold text-neutral-900 dark:bg-neutral-800/60 dark:text-neutral-50"
                    : "text-neutral-600 dark:text-neutral-300"
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
            <span className="flex size-6 shrink-0 items-center justify-center rounded-[4px] bg-neutral-100 dark:bg-neutral-800">
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
            {/* The file's size is the product's own meta, set in the spec face, not evidence. */}
            <span className={cn(SPEC, PRODUCT_MUTED, "ml-auto shrink-0")}>{meta}</span>
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

export const typographyPreviews: PreviewRenderer = (ruleId, variant) => {
    const isDo = variant === "do";

    switch (ruleId) {
        // Sentence case is king — the same invite dialog; only the casing of
        // the title and buttons changes. Body copy stays constant.
        case "typo-1": {
            const copy = isDo
                ? { title: "Invite your team", skip: "Skip for now", cta: "Send invites" }
                : { title: "Invite Your Team", skip: "Skip For Now", cta: "Send Invites" };
            return (
                <PreviewFrame className="flex items-center justify-center">
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

        // Letter spacing on caps: vary tracking on the short section label.
        case "typo-2":
            return (
                <PreviewFrame className="flex items-center justify-center">
                    <div className="w-full max-w-[220px]">
                        <div className="flex items-baseline justify-between gap-2">
                            <span
                                className={cn(
                                    "text-[11px] font-semibold uppercase",
                                    ACCENT_TEXT,
                                    isDo ? "tracking-[0.025em]" : "tracking-normal"
                                )}
                            >
                                Account
                            </span>
                            <Spec>{isDo ? "+0.025em" : "0em"}</Spec>
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
                <PreviewFrame className="flex flex-col justify-center">
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
                <PreviewFrame className="flex flex-col justify-center">
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
        // The annotation names the families so the reader can check the claim
        // instead of trusting the word "competing"; both fallback stacks list
        // a Linux face so the avoid pane still renders two distinct sans.
        case "typo-5": {
            const headingFamily = isDo
                ? "var(--font-inter), sans-serif"
                : "Arial, Helvetica, 'Liberation Sans', sans-serif";
            const bodyFamily = isDo
                ? "var(--font-inter), sans-serif"
                : "Verdana, 'DejaVu Sans', Geneva, sans-serif";
            return (
                <PreviewFrame className="flex items-center justify-center">
                    <div className="w-full max-w-[230px]">
                        <Spec className="block">
                            {isDo ? "1 sans · SF Pro or Inter" : "2 sans · Arial + Verdana"}
                        </Spec>
                        <p
                            className="mt-2 text-[17px] font-semibold leading-snug text-neutral-900 dark:text-neutral-50"
                            style={{ fontFamily: headingFamily }}
                        >
                            Meet your calmer inbox
                        </p>
                        <p
                            className="mt-1.5 text-[12px] leading-[1.5] text-neutral-500 dark:text-neutral-400"
                            style={{ fontFamily: bodyFamily }}
                        >
                            Focused messages first, everything else on your schedule
                        </p>
                    </div>
                </PreviewFrame>
            );
        }

        // Keep the email's ink constant so its size is the only variable.
        case "typo-6":
            return (
                <PreviewFrame className="flex items-center justify-center">
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
                                    PRODUCT_MUTED,
                                    isDo ? "text-[14px]" : "text-[10px]"
                                )}
                            >
                                amara@lumen.co
                            </p>
                        </div>
                        <Spec className="shrink-0 text-right">
                            {isDo ? "14px" : "10px"}
                        </Spec>
                    </div>
                </PreviewFrame>
            );

        // Numeric alignment — the same order summary, right-aligned in both
        // panes; only font-variant-numeric changes. The amounts are 1-heavy on
        // purpose: in SF Pro and Inter the proportional 1 is far narrower than 0 or 8, so
        // proportional figures let the decimal points wander while tabular
        // figures stack every column. Alignment is not the variable here.
        case "typo-7": {
            const lines: Array<[string, string]> = [
                ["Subtotal", "$1,111.10"],
                ["Shipping", "$24.50"],
                ["Tax", "$808.08"],
            ];
            const amountClass = cn(
                "w-[72px] shrink-0 text-right text-[12px] text-neutral-800 dark:text-neutral-100",
                isDo ? "tabular-nums" : "proportional-nums"
            );
            return (
                <PreviewFrame className="flex items-center justify-center">
                    <div className="w-full max-w-[230px]">
                        <div className="flex items-baseline justify-between gap-2">
                            <span className="text-[11px] font-semibold text-neutral-900 dark:text-neutral-50">
                                Order summary
                            </span>
                            <Spec>{isDo ? "tabular-nums" : "proportional-nums"}</Spec>
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
                            <span className={amountClass}>$1,943.68</span>
                        </div>
                    </div>
                </PreviewFrame>
            );
        }

        // Left align body copy — the same changelog blurb under the same
        // centered headline, with the same accent rail drawn in both panes.
        // Only the paragraph's text-align changes: left starts every line on
        // the rail, center starts none of them there.
        case "typo-8":
            return (
                <PreviewFrame className="flex items-center justify-center">
                    <div className="w-full max-w-[220px]">
                        <p className="text-center text-[12px] font-semibold text-neutral-900 dark:text-neutral-50">
                            Changelog
                        </p>
                        <div className="relative mt-1.5 pl-2.5">
                            <span
                                aria-hidden
                                className={cn(
                                    "absolute left-0 top-0.5 bottom-0.5 w-px",
                                    ACCENT_BG
                                )}
                            />
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
                        <Spec className="mt-1.5 block pl-2.5">
                            text-align: {isDo ? "left" : "center"}
                        </Spec>
                    </div>
                </PreviewFrame>
            );

        // Limit font weights — the same digest settings card; only the weight
        // assignments change, and each line carries its weight as evidence.
        // The avoid pane spends a different weight on every role, including
        // a bold meta line and a medium description, so the four-weight
        // scramble is visible without reading the tags.
        // SF Pro and Inter (variable) both render every weight below, so no
        // tag names a weight the page fakes.
        case "typo-9": {
            const rows: Array<{ text: string; base: string; doW: string; dontW: string }> = [
                {
                    text: "Email notifications",
                    base: `text-[10px] uppercase tracking-[0.05em] ${PRODUCT_MUTED}`,
                    doW: "font-semibold",
                    dontW: "font-medium",
                },
                {
                    text: "Weekly digest",
                    base: "text-[13px] text-neutral-900 dark:text-neutral-50",
                    doW: "font-semibold",
                    dontW: "font-semibold",
                },
                {
                    text: "A summary of team activity every Monday",
                    base: "text-[11px] text-neutral-600 dark:text-neutral-300",
                    doW: "font-normal",
                    dontW: "font-medium",
                },
                {
                    text: "Sent to 12 people",
                    base: `text-[10px] ${PRODUCT_MUTED}`,
                    doW: "font-normal",
                    dontW: "font-bold",
                },
                {
                    text: "Edit schedule",
                    base: "text-[11px] text-neutral-900 dark:text-neutral-50",
                    doW: "font-semibold",
                    dontW: "font-normal",
                },
            ];
            const tagFor = (weightClass: string) =>
                weightClass === "font-normal"
                    ? "400"
                    : weightClass === "font-medium"
                      ? "500"
                      : weightClass === "font-semibold"
                        ? "600"
                        : "700";
            const used = [...new Set(rows.map((row) => tagFor(isDo ? row.doW : row.dontW)))].sort();
            return (
                <PreviewFrame className="flex items-center justify-center">
                    <div className="w-full max-w-[260px]">
                        <Spec className="block">
                            <span className={ACCENT_TEXT}>{used.length}</span> weights ·{" "}
                            {used.join(", ")}
                        </Spec>
                        <div className="mt-1.5 space-y-1">
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
                    </div>
                </PreviewFrame>
            );
        }

        // Truncation strategy — the same two-row file list; only the long
        // filename's overflow plan changes: ellipsis vs breaking the row.
        // The filename has to be long enough to actually break the row at the
        // narrowest surface it renders on. The previous 44-character name
        // measured 256px against 246px of column, so the avoid pane simply
        // fit and the pair taught nothing. At 58 characters it measures 341px,
        // overruns the 298px frame by 43px, and shoves the size column off
        // the edge — which is the damage the rule is actually about.
        case "typo-10":
            return (
                <PreviewFrame className="flex flex-col justify-center gap-1.5">
                    <Spec className="block">
                        {isDo ? "truncate — row keeps its columns" : "nowrap — row overruns"}
                    </Spec>
                    <FileRow name="Team-photo.jpg" meta="1.8 MB" />
                    <FileRow
                        name="2025-annual-report-board-review-final-v3-with-appendix.pdf"
                        meta="4.2 MB"
                        overflow={!isDo}
                    />
                </PreviewFrame>
            );

        // Minimum body size — the same security alert; only the font sizes
        // change, each line tagged with its rendered size.
        case "typo-11":
            return (
                <PreviewFrame className="flex items-center justify-center">
                    <div className="flex w-full max-w-[280px] items-start gap-2.5 rounded-md border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
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

        // Balance short headings — the same page header in the same 19ch
        // column; only the wrapping strategy changes, orphan vs even lines.
        //
        // The heading is chosen because it actually breaks differently. The
        // previous copy wrapped identically under `balance` and `wrap`, so
        // the pair claimed a difference the pixels did not have. Measured at
        // 19ch: wrap gives 194px / 58px — one word stranded — and balance
        // gives 122px / 130px. Because the column is sized in `ch`, that
        // wrap is the same on the card and on the detail page.
        //
        // The sample is a div, not a p or a heading, on purpose. globals.css
        // gives p/li/figcaption/blockquote `text-wrap: pretty` and h1-h6 both
        // `text-wrap: balance` and the serif face. Those defaults are now
        // correctly inside @layer base, so a utility does beat them — but on a
        // real element the pane would start from `pretty`/`balance` and would
        // also switch typeface, which is a second variable and would change the
        // measured wrap below. A div starts from the initial `wrap`, which the
        // avoid pane also states explicitly, so the utility under test is the
        // only thing that differs between panes.
        case "typo-12":
            return (
                <PreviewFrame className="flex flex-col justify-center">
                    <Spec className="block">
                        {isDo ? "balance — even lines" : "wrap — one word alone"}
                    </Spec>
                    <div
                        className={cn(
                            "mt-2 max-w-[19ch] text-[17px] font-semibold leading-snug tracking-[-0.01em] text-neutral-900 dark:text-neutral-50",
                            isDo ? "text-balance" : "text-wrap"
                        )}
                    >
                        One workspace for every project
                    </div>
                    <p className="mt-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                        Releases, docs, and decisions together
                    </p>
                </PreviewFrame>
            );

        // Pretty wrap UI copy — the same feature card; only the description's
        // wrapping changes, dangling last word vs a settled final line.
        //
        // Chrome only rebalances when the greedy last line really is one
        // short word, so the copy and the measure are picked to produce that.
        // Measured at 23ch: wrap ends on "work." alone at 29px, pretty pulls
        // "your" down to end on "your work." at 56px. The earlier copy left
        // a two-word last line, which pretty leaves untouched — the pane
        // looked authored but taught nothing.
        //
        // A div for the same reason as typo-12: on a real p both panes would
        // start from the base layer's `text-wrap: pretty`, so the avoid pane
        // would already be pretty and the pair would isolate nothing.
        case "typo-13":
            return (
                <PreviewFrame className="flex items-center justify-center">
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
                            <Spec className="shrink-0">{isDo ? "pretty" : "wrap"}</Spec>
                        </div>
                        <div
                            className={cn(
                                "mt-1.5 max-w-[23ch] text-[12px] leading-[1.5] text-neutral-500 dark:text-neutral-400",
                                isDo ? "text-pretty" : "text-wrap"
                            )}
                        >
                            Backups run hourly and keep the last thirty days of your work.
                        </div>
                    </div>
                </PreviewFrame>
            );

        case "typo-14":
            return <PreviewFrame className="flex items-center justify-center"><RestaurantReview variant={variant} /></PreviewFrame>;

        case "typo-15": {
            const letterSpacing = isDo ? "-0.015em" : "-0.05em";
            return (
                <PreviewFrame className="flex flex-col items-center justify-center gap-2">
                    <p
                        className="whitespace-nowrap text-[38px] leading-none font-semibold text-neutral-900 dark:text-neutral-50"
                        style={{ fontFamily: "var(--font-inter), sans-serif", letterSpacing }}
                    >
                        Work<br />together
                    </p>
                    <Spec>{letterSpacing}</Spec>
                </PreviewFrame>
            );
        }
        default:
            return null;
    }
};
