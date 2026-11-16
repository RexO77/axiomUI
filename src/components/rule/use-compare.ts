// design-system: strict
"use client";

// Compare state. Mode and zoom are stored preferences (they persist across
// paging and visits); Flip's side and any hold belong to one rule, so a page
// turn starts on Do. F and Z come from the shared shortcut table; Space is a
// hold, handled here and released whenever its release can no longer arrive.

import { useCallback, useEffect, useEffectEvent, useReducer, useRef, useSyncExternalStore } from "react";

import { catalogStores, type CatalogStores, type CompareMode, type Prefs } from "@/lib/catalog/stores";
import { shortcutAction } from "@/lib/navigation/keyboard";
import { memoryStore } from "@/lib/navigation/memory";

export type Side = "do" | "dont";
export type Pan = Readonly<{ x: number; y: number }>;

/** 2× by transform around a box laid out at 1×. Nothing else is ever scaled. */
export const ZOOM_SCALE = 2;
export const PAN_STEP = 40;
export const PAN_STEP_LARGE = 120;
/** The focused Flip canvas owns Space; on the body or the rule title it holds too. */
const CANVAS_SELECTOR = "[data-compare-canvas]";
const SPACE_TARGETS = `${CANVAS_SELECTOR}, [data-rule-title]`;

const limit = (value: number, edge: number) => Math.max(-edge, Math.min(edge, value)) + 0;

/** A pan never takes the box more than a quarter of the canvas off centre. */
export function clampPan(pan: Pan, width: number, height: number): Pan {
  return { x: limit(pan.x, width / 4), y: limit(pan.y, height / 4) };
}

/**
 * `translate(pan) scale(2)` scales the box first and then moves it in the
 * canvas's own pixels, so the content follows the pointer one to one.
 */
export function panByPointer(from: Pan, dx: number, dy: number): Pan {
  return { x: from.x + dx, y: from.y + dy };
}

/** Arrow keys move the content the way the arrow points away from: ← shows more of the left. */
export function panKeyDelta(key: string, large: boolean): Pan | null {
  const step = large ? PAN_STEP_LARGE : PAN_STEP;
  const x = key === "ArrowLeft" ? 1 : key === "ArrowRight" ? -1 : 0;
  const y = key === "ArrowUp" ? 1 : key === "ArrowDown" ? -1 : 0;
  return x || y ? { x: x * step, y: y * step } : null;
}

/** The table's F and Z, as a change to the stored preferences. */
export function compareKeyPatch(action: "flip" | "zoom", prefs: Prefs): Partial<Prefs> {
  return action === "flip" ? { mode: prefs.mode === "flip" ? "side" : "flip" } : { zoom: prefs.zoom === 2 ? 1 : 2 };
}

export type FlipState = Readonly<{ ruleId: string; flipped: boolean; held: boolean }>;
type FlipAction = Readonly<
  { ruleId: string } & ({ type: "toggle" } | { type: "hold"; on: boolean } | { type: "mode" })
>;

export const freshFlip = (ruleId: string): FlipState => ({ ruleId, flipped: false, held: false });

/** Every action names its rule; an action for another rule starts from Do. */
export function flipReducer(state: FlipState, action: FlipAction): FlipState {
  const base = action.ruleId === state.ruleId ? state : freshFlip(action.ruleId);
  switch (action.type) {
    case "toggle":
      return { ...base, flipped: !base.flipped };
    case "hold":
      return base.held === action.on ? base : { ...base, held: action.on };
    case "mode":
      return base.flipped || base.held ? freshFlip(base.ruleId) : base;
  }
}

/** What a Flip canvas shows: a hold inverts the toggled side. Side by side shows both, led by Do. */
export function flipShowing(mode: CompareMode, state: FlipState): Side {
  return mode === "flip" && state.flipped !== state.held ? "dont" : "do";
}

const singleKeysOn = () => memoryStore.getSnapshot().prefs.singleKeys;

type Compare = {
  mode: CompareMode;
  zoom: 1 | 2;
  showing: Side;
  flipped: boolean;
  held: boolean;
  setMode: (mode: CompareMode) => void;
  setZoom: (zoom: 1 | 2) => void;
  toggle: () => void;
  hold: (on: boolean) => void;
};

export function useCompare(ruleId: string, stores: CatalogStores = catalogStores): Compare {
  // The server renders the defaults; the client corrects after hydration.
  const prefs = useSyncExternalStore(stores.prefs.subscribe, stores.prefs.get, stores.prefs.server);
  const [stored, dispatch] = useReducer(flipReducer, ruleId, freshFlip);
  const state = stored.ruleId === ruleId ? stored : freshFlip(ruleId);

  const setMode = useCallback(
    (mode: CompareMode) => {
      dispatch({ type: "mode", ruleId });
      stores.writePrefs({ mode });
    },
    [ruleId, stores],
  );
  const setZoom = useCallback((zoom: 1 | 2) => stores.writePrefs({ zoom }), [stores]);
  const toggle = useCallback(() => dispatch({ type: "toggle", ruleId }), [ruleId]);
  const hold = useCallback((on: boolean) => dispatch({ type: "hold", on, ruleId }), [ruleId]);
  /** Where a keyboard hold started (the canvas, the title or the body): focus leaving it releases. */
  const holdOrigin = useRef<EventTarget | null>(null);

  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    const singleKeys = singleKeysOn();
    const action = shortcutAction(event, { view: "rule", singleKeys });
    if (action === "flip" || action === "zoom") {
      event.preventDefault();
      const patch = compareKeyPatch(action, stores.prefs.get());
      if (patch.mode) setMode(patch.mode);
      else stores.writePrefs(patch);
      return;
    }
    if (event.key !== " " || event.defaultPrevented || event.isComposing || prefs.mode !== "flip") return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target;
    const onCanvas = target instanceof Element && target.matches(CANVAS_SELECTOR);
    // Single keys off (WCAG 2.1.4): Space works only as a key of the focused canvas.
    const allowed = onCanvas || (singleKeys && (target === document.body || (target instanceof Element && target.matches(SPACE_TARGETS))));
    if (!allowed) return;
    event.preventDefault();
    if (event.repeat) return;
    holdOrigin.current = target;
    hold(true);
  });
  const release = useEffectEvent(() => {
    holdOrigin.current = null;
    hold(false);
  });
  /** Focus moved: away from the element that started the hold, or anywhere when it started on the body. */
  const onFocusMove = useEffectEvent((event: FocusEvent) => {
    const origin = holdOrigin.current;
    if (origin && (event.type === "focusout" ? event.target === origin : event.target !== origin)) release();
  });

  useEffect(() => {
    const onDown = (event: KeyboardEvent) => onKeyDown(event);
    const onUp = (event: KeyboardEvent) => {
      if (event.key === " ") release();
    };
    const onHidden = () => {
      if (document.visibilityState === "hidden") release();
    };
    const onBlur = () => release();
    const onFocus = (event: FocusEvent) => onFocusMove(event);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("focusout", onFocus);
    document.addEventListener("keydown", onDown);
    document.addEventListener("keyup", onUp);
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", onFocus);
      document.removeEventListener("keydown", onDown);
      document.removeEventListener("keyup", onUp);
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  return {
    mode: prefs.mode,
    zoom: prefs.zoom,
    showing: flipShowing(prefs.mode, state),
    flipped: state.flipped,
    held: state.held,
    setMode,
    setZoom,
    toggle,
    hold,
  };
}
