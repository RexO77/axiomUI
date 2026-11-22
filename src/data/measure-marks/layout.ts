// design-system: strict

import type { RuleAnnotations } from "@/components/rule/measure/specs";

const sample = ".preview-frame > div";
const reserved = "[data-reserved-media]";

export const layoutMarks: Record<string, RuleAnnotations> = {
  "layout-2": {
    marks: [{
      kind: "text", name: "Reading column", target: "[data-text-column] p:first-of-type",
      show: { measure: true }, rows: ["measure"],
    }, {
      kind: "style", name: "Column limit", target: "[data-text-column]", property: "max-width",
    }],
    replaces: ["[data-text-column] > [aria-hidden]"],
  },
  "layout-4": {
    marks: [{ kind: "style", name: "Play icon offset", target: `${sample} > svg`, property: "translate" }],
  },
  "layout-6": {
    marks: [{
      kind: "inset", name: "Icon below first line", outer: `${sample} > div > span:first-child`,
      inner: `${sample} > svg`, edge: "top",
    }],
  },
  "layout-7": {
    marks: [
      { kind: "count", name: "Borders", target: sample, items: `${sample} .border` },
      { kind: "style", name: "Stat card", target: `${sample} > div > div > div:first-child`, property: "background-color" },
      { kind: "style", name: "Page", target: ".preview-frame > span[aria-hidden]", property: "background-color" },
    ],
  },
  "layout-9": {
    marks: ["Narrow card", "Wide card"].map((name, i) => ({
      kind: "padding", name, target: `${sample} > div:nth-child(${i + 1}) > div`, edge: "left",
    })),
  },
  "layout-10": {
    marks: ["Heading to body", "Body spacing", "Section break"].map((name, i) => ({
      kind: "gap", name, from: `${sample} > div:nth-child(${i * 2 + 1})`,
      to: `${sample} > div:nth-child(${i * 2 + 3})`, axis: "y", place: "after",
    })),
    replaces: [`${sample} > [aria-hidden] > span`],
  },
  "layout-11": {
    marks: [
      { kind: "style", name: "Menu z-index", target: "[data-stacking-menu]", property: "z-index" },
      { kind: "style", name: "Menu parent transform", target: "div:has(> [data-stacking-menu])", property: "transform" },
    ],
  },
  "layout-12": {
    marks: [{ kind: "inset", name: "Scroll target offset", outer: "[data-sticky-header]", inner: "[data-scroll-target]", edge: "top" }],
  },
  "layout-13": {
    marks: [
      { kind: "size", name: "Reserved width", target: reserved, axis: "x" },
      { kind: "size", name: "Reserved height", target: reserved, axis: "y" },
    ],
  },
  "layout-14": {
    marks: [{ kind: "style", name: "Narrow crop", target: `${sample} > div:last-child img`, property: "object-position" }],
  },
};
