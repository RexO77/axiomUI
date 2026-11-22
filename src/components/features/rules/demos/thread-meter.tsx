// design-system: strict
import { Hint } from "@/components/features/rules/demos/showcase-chrome";

export type ThreadSample = { atMs: number; gapMs: number };

const STALL_THRESHOLD_MS = 40;

/**
 * Seismograph strip of main-thread gaps during a load demo run. The parent
 * owns sampling and hands over the samples once a run finishes.
 *
 * It always renders at one height (the track plus a caption slot two lines
 * tall in a narrow showcase, one from `@lg`), so the showcase never grows
 * when the first run lands its receipt.
 */
export function ThreadMeter({
    samples,
    durationMs,
    recording = false,
    reduced = false,
}: {
    samples: ThreadSample[];
    durationMs: number;
    /** A run is in flight; its samples arrive when it finishes. */
    recording?: boolean;
    /** Reduced motion skips the race, so there is no run to sample. */
    reduced?: boolean;
}) {
    const recorded = samples.length > 0 && durationMs > 0;
    const stalls = recorded ? samples.filter((s) => s.gapMs > STALL_THRESHOLD_MS) : [];
    const longest = stalls.reduce((m, s) => Math.max(m, s.gapMs), 0);

    let caption: string;
    if (reduced) caption = "Reduced motion skips the main-thread recording.";
    else if (recording) caption = "Recording gaps between main-thread callbacks…";
    else if (!recorded) caption = "Start the race to record gaps between main-thread callbacks.";
    else if (stalls.length === 0)
        caption = `No callback gap exceeded ${STALL_THRESHOLD_MS}ms on this run.`;
    else
        caption = `${stalls.length} callback gap${stalls.length === 1 ? "" : "s"} over ${STALL_THRESHOLD_MS}ms. Longest gap ${Math.round(longest)}ms.`;

    return (
        <div className="mt-3 space-y-1.5">
            <div
                className="relative h-1.5 w-full overflow-hidden rounded-full bg-fill"
                aria-hidden="true"
            >
                {stalls.map((s, i) => {
                    const left = Math.max(0, ((s.atMs - s.gapMs) / durationMs) * 100);
                    const width = Math.max(0.4, (s.gapMs / durationMs) * 100);
                    return (
                        <span
                            key={`${s.atMs}-${i}`}
                            className="absolute inset-y-0 rounded-full bg-dont"
                            style={{ left: `${left}%`, width: `${width}%` }}
                        />
                    );
                })}
            </div>
            <p className="min-h-8 text-xs leading-4 tabular-nums text-balance @lg:min-h-4" aria-live="polite">
                <Hint>{caption}</Hint>
            </p>
        </div>
    );
}
