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

    await page.getByRole("radio", { name: "Do", exact: true }).tap();
    // A touch screen gets no key hints: the view control and a tap do the job.
    await expect(page.locator(".cmp-hint")).toBeHidden();
    await canvas.tap();
    await expect(page.getByRole("group", { name: "Comparison, showing Don’t." })).toBeVisible();
    await expect(page.getByRole("radio", { name: "Don’t", exact: true })).toBeChecked();
    await canvas.tap();
    await expect(page.getByRole("group", { name: "Comparison, showing Do." })).toBeVisible();
    await canvas.tap();
    await expect(page.getByRole("group", { name: "Comparison, showing Don’t." })).toBeVisible();

    await page.getByRole("button", { name: "2× zoom (Z)", exact: true }).tap();
    await expect(page.getByRole("button", { name: "2× zoom (Z)", exact: true })).toHaveAttribute("aria-pressed", "true");
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
    await page.getByRole("radio", { name: "Do", exact: true }).tap();
    await expect(page.getByRole("group", { name: "Comparison, showing Do." })).toBeVisible();
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

  test("taps pin at 2× while a drag pans the measured preview", async ({ page }) => {
    await openCatalog(page, ruleUrl("comp-7"));
    const canvas = page.locator("[data-compare-canvas]");
    await page.getByRole("radio", { name: "Do", exact: true }).tap();
    await page.getByRole("button", { name: "2× zoom (Z)", exact: true }).tap();
    await page.getByRole("button", { name: "Measure (M)", exact: true }).tap();
    const target = canvas.locator("[data-side=do]").getByText("Share", { exact: true });
    await expect.poll(() => canvas.evaluate((element) => getComputedStyle(element).getPropertyValue("--cmp-mode-progress"))).toBe("1");
    await canvas.scrollIntoViewIfNeeded();
    const visibleCenter = await target.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const pane = element.closest(".cmp-pane")!.getBoundingClientRect();
      return { x: (Math.max(rect.left, pane.left) + Math.min(rect.right, pane.right)) / 2, y: (rect.top + rect.bottom) / 2 };
    });
    await page.touchscreen.tap(visibleCenter.x, visibleCenter.y);
    const pinned = page.getByRole("heading", { name: "Do · Share" });
    await expect(pinned).toBeVisible();
    const bounds = await canvas.boundingBox();
    if (!bounds) throw new Error("The canvas should have a box");
    const x = bounds.x + bounds.width / 2;
    const y = bounds.y + bounds.height / 2;
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + 30, y: y - 15 }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await cdp.detach();
    await expect.poll(() => canvas.evaluate((element) => element.style.getPropertyValue("--cmp-pan-x"))).toBe("30px");
    await expect(pinned).toBeVisible();
    await expect(canvas).toHaveAttribute("aria-label", "Comparison, showing Do.");
  });
});

test("desktop offers Both, Do and Don’t in one view control, and Space blinks to the other side", async ({ page }) => {
  await openCatalog(page, ruleUrl("comp-1"));
  const view = page.getByRole("radiogroup", { name: "Comparison view (F)", exact: true });
  await expect(view.getByRole("radio")).toHaveText(["Both", "Do", "Don’t"]);
  await expect(page.getByRole("radio", { name: "Both", exact: true })).toBeChecked();
  await expect(page.locator(".cmp-hint")).toHaveText("");
  await page.locator("[data-compare-canvas]").hover();
  await page.getByRole("radio", { name: "Do", exact: true }).click();
  await expect(page.locator(".cmp-hint")).toHaveText("Hold Space for Don’t");
  const canvas = page.locator("[data-compare-canvas]");
  await canvas.focus();
  await expect(canvas).toBeFocused();
  await expect(canvas).toHaveAttribute("aria-label", "Comparison, showing Do.");
  await page.keyboard.down("Space");
  await expect(canvas).toHaveAttribute("aria-label", "Comparison, showing Don’t.");
  // The control keeps the chosen side while a hold blinks the canvas.
  await expect(page.getByRole("radio", { name: "Do", exact: true })).toBeChecked();
  await page.keyboard.up("Space");
  await expect(canvas).toHaveAttribute("aria-label", "Comparison, showing Do.");
  // F cycles Both → Do → Don’t → Both.
  await page.keyboard.press("f");
  await expect(page.getByRole("radio", { name: "Don’t", exact: true })).toBeChecked();
  await page.keyboard.press("f");
  await expect(page.getByRole("radio", { name: "Both", exact: true })).toBeChecked();
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

  test("Both keeps the panes side by side and the dock has full-size touch targets", async ({ page }) => {
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
    await page.getByRole("radio", { name: "Don’t", exact: true }).tap();
    await page.getByRole("button", { name: "2× zoom (Z)", exact: true }).tap();
    await expect(page.locator(".cmp-hint")).toBeHidden();
    // Every control the dock must hold, found inside it, so a renamed wrapper cannot pass with nothing checked.
    const dock = page.locator(".cmp-dock");
    const controls = [
      ...["Both", "Do", "Don’t"].map((name) => dock.getByRole("radio", { name, exact: true })),
      dock.getByRole("button", { name: /^Measure\b/ }),
      dock.getByRole("button", { name: /^2× zoom\b/ }),
    ];
    for (const control of controls) {
      await expect(control).toHaveCount(1);
      // At rest: the zoom button was just tapped, and its press scale is still easing back.
      await expect.poll(() => control.evaluate((el) => getComputedStyle(el).transform)).toBe("none");
      const target = await control.boundingBox();
      if (!target) throw new Error("every dock control should have a box");
      expect(target.width).toBeGreaterThanOrEqual(44);
      expect(target.height).toBeGreaterThanOrEqual(44);
    }
  });
});
