"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
    type RefObject,
} from "react";
import { useSearchParams } from "next/navigation";

const SYNC_DEBOUNCE_MS = 300;

type SearchContextValue = {
    /** Live value — drives filtering and inputs. */
    query: string;
    setQuery: (q: string) => void;
    /** The canonical (desktop) input to focus for the keyboard shortcut. */
    inputRef: RefObject<HTMLInputElement | null>;
    focusSearch: () => boolean;
};

const SearchContext = createContext<SearchContextValue | null>(null);

function buildUrl(pathname: string, query: string): string {
    // Read live so a write from another path (e.g. SkillBonus clearing `rule`)
    // that happened during the debounce window isn't clobbered.
    const params = new URLSearchParams(window.location.search);
    if (query) {
        params.set("q", query);
    } else {
        params.delete("q");
    }
    const next = params.toString();
    return `${pathname}${next ? `?${next}` : ""}${window.location.hash}`;
}

export function SearchProvider({ children }: { children: ReactNode }) {
    const searchParams = useSearchParams();
    const [query, setQueryState] = useState(() => searchParams.get("q") ?? "");
    const inputRef = useRef<HTMLInputElement | null>(null);
    const syncTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const pathnameRef = useRef(typeof window !== "undefined" ? window.location.pathname : "/");

    useEffect(() => {
        pathnameRef.current = window.location.pathname;
    });

    const flushSync = useCallback((nextQuery: string) => {
        const url = buildUrl(pathnameRef.current, nextQuery);
        window.history.replaceState(null, "", url);
    }, []);

    const setQuery = useCallback(
        (nextQuery: string) => {
            setQueryState(nextQuery);
            clearTimeout(syncTimer.current);
            syncTimer.current = setTimeout(() => flushSync(nextQuery), SYNC_DEBOUNCE_MS);
        },
        [flushSync]
    );

    useEffect(() => () => clearTimeout(syncTimer.current), []);

    // Keep query in sync with back/forward navigation.
    useEffect(() => {
        const onPopState = () => {
            const params = new URLSearchParams(window.location.search);
            setQueryState(params.get("q") ?? "");
        };
        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, []);

    const focusSearch = useCallback(() => {
        const el = inputRef.current;
        if (el && !el.closest("[inert]")) {
            el.focus();
            return true;
        }
        return false;
    }, []);

    // Global keyboard shortcut: `/` or Cmd/Ctrl+K focuses search.
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const isSlash = event.key === "/";
            const isCmdK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";

            if (!isSlash && !isCmdK) return;

            // event.target is `window` itself for shortcuts fired with no
            // element focused — only real Elements implement closest().
            const target = event.target instanceof Element ? event.target : null;
            const isTyping = target?.closest("input, textarea, [contenteditable]");

            if (isSlash && isTyping) return;
            if (isCmdK) event.preventDefault();

            if (!focusSearch()) {
                window.dispatchEvent(new CustomEvent("axiom:open-search"));
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [focusSearch]);

    const value = useMemo(
        () => ({ query, setQuery, inputRef, focusSearch }),
        [query, setQuery, focusSearch]
    );

    return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch(): SearchContextValue {
    const ctx = useContext(SearchContext);
    if (!ctx) {
        throw new Error("useSearch must be used within a SearchProvider");
    }
    return ctx;
}
