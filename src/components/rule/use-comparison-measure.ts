// design-system: strict
"use client";

import { useCallback, useEffect, useEffectEvent, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from "react";

import { memoryStore } from "@/lib/navigation/memory";
import { shortcutAction } from "@/lib/navigation/keyboard";
import { comparisonTargets, deepestAt, describeTarget, gapBetween, height, sizeLabel, targetName, width, type Point, type Target } from "./measure-geometry";
import { inspectText, measurePane, settleChips, previewObstacles } from "./measure/measure";
import type { Measured } from "./measure/annotation-readout";
import type { RuleAnnotations } from "./measure/specs";
import type { Side } from "./use-compare";

type Selection = { pin: Element | null; second: Element | null; cursor: Element | null; pointer: (Point & { alt: boolean }) | null };
type Input = { point: Point } | { step: number } | { confirm: true };
const emptySelection = (): Selection => ({ pin: null, second: null, cursor: null, pointer: null });

function pinTarget(selection: Selection, target: Target | undefined, targets: Target[]) {
  const previous = targets.find(({ element }) => element === selection.pin);
  if (previous && target && previous.side === target.side && previous !== target) {
    selection.second = target.element;
  } else {
    selection.pin = target?.element ?? null;
    selection.second = null;
  }
}

type TextReading = { target: Target; name: string; measure: ReturnType<typeof settleChips> };
/** The last text reading, reused while its element, geometry, text and the page's fonts and theme hold. */
type TextCache = { last: { element: Element; key: string; reading: TextReading } | null; version: number };

function readText(inspected: Target, pane: Element, zoom: number, cache: TextCache): TextReading {
  const rect = pane.getBoundingClientRect();
  const { left, top, right, bottom } = inspected.rect;
  const key = [cache.version, zoom, rect.left, rect.top, rect.width, rect.height, left, top, right, bottom, inspected.element.textContent].join("|");
  const last = cache.last;
  if (last && last.element === inspected.element && last.key === key) return { ...last.reading, target: inspected };
  const result = inspectText(inspected.element, rect, zoom);
  const reading = {
    target: inspected, name: targetName(inspected),
    measure: settleChips(result, rect.width, rect.height, previewObstacles(pane.querySelector(".cmp-box")!, rect)),
  };
  cache.last = { element: inspected.element, key, reading };
  return reading;
}

function measureView(targets: Target[], selection: Selection, zoom: number, cache: TextCache) {
  const find = (element: Element | null) => targets.find((target) => target.element === element);
  const pin = find(selection.pin);
  const cursor = find(selection.cursor);
  const hover = selection.pointer ? deepestAt(targets, selection.pointer) : cursor;
  const second = selection.pointer?.alt && hover?.side === pin?.side && hover !== pin ? hover : find(selection.second);
  const gap = pin && second ? { ...gapBetween(pin.rect, second.rect, zoom), name: targetName(second) } : undefined;
  const candidate = cursor && cursor !== pin && cursor !== second
    ? `${cursor.side === "do" ? "Do" : "Don’t"} · ${targetName(cursor)}, ${sizeLabel(cursor.rect, zoom)} pixels.`
    : undefined;
  const isText = (target: Target) => Array.from(target.element.childNodes).some(node =>
    node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
  const inspected = pin ?? hover ?? targets.find(t => width(t.visible) > 0 && height(t.visible) > 0 && isText(t));
  const pane = inspected?.element.closest(".cmp-pane");
  const typography = inspected && pane && isText(inspected) ? readText(inspected, pane, zoom, cache) : undefined;
  return { pin, hover, second, gap, candidate, typography, detail: pin && describeTarget(pin, zoom) };
}

function authoredMeasures(root: Element, spec: RuleAnnotations, zoom: number): Measured {
  function read(side: Side) {
    const pane = root.querySelector(`.cmp-pane[data-side="${side}"]`)!;
    const box = pane.querySelector(".cmp-box, [data-measure-root]")!;
    const rect = pane.getBoundingClientRect();
    const result = measurePane(box, rect, spec, side, zoom, { x: 0, y: 0 });
    return settleChips(result, rect.width, rect.height, previewObstacles(box, rect));
  }
  return { do: read("do"), dont: read("dont") };
}

export type MeasureView = ReturnType<typeof measureView>;

export function useComparisonMeasure(canvas: RefObject<HTMLDivElement | null>, button: RefObject<HTMLButtonElement | null>, zoom: number, flip: boolean, showing: Side, spec?: RuleAnnotations, enabled = true) {
  const [active, setActive] = useState(false);
  const [authored, setAuthored] = useState<Measured | null>(null);
  const [view, setView] = useState<MeasureView | null>(null);
  const selection = useRef(emptySelection());
  const inputs = useRef<Input[]>([]);
  const requestRefresh = useRef<(() => void) | null>(null);
  const textCache = useRef<TextCache>({ last: null, version: 0 });
  const refresh = useCallback(() => requestRefresh.current?.(), []);

  const toggle = () => {
    if (active) {
      selection.current = emptySelection();
      inputs.current = [];
      setView(null);
      setAuthored(null);
    }
    setActive(!active);
  };

  const onShortcut = useEffectEvent((event: KeyboardEvent) => {
    if (shortcutAction(event, { view: "rule", singleKeys: memoryStore.getSnapshot().prefs.singleKeys }) !== "measure") return;
    event.preventDefault();
    (active ? button.current : canvas.current)?.focus({ preventScroll: true });
    toggle();
  });
  const onEscape = useEffectEvent((event: KeyboardEvent) => {
    if (!active || event.key !== "Escape") return;
    // The shell also listens on document. Consume Escape before it gets there,
    // applying the same modal, field and modifier handling as the shell.
    const { key, target, defaultPrevented, isComposing, altKey, ctrlKey, metaKey } = event;
    if (shortcutAction({ key, target, defaultPrevented, isComposing, altKey, ctrlKey, metaKey }, { view: "rule" }) !== "escape") return;
    event.preventDefault();
    if (canvas.current?.closest(".cmp")?.contains(document.activeElement)) button.current?.focus({ preventScroll: true });
    toggle();
  });

  useEffect(() => {
    if (!enabled) return;
    const root = canvas.current?.closest<HTMLElement>(".cmp") ?? canvas.current?.closest<HTMLElement>(".cmp-stage") ?? null;
    const shortcut = (event: KeyboardEvent) => onShortcut(event);
    // Esc from inside the comparison is taken as it bubbles out of it: a
    // focused tooltip on the dock dismisses itself first, and the shell's
    // document listener still comes after. Esc from anywhere else, at capture.
    const inside = (event: KeyboardEvent) => event.target instanceof Node && Boolean(root?.contains(event.target));
    const escapeOutside = (event: KeyboardEvent) => {
      if (!inside(event)) onEscape(event);
    };
    const escapeInside = (event: KeyboardEvent) => onEscape(event);
    document.addEventListener("keydown", shortcut);
    document.addEventListener("keydown", escapeOutside, true);
    root?.addEventListener("keydown", escapeInside);
    return () => {
      document.removeEventListener("keydown", shortcut);
      document.removeEventListener("keydown", escapeOutside, true);
      root?.removeEventListener("keydown", escapeInside);
    };
  }, [enabled, canvas]);

  useLayoutEffect(() => {
    const root = canvas.current;
    if (!active || !root) return;
    const cache = textCache.current;
    let frame = 0;
    const refresh = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (spec) {
          setAuthored(authoredMeasures(root, spec, zoom));
          return;
        }
        const targets = comparisonTargets(root);
        const visible = targets.filter(({ visible }) => width(visible) > 0 && height(visible) > 0);
        const current = selection.current;
        for (const input of inputs.current) {
          if ("point" in input) pinTarget(current, deepestAt(visible, input.point), targets);
          else if (visible.length) {
            const index = visible.findIndex(({ element }) => element === (current.cursor ?? current.pin));
            if ("step" in input) {
              const start = index === -1 && input.step === -1 ? 0 : index;
              current.cursor = visible[(start + input.step + visible.length) % visible.length].element;
            } else {
              pinTarget(current, visible[Math.max(0, index)], targets);
            }
          }
        }
        inputs.current = [];
        setView(measureView(targets, current, zoom, cache));
      });
    };
    // A resize, a theme or a font that lands can change the text without moving its box.
    const invalidate = () => {
      cache.version += 1;
      refresh();
    };
    requestRefresh.current = refresh;
    refresh();
    const resize = new ResizeObserver(invalidate);
    resize.observe(root);
    root.querySelectorAll(".cmp-pane, .cmp-box, .cmp-box *, [data-measure-root], [data-measure-root] *").forEach((element) => {
      if (!element.closest("[data-annotation]")) resize.observe(element);
    });
    const theme = new MutationObserver(invalidate);
    theme.observe(document.documentElement, { attributeFilter: ["class", "data-theme", "data-face"] });
    let mounted = true;
    void document.fonts?.ready.then(() => { if (mounted) invalidate(); });
    document.fonts?.addEventListener("loadingdone", invalidate);
    const modifier = (event: KeyboardEvent) => {
      const pointer = selection.current.pointer;
      if (pointer && pointer.alt !== event.altKey) {
        pointer.alt = event.altKey;
        refresh();
      }
    };
    document.addEventListener("keydown", modifier);
    document.addEventListener("keyup", modifier);
    window.addEventListener("resize", invalidate);
    if (!spec) window.addEventListener("scroll", refresh, { capture: true, passive: true });
    return () => {
      mounted = false;
      document.fonts?.removeEventListener("loadingdone", invalidate);
      cache.last = null;
      resize.disconnect();
      theme.disconnect();
      cancelAnimationFrame(frame);
      requestRefresh.current = null;
      document.removeEventListener("keydown", modifier);
      document.removeEventListener("keyup", modifier);
      window.removeEventListener("resize", invalidate);
      window.removeEventListener("scroll", refresh, true);
    };
  }, [active, canvas, zoom, spec]);

  useLayoutEffect(() => {
    refresh();
  }, [refresh, flip, showing]);

  return {
    active, authored, view, toggle, refresh,
    point(pointer: Selection["pointer"]) {
      if (!active || spec) return;
      selection.current.pointer = pointer;
      if (pointer) selection.current.cursor = null;
      refresh();
    },
    pick(point: Point) {
      if (spec) return;
      inputs.current.push({ point });
      refresh();
    },
    key(event: ReactKeyboardEvent) {
      if (!active || spec || event.shiftKey || event.altKey || event.metaKey || event.ctrlKey || event.defaultPrevented || event.nativeEvent.isComposing) return false;
      const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
      if (event.key === "Enter") {
        if (!event.repeat) inputs.current.push({ confirm: true });
      }
      else if (event.key.startsWith("Arrow")) inputs.current.push({ step });
      else return false;
      event.preventDefault();
      selection.current.pointer = null;
      refresh();
      return true;
    },
  };
}
