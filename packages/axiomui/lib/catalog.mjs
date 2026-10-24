// @ts-check
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { CliError } from "./format.mjs";

/**
 * @typedef {object} CatalogSkill
 * @property {string} name
 * @property {"core" | "domain"} group
 * @property {string} title
 * @property {string} summary
 * @property {number} ruleCount
 * @property {string[]} aliases
 * @property {Record<string, string>} files relative path → "sha256:<hex>"
 */

/**
 * @typedef {object} LegacySkill
 * @property {string} name
 * @property {string} replacedBy
 * @property {string[]} sha256 hashes of unedited copies of the old download
 */

/**
 * @typedef {object} Catalog
 * @property {number} schema
 * @property {string} site
 * @property {string} repo
 * @property {CatalogSkill[]} skills
 * @property {LegacySkill[]} legacy
 */

/**
 * @typedef {object} Bundle
 * @property {Catalog} catalog
 * @property {string} skillsDir the folder holding catalog.json and one folder per skill
 */

export const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const skillName = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const relativeFile = /^[A-Za-z0-9_-][A-Za-z0-9._-]*(\/[A-Za-z0-9_-][A-Za-z0-9._-]*)*$/;

/** @param {unknown} name */
export const isSkillName = (name) => typeof name === "string" && name.length <= 64 && skillName.test(name);

/**
 * A path inside a skill folder: forward slashes, no `.` or `..` segments, no
 * leading dot, nothing absolute. Everything the CLI writes or deletes passes this.
 * @param {unknown} file
 */
export const isSafeRelativeFile = (file) =>
  typeof file === "string" && relativeFile.test(file) && !file.split("/").some((part) => part === "." || part === "..");

/** @param {Buffer | string} content */
export const sha256 = (content) => `sha256:${createHash("sha256").update(content).digest("hex")}`;

/** @param {string} root */
export function readPackageVersion(root = packageRoot) {
  const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  return String(pkg.version);
}

/**
 * @param {unknown} value
 * @returns {Catalog}
 */
function validateCatalog(value) {
  const catalog = /** @type {Catalog} */ (value);
  if (!catalog || catalog.schema !== 1 || !Array.isArray(catalog.skills)) {
    throw new CliError("The bundled skills catalog has an unknown format. Reinstall axiomui.");
  }
  for (const skill of catalog.skills) {
    if (!skill || !isSkillName(skill.name) || !skill.files || typeof skill.files !== "object" || Array.isArray(skill.files)) {
      throw new CliError(`The bundled skills catalog has an invalid entry: ${JSON.stringify(skill?.name)}`);
    }
    for (const [file, hash] of Object.entries(skill.files)) {
      if (!isSafeRelativeFile(file) || typeof hash !== "string" || !/^sha256:[a-f0-9]{64}$/.test(hash)) {
        throw new CliError(`The bundled skills catalog lists an unsafe path: ${skill.name}/${file}`);
      }
    }
  }
  catalog.legacy = Array.isArray(catalog.legacy) ? catalog.legacy.filter((entry) => entry && isSkillName(entry.name)) : [];
  return catalog;
}

/**
 * The packed tarball ships `skills/` beside `lib/`. A repo checkout has it two
 * levels up, so `node packages/axiomui/bin/axiomui.mjs` works without packing.
 * @param {string} [root]
 * @returns {Bundle}
 */
export function loadBundle(root = packageRoot) {
  const skillsDir = [path.join(root, "skills"), path.resolve(root, "../../skills")].find((dir) =>
    existsSync(path.join(dir, "catalog.json"))
  );
  if (!skillsDir) {
    throw new CliError(`No bundled skills found next to ${root}. Reinstall axiomui.`);
  }
  const catalogPath = path.join(skillsDir, "catalog.json");
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(catalogPath, "utf8"));
  } catch {
    throw new CliError(`Could not read bundled skills catalog at ${catalogPath}. Reinstall axiomui.`);
  }
  return { catalog: validateCatalog(parsed), skillsDir };
}

/**
 * One bundled file, verified against the hash the catalog promises.
 * @param {Bundle} bundle
 * @param {CatalogSkill} skill
 * @param {string} file
 */
export function readBundledFile(bundle, skill, file) {
  if (!isSkillName(skill.name) || !isSafeRelativeFile(file) || !Object.hasOwn(skill.files, file)) {
    throw new CliError(`The bundled skills catalog does not list ${skill.name}/${file}. Reinstall axiomui.`);
  }
  const filePath = path.join(bundle.skillsDir, skill.name, ...file.split("/"));
  let content;
  try {
    content = readFileSync(filePath);
  } catch {
    throw new CliError(`Could not read bundled file ${skill.name}/${file} at ${filePath}. Reinstall axiomui.`);
  }
  if (sha256(content) !== skill.files[file]) {
    throw new CliError(`Bundled file ${skill.name}/${file} does not match its catalog hash. Reinstall axiomui.`);
  }
  return content;
}
