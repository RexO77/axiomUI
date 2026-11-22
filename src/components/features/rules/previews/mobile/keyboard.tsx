"use client";

import { useEffect, useRef, useState } from "react";
import type { Variant } from "@/components/features/rules/preview-primitives";
import { Inbox, MessageCircle, Send } from "@/components/ui/icons";
import type { Rule } from "@/data/ui-logic";
import { routes } from "@/lib/navigation/routes";
import { MobileComparison } from "./kit/comparison";
import { boxStyle, PhoneFrame, Readout, SystemChrome } from "./kit/frame";
import { windows } from "./kit/geometry";
import { KeyboardLayer } from "./kit/inspection";
import { composerGeometry, fieldSizes, focusScale, type KeyboardShape, type ResizePolicy } from "./kit/keyboard-fields";
import "./keyboard-text.css";

const size = windows.portrait;

function Address({ side, active, value, edit, focus, blur }: {
  side: Variant; active: boolean; value: string; edit: (s: string) => void; focus: () => void; blur: () => void;
}) {
  return <div className="mk-address" style={{ transform: `scale(${focusScale(side, active)})` }}>
    <header className="mk-top"><Inbox /> Parcel post</header>
    <div className="mk-section"><small>Shipping address</small><h3>Where to?</h3>
      <div className="mk-address-card"><span>Street address</span><strong>12 Garden Lane</strong><span>City</span><strong>London</strong></div>
      <label className="mk-postcode">Postcode<input autoComplete="postal-code" value={value} onChange={e => edit(e.target.value)}
        onFocus={focus} onBlur={blur} style={{ fontSize: fieldSizes[side] }} /></label>
    </div>
  </div>;
}

function KeyboardPane({ side, postcode, active, raise, lower, inspect, policy, shape }: {
  side: Variant; postcode: boolean; active: boolean; raise: () => void; lower: () => void;
  inspect: boolean; policy: ResizePolicy; shape: KeyboardShape;
}) {
  const [value, setValue] = useState(postcode ? "NW1 6XE" : "I’m at the side entrance.");
  const [sent, setSent] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [scaleLog, setScaleLog] = useState<Record<string, number | undefined>>({});
  const [measured, setMeasured] = useState("");
  const frame = useRef<HTMLDivElement>(null);
  const typing = useRef<HTMLTextAreaElement>(null);
  const scaleStage = useRef<"Focus" | "Blur" | null>(null);
  const beforeFocus = useRef<number | undefined>(undefined);
  const shot = useRef<number>(0);
  const { bounds, composer, keyboard, covered } = composerGeometry(side, active, policy, shape);
  const scale = focusScale(side, active);
  useEffect(() => {
    if (!postcode) return;
    const viewport = window.visualViewport;
    function sample() {
      const stage = scaleStage.current;
      if (stage !== "Focus") beforeFocus.current = viewport?.scale;
      if (stage) setScaleLog(previous => ({ ...previous, [stage]: viewport?.scale }));
    }
    sample();
    viewport?.addEventListener("resize", sample);
    return () => { viewport?.removeEventListener("resize", sample); cancelAnimationFrame(shot.current); };
  }, [postcode]);
  useEffect(() => {
    const glass = frame.current?.querySelector<HTMLElement>(".mf-glass");
    if (!inspect || !glass) return;
    function measure() {
      if (!glass || !glass.offsetWidth) return;
      const field = glass.querySelector("input, textarea")!;
      const button = glass.querySelector("button");
      const rect = glass.getBoundingClientRect();
      const ratio = rect.width / size.width;
      setMeasured(button && ratio ? `Send ends at y=${Math.round((button.getBoundingClientRect().bottom - rect.top) / ratio)} CSS px.`
        : `Computed field size ${getComputedStyle(field).fontSize}.`);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(glass);
    measure();
    return () => observer.disconnect();
  }, [inspect, composer.y, postcode, scale]);

  function recordScale(stage: "Focus" | "Blur") {
    scaleStage.current = stage;
    if (stage === "Focus") {
      const baseline = beforeFocus.current;
      setScaleLog({ Before: baseline });
    }
    cancelAnimationFrame(shot.current);
    shot.current = requestAnimationFrame(() => {
      const sample = window.visualViewport?.scale;
      if (stage === "Blur") beforeFocus.current = sample;
      setScaleLog(previous => ({ ...previous, [stage]: sample }));
    });
  }
  return <>
    <div className="mk-frame" ref={frame} onPointerDownCapture={e => {
      if (postcode && e.target instanceof HTMLInputElement && document.activeElement !== e.target) beforeFocus.current = window.visualViewport?.scale;
    }} onKeyDown={e => {
      if (active && e.key === "Escape") {
        e.stopPropagation(); e.currentTarget.closest<HTMLElement>(".cmp-canvas")?.focus({ preventScroll: true }); lower();
      }
    }}>
      <PhoneFrame size={size} profile="iOS" host="Browser">
        {postcode ? <Address side={side} active={active} value={value} edit={setValue}
          focus={() => { raise(); recordScale("Focus"); }}
          blur={() => { lower(); recordScale("Blur"); }} /> : <>
          <header className="mk-top"><MessageCircle /> Dispatch</header>
          <div className="mk-section"><small>Delivery chat</small><h3>Alex Morgan</h3>
            <p className="mk-chat">I’m outside with your parcel. Where should we meet?</p>
            {sent && <p className="mk-chat mk-sent">{sent}</p>}
          </div>
          <form className="mk-compose" style={boxStyle(composer)} onSubmit={e => {
            e.preventDefault();
            if (!value.trim()) return;
            setSent(value); setValue(""); setBlocked(false); typing.current?.focus({ preventScroll: true });
          }}>
            <textarea ref={typing} aria-label="Message" value={value} placeholder="Message Alex" rows={2} onFocus={raise}
              onChange={e => { setValue(e.target.value); setBlocked(false); }} />
            <button type="submit" disabled={!value.trim()}><Send aria-hidden="true" /> Send</button>
          </form>
        </>}
        <SystemChrome profile="iOS" />
        {active && (postcode || keyboard.height > 0) && <div className="mk-keys" style={postcode ? undefined : boxStyle(keyboard)}
          onPointerDown={e => { e.preventDefault(); if (covered && !postcode) setBlocked(true); }}>
          <KeyboardLayer height={postcode ? size.height : keyboard.height} returnKey={postcode ? "Done" : "Return"} />
        </div>}
      </PhoneFrame>
    </div>
    <p className="mf-result" role="status">{postcode ? active ? `Modelled crop · ${Math.round(scale * 100)}%` : "Focus the postcode to edit it."
      : blocked && covered ? "The keyboard received that tap." : sent && !value ? "Message sent." : covered ? "The keyboard covers the draft and Send."
      : active ? "The draft and Send are visible." : "Edit the last line, then press Send."}</p>
    {inspect && <div className="mf-inspection">
      {measured && <Readout kind="Measured in this pane">{measured}</Readout>}
      {postcode ? <>
        <Readout kind="Modelled">Focus crop uses 16 ÷ {fieldSizes[side]}. Pinch zoom stays available.</Readout>
        <Readout kind="Measured in this pane">Page viewport scale · {["Before", "Focus", "Blur"].map(stage => stage + " " + (scaleLog[stage]?.toFixed(2) ?? "—")).join(" · ")}</Readout>
      </> : <Readout kind="Simulated">Layout {bounds.layoutHeight} · visual {bounds.visualHeight} · offset {bounds.offset} CSS px.
        {keyboard.height ? ` Keyboard begins at y=${keyboard.y}.` : " No software keyboard."}</Readout>}
    </div>}
  </>;
}

export function KeyboardComparison({ rule }: { rule: Rule }) {
  const postcode = rule.id === "mobile-20";
  const [active, setActive] = useState(false);
  const [inspect, setInspect] = useState(false);
  const [policy, setPolicy] = useState<ResizePolicy>("visual");
  const [shape, setShape] = useState<KeyboardShape>("Docked");
  const [version, setVersion] = useState(0);
  return <MobileComparison rule={rule} exampleChanged={policy !== "visual" || shape !== "Docked"}
    reset={() => { setVersion(n => n + 1); setActive(false); setInspect(false); setPolicy("visual"); setShape("Docked"); }}
    controls={<>
      <button type="button" className="cmp-ctl" aria-pressed={active} onClick={() => setActive(!active)}>{postcode ? "Simulate focus" : "Raise keyboard"}</button>
      <button type="button" className="cmp-ctl" aria-pressed={inspect} onClick={() => setInspect(!inspect)}>Inspect</button>
    </>} inspect={inspect && <div className="mf-options">
      {!postcode && <>
        <label>Resize policy <select disabled={shape !== "Docked"} value={shape === "Floating" ? "overlay" : policy} onChange={e => setPolicy(e.target.value as ResizePolicy)}>
          <option value="visual">Visual only</option><option value="layout">Layout and visual</option><option value="overlay">Overlay</option>
        </select></label>
        <label>Keyboard <select value={shape} onChange={e => setShape(e.target.value as KeyboardShape)}>
          <option>Docked</option><option>Floating</option><option>Hardware</option>
        </select></label>
      </>}
      <nav className="mf-primer" aria-label="Prerequisite"><a href={routes.ruleHref("form-14")}>Field purpose and keyboard hints</a></nav>
    </div>} render={side => <KeyboardPane key={version} side={side} postcode={postcode} active={active}
      raise={() => setActive(true)} lower={() => setActive(false)} policy={policy} shape={shape} inspect={inspect} />} />;
}
