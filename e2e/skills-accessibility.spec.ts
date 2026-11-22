import type { Page } from "@playwright/test";
import { expect, openCatalog, ruleUrl, test } from "./helpers";

const dialog = (page: Page) => page.getByRole("dialog", { name: "Agent skills" });
async function openSkills(page: Page, phone = false) {
  await openCatalog(page, ruleUrl("typo-1"));
  if (phone) {
    await page.locator(".phone-bar").getByRole("button", { name: "Menu" }).click();
    await page.locator(".phone-menu").getByRole("button", { name: "Browse agent skills" }).click();
  } else {
    await page.locator(".install-row .rail-row").click();
    await page.getByRole("button", { name: "Browse agent skills" }).click();
  }
  await expect(dialog(page)).toBeVisible();
}

test("every keyboard stop is reachable in both directions with the verification disclosure open", async ({ page }) => {
  await openSkills(page);
  const box = dialog(page);
  const summary = box.locator("summary");
  await summary.press("Enter");
  const sequence = [
    box.getByRole("link", { name: "GitHub" }), box.getByRole("button", { name: "Close agent skills" }),
    box.getByRole("radio", { checked: true }), box.getByRole("button", { name: "Project", exact: true }),
    box.getByRole("button", { name: "Global", exact: true }), box.getByRole("link", { name: /Node.js/ }),
    box.getByRole("button", { name: /Copy install command/ }), summary, box.getByRole("button", { name: "Copy verification command" }),
    box.getByRole("button", { name: "Preview the playbook" }), box.getByRole("link", { name: "Download playbook" }),
  ];
  await sequence[0].focus();
  for (const target of [...sequence.slice(1), sequence[0]]) {
    await page.keyboard.press("Tab");
    await expect(target).toBeFocused();
  }
  for (const target of [...sequence].reverse()) {
    await page.keyboard.press("Shift+Tab");
    await expect(target).toBeFocused();
  }
  await summary.press("Enter");
  await page.keyboard.press("Tab");
  await expect(box.getByRole("button", { name: "Preview the playbook" })).toBeFocused();
});

test("the selected skill and scope retain a selection cue distinct from keyboard focus in forced colors", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await openSkills(page);
  const box = dialog(page);
  const option = box.locator(".skill-option:has(:checked)");
  const project = box.getByRole("button", { name: "Project", exact: true });
  const selectedBar = () => option.evaluate((el) => getComputedStyle(el, "::after").borderInlineStartWidth);
  expect(await selectedBar()).toBe("3px");
  await expect(project).toHaveCSS("text-decoration-line", "underline");
  await box.getByRole("button", { name: "Close agent skills" }).press("Tab");
  await expect(option.locator("input")).toBeFocused();
  await expect(option).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Tab");
  await expect(project).toBeFocused();
  await expect(option).toHaveCSS("outline-style", "none");
  expect(await selectedBar()).toBe("3px");
  await expect(project).toHaveCSS("outline-style", "solid");
  await expect(project).toHaveCSS("text-decoration-line", "underline");
});

test("at 320px doubled text leaves enough room to read the selected skill", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await openSkills(page, true);
  const box = dialog(page);
  const select = box.getByRole("combobox");
  await select.selectOption("axiomui-website-upgrade");
  await box.locator("summary").click();
  await box.evaluate((root) => {
    // Text-only magnification stress, independent of the viewport and tap-target dimensions.
    const sizes = [root, ...root.querySelectorAll<HTMLElement>("*")].filter((el) => el instanceof HTMLElement).map((el) => {
      const style = getComputedStyle(el);
      return { el, size: parseFloat(style.fontSize), line: style.lineHeight };
    });
    for (const { el, size, line } of sizes) {
      el.style.fontSize = (size * 2) + "px";
      if (line.endsWith("px")) el.style.lineHeight = (parseFloat(line) * 2) + "px";
    }
  });
  expect(await select.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
  expect(await box.locator(".skill-details").evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
  await expect(box.getByRole("link", { name: "Download playbook" })).toBeInViewport();
});

test("the native list owns Escape before its parent dialog", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await openSkills(page, true);
  const picker = dialog(page).getByRole("combobox");
  await picker.press("Space");
  await expect.poll(() => picker.evaluate((el) => el.matches(":open"))).toBe(true);
  await picker.evaluate((el) => {
    el.addEventListener("keydown", (event) => { el.setAttribute("data-native-default", String(!event.defaultPrevented)); }, { once: true });
  });
  await page.keyboard.press("Escape");
  await expect(picker).toBeFocused();
  await expect(picker).toHaveAttribute("data-native-default", "true");
  // Headless Chromium forwards the key to the document, not its OS popup. A
  // plain select also stays :open there. Test the dialog's closed-picker path separately.
  await dialog(page).getByRole("button", { name: "Close agent skills" }).focus();
  await picker.focus();
  await expect.poll(() => picker.evaluate((el) => el.matches(":open"))).toBe(false);
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toHaveCount(0);
  await expect(page.locator(".phone-bar").getByRole("button", { name: "Menu" })).toBeFocused();
});

test.describe("short touch landscape", () => {
  test.use({ viewport: { width: 667, height: 320 }, hasTouch: true, isMobile: true });
  test("a finger scroll moves the detail column and leaves both footer actions tappable", async ({ page }) => {
    await openSkills(page, true);
    const box = dialog(page);
    await page.locator('.skill-modal-root[data-state="open"]').waitFor();
    await box.evaluate((el) => Promise.allSettled(el.getAnimations({ subtree: true }).map(animation => animation.finished)));
    const details = box.locator(".skill-details");
    const footer = box.locator("footer");
    const start = (await footer.boundingBox())!;
    const area = (await details.boundingBox())!;
    const x = area.x + area.width / 2;
    const point = (fraction: number) => [{ x, y: area.y + area.height * fraction }];
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: point(0.85) });
    for (const fraction of [0.7, 0.55, 0.4, 0.25]) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: point(fraction) });
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect.poll(() => details.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
    expect(await footer.boundingBox()).toEqual(start);
    for (const action of [footer.getByRole("button"), footer.getByRole("link")]) {
      const bounds = (await action.boundingBox())!;
      expect(bounds.height).toBeGreaterThanOrEqual(44);
      expect(await action.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return el.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
      })).toBe(true);
    }
    await footer.getByRole("button", { name: "Preview the playbook" }).tap();
    await expect(page.getByRole("dialog", { name: "Website upgrade playbook" })).toBeVisible();
  });
});
