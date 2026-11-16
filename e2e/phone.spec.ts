import type { Page } from "@playwright/test";

import { railCategories, railPosition } from "../src/data/taxonomy";
import { awaitUrl, awaitView, expect, openCatalog, ruleUrl, test, wallUrl } from "./helpers";

/*
 * The phone shell: the top bar, the bottom strip and the menu. The layout is
 * CSS's call on PHONE_QUERY, so it is right before any script runs; narrower
 * refinements (the run's own row under 352px, the short sideways screen)
 * never reach a desktop window.
 */

const RULE = "motion-7";
const position = railPosition(RULE);
const category = railCategories.find((item) => item.id === position.category)!;
const sel = {
  bar: ".phone-bar",
  strip: ".bstrip",
  run: ".bstrip-run",
  mark: ".bstrip-link",
  cats: ".bstrip-cats",
  solo: ".bstrip-solo",
  prev: ".bstrip-row > button:first-child",
  rise: ".bstrip-rise",
  menu: '.phone-menu[role="dialog"]',
} as const;

const box = async (page: Page, selector: string) => {
  const found = await page.locator(selector).first().boundingBox();
  if (!found) throw new Error(`${selector} has no box`);
  return found;
};

const sideways = (page: Page) =>
  page.evaluate(() => ({
    page: document.documentElement.scrollWidth - innerWidth,
    sheet: (document.querySelector(".shell-sheet")?.scrollWidth ?? 0) - (document.querySelector(".shell-sheet")?.clientWidth ?? 0),
  }));

const focused = (page: Page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    return { label: el?.getAttribute("aria-label") ?? el?.textContent?.trim() ?? "", inMenu: Boolean(el?.closest(".phone-menu")) };
  });

test.describe("a phone, 390 × 844", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("nothing scrolls sideways, on the wall or on a rule", async ({ page }) => {
    for (const url of [wallUrl(), ruleUrl(RULE)]) {
      await openCatalog(page, url);
      await expect(page.locator(sel.bar)).toBeVisible();
      expect(await sideways(page), url).toEqual({ page: 0, sheet: 0 });
    }
  });

  test("the strip's marks are links to the run's rules, one Tab stop on the current rule", async ({ page }) => {
    await openCatalog(page, ruleUrl(RULE));
    const marks = page.locator(sel.mark);
    const hrefs = await marks.evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(hrefs).toEqual(category.rules.map((rule) => ruleUrl(rule.id)));
    await expect(page.locator(`${sel.mark}[tabindex="0"]`)).toHaveCount(1);
    await expect(page.locator(`${sel.mark}[tabindex="0"]`)).toHaveAttribute("href", ruleUrl(RULE));
    await expect(page.locator(`${sel.mark}[aria-current="page"]`)).toHaveAttribute("href", ruleUrl(RULE));

    // Arrow keys move the stop and focus along the run; Enter opens the focused mark.
    await page.locator(`${sel.mark}[tabindex="0"]`).focus();
    await page.keyboard.press("ArrowRight");
    const next = category.rules[position.index].id;
    expect(await page.evaluate(() => document.activeElement?.getAttribute("href"))).toBe(ruleUrl(next));
    await expect(page.locator(`${sel.mark}[tabindex="0"]`)).toHaveCount(1);
    await page.keyboard.press("Enter");
    await awaitUrl(page, ruleUrl(next));
  });

  test("a scrub lifted well above the run opens nothing; lifted on a mark, opens that mark", async ({ page }) => {
    await openCatalog(page, ruleUrl(RULE));
    const run = await box(page, sel.run);
    const y = run.y + run.height / 2;
    const target = category.rules[2].id;
    const at = await box(page, `${sel.mark}[href="${ruleUrl(target)}"]`);

    await page.mouse.move(run.x + 4, y);
    await page.mouse.down();
    for (let x = run.x + 4; x <= run.x + run.width / 2; x += 10) await page.mouse.move(x, y);
    await expect(page.locator(sel.rise)).toHaveAttribute("data-open", "");
    await page.mouse.move(run.x + run.width / 2, run.y - 80);
    await expect(page.locator(sel.rise)).toHaveAttribute("data-cancel", "");
    await expect(page.locator(sel.rise)).toContainText("Release to cancel");
    await page.mouse.up();
    await expect(page.locator(sel.rise)).not.toHaveAttribute("data-open", "");
    await page.waitForTimeout(300);
    await awaitUrl(page, ruleUrl(RULE));

    // Measured at rest: the mark under the pointer stays under it while the lens grows.
    await page.mouse.move(run.x + 4, y);
    await page.mouse.down();
    for (let x = run.x + 4; x < at.x + at.width / 2; x += 4) await page.mouse.move(x, y);
    await page.mouse.move(at.x + at.width / 2, y);
    await page.mouse.up();
    await awaitView(page, "rule");
    await awaitUrl(page, ruleUrl(target));
  });

  test("Up names where you are, morphs back on a tap and cuts back from the keyboard", async ({ page }) => {
    await openCatalog(page, ruleUrl(RULE));
    const where = `${category.short} · ${position.index} of ${position.total}`;
    const up = page.getByRole("link", { name: `${where}, back to all rules`, exact: true });
    await expect(up).toBeVisible();
    // The visible words start the name (WCAG 2.5.3).
    expect((await up.innerText()).replace(/\s+/g, " ").trim()).toBe(where);

    await page.evaluate(() => {
      const seen: string[] = [];
      (window as unknown as { __vt: string[] }).__vt = seen;
      new MutationObserver(() => {
        const mode = document.documentElement.dataset.vt;
        if (mode) seen.push(mode);
      }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-vt"] });
    });
    await up.click();
    await awaitView(page, "gallery");
    expect(await page.evaluate(() => (window as unknown as { __vt: string[] }).__vt)).toContain("out");
    await expect(page.locator(sel.strip)).toHaveCount(0);

    await openCatalog(page, ruleUrl(RULE));
    await page.evaluate(() => {
      const seen: string[] = [];
      (window as unknown as { __vt: string[] }).__vt = seen;
      new MutationObserver(() => {
        const mode = document.documentElement.dataset.vt;
        if (mode) seen.push(mode);
      }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-vt"] });
    });
    await up.focus();
    await page.keyboard.press("Enter");
    await awaitView(page, "gallery");
    expect(await page.evaluate(() => (window as unknown as { __vt: string[] }).__vt)).toEqual([]);
  });

  test("reading down tucks the category row away; reading up brings it back", async ({ page }) => {
    await openCatalog(page, ruleUrl(RULE));
    await expect(page.locator(sel.cats)).toBeVisible();
    await page.locator(".shell-sheet").evaluate((sheet) => sheet.scrollBy(0, 400));
    await expect(page.locator(".shell")).toHaveAttribute("data-chrome-min", "");
    await expect(page.locator(sel.cats)).toBeHidden();
    await expect(page.locator(sel.run)).toBeInViewport();
    await page.locator(".shell-sheet").evaluate((sheet) => sheet.scrollBy(0, -200));
    await expect(page.locator(".shell")).not.toHaveAttribute("data-chrome-min", "");
    await expect(page.locator(sel.cats)).toBeVisible();
  });

  test("the menu traps focus, closes on Esc and gives focus back to its opener", async ({ page }) => {
    await openCatalog(page, ruleUrl(RULE));
    const opener = page.getByRole("button", { name: "Menu", exact: true });
    await opener.focus();
    await page.keyboard.press("Enter");
    const menu = page.locator(sel.menu);
    await expect(menu).toBeVisible();
    await expect(opener).toHaveAttribute("aria-expanded", "true");
    expect(await focused(page)).toEqual({ label: "Close menu", inMenu: true });
    // The page behind can be neither focused nor read.
    await expect(page.locator(".shell-sheet")).toHaveAttribute("inert", "");
    await expect(page.locator(sel.bar)).toHaveAttribute("inert", "");

    for (let i = 0; i < 30; i++) {
      await page.keyboard.press("Tab");
      expect((await focused(page)).inMenu, `Tab ${i + 1}`).toBe(true);
    }
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press("Shift+Tab");
      expect((await focused(page)).inMenu, `Shift+Tab ${i + 1}`).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await expect(opener).toBeFocused();
    await expect(page.locator(".shell-sheet")).not.toHaveAttribute("inert", "");
    // Esc closed the menu and nothing else.
    await awaitUrl(page, ruleUrl(RULE));

    // A tap on the scrim closes it too, back to the opener.
    await opener.click();
    await expect(menu).toBeVisible();
    await page.mouse.click(380, 400);
    await expect(menu).toHaveCount(0);
    await expect(opener).toBeFocused();
  });

  test("a rule chosen in the menu opens, and the menu's focus goes to the page", async ({ page }) => {
    await openCatalog(page, ruleUrl(RULE));
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    const target = category.rules[0];
    await page.locator(sel.menu).getByRole("link", { name: target.title, exact: true }).click();
    await expect(page.locator(sel.menu)).toHaveCount(0);
    await awaitUrl(page, ruleUrl(target.id));
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest("#main-content")))).toBe(true);
  });

  test("the menu's install row opens the skills dialog, and its close goes back to the menu's opener", async ({ page }) => {
    await openCatalog(page, ruleUrl(RULE));
    const opener = page.getByRole("button", { name: "Menu", exact: true });
    await opener.click();
    const row = page.locator(sel.menu).getByRole("button", { name: "Install in your agent", exact: true });
    await expect(row).toBeVisible();
    expect((await row.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await row.click();
    await expect(page.locator(sel.menu)).toHaveCount(0);
    const skills = page.getByRole("dialog", { name: "Agent skills" });
    await expect(skills).toBeVisible();
    await expect(skills.getByText("npx skills add RexO77/axiomUI").first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(skills).toHaveCount(0);
    await expect(opener).toBeFocused();
    await awaitUrl(page, ruleUrl(RULE));
  });

  test("leaving the phone layout closes the menu, and focus lands on the page", async ({ page }) => {
    await openCatalog(page, ruleUrl(RULE));
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await expect(page.locator(sel.menu)).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator(sel.menu)).toHaveCount(0);
    await expect(page.locator(".shell-sheet")).not.toHaveAttribute("inert", "");
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("main-content");
  });
});

test.describe("the run's own row", () => {
  for (const [width, own] of [[351, true], [352, false]] as const) {
    test(`${own ? "takes" : "does not take"} a row of its own at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 760 });
      await openCatalog(page, ruleUrl(RULE));
      const run = await box(page, sel.run);
      const prev = await box(page, sel.prev);
      if (own) {
        expect(run.y + run.height).toBeLessThanOrEqual(prev.y);
        expect(run.width).toBeGreaterThan(width - 16);
        await expect(page.locator(sel.cats)).toBeHidden();
        await expect(page.locator(sel.solo)).toBeVisible();
      } else {
        expect(Math.abs(run.y + run.height / 2 - (prev.y + prev.height / 2))).toBeLessThan(1);
        await expect(page.locator(sel.cats)).toBeVisible();
        await expect(page.locator(sel.solo)).toBeHidden();
      }
      expect(await sideways(page)).toEqual({ page: 0, sheet: 0 });
    });
  }
});

test.describe("a phone held sideways, 844 × 390", () => {
  test.use({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });

  test("the category row stays away, the bar tucks away while reading, and the card fits", async ({ page }) => {
    await openCatalog(page, ruleUrl(RULE));
    await expect(page.locator(sel.bar)).toBeVisible();
    await expect(page.locator(sel.cats)).toBeHidden();
    expect((await box(page, sel.bar)).height).toBe(40);
    expect(await sideways(page)).toEqual({ page: 0, sheet: 0 });

    await page.locator(".shell-sheet").evaluate((sheet) => sheet.scrollBy(0, 300));
    await expect(page.locator(".shell")).toHaveAttribute("data-chrome-min", "");
    await expect.poll(async () => (await box(page, sel.bar)).y + (await box(page, sel.bar)).height).toBeLessThanOrEqual(0);
    await page.locator(".shell-sheet").evaluate((sheet) => sheet.scrollBy(0, -150));
    await expect(page.locator(".shell")).not.toHaveAttribute("data-chrome-min", "");

    // Scrub: the card rises between the top of the screen and the strip.
    const run = await box(page, sel.run);
    const y = run.y + run.height / 2;
    await page.mouse.move(run.x + 4, y);
    await page.mouse.down();
    for (let x = run.x + 4; x <= run.x + run.width / 2; x += 20) await page.mouse.move(x, y);
    await expect(page.locator(sel.rise)).toHaveAttribute("data-open", "");
    await page.waitForTimeout(250);
    const card = await box(page, sel.rise);
    expect(card.y).toBeGreaterThanOrEqual(0);
    expect(card.y + card.height).toBeLessThanOrEqual(run.y);
    expect(card.x).toBeGreaterThanOrEqual(0);
    expect(card.x + card.width).toBeLessThanOrEqual(844);
    await page.mouse.move(run.x + run.width / 2, run.y - 80);
    await page.mouse.up();
    await awaitUrl(page, ruleUrl(RULE));
  });

  test("a touch that starts up or down scrolls the rule; one that starts sideways scrubs", async ({ page }) => {
    await openCatalog(page, ruleUrl(RULE));
    const cdp = await page.context().newCDPSession(page);
    const run = await box(page, sel.run);
    const x = run.x + run.width / 2;
    const y = run.y + run.height / 2;
    const touch = async (type: "touchStart" | "touchMove" | "touchEnd", points: { x: number; y: number }[]) =>
      cdp.send("Input.dispatchTouchEvent", { type, touchPoints: points });

    // Up first: the sheet follows the finger and nothing opens.
    const before = await page.locator(".shell-sheet").evaluate((sheet) => sheet.scrollTop);
    await touch("touchStart", [{ x, y }]);
    for (let dy = 4; dy <= 120; dy += 8) await touch("touchMove", [{ x: x + 1, y: y - dy }]);
    await touch("touchEnd", []);
    await expect.poll(() => page.locator(".shell-sheet").evaluate((sheet) => sheet.scrollTop)).toBeGreaterThan(before + 60);
    await expect(page.locator(sel.rise)).not.toHaveAttribute("data-open", "");
    await awaitUrl(page, ruleUrl(RULE));

    // Sideways first: a scrub, and its lift opens the rule under the finger.
    const target = category.rules[0].id;
    const first = await box(page, `${sel.mark}[href="${ruleUrl(target)}"]`);
    await touch("touchStart", [{ x: first.x + first.width / 2 + 40, y }]);
    for (let dx = 8; dx <= 40; dx += 8) await touch("touchMove", [{ x: first.x + first.width / 2 + 40 - dx, y }]);
    await expect(page.locator(sel.rise)).toHaveAttribute("data-open", "");
    await touch("touchEnd", []);
    await awaitView(page, "rule");
    await awaitUrl(page, ruleUrl(target));
  });
});

test.describe("a desktop window", () => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1440, height: 390 }]) {
    test(`shows no phone part at ${viewport.width} × ${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await openCatalog(page, ruleUrl(RULE));
      await expect(page.locator(".shell-rail")).toBeVisible();
      await expect(page.locator(sel.bar)).toBeHidden();
      // In the server HTML for a phone's first paint; gone once hydration shows it is not needed.
      await expect(page.locator(sel.strip)).toHaveCount(0);
      expect((await box(page, ".shell-sheet")).x).toBe(56);
    });
  }
});

test.describe("with JavaScript off", () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });

  test("the first paint is already the phone layout, and the marks still link", async ({ page }) => {
    await page.goto(ruleUrl(RULE));
    await expect(page.locator(sel.bar)).toBeVisible();
    await expect(page.locator(".shell-rail")).toBeHidden();
    await expect(page.locator(sel.strip)).toBeVisible();
    await expect(page.locator(sel.cats)).toBeVisible();
    expect((await box(page, ".shell-sheet")).y).toBe(48);
    const run = await box(page, sel.run);
    const marks = page.locator(sel.mark);
    await expect(marks).toHaveCount(category.rules.length);
    // Evenly across the run, each a tappable slot.
    const first = (await marks.first().boundingBox())!;
    const last = (await marks.last().boundingBox())!;
    expect(first.x).toBeGreaterThanOrEqual(run.x);
    expect(last.x + last.width).toBeLessThanOrEqual(run.x + run.width);
    expect(first.width).toBeGreaterThan(4);
    await expect(marks.nth(1)).toHaveAttribute("href", ruleUrl(category.rules[1].id));
    await expect(page.getByRole("link", { name: /back to all rules$/ })).toHaveAttribute("href", wallUrl());
  });
});
