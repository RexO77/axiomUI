"use client";

import { useCallback, useImperativeHandle, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode, type Ref } from "react";
import type { Rule } from "@/data/ui-logic";
import { Activity, Check, ChevronRight, ChevronUp, History as Clock, Layers, Settings, X } from "@/components/ui/icons";
import { MobileComparison } from "./kit/comparison";
import { PhoneFrame, Readout, SystemChrome } from "./kit/frame";
import { initialSheet, windows } from "./kit/geometry";
import { SheetLayer } from "./kit/inspection";
import { filters, finishPull, matchingShoes, sheetMetrics as m, toggleFilter, visitOptions, type Filter } from "./kit/sheets-fixtures";
import "./sheets.css";

type PaneProps = { good: boolean; inspect: boolean; replay: Ref<() => void> };
const updates = ["Survey filed", "Soil tested", "Beds marked", "Stone delivered", "Paths graded", "Hedges trimmed", "Benches fitted", "Gates opened"];
const destinations = ["Birchwood", "Westport", "North Quay", "Oxbridge", "Elm Park", "Southbank", "Hill End", "Victoria"];
function departureTime(i: number) { return String(Math.floor((420 + i * 8) / 60)).padStart(2, "0") + ":" + String((420 + i * 8) % 60).padStart(2, "0"); }

function Frame({ children }: { children: ReactNode }) {
  return <PhoneFrame size={windows.narrow} profile="iOS" host="Browser"><div className="ms-screen">{children}</div>
    <SystemChrome profile="iOS" inset={m.inset} /></PhoneFrame>;
}

function LogPane({ good, inspect, replay }: PaneProps) {
  const article = useRef<HTMLDivElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const [offsets, setOffsets] = useState({ article: m.articleStart as number, log: 0 });
  const [source, setSource] = useState("");
  const pending = useRef(false);
  function measure() {
    if (article.current?.clientHeight && log.current) setOffsets({ article: Math.round(article.current.scrollTop), log: Math.round(log.current.scrollTop) });
  }
  const swipe = useCallback(() => {
    const inner = log.current, outer = article.current;
    if (!inner?.clientHeight || !outer) { pending.current = true; return; }
    const previous = inner.scrollTop;
    inner.scrollTop += 144;
    if (!good) outer.scrollTop += Math.max(0, 144 - (inner.scrollTop - previous));
    setSource("Replay"); measure();
  }, [good]);
  useImperativeHandle(replay, () => swipe);
  useLayoutEffect(() => {
    const inner = log.current!, outer = article.current!;
    let initialized = false;
    function initialize() {
      if (!inner.clientHeight) return;
      if (!initialized) {
        inner.scrollTop = inner.scrollHeight;
        outer.scrollTop = m.articleStart;
        initialized = true; measure();
      }
      if (pending.current) { pending.current = false; swipe(); }
    }
    initialize();
    const observer = new ResizeObserver(initialize);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [swipe]);
  const delta = offsets.article - m.articleStart;
  return <><Frame><div className="ms-mast"><Activity /> Garden journal</div>
    <div className="ms-article" ref={article} role="region" aria-label="Garden article" tabIndex={0} onScroll={measure}
      onWheelCapture={() => setSource("Browser")} onTouchStartCapture={() => setSource("Browser")}
      onKeyDownCapture={e => { if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) setSource("Browser"); }}>
      <div className="ms-intro"><small>Restoration diary</small><h3>The walled garden</h3><p>A season of repairs to the east entrance.</p></div>
      <div className="ms-story"><small>Field notes</small><h3>Opening the east gate</h3><p>The last paving stones are in place. Here’s how the work unfolded.</p>
        <h4>Activity log</h4><div className="ms-log" role="region" aria-label="Activity log" tabIndex={0} ref={log}
          style={{ height: m.logHeight, overscrollBehaviorY: good ? "contain" : "auto" }} onScroll={measure}>
          {updates.map((s, i) => <div className="ms-entry" key={s}><span>Nov {i + 1}</span><b>{s}</b></div>)}
        </div><h4>Through the gate</h4><p>Beyond the brick arch, a gravel path follows the wall to the orchard. The first bench sits beneath the pear tree.</p>
        <h4>The next planting</h4><p>Winter bulbs will fill the border beside the new path.</p></div>
    </div></Frame><p className="mf-result" role="status">{source ? (source === "Replay" ? "Simulated swipe" : "Browser scroll") + (delta ? " · article is " + Math.abs(delta) + " px " + (delta > 0 ? "below" : "above") + " its starting position." : " · article is at its starting position.") : "Swipe up inside the activity log, then outside it."}</p>
    {inspect && <Readout kind="Measured in this pane">Article {offsets.article} CSS px · log {offsets.log} CSS px.</Readout>}</>;
}

function trap(event: KeyboardEvent<HTMLDivElement>, close: () => void) {
  if (event.key === "Escape" || event.key === "BrowserBack" || (event.altKey && event.key === "ArrowLeft")) { event.preventDefault(); event.stopPropagation(); close(); return; }
  if (event.key !== "Tab") return;
  const targets = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex="0"]')].filter(el => !el.closest("[inert]"));
  const target = event.shiftKey ? targets.at(-1) : targets[0];
  if (document.activeElement === (event.shiftKey ? targets[0] : targets.at(-1))) {
    event.preventDefault(); target?.focus({ preventScroll: true });
  }
}

function SheetPane({ id, good, inspect, replay }: PaneProps & { id: string }) {
  const train = id === "mobile-17", shop = id === "mobile-19";
  const railDetent = 456, shopDetent = 372;
  const startingHeight = train ? railDetent : shop ? shopDetent : m.half;
  const [sheet, setSheet] = useState({ ...initialSheet, modal: true, detent: startingHeight });
  const [choice, setChoice] = useState("");
  const [draft, setDraft] = useState<Filter[]>([]);
  const [applied, setApplied] = useState<Filter[]>([]);
  const [counts, setCounts] = useState({ opens: 1, commits: 0 });
  const [owner, setOwner] = useState("Idle");
  const [result, setResult] = useState("");
  const [pull, setPull] = useState(0);
  const opener = useRef<HTMLButtonElement>(null), closeButton = useRef<HTMLButtonElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const openedByUser = useRef(false);
  const gesture = useRef<{ id: number; y: number; time: number; start: number; scale: number } | null>(null);
  const title = train ? "Departures" : shop ? "Filters" : "Visit options";
  const available = sheet.detent - m.header - m.inset;
  function close(message: string, restore = true) {
    gesture.current = null; setPull(0);
    setSheet(old => ({ ...old, modal: false, detent: 0 })); setResult(message);
    if (restore) requestAnimationFrame(() => opener.current?.focus({ preventScroll: true }));
  }
  function open() {
    openedByUser.current = true;
    setSheet({ ...initialSheet, modal: true, detent: startingHeight });
    setDraft(applied); setOwner("Idle"); setResult(""); setCounts(n => ({ ...n, opens: n.opens + 1 }));
  }
  useLayoutEffect(() => {
    if (!sheet.modal) return;
    if (openedByUser.current) closeButton.current?.focus({ preventScroll: true });
    if (!train || !body.current) return;
    const list = body.current;
    let initialized = false;
    const initialize = () => {
      if (!initialized && list.clientHeight) {
        list.scrollTop = (m.firstDeparture - 1) * m.row; initialized = true;
        setSheet(old => ({ ...old, bodyScrollTop: list.scrollTop }));
      }
    };
    initialize(); const observer = new ResizeObserver(initialize); observer.observe(list);
    return () => observer.disconnect();
  }, [sheet.modal, train]);
  function finish(start: number, travel: number, speed: number, restore: boolean) {
    const next = finishPull(start, travel, speed, good);
    if (body.current) body.current.scrollTop = next.offset;
    setOwner(next.owner); setPull(0);
    if (next.dismiss) {
      setSheet(old => ({ ...old, bodyScrollTop: 0 }));
      close(start > 0 ? "The list reached the top and dismissed the sheet." : "A fresh pull dismissed the sheet.", restore);
    } else {
      setSheet(old => ({ ...old, bodyScrollTop: body.current?.scrollTop ?? next.offset }));
      setResult(next.offset === 0 ? "The list reached the top. Departures stayed open." : "The list moved. Departures stayed open.");
    }
  }
  function pointerDown(e: PointerEvent<HTMLDivElement>) {
    if (!e.isPrimary || e.button !== 0 || gesture.current) return;
    const el = e.currentTarget;
    gesture.current = { id: e.pointerId, y: e.clientY, time: e.timeStamp, start: el.scrollTop, scale: el.getBoundingClientRect().width / el.clientWidth };
    el.setPointerCapture(e.pointerId); setOwner(el.scrollTop === 0 ? "At top" : "List");
  }
  function pointerMove(e: PointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    if (!g || e.pointerId !== g.id) return;
    const travel = (e.clientY - g.y) / g.scale;
    e.currentTarget.scrollTop = Math.max(0, g.start - travel);
    if (!good || !g.start) setPull(Math.min(130, Math.max(0, travel - g.start)));
  }
  function pointerUp(e: PointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    if (!g || e.pointerId !== g.id) return;
    const travel = (e.clientY - g.y) / g.scale;
    gesture.current = null;
    finish(g.start, travel, travel / Math.max(1, e.timeStamp - g.time), true);
  }
  function commit(next: Filter[]) {
    setApplied(next); setCounts(n => ({ ...n, commits: n.commits + 1 }));
    close("Applied filters · " + matchingShoes(next).length + " pairs.");
  }
  function selectFilter(filter: Filter) {
    const next = toggleFilter(draft, filter); setDraft(next);
    if (!good) commit(next);
    else setResult(next.length ? next.length + (next.length === 1 ? " filter ready to apply." : " filters ready to apply.") : "All filters cleared from the draft.");
  }
  useImperativeHandle(replay, () => () => {
    if (!sheet.modal || !train) return;
    const start = body.current?.clientHeight ? body.current.scrollTop : sheet.bodyScrollTop;
    finish(start, 160, 2.4, false);
  });
  const hint = train ? "Flick down the departure list to return to its first service." : shop ? "Choose size 9, black and under $120." : "Expand the sheet and choose Wheelchair access.";
  const results = matchingShoes(applied);
  return <><Frame><div className="ms-back" inert={sheet.modal}>
    <div className="ms-mast">{train ? <Clock /> : shop ? <Settings /> : <Layers />}{train ? "Rail timetable" : shop ? "Footwear" : "Garden tickets"}</div>
    <div className="ms-page"><small>{train ? "Central station" : shop ? "Shop the collection" : "Day admission"}</small><h3>{train ? "Station board" : shop ? "Everyday shoes" : "Glasshouse visit"}</h3>
      <p>{train ? "Weekday services from Central." : shop ? results.length + " pairs" : "Saturday · Palm house and gardens"}</p>
      {choice && !shop && <p className="ms-chip"><Check /> {choice}</p>}
      <button className="ms-primary" ref={opener} onClick={open}>{title}<ChevronRight /></button>
      {shop && <><div className="ms-chips">{applied.map(s => <span className="ms-chip" key={s}>{s}</span>)}</div>
        <ul className="ms-products">{results.map(s => <li key={s.name}><div><b>{s.name}</b><small>{s.color}</small></div><b>${s.price}</b></li>)}</ul>
        {!results.length && <p>No pairs match these filters.</p>}</>}
      {!shop && <div className="ms-details"><small>{train ? "First service" : "Entry window"}</small><strong>{train ? "07:00" : "10:00–12:00"}</strong><span>{train ? "Birchwood · Platform 1" : "East gate · One visitor"}</span></div>}
    </div></div>
    {sheet.modal && <><div className="ms-shade" aria-hidden="true" /><div className="ms-layer" style={{ transform: pull ? "translateY(" + pull + "px)" : undefined }}>
      <SheetLayer state={sheet}><div role="dialog" aria-label={title} onKeyDown={e => trap(e, () => close(shop ? "Draft discarded." : title + " closed."))} className="ms-dialog">
        <header style={{ height: m.header }}><h4>{title}</h4>
          {!train && !shop && <button disabled={sheet.detent === m.expanded} className="ms-expand" onClick={() => { setSheet(old => ({ ...old, detent: m.expanded })); setResult("Expanded. Find Wheelchair access."); }}><ChevronUp />{sheet.detent === m.expanded ? "Expanded" : "Expand"}</button>}
          <button ref={closeButton} className="ms-close" aria-label={shop ? "Cancel filters" : "Close " + title.toLowerCase()} onClick={() => close(shop ? "Draft discarded." : title + " closed.")}><X /></button>
        </header>
        {train && <div className="ms-list ms-trains" role="region" aria-label="Departure list" ref={body} tabIndex={0}
          onScroll={e => { const top = e.currentTarget.scrollTop; setSheet(old => ({ ...old, bodyScrollTop: top })); }}
          onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp}
          onPointerCancel={() => { gesture.current = null; setPull(0); setOwner("Idle"); }}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); finish(e.currentTarget.scrollTop, 160, 2.4, true); } }}>
          {Array.from({ length: m.departures }, (_, i) => <div className="ms-row" style={{ height: m.row }} key={i}><time>{departureTime(i)}</time><b>{destinations[i % destinations.length]}</b><small>Pl. {1 + i % 4}</small></div>)}</div>}
        {!train && !shop && <div className="ms-list" role="group" aria-label="Visit options" ref={body}
          style={{ overflowY: good ? "auto" : "clip" }} onScroll={e => { const top = e.currentTarget.scrollTop; setSheet(old => ({ ...old, bodyScrollTop: top })); }}>
          {visitOptions.map((v, i) => <button key={v} className="ms-row" style={{ height: m.row }} aria-pressed={choice === v}
            inert={!good && i * m.row >= available} aria-hidden={!good && i * m.row >= available || undefined} onClick={() => { setChoice(v); setResult(v + " selected."); }}>
            <span>{String(i + 1).padStart(2, "0")}</span><b>{v}</b><i>{choice === v && <Check />}</i></button>)}</div>}
        {shop && <><div className="ms-filter-list">{filters.map(filter => <button className="ms-filter" key={filter} aria-pressed={draft.includes(filter)} onClick={() => selectFilter(filter)}>
          <i>{draft.includes(filter) && <Check />}</i>{filter}</button>)}</div>
          <footer><button className="ms-primary" onClick={() => commit(draft)}>Show {matchingShoes(draft).length} pairs<ChevronRight /></button></footer></>}
      </div></SheetLayer></div></>}
    </Frame><p className="mf-result" role="status">{result || hint}</p>
    {inspect && <div className="mf-inspection">{shop ? <Readout kind="Measured in this pane">{counts.opens} {counts.opens === 1 ? "sheet open" : "sheet opens"} · {counts.commits} {counts.commits === 1 ? "commit" : "commits"} · {results.length} applied results.</Readout> :
      <><Readout kind="Simulated">{sheet.modal ? sheet.detent + " CSS px detent" : "Sheet dismissed"}{train && " · gesture owner: " + owner}</Readout>
      <Readout kind="Measured in this pane">List offset {Math.round(sheet.bodyScrollTop)} CSS px.</Readout></>}</div>}</>;
}

export function SheetsComparison({ rule }: { rule: Rule }) {
  const [reset, setReset] = useState(0), [inspect, setInspect] = useState(false);
  const left = useRef<() => void>(null), right = useRef<() => void>(null);
  const log = rule.id === "mobile-16", train = rule.id === "mobile-17";
  return <MobileComparison rule={rule} reset={() => { setReset(n => n + 1); setInspect(false); }} controls={<>
    {(log || train) && <button className="cmp-ctl" onClick={() => { left.current?.(); right.current?.(); }}>{log ? "Replay log swipe" : "Replay downward flick"}</button>}
    <button className="cmp-ctl" aria-pressed={inspect} onClick={() => setInspect(!inspect)}>Inspect</button></>}
    render={side => { const props = { good: side === "do", inspect, replay: side === "do" ? left : right };
      return log ? <LogPane key={reset} {...props} /> : <SheetPane key={reset} id={rule.id} {...props} />;
    }} />;
}
