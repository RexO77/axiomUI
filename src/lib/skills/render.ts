import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { categories, rules, type Rule } from "@/data/ui-logic";
import { ruleReviewQuestions, ruleToMarkdown } from "@/lib/rule-corpus";
import { categoryNameById } from "@/lib/rule-text";
import { siteConfig } from "@/lib/site";
import {
  findSkill,
  legacySkills,
  ruleUrl,
  skillAuthor,
  skillCatalog,
  skillDescription,
  skillRules,
  skillsCliCommand,
  skillsRepo,
  skillsRepoUrl,
  type SkillSpec,
} from "@/lib/skills/catalog";

/**
 * Renders every generated skill file from `src/data` plus the hand-written
 * templates. Pure apart from reading templates and the package's license: same
 * input, same bytes. `scripts/build-skills.mjs` writes the result and
 * `--check` diffs it against disk. Never imported by app code (node:fs).
 */

const templateDir = new URL("./templates/", import.meta.url);
const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));

export const markerStart = "<!-- skills:start -->";
export const markerEnd = "<!-- skills:end -->";

/** Files the generator owns outright, relative to the repo root. */
export function generatedRootsFor(names?: readonly string[]): string[] {
  const selected = selectedSkills(names);
  return ["skills/", "skills.sh.json", ...(selected.some((skill) => skill.template === "axiomui-website-upgrade") ? ["public/skills/"] : [])];
}
/** Files where the generator owns only the region between the markers. */
export const markerFiles = ["README.md", "packages/axiomui/README.md"] as const;

const publicSkillPath = "public/skills/axiomui-website-upgrade/SKILL.md";
const legacyPublicSkillPath = "public/skills/axiom-website-upgrade/SKILL.md";

/** A reviewed release selection, normalized to catalog order; never inferred from output. */
function selectedSkills(names?: readonly string[]): SkillSpec[] {
  if (names === undefined) return skillCatalog;
  if (names.length === 0) throw new Error("The distributed skill selection must not be empty");
  const selected = new Set<string>();
  for (const name of names) {
    if (!findSkill(name)) throw new Error(`Unknown distributed skill: ${name}`);
    if (selected.has(name)) throw new Error(`Duplicate distributed skill: ${name}`);
    selected.add(name);
  }
  return skillCatalog.filter((skill) => selected.has(skill.name));
}

const githubInstallCommand = (skill: SkillSpec) => `${skillsCliCommand} --skill ${skill.name}`;

export function readTemplate(name: string): string {
  return readFileSync(new URL(name, templateDir), "utf8");
}

/** Fills `{{name}}` placeholders. Throws on a placeholder with no value, so a typo cannot ship. */
export function renderTemplate(template: string, values: Record<string, string>): string {
  const rendered = template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    if (!Object.hasOwn(values, key)) {
      throw new Error(`Unknown template placeholder {{${key}}}`);
    }
    return values[key];
  });
  // An empty placeholder on its own line would otherwise leave a double gap.
  return rendered.replace(/\n{3,}/g, "\n\n");
}

export function sha256(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

/** The package license, or null until one is chosen. Frontmatter omits the field when null. */
export function readPackageLicense(packageFile = `${repoRoot}packages/axiomui/package.json`): string | null {
  let content: string;
  try {
    content = readFileSync(packageFile, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
  const pkg = JSON.parse(content) as { license?: unknown };
  return typeof pkg.license === "string" && pkg.license !== "UNLICENSED" ? pkg.license : null;
}

/** JSON with object keys sorted at every level, so output never depends on insertion order. */
function stableJson(value: unknown): string {
  const sortKeys = (input: unknown): unknown => {
    if (Array.isArray(input)) {
      return input.map(sortKeys);
    }
    if (input && typeof input === "object") {
      return Object.fromEntries(
        Object.keys(input)
          .sort()
          .map((key) => [key, sortKeys((input as Record<string, unknown>)[key])])
      );
    }
    return input;
  };
  return `${JSON.stringify(sortKeys(value), null, 2)}\n`;
}

const categoryName = (id: string) => categoryNameById.get(id) ?? id;
const ruleFile = (rule: Rule) => `references/rules/${rule.id}.md`;
const categoryFile = (categoryId: string) => `references/${categoryId}.md`;
const checklistFile = (categoryId: string) => `references/checklists/${categoryId}.md`;
const rulesIn = (categoryId: string) => rules.filter((rule) => rule.category === categoryId);
/** Rules filed elsewhere that the domain skill for `categoryId` also carries. */
const crossListedRules = (categoryId: string): Rule[] => {
  const ids = new Set(findSkill(`axiomui-${categoryId}`)?.crossListedRuleIds ?? []);
  return rules.filter((rule) => ids.has(rule.id));
};

function frontmatter(skill: SkillSpec, license: string | null): string {
  return [
    "---",
    `name: ${skill.name}`,
    `description: ${skillDescription(skill)}`,
    ...(license ? [`license: ${license}`] : []),
    "metadata:",
    `  author: ${skillAuthor}`,
    `  homepage: ${siteConfig.origin}`,
    `  source: ${skillsRepoUrl}`,
    `  group: ${skill.group}`,
    "---",
  ].join("\n");
}

/** One rule as a compact entry: title, id, description, Do/Don't and where its reasoning lives. */
function ruleEntry(rule: Rule, headingLevel: 2 | 3, from?: string): string {
  return [
    `${"#".repeat(headingLevel)} ${rule.title} (\`${rule.id}\`)`,
    rule.desc,
    [
      ...(from ? [`- From: ${from}`] : []),
      `- Do: ${rule.do}`,
      `- Don't: ${rule.dont}`,
      `- Reasoning: \`${ruleFile(rule)}\` · ${ruleUrl(rule.id)}`,
    ].join("\n"),
  ].join("\n\n");
}

function indexLine(rule: Rule, file = ruleFile(rule)): string {
  return `- \`${rule.id}\` ${rule.title} (\`${file}\`)`;
}

function domainTable(fileFor: (categoryId: string) => string, fileHeading: string): string {
  return [
    `| Domain | Rules | ${fileHeading} |`,
    "|---|---|---|",
    ...categories.map(
      (category) => `| ${category.name} | ${rulesIn(category.id).length} | \`${fileFor(category.id)}\` |`
    ),
  ].join("\n");
}

/** `references/<category>.md`: every rule in one domain as a compact Do/Don't entry. */
function categoryReference(categoryId: string): string {
  const blocks = [
    `# ${categoryName(categoryId)}`,
    "Compact Do/Don't for every rule in this domain. Each Reasoning line names the file with the full write-up.",
    ...rulesIn(categoryId).map((rule) => ruleEntry(rule, 2)),
  ];
  const related = crossListedRules(categoryId);
  if (related.length > 0) {
    blocks.push(
      "## Related rules in other domains",
      related.map((rule) => indexLine(rule, categoryFile(rule.category))).join("\n")
    );
  }
  return `${blocks.join("\n\n")}\n`;
}

/** `references/checklists/<category>.md`: the audit checklist for one domain. */
function checklistReference(categoryId: string): string {
  const blocks = [
    `# ${categoryName(categoryId)} checklist`,
    "Ask each question of the surface under review. Record a finding only for a concrete violation, with evidence.",
    ...rulesIn(categoryId).map((rule) =>
      [
        `## ${rule.title} (\`${rule.id}\`)`,
        [
          `- Do: ${rule.do} · Don't: ${rule.dont}`,
          ...ruleReviewQuestions(rule).map((question) => `- [ ] ${question}`),
          `- Reasoning: \`${ruleFile(rule)}\``,
        ].join("\n"),
      ].join("\n\n")
    ),
  ];
  const related = crossListedRules(categoryId);
  if (related.length > 0) {
    blocks.push(
      "## Also in scope",
      "This domain also depends on rules filed under other domains. Walk these items too whenever this domain is in scope:",
      related.map((rule) => indexLine(rule, checklistFile(rule.category))).join("\n")
    );
  }
  return `${blocks.join("\n\n")}\n`;
}

function ruleReference(rule: Rule): string {
  return `${ruleToMarkdown(rule, { headingLevel: 1, includeId: true })}\n`;
}

/** Where the rules live in the single-file copy, which ships without `references/`. */
const rulesJsonUrl = `${siteConfig.origin}/rules.json`;

/**
 * The playbook's generated tail. The bundled skill points at its own
 * `references/`; the single-file copy served from the site has none, so it
 * indexes every rule and points at the site instead.
 */
function ruleLookup(singleFile: boolean): string {
  const backing = `The craft standards above are backed by Axiom UI's ${rules.length} rules, which carry the exact values.`;
  if (singleFile) {
    return [
      "## Axiom UI rule lookup",
      `${backing} This is the single-file copy of the skill, so the rules are online rather than beside it:`,
      [
        `- Every rule's Do and Don't, in one JSON file: ${rulesJsonUrl}`,
        `- One rule's full reasoning: ${siteConfig.origin}/rules/<id>, for example ${ruleUrl(rules[0].id)}`,
      ].join("\n"),
      `Before you change a domain, find its rules in the index below and apply the matching rule's Do. Read the rule's page before you defend a tradeoff or break a rule, and cite the rule id when you report the change. To keep the rule files offline, install the full skill with \`${githubInstallCommand(findSkill("axiomui-website-upgrade")!)}\`.`,
      ...categories.map((category) =>
        [`### ${category.name}`, rulesIn(category.id).map((rule) => `- \`${rule.id}\` ${rule.title}`).join("\n")].join("\n\n")
      ),
    ].join("\n\n");
  }
  return [
    "## Axiom UI rule lookup",
    `${backing} Before you change a domain, open its file and apply the matching rule's Do. Read the rule's own file under \`references/rules/\` before you defend a tradeoff or break a rule, and cite the rule id when you report the change.`,
    `If \`references/\` is missing, this is a single-file copy: read ${rulesJsonUrl} for every rule's Do and Don't, and ${siteConfig.origin}/rules/<id> for one rule's reasoning.`,
    domainTable(categoryFile, "File"),
  ].join("\n\n");
}

function skillBody(
  skill: SkillSpec,
  { singleFile = false, availableSkills = skillCatalog }: { singleFile?: boolean; availableSkills?: readonly SkillSpec[] } = {}
): string {
  switch (skill.template) {
    case "axiomui":
      return renderTemplate(readTemplate("axiomui.md"), {
        ruleCount: String(rules.length),
        categoryCount: String(categories.length),
        domainSkills: availableSkills
          .filter((candidate) => candidate.group === "domain")
          .map((candidate) => `\`${candidate.name}\``)
          .join(", ") || "no standalone domains are distributed at this checkpoint",
        domainTable: domainTable(categoryFile, "Compact Do/Don't"),
        ruleIndex: categories
          .map((category) =>
            [`### ${category.name}`, rulesIn(category.id).map((rule) => indexLine(rule)).join("\n")].join("\n\n")
          )
          .join("\n\n"),
      });
    case "axiomui-website-upgrade":
      return renderTemplate(readTemplate("axiomui-website-upgrade.md"), { ruleLookup: ruleLookup(singleFile) });
    case "axiomui-audit":
      return renderTemplate(readTemplate("axiomui-audit.md"), {
        ruleCount: String(rules.length),
        checklistTable: domainTable(checklistFile, "Checklist"),
      });
    case "domain": {
      const crossListed = skillRules(skill).filter((rule) => skill.crossListedRuleIds.includes(rule.id));
      return renderTemplate(readTemplate("domain.md"), {
        title: skill.title,
        lead: skill.lead ?? "",
        rules: skillRules(skill)
          .filter((rule) => skill.homeRuleIds.includes(rule.id))
          .map((rule) => ruleEntry(rule, 3))
          .join("\n\n"),
        crossListed:
          crossListed.length === 0
            ? ""
            : [
                "## Cross-listed from other domains",
                skill.crossListedNote ?? "These rules are filed under other domains but apply here too.",
                ...crossListed.map((rule) => ruleEntry(rule, 3, categoryName(rule.category))),
              ].join("\n\n"),
      });
    }
  }
}

/** Every file of one skill, keyed by its path inside the skill directory, sorted. */
export function renderSkill(
  skill: SkillSpec,
  license: string | null = readPackageLicense(),
  availableSkills: readonly SkillSpec[] = skillCatalog
): Map<string, string> {
  const files = new Map<string, string>();
  files.set("SKILL.md", `${frontmatter(skill, license)}\n\n${skillBody(skill, { availableSkills })}`);

  if (skill.template === "axiomui" || skill.template === "axiomui-website-upgrade") {
    for (const category of categories) {
      files.set(categoryFile(category.id), categoryReference(category.id));
    }
  }
  if (skill.template === "axiomui-audit") {
    for (const category of categories) {
      files.set(checklistFile(category.id), checklistReference(category.id));
    }
  }
  for (const rule of skillRules(skill)) {
    files.set(ruleFile(rule), ruleReference(rule));
  }

  return new Map([...files.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}

/** The skills table shared by `skills/README.md` and the two README marker regions. */
export function renderSkillsTable(names?: readonly string[]): string {
  const selected = selectedSkills(names);
  return [
    "| Skill | Group | Rules | What it covers | Install on its own |",
    "|---|---|---|---|---|",
    ...selected.map(
      (skill) =>
        `| \`${skill.name}\` | ${skill.group === "core" ? "Core" : "Domain"} | ${skillRules(skill).length} | ${skill.summary} | \`${githubInstallCommand(skill)}\` |`
    ),
  ].join("\n");
}

function skillsReadme(selected: readonly SkillSpec[]): string {
  return `${[
    "# Axiom UI agent skills",
    `Axiom UI's ${rules.length} UI design rules, packaged as agent skills for Claude Code, Codex, Cursor, OpenCode, Gemini CLI, GitHub Copilot and Windsurf.`,
    "**These files are generated. Do not edit them by hand.** Change rules in `src/data/`, skill prose in `src/lib/skills/templates/`, then run `npm run skills:build`. CI fails when this folder is out of sync.",
    "## Install",
    [
      "```sh",
      skillsCliCommand,
      "```",
    ].join("\n"),
    "## Skills",
    "Each listed skill is complete and self-contained. Core skills carry every rule; domain skills carry focused rules with sharper triggers. The npm installer has not been published; install these files from GitHub.",
    renderSkillsTable(selected.map((skill) => skill.name)),
    `Rules and reasoning: ${siteConfig.origin}`,
  ].join("\n\n")}\n`;
}

function catalogJson(tree: Map<string, string>, legacyPublic: string | null, selected: readonly SkillSpec[]): string {
  return stableJson({
    schema: 1,
    site: siteConfig.origin,
    repo: skillsRepo,
    skills: selected.map((skill) => {
      const prefix = `skills/${skill.name}/`;
      const files = Object.fromEntries(
        [...tree.entries()]
          .filter(([filePath]) => filePath.startsWith(prefix))
          .map(([filePath, content]) => [filePath.slice(prefix.length), `sha256:${sha256(content)}`])
      );
      return {
        name: skill.name,
        group: skill.group,
        title: skill.title,
        summary: skill.summary,
        ruleCount: skillRules(skill).length,
        aliases: skill.aliases,
        files,
      };
    }),
    legacy: legacySkills.filter((legacy) => legacyPublic !== null && selected.some((skill) => skill.name === legacy.replacedBy)).map((legacy) => ({
      name: legacy.name,
      replacedBy: legacy.replacedBy,
      // The current legacy alias counts as pristine too, so a fresh download is recognised.
      sha256: [...new Set([...legacy.sha256, sha256(legacyPublic!)])],
    })),
  });
}

function skillsShJson(selected: readonly SkillSpec[]): string {
  const names = (group: SkillSpec["group"]) =>
    selected.filter((skill) => skill.group === group).map((skill) => skill.name);
  return stableJson({
    $schema: "https://skills.sh/schemas/skills.sh.schema.json",
    groupings: [
      {
        title: "Core",
        description: "Each distributed core skill carries every Axiom UI rule.",
        skills: names("core"),
      },
      {
        title: "Domains",
        description: "One skill per domain, with sharper triggers. Install one on its own when an agent works mostly in that area.",
        skills: names("domain"),
      },
    ].filter((group) => group.skills.length > 0),
  });
}

/**
 * The whole generated tree, keyed by path from the repo root: `skills/**`,
 * `skills.sh.json`, and the two single-file public copies of the playbook.
 */
export function renderSkillsTree(license: string | null = readPackageLicense(), names?: readonly string[]): Map<string, string> {
  const selected = selectedSkills(names);
  const tree = new Map<string, string>();
  for (const skill of selected) {
    for (const [filePath, content] of renderSkill(skill, license, selected)) {
      tree.set(`skills/${skill.name}/${filePath}`, content);
    }
  }

  const playbookSkill = selected.find((skill) => skill.template === "axiomui-website-upgrade");
  let legacyPublic: string | null = null;
  if (playbookSkill) {
    // A single-file download must work without sibling references. Retain the
    // old folder's frontmatter name while keeping both public variants equivalent.
    const playbook = `${frontmatter(playbookSkill, license)}\n\n${skillBody(playbookSkill, { singleFile: true })}`;
    legacyPublic = playbook.replace(/^name: axiomui-website-upgrade$/m, "name: axiom-website-upgrade");
    tree.set(publicSkillPath, playbook);
    tree.set(legacyPublicSkillPath, legacyPublic);
  }
  tree.set("skills/README.md", skillsReadme(selected));
  tree.set("skills/catalog.json", catalogJson(tree, legacyPublic, selected));
  tree.set("skills.sh.json", skillsShJson(selected));

  return new Map([...tree.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}

/** Replaces the region between the skills markers. Throws when a marker is missing. */
export function replaceMarkerRegion(content: string, region: string): string {
  const start = content.indexOf(markerStart);
  const end = content.indexOf(markerEnd);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Missing ${markerStart} / ${markerEnd} markers`);
  }
  return `${content.slice(0, start + markerStart.length)}\n${region}\n${content.slice(end)}`;
}
