// Server-safe: no hooks and no "use client", so the wall renders this still
// on the server and never ships the interactive demo with it.

import type { CSSProperties } from "react";
import type { Variant } from "@/components/features/rules/preview-primitives";
import { panelHeight, payBox, screenMetrics, windows } from "./kit/geometry";
import "./mobile.css";

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
