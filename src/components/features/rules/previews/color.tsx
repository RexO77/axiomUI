import type { ReactNode } from "react";

import {
    Check,
    CreditCard,
    FileText,
    Heart,
    Inbox,
    MessageCircle,
    Send,
    Trash2,
    X,
    Zap,
} from "lucide-react";

import {
    PreviewFrame,
    type PreviewRenderer,
    type Variant,
} from "@/components/features/rules/preview-primitives";
import { cn } from "@/lib/utils";

// Craft-pass previews for color-1..color-6, color-8..color-12 (color-7 is a
// motion showcase and stays with the motion system). Every pair is a controlled
// experiment: the same scene in both panes, with only the rule's variable
// changed. Color rules use the exact hues the rule discusses, so raw hex values
// appear here deliberately — the hex IS the content.

const NOTE = "font-mono text-[10px] tabular-nums";

// Evidence annotation for the default (theme-following) stage.
function Note({ children, className }: { children: ReactNode; className?: string }) {
    return <span className={cn(NOTE, "text-neutral-400 dark:text-neutral-500", className)}>{children}</span>;
}

// Evidence annotation pinned to a white card that stays white in dark mode
// (contrast math only holds against the surface it quotes).
function CardNote({ children, className }: { children: ReactNode; className?: string }) {
    return <span className={cn(NOTE, "text-neutral-400", className)}>{children}</span>;
}

// ── color-1 · 60-30-10 ─────────────────────────────────────────────
// A believable mini app: top bar, sidebar, content with one CTA. Do paints it
// 60% neutral / 30% secondary / 10% accent; Don't floods chrome with brand blue
// so the real CTA has nothing left to stand out with.
function SixtyThirtyTen({ variant }: { variant: Variant }) {
    const flooded = variant === "dont";
    return (
        <div className="flex h-[118px] flex-col gap-2">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800">
                <div
                    className={cn(
                        "flex h-6 shrink-0 items-center gap-1.5 border-b px-2",
                        flooded
                            ? "border-blue-700 bg-blue-600"
                            : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
                    )}
                >
                    <span
                        className={cn(
                            "size-2 rounded-full",
                            flooded ? "bg-blue-300" : "bg-neutral-900 dark:bg-neutral-100"
                        )}
                    />
                    <span
                        className={cn(
                            "text-[9px] font-semibold",
                            flooded ? "text-white" : "text-neutral-700 dark:text-neutral-200"
                        )}
                    >
                        Lumen
                    </span>
                    <span
                        className={cn(
                            "ml-auto rounded-sm px-1.5 py-px text-[8px] font-semibold",
                            flooded
                                ? "bg-blue-500 text-white"
                                : "border border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
                        )}
                    >
                        Upgrade
                    </span>
                </div>
                <div className="flex min-h-0 flex-1">
                    <div
                        className={cn(
                            "w-14 shrink-0 space-y-1.5 border-r p-2",
                            flooded
                                ? "border-blue-600 bg-blue-500"
                                : "border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900"
                        )}
                    >
                        <div
                            className={cn(
                                "h-1.5 w-9 rounded-full",
                                flooded ? "bg-blue-200" : "bg-neutral-400 dark:bg-neutral-500"
                            )}
                        />
                        <div
                            className={cn(
                                "h-1.5 w-7 rounded-full",
                                flooded ? "bg-blue-300" : "bg-neutral-300 dark:bg-neutral-700"
                            )}
                        />
                        <div
                            className={cn(
                                "h-1.5 w-8 rounded-full",
                                flooded ? "bg-blue-300" : "bg-neutral-300 dark:bg-neutral-700"
                            )}
                        />
                    </div>
                    <div className="flex-1 bg-white p-2 dark:bg-neutral-950">
                        <div className="h-2 w-16 rounded-full bg-neutral-400 dark:bg-neutral-500" />
                        <div className="mt-1.5 h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800" />
                        <div className="mt-1 h-1.5 w-3/4 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                        <span
                            className={cn(
                                "mt-2 inline-flex rounded-sm px-1.5 py-0.5 text-[8px] font-semibold text-white",
                                flooded ? "bg-blue-600" : "bg-blue-500 dark:bg-blue-400 dark:text-blue-950"
                            )}
                        >
                            New report
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <Note>{flooded ? "accent coverage ≈ 70%" : "accent coverage ≈ 10%"}</Note>
                <Note>{flooded ? "CTA lost in brand chrome" : "one element owns the blue"}</Note>
            </div>
        </div>
    );
}

// ── color-2 · Never pure black ─────────────────────────────────────
// The same white reading card in both panes; only the ink changes. The ratio is
// quoted against the white card, so the card stays white in dark mode too.
function NeverPureBlack({ variant }: { variant: Variant }) {
    const pureBlack = variant === "dont";
    const ink = pureBlack ? "text-[#000000]" : "text-[#0f172a]";
    return (
        <div className="flex h-[118px] flex-col justify-center">
            <div className="rounded-md border border-neutral-200 bg-white p-3 dark:border-neutral-700">
                <p className={cn("text-[11px] font-semibold", ink)}>Release notes</p>
                <p className={cn("mt-1 text-[10px] leading-4", ink)}>
                    Sync now runs offline, and search indexes twice as fast across large workspaces
                </p>
                <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-1.5">
                    <CardNote>{pureBlack ? "#000000 on #ffffff" : "#0f172a on #ffffff"}</CardNote>
                    <CardNote>{pureBlack ? "21:1 — max luminance jump" : "17.7:1 — still AAA, no glare"}</CardNote>
                </div>
            </div>
        </div>
    );
}

// ── color-3 · Colored shadows ──────────────────────────────────────
// One indigo promo card, one variable: the hue mixed into its shadow.
function ColoredShadows({ variant }: { variant: Variant }) {
    const grey = variant === "dont";
    return (
        <div className="flex h-[118px] flex-col items-center justify-center gap-4">
            <div
                className="w-40 rounded-md bg-indigo-500 px-3 py-2.5 text-white"
                style={{
                    boxShadow: grey
                        ? "0 8px 20px -4px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.25)"
                        : "0 8px 20px -4px rgba(99, 102, 241, 0.5), 0 2px 6px rgba(99, 102, 241, 0.3)",
                }}
            >
                <div className="flex items-center gap-1.5">
                    <Zap aria-hidden className="size-3.5 stroke-[1.5]" />
                    <span className="text-[11px] font-semibold">Upgrade to Pro</span>
                </div>
                <p className="mt-0.5 text-[10px] tabular-nums text-indigo-100">$12/mo · billed yearly</p>
            </div>
            <Note>{grey ? "shadow: black/40 — pasted on" : "shadow: indigo-500/50 — lit by itself"}</Note>
        </div>
    );
}

// ── color-4 · Semantic colors ──────────────────────────────────────
// One feed card. Delete stays red in both panes; the Like icon either keeps
// brand blue (Do) or hijacks the same red as the destructive action (Don't).
function SemanticColors({ variant }: { variant: Variant }) {
    const hijacked = variant === "dont";
    return (
        <div className="flex h-[118px] flex-col justify-center">
            <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                    <span className="size-5 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                    <span className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-100">
                        Priya Raman
                    </span>
                    <Note>2h</Note>
                </div>
                <p className="mt-1.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                    Shipped the new onboarding flow to every workspace
                </p>
                <div className="mt-2 flex items-center gap-4 border-t border-neutral-100 pt-2 dark:border-neutral-800">
                    <span
                        className={cn(
                            "flex items-center gap-1",
                            hijacked ? "text-rose-500 dark:text-rose-400" : "text-blue-500 dark:text-blue-400"
                        )}
                    >
                        <Heart aria-hidden className="size-3.5 stroke-[1.5]" fill="currentColor" />
                        <span className={cn(NOTE, "text-inherit")}>128</span>
                    </span>
                    <span className="flex items-center gap-1 text-neutral-400 dark:text-neutral-500">
                        <MessageCircle aria-hidden className="size-3.5 stroke-[1.5]" />
                        <span className={NOTE}>24</span>
                    </span>
                    <span className="ml-auto flex items-center gap-1 text-rose-600 dark:text-rose-400">
                        <Trash2 aria-hidden className="size-3.5 stroke-[1.5]" />
                        <span className="text-[10px] font-medium">Delete</span>
                    </span>
                </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
                <Note>{hijacked ? "like: rose-500" : "like: blue-500"}</Note>
                <Note>{hijacked ? "same red as destructive" : "red kept for destructive"}</Note>
            </div>
        </div>
    );
}

// ── color-5 · Border colors ────────────────────────────────────────
// One settings card, three rows. Only the border/divider value changes; at
// neutral-400 the lines outweigh the text they frame.
function BorderColors({ variant }: { variant: Variant }) {
    const heavy = variant === "dont";
    const line = heavy
        ? "border-neutral-400 dark:border-neutral-500"
        : "border-neutral-200 dark:border-neutral-800";
    const rows: Array<[string, string]> = [
        ["Notifications", "On"],
        ["Members", "12"],
        ["Billing", "Pro"],
    ];
    return (
        <div className="flex h-[118px] flex-col justify-center gap-2">
            <div className={cn("overflow-hidden rounded-md border", line)}>
                {rows.map(([label, value], i) => (
                    <div
                        key={label}
                        className={cn("flex items-center justify-between border-t px-3 py-1.5", line, {
                            "border-t-0": i === 0,
                        })}
                    >
                        <span className="text-[11px] font-medium text-neutral-800 dark:text-neutral-100">
                            {label}
                        </span>
                        <Note>{value}</Note>
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-between">
                <Note>{heavy ? "border: neutral-400" : "border: neutral-200"}</Note>
                <Note>{heavy ? "lines louder than labels" : "content leads, lines recede"}</Note>
            </div>
        </div>
    );
}

// ── color-6 · Double contrast for borders ──────────────────────────
// A dialog slice: input + outline button, with a passive divider held at
// neutral-200 in BOTH panes as the baseline the interactive border must beat.
function DoubleContrastBorders({ variant }: { variant: Variant }) {
    const faint = variant === "dont";
    const interactive = faint
        ? "border-neutral-100 dark:border-neutral-800"
        : "border-neutral-300 dark:border-neutral-600";
    return (
        <div className="flex h-[118px] flex-col justify-center gap-2">
            <div>
                <span className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-300">
                    Invite teammates
                </span>
                <div
                    className={cn(
                        "mt-1 flex h-7 items-center rounded-md border bg-white px-2 dark:bg-neutral-900",
                        interactive
                    )}
                >
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                        teammate@company.com
                    </span>
                </div>
            </div>
            <div className="border-t border-neutral-200 dark:border-neutral-800" />
            <div className="flex items-center justify-end gap-2">
                <span
                    className={cn(
                        "rounded-md border px-2.5 py-1 text-[10px] font-semibold text-neutral-700 dark:text-neutral-200",
                        interactive
                    )}
                >
                    Cancel
                </span>
                <span className="rounded-md bg-neutral-900 px-2.5 py-1 text-[10px] font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900">
                    Send invite
                </span>
            </div>
            <div className="flex items-center justify-between">
                <Note>{faint ? "interactive: neutral-100" : "interactive: neutral-300"}</Note>
                <Note>{faint ? "fainter than the divider" : "divider stays neutral-200"}</Note>
            </div>
        </div>
    );
}

// ── color-8 · Dark mode isn't inverted ─────────────────────────────
// Renders its own dark canvas via an inset layer, regardless of site theme.
// Do: gray-900 page, gray-800 card sitting lighter, desaturated brand, photo
// untouched. Don't: filter-invert world — white card, brand flipped to muddy
// orange (#3b82f6 inverts to #c47d09), photo turned into a negative.
function DarkModeNotInverted({ variant }: { variant: Variant }) {
    const inverted = variant === "dont";
    return (
        <div className={cn("absolute inset-0 p-4", inverted ? "bg-black" : "bg-neutral-900")}>
            <div className="flex h-[118px] flex-col gap-2">
                <div className={cn("flex-1 rounded-md p-2.5", inverted ? "bg-white" : "bg-neutral-800")}>
                    <div className="flex items-center justify-between">
                        <span
                            className={cn(
                                "text-[11px] font-semibold",
                                inverted ? "text-black" : "text-neutral-100"
                            )}
                        >
                            Storage
                        </span>
                        <span className={cn(NOTE, inverted ? "text-neutral-500" : "text-neutral-400")}>
                            82% used
                        </span>
                    </div>
                    <div
                        className={cn(
                            "mt-1.5 h-1.5 w-full overflow-hidden rounded-full",
                            inverted ? "bg-neutral-200" : "bg-neutral-700"
                        )}
                    >
                        <div
                            className={cn(
                                "h-full w-4/5 rounded-full",
                                inverted ? "bg-[#c47d09]" : "bg-blue-400"
                            )}
                        />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                        <div
                            className={cn(
                                "h-8 w-12 rounded-sm bg-gradient-to-br",
                                inverted
                                    ? "from-[#822c03] via-[#631c26] to-[#911848]"
                                    : "from-sky-400 via-teal-400 to-emerald-400"
                            )}
                        />
                        <div className="flex flex-col">
                            <span
                                className={cn(
                                    "text-[10px] font-medium",
                                    inverted ? "text-black" : "text-neutral-200"
                                )}
                            >
                                team-offsite.jpg
                            </span>
                            <span className={cn(NOTE, inverted ? "text-neutral-500" : "text-neutral-400")}>
                                {inverted ? "photo renders as a negative" : "photo untouched"}
                            </span>
                        </div>
                    </div>
                </div>
                <span className={cn(NOTE, "text-neutral-400")}>
                    {inverted
                        ? "filter: invert(1) — brand flips to orange"
                        : "bg 900 · card 800 (lighter = higher) · brand desaturated"}
                </span>
            </div>
        </div>
    );
}

// ── color-9 · Accessible contrast ratios ───────────────────────────
// Real helper text on a real white field, ratio measured, verdict attached.
// The card stays white in dark mode so the quoted ratios stay true.
function AccessibleContrast({ variant }: { variant: Variant }) {
    const guessed = variant === "dont";
    return (
        <div className="flex h-[118px] flex-col justify-center">
            <div className="rounded-md border border-neutral-200 bg-white p-3 dark:border-neutral-700">
                <span className="text-[10px] font-semibold text-neutral-800">Email</span>
                <div className="mt-1 flex h-6 items-center rounded-md border border-neutral-300 px-2">
                    <span className="text-[10px] text-neutral-800">priya@acme.dev</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className={cn("text-[10px]", guessed ? "text-[#aaaaaa]" : "text-[#737373]")}>
                        Used for receipts only
                    </span>
                    <span
                        className={cn(
                            "flex shrink-0 items-center gap-1",
                            NOTE,
                            guessed ? "text-rose-600" : "text-emerald-600"
                        )}
                    >
                        {guessed ? (
                            <X aria-hidden className="size-3 stroke-[2]" />
                        ) : (
                            <Check aria-hidden className="size-3 stroke-[2]" />
                        )}
                        {guessed ? "#aaaaaa · 2.3:1 fails AA" : "#737373 · 4.7:1 passes AA"}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ── color-10 · Opacity over new colors ─────────────────────────────
// One nav, three states. Do derives hover/selected from blue-500 alpha (they
// re-theme for free — visible in dark mode); Don't hand-picks light hexes that
// drift apart and never adapt.
function OpacityOverNewColors({ variant }: { variant: Variant }) {
    const handPicked = variant === "dont";
    return (
        <div className="flex h-[118px] flex-col justify-center gap-1">
            <div className="flex h-6 items-center gap-1.5 rounded-md px-2 text-neutral-600 dark:text-neutral-300">
                <Inbox aria-hidden className="size-3 stroke-[1.5]" />
                <span className="text-[10px] font-medium">Inbox</span>
                <Note className="ml-auto">{handPicked ? "transparent" : "rest"}</Note>
            </div>
            <div
                className={cn(
                    "flex h-6 items-center gap-1.5 rounded-md px-2",
                    handPicked
                        ? "bg-[#e8f0fe] text-neutral-600"
                        : "bg-blue-500/10 text-neutral-600 dark:bg-blue-400/10 dark:text-neutral-300"
                )}
            >
                <FileText aria-hidden className="size-3 stroke-[1.5]" />
                <span className="text-[10px] font-medium">Drafts</span>
                <Note className={cn("ml-auto", { "text-neutral-500 dark:text-neutral-500": handPicked })}>
                    {handPicked ? "#e8f0fe" : "blue-500/10"}
                </Note>
            </div>
            <div
                className={cn(
                    "flex h-6 items-center gap-1.5 rounded-md px-2 font-semibold",
                    handPicked
                        ? "bg-[#dcebf5] text-[#1967d2]"
                        : "bg-blue-500/15 text-blue-600 dark:bg-blue-400/20 dark:text-blue-400"
                )}
            >
                <Send aria-hidden className="size-3 stroke-[1.5]" />
                <span className="text-[10px]">Sent</span>
                <Note className={cn("ml-auto", { "text-neutral-500 dark:text-neutral-500": handPicked })}>
                    {handPicked ? "#dcebf5 + #1967d2" : "blue-500/15"}
                </Note>
            </div>
            <Note className="mt-1">
                {handPicked
                    ? "three unrelated hexes — rebrand touches each one"
                    : "every state = blue-500 / alpha — rebrand is one edit"}
            </Note>
        </div>
    );
}

// ── color-11 · Neutral image outlines ──────────────────────────────
// Two upload thumbnails, one light-edged, one dark-edged. Do outlines with pure
// black/10 that flips to white/10 in dark mode; Don't uses a tinted slate that
// reads as dirt in light mode and never flips for dark.
function NeutralImageOutlines({ variant }: { variant: Variant }) {
    const tinted = variant === "dont";
    const edge = tinted
        ? "outline outline-1 -outline-offset-1 outline-slate-900/20"
        : "outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10";
    return (
        <div className="flex h-[118px] flex-col justify-center gap-2">
            <span className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-300">
                Recent uploads
            </span>
            <div className="flex gap-2">
                <div
                    className={cn(
                        "h-14 flex-1 rounded-md bg-gradient-to-br from-white via-sky-100 to-sky-300",
                        edge
                    )}
                />
                <div
                    className={cn(
                        "h-14 flex-1 rounded-md bg-gradient-to-br from-amber-200 via-rose-300 to-indigo-400",
                        edge
                    )}
                />
            </div>
            <div className="flex items-center justify-between">
                <Note>{tinted ? "outline: slate-900/20" : "outline: black/10 · white/10 dark"}</Note>
                <Note>{tinted ? "tinted, never flips for dark" : "pure neutral, flips per theme"}</Note>
            </div>
        </div>
    );
}

// ── color-12 · Shadows can replace borders ─────────────────────────
// Two payment-method cards. Do lifts them with a layered shadow stack (1px ring
// for the edge, soft blur for elevation); Don't strokes every card and the list
// reads as a spreadsheet of boxes.
function ShadowsReplaceBorders({ variant }: { variant: Variant }) {
    const stroked = variant === "dont";
    const surface = stroked
        ? "border border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-900"
        : "bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] dark:bg-neutral-900 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.09),0_2px_4px_rgba(0,0,0,0.5)]";
    const cards: Array<[string, string]> = [
        ["Visa ending 4242", "Expires 04/28"],
        ["Mastercard ending 8210", "Expires 11/26"],
    ];
    return (
        <div className="flex h-[118px] flex-col justify-center gap-2">
            {cards.map(([name, expiry]) => (
                <div key={name} className={cn("flex items-center gap-2.5 rounded-md p-2.5", surface)}>
                    <CreditCard
                        aria-hidden
                        className="size-4 stroke-[1.5] text-neutral-400 dark:text-neutral-500"
                    />
                    <div className="flex flex-col">
                        <span className="text-[11px] font-medium text-neutral-800 dark:text-neutral-100">
                            {name}
                        </span>
                        <Note>{expiry}</Note>
                    </div>
                </div>
            ))}
            <Note>
                {stroked
                    ? "border: 1px neutral-300 on every card"
                    : "0 0 0 1px black/6% + 0 2px 4px black/4%"}
            </Note>
        </div>
    );
}

export const colorPreviews: PreviewRenderer = (ruleId, variant, size) => {
    switch (ruleId) {
        case "color-1":
            return (
                <PreviewFrame size={size}>
                    <SixtyThirtyTen variant={variant} />
                </PreviewFrame>
            );
        case "color-2":
            return (
                <PreviewFrame size={size}>
                    <NeverPureBlack variant={variant} />
                </PreviewFrame>
            );
        case "color-3":
            return (
                <PreviewFrame size={size}>
                    <ColoredShadows variant={variant} />
                </PreviewFrame>
            );
        case "color-4":
            return (
                <PreviewFrame size={size}>
                    <SemanticColors variant={variant} />
                </PreviewFrame>
            );
        case "color-5":
            return (
                <PreviewFrame size={size}>
                    <BorderColors variant={variant} />
                </PreviewFrame>
            );
        case "color-6":
            return (
                <PreviewFrame size={size}>
                    <DoubleContrastBorders variant={variant} />
                </PreviewFrame>
            );
        case "color-8":
            return (
                <PreviewFrame size={size}>
                    <DarkModeNotInverted variant={variant} />
                </PreviewFrame>
            );
        case "color-9":
            return (
                <PreviewFrame size={size}>
                    <AccessibleContrast variant={variant} />
                </PreviewFrame>
            );
        case "color-10":
            return (
                <PreviewFrame size={size}>
                    <OpacityOverNewColors variant={variant} />
                </PreviewFrame>
            );
        case "color-11":
            return (
                <PreviewFrame size={size}>
                    <NeutralImageOutlines variant={variant} />
                </PreviewFrame>
            );
        case "color-12":
            return (
                <PreviewFrame size={size}>
                    <ShadowsReplaceBorders variant={variant} />
                </PreviewFrame>
            );
        default:
            return null;
    }
};
