import type { Browser, Page, Route } from "@playwright/test";

import { rules } from "../src/data/ui-logic";
import { ruleProse } from "../src/lib/rule-prose-build";
import { PROSE_HEADINGS } from "../src/lib/rule-prose-types";
import {
  ORIGIN,
  awaitView,
  expect,
  openCatalog,
  proseUrl,
  railNeighbour,
  readCatalog,
  ruleUrl,
  sel,
  settledUrl,
  test,
  titleOf,
  wallUrl,
} from "./helpers";

/*
 * The rule view: the prose a reader without script still
 * gets, the phone disclosures, 0 ms paging, the pointer exit's timing, prose
 * that arrives out of order, the copy menu's keys, the 2× zoom transform, and
 * motion readouts that follow the phase playing.
 */

const byId = new Map(rules.map((rule) => [rule.id, rule]));
/** Backtick-quoted code loses its marks on screen (prose-code.ts). */
const shown = (text: string) => text.replace(/`/g, "");
const prose = (id: string) => ruleProse(id)!;

const why = (page: Page) => page.locator('.rv-dd-sec[data-section="why"] .rv-dd-body');
const breaks = (page: Page) => page.locator('.rv-dd-sec[data-section="breaks"] .rv-dd-body');

async function expectSources(page: Page, id: string) {
  const sources = prose(id).sources!;
  const list = why(page).getByRole("list", { name: "Sources" });
  await expect(list.getByRole("link")).toHaveCount(sources.length);
  for (const { title, href } of sources) {
    // References open in a new tab, and their names say so.
    const link = list.getByRole("link", { name: `${title} (opens in a new tab)`, exact: true });
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toHaveAttribute("target", "_blank");
  }
}

async function noScript(browser: Browser, width: number) {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 844 }, baseURL: ORIGIN });
  return { context, page: await context.newPage() };
}

test.describe("prose without script", () => {
  test("the rule document carries the title, both captions and the four deep-dive sections", async ({ request }) => {
    const id = "typo-1";
    const rule = byId.get(id)!;
    const html = await (await request.get(ruleUrl(id))).text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/g, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&#x27;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
    expect(html).toMatch(new RegExp(`<h1[^>]*>${rule.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</h1>`));
    for (const caption of [rule.do, rule.dont]) expect(text).toContain(caption);
    for (const heading of Object.values(PROSE_HEADINGS)) expect(text).toContain(heading);
    const { how, why, breaks, review } = prose(id);
    for (const passage of [...how, why, breaks, ...review]) expect(text).toContain(shown(passage));
    // Nothing of another rule's own prose rides along.
    expect(text).not.toContain(shown(prose(railNeighbour(id, 1)).why));
  });

  test("at 390 with script off, Why it works and What breaks are readable with no interaction", async ({ browser }) => {
    const { context, page } = await noScript(browser, 390);
    await page.goto(ruleUrl("typo-1"));
    await expect(why(page)).toBeVisible();
    await expect(why(page).locator("p")).toHaveText(shown(prose("typo-1").why));
    await expectSources(page, "typo-1");
    await expect(breaks(page)).toBeVisible();
    await expect(breaks(page)).toHaveText(shown(prose("typo-1").breaks));
    await expect(page.locator(".rv-dd-toggle")).toHaveCount(0);
    await context.close();
  });
});

test.describe("phone disclosures", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("after hydration, Why it works and What breaks start collapsed and their buttons toggle them", async ({ page }) => {
    await openCatalog(page, ruleUrl("typo-1"));
    const toggle = (name: string) => page.getByRole("button", { name, exact: true });
    await expect(toggle(PROSE_HEADINGS.how)).toHaveAttribute("aria-expanded", "true");
    for (const [name, body] of [
      [PROSE_HEADINGS.why, why(page)],
      [PROSE_HEADINGS.breaks, breaks(page)],
    ] as const) {
      await expect(toggle(name)).toHaveAttribute("aria-expanded", "false");
      await expect(body).toBeHidden();
      await toggle(name).click();
      await expect(toggle(name)).toHaveAttribute("aria-expanded", "true");
      await expect(body).toBeVisible();
      await toggle(name).click();
      await expect(body).toBeHidden();
    }
  });
});

test.describe("paging", () => {
  test("J and K take 0 ms and focus stays where it was", async ({ page }) => {
    const id = "typo-1";
    await openCatalog(page, ruleUrl(id));
    await page.locator(sel.ruleTitle).focus();
    const step = (key: string) =>
      page.evaluate((key) => {
        const before = document.activeElement;
        document.activeElement?.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
        // Read in the same task: a 0 ms page turn has already committed.
        return {
          title: document.querySelector("[data-rule-title]")?.textContent ?? null,
          morphing: document.documentElement.hasAttribute("data-vt"),
          focusKept: document.activeElement === before,
        };
      }, key);
    expect(await step("j")).toEqual({ title: titleOf(railNeighbour(id, 1)), morphing: false, focusKept: true });
    expect(await step("k")).toEqual({ title: titleOf(id), morphing: false, focusKept: true });
  });

  test("the neighbours' prose is prefetched, so J needs no request of its own", async ({ page }) => {
    const id = "typo-1";
    const next = railNeighbour(id, 1);
    const requested: string[] = [];
    page.on("request", (request) => {
      const { pathname } = new URL(request.url());
      if (pathname.startsWith("/deep-dives/")) requested.push(decodeURIComponent(pathname.slice("/deep-dives/".length)));
    });
    await openCatalog(page, ruleUrl(id));
    // The landing rule came with its document; its neighbours are fetched ahead of time.
    await expect.poll(() => requested).toContain(next);
    expect(requested).not.toContain(id);

    await page.keyboard.press("j");
    await expect(page.locator(sel.ruleTitle)).toHaveText(titleOf(next));
    await expect(why(page).locator("p")).toHaveText(shown(prose(next).why));
    await expectSources(page, next);
    expect(requested.filter((entry) => entry === next)).toHaveLength(1);
  });

  test("prose that arrives out of order shows the rule on screen", async ({ page }) => {
    const id = "typo-1";
    const a = railNeighbour(id, 1);
    const b = railNeighbour(id, 2);
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(`**${proseUrl(a)}`, async (route: Route) => {
      await held;
      await route.fulfill({ response: await route.fetch() });
    });
    await openCatalog(page, ruleUrl(id));

    await page.keyboard.press("j");
    await expect(page.locator(sel.ruleTitle)).toHaveText(titleOf(a));
    await expect(page.locator(".rv-dd")).toHaveAttribute("data-state", "loading");
    await page.keyboard.press("j");
    await expect(page.locator(sel.ruleTitle)).toHaveText(titleOf(b));
    await expect(why(page).locator("p")).toHaveText(shown(prose(b).why));

    release();
    await page.waitForResponse((response) => response.url().endsWith(proseUrl(a)));
    await page.waitForTimeout(300);
    await expect(page.locator(sel.ruleTitle)).toHaveText(titleOf(b));
    await expect(why(page).locator("p")).toHaveText(shown(prose(b).why));
  });

  test("a failed load shows a retry, and the retry loads the prose", async ({ page }) => {
    const id = "typo-1";
    const a = railNeighbour(id, 1);
    let fail = true;
    // A reply that is not this rule's prose is a failure; an aborted request would also log a console error.
    await page.route(`**${proseUrl(a)}`, (route: Route) => (fail ? route.fulfill({ json: { id: a } }) : route.continue()));
    await openCatalog(page, ruleUrl(id));
    await page.keyboard.press("j");
    await expect(page.locator(".rv-dd")).toHaveAttribute("data-state", "error");
    fail = false;
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(why(page).locator("p")).toHaveText(shown(prose(a).why));
  });
});

test.describe("exits and the copy menu", () => {
  test("a pointer exit blurs the page out in 220 ms", async ({ page }) => {
    const id = "typo-5";
    await openCatalog(page, wallUrl());
    await page.locator(sel.tile(id)).click();
    await awaitView(page, "rule");
    const timing = page.evaluate(
      () =>
        new Promise<{ mode: string | null; durations: number[]; filters: string[] }>((resolve) => {
          const root = document.documentElement;
          const observer = new MutationObserver(() => {
            if (root.getAttribute("data-vt") !== "out") return;
            observer.disconnect();
            requestAnimationFrame(() =>
              requestAnimationFrame(() => {
                const outgoing = document
                  .getAnimations()
                  .filter((animation) => (animation.effect as KeyframeEffect | null)?.pseudoElement === "::view-transition-old(root)");
                resolve({
                  mode: root.getAttribute("data-vt"),
                  durations: outgoing.map((animation) => Number(animation.effect?.getTiming().duration)),
                  // Where each outgoing effect ends: the blur is half of the exit, not just its fade.
                  filters: outgoing.flatMap((animation) => {
                    const frames = (animation.effect as KeyframeEffect).getKeyframes();
                    const last = frames[frames.length - 1] as { filter?: string } | undefined;
                    return last?.filter ? [last.filter] : [];
                  }),
                });
              }),
            );
          });
          observer.observe(root, { attributes: true, attributeFilter: ["data-vt"] });
        }),
    );
    await page.locator(sel.exit).click();
    const { mode, durations, filters } = await timing;
    expect(mode).toBe("out");
    expect(durations.length).toBeGreaterThan(0);
    expect(new Set(durations)).toEqual(new Set([220]));
    expect(filters).toContain("blur(8px)");
    await awaitView(page, "gallery");
  });

  test("Tab out of the copy menu closes it; Esc in it closes only the menu, and J never pages from it", async ({ page }) => {
    const id = "typo-1";
    await openCatalog(page, ruleUrl(id));
    const trigger = page.locator(".rv-head").getByRole("button", { name: "Copy rule" });
    const menu = page.locator('.rv-head [role="menu"]');

    await trigger.click();
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("menuitem").first()).toBeFocused();
    await page.keyboard.press("j");
    await expect(page.locator(sel.ruleTitle)).toHaveText(titleOf(id));
    await page.keyboard.press("End");
    await expect(menu.getByRole("menuitem").last()).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(menu).toBeHidden();
    await expect(trigger).not.toBeFocused();

    await trigger.click();
    await expect(menu).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
    await page.waitForTimeout(300);
    expect(await settledUrl(page)).toBe(ruleUrl(id));
    expect((await readCatalog(page)).view).toBe("rule");
  });
});

test.describe("comparison zoom", () => {
  test("Esc from the zoom toggle leaves the rule", async ({ page }) => {
    await openCatalog(page, ruleUrl("typo-1"));
    const zoom = page.getByRole("button", { name: "2× zoom (Z)", exact: true });
    await zoom.focus();
    await expect(zoom).toBeFocused();
    await page.keyboard.press("Escape");
    await awaitView(page, "gallery");
  });

  test("1× is untransformed and 2× is a 2× transform around the 1× box", async ({ page }) => {
    await openCatalog(page, ruleUrl("typo-1"));
    const box = page.locator(".cmp-canvas .cmp-box").first();
    expect(await box.evaluate((el) => getComputedStyle(el).transform)).toBe("none");
    await page.locator("[data-compare-canvas]").hover();
    await page.getByRole("button", { name: "2× zoom (Z)", exact: true }).click();
    await expect.poll(() => box.evaluate((el) => getComputedStyle(el).transform)).toMatch(/^matrix\(2, 0, 0, 2, /);
    await page.locator("[data-compare-canvas]").hover();
    const zoom = page.getByRole("button", { name: "2× zoom (Z)", exact: true });
    await zoom.click();
    // The second press turns 2× off again, not only on.
    await expect(zoom).toHaveAttribute("aria-pressed", "false");
    await expect.poll(() => box.evaluate((el) => getComputedStyle(el).transform)).toBe("none");
  });
});

test.describe("comparison zoom, by hand", () => {
  test("at 2× a drag moves the content as far as the pointer, and touch pans belong to the canvas", async ({ page }) => {
    await openCatalog(page, ruleUrl("typo-1"));
    const canvas = page.locator(".cmp-canvas").first();
    expect(await canvas.evaluate((el) => getComputedStyle(el).touchAction)).toBe("manipulation");
    await page.locator("[data-compare-canvas]").hover();
    await page.getByRole("button", { name: "2× zoom (Z)", exact: true }).click();
    // A pan the browser could claim would end the drag with pointercancel.
    await expect.poll(() => canvas.evaluate((el) => getComputedStyle(el).touchAction)).toBe("none");

    const box = (await canvas.boundingBox())!;
    const from = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(from.x + 40, from.y + 20, { steps: 4 });
    await page.mouse.up();
    expect(await canvas.evaluate((el) => [el.style.getPropertyValue("--cmp-pan-x"), el.style.getPropertyValue("--cmp-pan-y")])).toEqual(["40px", "20px"]);
    await page.locator("[data-compare-canvas]").hover();
    await page.getByRole("button", { name: "2× zoom (Z)", exact: true }).click();
  });
});

test.describe("comparison Measure", () => {
  test("measures both panes and links caption values to their redlines", async ({ page }) => {
    await openCatalog(page, ruleUrl("comp-3"));
    await page.keyboard.press("m");
    const canvas = page.locator("[data-compare-canvas]");
    await expect(canvas.locator(".ml-overlay")).toHaveCount(2);
    const cap = page.locator(".cmp-captions").getByRole("button", { name: "Outer radius, 12px" });
    await cap.click();
    await expect(cap).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.locator('[data-group="0"][data-dim]')).toHaveCount(0);
    await expect(canvas.locator('[data-group="1"][data-dim]')).toHaveCount(2);
    await page.keyboard.press("Escape");
    await expect(canvas.locator(".ml-overlay")).toHaveCount(0);
  });

  test("picks with the keyboard, then Escape closes Measure before leaving the rule", async ({ page }) => {
    await openCatalog(page, ruleUrl("comp-7"));
    const canvas = page.locator("[data-compare-canvas]");
    const measure = page.getByRole("button", { name: "Measure (M)", exact: true });
    await page.keyboard.press("m");
    await expect(measure).toHaveAttribute("aria-pressed", "true");
    await expect(canvas).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Copy measurements" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(measure).toHaveAttribute("aria-pressed", "false");
    await expect(measure).toBeFocused();
    await awaitView(page, "rule");
  });

  test("Enter on the Measure button hands focus to the canvas, so an arrow picks instead of paging", async ({ page }) => {
    await openCatalog(page, ruleUrl("comp-7"));
    const canvas = page.locator("[data-compare-canvas]");
    const measure = page.getByRole("button", { name: "Measure (M)", exact: true });
    await measure.focus();
    await page.keyboard.press("Enter");
    await expect(measure).toHaveAttribute("aria-pressed", "true");
    await expect(canvas).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Copy measurements" })).toBeVisible();
    // Still on comp-7: the arrow picked an element rather than paging to the next rule.
    expect(new URL(page.url()).pathname).toBe(ruleUrl("comp-7"));
  });

  test("Enter on the Measure button hands focus to the canvas on authored marks too, as M does", async ({ page }) => {
    await openCatalog(page, ruleUrl("comp-3"));
    const measure = page.getByRole("button", { name: "Measure (M)", exact: true });
    await measure.focus();
    await page.keyboard.press("Enter");
    await expect(measure).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-compare-canvas]")).toBeFocused();
    await expect(page.locator("[data-compare-canvas] .ml-overlay")).toHaveCount(2);
    await page.keyboard.press("Escape");
    await expect(measure).toHaveAttribute("aria-pressed", "false");
    await expect(measure).toBeFocused();
  });

  test("Escape on a focused dock tooltip closes only the tooltip, then Measure", async ({ page }) => {
    await openCatalog(page, ruleUrl("comp-7"));
    const measure = page.getByRole("button", { name: "Measure (M)", exact: true });
    const zoom = page.getByRole("button", { name: "2× zoom (Z)", exact: true });
    await page.keyboard.press("m");
    await expect(measure).toHaveAttribute("aria-pressed", "true");
    await zoom.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(zoom).toBeFocused();
    const tip = page.getByRole("tooltip").filter({ hasText: "2× zoom" });
    await expect(tip).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(tip).toBeHidden();
    await expect(measure).toHaveAttribute("aria-pressed", "true");
    await expect(zoom).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(measure).toHaveAttribute("aria-pressed", "false");
    await awaitView(page, "rule");
  });

  test("pins a preview element, measures its neighbor and copies CSS pixels at either zoom", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await openCatalog(page, ruleUrl("comp-7"));
    const pane = page.locator("[data-compare-canvas] [data-side=do]");
    const panel = page.getByRole("region", { name: "Measurements" });
    const gap = panel.getByText("Gap to Share", { exact: true });
    const centre = async (label: string) => {
      const box = await pane.getByText(label, { exact: true }).boundingBox();
      if (!box) throw new Error(`Preview element ${label} should have a box`);
      return [box.x + box.width / 2, box.y + box.height / 2] as const;
    };
    await pane.hover();
    await page.getByRole("button", { name: "Measure (M)", exact: true }).click();
    await page.mouse.move(...await centre("Archive"));
    await expect(pane.locator(".ml-overlay")).toBeVisible();
    await page.mouse.click(...await centre("Archive"));
    await expect(panel.getByRole("heading", { name: "Do · Archive" })).toBeVisible();
    await expect(panel.getByText("Half-leading", { exact: true })).toBeVisible();
    await page.keyboard.down("Alt");
    await page.mouse.move(...await centre("Share"));
    await expect(gap).toBeVisible();
    await page.keyboard.up("Alt");
    await expect(gap).toBeHidden();
    await page.mouse.click(...await centre("Share"));
    await expect(gap).toBeVisible();
    const size = await panel.getByText("Box size", { exact: true }).locator("..").locator("dd").textContent();
    const values = await panel.locator("dd").allTextContents();
    await page.locator("[data-compare-canvas]").hover();
    await page.getByRole("button", { name: "2× zoom (Z)", exact: true }).click();
    await expect(panel.locator("dd")).toHaveText(values);
    await panel.getByRole("button", { name: "Copy measurements" }).click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain(`Box size: ${size}`);
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain(`Gap to Share: ${values.at(-1)}`);
  });
});

test.describe("motion gestures", () => {
  const canvas = (page: Page) => page.locator(".cmp-canvas[data-gesture]");
  /** Every animation running in the canvas's scenes, by its playback rate. */
  const rates = (page: Page) =>
    canvas(page).evaluate((el) => [...el.querySelectorAll(".cmp-scene")].flatMap((scene) => scene.getAnimations({ subtree: true }).map((a) => a.playbackRate)));

  test("a press demo plays at full speed, and a held Space never scrolls the page", async ({ page }) => {
    await openCatalog(page, ruleUrl("motion-8"));
    await canvas(page).focus();
    await page.evaluate(() => {
      const w = window as unknown as { __spaces: boolean[] };
      w.__spaces = [];
      window.addEventListener("keydown", (event) => {
        if (event.key === " ") w.__spaces.push(event.defaultPrevented);
      });
    });
    await page.keyboard.down(" ");
    await page.keyboard.down(" ");
    await page.keyboard.down(" ");
    const playing = await rates(page);
    expect(playing.length).toBeGreaterThan(0);
    expect(new Set(playing)).toEqual(new Set([1]));
    await page.keyboard.up(" ");
    const spaces = await page.evaluate(() => (window as unknown as { __spaces: boolean[] }).__spaces);
    expect(spaces, "every Space, repeats included, is consumed").toEqual([true, true, true]);
  });

  test("a hover demo answers Enter, Space and a click with no pointer behind it", async ({ page }) => {
    await openCatalog(page, ruleUrl("motion-16"));
    const el = canvas(page);
    await expect(el).toHaveAttribute("role", "button");
    // An assistive click (detail 0) after a mouse press elsewhere: toggles on, then off.
    await page.locator(sel.ruleTitle).click();
    await el.evaluate((node) => (node as HTMLElement).click());
    await expect(el).toHaveAttribute("data-live", "true");
    await el.evaluate((node) => (node as HTMLElement).click());
    await expect(el).not.toHaveAttribute("data-live", /.*/);

    await el.evaluate((node) => (node as HTMLElement).focus());
    for (const key of ["Enter", " "]) {
      const before = await el.getAttribute("data-live");
      await page.keyboard.press(key);
      if (before === null) await expect(el, `${key} turns it on`).toHaveAttribute("data-live", "true");
      else await expect(el, `${key} turns it off`).not.toHaveAttribute("data-live", /.*/);
    }
  });

  test("motion-2's K plays the demo while it has focus, and never pages", async ({ page }) => {
    await openCatalog(page, ruleUrl("motion-2"));
    const play = page.locator(".cmp-bar .cmp-ctl");
    await expect(play).toHaveText(/Press K/);
    await play.focus();
    await page.keyboard.press("k");
    await expect(page.locator(".cmp-canvas")).toHaveAttribute("data-live", "true");
    await expect(page.locator(".cmp-pane-ms")).toHaveText(["0ms · focus", "180ms · focus"]);
    const query = page.locator(".cmp-pane input[data-anim=query]");
    await expect(query.first()).toHaveValue("op");
    await expect(query.first()).toHaveCSS("opacity", "1");
    await expect(query.last()).toHaveValue("");
    await expect(query.last()).toHaveCSS("opacity", "0");
    await expect(play).toBeFocused();
    expect(await readCatalog(page)).toMatchObject({ view: "rule", url: ruleUrl("motion-2"), title: titleOf("motion-2") });
  });
});

test.describe("motion readouts", () => {
  test("motion-7's Do readout counts the 160 ms dismiss while it plays, then 220 ms again on the next show", async ({ page }) => {
    await openCatalog(page, ruleUrl("motion-7"));
    const toggle = page.locator(".cmp-bar .cmp-ctl");
    const doMs = page.locator(".cmp-pane-ms").first();
    await expect(doMs).toHaveText("220ms");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(doMs).toHaveText("220ms");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(doMs).toHaveText("160ms");
    await toggle.click();
    await expect(doMs).toHaveText("220ms");
  });
});

test.describe("copy menu focus", () => {
  test("Copy rule waits for a format and writes the selected representation", async ({ page }) => {
    const id = "typo-1";
    const rule = byId.get(id)!;
    await openCatalog(page, ruleUrl(id));
    await page.evaluate(() => {
      const writes: string[] = [];
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text: string) => { writes.push(text); },
          readText: async () => writes.join("\n"),
        },
      });
    });
    const trigger = page.locator(".rv-head").getByRole("button", { name: "Copy rule" });
    for (const [format, expected] of [
      ["Copy as plain text", rule.title + " ("],
      ["Copy as Markdown", "## " + rule.title],
      ["Copy link", ORIGIN + "/rules/" + id],
    ]) {
      const contents = await page.evaluate(() => navigator.clipboard.readText());
      await trigger.click();
      await expect(page.getByRole("menuitem", { name: format })).toBeVisible();
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(contents);
      await page.getByRole("menuitem", { name: format }).click();
      const changed = await page.evaluate(() => navigator.clipboard.readText());
      expect(changed.slice(contents.length).trimStart().startsWith(expected)).toBe(true);
      await expect(trigger).toBeVisible();
    }
  });

  test("a slow clipboard never pulls focus back after the reader has moved on", async ({ page }) => {
    const WRITE_MS = 1500;
    await openCatalog(page, ruleUrl("typo-1"));
    await page.evaluate((ms) => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: () => new Promise<void>((resolve) => setTimeout(resolve, ms)) },
      });
    }, WRITE_MS);
    const trigger = page.locator(".rv-head").getByRole("button", { name: "Copy rule" });
    await trigger.click();
    await page.locator('.rv-head [role="menu"]').getByRole("menuitem", { name: "Copy link" }).click();
    // Back on the trigger as the menu closes, long before the write lands.
    await expect(trigger).toBeFocused({ timeout: WRITE_MS / 2 });
    await page.keyboard.press("Tab");
    await expect(trigger).not.toBeFocused();
    const moved = await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 80));
    await page.waitForTimeout(WRITE_MS + 300);
    await expect(trigger, "the write landing later leaves focus alone").not.toBeFocused();
    expect(await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 80))).toBe(moved);
  });
});

test.describe("deep dive toggle", () => {
  type Frame = { t: number; changed: boolean; running: boolean; title: number; cmpX: number; cmpY: number; side: number };

  /** Every frame from now until the rule view has been still for 12 frames: where the title, the comparison and the panel are drawn. */
  const recordFrames = (page: Page) =>
    page.evaluate(
      () =>
        new Promise<Frame[]>((resolve) => {
          const frames: Frame[] = [];
          const start = document.documentElement.dataset.deep ?? "";
          const view = document.querySelector(".rv")!;
          const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
          let still = 0;
          const tick = (t: number) => {
            const running = document
              .getAnimations()
              .some((animation) => {
                const target = (animation.effect as KeyframeEffect | null)?.target;
                return animation.playState === "running" && target instanceof Element && view.contains(target);
              });
            const changed = (document.documentElement.dataset.deep ?? "") !== start;
            frames.push({
              t,
              changed,
              running,
              title: rect("[data-rule-title]").left,
              cmpX: rect(".rv-compare").left,
              cmpY: rect(".rv-compare").top,
              side: rect(".rv-side").left,
            });
            still = changed && !running ? still + 1 : 0;
            if (still >= 12 || frames.length > 240) resolve(frames);
            else requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }),
    );

  /** The toggle's own motion in the rule view (not hover colour transitions), read in the frame after an action. */
  const runningIn = (page: Page) =>
    page.evaluate(
      () =>
        new Promise<number[]>((resolve) =>
          requestAnimationFrame(() => {
            const view = document.querySelector(".rv")!;
            resolve(
              document
                .getAnimations()
                .filter((animation) => {
                  const target = (animation.effect as KeyframeEffect | null)?.target;
                  return !(animation instanceof CSSTransition) && target instanceof Element && view.contains(target);
                })
                .map((animation) => Number(animation.effect?.getTiming().duration)),
            );
          }),
        ),
    );

  for (const [step, ms] of [
    ["closing", 140],
    ["opening", 220],
  ] as const) {
    test(`a click ${step} it slides the reading column in one ${ms} ms step and ends exactly on the layout`, async ({ page }) => {
      await openCatalog(page, ruleUrl("typo-1"));
      const toggle = page.locator(".rv-head").getByRole("button", { name: "Deep dive", exact: true });
      if (step === "opening") {
        await page.keyboard.press("i");
        await expect(toggle).toHaveAttribute("aria-expanded", "false");
      }
      const before = await page.locator(sel.ruleTitle).evaluate((el) => el.getBoundingClientRect().left);
      const frames = recordFrames(page);
      await toggle.click();
      expect(await runningIn(page), "every part runs on the rail drawer's timing").not.toEqual([]);
      const record = await frames;
      const after = record.filter((frame) => frame.changed);
      const end = after.at(-1)!;
      expect(after.length).toBeGreaterThan(4);
      // The commit frame draws the column where it was: no jump at the start.
      expect(Math.abs(after[0].title - before)).toBeLessThan(1);
      expect(record.some((frame) => frame.changed && frame.running), "it animated").toBe(true);
      // One continuous move: every frame between where it was and where it ends, never past either.
      const lo = Math.min(before, end.title) - 0.5;
      const hi = Math.max(before, end.title) + 0.5;
      for (const frame of after) {
        expect(frame.title).toBeGreaterThanOrEqual(lo);
        expect(frame.title).toBeLessThanOrEqual(hi);
      }
      const sign = Math.sign(end.title - before);
      after.slice(1).forEach((frame, index) => expect(sign * (frame.title - after[index].title)).toBeGreaterThanOrEqual(-0.5));
      // Once it stops, nothing moves again: the last animated frame is the layout itself.
      const settled = after.slice(after.findLastIndex((frame) => frame.running) + 1);
      expect(settled.length).toBeGreaterThanOrEqual(12);
      for (const frame of settled) {
        expect({ title: frame.title, cmpX: frame.cmpX, cmpY: frame.cmpY, side: frame.side }).toEqual({
          title: end.title,
          cmpX: end.cmpX,
          cmpY: end.cmpY,
          side: end.side,
        });
      }
      const layout = await page.evaluate(() => ({
        title: document.querySelector("[data-rule-title]")!.getBoundingClientRect().left,
        cmpY: document.querySelector(".rv-compare")!.getBoundingClientRect().top,
      }));
      expect(layout).toEqual({ title: end.title, cmpY: end.cmpY });
      // With the dive hidden the column re-centres at its 1040 cap; shown, it returns to the left edge.
      expect(Math.sign(end.title - before), "the reading column slides to its new x").toBe(step === "closing" ? 1 : -1);
      for (const frame of after) {
        // The comparison travels with the title, never on its own, and never vertically.
        expect(Math.abs(frame.cmpX - frame.title - (end.cmpX - end.title))).toBeLessThan(1);
        expect(frame.cmpY).toBe(end.cmpY);
      }
    });
  }

  test("each part of a click toggle runs for the drawer's 220 ms in and 140 ms out, and leaves no copy behind", async ({ page }) => {
    await openCatalog(page, ruleUrl("typo-1"));
    const toggle = page.locator(".rv-head").getByRole("button", { name: "Deep dive", exact: true });
    await toggle.click();
    expect(new Set(await runningIn(page))).toEqual(new Set([140]));
    await expect(page.locator(".rv-ghost"), "the leaving copy is removed when it ends").toHaveCount(0);
    await toggle.click();
    expect(new Set(await runningIn(page))).toEqual(new Set([220]));
  });

  test("I and Enter on the button toggle it in the same frame, with nothing animating", async ({ page }) => {
    await openCatalog(page, ruleUrl("typo-1"));
    const title = page.locator(sel.ruleTitle);
    const x = () => title.evaluate((el) => el.getBoundingClientRect().left);
    const open = await x();
    await page.keyboard.press("i");
    expect(await runningIn(page)).toEqual([]);
    const closed = await x();
    // Hidden, the column re-centres; with nothing animating, it is already there.
    expect(closed).toBeGreaterThan(open);
    await expect(page.locator(".rv-ghost")).toHaveCount(0);
    const toggle = page.locator(".rv-head").getByRole("button", { name: "Deep dive", exact: true });
    await toggle.focus();
    await page.keyboard.press("Enter");
    expect(await runningIn(page)).toEqual([]);
    expect(await x()).toBe(open);
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  test("at 1920 the docked panel travels from and back to the sheet edge without fading", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await openCatalog(page, ruleUrl("typo-1"));
    await page.keyboard.press("i");
    const opening = await page.evaluate(async () => {
      // Docked, the whole column travels (deep-dive-motion.ts); the dive inside it is only its scroller.
      const side = document.querySelector<HTMLElement>(".rv-stage > .rv-side")!;
      document.querySelector(".rv-head button[aria-controls]")!
        .dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
      const animation = side.getAnimations().find((item) => !(item instanceof CSSTransition))!;
      const frames: { left: number; opacity: number }[] = [];
      await new Promise<void>((resolve) => {
        const tick = () => {
          frames.push({ left: side.getBoundingClientRect().left, opacity: Number(getComputedStyle(side).opacity) });
          if (animation.playState === "finished" || animation.playState === "idle") resolve();
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      const rest = side.getBoundingClientRect();
      return {
        frames,
        rest: rest.left,
        width: rest.width,
        sheetRight: document.querySelector(".shell-sheet")!.getBoundingClientRect().right,
      };
    });
    expect(opening.sheetRight - opening.rest - opening.width, "there is a centred-stage gap to cross").toBeGreaterThan(150);
    expect(opening.frames[0].left).toBeGreaterThanOrEqual(opening.sheetRight - 3);
    expect(opening.frames[0].left - opening.rest).toBeCloseTo(opening.sheetRight - opening.rest, 0);
    expect(opening.frames.every((frame) => frame.opacity === 1)).toBe(true);

    // Also close an opening panel partway through its move: its drawn position already includes its shift.
    for (const interrupt of [false, true]) {
      const closing = await page.evaluate((interrupt) => {
        const toggle = document.querySelector(".rv-head button[aria-controls]")!;
        const click = () => toggle.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
        if (interrupt) {
          click();
          const entering = document.querySelector(".rv-stage > .rv-side")!.getAnimations().find((item) => !(item instanceof CSSTransition))!;
          entering.pause();
          entering.currentTime = 40;
        }
        const start = document.querySelector(".rv-stage > .rv-side")!.getBoundingClientRect().left;
        click();
        const ghost = document.querySelector(".rv-ghost[data-surface]")!;
        const animation = ghost.getAnimations().find((item) => !(item instanceof CSSTransition))!;
        animation.pause();
        animation.currentTime = 0;
        const first = ghost.getBoundingClientRect().left;
        animation.currentTime = 139.999;
        const last = ghost.getBoundingClientRect().left;
        const opacity = Number(getComputedStyle(ghost).opacity);
        animation.finish();
        return { start, first, last, opacity, sheetRight: document.querySelector(".shell-sheet")!.getBoundingClientRect().right };
      }, interrupt);
      expect(closing.first).toBeCloseTo(closing.start, 0);
      expect(closing.last).toBeCloseTo(closing.sheetRight, 0);
      expect(closing.opacity).toBe(1);
      await expect(page.locator(".rv-ghost")).toHaveCount(0);
    }
  });

  for (const width of [1111, 1510]) {
    test(`form-5 at ${width} keeps Related clear of every deep-dive transition frame`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await openCatalog(page, ruleUrl("form-5"));
      await page.locator(".shell-sheet").evaluate(async (sheet) => {
        sheet.scrollTop = 180;
        await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      });
      const result = await page.evaluate(async () => {
        const button = document.querySelector<HTMLButtonElement>(".rv-head button[aria-controls]")!;
        const panel = document.getElementById("rule-deep-dive")!;
        const related = document.querySelector<HTMLElement>(".rv-related")!;
        const main = document.querySelector<HTMLElement>(".rv-compare")!;
        const ship = document.querySelector<HTMLElement>(".rv-ship")!;
        const docked = getComputedStyle(related.parentElement!).display !== "contents";
        const firstMain = main.getBoundingClientRect();
        const firstRelated = related.getBoundingClientRect();
        const sheetTop = document.querySelector(".shell-sheet")!.scrollTop;
        const samples: { gap: number; relatedShift: number; mainShift: number }[] = [];
        const reversals: number[] = [];
        const click = () => button.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
        // Docked, the column itself (or its exit copy) travels and carries Related
        // with it: measure Related and the gap inside that surface. The main
        // column re-centres sideways there, so only its vertical position is fixed.
        const side = related.parentElement!;
        const firstSide = side.getBoundingClientRect();
        const surface = () => document.querySelector<HTMLElement>(".rv-ghost") ?? (docked ? side : panel);
        function record() {
          const box = surface().getBoundingClientRect();
          const links = (docked ? surface().querySelector(".rv-related")! : related).getBoundingClientRect();
          const card = docked ? surface().querySelector(".rv-dd-card")!.getBoundingClientRect() : box;
          const compare = main.getBoundingClientRect();
          const vertical = Math.abs(compare.top - firstMain.top);
          samples.push({
            gap: docked ? links.top - card.bottom : Math.min(links.top, ship.getBoundingClientRect().top) - box.bottom,
            relatedShift: docked
              ? Math.max(Math.abs(links.top - box.top - (firstRelated.top - firstSide.top)), Math.abs(links.left - box.left - (firstRelated.left - firstSide.left)))
              : Math.max(Math.abs(links.top - firstRelated.top), Math.abs(links.left - firstRelated.left)),
            mainShift: docked ? vertical : Math.max(vertical, Math.abs(compare.left - firstMain.left)),
          });
        }
        // Record actual painted frames in each direction, then reverse a second
        // close partway through. Both sides of that interruption must coincide.
        async function travel(reverse = false) {
          click();
          let effect = surface().getAnimations()[0];
          const started = performance.now();
          record();
          while (effect.playState !== "finished" && effect.playState !== "idle") {
            await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
            if (effect.playState !== "running") break;
            record();
            if (reverse && performance.now() - started >= 35) {
              const before = surface().getBoundingClientRect();
              click();
              const after = surface().getBoundingClientRect();
              reversals.push(Math.max(Math.abs(after.left - before.left), Math.abs(after.top - before.top), Math.abs(after.height - before.height)));
              effect = surface().getAnimations()[0];
              reverse = false;
              record();
            }
          }
        }
        await travel();
        await travel();
        await travel(true);
        return { docked, samples, reversals, sheetTop };
      });
      expect(result.docked).toBe(width === 1510);
      expect(result.sheetTop).toBeGreaterThan(0);
      expect(result.samples.length).toBeGreaterThan(6);
      expect(Math.min(...result.samples.map(frame => frame.gap))).toBeGreaterThanOrEqual(-1);
      expect(Math.max(...result.samples.map(frame => frame.mainShift))).toBeLessThan(1);
      if (result.docked) expect(Math.max(...result.samples.map(frame => frame.relatedShift))).toBeLessThan(1);
      expect(result.reversals).toHaveLength(1);
      expect(result.reversals[0]).toBeLessThan(1);
    });
  }

  for (const action of ["click", "I", "Enter"]) {
    test(`the first-visit hint disappears in the same frame as a deep-dive ${action} toggle`, async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await openCatalog(page, ruleUrl("typo-1"));
      await expect(page.locator(".strip-hint")).toBeVisible();
      const result = await page.evaluate(async (action) => {
        const toggle = document.querySelector<HTMLElement>(".rv-head button[aria-controls]")!;
        if (action === "I") document.dispatchEvent(new KeyboardEvent("keydown", { key: "i", bubbles: true }));
        else toggle.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: action === "click" ? 1 : 0 }));
        await new Promise(requestAnimationFrame);
        return { deep: toggle.getAttribute("aria-expanded"), hint: Boolean(document.querySelector(".strip-hint")) };
      }, action);
      expect(result).toEqual({ deep: "false", hint: false });
    });
  }

  test("the header hairline follows the pointer opening duration and easing", async ({ page }) => {
    await openCatalog(page, ruleUrl("typo-1"));
    await page.keyboard.press("i");
    const timing = await page.evaluate(() => {
      document.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
      document.querySelector(".rv-head button[aria-controls]")!
        .dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
      const style = getComputedStyle(document.querySelector(".rv-head")!);
      return { duration: style.transitionDuration, easing: style.transitionTimingFunction };
    });
    expect(timing).toEqual({ duration: "0.22s", easing: "cubic-bezier(0.32, 0.72, 0, 1)" });
  });

  /** Both transformed parents and the visible controls must return to their layout. */
  const effects = (page: Page) => page.evaluate(() => ({
    ghosts: document.querySelectorAll(".rv-ghost").length,
    transforms: [...document.querySelectorAll(".rv-head > :not(.rv-spacer), .rv-main, .rv-title, .rv-compare, .rv-side, .rv-dd, .rv-ship, .rv-related, .rv-next")]
      .map((el) => getComputedStyle(el).transform).filter((transform) => transform !== "none"),
    animations: document.querySelector(".rv")?.getAnimations({ subtree: true })
      .filter((animation) => !(animation instanceof CSSTransition)).length ?? 0,
  }));
  const clean = { ghosts: 0, transforms: [], animations: 0 };
  const closeThenKey = (page: Page, key: string, delay = 0) => page.evaluate(async ({ key, delay }) => {
    document.querySelector(".rv-head button[aria-controls]")!
      .dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    const target = key === "Enter" ? document.querySelector(".rv-head button[aria-controls]")! : document;
    if (key === "Enter") (target as HTMLElement).click();
    else target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
  }, { key, delay });

  for (const key of ["i", "Enter"]) {
    test(`Close then ${key} at 50 ms cancels the exit before reopening instantly`, async ({ page }) => {
      await openCatalog(page, ruleUrl("typo-1"));
      await closeThenKey(page, key, 50);
      await expect(page.locator(".rv-head button[aria-controls]")).toHaveAttribute("aria-expanded", "true");
      expect(await effects(page)).toEqual(clean);
      await page.waitForTimeout(300);
      expect(await effects(page)).toEqual(clean);
    });
  }

  for (const key of ["j", "k"]) {
    test(`Close then ${key.toUpperCase()} immediately removes the old prose and transforms`, async ({ page }) => {
      const id = "typo-2";
      await openCatalog(page, ruleUrl(id));
      await closeThenKey(page, key);
      await expect(page.locator(sel.ruleTitle)).toHaveText(titleOf(railNeighbour(id, key === "j" ? 1 : -1)));
      expect(await effects(page)).toEqual(clean);
      await page.waitForTimeout(300);
      expect(await effects(page)).toEqual(clean);
    });
  }

  for (const action of ["beforematch", "storage"]) {
    test(`${action} reopening cancels an active exit`, async ({ page }) => {
      await openCatalog(page, ruleUrl("typo-1"));
      await page.evaluate((action) => {
        document.querySelector(".rv-head button[aria-controls]")!
          .dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
        if (action === "beforematch") document.querySelector(".rv-dd")!.dispatchEvent(new Event("beforematch"));
        else {
          localStorage.removeItem("axiom:deep-dive");
          window.dispatchEvent(new StorageEvent("storage", { key: "axiom:deep-dive" }));
        }
      }, action);
      await expect(page.locator(".rv-head button[aria-controls]")).toHaveAttribute("aria-expanded", "true");
      expect(await effects(page)).toEqual(clean);
    });
  }

  for (const destination of ["Related", "palette"]) {
    test(`${destination} navigation cancels a departing panel`, async ({ page }) => {
      await openCatalog(page, ruleUrl("typo-1"));
      await page.evaluate(() => {
        document.querySelector(".rv-head button[aria-controls]")!
          .dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
        // Hold the exit while the next input is made, rather than racing the 140 ms duration.
        for (const animation of document.querySelector(".rv")!.getAnimations({ subtree: true })) {
          if (!(animation instanceof CSSTransition)) animation.pause();
        }
      });
      if (destination === "Related") {
        await page.locator(".rv-related a").first().evaluate((el) => { if (el instanceof HTMLElement) el.click(); });
      } else {
        await page.keyboard.press("ControlOrMeta+k");
        await page.getByRole("dialog", { name: "Search rules" }).getByRole("combobox").fill("kerning");
        await page.keyboard.press("Enter");
      }
      await expect(page.locator(sel.ruleTitle)).not.toHaveText(titleOf("typo-1"));
      expect(await effects(page)).toEqual(clean);
    });
  }

  test("leaving for the wall cancels an active exit", async ({ page }) => {
    await openCatalog(page, ruleUrl("typo-1"));
    await closeThenKey(page, "Escape");
    await awaitView(page, "gallery");
    expect(await effects(page)).toEqual(clean);
  });

  for (const [from, to] of [[1440, 1100], [1100, 1440]]) {
    test(`resizing from ${from} to ${to} during opening cancels effects at the sheet breakpoint`, async ({ page }) => {
      await page.setViewportSize({ width: from, height: 900 });
      await openCatalog(page, ruleUrl("typo-1"));
      await page.keyboard.press("i");
      await page.locator(".rv-head button[aria-controls]").click();
      await page.setViewportSize({ width: to, height: 900 });
      // Two frames allow delivery of the size observation, well before the 220 ms open ends.
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      expect(await effects(page)).toEqual(clean);
      const layout = await page.evaluate(() => {
        const side = document.querySelector(".rv-side")!;
        const panel = document.querySelector(".rv-dd")!.getBoundingClientRect();
        const comparison = document.querySelector(".rv-compare")!.getBoundingClientRect();
        return { display: getComputedStyle(side).display, panelX: panel.left, panelY: panel.top, compareRight: comparison.right, compareBottom: comparison.bottom };
      });
      if (to === 1440) {
        expect(layout.display).toBe("flex");
        expect(layout.panelX).toBeGreaterThan(layout.compareRight);
      } else {
        expect(layout.display).toBe("contents");
        expect(layout.panelY).toBeGreaterThan(layout.compareBottom);
      }
      await page.waitForTimeout(300);
      expect(await effects(page)).toEqual(clean);
    });
  }

  test("hiding the panel with focus on Retry returns focus to the header toggle", async ({ page }) => {
    const next = railNeighbour("typo-1", 1);
    await page.route(`**${proseUrl(next)}`, (route) => route.fulfill({ json: { id: next } }));
    await openCatalog(page, ruleUrl("typo-1"));
    await page.keyboard.press("j");
    const retry = page.locator(".rv-dd").getByRole("button", { name: "Try again" });
    await retry.focus();
    await page.keyboard.press("i");
    await expect(page.locator(".rv-head button[aria-controls]")).toBeFocused();
    await expect(page.locator(".rv-dd")).toBeHidden();
  });

  test("with reduced motion a click is instant too", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openCatalog(page, ruleUrl("typo-1"));
    await page.locator(".rv-head").getByRole("button", { name: "Deep dive", exact: true }).click();
    expect(await runningIn(page)).toEqual([]);
    await expect(page.locator(".rv-ghost")).toHaveCount(0);
  });

  for (const width of [1440, 1280]) {
    test(`at ${width} the inset reading card has its own edges and the header floor is visible at rest`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await openCatalog(page, ruleUrl("typo-1"));
      const edges = await page.evaluate(() => {
        const head = document.querySelector<HTMLElement>(".rv-head")!;
        const side = document.getElementById("rule-deep-dive")!;
        const card = document.querySelector<HTMLElement>(".rv-dd-card")!;
        const related = document.querySelector<HTMLElement>(".rv-related")!;
        const sheet = document.querySelector<HTMLElement>(".shell-sheet")!.getBoundingClientRect();
        const style = getComputedStyle(head);
        return {
          headBottom: head.getBoundingClientRect().bottom,
          sideTop: card.getBoundingClientRect().top,
          cardBottom: card.getBoundingClientRect().bottom,
          cardRadius: getComputedStyle(card).borderRadius,
          relatedTop: related.getBoundingClientRect().top,
          relatedBottom: related.getBoundingClientRect().bottom,
          relatedRadius: getComputedStyle(related).borderRadius,
          relatedBorder: getComputedStyle(related).boxShadow,
          sideBottom: side.getBoundingClientRect().bottom,
          sheetBottom: sheet.bottom,
          divider: getComputedStyle(side).boxShadow,
          radius: getComputedStyle(side).borderRadius,
          floor: style.getPropertyValue("--rv-head-line").trim(),
          line: getComputedStyle(document.documentElement).getPropertyValue("--ax-line").trim(),
          headRight: head.getBoundingClientRect().right,
          sideRight: side.getBoundingClientRect().right,
        };
      });
      expect(edges.divider).toContain("inset");
      // The reading card (a bezel: shell, header row, inset dive) leads the column, 32 under the
      // header (the title's own offset); Related, a bezel too, follows 12 below.
      expect(edges.sideTop - edges.headBottom).toBe(32);
      expect(edges.relatedTop - edges.cardBottom).toBe(12);
      expect(edges.relatedBottom).toBeLessThanOrEqual(edges.sheetBottom);
      expect(edges.cardRadius).toBe("20px");
      expect(edges.relatedRadius).toBe("20px");
      expect(edges.relatedBorder).toContain("0px 0px 0px 1px");
      expect(edges.sideBottom).toBeLessThanOrEqual(edges.sheetBottom);
      // The dive is the shell's inset panel: 20 − 6 padding.
      expect(edges.radius).toBe("14px");
      expect(edges.floor).toBe(edges.line);
      // The header spans the panel too, so its floor meets the divider in a T.
      expect(edges.headRight).toBeGreaterThanOrEqual(edges.sideRight);
    });
  }
});
