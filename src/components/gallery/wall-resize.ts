// design-system: strict

import type { SheetResizer } from "@/components/shell/sheet-resize";

/*
 * The wall's part in a sheet move (sheet-resize.ts). The tiles track the
 * sheet's edge by reflowing, so two things would otherwise step partway
 * through the move: the gutters, at gallery.css's container query, and the
 * column count, whenever the width crosses a track. Both are pinned at the
 * destination's values for the move, so the tracks only widen or narrow.
 *
 * The pins are the resolved properties, written on the few boxes the
 * gutters space (PINNED_USES). gallery.css keeps the gutters on those boxes,
 * non-inherited, so neither a pin nor the container query stepping under it
 * restyles the tiles. wall-resize.test.ts holds gallery.css to that list.
 *
 * Pinning still shifts tiles on the click where the gutters differ at the
 * destination, and re-slots them where the column count does. Every tile
 * that moved and is on screen, before or after, settles on the move's own
 * duration and easing (settleFor): a shift glides from where it was, a new
 * slot fades in. The tile the reader is looking at holds its place on screen.
 */

/** The gutters gallery.css steps at its container query. */
export const PINNED_GUTTERS = ["--gw-pad", "--gw-gap", "--gw-row-gap", "--gw-section-gap"] as const;

/** Every box in gallery.css that a gutter spaces, and the properties that carry it. */
export const PINNED_USES = {
  ".gw-bar": ["padding-left"],
  ".gw-wall": ["padding-left", "padding-right"],
  ".gw-section:not([hidden]) ~ .gw-section": ["padding-top"],
  ".gw-grid": ["column-gap", "row-gap"],
} as const satisfies Record<string, readonly string[]>;

type Selector = keyof typeof PINNED_USES;
const SELECTORS = Object.keys(PINNED_USES) as Selector[];
const PROPERTIES = [...new Set(Object.values(PINNED_USES).flat()), "grid-template-columns"];

/** The track count of a resolved `grid-template-columns` ("271px 271px 271px"). */
export function trackCount(columns: string): number {
  const value = columns.trim();
  if (!value || value === "none") return 0;
  return value.split(/\s+(?![^(]*\))/).length;
}

type Box = { left: number; top: number; right: number; bottom: number };
const overlaps = (a: Box, b: Box) => a.bottom > b.top && a.top < b.bottom && a.right > b.left && a.left < b.right;

/**
 * How a tile gets from where it was to its new slot. A short move (within
 * half a tile: the gutters' few pixels, the sheet's edge) glides, offset by
 * where it was. A tile the new column count sends to another slot fades in
 * there instead: gliding across rows sends tiles over one another. Null when
 * it has not moved.
 */
export function settleFor(was: Box, now: Box): { glide: { x: number; y: number } } | { fade: true } | null {
  const x = was.left - now.left;
  const y = was.top - now.top;
  if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5) return null;
  const width = now.right - now.left;
  const height = now.bottom - now.top;
  return Math.abs(x) <= width / 2 && Math.abs(y) <= height / 2 ? { glide: { x, y } } : { fade: true };
}

type Layout = { values: string[]; columns: number };

const sameLayout = (a: Layout, b: Layout) => a.columns === b.columns && a.values.every((value, i) => value === b.values[i]);

/** Each pinned property, in PINNED_USES order, as the first matching box resolves it; and the column count. */
function readLayout(wall: HTMLElement): Layout {
  const values = SELECTORS.flatMap((selector) => {
    const box = wall.querySelector<HTMLElement>(selector);
    const style = box ? getComputedStyle(box) : null;
    return PINNED_USES[selector].map((property) => style?.getPropertyValue(property) ?? "");
  });
  const grid = wall.querySelector<HTMLElement>(".gw-section:not([hidden]) .gw-grid");
  return { values, columns: grid ? trackCount(getComputedStyle(grid).gridTemplateColumns) : 0 };
}

/**
 * The layout the wall will have at a given layer width, without laying the
 * wall out there: an empty copy of its frame (the sheet's container, the
 * wall, its toolbar, two sections and a grid with one cell), out of flow in
 * the shell, read and removed in the same task. It answers the container
 * query and the auto-fill count exactly as the wall will.
 */
function probeLayout(host: HTMLElement, width: number): Layout {
  const probe = document.createElement("div");
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText = `position:absolute;top:0;left:0;width:${width}px;height:0;overflow:hidden;visibility:hidden;pointer-events:none;container:sheet/inline-size`;
  probe.innerHTML = '<div class="gw"><div class="gw-bar"></div><div class="gw-wall"><section class="gw-section"><ul class="gw-grid"><li></li></ul></section><section class="gw-section"></section></div></div>';
  host.append(probe);
  const layout = readLayout(probe.firstElementChild as HTMLElement);
  probe.remove();
  return layout;
}

/**
 * The wall's resizer. `root` is the wall (`.gw`); `scroller` is the layer it
 * scrolls in, read lazily because the layer can change under it.
 */
export function wallResizer(root: HTMLElement, scroller: () => HTMLElement | null): SheetResizer {
  let tiles: HTMLElement[] = [];
  let before = new Map<HTMLElement, DOMRect>();
  let anchor: HTMLElement | null = null;
  let glided: HTMLElement[] = [];
  let pins: HTMLElement[] = [];
  let width = 0;
  let current: Layout | null = null;
  /** The wall was pinned, or tiles were gliding, when this move began: it has to be pinned or glided again. */
  let carried = false;

  return {
    measure() {
      const layer = scroller();
      tiles = [...root.querySelectorAll<HTMLElement>(".gw-tile")].filter((tile) => !tile.closest("[hidden]"));
      before = new Map(tiles.map((tile) => [tile, tile.getBoundingClientRect()]));
      width = layer?.clientWidth ?? root.clientWidth;
      carried = pins.length > 0 || glided.length > 0;
      current = carried ? null : readLayout(root);
      // The reader's place: the first tile whose top is in view, once the wall has scrolled.
      const top = layer && layer.scrollTop > 0 ? layer.getBoundingClientRect().top : null;
      anchor = top === null ? null : tiles.find((tile) => (before.get(tile)?.top ?? -Infinity) >= top) ?? null;
    },
    release() {
      for (const box of pins) for (const property of PROPERTIES) box.style.removeProperty(property);
      for (const tile of glided) {
        tile.style.removeProperty("translate");
        tile.style.removeProperty("opacity");
        tile.style.removeProperty("transition");
      }
      pins = [];
      glided = [];
    },
    pin(grow) {
      // The sheet's right edge holds, so its width (and the layer's) changes by what its left edge travels.
      const host = root.closest(".shell") ?? document.body;
      const next = probeLayout(host as HTMLElement, width + grow);
      if (current && sameLayout(next, current)) return;
      let at = 0;
      for (const selector of SELECTORS) {
        const properties = PINNED_USES[selector];
        const values = next.values.slice(at, at + properties.length);
        at += properties.length;
        for (const box of root.querySelectorAll<HTMLElement>(selector)) {
          properties.forEach((property, i) => {
            if (values[i]) box.style.setProperty(property, values[i]);
          });
          if (selector === ".gw-grid" && next.columns > 0) box.style.setProperty("grid-template-columns", `repeat(${next.columns}, minmax(0, 1fr))`);
          pins.push(box);
        }
      }
    },
    glide({ duration, easing }) {
      if (!pins.length && !carried) return;
      const layer = scroller();
      // Hold the reader's tile where it was: the scroll moves, not the tile.
      const was = anchor ? before.get(anchor) : undefined;
      if (layer && anchor && was) {
        const shift = anchor.getBoundingClientRect().top - was.top;
        if (Math.abs(shift) >= 0.5) layer.scrollTop += shift;
      }
      const view: Box = layer?.getBoundingClientRect() ?? { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
      const moves: [HTMLElement, NonNullable<ReturnType<typeof settleFor>>][] = [];
      for (const tile of tiles) {
        const from = before.get(tile);
        if (!from) continue;
        const now = tile.getBoundingClientRect();
        const settle = settleFor(from, now);
        if (settle && (overlaps(from, view) || overlaps(now, view))) moves.push([tile, settle]);
      }
      if (!moves.length) return;
      for (const [tile, settle] of moves) {
        tile.style.transition = "none";
        if ("glide" in settle) tile.style.translate = `${settle.glide.x}px ${settle.glide.y}px`;
        else tile.style.opacity = "0";
      }
      void root.offsetWidth;
      for (const [tile, settle] of moves) {
        tile.style.transition = `${"glide" in settle ? "translate" : "opacity"} ${duration}ms ${easing}`;
        tile.style.removeProperty("glide" in settle ? "translate" : "opacity");
      }
      glided = moves.map(([tile]) => tile);
    },
  };
}
