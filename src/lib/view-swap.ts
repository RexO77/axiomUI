export type SwapPhase = "idle" | "out" | "swapped";

const FADE_FALLBACK_MS = 200;

/** Commit a view while its surface is hidden, then reveal it on the next frame. */
export function createViewSwap<View extends string>(
  initialView: View,
  onView: (view: View) => void,
  onPhase: (phase: SwapPhase) => void,
) {
  let view = initialView;
  let phase: SwapPhase = "idle";
  let pending: View | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let frame: number | null = null;
  let generation = 0;

  function setView(next: View) {
    if (next === view) return;
    view = next;
    onView(next);
  }

  function setPhase(next: SwapPhase) {
    if (next === phase) return;
    phase = next;
    onPhase(next);
  }

  function clearWork() {
    if (timer !== null) clearTimeout(timer);
    if (frame !== null) cancelAnimationFrame(frame);
    timer = null;
    frame = null;
  }

  function finishFade() {
    if (phase !== "out" || pending === null) return;
    const next = pending;
    const currentGeneration = generation;
    pending = null;
    if (timer !== null) clearTimeout(timer);
    timer = null;
    setPhase("swapped");
    if (generation !== currentGeneration) return;
    setView(next);
    if (generation !== currentGeneration) return;
    frame = requestAnimationFrame(() => {
      if (generation !== currentGeneration) return;
      frame = null;
      setPhase("idle");
    });
  }

  function request(next: View, reduced = false) {
    if (next === view || phase !== "idle") return false;
    if (reduced) {
      setView(next);
      return true;
    }
    pending = next;
    const currentGeneration = ++generation;
    timer = setTimeout(() => {
      if (generation !== currentGeneration) return;
      timer = null;
      finishFade();
    }, FADE_FALLBACK_MS);
    setPhase("out");
    return true;
  }

  function cancel(notify = true) {
    generation++;
    clearWork();
    pending = null;
    if (notify) setPhase("idle");
    else phase = "idle";
  }

  function reset(next: View) {
    cancel();
    setView(next);
  }

  function reduceMotion() {
    const next = pending;
    generation++;
    clearWork();
    pending = null;
    if (next !== null) setView(next);
    setPhase("idle");
  }

  return { request, finishFade, cancel, reset, reduceMotion };
}
