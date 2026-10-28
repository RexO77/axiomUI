// @ts-check
// Build a self-contained package from the generated skills. --clean removes
// only package-local copies; --require-license checks publication prerequisites.
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { isSafeRelativeFile, isSkillName, sha256 } from "../lib/catalog.mjs";

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(packageDir, "../..");
const source = path.join(repoRoot, "skills");
const destination = path.join(packageDir, "skills");
const license = path.join(repoRoot, "LICENSE");
const packagedLicense = path.join(packageDir, "LICENSE");

/** @param {string} file */
function assertRegularFile(file) {
  let current = file;
  while (current !== repoRoot) {
    const stat = lstatSync(current);
    if (stat.isSymbolicLink()) throw new Error(`bundle-skills: refusing symbolic link ${file}`);
    if (current === file && !stat.isFile()) throw new Error(`bundle-skills: not a regular file: ${file}`);
    current = path.dirname(current);
  }
}

if (process.argv.includes("--require-license")) {
  assertRegularFile(path.join(packageDir, "package.json"));
  const pkg = JSON.parse(readFileSync(path.join(packageDir, "package.json"), "utf8"));
  const problems = [
    ...(existsSync(license) ? [] : ["there is no LICENSE file at the repo root"]),
    ...(typeof pkg.license === "string" && pkg.license.trim() && pkg.license.trim() !== "UNLICENSED"
      ? [] : ['packages/axiomui/package.json has no publishable "license" field']),
  ];
  if (problems.length > 0) {
    console.error(`bundle-skills: refusing to publish: ${problems.join(", and ")}.`);
    process.exit(1);
  }
  assertRegularFile(license);
  if (!readFileSync(license, "utf8").trim()) throw new Error("bundle-skills: LICENSE is empty");
  console.log(`bundle-skills: license ${pkg.license} and LICENSE present.`);
  process.exit(0);
}

if (process.argv.includes("--clean")) {
  rmSync(destination, { recursive: true, force: true });
  rmSync(packagedLicense, { force: true });
  process.exit(0);
}

// Validate the complete input before replacing an existing bundle. Copy only
// catalogued files, so ignored local material never enters the package.
const catalogFile = path.join(source, "catalog.json");
assertRegularFile(catalogFile);
const catalogContent = readFileSync(catalogFile);
const catalog = JSON.parse(catalogContent.toString("utf8"));
if (catalog.schema !== 1 || !Array.isArray(catalog.skills) || catalog.skills.length === 0) {
  throw new Error("bundle-skills: invalid or empty catalog");
}
const files = new Map([["catalog.json", catalogContent]]);
const seen = new Set();
for (const skill of catalog.skills) {
  if (!isSkillName(skill.name) || seen.has(skill.name) || !skill.files || Array.isArray(skill.files) ||
      typeof skill.files !== "object" || !Object.hasOwn(skill.files, "SKILL.md")) {
    throw new Error("bundle-skills: invalid skill entry");
  }
  seen.add(skill.name);
  for (const [file, hash] of Object.entries(skill.files)) {
    if (!isSafeRelativeFile(file) || typeof hash !== "string" || !/^sha256:[a-f0-9]{64}$/.test(hash)) {
      throw new Error("bundle-skills: unsafe catalog file");
    }
    const relative = `${skill.name}/${file}`;
    const absolute = path.join(source, relative);
    assertRegularFile(absolute);
    const content = readFileSync(absolute);
    if (sha256(content) !== hash) throw new Error(`bundle-skills: catalog hash mismatch: ${relative}`);
    if (file.endsWith(".md")) {
      for (const match of content.toString("utf8").matchAll(/(?:`|\]\()(references\/[A-Za-z0-9_./-]+\.md)(?:`|\))/g)) {
        const reference = match[1];
        if (!isSafeRelativeFile(reference) || !Object.hasOwn(skill.files, reference)) {
          throw new Error(`bundle-skills: missing local reference: ${skill.name}/${reference}`);
        }
      }
    }
    files.set(relative, content);
  }
}
assertRegularFile(path.join(source, "README.md"));
files.set("README.md", readFileSync(path.join(source, "README.md")));
let licenseContent = null;
if (existsSync(license)) {
  assertRegularFile(license);
  licenseContent = readFileSync(license);
}

const staging = mkdtempSync(path.join(packageDir, ".skills-bundle-"));
try {
  const stagedSkills = path.join(staging, "skills");
  for (const [relative, content] of files) {
    const target = path.join(stagedSkills, relative);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  if (licenseContent !== null) writeFileSync(path.join(staging, "LICENSE"), licenseContent);
  rmSync(destination, { recursive: true, force: true });
  renameSync(stagedSkills, destination);
  rmSync(packagedLicense, { force: true });
  if (existsSync(path.join(staging, "LICENSE"))) renameSync(path.join(staging, "LICENSE"), packagedLicense);
} finally {
  rmSync(staging, { recursive: true, force: true });
}
if (!existsSync(license)) console.warn("bundle-skills: no LICENSE at the repo root; publication remains blocked.");
console.log(`bundle-skills: copied ${path.relative(repoRoot, source)} into ${path.relative(repoRoot, destination)}`);
