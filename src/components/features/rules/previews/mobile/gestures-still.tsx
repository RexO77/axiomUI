// Server-safe: no hooks and no "use client", so the wall renders this still
// on the server and never ships the interactive demo with it.

import type { Variant } from "@/components/features/rules/preview-primitives";
import { windows } from "./kit/geometry";
import { anchors, detents, photoActions } from "./kit/gesture-metrics";
import type { GestureId } from "./kit/scenes";
import "./gestures.css";

// NASA/JPL/USGS PIA00405, Galileo, 7 Dec 1992 (public domain): https://science.nasa.gov/photojournal/earths-moon
export function Moon({ className = "" }: { className?: string }) {
  return <div role="img" aria-label="Galileo photograph of the Moon" className={"gest-moon " + className} />;
}
export function Film({ trim, right }: { trim: number; right: boolean }) {
  return <div aria-hidden="true" className="gest-film"><i className="gest-cut" style={{ width: trim, [right ? "right" : "left"]: 0 }} /></div>;
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
