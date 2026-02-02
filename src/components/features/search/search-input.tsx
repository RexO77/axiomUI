"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SearchInput({ itemCount }: { itemCount: number }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const query = searchParams.get("q") ?? "";

    const updateParams = (updates: { q?: string }) => {
        const nextParams = new URLSearchParams(searchParams.toString());

        if (updates.q) {
            nextParams.set("q", updates.q);
        } else {
            nextParams.delete("q");
        }

        const next = nextParams.toString();
        const nextUrl = next ? `${pathname}?${next}` : pathname;
        router.replace(nextUrl, { scroll: false });
    };

    return (
        <div className="mt-6">
            <div className="relative">
                <Search
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
                />
                <input
                    type="search"
                    id="searchInput"
                    name="search"
                    autoComplete="off"
                    placeholder="Search decisions..."
                    value={query}
                    onChange={(event) => {
                        const nextQuery = event.target.value;
                        if (nextQuery === query) {
                            return;
                        }
                        updateParams({ q: nextQuery });
                    }}
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors duration-200 focus:border-neutral-300 focus:bg-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-600 dark:focus:bg-neutral-800"
                />
            </div>
            <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
                {itemCount} decisions
            </p>
        </div>
    );
}
