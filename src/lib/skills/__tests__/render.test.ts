import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { rules } from "@/data/ui-logic";
import { fullCorpusMarkdown } from "@/lib/rule-corpus";
import { skillAuthor, skillCatalog } from "@/lib/skills/catalog";
import {
  generatedRootsFor,
  renderSkillsTable,
  markerEnd,
  markerStart,
  readTemplate,
  readPackageLicense,
  renderSkillsTree,
  renderTemplate,
  replaceMarkerRegion,
} from "@/lib/skills/render";

const tree = renderSkillsTree();
const repoRoot = path.resolve(__dirname, "../../../..");
const sha256 = (content: string) => createHash("sha256").update(content, "utf8").digest("hex");

/** Files of one skill, keyed by their path inside the skill directory. */
function skillFiles(name: string): Map<string, string> {
  const prefix = `skills/${name}/`;
  return new Map(
    [...tree.entries()]
      .filter(([file]) => file.startsWith(prefix))
      .map(([file, content]) => [file.slice(prefix.length), content])
  );
}

/** Just enough YAML for the frontmatter this generator writes: flat keys plus one nested map. */
function parseFrontmatter(content: string): Record<string, string | Record<string, string>> {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(content);
  if (!match) {
    throw new Error("no frontmatter");
  }
  const data: Record<string, string | Record<string, string>> = {};
  let nested: Record<string, string> | null = null;
  for (const line of match[1].split("\n")) {
    const child = /^ {2}([a-z-]+): (.+)$/.exec(line);
    const top = /^([a-z-]+):(?: (.+))?$/.exec(line);
    if (child && nested) {
      nested[child[1]] = child[2];
    } else if (top && top[2] === undefined) {
      nested = {};
      data[top[1]] = nested;
    } else if (top) {
      nested = null;
      data[top[1]] = top[2];
    } else {
      throw new Error(`unparseable frontmatter line: ${line}`);
    }
  }
  return data;
}

describe("renderSkillsTree", () => {
  it("is deterministic", () => {
    expect([...renderSkillsTree()]).toEqual([...tree]);
  });

  it("leaves no placeholders, carriage returns, trailing spaces or clock values", () => {
    const nowToTheHour = new Date().toISOString().slice(0, 13);
    for (const [file, content] of tree) {
      expect(content, file).not.toContain("{{");
      expect(content, file).not.toContain("\r");
      expect(content, file).not.toMatch(/[ \t]$/m);
      expect(content, file).not.toContain(nowToTheHour);
      expect(content.endsWith("\n"), file).toBe(true);
    }
  });

  it.each(["constructor", "toString", "__proto__"])("rejects inherited placeholder %s", (key) => {
    expect(() => renderTemplate(`{{${key}}}`, {})).toThrow(/Unknown template placeholder/);
  });

  it("uses the Axiom UI name throughout the rendered documents", () => {
    for (const [file, content] of tree) expect(content, file).not.toMatch(/\bAxiom\b(?! UI)/);
  });

  it("throws on an unknown template placeholder", () => {
    expect(() => renderTemplate("{{nope}}", {})).toThrow(/nope/);
  });

  it("emits one SKILL.md per catalog skill, within the size an agent loads on activation", () => {
    for (const skill of skillCatalog) {
      const content = tree.get(`skills/${skill.name}/SKILL.md`);
      expect(content, skill.name).toBeDefined();
      expect(content!.split("\n").length, skill.name).toBeLessThan(500);
      expect(content!.length, skill.name).toBeLessThan(20_000);
    }
  });

  it("writes frontmatter whose name matches the folder and whose author is the owner", () => {
    for (const skill of skillCatalog) {
      const data = parseFrontmatter(tree.get(`skills/${skill.name}/SKILL.md`)!);
      expect(data.name).toBe(skill.name);
      expect(typeof data.description).toBe("string");
      expect(data.metadata).toMatchObject({ author: skillAuthor, group: skill.group });
    }
  });

  it("references only files the skill ships, and ships no file nothing references", () => {
    for (const skill of skillCatalog) {
      const files = skillFiles(skill.name);
      const referenced = new Set<string>();
      for (const [file, content] of files) {
        for (const [, reference] of content.matchAll(/`(references\/[a-z0-9/-]+\.md)`/g)) {
          expect(files.has(reference), `${skill.name}/${file} → ${reference}`).toBe(true);
          referenced.add(reference);
        }
      }
      for (const file of files.keys()) {
        if (file.startsWith("references/")) {
          expect(referenced.has(file), `${skill.name}/${file} is orphaned`).toBe(true);
        }
      }
    }
  });

  it("ships every rule in the core skills, and the same rule file everywhere", () => {
    for (const name of ["axiomui", "axiomui-website-upgrade", "axiomui-audit"]) {
      const ruleFiles = [...skillFiles(name).keys()].filter((file) => file.startsWith("references/rules/"));
      expect(ruleFiles.length, name).toBe(rules.length);
    }
    for (const rule of rules) {
      const copies = skillCatalog
        .map((skill) => skillFiles(skill.name).get(`references/rules/${rule.id}.md`))
        .filter((content): content is string => content !== undefined);
      expect(copies.length, rule.id).toBeGreaterThanOrEqual(4);
      expect(new Set(copies).size, rule.id).toBe(1);
      expect(copies[0]).toContain(`https://axiomui.nischal.fyi/rules/${rule.id}`);
    }
  });

  // Rule files and /llms-full.txt share one serializer. Shifting a rule file's
  // headings down two levels and dropping its ID line must reproduce its corpus
  // section byte for byte, so the corpus could not have changed shape when the
  // serializer was extracted.
  it("shares one serializer with /llms-full.txt", () => {
    const corpus = fullCorpusMarkdown();
    for (const rule of rules) {
      const file = tree.get(`skills/axiomui/references/rules/${rule.id}.md`)!;
      const asCorpusSection = file
        .trimEnd()
        .replace(`\n- ID: ${rule.id}`, "")
        .replace(/^(#{1,2}) /gm, (_match, hashes: string) => `${hashes}## `);
      expect(corpus, rule.id).toContain(asCorpusSection);
    }
  });

  it("keeps the hand-written playbook verbatim at the top of its SKILL.md", () => {
    const [prose] = readTemplate("axiomui-website-upgrade.md").split("{{ruleLookup}}");
    const skill = tree.get("skills/axiomui-website-upgrade/SKILL.md")!;
    const body = skill.slice(skill.indexOf("\n---\n") + "\n---\n\n".length);
    expect(body.startsWith(prose)).toBe(true);
  });

  // The site serves the playbook as one file. It must not send an agent to
  // references/ files that are not beside it, and the old path must stay a
  // byte-for-byte alias apart from the name its folder requires.
  it("serves a self-contained single-file playbook at the new path and the old one", () => {
    const bundled = tree.get("skills/axiomui-website-upgrade/SKILL.md")!;
    const current = tree.get("public/skills/axiomui-website-upgrade/SKILL.md")!;
    const legacy = tree.get("public/skills/axiom-website-upgrade/SKILL.md")!;

    const lookup = "## Axiom UI rule lookup";
    expect(current.slice(0, current.indexOf(lookup))).toBe(bundled.slice(0, bundled.indexOf(lookup)));
    expect(current).not.toMatch(/references\//);
    expect(current).toContain("https://axiomui.nischal.fyi/rules.json");
    for (const rule of rules) {
      expect(current, rule.id).toContain(`- \`${rule.id}\` ${rule.title}\n`);
    }
    expect(current.split("\n").length).toBeLessThan(500);
    expect(current.length).toBeLessThan(20_000);

    const currentLines = current.split("\n");
    const legacyLines = legacy.split("\n");
    expect(legacyLines.length).toBe(currentLines.length);
    const differing = currentLines.filter((line, index) => line !== legacyLines[index]);
    expect(differing).toEqual(["name: axiomui-website-upgrade"]);
    expect(legacy).toContain("\nname: axiom-website-upgrade\n");
  });

  // typo-1 is "Sentence case is king". Skills that teach it must not break it.
  it("writes every heading in sentence case", () => {
    const properNouns = new Set(["Axiom", "Do", "Don't", "WCAG", "CSS", "Fitts's"]);
    const offenders: string[] = [];
    for (const [file, content] of tree) {
      if (!file.endsWith(".md") || file.endsWith("README.md")) {
        continue;
      }
      for (const [, heading] of content.matchAll(/^#{1,6} (.+)$/gm)) {
        // A colon starts a new phrase ("Axiom: Motion & interaction"), so each part is checked alone.
        const capitals = heading
          .replace(/`[^`]*`/g, "")
          .replace(/\([^)]*\)/g, "")
          .split(": ")
          .flatMap((part) => part.split(/[\s/]+/).filter(Boolean).slice(1))
          .filter((word) => /^[A-Z][a-z]/.test(word) && !properNouns.has(word.replace(/[^\w']+$/, "")));
        if (capitals.length > 0) {
          offenders.push(`${file}: ${heading}`);
        }
      }
    }
    expect([...new Set(offenders)]).toEqual([]);
  });

  it("routes from the axiomui skill to every other Axiom skill", () => {
    const router = tree.get("skills/axiomui/SKILL.md")!;
    expect(router).toContain("## Which Axiom UI skill");
    for (const skill of skillCatalog.filter((candidate) => candidate.name !== "axiomui")) {
      expect(router, skill.name).toContain(`\`${skill.name}\``);
    }
  });

  it("records hashes in catalog.json that match the rendered files", () => {
    const catalog = JSON.parse(tree.get("skills/catalog.json")!) as {
      skills: { name: string; files: Record<string, string> }[];
      legacy: { sha256: string[] }[];
    };
    expect(catalog.skills.map((skill) => skill.name)).toEqual(skillCatalog.map((skill) => skill.name));
    for (const skill of catalog.skills) {
      const files = skillFiles(skill.name);
      expect(Object.keys(skill.files).sort()).toEqual([...files.keys()].sort());
      for (const [file, hash] of Object.entries(skill.files)) {
        expect(hash, `${skill.name}/${file}`).toBe(`sha256:${sha256(files.get(file)!)}`);
      }
    }
    expect(catalog.legacy[0].sha256).toContain(sha256(tree.get("public/skills/axiom-website-upgrade/SKILL.md")!));
  });

  it("stays under 1.5 MB in total", () => {
    const bytes = [...tree.values()].reduce((sum, content) => sum + Buffer.byteLength(content), 0);
    expect(bytes).toBeLessThan(1.5 * 1024 * 1024);
  });

  // Same pattern the commit-msg hook and CI use, read from the script so the
  // two cannot drift. Agent names as install targets are fine; bylines are not.
  it("credits no model or tool anywhere in the output", () => {
    const script = readFileSync(path.join(repoRoot, "scripts/check-attribution.sh"), "utf8");
    const source = /^readonly PATTERN='(.+)'$/m.exec(script)![1].replaceAll("[[:space:]]", "\\s");
    const attribution = new RegExp(source, "iu");
    for (const [file, content] of tree) {
      expect(content, file).not.toMatch(attribution);
    }
  });
});

describe("reviewed skill distribution", () => {
  const names = ["axiomui-motion", "axiomui-system", "axiomui-typography"];

  it("renders only selected complete folders with matching tables, groups and hashes", () => {
    const selected = renderSkillsTree("MIT", names);
    const catalog = JSON.parse(selected.get("skills/catalog.json")!);
    expect(catalog.skills.map((skill: { name: string }) => skill.name)).toEqual([
      "axiomui-typography", "axiomui-system", "axiomui-motion",
    ]);
    expect(catalog.legacy).toEqual([]);
    expect(generatedRootsFor(names)).toEqual(["skills/", "skills.sh.json"]);
    expect([...selected.keys()].some((file) => file.startsWith("public/"))).toBe(false);
    for (const skill of catalog.skills) {
      for (const [file, hash] of Object.entries(skill.files)) {
        const content = selected.get(`skills/${skill.name}/${file}`)!;
        expect(hash).toBe(`sha256:${sha256(content)}`);
        for (const [, reference] of content.matchAll(/`(references\/[a-z0-9/-]+\.md)`/g)) {
          expect(selected.has(`skills/${skill.name}/${reference}`)).toBe(true);
        }
      }
    }
    const groups = JSON.parse(selected.get("skills.sh.json")!);
    expect(groups.groupings).toHaveLength(1);
    expect(groups.groupings[0].skills).toEqual(catalog.skills.map((skill: { name: string }) => skill.name));
    const table = renderSkillsTable(names);
    expect(table.match(/^\| `/gm)).toHaveLength(3);
    expect(table).not.toContain("axiomui-audit");
    expect(selected.get("skills/README.md")).toContain(table);
  });

  it("normalizes selection order without changing its bytes", () => {
    expect([...renderSkillsTree(null, names)]).toEqual([...renderSkillsTree(null, [...names].reverse())]);
  });

  it.each([
    [[], /must not be empty/],
    [["axiomui-motion", "axiomui-motion"], /Duplicate distributed skill/],
    [["not-a-skill"], /Unknown distributed skill/],
    [["constructor"], /Unknown distributed skill/],
  ] as [string[], RegExp][])("rejects invalid reviewed selection %j", (selection, message) => {
    expect(() => renderSkillsTree(null, selection)).toThrow(message);
    expect(() => renderSkillsTable(selection)).toThrow(message);
    expect(() => generatedRootsFor(selection)).toThrow(message);
  });

  it("takes public ownership and enables legacy entries only with the replacement skill", () => {
    const selected = renderSkillsTree(null, ["axiomui-website-upgrade"]);
    expect(generatedRootsFor(["axiomui-website-upgrade"])).toContain("public/skills/");
    expect(selected.has("public/skills/axiomui-website-upgrade/SKILL.md")).toBe(true);
    const legacy = selected.get("public/skills/axiom-website-upgrade/SKILL.md")!;
    const catalog = JSON.parse(selected.get("skills/catalog.json")!);
    expect(catalog.legacy).toHaveLength(1);
    expect(catalog.legacy[0].replacedBy).toBe("axiomui-website-upgrade");
    expect(catalog.legacy[0].sha256).toContain(sha256(legacy));
  });

  it("lists only distributed domain alternatives in the router", () => {
    const router = renderSkillsTree(null, ["axiomui", "axiomui-motion"]).get("skills/axiomui/SKILL.md")!;
    expect(router).toContain("`axiomui-motion`");
    expect(router).not.toContain("`axiomui-typography`");
  });

  it("uses the available GitHub skills route without advertising an unpublished npm install", () => {
    for (const content of tree.values()) expect(content).not.toContain("npx axiomui");
    expect(tree.get("skills/README.md")).toContain("npx skills add RexO77/axiomUI");
    expect(tree.get("skills/README.md")).toContain("npm installer has not been published");
    expect(tree.get("public/skills/axiomui-website-upgrade/SKILL.md"))
      .toContain("npx skills add RexO77/axiomUI --skill axiomui-website-upgrade");
  });
});

describe("replaceMarkerRegion", () => {
  it("replaces only the region between the markers", () => {
    const input = `before\n${markerStart}\nold\n${markerEnd}\nafter\n`;
    expect(replaceMarkerRegion(input, "new")).toBe(`before\n${markerStart}\nnew\n${markerEnd}\nafter\n`);
  });

  it("throws when a marker is missing", () => {
    expect(() => replaceMarkerRegion("no markers", "x")).toThrow(/markers/);
  });
});

describe("readPackageLicense", () => {
  it("omits unselected licenses and reads a chosen license without hiding damaged metadata", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "axiomui-render-license-"));
    const file = path.join(root, "package.json");
    try {
      expect(readPackageLicense(file)).toBeNull();
      writeFileSync(file, JSON.stringify({ license: "UNLICENSED" }));
      expect(readPackageLicense(file)).toBeNull();
      writeFileSync(file, JSON.stringify({ license: "MIT" }));
      expect(readPackageLicense(file)).toBe("MIT");
      writeFileSync(file, "invalid json");
      expect(() => readPackageLicense(file)).toThrow();
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
});
