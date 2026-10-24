import { existsSync, mkdirSync, symlinkSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { displayPath } from "../format.mjs";
import { assertProjectScopeAllowed, customTarget, detectAgents, knownTargets, parseAgents, resolveTargets } from "../targets.mjs";
import { tempDir } from "./helpers";

function fakeMachine(dirs: string[], env: Record<string, string> = {}) {
  const root = tempDir();
  const home = path.join(root, "home");
  const cwd = path.join(root, "project");
  const etcDir = path.join(root, "etc");
  for (const dir of [home, cwd, etcDir, ...dirs.map((dir) => path.join(root, dir))]) {
    mkdirSync(dir, { recursive: true });
  }
  return { root, context: { home, cwd, etcDir, env } };
}

describe("detectAgents", () => {
  it("detects each agent from its home folder", () => {
    const { context } = fakeMachine([
      "home/.claude", "home/.codex", "home/.cursor", "home/.config/opencode", "home/.gemini", "home/.copilot", "home/.codeium/windsurf",
    ]);
    expect(detectAgents(context)).toEqual(["claude", "codex", "cursor", "opencode", "gemini", "copilot", "windsurf"]);
  });

  it("detects nothing on an empty machine, and never detects universal", () => {
    expect(detectAgents(fakeMachine([]).context)).toEqual([]);
  });

  it("honours CLAUDE_CONFIG_DIR, CODEX_HOME, XDG_CONFIG_HOME and /etc/codex", () => {
    const { root, context } = fakeMachine(["claude-config", "xdg/opencode"]);
    context.env = { CLAUDE_CONFIG_DIR: path.join(root, "claude-config"), XDG_CONFIG_HOME: path.join(root, "xdg") };
    expect(detectAgents(context)).toEqual(["claude", "opencode"]);

    const etc = fakeMachine(["etc/codex"]);
    expect(detectAgents(etc.context)).toEqual(["codex"]);

    const override = fakeMachine(["custom-codex"]);
    override.context.env = { CODEX_HOME: path.join(override.root, "custom-codex") };
    expect(detectAgents(override.context)).toEqual(["codex"]);
  });
});

describe("resolveTargets", () => {
  it("dedupes agents that share .agents/skills, Claude first", () => {
    const { context } = fakeMachine([]);
    const targets = resolveTargets(["codex", "cursor", "claude"], "project", context);
    expect(targets.map((target) => path.relative(context.cwd, target.dir))).toEqual([".claude/skills", ".agents/skills"]);
    expect(targets[1].agents).toEqual(["Codex", "Cursor"]);
    expect(targets.every((target) => !existsSync(target.dir))).toBe(true);
  });

  it("puts global installs in the user folders, honouring CLAUDE_CONFIG_DIR", () => {
    const { root, context } = fakeMachine([]);
    context.env = { CLAUDE_CONFIG_DIR: path.join(root, "claude-config") };
    const dirs = resolveTargets(["claude", "gemini"], "global", context).map((target) => target.dir);
    expect(dirs).toEqual([path.join(root, "claude-config", "skills"), path.join(context.home, ".agents", "skills")]);
  });

  it("refuses a project install from the home directory", () => {
    const { context } = fakeMachine([]);
    expect(() => assertProjectScopeAllowed({ ...context, cwd: context.home })).toThrow(/--global/);
    expect(() => assertProjectScopeAllowed(context)).not.toThrow();
  });

  it("treats a .claude/skills linked to .agents/skills as one folder", () => {
    const { context } = fakeMachine([]);
    mkdirSync(path.join(context.cwd, ".agents/skills"), { recursive: true });
    mkdirSync(path.join(context.cwd, ".claude"));
    symlinkSync("../.agents/skills", path.join(context.cwd, ".claude/skills"));
    expect(resolveTargets(["claude", "codex"], "project", context)).toHaveLength(1);
    expect(knownTargets(["project"], context)).toHaveLength(1);
  });
});

describe("parseAgents", () => {
  it("accepts aliases, commas and repeats in a stable order", () => {
    expect(parseAgents(["claude-code,cursor", "github-copilot", "cursor"])).toEqual(["claude", "cursor", "copilot"]);
    expect(parseAgents(["all"])).toContain("universal");
  });

  it("rejects empty and unknown selections as usage errors", () => {
    for (const input of [[], [" , "], ["constructor"], ["cursr"]]) {
      try {
        parseAgents(input);
        throw new Error("expected a usage error");
      } catch (error) {
        expect(error).toMatchObject({ exitCode: 2 });
      }
    }
    expect(() => parseAgents(["cursr"])).toThrow(/Did you mean "cursor"/);
  });
});

describe("customTarget and displayPath", () => {
  it("expands a leading ~ against the home folder", () => {
    const { context } = fakeMachine([]);
    expect(customTarget("~/x", context).dir).toBe(path.join(context.home, "x"));
    expect(customTarget("~", context).dir).toBe(context.home);
    expect(customTarget("x/~", context).dir).toBe(path.join(context.cwd, "x/~"));
  });

  it("never prints a project folder named ~ as if it were the home folder", () => {
    const { context } = fakeMachine([]);
    expect(displayPath(path.join(context.cwd, "~", "x"), context)).toBe("./~/x");
    expect(displayPath(path.join(context.home, "x"), context)).toBe("~/x");
  });
});
