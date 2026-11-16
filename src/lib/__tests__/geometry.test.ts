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
