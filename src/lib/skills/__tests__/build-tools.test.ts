import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { renderSkillsTree } from "@/lib/skills/render";

const repoRoot = path.resolve(__dirname, "../../../..");
const roots: string[] = [];
// Hooks export Git's own repository/index settings. Fixtures must never inherit
// those settings or their git init/add commands can reach the caller's repo.
const fixtureEnv = { ...process.env };
for (const key of Object.keys(fixtureEnv)) if (key.startsWith("GIT_")) delete fixtureEnv[key];
const markers = "Before\n<!-- skills:start -->\nold table\n<!-- skills:end -->\nAfter\n";

function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), "axiom-build-"));
  roots.push(root);
  cpSync(path.join(repoRoot, "src"), path.join(root, "src"), { recursive: true });
  cpSync(path.join(repoRoot, "scripts"), path.join(root, "scripts"), { recursive: true });
  mkdirSync(path.join(root, "packages/axiomui"), { recursive: true });
  writeFileSync(path.join(root, "README.md"), markers);
  writeFileSync(path.join(root, "packages/axiomui/README.md"), markers);
  expect(spawnSync("git", ["init", "--quiet", root], { env: fixtureEnv }).status).toBe(0);
  return root;
}

function run(root: string, ...args: string[]) {
  return spawnSync(process.execPath, ["--import", "./scripts/lib/register-ts.mjs", "scripts/build-skills.mjs", ...args], {
    cwd: root, env: fixtureEnv, encoding: "utf8", timeout: 30_000,
  });
}

function git(root: string, ...args: string[]) {
  const result = spawnSync("git", args, { cwd: root, env: fixtureEnv, encoding: "utf8" });
  expect(result.status, result.stderr).toBe(0);
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("skill generation command", () => {
  it("writes the complete renderer tree and marker tables, then checks without changes", () => {
    const root = fixture();
    const built = run(root);
    expect(built.status, built.stderr).toBe(0);
    expect(built.stdout).toContain("skills built: 11 skills");
    for (const [file, content] of renderSkillsTree()) {
      expect(readFileSync(path.join(root, file), "utf8"), file).toBe(content);
    }
    for (const file of ["README.md", "packages/axiomui/README.md"]) {
      const text = readFileSync(path.join(root, file), "utf8");
      expect(text).toMatch(/^Before\n<!-- skills:start -->\n/);
      expect(text).toMatch(/<!-- skills:end -->\nAfter\n$/);
      expect(text).toContain("axiomui-audit");
    }
    const check = run(root, "--check");
    expect(check.status, check.stderr).toBe(0);
    expect(check.stdout).toContain("skills in sync: 11 skills");
    expect(run(root).stdout).toContain("0 added, 0 updated, 0 removed");
  });

  it("reports missing, stale and extra output without mutating it, then repairs all three", () => {
    const root = fixture();
    expect(run(root).status).toBe(0);
    const missing = path.join(root, "skills/axiomui/SKILL.md");
    const stale = path.join(root, "skills/catalog.json");
    const extra = path.join(root, "skills/retired/extra.md");
    rmSync(missing);
    writeFileSync(stale, "stale");
    mkdirSync(path.dirname(extra), { recursive: true });
    writeFileSync(extra, "extra");
    const check = run(root, "--check");
    expect(check.status).toBe(1);
    expect(check.stderr).toContain("missing  skills/axiomui/SKILL.md");
    expect(check.stderr).toContain("stale    skills/catalog.json");
    expect(check.stderr).toContain("extra    skills/retired/extra.md");
    expect(existsSync(missing)).toBe(false);
    expect(readFileSync(stale, "utf8")).toBe("stale");
    expect(existsSync(extra)).toBe(true);
    expect(run(root).status).toBe(0);
    expect(existsSync(path.dirname(extra))).toBe(false);
    expect(run(root, "--check").status).toBe(0);
  });

  it("ignores untracked ignored litter during checks but removes it when generating", () => {
    const root = fixture();
    expect(run(root).status).toBe(0);
    writeFileSync(path.join(root, ".gitignore"), "skills/axiomui/.DS_Store\n");
    const litter = path.join(root, "skills/axiomui/.DS_Store");
    writeFileSync(litter, "OS metadata");
    expect(run(root, "--check").status).toBe(0);
    expect(existsSync(litter)).toBe(true);
    expect(run(root).status).toBe(0);
    expect(existsSync(litter)).toBe(false);
  });

  it("refuses missing README markers before writing any generated output", () => {
    const root = fixture();
    writeFileSync(path.join(root, "README.md"), "No marker region\n");
    expect(run(root).status).not.toBe(0);
    expect(existsSync(path.join(root, "skills"))).toBe(false);
    expect(readFileSync(path.join(root, "README.md"), "utf8")).toBe("No marker region\n");
  });

  it.each(["skills", "public/skills", "README.md"])("refuses a linked %s without touching its destination", (file) => {
    const root = fixture();
    const outside = mkdtempSync(path.join(os.tmpdir(), "axiom-outside-"));
    roots.push(outside);
    writeFileSync(path.join(outside, "README.md"), markers);
    const target = file === "README.md" ? path.join(outside, "README.md") : outside;
    rmSync(path.join(root, file), { recursive: true, force: true });
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    symlinkSync(target, path.join(root, file));
    const result = run(root);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Refusing symbolic link");
    expect(readFileSync(path.join(outside, "README.md"), "utf8")).toBe(markers);
    expect(existsSync(path.join(outside, "catalog.json"))).toBe(false);
  });

  it("uses only the indexed lock to hide tracked third-party agent skills", () => {
    const root = fixture();
    expect(run(root).status).toBe(0);
    mkdirSync(path.join(root, ".agents/skills/third-party"), { recursive: true });
    writeFileSync(path.join(root, ".agents/skills/third-party/SKILL.md"), "---\nname: Third Party\n---\nprivate\n");
    git(root, "add", ".agents/skills/third-party/SKILL.md");
    writeFileSync(path.join(root, "skills-lock.json"), JSON.stringify({ skills: { "third-party": {} } }));
    const untrackedLock = run(root, "--check");
    expect(untrackedLock.status).toBe(1);
    expect(untrackedLock.stderr).toContain(".agents/skills/third-party/SKILL.md");
    git(root, "add", "skills-lock.json");
    expect(run(root, "--check").status).toBe(0);
  });

  it("resolves aliases, relative and directory TypeScript imports in plain Node", () => {
    const root = fixture();
    mkdirSync(path.join(root, "src/probe"), { recursive: true });
    writeFileSync(path.join(root, "src/probe/value.ts"), "export const value: number = 7;\n");
    writeFileSync(path.join(root, "src/probe/index.ts"), "export { value } from './value';\n");
    writeFileSync(path.join(root, "src/probe/run.ts"), "import { value } from '@/probe'; import { value as relative } from './value'; console.log(value + relative);\n");
    const result = spawnSync(process.execPath, ["--import", "./scripts/lib/register-ts.mjs", "src/probe/run.ts"], { cwd: root, env: fixtureEnv, encoding: "utf8" });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout.trim()).toBe("14");
  });
});
