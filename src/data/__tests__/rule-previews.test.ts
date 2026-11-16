import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { hasShowcase } from "@/components/features/rules/demos/registry";
import { ANNOTATION_INK, ANNOTATION_INK_ON_FILL } from "@/components/features/rules/preview-primitives";
import { getStaticRulePreview } from "@/components/features/rules/rule-preview";
import { rules } from "@/data/ui-logic";

const staticRules = rules.filter((rule) => !hasShowcase(rule.id));

function markupOf(ruleId: string, variant: "do" | "dont") {
  const node = getStaticRulePreview(ruleId, variant);
  return node == null ? "" : renderToStaticMarkup(node);
}

type Element = { classes: Set<string>; annotation: boolean; keep: boolean; text: string };

// A walk over React's own static markup, which is always well formed, so a
// tag stack is enough and no HTML parser is needed. Text is credited to every
// open element, so a label's text includes its children's.
function elementsOf(html: string) {
  const elements: (Element & { inAnnotation: boolean })[] = [];
  const stack: (Element & { inAnnotation: boolean })[] = [];
  const token = /<(\/?)([a-zA-Z][\w:-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>|([^<]+)/g;
  const voids = new Set(["area", "br", "col", "hr", "img", "input", "meta", "source", "wbr"]);
  for (const [, close, tag, attrs = "", selfClosing, text] of html.matchAll(token)) {
    if (text != null) {
      for (const open of stack) open.text += text;
      continue;
    }
    if (close) {
      const done = stack.pop();
      if (done) elements.push({ ...done, text: done.text.replace(/\s+/g, " ").trim() });
      continue;
    }
    const classes = new Set((/class="([^"]*)"/.exec(attrs)?.[1] ?? "").split(/\s+/).filter(Boolean));
    const annotation = /\bdata-annotation=/.test(attrs);
    const element = {
      classes,
      annotation,
      keep: /\bdata-keep=/.test(attrs),
      text: "",
      inAnnotation: annotation || stack.some((open) => open.inAnnotation),
    };
    if (!selfClosing && !voids.has(tag)) stack.push(element);
  }
  return elements;
}

const tokens = (classes: string) => classes.split(" ");
const ANNOTATION_INKS = [ANNOTATION_INK, ANNOTATION_INK_ON_FILL].map(tokens);

// The mono face set in an annotation ink. PRODUCT_MUTED shares the steps of
// ANNOTATION_INK, so ink alone cannot tell evidence from the product's meta;
// this list is where that call is made, by hand, for every such label.
const PRODUCT_TEXT_IN_ANNOTATION_FACE: Record<string, string[]> = {
  "typo-10": ["1.8 MB", "4.2 MB"],
  "color-4": ["2h"],
  "color-5": ["On", "12", "Pro"],
  "color-12": ["Expires 04/28", "Expires 11/26"],
  "comp-2": ["updated 2h ago", "this can’t be undone"],
  "comp-4": ["owner", "2.4 MB"],
  "comp-8": ["Aug 1–31"],
  "form-5": ["$0/mo", "$12/mo", "$24/mo"],
  // An empty field's placeholder; main lifted it from neutral-400 to PRODUCT_MUTED.
  "form-11": ["dd/mm/yyyy"],
  "sys-3": ["1.2 MB"],
  "sys-6": ["4.6 MB", "12.1 MB", "88.4 MB"],
  "sys-7": ["Step 2 of 4"],
  "sys-10": ["4 min read", "Aug 10"],
  "a11y-1": ["Tab"],
};

// Panes whose Do and Don't paint alike once their annotations are hidden, so
// a tile has to keep one label. Each was checked by rendering both panes with
// `[data-annotation]:not([data-keep]) { display: none }` and diffing pixels.
const KEEPS = ["color-10", "color-11", "layout-11", "layout-4"];

describe("rule previews", () => {
  // RulePreview has no generic fallback: a static rule without an authored
  // pane would render nothing beside its do/don't caption.
  it("authors both comparison panes for every non-showcase rule", () => {
    const missing: string[] = [];
    for (const rule of staticRules) {
      for (const variant of ["do", "dont"] as const) {
        if (getStaticRulePreview(rule.id, variant) == null) missing.push(`${rule.id}.${variant}`);
      }
    }
    expect(missing, missing.join("\n")).toEqual([]);
  });

  it("keeps showcase rules out of the static modules", () => {
    const doubled = rules
      .filter((rule) => hasShowcase(rule.id))
      .filter((rule) => getStaticRulePreview(rule.id, "do") != null || getStaticRulePreview(rule.id, "dont") != null)
      .map((rule) => rule.id);
    expect(doubled, doubled.join("\n")).toEqual([]);
  });

  // A gallery tile hides every <Annotation> it is not told to keep. An
  // evidence label written as a plain span would stay on the tile, so every
  // mono label in an annotation ink is either an <Annotation> or product text
  // named above.
  it("renders every mono label in an annotation ink through <Annotation>", () => {
    const found: Record<string, string[]> = {};
    for (const rule of staticRules) {
      for (const variant of ["do", "dont"] as const) {
        for (const element of elementsOf(markupOf(rule.id, variant))) {
          if (element.inAnnotation || !element.text || !element.classes.has("font-mono")) continue;
          if (!ANNOTATION_INKS.some((ink) => ink.every((name) => element.classes.has(name)))) continue;
          const texts = (found[rule.id] ??= []);
          if (!texts.includes(element.text)) texts.push(element.text);
        }
      }
    }
    expect(found).toEqual(PRODUCT_TEXT_IN_ANNOTATION_FACE);
  });

  it("keeps a label on a tile only where the scene cannot carry the difference", () => {
    const kept = staticRules
      .filter((rule) =>
        (["do", "dont"] as const).some((variant) =>
          elementsOf(markupOf(rule.id, variant)).some((element) => element.keep)
        )
      )
      .map((rule) => rule.id)
      .sort();
    expect(kept).toEqual(KEEPS);
    // `keep` only means something on an annotation.
    for (const rule of staticRules) {
      for (const variant of ["do", "dont"] as const) {
        const stray = elementsOf(markupOf(rule.id, variant)).filter((element) => element.keep && !element.annotation);
        expect(stray, `${rule.id}.${variant}`).toEqual([]);
      }
    }
  });
});
