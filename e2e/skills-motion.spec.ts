import type { Page } from "@playwright/test";
import { expect, openCatalog, sel, test, wallUrl } from "./helpers";

const rail = (page: Page) => page.getByRole("button", { name: /^Install in your agent/ });
const card = (page: Page) => page.getByRole("dialog", { name: "Install in your agent" });
const workspace = (page: Page) => page.getByRole("dialog", { name: "Agent skills" });

/** Intercept the named dialog's actual split chunk, independent of its production hash. */
async function holdFirstDialogChunk(page: Page, missing = false) {
  let release!: () => void;
  const released = new Promise<void>((resolve) => { release = resolve; });
  let held = false;
  await page.route("**/_next/static/chunks/*.js", async (route) => {
    const response = await route.fetch();
    if (held || !(await response.text()).includes("--skill-source-transform")) {
      await route.fulfill({ response });
      return;
    }
    held = true;
    await released;
    // A valid script that cannot register the expected chunk rejects the import.
    if (missing) await route.fulfill({ contentType: "application/javascript", body: "/* missing chunk */" });
    else await route.fulfill({ response });
  });
  return release;
}

test("Escape cancels a cold Browse without a late dialog or a lost focus position", async ({ page }) => {
  await openCatalog(page, wallUrl());
  const release = await holdFirstDialogChunk(page);
  await rail(page).click();
  const browse = card(page).getByRole("button", { name: "Browse the skills" });
  await browse.focus();
  await browse.press("Enter");
  const pending = card(page).getByRole("button", { name: "Opening skills…" });
  await expect(pending).toBeFocused();
  await pending.press("Enter");
  await pending.press("Escape");
  await expect(rail(page)).toBeFocused();
  const requestDone = page.waitForEvent("requestfinished", (request) => request.resourceType() === "script");
  release();
  await requestDone;
  await expect(workspace(page)).toHaveCount(0);
  await rail(page).click();
  await card(page).getByRole("button", { name: "Browse the skills" }).click();
  await expect(workspace(page)).toHaveCount(1);
});

test("a cold chunk failure leaves a focused retry that can open the dialog", async ({ page }) => {
  await openCatalog(page, wallUrl());
  const release = await holdFirstDialogChunk(page, true);
  await rail(page).click();
  await card(page).getByRole("button", { name: "Browse the skills" }).click();
  await expect(card(page).getByRole("button", { name: "Opening skills…" })).toBeFocused();
  release();
  const retry = card(page).getByRole("button", { name: "Retry opening skills" });
  await expect(retry).toBeFocused();
  await retry.press("Enter");
  await expect(workspace(page)).toHaveCount(1);
  await expect(card(page)).toHaveCount(0);
  await expect.poll(() => workspace(page).evaluate((el) => el.contains(document.activeElement))).toBe(true);
});

test("a phone menu dismissal cancels a cold launch before the drawer finishes leaving", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openCatalog(page, wallUrl());
  const release = await holdFirstDialogChunk(page);
  const opener = page.getByRole("button", { name: "Menu", exact: true });
  await opener.click();
  const menu = page.getByRole("dialog", { name: "All rules" });
  await menu.getByRole("button", { name: "Install in your agent" }).click();
  await expect(menu.getByRole("button", { name: "Opening skills…" })).toBeFocused();
  await menu.getByRole("button", { name: "Close menu" }).click();
  await expect(menu).toBeAttached();
  const received = page.waitForEvent("requestfinished", (request) => request.resourceType() === "script");
  release();
  await received;
  await expect(menu).toHaveCount(0);
  await expect(opener).toBeFocused();
  await expect(workspace(page)).toHaveCount(0);
});

test("the compact install card is readable on its first reduced-motion frame", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openCatalog(page, wallUrl());
  const first = page.evaluate(() => new Promise<string>(resolve => {
    const observer = new MutationObserver(() => {
      const card = document.querySelector(".install-pop");
      if (!card) return;
      observer.disconnect();
      resolve(getComputedStyle(card).opacity);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }));
  await rail(page).click();
  expect(await first).toBe("1");
});

test("the expanding surface keeps heading text and the close icon at their final size", async ({ page }) => {
  await openCatalog(page, wallUrl());
  await rail(page).click();
  type Sample = { width: number; height: number; textWidth: number; textHeight: number; scale: number; opacity: number };
  const readings = page.evaluate(() => new Promise<Sample[]>((resolve) => {
    const samples: Sample[] = [];
    let start = 0;
    function read(t: number) {
      const content = document.querySelector<HTMLElement>(".skill-modal-content");
      const surface = document.querySelector<HTMLElement>(".skill-modal-surface");
      const icon = content?.querySelector('[aria-label="Close agent skills"] svg');
      const heading = content?.querySelector("h2");
      if (content && surface && icon && heading) {
        start ||= t;
        const rect = icon.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(heading);
        const text = range.getBoundingClientRect();
        samples.push({ width: rect.width, height: rect.height, textWidth: text.width, textHeight: text.height,
          scale: surface.getBoundingClientRect().width / surface.offsetWidth, opacity: Number(getComputedStyle(content).opacity) });
        if (t - start > 350) { resolve(samples); return; }
      }
      requestAnimationFrame(read);
    }
    requestAnimationFrame(read);
  }));
  await card(page).getByRole("button", { name: "Browse the skills" }).click();
  const frames = await readings;
  expect(frames.some((frame) => frame.scale < 0.99 && frame.opacity > 0.01)).toBe(true);
  const final = frames.at(-1)!;
  expect(final.opacity).toBe(1);
  expect(final.width).toBeGreaterThan(0);
  expect(final.textWidth).toBeGreaterThan(0);
  for (const frame of frames.filter((frame) => frame.opacity > 0.01)) {
    for (const dimension of ["width", "height", "textWidth", "textHeight"] as const) {
      expect(Math.abs(frame[dimension] - final[dimension])).toBeLessThan(0.5);
    }
    expect(Math.abs(frame.width - frame.height)).toBeLessThan(1);
  }
});

for (const view of ["Agent skills", "Website playbook"]) {
  test(`after a desktop-to-phone resize ${view} dismisses locally and returns focus to Menu`, async ({ page }) => {
    await openCatalog(page, wallUrl());
    await rail(page).click();
    await card(page).getByRole("button", { name: "Browse the skills" }).click();
    if (view === "Website playbook") {
      await workspace(page).getByRole("button", { name: "Preview the playbook" }).click();
    }
    const dialog = page.getByRole("dialog", { name: view });
    await expect(dialog).toHaveAttribute("data-rail-motion", "anchored");
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(dialog).toHaveAttribute("data-rail-motion", "local");
    await dialog.getByRole("button", { name: "Close agent skills" }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Menu", exact: true })).toBeFocused();
  });
}

for (const mode of ["keyboard", "reduced motion"]) {
  test(`${mode} reveals the full workspace on its first rendered frame`, async ({ page }) => {
    if (mode === "reduced motion") await page.emulateMedia({ reducedMotion: "reduce" });
    await openCatalog(page, wallUrl());
    await rail(page).click();
    const firstFrame = page.evaluate(() => new Promise<{ state: string; scale: number; opacity: number }>((resolve) => {
      const observer = new MutationObserver(() => {
        const root = document.querySelector<HTMLElement>(".skill-modal-root");
        const surface = root?.querySelector<HTMLElement>(".skill-modal-surface");
        const content = root?.querySelector<HTMLElement>(".skill-modal-content");
        if (!root || !surface || !content) return;
        observer.disconnect();
        resolve({ state: root.dataset.state!, scale: surface.getBoundingClientRect().width / surface.offsetWidth, opacity: Number(getComputedStyle(content).opacity) });
      });
      observer.observe(document.body, { subtree: true, childList: true });
    }));
    const browse = card(page).getByRole("button", { name: "Browse the skills" });
    if (mode === "keyboard") await browse.press("Enter");
    else await browse.click();
    expect(await firstFrame).toEqual({ state: "open", scale: 1, opacity: 1 });
    await page.keyboard.press("Escape");
    await expect(rail(page)).toBeFocused();
  });
}

test("the compact card hands off its contents and a resized dock returns to the live rail control", async ({ page }) => {
  await openCatalog(page, wallUrl());
  const trigger = rail(page);
  const wall = page.locator(sel.wallLayer);
  await wall.evaluate((element) => { element.scrollTop = 380; });
  const scroll = await wall.evaluate((element) => element.scrollTop);
  expect(scroll).toBeGreaterThan(0);
  await trigger.click();
  const compact = card(page);
  await compact.evaluate(async el => { await Promise.all(el.getAnimations().map(a => a.finished)); });
  const before = (await compact.boundingBox())!;
  const initial = page.evaluate(() => new Promise<{ width: number; opacity: string; inert: boolean }>(resolve => {
    const observer = new MutationObserver(() => {
      const picture = document.querySelector<HTMLElement>(".skill-origin-copy");
      if (!picture) return;
      observer.disconnect();
      resolve({ width: picture.getBoundingClientRect().width, opacity: getComputedStyle(picture).opacity, inert: picture.inert });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }));
  await compact.getByRole("button", { name: "Browse the skills" }).click();
  expect(await initial).toEqual({ width: before.width, opacity: "1", inert: true });
  const modal = workspace(page);
  await expect(modal.locator(".skill-origin-copy")).toHaveCount(0);
  await page.setViewportSize({ width: 1280, height: 700 });
  await expect(modal).toHaveAttribute("data-rail-motion", "anchored");
  // The rail remains inert until dismissal; inspect its current painted rectangle by selector.
  const target = (await page.locator(".install-row .rail-row").boundingBox())!;
  const end = page.evaluate(() => new Promise<{ width: number; x: number; y: number; opacity: number }>(resolve => {
    const root = document.querySelector<HTMLElement>(".skill-modal-root")!;
    const panel = root.querySelector<HTMLElement>(".skill-modal-panel")!;
    const surface = root.querySelector<HTMLElement>(".skill-modal-surface")!;
    let last = { width: 0, x: 0, y: 0, opacity: 1 };
    function sample() {
      if (!root.isConnected) { resolve(last); return; }
      const box = surface.getBoundingClientRect();
      last = { width: box.width, x: box.x, y: box.y, opacity: Number(getComputedStyle(panel).opacity) };
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  }));
  await modal.getByRole("button", { name: "Close agent skills" }).click();
  const last = await end;
  expect(last.width).toBeLessThan(target.width + 14);
  expect(Math.abs(last.x - target.x)).toBeLessThan(4);
  expect(Math.abs(last.y - target.y)).toBeLessThan(8);
  expect(last.opacity).toBeLessThan(0.15);
  await expect(trigger).toBeFocused();
  expect(await wall.evaluate((element) => element.scrollTop)).toBe(scroll);
});
