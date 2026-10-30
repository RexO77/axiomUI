// @ts-check
// End-to-end smoke test with nothing but node:assert, so it runs on the oldest
// supported Node (CI runs it on 18 and 20). Uses temp folders for the project
// and HOME; the real home directory is never visible to the CLI.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const bin = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../bin/axiomui.mjs");
const root = mkdtempSync(path.join(os.tmpdir(), "axiomui-smoke-"));
const home = path.join(root, "home");
const project = path.join(root, "project");
mkdirSync(path.join(home, ".claude"), { recursive: true });
mkdirSync(path.join(project, ".git"), { recursive: true });

/** @param {...string} args */
function run(...args) {
  const result = spawnSync(process.execPath, [bin, ...args], {
    cwd: project,
    env: { PATH: process.env.PATH ?? "", HOME: home, USERPROFILE: home, NODE_ENV: "test", NO_COLOR: "1" },
    encoding: "utf8",
    timeout: 30_000,
  });
  return { code: result.status, out: result.stdout, err: result.stderr };
}

try {
  let result = run("--version");
  assert.equal(result.code, 0, result.err);

  result = run("add", "--yes");
  assert.equal(result.code, 0, result.err);
  const skill = path.join(project, ".claude/skills/axiomui/SKILL.md");
  assert.ok(existsSync(skill), "add wrote .claude/skills/axiomui/SKILL.md");

  result = run("add", "--yes");
  assert.equal(result.code, 0, result.err);
  assert.match(result.out, /up to date/);

  result = run("list", "--json");
  assert.equal(result.code, 0, result.err);
  const listing = JSON.parse(result.out);
  assert.equal(listing.skills.length, 11, "all 11 complete skills are available");
  assert.equal(listing.installs.length, 3, "the noninteractive default installs the three core skills");

  writeFileSync(skill, "edited\n");
  result = run("update");
  assert.equal(result.code, 3, "an edited file makes update skip the skill");
  assert.equal(readFileSync(skill, "utf8"), "edited\n");

  result = run("update", "--force");
  assert.equal(result.code, 0, result.err);

  result = run("remove", "--yes");
  assert.equal(result.code, 0, result.err);
  assert.ok(!existsSync(path.join(project, ".claude/skills/axiomui")), "remove deleted the skill");

  result = run("add", "--all", "--yes");
  assert.equal(result.code, 0, result.err);
  result = run("list", "--json");
  assert.equal(result.code, 0, result.err);
  assert.equal(JSON.parse(result.out).installs.length, 11, "every bundled skill installs");
  result = run("remove", "--all", "--yes");
  assert.equal(result.code, 0, result.err);
  result = run("list", "--json");
  assert.equal(result.code, 0, result.err);
  assert.equal(JSON.parse(result.out).installs.length, 0, "all managed installs were removed");

  console.log(`smoke ok on Node ${process.versions.node}`);
} finally {
  rmSync(root, { recursive: true, force: true });
}
