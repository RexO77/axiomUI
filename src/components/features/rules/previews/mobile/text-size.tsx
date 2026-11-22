"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import type { Variant } from "@/components/features/rules/preview-primitives";
import { CreditCard, Inbox } from "@/components/ui/icons";
import type { Rule } from "@/data/ui-logic";
import { MobileComparison } from "./kit/comparison";
import { PhoneFrame, Readout } from "./kit/frame";
import { fixtureUnit } from "./kit/geometry";
import { TypeSizeControl } from "./kit/type-size";
import { paymentRow, pickup, typeMetrics, type Platform } from "./text-size-still";
import "./keyboard-text.css";

function TypePane({ side, rows, large, platform, inspect }: {
  side: Variant; rows: boolean; large: boolean; platform: Platform; inspect: boolean;
}) {
  const name = useId();
  const sample = useRef<HTMLSpanElement>(null);
  const [measurement, setMeasurement] = useState({ size: 0, line: 0, height: 0, lines: 0, clipped: 0 });
  const [payment, setPayment] = useState("personal");
  const metrics = typeMetrics(platform, large && (rows || side === "do"));
  const host = platform === "Browser" ? "Browser" : "App";
  const profile = platform === "Android" ? "Android" : "iOS";
  const unit = fixtureUnit(host, profile);
  useLayoutEffect(() => {
    const text = sample.current;
    if (!text) return;
    const row = text.closest("label");
    function measure() {
      if (!text || !text.getBoundingClientRect().width) return;
      const style = getComputedStyle(text);
      const line = parseFloat(style.lineHeight);
      const height = row?.clientHeight ?? text.offsetHeight;
      const range = document.createRange();
      range.selectNodeContents(text);
      const lines = new Set(Array.from(range.getClientRects(), r => r.top)).size;
      const clipped = row ? Math.max(0, text.offsetTop + lines * line - height) : 0;
      setMeasurement({ size: parseFloat(style.fontSize), line, lines, height, clipped });
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(text);
    if (row) observer.observe(row);
    return () => observer.disconnect();
  }, [metrics.fontSize, metrics.lineHeight]);
  return <>
    <PhoneFrame size={{ width: 390, height: 540 }} profile={profile} host={host}>
      <div className="mtype-content">
        <header className="mk-top">{rows ? <CreditCard /> : <Inbox />}{rows ? "Checkout" : "Parcel post"}</header>
        <div className="mk-section">
          <small>{rows ? "Payment method" : "Delivery update"}</small><h3>{rows ? "Bill to" : "Ready for pickup"}</h3>
          {rows ? <fieldset className="mtype-pay"><legend className="sr-only">Billing account</legend>
            {["personal", "business"].map(account => {
              const business = account === "business";
              const fixed = side === "dont" && business;
              return <label key={account} className="mtype-row" data-selected={account === payment}
                style={{ minHeight: paymentRow.minimum, height: fixed ? paymentRow.minimum : undefined }}>
                <input type="radio" name={name} value={account} checked={payment === account} onChange={() => setPayment(account)} />
                <span ref={business ? sample : undefined} style={{ ...metrics, lineHeight: metrics.lineHeight + "px", width: paymentRow.column }}>
                  {business ? paymentRow.label : "Personal"}
                </span>
              </label>;
            })}
          </fieldset> : <div className="mtype-letter"><span ref={sample} style={{ fontSize: metrics.fontSize, lineHeight: metrics.lineHeight + "px" }}>{pickup}</span></div>}
        </div>
      </div>
    </PhoneFrame>
    <p className="mf-result" role="status">{rows ? (payment === "business" ? "Business account selected. " : "Personal account selected. ")
      + (measurement.clipped ? "The last line is cut off." : "The full label fits.") : large ? `Sample text · ${measurement.size || metrics.fontSize} ${unit}` : `Choose ${platform === "iOS" ? "AX5" : "200%"} in Text size to enlarge the message.`}</p>
    {inspect && <div className="mf-inspection">
      <Readout kind="Measured in this pane">Text {measurement.size} · line height {measurement.line} CSS px · {measurement.lines} lines.</Readout>
      {rows && <Readout kind="Measured in this pane">Row interior {measurement.height} CSS px · {measurement.clipped} CSS px of line boxes clipped.</Readout>}
      <Readout kind="Modelled">{platform === "iOS" ? "iOS Body" : platform === "Android" ? "Android 14 sp conversion" : "Browser text resize"} · {metrics.fontSize} / {metrics.lineHeight} {unit}.</Readout>
    </div>}
  </>;
}

export function TextSizeComparison({ rule }: { rule: Rule }) {
  const rows = rule.id === "mobile-23";
  const initial: Platform = rows ? "Android" : "iOS";
  const [platform, setPlatform] = useState<Platform>(initial);
  const [large, setLarge] = useState(rows);
  const [inspect, setInspect] = useState(false);
  const [version, setVersion] = useState(0);
  return <MobileComparison rule={rule} exampleChanged={platform !== initial || (rows && !large)}
    controls={<><label>Profile <select value={platform} onChange={e => setPlatform(e.target.value as Platform)}>
      <option>iOS</option><option>Android</option><option>Browser</option>
    </select></label>
      <TypeSizeControl profile={platform === "Android" ? "Android" : "iOS"} host={platform === "Browser" ? "Browser" : "App"} enlarged={large} change={setLarge} />
      <button className="cmp-ctl" type="button" aria-pressed={inspect} onClick={() => setInspect(!inspect)}>Inspect</button>
    </>} reset={() => { setLarge(rows); setPlatform(initial); setInspect(false); setVersion(n => n + 1); }}
    render={side => <TypePane key={version} side={side} rows={rows} large={large} platform={platform} inspect={inspect} />} />;
}
