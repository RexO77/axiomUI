import { cn } from "@/lib/utils";

/**
 * Cubic-bezier plot with a rideable progress dot.
 * Outer data-anim="dot-x" = time (linear); inner data-anim="dot-y" = value (pane easing).
 * Fully clipped — never bleeds outside the stage.
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
    // Inset the path slightly so stroke/dot stay inside the viewBox.
    const pad = 4;
    const path = `M ${pad} ${h - pad} C ${pad + x1 * (w - 2 * pad)} ${h - pad - y1 * (h - 2 * pad)}, ${pad + x2 * (w - 2 * pad)} ${h - pad - y2 * (h - 2 * pad)}, ${w - pad} ${pad}`;
    const area = `${path} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`;

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/60",
                size === "lg" ? "h-[120px]" : "h-14"
            )}
            aria-hidden="true"
        >
            {label ? (
                <span className="pointer-events-none absolute left-1.5 top-1.5 z-10 rounded bg-neutral-50/85 px-1 py-0.5 font-mono text-[9px] leading-none text-neutral-500 backdrop-blur-[1px] dark:bg-neutral-900/85 dark:text-neutral-400">
                    {label}
                </span>
            ) : null}

            <svg
                viewBox={`0 0 ${w} ${h}`}
                preserveAspectRatio="none"
                className="absolute inset-0 size-full"
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

            {/* Dot rides the full graph box; padding is baked into the path. */}
            <div className="absolute inset-0">
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

            <span className="pointer-events-none absolute bottom-1 right-2 z-10 text-[8px] text-neutral-400 dark:text-neutral-500">
                time →
            </span>
        </div>
    );
}
