import type { Page } from "@playwright/test";

import { RAIL, RAIL_OPEN } from "../src/components/shell/geometry";
import { expect, openCatalog, railIds, ruleUrl, sel, test, wallUrl } from "./helpers";

/*
 * The rail opens and closes in one motion: the sheet's left edge travels and
 * the content reflows with it, so nothing on screen moves once the edge has
 * landed. These specs sample the page on every frame of a move and hold it to
 * that. The content tracks the edge (after the click's own frame, no frame
 * moves it further than the edge moved), the wall's column count changes at
 * most once and only on the click, everything is still when the edge lands,
 * and the list fades in step. A reload with the rail stored open paints it
 * there with no shift, and a keyboard or reduced-motion toggle lands at once.
 */

/** The hooks the page-side samplers read: strings only, so they cross into the page. */
const hooks = { shell: sel.shell, sheet: sel.sheet, wallGrid: sel.wallGrid, railList: sel.railList };

type Frame = { t: number; edge: number; x: number; w: number; cols: number; list: number; moving: boolean; open: boolean; viewport: number; wall: boolean };

/** Samples every frame for `ms` while `act` runs. `target` is the box whose geometry is read. */
async function record(page: Page, target: string, act: () => Promise<void>, ms = 900): Promise<Frame[]> {
  await page.evaluate(
    ({ target, ms, s }) => {
      const w = window as unknown as { __frames: unknown[] | null };
      w.__frames = null;
      const frames: unknown[] = [];
      const t0 = performance.now();
      const read = () => {
        const shell = document.querySelector(s.shell)!;
        const box = document.querySelector(target)?.getBoundingClientRect();
        const grid = document.querySelector(s.wallGrid);
        const list = document.querySelector(s.railList);
        frames.push({
          t: performance.now() - t0,
          viewport: innerWidth,
          wall: shell.getAttribute("data-view") === "gallery",
          edge: document.querySelector(s.sheet)!.getBoundingClientRect().left,
          x: box?.left ?? Number.NaN,
          w: box?.width ?? Number.NaN,
          cols: grid ? getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).length : 0,
          list: list ? Number(getComputedStyle(list).opacity) : 0,
          moving: shell.hasAttribute("data-moving"),
          open: shell.hasAttribute("data-open"),
        });
        if (performance.now() - t0 < ms) requestAnimationFrame(read);
        else w.__frames = frames;
      };
      requestAnimationFrame(read);
    },
    { target, ms, s: hooks },
  );
  await act();
  const handle = await page.waitForFunction(() => (window as unknown as { __frames: unknown[] | null }).__frames, null, { timeout: ms + 5_000 });
  return (await handle.jsonValue()) as Frame[];
}

/** The index of the last frame in which the sheet's edge moved. */
function landing(frames: Frame[]): number {
  let last = 0;
  frames.forEach((frame, i) => {
    if (i > 0 && Math.abs(frame.edge - frames[i - 1].edge) > 0.01) last = i;
  });
  return last;
}

/** The index of the first frame in which anything changed: the click's own frame. */
function clickFrame(frames: Frame[]): number {
  return frames.findIndex((frame, i) => i > 0 && (frame.edge !== frames[0].edge || frame.x !== frames[0].x || frame.w !== frames[0].w || frame.cols !== frames[0].cols));
}

/** One motion: the content rides the edge, the columns hold, and nothing moves once the edge lands. */
function expectOneMotion(frames: Frame[], from: number, to: number) {
  const first = clickFrame(frames);
  const land = landing(frames);
  expect(first, "something moved").toBeGreaterThan(0);
  expect(land, "the edge travelled").toBeGreaterThan(first);
  expect(frames[0].edge).toBeCloseTo(from, 0);
  expect(frames.at(-1)!.edge).toBeCloseTo(to, 0);
  // The edge moves in steps, never in one jump.
  expect(frames.filter((frame) => Math.abs(frame.edge - from) > 1 && Math.abs(frame.edge - to) > 1).length, "frames mid-travel").toBeGreaterThan(2);

  const direction = Math.sign(to - from);
  for (let i = first + 1; i < frames.length; i++) {
    const [a, b] = [frames[i - 1], frames[i]];
    const edge = Math.abs(b.edge - a.edge);
    expect(Math.abs(b.x - a.x), `x at frame ${i}`).toBeLessThanOrEqual(edge + 1);
    expect(Math.abs(b.w - a.w), `width at frame ${i}`).toBeLessThanOrEqual(edge + 1);
    // Opening pushes the content right and narrows it; closing does the reverse.
    expect(direction * (b.x - a.x), `x direction at frame ${i}`).toBeGreaterThanOrEqual(-0.5);
    expect(direction * (b.w - a.w), `width direction at frame ${i}`).toBeLessThanOrEqual(0.5);
  }

  // Still once the edge lands: the reflow that used to follow it is gone.
  const final = frames.at(-1)!;
  for (const frame of frames.slice(land)) {
    expect(Math.abs(frame.x - final.x), `x after landing, at ${Math.round(frame.t)}ms`).toBeLessThanOrEqual(0.5);
    expect(Math.abs(frame.w - final.w), `width after landing, at ${Math.round(frame.t)}ms`).toBeLessThanOrEqual(0.5);
  }
  expect(final.moving, "the move has ended").toBe(false);

  // The column count changes at most once, on the click, never mid-travel.
  const changes = frames.filter((frame, i) => i > 0 && frame.cols !== frames[i - 1].cols).map((frame) => frames.indexOf(frame));
  expect(changes.length).toBeLessThanOrEqual(1);
  for (const at of changes) expect(at, "a column change waits for no frame of travel").toBeLessThanOrEqual(first);
}

/** The list fades with the move: always toward its end state, and there by the landing. */
function expectListInStep(frames: Frame[], opening: boolean) {
  const first = clickFrame(frames);
  const land = landing(frames);
  for (let i = first + 1; i <= land; i++) {
    const step = frames[i].list - frames[i - 1].list;
    expect(opening ? step : -step, `list opacity at frame ${i}`).toBeGreaterThanOrEqual(-0.01);
  }
  expect(frames[land].list).toBeCloseTo(opening ? 1 : 0, 1);
}

const firstTile = sel.tile(railIds[0]);

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("axiom:strip-hint", "seen");
    } catch {
      // Blocked storage: the hint shows, which these tests do not read.
    }
  });
});

test.describe("one motion", () => {
  test("on the wall, the tiles ride the edge both ways and are still when it lands", async ({ page }) => {
    await openCatalog(page, wallUrl());
    const toggle = page.locator(sel.railToggle);
    const open = await record(page, firstTile, () => toggle.click());
    expectOneMotion(open, RAIL, RAIL_OPEN);
    expectListInStep(open, true);
    await expect(toggle).toHaveAttribute("aria-label", "Collapse sidebar");

    const close = await record(page, firstTile, () => toggle.click());
    expectOneMotion(close, RAIL_OPEN, RAIL);
    expectListInStep(close, false);
    expect(close.at(-1)!.open, "the list leaves once the edge has covered it").toBe(false);
  });

  test("where the column count differs, it changes on the click and holds", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openCatalog(page, wallUrl());
    const toggle = page.locator(sel.railToggle);
    const open = await record(page, firstTile, () => toggle.click());
    expect([open[0].cols, open.at(-1)!.cols]).toEqual([4, 3]);
    expectOneMotion(open, RAIL, RAIL_OPEN);
    const close = await record(page, firstTile, () => toggle.click());
    expect([close[0].cols, close.at(-1)!.cols]).toEqual([3, 4]);
    expectOneMotion(close, RAIL_OPEN, RAIL);
  });

  test("on a rule, nothing moves once the edge lands", async ({ page }) => {
    await openCatalog(page, ruleUrl(railIds[0]));
    const toggle = page.locator(sel.railToggle);
    for (const [from, to] of [[RAIL, RAIL_OPEN], [RAIL_OPEN, RAIL]]) {
      const frames = await record(page, sel.ruleTitle, () => toggle.click());
      const land = landing(frames);
      expect(frames.at(-1)!.edge).toBeCloseTo(to, 0);
      expect(frames.filter((frame) => Math.abs(frame.edge - from) > 1 && Math.abs(frame.edge - to) > 1).length).toBeGreaterThan(2);
      const final = frames.at(-1)!;
      for (const frame of frames.slice(land)) {
        expect(Math.abs(frame.x - final.x)).toBeLessThanOrEqual(0.5);
        expect(Math.abs(frame.w - final.w)).toBeLessThanOrEqual(0.5);
      }
    }
  });

  test("a second click mid-move turns the edge around from where it is", async ({ page }) => {
    await openCatalog(page, wallUrl());
    const toggle = page.locator(sel.railToggle);
    const frames = await record(page, firstTile, async () => {
      await toggle.click();
      await page.waitForTimeout(70);
      await toggle.click();
    }, 1_000);
    const peak = Math.max(...frames.map((frame) => frame.edge));
    expect(peak, "it turned before arriving").toBeLessThan(RAIL_OPEN - 1);
    expect(peak).toBeGreaterThan(RAIL + 1);
    // No frame jumps: the turn starts from the edge's position on screen.
    for (let i = 1; i < frames.length; i++) expect(Math.abs(frames[i].edge - frames[i - 1].edge)).toBeLessThan(60);
    const land = landing(frames);
    const final = frames.at(-1)!;
    expect(final.edge).toBeCloseTo(RAIL, 0);
    for (const frame of frames.slice(land)) expect(Math.abs(frame.x - final.x)).toBeLessThanOrEqual(0.5);
    expect(final.open).toBe(false);
    await expect(toggle).toHaveAttribute("aria-label", "Expand sidebar");
  });
});

test.describe("instant", () => {
  const expectInstant = (frames: Frame[], to: number) => {
    expect(frames.at(-1)!.edge).toBeCloseTo(to, 0);
    expect(frames.filter((frame) => Math.abs(frame.edge - RAIL) > 1 && Math.abs(frame.edge - RAIL_OPEN) > 1), "no frame between the two edges").toEqual([]);
    expect(frames.some((frame) => frame.moving)).toBe(false);
  };

  test("the [ key moves the edge in one frame", async ({ page }) => {
    await openCatalog(page, wallUrl());
    expectInstant(await record(page, firstTile, () => page.keyboard.press("["), 400), RAIL_OPEN);
    expectInstant(await record(page, firstTile, () => page.keyboard.press("["), 400), RAIL);
  });

  test("with reduced motion, a click moves the edge in one frame", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openCatalog(page, wallUrl());
    const toggle = page.locator(sel.railToggle);
    expectInstant(await record(page, firstTile, () => toggle.click(), 400), RAIL_OPEN);
    expectInstant(await record(page, firstTile, () => toggle.click(), 400), RAIL);
  });
});

test.describe("first paint", () => {
  /** Records the edge and a box from the first frame, and every layout shift, from before the page's own scripts. */
  async function watchLoad(page: Page, target: string) {
    await page.addInitScript(
      ({ target, s }) => {
        const w = window as unknown as { __load: { edge: number; x: number; w: number }[]; __shifts: number[] };
        w.__load = [];
        w.__shifts = [];
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) w.__shifts.push((entry as unknown as { value: number }).value);
        }).observe({ type: "layout-shift", buffered: true });
        const read = () => {
          const sheet = document.querySelector(s.sheet);
          const box = document.querySelector(target)?.getBoundingClientRect();
          if (sheet && box) w.__load.push({ edge: sheet.getBoundingClientRect().left, x: box.left, w: box.width });
          if (performance.now() < 2_500) requestAnimationFrame(read);
        };
        requestAnimationFrame(read);
      },
      { target, s: hooks },
    );
  }

  for (const [name, url, target] of [
    ["the wall", () => wallUrl(), firstTile],
    ["a rule", () => ruleUrl(railIds[0]), sel.ruleTitle],
  ] as const) {
    test(`a stored-open rail paints open on ${name}, with nothing moving after`, async ({ page }) => {
      await page.addInitScript(() => {
        try {
          localStorage.setItem("axiom:v1", JSON.stringify({ prefs: { sidebarOpen: true } }));
        } catch {
          // Blocked storage: nothing is stored, and the test fails on the edge below.
        }
      });
      await watchLoad(page, target);
      await openCatalog(page, url());
      await page.waitForFunction(() => performance.now() > 2_600);
      const { load, shifts } = await page.evaluate(() => {
        const w = window as unknown as { __load: { edge: number; x: number; w: number }[]; __shifts: number[] };
        return { load: w.__load, shifts: w.__shifts };
      });
      expect(load.length, "frames sampled from first paint").toBeGreaterThan(10);
      expect(shifts, "layout-shift entries").toEqual([]);
      for (const frame of load) {
        expect(frame.edge).toBeCloseTo(RAIL_OPEN, 0);
        expect(frame).toEqual(load[0]);
      }
    });
  }

  test("a stored-open rail on a filtered link shows the list with the filter already applied", async ({ page }) => {
    await page.addInitScript(
      ({ list }) => {
        try {
          localStorage.setItem("axiom:v1", JSON.stringify({ prefs: { sidebarOpen: true } }));
        } catch {
          // Blocked storage: the list stays closed, and the test fails on the samples below.
        }
        const w = window as unknown as { __seen: string[] };
        w.__seen = [];
        const read = () => {
          const element = document.querySelector(list);
          if (element && getComputedStyle(element).visibility === "visible") {
            const state = `${[...element.querySelectorAll(".rail-count")].map((count) => count.textContent).join(",")} dim ${element.querySelectorAll("[data-dim]").length}`;
            if (w.__seen.at(-1) !== state) w.__seen.push(state);
          }
          if (performance.now() < 2_500) requestAnimationFrame(read);
        };
        requestAnimationFrame(read);
      },
      { list: sel.railList },
    );
    await openCatalog(page, wallUrl({ q: "contrast" }));
    await page.waitForFunction(() => performance.now() > 2_600);
    const seen = await page.evaluate(() => (window as unknown as { __seen: string[] }).__seen);
    expect(seen, "the list as first shown is the list as it stays").toHaveLength(1);
    expect(seen[0]).not.toMatch(/dim 0$/);
  });

  test("on a phone, a stored-open rail leaves the sheet full width", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      try {
        localStorage.setItem("axiom:v1", JSON.stringify({ prefs: { sidebarOpen: true } }));
      } catch {
        // Blocked storage: the default, which is the same layout here.
      }
    });
    await openCatalog(page, wallUrl());
    await expect(page.locator(sel.railToggle)).toBeHidden();
    const edge = await page.locator(sel.sheet).evaluate((sheet) => sheet.getBoundingClientRect().left);
    expect(edge).toBe(0);
    await expect(page.locator(sel.shell)).not.toHaveAttribute("data-moving", /.*/);
  });
});

/** Resolved geometry and any leftover move styles, without changing the wall. */
async function wallLayout(page: Page) {
  return page.locator(sel.wall).evaluate((wall) => {
    const grid = wall.querySelector(".gw-section:not([hidden]) .gw-grid")!;
    const bar = wall.querySelector(".gw-bar")!;
    const frame = wall.querySelector(".gw-wall")!;
    return {
      columns: getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).length,
      gutters: [getComputedStyle(bar).paddingLeft, getComputedStyle(frame).paddingLeft, getComputedStyle(grid).columnGap, getComputedStyle(grid).rowGap],
      styles: [...wall.querySelectorAll<HTMLElement>(".gw-bar[style], .gw-wall[style], .gw-section[style], .gw-grid[style], a.gw-tile[style]")].map((box) => box.getAttribute("style")).filter(Boolean),
      pins: [...wall.querySelectorAll("[data-pin], [data-pinned]")].length,
    };
  });
}

test.describe("interrupted moves", () => {
  test("the [ key mid-move releases the open layout and restores the natural closed wall", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openCatalog(page, wallUrl());
    const natural = await wallLayout(page);
    expect(natural.columns).toBe(4);
    await page.locator(sel.railToggle).click();
    await page.waitForTimeout(100);
    await expect(page.locator(sel.shell)).toHaveAttribute("data-moving", "open");
    await page.keyboard.press("[");
    await page.waitForTimeout(500);
    expect(await wallLayout(page)).toEqual(natural);
    await expect(page.locator(sel.shell)).not.toHaveAttribute("data-moving", /.*/);
  });

  test("enabling reduced motion mid-move releases every pin", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openCatalog(page, wallUrl());
    await page.locator(sel.railToggle).click();
    await page.waitForTimeout(80);
    await expect(page.locator(sel.shell)).toHaveAttribute("data-moving", "open");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator(sel.shell)).not.toHaveAttribute("data-moving", /.*/);
    const landed = await wallLayout(page);
    expect(landed.columns).toBe(3);
    expect(landed.styles).toEqual([]);
    await page.keyboard.press("[");
    expect((await wallLayout(page)).columns).toBe(4);
    expect((await wallLayout(page)).styles).toEqual([]);
  });

  test("a desktop resize settles the move and stays in the natural layout", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openCatalog(page, wallUrl());
    await page.locator(sel.railToggle).click();
    await page.waitForTimeout(80);
    await expect(page.locator(sel.shell)).toHaveAttribute("data-moving", "open");
    const frames = await record(page, firstTile, () => page.setViewportSize({ width: 1600, height: 800 }), 600);
    const resized = frames.filter((frame) => frame.viewport === 1600);
    expect(resized.length).toBeGreaterThan(5);
    expect(resized.every((frame) => !frame.moving)).toBe(true);
    expect(new Set(resized.map((frame) => `${frame.x},${frame.w},${frame.cols}`)).size).toBe(1);
    await expect(page.locator(sel.shell)).not.toHaveAttribute("data-moving", /.*/);
    const landed = await wallLayout(page);
    expect(landed.styles).toEqual([]);
    await page.reload();
    await expect(page.locator(sel.railToggle)).toHaveAttribute("aria-label", "Collapse sidebar");
    expect(await wallLayout(page)).toEqual(landed);
  });

  test("returning from a rule mid-move shows a wall whose columns hold on every frame", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openCatalog(page, wallUrl());
    await page.locator(firstTile).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(sel.shell)).toHaveAttribute("data-view", "rule");
    await page.locator(sel.railToggle).click();
    await page.waitForTimeout(70);
    await expect(page.locator(sel.shell)).toHaveAttribute("data-moving", "open");
    const frames = await record(page, firstTile, () => page.keyboard.press("Escape"), 600);
    await expect(page.locator(sel.shell)).toHaveAttribute("data-view", "gallery");
    const shown = frames.filter((frame) => frame.wall);
    expect(shown.length).toBeGreaterThan(5);
    expect(new Set(shown.map((frame) => frame.cols)).size).toBe(1);
    expect(shown.every((frame) => !frame.moving && frame.edge === RAIL_OPEN)).toBe(true);
    expect((await wallLayout(page)).styles).toEqual([]);
  });

  test("fading tiles reject pointer hits and become fully visible on keyboard focus", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openCatalog(page, wallUrl());
    const faded = await page.locator(sel.railToggle).evaluate((toggle) => {
      toggle.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
      const tiles = [...document.querySelectorAll<HTMLAnchorElement>("a.gw-tile")];
      const tile = tiles.find((box) => {
        const rect = box.getBoundingClientRect();
        return Number(getComputedStyle(box).opacity) < 0.1 && rect.top > 100 && rect.bottom < innerHeight;
      })!;
      const rect = tile.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      const previous = tiles[tiles.indexOf(tile) - 1];
      previous.focus({ preventScroll: true });
      return { id: tile.id, hit: hit === tile || tile.contains(hit), opacity: Number(getComputedStyle(tile).opacity) };
    });
    expect(faded.opacity).toBeLessThan(0.1);
    expect(faded.hit).toBe(false);
    await page.keyboard.press("Tab");
    const tile = page.locator(`[id="${faded.id}"]`);
    const focused = await tile.evaluate((tile) => ({ focused: document.activeElement === tile, opacity: getComputedStyle(tile).opacity }));
    expect(focused).toEqual({ focused: true, opacity: "1" });
    await page.waitForTimeout(400);
    expect((await wallLayout(page)).styles).toEqual([]);
  });

  test("classic scrollbar width does not change the sheet query gutters after landing", async ({ page }) => {
    await page.setViewportSize({ width: 1530, height: 900 });
    await openCatalog(page, wallUrl());
    await page.addStyleTag({ content: ".shell-wall { scrollbar-gutter: stable; overflow-y: scroll } .shell-wall::-webkit-scrollbar { width: 15px }" });
    const scrollbar = await page.locator(sel.wallLayer).evaluate((layer) => layer.getBoundingClientRect().width - layer.clientWidth);
    expect(scrollbar).toBe(15);
    const frames = await record(page, firstTile, () => page.locator(sel.railToggle).click());
    expectOneMotion(frames, RAIL, RAIL_OPEN);
    const landed = await wallLayout(page);
    expect(landed.gutters[0]).toBe("32px");
    expect(landed.styles).toEqual([]);
    await page.waitForTimeout(300);
    expect(await wallLayout(page)).toEqual(landed);
  });
});
