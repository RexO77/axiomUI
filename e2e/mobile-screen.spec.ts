import { expect, openCatalog, ruleUrl, test } from "./helpers";

test("Pay accepts a tap in its visible part and reports a covered tap separately", async ({ page }) => {
  await openCatalog(page, ruleUrl("mobile-1"));
  const good = page.getByRole("figure", { name: "Do", exact: true });
  const bad = page.getByRole("figure", { name: "Don’t", exact: true });
  const pay = bad.getByRole("button", { name: "Pay", exact: true });
  await good.hover();
  await page.getByRole("button", { name: "Inspect", exact: true }).click();
  await expect(good).toContainText("Action ends at 798 CSS px. 12 clear");
  await expect(bad).toContainText("Action ends at 832 CSS px. 22 covered");
  await pay.scrollIntoViewIfNeeded();
  const rect = await pay.boundingBox();
  if (!rect) throw new Error("Pay is missing");
  await page.mouse.click(rect.x + rect.width / 2, rect.y + rect.height * 0.9);
  await expect(bad.getByRole("status")).toHaveText("Tap covered by the simulated bar.");
  await expect(bad).toContainText("Trial 1 · Miss");
  await page.mouse.click(rect.x + rect.width / 2, rect.y + rect.height * 0.2);
  await expect(bad.getByRole("status")).toHaveText("Payment received.");
  await expect(bad).toContainText("Trial 2 · Hit");
  await page.getByRole("button", { name: "Try lower edge" }).click();
  await expect(bad).toContainText("Trial 2 · Hit");
  await expect(bad).toContainText("Scripted tap 1");
  await page.getByRole("combobox", { name: "Inset", exact: true }).selectOption("0");
  await expect(bad).toContainText("12 clear");
  await page.getByRole("button", { name: "Landscape" }).click();
  await expect(bad.getByRole("status")).toHaveText("Part of Pay is covered.");
  await good.hover();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(good.getByRole("status")).toHaveText("Pay is clear of the bar.");
});

test("Continue can be reached after retracting the toolbar on a narrow screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openCatalog(page, ruleUrl("mobile-2"));
  await page.getByRole("radio", { name: "Don’t", exact: true }).click();
  const pane = page.getByRole("figure", { name: "Don’t" });
  await expect(pane.getByRole("status")).toHaveText("Continue is behind the toolbar.");
  const controls = page.getByRole("button", { name: "Controls", exact: true });
  await controls.click();
  const bar = page.getByRole("slider", { name: "Browser bar height" });
  await bar.focus();
  await bar.press("Home");
  await expect(pane.getByRole("status")).toHaveText("Continue is visible.");
  await bar.press("Escape");
  await expect(controls).toBeFocused();
  await pane.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(pane.getByRole("status")).toHaveText("Continued to payment.");
  await controls.click();
  await bar.focus();
  await bar.press("End");
  await page.getByRole("button", { name: "Try lower edge" }).click();
  await expect(pane.getByRole("status")).toHaveText("Tap covered by the simulated bar.");
});

test("on a phone the frame keeps its place across Do, Don’t and a result that wraps", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openCatalog(page, ruleUrl("mobile-17"));
  const frameTop = (side: "do" | "dont") => page.locator(`.cmp-pane[data-side="${side}"]`).evaluate((pane) =>
    Math.round(pane.querySelector(".mf-bezel")!.getBoundingClientRect().top - pane.getBoundingClientRect().top));
  await page.getByRole("radio", { name: "Do", exact: true }).click();
  const rest = await frameTop("do");
  expect(await frameTop("dont")).toBe(rest);
  // The hidden pane's outcome grows by several lines, which makes both panes taller.
  await page.locator('.cmp-pane[data-side="dont"] [role="status"]').evaluate((status) => {
    status.textContent += " A much longer outcome that wraps onto several more lines than the one it replaces in this pane.";
  });
  expect(await frameTop("do")).toBe(rest);
  await page.getByRole("radio", { name: "Don’t", exact: true }).click();
  expect(await frameTop("dont")).toBe(rest);
});

for (const width of [390, 1440]) {
  test(`a vertical scroll over the phone frame at ${width} scrolls the rule`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await openCatalog(page, ruleUrl("mobile-26"));
    const frame = page.locator(".mf-fit").first();
    const box = await frame.boundingBox();
    if (!box) throw new Error("the phone frame is missing");
    const sheet = page.locator(".shell-sheet");
    expect(await sheet.evaluate((el) => el.scrollTop)).toBe(0);
    await page.mouse.move(box.x + box.width / 2, Math.min(box.y + box.height / 2, 700));
    await page.mouse.wheel(0, 300);
    await expect.poll(() => sheet.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  });
}
