"use client";

import { Search } from "lucide-react";
import { useHaptics } from "@/hooks/use-haptics";
import { useSearch } from "@/components/providers/search-provider";

export function SearchInput({ instance }: { instance: "desktop" | "mobile" }) {
    const { query, setQuery, inputRef } = useSearch();
    const { tapLight } = useHaptics();

    return (
        <div className="mt-6">
            <div className="relative">
                <Search
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
                />
                <input
                    ref={instance === "desktop" ? inputRef : undefined}
                    type="search"
                    id={`searchInput-${instance}`}
                    name="search"
                    autoComplete="off"
                    placeholder="Search decisions..."
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
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors duration-200 focus:border-neutral-300 focus:bg-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-600 dark:focus:bg-neutral-800"
                />
            </div>
        </div>
    );
}
