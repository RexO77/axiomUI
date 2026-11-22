import { searchRules } from "../src/lib/rule-search";
import { awaitInteractive, awaitView, expect, openCatalog, ruleUrl, sheetInert, test, titleOf, wallUrl } from "./helpers";

test.describe("touch search can show the filtered gallery", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  for (const [name, url] of [["unfiltered", wallUrl()], ["query", wallUrl({ q: "contrast" })], ["collection", wallUrl({ collection: "accessibility" })]] as const) {
    test(`a direct ${name} load starts the gallery under the title menu without an intro`, async ({ page }) => {
      let releaseBundles!: () => void;
      const bundlesReady = new Promise<void>((resolve) => { releaseBundles = resolve; });
      await page.route("**/_next/static/**/*.js", async (route) => {
        await bundlesReady;
        await route.continue();
      });
      try {
        await page.goto(url, { waitUntil: "domcontentloaded" });
        await expect(page.locator(".gw-phone-intro")).toHaveCount(0);
        await expect(page.locator(".gw-bar + .gw-wall")).toHaveCount(1);
      } finally {
        releaseBundles();
      }
      await awaitInteractive(page);
      await expect(page.locator(".gw-phone-intro")).toHaveCount(0);
      await expect(page.locator(".gw-bar + .gw-wall")).toHaveCount(1);
      await expect(page.locator(".gw-wall [data-rule-link]:visible").first()).toBeInViewport();
    });
  }

  for (const [name, url] of [["gallery", wallUrl()], ["direct rule", ruleUrl("comp-1")]] as const) {
    test(`show all matches from the ${name}, without a keyboard shortcut`, async ({ page }) => {
      await openCatalog(page, url);
      await page.getByRole("button", { name: /^Search \d+ rules$/ }).tap();
      const dialog = page.getByRole("dialog", { name: "Search rules" });
      const input = dialog.getByRole("combobox");
      const action = dialog.getByRole("button", { name: /^Show all \d+ match/ });
      await expect(action).toHaveCount(0);
      await input.fill("contrast");
      const count = searchRules("contrast").length;
      await expect(action).toHaveText(`Show all ${count} matches`);
      expect((await action.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await action.tap();
      await expect(dialog).toHaveCount(0);
      await awaitView(page, "gallery");
      await expect.poll(() => new URL(page.url()).searchParams.get("q")).toBe("contrast");
      await expect.poll(() => sheetInert(page)).toBe(false);
      await expect(page.locator("a[data-rule-link]:visible")).toHaveCount(count);
      await page.getByRole("link", { name: /^“contrast” .*open rules menu$/ }).tap();
      await page.getByRole("dialog", { name: "Rules menu" }).getByRole("link", { name: /^All rules/ }).tap();
      await expect.poll(() => new URL(page.url()).searchParams.has("q")).toBe(false);
    });
  }

  test("matches stay near the search field in a short phone viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 430 });
    await openCatalog(page, wallUrl());
    const opener = page.getByRole("button", { name: /^Search \d+ rules$/ });
    await opener.tap();
    const dialog = page.getByRole("dialog", { name: "Search rules" });
    const input = dialog.getByRole("combobox");
    await input.fill("contrast");
    const show = dialog.getByRole("button", { name: `Show all ${searchRules("contrast").length} matches`, exact: true });
    await expect(show).toBeInViewport({ ratio: 1 });
    await show.tap();
    await awaitView(page, "gallery");
    await page.getByRole("link", { name: /^“contrast” .*open rules menu$/ }).tap();
    await page.getByRole("dialog", { name: "Rules menu" }).getByRole("link", { name: /^All rules/ }).tap();
    await expect.poll(() => new URL(page.url()).searchParams.has("q")).toBe(false);

    await opener.tap();
    await expect(dialog.getByRole("combobox")).toHaveValue("");
    await dialog.getByRole("button", { name: "Cancel", exact: true }).tap();
    await expect(opener).toBeFocused();
  });

  test("an empty or unmatched query has no unusable show-matches action", async ({ page }) => {
    await openCatalog(page, wallUrl());
    const opener = page.getByRole("button", { name: /^Search \d+ rules$/ });
    await opener.tap();
    const dialog = page.getByRole("dialog", { name: "Search rules" });
    const input = dialog.getByRole("combobox");
    const action = dialog.getByRole("button", { name: /^Show all \d+ match/ });
    for (const query of ["", "   ", "zzzznonexistent"]) {
      await input.fill(query);
      await expect(action).toHaveCount(0);
    }
    await input.fill(titleOf("comp-1"));
    await expect(action).toHaveText("Show all 1 match");
    await dialog.getByRole("button", { name: "Cancel", exact: true }).tap();
    await expect(opener).toBeFocused();
    await expect.poll(() => new URL(page.url()).searchParams.has("q")).toBe(false);
  });
});

test("desktop keeps the shortcut instead of the phone action", async ({ page }) => {
  await openCatalog(page, wallUrl());
  await page.keyboard.press("ControlOrMeta+k");
  const dialog = page.getByRole("dialog", { name: "Search rules" });
  const input = dialog.getByRole("combobox");
  await input.fill("contrast");
  await expect(dialog.getByRole("button", { name: /^Show all \d+ match/ })).toHaveCount(0);
  await input.press("Shift+Enter");
  await expect.poll(() => new URL(page.url()).searchParams.get("q")).toBe("contrast");
});
