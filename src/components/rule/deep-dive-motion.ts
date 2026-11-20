// design-system: strict

/*
 * On wide sheets, slide only the deep dive in the reserved right column.
 * On narrower sheets, reveal its actual footprint below the comparison so
 * Related and the following rows always sit outside the moving panel.
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
  const wide = docked(side);
  const sheetRight = (sheet ?? root).getBoundingClientRect().right;
  // Capture the visible panel or its exiting copy before cancelling a reversal.
  const visible = old ?? panel;
  const from = visible.getBoundingClientRect();
  const fromMargin = getComputedStyle(visible).marginTop;
  const scrollTop = visible.scrollTop;
  const ghost = opening ? null : ghostOf(panel, from, root);
  cancelDeepDive(root);
  commit();

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
    ghost.scrollTop = scrollTop;
    surface = ghost;
  } else {
    surface = panel;
    const rest = panel.getBoundingClientRect();
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
