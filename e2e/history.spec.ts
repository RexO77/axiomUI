import {
  awaitInteractive,
  awaitUrl,
  awaitView,
  expect,
  openCatalog,
  railNeighbour,
  readCatalog,
  routes,
  ruleUrl,
  savedScroll,
  sel,
  settledScroll,
  settledUrl,
  test,
  tileId,
  titleOf,
  trackTraffic,
  wallUrl,
} from "./helpers";

/*
 * Browser checks for the catalog's navigation and history behavior.
 * Every URL comes from helpers.ts, so the tests follow the configured
 * catalog base path.
 */

const tile = (page: import("@playwright/test").Page, id: string) => page.locator(sel.tile(id));

test.describe("direct load", () => {
  test("a rule document carries no wall, and Esc fills the wall in place", async ({ page, request }) => {
    const id = "typo-1";
    const html = await (await request.get(ruleUrl(id))).text();
    expect(html).not.toContain("data-wall");
    expect(html).not.toContain("data-rule-link");

    const traffic = trackTraffic(page);
    await openCatalog(page, ruleUrl(id));
    const before = await readCatalog(page);
    expect(before).toMatchObject({ view: "rule", wallMounted: false });
    expect(before.axiom).toMatchObject({ view: "rule", depth: 0 });

    traffic.reset();
    await page.keyboard.press("Escape");
    await expect(page.locator(sel.wall)).toBeVisible();
    await awaitView(page, "gallery");

    const after = await readCatalog(page);
    expect(after).toMatchObject({
      view: "gallery",
      wallMounted: true,
      wallHidden: false,
      doc: before.doc,
      url: wallUrl({ hash: tileId(id) }),
      historyLength: before.historyLength,
    });
    await expect(tile(page, id)).toBeFocused();
    // One router replace fills the slot, in place; the document itself never reloads.
    expect(traffic.documents()).toEqual([]);
    // Whatever the router fetched (the replace, or the idle prefetch landing late) was the wall, never another page.
    for (const request of traffic.router()) expect(request).toContain(`${routes().galleryHref()}?_rsc=`);
  });

  test("once filled, the wall is never unmounted by later opens and exits", async ({ page }) => {
    await openCatalog(page, ruleUrl("typo-1"));
    await page.keyboard.press("Escape");
    // The view flips to the wall at once; the wall itself arrives with the router replace.
    await expect(page.locator(sel.wall)).toBeVisible();
    await awaitView(page, "gallery");
    const start = await readCatalog(page);
    await page.evaluate((selector) => {
      (document.querySelector(selector) as unknown as { __kept: boolean }).__kept = true;
    }, sel.wall);

    await tile(page, "typo-2").click();
    await awaitView(page, "rule");
    await page.keyboard.press("j");
    await awaitUrl(page, ruleUrl(railNeighbour("typo-2", 1)));
    await page.keyboard.press("Escape");
    await awaitView(page, "gallery");

    const kept = await page.evaluate((selector) => (document.querySelector(selector) as unknown as { __kept?: boolean })?.__kept, sel.wall);
    expect(kept).toBe(true);
    expect((await readCatalog(page)).doc).toBe(start.doc);
  });
});

test.describe("paging and exit", () => {
  test("open, J, J, K, Esc keeps the wall's scroll and puts focus on the tile of the rule reached", async ({ page }) => {
    const first = "layout-2";
    await openCatalog(page, wallUrl());
    await tile(page, first).evaluate((element) => element.scrollIntoView({ block: "start" }));
    const scrolled = await settledScroll(page, sel.wallLayer);
    expect(scrolled, "the wall is scrolled before the open").toBeGreaterThan(0);

    await tile(page, first).click();
    await awaitView(page, "rule");
    const opened = await readCatalog(page);
    expect(opened.axiom).toMatchObject({ view: "rule", depth: 1 });
    await expect(page.locator(sel.ruleTitle)).toBeFocused();

    // J and K replace: the address follows, the history does not grow.
    const second = railNeighbour(first, 1);
    const third = railNeighbour(first, 2);
    for (const [key, id] of [["j", second], ["j", third], ["k", second]] as const) {
      await page.keyboard.press(key);
      await awaitUrl(page, ruleUrl(id));
      await expect(page.locator(sel.ruleTitle)).toHaveText(titleOf(id));
    }
    const paged = await readCatalog(page);
    expect(paged.historyLength).toBe(opened.historyLength);
    expect(paged.axiom).toMatchObject({ view: "rule", depth: 1 });
    expect(paged.live).toContain(titleOf(second));
    // Paging speaks through the live region; it never moves focus off the title.
    await expect(page.locator(sel.ruleTitle)).toBeFocused();

    await page.keyboard.press("Escape");
    await awaitView(page, "gallery");
    const back = await readCatalog(page);
    expect(back.url).toBe(wallUrl());
    expect(back.historyLength).toBe(opened.historyLength);
    expect(Math.abs((back.wallScroll ?? -1) - scrolled)).toBeLessThanOrEqual(2);
    await expect(tile(page, second)).toBeFocused();
  });

  test("open pushes one entry and J replaces it", async ({ page }) => {
    const first = "typo-3";
    await openCatalog(page, wallUrl());
    const start = await readCatalog(page);
    await tile(page, first).click();
    await awaitView(page, "rule");
    expect((await readCatalog(page)).historyLength).toBe(start.historyLength + 1);

    await page.keyboard.press("j");
    await awaitUrl(page, ruleUrl(railNeighbour(first, 1)));
    const paged = await readCatalog(page);
    expect(paged.historyLength).toBe(start.historyLength + 1);
    // A step drops the old rule's reading position.
    expect(paged.axiom?.scroll).toBeNull();
  });
});

test.describe("Back and Forward", () => {
  test("never reload the document and never touch the network; Forward restores the reading position", async ({ page }) => {
    const first = "color-1";
    const second = railNeighbour(first, 1);
    const traffic = trackTraffic(page);
    await openCatalog(page, wallUrl());
    const start = await readCatalog(page);
    traffic.reset();

    await tile(page, first).click();
    await awaitView(page, "rule");
    await page.keyboard.press("j");
    await awaitUrl(page, ruleUrl(second));
    await page.locator(sel.sheet).evaluate((element) => {
      element.scrollTop = 400;
    });
    // The placeholder scrolls only as far as it is long; whatever it reached is what is saved and restored.
    const reached = await savedScroll(page, second);
    expect(reached).toBeGreaterThan(0);
    const onRule = await readCatalog(page);

    await page.goBack();
    await awaitView(page, "gallery");
    expect(await readCatalog(page)).toMatchObject({ url: wallUrl(), doc: start.doc, wallMounted: true, wallHidden: false });

    await page.goForward();
    await awaitView(page, "rule");
    await expect.poll(async () => (await readCatalog(page)).sheetScroll).toBe(reached);
    expect(await readCatalog(page)).toMatchObject({ url: onRule.url, doc: start.doc, title: titleOf(second) });

    await page.goBack();
    await awaitView(page, "gallery");
    expect((await readCatalog(page)).doc).toBe(start.doc);

    expect(traffic.documents(), "no document request").toEqual([]);
    expect(traffic.router(), "no router request").toEqual([]);
  });

  test("a restore is only for the rule it was saved for", async ({ page }) => {
    const first = "motion-4";
    await openCatalog(page, wallUrl());
    await tile(page, first).click();
    await awaitView(page, "rule");
    await page.locator(sel.sheet).evaluate((element) => {
      element.scrollTop = 400;
    });
    await savedScroll(page, first);
    // Step to another rule, then Back to the wall and Forward: the new rule's entry holds no position.
    await page.keyboard.press("j");
    await awaitUrl(page, ruleUrl(railNeighbour(first, 1)));
    expect((await readCatalog(page)).axiom?.scroll).toBeNull();
    await page.goBack();
    await awaitView(page, "gallery");
    await page.goForward();
    await awaitView(page, "rule");
    expect((await readCatalog(page)).sheetScroll).toBe(0);
  });

  test("rapid J then Back leaves the address bar equal to the view once it settles", async ({ page }) => {
    const first = "form-2";
    await openCatalog(page, wallUrl());
    const start = await readCatalog(page);
    await tile(page, first).click();
    await awaitView(page, "rule");
    for (let step = 0; step < 5; step++) await page.keyboard.press("j");
    await page.goBack();
    await awaitView(page, "gallery");

    expect(await settledUrl(page)).toBe(wallUrl());
    expect(await readCatalog(page)).toMatchObject({ view: "gallery", title: null, wallMounted: true, wallHidden: false, doc: start.doc });
  });
});

test.describe("push then replace", () => {
  test("in the same task, the address settles on the replace URL (10 runs)", async ({ page }) => {
    const first = "motion-1";
    const second = railNeighbour(first, 1);
    await openCatalog(page, wallUrl());
    await tile(page, first).evaluate((element) => element.scrollIntoView({ block: "center" }));

    for (let run = 0; run < 10; run++) {
      const before = await readCatalog(page);
      // Enter on a tile is a click with detail 0: a keyboard open, so the push and
      // the commit are synchronous, and J in the same task replaces it. One frame, two writes.
      const sync = await page.evaluate((id) => {
        const link = document.getElementById(id) as HTMLAnchorElement;
        link.focus();
        link.click();
        const afterPush = location.pathname;
        (document.activeElement ?? document.body).dispatchEvent(new KeyboardEvent("keydown", { key: "j", bubbles: true, cancelable: true }));
        return { afterPush, afterReplace: location.pathname };
      }, tileId(first));
      expect(sync, `run ${run}: both writes happened in one task`).toEqual({ afterPush: ruleUrl(first), afterReplace: ruleUrl(second) });

      expect(await settledUrl(page), `run ${run}: settled`).toBe(ruleUrl(second));
      const settled = await readCatalog(page);
      // The open pushed one entry (the first run grows the list; later runs push over the entry Esc stepped back from).
      expect(settled).toMatchObject({ view: "rule", title: titleOf(second), historyLength: before.historyLength + (run === 0 ? 1 : 0) });

      // Esc goes back to the wall, focused on the tile of the rule it left: the one J reached.
      await page.keyboard.press("Escape");
      await awaitView(page, "gallery");
      await expect(tile(page, second)).toBeFocused();
    }
  });

  test("a push and a replace inside one animation frame, both through writeHistory, settle on the replace URL", async ({ page }) => {
    const first = "typo-3";
    const second = railNeighbour(first, 1);
    await openCatalog(page, wallUrl());
    const start = await readCatalog(page);
    // Enter on a tile (a click with detail 0) pushes the rule and J replaces it, in one frame:
    // two writes through writeHistory, each a fresh `{ axiom }` with none of Next's state copied in.
    await page.evaluate(
      (id) =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            const link = document.getElementById(id) as HTMLAnchorElement;
            link.focus();
            link.click();
            (document.activeElement ?? document.body).dispatchEvent(new KeyboardEvent("keydown", { key: "j", bubbles: true, cancelable: true }));
            resolve();
          });
        }),
      tileId(first),
    );
    expect(await settledUrl(page, 500)).toBe(ruleUrl(second));
    expect(await readCatalog(page)).toMatchObject({
      view: "rule",
      title: titleOf(second),
      historyLength: start.historyLength + 1,
      axiom: { view: "rule", depth: 1, scroll: null },
    });

    // Esc steps back only once Next has acknowledged the entry it leaves. An entry
    // written with Next's own state copied in is never acknowledged, so the exit would be abandoned.
    await page.keyboard.press("Escape");
    await awaitView(page, "gallery");
    expect(await settledUrl(page)).toBe(wallUrl());
    await expect(tile(page, second)).toBeFocused();
    await page.goForward();
    await awaitView(page, "rule");
    expect(await settledUrl(page)).toBe(ruleUrl(second));
    expect(await readCatalog(page)).toMatchObject({ view: "rule", title: titleOf(second), doc: start.doc });
  });
});

test.describe("races", () => {
  const cases = [
    { name: "a pointer open, then Esc in the same task", open: "pointer", nextFrame: false },
    { name: "a pointer open, then Esc in the next frame", open: "pointer", nextFrame: true },
    { name: "a keyboard open, then Esc in the same task", open: "keyboard", nextFrame: false },
  ] as const;

  for (const { name, open, nextFrame } of cases) {
    test(`${name}, lands on the wall with the URL and view in agreement`, async ({ page }) => {
      const id = "typo-5";
      await openCatalog(page, wallUrl());
      const start = await readCatalog(page);
      await page.evaluate(
        ({ id, open, nextFrame }) =>
          new Promise<void>((resolve) => {
            const link = document.getElementById(id) as HTMLAnchorElement;
            if (open === "keyboard") {
              link.focus();
              link.click();
            } else {
              link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, detail: 1 }));
            }
            const escape = () => {
              (document.activeElement ?? document.body).dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
              resolve();
            };
            if (nextFrame) requestAnimationFrame(escape);
            else escape();
          }),
        { id: tileId(id), open, nextFrame },
      );

      expect(await settledUrl(page, 500)).toBe(wallUrl());
      await awaitView(page, "gallery");
      expect(await readCatalog(page)).toMatchObject({ view: "gallery", url: wallUrl(), doc: start.doc, wallHidden: false });
      await expect(tile(page, id)).toBeFocused();
    });
  }

  test("Forward during an exit morph ends with the view equal to the address", async ({ page }) => {
    await openCatalog(page, wallUrl());
    await tile(page, "typo-6").click();
    await awaitView(page, "rule");
    await page.locator(sel.exit).click(); // a pointer exit: Back by depth, with the morph out
    await page.goForward();

    const url = await settledUrl(page, 500);
    const state = await readCatalog(page);
    expect(state.view === "rule", `view ${state.view} at ${url}`).toBe(url === ruleUrl("typo-6"));
    expect(state.view === "gallery", `view ${state.view} at ${url}`).toBe(url === wallUrl());
  });
});

test.describe("reload", () => {
  test("a reloaded rule is stamped depth 0, and Esc is an in-document replace to the wall", async ({ page }) => {
    const id = "form-1";
    await openCatalog(page, wallUrl());
    await tile(page, id).click();
    await awaitView(page, "rule");

    await page.reload();
    await awaitInteractive(page);
    await expect.poll(async () => (await readCatalog(page)).axiom?.depth).toBe(0);
    const reloaded = await readCatalog(page);
    expect(reloaded).toMatchObject({ view: "rule", url: ruleUrl(id), wallMounted: false });

    await page.keyboard.press("Escape");
    await expect(page.locator(sel.wall)).toBeVisible();
    await awaitView(page, "gallery");

    const after = await readCatalog(page);
    expect(after).toMatchObject({
      view: "gallery",
      url: wallUrl({ hash: tileId(id) }),
      doc: reloaded.doc,
      historyLength: reloaded.historyLength,
    });
    await expect(tile(page, id)).toBeFocused();
  });
});

test.describe("exit keeps the wall's filter", () => {
  const filters = [
    { name: "a search", id: "typo-1", options: { q: "sentence" } },
    { name: "a collection", id: "a11y-1", options: { collection: "accessibility" } },
  ] as const;
  const entries = [
    { name: "a direct load", reload: false, fromWall: false },
    { name: "a reload of a direct load", reload: true, fromWall: false },
    { name: "a reload of an entry opened from the filtered wall", reload: true, fromWall: true },
  ] as const;

  for (const { name, id, options } of filters) {
    for (const { name: entry, reload, fromWall } of entries) {
      test(`Esc after ${entry} with ${name} returns to the filtered wall, and reopening keeps the deck`, async ({ page }) => {
        if (fromWall) {
          await openCatalog(page, wallUrl(options));
          await tile(page, id).click();
          await awaitView(page, "rule");
          expect((await readCatalog(page)).url).toBe(ruleUrl(id, options));
        } else {
          await openCatalog(page, ruleUrl(id, options));
        }
        if (reload) {
          await page.reload();
          await awaitInteractive(page);
        }
        await expect.poll(async () => (await readCatalog(page)).axiom?.depth).toBe(0);
        const loaded = await readCatalog(page);
        expect(loaded).toMatchObject({ view: "rule", url: ruleUrl(id, options), wallMounted: false });
        const position = await page.locator(sel.position).innerText();

        await page.keyboard.press("Escape");
        await expect(page.locator(sel.wall)).toBeVisible();
        await awaitView(page, "gallery");
        expect(await readCatalog(page)).toMatchObject({
          view: "gallery",
          url: wallUrl({ ...options, hash: tileId(id) }),
          doc: loaded.doc,
          historyLength: loaded.historyLength,
        });
        await expect(tile(page, id)).toBeFocused();

        // The deck survived the round trip: the same address, and the same "n of N".
        await tile(page, id).click();
        await awaitView(page, "rule");
        expect(await settledUrl(page)).toBe(ruleUrl(id, options));
        await expect(page.locator(sel.position)).toHaveText(position);
      });
    }
  }
});

test.describe("a slow router commit", () => {
  /*
   * Next follows each history write with a restore of its own, committed
   * through React's scheduler. The exit waits for that commit before it
   * traverses, or Next writes the address being left onto the entry reached.
   * Delaying the scheduler's message channel after hydration makes the commit
   * arrive late, simulating a slow device. The patch goes in before any page script, and the test
   * proves it is live, or it would pass without testing anything.
   */
  const patchScheduler = (page: import("@playwright/test").Page) =>
    page.addInitScript(() => {
      const state = window as unknown as { __schedulerDelay?: number };
      const NativeChannel = window.MessageChannel;
      window.MessageChannel = function () {
        const channel = new NativeChannel();
        const post = channel.port2.postMessage.bind(channel.port2);
        channel.port2.postMessage = ((...args: [unknown]) => {
          window.setTimeout(() => post(...args), state.__schedulerDelay ?? 0);
        }) as MessagePort["postMessage"];
        return channel;
      } as unknown as typeof MessageChannel;
    });

  const setDelay = (page: import("@playwright/test").Page, delay: number) =>
    page.evaluate((delay) => {
      (window as unknown as { __schedulerDelay: number }).__schedulerDelay = delay;
    }, delay);

  /** A pointer open of `id`, with no Esc after it. */
  const openOnly = (page: import("@playwright/test").Page, id: string) =>
    page.evaluate((id) => {
      const link = document.getElementById(id) as HTMLAnchorElement;
      link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, detail: 1 }));
    }, tileId(id));

  /** A pointer open of `id`, then Esc, in one task. */
  const openThenEscape = (page: import("@playwright/test").Page, id: string) =>
    page.evaluate((id) => {
      const link = document.getElementById(id) as HTMLAnchorElement;
      link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, detail: 1 }));
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    }, tileId(id));

  async function prepare(page: import("@playwright/test").Page) {
    await patchScheduler(page);
    await openCatalog(page, wallUrl());
    expect(await page.evaluate(() => String(window.MessageChannel)), "the scheduler patch is live").not.toContain("[native code]");
    return readCatalog(page);
  }

  for (const delay of [250, 600, 1200]) {
    test(`pointer open then Esc with the router commit ${delay} ms late: address, view, Forward and Back agree`, async ({ page }) => {
      test.setTimeout(delay + 20_000);
      const id = "typo-5";
      const start = await prepare(page);
      const traffic = trackTraffic(page);

      await setDelay(page, delay);
      await openThenEscape(page, id);
      // The delay, plus the shell's own 3 s wait, plus room; then the scheduler is fast again.
      const settled = await settledUrl(page, delay + 3500, delay + 9000);
      await setDelay(page, 0);

      await awaitView(page, "gallery");
      expect(settled, "the address bar is the wall's").toBe(wallUrl());
      expect(await readCatalog(page)).toMatchObject({ view: "gallery", url: wallUrl(), doc: start.doc, wallHidden: false });

      // The entry Forward reaches is the rule that was opened, with its own address and view.
      await page.goForward();
      await awaitView(page, "rule");
      expect(await settledUrl(page)).toBe(ruleUrl(id));
      expect(await readCatalog(page)).toMatchObject({ view: "rule", url: ruleUrl(id), title: titleOf(id), doc: start.doc });

      await page.goBack();
      await awaitView(page, "gallery");
      expect(await settledUrl(page)).toBe(wallUrl());
      expect(await readCatalog(page)).toMatchObject({ view: "gallery", doc: start.doc });
      expect(traffic.documents(), "the document never reloaded").toEqual([]);
    });
  }

  /*
   * The shell's own traversal waits for Next's commit, but the reader's
   * Back does not.
   * Next's late commit must not write the rule's address onto the wall entry
   * that Back reached. It fails today (the address ends on the rule while the
   * wall shows), so it stays a fixme until the rule view's history guard lands.
   */
  for (const [delay, back] of [
    [1200, 100],
    [600, 20],
    [600, 300],
  ] as const) {
    test.fixme(`Back ${back} ms into an Esc waiting for a commit ${delay} ms late keeps the address and the view in step`, async ({ page }) => {
      test.setTimeout(delay + 20_000);
      const id = "typo-5";
      const start = await prepare(page);
      const traffic = trackTraffic(page);

      await setDelay(page, delay);
      await openThenEscape(page, id);
      await page.waitForTimeout(back);
      await page.goBack({ waitUntil: "commit" });
      const settled = await settledUrl(page, 3000, delay + 9000);
      await setDelay(page, 0);

      await awaitView(page, "gallery");
      expect(settled, "the address bar is the wall's").toBe(wallUrl());
      expect(await readCatalog(page)).toMatchObject({ view: "gallery", url: wallUrl(), doc: start.doc, wallHidden: false });

      await page.goForward();
      await awaitView(page, "rule");
      expect(await settledUrl(page)).toBe(ruleUrl(id));
      expect(await readCatalog(page)).toMatchObject({ view: "rule", url: ruleUrl(id), title: titleOf(id), doc: start.doc });
      expect(traffic.documents(), "the document never reloaded").toEqual([]);
    });
  }

  /* The controls for the case above: open, then Back with no Esc, at every delay. These pass today. */
  for (const delay of [250, 600, 1200]) {
    test(`open, then Back 100 ms later with no Esc and the router commit ${delay} ms late, keeps the address and the view in step`, async ({ page }) => {
      test.setTimeout(delay + 20_000);
      const id = "typo-5";
      const start = await prepare(page);

      await setDelay(page, delay);
      await openOnly(page, id);
      await page.waitForTimeout(100);
      await page.goBack({ waitUntil: "commit" });
      const settled = await settledUrl(page, 3000, delay + 9000);
      await setDelay(page, 0);

      await awaitView(page, "gallery");
      expect(settled, "the address bar is the wall's").toBe(wallUrl());
      expect(await readCatalog(page)).toMatchObject({ view: "gallery", url: wallUrl(), doc: start.doc, wallHidden: false });

      await page.goForward();
      await awaitView(page, "rule");
      expect(await settledUrl(page)).toBe(ruleUrl(id));
      expect(await readCatalog(page)).toMatchObject({ view: "rule", url: ruleUrl(id), title: titleOf(id), doc: start.doc });
    });
  }

  test("a commit later than the shell waits for abandons the exit: the rule stays, address and view agree, and a later Esc works", async ({ page }) => {
    test.setTimeout(4000 + 20_000);
    const id = "typo-5";
    const start = await prepare(page);

    await setDelay(page, 4000);
    await openThenEscape(page, id);
    const settled = await settledUrl(page, 4000 + 1500, 4000 + 9000);
    await setDelay(page, 0);

    // No traversal ran against an uncommitted router: the rule is still shown, at its own address.
    await awaitView(page, "rule");
    expect(settled).toBe(ruleUrl(id));
    expect(await readCatalog(page)).toMatchObject({ view: "rule", url: ruleUrl(id), title: titleOf(id), doc: start.doc });

    await page.keyboard.press("Escape");
    await awaitView(page, "gallery");
    expect(await settledUrl(page)).toBe(wallUrl());
    expect(await readCatalog(page)).toMatchObject({ view: "gallery", doc: start.doc, wallHidden: false });
  });
});

test.describe("links the shell leaves alone", () => {
  type ClickOptions = NonNullable<Parameters<import("@playwright/test").Locator["click"]>[0]>;
  const clicks: { name: string; event: "click" | "auxclick"; options: ClickOptions }[] = [
    { name: "Ctrl or Cmd", event: "click", options: { modifiers: ["ControlOrMeta"] } },
    { name: "Shift", event: "click", options: { modifiers: ["Shift"] } },
    { name: "middle", event: "auxclick", options: { button: "middle" } },
  ];

  for (const { name, event, options } of clicks) {
    test(`${name}-click is not intercepted`, async ({ page }) => {
      const id = "typo-7";
      await openCatalog(page, wallUrl());
      const before = await readCatalog(page);
      // Recorded at the document, after the shell's own handler has run.
      await page.evaluate((type) => {
        const seen: boolean[] = [];
        (window as unknown as { __prevented: boolean[] }).__prevented = seen;
        document.addEventListener(type, (event) => seen.push(event.defaultPrevented));
      }, event);

      await tile(page, id).click(options);

      const prevented = await page.evaluate(() => (window as unknown as { __prevented: boolean[] }).__prevented);
      expect(prevented, `${name}-click reaches the browser`).toEqual([false]);
      const after = await readCatalog(page);
      expect(after).toMatchObject({ view: "gallery", url: before.url, historyLength: before.historyLength, doc: before.doc });
    });
  }
});
