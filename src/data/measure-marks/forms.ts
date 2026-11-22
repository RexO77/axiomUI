// design-system: strict

import type { RuleAnnotations } from "@/components/rule/measure/specs";

const sample = ".preview-frame";
const choice = `${sample} > div > span[aria-hidden]`;
const fields = ["Full name", "Billing address"];

// form-2/3 distinguish persistent labels and optional copy. form-7 changes
// when a setting takes effect. form-8/9
// change when help appears. form-11/12 change carried answers and confirmation.
// form-13/14/15 depend on paste, keyboard suggestions and recovery after submission.
export const formsMarks: Record<string, RuleAnnotations> = {
  "form-1": {
    marks: fields.map((name, i) => ({
      kind: "inset", name: `${name} left edge`, outer: `${sample} > div:nth-child(${i + 1})`,
      inner: `${sample} > div:nth-child(${i + 1}) > div:last-child`, edge: "left",
    })),
  },
  "form-4": {
    marks: ["Street address", "ZIP"].map((name, i) => ({
      kind: "size", name, target: `${sample} > div:nth-child(${i + 1}) > div:nth-child(2)`, axis: "x",
    })),
    replaces: [`${sample} > div:nth-child(2) > div:nth-child(3)`],
  },
  "form-5": {
    marks: [{ kind: "count", name: "Selected plans", target: sample, items: `${choice}:has(> *)` }],
  },
  "form-6": {
    marks: [{ kind: "count", name: "Visible choices", target: sample, items: choice }],
  },
  "form-10": {
    marks: [{
      kind: "inset", name: "Company column offset", outer: sample, edge: "left",
      inner: { do: `${sample} > div:nth-child(3)`, dont: `${sample} .grid > div:nth-child(2)` },
    }],
  },
};
