"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type PointerEvent as ReactPointerEvent,
} from "react";

import { cn } from "@/lib/utils";
import { Hint, PaneChrome } from "@/components/features/rules/demos/showcase-chrome";
import { showcaseSpecs } from "@/components/features/rules/demos/showcase-specs";

const LABELS = ["Cut", "Copy", "Paste"] as const;
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

    const setHoverIndex = (index: number | null) => {
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
    };

    const indexFromEvent = (e: ReactPointerEvent<HTMLDivElement>) => {
        const el = surfaceRef.current;
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const localX = e.clientX - rect.left;
        const half = rect.width / 2;
        const inColumn = localX < half ? localX : localX - half;
        const third = half / LABELS.length;
        return Math.min(LABELS.length - 1, Math.max(0, Math.floor(inColumn / third)));
    };

    return (
        <div className="motion-showcase">
            <div
                ref={surfaceRef}
                data-vaul-no-drag
                onPointerMove={(e) => setHoverIndex(indexFromEvent(e))}
                onPointerDown={(e) => setHoverIndex(indexFromEvent(e))}
                onPointerLeave={() => setHoverIndex(null)}
                className="grid grid-cols-2 gap-3"
                style={{ touchAction: "manipulation" }}
            >
                <PaneChrome variant="do" caption={spec.do.caption}>
                    <ToolbarPane
                        hovered={hovered}
                        instantAfterFirst
                        sessionOpen={sessionOpen}
                        onOpened={markOpened}
                    />
                </PaneChrome>
                <PaneChrome variant="dont" caption={spec.dont.caption}>
                    <ToolbarPane
                        hovered={hovered}
                        instantAfterFirst={false}
                        sessionOpen={false}
                        onOpened={noop}
                    />
                </PaneChrome>
            </div>
            <div className="mt-3 flex min-h-[28px] items-center">
                <Hint>
                    Sweep left → right across the buttons — left pane waits once, then
                    tooltips are instant
                </Hint>
            </div>
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
        <div className="flex h-32 flex-col justify-center gap-2">
            {/* Real toolbar strip — rest state isn't floating buttons in a void */}
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-1.5 dark:border-neutral-800 dark:bg-neutral-900/60">
                <div className="mb-1.5 flex items-center justify-between px-1">
                    <span className="text-[9px] font-medium uppercase tracking-wide text-neutral-400">
                        Toolbar
                    </span>
                    {instantAfterFirst ? (
                        <span
                            className={cn(
                                "rounded-full px-1.5 py-0.5 text-[9px] font-medium tabular-nums",
                                sessionOpen
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                    : "bg-neutral-200/80 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                            )}
                        >
                            {sessionOpen ? "session open · 0ms" : "first wait 300ms"}
                        </span>
                    ) : (
                        <span className="rounded-full bg-neutral-200/80 px-1.5 py-0.5 text-[9px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                            always 300ms
                        </span>
                    )}
                </div>
                <div className="flex items-end justify-center gap-1">
                    {LABELS.map((label, i) => {
                        const active = hovered === i;
                        return (
                            <div key={label} className="relative flex flex-col items-center">
                                <div
                                    ref={(el) => {
                                        tipRefs.current[i] = el;
                                    }}
                                    className="absolute bottom-full mb-1.5 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-[9px] font-medium text-white shadow-md dark:bg-neutral-100 dark:text-neutral-900"
                                    style={{ opacity: 0 }}
                                >
                                    {label}
                                    <span className="absolute left-1/2 top-full -mt-px h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-neutral-900 dark:border-t-neutral-100" />
                                </div>
                                <span
                                    className={cn(
                                        "inline-flex min-w-[2.75rem] items-center justify-center rounded-md border px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
                                        active
                                            ? "border-blue-500 bg-blue-500/10 text-blue-700 dark:border-blue-400 dark:text-blue-300"
                                            : "border-neutral-300 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                                    )}
                                >
                                    {label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
