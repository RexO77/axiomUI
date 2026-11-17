import { execFileSync } from "node:child_process";

import { expect, test as playwrightTest, type Page } from "@playwright/test";

import { railOrder } from "../src/data/taxonomy";
import { CATALOG_BASE, createRoutes, type RouteOptions } from "../src/lib/navigation/routes";

/*
 * Shared by every spec. Two rules keep the suite independent of where the
 * catalog is mounted and of its markup:
 *
 *  1. URLs come only from the builders below, both the ones a spec visits and
 *     the ones it expects. The catalog's base is the app's own `CATALOG_BASE`;
 *     `E2E_BASE` overrides it, for a build that mounts the catalog elsewhere.
 *  2. DOM hooks come only from `sel` and `readCatalog`. When the wall or the
 *     rule view changes its markup, this file is the one place that learns it.
 */

/** The production server's port. Concurrent runs each need their own `E2E_PORT`. */
export const E2E_PORT = readPort(process.env.E2E_PORT);

function readPort(value: string | undefined): number {
  if (value === undefined || value === "") return 3100;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error(`E2E_PORT must be a port from 1024 to 65535, got ${JSON.stringify(value)}`);
  }
  return port;
}
export const ORIGIN = `http://localhost:${E2E_PORT}`;

/** The catalog's base path: the app's, unless `E2E_BASE` names another. */
export function base(): string {
  return process.env.E2E_BASE ?? CATALOG_BASE;
}

export const routes = () => createRoutes(base());

/** The wall. `hash` is a tile anchor such as `rule-typo-1`. */
export const wallUrl = (options: RouteOptions & { hash?: string } = {}) => routes().galleryHref(options);
export const ruleUrl = (id: string, options: RouteOptions = {}) => routes().ruleHref(id, options);
/** The per-rule deep-dive JSON. It lives at the site root, outside the catalog's base. */
export const proseUrl = (id: string) => `/deep-dives/${encodeURIComponent(id)}`;
/** A well-formed id that is not a rule. */
export const UNKNOWN_RULE = "nope-0";

/** The tile anchor id of a rule on the wall: the hash an exit returns to. */
export const tileId = (id: string) => `rule-${id}`;

/** Wall order is the order J and K page through. */
export const railIds: readonly string[] = railOrder.map((rule) => rule.id);

export const titleOf = (id: string): string => {
  const rule = railOrder.find((entry) => entry.id === id);
  if (!rule) throw new Error(`no rule ${id}`);
  return rule.title;
};

/** The rule `steps` places after `id` in wall order. Throws at either end, so a spec never wraps by accident. */
export function railNeighbour(id: string, steps: number): string {
  const index = railIds.indexOf(id) + steps;
  if (railIds.indexOf(id) < 0 || index < 0 || index >= railIds.length) throw new Error(`no rule ${steps} after ${id}`);
  return railIds[index];
}

/** Every DOM hook the specs use. */
export const sel = {
  shell: ".shell",
  sheet: ".shell-sheet",
  wallLayer: ".shell-wall",
  wall: "[data-wall]",
  tileLink: "a[data-rule-link]",
  tile: (id: string) => `[id="${tileId(id)}"]`,
  ruleTitle: "[data-rule-title]",
  /** The visible exit control of the rule view (the crumb). */
  exit: ".shell-rule .shell-ctl",
  live: '[aria-live="polite"]',
  /** "Category · n of N": the rule's place in the deck it is paged through. */
  position: ".shell-rule header p",
  /** The rail's expand/collapse toggle, and the list it reveals. */
  railToggle: ".shell-rail .rail-button",
  railList: ".shell-rail .rail-list",
  /** The collapsed rail's strip of category marks, where the list is not. */
  railStrip: ".shell-rail .rail-region",
  /** The first grid the wall shows. */
  wallGrid: ".gw-section:not([hidden]) .gw-grid",
} as const;

/** Whether the sheet can be neither focused nor read: a modal makes what is around it inert, the sheet's frame with it. */
export const sheetInert = (page: Page) => page.locator(sel.sheet).evaluate((sheet) => Boolean(sheet.closest("[inert]")));

/** What a spec needs to know about the page, read in one evaluate. */
export type CatalogState = {
  url: string;
  /** Per-document marker: a different value means the document reloaded. */
  doc: string | null;
  historyLength: number;
  axiom: { view: string; depth: number; scroll: { id: string; top: number } | null } | null;
  view: string | null;
  wallMounted: boolean;
  wallHidden: boolean;
  wallScroll: number | null;
  sheetScroll: number;
  title: string | null;
  focus: string;
  live: string;
};

export const readCatalog = (page: Page): Promise<CatalogState> =>
  page.evaluate(
    ({ shell, sheet, wallLayer, wall, ruleTitle, live }) => {
      const layer = document.querySelector<HTMLElement>(wallLayer);
      return {
        url: location.pathname + location.search + location.hash,
        doc: (window as unknown as { __doc?: string }).__doc ?? null,
        historyLength: history.length,
        axiom: history.state?.axiom ?? null,
        view: document.querySelector(shell)?.getAttribute("data-view") ?? null,
        wallMounted: Boolean(document.querySelector(wall)),
        wallHidden: Boolean(layer?.hasAttribute("data-hidden")),
        wallScroll: layer ? Math.round(layer.scrollTop) : null,
        sheetScroll: Math.round(document.querySelector(sheet)?.scrollTop ?? -1),
        title: document.querySelector(ruleTitle)?.textContent ?? null,
        focus: document.activeElement?.id || document.activeElement?.tagName || "",
        live: document.querySelector(live)?.textContent ?? "",
      };
    },
    { shell: sel.shell, sheet: sel.sheet, wallLayer: sel.wallLayer, wall: sel.wall, ruleTitle: sel.ruleTitle, live: sel.live },
  );

/**
 * Traffic that proves a document or the router went to the network. Static
 * assets, fonts and the root layout's Vercel-only scripts are not navigation.
 */
export type Traffic = { all: () => string[]; documents: () => string[]; router: () => string[]; reset: () => void };

export function trackTraffic(page: Page): Traffic {
  let seen: { url: string; document: boolean; router: boolean }[] = [];
  page.on("request", (request) => {
    const { pathname, search } = new URL(request.url());
    if (pathname.startsWith("/_next/static/") || pathname.startsWith("/_vercel/")) return;
    const type = request.resourceType();
    seen.push({
      url: `${request.method()} ${type} ${pathname}${search}`,
      document: request.isNavigationRequest() || type === "document",
      router: type === "fetch" || type === "xhr" || "rsc" in request.headers(),
    });
  });
  return {
    all: () => seen.map((entry) => entry.url),
    documents: () => seen.filter((entry) => entry.document).map((entry) => entry.url),
    router: () => seen.filter((entry) => entry.router).map((entry) => entry.url),
    reset: () => {
      seen = [];
    },
  };
}

/** Page errors and console errors, minus the Vercel-only scripts that 404 outside Vercel (plain `/` logs them too). */
export function trackErrors(page: Page): () => string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() !== "error" && message.type() !== "warning") return;
    if (message.location().url.includes("/_vercel/")) return;
    errors.push(`${message.type()}: ${message.text().slice(0, 200)}`);
  });
  return () => errors;
}

/**
 * When macOS last went to sleep, or null on other hosts. A Mac that sleeps
 * mid-test (a closed lid, or idle sleep on battery) makes no frames in its dark
 * wakes, so a view transition never ends and the test fails on a wait that says
 * nothing about the app. Node's clock runs on through the sleep, so only the
 * kernel can tell.
 */
function lastSleep(): string | null {
  if (process.platform !== "darwin") return null;
  try {
    return execFileSync("sysctl", ["-n", "kern.sleeptime"], { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

/**
 * `test`, plus two automatic checks: the host stayed awake for the whole test,
 * and the spec left no page error or console error behind.
 */
export const test = playwrightTest.extend<{ awake: void; errors: () => string[] }>({
  awake: [
    async ({}, use) => {
      const before = lastSleep();
      await use();
      const after = lastSleep();
      if (before !== after) {
        throw new Error(`The host went to sleep during this test (kern.sleeptime ${after}). The result says nothing about the app; rerun with the machine awake.`);
      }
    },
    { auto: true },
  ],
  errors: [
    async ({ page }, use) => {
      const errors = trackErrors(page);
      await use(errors);
      expect(errors(), "page and console errors").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/**
 * Open a catalog URL and wait until it is interactive: hydrated, and the load
 * stamp (one task after mount) has written `history.state.axiom`. Each
 * document gets a random marker; if it changes, the document reloaded.
 */
export async function openCatalog(page: Page, url: string): Promise<void> {
  await page.addInitScript(() => {
    (window as unknown as { __doc: string }).__doc = Math.random().toString(36).slice(2);
  });
  await page.goto(url);
  await awaitInteractive(page);
}

/**
 * After a reload or a first load: hydrated and stamped. The shell sets
 * `data-input` in the same effect flush that queues the load stamp (a
 * zero-delay timer), so one more task is enough for the stamp to have run.
 */
export async function awaitInteractive(page: Page): Promise<void> {
  await page.waitForFunction(() => document.documentElement.dataset.input !== undefined && history.state?.axiom != null);
  await page.evaluate(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));
}

/** The address bar, as path, search and hash. */
export const currentLocation = (page: Page): Promise<string> =>
  page.evaluate(() => location.pathname + location.search + location.hash);

/** Wait for the address bar to reach `url`. */
export async function awaitUrl(page: Page, url: string): Promise<void> {
  await expect.poll(() => currentLocation(page), { message: `address bar reaches ${url}` }).toBe(url);
}

/**
 * The view has changed and its morph has ended (`data-vt` is on `<html>` only
 * while one runs). A morph lasts 360 ms; a loaded host gets 10 s.
 */
export async function awaitView(page: Page, view: "gallery" | "rule"): Promise<void> {
  await expect(page.locator(sel.shell)).toHaveAttribute("data-view", view);
  await expect(page.locator("html"), "the morph ended").not.toHaveAttribute("data-vt", /.+/, { timeout: 10_000 });
}

/**
 * The address after it stops moving: unchanged for `quiet` ms, or `limit`.
 * Next commits a restore of its own after each history write, so "settles"
 * means this, not "right after the call". The runner polls with one short read
 * at a time, so a page that stops answering fails here within `limit` + 5 s
 * rather than inside one long in-page wait.
 */
export async function settledUrl(page: Page, quiet = 300, limit = 4000): Promise<string> {
  let last = await currentLocation(page);
  const start = performance.now();
  let since = start;
  await expect
    .poll(
      async () => {
        const current = await currentLocation(page);
        const now = performance.now();
        if (current !== last) {
          last = current;
          since = now;
        }
        return now - since >= quiet || now - start >= limit;
      },
      { message: `the address settles (quiet ${quiet} ms, at most ${limit} ms)`, intervals: [25], timeout: limit + 5_000 },
    )
    .toBe(true);
  return last;
}

/** A scroll position once it has stopped changing (a smooth scroll may still be running). */
export function settledScroll(page: Page, selector: string, quiet = 150, limit = 3000): Promise<number> {
  return page.evaluate(
    ({ selector, quiet, limit }) =>
      new Promise<number>((resolve) => {
        const el = document.querySelector<HTMLElement>(selector);
        if (!el) return resolve(-1);
        let last = Math.round(el.scrollTop);
        let since = performance.now();
        const start = since;
        const timer = window.setInterval(() => {
          const now = Math.round(el.scrollTop);
          const t = performance.now();
          if (now !== last) {
            last = now;
            since = t;
          }
          if (t - since >= quiet || t - start >= limit) {
            window.clearInterval(timer);
            resolve(now);
          }
        }, 25);
      }),
    { selector, quiet, limit },
  );
}

/** Wait for the sheet's saved reading position (debounced), and return it. */
export async function savedScroll(page: Page, id: string): Promise<number> {
  await expect
    .poll(async () => (await readCatalog(page)).axiom?.scroll?.id ?? null, { message: `reading position saved for ${id}` })
    .toBe(id);
  return (await readCatalog(page)).axiom?.scroll?.top ?? -1;
}
