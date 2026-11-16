import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { proseUrl, railIds, routes, ruleUrl, UNKNOWN_RULE, wallUrl } from "./helpers";

/*
 * Staging fails closed. The guard build is made with
 * VERCEL_ENV and AXIOM_STAGING both cleared (`npm run e2e:guard`; the runner
 * config refuses to start otherwise). Clearing only the flag would still
 * enable staging on a preview host.
 *
 * In the guard build every staging URL answers a real 404 with nothing of the
 * catalog in the body, and no staging page is prerendered. The e2e build runs
 * the same requests as controls, so each 404 here is the guard's, not a route
 * that is missing anyway.
 */

const guard = process.env.E2E_GUARD === "1";
const rule = railIds[0];

const staging = [
  { name: "the gallery", url: wallUrl() },
  { name: "the gallery with a query", url: wallUrl({ q: "x" }) },
  { name: "a staging rule", url: ruleUrl(rule) },
  { name: "a staging rule with a collection", url: ruleUrl("a11y-1", { collection: "accessibility" }) },
] as const;

/** The build under test: what `next build` prerendered, and which app routes it has. */
function build(rootDir: string) {
  const read = (file: string) => JSON.parse(readFileSync(path.resolve(rootDir, "..", ".next", file), "utf8"));
  const prerendered = Object.keys(read("prerender-manifest.json").routes as Record<string, unknown>);
  const appRoutes = Object.keys(read("app-path-routes-manifest.json") as Record<string, string>);
  return {
    stagingPages: prerendered.filter((route) => route === "/staging" || route.startsWith("/staging/")),
    hasDeepDives: appRoutes.some((route) => route.startsWith("/deep-dives/")),
  };
}

test.describe(guard ? "staging is off" : "staging is on (controls for the guard build)", () => {
  for (const { name, url } of staging) {
    test(`${name} ${guard ? "returns 404 and no catalog markup" : "is served"}`, async ({ request }) => {
      const response = await request.get(url, { maxRedirects: 0 });
      expect(response.status(), url).toBe(guard ? 404 : 200);
      const body = await response.text();
      if (guard) {
        expect(body, "no wall tiles").not.toContain("data-rule-link");
        expect(body, "no wall").not.toContain("data-wall");
        // No link into the staging catalog survives in the document, in the HTML or in the router payload.
        expect(body).not.toContain(`href="${routes().ruleHref(rule)}"`);
      } else {
        // The gallery carries the wall; a rule carries the app shell (its wall arrives on Esc).
        expect(body).toContain(url.includes("/rules/") ? 'class="shell' : "data-wall");
      }
    });
  }

  test(`the wall's link count is ${guard ? "zero" : "every rule"}`, async ({ page }) => {
    await page.goto(wallUrl());
    await expect(page.locator("a[data-rule-link]")).toHaveCount(guard ? 0 : railIds.length);
  });

  test(`${guard ? "no" : "every"} staging rule page is prerendered`, () => {
    // The gate on generateStaticParams: without it the layout still 404s, but 105 pages of not-found UI ship.
    const { stagingPages } = build(test.info().config.rootDir);
    const rulePages = stagingPages.filter((route) => route.startsWith("/staging/rules/"));
    expect(rulePages).toHaveLength(guard ? 0 : railIds.length);
  });

  test(`the deep-dive JSON ${guard ? "returns 404" : "is served"}`, async ({ request }) => {
    // Skip builds that do not contain the deep-dive route.
    test.skip(!build(test.info().config.rootDir).hasDeepDives, "no /deep-dives route in this build");
    const response = await request.get(proseUrl(rule), { maxRedirects: 0 });
    expect(response.status()).toBe(guard ? 404 : 200);
  });

  test("the production catalog is unaffected", async ({ request }) => {
    expect((await request.get("/")).status()).toBe(200);
    expect((await request.get("/rules/typo-1")).status()).toBe(200);
  });
});

test.describe("unknown ids", () => {
  test.skip(guard, "covered by the staging-on build, where the route exists");

  test("an unknown staging rule is a 404 even with staging on", async ({ request }) => {
    const response = await request.get(ruleUrl(UNKNOWN_RULE), { maxRedirects: 0 });
    expect(response.status()).toBe(404);
    expect(await response.text()).not.toContain("data-wall");
  });
});
