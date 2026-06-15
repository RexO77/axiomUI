"use client";

import { useEffect, useState } from "react";
import {
    Activity,
    BoxSelect,
    Cpu,
    Eye,
    Layers,
    LayoutGrid,
    Menu,
    Palette,
    PanelLeftClose,
    PanelLeftOpen,
    TextCursorInput,
    Type,
    X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SearchInput } from "@/components/features/search/search-input";
import { SkillBonus } from "@/components/features/skills/skill-bonus";
import { AxiomLogo } from "@/components/ui/axiom-logo";
import { categories } from "@/data/ui-logic";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/use-haptics";

const categoryIcons = new Map([
    ["typography", Type],
    ["layout", LayoutGrid],
    ["color", Palette],
    ["components", BoxSelect],
    ["forms", TextCursorInput],
    ["system", Cpu],
    ["motion", Activity],
    ["accessibility", Eye],
]);

const sidebarControlClass =
    "pressable flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-neutral-500 transition-[transform,background-color,border-color,color] duration-150 hover:border-neutral-200 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-100";

function SidebarContent({
    isFloating = false,
    showHeaderTheme = true,
    onLinkClick,
    extraHeaderAction,
}: {
    isFloating?: boolean;
    showHeaderTheme?: boolean;
    onLinkClick?: () => void;
    extraHeaderAction?: React.ReactNode;
}) {
    const { tapLight } = useHaptics();
    const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?.id ?? "");

    useEffect(() => {
        const categoryIds = categories.map((category) => category.id);

        const syncFromHash = () => {
            const hashId = window.location.hash.replace("#", "");
            if (categoryIds.includes(hashId)) {
                setActiveCategoryId(hashId);
            }
        };

        syncFromHash();

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntry = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

                if (visibleEntry?.target.id) {
                    setActiveCategoryId(visibleEntry.target.id);
                }
            },
            {
                rootMargin: "-18% 0px -65% 0px",
                threshold: [0.12, 0.28, 0.45],
            }
        );

        categoryIds.forEach((id) => {
            const section = document.getElementById(id);
            if (section) {
                observer.observe(section);
            }
        });

        window.addEventListener("hashchange", syncFromHash);

        return () => {
            observer.disconnect();
            window.removeEventListener("hashchange", syncFromHash);
        };
    }, []);

    return (
        <div className="flex h-full flex-col p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                        <AxiomLogo className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
                            Axiom
                        </p>
                        <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                            UI Logic
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {showHeaderTheme ? <ThemeToggle /> : null}
                    {extraHeaderAction}
                </div>
            </div>

            {/* Search */}
            <SearchInput />

            {/* Categories */}
            <div className="mt-6 flex flex-1 flex-col overflow-hidden">
                <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
                    Categories
                </p>
                <nav className="sidebar-scroll mt-3 flex-1 space-y-0.5 overflow-y-auto">
                    {categories.map((cat) => {
                        const isActive = cat.id === activeCategoryId;

                        return (
                            <a
                                key={cat.id}
                                href={`#${cat.id}`}
                                aria-current={isActive ? "true" : undefined}
                                onClick={() => {
                                    setActiveCategoryId(cat.id);
                                    tapLight();
                                    onLinkClick?.();
                                }}
                                className={cn(
                                    "pressable group flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors duration-150",
                                    isActive
                                        ? "bg-neutral-100 text-neutral-950 shadow-[inset_0_0_0_1px_rgba(23,23,23,0.08)] dark:bg-neutral-800 dark:text-neutral-50 dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                                )}
                            >
                                <span
                                    className={cn(
                                        "flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150",
                                        isActive
                                            ? "bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100"
                                            : "bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:group-hover:bg-neutral-700"
                                    )}
                                >
                                    {(() => {
                                        const Icon = categoryIcons.get(cat.id) ?? Layers;
                                        return <Icon aria-hidden="true" className="h-3.5 w-3.5" />;
                                    })()}
                                </span>
                                <span className="font-medium">{cat.name}</span>
                            </a>
                        );
                    })}
                </nav>
            </div>

            <div className={cn("mt-4", isFloating && "pb-1")}>
                <SkillBonus />
            </div>
        </div>
    );
}

export function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isDesktopOpen, setIsDesktopOpen] = useState(true);
    const { tapNudge } = useHaptics();

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

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty(
            "--main-lane-shift",
            isDesktopOpen ? "var(--main-lane-open-shift)" : "0px"
        );
        // Expose open/closed as a 0/1 flag so the content lane can reserve
        // sidebar clearance only when it's actually open (the shift amount
        // alone can't tell open-on-wide-screen apart from closed).
        root.style.setProperty("--sidebar-open", isDesktopOpen ? "1" : "0");

        return () => {
            root.style.removeProperty("--main-lane-shift");
            root.style.removeProperty("--sidebar-open");
        };
    }, [isDesktopOpen]);

    return (
        <>
            {/* Mobile Header */}
            <div className="sticky top-0 z-40 flex items-center justify-between border-b border-neutral-200 bg-white/80 px-4 py-3 backdrop-blur-md md:hidden dark:border-neutral-800 dark:bg-neutral-900/80">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                        <AxiomLogo className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Axiom
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <button
                        onClick={() => { tapNudge(); setIsOpen(true); }}
                        className="pressable flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
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
                        "absolute inset-0 bg-neutral-950/20 backdrop-blur-sm transition-opacity duration-200 ease-out dark:bg-black/40",
                        isOpen ? "opacity-100" : "opacity-0"
                    )}
                    onClick={() => { tapNudge(); setIsOpen(false); }}
                    aria-hidden="true"
                />

                {/* Drawer Panel */}
                <div
                    className={cn(
                        "relative w-[88%] max-w-[340px] border-l border-neutral-200 bg-white shadow-2xl transition-transform duration-300 dark:border-neutral-800 dark:bg-neutral-900",
                        isOpen ? "translate-x-0" : "translate-x-full"
                    )}
                    style={{ transitionTimingFunction: "var(--ease-drawer)" }}
                >
                    <SidebarContent
                        onLinkClick={() => setIsOpen(false)}
                        extraHeaderAction={
                            <button
                                onClick={() => { tapNudge(); setIsOpen(false); }}
                                className="pressable flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                                aria-label="Close menu"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        }
                    />
                </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="pointer-events-none fixed inset-y-0 left-0 z-[80] hidden w-[312px] md:block">
                <button
                    type="button"
                    aria-label="Expand sidebar"
                    aria-expanded={isDesktopOpen}
                    aria-hidden={isDesktopOpen}
                    tabIndex={isDesktopOpen ? -1 : 0}
                    onClick={() => {
                        tapNudge();
                        setIsDesktopOpen(true);
                    }}
                    className={cn(
                        sidebarControlClass,
                        "absolute left-5 top-5 z-20 transform-gpu bg-white/95 shadow-[0_12px_34px_rgba(0,0,0,0.10)] transition-[opacity,transform,filter,background-color,border-color,color] duration-300 will-change-[opacity,transform,filter] dark:bg-neutral-900/95 dark:shadow-[0_14px_42px_rgba(0,0,0,0.35)]",
                        isDesktopOpen
                            ? "pointer-events-none translate-x-1 scale-[0.88] opacity-0 blur-[4px]"
                            : "pointer-events-auto translate-x-0 scale-100 opacity-100 blur-0"
                    )}
                    style={{ transitionTimingFunction: "var(--ease-drawer)" }}
                >
                    <PanelLeftOpen aria-hidden="true" className="h-4.5 w-4.5" strokeWidth={1.8} />
                </button>

                <aside
                    aria-hidden={!isDesktopOpen}
                    className={cn(
                        "panel-shadow absolute bottom-5 left-5 top-5 flex w-[280px] transform-gpu overflow-hidden rounded-[28px] border border-neutral-200/80 bg-white/95 transition-[opacity,transform,filter] duration-300 will-change-[opacity,transform,filter] dark:border-neutral-800/80 dark:bg-neutral-900/95",
                        isDesktopOpen
                            ? "pointer-events-auto translate-x-0 scale-100 opacity-100 blur-0"
                            : "pointer-events-none -translate-x-2 scale-[0.985] opacity-0 blur-[2px]"
                    )}
                    style={{ transitionTimingFunction: "var(--ease-drawer)" }}
                >
                    <SidebarContent
                        isFloating
                        extraHeaderAction={
                            <button
                                type="button"
                                aria-label="Collapse sidebar"
                                aria-expanded={isDesktopOpen}
                                onClick={() => {
                                    tapNudge();
                                    setIsDesktopOpen(false);
                                }}
                                className={sidebarControlClass}
                            >
                                <PanelLeftClose aria-hidden="true" className="h-4.5 w-4.5" strokeWidth={1.8} />
                            </button>
                        }
                    />
                </aside>
            </div>
        </>
    );
}
