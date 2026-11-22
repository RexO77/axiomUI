// Server-safe: no hooks and no "use client", so the wall renders this still
// on the server and never ships the interactive demo with it.

import type { Variant } from "@/components/features/rules/preview-primitives";
import { Check, ChevronRight } from "@/components/ui/icons";
import "./sheets.css";

export function SheetsStill({ id, variant }: { id: string; variant: Variant }) {
  const good = variant === "do";
  const [label, heading, entries, foot]: [string, string, string[], string] = id === "mobile-16"
    ? ["Garden journal", good ? "Opening the east gate" : "Through the gate", good ? ["Benches fitted", "Gates opened"] : ["Past the brick arch", "The orchard path"], good ? "Reading position held" : "Article scrolled away"]
    : id === "mobile-17" ? ["Central station", good ? "Departures" : "Station board", good ? ["07:00   Birchwood", "07:08   Westport"] : ["First service   07:00", "Birchwood · Platform 1"], good ? "List at top" : "Departures dismissed"]
    : id === "mobile-18" ? ["Visit options", "Glasshouse visit", good ? ["11   Hearing loop", "12   Wheelchair access"] : ["08   Locker", "09   Quiet room"], good ? "Wheelchair access selected" : "Remaining options clipped"]
    : ["Everyday shoes", good ? "Filters" : "Everyday shoes", good ? ["✓   Size 9    ·    Black", "✓   Under $120"] : ["Applied   ·   Size 9", "Court low    ·    $95"], good ? "Show 2 pairs" : "Reopen filters"];
  return <div className="ms-still" data-good={good}><small>{label}</small><strong>{heading}</strong>
    <div>{entries.map(line => <span key={line}>{line}</span>)}</div>
    <b>{good ? <Check /> : <ChevronRight />}{foot}</b></div>;
}
