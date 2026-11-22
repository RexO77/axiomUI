// design-system: strict

import type { RuleAnnotations } from "@/components/rule/measure/specs";

const frame = ".preview-frame > div";

// sys-1 changes the loading state. sys-2/4/7 change empty-state, date and
// progress copy. sys-6/8/9/13/15/16 depend on undo, keyboard navigation,
// acknowledgement timing, animated properties, history and error persistence.
export const systemMarks: Record<string, RuleAnnotations> = {
  "sys-5": {
    marks: [{
      kind: "text", name: "Invoice title", target: `${frame} > div > span:first-child`,
      show: { contrast: true }, rows: ["colour"],
    }],
  },
  "sys-10": {
    marks: [{ kind: "size", name: "Failed image height", target: `${frame} > div:first-child`, axis: "y" }],
  },
  "sys-11": {
    marks: [
      { kind: "size", name: "Illustrated viewport", target: frame, axis: "x" },
      { kind: "size", name: "Illustrated content", target: `${frame} > div:first-child`, axis: "x" },
    ],
  },
};
