// design-system: strict
"use client";

import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useHaptics } from "@/hooks/use-haptics";
import { useSearch } from "@/components/providers/search-provider";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";

export function SearchInput({ instance }: { instance: "desktop" | "mobile" }) {
    const { query, setQuery, inputRef } = useSearch();
    const { tapLight } = useHaptics();
    const fieldRef = useRef<HTMLInputElement | null>(null);
    const isDesktop = instance === "desktop";

    useEffect(() => {
        if (!isDesktop) return;
        const media = window.matchMedia("(min-width: 768px)");
        const syncShortcutTarget = () => {
            inputRef.current = media.matches ? fieldRef.current : null;
        };
        syncShortcutTarget();
        media.addEventListener("change", syncShortcutTarget);
        return () => {
            media.removeEventListener("change", syncShortcutTarget);
            inputRef.current = null;
        };
    }, [inputRef, isDesktop]);

    const clear = () => {
        tapLight();
        setQuery("");
        fieldRef.current?.focus();
    };

    return (
        <div className="mt-6">
            <div className="relative">
                <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
                />
                {/* form-2 in this catalog: a placeholder is not a label. The
                    field carries no visible label in either layout, so it gets
                    an explicit accessible name — and it names what it searches
                    the way the rest of the app does ("rules", not "decisions"). */}
                <input
                    ref={fieldRef}
                    type="search"
                    id={`searchInput-${instance}`}
                    name="search"
                    aria-label="Search rules"
                    aria-keyshortcuts="/"
                    autoComplete="off"
                    enterKeyHint="search"
                    placeholder="Search rules…"
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
                        "peer [&::-webkit-search-cancel-button]:appearance-none w-full rounded-field border border-line bg-sunken py-2 pl-9 text-ink placeholder:text-ink-faint transition-colors duration-medium focus:border-line-strong focus:bg-surface focus-visible:-outline-offset-1",
                        isDesktop
                            ? "min-h-10 pr-12 text-sm"
                            : "min-h-11 pr-12 text-base"
                    )}
                />
                {query ? (
                    // Hide the native cancel glyph only alongside this replacement.
                    // Keep pointer focus in the field and return keyboard focus
                    // after clearing; the shared control provides a 44px hit area.
                    <span className={cn(
                        "absolute top-1/2 -translate-y-1/2",
                        isDesktop ? "right-1" : "right-1.5"
                    )}>
                        <IconButton
                            label="Clear search"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={clear}
                        >
                            <X aria-hidden="true" />
                        </IconButton>
                    </span>
                ) : isDesktop ? (
                    <kbd
                        aria-hidden="true"
                        className="pointer-events-none absolute right-2.5 top-1/2 flex h-5 min-w-5 -translate-y-1/2 items-center justify-center rounded-[6px] border border-line bg-surface px-1 font-sans text-xs font-medium text-ink-muted transition-opacity duration-fast peer-focus:opacity-0"
                    >
                        /
                    </kbd>
                ) : null}
            </div>
        </div>
    );
}
