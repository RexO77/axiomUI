import { resolveRuleId } from "@/data/ui-logic";

export type ShellView = "gallery" | "rule";
export type GallerySide = "do" | "dont";

export type RouteOptions = {
  q?: string;
  show?: GallerySide;
  collection?: string | null;
};

export type CatalogLocation = {
  view: ShellView;
  ruleId: string | null;
  q: string;
  show: GallerySide;
  collection: string | null;
};

/** The shape `?rule=` must have. The server redirect matches the same pattern. */
const RULE_PARAM = /^[a-z][a-z0-9]*-\d+$/;

/** "", "/", "docs", "/docs/" → "" or "/docs". Never a trailing slash. */
function normaliseBase(base: string): string {
  const parts = base.split("/").filter(Boolean);
  return parts.length ? `/${parts.join("/")}` : "";
}

function queryString({ q, show, collection }: RouteOptions): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (show === "dont") params.set("show", show);
  if (collection) params.set("collection", collection);
  const query = params.toString();
  return query ? `?${query}` : "";
}

function decode(segment: string): string | null {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
}

/**
 * The one place the catalog's base path lives. Bind it once in CatalogApp:
 * `createRoutes(CATALOG_BASE)`. The base is joined, never string-replaced, so
 * an empty base still gives a URL that starts with `/`, and a base such as
 * `/docs` prefixes every path.
 */
export function createRoutes(base = "") {
  const root = normaliseBase(base);

  /** The wall. Always a non-empty, same-origin path: `/`, `/docs`, `/?q=x#rule-a-1`. */
  function galleryHref(options: RouteOptions & { hash?: string } = {}): string {
    const hash = options.hash ? `#${encodeURIComponent(options.hash.replace(/^#/, ""))}` : "";
    return `${root || "/"}${queryString(options)}${hash}`;
  }

  function ruleHref(id: string, options: RouteOptions = {}): string {
    return `${root}/rules/${encodeURIComponent(id)}${queryString(options)}`;
  }

  /**
   * Read a location. Aliases (`sys-12`) resolve to their rule. At the wall, a
   * legacy `?rule=` opens that rule: the last value wins, as in the server
   * redirect, and an empty or malformed value is ignored. `?rule=` anywhere
   * else is ignored. Unknown ids are left for the route's not-found boundary.
   */
  function parseLocation(pathname: string, search: string | URLSearchParams = ""): CatalogLocation {
    const params = new URLSearchParams(search);
    const inside = !root || pathname === root || pathname.startsWith(`${root}/`);
    const local = inside ? pathname.slice(root.length).replace(/\/+$/, "") || "/" : null;
    const match = local ? /^\/rules\/([^/]+)$/.exec(local) : null;
    let ruleId: string | null = null;
    if (match) {
      ruleId = decode(match[1]);
    } else if (local === "/") {
      const last = params.getAll("rule").at(-1) ?? "";
      ruleId = RULE_PARAM.test(last) ? last : null;
    }
    ruleId = ruleId ? resolveRuleId(ruleId) : null;
    return {
      view: ruleId ? "rule" : "gallery",
      ruleId,
      q: params.get("q") ?? "",
      show: params.get("show") === "dont" ? "dont" : "do",
      collection: params.get("collection") || null,
    };
  }

  return { base: root, galleryHref, ruleHref, parseLocation };
}

export type CatalogRoutes = ReturnType<typeof createRoutes>;

/**
 * Where the live catalog is mounted: `""` is the site root. Every catalog
 * route, link and test URL is built from it, so moving the catalog is this
 * one line.
 */
export const CATALOG_BASE = "";

/** The live catalog's routes. */
export const routes: CatalogRoutes = createRoutes(CATALOG_BASE);
