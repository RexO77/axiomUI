// Server-safe: no hooks and no "use client", so the wall renders this still
// on the server and never ships the interactive demo with it.

import { Check, ChevronRight, X } from "@/components/ui/icons";
import type { Variant } from "@/components/features/rules/preview-primitives";
import { boxStyle, windows } from "./kit/geometry";
import { closeBox, cornerMetrics, doubleTapWait } from "./kit/touch-geometry";
import "./mobile.css";
import "./touch.css";

export function CoastPrint() {
  return <div aria-hidden="true" className="mt-chart">{Array.from({ length: 10 }, (_, i) =>
    <i key={i} style={{ left: -27 + i * 2 + "%", top: 9 + i * 7 + "%" }} />)}</div>;
}

export function TouchStill({ id, variant }: { id: string; variant: Variant }) {
  const good = variant === "do";
  if (id === "mobile-3") {
    const box = closeBox(windows.portrait, good);
    const c = { x: 193, y: 48 };
    return <div className="mt-still" role="img" aria-label={good ? "Offset tap lands inside Close" : "Offset tap misses Close"}>
      <header>Field notebook</header><span className="mt-close" style={boxStyle({ x: c.x - box.width / 2, y: c.y - box.height / 2, width: box.width, height: box.height })}><X size={22} /></span>
      <i className="mt-spot" style={{ left: c.x + cornerMetrics.offset - 4.5, top: c.y - 4.5 }} /><footer>{good ? "Note closed" : "Note still open"}</footer></div>;
  }
  if (id === "mobile-4") return <div className="mt-still" role="img" aria-label={good ? "Save inside the thumb arc" : "Save above the thumb arc"}>
    <header>Field notebook</header><i className="mt-arc" /><span className="mt-save" style={good ? { bottom: 22, left: "49%" } : { top: 7, right: 10 }}>Save</span>
    <span className="mt-still-line">North inlet</span></div>;
  if (id === "mobile-5") return <div className="mt-still" role="img" aria-label={good ? "Scrolling keeps the inbox open" : "Scrolling opens Tide tables"}>
    <header>{good ? "Inbox" : "From Jo"}</header>{good ? <><span className="mt-row"><ChevronRight size={16} />Weather window</span><span className="mt-row"><ChevronRight size={16} />Mooring list</span></> :
      <><strong className="mt-still-line">Tide tables</strong><footer>Opened on contact</footer></>}</div>;
  return <div className="mt-still" role="img" aria-label={good ? "North inlet opens immediately" : "North inlet waits for the timer"}>
    <header>Field notebook</header><strong className="mt-still-line">North inlet</strong><CoastPrint />
    <footer>{good ? <><Check size={14} /> Opened</> : "Waiting · " + doubleTapWait + " ms"}</footer></div>;
}
