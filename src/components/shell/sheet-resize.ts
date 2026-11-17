// design-system: strict

/*
 * The sheet's width moves when the rail opens or closes. Its left edge
 * transitions and everything inside reflows with it on every frame, so the
 * content lands in its final layout on the same frame the edge does, and
 * nothing moves after that.
 *
 * Content that would change in steps partway through the move registers a
 * resizer here. Today that is only the gallery wall: its gutters step at a
 * container query and its column count steps whenever the width crosses a
 * track. For the length of the move it pins both to their values at the
 * destination, and tiles whose slot changed glide there from where they were.
 *
 * `moveSheet` holds the edge where it is on screen (mid-move, if this move
 * interrupts another), hands the resizers the width change so they can pin,
 * and lets CSS transition the edge from there. With no resizer on screen (a rule page), the
 * attribute change alone starts the move, and CSS retargets a running
 * transition by itself.
 */

export type SheetMoveTiming = { duration: number; easing: string };

export type SheetResizer = {
  /** Before anything changes: read positions as they are on screen. */
  measure(): void;
  /** Drop the pins and glides of an earlier move. Positions were already read. */
  release(): void;
  /** Pin, at their destination values, whatever would step on the way. `grow` is the sheet's width change in px. */
  pin(grow: number): void;
  /** The sheet is back where it started, with the pins on: glide whatever moved. */
  glide(timing: SheetMoveTiming): void;
};

const resizers = new Set<SheetResizer>();

/** Takes part in every sheet move until the returned function is called. */
export function registerSheetResizer(resizer: SheetResizer): () => void {
  resizers.add(resizer);
  return () => {
    resizers.delete(resizer);
    resizer.release();
  };
}

/**
 * Moves the sheet's left edge to `to` (px from the viewport's left), the
 * value the stylesheet gives it once `apply` has set the target attribute,
 * under a transition. Returns the release: call it once the move ends. The
 * pins hold the destination's values, so releasing moves nothing.
 *
 * Nothing here reads `left` from computed style: for a positioned box that is
 * a used value, and each read would lay the whole sheet out.
 */
export function moveSheet(sheet: HTMLElement, apply: () => void, to: number, timing: SheetMoveTiming): () => void {
  const active = [...resizers];
  if (!active.length) {
    apply();
    return () => {};
  }
  // Read before any write: the edge where it is on screen (mid-move, too), and the content with it.
  const from = sheet.getBoundingClientRect().left;
  for (const resizer of active) resizer.measure();
  for (const resizer of active) resizer.release();
  // Hold the edge where it is while the target changes under it.
  sheet.style.transition = "none";
  sheet.style.left = `${from}px`;
  apply();
  // A style read, not a layout one: the transition below starts from `from`.
  void getComputedStyle(sheet).transitionProperty;
  // The right edge holds, so the width changes by what the left edge travels.
  for (const resizer of active) resizer.pin(from - to);
  for (const resizer of active) resizer.glide(timing);
  // One style change, from `from` to the destination, under the stylesheet's transition.
  sheet.style.removeProperty("left");
  sheet.style.removeProperty("transition");
  return () => {
    for (const resizer of active) resizer.release();
  };
}
