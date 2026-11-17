import { expect, openCatalog, ruleUrl, test, wallUrl } from "./helpers";

test.describe("phone catalog and static comparison", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("Both stacks the examples and 2× touch drags pan without flipping or scrolling", async ({ page }) => {
    await openCatalog(page, ruleUrl("comp-1"));
    const canvas = page.locator("[data-compare-canvas]");
    await expect(page.getByRole("radio", { name: "Both", exact: true })).toBeChecked();
    await expect(page.getByRole("radio", { name: "Both", exact: true })).toHaveText("Both");
    const panes = canvas.locator("figure");
    const first = await panes.nth(0).boundingBox();
    const second = await panes.nth(1).boundingBox();
    if (!first || !second) throw new Error("Both previews should have a box");
    expect(second.y).toBeGreaterThan(first.y);

    await page.getByRole("radio", { name: "Flip", exact: true }).tap();
    await expect(page.getByText("Tap the canvas to flip")).toBeVisible();
    await expect(page.getByText(/Hold Space to flip/)).toBeHidden();
    await canvas.tap();
    await expect(page.getByRole("group", { name: "Comparison, showing Don’t." })).toBeVisible();
    await canvas.tap();
    await expect(page.getByRole("group", { name: "Comparison, showing Do." })).toBeVisible();
    await canvas.tap();
    await expect(page.getByRole("group", { name: "Comparison, showing Don’t." })).toBeVisible();

    await page.getByRole("radio", { name: "2×, 200%" }).tap();
    await expect(page.getByText("2× · drag to pan", { exact: true })).toBeVisible();
    await expect(page.getByText("Use Show Do to flip")).toBeVisible();
    await canvas.scrollIntoViewIfNeeded();
    const sheet = page.locator(".shell-sheet");
    const scrollBefore = await sheet.evaluate((element) => element.scrollTop);
    const preview = canvas.locator(".cmp-pane:not([data-off]) .cmp-box");
    const translation = () => preview.evaluate((element) => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
      return { x: matrix.m41, y: matrix.m42 };
    });
    expect(await translation()).toEqual({ x: 0, y: 0 });
    const bounds = await canvas.boundingBox();
    if (!bounds) throw new Error("The canvas should have a box");
    const x = bounds.x + bounds.width / 2;
    const y = Math.max(bounds.y, 48) + 80;
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    for (let delta = 8; delta <= 32; delta += 8) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + delta, y: y - delta }] });
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await cdp.detach();
    await expect.poll(translation).toEqual({ x: 32, y: -32 });
    await expect(canvas).not.toHaveAttribute("data-panning", "");
    await expect(page.getByRole("group", { name: "Comparison, showing Don’t." })).toBeVisible();
    expect(await sheet.evaluate((element) => element.scrollTop)).toBe(scrollBefore);
    await canvas.tap();
    await expect(page.getByRole("group", { name: "Comparison, showing Don’t." })).toBeVisible();
    await page.getByRole("button", { name: "Show Do", exact: true }).tap();
    await expect(page.getByRole("group", { name: "Comparison, showing Do." })).toBeVisible();
    await expect(page.getByText("Use Show Don’t to flip")).toBeVisible();
  });

  test("the floating capsule counts the bottom safe area once", async ({ page }) => {
    await openCatalog(page, wallUrl());
    const capsule = page.locator(".gw-capsule");
    const bottomGap = async () => {
      const bounds = await capsule.boundingBox();
      if (!bounds) throw new Error("The capsule should have a box");
      return 844 - bounds.y - bounds.height;
    };
    for (const inset of [0, 34]) {
      await page.locator(".gw").evaluate((wall, value) => (wall as HTMLElement).style.setProperty("--safe-bottom", `${value}px`), inset);
      expect(await bottomGap()).toBe(32 + inset);
    }
  });
});

test("desktop names the together mode Both and keeps the keyboard shortcut", async ({ page }) => {
  await openCatalog(page, ruleUrl("comp-1"));
  await expect(page.getByRole("radio", { name: "Both", exact: true })).toBeChecked();
  await expect(page.getByRole("radio", { name: "Both", exact: true })).toHaveText("Both");
  await page.getByRole("radio", { name: "Flip", exact: true }).click();
  await expect(page.getByText(/Hold Space to flip/)).toBeVisible();
  await expect(page.getByText("Tap the canvas to flip")).toBeHidden();
  const canvas = page.locator("[data-compare-canvas]");
  await canvas.focus();
  await expect(canvas).toBeFocused();
  await expect(canvas).toHaveAttribute("aria-label", "Comparison, showing Do.");
  await page.keyboard.down("Space");
  await expect(canvas).toHaveAttribute("aria-label", "Comparison, showing Don’t.");
  await page.keyboard.up("Space");
  await expect(canvas).toHaveAttribute("aria-label", "Comparison, showing Do.");
});

test.describe("a landscape phone comparison", () => {
  test.use({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });

  test("the gallery keeps three columns", async ({ page }) => {
    await openCatalog(page, wallUrl());
    const tiles = page.locator(".gw-section").first().locator("[data-rule-link]");
    const bounds = await tiles.evaluateAll((elements) => elements.slice(0, 4).map((element) => {
      const { x, y, width } = element.getBoundingClientRect();
      return { x, y, width };
    }));
    expect(bounds).toHaveLength(4);
    expect(bounds[1].y).toBe(bounds[0].y);
    expect(bounds[2].y).toBe(bounds[0].y);
    expect(bounds[1].x).toBeGreaterThan(bounds[0].x);
    expect(bounds[2].x).toBeGreaterThan(bounds[1].x);
    expect(bounds[3].y).toBeGreaterThan(bounds[0].y);
  });

  test("Both keeps the panes side by side and Flip describes touch gestures", async ({ page }) => {
    await openCatalog(page, ruleUrl("comp-1"));
    await expect(page.getByRole("radio", { name: "Both", exact: true })).toBeChecked();
    await expect(page.getByRole("radio", { name: "Both", exact: true })).toHaveText("Both");
    const canvas = page.locator("[data-compare-canvas]");
    const panes = canvas.locator("figure");
    const first = await panes.nth(0).boundingBox();
    const second = await panes.nth(1).boundingBox();
    if (!first || !second) throw new Error("Both previews should have a box");
    expect(Math.abs(second.y - first.y)).toBeLessThan(1);
    expect(second.x).toBeGreaterThanOrEqual(first.x + first.width);
    await page.getByRole("radio", { name: "Flip", exact: true }).tap();
    await expect(page.getByText("Tap the canvas to flip")).toBeVisible();
    await expect(page.getByText(/Hold Space to flip/)).toBeHidden();
    await page.getByRole("radio", { name: "2×, 200%" }).tap();
    await expect(page.getByText("2× · drag to pan", { exact: true })).toBeVisible();
    await expect(page.getByText("Use Show Don’t to flip")).toBeVisible();
  });
});
