// design-system: strict

import type { RuleAnnotations } from "@/components/rule/measure/specs";

const save = ".preview-frame > div > div:nth-child(2) > span:last-child";
const buttonRow = ".preview-frame > .relative > div";

// a11y-2/4 add a second error signal and alternative actions. a11y-5 changes
// heading semantics. a11y-6/8 require pausing playback or returning focus.
export const accessibilityMarks: Record<string, RuleAnnotations> = {
  "a11y-1": {
    marks: [
      { kind: "style", name: "Focus outline", target: save, property: "outline-style" },
      { kind: "style", name: "Ring width", target: save, property: "outline-width" },
      { kind: "style", name: "Ring offset", target: save, property: "outline-offset" },
    ],
  },
  "a11y-3": {
    marks: [{
      kind: "gap", name: "Between buttons", from: `${buttonRow} > span:first-child`,
      to: `${buttonRow} > span:last-child`, axis: "x", place: "after",
    }],
    replaces: [".preview-frame > div:last-child > span[aria-hidden]"],
  },
  "a11y-7": {
    marks: [{
      kind: "style", name: "Inline link", target: ".preview-frame p > span", property: "text-decoration-line",
    }],
  },
};
