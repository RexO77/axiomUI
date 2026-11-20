import { expect, openCatalog, ruleUrl, test } from "./helpers";

test("pasting a six-digit example preserves the leading zero through the check", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openCatalog(page, ruleUrl("form-13"));
  const sample = page.getByRole("textbox", { name: "Example code to copy" });
  await sample.focus();
  await sample.press("ControlOrMeta+c");
  const yes = page.getByRole("figure", { name: "Do", exact: true });
  const no = page.getByRole("figure", { name: "Don’t", exact: true });
  const code = yes.getByRole("textbox", { name: "Verification code" });
  await code.press("ControlOrMeta+v");
  await expect(code).toHaveValue("012345");
  await code.press("Enter");
  await expect(yes.getByRole("status")).toContainText("Received 012345");
  await no.getByRole("textbox", { name: "Digit 1 of 6" }).press("ControlOrMeta+v");
  await no.getByRole("button", { name: "Check example" }).click();
  await expect(no.getByRole("status")).toContainText("Received 0 · expected 012345");
});

test("chart values and trend follow the selected quarter when the bars are hidden", async ({ page }) => {
  await openCatalog(page, ruleUrl("comp-13"));
  const yes = page.getByRole("figure", { name: "Do", exact: true });
  await yes.getByRole("img").evaluate((el) => { (el as HTMLElement).hidden = true; });
  await expect(yes.getByRole("img")).toHaveCount(0);
  await expect(yes).toContainText("Delivery rose from 30 to 42.");
  await yes.getByText("Monthly counts", { exact: true }).press("Enter");
  const first = yes.getByRole("table", { name: "Monthly support tickets, Jan–Mar" });
  await expect(first.getByRole("columnheader", { name: "Billing" })).toBeVisible();
  await expect(first.getByRole("row", { name: "Mar 27 42" })).toBeVisible();
  await page.getByLabel("Reporting period").press("a"); // Native select typeahead: April–June.
  await expect(yes).toContainText("Billing rose from 24 to 42 tickets.");
  const second = yes.getByRole("table", { name: "Monthly support tickets, Apr–Jun" });
  for (const header of ["Month", "Billing", "Delivery"]) {
    await expect(second.getByRole("columnheader", { name: header, exact: true })).toBeVisible();
  }
  const june = second.getByRole("row", { name: "Jun 42 32", exact: true });
  await expect(june.getByRole("rowheader", { name: "Jun" })).toBeVisible();
  await expect(june.getByRole("cell")).toHaveText(["42", "32"]);
  await expect(first).toHaveCount(0);
});

test("opening the counts keeps the two desktop plots aligned", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCatalog(page, ruleUrl("comp-13"));
  const comparison = page.locator(".cmp[data-kind=worked]");
  const charts = comparison.getByRole("img");
  await expect(charts).toHaveCount(2);
  const disclosure = comparison.getByText("Monthly counts", { exact: true });
  expect((await disclosure.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await disclosure.press("Enter");
  const [first, second] = await charts.evaluateAll((plots) => plots.map((plot) => plot.getBoundingClientRect().top));
  expect(Math.abs(first - second)).toBeLessThanOrEqual(1);
});

test("the inserted name is isolated in both interface directions", async ({ page }) => {
  await openCatalog(page, ruleUrl("typo-14"));
  const yes = page.getByRole("figure", { name: "Do", exact: true });
  const no = page.getByRole("figure", { name: "Don’t", exact: true });
  // Logical text is identical in both panes. Compare painted token positions
  // in the interface's reading direction and the outer glyphs inside the name.
  const measure = () => page.locator(".cmp-pane p").evaluateAll((lines) => lines.map((line) => {
    const name = line.firstElementChild!.firstChild as Text;
    const suffix = line.lastChild as Text;
    function bounds(node: Text, start: number, end: number) {
      const range = document.createRange();
      range.setStart(node, start);
      range.setEnd(node, end);
      return range.getBoundingClientRect();
    }
    const digit = suffix.data.indexOf("5");
    const dash = suffix.data.indexOf("–");
    const nameBox = bounds(name, 0, name.length);
    const countBox = bounds(suffix, digit, digit + 1);
    const positions = {
      name: nameBox,
      separator: bounds(suffix, dash, dash + 1),
      count: countBox,
      label: bounds(suffix, digit + 2, suffix.length),
    };
    const rtl = getComputedStyle(line).direction === "rtl";
    const tokens = Object.entries(positions).sort(([, a], [, b]) => rtl ? b.left - a.left : a.left - b.left);
    return {
      order: tokens.map(([token]) => token),
      countFollowsName: rtl ? countBox.right <= nameBox.left : countBox.left >= nameBox.right,
      nameReadsRTL: bounds(name, 0, 1).left > bounds(name, name.length - 1, name.length).left,
    };
  }));
  const expected = (nameReadsRTL: boolean) => [
    { order: ["name", "separator", "count", "label"], countFollowsName: true, nameReadsRTL },
    { order: ["count", "separator", "name", "label"], countFollowsName: false, nameReadsRTL },
  ];
  await expect(yes.locator('[dir="ltr"] bdi[lang="he"]')).toHaveText("קפה לונה");
  await expect(no.locator("bdi")).toHaveCount(0);
  expect(await measure()).toEqual(expected(true));
  await page.getByLabel("Review language").press("h"); // Native select typeahead: Hebrew.
  await expect(yes.locator('[dir="rtl"] bdi[lang="en"]')).toHaveText("Cafe Luna");
  await expect(yes.locator('[dir="rtl"] p')).toHaveText("Cafe Luna – 5 ביקורות");
  expect(await measure()).toEqual(expected(false));
});
