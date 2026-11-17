// design-system: strict

/*
 * Showing and hiding the deep dive with a pointer: one continuous move.
 *
 * The layout changes once, in the frame of the click (`commit` flushes the
 * store change and React's commit synchronously). Everything that moved is
 * measured before and after, then drawn back where it was and eased home by
 * transform, so nothing lays out again while it plays and the last frame is
 * the layout itself. On a sheet of 1160px or more the docked panel slides in
 * from the sheet's right edge as the main column makes room; a closing panel
 * leaves as a frozen, inert copy sliding back out, so the column it gives back
 * fills at once. Below 1160 the dive opens under the comparison: it fades in
 * as the rows under it move down, and fades out as they move up.
 *
 * The timing is the rail drawer's (geometry.ts): OPEN_MS on --ease-drawer in,
 * CLOSE_MS on --ease-out-strong out, so both side panels move alike.
 *
 * Interruptible: a second click reads every element where it is drawn now
 * (a rect includes its running transform), cancels what is playing, and
 * starts from there. A panel turned back mid-exit resumes from its copy's
 * place and opacity.
 *
 * A keyboard toggle (I, or Enter on the button) and reduced motion skip all
 * of this: `animate` is false and the commit is the whole change.
 */

import { CLOSE_MS, OPEN_MS } from "@/components/shell/geometry";

/** What keeps its place in the flow and only moves: the header's controls and the main column's blocks. */
const MOVERS = ".rv-head > :not(.rv-spacer), .rv-main, .rv-ship, .rv-related, .rv-next";

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
function ghostOf(el: HTMLElement, rect: DOMRect, root: HTMLElement, surface: boolean): HTMLElement {
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
  copy.setAttribute("aria-hidden", "true");
  copy.inert = true;
  copy.classList.add("rv-ghost");
  if (surface) copy.dataset.surface = "";
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

  // First: where everything is drawn now, transforms included.
  const wasDocked = docked(side);
  const related = root.querySelector<HTMLElement>(".rv-related");
  const movers = [...root.querySelectorAll<HTMLElement>(MOVERS)];
  const first = new Map(movers.map((el) => [el, el.getBoundingClientRect()]));
  const shown = wasDocked ? side : panel;
  const opacity = Number(getComputedStyle(shown).opacity);

  // A closing panel and, opening a docked one, Related's place in the column: copied before they change.
  let exit: { ghost: HTMLElement; distance: number } | null = null;
  if (!opening) {
    const rect = shown.getBoundingClientRect();
    exit = { ghost: ghostOf(shown, rect, root, true), distance: sheetRight - rect.left };
  }
  const resume = old ? { rect: old.getBoundingClientRect(), opacity: Number(getComputedStyle(old).opacity) } : null;
  const relatedRect = related && first.get(related);
  const relatedGhost = opening && !wasDocked && related && relatedRect ? ghostOf(related, relatedRect, root, false) : null;

  cancelDeepDive(root);
  commit();

  const active = { animations: [] as Animation[], ghosts: [] as HTMLElement[], observer: null as ResizeObserver | null };
  transitions.set(root, active);
  const play = (el: Element, frames: Keyframe[], options: KeyframeAnimationOptions) => {
    const animation = el.animate(frames, options);
    active.animations.push(animation);
    return animation;
  };

  // Last: the new layout, untransformed. Related changes column when the panel docks or leaves.
  const isDocked = docked(side);
  const crossed = wasDocked !== isDocked;
  const timing = opening ? OPEN : CLOSE;

  for (const el of movers) {
    if (crossed && el === related) continue;
    const before = first.get(el);
    if (!before) continue;
    const after = el.getBoundingClientRect();
    const dx = before.left - after.left;
    const dy = before.top - after.top;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;
    play(el, [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], timing);
  }

  if (opening) {
    const entering = isDocked ? side : panel;
    const rest = entering.getBoundingClientRect();
    if (isDocked) {
      // From the sheet's edge, or from wherever the leaving copy had got to.
      const from = resume ? resume.rect.left - rest.left : sheetRight - rest.left;
      play(
        entering,
        [{ transform: `translateX(${from}px)` }, { transform: "none" }],
        timing,
      );
    } else {
      // Let the rows clear most of the entering surface before its prose appears.
      const from = resume?.opacity ?? 0;
      play(entering, [{ opacity: from }, { opacity: from, offset: 0.35, easing: timing.easing }, { opacity: 1 }], { ...timing, easing: "linear" });
    }
    // Related's old place in the column fades as the rows under it close up.
    if (relatedGhost && crossed) {
      const gone = () => relatedGhost.remove();
      root.append(relatedGhost);
      active.ghosts.push(relatedGhost);
      play(relatedGhost, [{ opacity: 1 }, { opacity: 0 }], CLOSE).finished.then(gone, gone);
    }
  } else if (exit) {
    const { ghost, distance } = exit;
    root.append(ghost);
    active.ghosts.push(ghost);
    leaving.set(root, ghost);
    // The copy starts at the drawn rect, which already includes any interrupted shift.
    const out = wasDocked ? [{ transform: "none" }, { transform: `translateX(${distance}px)` }] : [{ opacity }, { opacity: 0 }];
    const done = () => {
      ghost.remove();
      if (leaving.get(root) === ghost) leaving.delete(root);
    };
    play(ghost, out, timing).finished.then(done, done);
    // Related joins the main column again: it fades in where it now sits.
    if (crossed && related) play(related, [{ opacity: 0 }, { opacity: 1 }], timing);
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
