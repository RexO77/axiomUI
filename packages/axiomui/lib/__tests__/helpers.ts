import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach } from "vitest";

import { sha256, type Bundle, type CatalogSkill } from "../catalog.mjs";

const made: string[] = [];

afterEach(() => {
  for (const dir of made.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

/** A fresh temp folder, removed after the test. Never the real home. */
export function tempDir(prefix = "axiomui-test-"): string {
  const dir = mkdtempSync(path.join(os.tmpdir(), prefix));
  made.push(dir);
  return dir;
}

export function writeTree(root: string, files: Record<string, string>): void {
  for (const [file, content] of Object.entries(files)) {
    const target = path.join(root, file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
}

type FixtureSkill = { group?: "core" | "domain"; aliases?: string[]; files: Record<string, string> };

/** A hand-made bundle, so install behaviour is tested independently of the real rules. */
export function makeBundle(root: string, skills: Record<string, FixtureSkill>): Bundle {
  const skillsDir = path.join(root, "skills");
  const entries: CatalogSkill[] = Object.entries(skills).map(([name, skill]) => {
    writeTree(path.join(skillsDir, name), skill.files);
    return {
      name,
      group: skill.group ?? "core",
      title: name,
      summary: `Summary of ${name}.`,
      ruleCount: 1,
      aliases: skill.aliases ?? [],
      files: Object.fromEntries(Object.entries(skill.files).map(([file, content]) => [file, sha256(content)])),
    };
  });
  const catalog = {
    schema: 1,
    site: "https://axiomui.nischal.fyi",
    repo: "RexO77/axiomUI",
    skills: entries,
    legacy: [{ name: "axiom-website-upgrade", replacedBy: "axiomui-website-upgrade", sha256: [sha256("old pristine\n").slice(7)] }],
  };
  writeFileSync(path.join(skillsDir, "catalog.json"), JSON.stringify(catalog, null, 2));
  return { catalog, skillsDir };
}
