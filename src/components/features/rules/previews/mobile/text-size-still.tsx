// Server-safe: no hooks and no "use client", so the wall renders this still
// on the server and never ships the interactive demo with it.

import type { Variant } from "@/components/features/rules/preview-primitives";
import { bodySizes, largeAndroidSizes } from "./kit/type-metrics";
import "./keyboard-text.css";

export type Platform = "iOS" | "Android" | "Browser";
export const pickup = "Pick up your parcel at the side entrance.";
export const paymentRow = { minimum: 56, column: 160, label: "Charge to business account" } as const;

export function typeMetrics(platform: Platform, large: boolean) {
  if (platform === "iOS") return { fontSize: large ? bodySizes.AX5 : bodySizes.default, lineHeight: large ? 62 : 22 };
  if (platform === "Android") return { fontSize: large ? largeAndroidSizes[14] : 14, lineHeight: large ? largeAndroidSizes[20] : 20 };
  return { fontSize: large ? 32 : 16, lineHeight: large ? 44 : 22 };
}

export function TextSizeStill({ id, variant }: { id: string; variant: Variant }) {
  const rows = id === "mobile-23";
  const metrics = typeMetrics(rows ? "Android" : "iOS", rows || variant === "do");
  return <div className="mtype-still" data-message={!rows || undefined} aria-hidden="true">
    <div className="mtype-still-inner"><small>{rows ? "Payment method" : "Delivery update"}</small>
      {rows ? <div className="mtype-row" style={{ minHeight: paymentRow.minimum, height: variant === "dont" ? paymentRow.minimum : undefined }}>
        <i /><span style={{ width: paymentRow.column, fontSize: metrics.fontSize, lineHeight: metrics.lineHeight + "px" }}>{paymentRow.label}</span>
      </div> : <div className="mtype-letter"><span style={{ fontSize: metrics.fontSize, lineHeight: metrics.lineHeight + "px" }}>{pickup}</span></div>}
    </div>
  </div>;
}
