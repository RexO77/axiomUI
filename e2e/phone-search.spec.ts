import { searchRules } from "../src/lib/rule-search";
import { awaitView, expect, openCatalog, ruleUrl, test, wallUrl } from "./helpers";

test.describe("touch search can show the filtered gallery", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  for (const [name, url] of [["gallery", wallUrl()], ["direct rule", ruleUrl("comp-1")]] as const) {
    test(`show all matches from the ${name}, without a keyboard shortcut`, async ({ page }) => {
      await openCatalog(page, url);
      await page.getByRole("button", { name: /^Search \d+ rules$/ }).click();
      const dialog = page.getByRole("dialog", { name: "Search rules" });
      const input = dialog.getByRole("combobox");
      const action = dialog.getByRole("button", { name: /^Show all \d+ match/ });
      await expect(action).toHaveCount(0);
      await input.fill("contrast");
      const count = searchRules("contrast").length;
      await expect(action).toHaveText(`Show all ${count} matches`);
      expect((await action.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await action.click();
      await expect(dialog).toHaveCount(0);
      await awaitView(page, "gallery");
      await expect.poll(() => new URL(page.url()).searchParams.get("q")).toBe("contrast");
      await expect(page.locator(".shell-sheet")).not.toHaveAttribute("inert", "");
      await expect(page.locator("a[data-rule-link]:visible")).toHaveCount(count);
      await page.getByRole("button", { name: "Clear search “contrast”", exact: true }).click();
      await expect.poll(() => new URL(page.url()).searchParams.has("q")).toBe(false);
    });
  }

  test("an empty or unmatched query has no unusable show-matches action", async ({ page }) => {
    await openCatalog(page, wallUrl());
    const opener = page.getByRole("button", { name: /^Search \d+ rules$/ });
    await opener.click();
    const dialog = page.getByRole("dialog", { name: "Search rules" });
    const input = dialog.getByRole("combobox");
    const action = dialog.getByRole("button", { name: /^Show all \d+ match/ });
    for (const query of ["", "   ", "zzzznonexistent"]) {
      await input.fill(query);
      await expect(action).toHaveCount(0);
    }
    await input.fill("Action hierarchy");
    await expect(action).toHaveText("Show all 1 match");
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
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
