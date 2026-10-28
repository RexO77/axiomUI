import { describe, expect, it } from "vitest";

import { type Catalog } from "../catalog.mjs";
import { renderSkillsTree } from "@/lib/skills/render";
import { parseCommandLine, resolveSkills } from "../cli.mjs";
import { parseAgents } from "../targets.mjs";

const catalog = JSON.parse(renderSkillsTree(null).get("skills/catalog.json")!) as Catalog;
const names = (list: { name: string }[]) => list.map((skill) => skill.name);

function usage(run: () => unknown): string {
  try {
    run();
  } catch (error) {
    expect((error as { exitCode?: number }).exitCode).toBe(2);
    return (error as Error).message;
  }
  throw new Error("expected a usage error");
}

describe("parseCommandLine", () => {
  it("maps command aliases and keeps skill names", () => {
    expect(parseCommandLine(["i", "motion"])).toMatchObject({ command: "add", names: ["motion"] });
    expect(parseCommandLine(["ls"]).command).toBe("list");
    expect(parseCommandLine(["rm", "audit"]).command).toBe("remove");
    expect(parseCommandLine([]).command).toBeNull();
  });

  it("reads every flag, and --json implies --yes", () => {
    const { flags } = parseCommandLine([
      "add", "-a", "claude", "--agent", "codex,cursor", "-g", "--dry-run", "--force", "--json", "--no-color",
    ]);
    expect(flags).toMatchObject({ agent: ["claude", "codex,cursor"], global: true, dryRun: true, force: true, json: true, yes: true, noColor: true });
  });

  it("rejects an unknown flag or command with a suggestion", () => {
    expect(usage(() => parseCommandLine(["add", "--dry-rn"]))).toMatch(/--dry-rn.*Did you mean "--dry-run"/);
    expect(usage(() => parseCommandLine(["ad"]))).toMatch(/Did you mean "add"/);
    expect(usage(() => parseCommandLine(["add", "--dir"]))).toMatch(/--dir/);
  });

  it.each(["constructor", "__proto__", "toString", "hasOwnProperty"])("rejects inherited command %s", (command) => {
    expect(usage(() => parseCommandLine([command]))).toContain(`Unknown command "${command}"`);
  });
});

describe("resolveSkills", () => {
  it("accepts names, aliases and group words, in catalog order without duplicates", () => {
    expect(names(resolveSkills(["motion", "axiomui-audit", "audit"], catalog.skills))).toEqual(["axiomui-audit", "axiomui-motion"]);
    expect(names(resolveSkills(["upgrade", "playbook"], catalog.skills))).toEqual(["axiomui-website-upgrade"]);
    expect(names(resolveSkills(["core"], catalog.skills))).toEqual(["axiomui", "axiomui-website-upgrade", "axiomui-audit"]);
    expect(resolveSkills(["domains"], catalog.skills).every((skill) => skill.group === "domain")).toBe(true);
    expect(resolveSkills(["all"], catalog.skills)).toHaveLength(catalog.skills.length);
  });

  it("rejects an unknown skill with the nearest name", () => {
    expect(usage(() => resolveSkills(["motoin"], catalog.skills))).toMatch(/Did you mean "motion"/);
  });
});

describe("parseAgents", () => {
  it("accepts ids, skills-CLI spellings, commas, repeats and all", () => {
    expect(parseAgents(["claude-code,gemini-cli", "github-copilot"])).toEqual(["claude", "gemini", "copilot"]);
    expect(parseAgents(["all"])).toContain("universal");
  });

  it("rejects an unknown agent with a suggestion", () => {
    expect(usage(() => parseAgents(["cursr"]))).toMatch(/Did you mean "cursor"/);
  });
});
