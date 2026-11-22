"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { type Box, type Host, type Profile, type Size, screenMetrics } from "./geometry";

export function boxStyle(box: Box): CSSProperties {
  return { position: "absolute", left: box.x, top: box.y, width: box.width, height: box.height };
}
export function Readout({ kind, children }: { kind: "Measured in this pane" | "Simulated" | "Modelled"; children: ReactNode }) {
  return <p className="mf-readout"><b>{kind}</b> · {children}</p>;
}
export function PhoneFrame({ size, scale, profile, host, inset = 0, sideInset = 0, events, children }: {
  size: Size; scale?: number; profile: Profile; host: Host; inset?: number; sideInset?: number;
  events?: HTMLAttributes<HTMLDivElement>; children: ReactNode;
}) {
  const fit = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(210);
  useLayoutEffect(() => {
    const el = fit.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => { if (entry.contentRect.width) setWidth(entry.contentRect.width); });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const ratio = scale ?? Math.min(width / size.width, 450 / size.height);
  return <div className="mf-fit" ref={fit}>
    <div className="mf-bezel" style={{ width: size.width * ratio, height: size.height * ratio }}>
      <div {...events} className="mf-glass" data-profile={profile} data-host={host} style={{
        ...size, transform: "scale(" + ratio + ")", "--mf-bottom": inset + "px", "--mf-side": sideInset + "px",
      } as CSSProperties}>{children}</div>
    </div>
  </div>;
}
export function SystemChrome({ profile, toolbar = 0, inset = 0, sideInset = 0, inspect = false, threeButtons = false }: {
  profile: Profile; toolbar?: number; inset?: number; sideInset?: number; inspect?: boolean; threeButtons?: boolean;
}) {
  return <div className="mf-chrome" aria-hidden="true">
    <div className="mf-status"><span>9:41</span><i className="mf-cutout" /><span>▴ ▰</span></div>
    {sideInset > 0 && <div className="mf-side-cutout" style={{ width: sideInset }} />}
    {inspect && <><div className="mf-boundary" style={{ bottom: inset, left: sideInset }} />
      <div className="mf-edge" style={{ width: screenMetrics.edge }} />
      {profile === "Android" && <div className="mf-edge mf-end" style={{ width: screenMetrics.edge }} />}</>}
    {toolbar > 0 && <div className="mf-browser" style={{ height: toolbar }}><span>‹</span><strong>tickets.example</strong><span>⋯</span></div>}
    {threeButtons ? <div className="mf-three">◁　　 ○　　 □</div> : inset > 0 && <i className="mf-home" />}
  </div>;
}
export function HitOutline({ box }: { box: Box }) { return <i aria-hidden="true" className="mf-hit" style={boxStyle(box)} />; }
export function Fingertip({ point, leftHand = false }: { point: { x: number; y: number }; leftHand?: boolean }) {
  return <i aria-hidden="true" className="mf-finger" style={{ left: point.x, top: point.y, transform: "translate(" + (leftHand ? "-60%" : "-40%") + ", -30%)" }} />;
}
