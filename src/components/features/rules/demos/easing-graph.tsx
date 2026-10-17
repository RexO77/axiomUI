import { cn } from "@/lib/utils";

/**
 * Cubic-bezier plot with a rideable progress dot.
 * Outer data-anim="dot-x" = time (linear); inner data-anim="dot-y" = value (pane easing).
 * The dot rides the same inset box the path is drawn in, so it sits on the
 * curve's endpoints and is never cut by the frame's clip at rest or at the end.
 */
export function EasingGraph({
    x1,
    y1,
    x2,
    y2,
    size,
    label,
}: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    size: "sm" | "lg";
    label?: string;
}) {
    const w = 100;
    const h = 60;
    const path = `M 0 ${h} C ${x1 * w} ${h - y1 * h}, ${x2 * w} ${h - y2 * h}, ${w} 0`;
    const area = `${path} L ${w} ${h} L 0 ${h} Z`;

    return (
        <div aria-hidden="true">
            <div
                className={cn(
                    "relative overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/60",
                    size === "lg" ? "h-28" : "h-14"
                )}
            >
            {/* Curve and dot share one plot box, inset a fixed 12px: room for
                the dot (5px radius + 2px ring) at both ends on any pane width.
                A percentage inset collapsed to 6px in a 390px-wide layout and
                the end dot lost its ring to the frame's clip. */}
            <div className={cn("absolute", size === "lg" ? "inset-3" : "inset-2")}>
                <svg
                    viewBox={`0 0 ${w} ${h}`}
                    preserveAspectRatio="none"
                    className="absolute inset-0 size-full overflow-visible"
                >
                    <path d={area} className="fill-blue-500/12 dark:fill-blue-400/12" />
                    <path
                        d={path}
                        className="fill-none stroke-blue-600 dark:stroke-blue-400"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>

                <div
                    data-anim="dot-x"
                    className="absolute inset-0 will-change-transform"
                    style={{ transform: "translateX(0%)" }}
                >
                    <div
                        data-anim="dot-y"
                        className="absolute bottom-0 left-0 h-full w-0 will-change-transform"
                        style={{ transform: "translateY(0%)" }}
                    >
                        <span className="absolute bottom-0 left-0 size-2.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-blue-500 shadow ring-2 ring-white dark:bg-blue-400 dark:ring-neutral-950" />
                    </div>
                </div>
            </div>

            <span className="pointer-events-none absolute bottom-1 right-2 z-10 text-xs leading-none text-neutral-600 dark:text-neutral-300">
                time →
            </span>
            </div>

            {/* The curve's spec reads as a full-width caption rather than an
                overlay pill: at 12px the bezier string wants the whole pane,
                and on a narrow one it wraps instead of crossing the curve. */}
            {label ? (
                <p className="mt-1.5 break-words font-mono text-xs leading-4 text-neutral-600 dark:text-neutral-300">
                    {label}
                </p>
            ) : null}
        </div>
    );
}
