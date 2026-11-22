import type { Browser, Page } from "@playwright/test";

import { accessibilityCollection, keyboardCollection } from "../src/data/taxonomy";
import { rules } from "../src/data/ui-logic";

import { awaitUrl, awaitView, expect, openCatalog, ORIGIN, railIds, railNeighbour, routes, ruleUrl, sel, settledUrl, test, wallUrl } from "./helpers";

/*
 * The gallery wall: the Do/Don't side, the search and collection filters, J/K
 * over what the filter leaves, the motion tiles and Continue. URLs come from
 * the builders in helpers.ts; wall hooks are the gallery's own classes.
 */

const wall = {
  tile: (id: string) => sel.tile(id),
  frame: (id: string) => `${sel.tile(id)} [data-tile-frame]`,
  badge: (id: string) => `${sel.tile(id)} .gw-verdict`,
  marker: (id: string) => `${sel.tile(id)} .gw-marker`,
  search: ".gw-search input",
  capsule: ".gw-capsule",
  continue: ".gw-continue",
};

/** Tiles a reader can see, in wall order: inside no `[hidden]` gate or section. */
const visibleTiles = (page: Page) =>
  page.evaluate((tile) => [...document.querySelectorAll<HTMLElement>(tile)].filter((el) => !el.closest("[hidden]")).map((el) => el.dataset.rule ?? ""), sel.tileLink);

const focused = (page: Page) => page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.rule ?? null);
const side = (page: Page) => page.evaluate(() => document.documentElement.dataset.side ?? null);
const playing = (page: Page, id: string) => page.locator(wall.frame(id)).evaluate((frame) => frame.hasAttribute("data-playing"));
/** Count every playback a tile starts from now on: one may last only a few hundred ms. */
async function countPlays(page: Page, id: string): Promise<() => Promise<number>> {
  await page.locator(wall.frame(id)).evaluate((frame) => {
    const host = frame as HTMLElement & { plays?: number };
    host.plays = 0;
    new MutationObserver(() => {
      if (frame.hasAttribute("data-playing")) host.plays! += 1;
    }).observe(frame, { attributes: true, attributeFilter: ["data-playing"] });
  });
  return () => page.locator(wall.frame(id)).evaluate((frame) => (frame as HTMLElement & { plays?: number }).plays ?? 0);
}
/** Running animations once the load's own transitions (the toolbar's hairline after a fragment scroll) are done. */
const settledRunning = (page: Page) =>
  expect.poll(() => page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length), { timeout: 2_000 });

const BORDER = ["layout-7", "a11y-2", "color-6", "color-12", "comp-3", "motion-8"];
/** A motion rule whose tile replays (an action showcase). */
const MOTION = "motion-1";

test.describe("Do and Don't", () => {
  test("D paints the other side within 100 ms, and a tap is a choice the URL keeps", async ({ page }) => {
    await openCatalog(page, wallUrl());
    expect(await side(page)).toBe("do");
    await expect(page.locator(wall.badge("typo-1"))).toBeHidden();
    // Clock the press inside the page: keydown to the first frame that shows the badge.
    const probe = await page.evaluateHandle(
      (badge) => ({
        painted: new Promise<number>((resolve) => {
          document.addEventListener(
            "keydown",
            () => {
              const start = performance.now();
              const check = () => (getComputedStyle(document.querySelector(badge)!).display !== "none" ? resolve(performance.now() - start) : requestAnimationFrame(check));
              requestAnimationFrame(check);
            },
            { capture: true, once: true },
          );
        }),
      }),
      wall.badge("typo-1"),
    );
    await page.keyboard.press("d");
    expect(await probe.evaluate(({ painted }) => painted)).toBeLessThan(100);
    expect(await side(page)).toBe("dont");
    await awaitUrl(page, wallUrl({ show: "dont" }));
    await expect(page.getByRole("radio", { name: "Don’t" })).toHaveAttribute("aria-checked", "true");
  });

  test("holding D shows the other side only until release", async ({ page }) => {
    await openCatalog(page, wallUrl());
    await page.keyboard.down("d");
    expect(await side(page)).toBe("dont");
    await page.waitForTimeout(400);
    await page.keyboard.up("d");
    expect(await side(page)).toBe("do");
    await expect.poll(() => page.evaluate(() => location.search)).toBe("");
  });

  test("a ?show=dont link paints Don't rings and badges before any bundle runs", async ({ page }) => {
    // Every script the build ships comes back empty: only the inline boot script runs.
    await page.route(/\/_next\/static\/chunks\/.+\.js(?:\?|$)/, (route) => route.fulfill({ contentType: "application/javascript", body: "" }));
    await page.goto(wallUrl({ show: "dont" }));
    await expect(page.getByRole("radio", { name: "Don’t", checked: true })).toBeVisible();
    expect(await side(page)).toBe("dont");
    await expect(page.locator(wall.badge("typo-1"))).toBeVisible();
    await expect(page.locator(`${sel.tile("typo-1")} .gw-fit[data-v="dont"]`)).toBeVisible();
    await expect(page.locator(`${sel.tile("typo-1")} .gw-fit[data-v="do"]`)).toBeHidden();
    const ring = await page.locator(wall.frame("typo-1")).evaluate((frame) => getComputedStyle(frame, "::after").boxShadow);
    const plain = await page.evaluate(() => {
      document.documentElement.dataset.side = "do";
      return getComputedStyle(document.querySelector("[data-tile-frame]")!, "::after").boxShadow;
    });
    expect(ring).not.toBe(plain);
  });

  test("the selection slides on pointer input and snaps on keyboard and reduced motion", async ({ page }) => {
    await openCatalog(page, wallUrl());
    const group = page.getByRole("radiogroup", { name: "Show Do or Don’t examples" });
    const dont = group.getByRole("radio", { name: "Don’t" });
    const transitions = () => group.evaluate((track) => track.getAnimations({ subtree: true })
      .filter((animation): animation is CSSTransition => animation instanceof CSSTransition)
      .map((animation) => animation.transitionProperty));
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Animation.enable");
    await cdp.send("Animation.setPlaybackRate", { playbackRate: 0.1 });

    expect(await transitions()).toEqual([]);
    await dont.click();
    expect(await transitions()).toEqual(expect.arrayContaining(["left", "color"]));
    await dont.press("Home");
    await expect(group.getByRole("radio", { name: "Do", exact: true })).toBeChecked();
    expect(await transitions()).toEqual([]);

    await page.emulateMedia({ reducedMotion: "reduce" });
    await dont.click();
    await expect(dont).toBeChecked();
    expect(await transitions()).toEqual([]);
  });

  test("the pill follows its radio in RTL when a sibling grows", async ({ page }) => {
    await openCatalog(page, wallUrl({ show: "dont" }));
    const group = page.getByRole("radiogroup", { name: "Show Do or Don’t examples" });
    await group.evaluate((track) => track.setAttribute("dir", "rtl"));
    await group.getByRole("radio", { name: "Do", exact: true }).evaluate((radio) => {
      radio.style.minWidth = "140px";
    });
    await expect.poll(() => group.evaluate((track) => {
      const radio = track.querySelector('[aria-checked="true"]')!.getBoundingClientRect();
      const pill = getComputedStyle(track, "::before");
      return Math.abs(track.getBoundingClientRect().right - parseFloat(pill.right) - radio.right)
        + Math.abs(parseFloat(pill.width) - radio.width);
    })).toBeLessThan(0.1);
  });

  test("the phone capsule switches the side", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, baseURL: ORIGIN });
    const page = await context.newPage();
    await openCatalog(page, wallUrl());
    const capsule = page.locator(wall.capsule);
    await expect(capsule).toBeVisible();
    await capsule.getByRole("radio", { name: "Don’t" }).tap();
    expect(await side(page)).toBe("dont");
    await awaitUrl(page, wallUrl({ show: "dont" }));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await context.close();
  });
});

test("phone category icons jump to sections and follow reading position", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openCatalog(page, wallUrl());
  const strip = page.getByRole("navigation", { name: "Jump to a section" });
  const color = strip.getByRole("link", { name: "Color" });
  await color.click();
  await expect(color).toHaveAttribute("aria-current", "location");
  await expect(page.locator("#color h2")).toBeInViewport();
  await expect(strip).toBeInViewport({ ratio: 1 });

  await page.locator("#forms h2").evaluate((heading) => heading.scrollIntoView());
  await expect(page.locator(".shell")).toHaveAttribute("data-chrome-min", "");
  await page.locator(".shell-wall").evaluate((wall) => wall.scrollBy(0, -64));
  await expect(strip.getByRole("link", { name: "Forms" })).toHaveAttribute("aria-current", "location");
  await expect(strip).toBeInViewport({ ratio: 1 });
});

test("on a collection wall the phone strip keeps the current group in view", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openCatalog(page, wallUrl({ collection: "accessibility" }));
  const row = page.locator(".gw-strip .bstrip-cats");
  const overflow = await row.evaluate((el) => el.scrollWidth - el.clientWidth);
  expect(overflow, "four group labels overflow a phone").toBeGreaterThan(0);
  const inRow = () =>
    row.evaluate((el) => {
      const item = el.querySelector('[aria-current="location"]');
      if (!item) return null;
      const a = item.getBoundingClientRect();
      const b = el.getBoundingClientRect();
      return a.left >= b.left - 1 && a.right <= b.right + 1;
    });
  await expect.poll(inRow).toBe(true);
  await page.locator(".shell-wall").evaluate((wall) => wall.scrollTo(0, wall.scrollHeight));
  await expect(row.locator("a").last()).toHaveAttribute("aria-current", "location");
  await expect.poll(inRow).toBe(true);
  await page.locator(".shell-wall").evaluate((wall) => wall.scrollTo(0, 0));
  await expect(row.locator("a").first()).toHaveAttribute("aria-current", "location");
  await expect.poll(inRow).toBe(true);
});

test.describe("search and collections", () => {
  test("a search hides what it leaves out, and J/K walk the rest in deck order", async ({ page }) => {
    await openCatalog(page, wallUrl());
    await page.keyboard.press("/");
    await expect(page.locator(wall.search)).toBeFocused();
    await page.keyboard.type("border");
    await awaitUrl(page, wallUrl({ q: "border" }));
    await expect.poll(() => visibleTiles(page)).toEqual(BORDER);
    await expect(page.locator(".gw-count")).toHaveText(`${BORDER.length} of ${rules.length} rules`);

    // J skips hidden neighbours; Shift+J skips hidden sections.
    await page.locator(wall.search).blur();
    for (const id of BORDER) {
      await page.keyboard.press("j");
      expect(await focused(page)).toBe(id);
    }
    const previousSections = ["comp-3", "a11y-2", "layout-7"];
    for (const id of previousSections) {
      await page.keyboard.press("Shift+K");
      expect(await focused(page)).toBe(id);
    }
    for (const id of ["a11y-2", "comp-3", "motion-8"]) {
      await page.keyboard.press("Shift+J");
      expect(await focused(page)).toBe(id);
    }

    // The rule view pages the same deck.
    for (const id of previousSections) {
      await page.keyboard.press("Shift+K");
      expect(await focused(page)).toBe(id);
    }
    await page.keyboard.press("Enter");
    await awaitView(page, "rule");
    await awaitUrl(page, ruleUrl("layout-7", { q: "border" }));
    await page.keyboard.press("j");
    await awaitUrl(page, ruleUrl("a11y-2", { q: "border" }));

    // Back on the wall, the filter and the tile are where they were.
    await page.keyboard.press("Escape");
    await awaitView(page, "gallery");
    await expect.poll(() => visibleTiles(page)).toEqual(BORDER);
    expect(await focused(page)).toBe("a11y-2");
  });

  test("a ?q link filters after hydration, and Esc clears it", async ({ page }) => {
    await openCatalog(page, wallUrl({ q: "border" }));
    await expect.poll(() => visibleTiles(page)).toEqual(BORDER);
    await expect(page.locator(wall.search)).toHaveValue("border");
    await page.keyboard.press("Escape");
    await awaitUrl(page, wallUrl());
    await expect.poll(() => visibleTiles(page)).toHaveLength(rules.length);
  });

  test("a search with no matches shows the empty state beside the wall", async ({ page }) => {
    await openCatalog(page, wallUrl({ q: "zzqx" }));
    await expect(page.getByText("No rules match “zzqx”")).toBeVisible();
    expect(await visibleTiles(page)).toEqual([]);
    expect(await page.locator(sel.tileLink).count()).toBe(rules.length);
    await page.getByRole("button", { name: "Clear search" }).last().click();
    await expect.poll(() => visibleTiles(page)).toHaveLength(rules.length);
  });

  test("Enter while an input method is composing belongs to the composition", async ({ page }) => {
    await openCatalog(page, wallUrl());
    const search = page.locator(wall.search);
    await search.focus();
    // The field holds text React has not seen yet: only a committing Enter would read it.
    const prevented = await search.evaluate((input: HTMLInputElement) => {
      input.value = "border";
      const event = new KeyboardEvent("keydown", { key: "Enter", isComposing: true, bubbles: true, cancelable: true });
      input.dispatchEvent(event);
      return event.defaultPrevented;
    });
    expect(prevented).toBe(false);
    await page.waitForTimeout(500);
    await awaitUrl(page, wallUrl());
  });

  test("a query from the palette cancels typing that has not committed yet", async ({ page }) => {
    await page.clock.install();
    await openCatalog(page, wallUrl());
    // Time stops: the typing's commit stays pending until the clock runs.
    await page.clock.pauseAt(Date.now() + 10_000);
    await page.locator(wall.search).fill("kerning");
    await page.keyboard.press("ControlOrMeta+k");
    const combobox = page.getByRole("dialog", { name: "Search rules" }).getByRole("combobox");
    await combobox.fill("border");
    await combobox.press("Shift+Enter");
    await awaitUrl(page, wallUrl({ q: "border" }));
    await page.clock.runFor(1_000);
    await page.clock.resume();
    expect(await settledUrl(page)).toBe(wallUrl({ q: "border" }));
    await expect(page.locator(wall.search)).toHaveValue("border");
    await expect.poll(() => visibleTiles(page)).toEqual(BORDER);
  });

  for (const via of ["hash", "query"] as const) {
    test(`the Accessibility collection opens its rules from the ${via}`, async ({ page }) => {
      const url = via === "hash" ? wallUrl({ hash: "accessibility" }) : wallUrl({ collection: "accessibility" });
      await openCatalog(page, url);
      await awaitUrl(page, wallUrl({ collection: "accessibility" }));
      await expect.poll(async () => (await visibleTiles(page)).length).toBe(accessibilityCollection.ruleIds.length);
      await expect(page.locator(".gw-count")).toHaveText(`${accessibilityCollection.ruleIds.length} of ${rules.length} rules`);
      await page.getByRole("button", { name: /Accessibility collection, show all rules/ }).click();
      await awaitUrl(page, wallUrl());
      await expect.poll(async () => (await visibleTiles(page)).length).toBe(rules.length);
    });
  }
});

test.describe("Show only", () => {
  const name = keyboardCollection.name;
  const count = keyboardCollection.ruleIds.length;
  const scrolled = (page: Page) => page.locator(sel.wallLayer).evaluate((layer) => Math.round(layer.scrollTop));
  const status = (page: Page) => page.locator(sel.wall).getByRole("status");
  const toggle = (page: Page) => page.locator(".shell-rail").getByRole("switch", { name: `${name}, ${count} rules` });

  test("on the wall, a switch starts the collection at its top and announces it", async ({ page }) => {
    await openCatalog(page, wallUrl());
    await page.locator(sel.wallLayer).evaluate((layer) => { layer.scrollTop = layer.scrollHeight; });
    expect(await scrolled(page)).toBeGreaterThan(1000);
    await page.locator("body").press("[");
    await toggle(page).click();
    await awaitUrl(page, wallUrl({ collection: keyboardCollection.id }));
    await expect.poll(() => scrolled(page)).toBe(0);
    await expect(status(page)).toHaveText(`${name} collection, ${count} rules`);
  });

  test("on a rule, a switch goes back to the wall, which starts at the top and announces it", async ({ page }) => {
    await openCatalog(page, wallUrl());
    await page.locator(sel.wallLayer).evaluate((layer) => { layer.scrollTop = layer.scrollHeight; });
    await page.locator(sel.tile(railIds[railIds.length - 1])).click();
    await awaitView(page, "rule");
    await page.locator("body").press("[");
    await toggle(page).click();
    await awaitView(page, "gallery");
    await awaitUrl(page, wallUrl({ collection: keyboardCollection.id }));
    await expect.poll(() => scrolled(page)).toBe(0);
    await expect(status(page)).toHaveText(`${name} collection, ${count} rules`);
  });
});

test.describe("fragments", () => {
  test("/#forms lands on its section with script off", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 }, baseURL: ORIGIN });
    const page = await context.newPage();
    await page.goto(wallUrl({ hash: "forms" }));
    const top = await page.locator("section#forms h2").evaluate((h2) => h2.getBoundingClientRect().top);
    expect(top).toBeGreaterThan(0);
    expect(top).toBeLessThan(200);
    await context.close();
  });

  test("a category fragment scrolls the wall once hydrated", async ({ page }) => {
    await openCatalog(page, wallUrl({ hash: "motion" }));
    const top = await page.locator("section#motion h2").evaluate((h2) => h2.getBoundingClientRect().top);
    expect(top).toBeGreaterThan(0);
    expect(top).toBeLessThan(200);
  });
});

test.describe("motion tiles", () => {
  async function onScreen(page: Page, id: string) {
    await page.locator(wall.tile(id)).scrollIntoViewIfNeeded();
    await expect(page.locator(`${wall.frame(id)} .gw-fit[data-v="do"] [data-motion]`)).toHaveAttribute("data-ready", "");
  }

  test("at idle nothing runs", async ({ page }) => {
    await openCatalog(page, wallUrl({ hash: "motion" }));
    await settledRunning(page).toBe(0);
  });

  test("a mouse dwell replays the tile; a quick pass and a touch do not", async ({ page }) => {
    await openCatalog(page, wallUrl({ hash: "motion" }));
    await onScreen(page, MOTION);
    const plays = await countPlays(page, MOTION);
    const box = (await page.locator(wall.frame(MOTION)).boundingBox())!;
    // A sweep that leaves within the dwell sets nothing off.
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.move(box.x - 40, box.y - 40);
    await page.waitForTimeout(300);
    expect(await plays()).toBe(0);
    // A touch is not a hover.
    await page.locator(wall.tile(MOTION)).dispatchEvent("pointerenter", { pointerType: "touch" });
    await page.waitForTimeout(300);
    expect(await plays()).toBe(0);
    // A real dwell plays it once, and it ends.
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect.poll(plays).toBe(1);
    await expect.poll(() => playing(page, MOTION), { timeout: 5_000 }).toBe(false);
  });

  test("keyboard focus replays at once; a click opens the rule and plays nothing", async ({ page }) => {
    await openCatalog(page, wallUrl({ hash: "motion" }));
    await onScreen(page, MOTION);
    const next = railNeighbour(MOTION, 1);
    await page.mouse.move(0, 0);
    await page.locator(wall.tile(next)).focus();
    const plays = await countPlays(page, MOTION);
    await page.keyboard.press("k");
    expect(await focused(page)).toBe(MOTION);
    expect(await plays()).toBe(1);
    await expect.poll(() => playing(page, MOTION), { timeout: 5_000 }).toBe(false);

    // A click: the dwell never finishes before the rule opens, and the hidden wall stays still.
    const clicked = await countPlays(page, next);
    const box = (await page.locator(wall.frame(next)).boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await awaitView(page, "rule");
    await page.waitForTimeout(300);
    expect(await clicked()).toBe(0);
  });

  test("asking for less motion mid-replay puts the tile back at rest at once", async ({ page }) => {
    await openCatalog(page, wallUrl({ hash: "motion" }));
    // A scene with its own CSS loop plays for whole loops (2 s): long enough to catch mid-replay.
    const id = await page.evaluate(() => {
      const pane = [...document.querySelectorAll<HTMLElement>('.gw-fit[data-v="do"] [data-motion]')].find((el) => el.querySelector('[class*="animate-"]'));
      return pane?.dataset.motion ?? null;
    });
    expect(id, "a looping motion tile").toBeTruthy();
    await onScreen(page, id!);
    const box = (await page.locator(wall.frame(id!)).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect.poll(() => playing(page, id!)).toBe(true);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect.poll(() => playing(page, id!), { timeout: 300 }).toBe(false);
    const running = () =>
      page.locator(wall.frame(id!)).evaluate((frame) =>
        document.getAnimations().filter((a) => a.playState === "running" && frame.contains((a.effect as KeyframeEffect | null)?.target as Node | null)).length,
      );
    await expect.poll(running, { timeout: 300 }).toBe(0);
  });

  test("under reduced motion there is no replay and no ▶", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 }, baseURL: ORIGIN });
    const page = await context.newPage();
    await openCatalog(page, wallUrl({ hash: "motion" }));
    await onScreen(page, MOTION);
    await expect(page.locator(wall.marker(MOTION))).toBeHidden();
    const plays = await countPlays(page, MOTION);
    const box = (await page.locator(wall.frame(MOTION)).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(400);
    await page.locator(wall.tile(MOTION)).focus();
    await page.waitForTimeout(200);
    expect(await plays()).toBe(0);
    await settledRunning(page).toBe(0);
    await context.close();
  });
});

test.describe("Continue", () => {
  const remember = async (browser: Browser) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, baseURL: ORIGIN });
    await context.addInitScript(() => {
      localStorage.setItem("axiom:v1", JSON.stringify({ v: 1, last: "typo-3", recent: ["typo-3"], visited: ["typo-3"] }));
    });
    return context;
  };

  test("offers the last rule read, once per load", async ({ browser }) => {
    const context = await remember(browser);
    const page = await context.newPage();
    await openCatalog(page, wallUrl());
    const link = page.locator(wall.continue);
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", routes().ruleHref("typo-3"));
    await link.click();
    await awaitView(page, "rule");
    await awaitUrl(page, ruleUrl("typo-3"));
    await page.keyboard.press("Escape");
    await awaitView(page, "gallery");
    await expect(link).toHaveCount(0);
    await context.close();
  });

  test("never on a deep link", async ({ browser }) => {
    const context = await remember(browser);
    const page = await context.newPage();
    await openCatalog(page, ruleUrl("typo-1"));
    await page.keyboard.press("Escape");
    await awaitView(page, "gallery");
    await expect(page.locator(sel.wall)).toBeVisible();
    await expect(page.locator(wall.continue)).toHaveCount(0);
    await context.close();
  });
});
