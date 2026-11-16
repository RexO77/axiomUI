// design-system: strict

/*
 * Attributes the shell's first paint needs before React runs, set on <html>
 * by an inline script in the catalog layout:
 *
 *   data-rail="open" | "closed"  the reader's sidebar choice in axiom:v1
 *                                (absent: the responsive default).
 *   data-deep="hidden"           the deep dive is hidden (axiom:deep-dive).
 *   data-reduced                 prefers-reduced-motion, so the strip's first
 *                                layout is already the steady column.
 *
 * The keys and defaults are the stores' (memory.ts, stores.ts, media.ts).
 * Those are client modules, so a server layout cannot import their values;
 * boot-script.test.ts holds the strings equal instead. Every read is guarded:
 * blocked storage or a missing matchMedia leaves the attribute unset, which
 * is the default.
 */

export const BOOT_KEYS = Object.freeze({
  memory: "axiom:v1",
  deepDive: "axiom:deep-dive",
  reducedQuery: "(prefers-reduced-motion: reduce)",
});

export type BootStorage = { getItem(key: string): string | null };
export type BootMatchMedia = (query: string) => { matches: boolean };
export type BootAttributes = Partial<Record<"rail" | "deep" | "reduced", string>>;

function read(storage: BootStorage | null, key: string): string | null {
  try {
    return storage ? storage.getItem(key) : null;
  } catch {
    return null;
  }
}

/** The attributes for this reader, without the `data-` prefix. Pure, for tests. */
export function bootAttributes(storage: BootStorage | null, matchMedia: BootMatchMedia | null): BootAttributes {
  const out: BootAttributes = {};
  try {
    const sidebar = JSON.parse(read(storage, BOOT_KEYS.memory) ?? "null")?.prefs?.sidebarOpen;
    if (sidebar === true) out.rail = "open";
    else if (sidebar === false) out.rail = "closed";
  } catch {
    // Corrupt memory: the responsive default.
  }
  if (read(storage, BOOT_KEYS.deepDive) === "hidden") out.deep = "hidden";
  try {
    if (matchMedia?.(BOOT_KEYS.reducedQuery).matches) out.reduced = "";
  } catch {
    // No matchMedia: motion stays on, as the stores' server snapshot says.
  }
  return out;
}

/**
 * The inline script: the same decisions as `bootAttributes`, in plain ES5 so
 * it runs before any bundle. boot-script.test.ts runs it against the same
 * cases as the function.
 */
export function bootScript(): string {
  const k = JSON.stringify(BOOT_KEYS);
  return (
    `(function(){var k=${k},d=document.documentElement,s=null,m;` +
    `try{s=window.localStorage}catch(e){}` +
    `function g(n){try{return s?s.getItem(n):null}catch(e){return null}}` +
    `try{m=JSON.parse(g(k.memory)||"null");m=m&&m.prefs?m.prefs.sidebarOpen:null;` +
    `if(m===true)d.setAttribute("data-rail","open");else if(m===false)d.setAttribute("data-rail","closed")}catch(e){}` +
    `if(g(k.deepDive)==="hidden")d.setAttribute("data-deep","hidden");` +
    `try{if(window.matchMedia&&window.matchMedia(k.reducedQuery).matches)d.setAttribute("data-reduced","")}catch(e){}` +
    `})();`
  );
}
