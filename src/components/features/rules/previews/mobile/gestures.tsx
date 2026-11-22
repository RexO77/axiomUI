"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Rule } from "@/data/ui-logic";
import type { Variant } from "@/components/features/rules/preview-primitives";
import { Archive, ArrowLeft, Heart, Play, Scissors, Share2, Trash2 } from "@/components/ui/icons";
import { MobileComparison } from "./kit/comparison";
import { Readout } from "./kit/frame";
import { screenMetrics, windows, type Sample } from "./kit/geometry";
import { PathReplay } from "./kit/inspection";
import { anchors, clamp, detents, gesturePath, holdTime, pathLabels, photoActions, sheetLanding, useGestureInput,
  type PathName, type Receiver, type ReplayRef } from "./kit/gestures-path";
import "./gestures.css";

const paths = {
  "mobile-12": ["trim"], "mobile-13": ["vertical", "horizontal"],
  "mobile-14": ["hold", "archive"], "mobile-15": ["quick", "slow"],
} as const;
type GestureId = keyof typeof paths;
export function isGestureRule(id: string): id is GestureId { return Object.hasOwn(paths, id); }
type PaneProps = { side: Variant; inspect: boolean; replay: ReplayRef };
const nameOf = (label: string) => label.slice(7, 8).toUpperCase() + label.slice(8);
function Scene({ title, detail, children }: { title: string; detail?: ReactNode; children: ReactNode }) {
  return <div className="gest-card"><header className="gest-head"><strong>{title}</strong>{detail}</header>{children}</div>;
}
// NASA/JPL/USGS PIA00405, Galileo, 7 Dec 1992 (public domain): https://science.nasa.gov/photojournal/earths-moon
function Moon({ className = "" }: { className?: string }) {
  return <div role="img" aria-label="Galileo photograph of the Moon" className={"gest-moon " + className} />;
}
function Film({ trim, right }: { trim: number; right: boolean }) {
  return <div aria-hidden="true" className="gest-film"><i className="gest-cut" style={{ width: trim, [right ? "right" : "left"]: 0 }} /></div>;
}

function TrimPane({ side, inspect, replay, right }: PaneProps & { right: boolean }) {
  const anchor = anchors[side];
  const [trim, setTrim] = useState(0);
  const [back, setBack] = useState(false);
  const [owner, setOwner] = useState("Waiting for drag");
  const start = useRef({ trim: 0, system: false, back: false });
  const direction = right ? -1 : 1;
  const input = useGestureInput(replay, e => {
    if (e.phase === "down") {
      const value = e.source === "replay" ? 0 : trim;
      start.current = { trim: value, system: anchor + value + direction * e.startInset < screenMetrics.edge, back };
      setTrim(value); setBack(false); setOwner("Waiting for movement");
    } else if (e.phase === "cancel") {
      setTrim(start.current.trim); setBack(start.current.back); setOwner("Drag canceled");
    } else if (Math.abs(e.x) > 2) {
      const inward = direction * e.x;
      if (start.current.system && inward > 0) { setBack(true); setOwner("System Back"); }
      else {
        setTrim(clamp(start.current.trim + Math.round(inward), 0, 120));
        setOwner("Trim handle");
      }
    }
  });
  function step(delta: number) {
    setBack(false); setOwner("Trim control"); setTrim(v => clamp(v + delta, 0, 120));
  }
  const remaining = ((240 - trim) / 20).toFixed(1);
  return <>
    <Scene title="Clip editor" detail={<Scissors size={16} />}>
      <div className="gest-monitor">
        <div className="gest-library"><ArrowLeft size={18} /><span>Clips</span></div>
        <Moon className={back ? (right ? "gest-back-right" : "gest-back-left") : ""} />
      </div>
      <div className="gest-meta"><strong>Lunar orbit</strong><span>{remaining} s</span></div>
      <div className="gest-track" data-right={right}><Film trim={anchor + trim} right={right} />
        <i className="gest-edge" style={{ width: screenMetrics.edge }} aria-hidden="true" />
        <div role="slider" aria-label="Clip trim" aria-valuemin={0} aria-valuemax={120} aria-valuenow={trim}
          aria-valuetext={remaining + " seconds remaining"} tabIndex={0} className="gest-trim-handle"
          style={{ [right ? "right" : "left"]: anchor + trim - 16 }} {...input} onKeyDown={e => {
            if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
            e.preventDefault(); e.stopPropagation(); step((e.key === "ArrowRight" ? 1 : -1) * direction * 10);
          }}><i /></div>
      </div>
      <div className="gest-foot"><span>Trim clip</span><button aria-label="Decrease trim" onClick={() => step(-10)}>−</button>
        <button aria-label="Increase trim" onClick={() => step(10)}>+</button></div>
    </Scene>
    <p className="gest-status" role="status">{back ? "Back preview opened. The clip is unchanged." : trim ? remaining + " seconds remain." : "Drag the trim handle inward."}</p>
    {inspect && <Readout kind="Simulated">{screenMetrics.edge}-unit Back region · handle {anchor + trim} units from the {right ? "right" : "left"} edge · {owner}.</Readout>}
  </>;
}

const articleText = [
  ["The southern highlands", "Bright streaks spread from Tycho across the older, darker surface. Slide the divider to compare the contrast."],
  ["The ray system", "Follow the pale lines away from the crater. Some cross the dark plains near the center of the disk."],
  ["Reading the image", "Shadows reveal crater rims most clearly near the boundary between lunar day and night."],
] as const;
function DividerPane({ side, inspect, replay }: PaneProps) {
  const [divider, setDivider] = useState(50);
  const [scroll, setScroll] = useState(0);
  const [status, setStatus] = useState("Swipe up on the photo divider.");
  const article = useRef<HTMLDivElement>(null);
  const picture = useRef<HTMLDivElement>(null);
  const start = useRef({ divider: 50, scroll: 0, axis: "" });
  const input = useGestureInput(replay, e => {
    const el = article.current;
    if (!el) return;
    if (e.phase === "down") {
      if (e.source === "replay") { el.scrollTop = 0; setDivider(50); }
      start.current = { scroll: el.scrollTop, divider: e.source === "replay" ? 50 : divider, axis: "" };
      return;
    }
    if (e.phase === "cancel") { start.current.axis = ""; return; }
    const drag = start.current;
    if (!drag.axis && Math.max(Math.abs(e.x), Math.abs(e.y)) > 4) drag.axis = Math.abs(e.y) > Math.abs(e.x) ? "vertical" : "horizontal";
    if (drag.axis === "horizontal") {
      const width = picture.current?.clientWidth || 1;
      setDivider(clamp(Math.round(drag.divider + e.x / width * 100), 5, 95)); setStatus("Photo divider moved.");
    } else if (drag.axis === "vertical") {
      if (side === "do" && e.source !== "touch") el.scrollTop = drag.scroll - e.y;
      setStatus(side === "do" ? "Article scrolled." : "Article stayed still.");
    }
  });
  return <>
    <Scene title="Field notes" detail={<span>Lunar atlas</span>}>
      <div className="gest-article" ref={article} tabIndex={0} role="region" aria-label="Scrollable lunar article"
        onScroll={e => { const offset = e.currentTarget.scrollTop; setScroll(Math.round(offset)); if (offset > 0) setStatus("Article scrolled."); }}>
        <h3>Reading the Moon</h3>
        <div className="gest-compare-photo" ref={picture}><Moon className="gest-enhanced" />
          <div className="gest-original" style={{ "--gest-after": (100 - divider) + "%" } as CSSProperties} />
          <div role="slider" tabIndex={0} aria-label="Photo divider" aria-valuemin={5} aria-valuemax={95} aria-valuenow={divider}
            className="gest-divider" style={{ left: divider + "%", touchAction: side === "do" ? "pan-y pinch-zoom" : "none" }} {...input}
            onKeyDown={e => {
              if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
              e.preventDefault(); e.stopPropagation(); setDivider(v => clamp(v + (e.key === "ArrowRight" ? 5 : -5), 5, 95));
            }}><i aria-hidden="true">‹ ›</i></div>
        </div>
        {articleText.map(([heading, body]) => <section key={heading}><h4>{heading}</h4><p>{body}</p></section>)}
      </div>
      <div className="gest-foot"><span>Photo divider</span><button onClick={() => setDivider(95)}>Before</button><button onClick={() => setDivider(5)}>After</button></div>
    </Scene>
    <p role="status" className="gest-status">{status}</p>
    {inspect && <Readout kind="Measured in this pane">Article offset {scroll} CSS px · divider {divider}%.</Readout>}
  </>;
}

const actions = { Share: Share2, Favorite: Heart, Delete: Trash2, Archive };
function ActionPane({ side, inspect, replay, row }: PaneProps & { row: boolean }) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [reveal, setReveal] = useState(0);
  const [trace, setTrace] = useState("Waiting for input");
  const surface = useRef<HTMLDivElement>(null);
  const more = useRef<HTMLButtonElement>(null);
  const first = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const began = useRef(0);
  const active = useRef(false);
  function cancel() { clearTimeout(timer.current); active.current = false; }
  useEffect(() => () => clearTimeout(timer.current), []);
  function show(source: string, opener: HTMLElement | null) {
    cancel(); returnTo.current = opener; setOpen(true); setTrace(source); setResult("Actions opened.");
  }
  useLayoutEffect(() => { if (open && returnTo.current) first.current?.focus({ preventScroll: true }); }, [open]);
  function close() {
    setOpen(false); setReveal(0); returnTo.current?.focus({ preventScroll: true });
  }
  const input = useGestureInput(replay, e => {
    if (e.phase === "down") {
      cancel(); active.current = true; began.current = e.time; setReveal(0);
      if (e.source === "replay") { setRemoved(false); setOpen(false); setResult(""); }
      if (!row && e.source !== "replay") timer.current = setTimeout(() => show("Long press", surface.current), holdTime);
      return;
    }
    if (!active.current) return;
    if (e.phase === "cancel" || (row ? Math.abs(e.y) > 20 : Math.hypot(e.x, e.y) > 8)) {
      cancel(); setReveal(0); setTrace("Press canceled"); return;
    }
    if (row) {
      setReveal(clamp(-e.x, 0, 80));
      if (e.phase === "up" && e.x < -40) show("Swipe left", e.source === "replay" ? null : surface.current);
    } else if (e.time - began.current >= holdTime) show("Long press", e.source === "replay" ? null : surface.current);
    if (e.phase === "up") { cancel(); setReveal(0); }
  });
  function choose(action: keyof typeof actions) {
    close();
    if (action === "Favorite") { setFavorite(!favorite); setResult(favorite ? "Removed from favorites." : "Added to favorites."); }
    if (action === "Share") setResult("Photo ready to share.");
    if (action === "Delete" || action === "Archive") { setRemoved(true); setResult(action === "Delete" ? "Photo deleted." : "Photo archived."); }
  }
  return <>
    <Scene title={row ? "Inbox" : "Photo library"} detail={<span>Galileo</span>}>
      <div className="gest-photo-item" onKeyDown={e => {
        if (e.key === "Escape" && open) { e.preventDefault(); e.stopPropagation(); close(); }
      }}>
        {removed ? <div className="gest-empty"><p>{result}</p><button className="cmp-ctl" autoFocus onClick={() => { setRemoved(false); setResult("Photo restored."); }}>Undo</button></div> : <>
          <div className={row ? "gest-message" : "gest-photo-surface"} ref={surface} {...input} role="group" aria-label="Lunar surface photo" onWheel={cancel}
            tabIndex={0} onContextMenu={e => { e.preventDefault(); show("Context menu", surface.current); }}
            onKeyDown={e => {
              if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) { e.preventDefault(); show("Keyboard", surface.current); }
            }} style={{ transform: row && reveal ? 'translateX(-' + reveal + 'px)' : undefined }}>
            <Moon />{row && <strong>Lunar surface</strong>}
          </div>
          <div className="gest-meta"><div><strong>{row ? "Photo attachment" : "Lunar surface"}</strong><small>7 December 1992</small></div>
            {favorite && <Heart aria-label="Favorite" size={16} />}
            {side === "do" && <button ref={more} aria-expanded={open} onClick={() => open ? close() : show("More button", more.current)}>More <span aria-hidden="true">···</span></button>}
          </div>
          {open && <div className="gest-menu" role="group" aria-label="Photo actions">
            {(row ? ["Archive"] as const : photoActions).map((action, i) => {
              const Icon = actions[action];
              return <button key={action} ref={i === 0 ? first : undefined} onClick={() => choose(action)}><Icon size={15} />{action}</button>;
            })}
            <button onClick={close}>Close</button>
          </div>}
        </>}
      </div>
    </Scene>
    <p className="gest-status" role="status">{result || (row ? "Find Archive for the lunar photo." : "Add the lunar photo to favorites.")}</p>
    {inspect && <Readout kind="Simulated">{trace} · {row ? "swipe left to reveal Archive" : holdTime + " ms stationary press opens the actions"}.</Readout>}
  </>;
}

const sheetStage = 288;
function SheetPane({ side, inspect, replay }: PaneProps) {
  const [height, setHeight] = useState<number>(detents.Peek);
  const [stop, setStop] = useState("Peek");
  const [landing, setLanding] = useState<{ release: number; projected: number; speed: number } | null>(null);
  const drag = useRef({ initial: 120, prevY: 0, time: 0, velocity: 0, lastMove: 0 });
  const input = useGestureInput(replay, e => {
    const run = drag.current;
    if (e.phase === "down") {
      const initial = e.source === "replay" ? detents.Peek : height;
      drag.current = { initial, prevY: 0, time: e.time, velocity: 0, lastMove: e.time };
      setHeight(initial); setLanding(null); return;
    }
    if (e.phase === "cancel") { setHeight(run.initial); return; }
    const release = clamp(run.initial - e.y, detents.Peek, detents.Full);
    if (e.y !== run.prevY && e.time > run.time) {
      run.velocity = (run.prevY - e.y) * 1000 / (e.time - run.time); run.lastMove = e.time;
    }
    run.prevY = e.y; run.time = e.time;
    if (e.phase === "move") { setHeight(release); return; }
    const speed = e.time - run.lastMove > 100 ? 0 : run.velocity;
    const settle = sheetLanding(release, speed, side === "do");
    setLanding({ release, projected: settle.projected, speed }); setHeight(settle.height); setStop(settle.name);
  }, windows.portrait.height / sheetStage);
  function select(name: keyof typeof detents) { setHeight(detents[name]); setStop(name); setLanding(null); }
  return <>
    <Scene title="Observation" detail={<span>Galileo</span>}>
      <div className="gest-sheet-stage" style={{ height: sheetStage }}><Moon />
        <div className="gest-sheet" style={{ height: height / windows.portrait.height * 100 + "%" }}>
          <div {...input} className="gest-grip" role="slider" tabIndex={0} aria-label="Details sheet height" aria-valuemin={detents.Peek}
            aria-valuemax={detents.Full} aria-valuenow={Math.round(height)} aria-valuetext={stop} onKeyDown={e => {
              if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) return;
              e.preventDefault(); e.stopPropagation();
              const names = Object.keys(detents) as (keyof typeof detents)[];
              select(names[e.key === "Home" ? 0 : e.key === "End" ? 2 : clamp(names.indexOf(stop as keyof typeof detents) + (e.key === "ArrowUp" ? 1 : -1), 0, 2)]);
            }}><i /><strong>Photo details</strong></div>
          <dl><dt>Subject</dt><dd>Earth’s Moon</dd><dt>Spacecraft</dt><dd>Galileo</dd><dt>Captured</dt><dd>7 Dec 1992</dd></dl>
        </div>
        {inspect && landing && <i className="gest-projection" style={{ bottom: landing.projected / windows.portrait.height * 100 + "%" }} aria-hidden="true" />}
      </div>
      <div className="gest-foot"><span>Sheet stop</span>{(Object.keys(detents) as (keyof typeof detents)[]).map(name =>
        <button key={name} aria-pressed={stop === name} onClick={() => select(name)}>{name}</button>)}</div>
    </Scene>
    <p className="gest-status" role="status">{landing ? "Sheet settled at " + stop.toLowerCase() + "." : "Lift the photo details by the handle."}</p>
    {inspect && <Readout kind="Modelled">Height {Math.round(height)} px{landing && <> · release {Math.round(landing.release)} px · speed {Math.round(landing.speed)} px/s · projected {Math.round(landing.projected)} px</>}.</Readout>}
  </>;
}

export function GestureComparison({ rule }: { rule: Rule }) {
  if (!isGestureRule(rule.id)) return null;
  return <GestureDemo key={rule.id} id={rule.id} rule={rule} />;
}
function GestureDemo({ id, rule }: { id: GestureId; rule: Rule }) {
  const choices = paths[id];
  const [path, setPath] = useState<PathName>(choices[0]);
  const [inspect, setInspect] = useState(false);
  const [right, setRight] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [stepKey, setStepKey] = useState(0);
  const good = useRef<Receiver>(null), bad = useRef<Receiver>(null);
  const sequence = gesturePath(path, right);
  function dispatch(sample: Sample) { good.current?.(sample); bad.current?.(sample); }
  function restart() { setGeneration(n => n + 1); }
  return <MobileComparison rule={rule} exampleChanged={right || path !== choices[0]}
    reset={() => { restart(); setInspect(false); setRight(false); setPath(choices[0]); }}
    controls={<>
      {id === "mobile-12" && <label>Edge <select aria-label="Edge" value={right ? "right" : "left"} onChange={e => { setRight(e.target.value === "right"); restart(); }}>
        <option value="left">Left</option><option value="right">Right</option></select></label>}
      {choices.length > 1 && <label>Gesture <select aria-label="Gesture" value={path} onChange={e => { setPath(e.target.value as PathName); restart(); }}>
        {choices.map(choice => <option key={choice} value={choice}>{nameOf(pathLabels[choice])}</option>)}</select></label>}
      <button type="button" className="cmp-ctl" onClick={() => { sequence.forEach(dispatch); setStepKey(n => n + 1); }}><Play size={14} />{pathLabels[path]}</button>
      <button type="button" className="cmp-ctl" aria-pressed={inspect} onClick={() => setInspect(!inspect)}>Inspect</button>
    </>}
    inspect={inspect && <PathReplay key={generation + "/" + stepKey} samples={sequence} dispatch={dispatch} reset={restart} />}
    render={side => {
      const props = { side, inspect, replay: side === "do" ? good : bad };
      if (id === "mobile-12") return <TrimPane key={generation} {...props} right={right} />;
      if (id === "mobile-13") return <DividerPane key={generation} {...props} />;
      if (id === "mobile-14") return <ActionPane key={generation} {...props} row={path === "archive"} />;
      return <SheetPane key={generation} {...props} />;
    }} />;
}

export function GestureStill({ id, variant }: { id: GestureId; variant: Variant }) {
  const good = variant === "do";
  return <div className="gest-still" data-rule={id} role="img" aria-label={{
    "mobile-12": good ? "Trimmed lunar clip" : "Back preview over the untrimmed clip",
    "mobile-13": good ? "Article scrolled beyond the photo" : "Photo divider still at the top",
    "mobile-14": good ? "More exposes three photo actions" : "Photo has no visible actions",
    "mobile-15": good ? "Photo details at half height" : "Photo details back at peek",
  }[id]}>
    {id === "mobile-12" ? <><div className="gest-monitor"><div className="gest-library">‹ Clips</div><Moon className={good ? "" : "gest-back-left"} /></div>
      <Film trim={anchors[variant] + (good ? 60 : 0)} right={false} /><strong>{good ? "9.0 s remaining" : "Back preview"}</strong></> :
    id === "mobile-13" ? <><div className="gest-still-article" style={{ marginTop: good ? -68 : 0 }}><strong>Reading the Moon</strong>
      <div className="gest-compare-photo"><Moon /><i className="gest-still-divider" /></div><b>The southern highlands</b><p>Bright streaks spread from Tycho.</p></div></> :
    id === "mobile-14" ? <><Moon /><strong>Lunar surface {good && " · More"}</strong>{good && <div className="gest-menu">{photoActions.map(a => <span key={a}>{a}</span>)}</div>}</> :
    <><Moon /><div className="gest-sheet" style={{ height: (good ? detents.Half : detents.Peek) / windows.portrait.height * 100 + "%" }}><i /><b>Photo details</b><p>Earth’s Moon · Galileo</p></div></>}
  </div>;
}
