// design-system: strict

import type { RuleAnnotations } from "@/components/rule/measure/specs";

const scene = ".preview-frame > div";
const report = `${scene} > div:first-child`;
const likeIcon = `${scene} p + div > span:first-child > svg`;
const card = `${scene} > div > div`;
const upload = `${scene} > div`;

// color-7 compares the hover transition. Both buttons return to the same resting fill.
export const colorMarks: Record<string, RuleAnnotations> = {
  "color-1": {
    marks: [
      { kind: "style", name: "Header", target: `${report} > div:first-child`, property: "background-color" },
      { kind: "style", name: "Sidebar", target: `${report} > div:last-child > div:first-child`, property: "background-color" },
      { kind: "style", name: "New report", target: `${report} > div:last-child > div:last-child > span`, property: "background-color" },
    ],
  },
  "color-4": {
    marks: [{ kind: "style", name: "Like icon", target: likeIcon, property: "fill" }],
  },
  "color-6": {
    marks: [
      { kind: "style", name: "Input border", target: `${scene} > div:nth-child(2)`, property: "border-top-color" },
      { kind: "style", name: "Divider", target: `${scene} > div:nth-child(3) > div`, property: "background-color" },
    ],
  },
  "color-8": {
    marks: [
      { kind: "style", name: "Page", target: scene, property: "background-color" },
      { kind: "style", name: "Storage card", target: card, property: "background-color" },
      { kind: "style", name: "Usage bar", target: `${card} > div:nth-child(2) > div`, property: "background-color" },
    ],
  },
  "color-9": {
    marks: [{
      kind: "text", name: "Receipt hint", target: `${scene} > div > span:nth-of-type(2)`,
      show: { contrast: true }, rows: ["colour"],
    }],
  },
  "color-10": {
    marks: [
      { kind: "style", name: "Hover fill", target: `${scene} > div:nth-child(2)`, property: "background-color" },
      { kind: "style", name: "Selected fill", target: `${scene} > div:nth-child(3)`, property: "background-color" },
      { kind: "style", name: "Selected label", target: `${scene} > div:nth-child(3) > span:first-of-type`, property: "color" },
    ],
  },
  "color-11": {
    marks: ["Light thumbnail", "Dark thumbnail"].map((name, i) => ({
      kind: "style", name, target: `${upload}:nth-of-type(${i + 1}) > div`, property: "outline-color",
    })),
  },
  "color-12": {
    marks: [
      { kind: "style", name: "Card shadow", target: `${scene} > div:first-child`, property: "box-shadow" },
      { kind: "style", name: "Border width", target: `${scene} > div:first-child`, property: "border-top-width" },
    ],
  },
};
