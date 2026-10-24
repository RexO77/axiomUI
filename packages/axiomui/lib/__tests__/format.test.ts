import path from "node:path";
import { describe, expect, it } from "vitest";
import { colorEnabled, createPalette, displayPath, suggest, usageError } from "../format.mjs";

describe("CLI output", () => {
  it("gives explicit no-color preferences priority over forced color", () => {
    expect(colorEnabled({ env: { NO_COLOR: "1", FORCE_COLOR: "1" }, isTTY: true, noColor: false })).toBe(false);
    expect(colorEnabled({ env: { FORCE_COLOR: "1" }, isTTY: true, noColor: true })).toBe(false);
  });

  it("uses terminal capabilities unless color is explicitly forced", () => {
    expect(colorEnabled({ env: {}, isTTY: false, noColor: false })).toBe(false);
    expect(colorEnabled({ env: { TERM: "dumb" }, isTTY: true, noColor: false })).toBe(false);
    expect(colorEnabled({ env: { FORCE_COLOR: "1" }, isTTY: false, noColor: false })).toBe(true);
    expect(colorEnabled({ env: { FORCE_COLOR: "0" }, isTTY: true, noColor: false })).toBe(false);
    expect(colorEnabled({ env: {}, isTTY: true, noColor: false })).toBe(true);
  });

  it("leaves nonterminal output free of ANSI escape sequences", () => {
    for (const paint of Object.values(createPalette(false))) expect(paint("Done")).toBe("Done");
    expect(createPalette(true).green("Done")).toBe("\u001b[32mDone\u001b[39m");
  });

  it("prints project and home paths without confusing sibling prefixes", () => {
    const home = path.resolve("fixture/home");
    const cwd = path.join(home, "project");
    const context = { cwd, home };
    expect(displayPath(cwd, context)).toBe(".");
    expect(displayPath(path.join(cwd, "skills"), context)).toBe("skills");
    expect(displayPath(path.join(home, "other"), context)).toBe("~/other");
    const elsewhere = path.resolve("fixture/home-sibling/skills");
    expect(displayPath(elsewhere, context)).toBe(elsewhere);
  });

  it("suggests a nearby spelling without guessing distant names", () => {
    expect(suggest("motoin", ["color", "motion"])).toBe("motion");
    expect(suggest("MOTION", ["motion"])).toBe("motion");
    expect(suggest("unrelated-command", ["motion", "color"])).toBeNull();
    expect(usageError("Bad flag").exitCode).toBe(2);
  });
});
