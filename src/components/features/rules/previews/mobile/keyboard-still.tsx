// Server-safe: no hooks and no "use client", so the wall renders this still
// on the server and never ships the interactive demo with it.

import type { Variant } from "@/components/features/rules/preview-primitives";
import { fieldSizes, focusScale } from "./kit/keyboard-fields";
import "./keyboard-text.css";

export function KeyboardStill({ id, variant }: { id: string; variant: Variant }) {
  const postcode = id === "mobile-20";
  return <div className="mk-still" aria-hidden="true">
    {postcode ? <div className="mk-still-address" style={{ transform: `scale(${focusScale(variant, true)})` }}>
      <span>Shipping address</span><strong>Postcode</strong><div style={{ fontSize: fieldSizes[variant] }}>NW1 6XE ▏</div>
    </div> : <><span>Delivery chat</span><strong>Alex Morgan</strong><div className="mk-still-compose" data-covered={variant === "dont"}>I’m outside. <b>Send</b></div></>}
    <div className="mk-still-keys">{["Q W E R T Y U I O P", "A S D F G H J K L"].map(row => <div key={row}>{row.split(" ").map(k => <i key={k}>{k}</i>)}</div>)}</div>
  </div>;
}
