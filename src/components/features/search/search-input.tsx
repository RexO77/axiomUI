"use client";

import { Search } from "lucide-react";
import { useHaptics } from "@/hooks/use-haptics";
import { useSearch } from "@/components/providers/search-provider";
import { cn } from "@/lib/utils";

export function SearchInput({ instance }: { instance: "desktop" | "mobile" }) {
    const { query, setQuery, inputRef } = useSearch();
    const { tapLight } = useHaptics();
    const isDesktop = instance === "desktop";

    return (
        <div className="mt-6">
            <div className="relative">
                <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
                />
                <input
                    ref={isDesktop ? inputRef : undefined}
                    type="search"
                    id={`searchInput-${instance}`}
                    name="search"
                    aria-keyshortcuts="/"
                    autoComplete="off"
                    placeholder="Search decisions…"
                    value={query}
                    onFocus={() => tapLight()}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key !== "Escape") return;
                        if (query) {
                            setQuery("");
                        } else {
                            event.currentTarget.blur();
                        }
                    }}
                    className={cn(
                        "peer w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-9 text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors duration-200 focus:border-neutral-300 focus:bg-white focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-600 dark:focus:bg-neutral-800 dark:focus-visible:ring-neutral-500",
                        isDesktop
                            ? "min-h-10 pr-10 text-sm"
                            : "min-h-11 pr-3 text-base"
                    )}
                />
                {isDesktop && !query ? (
                    <kbd
                        aria-hidden="true"
                        className="pointer-events-none absolute right-2.5 top-1/2 flex h-5 min-w-5 -translate-y-1/2 items-center justify-center rounded-[4px] border border-neutral-200 bg-white px-1 font-sans text-[11px] font-medium text-neutral-400 transition-opacity duration-150 peer-focus:opacity-0 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-500"
                    >
                        /
                    </kbd>
                ) : null}
            </div>
        </div>
    );
}
