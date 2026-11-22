"use client";

import { useImperativeHandle, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent, type Ref } from "react";
import { routes } from "@/lib/navigation/routes";
import type { Rule } from "@/data/ui-logic";
import type { Variant } from "@/components/features/rules/preview-primitives";
import { Segmented } from "@/components/ui/segmented";
import { MobileComparison } from "./kit/comparison";
import { boxStyle, HitOutline, PhoneFrame, Readout, SystemChrome } from "./kit/frame";
import { calibratedScale, contains, fixtureUnit, initialSheet, insetPresets, intersection, logicalPoint, panelHeight,
  payBox, screenMetrics, windows, type Box, type Host, type Point, type Profile } from "./kit/geometry";
import { KeyboardLayer, ScaleControl, SheetLayer } from "./kit/inspection";
import { classify, useTapRecorder } from "./kit/taps";
import "./mobile.css";

const parts = {
  "Status and cutout": "The system draws the time here. The camera removes part of the usable surface.",
  "Safe area": "The surface can reach the glass. Place the whole action on the usable side of this boundary.",
  "App navigation": "Checkout is the current step. Its title belongs to the app.",
  "Content and viewport": "Layout sets the panel height. The browser toolbar covers the space below the visible edge.",
  "Keyboard": "Focus the delivery note to see how much room the software keyboard takes.",
  "Sheet and detent": "Ticket options rest at this height over checkout. Close returns to the same ticket.",
  "Hit area": "The outline follows the responding button, including the padding around its label.",
} as const;
type Part = keyof typeof parts;
const defaults = (safe: boolean) => ({
  profile: "iOS" as Profile, host: "Browser" as Host, inset: safe ? 34 : 0, toolbar: safe ? 0 : 88,
  landscape: false, dynamic: false, inspect: false, part: null as Part | null, threeButtons: false,
});
type Settings = ReturnType<typeof defaults>;

function Ticket({ compact = false }: { compact?: boolean }) {
  return <div className="mf-ticket" aria-label="One evening ticket to Night garden">
    <div className="mf-print"><span>Botanical gardens</span><strong>Night<br />garden</strong>
      <div className="mf-orbits" aria-hidden="true"><i /><i /><i /><i /></div></div>
    <div className="mf-stub"><span>Evening admission</span><strong>1 ticket</strong></div>
    {!compact && <div className="mf-stub"><span>Entry time</span><strong>19:30</strong></div>}
  </div>;
}

function ScreenPane({ side, safe, settings, scale, replayRef }: {
  side: Variant; safe: boolean; settings: Settings; scale?: number; replayRef: Ref<() => void>;
}) {
  const { profile, host, landscape, inspect, part } = settings;
  const size = landscape ? windows.landscape : windows.portrait;
  const inset = safe ? settings.inset : 0;
  const sideInset = safe && landscape ? screenMetrics.side : 0;
  const toolbar = host === "Browser" ? settings.toolbar : 0;
  const visible = size.height - toolbar;
  const paneSize = { ...size, height: visible };
  const unit = fixtureUnit(host, profile);
  const panel = panelHeight(size.height, side === "dont" ? "vh" : settings.dynamic ? "dvh" : "svh", toolbar, host);
  const action = safe ? "Pay" : "Continue";
  const target: Box = safe ? payBox(paneSize, inset, sideInset, side === "do")
    : { x: 12, y: panel - screenMetrics.action, width: size.width - 24, height: screenMetrics.action };
  const bottomBand: Box = { x: 0, y: visible - inset, width: size.width, height: inset + toolbar };
  const sideBand = { x: 0, y: 0, width: sideInset, height: size.height };
  const blocked = (p: Point) => contains(bottomBand, p) || contains(sideBand, p);
  const panes = [intersection(target, bottomBand), intersection(target, sideBand)];
  const trial = useTapRecorder(size, action);
  const [result, setResult] = useState("");
  const [keyboard, setKeyboard] = useState(false);
  const [sheet, setSheet] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const boundary = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState<{ gap: number; overlap: number; bottom: number } | null>(null);
  useLayoutEffect(() => {
    const el = button.current, bar = boundary.current;
    if (!el || !bar) return;
    function measure() {
      if (!el || !bar) return;
      const r = el.getBoundingClientRect(), b = bar.getBoundingClientRect();
      if (!r.height) return;
      const ratio = target.height / r.height;
      setMeasured({ gap: Math.round((b.top - r.bottom) * ratio), overlap: Math.round((intersection(r, b)?.height ?? 0) * ratio),
        bottom: Math.round((r.bottom - el.parentElement!.getBoundingClientRect().top) * ratio) });
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el); observer.observe(bar); observer.observe(el.closest(".mf-bezel")!);
    return () => observer.disconnect();
  }, [target.y, target.height, target.width, bottomBand.y, bottomBand.height, scale]);
  useLayoutEffect(() => { if (sheet) closeButton.current?.focus({ preventScroll: true }); }, [sheet]);
  const pad = { x: target.x + target.width / 2, y: target.y + target.height - 4 };
  const [replay, setReplay] = useState(0);
  const didReplay = replay > 0;
  function activate(covered: boolean) {
    setResult(covered ? "Tap covered by the simulated bar." : safe ? "Payment received." : "Continued to payment.");
  }
  useImperativeHandle(replayRef, () => () => {
    setReplay(n => n + 1);
    activate(blocked(pad));
  });
  const last = trial.trials.at(-1);
  function closeSheet() { setSheet(false); requestAnimationFrame(() => opener.current?.focus({ preventScroll: true })); }
  function click(event: MouseEvent<HTMLDivElement>) {
    if (event.detail && blocked(logicalPoint({ x: event.clientX, y: event.clientY }, event.currentTarget.getBoundingClientRect(), size))) {
      event.stopPropagation(); event.preventDefault(); activate(true);
    }
  }
  const highlight: Record<Part, Box> = {
    "Status and cutout": { x: 0, y: 0, width: size.width, height: 48 },
    "Safe area": { x: sideInset, y: 48, width: size.width - sideInset, height: Math.max(0, visible - inset - 48) },
    "App navigation": { x: sideInset + 16, y: 52, width: size.width - sideInset - 32, height: 60 },
    "Content and viewport": { x: 0, y: 48, width: size.width, height: visible - 48 },
    "Keyboard": { x: 0, y: size.height - 336, width: size.width, height: 336 },
    "Sheet and detent": { x: 0, y: size.height - 320, width: size.width, height: 320 },
    "Hit area": target,
  };
  return <>
    <PhoneFrame size={size} profile={profile} host={host} scale={scale} inset={inset} sideInset={sideInset}
      events={{ onClickCapture: click, onPointerDownCapture: trial.begin, onPointerCancelCapture: e => trial.end(e, true),
        onPointerUpCapture: e => trial.end(e) }}>
      <div className="mf-panel" style={{ minBlockSize: safe ? visible : panel }}>
        <div className="mf-content" inert={sheet && part === "Sheet and detent"} style={{ paddingLeft: sideInset + 24 }}>
          <header>Ticket office <span>Checkout</span></header>
          <div className="mf-order"><h3>Your ticket</h3><Ticket compact={landscape} />
            <div className="mf-total"><span>Total</span><strong>$24.00</strong></div>
            {part === "Keyboard" && <label>Delivery note <input onFocus={() => setKeyboard(true)} onBlur={() => setKeyboard(false)} /></label>}
            {part === "Sheet and detent" && <button ref={opener} className="cmp-ctl" onClick={() => setSheet(true)}>Ticket options</button>}
          </div>
        </div>
        <button ref={button} className="mf-action" style={{ ...boxStyle(target), top: undefined, bottom: safe ? screenMetrics.gap + (side === "do" ? inset : 0) : 0 }} data-receiver={action} inert={sheet && part === "Sheet and detent"}
          onClick={e => {
            if (e.detail && "pointerId" in e.nativeEvent) trial.commit(Number(e.nativeEvent.pointerId), action);
            activate(false);
          }}>{action}</button>
      </div>
      <div ref={boundary} aria-hidden="true" className="mf-band" style={boxStyle(bottomBand)} />
      <SystemChrome profile={profile} inset={inset} sideInset={sideInset} toolbar={toolbar} inspect={inspect} threeButtons={settings.threeButtons} />
      {panes.map((box, i) => box && <i key={i} aria-hidden="true" className="mf-hatch" style={boxStyle(box)} />)}
      {inspect && <HitOutline box={target} />}
      {part && <i aria-hidden="true" className="mf-part" data-part={part} style={boxStyle(highlight[part])} />}
      {part === "Keyboard" && keyboard && <KeyboardLayer height={size.height} returnKey="Done" />}
      {part === "Sheet and detent" && sheet && <SheetLayer state={{ ...initialSheet, detent: 320, modal: true }}>
        <div role="dialog" aria-modal="true" aria-label="Ticket options" onKeyDown={e => {
          if (e.key === "Escape") { e.stopPropagation(); closeSheet(); }
          if (e.key === "Tab") e.preventDefault();
        }}><h3>Ticket options</h3><p>Evening admission · one guest</p><button ref={closeButton} className="cmp-ctl" onClick={closeSheet}>Close</button></div>
      </SheetLayer>}
      {didReplay && <i className="mf-tap-mark" aria-hidden="true" style={{ left: pad.x, top: pad.y }} />}
    </PhoneFrame>
    <p className="mf-result" role="status">{result || (safe ?
      (panes.some(Boolean) ? "Part of Pay is covered." : "Pay is clear of the bar.") : (target.y >= visible ? "Continue is behind the toolbar." : "Continue is visible."))}</p>
    {inspect && <div className="mf-inspection">
      <Readout kind="Simulated">{profile} · {host} · {safe ? inset + " bottom inset" : "toolbar " + toolbar + " CSS px"}</Readout>
      {measured && <Readout kind="Measured in this pane">Action ends at {measured.bottom} {unit}. {measured.overlap ? measured.overlap + " covered" : measured.gap + " clear"} at the bottom.</Readout>}
      {!safe && <Readout kind="Simulated">Panel {panel} · visible {visible} {unit}</Readout>}
      {last && <Readout kind="Measured in this pane">Trial {trial.trials.length} · {classify(last)} · {last.end.pointerType} #{last.end.pointerId} · down ({Math.round(last.down.point.x)}, {Math.round(last.down.point.y)}) → {last.canceled ? "cancel" : "up"} ({Math.round(last.end.point.x)}, {Math.round(last.end.point.y)}) {unit}. Receiver {last.end.receiver ?? "none"} · action {last.action ?? "none"}.</Readout>}
      {didReplay && <Readout kind="Simulated">Scripted tap {replay} · {Math.round(pad.x)}, {pad.y} {unit}</Readout>}
    </div>}
  </>;
}

export function ScreenComparison({ rule }: { rule: Rule }) {
  const safe = rule.id === "mobile-1";
  const [settings, setSettings] = useState(() => defaults(safe));
  const [generation, setGeneration] = useState(0);
  const doReplay = useRef<() => void>(null);
  const dontReplay = useRef<() => void>(null);
  const [scale, setScale] = useState("Fit");
  const [card, setCard] = useState(324);
  function change(patch: Partial<Settings>) {
    setSettings(old => ({ ...old, ...patch }));
    setGeneration(v => v + 1);
  }
  function reset() { change(defaults(safe)); setScale("Fit"); }
  return <MobileComparison rule={rule} exampleChanged={settings.host !== "Browser" || settings.landscape || (safe ? settings.inset !== screenMetrics.inset : settings.toolbar !== screenMetrics.toolbar || settings.dynamic)} reset={reset} controls={<>
    <div className="mf-device" role="group" aria-label="Device settings">
      <Segmented label="Platform" value={settings.profile} onChange={profile => change({ profile, threeButtons: false })}
        options={[{ value: "iOS", label: "iOS" }, { value: "Android", label: "Android" }]} />
      {safe ? <label>Inset <select value={settings.inset} onChange={e => change({ inset: +e.target.value, threeButtons: false })}>
        {insetPresets.map(v => <option key={v} value={v}>{v}</option>)}</select></label> :
        <label>Browser bar <input aria-label="Browser bar height" type="range" min="0" max="88" value={settings.toolbar}
          disabled={settings.host === "App"} onChange={e => change({ toolbar: +e.target.value })} /></label>}
    </div>
    <div className="mf-actions" role="group" aria-label="Try and inspect">
      <button type="button" className="cmp-ctl" onClick={() => { doReplay.current?.(); dontReplay.current?.(); }}>Try lower edge</button>
      <button type="button" className="cmp-ctl" aria-pressed={settings.inspect} onClick={() => setSettings(old => ({ ...old, inspect: !old.inspect, part: null }))}>Inspect</button>
    </div>
  </>} inspect={settings.inspect && <div className="mf-options">
    <label>Host <select value={settings.host} onChange={e => change({ host: e.target.value as Host, toolbar: e.target.value === "Browser" && !safe ? 88 : 0 })}><option>App</option><option>Browser</option></select></label>
    {safe ? <>
      <button type="button" className="cmp-ctl" aria-pressed={settings.landscape} onClick={() => change({ landscape: !settings.landscape })}>Landscape</button>
      {settings.profile === "Android" && <button className="cmp-ctl" aria-pressed={settings.threeButtons} onClick={() => change({ threeButtons: !settings.threeButtons, inset: settings.threeButtons ? 24 : 48 })}>Three-button navigation</button>}
      <label>Show screen parts <select value={settings.part ?? ""} onChange={e => change({ part: e.target.value as Part || null })}><option value="">Choose a part</option>
        {Object.keys(parts).map(name => <option key={name}>{name}</option>)}</select></label>
      {settings.part && <p>{parts[settings.part]}</p>}
    </> : <label>Opening panel <select value={settings.dynamic ? "dvh" : "svh"} onChange={e => change({ dynamic: e.target.value === "dvh" })}><option>svh</option><option>dvh</option></select></label>}
    {safe && <nav className="mf-primer" aria-label="Mobile prerequisites">Related lessons
      {([["sys-3", "Target size"], ["a11y-3", "Target spacing"], ["motion-8", "Pressed feedback"], ["form-14", "Keyboard hints"]] as const).map(([id, label]) =>
        <a key={id} href={routes.ruleHref(id)}>{label}</a>)}</nav>}
    <ScaleControl mode={scale} setMode={setScale} card={card} setCard={setCard} />
  </div>} render={side => <ScreenPane key={generation} safe={safe} side={side} settings={settings} replayRef={side === "do" ? doReplay : dontReplay}
    scale={scale === "Fit" ? undefined : scale === "Logical 1:1" ? 1 : calibratedScale(card)} />} />;
}

export function ScreenStill({ safe, variant }: { safe: boolean; variant: Variant }) {
  const good = variant === "do";
  const inset = safe ? screenMetrics.inset : screenMetrics.toolbar;
  const y = safe ? payBox(windows.portrait, inset, 0, good).y : panelHeight(844, good ? "svh" : "vh", inset, "Browser") - screenMetrics.action;
  // The still is 166 tall: the browser bar is drawn at 56 and the offset above it shrinks with it, so Continue clears the total.
  const k = safe ? 1 : 56 / screenMetrics.toolbar;
  return <div className="mf-still" aria-hidden="true" style={{ "--mf-still-bottom": (844 - y - screenMetrics.action) * k + "px", "--mf-still-bar": inset * k + "px" } as CSSProperties}>
    <div className="mf-still-total"><span>1 evening ticket</span><strong>$24.00</strong></div>
    <span className="mf-still-action">{safe ? "Pay" : "Continue"}</span>
    <div className="mf-still-bar">{safe ? <i className="mf-home" /> : "tickets.example"}</div>
  </div>;
}
