// design-system: strict

import type { RuleAnnotations } from "@/components/rule/measure/specs";

// motion-1/2/4/6/7/11/12/13/21/24/29 compare timing, focus or animation
// execution. motion-3/8/9/14/15/16/17/28 depend on transforms, opacity or blur
// during playback. motion-18/19/20 require dragging, flicking or pointer capture.
// Only the menu's origin remains measurable after its animation settles.
export const motionMarks: Record<string, RuleAnnotations> = {
  "motion-10": {
    marks: [{
      kind: "style", name: "Menu origin", target: '[data-anim="panel"]', property: "transform-origin",
    }],
    replaces: ['[data-anim="origin-dot"]'],
  },
};
