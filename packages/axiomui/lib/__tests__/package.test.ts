import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const packageDir = path.resolve(__dirname, "../..");
const pkg = JSON.parse(readFileSync(path.join(packageDir, "package.json"), "utf8"));

describe("axiomui package.json", () => {
  it("has no dependencies of any kind", () => {
    for (const field of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
      expect(pkg[field], field).toBeUndefined();
    }
  });

  it("supports Node 18.17 and ships a runnable bin", () => {
    expect(pkg.engines.node).toBe(">=18.17");
    expect(pkg.bin.axiomui).toBe("bin/axiomui.mjs");
    expect(readFileSync(path.join(packageDir, pkg.bin.axiomui), "utf8").startsWith("#!/usr/bin/env node\n")).toBe(true);
  });

  it("packs the skills, the bin and the library, but not tests or scripts", () => {
    expect(pkg.files).toEqual(expect.arrayContaining(["bin", "skills", "lib/*.mjs", "README.md", "LICENSE"]));
    expect(pkg.files.some((entry: string) => /test|scripts/.test(entry))).toBe(false);
  });

  it("wires the publication license preflight", () => {
    expect(pkg.scripts.prepublishOnly).toBe("node scripts/bundle-skills.mjs --require-license");
  });

  it("uses the owner-selected MIT license", () => {
    expect(pkg.license).toBe("MIT");
    const license = readFileSync(path.resolve(packageDir, "../../LICENSE"), "utf8");
    expect(license).toContain("MIT License");
    expect(license).toContain("Copyright (c) 2026 Nischal Skanda");
  });

  it("is authored by the owner", () => {
    expect(pkg.author).toBe("Nischal Skanda");
  });

  it("has no attribution in package metadata", () => {
    const root = path.resolve(packageDir, "../..");
    const script = readFileSync(path.join(root, "scripts/check-attribution.sh"), "utf8");
    const source = /^readonly PATTERN='(.+)'$/m.exec(script)![1].replaceAll("[[:space:]]", "\\s");
    const attribution = new RegExp(source, "iu");
    for (const file of ["README.md", "package.json"]) {
      expect(readFileSync(path.join(packageDir, file), "utf8"), file).not.toMatch(attribution);
    }
  });
});
