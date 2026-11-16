import { expect, openCatalog, ruleUrl, test, wallUrl } from "./helpers";

test.describe("phone catalog and static comparison", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("the unfiltered catalog explains Axiom UI before the first rule", async ({ page }) => {
    await openCatalog(page, wallUrl());
    await expect(page.getByText("Axiom UI · Interface design rules", { exact: false })).toBeInViewport();
    await expect(page.locator(".gw-wall [data-rule-link]").first()).toBeInViewport();
  });

  test("Both stacks the examples and touch instructions follow the current zoom", async ({ page }) => {
    await openCatalog(page, ruleUrl("comp-1"));
    const canvas = page.locator("[data-compare-canvas]");
    await expect(page.getByRole("radio", { name: "Both", exact: true })).toBeChecked();
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

    await page.getByRole("radio", { name: "2×, 200%" }).tap();
    await expect(page.getByText("2× · drag to pan", { exact: true })).toBeVisible();
    await expect(page.getByText("Use Show Do to flip")).toBeVisible();
    await canvas.tap();
    await expect(page.getByRole("group", { name: "Comparison, showing Don’t." })).toBeVisible();
    await page.getByRole("button", { name: "Show Do", exact: true }).tap();
    await expect(page.getByRole("group", { name: "Comparison, showing Do." })).toBeVisible();
    await expect(page.getByText("Use Show Don’t to flip")).toBeVisible();
  });
});

test("desktop keeps the Side by side label and keyboard shortcut", async ({ page }) => {
  await openCatalog(page, ruleUrl("comp-1"));
  await expect(page.getByRole("radio", { name: "Side by side", exact: true })).toBeChecked();
  await page.getByRole("radio", { name: "Flip", exact: true }).click();
  await expect(page.getByText(/Hold Space to flip/)).toBeVisible();
  await expect(page.getByText("Tap the canvas to flip")).toBeHidden();
});
