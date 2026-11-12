"use client";

import {
    useCallback,
    useEffect,
    useId,
    useRef,
    useState,
} from "react";
import { ClipboardPaste, Copy, Scissors } from "lucide-react";

import { cn } from "@/lib/utils";
import { PaneChrome, ShowcaseControls } from "@/components/features/rules/demos/showcase-chrome";
import { showcaseSpecs } from "@/components/features/rules/demos/showcase-specs";

const LABELS = ["Cut", "Copy", "Paste"] as const;
/** The tooltip must carry something the button doesn't — otherwise the demo
 *  is arguing about the delay on a tooltip nobody needed. */
const SHORTCUTS = ["⌘X", "⌘C", "⌘V"] as const;
/** Two panes share a phone, where three labelled buttons don't fit a pane:
 *  there the toolbar turns to icons, as real narrow toolbars do, and the
 *  tooltip is what names them. */
const ICONS = [Scissors, Copy, ClipboardPaste] as const;
const FIRST_DELAY_MS = 300;
const FADE_MS = 100;
const GRACE_MS = 300;
const noop = () => undefined;

/** motion-11: 3-button toolbar — first tooltip waits; subsequent are instant (do). */
export function TooltipToolbarShowcase() {
    const spec = showcaseSpecs["motion-11"];
    const surfaceRef = useRef<HTMLDivElement | null>(null);
    const [hovered, setHovered] = useState<number | null>(null);
    const [sessionOpen, setSessionOpen] = useState(false);
    const graceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const markOpened = useCallback(() => setSessionOpen(true), []);

    useEffect(
        () => () => {
            if (graceTimer.current) clearTimeout(graceTimer.current);
        },
        []
    );

    const setHoverIndex = useCallback((index: number | null) => {
        if (graceTimer.current) {
            clearTimeout(graceTimer.current);
            graceTimer.current = null;
        }
        if (index !== null) {
            setHovered(index);
            return;
        }
        setHovered(null);
        graceTimer.current = setTimeout(() => {
            setSessionOpen(false);
            graceTimer.current = null;
        }, GRACE_MS);
    }, []);

    useEffect(() => {
        if (hovered === null) return;
        const dismiss = (event: KeyboardEvent) => {
            const surface = surfaceRef.current;
            if (event.key !== "Escape" || !surface?.contains(document.activeElement)) return;
            // Dismiss the tooltip before the drawer handles Escape.
            event.preventDefault();
            event.stopPropagation();
            setHoverIndex(null);
        };
        const dismissOnOutsidePress = (event: PointerEvent) => {
            const surface = surfaceRef.current;
            if (event.target instanceof Node && !surface?.contains(event.target)) {
                setHoverIndex(null);
            }
        };
        window.addEventListener("keydown", dismiss, true);
        window.addEventListener("pointerdown", dismissOnOutsidePress, true);
        return () => {
            window.removeEventListener("keydown", dismiss, true);
            window.removeEventListener("pointerdown", dismissOnOutsidePress, true);
        };
    }, [hovered, setHoverIndex]);

    /**
     * Real hit-testing against the buttons themselves. Splitting the surface
     * into geometric thirds would arm a tooltip while the pointer sits on
     * padding, the gaps between buttons, or the gap between panes — the demo
     * would claim a hover the user never made.
     */
    const toolIndex = (node: EventTarget | null) => {
        const target = node instanceof Element ? node : null;
        const hit = target?.closest<HTMLElement>("[data-tool-index]");
        if (!hit) return null;
        const index = Number(hit.dataset.toolIndex);
        return Number.isInteger(index) ? index : null;
    };

    return (
        <div className="motion-showcase @container">
            <div
                ref={surfaceRef}
                data-vaul-no-drag
                onPointerMove={(e) => setHoverIndex(toolIndex(e.target))}
                onPointerDown={(e) => setHoverIndex(toolIndex(e.target))}
                onPointerLeave={(e) => {
                    if (e.pointerType !== "touch") setHoverIndex(toolIndex(document.activeElement));
                }}
                onFocus={(e) => setHoverIndex(toolIndex(e.target))}
                onBlur={(e) => setHoverIndex(toolIndex(e.relatedTarget))}
                className="grid grid-cols-1 gap-3 @md:grid-cols-2"
                style={{ touchAction: "manipulation" }}
            >
                <PaneChrome variant="do" caption={spec.do.caption} interactive>
                    <ToolbarPane
                        hovered={hovered}
                        instantAfterFirst
                        sessionOpen={sessionOpen}
                        onOpened={markOpened}
                    />
                </PaneChrome>
                <PaneChrome variant="dont" caption={spec.dont.caption} interactive>
                    <ToolbarPane
                        hovered={hovered}
                        instantAfterFirst={false}
                        sessionOpen={false}
                        onOpened={noop}
                    />
                </PaneChrome>
            </div>
            <ShowcaseControls
                hints={[
                    "Hover or tab through Cut, Copy and Paste. The Do toolbar waits once, then shows each tooltip immediately.",
                ]}
                reducedNote="Reduced motion: the tooltips appear without their fade. The waits are the same."
            />
        </div>
    );
}

function ToolbarPane({
    hovered,
    instantAfterFirst,
    sessionOpen,
    onOpened,
}: {
    hovered: number | null;
    instantAfterFirst: boolean;
    sessionOpen: boolean;
    onOpened: () => void;
}) {
    const id = useId();
    const tipRefs = useRef<(HTMLDivElement | null)[]>([]);
    const showTimers = useRef<(ReturnType<typeof setTimeout> | null)[]>([null, null, null]);
    const visible = useRef([false, false, false]);

    useEffect(
        () => () => {
            showTimers.current.forEach((t) => t && clearTimeout(t));
        },
        []
    );

    useEffect(() => {
        LABELS.forEach((_, i) => {
            const tip = tipRefs.current[i];
            if (!tip) return;
            const shouldShow = hovered === i;

            if (showTimers.current[i]) {
                clearTimeout(showTimers.current[i]!);
                showTimers.current[i] = null;
            }

            if (shouldShow) {
                if (visible.current[i]) return;
                const delay = instantAfterFirst && sessionOpen ? 0 : FIRST_DELAY_MS;
                const reveal = () => {
                    tip.style.transition = `opacity ${FADE_MS}ms var(--ease-out-strong)`;
                    tip.style.opacity = "1";
                    visible.current[i] = true;
                    onOpened();
                };
                if (delay === 0) reveal();
                else showTimers.current[i] = setTimeout(reveal, delay);
            } else if (visible.current[i]) {
                tip.style.transition = `opacity ${FADE_MS}ms var(--ease-out-strong)`;
                tip.style.opacity = "0";
                visible.current[i] = false;
            }
        });
    }, [hovered, instantAfterFirst, sessionOpen, onOpened]);

    return (
        <div className="@container flex h-36 items-center justify-center rounded-[16px] border border-dashed border-neutral-300 bg-neutral-50/80 px-2 dark:border-neutral-700 dark:bg-neutral-900/50">
            {/* Real toolbar strip — rest state isn't floating buttons in a void.
                The stage is dashed like every other showcase rail; the toolbar
                is the one solid object on it. The status row sits under the
                buttons so tooltips rise into the stage above the toolbar,
                where a real one would, not over it. 13px: a hair under the
                stage's 16px, so the solid strip reads as an object on the
                dashed stage. The buttons are centred, not in its corners, so
                no radius nests in it. */}
            <div className="w-full min-w-0 rounded-[13px] border border-neutral-200 bg-white p-1.5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-end justify-center gap-1">
                    {LABELS.map((label, i) => {
                        const active = hovered === i;
                        const Icon = ICONS[i];
                        return (
                            <div key={label} className="relative flex flex-col items-center">
                                <div
                                    aria-hidden="true"
                                    ref={(el) => {
                                        tipRefs.current[i] = el;
                                    }}
                                    className="pointer-events-none absolute bottom-full mb-1.5 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-[10px] font-medium text-white shadow-md dark:bg-neutral-100 dark:text-neutral-900"
                                    style={{ opacity: 0 }}
                                >
                                    {label}{" "}
                                    <span className="font-mono opacity-60">
                                        {SHORTCUTS[i]}
                                    </span>
                                    <span className="absolute left-1/2 top-full -mt-px h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-neutral-900 dark:border-t-neutral-100" />
                                </div>
                                <span className="sr-only" id={`${id}-${i}`}>Shortcut {SHORTCUTS[i]}</span>
                                <button
                                    type="button"
                                    aria-label={label}
                                    aria-describedby={`${id}-${i}`}
                                    data-tool-index={i}
                                    className={cn(
                                        "inline-flex min-h-9 min-w-9 pointer-coarse:min-h-11 pointer-coarse:min-w-11 items-center justify-center rounded-md border text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 @[13rem]:min-w-[2.75rem] @[13rem]:px-2.5",
                                        active
                                            ? "border-blue-500 bg-blue-500/10 text-blue-700 dark:border-blue-400 dark:text-blue-300"
                                            : "border-neutral-300 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                                    )}
                                >
                                    <Icon
                                        aria-hidden="true"
                                        className="pointer-events-none size-4 stroke-[1.8] @[13rem]:hidden"
                                    />
                                    <span className="hidden @[13rem]:inline">{label}</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-1.5 flex items-center justify-center px-1 @[13rem]:justify-between">
                    <span className="hidden text-[9px] font-medium uppercase tracking-wide text-neutral-400 @[13rem]:inline">
                        Toolbar
                    </span>
                    {instantAfterFirst ? (
                        <span
                            className={cn(
                                "whitespace-nowrap rounded-full px-1.5 py-0.5 text-[9px] font-medium tabular-nums",
                                sessionOpen
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                    : "bg-neutral-200/80 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                            )}
                        >
                            {sessionOpen ? "session open · 0ms" : "first wait 300ms"}
                        </span>
                    ) : (
                        <span className="whitespace-nowrap rounded-full bg-neutral-200/80 px-1.5 py-0.5 text-[9px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                            always 300ms
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
