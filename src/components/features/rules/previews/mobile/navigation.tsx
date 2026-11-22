"use client";

import { useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { Archive, ArrowLeft, ArrowRight, ChevronRight, Menu, SquareStack, Users } from "@/components/ui/icons";
import type { Variant } from "@/components/features/rules/preview-primitives";
import type { Rule } from "@/data/ui-logic";
import { MobileComparison } from "./kit/comparison";
import { PhoneFrame, Readout, SystemChrome } from "./kit/frame";
import { windows, type Size } from "./kit/geometry";
import { navigate, startHistory, type NavigationEvent } from "./kit/navigation";
import { backGesture, cafe, current, destinations, details, draft, draftHistory, inbox, navigationSurface, product, shopTabs, tabHistories, windowSizes, type Destination } from "./kit/navigation-fixture";
import { useTapRecorder } from "./kit/taps";
import { Atlas, Tabs, type Tab } from "./navigation-still";
import "./mobile.css";
import "./navigation.css";



function useTabs<T extends Tab>(tabs: readonly T[], initial: T, retain = true) {
  const [selected, setSelected] = useState(initial);
  const [histories, setHistories] = useState(() => tabHistories(tabs));
  function select(tab: T) {
    if (tab === selected) return;
    if (!retain) setHistories(old => ({ ...old, [selected]: tabHistories([selected])[selected] }));
    setSelected(tab);
  }
  function dispatch(event: NavigationEvent) {
    setHistories(old => ({ ...old, [selected]: navigate(old[selected], event) }));
  }
  return { selected, select, entry: current(histories[selected]), dispatch };
}

function StoreContent({ tab }: { tab: Destination }) {
  return <div className="mn-body"><h3 className="mn-title">{tab}</h3>
    {tab === "Account" ? <div className="mn-listrow"><Users /><span>Alex Rivera<small>Member account</small></span></div> : <>
      <Atlas /><span className="mn-subtitle">{tab === "Orders" ? "Order #1048 · In transit" : tab === "Saved" ? "In your collection" : "From the bookshop"}</span>
      <div className="mn-headrow"><strong>{product.name}</strong><span>{product.price}</span></div>
      {tab === "Orders" && <p className="mn-passage">Delivery on Thursday</p>}
    </>}
  </div>;
}

function Frame({ children, size = windows.portrait, events }: { children: ReactNode; size?: Size; events?: Parameters<typeof PhoneFrame>[0]["events"] }) {
  return <PhoneFrame size={size} profile="Android" host="App" inset={18} events={events}>
    <div className="mn-app">{children}</div><SystemChrome profile="Android" inset={18} />
  </PhoneFrame>;
}
function Header({ children }: { children: ReactNode }) { return <header className="mn-header"><SquareStack aria-hidden="true" />{children}</header>; }
type PaneProps = { side: Variant; inspect: boolean };

function DestinationPane({ side, inspect }: PaneProps) {
  const tab = useTabs(destinations, "Home");
  const [menu, setMenu] = useState(false);
  const [path, setPath] = useState<string[]>([]);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstDestination = useRef<HTMLDivElement>(null);
  const trials = useTapRecorder(windows.portrait, "Orders");
  function activate(action: string, e: MouseEvent<HTMLButtonElement>) {
    if (e.detail && "pointerId" in e.nativeEvent) trials.commit(Number(e.nativeEvent.pointerId), action);
    setPath(old => [...old, action]);
  }
  function choose(name: Destination, e: MouseEvent<HTMLButtonElement>) {
    activate(name, e); tab.select(name); setMenu(false);
    if (menu) menuButton.current?.focus({ preventScroll: true });
  }
  useLayoutEffect(() => { if (menu) firstDestination.current?.querySelector("button")?.focus({ preventScroll: true }); }, [menu]);
  return <><Frame events={{ onPointerDownCapture: trials.begin, onPointerUpCapture: e => trials.end(e), onPointerCancelCapture: e => trials.end(e, true) }}>
    <Header>Fieldwork books</Header><StoreContent tab={tab.selected} />
    {side === "do" ? <Tabs tabs={destinations} selected={tab.selected} onSelect={choose} /> : <>
      <div className="mn-tabbar"><button className="mn-tab" ref={menuButton} data-receiver="Menu" aria-expanded={menu} onClick={e => { activate("Menu", e); setMenu(!menu); }}><Menu />Menu</button></div>
      {menu && <div className="mn-menu" ref={firstDestination} onKeyDown={e => { if (e.key === "Escape") { e.stopPropagation(); setMenu(false); menuButton.current?.focus(); } }}>
        <Tabs tabs={destinations} selected={tab.selected} onSelect={choose} /></div>}
    </>}
  </Frame><p className="mf-result" role="status">{path.length ? "Measured in this pane · " + path.length + (path.length === 1 ? " activation" : " activations") + " · " + (menu ? "Menu" : tab.selected) : "Find your order from Home."}</p>
    {inspect && <Readout kind="Measured in this pane">{trials.trials.filter(trial => trial.action).length} pointer activations · {["Home", ...path].join(" → ")}</Readout>}</>;
}

const passages = [
  ["Overview", "A pocket guide to the river district, with street maps that unfold flat."],
  ["Contents", "Walking maps cover the waterfront, old town and station district. The index lists streets by name."],
  ["Binding", "A stitched spine opens flat. The cloth cover protects the folded maps in a bag."],
  ["Delivery", "Each copy ships in a paper sleeve with a stiff backing board."],
  ["Returns", "Return an unused atlas in its original sleeve. Include the order number inside the parcel."],
] as const;

function ProductReading({ anchor, large, focusHeading, save }: { anchor: string; large: boolean; focusHeading: boolean; save: (place: string) => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const initial = useRef(anchor);
  const visible = useRef(anchor);
  function jump(name: string) {
    const el = scroll.current, section = el?.querySelector<HTMLElement>('[data-passage="' + name + '"]');
    if (el && section) el.scrollTop = section.offsetTop - el.offsetTop;
  }
  useLayoutEffect(() => { jump(initial.current); }, []);
  useLayoutEffect(() => { if (focusHeading) heading.current?.focus({ preventScroll: true }); }, [focusHeading]);
  useLayoutEffect(() => { jump(visible.current); }, [large]);
  return <><div className="mn-body" style={{ flex: "none", paddingBottom: 12 }}><span className="mn-subtitle">Product {product.id}</span><h3 ref={heading} tabIndex={-1} className="mn-title">{product.name}</h3>
    <button className="mn-soft" onClick={() => jump("Returns")}>Jump to Returns</button></div>
    <div className="mn-reading" ref={scroll} tabIndex={0} role="region" aria-label="Product information" style={{ fontSize: large ? "1.6em" : undefined }}
      onScroll={e => {
        const el = e.currentTarget;
        const target = Array.from(el.querySelectorAll<HTMLElement>("[data-passage]")).filter(v => v.offsetTop - el.offsetTop <= el.scrollTop + 2).at(-1)?.dataset.passage ?? "Overview";
        if (target !== visible.current) { visible.current = target; save(target); }
      }}>{passages.map(([title, body]) => <section className="mn-passage" data-passage={title} key={title}><h4>{title}</h4><p>{body}</p></section>)}</div>
  </>;
}

function ShopPane({ side, inspect, large }: PaneProps & { large: boolean }) {
  const tab = useTabs(shopTabs, "Shop", side === "do");
  const [visited, setVisited] = useState(false);
  const [focusHeading, setFocusHeading] = useState(false);
  const detail = tab.entry.path === product.path;
  return <><Frame><Header>Fieldwork books</Header>
    {tab.selected === "Bag" ? <div className="mn-body"><h3 className="mn-title">Bag</h3><Archive /><p className="mn-passage">Your bag is empty.</p></div>
      : detail ? <ProductReading focusHeading={focusHeading} anchor={tab.entry.anchor ?? "Overview"} large={large} save={anchor => tab.dispatch({ type: "replace", entry: { ...tab.entry, anchor } })} />
      : <div className="mn-body"><h3 className="mn-title">Catalog</h3><Atlas /><button className="mn-listrow" onClick={() => { setFocusHeading(true); tab.dispatch({ type: "push", entry: { path: product.path, anchor: "Overview" } }); }}>
        <span><small>Product {product.id}</small><strong>{product.name}</strong></span><ChevronRight /></button></div>}
    <Tabs tabs={shopTabs} selected={tab.selected} onSelect={name => { tab.select(name); if (name === "Bag") { setVisited(true); setFocusHeading(false); } }} /></Frame>
    <p className="mf-result" role="status">{tab.selected === "Bag" ? "Switch back to Shop." : detail ? (visited ? "Shop reopened " : "Reading ") + "product 18 · " + tab.entry.anchor + "." : visited ? "Shop reopened the catalog." : "Open product 18 and read Returns. Visit Bag, then Shop."}</p>
    {inspect && <Readout kind="Simulated">{tab.selected} · {tab.entry.path} · {tab.entry.anchor ?? "Top"}</Readout>}</>;
}

function MapPane({ side, inspect }: PaneProps) {
  const [history, setHistory] = useState(() => navigate(startHistory({ path: "/places" }), { type: "push", entry: cafe }));
  const [stale, setStale] = useState(false);
  const [note, setNote] = useState("");
  const [pending, setPending] = useState<"close" | "back" | null>(null);
  const [focus, setFocus] = useState("None");
  const opener = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const keep = useRef<HTMLButtonElement>(null);
  const didOpen = useRef(false);
  const entry = current(history);
  const open = entry.path === details.path || stale;
  const map = entry.path !== "/places";
  function dismiss(action: "close" | "back", discard = false) {
    if (note && !discard) { setPending(action); return; }
    setPending(null); setNote("");
    if (action === "back" && side === "dont" && !stale) {
      setHistory(h => h.index > 1 ? navigate(navigate(h, { type: "back" }), { type: "back" }) : startHistory({ path: "/places" }));
      setStale(true);
    } else {
      if (!stale) setHistory(h => h.index > 0 ? navigate(h, { type: "back" }) : navigate(h, { type: "replace", entry: cafe }));
      setStale(false);
    }
  }
  useLayoutEffect(() => {
    if (open) close.current?.focus({ preventScroll: true });
    else if (didOpen.current) opener.current?.focus({ preventScroll: true });
    didOpen.current = open;
  }, [open]);
  useLayoutEffect(() => { if (pending) keep.current?.focus({ preventScroll: true }); }, [pending]);
  function keepNote() { setPending(null); requestAnimationFrame(() => close.current?.focus({ preventScroll: true })); }
  return <><Frame events={{ onFocusCapture: e => setFocus(e.target.getAttribute("aria-label") || e.target.textContent || "Note") }}>
    <div className="mn-main" inert={open}><Header>Field guide</Header>
      <div className="mn-detail" style={{ padding: "22px 24px" }}><h3 className="mn-title">{map ? "Map" : "Places"}</h3></div>
      {map ? <><div className="mn-map"><button ref={opener} className="mn-pin" aria-label="Open Fern café details" onClick={() => setHistory(h => navigate(h, { type: "push", entry: details }))}>Fern café</button></div>
        <div className="mn-body" style={{ flex: "none" }}><span className="mn-subtitle">Selected pin</span><strong>Fern café</strong><p>14 Market Lane</p></div></>
        : <div className="mn-body"><button ref={opener} className="mn-listrow" onClick={() => setHistory(h => navigate(h, { type: "push", entry: cafe }))}>Open map <ArrowRight /></button></div>}
      <div className="mn-toolbar"><button className="mn-soft" disabled={!history.index} onClick={() => setHistory(h => navigate(h, { type: "back" }))}>Back</button>
        <button className="mn-soft" disabled={history.index === history.entries.length - 1} onClick={() => setHistory(h => navigate(h, { type: "forward" }))}>Forward</button></div>
    </div>
    {open && <div className="mn-modal"><div role="dialog" aria-modal="true" aria-label="Fern café details" className="mn-dialog" onKeyDown={e => {
      if (e.key === "Escape") { e.stopPropagation(); if (pending) keepNote(); else dismiss("close"); }
      if (e.key !== "Tab") return;
      const items = e.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled), input");
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && e.target === first) { e.preventDefault(); last.focus(); }
      if (!e.shiftKey && e.target === last) { e.preventDefault(); first.focus(); }
    }}>
      {pending ? <><h3 className="mn-title">Discard note?</h3><p>{note}</p><div className="mn-toolbar"><button className="mn-soft" ref={keep} onClick={keepNote}>Keep editing</button>
        <button className="mn-action" onClick={() => dismiss(pending, true)}>Discard</button></div></>
        : <><span className="mn-subtitle">Café details</span><h3 className="mn-title">Fern café</h3><p>14 Market Lane</p>
          <label className="mn-field">Visit note<input aria-label="Visit note" value={note} onChange={e => setNote(e.target.value)} /></label>
          <div className="mn-toolbar"><button className="mn-soft" ref={close} onClick={() => dismiss("close")}>Close</button>
            <button className="mn-action" onClick={() => dismiss("back")}>Back</button></div></>}
    </div></div>}</Frame>
    <p className="mf-result" role="status">{stale ? "Back left the map. Café details are still open." : open ? "Details are open. Try Back." : history.entries.some(e => e.path === details.path) ? (map ? "Map · Fern café is still selected." : "Places · map closed.") : "Open the café pin, then press Back."}</p>
    {inspect && <><Readout kind="Simulated">Route {entry.path} · depth {history.index + 1} · pin {map ? cafe.anchor : "none"}</Readout>
      <Readout kind="Measured in this pane">Last focused control · {focus}</Readout>
      <button className="cmp-ctl" disabled={open} onClick={() => { setStale(false); setHistory(startHistory(details)); }}>Open details by direct link</button></>}</>;
}

function InboxList() {
  return <div className="mn-body"><h3 className="mn-title">Inbox</h3>{["Lin Harper", "Mara Chen", "Jon Bell"].map((name, i) =>
    <div className="mn-listrow" key={name}><span><small>Row {18 + i}</small><b>{name}</b><small>{["Meet at the station?", "Field notes", "Friday’s walk"][i]}</small></span></div>)}</div>;
}

function GesturePane({ side, inspect }: PaneProps) {
  const [history, setHistory] = useState(draftHistory);
  const [outcome, setOutcome] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  const replayButton = useRef<HTMLButtonElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const pointer = useRef<{ id: number; x: number; width: number } | null>(null);
  const restoreCaret = useRef(false);
  const entry = current(history);
  const active = history.progress !== null;
  const editing = entry.path !== inbox.path;
  function updateDraft(value: string, caret: number) {
    setHistory(h => {
      const route = current(h);
      if (route.draft === undefined || (route.draft === value && route.caret === caret)) return h;
      return navigate(h, { type: "replace", entry: { ...route, draft: value, caret } });
    });
  }
  useLayoutEffect(() => {
    if (editing && input.current) {
      const initialCaret = draft.caret ?? 0;
      input.current.setSelectionRange(initialCaret, initialCaret);
    }
  }, [editing]);
  function preview(progress: number) {
    if (!active && input.current) updateDraft(input.current.value, input.current.selectionStart);
    setOutcome("");
    setHistory(h => backGesture(h, "preview", side === "do", progress));
  }
  function finish(event: "back" | "cancel") {
    restoreCaret.current = event === "cancel" && side === "do";
    setHistory(h => backGesture(h, event, side === "do"));
    setOutcome(event === "back" ? "Back completed. Inbox row 18 is visible." : side === "do" ? "Back canceled. Your draft and caret returned." : "Back canceled. The draft was already popped.");
  }
  useLayoutEffect(() => { if (active) cancelButton.current?.focus({ preventScroll: true }); }, [active]);
  useLayoutEffect(() => {
    if (!active && restoreCaret.current && input.current) {
      restoreCaret.current = false;
      input.current.focus({ preventScroll: true });
      input.current.setSelectionRange(entry.caret ?? 0, entry.caret ?? 0);
    } else if (!active && outcome && !editing) replayButton.current?.focus({ preventScroll: true });
  }, [active, entry.caret, editing, outcome]);
  return <><Frame><Header>Correspondence</Header>
    <div className="mn-stack"><div aria-hidden={editing && !active || undefined}><InboxList /></div>
      {editing && <div className="mn-editor" style={{ transform: "translateX(" + (history.progress ?? 0) * 80 + "%)" }} inert={active}>
        <span className="mn-subtitle">Reply to Lin Harper</span><h3 className="mn-title">Draft</h3>
        <label className="mn-field">Message<textarea ref={input} value={entry.draft} onChange={e => updateDraft(e.target.value, e.target.selectionStart)}
          onSelect={e => updateDraft(e.currentTarget.value, e.currentTarget.selectionStart)} /></label>
      </div>}
      {(editing || active) && <div className="mn-edge" aria-hidden="true"
        onPointerDown={e => {
          if (!e.isPrimary || e.button !== 0) return;
          pointer.current = { id: e.pointerId, x: e.clientX, width: e.currentTarget.parentElement!.getBoundingClientRect().width };
          e.currentTarget.setPointerCapture(e.pointerId); preview(0);
        }}
        onPointerMove={e => {
          const p = pointer.current;
          if (p?.id === e.pointerId) preview((e.clientX - p.x) / p.width);
        }}
        onPointerUp={e => {
          const p = pointer.current;
          if (p?.id !== e.pointerId) return;
          pointer.current = null;
          if (e.clientX <= p.x) finish("cancel");
        }}
        onPointerCancel={() => { pointer.current = null; finish("cancel"); }} />}
    </div>
    <div className="mn-toolbar">{active ? <><button ref={cancelButton} className="mn-soft" onClick={() => finish("cancel")}>Cancel Back</button><button className="mn-action" onClick={() => finish("back")}>Complete Back</button></>
      : editing ? <button className="mn-soft" onClick={() => preview(.45)}><ArrowLeft />Preview Back</button>
      : <button className="mn-soft" ref={replayButton} onClick={() => { setHistory(draftHistory()); setOutcome(""); }}>Reopen draft</button>}</div>
    </Frame><p className="mf-result" role="status">{outcome || (active ? "Choose whether to cancel or complete Back." : "Edit the draft. Drag the left edge or choose Preview Back.")}</p>
    {inspect && <Readout kind="Simulated">Depth {history.index + 1} · {entry.path} · {editing ? "caret " + entry.caret : entry.anchor} · {active ? Math.round(history.progress! * 100) + "% preview" : "at rest"}</Readout>}</>;
}

function WindowPane({ side, inspect, size, tabletop }: PaneProps & { size: Size; tabletop: boolean }) {
  const tab = useTabs(destinations, "Saved");
  const surface = navigationSurface(size, side === "do", tabletop);
  return <><Frame size={size}><Header>Fieldwork books</Header>{inspect && <div className="mn-ruler" aria-hidden="true"><span>{size.width} dp</span></div>}<div className="mn-layout" data-rail={surface === "Side rail"}>
    <Tabs tabs={destinations} selected={tab.selected} onSelect={tab.select} /><div className="mn-main"><StoreContent tab={tab.selected} /></div></div>
    </Frame><p className="mf-result" role="status">Modelled · {surface} · {tab.selected} selected.</p>
    {inspect && <Readout kind="Modelled">Window {size.width} × {size.height} dp · device {windows.large.width} × {windows.large.height} dp · {side === "do" ? "window" : "device"} dimensions choose the surface.</Readout>}</>;
}

export function NavigationComparison({ rule }: { rule: Rule }) {
  const [inspect, setInspect] = useState(false);
  const [large, setLarge] = useState(false);
  const [preset, setPreset] = useState(0);
  const [tabletop, setTabletop] = useState(false);
  const [generation, setGeneration] = useState(0);
  function reset() { setInspect(false); setLarge(false); setPreset(0); setTabletop(false); setGeneration(n => n + 1); }
  return <MobileComparison rule={rule} reset={reset} exampleChanged={preset !== 0 || tabletop} controls={<>
    {rule.id === "mobile-8" && <button className="cmp-ctl" aria-pressed={large} onClick={() => setLarge(!large)}>Larger text</button>}
    {rule.id === "mobile-11" && <><label>Window <select aria-label="Window size" value={preset} onChange={e => setPreset(Number(e.target.value))}>
      {windowSizes.map((s, i) => <option key={i} value={i}>{s.width} × {s.height} dp</option>)}</select></label>
      <button className="cmp-ctl" aria-pressed={tabletop} onClick={() => setTabletop(!tabletop)}>Tabletop</button></>}
    <button className="cmp-ctl" aria-pressed={inspect} onClick={() => setInspect(!inspect)}>Inspect</button>
  </>} render={side => {
    const props = { side, inspect };
    switch (rule.id) {
      case "mobile-7": return <DestinationPane key={generation} {...props} />;
      case "mobile-8": return <ShopPane key={generation} {...props} large={large} />;
      case "mobile-9": return <MapPane key={generation} {...props} />;
      case "mobile-10": return <GesturePane key={generation} {...props} />;
      default: return <WindowPane key={generation} {...props} size={windowSizes[preset]} tabletop={tabletop} />;
    }
  }} />;
}
