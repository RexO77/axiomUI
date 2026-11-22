import type { Page } from "@playwright/test";

import { railCategories } from "../src/data/taxonomy";
import { awaitUrl, awaitView, expect, openCatalog, railIds, ruleUrl, test, titleOf, wallUrl } from "./helpers";

/*
 * What floats over the shell: the ⌘K palette (a real combobox), the
 * shortcuts sheet and its ⌘/ escape hatch, the peek card's timing and its
 * room, the install popover beside the rail, and the theme switch's one
 * crossfade.
 */

const palette = (page: Page) => page.getByRole("dialog", { name: "Search rules" });
const combobox = (page: Page) => palette(page).getByRole("combobox");
const sheet = (page: Page) => page.getByRole("dialog", { name: "Keyboard shortcuts" });
const searchButton = (page: Page) => page.getByRole("button", { name: /^Search \d+ rules$/ });

/** The strip's first-visit hint would sit over the rail; these tests are not about it. */
async function skipHint(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("axiom:strip-hint", "seen");
    } catch {
      // Blocked storage: the hint shows, which none of these tests read.
    }
  });
}

test.beforeEach(async ({ page }) => {
  await skipHint(page);
});

test("⌘K opens a combobox whose active option moves by aria-activedescendant", async ({ page }) => {
  // ⌘K opens the palette in both views; this case starts on a rule (the wall field takes /).
  await openCatalog(page, ruleUrl(railIds[0]));
  await page.keyboard.press("ControlOrMeta+k");
  await expect(palette(page)).toBeVisible();
  const input = combobox(page);
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("aria-expanded", "true");

  const listbox = page.locator(`[id="${await input.getAttribute("aria-controls")}"]`);
  await expect(listbox).toHaveAttribute("role", "listbox");
  const active = async () => {
    const id = await input.getAttribute("aria-activedescendant");
    expect(id, "an active option").toBeTruthy();
    const option = page.locator(`[id="${id}"]`);
    await expect(option).toHaveAttribute("role", "option");
    await expect(option).toHaveAttribute("aria-selected", "true");
    return { id: id!, text: (await option.textContent()) ?? "" };
  };

  // Option ids carry their group, so a rule listed twice (Recent and its category) never collides.
  const first = await active();
  expect(first.id.endsWith(`-${railCategories[0].id}-${railIds[0]}`)).toBe(true);
  expect(first.text).toContain(titleOf(railIds[0]));
  await page.keyboard.press("ArrowDown");
  const second = await active();
  expect(second.id.endsWith(`-${railIds[1]}`)).toBe(true);
  await expect(listbox.locator('[aria-selected="true"]')).toHaveCount(1);

  // Typing ranks matches: the best one is active, and Enter opens it.
  await input.fill("kerning");
  const best = await active();
  const id = best.id.match(/-best-([a-z]+-\d+)$/)?.[1];
  expect(id, "the best match leads").toBeTruthy();
  await page.keyboard.press("Enter");
  await awaitView(page, "rule");
  await expect(palette(page)).toHaveCount(0);
  await awaitUrl(page, ruleUrl(id!));
  await expect(page.locator("[data-rule-title]")).toBeFocused();
});

test("Search, then the palette, then ⌘/, then Esc: focus is back on Search", async ({ page }) => {
  await openCatalog(page, ruleUrl(railIds[3]));
  await searchButton(page).click();
  await expect(combobox(page)).toBeFocused();

  // ⌘/ hands the palette's session to the sheet.
  await page.keyboard.press("ControlOrMeta+/");
  await expect(sheet(page)).toBeVisible();
  await expect(palette(page)).toHaveCount(0);
  await expect(sheet(page).getByRole("button", { name: "Close" })).toBeFocused();

  // The rest of the page is inert under it.
  expect(await page.locator(".shell-sheet").evaluate((el) => Boolean(el.closest("[inert]")))).toBe(true);

  await page.keyboard.press("Escape");
  await expect(sheet(page)).toHaveCount(0);
  await expect(searchButton(page)).toBeFocused();
  await expect(page.locator(".shell")).toHaveAttribute("data-view", "rule");
});

test("⌘/ opens the shortcuts sheet with single keys off", async ({ page }) => {
  await openCatalog(page, wallUrl());
  await page.locator("body").press("Shift+?");
  await expect(sheet(page)).toBeVisible();

  const toggle = sheet(page).getByRole("switch", { name: "Single-key shortcuts" });
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  // The ⌘/ row is never off; single-key rows are.
  await expect(sheet(page).locator("tr[data-off]").first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(sheet(page)).toHaveCount(0);

  await page.locator("body").press("Shift+?");
  await page.waitForTimeout(100);
  await expect(sheet(page), "? is off").toHaveCount(0);

  await page.keyboard.press("ControlOrMeta+/");
  await expect(sheet(page)).toBeVisible();
  await sheet(page).getByRole("switch", { name: "Single-key shortcuts" }).click();
  await expect(sheet(page).locator("tr[data-off]")).toHaveCount(0);
});

/** A rule mark's centre on the strip, at rest. */
async function markCentre(page: Page, index: number) {
  const box = await page.locator(".strip-mark").nth(index).boundingBox();
  if (!box) throw new Error(`no mark ${index}`);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** Times the peek against the pointer: the page records the pointer's arrival and the card's opening. */
async function armPeekClock(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as { __moved: number; __opened: number };
    w.__moved = 0;
    w.__opened = 0;
    document.querySelector(".strip-col")?.addEventListener("pointermove", () => {
      if (!w.__moved) w.__moved = performance.now();
    }, { once: true });
    const card = document.querySelector(".peek")!;
    new MutationObserver((_, observer) => {
      if (!card.hasAttribute("data-open")) return;
      w.__opened = performance.now();
      observer.disconnect();
    }).observe(card, { attributes: true, attributeFilter: ["data-open"] });
  });
}

test("the peek takes 300 ms the first time and swaps at once after", async ({ page }) => {
  await openCatalog(page, wallUrl());
  const card = page.locator(".peek");
  await armPeekClock(page);
  const first = await markCentre(page, 4);
  await page.mouse.move(first.x, first.y);
  await expect(card).toHaveAttribute("data-open", "");
  const waited = await page.evaluate(() => {
    const w = window as unknown as { __moved: number; __opened: number };
    return w.__opened - w.__moved;
  });
  expect(waited).toBeGreaterThanOrEqual(280);
  expect(waited).toBeLessThan(700);
  const title = await card.locator(".peek-name").textContent();

  // A neighbour while open (about two marks down at the lens's 16px pitch): the card
  // swaps without closing.
  const second = { x: first.x, y: first.y + 24 };
  await page.evaluate(() => {
    const card = document.querySelector(".peek")!;
    const w = window as unknown as { __closed: boolean };
    w.__closed = false;
    new MutationObserver(() => {
      if (!card.hasAttribute("data-open")) w.__closed = true;
    }).observe(card, { attributes: true, attributeFilter: ["data-open"] });
  });
  await page.mouse.move(second.x, second.y, { steps: 4 });
  await expect(card.locator(".peek-name")).not.toHaveText(title ?? "", { timeout: 200 });
  expect(await page.evaluate(() => (window as unknown as { __closed: boolean }).__closed)).toBe(false);
});

test("a scrub across a category icon keeps the card up; resting on one closes it", async ({ page }) => {
  await openCatalog(page, wallUrl());
  const card = page.locator(".peek");
  const boundary = railCategories[0].rules.length;
  const before = await markCentre(page, boundary - 2);
  await page.mouse.move(before.x, before.y);
  await expect(card).toHaveAttribute("data-open", "");
  const title = await card.locator(".peek-name").textContent();
  await page.evaluate(() => {
    const card = document.querySelector(".peek")!;
    const w = window as unknown as { __closed: boolean; __crossed: boolean };
    w.__closed = false;
    w.__crossed = false;
    new MutationObserver(() => {
      if (!card.hasAttribute("data-open")) w.__closed = true;
    }).observe(card, { attributes: true, attributeFilter: ["data-open"] });
    // The category icon sits in a hot item of its own on the way to the next run.
    new MutationObserver((records) => {
      for (const record of records) {
        const item = record.target as Element;
        if (item.hasAttribute("data-hot") && item.querySelector(".strip-cat-mark")) w.__crossed = true;
      }
    }).observe(document.querySelector(".strip-col")!, { attributes: true, attributeFilter: ["data-hot"], subtree: true });
  });
  // Read after the lens has opened around the pointer: that is where the marks now sit.
  const after = await markCentre(page, boundary + 1);
  await page.mouse.move(after.x, after.y, { steps: 8 });
  await expect(card.locator(".peek-name")).not.toHaveText(title ?? "", { timeout: 300 });
  const scrub = await page.evaluate(() => {
    const w = window as unknown as { __closed: boolean; __crossed: boolean };
    return { closed: w.__closed, crossed: w.__crossed };
  });
  expect(scrub, "crossed the category icon without the card closing").toEqual({ closed: false, crossed: true });

  // The lens moves the marks with the pointer, so a box read now is stale on arrival:
  // walk back up from the next run, 2px at a time, until the icon is the hot item.
  const iconHot = () => page.evaluate(() => Boolean(document.querySelector(".strip-item[data-hot] .strip-cat-mark")));
  for (let dy = 2; dy <= 80 && !(await iconHot()); dy += 2) {
    await page.mouse.move(after.x, after.y - dy);
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  }
  expect(await iconHot(), "resting on the category icon").toBe(true);
  await expect(card).not.toHaveAttribute("data-open", "");
  await expect(page.locator(".strip-label[data-cat]")).toBeVisible();
});

test("a resize below 900px during the delay opens no peek", async ({ page }) => {
  await openCatalog(page, wallUrl());
  const mark = await markCentre(page, 4);
  await page.mouse.move(mark.x, mark.y);
  await page.setViewportSize({ width: 860, height: 900 });
  await page.waitForTimeout(600);
  await expect(page.locator(".peek")).not.toHaveAttribute("data-open", "");
});

test("the install popover follows a [ collapse", async ({ page }) => {
  await openCatalog(page, wallUrl());
  const row = page.getByRole("button", { name: "Install agent skills: npx skills add RexO77/axiomUI", exact: true });
  // Start expanded, so the collapse moves the row's right edge.
  if ((await page.locator(".shell[data-open]").count()) === 0) {
    await page.locator("body").press("[");
    await expect(page.locator(".shell")).toHaveAttribute("data-open", "");
  }
  await row.click();
  const popover = page.getByRole("dialog", { name: "Install agent skills", exact: true });
  await expect(popover).toBeFocused();
  await expect(popover.locator("code").first()).toHaveText("npx skills add RexO77/axiomUI");

  const gap = async () => {
    const [a, p] = await Promise.all([row.boundingBox(), popover.boundingBox()]);
    return Math.round(p!.x - (a!.x + a!.width));
  };
  // The pointer entrance slides out from the rail into the final 16px gap.
  await expect.poll(gap).toBe(16);
  const before = await popover.boundingBox();

  await page.keyboard.press("[");
  await expect(page.locator(".shell")).not.toHaveAttribute("data-open", "");
  await expect.poll(gap).toBe(16);
  expect((await popover.boundingBox())!.x).toBeLessThan(before!.x);

  // Esc is the popover's own: it closes and focus returns to the row.
  await page.keyboard.press("Escape");
  await expect(popover).toHaveCount(0);
  await expect(row).toBeFocused();
});

test("a theme switch is one crossfade", async ({ page }) => {
  await openCatalog(page, wallUrl());
  const dark = () => page.evaluate(() => document.documentElement.classList.contains("dark"));
  const before = await dark();
  const button = page.getByRole("button", { name: /^Switch to (dark|light) mode$/ });
  await page.evaluate(() => {
    const w = window as unknown as { __animations: Promise<{ kind: string; pseudo: string | null }[]> };
    w.__animations = new Promise((resolve) => {
      new MutationObserver((_, observer) => {
        if (!document.documentElement.dataset.themeFade) return;
        observer.disconnect();
        // Two frames: the capture has run and the crossfade is playing.
        requestAnimationFrame(() => requestAnimationFrame(() => {
          resolve(document.getAnimations().map((animation) => ({
            kind: animation.constructor.name,
            pseudo: (animation.effect as KeyframeEffect | null)?.pseudoElement ?? null,
          })));
        }));
      }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme-fade"] });
    });
  });
  await button.click();
  const animations = await page.evaluate(() => (window as unknown as { __animations: Promise<{ kind: string; pseudo: string | null }[]> }).__animations);
  expect(animations.filter((animation) => animation.kind === "CSSTransition"), "no element tweens").toEqual([]);
  const fades = animations.filter((animation) => animation.pseudo?.startsWith("::view-transition"));
  expect(fades.length).toBeGreaterThan(0);
  expect(fades.every((animation) => animation.pseudo!.endsWith("(root)")), "only the root crossfades").toBe(true);
  expect(await dark()).toBe(!before);
  await expect(page.locator("html")).not.toHaveAttribute("data-theme-fade", /.+/);
});

test("arrows and Enter while an input method is composing belong to the composition", async ({ page }) => {
  await openCatalog(page, ruleUrl(railIds[0]));
  await page.keyboard.press("ControlOrMeta+k");
  const input = combobox(page);
  await expect(input).toBeFocused();
  const before = await input.getAttribute("aria-activedescendant");
  for (const key of ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Enter"]) {
    const prevented = await input.evaluate((el, key) => {
      const event = new KeyboardEvent("keydown", { key, isComposing: true, bubbles: true, cancelable: true });
      el.dispatchEvent(event);
      return event.defaultPrevented;
    }, key);
    expect(prevented, key).toBe(false);
  }
  await expect(palette(page)).toBeVisible();
  await expect(input).toHaveAttribute("aria-activedescendant", before!);
  await awaitUrl(page, ruleUrl(railIds[0]));
});

test("a palette opened on a phone keeps the rail inert when the window widens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openCatalog(page, ruleUrl(railIds[3]));
  await page.keyboard.press("ControlOrMeta+k");
  await expect(palette(page)).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator(".shell-rail")).toBeVisible();
  await expect(palette(page)).toBeVisible();
  // The rail can be neither focused nor clicked behind the open dialog.
  await expect(page.locator(".shell-rail")).toHaveAttribute("inert", "");
  await page.keyboard.press("Escape");
  await expect(palette(page)).toHaveCount(0);
  await expect(page.locator(".shell-rail")).not.toHaveAttribute("inert", "");
});

test("the Agent skills panel expands from the rail popover’s rendered bounds", async ({ page }) => {
  await openCatalog(page, ruleUrl("motion-6"));
  const trigger = page.getByRole("button", { name: "Install agent skills: npx skills add RexO77/axiomUI", exact: true });
  await trigger.click();
  const box = page.getByRole("dialog", { name: "Install agent skills", exact: true });
  await box.evaluate(async el => { await Promise.all(el.getAnimations().map(a => a.finished)); });
  const source = (await box.boundingBox())!;
  const firstFrame = page.evaluate(() => new Promise<{ x: number; y: number; width: number; height: number }>(resolve => {
    const observer = new MutationObserver(() => {
      const panel = document.querySelector(".skill-modal-surface");
      if (!panel) return;
      observer.disconnect();
      const { x, y, width, height } = panel.getBoundingClientRect();
      resolve({ x, y, width, height });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }));
  await box.getByRole("button", { name: "Browse agent skills" }).click();
  const start = await firstFrame;
  for (const key of ["x", "y", "width", "height"] as const) {
    expect(Math.abs(start[key] - source[key]), key).toBeLessThan(1);
  }
  const panel = page.getByRole("dialog", { name: "Agent skills" });
  await expect.poll(async () => (await panel.boundingBox())?.width).toBe(768);
  await panel.getByRole("button", { name: "Close agent skills" }).click();
  await expect(panel).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("the skills dialog keeps ⌘K and ⌘/ from opening anything behind it", async ({ page }) => {
  await openCatalog(page, wallUrl());
  await page.getByRole("button", { name: "Install agent skills: npx skills add RexO77/axiomUI", exact: true }).click();
  await page.getByRole("dialog", { name: "Install agent skills", exact: true }).getByRole("button", { name: "Browse agent skills" }).click();
  const skills = page.getByRole("dialog", { name: "Agent skills" });
  await expect(skills).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(document.activeElement?.closest('[aria-modal="true"]')))).toBe(true);
  await page.keyboard.press("ControlOrMeta+k");
  await page.keyboard.press("ControlOrMeta+/");
  await page.waitForTimeout(100);
  await expect(palette(page)).toHaveCount(0);
  await expect(sheet(page)).toHaveCount(0);
  await expect(skills).toBeVisible();
});

test("the skills dialog reopens on its install view and keeps a loaded playbook", async ({ page }) => {
  let fetches = 0;
  page.on("request", (request) => {
    if (request.url().endsWith("/skills/axiomui-website-upgrade/SKILL.md")) fetches += 1;
  });
  await openCatalog(page, wallUrl());
  const row = page.getByRole("button", { name: "Install agent skills: npx skills add RexO77/axiomUI", exact: true });
  // The dialog takes its name from the view's heading.
  const skills = page.getByRole("dialog", { name: "Agent skills" });
  const playbook = page.getByRole("dialog", { name: "Website upgrade playbook" });
  const browse = async () => {
    await row.click();
    await page.getByRole("dialog", { name: "Install agent skills", exact: true }).getByRole("button", { name: "Browse agent skills" }).click();
    await expect(skills).toBeVisible();
  };
  const preview = async () => {
    await skills.getByRole("button", { name: "Preview the playbook" }).click();
    await expect(playbook.getByRole("heading", { name: "Step 1: Frame" })).toBeVisible();
    await expect(playbook.getByText("Loading preview…")).toHaveCount(0);
  };

  await browse();
  await preview();
  await page.keyboard.press("Escape");
  await expect(playbook).toHaveCount(0);
  await expect(row).toBeFocused();

  // Closed from the preview, it opens again on the install view, and the
  // playbook it already loaded shows without a second request.
  await browse();
  await preview();
  expect(fetches).toBe(1);
});

test.describe("a tablet held upright, touch", () => {
  test.use({ viewport: { width: 820, height: 1180 }, hasTouch: true, isMobile: true });

  /** The element a tap at (x, y) lands on is `selector` or inside it. */
  const hits = (page: Page, selector: string, x: number, y: number) =>
    page.evaluate(({ selector, x, y }) => Boolean(document.elementFromPoint(x, y)?.closest(selector)), { selector, x, y });

  test("every overlay target is at least 44px, without the phone layout", async ({ page }) => {
    await openCatalog(page, ruleUrl(railIds[3]));
    // Not the phone layout: the rail is there and the palette is a centred dialog.
    await expect(page.locator(".shell-rail")).toBeVisible();
    await page.keyboard.press("ControlOrMeta+k");
    await expect(palette(page)).toBeVisible();
    const row = (await palette(page).getByRole("option").first().boundingBox())!;
    expect(row.height).toBeGreaterThanOrEqual(44);
    await page.keyboard.press("ControlOrMeta+/");
    await expect(sheet(page)).toBeVisible();

    for (const [selector, name] of [[".keys-close", "close"], [".keys-switch-track", "switch"]] as const) {
      const box = (await page.locator(selector).boundingBox())!;
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;
      // 22px out from the centre each way is still the control.
      for (const [x, y] of [[cx - 21.5, cy], [cx + 21.5, cy], [cx, cy - 21.5], [cx, cy + 21.5]]) {
        expect(await hits(page, selector, x, y), `${name} at ${x - cx}, ${y - cy}`).toBe(true);
      }
    }
  });
});

for (const width of [1111, 1510]) {
  test(`Related previews keep every link visible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 867 });
    await openCatalog(page, ruleUrl("form-5"));
    const group = page.getByRole("region", { name: "Related" });
    const links = group.getByRole("link");
    await group.scrollIntoViewIfNeeded();
    for (const link of await links.all()) {
      await link.hover();
      const preview = page.locator(".peek[data-open]");
      await expect(preview.locator(".peek-name")).toHaveText(await link.locator(".rv-rrow-title").innerText());
      await expect(preview).toBeVisible();
      const title = link.locator(".rv-rrow-title");
      expect(await title.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      const positions = await page.evaluate(() => {
        const preview = document.querySelector(".peek")!.getBoundingClientRect();
        const related = [...document.querySelectorAll(".rv-related, .rv-related a")].map(el => el.getBoundingClientRect());
        const intersects = related.some(box => preview.left < box.right && preview.right > box.left && preview.top < box.bottom && preview.bottom > box.top);
        return { intersects, withinScreen: preview.left >= 0 && preview.top >= 0 && preview.right <= innerWidth && preview.bottom <= innerHeight };
      });
      expect(positions).toEqual({ intersects: false, withinScreen: true });
    }
  });
}
