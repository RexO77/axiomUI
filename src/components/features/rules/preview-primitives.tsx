import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type Variant = "do" | "dont";
export type PreviewSize = "sm" | "lg";

export function textClass(size: PreviewSize) {
    return size === "lg" ? "text-xs" : "text-[10px]";
}

export function PreviewFrame({
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
                size === "lg" ? "min-h-[96px] p-3 text-xs" : "min-h-[54px] p-2 text-[10px] sm:min-h-[64px]",
                className
            )}
        >
            {children}
        </div>
    );
}

export function MiniButton({
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
            aria-hidden="true"
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

export function MiniInput({ size, widthClass = "w-full" }: { size: PreviewSize; widthClass?: string }) {
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

export function MiniLabel({ label, size }: { label: string; size: PreviewSize }) {
    return (
        <span
            className={cn(
                "font-semibold text-neutral-500 dark:text-neutral-400",
                size === "lg" ? "text-[10px]" : "text-[9px]"
            )}
        >
            {label}
        </span>
    );
}

export function MiniLine({
    widthClass,
    className,
}: {
    widthClass: string;
    className?: string;
}) {
    return <div className={cn("h-2 rounded bg-neutral-200 dark:bg-neutral-800", widthClass, className)} />;
}

export function MiniBlock({ className }: { className?: string }) {
    return <div className={cn("size-4 rounded bg-neutral-300 dark:bg-neutral-700", className)} />;
}

export function MiniAvatar({ shape, size }: { shape: "circle" | "square"; size: PreviewSize }) {
    return (
        <div
            className={cn(
                shape === "circle" ? "rounded-full" : "rounded-md",
                size === "lg" ? "size-7" : "size-6",
                "bg-neutral-300 dark:bg-neutral-700"
            )}
        />
    );
}

export function MiniSwitch({ on, size }: { on?: boolean; size: PreviewSize }) {
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
                    size === "lg" ? "size-3" : "size-2.5",
                    on ? "right-0.5" : "left-0.5"
                )}
            />
        </div>
    );
}

export function MiniCheckbox({ checked, size }: { checked?: boolean; size: PreviewSize }) {
    return (
        <div
            className={cn(
                "flex items-center justify-center rounded-sm border",
                size === "lg" ? "size-4" : "size-3.5",
                checked
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                    : "border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-900"
            )}
        >
            {checked ? <span className="block size-1.5 rounded-sm bg-white dark:bg-neutral-900" /> : null}
        </div>
    );
}

export function MiniRadio({ checked, size }: { checked?: boolean; size: PreviewSize }) {
    return (
        <div
            className={cn(
                "flex items-center justify-center rounded-full border",
                size === "lg" ? "size-4" : "size-3.5",
                checked
                    ? "border-neutral-900 bg-neutral-900 dark:border-neutral-100 dark:bg-neutral-100"
                    : "border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-900"
            )}
        >
            {checked ? <div className="size-1.5 rounded-full bg-white dark:bg-neutral-900" /> : null}
        </div>
    );
}

export function MiniDot({ active, size }: { active?: boolean; size: PreviewSize }) {
    return (
        <span
            className={cn(
                "rounded-full",
                size === "lg" ? "size-2.5" : "size-2",
                active ? "bg-neutral-900 dark:bg-neutral-100" : "bg-neutral-300 dark:bg-neutral-700"
            )}
        />
    );
}

export function MiniPill({
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

export function MiniPlayCircle({ nudge }: { nudge: boolean }) {
    return (
        <div className="relative h-12 w-12 rounded-full border border-neutral-300 dark:border-neutral-700">
            <span
                className={cn(
                    "absolute top-1/2 block h-0 w-0 -translate-x-1/2 -translate-y-1/2 border-y-[6px] border-y-transparent border-l-[10px] border-l-neutral-700 dark:border-l-neutral-200",
                    nudge ? "left-[calc(50%_+_1px)]" : "left-1/2"
                )}
            />
        </div>
    );
}
