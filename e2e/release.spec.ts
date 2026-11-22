import { showcaseSpecs } from "../src/components/features/rules/demos/showcase-specs";
import { categories, ruleAliases, rules, type Rule } from "../src/data/ui-logic";
import { railCategories, railCategory, railCategoryOf } from "../src/data/taxonomy";
import { ruleProse } from "../src/lib/rule-prose-build";
import { PROSE_HEADINGS } from "../src/lib/rule-prose-types";
import { absoluteUrl, siteConfig } from "../src/lib/site";
import {
  UNKNOWN_RULE,
  awaitInteractive,
  awaitUrl,
  awaitView,
  expect,
  openCatalog,
  proseUrl,
  readCatalog,
  ruleUrl,
  sel,
  settledUrl,
  test,
  tileId,
  wallUrl,
} from "./helpers";

/*
 * The live catalog as a crawler and a first-time visitor meet it: the
 * homepage is the wall and every rule has its own prerendered page, with the
 * same canonical URLs, social cards, structured data, legacy links and text
 * endpoints the site has always published.
 */

/** The entities React writes into text and attributes. */
const decode = (text: string) =>
  text
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

/** Visible text of a document: scripts and tags removed, entities decoded. */
const textOf = (html: string) => decode(html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, ""));

const withoutScripts = (html: string) => html.replace(/<script[\s\S]*?<\/script>/g, "");

/** Every tag of one name, as attribute maps. */
function tags(html: string, name: string): Record<string, string>[] {
  return [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, "g"))].map(([, attrs]) =>
    Object.fromEntries([...attrs.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, decode(value)])),
  );
}

/** The content of `<meta property|name="key">`; every match, so a duplicate shows. */
const metaAll = (html: string, key: string) =>
  tags(html, "meta").filter((attrs) => attrs.property === key || attrs.name === key).map((attrs) => attrs.content);

const canonicalOf = (html: string) => tags(html, "link").filter((attrs) => attrs.rel === "canonical").map((attrs) => attrs.href);

const jsonLd = (html: string): Record<string, unknown>[] =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(([, json]) => JSON.parse(json));

/** The text of every `<h1>`. */
const h1s = (html: string) => [...withoutScripts(html).matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map(([, inner]) => textOf(inner));

/** Wall tiles only: the toolbar's "continue" link to the last rule read shares the hook. */
const TILE_LINK = 'a[data-rule-link][id^="rule-"]';

/**
 * The text under a rule's comparison: the rule's own Do and Don't for every
 * rule, and for a motion rule the narration of what each side plays as well.
 */
function captionsOf(rule: Rule): string[] {
  const spec = showcaseSpecs[rule.id];
  return spec ? [rule.do, rule.dont, spec.do.caption, spec.dont.caption] : [rule.do, rule.dont];
}

/** A PNG's pixel size, read from its IHDR chunk. */
function pngSize(bytes: Buffer): { width: number; height: number } {
  expect(bytes.subarray(0, 8).toString("hex"), "PNG signature").toBe("89504e470d0a1a0a");
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

const shown = (text: string) => text.replace(/`/g, "");

test.describe("the homepage", () => {
  test("is the wall in the HTML: one h1, a heading per category and a link to every rule, with no rule view", async ({ request }) => {
    const response = await request.get(wallUrl());
    expect(response.status()).toBe(200);
    const html = withoutScripts(await response.text());

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html.match(/<h2\b/g)).toHaveLength(railCategories.length);
    for (const category of railCategories) {
      expect(html, category.id).toContain(`id="${category.id}-heading"`);
    }
    const links = tags(html, "a").filter((attrs) => "data-rule-link" in attrs && attrs.id?.startsWith("rule-"));
    const hrefs = new Set(links.map((attrs) => attrs.href));
    expect(hrefs.size).toBe(rules.length);
    for (const rule of rules) expect(hrefs.has(ruleUrl(rule.id)), rule.id).toBe(true);
    expect(html, "no rule view on the wall").not.toContain("data-rule-title");
    expect(html, "no deep dive on the wall").not.toContain("rv-dd");
  });

  test("keeps its canonical URL, social card and site-wide structured data", async ({ request }) => {
    const html = await (await request.get(wallUrl())).text();
    // Next writes the root canonical without a trailing slash, as it always has.
    expect(canonicalOf(html)).toEqual([siteConfig.origin]);
    expect(metaAll(html, "og:image")).toHaveLength(1);
    expect(metaAll(html, "og:image")[0]).toMatch(/^https:\/\/[^/]+\/opengraph-image/);
    const graph = jsonLd(html).flatMap((block) => (block["@graph"] as Record<string, unknown>[] | undefined) ?? [block]);
    expect(graph.map((node) => node["@type"])).toEqual(expect.arrayContaining(["WebSite", "Organization", "Person", "CollectionPage"]));
  });

  test("renders the wall with every tile, and no page or console error", async ({ page }) => {
    await openCatalog(page, wallUrl());
    await awaitView(page, "gallery");
    await expect(page.locator(TILE_LINK)).toHaveCount(rules.length);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("All rules");
  });

  test("/#forms lands on the Forms section", async ({ page }) => {
    await openCatalog(page, wallUrl({ hash: "forms" }));
    const top = await page.locator("section#forms h2").evaluate((h2) => h2.getBoundingClientRect().top);
    expect(top).toBeGreaterThan(0);
    expect(top).toBeLessThan(200);
  });

  test("every category anchor the rule pages' breadcrumbs publish resolves on the wall", async ({ page }) => {
    for (const category of categories) {
      // A new document each time: a hash-only goto would stay in this one.
      await page.goto("about:blank");
      await openCatalog(page, wallUrl({ hash: category.id }));
      if (railCategories.some((rail) => rail.id === category.id)) {
        await expect(page.locator(`section#${category.id} h2`), category.id).toBeInViewport();
      } else {
        // A category with no section of its own opens as a collection.
        await awaitUrl(page, wallUrl({ collection: category.id }));
      }
    }
  });
});

test.describe("the rule pages", () => {
  test("every rule is prerendered with its title, its Do and Don't, its captions and its deep dive, and no wall", async ({ request }) => {
    test.setTimeout(120_000);
    for (const rule of rules) {
      const response = await request.get(ruleUrl(rule.id), { maxRedirects: 0 });
      expect(response.status(), rule.id).toBe(200);
      const html = await response.text();
      const text = textOf(html);
      expect(h1s(html), rule.id).toEqual([rule.title]);
      for (const caption of captionsOf(rule)) expect(text, `${rule.id} caption`).toContain(caption);
      for (const heading of Object.values(PROSE_HEADINGS)) expect(text, `${rule.id} ${heading}`).toContain(heading);
      expect(text, `${rule.id} why`).toContain(shown(ruleProse(rule.id)!.why));
      expect(html, `${rule.id} wall`).not.toContain("data-wall");
      expect(html, `${rule.id} tiles`).not.toContain("data-rule-link");
    }
  });

  test("every rule keeps its canonical URL, social card and structured data", async ({ request }) => {
    test.setTimeout(120_000);
    for (const rule of rules) {
      const html = await (await request.get(ruleUrl(rule.id))).text();
      const url = absoluteUrl(`/rules/${rule.id}`);
      const image = absoluteUrl(`/rules/${rule.id}/opengraph-image`);

      expect(canonicalOf(html), rule.id).toEqual([url]);
      expect(metaAll(html, "og:url"), rule.id).toEqual([url]);
      expect(metaAll(html, "og:type"), rule.id).toEqual(["article"]);
      expect(metaAll(html, "og:image"), rule.id).toEqual([image]);
      expect(metaAll(html, "og:image:width"), rule.id).toEqual(["1200"]);
      expect(metaAll(html, "og:image:height"), rule.id).toEqual(["630"]);
      expect(metaAll(html, "twitter:image"), rule.id).toEqual([image]);
      expect(metaAll(html, "twitter:card"), rule.id).toEqual(["summary_large_image"]);
      expect(metaAll(html, "description"), rule.id).toEqual([rule.desc]);
      expect([...html.matchAll(/<title>([^<]*)<\/title>/g)].map(([, title]) => decode(title)), rule.id).toEqual([`${rule.title} · Axiom UI`]);

      const blocks = jsonLd(html);
      // The category is the rail's, as the page's header and the social card name it.
      const category = railCategory(railCategoryOf(rule));
      const article = blocks.find((block) => block["@type"] === "TechArticle");
      expect(article, rule.id).toMatchObject({ headline: rule.title, url, about: { name: category.name } });
      const crumbs = blocks.find((block) => block["@type"] === "BreadcrumbList")?.itemListElement as { name: string; item: string }[];
      expect(crumbs.map((crumb) => [crumb.name, crumb.item]), rule.id).toEqual([
        ["All rules", absoluteUrl("/")],
        [category.name, absoluteUrl(`/#${category.id}`)],
        [rule.title, url],
      ]);
    }
  });

  test("every social card is a 1200 × 630 PNG", async ({ request }) => {
    test.setTimeout(180_000);
    for (const rule of rules) {
      const response = await request.get(`/rules/${rule.id}/opengraph-image`);
      expect(response.status(), rule.id).toBe(200);
      expect(response.headers()["content-type"], rule.id).toBe("image/png");
      expect(pngSize(await response.body()), rule.id).toEqual({ width: 1200, height: 630 });
    }
  });

  test("a retired rule's page and social card redirect to the rule that absorbed it", async ({ request }) => {
    for (const [from, to] of Object.entries(ruleAliases)) {
      for (const suffix of ["", "/opengraph-image"]) {
        const response = await request.get(`/rules/${from}${suffix}`, { maxRedirects: 0 });
        expect(response.status(), `${from}${suffix}`).toBe(308);
        expect(response.headers().location, `${from}${suffix}`).toBe(`/rules/${to}${suffix}`);
      }
      const card = await request.get(`/rules/${from}/opengraph-image`);
      expect(pngSize(await card.body())).toEqual({ width: 1200, height: 630 });
    }
  });

  test("every rule's deep dive is served as JSON for the rule view to fetch", async ({ request }) => {
    for (const rule of rules) {
      const response = await request.get(proseUrl(rule.id), { maxRedirects: 0 });
      expect(response.status(), rule.id).toBe(200);
      expect(response.headers()["content-type"], rule.id).toMatch(/^application\/json/);
      expect(((await response.json()) as { id: string }).id, rule.id).toBe(rule.id);
    }
  });

  test("an unknown rule is a 404 with no catalog in it", async ({ request }) => {
    for (const url of [ruleUrl(UNKNOWN_RULE), proseUrl(UNKNOWN_RULE)]) {
      const response = await request.get(url, { maxRedirects: 0 });
      expect(response.status(), url).toBe(404);
      const body = await response.text();
      expect(body, url).not.toContain("data-wall");
      expect(body, url).not.toContain("data-rule-title");
    }
  });

  test("a direct load, then Esc, fills the wall; a reload after it shows one rule view", async ({ page }) => {
    const id = "typo-1";
    await openCatalog(page, ruleUrl(id));
    await expect(page.locator(".rv-dd")).toHaveCount(1);
    await page.keyboard.press("Escape");
    await expect(page.locator(sel.wall)).toBeVisible();
    await awaitView(page, "gallery");
    await awaitUrl(page, wallUrl({ hash: tileId(id) }));
    await expect(page.locator(TILE_LINK)).toHaveCount(rules.length);
    await expect(page.locator(".rv-dd"), "the landing rule's deep dive left with it").toHaveCount(0);

    await page.reload();
    await awaitInteractive(page);
    await expect(page.locator(TILE_LINK)).toHaveCount(rules.length);
    await page.locator(sel.tile(id)).click();
    await awaitView(page, "rule");
    await expect(page.locator(sel.ruleTitle)).toHaveCount(1);
    await expect(page.locator(".rv-dd")).toHaveCount(1);
  });
});

test.describe("legacy ?rule= links", () => {
  test("redirect permanently to the rule page", async ({ request }) => {
    const response = await request.get("/?rule=motion-3&q=x", { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toMatch(/^\/rules\/motion-3\?/);
  });

  test("leave a clean address bar once the catalog has loaded", async ({ page }) => {
    await openCatalog(page, "/?rule=motion-3&q=x");
    await awaitView(page, "rule");
    const url = new URL(await settledUrl(page), "http://localhost");
    expect(url.pathname).toBe(ruleUrl("motion-3"));
    expect(url.searchParams.has("rule")).toBe(false);
    expect((await readCatalog(page)).title).toBe(rules.find((rule) => rule.id === "motion-3")!.title);
  });

  test("take the last value when rule repeats", async ({ page, request }) => {
    // Both ids are real rules, so only "last wins" can pick motion-7.
    const response = await request.get("/?rule=typo-1&rule=motion-7", { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toMatch(/^\/rules\/motion-7\?/);
    await openCatalog(page, "/?rule=typo-1&rule=motion-7");
    await awaitView(page, "rule");
    expect(new URL(await settledUrl(page), "http://localhost").pathname).toBe(ruleUrl("motion-7"));
  });

  test("serve the homepage for an empty or malformed id", async ({ request }) => {
    for (const search of ["?rule=", "?rule=Motion-3", "?rule=motion-3x", "?rule=../x"]) {
      const response = await request.get(`/${search}`, { maxRedirects: 0 });
      expect(response.status(), search).toBe(200);
    }
  });

  test("reach a retired rule through its redirect", async ({ request }) => {
    const first = await request.get("/?rule=sys-12", { maxRedirects: 0 });
    expect(first.status()).toBe(308);
    expect(first.headers().location).toMatch(/^\/rules\/sys-12\?/);
    const landed = await request.get("/?rule=sys-12");
    expect(landed.url()).toContain("/rules/motion-3");
  });
});

test.describe("the text endpoints", () => {
  test("the sitemap lists the homepage and every rule, once each", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const locs = [...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc);
    expect(locs).toHaveLength(rules.length + 1);
    expect(new Set(locs).size).toBe(locs.length);
    expect(locs).toEqual([absoluteUrl("/"), ...rules.map((rule) => absoluteUrl(`/rules/${rule.id}`))]);
  });

  test("robots.txt allows crawling and names the sitemap", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("User-agent: *\nAllow: /");
    expect(body).toContain(`Sitemap: ${absoluteUrl("/sitemap.xml")}`);
  });

  test("llms.txt links every rule exactly once, and no category anchor", async ({ request }) => {
    const response = await request.get("/llms.txt");
    expect(response.status()).toBe(200);
    const body = await response.text();
    for (const rule of rules) {
      expect(body.split(`(${absoluteUrl(`/rules/${rule.id}`)})`).length - 1, rule.id).toBe(1);
    }
    expect(body).not.toMatch(/\/#[a-z]/);
  });

  test("llms-full.txt carries every rule's URL and reasoning", async ({ request }) => {
    const response = await request.get("/llms-full.txt");
    expect(response.status()).toBe(200);
    const body = await response.text();
    for (const rule of rules) {
      expect(body.split(`URL: ${absoluteUrl(`/rules/${rule.id}`)}\n`).length - 1, rule.id).toBe(1);
    }
    expect(body.match(/^#### Why it works$/gm)).toHaveLength(rules.length);
  });

  test("rules.json lists every rule with its canonical URL", async ({ request }) => {
    const response = await request.get("/rules.json");
    expect(response.status()).toBe(200);
    const payload = (await response.json()) as { count: number; categories: unknown[]; rules: { id: string; url: string }[] };
    expect(payload.count).toBe(rules.length);
    expect(payload.categories).toHaveLength(categories.length);
    expect(payload.rules.map((rule) => [rule.id, rule.url])).toEqual(rules.map((rule) => [rule.id, absoluteUrl(`/rules/${rule.id}`)]));
  });
});
