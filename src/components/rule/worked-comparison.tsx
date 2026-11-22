// design-system: strict
"use client";

import { useEffect, useId, useState, type ReactNode } from "react";

import type { Rule } from "@/data/ui-logic";
import type { Variant } from "@/components/features/rules/preview-primitives";
import { exampleCode, RestaurantReview, TicketChart, type ReportingQuarter } from "@/components/features/rules/previews/reading-examples";
import { DemoCanvas, useDemoAnnotations } from "./measure/demo-annotations";
import { VerdictLabel } from "@/components/ui/verdict-label";

const fieldClass = "min-h-11 min-w-0 rounded-control border border-ink-muted bg-surface px-2 font-mono text-base text-ink";

function CodeEntry({ variant }: { variant: Variant }) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [code, setCode] = useState("");
  const [checked, setChecked] = useState<string | null>(null);
  const value = variant === "do" ? code : digits.join("");
  const label = useId();
  return (
    <form className="grid w-full gap-2" onSubmit={(event) => { event.preventDefault(); setChecked(value); }}>
      {variant === "do" ? (
        <>
          <label htmlFor={label} className="text-sm font-semibold">Verification code</label>
          <input id={label} type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
            className={fieldClass + " w-32 tracking-widest"} value={code} onChange={(event) => { setCode(event.target.value); setChecked(null); }} />
        </>
      ) : (
        <fieldset className="min-w-0">
          <legend className="mb-2 text-sm font-semibold">Verification code</legend>
          <div className="grid max-w-72 grid-cols-6 gap-1">
            {digits.map((digit, index) => (
              <input key={index} type="text" inputMode="numeric" maxLength={1} aria-label={`Digit ${index + 1} of 6`}
                className={fieldClass + " text-center"} value={digit} onChange={(event) => {
                  const next = event.target.value;
                  setDigits((current) => current.map((old, at) => at === index ? next : old));
                  setChecked(null);
                }} />
            ))}
          </div>
        </fieldset>
      )}
      <button type="submit" className="cmp-ctl justify-self-start">Check code</button>
      <p role="status" className="min-h-5 text-xs">
        {checked === null ? "" : checked === exampleCode ? `Received ${checked} · all six digits` : `Received ${checked || "no digits"} · expected ${exampleCode}`}
      </p>
    </form>
  );
}

export function WorkedComparison({ rule }: { rule: Rule }) {
  const [quarter, setQuarter] = useState<ReportingQuarter>("Q1");
  const [rtl, setRtl] = useState(false);
  const uid = useId();
  const annotations = useDemoAnnotations(rule);
  const refresh = annotations.refresh;
  useEffect(() => { refresh(); }, [refresh, rtl, quarter]);
  let control: ReactNode;
  let example: (variant: Variant) => ReactNode;
  switch (rule.id) {
    case "typo-14":
      control = <label className="flex items-center gap-2 text-sm">Review language
        <select className="cmp-ctl" value={rtl ? "he" : "en"} onChange={(event) => setRtl(event.target.value === "he")}>
          <option value="en">English</option><option value="he">Hebrew</option>
        </select>
      </label>;
      example = (variant) => <RestaurantReview variant={variant} rtl={rtl} />;
      break;
    case "comp-13":
      control = <label className="flex items-center gap-2 text-sm">Reporting period
        <select className="cmp-ctl" value={quarter} onChange={(event) => setQuarter(event.target.value === "Q2" ? "Q2" : "Q1")}>
          <option value="Q1">January–March</option><option value="Q2">April–June</option>
        </select>
      </label>;
      example = (variant) => <TicketChart variant={variant} quarter={quarter} interactive />;
      break;
    case "form-13":
      control = <p className="text-sm">Copy{" "}
        <input aria-label="Example code to copy" readOnly value={exampleCode} size={6}
          className="w-[8ch] rounded-control bg-fill p-1 text-center font-mono text-ink"
          onFocus={(event) => event.currentTarget.select()} onClick={(event) => event.currentTarget.select()} />
        {" "}and paste it into the first field on each side.</p>;
      example = (variant) => <CodeEntry variant={variant} />;
      break;
    default:
      return null;
  }
  return (
    <div className={annotations.enabled ? "cmp cmp-annotated" : "cmp"} data-kind="worked">
      <div className="cmp-bar">{control}</div>
      <DemoCanvas annotations={annotations} className="cmp-canvas">
        {(["do", "dont"] as const).map((side) => (
          <figure key={side} className="cmp-pane" data-side={side} aria-labelledby={`${uid}-${side}`} aria-describedby={`${uid}-${side}-caption`}>
            <span className="cmp-pane-label" id={`${uid}-${side}`}><VerdictLabel verdict={side} /></span>
            <div className="w-full max-w-sm" data-measure-root="">{example(side)}</div>
            {annotations.overlay(side)}
          </figure>
        ))}
      </DemoCanvas>
      <div className="cmp-captions">
        {(["do", "dont"] as const).map((side) => (
          <p key={side} id={`${uid}-${side}-caption`}><span className="cmp-cap-v">{side === "do" ? "Do" : "Don’t"}:{" "}</span>{annotations.caption(side)}</p>
        ))}
      </div>
      {annotations.readout}
    </div>
  );
}
