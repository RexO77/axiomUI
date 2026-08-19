import type { ReactNode } from "react";

import {
    AlertTriangle,
    CornerUpLeft,
    Download,
    FileText,
    FolderPlus,
    ImageOff,
    Monitor,
    MousePointer2,
    MoveRight,
    Plus,
    RotateCw,
    Search,
    Smartphone,
    Sparkles,
    Tablet,
    Trash2,
    X,
} from "lucide-react";

import {
    PreviewFrame,
    type PreviewRenderer,
    type PreviewSize,
    type Variant,
} from "@/components/features/rules/preview-primitives";
import { cn } from "@/lib/utils";

// Craft-pass previews for sys-2..sys-8 and sys-10..sys-14.
// sys-1 and sys-9 are motion showcases and never reach this module.

// ── Local vocabulary ────────────────────────────────────────────────

// Evidence annotation: mono, tabular, muted. Numbers only earn ink here.
const ANNOT = "font-mono text-[10px] tabular-nums text-neutral-400 dark:text-neutral-500";
// Fine annotation (axis labels, kbd meanings) — 8–9px is reserved for these.
const FINE = "font-mono text-[8px] tabular-nums text-neutral-400 dark:text-neutral-500";

function Kbd({ label }: { label: string }) {
    return (
        <span className="inline-flex items-center rounded-[3px] border border-neutral-300 bg-neutral-50 px-1 py-px font-mono text-[9px] leading-none text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            {label}
        </span>
    );
}

function CodeChip({ children }: { children: ReactNode }) {
    return (
        <code className="self-start rounded-sm bg-neutral-100 px-2 py-1 font-mono text-[9px] leading-none text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {children}
        </code>
    );
}

// ── sys-2 · Empty states ────────────────────────────────────────────
// Same "Projects" panel; the only variable is whether the empty body
// explains itself and offers the next action.
function emptyStates(variant: Variant, size: PreviewSize) {
    return (
        <PreviewFrame size={size} className="flex">
            <div className="flex w-full flex-col rounded-md border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between border-b border-neutral-200 px-2.5 py-1.5 dark:border-neutral-800">
                    <span className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-200">Projects</span>
                    <Search aria-hidden className="size-3 stroke-[1.5] text-neutral-400 dark:text-neutral-500" />
                </div>
                {variant === "do" ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-1 py-3">
                        <span className="flex size-7 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                            <FolderPlus aria-hidden className="size-3.5 stroke-[1.5] text-neutral-500 dark:text-neutral-400" />
                        </span>
                        <span className="text-[10px] font-medium text-neutral-700 dark:text-neutral-200">No projects yet</span>
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500">Create one to start tracking work</span>
                        <span className="mt-1 inline-flex items-center gap-1 rounded-sm bg-blue-500 px-2 py-1 text-[10px] font-semibold leading-none text-white dark:bg-blue-400 dark:text-neutral-950">
                            <Plus aria-hidden className="size-2.5 stroke-[2.5]" />
                            New project
                        </span>
                    </div>
                ) : (
                    <div className="flex-1" />
                )}
            </div>
        </PreviewFrame>
    );
}

// ── sys-3 · Click targets ───────────────────────────────────────────
// Same attachment row; the delete affordance is drawn at true size with
// a dashed hit-area guide — 44px vs a bare 16px glyph.
function tapTargets(variant: Variant, size: PreviewSize) {
    return (
        <PreviewFrame size={size} className="flex items-center">
            <div className="flex w-full items-center gap-2.5 rounded-md border border-neutral-200 px-2.5 py-2 dark:border-neutral-800">
                <FileText aria-hidden className="size-4 shrink-0 stroke-[1.5] text-neutral-400 dark:text-neutral-500" />
                <div className="min-w-0 flex-1">
                    <span className="block truncate text-[10px] font-medium text-neutral-700 dark:text-neutral-200">
                        invoice-0248.pdf
                    </span>
                    <span className={FINE}>1.2 MB</span>
                </div>
                {variant === "do" ? (
                    <div className="flex shrink-0 items-center gap-2">
                        <span className="flex size-11 items-center justify-center">
                            <Download aria-hidden className="size-3.5 stroke-[1.5] text-neutral-500 dark:text-neutral-400" />
                        </span>
                        <span className="flex size-11 items-center justify-center rounded-md border border-dashed border-blue-500/60 dark:border-blue-400/60">
                            <Trash2 aria-hidden className="size-3.5 stroke-[1.5] text-neutral-500 dark:text-neutral-400" />
                        </span>
                        <span className={ANNOT}>44×44</span>
                    </div>
                ) : (
                    <div className="flex shrink-0 items-center gap-2">
                        <span className="flex items-center">
                            <span className="flex size-4 items-center justify-center">
                                <Download aria-hidden className="size-3 stroke-[1.5] text-neutral-500 dark:text-neutral-400" />
                            </span>
                            <span className="flex size-4 items-center justify-center rounded-[2px] border border-dashed border-blue-500/60 dark:border-blue-400/60">
                                <Trash2 aria-hidden className="size-3 stroke-[1.5] text-neutral-500 dark:text-neutral-400" />
                            </span>
                        </span>
                        <span className={ANNOT}>16×16</span>
                    </div>
                )}
            </div>
        </PreviewFrame>
    );
}

// ── sys-4 · Date formats ────────────────────────────────────────────
// Same activity feed, same fixed timestamp slot. Relative times fit;
// ISO strings fight the layout and truncate mid-value.
function dateFormats(variant: Variant, size: PreviewSize) {
    const rows = [
        { initial: "M", text: "Maya pushed to main", rel: "2m ago", iso: "2026-08-10T14:02:11Z" },
        { initial: "A", text: "Arun opened #482", rel: "1h ago", iso: "2026-08-10T13:07:44Z" },
        { initial: "S", text: "Sana merged #479", rel: "3h ago", iso: "2026-08-10T11:31:05Z" },
    ];
    return (
        <PreviewFrame size={size} className="flex flex-col justify-center gap-2">
            <span className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-200">Activity</span>
            <div className="space-y-2">
                {rows.map((row) => (
                    <div key={row.initial} className="flex items-center gap-2">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[8px] font-semibold text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                            {row.initial}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[10px] text-neutral-700 dark:text-neutral-200">
                            {row.text}
                        </span>
                        {variant === "do" ? (
                            <span className="w-16 shrink-0 text-right text-[10px] tabular-nums text-neutral-400 dark:text-neutral-500">
                                {row.rel}
                            </span>
                        ) : (
                            <span className={cn(ANNOT, "w-16 shrink-0 truncate text-right")}>{row.iso}</span>
                        )}
                    </div>
                ))}
            </div>
        </PreviewFrame>
    );
}

// ── sys-5 · Design tokens naming ────────────────────────────────────
// Same pipeline from palette to component. Do routes through an alias
// layer; Don't bakes the role into the name, so the warning banner
// inherits button blue.
function TokenChip({ swatch, label, warning }: { swatch?: boolean; label: string; warning?: boolean }) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-sm border px-1.5 py-1 font-mono text-[9px] leading-none",
                warning
                    ? "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:border-blue-400/40 dark:bg-blue-400/10 dark:text-blue-400"
                    : "border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
            )}
        >
            {swatch ? <span aria-hidden className="size-2 rounded-[2px] bg-blue-500 dark:bg-blue-400" /> : null}
            {warning ? <AlertTriangle aria-hidden className="size-2.5 stroke-[1.5]" /> : null}
            {label}
        </span>
    );
}

function tokenNaming(variant: Variant, size: PreviewSize) {
    if (variant === "do") {
        return (
            <PreviewFrame size={size} className="flex items-center justify-center">
                <div className="flex items-center gap-1.5">
                    <span className="flex flex-col items-center gap-1">
                        <TokenChip swatch label="blue-500" />
                        <span className={FINE}>palette</span>
                    </span>
                    <MoveRight aria-hidden className="mb-3 size-3 stroke-[1.5] text-neutral-300 dark:text-neutral-600" />
                    <span className="flex flex-col items-center gap-1">
                        <TokenChip label="accent" />
                        <span className={FINE}>alias</span>
                    </span>
                    <MoveRight aria-hidden className="mb-3 size-3 stroke-[1.5] text-neutral-300 dark:text-neutral-600" />
                    <span className="flex flex-col items-center gap-1">
                        <span className="inline-flex items-center rounded-sm bg-blue-500 px-2 py-1 text-[9px] font-semibold leading-none text-white dark:bg-blue-400 dark:text-neutral-950">
                            Save
                        </span>
                        <span className={FINE}>component</span>
                    </span>
                </div>
            </PreviewFrame>
        );
    }
    return (
        <PreviewFrame size={size} className="flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-1.5">
                <TokenChip swatch label="$button-blue" />
                <div className="flex flex-col gap-1.5">
                    <span className="flex items-center gap-1.5">
                        <MoveRight aria-hidden className="size-3 stroke-[1.5] text-neutral-300 dark:text-neutral-600" />
                        <span className="inline-flex items-center rounded-sm bg-blue-500 px-2 py-1 text-[9px] font-semibold leading-none text-white dark:bg-blue-400 dark:text-neutral-950">
                            Save
                        </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <MoveRight aria-hidden className="size-3 stroke-[1.5] text-neutral-300 dark:text-neutral-600" />
                        <TokenChip warning label="Payment overdue" />
                    </span>
                </div>
            </div>
            <span className={ANNOT}>warning inherits button blue</span>
        </PreviewFrame>
    );
}

// ── sys-6 · Undo destructive actions ────────────────────────────────
// Same file list, same toast. Do keeps a recoverable ghost row and an
// Undo with a countdown; Don't announces the file is already gone.
function FileRow({ name, meta, ghost }: { name: string; meta: string; ghost?: boolean }) {
    return (
        <div className={cn("flex items-center gap-2", ghost && "opacity-45")}>
            <FileText aria-hidden className="size-3.5 shrink-0 stroke-[1.5] text-neutral-400 dark:text-neutral-500" />
            <span
                className={cn(
                    "min-w-0 flex-1 truncate text-[10px] text-neutral-700 dark:text-neutral-200",
                    ghost && "line-through"
                )}
            >
                {name}
            </span>
            <span className={FINE}>{meta}</span>
        </div>
    );
}

function undoDelete(variant: Variant, size: PreviewSize) {
    return (
        <PreviewFrame size={size} className="flex flex-col justify-between">
            <div className="space-y-1.5">
                <span className="block text-[10px] font-semibold text-neutral-700 dark:text-neutral-200">Files</span>
                {variant === "do" ? <FileRow name="Q3-report.pdf" meta="4.6 MB" ghost /> : null}
                <FileRow name="Roadmap.fig" meta="12.1 MB" />
                <FileRow name="Assets.zip" meta="88.4 MB" />
            </div>
            <div className="flex items-center gap-2 self-center rounded-md bg-neutral-900 px-2.5 py-1.5 dark:border dark:border-neutral-700 dark:bg-neutral-800">
                {variant === "do" ? (
                    <>
                        <span className="text-[10px] leading-none text-white">Q3-report.pdf deleted</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold leading-none text-blue-400">
                            <CornerUpLeft aria-hidden className="size-2.5 stroke-[2]" />
                            Undo
                        </span>
                        <span className="font-mono text-[9px] leading-none tabular-nums text-neutral-400">5s</span>
                    </>
                ) : (
                    <>
                        <span className="text-[10px] leading-none text-white">Q3-report.pdf permanently deleted</span>
                        <X aria-hidden className="size-2.5 stroke-[2] text-neutral-500" />
                    </>
                )}
            </div>
        </PreviewFrame>
    );
}

// ── sys-7 · Show progress for multi-step ────────────────────────────
// Same checkout step; the only variable is whether the flow states
// where you are and how much remains.
function multiStepProgress(variant: Variant, size: PreviewSize) {
    return (
        <PreviewFrame size={size} className="flex flex-col justify-center">
            <div className="space-y-2 rounded-md border border-neutral-200 p-2.5 dark:border-neutral-800">
                <div className="flex items-baseline justify-between">
                    <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-200">Shipping</span>
                    {variant === "do" ? <span className={ANNOT}>Step 2 of 4</span> : null}
                </div>
                {variant === "do" ? (
                    <div className="flex gap-1">
                        {[true, true, false, false].map((filled, index) => (
                            <span
                                key={index}
                                className={cn(
                                    "h-1 flex-1 rounded-full",
                                    filled ? "bg-blue-500 dark:bg-blue-400" : "bg-neutral-200 dark:bg-neutral-800"
                                )}
                            />
                        ))}
                    </div>
                ) : null}
                <div className="space-y-1">
                    <span className="block text-[9px] font-medium text-neutral-500 dark:text-neutral-400">Address</span>
                    <div className="h-6 rounded-sm border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900" />
                </div>
                <div className="flex justify-end">
                    <span className="inline-flex items-center rounded-sm bg-neutral-900 px-2 py-1 text-[10px] font-semibold leading-none text-white dark:bg-neutral-100 dark:text-neutral-900">
                        Continue
                    </span>
                </div>
            </div>
        </PreviewFrame>
    );
}

// ── sys-8 · Keyboard navigation ─────────────────────────────────────
// Same confirm dialog. Do: focus ring on the primary action plus a kbd
// legend. Don't: a mouse cursor is the only way in — no ring, no keys.
function keyboardNav(variant: Variant, size: PreviewSize) {
    return (
        <PreviewFrame size={size} className="flex flex-col items-center justify-center gap-3">
            <div className="w-full max-w-[200px] space-y-1.5 rounded-md border border-neutral-200 bg-white p-2.5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                <span className="block text-[10px] font-semibold text-neutral-700 dark:text-neutral-200">
                    Archive project?
                </span>
                <span className="block text-[10px] text-neutral-400 dark:text-neutral-500">You can restore it later</span>
                <div className="flex justify-end gap-1.5 pt-0.5">
                    <span className="inline-flex items-center rounded-sm border border-neutral-300 px-2 py-1 text-[10px] font-medium leading-none text-neutral-600 dark:border-neutral-600 dark:text-neutral-300">
                        Cancel
                    </span>
                    <span className="relative inline-flex items-center rounded-sm bg-neutral-900 px-2 py-1 text-[10px] font-semibold leading-none text-white dark:bg-neutral-100 dark:text-neutral-900">
                        {variant === "do" ? (
                            <span
                                aria-hidden
                                className="absolute -inset-1 rounded-[6px] border-2 border-blue-500/60 dark:border-blue-400/60"
                            />
                        ) : (
                            <MousePointer2
                                aria-hidden
                                className="absolute -bottom-2 -right-2 size-3.5 fill-neutral-700 stroke-white stroke-[1.5] dark:fill-neutral-200 dark:stroke-neutral-900"
                            />
                        )}
                        Archive
                    </span>
                </div>
            </div>
            {variant === "do" ? (
                <div className="flex items-center gap-1.5">
                    <Kbd label="Tab" />
                    <span className={FINE}>move</span>
                    <Kbd label="Enter" />
                    <span className={FINE}>activate</span>
                    <Kbd label="Esc" />
                    <span className={FINE}>dismiss</span>
                </div>
            ) : (
                <span className={ANNOT}>tabindex=&quot;-1&quot; · no Esc handler</span>
            )}
        </PreviewFrame>
    );
}

// ── sys-10 · Graceful degradation ───────────────────────────────────
// Same article card with a failed hero image. Do: designed fallback
// with a retry, layout intact. Don't: raw broken-image glyph and a
// collapsed slot that shifts the content up.
function gracefulDegradation(variant: Variant, size: PreviewSize) {
    return (
        <PreviewFrame size={size} className="flex">
            <div className="w-full space-y-1.5 self-start rounded-md border border-neutral-200 p-2 dark:border-neutral-800">
                {variant === "do" ? (
                    <div className="flex h-12 items-center justify-center gap-2 rounded-sm bg-neutral-100 dark:bg-neutral-800">
                        <ImageOff aria-hidden className="size-3.5 stroke-[1.5] text-neutral-400 dark:text-neutral-500" />
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold leading-none text-blue-600 dark:text-blue-400">
                            <RotateCw aria-hidden className="size-2.5 stroke-[2]" />
                            Retry
                        </span>
                    </div>
                ) : (
                    <div className="flex h-6 items-center gap-1.5 rounded-sm border border-dashed border-neutral-300 px-1.5 dark:border-neutral-700">
                        <ImageOff aria-hidden className="size-3 stroke-[1.5] text-neutral-300 dark:text-neutral-600" />
                        <span className="font-mono text-[9px] text-neutral-300 dark:text-neutral-600">hero@2x.jpg</span>
                    </div>
                )}
                <span className="block text-[10px] font-medium text-neutral-700 dark:text-neutral-200">
                    Field notes from the launch
                </span>
                <div className="flex items-center gap-1.5">
                    <span className={FINE}>4 min read</span>
                    <span aria-hidden className="size-0.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                    <span className={FINE}>Aug 10</span>
                </div>
            </div>
        </PreviewFrame>
    );
}

// ── sys-11 · Responsive breakpoint strategy ─────────────────────────
// Same 0–1280px viewport ruler. Do: two accent ticks carve three device
// zones. Don't: eight device-specific ticks collide mid-ruler.
function breakpoints(variant: Variant, size: PreviewSize) {
    const doTicks = [
        { value: 640, at: 50 },
        { value: 1024, at: 80 },
    ];
    const dontTicks = [320, 375, 414, 480, 568, 667, 768, 812].map((value) => ({
        value,
        at: (value / 1280) * 100,
    }));
    const ticks = variant === "do" ? doTicks : dontTicks;
    return (
        <PreviewFrame size={size} className="flex flex-col justify-center gap-1">
            <div className="relative mt-5 h-10 w-full rounded-md border border-neutral-200 dark:border-neutral-800">
                {variant === "do" ? (
                    <div className="absolute inset-0 flex">
                        <span className="flex w-1/2 items-center justify-center">
                            <Smartphone aria-hidden className="size-3.5 stroke-[1.5] text-neutral-400 dark:text-neutral-500" />
                        </span>
                        <span className="flex w-[30%] items-center justify-center">
                            <Tablet aria-hidden className="size-3.5 stroke-[1.5] text-neutral-400 dark:text-neutral-500" />
                        </span>
                        <span className="flex flex-1 items-center justify-center">
                            <Monitor aria-hidden className="size-3.5 stroke-[1.5] text-neutral-400 dark:text-neutral-500" />
                        </span>
                    </div>
                ) : null}
                {ticks.map((tick) => (
                    <span key={tick.value} className="absolute -top-1 bottom-0" style={{ left: `${tick.at}%` }}>
                        <span aria-hidden className="absolute inset-y-0 w-px bg-blue-500/70 dark:bg-blue-400/70" />
                        <span className={cn(FINE, "absolute -top-3 -translate-x-1/2")}>{tick.value}</span>
                    </span>
                ))}
            </div>
            <div className="flex justify-between">
                <span className={FINE}>0</span>
                <span className={FINE}>1280px</span>
            </div>
        </PreviewFrame>
    );
}

// ── sys-12 · Animation purpose ──────────────────────────────────────
// Same app window. Do: a page slide, frozen mid-transition — motion
// with a job (orientation). Don't: a logo bouncing in place — motion
// with none.
function WindowChrome({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-[92px] w-full flex-col overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-1 border-b border-neutral-200 px-2 py-1.5 dark:border-neutral-800">
                <span aria-hidden className="size-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                <span aria-hidden className="size-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                <span aria-hidden className="size-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700" />
            </div>
            <div className="relative flex-1">{children}</div>
        </div>
    );
}

function animationPurpose(variant: Variant, size: PreviewSize) {
    if (variant === "do") {
        return (
            <PreviewFrame size={size} className="flex flex-col justify-center gap-2">
                <WindowChrome>
                    <div className="absolute inset-y-2 left-2 w-[45%] -translate-x-3 space-y-1.5 rounded-sm border border-neutral-200 p-1.5 opacity-40 dark:border-neutral-800">
                        <div className="h-1.5 w-3/4 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                        <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800" />
                        <div className="h-1.5 w-5/6 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                    </div>
                    <div className="absolute inset-y-2 right-2 w-[55%] space-y-1.5 rounded-sm border border-blue-500/60 bg-white p-1.5 dark:border-blue-400/60 dark:bg-neutral-950">
                        <div className="h-1.5 w-2/3 rounded-full bg-blue-500/40 dark:bg-blue-400/40" />
                        <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800" />
                        <div className="h-1.5 w-4/5 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                    </div>
                </WindowChrome>
                <span className={cn(ANNOT, "self-center")}>slide answers &ldquo;where am I?&rdquo;</span>
            </PreviewFrame>
        );
    }
    return (
        <PreviewFrame size={size} className="flex flex-col justify-center gap-2">
            <WindowChrome>
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                    <Sparkles aria-hidden className="size-4 -translate-y-7 stroke-[1.5] text-neutral-300 opacity-30 dark:text-neutral-600" />
                    <Sparkles aria-hidden className="-mt-4 size-4 -translate-y-3.5 stroke-[1.5] text-neutral-400 opacity-60 dark:text-neutral-500" />
                    <Sparkles aria-hidden className="-mt-4 size-4 stroke-[1.5] text-neutral-500 dark:text-neutral-400" />
                </div>
            </WindowChrome>
            <span className={cn(ANNOT, "self-center")}>bounce answers nothing</span>
        </PreviewFrame>
    );
}

// ── sys-13 · Transition only what changes ───────────────────────────
// Same Save button under a font-swap width change. Scoped transitions
// let it snap; `all` makes it drift through ghost widths.
function transitionScope(variant: Variant, size: PreviewSize) {
    return (
        <PreviewFrame size={size} className="flex flex-col justify-center gap-3">
            <CodeChip>
                {variant === "do" ? (
                    <>
                        transition-property:{" "}
                        <span className="text-blue-600 dark:text-blue-400">scale, background-color</span>
                    </>
                ) : (
                    "transition: all 150ms ease-out"
                )}
            </CodeChip>
            <div className="flex items-center gap-2">
                <span className="relative inline-flex items-center rounded-sm bg-neutral-900 px-2.5 py-1.5 text-[10px] font-semibold leading-none text-white dark:bg-neutral-100 dark:text-neutral-900">
                    Save changes
                    {variant === "do" ? (
                        <span aria-hidden className="absolute inset-0 scale-[0.96] rounded-sm border border-dashed border-blue-500/60 dark:border-blue-400/60" />
                    ) : null}
                </span>
                {variant === "dont" ? (
                    <>
                        <span aria-hidden className="h-7 w-[104px] rounded-sm border border-dashed border-neutral-300 opacity-70 dark:border-neutral-600" />
                        <span aria-hidden className="h-7 w-[116px] rounded-sm border border-dashed border-neutral-300 opacity-40 dark:border-neutral-600" />
                    </>
                ) : null}
            </div>
            <span className={ANNOT}>
                {variant === "do" ? "font swap → width snaps · 0ms" : "font swap → width drifts · 150ms"}
            </span>
        </PreviewFrame>
    );
}

// ── sys-14 · Use will-change sparingly ──────────────────────────────
// Same card row. The evidence is scope, not an invented compositor-layer
// count: one measured target versus a blanket hint on every card.
function HintCard({ accent = false }: { accent?: boolean }) {
    return (
        <span className="relative inline-block">
            <span
                className={cn(
                    "relative block w-14 space-y-1 rounded-md border bg-white p-1.5 dark:bg-neutral-950",
                    accent
                        ? "border-blue-500/70 dark:border-blue-400/70"
                        : "border-neutral-200 dark:border-neutral-800"
                )}
            >
                <span className="block h-1 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                <span className="block h-1 w-6 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            </span>
        </span>
    );
}

function willChange(variant: Variant, size: PreviewSize) {
    return (
        <PreviewFrame size={size} className="flex flex-col justify-center gap-3">
            <CodeChip>
                will-change:{" "}
                {variant === "do" ? (
                    <span className="text-blue-600 dark:text-blue-400">transform, opacity</span>
                ) : (
                    "all"
                )}
            </CodeChip>
            <div className="flex items-end gap-4 pt-1">
                {variant === "do" ? (
                    <>
                        <HintCard />
                        <HintCard accent />
                        <HintCard />
                    </>
                ) : (
                    <>
                        <HintCard accent />
                        <HintCard accent />
                        <HintCard accent />
                    </>
                )}
            </div>
            <span className={ANNOT}>
                {variant === "do" ? "1 measured target" : "blanket hint on every card"}
            </span>
        </PreviewFrame>
    );
}

// ── Dispatcher ──────────────────────────────────────────────────────

const scenes: Record<string, (variant: Variant, size: PreviewSize) => ReactNode> = {
    "sys-2": emptyStates,
    "sys-3": tapTargets,
    "sys-4": dateFormats,
    "sys-5": tokenNaming,
    "sys-6": undoDelete,
    "sys-7": multiStepProgress,
    "sys-8": keyboardNav,
    "sys-10": gracefulDegradation,
    "sys-11": breakpoints,
    "sys-12": animationPurpose,
    "sys-13": transitionScope,
    "sys-14": willChange,
};

export const systemPreviews: PreviewRenderer = (ruleId, variant, size) =>
    scenes[ruleId]?.(variant, size) ?? null;
