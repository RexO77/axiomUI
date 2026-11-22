import { awaitUrl, expect, openCatalog, ruleUrl, test } from "./helpers";

/*
 * Keys inside a phone demo belong to the demo: ←/→ and J/K never page the
 * rule from a demo's list or controls, which would discard what the reader
 * set up there. From the canvas itself they still page.
 */

test("arrows and J/K stay in the departure list; from the canvas they page the rule", async ({ page }) => {
  await openCatalog(page, ruleUrl("mobile-17"));
  const pane = page.getByRole("figure", { name: "Do", exact: true });
  const sheet = pane.getByRole("dialog", { name: "Departures" });
  if (!(await sheet.isVisible())) await pane.getByRole("button", { name: "Departures" }).click();
  const list = sheet.getByRole("region", { name: "Departure list" });
  await list.focus();
  for (const key of ["ArrowRight", "ArrowLeft", "j", "k", "Shift+J", "Shift+K"]) {
    await page.keyboard.press(key);
    await awaitUrl(page, ruleUrl("mobile-17"));
    await expect(list, key).toBeFocused();
  }
  await expect(sheet).toBeVisible();
  // Up and down still scroll the list.
  await page.keyboard.press("PageDown");
  await expect.poll(() => list.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);

  await page.locator(".cmp-canvas").focus();
  await page.keyboard.press("ArrowRight");
  await awaitUrl(page, ruleUrl("mobile-18"));
});

test("Undo in the photo actions gives focus to the restored photo", async ({ page }) => {
  await openCatalog(page, ruleUrl("mobile-14"));
  const pane = page.getByRole("figure", { name: "Do", exact: true });
  const photo = pane.getByRole("group", { name: "Lunar surface photo" });
  await photo.focus();
  await page.keyboard.press("Shift+F10");
  await pane.getByRole("button", { name: "Delete" }).click();
  const undo = pane.getByRole("button", { name: "Undo" });
  await expect(undo).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(pane.getByRole("status")).toHaveText("Photo restored.");
  await expect(photo).toBeFocused();
});

test("Shift+Tab wrapping to the last visit option scrolls it into the half-open sheet, not the page", async ({ page }) => {
  await openCatalog(page, ruleUrl("mobile-18"));
  const pane = page.getByRole("figure", { name: "Do", exact: true });
  const sheet = pane.getByRole("dialog", { name: "Visit options" });
  if (!(await sheet.isVisible())) await pane.getByRole("button", { name: "Visit options" }).click();
  const expand = sheet.getByRole("button", { name: "Expand" });
  await expand.focus();
  const pageTop = () => page.locator(".shell-sheet").evaluate((el) => el.scrollTop);
  const before = await pageTop();
  await page.keyboard.press("Shift+Tab");
  const list = sheet.getByRole("group", { name: "Visit options" });
  const focused = page.locator(":focus");
  await expect(focused).not.toBe(expand);
  const inside = await focused.evaluate((el) => {
    const box = el.closest('[role="group"]')!.getBoundingClientRect(), row = el.getBoundingClientRect();
    return row.top >= box.top - 1 && row.bottom <= box.bottom + 1;
  });
  expect(inside, "the focused row is inside the list's visible area").toBe(true);
  await expect(list).toBeVisible();
  expect(await pageTop(), "the page did not scroll").toBe(before);
});
