import type { Page } from "@playwright/test";
import { expect, openCatalog, test, wallUrl } from "./helpers";

async function openInstall(page: Page) {
  await page.addInitScript(() => localStorage.setItem("axiom:strip-hint", "seen"));
  await openCatalog(page, wallUrl());
  await page.getByRole("button", { name: /^Install in your agent/ }).click();
  await page.getByRole("dialog", { name: "Install in your agent" })
    .getByRole("button", { name: "Browse the skills" }).click();
  return page.getByRole("dialog", { name: "Agent skills" });
}

test("install and verification commands follow scope and preserve it across skill changes", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const dialog = await openInstall(page);
  await dialog.getByRole("radio", { name: /Design audit/i }).check();
  const install = dialog.getByRole("region", { name: "Install command" });
  const scope = install.getByRole("group", { name: "Installation scope" });
  const details = install.locator("details");
  const copy = install.getByRole("button", { name: "Copy install command for axiomui-audit" });
  const getClipboard = () => page.evaluate(() => navigator.clipboard.readText());
  await expect(scope.getByRole("button", { name: "Project" })).toHaveAttribute("aria-pressed", "true");
  await expect(scope.getByRole("button", { name: "Project" }).locator("svg")).toBeVisible();
  await expect(scope.getByRole("button", { name: "Global" }).locator("svg")).toBeHidden();
  await copy.click();
  await expect.poll(getClipboard).toBe("npx skills add RexO77/axiomUI --skill axiomui-audit");
  await details.locator("summary").click();
  await expect(details.locator(".skill-install-command-row code")).toHaveText("npx skills list");

  await scope.getByRole("button", { name: "Global" }).click();
  await expect(scope.getByRole("button", { name: "Global" }).locator("svg")).toBeVisible();
  await expect(scope.getByRole("button", { name: "Project" }).locator("svg")).toBeHidden();
  await expect(copy).toHaveText("Copy");
  await copy.click();
  await expect.poll(getClipboard).toBe("npx skills add RexO77/axiomUI --skill axiomui-audit -g");
  const verify = details.getByRole("button", { name: "Copy verification command" });
  await verify.click();
  await expect.poll(getClipboard).toBe("npx skills list -g");

  await dialog.getByRole("radio", { name: /Website upgrade/i }).check();
  const upgrade = install.getByRole("button", { name: "Copy install command for axiomui-website-upgrade" });
  await expect(upgrade).toHaveText("Copy");
  await expect(verify).toHaveText("Copy");
  await expect(details).toHaveAttribute("open", "");
  await expect(scope.getByRole("button", { name: "Global" })).toHaveAttribute("aria-pressed", "true");
  await upgrade.click();
  await expect.poll(getClipboard).toBe("npx skills add RexO77/axiomUI --skill axiomui-website-upgrade -g");
  await scope.getByRole("button", { name: "Project" }).click();
  await expect(verify).toHaveText("Copy");
  await verify.click();
  await expect.poll(getClipboard).toBe("npx skills list");

  await dialog.getByRole("radio", { name: "Choose in terminal" }).check();
  await install.getByRole("button", { name: "Copy install command", exact: true }).click();
  await expect.poll(getClipboard).toBe("npx skills add RexO77/axiomUI");
});

test("a denied clipboard offers manual copying and a working retry inside the modal", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const dialog = await openInstall(page);
  await page.evaluate(async () => {
    await navigator.clipboard.writeText("Before manual copy");
    const readText = navigator.clipboard.readText.bind(navigator.clipboard);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { readText, writeText: async () => { throw new DOMException("Permission denied", "NotAllowedError"); } },
    });
    let attempts = 0;
    document.execCommand = (command: string) => {
      const field = document.activeElement;
      if (command !== "copy" || !(field instanceof HTMLTextAreaElement) || !field.closest('[role="dialog"]')) {
        throw new Error("Clipboard fallback did not select the modal's temporary field");
      }
      if (++attempts === 1) return false;
      document.documentElement.dataset.copied = field.value;
      return true;
    };
  });
  await dialog.getByRole("radio", { name: /Design audit/i }).check();
  const install = dialog.getByRole("region", { name: "Install command" });
  const copy = install.getByRole("button", { name: "Copy install command for axiomui-audit" });
  await copy.click();
  const retry = install.getByRole("button", { name: "Retry copying install command for axiomui-audit" });
  await expect(retry).toBeFocused();
  await expect(install.locator(".skill-copy-help")).toHaveText("Copy failed. The command is selected for manual copying.");
  await expect.poll(() => page.evaluate(() => getSelection()?.toString())).toBe("npx skills add RexO77/axiomUI --skill axiomui-audit");
  await page.keyboard.press("ControlOrMeta+c");
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe("npx skills add RexO77/axiomUI --skill axiomui-audit");
  await retry.click();
  await expect(copy).toHaveText("Copied");
  await expect(install.locator(".skill-copy-help")).toHaveCount(0);
  await expect(copy).toBeFocused();
  await expect(page.locator("html")).toHaveAttribute("data-copied", "npx skills add RexO77/axiomUI --skill axiomui-audit");
  await expect(install.locator("textarea")).toHaveCount(0);
});

test("a clipboard permission reply for an old scope cannot copy the wrong command", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: {
      writeText: () => new Promise<void>((_, reject) => {
        window.addEventListener("test-deny-copy", () => reject(new Error("Permission denied")), { once: true });
      }),
    } });
    document.execCommand = () => {
      document.documentElement.dataset.staleCopy = "attempted";
      return true;
    };
  });
  const dialog = await openInstall(page);
  const install = dialog.getByRole("region", { name: "Install command" });
  const copy = install.getByRole("button", { name: /^Copy install command/ });
  await copy.click();
  await install.getByRole("button", { name: "Global" }).click();
  await page.evaluate(() => window.dispatchEvent(new Event("test-deny-copy")));
  await expect(copy).toHaveText("Copy");
  await expect(page.locator("html")).not.toHaveAttribute("data-stale-copy");
});


for (const width of [355, 1440]) {
  test(`at ${width} copying keeps the row still and verification reveals exactly the clipped portion`, async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const phone = width === 355;
    await page.setViewportSize({ width, height: phone ? 640 : 900 });
    if (phone) {
      await openCatalog(page, wallUrl());
      await page.getByRole("button", { name: "Menu", exact: true }).click();
      await page.getByRole("button", { name: "Install in your agent", exact: true }).click();
    } else await openInstall(page);
    const dialog = page.getByRole("dialog", { name: "Agent skills" });
    if (phone) await dialog.getByRole("combobox").selectOption("axiomui-website-upgrade");
    else await dialog.getByRole("radio", { name: "Website upgrade" }).check();

    const copy = dialog.getByRole("button", { name: /^Copy install command/ });
    const installRow = dialog.locator(".skill-install-command-row").first();
    const height = (await installRow.boundingBox())!.height;
    await copy.click();
    await expect(copy).toHaveText("Copied");
    expect(Math.abs((await installRow.boundingBox())!.height - height)).toBeLessThan(1);

    const summary = dialog.locator("summary");
    await summary.focus();
    const scroll = () => dialog.locator(".skill-details").evaluate(el => el.scrollTop);
    const outside = () => page.evaluate(() => [document.scrollingElement!.scrollTop, document.querySelector(".shell-sheet")!.scrollTop]);
    const initial = await scroll();
    const pagePosition = await outside();
    await summary.press("Enter");
    const remaining = () => dialog.evaluate(el =>
      el.querySelector("details .skill-install-command-row")!.getBoundingClientRect().bottom -
      el.querySelector(".skill-details")!.getBoundingClientRect().bottom);
    await expect.poll(remaining).toBeLessThanOrEqual(1);
    const moved = (await scroll()) - initial;
    expect(moved).toBeGreaterThan(0);
    expect(Math.abs(await remaining())).toBeLessThanOrEqual(1);
    await expect(summary).toBeFocused();
    expect(await outside()).toEqual(pagePosition);
  });
}
