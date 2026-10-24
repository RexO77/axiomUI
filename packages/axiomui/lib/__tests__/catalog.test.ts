import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { isSafeRelativeFile, isSkillName, loadBundle, readBundledFile, readPackageVersion } from "../catalog.mjs";
import { CliError } from "../format.mjs";
import { makeBundle, tempDir } from "./helpers";

function fixture() {
  const root = tempDir();
  const bundle = makeBundle(root, { axiomui: { files: { "SKILL.md": "Authored rules.\n" } } });
  return { root, bundle };
}

describe("bundled catalog", () => {
  it("loads a package bundle and verifies its file bytes", () => {
    const { root, bundle } = fixture();
    const loaded = loadBundle(root);
    expect(loaded.catalog).toEqual(bundle.catalog);
    expect(readBundledFile(loaded, loaded.catalog.skills[0], "SKILL.md").toString()).toBe("Authored rules.\n");
  });

  it("finds the repository bundle two levels above the package", () => {
    const { root, bundle } = fixture();
    const packageDir = path.join(root, "packages", "axiomui");
    mkdirSync(packageDir, { recursive: true });
    expect(loadBundle(packageDir).skillsDir).toBe(bundle.skillsDir);
  });

  it("reads package versions without requiring an installed CLI", () => {
    const root = tempDir();
    writeFileSync(path.join(root, "package.json"), JSON.stringify({ version: "1.2.3" }));
    expect(readPackageVersion(root)).toBe("1.2.3");
  });

  it("reports a missing bundle as an actionable CLI error", () => {
    expect(() => loadBundle(tempDir())).toThrow(CliError);
    expect(() => loadBundle(tempDir())).toThrow(/No bundled skills/);
  });

  it.each([
    null,
    { schema: 2, skills: [] },
    { schema: 1, skills: [null] },
    { schema: 1, skills: [{ name: "../escape", files: {} }] },
    { schema: 1, skills: [{ name: "axiomui", files: [] }] },
    { schema: 1, skills: [{ name: "axiomui", files: { "../escape": `sha256:${"a".repeat(64)}` } }] },
    { schema: 1, skills: [{ name: "axiomui", files: { "SKILL.md": "sha256:invalid" } }] },
  ])("rejects malformed catalog data %#", (catalog) => {
    const { root, bundle } = fixture();
    writeFileSync(path.join(bundle.skillsDir, "catalog.json"), JSON.stringify(catalog));
    expect(() => loadBundle(root)).toThrow(CliError);
  });

  it("rejects modified files instead of returning bytes with a stale hash", () => {
    const { bundle } = fixture();
    writeFileSync(path.join(bundle.skillsDir, "axiomui", "SKILL.md"), "Modified.\n");
    expect(() => readBundledFile(bundle, bundle.catalog.skills[0], "SKILL.md")).toThrow(/does not match/);
  });

  it("reports truncated catalog JSON with its path and recovery action", () => {
    const { root, bundle } = fixture();
    writeFileSync(path.join(bundle.skillsDir, "catalog.json"), '{"schema":');
    expect(() => loadBundle(root)).toThrow(CliError);
    expect(() => loadBundle(root)).toThrow(/catalog\.json.*Reinstall axiomui/);
  });

  it("reports missing listed files with their path and recovery action", () => {
    const { bundle } = fixture();
    unlinkSync(path.join(bundle.skillsDir, "axiomui", "SKILL.md"));
    const read = () => readBundledFile(bundle, bundle.catalog.skills[0], "SKILL.md");
    expect(read).toThrow(CliError);
    expect(read).toThrow(/axiomui\/SKILL\.md.*Reinstall axiomui/);
  });

  it("rejects requests for files outside the catalog before reading them", () => {
    const { bundle } = fixture();
    for (const file of ["../outside.md", "missing.md", "toString"]) {
      expect(() => readBundledFile(bundle, bundle.catalog.skills[0], file)).toThrow(CliError);
    }
  });

  it("filters malformed legacy names without breaking a valid catalog", () => {
    const { root, bundle } = fixture();
    const catalog = { ...bundle.catalog, legacy: [null, { name: "../escape" }, bundle.catalog.legacy[0]] };
    writeFileSync(path.join(bundle.skillsDir, "catalog.json"), JSON.stringify(catalog));
    expect(loadBundle(root).catalog.legacy).toEqual(bundle.catalog.legacy);
  });

  it("accepts only skill names and relative file paths that stay within a bundle", () => {
    for (const name of ["axiomui", "axiomui-motion"]) expect(isSkillName(name)).toBe(true);
    for (const name of [null, "", "../axiomui", "AxiomUI", "a".repeat(65)]) expect(isSkillName(name)).toBe(false);
    for (const file of ["SKILL.md", "references/rules/motion-1.md"]) expect(isSafeRelativeFile(file)).toBe(true);
    for (const file of [null, "", "/absolute", "../escape", "a/../../escape", "a\\escape", ".hidden", "a//b"]) {
      expect(isSafeRelativeFile(file)).toBe(false);
    }
  });
});
