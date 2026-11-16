import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  HEADER_CENTRE_Y,
  HEADER_HEIGHT,
  OPEN_SHIFT,
  RAIL,
  RAIL_OPEN,
  SHEET_INSET,
  STRIP_BOTTOM,
  STRIP_TOP,
  shellVars,
} from "@/components/shell/geometry";

const css = readFileSync(path.join(process.cwd(), "src/components/shell/shell.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const used = new Set([...css.matchAll(/var\(\s*(--shell-[\w-]+)/g)].map((match) => match[1]));
const declared = new Set([...css.matchAll(/(--shell-[\w-]+)\s*:/g)].map((match) => match[1]));

describe("shell geometry", () => {
  it("moves the sheet by the rail's growth", () => {
    expect(RAIL).toBe(56);
    expect(RAIL_OPEN).toBe(240);
    expect(OPEN_SHIFT).toBe(184);
  });

  it("centres the header row on y = 34", () => {
    expect(HEADER_CENTRE_Y).toBe(34);
    expect(SHEET_INSET + HEADER_HEIGHT / 2).toBe(HEADER_CENTRE_Y);
  });

  it("emits pixel and millisecond strings", () => {
    for (const [name, value] of Object.entries(shellVars())) {
      expect(value, name).toMatch(/^\d+(px|ms)$/);
    }
    expect(shellVars()["--shell-rail-open"]).toBe(`${RAIL + OPEN_SHIFT}px`);
  });

  it("emits exactly the variables shell.css reads", () => {
    const emitted = Object.keys(shellVars()).sort();
    expect([...used].sort()).toEqual(emitted);
  });

  it("never redeclares a geometry variable in CSS, where it would drift from the script", () => {
    expect([...declared]).toEqual([]);
  });
});

// These columns are measured again in the browser; pin the CSS inputs too.
const block = (selector: string) => {
  const start = css.indexOf(`${selector} {`);
  expect(start, selector).toBeGreaterThanOrEqual(0);
  return css.slice(start, css.indexOf("}", start));
};
const pixels = (rule: string, property: string) => {
  const value = rule.match(new RegExp(`(?:[;{]\\s*)${property}: ([0-9]+)px`));
  expect(value, property).not.toBeNull();
  return Number(value?.[1]);
};

describe("rail columns", () => {
  it("keeps icons at x 19–37 in the list and the persistent toggle", () => {
    for (const selector of [".rail-catrow > svg", ".rail-button > svg"]) {
      const rule = block(selector);
      const left = 8 + pixels(rule, "left");
      expect([left, left + pixels(rule, "width")]).toEqual([19, 37]);
    }
    expect(block(".rail-list")).toContain("padding: 0 8px 16px");
    expect(block(".rail-bottom")).toContain("left: 8px");
  });

  it("keeps category, rule and toggle labels at x 47", () => {
    for (const selector of [".rail-catrow", ".rail-rulerow", ":is(.shell[data-open], :root[data-rail=\"open\"] .shell:not([data-rail-ready])) .rail-button"]) {
      expect(block(selector)).toMatch(/padding: [^;]* 39px;/);
    }
    expect(8 + 39).toBe(47);
  });

  it("keeps the collapsed toggle and logo link 40px squares, inside the rail's 48px", () => {
    // Padding or a label column here would widen the pill under the sheet (x 56).
    expect(block(".rail-button")).toContain("padding: 0;");
    expect(block(".shell:not([data-open]):not([data-wide]) .rail-bottom")).toContain("width: 40px");
    expect(block(".rail-home")).toContain("grid-template-columns: 40px auto");
    expect(block(".rail-home")).not.toMatch(/\bgap:/);
    expect(block(".rail-brand-name")).toContain("margin-left: 4px");
    expect(8 + 40).toBeLessThanOrEqual(48);
  });

  it("hides the name and toggle label by CSS, keyed on the open and boot states", () => {
    expect(block(".rail-brand-name, .rail-button-label, .rail-icon-collapse")).toContain("display: none");
    expect(css).toMatch(/:root\[data-rail="open"\] \.shell:not\(\[data-rail-ready\]\) \.rail-bottom \{ right: 8px; width: auto; \}/);
  });

  it("reads the strip region from the geometry constants", () => {
    expect([STRIP_TOP, STRIP_BOTTOM]).toEqual([60, 128]);
    for (const selector of [".rail-region", ".rail-list"]) {
      expect([pixels(block(selector), "top"), pixels(block(selector), "bottom")], selector).toEqual([STRIP_TOP, STRIP_BOTTOM]);
    }
  });

  it("centres the logo tile on the header in either rail state", () => {
    expect(block(".rail-brand-row")).toContain("top: var(--shell-inset)");
    expect(pixels(block(".rail-brand-row"), "height") / 2 + SHEET_INSET).toBe(HEADER_CENTRE_Y);
    expect(block(".rail-logo-tile")).toContain("justify-self: center");
    expect(block(".rail-home")).toContain("grid-template-columns: 40px auto");
  });
});
