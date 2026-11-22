import { describe, expect, it } from "vitest";

import { graphemes } from "../measure/type-metrics";

const split = (text: string, native?: Intl.Segmenter | null) => graphemes(text, native).map(({ segment }) => segment);

describe("grapheme segmentation", () => {
  const samples = ["Work together", "Café au lait", "❤️ ok", "\u{1F469}‍\u{1F4BB} dev", "fi ffl"];

  it("matches Intl.Segmenter where the browser lacks it", () => {
    const native = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    for (const text of samples) expect(split(text, null)).toEqual(split(text, native));
  });

  it("keeps the offsets that ranges are cut at", () => {
    expect(graphemes("éa", null)).toEqual([
      { index: 0, segment: "é" },
      { index: 2, segment: "a" },
    ]);
  });
});
