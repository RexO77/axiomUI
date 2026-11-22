// Server-safe: no hooks and no "use client", so the wall renders this still
// on the server and never ships the interactive demo with it.

import type { Variant } from "@/components/features/rules/preview-primitives";
import { Check, Pencil, TouchInteraction } from "@/components/ui/icons";
import { boxStyle } from "./kit/geometry";
import { priceGeometry, priceTarget } from "./kit/feedback-geometry";
import "./mobile.css";
import "./feedback.css";

const bars = [2, 3, 3, 5, 4, 6, 7, 8, 6, 9, 8, 7, 5, 6, 5, 4, 3, 4, 2, 1];
export function PriceDrawing({ value, side, leftHand = false, nearTop = false, holding }: {
  value: number; side: Variant; leftHand?: boolean; nearTop?: boolean; holding: boolean;
}) {
  const { point, bubble, pad } = priceGeometry(value, side, leftHand, nearTop);
  return <div className="fb-drawing" aria-hidden="true">
    {!nearTop && <div className="fb-bars">{bars.map((n, i) => <i key={i} style={{ height: n * 6 }} data-filled={i * 5 <= value} />)}</div>}
    <div className="fb-track" style={{ top: point.y - 2 }}><i style={{ width: value + "%" }} /></div>
    <i className="fb-knob" style={{ left: point.x, top: point.y }} />
    <b className="fb-price" style={boxStyle(bubble)}>${value}</b>
    <div className="fb-axis" style={{ top: point.y + 40 }}><span>$0</span><span>$100</span></div>
    {holding && <div className="fb-pad" style={boxStyle(pad)}><TouchInteraction size={34} /></div>}
  </div>;
}

export function Notebook() {
  return <div className="fb-swatch" aria-hidden="true"><div className="fb-book"><span>Field notes</span><i /></div></div>;
}

export function FeedbackStill({ id, variant }: { id: string; variant: Variant }) {
  return <div className="fb-still" aria-hidden="true">{id === "mobile-24" ? <div className="fb-mini-price"><PriceDrawing value={priceTarget} side={variant} holding /></div>
    : id === "mobile-25" ? <div className="fb-mini-shop"><Notebook /><div><b>Field notebook</b><span className="fb-mini-add">Add to bag</span><span className="fb-confirm">{variant === "do" && <><Check size={14} />1 item in bag</>}</span></div></div>
      : <div className="fb-mini-mail"><div className="fb-snack" data-clear={variant === "do"}><span>Message moved to the archive folder.</span><b>Undo</b></div><i className="fb-compose"><Pencil size={18} /></i></div>}</div>;
}
