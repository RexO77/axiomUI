import { cn } from "@/lib/utils";
import { Hint } from "@/components/features/rules/demos/showcase-chrome";

export type ThreadSample = { atMs: number; gapMs: number };

const STALL_THRESHOLD_MS = 40;

/**
 * Seismograph strip of main-thread gaps during a load demo run.
 * Renders only after a run finishes (parent owns sampling).
 */
export function ThreadMeter({
    samples,
    durationMs,
    mode,
}: {
    samples: ThreadSample[];
    durationMs: number;
    /** "stalls" for motion-21; "healthy" framing for motion-22. */
    mode: "stalls" | "healthy";
}) {
    if (samples.length === 0 || durationMs <= 0) return null;

    const stalls = samples.filter((s) => s.gapMs > STALL_THRESHOLD_MS);
    const longest = stalls.reduce((m, s) => Math.max(m, s.gapMs), 0);
    const frozen = stalls.reduce((sum, s) => sum + s.gapMs, 0);
    const healthy = stalls.length === 0;

    return (
        <div className="mt-3 space-y-1.5">
            <div
                className="relative h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-900"
                aria-hidden="true"
            >
                {stalls.map((s, i) => {
                    const left = Math.max(0, ((s.atMs - s.gapMs) / durationMs) * 100);
                    const width = Math.max(0.4, (s.gapMs / durationMs) * 100);
                    return (
                        <span
                            key={`${s.atMs}-${i}`}
                            className="absolute inset-y-0 rounded-full bg-rose-500/80"
                            style={{ left: `${left}%`, width: `${width}%` }}
                        />
                    );
                })}
            </div>
            <Hint>
                {healthy || mode === "healthy" ? (
                    <span className={cn("tabular-nums")}>
                        main thread — healthy · the steps come from setInterval, not load
                    </span>
                ) : (
                    <span className="tabular-nums">
                        main thread — longest stall {Math.round(longest)}ms · frozen{" "}
                        {Math.round(frozen)}ms of {durationMs}ms
                    </span>
                )}
            </Hint>
        </div>
    );
}
