// design-system: strict
"use client";

/*
 * The collapsed rail's dot column: one mark per rule, all
 * 105, in runs per rail category, each run headed by its coloured category
 * icon. Under the pointer it magnifies like the Dock: the column keeps its
 * length and the mark under the pointer stays under the pointer
 * (`magnifyInto`, which writes into buffers this strip owns, so a frame
 * allocates nothing).
 *
 * React renders the 112 nodes once. Pointer moves, the lens, a page turn, a
 * visit and the gallery's search reach the DOM through refs, and a paint only
 * writes to the marks whose geometry changed. Nothing here re-renders per
 * pointermove, and nothing reads layout per pointermove: the column's rect is
 * cached on enter and by a ResizeObserver, its scroll offset on scroll.
 *
 * Semantics: every mark is a real link (a rule's to the rule, a category
 * icon's to its run on the wall), so Cmd/Ctrl-click, middle-click and
 * "Open in new tab" stay the browser's. One list per category, labelled by its
 * name, and one Tab stop (roving tabindex): Up/Down move focus and the lens
 * with it (0ms: the keyboard never animates), Home/End, PageUp/PageDown jump
 * runs, Enter opens. Each link's hit box is its slot in the lens, so the mark
 * the pointer magnifies is the one it clicks.
 *
 * When the rail is too short for every mark to be legible, or motion is
 * reduced, the column goes to a steady pitch and scrolls (data-steady),
 * keeping the current rule in view. The first layout reads the boot script's
 * `data-reduced`, so a reduced-motion reader never sees the lens first.
 *
 * At rest every mark sits on a device pixel. The peek card hangs
 * off `peek`; until it exists the handle is null and the scrub label alone
 * names the mark.
 */

import { Fragment, memo, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, type KeyboardEvent, type RefObject } from "react";

import { CategoryIcon } from "@/components/ui/category-icon";
import { railCategories, type RailCategoryId } from "@/data/taxonomy";
import type { Rule } from "@/data/ui-logic";
import { catalogStores } from "@/lib/catalog/stores";
import { easeOut, magnifyInto, type MagnifyItem, type MagnifyLayout, type MagnifyOptions } from "@/lib/magnify";
import { REDUCED_MOTION_QUERY } from "@/lib/media";
import type { CatalogRoutes } from "@/lib/navigation/routes";
import type { PeekHandle } from "./shell-context";

type CatEntry = { kind: "cat"; id: RailCategoryId; name: string; count: number };
type RuleEntry = { kind: "rule"; rule: Rule; n: number; total: number; short: string };
type Entry = CatEntry | RuleEntry;

const ENTRIES: readonly Entry[] = railCategories.flatMap((category): Entry[] => [
  { kind: "cat", id: category.id, name: category.short, count: category.rules.length },
  ...category.rules.map((rule, index): RuleEntry => ({ kind: "rule", rule, n: index + 1, total: category.rules.length, short: category.short })),
]);
const N = ENTRIES.length;
const RULE_COUNT = ENTRIES.filter((entry) => entry.kind === "rule").length;
const CAT_COUNT = N - RULE_COUNT;
/** Index of each category's icon; its first rule is the next index. */
const GROUP_STARTS = ENTRIES.flatMap((entry, index) => (entry.kind === "cat" ? [index] : []));
const RULE_INDEX = new Map(ENTRIES.flatMap((entry, index) => (entry.kind === "rule" ? [[entry.rule.id, index] as const] : [])));
const CAT_INDEX = new Map(ENTRIES.flatMap((entry, index) => (entry.kind === "cat" ? [[entry.id, index] as const] : [])));
const RUNS = GROUP_STARTS.map((start, group) => ({ cat: ENTRIES[start] as CatEntry, start, end: GROUP_STARTS[group + 1] ?? N }));

/*
 * Geometry (px). The magnified pitch is about 16 with 12px marks, over ±6.5
 * items of lens. PAD is room at both ends for the lens to grow into, about
 * half a lens, so the first and last marks keep its full shape.
 */
const PAD = 30;
const ICON_B = 20;
const ACTIVE_B = 18;
const MAX_PITCH = 16;
const RADIUS = 6.5;
/** Below this rest pitch the marks are not legible: steady column instead. */
const MIN_PITCH = 2.2;
const REST_PITCH_CAP = 7;
const STEADY_PITCH = 8;
const STEADY_ICON = 24;
/** The lens ramps in at --motion-medium and lets go at --motion-fast. */
const ENTER_MS = 220;
const LEAVE_MS = 140;

const catLabel = (entry: CatEntry, matches: ReadonlySet<string> | null) => {
  if (!matches) return `${entry.name} · ${entry.count}`;
  const run = RUNS.find((item) => item.cat === entry)!;
  let hits = 0;
  for (let i = run.start + 1; i < run.end; i++) if (matches.has((ENTRIES[i] as RuleEntry).rule.id)) hits += 1;
  return `${entry.name} · ${hits} of ${entry.count}`;
};

/** Where the strip's one Tab stop and the keyboard lens start: the current rule, else its run's first rule. */
function homeIndex(active: number, cat: string | null): number {
  if (active >= 0) return active;
  const group = cat ? CAT_INDEX.get(cat as RailCategoryId) ?? -1 : -1;
  return group >= 0 ? group + 1 : 1;
}

type StripApi = {
  /** A page turn or a category change: applied through refs, no render. */
  setCurrent: (ruleId: string | null, cat: string | null) => void;
  /** The gallery's search: marks outside it dim (null: none dim). */
  setMatches: (ids: ReadonlySet<string> | null) => void;
};

type Actions = { onOpen: (id: string) => void; onCategory: (id: RailCategoryId) => void };

type ColumnProps = {
  /** First render only (SSR and hydration); later changes arrive through `api`. */
  initialId: string | null;
  initialCat: string | null;
  routes: CatalogRoutes;
  peek: RefObject<PeekHandle | null>;
  api: RefObject<StripApi | null>;
  actions: RefObject<Actions>;
};

const Column = memo(function Column({ initialId, initialCat, routes, peek, api, actions }: ColumnProps) {
  const col = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const itemEls = useRef<(HTMLElement | null)[]>([]);
  const linkEls = useRef<(HTMLAnchorElement | null)[]>([]);
  const markEls = useRef<(HTMLSpanElement | null)[]>([]);
  const lensEl = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const labelText = useRef<HTMLSpanElement>(null);
  const firstStop = homeIndex(initialId ? RULE_INDEX.get(initialId) ?? -1 : -1, initialCat);

  // Mutable layout state, outside React. Every buffer is allocated once.
  const st = useRef({
    L: 0,
    reduced: false,
    steady: false,
    items: ENTRIES.map((): MagnifyItem => ({ size: 1, maxScale: 1 })),
    starts: new Float64Array(N),
    out: { positions: new Float64Array(N), sizes: new Float64Array(N), index: -1, length: 0, startPadding: 0, endPadding: 0 } as MagnifyLayout,
    options: { padding: PAD, radius: RADIUS, strength: 0 } as Required<MagnifyOptions>,
    p0: 4,
    h0: 4,
    p: 0,
    mode: "idle" as "idle" | "pointer" | "keyboard",
    kb: -1,
    hot: -1,
    top: 0,
    scroll: 0,
    anim: { from: 0, to: 0, t0: 0, dur: 1 },
    frame: 0,
    touch: -1,
    /** A touch lift opened: the click that follows it is consumed, whatever its event type. */
    touchOpened: false,
    active: initialId ? RULE_INDEX.get(initialId) ?? -1 : -1,
    cat: initialCat,
    visited: new Set<string>() as ReadonlySet<string>,
    matches: null as ReadonlySet<string> | null,
    stop: firstStop,
    dpr: 1,
    cy: 0,
    peekId: "",
    peekY: Number.NaN,
    /** Last written values, so a paint only touches marks that moved. */
    wY: new Float64Array(N).fill(Number.NaN),
    wA: new Float64Array(N).fill(Number.NaN),
    wB: new Float64Array(N).fill(Number.NaN),
    wH: new Float64Array(N).fill(Number.NaN),
  });

  /** Move the one Tab stop (roving tabindex). */
  const setStop = useCallback((i: number) => {
    const s = st.current;
    if (i === s.stop || !linkEls.current[i]) return;
    const was = linkEls.current[s.stop];
    if (was) was.tabIndex = -1;
    linkEls.current[i]!.tabIndex = 0;
    s.stop = i;
  }, []);

  /* ── Paint ───────────────────────────────────────────────────────── */

  const strength = (now: number) => {
    const a = st.current.anim;
    return a.from + (a.to - a.from) * easeOut((now - a.t0) / a.dur);
  };

  const paint = useCallback((now: number) => {
    const s = st.current;
    const str = s.steady ? 0 : strength(now);
    s.options.strength = str;
    const out = magnifyInto(s.out, s.items, s.p, s.options);
    const k = s.mode === "keyboard" ? s.kb : s.mode === "pointer" ? out.index : -1;
    // At rest every mark sits on a device pixel; moving, a hundredth is enough.
    const q = str === 0 ? s.dpr : 100;
    for (let i = 0; i < N; i++) {
      const el = itemEls.current[i];
      if (!el) continue;
      const size = out.sizes[i];
      const c = Math.round((out.positions[i] + size / 2) * q) / q;
      if (c !== s.wY[i]) {
        s.wY[i] = c;
        el.style.transform = `translate3d(0,${c}px,0)`;
      }
      const e = ENTRIES[i];
      // The link is an empty 1px box scaled to its slot: what the pointer magnifies is what
      // it clicks. A transform on a childless element restyles one node and never lays out;
      // the whole column changes every frame, so this is the difference that keeps a 4× CPU
      // scrub under 50ms a frame.
      const hb = Math.round(size * 100) / 100;
      const link = linkEls.current[i];
      if (link && hb !== s.wH[i]) {
        s.wH[i] = hb;
        link.style.transform = `scaleY(${hb})`;
      }
      const mark = markEls.current[i];
      if (!mark) continue;
      let ax: number;
      let ay: number;
      if (e.kind === "cat") {
        ax = ay = Math.max(0.55, Math.min(1.2, size / s.items[i].size));
      } else if (i === s.active) {
        const sc = size / ACTIVE_B;
        ay = Math.max(0.5, Math.min(1.15, sc));
        ax = Math.max(0.75, Math.min(1.5, sc));
      } else {
        // h0 at the rest pitch, 12 at the magnified pitch, smaller where squeezed.
        let h = size >= s.p0 ? s.h0 + ((12 - s.h0) * (size - s.p0)) / Math.max(0.01, MAX_PITCH - s.p0) : (s.h0 * size) / s.p0;
        h = Math.max(1, Math.min(12, h));
        // No lens in a steady column: the mark you are on steps up instead.
        if (s.steady && i === k) h = 7;
        ax = Math.max(Math.min(4, s.h0 + 1.5), h) / 12;
        ay = h / 12;
      }
      ax = Math.round(ax * 1000) / 1000;
      ay = Math.round(ay * 1000) / 1000;
      if (ax !== s.wA[i] || ay !== s.wB[i]) {
        s.wA[i] = ax;
        s.wB[i] = ay;
        mark.style.transform = ax === ay ? `scale(${ax})` : `scale(${ax},${ay})`;
      }
    }
    if (k !== s.hot) {
      if (s.hot >= 0) delete itemEls.current[s.hot]?.dataset.hot;
      if (k >= 0) itemEls.current[k]!.dataset.hot = "";
      s.hot = k;
      const e = k >= 0 ? ENTRIES[k] : null;
      if (labelText.current) labelText.current.textContent = e ? (e.kind === "cat" ? catLabel(e, s.matches) : e.rule.title) : "";
      label.current?.toggleAttribute("data-cat", e?.kind === "cat");
    }
    if (k >= 0) {
      const centre = out.positions[k] + out.sizes[k] / 2;
      const cy = s.top + centre - (s.steady ? s.scroll : 0);
      if (label.current) {
        label.current.style.translate = `0 ${(cy - 12).toFixed(2)}px`;
        label.current.toggleAttribute("data-on", !(peek.current?.isOpen() && ENTRIES[k].kind === "rule"));
      }
      if (lensEl.current) {
        lensEl.current.style.transform = `translate3d(0,${centre.toFixed(2)}px,0)`;
        lensEl.current.toggleAttribute("data-on", s.mode === "keyboard");
      }
      const e = ENTRIES[k];
      const id = e.kind === "rule" ? e.rule.id : "";
      const y = Math.round(cy);
      if (id !== s.peekId || y !== s.peekY) {
        s.peekId = id;
        s.peekY = y;
        peek.current?.hover(id || null, cy);
      }
    } else {
      label.current?.removeAttribute("data-on");
      lensEl.current?.removeAttribute("data-on");
      s.peekId = "";
      s.peekY = Number.NaN;
    }
    return !s.steady && now - s.anim.t0 < s.anim.dur;
  }, [peek]);

  const schedule = useCallback(() => {
    const s = st.current;
    if (s.frame) return;
    const tick = (now: number) => {
      s.frame = 0;
      if (paint(now)) s.frame = requestAnimationFrame(tick);
    };
    s.frame = requestAnimationFrame(tick);
  }, [paint]);

  const retarget = (to: number, dur: number) => {
    const s = st.current;
    const now = performance.now();
    const from = strength(now);
    s.anim.from = from;
    s.anim.to = to;
    s.anim.t0 = now;
    s.anim.dur = Math.max(1, dur * Math.abs(to - from));
  };

  /* ── Layout: base sizes from the cached column height ────────────── */

  const relayout = useCallback(() => {
    const s = st.current;
    const c = col.current;
    const actives = s.active >= 0 ? 1 : 0;
    let p0 = (s.L - 2 * PAD - CAT_COUNT * ICON_B - actives * ACTIVE_B) / (RULE_COUNT - actives);
    const steady = s.reduced || p0 < MIN_PITCH;
    const icon = steady ? STEADY_ICON : ICON_B;
    p0 = steady ? STEADY_PITCH : Math.min(p0, REST_PITCH_CAP);
    s.steady = steady;
    s.dpr = window.devicePixelRatio || 1;
    s.p0 = p0;
    s.h0 = steady ? 4 : Math.max(1.5, Math.min(4, p0 - 1.4));
    let y = PAD;
    for (let i = 0; i < N; i++) {
      const item = s.items[i];
      if (ENTRIES[i].kind === "cat") {
        item.size = icon;
        item.maxScale = 1.25;
      } else if (i === s.active) {
        item.size = ACTIVE_B;
        item.maxScale = 22 / ACTIVE_B;
      } else {
        item.size = p0;
        item.maxScale = MAX_PITCH / p0;
      }
      s.starts[i] = y;
      y += item.size;
    }
    const height = `${steady ? y + PAD : s.L}px`;
    if (inner.current && inner.current.style.height !== height) inner.current.style.height = height;
    if (c) {
      c.toggleAttribute("data-steady", steady);
      // A scrolling column keeps the focused mark in view, or else the current rule.
      const keep = s.mode === "keyboard" && s.kb >= 0 ? s.kb : s.mode === "idle" ? s.active : -1;
      if (steady && keep >= 0) {
        const at = s.starts[keep];
        if (at < s.scroll + 24 || at > s.scroll + s.L - 24) c.scrollTop = at - s.L / 2;
      }
      s.scroll = steady ? c.scrollTop : 0;
    }
    paint(performance.now());
    c?.setAttribute("data-ready", "");
  }, [paint]);

  useLayoutEffect(() => {
    const s = st.current;
    const c = col.current;
    if (!c) return;
    const root = document.documentElement;
    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    // The boot attribute is set before first paint; the query corrects it later.
    s.reduced = root.hasAttribute("data-reduced") || query.matches;
    const box = c.getBoundingClientRect();
    s.L = box.height;
    s.top = box.top;
    relayout();
    const ro = new ResizeObserver(() => {
      const next = c.getBoundingClientRect();
      s.top = next.top;
      if (next.height === s.L) return;
      s.L = next.height;
      relayout();
    });
    ro.observe(c);
    const onReduced = () => {
      s.reduced = query.matches;
      relayout();
    };
    query.addEventListener("change", onReduced);
    return () => {
      ro.disconnect();
      query.removeEventListener("change", onReduced);
      cancelAnimationFrame(s.frame);
      s.frame = 0;
    };
  }, [relayout]);

  /* ── Current rule, marked run, visited, search ───────────────────── */

  const markVisited = useCallback((i: number) => {
    const e = i >= 0 ? ENTRIES[i] : null;
    const el = itemEls.current[i];
    if (!el || e?.kind !== "rule") return;
    el.toggleAttribute("data-visited", i !== st.current.active && st.current.visited.has(e.rule.id));
  }, []);

  useEffect(() => {
    const { visited } = catalogStores;
    const sync = () => {
      const next = visited.get();
      const prev = st.current.visited;
      if (next === prev) return;
      st.current.visited = next;
      for (const id of next) if (!prev.has(id)) markVisited(RULE_INDEX.get(id) ?? -1);
      for (const id of prev) if (!next.has(id)) markVisited(RULE_INDEX.get(id) ?? -1);
    };
    sync();
    return visited.subscribe(sync);
  }, [markVisited]);

  useImperativeHandle(api, () => ({
    setCurrent(id, cat) {
      const s = st.current;
      if (cat !== s.cat) {
        const was = s.cat ? CAT_INDEX.get(s.cat as RailCategoryId) : undefined;
        const now = cat ? CAT_INDEX.get(cat as RailCategoryId) : undefined;
        if (was !== undefined) itemEls.current[was]?.removeAttribute("data-current-cat");
        if (now !== undefined) itemEls.current[now]?.setAttribute("data-current-cat", "");
        s.cat = cat;
      }
      const next = id ? RULE_INDEX.get(id) ?? -1 : -1;
      if (next === s.active) return;
      const prev = s.active;
      s.active = next;
      for (const [i, on] of [[prev, false], [next, true]] as const) {
        const el = itemEls.current[i];
        if (i < 0 || !el) continue;
        el.toggleAttribute("data-active", on);
        if (on) linkEls.current[i]?.setAttribute("aria-current", "page");
        else linkEls.current[i]?.removeAttribute("aria-current");
        markVisited(i);
      }
      // Outside the strip the Tab stop follows the current rule; inside, it stays with focus.
      if (!col.current?.contains(document.activeElement)) setStop(homeIndex(s.active, s.cat));
      relayout();
    },
    setMatches(ids) {
      const s = st.current;
      if (ids === s.matches) return;
      s.matches = ids;
      for (const run of RUNS) {
        let any = false;
        for (let i = run.start + 1; i < run.end; i++) {
          const dim = ids !== null && !ids.has((ENTRIES[i] as RuleEntry).rule.id);
          if (!dim) any = true;
          itemEls.current[i]?.toggleAttribute("data-dim", dim);
        }
        itemEls.current[run.start]?.toggleAttribute("data-dim", ids !== null && !any);
      }
      if (s.hot >= 0 && ENTRIES[s.hot].kind === "cat" && labelText.current) labelText.current.textContent = catLabel(ENTRIES[s.hot] as CatEntry, ids);
    },
  }), [markVisited, relayout, setStop]);

  /* ── Pointer ─────────────────────────────────────────────────────── */

  /** Pointer to column space, from the cached rect and scroll: no layout read. */
  const localY = (clientY: number) => {
    const s = st.current;
    return clientY - s.top + (s.steady ? s.scroll : 0);
  };

  /**
   * The strip's own hit test: the last start at or above the pointer (base space equals screen
   * there). -1 in the blank padding above the first mark and below the last: the lens never
   * draws a mark there, so a click there opens nothing.
   */
  const hitIndex = (clientY: number) => {
    const s = st.current;
    const y = localY(clientY);
    if (y < s.starts[0] || y >= s.starts[N - 1] + s.items[N - 1].size) return -1;
    let k = 0;
    for (let i = 0; i < N; i++) if (s.starts[i] <= y) k = i;
    return k;
  };

  const pointerTo = (clientY: number) => {
    const s = st.current;
    if (s.mode !== "pointer") {
      s.mode = "pointer";
      retarget(1, ENTER_MS);
    }
    s.cy = clientY;
    s.p = localY(clientY);
    schedule();
  };

  const release = (dur: number) => {
    st.current.mode = "idle";
    retarget(0, dur);
    peek.current?.leave();
    schedule();
  };

  const open = (e: Entry | undefined) => {
    if (!e) return;
    peek.current?.close();
    if (e.kind === "rule") actions.current.onOpen(e.rule.id);
    else actions.current.onCategory(e.id);
  };

  /* ── Keyboard ────────────────────────────────────────────────────── */

  const lensTo = (i: number) => {
    const s = st.current;
    const c = col.current!;
    s.mode = "keyboard";
    s.kb = i;
    s.p = s.starts[i] + s.items[i].size / 2;
    s.anim.from = s.anim.to = 1;
    s.anim.t0 = 0;
    s.anim.dur = 1;
    if (s.steady) {
      const y = s.starts[i];
      // Above: room for the category icon too, so the run you enter is named on screen.
      if (y < s.scroll + 40) c.scrollTop = y - 40;
      else if (y > s.scroll + s.L - 24) c.scrollTop = y - s.L + 24;
      s.scroll = c.scrollTop;
    }
    paint(performance.now());
  };


  const linkIndex = (target: EventTarget | null) => {
    const a = target instanceof Element ? target.closest<HTMLAnchorElement>("a.strip-link") : null;
    return a ? Number(a.dataset.i) : -1;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const s = st.current;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const at = linkIndex(event.target);
    const cur = s.mode === "keyboard" && s.kb >= 0 ? s.kb : at >= 0 ? at : homeIndex(s.active, s.cat);
    let next = -1;
    switch (event.key) {
      // Every mark, category icons included: an icon is a link to its run on the wall.
      case "ArrowDown": next = Math.min(N - 1, cur + 1); break;
      case "ArrowUp": next = Math.max(0, cur - 1); break;
      case "Home": next = 0; break;
      case "End": next = N - 1; break;
      case "PageDown":
      case "PageUp": {
        const group = GROUP_STARTS.findLastIndex((start) => start <= cur);
        const firstOwn = GROUP_STARTS[group] + 1;
        if (event.key === "PageDown") next = group + 1 < GROUP_STARTS.length ? GROUP_STARTS[group + 1] + 1 : cur;
        else next = cur > firstOwn ? firstOwn : group > 0 ? GROUP_STARTS[group - 1] + 1 : firstOwn;
        break;
      }
      // Enter is the link's own (a click with detail 0); J/K, Esc and [ bubble to the shell.
      default: return;
    }
    event.preventDefault();
    setStop(next);
    lensTo(next);
    linkEls.current[next]?.focus({ preventScroll: true });
  };

  /* ── Render ──────────────────────────────────────────────────────── */

  return (
    <>
      <div
        ref={col}
        className="strip-col"
        role="group"
        aria-label="Rules"
        onPointerEnter={(event) => {
          if (event.pointerType !== "mouse") return;
          // One layout read per entry; moves use the cached rect.
          const box = event.currentTarget.getBoundingClientRect();
          st.current.top = box.top;
          pointerTo(event.clientY);
        }}
        onPointerMove={(event) => {
          if (event.pointerType === "mouse" || st.current.touch === event.pointerId) pointerTo(event.clientY);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") release(LEAVE_MS);
        }}
        onPointerDown={(event) => {
          // A new press: a lift's unconsumed click can no longer arrive.
          st.current.touchOpened = false;
          if (event.pointerType === "mouse") {
            peek.current?.close();
            return;
          }
          // Touch or pen on a wide screen: press, drag to scrub, lift to open.
          st.current.touch = event.pointerId;
          event.currentTarget.setPointerCapture(event.pointerId);
          st.current.top = event.currentTarget.getBoundingClientRect().top;
          pointerTo(event.clientY);
        }}
        onPointerUp={(event) => {
          const s = st.current;
          if (s.touch !== event.pointerId) return;
          s.touch = -1;
          s.touchOpened = true;
          open(ENTRIES[hitIndex(event.clientY)]);
          release(LEAVE_MS);
        }}
        onPointerCancel={() => {
          st.current.touch = -1;
          release(LEAVE_MS);
        }}
        onClick={(event) => {
          // A new tab or window is the browser's: the link's href does it.
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          if (event.detail === 0) {
            // Enter on the focused link, or a screen reader's activation.
            const i = linkIndex(event.target);
            if (i >= 0) open(ENTRIES[i]);
            return;
          }
          // Touch already opened on lift. Not read from the event's pointerType: an engine
          // whose click is a plain MouseEvent would leave it undefined and open twice.
          if (st.current.touchOpened) {
            st.current.touchOpened = false;
            return;
          }
          open(ENTRIES[hitIndex(event.clientY)]);
        }}
        onFocus={(event) => {
          const i = linkIndex(event.target);
          if (i < 0) return;
          setStop(i);
          const s = st.current;
          const visible = event.target.matches(":focus-visible");
          // An attribute, not :has(): :has() over this subtree re-runs on every paint.
          event.currentTarget.toggleAttribute("data-focus", visible);
          if (visible && !(s.mode === "keyboard" && s.kb === i)) lensTo(i);
        }}
        onBlur={(event) => {
          if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
          event.currentTarget.removeAttribute("data-focus");
          const s = st.current;
          if (s.mode === "keyboard") release(0);
          setStop(homeIndex(s.active, s.cat));
        }}
        onKeyDown={onKeyDown}
        onScroll={(event) => {
          const s = st.current;
          s.scroll = event.currentTarget.scrollTop;
          if (s.mode === "pointer") s.p = localY(s.cy);
          schedule();
        }}
      >
        <div ref={inner} className="strip-inner">
          <span ref={lensEl} className="strip-lens" aria-hidden="true" />
          {RUNS.map(({ cat, start, end }) => (
            <Fragment key={cat.id}>
              <div
                ref={(el) => { itemEls.current[start] = el; }}
                className="strip-item"
                data-current-cat={initialCat === cat.id ? "" : undefined}
              >
                <a
                  ref={(el) => { linkEls.current[start] = el; }}
                  href={routes.galleryHref({ hash: cat.id })}
                  className="strip-link"
                  data-i={start}
                  tabIndex={start === firstStop ? 0 : -1}
                  draggable={false}
                  aria-label={`${cat.name}, ${cat.count} rules, on the wall`}
                />
                <span ref={(el) => { markEls.current[start] = el; }} className="strip-cat-mark" aria-hidden="true">
                  <CategoryIcon categoryId={cat.id} className="size-3.5" />
                </span>
              </div>
              <ul className="strip-run" aria-label={`${cat.name}, ${cat.count} rules`}>
                {ENTRIES.slice(start + 1, end).map((entry, offset) => {
                  const i = start + 1 + offset;
                  const { rule, short, n, total } = entry as RuleEntry;
                  const active = rule.id === initialId;
                  return (
                    <li key={rule.id} ref={(el) => { itemEls.current[i] = el; }} className="strip-item" data-active={active ? "" : undefined}>
                      <a
                        ref={(el) => { linkEls.current[i] = el; }}
                        href={routes.ruleHref(rule.id)}
                        className="strip-link"
                        data-i={i}
                        tabIndex={i === firstStop ? 0 : -1}
                        draggable={false}
                        aria-label={`${rule.title}, ${short}, ${n} of ${total}`}
                        aria-current={active ? "page" : undefined}
                      />
                      <span ref={(el) => { markEls.current[i] = el; }} className="strip-mark" aria-hidden="true" />
                    </li>
                  );
                })}
              </ul>
            </Fragment>
          ))}
        </div>
      </div>
      <span className="strip-frame" aria-hidden="true" />
      <div ref={label} className="strip-label" aria-hidden="true">
        <span ref={labelText} />
      </div>
    </>
  );
}, (a, b) => a.routes === b.routes && a.peek === b.peek && a.api === b.api && a.actions === b.actions);

type MagnifyStripProps = {
  ruleId: string | null;
  /** The run to mark: the current rule's rail category. */
  currentCat: string | null;
  /** The gallery's search: rules outside it dim. */
  matches: ReadonlySet<string> | null;
  routes: CatalogRoutes;
  peek: RefObject<PeekHandle | null>;
  onOpen: (id: string) => void;
  onCategory: (id: RailCategoryId) => void;
};

/**
 * Hands each change to the column through refs, so a page turn never
 * re-renders the 112 nodes. The column ignores its initial props after the
 * first render (its memo compares only the stable ones).
 */
export function MagnifyStrip({ ruleId, currentCat, matches, routes, peek, onOpen, onCategory }: MagnifyStripProps) {
  const api = useRef<StripApi>(null);
  const actions = useRef<Actions>({ onOpen, onCategory });
  useLayoutEffect(() => {
    actions.current = { onOpen, onCategory };
  }, [onOpen, onCategory]);
  useLayoutEffect(() => {
    api.current?.setCurrent(ruleId, currentCat);
  }, [ruleId, currentCat]);
  useLayoutEffect(() => {
    api.current?.setMatches(matches);
  }, [matches]);
  return <Column initialId={ruleId} initialCat={currentCat} routes={routes} peek={peek} api={api} actions={actions} />;
}
