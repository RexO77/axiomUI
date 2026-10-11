// design-system: strict
"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
    Menu,
    PanelLeftClose,
    PanelLeftOpen,
    X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { IconButton } from "@/components/ui/icon-button";
import { SearchInput } from "@/components/features/search/search-input";
import { SkillBonus } from "@/components/features/skills/skill-bonus";
import { AxiomLogo } from "@/components/ui/axiom-logo";
import { CategoryIcon } from "@/components/ui/category-icon";
import { categories } from "@/data/ui-logic";
import { countByCategory } from "@/lib/rule-search";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/use-haptics";
import { useSearch } from "@/components/providers/search-provider";

const SHEET_ID = "mobile-menu";
const DESKTOP_PANEL_ID = "desktop-sidebar";

/** Below this width the floating panel would squeeze the cards, so it starts collapsed. */
const DESKTOP_OPEN_QUERY = "(min-width: 1024px)";

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

function subscribeToDesktopWidth(onChange: () => void) {
    const query = window.matchMedia(DESKTOP_OPEN_QUERY);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
}

/**
 * An Index jump aims at the section's position while the cards above it are
 * still content-visibility placeholders. The cards that render on arrival are
 * taller than their placeholder on a phone, which pushed the heading 250px
 * below the bar. Re-aim on the next frames until the heading holds still.
 */
function settleOnSection(id: string, moveFocus = false) {
    let frames = 0;
    let focusPending = moveFocus;
    const check = () => {
        const section = document.getElementById(id);
        if (!section) return;
        if (focusPending && !section.closest("[inert]")) {
            const heading = section.querySelector<HTMLElement>("h2");
            if (heading) {
                const previousTabIndex = heading.getAttribute("tabindex");
                heading.tabIndex = -1;
                heading.focus({ preventScroll: true });
                heading.addEventListener("blur", () => {
                    if (previousTabIndex === null) heading.removeAttribute("tabindex");
                    else heading.setAttribute("tabindex", previousTabIndex);
                }, { once: true });
            }
            focusPending = false;
        }
        const margin = parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
        if (Math.abs(section.getBoundingClientRect().top - margin) > 1) {
            section.scrollIntoView({ block: "start" });
        }
        if (++frames < 4) requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
}

function ruleCountLabel(count: number) {
    return `${count} ${count === 1 ? "rule" : "rules"}`;
}

function Lockup({ subtitle = false }: { subtitle?: boolean }) {
    return (
        <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-field bg-inverse text-on-inverse">
                <AxiomLogo className="size-5" />
            </span>
            <span className="flex flex-col">
                <span className="text-base font-semibold leading-5 text-ink">Axiom UI</span>
                {subtitle ? <span className="text-xs text-ink-muted">UI logic</span> : null}
            </span>
        </div>
    );
}

function SidebarContent({
    instance,
    onLinkClick,
    onSearchSubmit,
    headerAction,
}: {
    instance: "desktop" | "mobile";
    onLinkClick?: () => void;
    onSearchSubmit?: () => void;
    headerAction: React.ReactNode;
}) {
    const { tapLight } = useHaptics();
    const { query } = useSearch();
    const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?.id ?? "");
    const isMobile = instance === "mobile";
    const isSearching = query.trim() !== "";
    const counts = useMemo(() => countByCategory(query), [query]);
    const matchCount = useMemo(
        () => [...counts.values()].reduce((sum, count) => sum + count, 0),
        [counts]
    );

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

        let observedAny = false;
        categoryIds.forEach((id) => {
            const section = document.getElementById(id);
            if (section) {
                observer.observe(section);
                observedAny = true;
            }
        });

        // Filtering unmounts and remounts section DOM nodes, so the active
        // category may no longer be observed (or may no longer exist). Reset
        // the highlight to the first rendered category rather than leaving
        // it stuck on a hidden one.
        if (observedAny && !document.getElementById(activeCategoryId)) {
            const firstRendered = categoryIds.find((id) => document.getElementById(id));
            if (firstRendered) setActiveCategoryId(firstRendered);
        }

        window.addEventListener("hashchange", syncFromHash);

        return () => {
            observer.disconnect();
            window.removeEventListener("hashchange", syncFromHash);
        };
        // Re-subscribe whenever the query changes: filtering mounts new
        // section DOM nodes that the effect above needs to re-observe.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    const search = isMobile ? (
        // Enter closes the sheet and hands over to the results it was
        // filtering behind the panel.
        <form
            role="search"
            onSubmit={(event) => {
                event.preventDefault();
                onSearchSubmit?.();
            }}
        >
            <SearchInput instance="mobile" />
            {isSearching ? (
                <p className="mt-2 px-2 text-xs text-ink-muted">
                    {ruleCountLabel(matchCount)} {matchCount === 1 ? "matches" : "match"}
                </p>
            ) : null}
        </form>
    ) : (
        <SearchInput instance="desktop" />
    );

    return (
        // The sheet's header sits where the mobile bar's does (12px down, 16px
        // in), so the theme toggle stays put and the menu glyph becomes the X.
        <div className={cn("flex h-full min-w-0 flex-1 flex-col", isMobile ? "px-4 pb-4 pt-3" : "p-6")}>
            <div className="flex items-center justify-between">
                <Lockup subtitle={!isMobile} />
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    {headerAction}
                </div>
            </div>

            {search}

            {/* min-h-0 lets the nav scroll; nothing here clips, so the nav's
                own 4px padding is all the room a focus outline needs. */}
            <div className="mt-7 flex min-h-0 flex-1 flex-col">
                <p className="px-2 text-sm font-medium text-ink-muted">Index</p>
                <nav
                    aria-label="Index"
                    className="sidebar-scroll -mx-1 mt-3 flex-1 space-y-2 overflow-y-auto p-1"
                >
                    {categories.map((cat) => {
                        const count = counts.get(cat.id) ?? 0;
                        const isEmpty = isSearching && count === 0;
                        const isActive = !isEmpty && cat.id === activeCategoryId;

                        return (
                            <a
                                key={cat.id}
                                href={`#${cat.id}`}
                                aria-current={isActive ? "true" : undefined}
                                aria-disabled={isEmpty || undefined}
                                tabIndex={isEmpty ? -1 : undefined}
                                onClick={(event) => {
                                    if (isEmpty) {
                                        event.preventDefault();
                                        return;
                                    }
                                    setActiveCategoryId(cat.id);
                                    tapLight();
                                    onLinkClick?.();
                                    settleOnSection(cat.id, isMobile);
                                }}
                                className={cn(
                                    "pressable flex min-h-10 items-center gap-3 rounded-full px-2 text-sm",
                                    isActive
                                        ? "bg-fill font-semibold text-ink"
                                        : "font-medium text-ink-secondary hover:bg-fill/50 hover:text-ink",
                                    isEmpty && "pointer-events-none opacity-40"
                                )}
                            >
                                <span className="flex size-6 shrink-0 items-center justify-center">
                                    <CategoryIcon categoryId={cat.id} />
                                </span>
                                {/* Name and count share a tighter gap, so the
                                    longest name still fits beside its count. */}
                                <span className="flex min-w-0 flex-1 items-center gap-2">
                                    <span className="min-w-0 truncate tracking-[-0.01em]">{cat.name}</span>
                                    {isSearching ? (
                                        <span className="ml-auto text-xs font-medium tabular-nums text-ink-muted">
                                            {count}
                                            <span className="sr-only"> {count === 1 ? "rule" : "rules"}</span>
                                        </span>
                                    ) : null}
                                </span>
                            </a>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-4 [&>div]:border-t-0">
                <SkillBonus compact />
                <a
                    href="/llms-full.txt"
                    className="pressable mt-1 flex min-h-11 w-full items-center rounded-full px-2 text-xs text-ink-muted hover:bg-fill hover:text-ink"
                >
                    llms-full.txt for AI tools
                </a>
            </div>
        </div>
    );
}

type SheetFocus = "search" | "panel" | null;

export function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    // The panel follows the window (open from 1024px, collapsed below, where
    // it would squeeze the cards) until the reader toggles it; from then on
    // their choice holds. The server assumes a wide window.
    const isWideEnough = useSyncExternalStore(
        subscribeToDesktopWidth,
        () => window.matchMedia(DESKTOP_OPEN_QUERY).matches,
        () => true
    );
    const [desktopChoice, setDesktopChoice] = useState<boolean | null>(null);
    const isDesktopOpen = desktopChoice ?? isWideEnough;
    // Transitions switch on only after the first paint, so a hydrated
    // render correcting itself for a narrow window doesn't animate on load.
    const [motionReady, setMotionReady] = useState(false);
    const { tapNudge } = useHaptics();

    const headerRef = useRef<HTMLDivElement>(null);
    const desktopRef = useRef<HTMLDivElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const sheetRef = useRef<HTMLDivElement>(null);
    const expandButtonRef = useRef<HTMLButtonElement>(null);
    const collapseButtonRef = useRef<HTMLButtonElement>(null);
    const sheetFocusRef = useRef<SheetFocus>(null);
    const returnFocusRef = useRef(false);
    const desktopFocusRef = useRef(false);
    const resizeFocusRef = useRef(false);

    const openSheet = (focus: Exclude<SheetFocus, null>) => {
        if (focus === "search" && sheetRef.current && !sheetRef.current.closest("[inert]")) {
            document.getElementById("searchInput-mobile")?.focus({ preventScroll: true });
            return;
        }
        sheetFocusRef.current = focus;
        setIsOpen(true);
    };

    const closeSheet = (returnFocus: boolean) => {
        returnFocusRef.current = returnFocus;
        setIsOpen(false);
    };

    useEffect(() => {
        let second = 0;
        const first = requestAnimationFrame(() => {
            second = requestAnimationFrame(() => setMotionReady(true));
        });
        return () => {
            cancelAnimationFrame(first);
            cancelAnimationFrame(second);
        };
    }, []);

    // Keep the page outside the sheet out of pointer and keyboard interaction.
    // Portaled dialogs opened from the sheet remain available above it.
    useEffect(() => {
        if (!isOpen) return;
        const main = document.getElementById("main-content");
        const skipLink = document.querySelector<HTMLElement>('a[href="#main-content"]');
        const regions = [main, skipLink, headerRef.current, desktopRef.current].filter(
            (element): element is HTMLElement => element !== null
        );
        const priorInert = regions.map((element) => element.inert);
        const previousBodyOverflow = document.body.style.overflow;
        const previousHtmlOverflow = document.documentElement.style.overflow;
        regions.forEach((element) => { element.inert = true; });
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        return () => {
            regions.forEach((element, index) => { element.inert = priorInert[index]; });
            document.body.style.overflow = previousBodyOverflow;
            document.documentElement.style.overflow = previousHtmlOverflow;
        };
    }, [isOpen]);

    // A hidden mobile sheet must not leave a desktop page locked after resizing.
    useEffect(() => {
        const media = window.matchMedia("(min-width: 768px)");
        const onChange = () => {
            if (!media.matches || !isOpen) return;
            // A portaled preview owns the topmost focus and scroll lock. Wait
            // for it to unmount before closing the sheet underneath it.
            if (document.querySelector('[role="dialog"][aria-modal="true"]:not(#mobile-menu)')) return;
            resizeFocusRef.current = true;
            closeSheet(false);
        };
        media.addEventListener("change", onChange);
        const portals = new MutationObserver(onChange);
        if (isOpen) portals.observe(document.body, { childList: true });
        return () => {
            portals.disconnect();
            media.removeEventListener("change", onChange);
        };
    }, [isOpen]);

    // Opening moves focus into the sheet; closing hands it back to the menu
    // button, except after an Index link or a search, which send it onward.
    // A tap focuses the panel itself rather than the field, so a phone
    // keyboard doesn't cover the Index the reader opened the menu to see.
    useEffect(() => {
        if (isOpen) {
            const focus = sheetFocusRef.current;
            sheetFocusRef.current = null;
            if (focus === "search") {
                document.getElementById("searchInput-mobile")?.focus({ preventScroll: true });
            } else if (focus === "panel") {
                sheetRef.current?.focus({ preventScroll: true });
            }
        } else if (resizeFocusRef.current) {
            resizeFocusRef.current = false;
            document.getElementById("main-content")?.focus({ preventScroll: true });
        } else if (returnFocusRef.current) {
            returnFocusRef.current = false;
            menuButtonRef.current?.focus({ preventScroll: true });
        }
    }, [isOpen]);

    // The open sheet is modal: Escape closes it and Tab stays inside it.
    // Keys from a dialog opened on top of the sheet (the skill modal, which
    // renders outside it) are left to that dialog.
    useEffect(() => {
        if (!isOpen) return;

        const onKeyDown = (event: KeyboardEvent) => {
            const panel = sheetRef.current;
            if (!panel) return;

            const target = event.target instanceof Node ? event.target : null;
            if (target && target !== document.body && !panel.contains(target)) return;

            if (event.key === "Escape") {
                // The first Escape in a filled field clears it (SearchInput).
                if (target instanceof HTMLInputElement && target.value !== "") return;
                event.preventDefault();
                closeSheet(true);
                return;
            }

            if (event.key !== "Tab") return;

            const focusable = Array.from(
                panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
            ).filter((element) => element.tabIndex !== -1 && element.getClientRects().length > 0);

            if (focusable.length === 0) {
                event.preventDefault();
                panel.focus();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const active = document.activeElement;
            const activeInPanel = active instanceof HTMLElement && panel.contains(active);

            // Focus can rest on the panel itself (after a tap opened it).
            // Move from there in DOM order.
            if (activeInPanel && !focusable.includes(active)) {
                event.preventDefault();
                const following = focusable.filter(
                    (element) => active.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING
                );
                const preceding = focusable.filter(
                    (element) => active.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_PRECEDING
                );
                (event.shiftKey ? (preceding[preceding.length - 1] ?? last) : (following[0] ?? first)).focus();
                return;
            }

            if (event.shiftKey) {
                if (!activeInPanel || active === first) {
                    event.preventDefault();
                    last.focus();
                }
                return;
            }

            if (!activeInPanel || active === last) {
                event.preventDefault();
                first.focus();
            }
        };

        // Capture, so this runs before SearchInput's own Escape handler has
        // cleared the field.
        window.addEventListener("keydown", onKeyDown, true);
        return () => window.removeEventListener("keydown", onKeyDown, true);
    }, [isOpen]);

    // Collapsing or expanding makes the pressed control inert, which would
    // drop focus to <body>. Hand it to the control that replaced it instead.
    useEffect(() => {
        if (!desktopFocusRef.current) return;
        desktopFocusRef.current = false;
        (isDesktopOpen ? collapseButtonRef : expandButtonRef).current?.focus({ preventScroll: true });
    }, [isDesktopOpen]);

    // Fallback for the global "/" or Cmd/Ctrl+K shortcut when neither search
    // input could be focused directly (desktop sidebar collapsed via `inert`,
    // or the mobile drawer closed): open the right surface, then focus its
    // input. `inert` is removed on commit, so a bare focus() call racing the
    // commit silently fails — double-rAF waits for that paint to land.
    useEffect(() => {
        const onOpenSearch = () => {
            if (window.matchMedia("(min-width: 768px)").matches) {
                setDesktopChoice(true);
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        document.getElementById("searchInput-desktop")?.focus();
                    });
                });
            } else {
                openSheet("search");
            }
        };

        window.addEventListener("axiom:open-search", onOpenSearch);
        return () => window.removeEventListener("axiom:open-search", onOpenSearch);
    }, []);

    useLayoutEffect(() => {
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

    const submitSearch = () => {
        closeSheet(false);
        requestAnimationFrame(() => {
            const results = document.getElementById("rulesContainer");
            if (!results) return;
            results.focus({ preventScroll: true });
            const headerHeight = headerRef.current?.offsetHeight ?? 0;
            const top = results.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
            const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            window.scrollTo({ top: Math.max(0, top), behavior: reduced ? "auto" : "smooth" });
        });
    };

    return (
        <>
            {/* Mobile header. Keep the 61px prerendered frame height:
                page.tsx's prerendered frame holds exactly this height. */}
            <div
                ref={headerRef}
                className="sticky top-0 z-40 flex min-h-[61px] items-center justify-between bg-surface/80 px-4 py-3 backdrop-blur-md md:hidden"
            >
                <Lockup />
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <IconButton
                        ref={menuButtonRef}
                        label="Open menu"
                        aria-expanded={isOpen}
                        aria-controls={SHEET_ID}
                        onClick={(event) => {
                            tapNudge();
                            // detail is 0 for Enter/Space: a keyboard user goes
                            // straight to the field.
                            openSheet(event.detail === 0 ? "search" : "panel");
                        }}
                    >
                        <Menu aria-hidden="true" />
                    </IconButton>
                </div>
            </div>

            {/* Mobile sheet. Closed, it is inert (out of the tab order and the
                accessibility tree) and, once it has slid out, invisible, so
                its shadow can't band the right edge of the page. */}
            <div
                inert={!isOpen || undefined}
                className={cn(
                    "fixed inset-0 z-50 flex justify-end md:hidden",
                    isOpen ? "pointer-events-auto" : "pointer-events-none"
                )}
            >
                <div
                    aria-hidden="true"
                    onClick={() => { tapNudge(); closeSheet(true); }}
                    style={{ transitionProperty: "opacity", transitionDuration: "var(--motion-medium)" }}
                    className={cn(
                        "sidebar-motion absolute inset-0 bg-black/20 backdrop-blur-sm ease-out-strong dark:bg-black/40",
                        isOpen ? "opacity-100" : "opacity-0"
                    )}
                />

                {/* Visibility transitions only on the way out: it flips to
                    visible at once on open (so focus can land), and holds until
                    the slide has finished on close. */}
                <div
                    ref={sheetRef}
                    id={SHEET_ID}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Menu"
                    tabIndex={-1}
                    style={{
                        transitionProperty: isOpen ? "translate" : "translate, visibility",
                        transitionDuration: isOpen ? "var(--motion-slow)" : "var(--motion-medium)",
                    }}
                    className={cn(
                        "sidebar-motion relative w-[88%] max-w-[340px] bg-surface shadow-panel outline-none ease-drawer",
                        isOpen
                            ? "visible translate-x-0"
                            : "invisible translate-x-full"
                    )}
                >
                    <SidebarContent
                        instance="mobile"
                        onLinkClick={() => closeSheet(false)}
                        onSearchSubmit={submitSearch}
                        headerAction={
                            <IconButton
                                label="Close menu"
                                onClick={() => { tapNudge(); closeSheet(true); }}
                            >
                                <X aria-hidden="true" />
                            </IconButton>
                        }
                    />
                </div>
            </div>

            {/* Desktop sidebar. Each panel enters on the slow token and leaves
                on the medium one (motion-6/7). */}
            <div ref={desktopRef} className="pointer-events-none fixed inset-y-0 left-0 z-[80] hidden w-[312px] md:block">
                <div
                    inert={isDesktopOpen || undefined}
                    style={{
                        transitionProperty: motionReady ? "opacity, translate, scale, filter" : "none",
                        transitionDuration: isDesktopOpen ? "var(--motion-medium)" : "var(--motion-slow)",
                    }}
                    className={cn(
                        "sidebar-motion absolute left-5 top-5 z-20 rounded-full shadow-overlay ease-drawer",
                        isDesktopOpen
                            ? "translate-x-1 scale-[0.88] opacity-0 blur-[4px]"
                            : "pointer-events-auto translate-x-0 scale-100 opacity-100 blur-0"
                    )}
                >
                    <IconButton
                        ref={expandButtonRef}
                        label="Expand sidebar"
                        variant="outline"
                        aria-expanded={false}
                        aria-controls={DESKTOP_PANEL_ID}
                        onClick={() => {
                            tapNudge();
                            desktopFocusRef.current = true;
                            setDesktopChoice(true);
                        }}
                    >
                        <PanelLeftOpen aria-hidden="true" />
                    </IconButton>
                </div>

                <aside
                    id={DESKTOP_PANEL_ID}
                    // When collapsed the panel is only visually hidden (opacity/transform),
                    // so its controls stay in the tab order — `inert` pulls all descendants
                    // out of focus order and the a11y tree in one standards-compliant step.
                    inert={!isDesktopOpen || undefined}
                    style={{
                        transitionProperty: motionReady ? "opacity, translate, scale, filter" : "none",
                        transitionDuration: isDesktopOpen ? "var(--motion-slow)" : "var(--motion-medium)",
                    }}
                    className={cn(
                        "sidebar-motion absolute bottom-5 left-5 top-5 flex w-[280px] overflow-hidden rounded-card border border-line bg-surface/95 shadow-panel ease-drawer",
                        isDesktopOpen
                            ? "pointer-events-auto translate-x-0 scale-100 opacity-100 blur-0"
                            : "-translate-x-2 scale-[0.985] opacity-0 blur-[2px]"
                    )}
                >
                    <SidebarContent
                        instance="desktop"
                        headerAction={
                            <IconButton
                                ref={collapseButtonRef}
                                label="Collapse sidebar"
                                aria-expanded={isDesktopOpen}
                                aria-controls={DESKTOP_PANEL_ID}
                                onClick={() => {
                                    tapNudge();
                                    desktopFocusRef.current = true;
                                    setDesktopChoice(false);
                                }}
                            >
                                <PanelLeftClose aria-hidden="true" />
                            </IconButton>
                        }
                    />
                </aside>
            </div>
        </>
    );
}
