export function Header() {
    return (
        <header className="py-12">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">
                <span className="chip rounded-full px-3 py-1">Design Systems</span>
                <span className="chip rounded-full px-3 py-1">Product Heuristics</span>
                <span className="chip rounded-full px-3 py-1">UX Logic</span>
            </div>
            <h2 className="mt-6 text-4xl font-semibold text-neutral-900 md:text-5xl dark:text-neutral-100">
                The Decision Engine Behind Sharp, Consistent Interfaces.
            </h2>
            <p className="mt-4 max-w-2xl text-base text-neutral-600 md:text-lg dark:text-neutral-300">
                Stop relying on intuition. This repository captures the micro-decisions that
                define durable design systems across typography, layout, color, and interaction
                patterns.
            </p>
        </header>
    );
}
