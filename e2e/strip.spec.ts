import { railCategories } from "../src/data/taxonomy";
import { awaitUrl, awaitView, expect, openCatalog, railIds, ruleUrl, test, titleOf, wallUrl } from "./helpers";

/*
 * The magnify strip:
 * every mark is a real link under the catalog's base, the strip is one Tab
 * stop with arrow keys inside it, modified clicks stay the browser's, and a
 * reduced-motion reader's first paint is already the steady column.
 */

const link = ".strip-link";
const column = ".strip-col";

test("every mark is a link under the base, in rail order: each category icon to its run on the wall, each rule to its rule", async ({ page }) => {
  await openCatalog(page, wallUrl());
  const hrefs = await page.locator(link).evaluateAll((links) => links.map((a) => a.getAttribute("href")));
  expect(hrefs).toEqual(railCategories.flatMap((category) => [wallUrl({ hash: category.id }), ...category.rules.map((rule) => ruleUrl(rule.id))]));
  expect(railIds).toEqual(railCategories.flatMap((category) => category.rules.map((rule) => rule.id)));
  // Named, and not hidden from assistive technology.
  const icon = page.locator(`${link}[href="${wallUrl({ hash: railCategories[2].id })}"]`);
  await expect(icon).toHaveAccessibleName(`${railCategories[2].short}, ${railCategories[2].rules.length} rules, on the wall`);
  expect(await icon.evaluate((el) => Boolean(el.closest('[aria-hidden="true"]')))).toBe(false);
});

test("arrow keys reach the category icons, and Enter on one lands on its section", async ({ page }) => {
  await openCatalog(page, ruleUrl(railIds[0]));
  const focused = () => page.evaluate(() => document.activeElement?.getAttribute("href") ?? null);
  await page.locator(`${link}[aria-current="page"]`).focus();
  await page.keyboard.press("ArrowUp");
  expect(await focused()).toBe(wallUrl({ hash: railCategories[0].id }));
  await page.keyboard.press("Home");
  expect(await focused()).toBe(wallUrl({ hash: railCategories[0].id }));
  // Down off the last rule of a run is the next run's icon.
  const second = railCategories[1];
  await page.locator(`${link}[href="${ruleUrl(railCategories[0].rules.at(-1)!.id)}"]`).focus();
  await page.keyboard.press("ArrowDown");
  expect(await focused()).toBe(wallUrl({ hash: second.id }));
  await page.keyboard.press("Enter");
  await awaitView(page, "gallery");
  await expect(page.locator(".shell-wall [data-wall]")).toBeVisible();
  await expect.poll(() => sectionOffset(page, second.id)).toBeLessThan(4);
  await awaitUrl(page, wallUrl({ hash: second.id }));
});

/** How far a wall section's top sits from the top of the wall's scroll box. */
const sectionOffset = (page: import("@playwright/test").Page, id: string) =>
  page.evaluate((id) => {
    const layer = document.querySelector(".shell-wall")!.getBoundingClientRect();
    const section = document.getElementById(id)!.getBoundingClientRect();
    return Math.abs(section.top - layer.top);
  }, id);

test("a relayout keeps the keyboard-focused mark in view", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1400 });
  await openCatalog(page, ruleUrl(railIds[0]));
  await page.locator(`${link}[aria-current="page"]`).focus();
  await page.keyboard.press("End");
  const last = ruleUrl(railIds.at(-1)!);
  expect(await page.evaluate(() => document.activeElement?.getAttribute("href"))).toBe(last);
  // Short enough that the column switches to its scrolling layout.
  await page.setViewportSize({ width: 1440, height: 420 });
  await expect(page.locator(column)).toHaveAttribute("data-steady", "");
  await expect
    .poll(() =>
      page.evaluate((selector) => {
        const box = document.querySelector(selector)!.getBoundingClientRect();
        const mark = document.activeElement!.getBoundingClientRect();
        return mark.top >= box.top && mark.bottom <= box.bottom;
      }, column)
    )
    .toBe(true);
  expect(await page.evaluate(() => document.activeElement?.getAttribute("href"))).toBe(last);
});

test.describe("the expanded list", () => {
  test("J across a category boundary moves focus to the new current rule, not the document", async ({ page }) => {
    const last = railCategories[0].rules.at(-1)!.id;
    const next = railCategories[1].rules[0].id;
    await openCatalog(page, ruleUrl(last));
    await page.locator(".shell-rail .rail-button").click();
    const current = page.locator('.rail-list .rail-rulerow[aria-current="page"]');
    await expect(current).toHaveText(new RegExp(titleOf(last)));
    await current.focus();
    await page.keyboard.press("j");
    await awaitUrl(page, ruleUrl(next));
    await expect(current).toHaveText(new RegExp(titleOf(next)));
    await expect(current).toBeFocused();
  });
});

test("the strip is one Tab stop and arrow keys move inside it", async ({ page }) => {
  await openCatalog(page, wallUrl());
  await expect(page.locator(`${link}[tabindex="0"]`)).toHaveCount(1);

  await page.locator(".rail-home").focus();
  await page.keyboard.press("Tab");
  const focused = () => page.evaluate(() => document.activeElement?.getAttribute("href") ?? null);
  expect(await focused()).toBe(ruleUrl(railIds[0]));

  await page.keyboard.press("ArrowDown");
  expect(await focused()).toBe(ruleUrl(railIds[1]));
  await expect(page.locator(`${link}[tabindex="0"]`)).toHaveCount(1);
  await page.keyboard.press("ArrowUp");
  expect(await focused()).toBe(ruleUrl(railIds[0]));
  await page.keyboard.press("End");
  expect(await focused()).toBe(ruleUrl(railIds.at(-1)!));
  await page.keyboard.press("Home");
  await page.keyboard.press("PageDown");
  expect(await focused()).toBe(ruleUrl(railCategories[1].rules[0].id));

  // Tab leaves the strip in one step.
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => Boolean(document.activeElement?.closest(".strip-col")))).toBe(false);

  // Enter opens the focused mark's rule (a push, through the shell).
  await page.keyboard.press("Shift+Tab");
  const target = await focused();
  await page.keyboard.press("Enter");
  await awaitView(page, "rule");
  await awaitUrl(page, target!);
});

const modified = [
  { name: "Ctrl or Cmd", type: "click", button: "left", key: process.platform === "darwin" ? "Meta" : "Control" },
  { name: "Shift", type: "click", button: "left", key: "Shift" },
  { name: "middle", type: "auxclick", button: "middle", key: null },
] as const;

for (const { name, type, button, key } of modified) {
  test(`${name}-click on a mark is the browser's, on the mark under the pointer`, async ({ page }) => {
    await openCatalog(page, wallUrl());
    const id = railIds[6];
    // Measured at rest: the base slot under the pointer stays that mark while the lens grows.
    const box = (await page.locator(`${link}[href="${ruleUrl(id)}"]`).boundingBox())!;
    // Recorded at the document, after the strip's own handler has run. Never followed, so no tab opens.
    await page.evaluate((eventType) => {
      const seen: { prevented: boolean; href: string | null }[] = [];
      (window as unknown as { __seen: typeof seen }).__seen = seen;
      document.addEventListener(eventType, (event) => {
        seen.push({ prevented: event.defaultPrevented, href: (event.target as Element).closest("a")?.getAttribute("href") ?? null });
        event.preventDefault();
      });
    }, type);
    if (key) await page.keyboard.down(key);
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button });
    if (key) await page.keyboard.up(key);
    const seen = await page.evaluate(() => (window as unknown as { __seen: unknown[] }).__seen);
    expect(seen).toEqual([{ prevented: false, href: ruleUrl(id) }]);
    await expect(page.locator(".shell")).toHaveAttribute("data-view", "gallery");
  });
}

test("a click on the blank padding above the first mark or below the last opens nothing", async ({ page }) => {
  await openCatalog(page, wallUrl());
  const col = (await page.locator(column).boundingBox())!;
  const url = page.url();
  // The lens never draws a mark in the column's 30px end padding.
  for (const y of [col.y + 8, col.y + col.height - 6]) {
    await page.mouse.click(col.x + col.width / 2, y);
    await page.waitForTimeout(300);
    expect(page.url()).toBe(url);
    await expect(page.locator(".shell")).toHaveAttribute("data-view", "gallery");
  }
});

type FirstLayout = { shifts: number; firstReady: { steady: boolean } | null };

/** Records the column's state at the moment its first layout lands (data-ready), and any layout shift. */
async function recordFirstLayout(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    const record = { shifts: 0, firstReady: null as { steady: boolean } | null };
    (window as unknown as { __strip: typeof record }).__strip = record;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
        if (!entry.hadRecentInput) record.shifts += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
    // The column is hidden until its first layout; read that layout as it lands.
    new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const el = mutation.target as Element;
        if (record.firstReady || !el.classList?.contains("strip-col") || !el.hasAttribute("data-ready")) continue;
        record.firstReady = { steady: el.hasAttribute("data-steady") };
      }
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ["data-ready", "data-steady"] });
  });
  return () => page.evaluate(() => (window as unknown as { __strip: FirstLayout }).__strip);
}

const reducedAttr = (page: import("@playwright/test").Page) => page.evaluate(() => document.documentElement.hasAttribute("data-reduced"));
const touchAction = (page: import("@playwright/test").Page) => page.locator(column).evaluate((el) => getComputedStyle(el).touchAction);

test("a short window (1440 × 560) is steady from its first layout, with no layout shift", async ({ page }) => {
  // Steady from height alone: 372px of region gives a rest pitch under 2.2px, with or without reduced motion.
  await page.setViewportSize({ width: 1440, height: 560 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const read = await recordFirstLayout(page);
  await openCatalog(page, ruleUrl("motion-3"));
  await expect(page.locator(column)).toHaveAttribute("data-ready", "");
  expect(await reducedAttr(page)).toBe(false);
  const record = await read();
  expect(record.firstReady).toEqual({ steady: true });
  expect(record.shifts).toBe(0);
  // A steady column scrolls, by touch too; the current rule is scrolled into view.
  expect(await touchAction(page)).toBe("pan-y");
  const current = await page.locator(`${link}[aria-current="page"]`).boundingBox();
  const col = await page.locator(column).boundingBox();
  expect(current!.y).toBeGreaterThanOrEqual(col!.y);
  expect(current!.y).toBeLessThanOrEqual(col!.y + col!.height);
});

test("with reduced motion at 1440 × 900, the first layout is already the steady column", async ({ page }) => {
  // Tall enough for a lens: only reduced motion (the boot script's data-reduced) makes it steady.
  await page.emulateMedia({ reducedMotion: "reduce" });
  const read = await recordFirstLayout(page);
  await openCatalog(page, ruleUrl("motion-3"));
  await expect(page.locator(column)).toHaveAttribute("data-ready", "");
  expect(await reducedAttr(page)).toBe(true);
  const record = await read();
  expect(record.firstReady).toEqual({ steady: true });
  expect(record.shifts).toBe(0);
});

test("control: without reduced motion at 1440 × 900, the column is the lens, not steady", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const read = await recordFirstLayout(page);
  await openCatalog(page, ruleUrl("motion-3"));
  await expect(page.locator(column)).toHaveAttribute("data-ready", "");
  expect(await reducedAttr(page)).toBe(false);
  await expect(page.locator(column)).not.toHaveAttribute("data-steady", /.*/);
  const record = await read();
  expect(record.firstReady).toEqual({ steady: false });
  expect(record.shifts).toBe(0);
  // The lens owns touch: a press scrubs.
  expect(await touchAction(page)).toBe("none");
});
