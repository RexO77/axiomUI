"use client";

import { useEffect, useState } from "react";
import {
    BoxSelect,
    Cpu,
    Layers,
    LayoutGrid,
    Menu,
    Palette,
    TextCursorInput,
    Type,
    X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SearchInput } from "@/components/features/search/search-input";
import { categories } from "@/data/ui-logic";
import { cn } from "@/lib/utils";

const tips = [
    "Treat every decision as a repeatable system.",
    "Break the rule only after you understand it.",
    "Typography, layout, color, components, forms, and system logic.",
    "Fast scanning, tag filters, and encoded do/don't patterns.",
    "Curated rules grounded in product UI best practices.",
];

const categoryIcons = new Map([
    ["typography", Type],
    ["layout", LayoutGrid],
    ["color", Palette],
    ["components", BoxSelect],
    ["forms", TextCursorInput],
    ["system", Cpu],
]);

function SidebarContent({
    filteredCount,
    onLinkClick,
    extraHeaderAction,
}: {
    filteredCount: number;
    onLinkClick?: () => void;
    extraHeaderAction?: React.ReactNode;
}) {
    const [tipIndex, setTipIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTipIndex((prev) => (prev + 1) % tips.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex h-full flex-col p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                        <Layers aria-hidden="true" className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
                            axiom
                        </p>
                        <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                            UI Logic
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    {extraHeaderAction}
                </div>
            </div>

            {/* Search */}
            <SearchInput itemCount={filteredCount} />

            {/* Categories */}
            <div className="mt-6 flex flex-1 flex-col overflow-hidden">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
                    Categories
                </p>
                <nav className="sidebar-scroll mt-3 flex-1 space-y-0.5 overflow-y-auto">
                    {categories.map((cat) => (
                        <a
                            key={cat.id}
                            href={`#${cat.id}`}
                            onClick={onLinkClick}
                            className="group flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm text-neutral-600 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                        >
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-100 text-neutral-500 transition-colors duration-150 group-hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:group-hover:bg-neutral-700">
                                {(() => {
                                    const Icon = categoryIcons.get(cat.id) ?? Layers;
                                    return <Icon aria-hidden="true" className="h-3.5 w-3.5" />;
                                })()}
                            </span>
                            <span className="font-medium">{cat.name}</span>
                        </a>
                    ))}
                </nav>
            </div>

            {/* Tip */}
            <div className="mt-4 rounded-lg bg-neutral-100 px-4 py-3 dark:bg-neutral-800">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                    Tip
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 transition-opacity duration-300 dark:text-neutral-300">
                    {tips[tipIndex]}
                </p>
            </div>
        </div>
    );
}

export function Sidebar({ filteredCount }: { filteredCount: number }) {
    const [isOpen, setIsOpen] = useState(false);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <>
            {/* Mobile Header */}
            <div className="sticky top-0 z-40 flex items-center justify-between border-b border-neutral-200 bg-white/80 px-4 py-3 backdrop-blur-md md:hidden dark:border-neutral-800 dark:bg-neutral-900/80">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                        <Layers aria-hidden="true" className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                        AXIOM
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <button
                        onClick={() => setIsOpen(true)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                        aria-label="Open menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            <div
                className={cn(
                    "fixed inset-0 z-50 flex justify-end md:hidden",
                    isOpen ? "pointer-events-auto" : "pointer-events-none"
                )}
            >
                {/* Backdrop */}
                <div
                    className={cn(
                        "absolute inset-0 bg-neutral-950/20 backdrop-blur-sm transition-opacity duration-300 dark:bg-black/40",
                        isOpen ? "opacity-100" : "opacity-0"
                    )}
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />

                {/* Drawer Panel */}
                <div
                    className={cn(
                        "relative w-[85%] max-w-[300px] border-l border-neutral-200 bg-white shadow-2xl transition-transform duration-300 dark:border-neutral-800 dark:bg-neutral-900",
                        isOpen ? "translate-x-0" : "translate-x-full"
                    )}
                >
                    <SidebarContent
                        filteredCount={filteredCount}
                        onLinkClick={() => setIsOpen(false)}
                        extraHeaderAction={
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                                aria-label="Close menu"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        }
                    />
                </div>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden border-r border-neutral-200 bg-white md:fixed md:inset-y-0 md:flex md:w-[280px] dark:border-neutral-800 dark:bg-neutral-900">
                <SidebarContent filteredCount={filteredCount} />
            </aside>
        </>
    );
}
