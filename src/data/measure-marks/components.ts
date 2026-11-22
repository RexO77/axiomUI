// design-system: strict

import type { RuleAnnotations } from "@/components/rule/measure/specs";

const sample = ".preview-frame > div";
const profilePanel = `${sample} > div:last-child`;
const clickTarget = { do: sample, dont: `${sample} > span:first-child` };

// comp-2 changes the confirmation flow. comp-7/8 add labels and a disabled reason.
// comp-9 changes feedback during submission. comp-12/13/14/15 change dismissal,
// chart alternatives, navigation semantics and the content of a product example.
export const componentsMarks: Record<string, RuleAnnotations> = {
  "comp-1": {
    marks: [
      { kind: "style", name: "Publish fill", target: `${sample}:nth-child(2) > span:nth-child(1)`, property: "background-color" },
      { kind: "style", name: "Preview fill", target: `${sample}:nth-child(2) > span:nth-child(2)`, property: "background-color" },
      { kind: "style", name: "Preview border", target: `${sample}:nth-child(2) > span:nth-child(2)`, property: "border-top-color" },
      { kind: "style", name: "Discard fill", target: `${sample}:nth-child(2) > span:nth-child(3)`, property: "background-color" },
    ],
  },
  "comp-4": {
    marks: ["Avatar", "File thumbnail"].map((name, i) => ({
      kind: "radius", name, target: `${sample} > div:nth-child(${i + 1}) > span`, corner: "top-left",
    })),
  },
  "comp-5": {
    marks: [{
      kind: "count", name: "Fully visible fields", target: profilePanel,
      items: '[data-mark="profile-field"]',
      clip: { do: profilePanel, dont: `${profilePanel} .overflow-hidden` },
    }],
  },
  "comp-6": {
    marks: [{
      kind: "inset", name: "Error offset from field", outer: `${sample}:first-child > div`,
      inner: { do: `${sample}:first-child > span:last-child`, dont: `${sample}.absolute` },
      edge: "left",
    }],
  },
  "comp-11": {
    marks: [
      { kind: "size", name: "Hit area width", target: clickTarget, axis: "x" },
      { kind: "size", name: "Hit area height", target: clickTarget, axis: "y" },
    ],
  },
};
