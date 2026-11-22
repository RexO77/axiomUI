// design-system: strict

// Which measurements matter for each rule, declared as data. A mark names
// what to measure and where it lives in the preview's DOM; every value is
// read live from the rendered preview (measure.ts), never written here, so a
// caption that drifts from its preview shows up as a mismatch on screen.
//
// Selectors are scoped to one pane's preview box (`.cmp-box`) and use the
// structure the previews already render. A `{ do, dont }` pick covers a pair
// whose two panes are built differently.
//
// Text is measured as type (metrics, leading, tracking, kerning, measure),
// boxes as boxes (padding, gap, inset, size, radius).

export type Edge = "top" | "right" | "bottom" | "left";
export type Corner = "top-left" | "top-right";
export type Pick = string | { do: string; dont: string };
export type MetricLine = "asc" | "cap" | "x" | "base" | "desc";

export type TextShow = {
  /** Contrast of the rendered text against its backdrop. */
  contrast?: boolean;
  /** Vertical metrics across the first line, labelled on this side of it. */
  metrics?: { lines: MetricLine[]; side: "left" | "right" };
  /** Baselines, half-leading shaded on every line, and the line-height dim on this side. */
  leading?: "left" | "right";
  /** A ruler of glyph advances under the last line (or under every target, for numerals). */
  tracking?: boolean;
  /** Ticks at pairs the font kerns, with the adjustment. */
  kerning?: boolean;
  /** Characters on each line, at its end. */
  measure?: boolean;
  /** A character whose position should line up across every target (a decimal point). */
  align?: string;
};

/** Lines of the spec readout a text mark contributes, in this order. */
export type TextRow = "face" | "size" | "metrics" | "leading" | "tracking" | "kerning" | "figures" | "measure" | "colour" | "halfLeading" | "baseline";

export type Mark =
  | { kind: "count"; name: string; target: Pick; items: Pick; clip?: Pick }
  | { kind: "style"; name: string; target: Pick; property: string }
  | { kind: "text"; name: string; target: Pick; all?: boolean; show: TextShow; rows?: TextRow[] }
  | { kind: "padding"; name: string; target: Pick; edge: Edge }
  | { kind: "gap"; name: string; from: Pick; to: Pick; axis: "x" | "y"; place?: "inside" | "after" }
  | { kind: "inset"; name: string; outer: Pick; inner: Pick; edge: Edge }
  | { kind: "size"; name: string; target: Pick; axis: "x" | "y"; clear?: Pick }
  | { kind: "radius"; name: string; target: Pick; corner: Corner; chip?: "outside" | "inside" };

export type RuleAnnotations = {
  marks: Mark[];
  /**
   * Hand-drawn evidence in the preview that the redlines take over while
   * they show, beyond the `[data-annotation]` labels every preview has.
   */
  replaces?: string[];
};
