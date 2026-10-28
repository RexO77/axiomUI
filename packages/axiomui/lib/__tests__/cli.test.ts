import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, renameSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PassThrough } from "node:stream";
import { pathToFileURL } from "node:url";
import { renderSkillsTree } from "@/lib/skills/render";
import { describe, expect, it } from "vitest";

import { tempDir, writeTree } from "./helpers";
import { main } from "../cli.mjs";
import { sha256 } from "../catalog.mjs";

const cliModule = pathToFileURL(path.resolve(__dirname, "../cli.mjs")).href;
const pkg = { version: "0.1.0" };
const tree = renderSkillsTree(null);

/** A project and a home of our own; the real home is never visible to the CLI. */
function machine({ claude = false } = {}) {
  const root = realpathSync(tempDir());
  const home = path.join(root, "home");
  const cwd = path.join(root, "project");
  const packageDir = path.join(root, "package");
  writeTree(packageDir, {
    ...Object.fromEntries([...tree].filter(([file]) => file.startsWith("skills/"))),
    "package.json": JSON.stringify(pkg),
  });
  const bin = path.join(root, "run.mjs");
  writeFileSync(bin, `import os from "node:os";
import { main } from ${JSON.stringify(cliModule)};
process.exitCode = await main({argv:process.argv.slice(2),env:process.env,cwd:process.cwd(),home:os.homedir(),
stdin:process.stdin,stdout:process.stdout,stderr:process.stderr,
packageDir:${JSON.stringify(packageDir)},etcDir:${JSON.stringify(path.join(root, "etc"))}});
`);
  mkdirSync(home, { recursive: true });
  mkdirSync(path.join(cwd, ".git"), { recursive: true });
  if (claude) {
    mkdirSync(path.join(home, ".claude"));
  }
  const run = (args: string[], options: { cwd?: string } = {}) => {
    const result = spawnSync(process.execPath, [bin, ...args], {
      cwd: options.cwd ?? cwd,
      env: { PATH: process.env.PATH ?? "", HOME: home, NO_COLOR: "1" } as unknown as NodeJS.ProcessEnv,
      encoding: "utf8",
    });
    return { code: result.status, stdout: result.stdout, stderr: result.stderr };
  };
  return { root, home, cwd, run, packageDir };
}

describe("axiomui (non-TTY, the way an agent runs it)", () => {
  it("leaves installed skills untouched when a command names an inherited property", () => {
    const { cwd, run } = machine();
    expect(run(["add", "motion", "--agent", "claude", "--yes"]).code).toBe(0);
    const skill = path.join(cwd, ".claude/skills/axiomui-motion/SKILL.md");
    const before = readFileSync(skill, "utf8");
    for (const command of ["constructor", "__proto__"]) {
      const result = run([command, "--yes"]);
      expect(result.code).toBe(2);
      expect(result.stderr).toContain("Unknown command");
      expect(readFileSync(skill, "utf8")).toBe(before);
    }
  });

  it("installs the core skills for Claude Code with --yes and names the path", () => {
    const { cwd, run } = machine();
    const result = run(["add", "--agent", "claude", "--yes"]);
    expect(result.stderr).toBe("");
    expect(result.code).toBe(0);
    expect(existsSync(path.join(cwd, ".claude/skills/axiomui/SKILL.md"))).toBe(true);
    expect(existsSync(path.join(cwd, ".claude/skills/axiomui-audit/references/checklists/motion.md"))).toBe(true);
    expect(result.stdout).toContain(".claude/skills");
    expect(result.stdout).toContain("+ axiomui ");
  });

  it("defaults to detected agents, then to .agents/skills when none are detected", () => {
    const detected = machine({ claude: true });
    expect(detected.run(["add"]).code).toBe(0);
    expect(existsSync(path.join(detected.cwd, ".claude/skills/axiomui/SKILL.md"))).toBe(true);
    expect(existsSync(path.join(detected.cwd, ".agents"))).toBe(false);

    const bare = machine();
    const result = bare.run(["add"]);
    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/No agents detected/);
    expect(existsSync(path.join(bare.cwd, ".agents/skills/axiomui-website-upgrade/SKILL.md"))).toBe(true);
  });

  it("is idempotent, exits 3 on an edited file, and overwrites it with --force", () => {
    const { cwd, run } = machine();
    expect(run(["add", "motion", "-a", "claude"]).code).toBe(0);
    expect(run(["add", "motion", "-a", "claude"]).stdout).toContain("up to date");

    // A newer bundle would now try to update this file; simulate by editing.
    const file = path.join(cwd, ".claude/skills/axiomui-motion/SKILL.md");
    writeFileSync(file, "my edits\n");
    const skipped = run(["add", "motion", "-a", "claude"]);
    // An edited file that still differs from the bundle is a conflict.
    expect(skipped.code).toBe(3);
    expect(skipped.stdout).toContain("--force");
    expect(readFileSync(file, "utf8")).toBe("my edits\n");

    expect(run(["add", "motion", "-a", "claude", "--force"]).code).toBe(0);
    expect(readFileSync(file, "utf8")).not.toBe("my edits\n");
  });

  it("writes nothing on --dry-run", () => {
    const { cwd, run } = machine();
    const result = run(["add", "--all", "-a", "all", "--dry-run"]);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("will install");
    expect(existsSync(path.join(cwd, ".claude"))).toBe(false);
    expect(existsSync(path.join(cwd, ".agents"))).toBe(false);
  });

  it("installs globally with -g and refuses a project install from the home directory", () => {
    const { home, run } = machine();
    expect(run(["add", "audit", "-g", "-a", "codex"]).code).toBe(0);
    expect(existsSync(path.join(home, ".agents/skills/axiomui-audit/SKILL.md"))).toBe(true);

    const refused = run(["add", "-a", "claude"], { cwd: home });
    expect(refused.code).toBe(2);
    expect(refused.stderr).toMatch(/--global/);
  });

  it("prints machine-readable results with --json", () => {
    const { run } = machine();
    const added = JSON.parse(run(["add", "a11y", "-a", "claude", "--json"]).stdout);
    expect(added).toMatchObject({ version: pkg.version, scope: "project" });
    expect(added.results[0]).toMatchObject({ skill: "axiomui-accessibility", action: "install" });

    const listed = JSON.parse(run(["list", "--json"]).stdout);
    expect(listed.skills.length).toBeGreaterThanOrEqual(11);
    expect(listed.installs).toEqual([
      expect.objectContaining({ skill: "axiomui-accessibility", status: "up to date", version: pkg.version }),
    ]);
  });

  it("updates and removes what it installed, project and global", () => {
    const { cwd, home, run } = machine();
    run(["add", "core", "-a", "claude"]);
    run(["add", "motion", "-g", "-a", "cursor"]);
    const updated = run(["update"]);
    expect(updated.code).toBe(0);
    expect(updated.stdout.match(/up to date/g)?.length).toBe(4);

    expect(run(["remove", "upgrade"]).code).toBe(0);
    expect(existsSync(path.join(cwd, ".claude/skills/axiomui-website-upgrade"))).toBe(false);
    expect(existsSync(path.join(cwd, ".claude/skills/axiomui/SKILL.md"))).toBe(true);

    expect(run(["remove", "-g"]).code).toBe(0);
    expect(existsSync(path.join(home, ".agents/skills/axiomui-motion"))).toBe(false);
  });

  it("applies list target filters consistently", () => {
    const { cwd, root, run } = machine();
    expect(run(["add", "motion", "-a", "claude"]).code).toBe(0);
    expect(run(["add", "audit", "-a", "codex", "-g"]).code).toBe(0);
    const custom = path.join(root, "custom");
    expect(run(["add", "upgrade", "--dir", custom]).code).toBe(0);
    expect(JSON.parse(run(["list", "--global", "--json"]).stdout).installs).toEqual([
      expect.objectContaining({ skill: "axiomui-audit", scope: "global" }),
    ]);
    expect(JSON.parse(run(["list", "-a", "claude", "--json"]).stdout).installs).toEqual([
      expect.objectContaining({ skill: "axiomui-motion", dir: path.join(cwd, ".claude/skills") }),
    ]);
    expect(JSON.parse(run(["list", "--dir", custom, "--json"]).stdout).installs).toEqual([
      expect.objectContaining({ skill: "axiomui-website-upgrade", dir: custom }),
    ]);
  });

  it("honors --all on update even when a skill name is supplied", () => {
    const { cwd, run } = machine();
    expect(run(["add", "motion", "audit", "-a", "claude"]).code).toBe(0);
    for (const name of ["axiomui-motion", "axiomui-audit"]) {
      writeFileSync(path.join(cwd, `.claude/skills/${name}/SKILL.md`), "my edit\n");
    }
    expect(run(["update", "motion", "--all", "--force"]).code).toBe(0);
    for (const name of ["axiomui-motion", "axiomui-audit"]) {
      expect(readFileSync(path.join(cwd, `.claude/skills/${name}/SKILL.md`), "utf8")).not.toBe("my edit\n");
    }
  });

  it("removes retired managed skills with --all", () => {
    const { cwd, run } = machine();
    writeTree(cwd, {
      ".claude/skills/retired-skill/SKILL.md": "old skill\n",
      ".claude/skills/retired-skill/.axiomui.json": JSON.stringify({
        tool: "axiomui", version: "0.0.1", skill: "retired-skill", files: { "SKILL.md": sha256("old skill\n") },
      }),
    });
    expect(run(["remove", "--all"]).code).toBe(0);
    expect(existsSync(path.join(cwd, ".claude/skills/retired-skill"))).toBe(false);
  });

  it("keeps the old download when its replacement is incomplete and conflicted", () => {
    const { cwd, run } = machine();
    expect(run(["add", "upgrade", "-a", "claude"]).code).toBe(0);
    const replacement = path.join(cwd, ".claude/skills/axiomui-website-upgrade");
    writeFileSync(path.join(replacement, "references/rules/typo-1.md"), "my rule edit\n");
    unlinkSync(path.join(replacement, "SKILL.md"));
    const old = path.join(cwd, ".claude/skills/axiom-website-upgrade/SKILL.md");
    writeTree(path.dirname(old), { "SKILL.md": tree.get("public/skills/axiom-website-upgrade/SKILL.md")! });
    expect(run(["update", "--yes"]).code).toBe(3);
    expect(existsSync(old)).toBe(true);
  });

  it("rejects a destination redirected during installation confirmation", async () => {
    const { root, cwd, home, packageDir } = machine();
    const target = path.join(root, "target");
    const outside = path.join(root, "outside");
    mkdirSync(target); mkdirSync(outside);
    const stdin = Object.assign(new PassThrough(), { isTTY: true });
    const stdout = Object.assign(new PassThrough(), { isTTY: true });
    const stderr = new PassThrough(); let error = "";
    stderr.on("data", (chunk) => { error += chunk.toString(); });
    let prompted = false;
    stdout.on("data", (chunk) => {
      if (!prompted && chunk.toString().includes("Install 1 skill")) {
        prompted = true;
        renameSync(target, path.join(root, "saved-target"));
        symlinkSync(outside, target);
        stdin.write("y\n");
      }
    });
    expect(await main({ argv: ["add", "motion", "--dir", target], env: {}, cwd, home,
      packageDir, etcDir: path.join(root, "etc"), stdin, stdout, stderr })).toBe(1);
    expect(prompted).toBe(true);
    expect(error).toMatch(/changed/);
    expect(readdirSync(outside)).toEqual([]);
  });

  it.each([["ad", "--json"], ["add", "--bogus", "--json"], ["add", "--dir", "--json"]])(
    "keeps usage errors machine-readable for %j", (...argv) => {
      const { run } = machine();
      const result = run(argv);
      expect(result.code).toBe(2);
      expect(JSON.parse(result.stdout)).toEqual({ error: expect.any(String) });
    }
  );

  it("does not treat a positional --json after the option terminator as a flag", () => {
    const { run } = machine();
    expect(run(["--", "--json"]).stdout).toBe("");
  });

  it("preserves a legacy download edited during its confirmation", async () => {
    const { root, cwd, home, packageDir, run } = machine();
    const target = path.join(root, "custom");
    expect(run(["add", "upgrade", "--dir", target]).code).toBe(0);
    const old = path.join(target, "axiom-website-upgrade/SKILL.md");
    writeTree(path.dirname(old), { "SKILL.md": tree.get("public/skills/axiom-website-upgrade/SKILL.md")! });
    const stdin = Object.assign(new PassThrough(), { isTTY: true });
    const stdout = Object.assign(new PassThrough(), { isTTY: true });
    const stderr = new PassThrough(); stderr.resume();
    let prompted = false;
    stdout.on("data", (chunk) => {
      if (!prompted && chunk.toString().includes("Remove the old copy")) {
        prompted = true;
        writeFileSync(old, "new user notes\n");
        stdin.write("y\n");
      }
    });
    expect(await main({ argv: ["add", "upgrade", "--dir", target], env: {}, cwd, home,
      packageDir, etcDir: path.join(root, "etc"), stdin, stdout, stderr })).toBe(0);
    expect(prompted).toBe(true);
    expect(readFileSync(old, "utf8")).toBe("new user notes\n");
  });

  it("prints its version, and usage with exit 2 when run bare", () => {
    const { run } = machine();
    expect(run(["--version"]).stdout.trim()).toBe(pkg.version);
    const bare = run([]);
    expect(bare.code).toBe(2);
    expect(bare.stderr).toContain("Usage");
  });

  it("removes an old site download only when its replacement is installed there, and only on --yes", () => {
    const { cwd, run, packageDir } = machine();
    const catalog = JSON.parse(readFileSync(path.join(packageDir, "skills/catalog.json"), "utf8"));
    const pristine = tree.get("public/skills/axiom-website-upgrade/SKILL.md")!;
    expect(catalog.legacy[0].name).toBe("axiom-website-upgrade");
    const old = path.join(cwd, ".claude/skills/axiom-website-upgrade/SKILL.md");
    writeTree(cwd, { ".claude/skills/axiom-website-upgrade/SKILL.md": pristine });

    // The replacement is not part of this run: the old copy stays, with a hint.
    const motionOnly = run(["add", "motion", "-a", "claude", "--yes"]);
    expect(motionOnly.code).toBe(0);
    expect(motionOnly.stdout).toContain("npx axiomui@latest add upgrade");
    expect(existsSync(old)).toBe(true);
    expect(run(["update", "--yes"]).code).toBe(0);
    expect(existsSync(old)).toBe(true);

    // --json alone never deletes it.
    const json = JSON.parse(run(["add", "upgrade", "-a", "claude", "--json"]).stdout);
    expect(json.notes.join(" ")).toMatch(/--yes/);
    expect(existsSync(old)).toBe(true);

    expect(run(["add", "upgrade", "-a", "claude", "--yes"]).stdout).toMatch(/Removed/);
    expect(existsSync(old)).toBe(false);
  });

  it("updates and removes through a symlinked skills folder, planning it once", () => {
    const { root, home, run } = machine();
    mkdirSync(path.join(root, "dotfiles/skills"), { recursive: true });
    mkdirSync(path.join(home, ".claude"));
    symlinkSync(path.join(root, "dotfiles/skills"), path.join(home, ".claude/skills"));
    expect(run(["add", "motion", "-g", "-a", "claude"]).code).toBe(0);
    const updated = run(["update", "-g"]);
    expect(updated.stdout).toContain("= axiomui-motion");
    const listed = JSON.parse(run(["list", "--json"]).stdout);
    expect(listed.installs).toEqual([expect.objectContaining({ skill: "axiomui-motion", version: pkg.version })]);
    expect(run(["remove", "-g"]).stdout).toContain("- axiomui-motion");
    expect(readdirSync(path.join(root, "dotfiles/skills"))).toEqual([]);

    // A project .claude/skills linked to .agents/skills is one folder, not two.
    const project = machine();
    mkdirSync(path.join(project.cwd, ".agents/skills"), { recursive: true });
    mkdirSync(path.join(project.cwd, ".claude"));
    symlinkSync("../.agents/skills", path.join(project.cwd, ".claude/skills"));
    const both = JSON.parse(project.run(["add", "motion", "-a", "claude,codex", "--json"]).stdout);
    expect(both.results).toHaveLength(1);
    expect(project.run(["remove"]).stdout).toContain("- axiomui-motion");
  });

  it("expands ~ in --dir, and rejects an empty --dir", () => {
    const { cwd, home, run } = machine();
    const result = run(["add", "motion", "--dir=~/my-skills"]);
    expect(result.code).toBe(0);
    expect(existsSync(path.join(home, "my-skills/axiomui-motion/SKILL.md"))).toBe(true);
    expect(existsSync(path.join(cwd, "~"))).toBe(false);
    expect(result.stdout).toContain("~/my-skills");

    const empty = run(["add", "motion", "--dir="]);
    expect(empty.code).toBe(2);
    expect(empty.stderr).toMatch(/--dir needs a path/);
  });

  it("exits 2 on an unknown skill, agent or flag", () => {
    const { run } = machine();
    expect(run(["add", "motoin"]).code).toBe(2);
    expect(run(["add", "-a", "cursr"]).code).toBe(2);
    expect(run(["add", "--frce"]).code).toBe(2);
  });
});
