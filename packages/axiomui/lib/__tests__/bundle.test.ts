import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { renderSkillsTree } from "@/lib/skills/render";
import { loadBundle, readBundledFile } from "../catalog.mjs";
import { tempDir, writeTree } from "./helpers";

const packageRoot = path.resolve(__dirname, "../..");

function fixture() {
  const root = tempDir("axiom-bundle-");
  const pkg = path.join(root, "packages/axiomui");
  mkdirSync(path.join(pkg, "scripts"), { recursive: true });
  cpSync(path.join(packageRoot, "scripts/bundle-skills.mjs"), path.join(pkg, "scripts/bundle-skills.mjs"));
  cpSync(path.join(packageRoot, "lib"), path.join(pkg, "lib"), { recursive: true });
  writeTree(root, Object.fromEntries(renderSkillsTree("MIT")));
  writeTree(root, { LICENSE: "MIT license fixture\n", "packages/axiomui/package.json": '{"name":"axiomui","license":"MIT"}\n' });
  return { root, pkg };
}

function run(pkg: string, ...args: string[]) {
  return spawnSync(process.execPath, [path.join(pkg, "scripts/bundle-skills.mjs"), ...args], {
    cwd: pkg, encoding: "utf8", timeout: 30_000,
  });
}

function fileList(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((item) => item.isDirectory()
    ? fileList(path.join(root, item.name)).map((file) => `${item.name}/${file}`)
    : [item.name]).sort();
}

describe("skill package bundling", () => {
  it("bundles every catalogued file, verifies hashes, and excludes uncatalogued local material", () => {
    const { root, pkg } = fixture();
    writeTree(root, { "skills/axiomui/private.txt": "keep private\n" });
    const result = run(pkg);
    expect(result.status, result.stderr).toBe(0);
    const bundle = loadBundle(pkg);
    expect(bundle.skillsDir).toBe(path.join(pkg, "skills"));
    const expected = ["README.md", "catalog.json"];
    expect(bundle.catalog.skills).toHaveLength(11);
    for (const skill of bundle.catalog.skills) {
      for (const file of Object.keys(skill.files)) {
        expect(readBundledFile(bundle, skill, file)).toEqual(readFileSync(path.join(root, "skills", skill.name, file)));
        expected.push(`${skill.name}/${file}`);
      }
    }
    expect(fileList(path.join(pkg, "skills"))).toEqual(expected.sort());
    expect(readFileSync(path.join(pkg, "LICENSE"), "utf8")).toBe("MIT license fixture\n");
    expect(readdirSync(pkg).some((file) => file.startsWith(".skills-bundle-"))).toBe(false);
  });

  it("refreshes a stale package bundle and clears a previously bundled license when absent", () => {
    const { root, pkg } = fixture();
    expect(run(pkg).status).toBe(0);
    writeTree(pkg, { "skills/stale.txt": "stale\n" });
    rmSync(path.join(root, "LICENSE"));
    const result = run(pkg);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stderr).toContain("publication remains blocked");
    expect(existsSync(path.join(pkg, "skills/stale.txt"))).toBe(false);
    expect(existsSync(path.join(pkg, "LICENSE"))).toBe(false);
  });

  it.each(["missing", "hash", "traversal", "link"])("refuses %s source before replacing an existing bundle", (kind) => {
    const { root, pkg } = fixture();
    expect(run(pkg).status).toBe(0);
    const existing = readFileSync(path.join(pkg, "skills/catalog.json"), "utf8");
    const file = path.join(root, "skills/axiomui/SKILL.md");
    if (kind === "missing") rmSync(file);
    if (kind === "hash") writeFileSync(file, "edited\n");
    if (kind === "link") {
      const outside = tempDir("axiom-bundle-outside-");
      writeTree(outside, { "SKILL.md": readFileSync(file, "utf8") });
      rmSync(file);
      symlinkSync(path.join(outside, "SKILL.md"), file);
    }
    if (kind === "traversal") {
      const catalogPath = path.join(root, "skills/catalog.json");
      const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
      catalog.skills[0].files["../../private.txt"] = "sha256:" + "0".repeat(64);
      writeFileSync(catalogPath, JSON.stringify(catalog));
    }
    expect(run(pkg).status).not.toBe(0);
    expect(readFileSync(path.join(pkg, "skills/catalog.json"), "utf8")).toBe(existing);
    expect(readdirSync(pkg).some((entry) => entry.startsWith(".skills-bundle-"))).toBe(false);
  });

  it("refuses a reference omitted from the catalog without replacing the existing bundle", () => {
    const { root, pkg } = fixture();
    expect(run(pkg).status).toBe(0);
    const existing = readFileSync(path.join(pkg, "skills/catalog.json"), "utf8");
    const catalogPath = path.join(root, "skills/catalog.json");
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    const skill = catalog.skills.find((entry: { name: string }) => entry.name === "axiomui");
    delete skill.files["references/rules/typo-1.md"];
    rmSync(path.join(root, "skills/axiomui/references/rules/typo-1.md"));
    writeFileSync(catalogPath, JSON.stringify(catalog));
    const result = run(pkg);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("missing local reference: axiomui/references/rules/typo-1.md");
    expect(readFileSync(path.join(pkg, "skills/catalog.json"), "utf8")).toBe(existing);
    expect(existsSync(path.join(pkg, "skills/axiomui/references/rules/typo-1.md"))).toBe(true);
  });

  it("cleans only package-local generated copies and leaves source and linked destinations intact", () => {
    const { root, pkg } = fixture();
    const source = readFileSync(path.join(root, "skills/catalog.json"), "utf8");
    const outside = tempDir("axiom-bundle-outside-");
    writeTree(outside, { "keep.txt": "preserve\n" });
    symlinkSync(outside, path.join(pkg, "skills"));
    symlinkSync(path.join(outside, "keep.txt"), path.join(pkg, "LICENSE"));
    expect(run(pkg, "--clean").status).toBe(0);
    expect(existsSync(path.join(pkg, "skills"))).toBe(false);
    expect(existsSync(path.join(pkg, "LICENSE"))).toBe(false);
    expect(readFileSync(path.join(outside, "keep.txt"), "utf8")).toBe("preserve\n");
    expect(readFileSync(path.join(root, "skills/catalog.json"), "utf8")).toBe(source);
  });

  it.each(["missing file", "empty file", "missing field", "unlicensed", "linked file"])("blocks publication with %s", (kind) => {
    const { root, pkg } = fixture();
    if (kind === "missing file") rmSync(path.join(root, "LICENSE"));
    if (kind === "empty file") writeFileSync(path.join(root, "LICENSE"), " \n");
    if (kind === "missing field") writeFileSync(path.join(pkg, "package.json"), "{}");
    if (kind === "unlicensed") writeFileSync(path.join(pkg, "package.json"), '{"license":" UNLICENSED "}');
    if (kind === "linked file") {
      writeTree(root, { "outside-license.txt": "license\n" });
      rmSync(path.join(root, "LICENSE"));
      symlinkSync(path.join(root, "outside-license.txt"), path.join(root, "LICENSE"));
    }
    expect(run(pkg, "--require-license").status).not.toBe(0);
    expect(existsSync(path.join(pkg, "skills"))).toBe(false);
  });

  it("validates publication prerequisites without creating a package bundle", () => {
    const { pkg } = fixture();
    const result = run(pkg, "--require-license");
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("license MIT and LICENSE present");
    expect(existsSync(path.join(pkg, "skills"))).toBe(false);
  });
});
