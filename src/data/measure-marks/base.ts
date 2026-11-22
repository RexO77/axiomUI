import type { RuleAnnotations } from "@/components/rule/measure/specs";

const LAYOUT1_CARD = ".preview-frame > div > div:first-child";
const LAYOUT3_STACK = ".preview-frame > div";
const COMP3_OUTER = ".preview-frame > div";
const COMP3_INNER = ".preview-frame > div > div";
const COMP10_BAR = ".preview-frame > div";
const SYS3_ROW = ".preview-frame > div";
const SYS3_TARGET = {
  do: ".preview-frame > div > div:last-child > span:nth-child(2)",
  dont: ".preview-frame > div > div:last-child > span > span:nth-child(2)",
};

export const ANNOTATIONS: Record<string, RuleAnnotations> = {
  // Short caps label: tracking is the variable, so the ruler and the kerned
  // pairs carry it, with the cap height it is set against.
  "typo-2": {
    marks: [
      {
        kind: "text",
        name: "Section label",
        target: ".preview-frame > div > div:first-child > span",
        show: { metrics: { lines: ["cap", "base"], side: "left" }, tracking: true, kerning: true },
      },
    ],
  },
  // Body leading: baselines and the shaded half-leading on every line.
  "typo-3": {
    marks: [
      {
        kind: "text",
        name: "Body",
        target: ".preview-frame > p",
        show: { leading: "right", measure: true },
      },
    ],
  },
  // Numerals: every digit's advance, and whether the decimal points stack.
  "typo-7": {
    marks: [
      {
        kind: "text",
        name: "Amounts",
        target: ".preview-frame span.text-right",
        all: true,
        show: { tracking: true, align: "." },
        rows: ["face", "size", "figures", "tracking", "kerning", "colour"],
      },
    ],
  },
  // Body size: the x-height a reader actually reads at, line by line.
  "typo-11": {
    marks: [
      {
        kind: "text",
        name: "Body",
        target: ".preview-frame > div > div > div:nth-child(1) > p",
        show: { metrics: { lines: ["x"], side: "right" } },
        rows: ["size", "metrics", "colour"],
      },
      {
        kind: "text",
        name: "Subtext",
        target: ".preview-frame > div > div > div:nth-child(2) > p",
        show: { metrics: { lines: ["x"], side: "right" } },
        rows: ["size", "metrics", "colour"],
      },
    ],
  },
  // Display tracking: full metrics, the advance ruler and the kerned pairs.
  "typo-15": {
    marks: [
      {
        kind: "text",
        name: "Display",
        target: ".preview-frame > p",
        show: { metrics: { lines: ["asc", "cap", "x", "base", "desc"], side: "left" }, tracking: true, kerning: true },
        rows: ["face", "size", "metrics", "leading", "tracking", "kerning", "colour"],
      },
    ],
  },
  "layout-1": {
    marks: [
      { kind: "padding", name: "Padding", target: LAYOUT1_CARD, edge: "left" },
      { kind: "padding", name: "Padding top", target: LAYOUT1_CARD, edge: "top" },
      { kind: "gap", name: "Gap", from: `${LAYOUT1_CARD} > span`, to: `${LAYOUT1_CARD} > div:nth-child(3)`, axis: "y", place: "after" },
    ],
  },
  "layout-3": {
    marks: [
      { kind: "gap", name: "Label to field", from: `${LAYOUT3_STACK} > :nth-child(1)`, to: `${LAYOUT3_STACK} > :nth-child(3)`, axis: "y", place: "after" },
      { kind: "gap", name: "Between pairs", from: `${LAYOUT3_STACK} > :nth-child(3)`, to: `${LAYOUT3_STACK} > :nth-child(5)`, axis: "y", place: "after" },
      { kind: "gap", name: "Label to field", from: `${LAYOUT3_STACK} > :nth-child(5)`, to: `${LAYOUT3_STACK} > :nth-child(7)`, axis: "y", place: "after" },
    ],
  },
  "layout-5": {
    marks: [
      { kind: "padding", name: "Padding x", target: ".preview-frame > span", edge: "left" },
      { kind: "padding", name: "Padding y", target: ".preview-frame > span", edge: "top" },
      { kind: "padding", name: "Padding x", target: ".preview-frame > span", edge: "right" },
    ],
  },
  "comp-3": {
    marks: [
      { kind: "radius", name: "Outer radius", target: COMP3_OUTER, corner: "top-right" },
      { kind: "inset", name: "Inset", outer: COMP3_OUTER, inner: COMP3_INNER, edge: "right" },
      { kind: "radius", name: "Inner radius", target: COMP3_INNER, corner: "top-right", chip: "inside" },
    ],
    replaces: [".preview-frame span.border-t"],
  },
  "comp-10": {
    marks: [
      { kind: "size", name: "Archive", target: `${COMP10_BAR} > svg:nth-of-type(1)`, axis: "x", clear: COMP10_BAR },
      { kind: "size", name: "Share", target: `${COMP10_BAR} > svg:nth-of-type(2)`, axis: "x", clear: COMP10_BAR },
      { kind: "size", name: "Delete", target: `${COMP10_BAR} > svg:nth-of-type(3)`, axis: "x", clear: COMP10_BAR },
    ],
    replaces: [`${COMP10_BAR} > span[aria-hidden="true"]`],
  },
  "sys-3": {
    marks: [
      { kind: "size", name: "Target width", target: SYS3_TARGET, axis: "x", clear: SYS3_ROW },
      { kind: "size", name: "Target height", target: SYS3_TARGET, axis: "y" },
    ],
  },
};
