// Generates the agent skills from src/data and src/lib/skills/templates.
//
//   npm run skills:build   write skills/, skills.sh.json, public/skills/ and the
//                          README marker regions
//   npm run skills:check   verify all of that is in sync, and that no third-party
//                          skill is visible to `npx skills add RexO77/axiomUI`
//
// Runs under plain node through scripts/lib/register-ts.mjs (see package.json),
// so the renderer is the typed, tested module in src/lib/skills/render.ts.
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  generatedRootsFor,
  markerFiles,
  renderSkillsTable,
  renderSkillsTree,
  replaceMarkerRegion,
} from "../src/lib/skills/render.ts";

import { distributedSkillNames } from "../src/lib/skills/distribution.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");
if (!Array.isArray(distributedSkillNames)) throw new Error("The reviewed distributed skill selection must be an array");
const generatedRoots = generatedRootsFor(distributedSkillNames);

// Where skills CLI 1.7.0 looks in a cloned repo (dist/cli.mjs, discoverSkills):
// the root and its direct children, these containers up to three levels deep,
// and every agent's project directory. A skill under an agent directory is
// hidden only when its name is listed in skills-lock.json.
const containerDirs = ["skills", "skills/.curated", "skills/.experimental", "skills/.system"];
const agentProjectDirs = [
  ".agents/skills", ".claude/skills", ".cline/skills", ".codebuddy/skills", ".codex/skills",
  ".commandcode/skills", ".continue/skills", ".factory/skills", ".github/skills", ".goose/skills",
  ".grok/skills", ".iflow/skills", ".junie/skills", ".kilo/skills", ".kilocode/skills",
  ".kimchi/skills", ".kiro/skills", ".minimax/skills", ".mux/skills", ".neovate/skills",
  ".opencode/skills", ".openhands/skills", ".pi/skills", ".posit/assistant/skills", ".qoder/skills",
  ".roo/skills", ".trae/skills", ".windsurf/skills", ".zcode/skills", ".zencoder/skills",
];

const toPosix = (filePath) => filePath.split(path.sep).join("/");

// Refuse links before reading or writing generated output: a linked folder or
// README must never redirect generation outside this checkout.
function assertLocalPath(relativePath) {
  let current = root;
  for (const part of relativePath.split(/[\\/]/).filter(Boolean)) {
    current = path.join(current, part);
    try {
      if (lstatSync(current).isSymbolicLink()) {
        throw new Error(`Refusing symbolic link in generated output: ${relativePath}`);
      }
    } catch (error) {
      if (error.code === "ENOENT") return;
      throw error;
    }
  }
}

function listFiles(relativeDir) {
  assertLocalPath(relativeDir);
  const absolute = path.join(root, relativeDir);
  if (!existsSync(absolute)) {
    return [];
  }
  if (statSync(absolute).isFile()) {
    return [toPosix(relativeDir)];
  }
  return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) =>
    listFiles(path.join(relativeDir, entry.name))
  );
}

function removeEmptyDirs(relativeDir) {
  const absolute = path.join(root, relativeDir);
  if (!existsSync(absolute) || !statSync(absolute).isDirectory()) {
    return;
  }
  for (const entry of readdirSync(absolute, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      removeEmptyDirs(path.join(relativeDir, entry.name));
    }
  }
  if (readdirSync(absolute).length === 0) {
    rmdirSync(absolute);
  }
}

const readOrNull = (relativePath) => {
  assertLocalPath(relativePath);
  const absolute = path.join(root, relativePath);
  return existsSync(absolute) ? readFileSync(absolute, "utf8") : null;
};

// Generated files and marker regions.
const expected = renderSkillsTree(undefined, distributedSkillNames);
for (const file of markerFiles) {
  const current = readOrNull(file);
  if (current === null) {
    throw new Error(`${file} is missing; it must exist with skills markers`);
  }
  expected.set(file, replaceMarkerRegion(current, renderSkillsTable(distributedSkillNames)));
}

// Files git ignores (Finder's .DS_Store, say) are invisible to a commit, so
// they must not fail the check. Without git, skip the usual OS litter by name.
function ignoredFiles(roots) {
  try {
    const output = execFileSync(
      "git",
      ["ls-files", "-z", "--others", "--ignored", "--exclude-standard", "--", ...roots],
      { cwd: root, encoding: "utf8" }
    );
    return new Set(output.split("\0").filter(Boolean));
  } catch {
    return null;
  }
}

const osLitter = new Set([".DS_Store", "Thumbs.db", "desktop.ini"]);
const roots = generatedRoots.map((dir) => dir.replace(/\/$/, ""));
const onDisk = new Set(roots.flatMap((dir) => listFiles(dir)));
const ignored = ignoredFiles(roots);
const isIgnored = (file) => (ignored ? ignored.has(file) : osLitter.has(path.posix.basename(file)));
const missing = [];
const stale = [];
// The check reports only what a commit would carry; the build also clears ignored litter.
const extra = [...onDisk].filter((file) => !expected.has(file) && (!checkOnly || !isIgnored(file))).sort();

for (const [file, content] of expected) {
  assertLocalPath(file);
  const current = readOrNull(file);
  if (current === null) {
    missing.push(file);
  } else if (current !== content) {
    stale.push(file);
  }
}

// Third-party skills visible to the skills CLI.
// Only a committed lock hides anything from a clone, so read it from the index,
// not from disk: a local, untracked skills-lock.json must not mask a leak.
function lockedNames() {
  let lock;
  try {
    lock = execFileSync("git", ["show", ":skills-lock.json"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return new Set();
  }
  const normalize = (name) => name.toLowerCase().replace(/[\s_]+/g, "-");
  return new Set(Object.keys(JSON.parse(lock).skills ?? {}).map(normalize));
}

function frontmatterName(relativePath) {
  const content = readOrNull(relativePath) ?? "";
  return /^---\n[\s\S]*?^name:\s*["']?([^"'\n]+?)["']?\s*$/m.exec(content)?.[1] ?? null;
}

function discoveryLeaks() {
  let tracked;
  try {
    tracked = execFileSync("git", ["ls-files", "-z", "--", "*SKILL.md"], { cwd: root, encoding: "utf8" });
  } catch {
    return { skipped: true, leaks: [] };
  }
  const locked = lockedNames();
  const leaks = tracked
    .split("\0")
    .filter((file) => file && path.posix.basename(file) === "SKILL.md" && !file.startsWith("skills/"))
    .filter((file) => {
      const dir = path.posix.dirname(file);
      if (dir === "." || !dir.includes("/")) {
        return true;
      }
      const agentDir = agentProjectDirs.find((container) => dir.startsWith(`${container}/`));
      const container = agentDir ?? containerDirs.find((candidate) => dir.startsWith(`${candidate}/`));
      if (!container || dir.slice(container.length + 1).split("/").length > 3) {
        return false;
      }
      if (agentDir) {
        const names = [path.posix.basename(dir), frontmatterName(file)].filter(Boolean);
        return !names.some((name) => locked.has(name.toLowerCase().replace(/[\s_]+/g, "-")));
      }
      return true;
    });
  return { skipped: false, leaks };
}

const discovery = discoveryLeaks();

// Report or write.
const skillCount = new Set([...expected.keys()].filter((file) => /^skills\/[^/]+\/SKILL\.md$/.test(file))).size;

if (checkOnly) {
  const problems = [
    ...missing.map((file) => `missing  ${file}`),
    ...stale.map((file) => `stale    ${file}`),
    ...extra.map((file) => `extra    ${file}`),
  ];
  if (problems.length > 0) {
    console.error(`Generated skills are out of sync with src/data and the templates:\n`);
    console.error(problems.map((line) => `  ${line}`).join("\n"));
    console.error(`\nFix: npm run skills:build, then commit the result.`);
  }
  if (discovery.leaks.length > 0) {
    if (problems.length > 0) {
      console.error("");
    }
    console.error(`Tracked skills that \`npx skills add RexO77/axiomUI\` would install alongside Axiom UI's:\n`);
    console.error(discovery.leaks.map((file) => `  ${file}`).join("\n"));
    console.error(
      `\nFix: stop tracking them (git rm -r --cached <dir>, then ignore the path), or list each name in skills-lock.json.`
    );
  }
  if (discovery.skipped) {
    console.warn("Not a git checkout; skipped the third-party skill discovery check.");
  }
  if (problems.length > 0 || discovery.leaks.length > 0) {
    process.exit(1);
  }
  console.log(`skills in sync: ${skillCount} skills, ${expected.size} files`);
} else {
  for (const file of [...missing, ...stale]) {
    const absolute = path.join(root, file);
    mkdirSync(path.dirname(absolute), { recursive: true });
    writeFileSync(absolute, expected.get(file));
  }
  for (const file of extra) {
    rmSync(path.join(root, file));
  }
  for (const dir of generatedRoots.filter((entry) => entry.endsWith("/"))) {
    removeEmptyDirs(dir.slice(0, -1));
  }
  const unchanged = expected.size - missing.length - stale.length;
  console.log(
    `skills built: ${skillCount} skills · ${missing.length} added, ${stale.length} updated, ${extra.length} removed, ${unchanged} unchanged`
  );
  if (discovery.leaks.length > 0) {
    console.warn(
      `warning: ${discovery.leaks.length} tracked third-party skill(s) are visible to the skills CLI; npm run skills:check lists them.`
    );
  }
}
