"use client";

import { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent, type Ref } from "react";
import type { Rule } from "@/data/ui-logic";
import type { Variant } from "@/components/features/rules/preview-primitives";
import { Archive, ArrowLeft, Check, Pencil, Plus } from "@/components/ui/icons";
import { MobileComparison } from "./kit/comparison";
import { PhoneFrame, Readout, SystemChrome } from "./kit/frame";
import { calibratedScale, intersection } from "./kit/geometry";
import { composeSize, feedbackSize, priceGeometry, priceTarget } from "./kit/feedback-geometry";
import { ScaleControl } from "./kit/inspection";
import { useTapRecorder } from "./kit/taps";
import { Notebook, PriceDrawing } from "./feedback-still";
import "./mobile.css";
import "./feedback.css";

function PricePane({ side, inspect, nearTop, leftHand, scale, calibrated, replayRef }: {
  side: Variant; inspect: boolean; nearTop: boolean; leftHand: boolean; scale?: number; calibrated: boolean; replayRef: Ref<() => void>;
}) {
  const [value, setValue] = useState(40);
  const [holding, setHolding] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  function stopReplay() { timers.current.forEach(clearTimeout); timers.current = []; }
  useEffect(() => stopReplay, []);
  function move(price: number) { setValue(price); setHolding(true); }
  useImperativeHandle(replayRef, () => () => {
    stopReplay();
    move(40);
    timers.current = [62, priceTarget].map((price, index) => setTimeout(() => move(price), 240 * (index + 1)));
  });
  const { point, fixed, overlap, pad } = priceGeometry(value, side, leftHand, nearTop);
  return <>
    <PhoneFrame size={feedbackSize} profile="iOS" host="Browser" scale={scale}>
      <div className="fb-scene">
        <div className="fb-heading" style={nearTop ? { top: 244 } : undefined}><small>Price filter</small><h3>Maximum price</h3><p>Drag the limit to ${priceTarget}.</p></div>
        <PriceDrawing value={value} side={side} nearTop={nearTop} leftHand={leftHand} holding={holding} />
        <input className="fb-range" type="range" aria-label="Maximum price" aria-valuetext={value + " dollars"} min="0" max="100" step="1"
          value={value} style={{ top: point.y - 26 }} onPointerDown={e => { stopReplay(); setHolding(true); e.currentTarget.setPointerCapture(e.pointerId); }}
          onLostPointerCapture={() => setHolding(false)} onPointerUp={() => setHolding(false)} onPointerCancel={() => setHolding(false)}
          onKeyDown={stopReplay} onKeyUp={() => setHolding(false)} onBlur={() => setHolding(false)}
          onChange={e => move(e.currentTarget.valueAsNumber)} />
      </div>
      <SystemChrome profile="iOS" inset={16} />
    </PhoneFrame>
    {inspect && <Readout kind="Modelled">{overlap ? "Price overlaps the finger pad." : fixed ? "Price uses the fixed readout below the track." : "4 px between the price and the pad."} Pad width {calibrated ? "18 mm at the calibrated scale" : Math.round(pad.width) + " fixture units"}.</Readout>}
  </>;
}

function BagPane({ side, haptics, inspect }: { side: Variant; haptics: boolean; inspect: boolean }) {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [cue, setCue] = useState("No request yet.");
  const [pulses, setPulses] = useState(0);
  const bagButton = useRef<HTMLButtonElement>(null);
  const trial = useTapRecorder(feedbackSize, "Add");
  function add(event: MouseEvent<HTMLButtonElement>) {
    setCount(n => n + 1);
    if (event.detail && "pointerId" in event.nativeEvent) trial.commit(Number(event.nativeEvent.pointerId), "Add");
    if (haptics) setPulses(n => n + 1);
    if (haptics && typeof navigator.vibrate === "function") {
      try {
        setCue(navigator.vibrate(12) ? "Vibration requested." : "Browser declined the request.");
      } catch {
        setCue("Vibration request unavailable.");
      }
    } else setCue(haptics ? "Vibration API unavailable." : "Haptics off.");
  }
  return <>
    <PhoneFrame size={feedbackSize} profile="iOS" host="Browser" events={{ onPointerDownCapture: trial.begin,
      onPointerUpCapture: e => trial.end(e), onPointerCancelCapture: e => trial.end(e, true) }}>
      <div className="fb-scene" onKeyDown={e => { if (e.key === "Escape" && open) { e.stopPropagation(); setOpen(false); bagButton.current?.focus({ preventScroll: true }); } }}>
        <header className="fb-nav"><strong>Paper goods</strong><button ref={bagButton} aria-expanded={open} onClick={() => setOpen(v => !v)}>{open ? "Back to item" : "Open bag"}</button></header>
        {open ? <div className="fb-body"><h3>Your bag</h3><p>{count ? "Field notebook × " + count : "Your bag is empty."}</p></div> :
          <div className="fb-body fb-product"><Notebook /><div className="fb-product-line"><h3>Field notebook</h3><b>$12</b></div>
            <button className="fb-primary" data-receiver="Add" onClick={add}><Plus size={20} />Add to bag</button>
            {side === "do" && <div className="fb-confirm" role="status" aria-atomic="true">{count > 0 && <><Check size={20} />{count} {count === 1 ? "item" : "items"} in bag</>}</div>}
          </div>}
      </div>
      <SystemChrome profile="iOS" inset={16} />
    </PhoneFrame>
    {haptics && <Readout kind="Simulated">{pulses ? "Haptic pulse " + pulses : "Haptic cue ready"}</Readout>}
    {inspect && <div><Readout kind="Simulated">Optional vibration · {cue}</Readout>
      <Readout kind="Measured in this pane">{count} saved in bag. {trial.trials.filter(t => t.action === "Add").length} Add taps.</Readout></div>}
  </>;
}

function InboxPane({ side, inspect, large, replayRef }: { side: Variant; inspect: boolean; large: boolean; replayRef: Ref<() => void> }) {
  const [archived, setArchived] = useState(false);
  const [page, setPage] = useState<"Inbox" | "Archive" | "Draft">("Inbox");
  const [notice, setNotice] = useState("");
  const [overlap, setOverlap] = useState(0);
  const undo = useRef<HTMLButtonElement>(null), compose = useRef<HTMLButtonElement>(null);
  const archive = useRef<HTMLButtonElement>(null), folder = useRef<HTMLButtonElement>(null), back = useRef<HTMLButtonElement>(null);
  const trial = useTapRecorder(feedbackSize, archived && page === "Inbox" ? "Undo" : null);
  const focusTarget = useRef<"archive" | "undo" | "back" | "compose" | "folder" | null>(null);
  useLayoutEffect(() => {
    if (focusTarget.current) ({ archive, undo, back, compose, folder })[focusTarget.current].current?.focus({ preventScroll: true });
    focusTarget.current = null;
  }, [archived, page]);
  useLayoutEffect(() => {
    const a = undo.current, b = compose.current;
    if (!inspect || !a || !b) return;
    function measure() {
      if (!a || !b) return;
      const fab = b.getBoundingClientRect();
      if (fab.height) setOverlap(Math.round((intersection(a.getBoundingClientRect(), fab)?.height ?? 0) * composeSize / fab.height));
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(a); observer.observe(b); observer.observe(b.closest(".mf-bezel")!);
    return () => observer.disconnect();
  }, [inspect, large, archived, page]);
  const [replay, setReplay] = useState<"Undo" | "Compose" | null>(null);
  function open(next: "Draft" | "Archive", focus = true) { focusTarget.current = focus ? "back" : null; setPage(next); setNotice(""); }
  function close() { focusTarget.current = page === "Draft" ? "compose" : "folder"; setPage("Inbox"); }
  function store() { focusTarget.current = "undo"; setArchived(true); setNotice(""); setReplay(null); }
  function restore(focus = true) { focusTarget.current = focus ? "archive" : null; setArchived(false); setPage("Inbox"); setNotice("Message restored."); }
  function record(e: MouseEvent<HTMLButtonElement>, action: string) {
    if (e.detail && "pointerId" in e.nativeEvent) trial.commit(Number(e.nativeEvent.pointerId), action);
  }
  const replaying = useRef(false);
  // Compose paints above the notice, so a point inside both rectangles reaches Compose.
  function tapUndoCenter() {
    const target = undo.current, fab = compose.current;
    if (!target || !fab) return;
    const rect = target.getBoundingClientRect(), box = fab.getBoundingClientRect();
    const x = rect.x + rect.width / 2, y = rect.y + rect.height / 2;
    const covered = x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
    if (covered) { setReplay("Compose"); open("Draft", false); } else { setReplay("Undo"); restore(false); }
  }
  useLayoutEffect(() => {
    if (!replaying.current || !archived || page !== "Inbox") return;
    replaying.current = false;
    tapUndoCenter();
  });
  useImperativeHandle(replayRef, () => () => {
    focusTarget.current = null;
    replaying.current = true;
    setReplay(null);
    if (archived && page === "Inbox") { replaying.current = false; tapUndoCenter(); return; }
    setNotice(""); setPage("Inbox"); setArchived(true);
  });
  return <>
    <PhoneFrame size={feedbackSize} profile="Android" host="Browser" events={{ onPointerDownCapture: trial.begin,
      onPointerUpCapture: e => trial.end(e), onPointerCancelCapture: e => trial.end(e, true) }}>
      <div className="fb-scene" style={{ "--fb-fab": composeSize + "px" } as CSSProperties}
        onKeyDown={e => { if (e.key === "Escape" && page !== "Inbox") { e.stopPropagation(); close(); } }}>
        <header className="fb-nav"><strong>Mail</strong>{page === "Inbox"
          ? <button ref={folder} onClick={() => open("Archive")}>Archive folder</button>
          : <button ref={back} onClick={close}><ArrowLeft size={16} />Back to inbox</button>}</header>
        <div className="fb-body"><h3>{page === "Draft" ? "New draft" : page}</h3>
          {page === "Draft" ? <textarea aria-label="Message" placeholder="Write a message…" /> : <>
            {(page === "Inbox" ? !archived : archived) && <div className="fb-mail"><span className="fb-initial">M</span><div><strong>Mira Chen</strong><p>Saturday’s itinerary</p></div>
              {page === "Inbox" ? <button ref={archive} onClick={store}><Archive size={18} />Archive</button> : <button onClick={() => restore()}>Restore</button>}</div>}
            {page === "Inbox" && <div className="fb-mail"><span className="fb-initial">J</span><div><strong>Jules Park</strong><p>Train tickets</p></div></div>}
            {page === "Archive" && !archived && <p>No archived messages.</p>}
          </>}
          <p role="status">{notice}</p>
        </div>
        {page === "Inbox" && <>
          {archived && <div className="fb-snack" data-clear={side === "do"} data-large={large}><span>Message moved to the archive folder.</span><button ref={undo} data-receiver="Undo" onClick={e => { record(e, "Undo"); restore(); }}>Undo</button></div>}
          <button ref={compose} data-receiver="Compose" className="fb-compose" aria-label="Compose" onClick={e => { record(e, "Compose"); open("Draft"); }}><Pencil size={24} /></button>
        </>}
      </div><SystemChrome profile="Android" inset={16} />
    </PhoneFrame>
    {replay && <Readout kind="Simulated">Replayed tap at Undo’s center reached {replay}.</Readout>}
    {inspect && <div>{archived && page === "Inbox" && <Readout kind="Measured in this pane">Undo overlaps {overlap} fixture px of Compose vertically.</Readout>}
      <Readout kind="Measured in this pane">{trial.trials.at(-1)?.action ? "Last tap activated " + trial.trials.at(-1)?.action + "." : "No Undo or Compose tap recorded."}</Readout></div>}
  </>;
}

export function FeedbackComparison({ rule }: { rule: Rule }) {
  const price = rule.id === "mobile-24", bag = rule.id === "mobile-25";
  const [inspect, setInspect] = useState(false), [haptics, setHaptics] = useState(false), [large, setLarge] = useState(false);
  const [nearTop, setNearTop] = useState(false), [leftHand, setLeftHand] = useState(false);
  const [scale, setScale] = useState("Fit"), [card, setCard] = useState(324);
  const [generation, setGeneration] = useState(0);
  const replayDo = useRef<() => void>(null), replayDont = useRef<() => void>(null);
  const replayBoth = () => { replayDo.current?.(); replayDont.current?.(); };
  function reset() {
    setGeneration(v => v + 1); setInspect(false); setHaptics(false); setLarge(false); setNearTop(false); setLeftHand(false); setScale("Fit");
  }
  return <MobileComparison rule={rule} reset={reset} exampleChanged={haptics || nearTop || large}
    controls={<>{price ? <button className="cmp-ctl" onClick={replayBoth}>Replay drag to ${priceTarget}</button>
      : bag ? <button className="cmp-ctl" aria-pressed={haptics} onClick={() => setHaptics(!haptics)}>Simulated haptics {haptics ? "on" : "off"}</button>
        : <><button className="cmp-ctl" onClick={replayBoth}>Replay tap on Undo</button>
          <button className="cmp-ctl" aria-pressed={large} onClick={() => setLarge(!large)}>Enlarge message</button></>}
      <button className="cmp-ctl" aria-pressed={inspect} onClick={() => setInspect(!inspect)}>Inspect</button></>}
    inspect={price && inspect && <div className="mf-options">
      <button className="cmp-ctl" aria-pressed={leftHand} onClick={() => setLeftHand(!leftHand)}>Left hand</button>
      <button className="cmp-ctl" aria-pressed={nearTop} onClick={() => setNearTop(!nearTop)}>Near top inset</button>
      <ScaleControl mode={scale} setMode={setScale} card={card} setCard={setCard} /></div>}
    render={side => price ? <PricePane key={generation} side={side} inspect={inspect} nearTop={nearTop} leftHand={leftHand}
      calibrated={scale === "Calibrated"} scale={scale === "Fit" ? undefined : scale === "Logical 1:1" ? 1 : calibratedScale(card)} replayRef={side === "do" ? replayDo : replayDont} />
      : bag ? <BagPane key={generation} side={side} inspect={inspect} haptics={haptics} /> : <InboxPane key={generation} side={side} inspect={inspect} large={large} replayRef={side === "do" ? replayDo : replayDont} />} />;
}
