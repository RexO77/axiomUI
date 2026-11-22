"use client";

import { useEffect, useState } from "react";
import { calibratedScale, keyboardViewport, type Sample, type SheetState } from "./geometry";
import { Readout } from "./frame";

const key = "axiom.mobile.card-width";
function displayKey() { return [screen.width, screen.height, devicePixelRatio, window.visualViewport?.scale ?? 1].join("/"); }
export function ScaleControl({ mode, setMode, card, setCard }: {
  mode: string; setMode: (v: string) => void; card: number; setCard: (v: number) => void;
}) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const record = JSON.parse(localStorage.getItem(key) ?? "null");
        if (record?.display === displayKey() && Number.isFinite(record.width) && record.width >= 160 && record.width <= 640) {
          setCard(record.width); setSaved(true);
        }
      } catch { /* Calibration also works for this visit. */ }
    });
    return () => cancelAnimationFrame(frame);
  }, [setCard]);
  useEffect(() => {
    let display = displayKey();
    const check = () => {
      const next = displayKey();
      if (next !== display) { setMode("Fit"); setSaved(false); display = next; }
    };
    window.addEventListener("resize", check); window.visualViewport?.addEventListener("resize", check);
    return () => { window.removeEventListener("resize", check); window.visualViewport?.removeEventListener("resize", check); };
  }, [setMode]);
  return <div className="mf-calibration">
    <label>Display scale <select value={mode} onChange={e => setMode(e.target.value)}>
      <option>Fit</option><option>Logical 1:1</option><option>Calibrated</option></select></label>
    {mode === "Calibrated" && <>
      <p>Match the line to the long edge of a card (85.60 mm). The reference profile is 460 pixels per inch at 3×.</p>
      <div className="mf-ruler-scroll"><div className="mf-ruler" style={{ width: card }} /></div>
      <label>Card width <input type="range" min="160" max="640" value={card} onChange={e => { setCard(+e.target.value); setSaved(false); }} /> {card} CSS px</label>
      <button type="button" className="cmp-ctl" onClick={() => {
        try { localStorage.setItem(key, JSON.stringify({ width: card, display: displayKey() })); setSaved(true); } catch { setSaved(false); }
      }}>Save calibration</button>
      <button type="button" className="cmp-ctl" onClick={() => { try { localStorage.removeItem(key); } catch {} setCard(324); setMode("Fit"); setSaved(false); }}>Clear calibration</button>
      <p>{saved ? "Saved for this display" : "Current visit"} · render scale {calibratedScale(card).toFixed(2)}×</p>
    </>}
  </div>;
}
export function KeyboardLayer({ height, policy = "visual", numeric = false, returnKey = "Send", software = true }: {
  height: number; policy?: Parameters<typeof keyboardViewport>[1]; numeric?: boolean; returnKey?: string; software?: boolean;
}) {
  const bounds = keyboardViewport(height, policy, software);
  if (!bounds.keyboardHeight) return null;
  return <div aria-hidden="true" className="mf-keyboard" style={{ height: bounds.keyboardHeight }}>
    {(numeric ? ["123", "456", "789", "0"] : ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"]).map(row =>
      <div key={row}>{[...row].map(k => <span key={k}>{k}</span>)}</div>)}
    <div><span>{returnKey}</span></div>
  </div>;
}
export function SheetLayer({ state, children }: { state: SheetState; children: React.ReactNode }) {
  return <div className="mf-sheet" style={{ height: state.detent }}><div className="mf-grabber" aria-hidden="true" />{children}</div>;
}
/** Apply each scripted sample through the scene's live transition. Advance is untimed. */
export function PathReplay({ samples, dispatch, reset }: {
  samples: readonly Sample[]; dispatch: (sample: Sample) => void; reset: () => void;
}) {
  const [index, setIndex] = useState(0);
  return <div className="mf-controls">
    <button className="cmp-ctl" type="button" disabled={index === samples.length} onClick={() => { dispatch(samples[index]); setIndex(index + 1); }}>Next event</button>
    <button className="cmp-ctl" type="button" onClick={() => { reset(); setIndex(0); }}>Restart path</button>
    <Readout kind="Simulated">Event {index} of {samples.length}</Readout>
  </div>;
}
