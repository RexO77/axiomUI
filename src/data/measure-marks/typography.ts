// design-system: strict

import type { RuleAnnotations } from "@/components/rule/measure/specs";

const preview = ".preview-frame";
const longFilename = `${preview} > div:last-child > span:nth-child(2)`;
const weightRows = ["Section label", "Heading", "Description", "Recipients", "Action"];

// typo-1 changes the casing of the copy.
export const typographyMarks: Record<string, RuleAnnotations> = {
  "typo-4": {
    marks: [{
      kind: "text", name: "Heading", target: `${preview} > p:first-of-type`,
      show: { leading: "right" }, rows: ["size", "leading"],
    }],
  },
  "typo-5": {
    marks: ["Heading", "Body"].map((name, i) => ({
      kind: "text", name, target: `${preview} p:nth-of-type(${i + 1})`,
      show: { metrics: { lines: ["x", "base"], side: "right" } }, rows: ["face", "metrics"],
    })),
  },
  "typo-6": {
    marks: [{
      kind: "text", name: "Member email", target: `${preview} p.truncate`,
      show: { metrics: { lines: ["x", "base"], side: "right" } }, rows: ["size", "metrics"],
    }],
  },
  "typo-8": {
    marks: [{
      kind: "text", name: "Changelog paragraph", target: `${preview} .relative > p`,
      show: { measure: true }, rows: ["measure"],
    }, {
      kind: "style", name: "Line alignment", target: `${preview} .relative > p`, property: "text-align",
    }],
  },
  "typo-9": {
    marks: weightRows.map((name, i) => ({
      kind: "style", name, target: `${preview} .space-y-1 > div:nth-child(${i + 1}) > span:first-child`,
      property: "font-weight",
    })),
  },
  "typo-10": {
    marks: [
      { kind: "style", name: "Filename overflow", target: longFilename, property: "text-overflow" },
      { kind: "size", name: "Filename space", target: longFilename, axis: "x" },
    ],
  },
  "typo-12": {
    marks: [{
      kind: "text", name: "Heading", target: `${preview} > div`,
      show: { measure: true }, rows: ["measure"],
    }],
  },
  "typo-13": {
    marks: [{
      kind: "text", name: "Backup description", target: `${preview} > div > div:last-child`,
      show: { measure: true }, rows: ["measure"],
    }],
  },
  "typo-14": {
    marks: [{
      kind: "style", name: "Restaurant name", target: "p > [lang]", property: "unicode-bidi",
    }],
  },
};
