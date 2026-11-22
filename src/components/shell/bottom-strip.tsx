// design-system: strict
"use client";

/*
 * Phones, on a rule: the strip in the thumb zone, as two levels.
 *
 *   ‹  • • • • ▌• • • • • • • • •  ›     one category's run, legible at rest
 *   T  ▦  ◐  ⬚  ⊏  ⚙  ∿                   the rail's categories, in colour
 *
 * The run shows the category you are browsing (the current rule's, until you
 * pick another), so its marks sit several px apart instead of 108 marks
 * reading as a barcode. Drag along the run: it magnifies under the finger
 * (`magnifyInto`, into buffers this strip owns) and a card rises with the
 * rule; lift to open it. Drag along the icons: the run above switches
 * category as the finger crosses each one; slide up into the run without
 * lifting to choose a rule. A tap does each step too, and ‹ › page the deck,
 * so nothing depends on a swipe.
 *
 * Every mark is a real link with its slot in the lens as its hit box, and the
 * run is one Tab stop (roving tabindex): ←/→, Home and End move focus and the
 * lens with it, Enter opens. Modified clicks and middle-clicks stay the
 * browser's. Before hydration, or with no script, the marks sit evenly by CSS
 * and still link to their rules.
 *
 * A category icon shows its run and says so above it ("Color · 12, tap a
 * dot", announced once, politely). The icon whose run is already showing
 * opens that category's first rule. So the icons are plain buttons named for
 * what a press does, not toggles.
 *
 * Gestures:
 * - The run says pan-y. A touch that moves more than 6px up or down first
 *   scrolls the rule (the strip sits beside the sheet, so it drives the sheet
 *   itself, with a fling); one that moves sideways first scrubs.
 * - A scrub can be abandoned: lift more than 56px above the run and nothing
 *   opens (the card dims and says so). Lifting on the rule you are on does
 *   nothing either.
 *
 * Below 352px the run takes a full-width row of its own and the icon row
 * gives way to one category button that opens the menu; held sideways only
 * the run shows (shell.css).
 */

import { ChevronLeft, ChevronRight, ChevronsUpDown } from "@/components/ui/icons";
import dynamic from "next/dynamic";
import {
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type Ref,
} from "react";

import { CategoryIcon } from "@/components/ui/category-icon";
import { railCategories, railCategory, railCategoryOf, railPosition, type RailCategoryId } from "@/data/taxonomy";
import { rules as allRules } from "@/data/ui-logic";
import { useVisited } from "@/lib/catalog/stores";
import { easeOut, magnifyInto, type MagnifyItem, type MagnifyLayout, type MagnifyOptions } from "@/lib/magnify";
import { useReducedMotion } from "@/lib/media";
import { deckNeighbours } from "@/lib/navigation/deck";
import type { CatalogRoutes } from "@/lib/navigation/routes";
import { useShell } from "./shell-context";

// The card's stills share the rule view's chunk; this only keeps them off the strip's first render.
const StillPair = dynamic(() => import("@/components/rule/still").then((mod) => mod.StillPair), { ssr: false });

const ruleById = new Map(allRules.map((rule) => [rule.id, rule]));
const CAT_COUNT = railCategories.length;

/** Room at both ends of the run for the lens to grow into. */
const PAD = 10;
const ACTIVE_B = 12;
const MAX_PITCH = 18;
const RADIUS = 4.5;
/** Above the run by more than this, a lift cancels. */
const CANCEL_PX = 56;
/** A touch on the run decides after this many px: sideways scrubs, up or down scrolls. */
const SLOP_PX = 6;
/** The lens ramps in at --motion-medium and lets go at --motion-fast. */
const ENTER_MS = 220;
const LEAVE_MS = 140;
/** How long "Color · 12, tap a dot" stays over the run. */
const TOLD_MS = 2400;

const plainClick = (event: { button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean }) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

/* ── The rising card ────────────────────────────────────────────────── */

type RiseHandle = {
  rule: (id: string, x: number) => void;
  category: (id: RailCategoryId, x: number) => void;
  cancel: (on: boolean) => void;
  hide: () => void;
};

type Shown = { kind: "rule"; id: string } | { kind: "cat"; id: RailCategoryId };

function Rise({ handle }: { handle: Ref<RiseHandle> }) {
  const [shown, setShown] = useState<Shown | null>(null);
  const el = useRef<HTMLDivElement>(null);
  const live = useRef({ key: "", x: 0, open: false });

  // Placed once per new content: the card's width is a layout read, so never once per move.
  useLayoutEffect(() => {
    const card = el.current;
    if (!card || !shown) return;
    const width = card.offsetWidth;
    const left = Math.max(8, Math.min(live.current.x - width / 2, window.innerWidth - width - 8));
    card.style.setProperty("--rise-x", `${left.toFixed(1)}px`);
    card.toggleAttribute("data-open", live.current.open);
  }, [shown]);

  useImperativeHandle(handle, () => {
    const show = (next: Shown, x: number) => {
      const state = live.current;
      const key = `${next.kind}:${next.id}`;
      state.open = true;
      if (key === state.key) {
        el.current?.setAttribute("data-open", "");
        return;
      }
      state.key = key;
      state.x = x;
      setShown(next);
    };
    return {
      rule: (id, x) => show({ kind: "rule", id }, x),
      category: (id, x) => show({ kind: "cat", id }, x),
      cancel(on) {
        el.current?.toggleAttribute("data-cancel", on);
      },
      hide() {
        const state = live.current;
        state.open = false;
        state.key = "";
        el.current?.removeAttribute("data-open");
        el.current?.removeAttribute("data-cancel");
      },
    };
  }, []);

  const rule = shown?.kind === "rule" ? ruleById.get(shown.id) : undefined;
  const position = rule ? railPosition(rule.id) : null;
  const section = shown?.kind === "cat" ? railCategory(shown.id) : null;
  return (
    <div ref={el} className="bstrip-rise" data-kind={shown?.kind} aria-hidden="true">
      <p className="bstrip-rise-cancel">Release to cancel</p>
      {rule && position ? (
        <div className="bstrip-rise-body">
          <p className="bstrip-rise-title">
            <CategoryIcon categoryId={position.category} className="size-4" />
            <span className="bstrip-rise-name">{rule.title}</span>
            <span className="bstrip-rise-count">
              {position.index} of {position.total}
            </span>
          </p>
          <StillPair key={rule.id} rule={rule} />
        </div>
      ) : section ? (
        <p className="bstrip-rise-title">
          <CategoryIcon categoryId={section.id} className="size-4" />
          <span className="bstrip-rise-name">{section.short}</span>
          <span className="bstrip-rise-count">· {section.rules.length} rules</span>
        </p>
      ) : null}
    </div>
  );
}

/* ── The strip ──────────────────────────────────────────────────────── */

type Zone = "run" | "bar" | "cancel";

type BottomStripProps = {
  ruleId: string;
  routes: CatalogRoutes;
  /** Below 352px: the one category button opens the menu as the contents. */
  onContents: () => void;
};

export const BottomStrip = memo(function BottomStrip({ ruleId, routes, onContents }: BottomStripProps) {
  const { deck, openRule, page, sheet, phone } = useShell();
  const reduced = useReducedMotion();
  const visited = useVisited();
  const current = railCategoryOf(ruleId);
  const position = railPosition(ruleId);
  const { prev, next } = deckNeighbours(deck, ruleId);

  const [browse, setBrowse] = useState<RailCategoryId>(current);
  /** The label above the run after a category press; `said` is the live region's text. */
  const [told, setTold] = useState<RailCategoryId | null>(null);
  const [said, setSaid] = useState("");
  const [seenRule, setSeenRule] = useState(ruleId);
  if (seenRule !== ruleId) {
    setSeenRule(ruleId);
    setBrowse(current);
    setTold(null);
  }
  const browseRef = useRef(browse);
  useLayoutEffect(() => {
    browseRef.current = browse;
  }, [browse]);
  /** One state write per category change, however many moves cross it. */
  const browseTo = useCallback((id: RailCategoryId) => {
    if (browseRef.current === id) return;
    browseRef.current = id;
    setBrowse(id);
  }, []);

  useEffect(() => {
    if (!told) return;
    const timer = window.setTimeout(() => setTold(null), TOLD_MS);
    return () => window.clearTimeout(timer);
  }, [told]);

  /** A category icon pressed: show its run and say so, once. */
  const tell = (id: RailCategoryId) => {
    browseTo(id);
    setTold(id);
    const section = railCategory(id);
    setSaid(`${section.short}, ${section.rules.length} rules. Choose a rule.`);
  };
  const openFirst = (id: RailCategoryId) => {
    const first = railCategory(id).rules[0];
    setTold(null);
    if (first.id !== ruleId) openRule(first.id);
  };

  const section = railCategory(browse);
  const rules = section.rules;
  const n = rules.length;
  const activeIndex = rules.findIndex((rule) => rule.id === ruleId);
  const home = Math.max(0, activeIndex);

  const run = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const itemEls = useRef<(HTMLLIElement | null)[]>([]);
  const linkEls = useRef<(HTMLAnchorElement | null)[]>([]);
  const markEls = useRef<(HTMLSpanElement | null)[]>([]);
  const rise = useRef<RiseHandle>(null);
  /** A press on an icon: the run showing when it began, and whether the finger has since crossed to another. */
  const tap = useRef<{ from: RailCategoryId; moved: boolean; done: boolean } | null>(null);

  // Mutable layout state, outside React. Buffers are reallocated only when the run's length changes.
  const st = useRef({
    items: [] as MagnifyItem[],
    starts: new Float64Array(0),
    out: { positions: new Float64Array(0), sizes: new Float64Array(0), index: -1, length: 0, startPadding: 0, endPadding: 0 } as MagnifyLayout,
    options: { padding: PAD, radius: RADIUS, strength: 0 } as Required<MagnifyOptions>,
    /** Last written values, so a paint only touches the marks that moved. */
    wX: new Float64Array(0),
    wH: new Float64Array(0),
    wS: new Float64Array(0),
    dpr: 1,
    p0: 8,
    d0: 6,
    p: 0,
    pointer: -1,
    /** A touch on the run that has not yet shown which way it is going. */
    pend: null as { id: number; x: number; y: number } | null,
    zone: "run" as Zone,
    kb: -1,
    hot: -1,
    /** The run's and the icon row's boxes, read once per gesture and on resize. */
    left: 0,
    top: 0,
    bottom: 0,
    barLeft: 0,
    barWidth: 0,
    barShown: false,
    anim: { from: 0, to: 0, t0: 0, dur: 1 },
    frame: 0,
    /** The click that follows a handled press is consumed. */
    handled: false,
    stop: home,
  });

  const strength = (now: number) => {
    const a = st.current.anim;
    return a.from + (a.to - a.from) * easeOut((now - a.t0) / a.dur);
  };

  /* ── Paint ───────────────────────────────────────────────────────── */

  const paint = useCallback(
    (now: number) => {
      const s = st.current;
      if (s.items.length !== n) return false;
      const str = reduced ? 0 : strength(now);
      s.options.strength = str;
      const out = magnifyInto(s.out, s.items, s.p, s.options);
      // At rest every mark sits on a device pixel; moving, a hundredth is enough.
      const q = str === 0 ? s.dpr : 100;
      for (let i = 0; i < n; i++) {
        const item = itemEls.current[i];
        const link = linkEls.current[i];
        const mark = markEls.current[i];
        if (!item || !link || !mark) continue;
        const size = out.sizes[i];
        const x = Math.round((out.positions[i] + size / 2) * q) / q;
        if (x !== s.wX[i]) {
          s.wX[i] = x;
          item.style.transform = `translate3d(${x}px,0,0)`;
        }
        // The link is an empty 1px box stretched to its slot: what the finger magnifies is what it opens.
        const width = Math.round(size * 100) / 100;
        if (width !== s.wH[i]) {
          s.wH[i] = width;
          link.style.transform = `scaleX(${width})`;
        }
        let scale: number;
        if (i === activeIndex) {
          scale = Math.max(1, Math.min(1.5, size / ACTIVE_B));
        } else {
          // d0 at rest, 12px at the magnified pitch, smaller where squeezed.
          const t = Math.max(0, Math.min(1, (size - s.p0) / (MAX_PITCH - s.p0)));
          const d = size >= s.p0 ? s.d0 + (12 - s.d0) * t : Math.max(Math.min(3, s.p0), (s.d0 * size) / s.p0);
          scale = d / 12;
        }
        scale = Math.round(scale * 1000) / 1000;
        if (scale !== s.wS[i]) {
          s.wS[i] = scale;
          mark.style.transform = `scale(${scale})`;
        }
      }
      const k = s.kb >= 0 ? s.kb : s.pointer >= 0 && s.zone === "run" ? out.index : -1;
      if (k !== s.hot) {
        if (s.hot >= 0) itemEls.current[s.hot]?.removeAttribute("data-hot");
        if (k >= 0) itemEls.current[k]?.setAttribute("data-hot", "");
        // A tick per rule under the finger, where the device has haptics and the page may use them.
        if (k >= 0 && s.hot >= 0 && s.pointer >= 0 && navigator.userActivation?.hasBeenActive) navigator.vibrate?.(4);
        s.hot = k;
      }
      if (k >= 0 && s.kb < 0) rise.current?.rule(rules[k].id, s.left + out.positions[k] + out.sizes[k] / 2);
      return !reduced && now - s.anim.t0 < s.anim.dur;
    },
    [activeIndex, reduced, rules, n],
  );

  /* A frame loop started before an open (the lens letting go) paints with the newest paint, never the old rule's. */
  const paintRef = useRef(paint);
  useLayoutEffect(() => {
    paintRef.current = paint;
  }, [paint]);

  const schedule = useCallback(() => {
    const s = st.current;
    if (s.frame) return;
    const tick = (now: number) => {
      s.frame = 0;
      if (paintRef.current(now)) s.frame = requestAnimationFrame(tick);
    };
    s.frame = requestAnimationFrame(tick);
  }, []);

  const retarget = (to: number, dur: number) => {
    const s = st.current;
    const now = performance.now();
    const from = strength(now);
    s.anim = { from, to, t0: now, dur: Math.max(1, dur * Math.abs(to - from)) };
  };

  /** The run's and the icon row's boxes. One layout read, at a gesture's start and on resize. */
  const measure = useCallback(() => {
    const s = st.current;
    const box = run.current?.getBoundingClientRect();
    if (box) {
      s.left = box.left;
      s.top = box.top;
      s.bottom = box.bottom;
    }
    const cats = bar.current;
    s.barShown = Boolean(cats && cats.getClientRects().length > 0);
    if (cats && s.barShown) {
      const row = cats.getBoundingClientRect();
      s.barLeft = row.left;
      s.barWidth = row.width;
    }
  }, []);

  /* ── Layout: base sizes from the run's width ─────────────────────── */

  const relayout = useCallback(() => {
    const s = st.current;
    // A new rule, category or width: no frame from before may land after this paint.
    cancelAnimationFrame(s.frame);
    s.frame = 0;
    const width = run.current?.clientWidth ?? 0;
    if (!phone || !width) return;
    if (s.pointer < 0 && s.kb < 0) s.anim = { from: 0, to: 0, t0: 0, dur: 1 };
    const actives = activeIndex >= 0 ? 1 : 0;
    // At 200% zoom the run can be ~60px for 29 marks: they pack (the lens still opens them up) rather than overflow.
    const p0 = Math.max(2, (width - 2 * PAD - actives * ACTIVE_B) / Math.max(1, n - actives));
    s.p0 = p0;
    s.d0 = Math.max(Math.min(4, p0), Math.min(7, p0 - 3));
    s.dpr = window.devicePixelRatio || 1;
    s.items = rules.map((_, i): MagnifyItem => (i === activeIndex ? { size: ACTIVE_B, maxScale: 18 / ACTIVE_B } : { size: p0, maxScale: Math.max(1, MAX_PITCH / p0) }));
    if (s.starts.length !== n) {
      s.starts = new Float64Array(n);
      s.out = { positions: new Float64Array(n), sizes: new Float64Array(n), index: -1, length: 0, startPadding: 0, endPadding: 0 };
      s.wX = new Float64Array(n);
      s.wH = new Float64Array(n);
      s.wS = new Float64Array(n);
    }
    // The marks may be new elements (another run): write everything once.
    s.wX.fill(Number.NaN);
    s.wH.fill(Number.NaN);
    s.wS.fill(Number.NaN);
    itemEls.current.length = linkEls.current.length = markEls.current.length = n;
    for (const el of itemEls.current) el?.removeAttribute("data-hot");
    s.hot = -1;
    let x = PAD;
    for (let i = 0; i < n; i++) {
      s.starts[i] = x;
      x += s.items[i].size;
    }
    measure();
    paint(performance.now());
    // From here the paint places the marks; the CSS layout was for the first paint only.
    run.current?.setAttribute("data-live", "");
  }, [activeIndex, rules, n, paint, phone, measure]);

  useLayoutEffect(() => {
    relayout();
    const el = run.current;
    if (!el) return;
    const observer = new ResizeObserver(relayout);
    observer.observe(el);
    return () => observer.disconnect();
  }, [relayout]);

  /* ── The one Tab stop ────────────────────────────────────────────── */

  const setStop = useCallback((i: number) => {
    const s = st.current;
    s.stop = i;
    linkEls.current.forEach((link, j) => {
      if (link) link.tabIndex = j === i ? 0 : -1;
    });
  }, []);

  // Outside the run the stop follows the current rule (or the run's first mark); inside, it stays with focus.
  useLayoutEffect(() => {
    if (run.current?.contains(document.activeElement)) return;
    setStop(home);
  }, [rules, home, setStop]);

  /* ── Touch: a vertical start scrolls the rule ────────────────────── */

  /* Native touch events keep coming after the browser's pointercancel:
     - once a sideways touch is a scrub, the page must not move under it (iOS
       honours pan-y less strictly than Chromium);
     - a touch that goes up or down first scrolls the rule. The strip sits
       beside the sheet, not inside it, so the browser's own pan has nothing
       to scroll: the finger drives the sheet 1:1 and a lift carries on with
       the finger's speed, decaying like a native fling. A new touch stops it. */
  useEffect(() => {
    const s = st.current;
    const el = run.current;
    if (!el) return;
    const v = { on: false, x: 0, y: 0, lastY: 0, lastT: 0, speed: 0, fling: 0 };
    const stopFling = () => {
      cancelAnimationFrame(v.fling);
      v.fling = 0;
    };
    const onStart = (event: TouchEvent) => {
      stopFling();
      const touch = event.touches[0];
      v.on = false;
      v.x = touch.clientX;
      v.y = v.lastY = touch.clientY;
      v.lastT = event.timeStamp;
      v.speed = 0;
    };
    const onMove = (event: TouchEvent) => {
      if (s.pointer >= 0) {
        if (event.cancelable) event.preventDefault();
        return;
      }
      const touch = event.touches[0];
      if (!touch || event.touches.length > 1) return;
      if (!v.on) {
        const dx = Math.abs(touch.clientX - v.x);
        const dy = Math.abs(touch.clientY - v.y);
        if (dy <= SLOP_PX || dy < dx) return;
        v.on = true;
        s.pend = null; // never a scrub now
        v.lastY = touch.clientY;
        v.lastT = event.timeStamp;
      }
      if (event.cancelable) event.preventDefault();
      const dy = v.lastY - touch.clientY;
      const dt = Math.max(1, event.timeStamp - v.lastT);
      sheet.current?.scrollBy(0, dy);
      v.speed = 0.6 * (dy / dt) + 0.4 * v.speed; // px per ms, smoothed
      v.lastY = touch.clientY;
      v.lastT = event.timeStamp;
    };
    const onEnd = (event: TouchEvent) => {
      if (!v.on || event.touches.length) return;
      v.on = false;
      // A finger that stopped before lifting does not fling; nor does anyone who asked for less motion.
      if (event.timeStamp - v.lastT > 80 || Math.abs(v.speed) < 0.1 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      let speed = v.speed;
      let last = performance.now();
      const step = (now: number) => {
        const dt = Math.min(32, now - last);
        last = now;
        const scroller = sheet.current;
        if (!scroller) return;
        const before = scroller.scrollTop;
        scroller.scrollTop = before + speed * dt;
        speed *= Math.pow(0.996, dt); // about iOS's normal deceleration, a touch firmer
        if (Math.abs(speed) < 0.02 || scroller.scrollTop === before) {
          v.fling = 0;
          return;
        }
        v.fling = requestAnimationFrame(step);
      };
      v.fling = requestAnimationFrame(step);
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
      stopFling();
      cancelAnimationFrame(s.frame);
      s.frame = 0;
    };
  }, [sheet]);

  /* ── Pointer: one gesture across both levels ─────────────────────── */

  const hit = (clientX: number) => {
    const s = st.current;
    const x = clientX - s.left;
    let k = 0;
    for (let i = 0; i < n; i++) if (s.starts[i] <= x) k = i;
    return k;
  };
  const catAt = (clientX: number) => {
    const s = st.current;
    const i = Math.max(0, Math.min(CAT_COUNT - 1, Math.floor(((clientX - s.barLeft) / Math.max(1, s.barWidth)) * CAT_COUNT)));
    return { id: railCategories[i].id, x: s.barLeft + ((i + 0.5) * s.barWidth) / CAT_COUNT };
  };

  /** Below the run's foot is the icon row; well above its top, cancel; otherwise the run. */
  const drag = (clientX: number, clientY: number) => {
    const s = st.current;
    if (clientY > s.bottom + 2 && s.barShown) {
      if (s.zone !== "bar") {
        s.zone = "bar";
        retarget(0, LEAVE_MS);
        rise.current?.cancel(false);
      }
      const cat = catAt(clientX);
      browseTo(cat.id);
      if (tap.current && cat.id !== tap.current.from) tap.current.moved = true;
      rise.current?.category(cat.id, cat.x);
      schedule();
      return;
    }
    if (clientY < s.top - CANCEL_PX) {
      if (s.zone !== "cancel") {
        s.zone = "cancel";
        retarget(0, LEAVE_MS);
        rise.current?.cancel(true);
      }
      schedule();
      return;
    }
    if (s.zone !== "run") {
      if (s.zone === "cancel") rise.current?.cancel(false);
      setTold(null);
      s.zone = "run";
      retarget(1, ENTER_MS);
    }
    s.p = clientX - s.left;
    schedule();
  };

  const end = () => {
    const s = st.current;
    s.pointer = -1;
    s.pend = null;
    s.kb = -1;
    retarget(0, LEAVE_MS);
    rise.current?.hide();
    schedule();
  };

  const begin = (el: HTMLElement, pointerId: number, zone: "run" | "bar", x: number, y: number) => {
    const s = st.current;
    s.pointer = pointerId;
    s.pend = null;
    s.kb = -1;
    s.zone = zone === "run" ? "bar" : "run"; // drag() flips it and starts the right ramp
    if (el.isConnected) el.setPointerCapture(pointerId);
    drag(x, y);
  };

  const start = (event: PointerEvent<HTMLElement>, zone: "run" | "bar") => {
    const s = st.current;
    if (s.pointer >= 0 || s.pend) return; // a second finger
    // A new press: a handled press's click can no longer arrive.
    s.handled = false;
    // A modified or middle click on a mark is the browser's: a new tab or window.
    if (event.pointerType === "mouse" && !plainClick(event)) return;
    measure();
    // A touch on the run waits to see which way it goes (pan-y: up or down scrolls the rule).
    if (zone === "run" && event.pointerType === "touch") {
      s.pend = { id: event.pointerId, x: event.clientX, y: event.clientY };
      s.kb = -1;
      return;
    }
    begin(event.currentTarget, event.pointerId, zone, event.clientX, event.clientY);
  };

  const move = (event: PointerEvent<HTMLElement>) => {
    const s = st.current;
    const pending = s.pend;
    if (pending && pending.id === event.pointerId) {
      const dx = Math.abs(event.clientX - pending.x);
      const dy = Math.abs(event.clientY - pending.y);
      if (dx > SLOP_PX && dx > dy) begin(event.currentTarget, event.pointerId, "run", event.clientX, event.clientY);
      else if (dy > SLOP_PX) s.pend = null; // the rule scrolls; pointercancel follows
      return;
    }
    if (s.pointer === event.pointerId) drag(event.clientX, event.clientY);
  };

  /** Lift: opens only from the run, and never the rule you are already on. */
  const up = (event: PointerEvent<HTMLElement>) => {
    const s = st.current;
    const pending = s.pend;
    if (pending && pending.id === event.pointerId) {
      // A tap: no lens, no card, just the rule under the finger.
      s.pend = null;
      s.handled = true;
      const id = rules[hit(event.clientX)]?.id;
      if (id && id !== ruleId) openRule(id);
      return;
    }
    if (s.pointer !== event.pointerId) return;
    drag(event.clientX, event.clientY);
    s.handled = true;
    const id = s.zone === "run" ? rules[hit(event.clientX)]?.id : null;
    const cat = s.zone === "bar" ? catAt(event.clientX).id : null;
    end();
    if (id && id !== ruleId) openRule(id);
    if (cat) {
      // On the icons: a tap on the icon already showing opens its first rule; any other lift shows the run it chose.
      const press = tap.current;
      if (press) press.done = true;
      if (press && !press.moved && press.from === cat) openFirst(cat);
      else tell(cat);
    }
  };

  const cancel = (event: PointerEvent<HTMLElement>) => {
    const s = st.current;
    if (s.pointer === event.pointerId || s.pend?.id === event.pointerId) end();
  };

  /* ── Keyboard ────────────────────────────────────────────────────── */

  const linkIndex = (target: EventTarget | null) => {
    const link = target instanceof Element ? target.closest<HTMLAnchorElement>("a.bstrip-link") : null;
    return link ? Number(link.dataset.i) : -1;
  };

  /** The keyboard lens on mark `i`: 0ms, no card (focus names the rule). */
  const lensTo = (i: number) => {
    const s = st.current;
    if (s.items.length !== n) return;
    s.kb = i;
    s.p = s.starts[i] + s.items[i].size / 2;
    s.anim = { from: 1, to: 1, t0: 0, dur: 1 };
    paint(performance.now());
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    const at = linkIndex(event.target);
    if (at < 0) return;
    let to = -1;
    if (event.key === "ArrowRight") to = Math.min(n - 1, at + 1);
    else if (event.key === "ArrowLeft") to = Math.max(0, at - 1);
    else if (event.key === "Home") to = 0;
    else if (event.key === "End") to = n - 1;
    // Enter is the link's own (a click with detail 0); Esc and J/K bubble to the shell.
    else return;
    event.preventDefault();
    setStop(to);
    lensTo(to);
    linkEls.current[to]?.focus({ preventScroll: true });
  };

  /* ── Render ──────────────────────────────────────────────────────── */

  const toldSection = told ? railCategory(told) : null;
  const currentSection = railCategory(current);
  return (
    <>
      <Rise handle={rise} />
      <nav className="bstrip" aria-label="Rules">
        {toldSection ? (
          <p className="bstrip-told" aria-hidden="true">
            <CategoryIcon categoryId={toldSection.id} className="size-4" />
            {toldSection.short} · {toldSection.rules.length} <span>tap a dot to open a rule</span>
          </p>
        ) : null}
        <p className="sr-only" aria-live="polite">
          {said}
        </p>
        <div className="bstrip-row">
          <button
            type="button"
            className="shell-ctl phone-ctl"
            disabled={!prev}
            aria-label={prev ? `Previous rule: ${prev.title}` : "No previous rule"}
            onClick={() => page(-1)}
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <div
            ref={run}
            className="bstrip-run"
            role="group"
            aria-label={`${section.short}, ${n} rules`}
            onPointerDown={(event) => start(event, "run")}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={cancel}
            onClick={(event) => {
              // A new tab or window is the browser's: the link's href does it.
              if (!plainClick(event)) return;
              event.preventDefault();
              const s = st.current;
              if (event.detail === 0) {
                // Enter on the focused link, or a screen reader's activation.
                const i = linkIndex(event.target);
                const id = i >= 0 ? rules[i]?.id : undefined;
                if (id && id !== ruleId) openRule(id);
                return;
              }
              // The press already opened (or chose not to) on lift.
              if (s.handled) {
                s.handled = false;
                return;
              }
              const id = rules[hit(event.clientX)]?.id;
              if (id && id !== ruleId) openRule(id);
            }}
            onFocus={(event) => {
              const i = linkIndex(event.target);
              if (i < 0) return;
              setStop(i);
              const visible = event.target.matches(":focus-visible");
              event.currentTarget.toggleAttribute("data-focus", visible);
              if (visible && st.current.kb !== i) lensTo(i);
            }}
            onBlur={(event) => {
              if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
              event.currentTarget.removeAttribute("data-focus");
              if (st.current.kb >= 0) end();
              setStop(home);
            }}
            onKeyDown={onKeyDown}
          >
            <ul className="bstrip-marks">
              {rules.map((rule, i) => (
                <li
                  key={rule.id}
                  ref={(el) => {
                    itemEls.current[i] = el;
                  }}
                  className="bstrip-item"
                  data-active={i === activeIndex ? "" : undefined}
                  data-visited={i !== activeIndex && visited.has(rule.id) ? "" : undefined}
                  style={{ "--bstrip-i": i, "--bstrip-n": n } as CSSProperties}
                >
                  <a
                    ref={(el) => {
                      linkEls.current[i] = el;
                    }}
                    href={routes.ruleHref(rule.id)}
                    className="bstrip-link"
                    data-i={i}
                    tabIndex={i === home ? 0 : -1}
                    draggable={false}
                    aria-label={`${rule.title}, ${section.short}, ${i + 1} of ${n}`}
                    aria-current={i === activeIndex ? "page" : undefined}
                  />
                  <span
                    ref={(el) => {
                      markEls.current[i] = el;
                    }}
                    className="bstrip-mark"
                    aria-hidden="true"
                  />
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            className="bstrip-solo"
            aria-label={`Open rules menu, ${currentSection.short}, ${position.index} of ${position.total}`}
            aria-haspopup="dialog"
            onClick={(event) => {
              event.currentTarget.focus({ preventScroll: true });
              onContents();
            }}
          >
            <CategoryIcon categoryId={current} className="size-5" />
            <ChevronsUpDown aria-hidden="true" />
          </button>
          <button
            type="button"
            className="shell-ctl phone-ctl"
            disabled={!next}
            aria-label={next ? `Next rule: ${next.title}` : "No next rule"}
            onClick={() => page(1)}
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
        <div
          ref={bar}
          className="bstrip-cats"
          role="group"
          aria-label={`Categories, showing ${section.short}`}
          style={{ "--rail-count": CAT_COUNT } as CSSProperties}
          onPointerDown={(event) => {
            tap.current = { from: browseRef.current, moved: false, done: false };
            if (event.pointerType === "mouse") return; // a mouse clicks the buttons
            start(event, "bar");
          }}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={cancel}
        >
          {railCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              className="bstrip-cat"
              aria-label={
                category.id === browse
                  ? `Open the first ${category.short} rule, ${category.rules[0].title}`
                  : `Show ${category.short}, ${category.rules.length} rules`
              }
              data-shown={category.id === browse ? "" : undefined}
              data-current={category.id === current ? "" : undefined}
              onClick={(event) => {
                const press = tap.current;
                tap.current = null;
                if (press?.done) return; // a touch: handled on lift
                const from = event.detail === 0 || !press ? browseRef.current : press.from;
                if (from === category.id) openFirst(category.id);
                else tell(category.id);
              }}
            >
              <CategoryIcon categoryId={category.id} className="size-5" />
            </button>
          ))}
        </div>
      </nav>
    </>
  );
});
