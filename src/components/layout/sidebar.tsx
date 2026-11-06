// design-system: strict
"use client";

import {
    useDeferredValue,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
} from "react";
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
import { categories, resolveRuleId } from "@/data/ui-logic";
import { countByCategory } from "@/lib/rule-search";
import { REDUCED_MOTION_QUERY } from "@/lib/media";
import { captureReadingAnchor, restoreReadingAnchor, stopGlide } from "@/lib/reading-anchor";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/use-haptics";
import { useSearch } from "@/components/providers/search-provider";

const SHEET_ID = "mobile-menu";
const DESKTOP_PANEL_ID = "desktop-sidebar";

/**
 * Below this width the floating panel would squeeze the cards, so it starts
 * collapsed. The prerender classes below and the lane's band in globals.css
 * break at the same width.
 */
const DESKTOP_OPEN_QUERY = "(min-width: 1024px)";

/** The panel's exit (duration-medium, 220ms) plus a frame, as page.tsx waits for the drawer's. */
const LANE_DELAY_MS = 240;

type DesktopState = "open" | "closed" | "prerender";

/*
 * How the expand button and the panel look in each state. Both enter on the
 * slow token and leave on the medium one (motion-6/7). "prerender" is the
 * server's render, which can't know the width: it keys the state to the same
 * 1024px query in CSS, so every width paints what hydration keeps. There the
 * hidden control is `invisible` instead of inert (CSS can't set inert), which
 * takes it out of the tab order just the same.
 */
const EXPAND_BUTTON_CLASSES: Record<DesktopState, string> = {
    open: "translate-x-1 scale-[0.88] opacity-0 blur-[4px]",
    closed: "pointer-events-auto translate-x-0 scale-100 opacity-100",
    prerender:
        "pointer-events-auto translate-x-0 scale-100 opacity-100 min-[1024px]:pointer-events-none min-[1024px]:invisible min-[1024px]:translate-x-1 min-[1024px]:scale-[0.88] min-[1024px]:opacity-0 min-[1024px]:blur-[4px]",
};

const PANEL_CLASSES: Record<DesktopState, string> = {
    open: "pointer-events-auto translate-x-0 scale-100 opacity-100",
    closed: "-translate-x-2 scale-[0.985] opacity-0 blur-[2px]",
    prerender:
        "invisible -translate-x-2 scale-[0.985] opacity-0 blur-[2px] min-[1024px]:pointer-events-auto min-[1024px]:visible min-[1024px]:translate-x-0 min-[1024px]:scale-100 min-[1024px]:opacity-100 min-[1024px]:filter-none",
};

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** A CSS time token in ms. The build minifies 360ms to .36s. */
function durationMs(value: string) {
    const time = value.trim();
    return time.endsWith("ms") ? parseFloat(time) : parseFloat(time) * 1000;
}

/** The rule open in the drawer, whose card is the one to hold in place. */
function openRuleId() {
    return resolveRuleId(new URLSearchParams(window.location.search).get("rule"));
}

function subscribeToDesktopWidth(onChange: () => void) {
    const query = window.matchMedia(DESKTOP_OPEN_QUERY);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
}

/**
 * An Index jump aims at the section's position while the cards above it are
 * still content-visibility placeholders. The cards that render on arrival are
 * taller than their placeholder on a phone, which pushed the heading 250px
 * below the bar, and the target's own first cards painted blank for a frame.
 *
 * So the target's first two cards render before the jump, and a
 * ResizeObserver re-aims as the catalog settles. Its callbacks run after
 * layout and before paint, so each correction lands in the frame that caused
 * it and only the settled heading is ever painted.
 */
const SETTLE_CALLBACKS = 4;
const SETTLE_MS = 300;
let stopSectionSettlement: (() => void) | undefined;

function settleOnSection(id: string, moveFocus = false) {
    stopGlide();
    stopSectionSettlement?.();
    const section = document.getElementById(id);
    const container = document.getElementById("rulesContainer");
    if (!section || !container) return;
    const cards = Array.from(section.querySelectorAll<HTMLElement>(".rule-card")).slice(0, 2);
    const previousVisibility = cards.map((card) => card.style.contentVisibility);
    cards.forEach((card) => { card.style.contentVisibility = "visible"; });
    let callbacks = 0;
    let stopped = false;
    let focusPending = moveFocus;
    const check = () => {
        if (stopped) return;
        if (!section.isConnected || !container.isConnected) { stop(); return; }
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
    };
    const observer = new ResizeObserver(() => {
        check();
        if (++callbacks >= SETTLE_CALLBACKS) stop();
    });
    const timeoutId = window.setTimeout(stop, SETTLE_MS);

    function stop() {
        if (stopped) return;
        stopped = true;
        observer.disconnect();
        cancelAnimationFrame(frame);
        window.removeEventListener("wheel", stop);
        window.removeEventListener("touchstart", stop);
        window.removeEventListener("keydown", stop);
        window.removeEventListener("resize", stop);
        window.clearTimeout(timeoutId);
        cards.forEach((card, index) => {
            card.style.contentVisibility = previousVisibility[index];
        });
        if (stopSectionSettlement === stop) stopSectionSettlement = undefined;
    }

    observer.observe(container);
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stop);
    window.addEventListener("resize", stop);
    const frame = requestAnimationFrame(check);
    stopSectionSettlement = stop;
}

// Full touch targets retain the mobile header's existing glyph positions.
const MOBILE_CONTROLS = "-mr-1 flex items-center";

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
    // Counts follow the grid, which filters on the deferred query too.
    const deferredQuery = useDeferredValue(query);
    const isSearching = deferredQuery.trim() !== "";
    const counts = useMemo(() => countByCategory(deferredQuery), [deferredQuery]);
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

        let atBottom = false;

        // The active category is the one under a line a quarter of the way
        // down the viewport. A thin band at that line, not a ratio threshold:
        // a section taller than the viewport never shows a large ratio, so a
        // ratio left the highlight stuck on whichever section had last passed
        // one. A section leaving the line changes nothing; the next one
        // entering it takes over.
        const createObserver = () => {
            const top = Math.round(window.innerHeight * 0.25);
            const bottom = Math.max(0, window.innerHeight - top - 1);
            return new IntersectionObserver(
                (entries) => {
                    if (atBottom) return;
                    const entering = entries.find((entry) => entry.isIntersecting);
                    if (entering?.target.id) setActiveCategoryId(entering.target.id);
                },
                { rootMargin: `-${top}px 0px -${bottom}px 0px`, threshold: 0 }
            );
        };
        let observer = createObserver();

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

        // A short last section can never reach the line, so at the bottom of
        // the page it is the active one. Leaving the bottom hands back to
        // whichever section is under the line.
        const onScroll = () => {
            const bottom =
                window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
            if (bottom === atBottom) return;
            atBottom = bottom;

            const rendered = categoryIds
                .map((id) => document.getElementById(id))
                .filter((section) => section !== null);
            if (bottom) {
                const last = rendered[rendered.length - 1];
                if (last) setActiveCategoryId(last.id);
                return;
            }
            const line = window.innerHeight * 0.25;
            const underLine = rendered.find((section) => {
                const { top, bottom: sectionBottom } = section.getBoundingClientRect();
                return top <= line && sectionBottom > line;
            });
            if (underLine) setActiveCategoryId(underLine.id);
        };
        const onResize = () => {
            observer.disconnect();
            observer = createObserver();
            categoryIds.forEach((id) => {
                const section = document.getElementById(id);
                if (section) observer.observe(section);
            });
            onScroll();
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize);

        window.addEventListener("hashchange", syncFromHash);

        return () => {
            observer.disconnect();
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
            window.removeEventListener("hashchange", syncFromHash);
        };
        // Re-subscribe whenever the grid re-filters: filtering mounts new
        // section DOM nodes that the effect above needs to re-observe.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deferredQuery]);

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
        // Repeat the mobile bar's control row so its glyphs stay in place.
        <div className={cn("flex h-full min-w-0 flex-1 flex-col", isMobile ? "px-4 pb-4 pt-2" : "p-6")}>
            <div className="flex items-center justify-between">
                <Lockup subtitle={!isMobile} />
                <div className={isMobile ? MOBILE_CONTROLS : "flex items-center gap-2"}>
                    <ThemeToggle size={isMobile ? "md" : "sm"} />
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
                                    "pressable flex min-h-11 items-center gap-3 rounded-full px-2 text-sm [@media(pointer:fine)]:min-h-10",
                                    isActive
                                        ? "bg-fill-strong font-semibold text-ink"
                                        : "font-medium text-ink-secondary hover:bg-fill hover:text-ink",
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
    useEffect(() => () => { stopSectionSettlement?.(); }, []);
    // The panel follows the window (open from 1024px, collapsed below, where
    // it would squeeze the cards) until the reader toggles it; from then on
    // their choice holds. The server can't know the width, so it renders
    // null: both panels then take their state from the media query in CSS,
    // and hydration resolves to the state that is already on screen.
    const isWideEnough = useSyncExternalStore<boolean | null>(
        subscribeToDesktopWidth,
        () => window.matchMedia(DESKTOP_OPEN_QUERY).matches,
        () => null
    );
    const [desktopChoice, setDesktopChoice] = useState<boolean | null>(null);
    const isDesktopOpen = desktopChoice ?? isWideEnough;

    // The lane follows the panel by the docked drawer's two rules (page.tsx):
    // it changes width only while the panel is off screen, and the card being
    // read keeps its top edge across the change. So the lane trails a
    // collapse, holding until the panel's exit has finished, and leads an
    // expand, with the panel's entrance gated until the lane has painted.
    const [holdLane, setHoldLane] = useState(false);
    const [panelGated, setPanelGated] = useState(false);
    const laneOpen = isDesktopOpen === null ? null : isDesktopOpen || holdLane;
    const laneOpenRef = useRef<boolean | null>(null);

    const desktopState: DesktopState =
        isDesktopOpen === null ? "prerender" : isDesktopOpen ? "open" : "closed";
    const panelState: DesktopState = desktopState === "open" && panelGated ? "closed" : desktopState;
    const { tapNudge } = useHaptics();

    const headerRef = useRef<HTMLDivElement>(null);
    const desktopRef = useRef<HTMLDivElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const sheetRef = useRef<HTMLDivElement>(null);
    const expandButtonRef = useRef<HTMLButtonElement>(null);
    const collapseButtonRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLElement>(null);
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

    // Under reduced motion the panel jumps, so there is no exit to wait out
    // or entrance to gate, and the lane changes in the same commit.
    const collapseDesktop = () => {
        setPanelGated(false);
        if (window.matchMedia(REDUCED_MOTION_QUERY).matches) {
            captureReadingAnchor(openRuleId());
        } else {
            setHoldLane(true);
        }
        setDesktopChoice(false);
    };

    const expandDesktop = () => {
        // Re-expanding while the lane is still held: it never narrowed.
        if (laneOpenRef.current === false) {
            captureReadingAnchor(openRuleId());
            if (!window.matchMedia(REDUCED_MOTION_QUERY).matches) setPanelGated(true);
        }
        setHoldLane(false);
        setDesktopChoice(true);
    };

    // A busy main thread can start the exit a frame or two after the commit,
    // so if it is still running when the delay is up, wait for it to end.
    useEffect(() => {
        if (!holdLane || isDesktopOpen) return;
        let cancelled = false;
        const release = () => {
            if (cancelled) return;
            captureReadingAnchor(openRuleId());
            setHoldLane(false);
        };
        const timeoutId = window.setTimeout(() => {
            const running = (panelRef.current?.getAnimations() ?? []).filter(
                (animation) => animation.playState === "running"
            );
            if (running.length === 0) release();
            else void Promise.all(running.map((animation) => animation.finished)).then(release, release);
        }, LANE_DELAY_MS);
        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
        };
    }, [holdLane, isDesktopOpen]);

    // The lane changed in the last commit and has painted once; start the
    // entrance on the frame after, over a settled page (rule-drawer.tsx gates
    // the docked panel the same way).
    useEffect(() => {
        if (!panelGated) return;
        let second = 0;
        const first = requestAnimationFrame(() => {
            second = requestAnimationFrame(() => setPanelGated(false));
        });
        return () => {
            cancelAnimationFrame(first);
            cancelAnimationFrame(second);
        };
    }, [panelGated]);

    // Keep the page outside the sheet out of pointer and keyboard interaction.
    // Portaled dialogs opened from the sheet remain available above it.
    useEffect(() => {
        if (!isOpen) return;
        const main = document.querySelector<HTMLElement>(".main-lane-shell") ?? document.getElementById("main-content");
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
                expandDesktop();
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

    // Before hydration the lane already holds the matching default shift.
    // The reading anchor is put back right after the new shift applies, in
    // the same frame, so the re-wrapped page never paints at the wrong place.
    useLayoutEffect(() => {
        if (laneOpen === null) return;
        const root = document.documentElement;
        const lane = document.querySelector<HTMLElement>(".main-lane-shell");
        const column = document.querySelector("#rulesContainer > section");
        const before = laneOpenRef.current === null ? undefined : column?.getBoundingClientRect();
        lane?.getAnimations().forEach((animation) => animation.cancel());

        root.style.setProperty(
            "--main-lane-shift",
            laneOpen ? "var(--main-lane-open-shift)" : "0px"
        );
        // Expose open/closed as a 0/1 flag so the content lane can reserve
        // sidebar clearance only when it's actually open (the shift amount
        // alone can't tell open-on-wide-screen apart from closed).
        root.style.setProperty("--sidebar-open", laneOpen ? "1" : "0");
        restoreReadingAnchor();
        laneOpenRef.current = laneOpen;

        // Where the column keeps its width (a wide window, drawer closed) the
        // lane only moves sideways. Glide it there rather than snapping the
        // whole page 80px; where it re-wraps, a slide can't hide that.
        if (!before || !column || !lane || window.matchMedia(REDUCED_MOTION_QUERY).matches) return;
        const after = column.getBoundingClientRect();
        const dx = before.left - after.left;
        if (Math.abs(after.width - before.width) >= 1 || Math.abs(dx) < 1) return;
        const tokens = getComputedStyle(root);
        lane.animate(
            [{ transform: `translateX(${dx}px)` }, { transform: "none" }],
            {
                duration: durationMs(tokens.getPropertyValue("--motion-slow")),
                easing: tokens.getPropertyValue("--ease-drawer").trim(),
            }
        );
    }, [laneOpen]);

    useLayoutEffect(() => {
        const root = document.documentElement;
        return () => {
            root.style.removeProperty("--main-lane-shift");
            root.style.removeProperty("--sidebar-open");
        };
    }, []);

    const submitSearch = () => {
        closeSheet(false);
        requestAnimationFrame(() => {
            const results = document.getElementById("rulesContainer");
            if (!results) return;
            results.focus({ preventScroll: true });
            const headerHeight = headerRef.current?.offsetHeight ?? 0;
            const top = results.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
            const reduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;
            window.scrollTo({ top: Math.max(0, top), behavior: reduced ? "auto" : "smooth" });
        });
    };

    return (
        <>
            {/* Retain the 61px mobile bar while giving each control a full 44px target. */}
            <div
                ref={headerRef}
                data-sticky-header
                className="sticky top-0 z-40 flex min-h-[61px] items-center justify-between bg-surface/80 px-4 py-2 backdrop-blur-md md:hidden"
            >
                <Lockup />
                <div className={MOBILE_CONTROLS}>
                    <ThemeToggle size="md" />
                    <IconButton
                        ref={menuButtonRef}
                        size="md"
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
                        "sidebar-motion absolute inset-0 bg-scrim ease-out-strong",
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
                                size="md"
                                label="Close menu"
                                onClick={() => { tapNudge(); closeSheet(true); }}
                            >
                                <X aria-hidden="true" />
                            </IconButton>
                        }
                    />
                </div>
            </div>

            {/* Desktop sidebar */}
            <div ref={desktopRef} className="pointer-events-none fixed inset-y-0 left-0 z-[80] hidden w-[312px] md:block">
                <div
                    inert={isDesktopOpen === true || undefined}
                    style={{
                        transitionProperty: "opacity, translate, scale, filter",
                        transitionDuration: isDesktopOpen ? "var(--motion-medium)" : "var(--motion-slow)",
                    }}
                    className={cn(
                        "sidebar-motion absolute left-5 top-5 z-20 rounded-full shadow-overlay ease-drawer",
                        EXPAND_BUTTON_CLASSES[desktopState]
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
                            expandDesktop();
                        }}
                    >
                        <PanelLeftOpen aria-hidden="true" />
                    </IconButton>
                </div>

                <aside
                    ref={panelRef}
                    id={DESKTOP_PANEL_ID}
                    aria-label="Sidebar"
                    // When collapsed the panel is only visually hidden (opacity/transform),
                    // so its controls stay in the tab order — `inert` pulls all descendants
                    // out of focus order and the a11y tree in one standards-compliant step.
                    inert={isDesktopOpen === false || undefined}
                    style={{
                        transitionProperty: "opacity, translate, scale, filter",
                        transitionDuration: isDesktopOpen ? "var(--motion-slow)" : "var(--motion-medium)",
                    }}
                    className={cn(
                        "sidebar-motion absolute bottom-5 left-5 top-5 flex w-[280px] overflow-hidden rounded-card border border-line bg-surface/95 shadow-panel ease-drawer",
                        PANEL_CLASSES[panelState]
                    )}
                >
                    <SidebarContent
                        instance="desktop"
                        headerAction={
                            <IconButton
                                ref={collapseButtonRef}
                                label="Collapse sidebar"
                                aria-expanded={isDesktopOpen !== false}
                                aria-controls={DESKTOP_PANEL_ID}
                                onClick={() => {
                                    tapNudge();
                                    desktopFocusRef.current = true;
                                    collapseDesktop();
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
