import type { Locator, Page } from "@playwright/test";

import { awaitView, expect, openCatalog, readCatalog, ruleUrl, test, wallUrl } from "./helpers";

/*
 * Browser checks for the rail's tooltips, including dismissal after a mouse
 * click and pointer exit. The rail starts collapsed, when its tips are enabled.
 *
 * Timings come from ui/tooltip.tsx: 300 ms to open cold, 0 ms while another
 * tip is open or one closed under 300 ms ago, 150 ms to close.
 */

const OPEN_MS = 300;
const WARM_MS = 300;

const home = (page: Page) => page.locator(".shell-rail .rail-home");
const toggle = (page: Page) => page.locator(".shell-rail .rail-button");
const tip = (page: Page) => page.getByRole("tooltip");

/** A point on the page well away from the rail and from anything with a tooltip. */
const AWAY = { x: 900, y: 500 };

/**
 * Times the tooltip against the pointer. The page records when a pointer
 * arrives on `control` and when a tooltip is next added, so the number is the
 * page's own, not a round trip through the runner.
 */
async function hoverAndTime(page: Page, control: Locator): Promise<number> {
  await page.evaluate(() => {
    const w = window as unknown as { __over: number; __shown: number };
    w.__over = 0;
    w.__shown = 0;
    document.addEventListener("pointerover", () => {
      if (!w.__over) w.__over = performance.now();
    }, { capture: true, once: true });
    new MutationObserver((records, observer) => {
      const added = records.some((record) => [...record.addedNodes].some((node) => node instanceof Element && node.matches('[role="tooltip"]')));
      if (!added) return;
      w.__shown = performance.now();
      observer.disconnect();
    }).observe(document.body, { childList: true });
  });
  await control.hover();
  await expect(tip(page)).toBeVisible();
  return page.evaluate(() => {
    const w = window as unknown as { __over: number; __shown: number };
    return w.__shown - w.__over;
  });
}

/**
 * Resolves in the page once the open tooltip has been removed, and returns
 * when that happened on the page's own clock.
 */
function awaitClosed(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        if (!document.querySelector('[role="tooltip"]')) return resolve(performance.now());
        new MutationObserver((records, observer) => {
          if (document.querySelector('[role="tooltip"]')) return;
          observer.disconnect();
          resolve(performance.now());
        }).observe(document.body, { childList: true });
      }),
  );
}

/** When the pointer last arrived (`hoverAndTime`'s record), on the page's clock. */
const arrivedAt = (page: Page) => page.evaluate(() => (window as unknown as { __over: number }).__over);

test.beforeEach(async ({ page }) => {
  await openCatalog(page, wallUrl());
  // Tips are off while the rail is open, and a fresh profile starts collapsed.
  await expect(toggle(page)).toHaveAttribute("aria-label", "Expand sidebar");
});

test.describe("hover", () => {
  test("shows after 300 ms when cold, and the tip describes its control", async ({ page }) => {
    const control = home(page);
    // Timed on the page's clock: a runner round trip under load can outlast the delay itself.
    const elapsed = await hoverAndTime(page, control);
    expect(elapsed, "still closed for the delay").toBeGreaterThanOrEqual(OPEN_MS - 5);
    await expect(tip(page)).toHaveText("All rules");
    const id = await tip(page).getAttribute("id");
    await expect(control).toHaveAttribute("aria-describedby", id ?? "");
  });

  test("opens no sooner than 300 ms from the pointer arriving", async ({ page }) => {
    const elapsed = await hoverAndTime(page, home(page));
    // A timer cannot fire early; the ceiling only catches a delay that went missing or ballooned.
    expect(elapsed).toBeGreaterThanOrEqual(OPEN_MS - 5);
    expect(elapsed).toBeLessThan(OPEN_MS + 400);
  });

  test("shows at once on a neighbour while one is open", async ({ page }) => {
    await home(page).hover();
    await expect(tip(page)).toHaveText("All rules");
    const elapsed = await hoverAndTime(page, toggle(page));
    expect(elapsed, "0 ms: no delay while a tip is open").toBeLessThan(OPEN_MS / 2);
    await expect(tip(page)).toHaveCount(1);
    await expect(tip(page)).toContainText("Expand sidebar");
  });

  /*
   * Every interval here is read off the page's clock: when the tip closed,
   * when the pointer came back, when the next tip appeared. The runner only
   * moves the pointer. A return that the runner made too late for the warm
   * window (a loaded host) is not a warm attempt at all, so it is tried
   * again rather than misread as a defect.
   */
  test("shows at once for 300 ms after one closed, then is cold again", async ({ page }) => {
    await home(page).hover();
    await expect(tip(page)).toBeVisible();

    const attempts: string[] = [];
    let warm: number | null = null;
    for (let attempt = 0; attempt < 5 && warm === null; attempt++) {
      await page.mouse.move(AWAY.x, AWAY.y);
      const closed = await awaitClosed(page);
      const elapsed = await hoverAndTime(page, home(page));
      const back = (await arrivedAt(page)) - closed;
      attempts.push(`back after ${Math.round(back)} ms, shown after ${Math.round(elapsed)} ms`);
      // Inside the window, with room for the tip's own close to land after the timestamp.
      if (back < WARM_MS - 50) warm = elapsed;
    }
    expect(warm, `a return inside the warm window (${attempts.join("; ")})`).not.toBeNull();
    expect(warm!, "warm: no delay").toBeLessThan(OPEN_MS / 2);

    await page.mouse.move(AWAY.x, AWAY.y);
    const closed = await awaitClosed(page);
    // Waiting longer than asked only makes the tip colder, so a slow runner cannot fail this half.
    await page.waitForTimeout(WARM_MS + 250);
    const cold = await hoverAndTime(page, home(page));
    expect((await arrivedAt(page)) - closed, "the pointer came back after the window").toBeGreaterThanOrEqual(WARM_MS);
    expect(cold, "cold again").toBeGreaterThanOrEqual(OPEN_MS - 5);
  });

  test("closes when the pointer leaves, and nothing stays described", async ({ page }) => {
    const control = home(page);
    await control.hover();
    await expect(tip(page)).toBeVisible();
    await page.mouse.move(AWAY.x, AWAY.y);
    await expect(tip(page)).toHaveCount(0);
    await expect(control).not.toHaveAttribute("aria-describedby", /.+/);
  });
});

test.describe("click", () => {
  test("a click closes the tip, and moving away afterwards does not pin it", async ({ page }) => {
    const control = home(page);
    await control.hover();
    await expect(tip(page)).toBeVisible();

    await control.click();
    await expect(tip(page), "a press closes it").toHaveCount(0);

    // The defect: the click focused the control, and that focus held the tip open after the pointer left.
    await page.mouse.move(AWAY.x, AWAY.y);
    await page.waitForTimeout(800);
    await expect(tip(page)).toHaveCount(0);
    expect(await control.evaluate((element) => element === document.activeElement), "the click did focus the control").toBe(true);
    expect(await control.evaluate((element) => element.matches(":focus-visible")), "a mouse click is not keyboard focus").toBe(false);
    await expect(control).not.toHaveAttribute("aria-describedby", /.+/);
  });

  test("the pointer re-entering after a click shows the tip again", async ({ page }) => {
    const control = home(page);
    await control.hover();
    await expect(tip(page)).toBeVisible();
    await control.click();
    await expect(tip(page)).toHaveCount(0);
    await page.mouse.move(AWAY.x, AWAY.y);
    await page.waitForTimeout(400);
    await control.hover();
    await expect(tip(page)).toBeVisible();
  });
});

test.describe("keyboard", () => {
  /** Tab until the control has focus, as a keyboard user would. */
  async function tabTo(page: Page, control: Locator) {
    for (let press = 0; press < 20; press++) {
      await page.keyboard.press("Tab");
      if (await control.evaluate((element) => element === document.activeElement)) return;
    }
    throw new Error("the control never took keyboard focus");
  }

  test("focus-visible shows the tip at once, described by a matching id", async ({ page }) => {
    const control = home(page);
    await tabTo(page, control);
    expect(await control.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
    await expect(tip(page)).toBeVisible();
    await expect(tip(page)).toHaveText("All rules");
    const id = await tip(page).getAttribute("id");
    expect(id).toBeTruthy();
    await expect(control).toHaveAttribute("aria-describedby", id ?? "");
  });

  test("Tab onward moves the tip with focus; leaving the rail closes it", async ({ page }) => {
    await tabTo(page, home(page));
    await expect(tip(page)).toHaveText("All rules");
    await tabTo(page, toggle(page));
    await expect(tip(page)).toContainText("Expand sidebar");
    await expect(tip(page)).toHaveCount(1);
    await expect(toggle(page)).toHaveAttribute("aria-describedby", (await tip(page).getAttribute("id")) ?? "");
    await expect(home(page)).not.toHaveAttribute("aria-describedby", /.+/);
  });
});

test.describe("Esc", () => {
  test("closes a tip opened by the keyboard, and does not also leave the rule", async ({ page }) => {
    await page.goto(ruleUrl("typo-1"));
    await page.waitForFunction(() => document.documentElement.dataset.input !== undefined);
    const control = home(page);
    for (let press = 0; press < 20; press++) {
      await page.keyboard.press("Tab");
      if (await control.evaluate((element) => element === document.activeElement)) break;
    }
    await expect(tip(page)).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(tip(page)).toHaveCount(0);
    await expect(control).not.toHaveAttribute("aria-describedby", /.+/);
    // The tip took that Esc: the rule is still shown, at its own address.
    expect(await readCatalog(page)).toMatchObject({ view: "rule", url: ruleUrl("typo-1") });

    // The next Esc is the shell's again.
    await page.keyboard.press("Escape");
    await awaitView(page, "gallery");
  });

  test("closes a tip opened by the pointer and lets that Esc through to the rule", async ({ page }) => {
    await openCatalog(page, ruleUrl("typo-1"));
    await home(page).hover();
    await expect(tip(page)).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(tip(page)).toHaveCount(0);
    // A tip the pointer opened owns no Esc: the shell still leaves the rule.
    await awaitView(page, "gallery");
  });

  test("closes a tip opened by the pointer and lets that Esc reach a focused field", async ({ page }) => {
    await home(page).hover();
    await expect(tip(page)).toBeVisible();
    await page.evaluate(() => {
      const field = document.createElement("input");
      field.id = "esc-probe";
      field.setAttribute("aria-label", "Probe");
      document.body.append(field);
      const w = window as unknown as { __escSeen: boolean | null };
      w.__escSeen = null;
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") w.__escSeen = event.defaultPrevented;
      });
      field.focus();
    });
    await expect(tip(page)).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(tip(page)).toHaveCount(0);
    expect(
      await page.evaluate(() => (window as unknown as { __escSeen: boolean | null }).__escSeen),
      "the Esc reached the page, not consumed",
    ).toBe(false);
  });

  test("closes a tip opened by the pointer, and it stays closed until the pointer leaves", async ({ page }) => {
    const control = home(page);
    await control.hover();
    await expect(tip(page)).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(tip(page)).toHaveCount(0);
    await page.waitForTimeout(OPEN_MS + 300);
    await expect(tip(page), "dismissed, not merely delayed").toHaveCount(0);

    await page.mouse.move(AWAY.x, AWAY.y);
    await page.waitForTimeout(300);
    await control.hover();
    await expect(tip(page)).toBeVisible();
  });
});
