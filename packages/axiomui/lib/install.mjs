// @ts-check
import {
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmdirSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import { isSafeRelativeFile, isSkillName, readBundledFile, sha256 } from "./catalog.mjs";
import { CliError } from "./format.mjs";

/** @typedef {import("./catalog.mjs").Bundle} Bundle */
/** @typedef {import("./catalog.mjs").CatalogSkill} CatalogSkill */

/**
 * Written into every installed skill folder, last. It records what axiomui
 * wrote, so a re-run can tell an untouched file from one the user edited. No
 * timestamps: re-running on an unchanged install must not produce a diff.
 * @typedef {object} Sidecar
 * @property {"axiomui"} tool
 * @property {string} version
 * @property {string} skill
 * @property {Record<string, string>} files
 */

/**
 * install    folder absent: write everything
 * update     ours, some files outdated and unedited (or missing)
 * uptodate   ours, every file matches the bundle
 * conflict   ours, a file was edited: skip the whole skill unless --force
 * foreign    not ours (no sidecar, a symlink, or a file): skip unless --force
 * replace    foreign, and --force was given
 * @typedef {"install" | "update" | "uptodate" | "conflict" | "foreign" | "replace"} InstallAction
 */

/**
 * @typedef {object} InstallPlan
 * @property {string} skill
 * @property {string} targetDir
 * @property {string} skillDir
 * @property {InstallAction} action
 * @property {string[]} writes files to write, relative to skillDir
 * @property {string[]} deletes files dropped from the bundle and unedited
 * @property {string[]} conflicts files the user edited
 * @property {string[]} kept files dropped from the bundle but edited, left in place
 * @property {string[]} linked folders inside the skill that are symlinks (or files): never
 *   written through; a conflict unless --force, which replaces the link itself
 * @property {"symlink" | "file" | "unmanaged" | null} foreignKind
 * @property {boolean} writeSidecar
 */

/**
 * @typedef {object} RemovePlan
 * @property {string} skill
 * @property {string} targetDir
 * @property {string} skillDir
 * conflict means an edited file or a symlinked folder: nothing is deleted
 * unless --force, so a remove never leaves half a skill behind.
 * @property {"remove" | "conflict" | "foreign" | "absent"} action
 * @property {string[]} deletes SKILL.md first, so an interrupted remove leaves nothing an agent loads
 * @property {string[]} conflicts edited files
 * @property {string[]} linked folders inside the skill that are symlinks; --force unlinks them
 * @property {string[]} leftovers files axiomui never installed, which stay with the folder
 * @property {"symlink" | "file" | "unmanaged" | null} foreignKind
 */

export const sidecarName = ".axiomui.json";

/**
 * Joins under `base` and refuses anything that resolves outside it.
 * @param {string} base
 * @param {...string} parts
 */
export function safeJoin(base, ...parts) {
  const root = path.resolve(base);
  const joined = path.resolve(root, ...parts);
  if (joined !== root && !joined.startsWith(root + path.sep)) {
    throw new CliError(`Refusing to touch ${joined}: it is outside ${root}.`);
  }
  return joined;
}

/**
 * The first folder between `skillDir` and `file` that is not a real folder (a
 * symlink, or a file), relative to `skillDir`; null when the path is clean or
 * not created yet. Writing or deleting through such a folder would reach
 * outside the skill.
 * @param {string} skillDir
 * @param {string} file catalog path, `/`-separated
 */
function linkedParent(skillDir, file) {
  const parts = file.split("/").slice(0, -1);
  let current = skillDir;
  for (let index = 0; index < parts.length; index += 1) {
    current = path.join(current, parts[index]);
    const stat = lstatOrNull(current);
    if (!stat) {
      return null;
    }
    if (!stat.isDirectory()) {
      return parts.slice(0, index + 1).join("/");
    }
  }
  return null;
}

/**
 * @param {string} skillDir
 * @param {string[]} files
 */
const linkedParents = (skillDir, files) =>
  [...new Set(files.map((file) => linkedParent(skillDir, file)).filter((dir) => dir !== null))].sort();

/**
 * @param {string[]} linked
 * @param {string} file
 */
const isUnder = (linked, file) => linked.some((dir) => file.startsWith(`${dir}/`));

/**
 * A path inside the skill that is safe to write or delete: inside `skillDir`
 * as text, and with no symlinked folder on the way.
 * @param {string} skillDir
 * @param {string} file
 */
function guardedPath(skillDir, file) {
  const target = safeJoin(skillDir, file);
  const linked = linkedParent(skillDir, file);
  if (linked !== null) {
    throw new CliError(`Refusing to touch ${target}: ${path.join(skillDir, linked)} is a symlink or a file, not a folder.`);
  }
  return target;
}

/**
 * An I/O failure as a one-line error that names the path, whatever the errno.
 * @param {unknown} error
 * @param {string} verb
 * @param {string} target
 */
function ioError(error, verb, target) {
  if (error instanceof CliError) {
    return error;
  }
  const failure = /** @type {NodeJS.ErrnoException} */ (error);
  return new CliError(`Could not ${verb} ${target}: ${failure?.code ?? failure?.message ?? String(error)}`);
}

/** @param {string} target */
function lstatOrNull(target) {
  try {
    return lstatSync(target);
  } catch (error) {
    if (/** @type {NodeJS.ErrnoException} */ (error).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

/**
 * The hash of a regular file, null when absent. A symlink in place of a file
 * hashes as "edited", so it is never followed or silently replaced.
 * @param {string} file
 */
function hashOnDisk(file) {
  const stat = lstatOrNull(file);
  if (!stat) {
    return null;
  }
  if (!stat.isFile()) {
    return "not-a-file";
  }
  return sha256(readFileSync(file));
}

/**
 * Our sidecar, or null when the folder is not axiomui's (or the sidecar is
 * damaged or names unsafe paths, in which case it is not trusted at all).
 * @param {string} skillDir
 * @param {string} [expectedSkill]
 * @returns {Sidecar | null}
 */
export function readSidecar(skillDir, expectedSkill) {
  const file = path.join(skillDir, sidecarName);
  const stat = lstatOrNull(file);
  if (!stat || !stat.isFile()) {
    return null;
  }
  try {
    const data = JSON.parse(readFileSync(file, "utf8"));
    if (
      data?.tool !== "axiomui" ||
      !isSkillName(data.skill) ||
      (expectedSkill !== undefined && data.skill !== expectedSkill) ||
      !data.files ||
      typeof data.files !== "object" ||
      !Object.entries(data.files).every(([name, hash]) => isSafeRelativeFile(name) && typeof hash === "string")
    ) {
      return null;
    }
    return { tool: "axiomui", version: String(data.version ?? ""), skill: data.skill, files: data.files };
  } catch {
    return null;
  }
}

/** @param {Record<string, string>} files */
const sortedFiles = (files) => Object.fromEntries(Object.keys(files).sort().map((key) => [key, files[key]]));

/** @param {Sidecar} sidecar */
const serializeSidecar = (sidecar) =>
  `${JSON.stringify({ tool: sidecar.tool, version: sidecar.version, skill: sidecar.skill, files: sortedFiles(sidecar.files) }, null, 2)}\n`;

/**
 * @param {Record<string, string>} a
 * @param {Record<string, string>} b
 */
const sameFiles = (a, b) => JSON.stringify(sortedFiles(a)) === JSON.stringify(sortedFiles(b));

/**
 * Decides what installing one skill into one folder would do. Reads the disk,
 * never writes it, so `--dry-run` is exactly this plan printed.
 * @param {CatalogSkill} skill
 * @param {string} targetDir
 * @param {{ force?: boolean }} [options]
 * @returns {InstallPlan}
 */
export function planInstall(skill, targetDir, { force = false } = {}) {
  const skillDir = safeJoin(targetDir, skill.name);
  const bundled = Object.keys(skill.files).sort();
  /** @type {InstallPlan} */
  const plan = {
    skill: skill.name,
    targetDir: path.resolve(targetDir),
    skillDir,
    action: "install",
    writes: [],
    deletes: [],
    conflicts: [],
    kept: [],
    linked: [],
    foreignKind: null,
    writeSidecar: true,
  };

  const stat = lstatOrNull(skillDir);
  if (!stat) {
    plan.writes = bundled;
    return plan;
  }

  const sidecar = stat.isDirectory() ? readSidecar(skillDir, skill.name) : null;
  if (!sidecar) {
    plan.foreignKind = stat.isSymbolicLink() ? "symlink" : stat.isDirectory() ? "unmanaged" : "file";
    if (!force) {
      plan.action = "foreign";
      plan.writeSidecar = false;
      return plan;
    }
    plan.action = "replace";
    plan.writes = bundled;
    // Writes land in place in a real folder, so a symlink inside it goes first.
    plan.linked = plan.foreignKind === "unmanaged" ? linkedParents(skillDir, bundled) : [];
    return plan;
  }

  plan.linked = linkedParents(skillDir, [...new Set([...bundled, ...Object.keys(sidecar.files)])]);
  if (plan.linked.length > 0 && !force) {
    plan.action = "conflict";
    plan.writeSidecar = false;
    return plan;
  }

  for (const file of bundled) {
    // Under --force a linked folder is replaced by a real one, so what is behind the link does not count.
    const onDisk = isUnder(plan.linked, file) ? null : hashOnDisk(safeJoin(skillDir, file));
    if (onDisk === skill.files[file]) {
      continue;
    }
    if (onDisk === null || onDisk === sidecar.files[file]) {
      plan.writes.push(file);
    } else {
      plan.conflicts.push(file);
    }
  }
  for (const file of Object.keys(sidecar.files).sort()) {
    if (file in skill.files || plan.linked.includes(file) || isUnder(plan.linked, file)) {
      continue;
    }
    const onDisk = hashOnDisk(safeJoin(skillDir, file));
    if (onDisk === null) {
      continue;
    }
    // An edited file the bundle no longer ships is the user's now, even under --force.
    if (onDisk === sidecar.files[file]) {
      plan.deletes.push(file);
    } else {
      plan.kept.push(file);
    }
  }

  if (plan.conflicts.length > 0 && !force) {
    plan.action = "conflict";
    plan.writes = [];
    plan.deletes = [];
    plan.writeSidecar = false;
    return plan;
  }
  plan.writes = [...plan.writes, ...plan.conflicts].sort();
  if (plan.writes.length > 0 || plan.deletes.length > 0 || plan.linked.length > 0) {
    plan.action = "update";
    return plan;
  }
  plan.action = "uptodate";
  // Only rewrite the sidecar when its record is wrong, never just to bump the
  // version, so a re-run leaves every byte and mtime alone.
  plan.writeSidecar = !sameFiles(sidecar.files, skill.files);
  return plan;
}

/**
 * Writes via a temp file and rename, so a crash never leaves half a file, and
 * a symlink at the destination is replaced rather than written through. The
 * temp file is removed on failure, and the error names the destination.
 * @param {string} file
 * @param {Buffer | string} content
 */
function writeAtomic(file, content) {
  let tempDir;
  try {
    mkdirSync(path.dirname(file), { recursive: true });
    tempDir = mkdtempSync(path.join(path.dirname(file), ".axiomui-write-"));
    const temp = path.join(tempDir, "content");
    writeFileSync(temp, content);
    renameSync(temp, file);
  } catch (error) {
    throw ioError(error, "write", file);
  } finally {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

/**
 * @param {string} target
 */
function unlinkOrThrow(target) {
  try {
    unlinkSync(target);
  } catch (error) {
    throw ioError(error, "delete", target);
  }
}

/**
 * Removes empty folders from `dir` up to, and including, `stopAt`.
 * @param {string} dir
 * @param {string} stopAt
 */
function pruneEmpty(dir, stopAt) {
  let current = dir;
  while (current === stopAt || current.startsWith(stopAt + path.sep)) {
    const stat = lstatOrNull(current);
    if (!stat || !stat.isDirectory() || readdirSync(current).length > 0) {
      return;
    }
    rmdirSync(current);
    if (current === stopAt) {
      return;
    }
    current = path.dirname(current);
  }
}

const stagingPrefix = ".axiomui-staging-";

/** @param {number} pid */
function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return /** @type {NodeJS.ErrnoException} */ (error).code === "EPERM";
  }
}

/**
 * Deletes staging folders for `skillName` left behind by a run that crashed
 * or was killed. A folder whose process is still running is left alone.
 * @param {string} targetDir
 * @param {string} skillName
 */
function clearStaleStaging(targetDir, skillName) {
  const pattern = new RegExp(`^${stagingPrefix.replace(/\./g, "\\.")}${skillName}-(\\d+)$`);
  let entries;
  try {
    entries = readdirSync(targetDir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const pid = Number(pattern.exec(entry)?.[1]);
    if (pid && (pid === process.pid || !isAlive(pid))) {
      rmSync(path.join(targetDir, entry), { recursive: true, force: true });
    }
  }
}

/**
 * A fresh skill is assembled in a staging folder beside its destination and
 * renamed into place, so an interrupted install never leaves a half-written
 * skill (or one with no sidecar, which later runs would call foreign).
 * SKILL.md is written last, so even a leftover staging folder holds nothing an
 * agent would load.
 * @param {InstallPlan} plan
 * @param {Bundle} bundle
 * @param {CatalogSkill} skill
 * @param {string} version
 */
function installFresh(plan, bundle, skill, version) {
  const staging = safeJoin(plan.targetDir, `${stagingPrefix}${skill.name}-${process.pid}`);
  try {
    mkdirSync(plan.targetDir, { recursive: true });
  } catch (error) {
    throw ioError(error, "create", plan.targetDir);
  }
  clearStaleStaging(plan.targetDir, skill.name);
  const order = [...plan.writes.filter((file) => file !== "SKILL.md"), ...plan.writes.filter((file) => file === "SKILL.md")];
  try {
    mkdirSync(staging);
    for (const file of order) {
      const target = safeJoin(staging, file);
      try {
        mkdirSync(path.dirname(target), { recursive: true });
        writeFileSync(target, readBundledFile(bundle, skill, file));
      } catch (error) {
        throw ioError(error, "write", path.join(plan.skillDir, file));
      }
    }
    writeFileSync(
      path.join(staging, sidecarName),
      serializeSidecar({ tool: "axiomui", version, skill: skill.name, files: skill.files })
    );
    if (plan.action === "replace") {
      // A symlink (the skills CLI links .claude/skills/x → .agents/skills/x) or a
      // stray file: remove the entry itself, never what a link points at.
      unlinkOrThrow(plan.skillDir);
    }
    try {
      renameSync(staging, plan.skillDir);
    } catch (error) {
      throw ioError(error, "create", plan.skillDir);
    }
  } catch (error) {
    rmSync(staging, { recursive: true, force: true });
    throw ioError(error, "write", plan.skillDir);
  }
}

/**
 * Executes an install plan. Conflicts and foreign folders are no-ops.
 * @param {InstallPlan} plan
 * @param {Bundle} bundle
 * @param {string} version
 */
export function applyInstall(plan, bundle, version) {
  if (plan.action === "conflict" || plan.action === "foreign") {
    return;
  }
  const skill = bundle.catalog.skills.find((candidate) => candidate.name === plan.skill);
  if (!skill) {
    throw new CliError(`Unknown skill ${plan.skill}.`);
  }
  if (plan.action === "install" || (plan.action === "replace" && plan.foreignKind !== "unmanaged")) {
    installFresh(plan, bundle, skill, version);
    return;
  }
  // Refuse directory-to-file replacements before changing any part of the skill.
  // Their contents may include user files, even when force was requested.
  for (const file of plan.writes) {
    if (!isUnder(plan.linked, file)) {
      const target = guardedPath(plan.skillDir, file);
      if (lstatOrNull(target)?.isDirectory()) {
        throw new CliError(`Refusing to replace ${target}: it is a folder. Move it before retrying.`);
      }
    }
  }
  // In place: an update of our own folder, or --force over a folder we do not manage.
  for (const dir of plan.linked) {
    unlinkOrThrow(safeJoin(plan.skillDir, dir));
  }
  for (const file of plan.writes) {
    writeAtomic(guardedPath(plan.skillDir, file), readBundledFile(bundle, skill, file));
  }
  for (const file of plan.deletes) {
    const target = guardedPath(plan.skillDir, file);
    unlinkOrThrow(target);
    pruneEmpty(path.dirname(target), path.join(plan.skillDir, "references"));
  }
  // Last, so an interrupted update still records the old hashes and a re-run resumes it.
  if (plan.writeSidecar) {
    writeAtomic(
      path.join(plan.skillDir, sidecarName),
      serializeSidecar({ tool: "axiomui", version, skill: skill.name, files: skill.files })
    );
  }
}

/**
 * Files under `dir` (relative, `/`-separated), without following symlinks.
 * A symlink is listed as an entry, never walked.
 * @param {string} dir
 * @param {string} [prefix]
 * @returns {string[]}
 */
function listEntries(dir, prefix = "") {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    return entry.isDirectory() ? listEntries(path.join(dir, entry.name), relative) : [relative];
  });
}

/**
 * Decides what removing one skill from one folder would do. All or nothing,
 * like update: an edited file or a symlinked folder skips the whole skill
 * unless --force, so a remove never leaves a SKILL.md whose references are gone.
 * @param {string} skillName
 * @param {string} targetDir
 * @param {{ force?: boolean }} [options]
 * @returns {RemovePlan}
 */
export function planRemove(skillName, targetDir, { force = false } = {}) {
  const skillDir = safeJoin(targetDir, skillName);
  /** @type {RemovePlan} */
  const plan = {
    skill: skillName,
    targetDir: path.resolve(targetDir),
    skillDir,
    action: "remove",
    deletes: [],
    conflicts: [],
    linked: [],
    leftovers: [],
    foreignKind: null,
  };
  const stat = lstatOrNull(skillDir);
  if (!stat) {
    plan.action = "absent";
    return plan;
  }
  const sidecar = stat.isDirectory() ? readSidecar(skillDir, skillName) : null;
  if (!sidecar) {
    plan.action = "foreign";
    plan.foreignKind = stat.isSymbolicLink() ? "symlink" : stat.isDirectory() ? "unmanaged" : "file";
    return plan;
  }
  const owned = Object.keys(sidecar.files).sort();
  plan.linked = linkedParents(skillDir, owned);
  for (const file of owned) {
    if (isUnder(plan.linked, file)) {
      continue;
    }
    const onDisk = hashOnDisk(safeJoin(skillDir, file));
    if (onDisk === null) {
      continue;
    }
    if (onDisk === sidecar.files[file]) {
      plan.deletes.push(file);
    } else {
      plan.conflicts.push(file);
    }
  }
  if ((plan.conflicts.length > 0 || plan.linked.length > 0) && !force) {
    plan.action = "conflict";
    plan.deletes = [];
    return plan;
  }
  // --force deletes edited files too, and a symlink where a file was (the link, never its target).
  const forced = plan.conflicts.filter((file) => {
    const entry = lstatOrNull(path.join(skillDir, file));
    return entry !== null && (entry.isFile() || entry.isSymbolicLink());
  });
  const deletes = new Set([...plan.deletes, ...forced]);
  plan.deletes = [...deletes].sort((a, b) => (a === "SKILL.md" ? -1 : b === "SKILL.md" ? 1 : a < b ? -1 : a > b ? 1 : 0));
  plan.leftovers = listEntries(skillDir).filter(
    (file) => file !== sidecarName && !deletes.has(file) && !plan.linked.includes(file) && !isUnder(plan.linked, file)
  );
  return plan;
}

/**
 * @param {RemovePlan} plan
 */
export function applyRemove(plan) {
  if (plan.action !== "remove") {
    return;
  }
  for (const dir of plan.linked) {
    unlinkOrThrow(safeJoin(plan.skillDir, dir));
  }
  // SKILL.md first: if this stops halfway, no agent sees a skill whose files are gone.
  for (const file of plan.deletes) {
    const target = guardedPath(plan.skillDir, file);
    unlinkOrThrow(target);
    pruneEmpty(path.dirname(target), plan.skillDir);
  }
  const sidecarPath = path.join(plan.skillDir, sidecarName);
  if (lstatOrNull(sidecarPath)) {
    unlinkOrThrow(sidecarPath);
  }
  pruneEmpty(plan.skillDir, plan.skillDir);
}

/**
 * Every axiomui-managed skill in a folder, found by its sidecar.
 * @param {string} targetDir
 * @returns {{ skill: string, version: string, skillDir: string }[]}
 */
export function findManaged(targetDir) {
  // stat, not lstat: the skills folder itself may be a symlink (dotfiles
  // managers link ~/.claude/skills), and installs write through it. Each
  // skill entry inside is still checked without following links.
  let stat;
  try {
    stat = statSync(targetDir);
  } catch {
    return [];
  }
  if (!stat.isDirectory()) {
    return [];
  }
  return readdirSync(targetDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && isSkillName(entry.name))
    .map((entry) => {
      const skillDir = path.join(targetDir, entry.name);
      const sidecar = readSidecar(skillDir, entry.name);
      return sidecar ? { skill: sidecar.skill, version: sidecar.version, skillDir } : null;
    })
    .filter(/** @returns {entry is { skill: string, version: string, skillDir: string }} */ (entry) => entry !== null)
    .sort((a, b) => (a.skill < b.skill ? -1 : a.skill > b.skill ? 1 : 0));
}

/**
 * What is at `<targetDir>/<name>`, for `list`.
 * @param {string} targetDir
 * @param {string} name
 * @returns {"absent" | "managed" | "symlink" | "unmanaged"}
 */
export function inspectEntry(targetDir, name) {
  const skillDir = safeJoin(targetDir, name);
  const stat = lstatOrNull(skillDir);
  if (!stat) {
    return "absent";
  }
  if (stat.isSymbolicLink()) {
    return "symlink";
  }
  return stat.isDirectory() && readSidecar(skillDir, name) ? "managed" : "unmanaged";
}

/**
 * Old site downloads of a renamed skill. Pristine ones (hash in the catalog)
 * may be removed; edited ones are only ever reported.
 * @param {Bundle} bundle
 * @param {string} targetDir
 * @returns {{ name: string, replacedBy: string, file: string, pristine: boolean }[]}
 */
export function findLegacy(bundle, targetDir) {
  return bundle.catalog.legacy.flatMap((legacy) => {
    const dir = safeJoin(targetDir, legacy.name);
    const dirStat = lstatOrNull(dir);
    if (!dirStat || !dirStat.isDirectory()) {
      return [];
    }
    const file = path.join(dir, "SKILL.md");
    const hash = hashOnDisk(file);
    if (hash === null || hash === "not-a-file") {
      return [];
    }
    const pristine = legacy.sha256.some((candidate) => `sha256:${candidate}` === hash);
    return [{ name: legacy.name, replacedBy: legacy.replacedBy, file, pristine }];
  });
}

/**
 * Deletes a pristine legacy SKILL.md and its folder when that leaves it empty.
 * @param {{ file: string, pristine: boolean }} legacy
 */
export function removeLegacy(legacy) {
  if (!legacy.pristine) {
    return;
  }
  unlinkSync(legacy.file);
  const dir = path.dirname(legacy.file);
  if (readdirSync(dir).length === 0) {
    rmdirSync(dir);
  }
}
