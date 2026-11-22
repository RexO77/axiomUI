// design-system: strict

/*
 * On wide sheets the docked column (the deep dive and Related) slides in from,
 * or out past, the sheet's right edge. With the dive hidden that column is
 * not reserved (rule.css): the stage re-centres at the one column's width and
 * Related joins it, so the whole column leaves as one card, not the dive
 * alone. The main column and the header's left group change width at once
 * and slide to their new x on the same timing.
 * On narrower sheets, reveal the dive's actual footprint below the comparison
 * so Related and the following rows always sit outside the moving panel.
 * The real panel is hidden immediately on close for focus and find-in-page.
 * Its inert visual copy finishes the exit and yields its geometry on reversal.
 * Keyboard and reduced-motion toggles commit immediately.
 */

import { CLOSE_MS, OPEN_MS } from "@/components/shell/geometry";

/** Copied from the panel onto its copy, element by element: everything its open layout sets. */
const FROZEN = [
  "display",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "grid-template-columns",
  "column-gap",
  "box-shadow",
  "background-color",
  "border-radius",
  "overflow-y",
  "scrollbar-gutter",
  "border-block-start",
  // html[data-deep="hidden"] matches the copy too once the store has changed.
  "content-visibility",
] as const;

/** What moves sideways when the stage re-centres: the main column's blocks and the header's left group. */
const FOLLOWERS = ".rv-stage > :is(.rv-main, .rv-ship, .rv-next), .rv-head > :is(.rv-crumb, .rv-pager, .rv-deckq)";

const OPEN = { duration: OPEN_MS, easing: "cubic-bezier(0.32, 0.72, 0, 1)" };
const CLOSE = { duration: CLOSE_MS, easing: "cubic-bezier(0.23, 1, 0.32, 1)" };

/** The leaving copy of each rule view, so a reopen can pick it up where it is. */
const leaving = new WeakMap<HTMLElement, HTMLElement>();
const transitions = new WeakMap<HTMLElement, { animations: Animation[]; ghosts: HTMLElement[]; observer: ResizeObserver | null }>();

/** End only this transition's effects, including copies detached from the stage grid. */
export function cancelDeepDive(root: HTMLElement | null) {
  if (!root) return;
  const active = transitions.get(root);
  transitions.delete(root);
  active?.observer?.disconnect();
  active?.animations.forEach((animation) => animation.cancel());
  active?.ghosts.forEach((ghost) => ghost.remove());
  leaving.delete(root);
}

/** Docked beside the main column (≥ 1160), rather than a pass-through under the comparison. */
const docked = (side: HTMLElement) => getComputedStyle(side).display !== "contents";

/** The element that scrolls the dive's prose: the panel itself, or the panel inside a copy of the docked column. */
const scrollerOf = (el: HTMLElement) =>
  el.classList?.contains("rv-side") ? (el.querySelector<HTMLElement>(".rv-dd") ?? el) : el;

/** A visual-only copy of `el`, frozen in its current layout, placed at `rect` inside `root`. */
function ghostOf(el: HTMLElement, rect: DOMRect, root: HTMLElement): HTMLElement {
  const copy = el.cloneNode(true) as HTMLElement;
  const from = [el, ...el.querySelectorAll<HTMLElement>("*")];
  const to = [copy, ...copy.querySelectorAll<HTMLElement>("*")];
  from.forEach((source, index) => {
    const style = getComputedStyle(source);
    const target = to[index];
    for (const property of FROZEN) target.style.setProperty(property, style.getPropertyValue(property));
    target.removeAttribute("id");
  });
  copy.removeAttribute("hidden");
  copy.removeAttribute("data-panel-rule");
  copy.setAttribute("aria-hidden", "true");
  copy.inert = true;
  copy.classList.add("rv-ghost");
  copy.dataset.surface = "";
  const box = root.getBoundingClientRect();
  Object.assign(copy.style, {
    left: `${rect.left - box.left}px`,
    top: `${rect.top - box.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    boxSizing: "border-box",
    margin: "0",
  });
  return copy;
}

export function toggleDeepDive(root: HTMLElement | null, opening: boolean, commit: () => void, animate: boolean) {
  const side = root?.querySelector<HTMLElement>(".rv-side");
  const panel = root?.querySelector<HTMLElement>(".rv-dd");
  const old = root ? leaving.get(root) : undefined;
  if (!root || !side || !panel || !animate) {
    cancelDeepDive(root);
    commit();
    return;
  }

  const sheet = root.closest<HTMLElement>(".shell-sheet");
  const sheetRight = (sheet ?? root).getBoundingClientRect().right;
  // Closing leaves what is on screen: the docked column, or the inline panel.
  const leavingEl = opening ? null : docked(side) ? side : panel;
  // Capture the visible panel or its exiting copy before cancelling a reversal.
  const visible = old ?? leavingEl ?? panel;
  const from = visible.getBoundingClientRect();
  const fromMargin = getComputedStyle(visible).marginTop;
  const scrollTop = scrollerOf(old ?? panel).scrollTop;
  const ghost = leavingEl ? ghostOf(leavingEl, from, root) : null;
  // Where the followers are on screen now, mid-slide included, so a reversal turns them around in place.
  const followers = [...root.querySelectorAll<HTMLElement>(FOLLOWERS)].map((el) => ({ el, left: el.getBoundingClientRect().left }));
  cancelDeepDive(root);
  commit();
  // The hidden dive reserves no column, so an opening side docks only once committed.
  const wide = leavingEl ? leavingEl === side : docked(side);

  const active = { animations: [] as Animation[], ghosts: [] as HTMLElement[], observer: null as ResizeObserver | null };
  transitions.set(root, active);
  const timing = opening ? OPEN : CLOSE;

  let surface: HTMLElement;
  let frames: Keyframe[];
  if (ghost) {
    active.ghosts.push(ghost);
    leaving.set(root, ghost);
    if (wide) {
      root.append(ghost);
      frames = [{ transform: "none" }, { transform: `translateX(${sheetRight - from.left}px)` }];
    } else {
      // The visual copy keeps its place in the grid while the actual aside
      // stays discoverable with hidden="until-found". Its siblings follow
      // the clipped height instead of sliding behind the exiting text.
      Object.assign(ghost.style, { position: "relative", left: "auto", top: "auto", overflow: "clip", marginTop: fromMargin });
      panel.after(ghost);
      frames = [{ height: `${from.height}px`, marginTop: fromMargin }, { height: "0px", marginTop: "0px" }];
    }
    scrollerOf(ghost).scrollTop = scrollTop;
    surface = ghost;
  } else {
    surface = wide ? side : panel;
    const rest = surface.getBoundingClientRect();
    if (wide) {
      const start = old ? from.left : sheetRight;
      frames = [{ transform: `translateX(${start - rest.left}px)` }, { transform: "none" }];
    } else {
      const margin = getComputedStyle(panel).marginTop;
      frames = [
        { height: `${old ? from.height : 0}px`, marginTop: old ? fromMargin : "0px", overflow: "clip" },
        { height: `${rest.height}px`, marginTop: margin, overflow: "clip" },
      ];
    }
    if (old) panel.scrollTop = scrollTop;
  }
  active.animations.push(surface.animate(frames, timing));
  if (wide) {
    for (const { el, left } of followers) {
      const dx = left - el.getBoundingClientRect().left;
      if (Math.abs(dx) > 0.5) active.animations.push(el.animate([{ transform: `translateX(${dx}px)` }, { transform: "none" }], timing));
    }
  }

  if (sheet && active.animations.length) {
    const width = sheet.clientWidth;
    const height = sheet.clientHeight;
    active.observer = new ResizeObserver(() => {
      if (sheet.clientWidth !== width || sheet.clientHeight !== height) cancelDeepDive(root);
    });
    active.observer.observe(sheet);
  }
  void Promise.allSettled(active.animations.map((animation) => animation.finished)).then(() => {
    if (transitions.get(root) === active) cancelDeepDive(root);
  });
}
