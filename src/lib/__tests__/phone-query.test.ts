import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PHONE_QUERY, useMediaQuery } from "@/lib/media";

describe("phone layout query", () => {
  it("matches the CSS variant used at first paint", () => {
    const css = readFileSync(path.resolve(__dirname, "../../app/globals.css"), "utf8");
    const query = css.match(/@custom-variant phone\s*\{\s*@media ([^{]+)\{/)?.[1].trim();
    expect(query).toBe(PHONE_QUERY);
    expect(PHONE_QUERY).toBe("(max-width: 640px), (pointer: coarse) and (max-height: 500px)");
  });

  it("provides a safe server snapshot without accessing window", () => {
    function Probe() {
      return createElement("span", null, String(useMediaQuery(PHONE_QUERY)));
    }
    expect(renderToStaticMarkup(createElement(Probe))).toBe("<span>false</span>");
  });
});
