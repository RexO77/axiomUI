// design-system: strict
"use client";

/*
 * The rule preview beside the strip, the expanded list and Related links. It
 * implements the shell's `PeekHandle`, so the strip drives it imperatively
 * and a scrub never re-renders the strip: only this card re-renders, and only
 * when the rule under the pointer changes.
 *
 * Timing: the first open waits 300ms of rest; while open, another rule swaps
 * at once and the card glides to the new mark (140ms, a CSS transition on
 * `translate`, so it retargets mid-flight). It closes 150ms after the pointer
 * leaves or comes to rest on a category icon (a scrub across one keeps it up),
 * then stays warm for 300ms, so coming straight back opens at once.
 *
 * Anchoring: the card's title sits level with the mark it describes. Near
 * the bottom of the window there is no room for that, so the card flips up
 * and its foot sits level with the mark instead. A notch on the card's edge
 * points at the mark either way. It always sits right of the rail, expanded
 * or not, so it never covers the list it previews. Related links in the sheet
 * pass their own rect, and the card sits under (or over) the link instead.
 *
 * Off below 900px wide or 560px tall (where 200% zoom lands on a laptop), and
 * for any input that cannot hover. Losing that room mid-delay cancels the
 * pending open, and the delayed open checks again before it shows.
 *
 * Never interactive and aria-hidden: each mark and link already carries the
 * rule's name and summary for assistive tech. While it is up, the shell root
 * carries `data-peek`, so the strip's scrub label steps aside for it.
 */

import { useCallback, useDeferredValue, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type Ref } from "react";

import { StillPair } from "@/components/rule/still";
import { CategoryIcon } from "@/components/ui/category-icon";
import { railPosition } from "@/data/taxonomy";
import { rules } from "@/data/ui-logic";

import { RAIL, RAIL_OPEN, SHEET_INSET } from "./geometry";
import type { PeekHandle } from "./shell-context";

const OPEN_MS = 300;
const CLOSE_MS = 150;
const WARM_MS = 300;
/** Card top to title centre: the title sits where the mark is. */
const TITLE_Y = 22;
/** Flipped: the notch sits this far above the card's foot. */
const FOOT_Y = 28;
/** The notch never comes closer than this to a corner. */
const NOTCH_MIN = 14;
const WIDTH = 544;
/** Before the first measure: a title row over a 220px still pair. */
const FALLBACK_HEIGHT = 264;
/** A real hover, and room beside the rail for the card. */
export const PEEK_QUERY = "(hover: hover) and (pointer: fine) and (min-width: 900px) and (min-height: 560px)";

const ruleById = new Map(rules.map((rule) => [rule.id, rule]));

export function Peek({ handle }: { handle: Ref<PeekHandle> }) {
  const [ruleId, setRuleId] = useState<string | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const open = useRef(false);
  const allowed = useRef(false);
  /** The rule the pointer is on, shown or waiting to be. */
  const target = useRef<string | null>(null);
  const y = useRef(0);
  /** Set for links in the sheet: the card sits under or over the link. */
  const rect = useRef<DOMRect | null>(null);
  /** The card's height, measured when its rule changes and kept by a ResizeObserver: never read per move. */
  const height = useRef(0);
  const openTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const glideFrame = useRef(0);
  const warmUntil = useRef(0);

  const clearTimers = useCallback(() => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
    openTimer.current = undefined;
    closeTimer.current = undefined;
  }, []);

  const place = useCallback(() => {
    const el = card.current;
    if (!el) return;
    const h = height.current || FALLBACK_HEIGHT;
    const vh = window.innerHeight;
    const vw = document.documentElement.clientWidth;
    const link = rect.current;
    if (link) {
      const w = Math.min(WIDTH, vw - 2 * SHEET_INSET);
      const left = Math.max(SHEET_INSET, Math.min(link.left, vw - w - SHEET_INSET));
      const below = link.bottom + SHEET_INSET;
      const top = below + h <= vh - SHEET_INSET ? below : Math.max(SHEET_INSET, link.top - SHEET_INSET - h);
      el.style.width = `${w}px`;
      el.style.translate = `${left.toFixed(1)}px ${top.toFixed(1)}px`;
      el.dataset.free = "";
      delete el.dataset.flip;
      return;
    }
    delete el.dataset.free;
    const shell = el.closest<HTMLElement>(".shell");
    const railRight = shell?.hasAttribute("data-wide") || shell?.hasAttribute("data-open") ? RAIL_OPEN : RAIL;
    el.style.width = `${Math.max(0, Math.min(WIDTH, vw - railRight - 2 * SHEET_INSET))}px`;
    let top = y.current - TITLE_Y;
    const flip = top + h > vh - SHEET_INSET;
    if (flip) top = y.current + FOOT_Y - h;
    top = Math.max(SHEET_INSET, Math.min(top, vh - h - SHEET_INSET));
    const anchor = Math.max(NOTCH_MIN, Math.min(h - NOTCH_MIN, y.current - top));
    el.style.translate = `${railRight + SHEET_INSET}px ${top.toFixed(1)}px`;
    el.style.setProperty("--peek-anchor", `${anchor.toFixed(1)}px`);
    el.toggleAttribute("data-flip", flip);
  }, []);

  /* New content can change the card's height: measure once per rule, then re-anchor. */
  useLayoutEffect(() => {
    if (!card.current || !ruleId) return;
    height.current = card.current.offsetHeight;
    place();
  }, [ruleId, place]);
  useEffect(() => {
    const el = card.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const size = entry.borderBoxSize?.[0]?.blockSize;
      if (size === undefined || Math.abs(size - height.current) < 0.5) return;
      height.current = size;
      if (open.current) place();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [place]);

  const setOpen = useCallback((next: boolean) => {
    const el = card.current;
    if (!el || open.current === next) return;
    open.current = next;
    cancelAnimationFrame(glideFrame.current);
    // The strip's scrub label gives way to the card while it is up.
    el.closest(".shell")?.toggleAttribute("data-peek", next);
    if (next) {
      el.dataset.open = "";
      // The first frame lands in place; it glides only once it is on screen.
      glideFrame.current = requestAnimationFrame(() => {
        if (open.current) el.dataset.glide = "";
      });
    } else {
      delete el.dataset.open;
      delete el.dataset.glide;
      warmUntil.current = performance.now() + WARM_MS;
    }
  }, []);

  const show = useCallback(
    (id: string) => {
      target.current = id;
      setRuleId(id);
      place();
      setOpen(true);
    },
    [place, setOpen],
  );

  /* Losing the room or the hover (a resize, a zoom, a tablet's pointer) cancels and closes, open or not. */
  useEffect(() => {
    const query = window.matchMedia(PEEK_QUERY);
    const sync = () => {
      allowed.current = query.matches;
      if (query.matches) return;
      clearTimers();
      target.current = null;
      setOpen(false);
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [clearTimers, setOpen]);

  useImperativeHandle(
    handle,
    () => ({
      hover(id, at, options) {
        if (!allowed.current) return;
        y.current = at;
        rect.current = options?.rect ?? null;
        clearTimeout(closeTimer.current);
        closeTimer.current = undefined;
        if (id === null) {
          // On a category icon: nothing to show. A scrub crosses one in a frame or
          // two, so the card waits as it does on leave; the next rule swaps it at once.
          clearTimeout(openTimer.current);
          openTimer.current = undefined;
          target.current = null;
          if (open.current) {
            closeTimer.current = setTimeout(() => {
              closeTimer.current = undefined;
              setOpen(false);
            }, CLOSE_MS);
          }
          return;
        }
        if (open.current || options?.instant || performance.now() < warmUntil.current) {
          clearTimeout(openTimer.current);
          openTimer.current = undefined;
          if (id !== target.current) show(id);
          else {
            place();
            setOpen(true);
          }
          return;
        }
        // At rest, every new rule before the first open restarts the clock.
        if (id === target.current && openTimer.current) return;
        clearTimeout(openTimer.current);
        target.current = id;
        openTimer.current = setTimeout(() => {
          openTimer.current = undefined;
          // The room may have gone while this waited.
          if (allowed.current && target.current) show(target.current);
        }, OPEN_MS);
      },
      leave() {
        clearTimeout(openTimer.current);
        openTimer.current = undefined;
        target.current = null;
        clearTimeout(closeTimer.current);
        if (!open.current) return;
        closeTimer.current = setTimeout(() => {
          closeTimer.current = undefined;
          setOpen(false);
        }, CLOSE_MS);
      },
      close() {
        clearTimers();
        target.current = null;
        setOpen(false);
      },
      isOpen: () => open.current,
    }),
    [clearTimers, place, setOpen, show],
  );

  useEffect(
    () => () => {
      clearTimers();
      cancelAnimationFrame(glideFrame.current);
    },
    [clearTimers],
  );

  const rule = ruleId ? ruleById.get(ruleId) : undefined;
  const position = rule ? railPosition(rule.id) : null;
  // The title swaps at once; the two stills render a beat behind, off the scrub's frame.
  const deferred = useDeferredValue(ruleId);
  const still = deferred ? ruleById.get(deferred) : undefined;
  return (
    <div ref={card} className="peek" aria-hidden="true">
      <span className="peek-notch" />
      {rule && position ? (
        <div className="peek-body">
          <p className="peek-title">
            <CategoryIcon categoryId={position.category} className="size-4" />
            <span className="peek-name">{rule.title}</span>
            <span className="peek-pos">
              {position.index} of {position.total}
            </span>
          </p>
          {still ? <StillPair key={still.id} rule={still} /> : null}
        </div>
      ) : null}
    </div>
  );
}
