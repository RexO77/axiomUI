"use client";

import { useEffect, useImperativeHandle, useRef, useState, type MouseEvent, type PointerEvent, type Ref } from "react";
import { ArrowLeft, ArrowUpRight, FileText, Heart, Inbox, X } from "@/components/ui/icons";
import type { Rule } from "@/data/ui-logic";
import type { Variant } from "@/components/features/rules/preview-primitives";
import { routes } from "@/lib/navigation/routes";
import { MobileComparison } from "./kit/comparison";
import { PhoneFrame, SystemChrome, HitOutline, Fingertip, Readout, boxStyle } from "./kit/frame";
import { calibratedScale, contains, windows, type Size, type Point } from "./kit/geometry";
import { ScaleControl } from "./kit/inspection";
import { useTapRecorder, classify } from "./kit/taps";
import { CoastPrint } from "./touch-still";
import { center, closeBox, cornerMetrics, cornerSamples, doubleTapWait, pressPath, reachGeometry } from "./kit/touch-geometry";
import "./mobile.css";
import "./touch.css";

type Command = "try" | "step" | "scatter";
type Pane = { side: Variant; inspect: boolean; replay: Ref<(cmd: Command) => void> };
type PressKind = "scroll" | "tap" | "cancel";

function Chrome() { return <SystemChrome profile="iOS" inset={34} />; }

function credit(e: MouseEvent<HTMLElement>, recorder: ReturnType<typeof useTapRecorder>, action: string) {
  if (e.detail && "pointerId" in e.nativeEvent) recorder.commit(Number(e.nativeEvent.pointerId), action);
}

function TrialResult({ recorder, timedActions, pending }: {
  recorder: ReturnType<typeof useTapRecorder>; timedActions?: Record<number, string>; pending?: number | null;
}) {
  const trial = recorder.trials.at(-1);
  const last = trial && timedActions?.[trial.sequence] ? { ...trial, action: timedActions[trial.sequence] } : trial;
  if (!last) return <Readout kind="Measured in this pane">No personal taps yet.</Readout>;
  const point = (p: Point) => Math.round(p.x) + ", " + Math.round(p.y);
  return <Readout kind="Measured in this pane">Personal trial {recorder.trials.length} · {last.sequence === pending ? "Pending" : classify(last)}.
    {" "}{last.down.pointerType} #{last.down.pointerId} · down ({point(last.down.point)}) → {last.canceled ? "cancel" : "up"} ({point(last.end.point)}) CSS px.
    {" "}Intended {last.intended ?? "none"} · receiver {last.end.receiver ?? "none"} · action {last.action ?? "none"}.</Readout>;
}

function CornerPane({ side, inspect, replay, scale }: Pane & { scale?: number }) {
  const size = windows.portrait;
  const box = closeBox(size, side === "do");
  const origin = center(box);
  const sample = { x: origin.x + cornerMetrics.offset, y: origin.y };
  const [open, setOpen] = useState(true);
  const [scatter, setScatter] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState("Try Close, or replay a tap beside its center.");
  const recorder = useTapRecorder(size, open ? "Close" : null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const reopenButton = useRef<HTMLButtonElement>(null);
  const offsets = cornerSamples(box);
  function close(keyboard = false) {
    setOpen(false); setMessage("Closed. You’re back in the notebook.");
    if (keyboard) requestAnimationFrame(() => reopenButton.current?.focus({ preventScroll: true }));
  }
  useImperativeHandle(replay, () => cmd => {
    if (cmd === "scatter") { setOpen(true); setScatter(v => !v); return; }
    setScatter(false); setAttempts(n => n + 1);
    if (contains(box, sample)) close();
    else { setOpen(true); setMessage("Missed Close. The note is still open."); }
  });
  return <>
    <PhoneFrame profile="iOS" host="Browser" size={size} inset={34} scale={scale} events={{
      onPointerDownCapture: recorder.begin, onPointerUpCapture: e => recorder.end(e), onPointerCancelCapture: e => recorder.end(e, true),
      onClick: e => { if (open && e.detail && !(e.target as Element).closest("button")) setMessage("Missed Close. The note is still open."); },
    }}>
      <div className="mt-screen"><header><FileText />Field notebook</header><div className="mt-body">
        <span className="mt-meta">{open ? "Survey note" : "Collection"}</span>
        <h3>{open ? "North inlet" : "Coastal notes"}</h3>
        <CoastPrint />
        {!open && <button ref={reopenButton} className="mt-pill" onClick={e => {
          setOpen(true); setMessage("The note is open. Try Close again.");
          if (!e.detail) requestAnimationFrame(() => closeButton.current?.focus({ preventScroll: true }));
        }}>Reopen note</button>}
      </div></div>
      {open && <>
        <button ref={closeButton} className="mt-close" aria-label="Close" data-receiver="Close" style={boxStyle(box)}
          onClick={e => { credit(e, recorder, "Close"); close(!e.detail); }}><X size={24} /></button>
        <button className="mt-reference" aria-label="Like note" data-receiver="Like" style={boxStyle({
          x: (size.width - cornerMetrics.reference) / 2, y: (size.height - cornerMetrics.reference) / 2, width: cornerMetrics.reference, height: cornerMetrics.reference,
        })} onClick={e => { credit(e, recorder, "Like"); setMessage("Like received the tap. The note is still open."); }}><Heart size={24} /></button>
      </>}
      <Chrome />
      {inspect && open && <HitOutline box={box} />}
      {scatter && offsets.map((p, i) => <i key={i} aria-hidden="true" className="mt-dot" data-miss={!p.hit} style={{ left: p.x, top: p.y }} />)}
      {attempts > 0 && !scatter && <i aria-hidden="true" className="mf-tap-mark" style={{ left: sample.x, top: sample.y }} />}
    </PhoneFrame>
    <p className="mf-result" role="status">{message}</p>
    {scatter && <Readout kind="Modelled">{offsets.filter(p => p.hit).length}/{offsets.length} inside Close · seed {cornerMetrics.seed} · uniform offsets within ±32 CSS px on each axis.</Readout>}
    {inspect && <div className="mt-metrics"><Readout kind="Simulated">Corner {box.width} × {box.height} CSS px · center reference 48 × 48. Scripted taps {attempts} · offset (+{cornerMetrics.offset}, 0).</Readout><TrialResult recorder={recorder} /></div>}
  </>;
}

function ReachPane({ side, inspect, replay, size, left, pivotHeight, radius, scale }: Pane & {
  size: Size; left: boolean; pivotHeight: number; radius: number; scale?: number;
}) {
  const { box, pivot, inside, distance } = reachGeometry(size, side === "do", left, pivotHeight, radius);
  const [saves, setSaves] = useState(0);
  const [trial, setTrial] = useState<boolean | null>(null);
  const recorder = useTapRecorder(size, "Save");
  useImperativeHandle(replay, () => () => setTrial(inside));
  return <>
    <PhoneFrame size={size} profile="iOS" host="Browser" inset={34} scale={scale} events={{
      onPointerDownCapture: recorder.begin, onPointerUpCapture: e => recorder.end(e), onPointerCancelCapture: e => recorder.end(e, true),
    }}>
      <div className="mt-screen"><header><FileText />Field notebook</header><div className="mt-body">
        <span className="mt-meta">Survey entry</span><h3>North inlet</h3>
        <dl className="mt-table">{[["Location", "East shore"], ["Tide", "Falling"], ["Wind", "Northwest"]].map(([label,value]) =>
          <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      </div></div>
      <i className="mt-arc" aria-hidden="true" style={{ width: radius * 2, height: radius * 2, left: pivot.x - radius, top: pivot.y - radius }} />
      <i className="mt-pivot" aria-hidden="true" style={{ left: pivot.x, top: pivot.y }} />
      <button className="mt-save" style={boxStyle(box)} data-receiver="Save" onClick={e => {
        credit(e, recorder, "Save"); setTrial(null); setSaves(n => n + 1);
      }}>Save</button><Chrome />
    </PhoneFrame>
    <p className="mf-result" role="status">{trial !== null ? trial ? "The modelled thumb reached Save." : "The modelled thumb stopped short of Save." :
      saves ? "Entry saved." : "Try Save with the hand holding your phone."} {saves > 0 && "Saves: " + saves + "."}</p>
    <Readout kind="Modelled">Save is {inside ? "inside" : "outside"} the {left ? "left" : "right"} thumb arc.</Readout>
    {inspect && <div className="mt-metrics"><Readout kind="Modelled">Pivot to Save center {Math.round(distance)} CSS px · radius {radius} CSS px.</Readout><TrialResult recorder={recorder} /></div>}
  </>;
}

const mail = [
  ["Ada", "Harbor map"], ["Lea", "Weather window"], ["Tom", "Mooring list"], ["Jo", "Tide tables"],
  ["Sam", "Survey notes"], ["Lou", "Return crossing"], ["Kit", "East pier"], ["Noor", "Launch time"],
  ["Ari", "Coast path"], ["Mo", "Channel markers"], ["Pia", "Spare lines"], ["Ash", "Buoy survey"],
];
type Phase = "down" | "move" | "up" | "cancel" | "activate";

function PressPane({ side, inspect, replay, path, finger }: Pane & { path: PressKind; finger: boolean }) {
  const list = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  const [opened, setOpened] = useState<number | null>(null);
  const [pressed, setPressed] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [trace, setTrace] = useState<string[]>([]);
  const [scripted, setScripted] = useState(false);
  const [mark, setMark] = useState<Point | null>(null);
  const step = useRef(0);
  const drag = useRef<{ id: number; row: number; start: number; offset: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  function append(event: string) { setTrace(old => [...old, event]); }
  function open(row: number) { setOpened(row); setCount(n => n + 1); append("open"); }
  function transition(phase: Phase, row: number, y: number, id: number, scrollByHand = false) {
    if (phase === "down") {
      drag.current = { id, row, start: y, offset: list.current?.scrollTop ?? 0, moved: false };
      suppressClick.current = side === "dont"; setTrace(["down"]); setPressed(row);
      if (side === "dont") open(row);
      return;
    }
    if (phase === "activate") { if (!suppressClick.current) open(row); return; }
    const current = drag.current;
    if (!current || current.id !== id) return;
    if (phase === "move") {
      if (Math.abs(current.start - y) < 8 && !current.moved) return;
      if (!current.moved) append("move");
      current.moved = true; suppressClick.current = true; setPressed(null);
      if (side === "do" && scrollByHand && list.current) list.current.scrollTop = current.offset + current.start - y;
    } else {
      if (phase === "cancel") suppressClick.current = true;
      append(phase); setPressed(null); drag.current = null;
    }
  }
  function play(cmd: Command) {
    const phases: Phase[] = path === "scroll" ? ["down", "move", "up"] : path === "cancel" ? ["down", "cancel"] : ["down", "up"];
    const row = pressPath.row - 1;
    const startY = 48 + 141 + 88 * (row + 0.5);
    if (cmd !== "step" || step.current >= phases.length) step.current = 0;
    if (!step.current) { setOpened(null); if (list.current) list.current.scrollTop = 0; }
    setScripted(true);
    do {
      const phase = phases[step.current++];
      const y = startY - (path === "scroll" && phase !== "down" ? pressPath.travel : 0);
      setMark({ x: 195, y });
      transition(phase, row, y, -1, true);
      if (phase === "up" && path === "tap") transition("activate", row, y, -1);
    } while (cmd !== "step" && step.current < phases.length);
  }
  useImperativeHandle(replay, () => play);
  function pointer(e: PointerEvent<HTMLDivElement>, phase: Phase) {
    if (!e.isPrimary || (phase === "down" && e.button !== 0)) return;
    const button = (e.target as Element).closest<HTMLButtonElement>("[data-mail]");
    if (phase === "down" && !button) return;
    const row = phase === "down" ? Number(button!.dataset.mail) : drag.current?.row;
    if (row === undefined) return;
    if (phase === "down") {
      button!.setPointerCapture(e.pointerId); setScripted(false); setMark(null); step.current = 0;
    }
    const ratio = e.currentTarget.getBoundingClientRect().width / windows.portrait.width;
    if (phase === "up" && !button?.contains(document.elementFromPoint(e.clientX, e.clientY))) suppressClick.current = true;
    transition(phase, row, e.clientY / ratio, e.pointerId, e.pointerType === "mouse");
  }
  return <>
    <PhoneFrame size={windows.portrait} profile="iOS" host="Browser" inset={34}>
      <div className="mt-screen"><header><Inbox />Harbor post</header>
        <div style={{ padding: "14px 24px", fontSize: 30, fontWeight: 650 }}>Inbox</div>
        <div className="mt-list" ref={list} aria-label="Inbox messages" inert={opened !== null && (scripted || pressed === null)}
          onPointerDown={e => pointer(e, "down")} onPointerMove={e => pointer(e, "move")}
          onPointerUp={e => pointer(e, "up")} onPointerCancel={e => pointer(e, "cancel")}>
          {mail.map(([sender, subject], i) => <button key={subject} className="mt-row" data-mail={i} data-pressed={pressed === i}
            onClick={e => {
              if (!e.detail) { setScripted(false); setTrace(["keyboard"]); open(i); requestAnimationFrame(() => back.current?.focus({ preventScroll: true })); }
              else transition("activate", i, 0, e.nativeEvent instanceof window.PointerEvent ? e.nativeEvent.pointerId : 0);
            }}>
            <span aria-hidden="true" className="mt-avatar">{sender[0]}</span><span><small>{sender}</small><b>{subject}</b></span>
          </button>)}
        </div>
        {opened !== null && <div className="mt-message"><button className="mt-pill mt-secondary" ref={back} onClick={e => {
          const row = opened; setOpened(null); setTrace([]); setMark(null);
          if (!e.detail) requestAnimationFrame(() => list.current?.querySelector<HTMLButtonElement>('[data-mail="' + row + '"]')?.focus({ preventScroll: true }));
        }}><ArrowLeft />Inbox</button><span className="mt-meta">From {mail[opened][0]}</span><h3>{mail[opened][1]}</h3>
          {opened === pressPath.row - 1 && <p>The water turns at half past ten. Meet at the east pier before the tide changes.</p>}</div>}
      </div><Chrome />{finger && mark && <Fingertip point={mark} />}
    </PhoneFrame>
    <p className="mf-result" role="status">{opened === null ? (trace.length ? "Inbox stayed open." : "Scroll up from the fourth message, Tide tables.") : mail[opened][1] + " opened."} Opens: {count}.</p>
    {inspect && <Readout kind={scripted ? "Simulated" : "Measured in this pane"}>{trace.length ? trace.join(" → ") : "No events yet."}
      {scripted && path === "scroll" && " · Scripted travel " + pressPath.travel + " CSS px."}</Readout>}
  </>;
}

function TimingPane({ side, inspect, replay }: Pane) {
  const [state, setState] = useState<"closed" | "waiting" | "open">("closed");
  const [liked, setLiked] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [source, setSource] = useState("Tap");
  const timer = useRef<number | null>(null);
  const back = useRef<HTMLButtonElement>(null);
  const card = useRef<HTMLButtonElement>(null);
  const recorder = useTapRecorder(windows.portrait, state === "open" ? null : "Open");
  const [pendingTrial, setPendingTrial] = useState<number | null>(null);
  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);
  const [timedActions, setTimedActions] = useState<Record<number, string>>({});
  function activate(from: string, keyboard = false, sequence?: number) {
    const start = performance.now();
    setSource(from); setPendingTrial(null);
    if (timer.current !== null) {
      window.clearTimeout(timer.current); timer.current = null;
      if (from === "Tap") {
        if (sequence !== undefined) setTimedActions(old => ({ ...old, [sequence]: "Like" }));
        setLiked(v => !v); setState("closed"); setElapsed(null); setSource("Double tap"); return;
      }
    }
    function open() {
      timer.current = null; setPendingTrial(null); setState("open"); setElapsed(performance.now() - start);
      if (sequence !== undefined) setTimedActions(old => ({ ...old, [sequence]: "Open" }));
      if (keyboard && document.activeElement === card.current) requestAnimationFrame(() => back.current?.focus({ preventScroll: true }));
    }
    if (side === "do") open();
    else { setPendingTrial(sequence ?? null); setElapsed(null); setState("waiting"); timer.current = window.setTimeout(open, doubleTapWait); }
  }
  useImperativeHandle(replay, () => () => activate("Replay"));
  return <>
    <PhoneFrame size={windows.portrait} profile="iOS" host="Browser" inset={34} events={{
      onPointerDownCapture: recorder.begin, onPointerUpCapture: e => recorder.end(e), onPointerCancelCapture: e => recorder.end(e, true),
    }}>
      <div className="mt-screen"><header><FileText />Field notebook</header><div className="mt-body">
        {state === "open" ? <>
          <button ref={back} className="mt-pill mt-secondary" onClick={e => {
            setState("closed"); setElapsed(null);
            if (!e.detail) requestAnimationFrame(() => card.current?.focus({ preventScroll: true }));
          }}><ArrowLeft />Notes</button>
          <h3 style={{ marginTop: 32 }}>North inlet</h3><CoastPrint /><p>The tide has uncovered a second channel along the east shore.</p>
        </> : <><span className="mt-meta">Collection</span><h3>Coastal notes</h3>
          <button className="mt-card" ref={card} data-receiver="Open" aria-label="Open North inlet" onClick={e =>
            activate(e.detail ? "Tap" : "Keyboard", !e.detail, e.detail ? recorder.trials.at(-1)?.sequence : undefined)}>
            <CoastPrint /><strong>North inlet</strong><span className="mt-meta">Open note <ArrowUpRight size={18} /></span>
          </button></>}
        <button className="mt-pill mt-secondary mt-like" data-receiver="Like" aria-label="Like note" aria-pressed={liked} onClick={e => {
          credit(e, recorder, "Like"); setLiked(v => !v);
        }}><Heart size={24} fill={liked ? "currentColor" : "none"} />{liked ? "Liked" : "Like"}</button>
      </div></div><Chrome />
    </PhoneFrame>
    <p className="mf-result" role="status">{state === "waiting" ? "Waiting for a second tap…" : state === "open" ? "North inlet opened." :
      source === "Double tap" ? "Double tap changed Like." : "Open North inlet, then try Like."}</p>
    {inspect && <div className="mt-metrics"><Readout kind="Simulated">Programmed wait {side === "do" ? 0 : doubleTapWait} ms.</Readout>
      {elapsed !== null && <Readout kind="Measured in this pane">{source} handler to Open handler: {elapsed.toFixed(1)} ms.</Readout>}
      <TrialResult recorder={recorder} timedActions={timedActions} pending={pendingTrial} /></div>}
  </>;
}

export function TouchComparison({ rule }: { rule: Rule }) {
  const corner = rule.id === "mobile-3", reach = rule.id === "mobile-4", press = rule.id === "mobile-5";
  const doReplay = useRef<(cmd: Command) => void>(null);
  const dontReplay = useRef<(cmd: Command) => void>(null);
  const [inspect, setInspect] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [left, setLeft] = useState(false);
  const [compact, setCompact] = useState(false);
  const [pivotHeight, setPivotHeight] = useState(136);
  const [radius, setRadius] = useState(265);
  const [path, setPath] = useState<PressKind>("scroll");
  const [finger, setFinger] = useState(false);
  const [scale, setScale] = useState("Fit");
  const [card, setCard] = useState(324);
  const ratio = scale === "Fit" ? undefined : scale === "Logical 1:1" ? 1 : calibratedScale(card);
  function run(cmd: Command) { doReplay.current?.(cmd); dontReplay.current?.(cmd); }
  function reset() {
    setInspect(false); setLeft(false); setCompact(false); setPivotHeight(136); setRadius(265);
    setPath("scroll"); setFinger(false); setScale("Fit"); setGeneration(n => n + 1);
  }
  return <MobileComparison rule={rule} reset={reset} exampleChanged={reach && (left || compact || pivotHeight !== 136 || radius !== 265) || press && path !== "scroll"}
    controls={<>
      {press && <label>Gesture <select value={path} onChange={e => { setPath(e.target.value as PressKind); setGeneration(n => n + 1); }}>
        <option value="scroll">Scroll from row 4</option><option value="tap">Clean tap</option><option value="cancel">Canceled press</option>
      </select></label>}
      <button type="button" className="cmp-ctl" onClick={() => run("try")}>{corner ? "Tap " + cornerMetrics.offset + " px off center" : reach ? "Try modelled reach" : press ? "Replay gesture" : "Replay one tap"}</button>
      {corner && <button type="button" className="cmp-ctl" onClick={() => run("scatter")}>Toggle tap cloud</button>}
      {press && <button type="button" className="cmp-ctl" onClick={() => run("step")}>Next event</button>}
      <button type="button" className="cmp-ctl" aria-pressed={inspect} onClick={() => setInspect(v => !v)}>Inspect</button>
    </>} inspect={inspect && <div className="mf-options">
      {corner && <nav className="mf-primer" aria-label="Touch reading order"><a href={routes.ruleHref("sys-3")}>First: target size</a><a href={routes.ruleHref("a11y-3")}>Next: target spacing</a></nav>}
      {reach && <>
        <label>Hand <select value={left ? "left" : "right"} onChange={e => setLeft(e.target.value === "left")}><option value="right">Right</option><option value="left">Left</option></select></label>
        <label>Display <select value={compact ? "compact" : "tall"} onChange={e => setCompact(e.target.value === "compact")}><option value="tall">390 × 844</option><option value="compact">360 × 640</option></select></label>
        <label>Pivot from base <input type="range" min={68} max={260} value={pivotHeight} onChange={e => setPivotHeight(+e.target.value)} />{pivotHeight} px</label>
        <label>Reach radius <input type="range" min={140} max={360} value={radius} onChange={e => setRadius(+e.target.value)} />{radius} px</label>
      </>}
      {(corner || reach) && <ScaleControl mode={scale} setMode={setScale} card={card} setCard={setCard} />}
      {press && <><a href={routes.ruleHref("motion-8")}>First: pressed feedback</a>
        <label><input type="checkbox" checked={finger} onChange={e => setFinger(e.target.checked)} />Show fingertip on replay</label></>}
      {!corner && !reach && !press && <span>Timing starts in the card handler and ends when the note opens.</span>}
    </div>} render={side => {
      const props = { side, inspect, replay: side === "do" ? doReplay : dontReplay };
      if (corner) return <CornerPane key={generation} {...props} scale={ratio} />;
      if (reach) return <ReachPane key={[generation, left, compact, pivotHeight, radius].join("-")} {...props} scale={ratio} size={compact ? windows.narrow : windows.portrait} left={left} pivotHeight={pivotHeight} radius={radius} />;
      if (press) return <PressPane key={generation} {...props} path={path} finger={finger} />;
      return <TimingPane key={generation} {...props} />;
    }} />;
}
