import { expect, openCatalog, ruleUrl, test } from "./helpers";

test("the skills rail uses arrow keys and keeps the selected task when returning from the playbook", async ({ page }) => {
  await openCatalog(page, ruleUrl("motion-6"));
  await page.getByRole("button", { name: "Install agent skills: npx skills add RexO77/axiomUI", exact: true }).click();
  await page.getByRole("button", { name: "Browse agent skills" }).click();
  const dialog = page.getByRole("dialog", { name: "Agent skills" });
  const choice = dialog.getByRole("radio", { name: "Website upgrade" });
  await choice.focus();
  await page.keyboard.press("ArrowDown");
  await expect(dialog.getByRole("radio", { name: "Design audit" })).toBeChecked();
  await expect(dialog.getByRole("heading", { name: "Design audit" })).toBeVisible();
  await expect(dialog.getByText("Review this signup form.", { exact: false })).toBeVisible();
  await dialog.evaluate(async el => { await Promise.all(el.getAnimations().map(a => a.finished)); });
  const box = await dialog.boundingBox();
  await dialog.getByRole("button", { name: "Global", exact: true }).click();
  await dialog.getByRole("button", { name: "Preview the playbook" }).click();
  const playbook = page.getByRole("dialog", { name: "Website upgrade playbook" });
  await expect(playbook.getByRole("heading", { name: "Step 1: Frame" })).toBeVisible();
  await playbook.getByRole("button", { name: "All skills" }).click();
  await expect(choice).toBeVisible();
  await expect(dialog.getByRole("radio", { name: "Design audit" })).toBeChecked();
  await expect(dialog.getByRole("button", { name: "Global", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => dialog.boundingBox()).toEqual(box);
});

test("a phone can pick a domain and read its command without horizontal scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await openCatalog(page, ruleUrl("motion-6"));
  await page.getByRole("link", { name: /open rules menu$/ }).click();
  await page.getByRole("button", { name: "Browse agent skills", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Agent skills" });
  const picker = dialog.getByRole("combobox", { name: "Choose a skill" });
  await picker.selectOption("axiomui-accessibility");
  await expect(dialog.getByRole("heading", { name: "Accessibility", exact: true })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Copy install command for axiomui-accessibility" })).toBeVisible();
  await picker.selectOption("");
  await expect(dialog.getByRole("heading", { name: "Choose in terminal" })).toBeVisible();
  await expect(dialog.locator(".skill-install-command-row > code").first()).toHaveText("npx skills add RexO77/axiomUI");
  expect(await dialog.evaluate(el => [el.clientWidth, el.scrollWidth])).toEqual([320, 320]);
});

test("the playbook can be read from the keyboard with its toolbar in reach", async ({ page }) => {
  await openCatalog(page, ruleUrl("motion-6"));
  await page.getByRole("button", { name: "Install agent skills: npx skills add RexO77/axiomUI", exact: true }).click();
  await page.getByRole("button", { name: "Browse agent skills" }).click();
  await page.getByRole("button", { name: "Preview the playbook" }).click();
  const dialog = page.getByRole("dialog", { name: "Website upgrade playbook" });
  const reader = dialog.getByRole("region", { name: "Website upgrade playbook" });
  await expect(reader.getByRole("heading", { name: "Step 1: Frame" })).toBeVisible();
  const close = dialog.getByRole("button", { name: "Close agent skills" });
  await close.press("Tab");
  await expect(reader).toBeFocused();
  await reader.press("PageDown");
  await expect.poll(() => reader.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  await reader.press("Shift+Tab");
  await expect(close).toBeFocused();
  await expect(close).toBeInViewport();
});

test("retrying a failed playbook keeps focus in the reader", async ({ page }) => {
  await openCatalog(page, ruleUrl("form-13"));
  await page.getByRole("button", { name: "Install agent skills: npx skills add RexO77/axiomUI", exact: true }).click();
  await page.getByRole("button", { name: "Browse agent skills" }).click();
  await page.route("**/skills/axiomui-website-upgrade/SKILL.md", route =>
    route.fulfill({ contentType: "text/markdown", body: "" }), { times: 1 });
  await page.getByRole("button", { name: "Preview the playbook" }).click();
  const preview = page.getByRole("dialog", { name: "Website upgrade playbook" });
  await expect(preview.getByRole("status")).toContainText("Couldn’t load the playbook preview.");
  await preview.getByRole("button", { name: "Try again" }).press("Enter");
  await expect(preview.getByRole("heading", { name: "Step 1: Frame" })).toBeVisible();
  await expect(preview.getByRole("heading", { name: "Website upgrade playbook" })).toBeFocused();
});

test("the phone shows each core example before its install command and identifies the playbook download", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await openCatalog(page, ruleUrl("motion-6"));
  await page.getByRole("link", { name: /open rules menu$/ }).click();
  await page.getByRole("button", { name: "Browse agent skills", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Agent skills" });
  const picker = dialog.getByRole("combobox", { name: "Choose a skill" });
  for (const [id, task] of [
    ["axiomui", "Which Axiom UI rules apply to this signup form"],
    ["axiomui-audit", "Cite the rule behind each finding and leave the code as it is"],
    ["axiomui-website-upgrade", "Improve this signup form in code"],
  ]) {
    await picker.selectOption(id);
    const example = dialog.locator(".skill-example p");
    await expect(example).toContainText(task);
    const layout = await dialog.evaluate(el => {
      const bounds = (selector: string) => el.querySelector(selector)!.getBoundingClientRect();
      return {
        promptBottom: bounds(".skill-example p").bottom,
        detailBottom: bounds(".skill-details").bottom,
        prerequisiteBottom: bounds(".skill-install-hint").bottom,
        commandTop: bounds(".skill-install-command-row").top,
      };
    });
    expect(layout.promptBottom).toBeLessThanOrEqual(layout.detailBottom);
    expect(layout.promptBottom).toBeLessThan(layout.prerequisiteBottom);
    expect(layout.prerequisiteBottom).toBeLessThanOrEqual(layout.commandTop);
    await expect(dialog.getByRole("link", { name: "Node.js 22.20 or later" })).toHaveAttribute("href", /vercel-labs\/skills#install-a-skill$/);
    await expect(dialog.locator(".skill-install-command-row > code").first()).toHaveText(`npx skills add RexO77/axiomUI --skill ${id}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await picker.selectOption("axiomui");
  const command = dialog.locator(".skill-install-command-row > code").first();
  const flag = command.getByText("--skill", { exact: true });
  const lineCount = await flag.evaluate(el => {
    const range = document.createRange();
    range.selectNodeContents(el);
    return range.getClientRects().length;
  });
  expect(lineCount).toBe(1);
  await page.setViewportSize({ width: 320, height: 640 });
  const download = dialog.getByRole("link", { name: "Download playbook" });
  await expect(download).toHaveAttribute("href", "/skills/axiomui-website-upgrade/SKILL.md");
  const [preview, file] = await dialog.locator(".skill-footer > *").evaluateAll(actions =>
    actions.map(action => action.getBoundingClientRect().toJSON()));
  expect(file.y).toBeCloseTo(preview.y, 0);
  expect(file.left).toBeGreaterThanOrEqual(preview.right);
});
