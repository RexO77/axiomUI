import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MeasuredCaption } from "../measure/annotation-readout";
import type { Row } from "../measure/measure";

const row = (key: string, label: string, value: string): Row => ({ key, mark: "", label, value, group: key });
const noop = () => {};

/** The redline each number in a caption is bound to, in caption order. */
function bindings(text: string, rows: Row[]) {
  const html = renderToStaticMarkup(createElement(MeasuredCaption, { text, rows, focus: null, pinned: null, setHover: noop, setPinned: noop }));
  return Array.from(html.matchAll(/aria-label="([^"]+)"/g), ([, label]) => label);
}

describe("measured captions", () => {
  it("gives equal values with no label of their own the marks in order", () => {
    const rows = [row("0", "Target width", "44px"), row("1", "Target height", "44px")];
    expect(bindings("44 × 44px hit area", rows)).toEqual(["Target width, 44", "Target height, 44px"]);
  });

  it("reads the words after a value as well as the word before it", () => {
    const rows = [row("0", "Label to field", "16px"), row("1", "Between pairs", "16px"), row("2", "Label to field", "16px")];
    expect(bindings("16px from label to input · 16px between fields", rows)).toEqual(["Label to field, 16px", "Between pairs, 16px"]);
  });

  it("keeps a named value on its own mark", () => {
    const rows = [row("0", "Outer radius", "4px"), row("1", "Inset", "8px"), row("2", "Inner radius", "4px")];
    expect(bindings("Outer 4px and inner 4px with an 8px inset", rows)).toEqual(["Outer radius, 4px", "Inner radius, 4px", "Inset, 8px"]);
  });
});
