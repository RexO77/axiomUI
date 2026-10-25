import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  renameSync,
  statSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { sha256, type Bundle } from "../catalog.mjs";
import {
  applyInstall,
  applyRemove,
  findLegacy,
  findManaged,
  planInstall,
  planRemove,
  readSidecar,
  removeLegacy,
  safeJoin,
  sidecarName,
} from "../install.mjs";
import { makeBundle, tempDir, writeTree } from "./helpers";

const version = "0.1.0";
const v1 = {
  "SKILL.md": "---\nname: demo\n---\n\nv1\n",
  "references/rules/a.md": "rule a v1\n",
  "references/rules/b.md": "rule b v1\n",
};

function setup(files: Record<string, string> = v1) {
  const root = tempDir();
  const bundle = makeBundle(path.join(root, "bundle"), { demo: { files } });
  const target = path.join(root, "project", ".claude", "skills");
  return { root, bundle, target, skill: bundle.catalog.skills[0] };
}

function install(bundle: Bundle, target: string, force = false) {
  const plan = planInstall(bundle.catalog.skills[0], target, { force });
  applyInstall(plan, bundle, version);
  return plan;
}

/** Every file under a folder with its bytes and mtime, to prove nothing moved. */
function snapshot(dir: string): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (current: string) => {
    if (!existsSync(current)) {
      return;
    }
    const stat = lstatSync(current);
    if (stat.isSymbolicLink()) {
      out[path.relative(dir, current)] = `link:${readlinkSync(current)}`;
    } else if (stat.isDirectory()) {
      for (const entry of readdirSync(current)) {
        walk(path.join(current, entry));
      }
    } else {
      out[path.relative(dir, current)] = `${readFileSync(current, "utf8")}@${stat.mtimeMs}`;
    }
  };
  walk(dir);
  return out;
}

describe("planInstall / applyInstall", () => {
  it("installs every file and the sidecar last, then a re-run is up to date with no writes", () => {
    const { bundle, target, skill } = setup();
    const first = install(bundle, target);
    expect(first.action).toBe("install");
    expect(first.writes).toEqual(Object.keys(v1).sort());
    const skillDir = path.join(target, "demo");
    expect(readFileSync(path.join(skillDir, "references/rules/a.md"), "utf8")).toBe(v1["references/rules/a.md"]);
    expect(readSidecar(skillDir, "demo")).toEqual({ tool: "axiomui", version, skill: "demo", files: skill.files });

    const before = snapshot(target);
    const second = install(bundle, target);
    expect(second.action).toBe("uptodate");
    expect(second.writes).toEqual([]);
    expect(snapshot(target)).toEqual(before);
  });

  it("updates unedited files when the bundle changes", () => {
    const { root, bundle, target } = setup();
    install(bundle, target);
    const next = makeBundle(path.join(root, "bundle2"), {
      demo: { files: { ...v1, "SKILL.md": "---\nname: demo\n---\n\nv2\n" } },
    });
    const plan = install(next, target);
    expect(plan.action).toBe("update");
    expect(plan.writes).toEqual(["SKILL.md"]);
    expect(readFileSync(path.join(target, "demo/SKILL.md"), "utf8")).toContain("v2");
    expect(readSidecar(path.join(target, "demo"))?.files["SKILL.md"]).toBe(sha256("---\nname: demo\n---\n\nv2\n"));
  });

  it.each([false, true])("preserves blocked dropped paths when force is %s", (force) => {
    const { root, bundle, target } = setup();
    install(bundle, target);
    const references = path.join(target, "demo/references");
    renameSync(references, path.join(root, "old-references"));
    writeFileSync(references, "my notes\n");
    const next = makeBundle(path.join(root, "bundle2"), {
      demo: { files: { "SKILL.md": "v2\n" } },
    });

    const plan = install(next, target, force);

    expect(plan.action).toBe("update");
    expect(plan.linked).toEqual([]);
    expect(plan.kept).toEqual(["references"]);
    expect(readFileSync(references, "utf8")).toBe("my notes\n");
    expect(readSidecar(path.join(target, "demo"))?.files).toEqual(next.catalog.skills[0].files);
    expect(planInstall(next.catalog.skills[0], target).action).toBe("uptodate");
  });

  it("refuses a directory-to-file replacement before changing any installed files", () => {
    const { root, bundle, target } = setup({ "SKILL.md": "v1\n", "references/guide/details.md": "old guide\n" });
    install(bundle, target);
    const before = snapshot(target);
    const next = makeBundle(path.join(root, "bundle2"), {
      demo: { files: { "SKILL.md": "v2\n", "references/guide": "new flat guide\n" } },
    });
    const plan = planInstall(next.catalog.skills[0], target, { force: true });

    expect(() => applyInstall(plan, next, version)).toThrow(/folder|directory|EISDIR/);
    expect(snapshot(target)).toEqual(before);
  });

  it("replaces an owned file with a directory without deleting its replacement", () => {
    const { root, bundle, target } = setup({ "SKILL.md": "v1\n", "references/guide": "old guide\n" });
    install(bundle, target);
    const next = makeBundle(path.join(root, "bundle2"), {
      demo: { files: { "SKILL.md": "v2\n", "references/guide/details.md": "new guide\n" } },
    });

    expect(planInstall(next.catalog.skills[0], target).action).toBe("conflict");
    const plan = install(next, target, true);

    expect(plan.deletes).not.toContain("references/guide");
    expect(readFileSync(path.join(target, "demo/references/guide/details.md"), "utf8")).toBe("new guide\n");
    expect(readFileSync(path.join(target, "demo/SKILL.md"), "utf8")).toBe("v2\n");
    expect(readSidecar(path.join(target, "demo"))?.files).toEqual(next.catalog.skills[0].files);
    expect(planInstall(next.catalog.skills[0], target).action).toBe("uptodate");
  });

  it("does not follow a pre-existing update temporary-file symlink", () => {
    const { root, bundle, target } = setup();
    install(bundle, target);
    const outside = path.join(root, "keep.md");
    writeFileSync(outside, "keep\n");
    const installed = path.join(target, "demo/SKILL.md");
    symlinkSync(outside, `${installed}.tmp-${process.pid}`);
    const next = makeBundle(path.join(root, "bundle2"), {
      demo: { files: { ...v1, "SKILL.md": "v2\n" } },
    });

    install(next, target);

    expect(readFileSync(outside, "utf8")).toBe("keep\n");
    expect(lstatSync(installed).isFile()).toBe(true);
    expect(readFileSync(installed, "utf8")).toBe("v2\n");
  });

  it("skips the whole skill when the user edited a file, and --force overwrites it", () => {
    const { root, bundle, target } = setup();
    install(bundle, target);
    const edited = path.join(target, "demo/references/rules/a.md");
    writeFileSync(edited, "my notes\n");
    const next = makeBundle(path.join(root, "bundle2"), {
      demo: { files: { ...v1, "references/rules/b.md": "rule b v2\n" } },
    });

    const plan = install(next, target);
    expect(plan.action).toBe("conflict");
    expect(plan.conflicts).toEqual(["references/rules/a.md"]);
    // No half-updated skill: b.md was not touched either.
    expect(readFileSync(path.join(target, "demo/references/rules/b.md"), "utf8")).toBe("rule b v1\n");
    expect(readFileSync(edited, "utf8")).toBe("my notes\n");

    const forced = install(next, target, true);
    expect(forced.action).toBe("update");
    expect(readFileSync(edited, "utf8")).toBe(v1["references/rules/a.md"]);
    expect(readFileSync(path.join(target, "demo/references/rules/b.md"), "utf8")).toBe("rule b v2\n");
  });

  it("restores a file the user deleted", () => {
    const { bundle, target } = setup();
    install(bundle, target);
    unlinkSync(path.join(target, "demo/references/rules/b.md"));
    const plan = install(bundle, target);
    expect(plan.action).toBe("update");
    expect(plan.writes).toEqual(["references/rules/b.md"]);
  });

  it("removes a file dropped from the bundle when unedited, and keeps it when edited", () => {
    const { root, bundle, target } = setup();
    install(bundle, target);
    const withoutB: Record<string, string> = { ...v1 };
    delete withoutB["references/rules/b.md"];
    const next = makeBundle(path.join(root, "bundle2"), { demo: { files: withoutB } });
    const plan = install(next, target);
    expect(plan.action).toBe("update");
    expect(plan.deletes).toEqual(["references/rules/b.md"]);
    expect(existsSync(path.join(target, "demo/references/rules/b.md"))).toBe(false);

    // Same again, but edited first: kept, and the skill still updates.
    const other = setup();
    install(other.bundle, other.target);
    writeFileSync(path.join(other.target, "demo/references/rules/b.md"), "mine\n");
    const nextOther = makeBundle(path.join(other.root, "bundle2"), { demo: { files: withoutB } });
    const keptPlan = install(nextOther, other.target, true);
    expect(keptPlan.kept).toEqual(["references/rules/b.md"]);
    expect(readFileSync(path.join(other.target, "demo/references/rules/b.md"), "utf8")).toBe("mine\n");
  });

  it("leaves a folder it does not manage alone unless forced", () => {
    const { bundle, target } = setup();
    writeTree(path.join(target, "demo"), { "SKILL.md": "hand-made\n", "notes.md": "mine\n" });
    const plan = install(bundle, target);
    expect(plan.action).toBe("foreign");
    expect(plan.foreignKind).toBe("unmanaged");
    expect(readFileSync(path.join(target, "demo/SKILL.md"), "utf8")).toBe("hand-made\n");

    const forced = install(bundle, target, true);
    expect(forced.action).toBe("replace");
    expect(readFileSync(path.join(target, "demo/SKILL.md"), "utf8")).toBe(v1["SKILL.md"]);
    expect(readFileSync(path.join(target, "demo/notes.md"), "utf8")).toBe("mine\n");
    expect(readSidecar(path.join(target, "demo"), "demo")).not.toBeNull();
  });

  it("never writes through a symlinked skill folder, and --force replaces only the link", () => {
    const { root, bundle, target } = setup();
    const realDir = path.join(root, "project", ".agents", "skills", "demo");
    writeTree(realDir, { "SKILL.md": "skills cli copy\n" });
    mkdirSync(target, { recursive: true });
    symlinkSync(realDir, path.join(target, "demo"));
    const linkedBefore = snapshot(realDir);

    const plan = install(bundle, target);
    expect(plan.action).toBe("foreign");
    expect(plan.foreignKind).toBe("symlink");
    expect(snapshot(realDir)).toEqual(linkedBefore);

    const forced = install(bundle, target, true);
    expect(forced.action).toBe("replace");
    expect(lstatSync(path.join(target, "demo")).isSymbolicLink()).toBe(false);
    expect(statSync(path.join(target, "demo")).isDirectory()).toBe(true);
    expect(snapshot(realDir)).toEqual(linkedBefore);
  });

  it("plans without writing, so a dry run leaves the tree byte-identical", () => {
    const { root, bundle, target } = setup();
    install(bundle, target);
    writeFileSync(path.join(target, "demo/references/rules/a.md"), "edited\n");
    const before = snapshot(path.join(root, "project"));
    const next = makeBundle(path.join(root, "bundle2"), { demo: { files: { ...v1, "SKILL.md": "v2\n" } } });
    planInstall(next.catalog.skills[0], target, { force: true });
    planInstall(next.catalog.skills[0], path.join(root, "project", "fresh"));
    planRemove("demo", target, { force: true });
    expect(snapshot(path.join(root, "project"))).toEqual(before);
  });

  it("does not trust a sidecar that names paths outside the skill", () => {
    const { bundle, target } = setup();
    install(bundle, target);
    const sidecarPath = path.join(target, "demo", sidecarName);
    const sidecar = JSON.parse(readFileSync(sidecarPath, "utf8"));
    sidecar.files["../../escape.md"] = sha256("x");
    writeFileSync(sidecarPath, JSON.stringify(sidecar));
    expect(readSidecar(path.join(target, "demo"), "demo")).toBeNull();
    expect(planRemove("demo", target).action).toBe("foreign");
  });
});

describe("symlinks inside and around a skill", () => {
  it("finds, updates and removes installs through a symlinked skills folder", () => {
    const { root, bundle, target } = setup();
    const real = path.join(root, "dotfiles", "skills");
    mkdirSync(real, { recursive: true });
    mkdirSync(path.dirname(target), { recursive: true });
    symlinkSync(real, target);

    expect(install(bundle, target).action).toBe("install");
    expect(existsSync(path.join(real, "demo/SKILL.md"))).toBe(true);
    expect(findManaged(target)).toEqual([{ skill: "demo", version, skillDir: path.join(target, "demo") }]);

    const plan = planRemove("demo", target);
    expect(plan.action).toBe("remove");
    applyRemove(plan);
    expect(existsSync(path.join(real, "demo"))).toBe(false);
    expect(lstatSync(target).isSymbolicLink()).toBe(true);
  });

  it("never writes or deletes through a symlinked folder inside a managed skill", () => {
    const { root, bundle, target } = setup();
    install(bundle, target);
    const outside = path.join(root, "outside", "refs");
    mkdirSync(path.dirname(outside), { recursive: true });
    const references = path.join(target, "demo", "references");
    renameSync(references, outside);
    symlinkSync(outside, references);
    const outsideBefore = snapshot(outside);

    const next = makeBundle(path.join(root, "bundle2"), {
      demo: { files: { ...v1, "references/rules/a.md": "rule a v2\n", "references/extra/new.md": "new\n" } },
    });
    const plan = install(next, target);
    expect(plan.action).toBe("conflict");
    expect(plan.linked).toEqual(["references"]);
    expect(snapshot(outside)).toEqual(outsideBefore);

    const removal = planRemove("demo", target);
    expect(removal.action).toBe("conflict");
    applyRemove(removal);
    expect(snapshot(outside)).toEqual(outsideBefore);

    // --force replaces the link with a real folder and leaves its target alone.
    const forced = install(next, target, true);
    expect(forced.action).toBe("update");
    expect(lstatSync(references).isDirectory()).toBe(true);
    expect(readFileSync(path.join(references, "extra/new.md"), "utf8")).toBe("new\n");
    expect(snapshot(outside)).toEqual(outsideBefore);
  });
});

describe("interrupted installs", () => {
  it("leaves nothing behind when a fresh install fails part way, so a re-run installs cleanly", () => {
    const { bundle, target, skill } = setup();
    // The bundle loses a file: the write loop fails after the first files.
    unlinkSync(path.join(bundle.skillsDir, "demo", "references/rules/b.md"));
    const plan = planInstall(skill, target);
    expect(() => applyInstall(plan, bundle, version)).toThrow();
    expect(readdirSync(target)).toEqual([]);

    writeFileSync(path.join(bundle.skillsDir, "demo", "references/rules/b.md"), v1["references/rules/b.md"]);
    expect(install(bundle, target).action).toBe("install");
    expect(readdirSync(target)).toEqual(["demo"]);
    expect(readSidecar(path.join(target, "demo"), "demo")).not.toBeNull();
  });

  it("clears a staging folder left by a run that was killed", () => {
    const { bundle, target } = setup();
    const stale = path.join(target, ".axiomui-staging-demo-999999999");
    writeTree(stale, { "references/rules/a.md": "partial\n" });
    install(bundle, target);
    expect(readdirSync(target)).toEqual(["demo"]);
  });
});

describe("safeJoin", () => {
  it("refuses any path that resolves outside the base", () => {
    const base = tempDir();
    expect(safeJoin(base, "demo", "SKILL.md")).toBe(path.join(base, "demo", "SKILL.md"));
    expect(() => safeJoin(base, "..", "outside")).toThrow(/outside/);
    expect(() => safeJoin(base, "demo/../../outside")).toThrow(/outside/);
    expect(() => safeJoin(base, "/etc/passwd")).toThrow(/outside/);
  });
});

describe("planRemove / applyRemove", () => {
  it("deactivates the skill before a linked-folder cleanup fails", () => {
    const { root, bundle, target } = setup();
    install(bundle, target);
    const references = path.join(target, "demo/references");
    const outside = path.join(root, "outside-references");
    renameSync(references, outside);
    symlinkSync(outside, references);
    const plan = planRemove("demo", target, { force: true });
    unlinkSync(references);

    expect(() => applyRemove(plan)).toThrow(/delete/);
    expect(existsSync(path.join(target, "demo/SKILL.md"))).toBe(false);
    expect(readFileSync(path.join(outside, "rules/a.md"), "utf8")).toBe(v1["references/rules/a.md"]);
    applyRemove(planRemove("demo", target));
    expect(existsSync(path.join(target, "demo"))).toBe(false);
  });

  it("is all or nothing: an edited file skips the whole skill until --force", () => {
    const { bundle, target } = setup();
    install(bundle, target);
    writeFileSync(path.join(target, "demo/SKILL.md"), "edited\n");
    const before = snapshot(target);

    const plan = planRemove("demo", target);
    expect(plan.action).toBe("conflict");
    expect(plan.conflicts).toEqual(["SKILL.md"]);
    applyRemove(plan);
    // Nothing deleted, so the agent never sees a SKILL.md whose references are gone.
    expect(snapshot(target)).toEqual(before);

    const forced = planRemove("demo", target, { force: true });
    expect(forced.action).toBe("remove");
    expect(forced.deletes[0]).toBe("SKILL.md");
    applyRemove(forced);
    expect(existsSync(path.join(target, "demo"))).toBe(false);
  });

  it("reports files it never installed and leaves them, with the folder", () => {
    const { bundle, target } = setup();
    install(bundle, target);
    writeFileSync(path.join(target, "demo/references/mine.md"), "my notes\n");
    const plan = planRemove("demo", target);
    expect(plan.action).toBe("remove");
    expect(plan.leftovers).toEqual(["references/mine.md"]);
    applyRemove(plan);
    expect(readdirSync(path.join(target, "demo"), { recursive: true }).sort()).toEqual(["references", path.join("references", "mine.md")]);
  });

  it("never touches a folder it does not manage", () => {
    const { target } = setup();
    writeTree(path.join(target, "demo"), { "SKILL.md": "hand-made\n" });
    const plan = planRemove("demo", target, { force: true });
    expect(plan.action).toBe("foreign");
    applyRemove(plan);
    expect(readFileSync(path.join(target, "demo/SKILL.md"), "utf8")).toBe("hand-made\n");
  });
});

describe("legacy downloads", () => {
  it("recognises a pristine old download by hash and removes only that one", () => {
    const { bundle, target } = setup();
    writeTree(target, { "axiom-website-upgrade/SKILL.md": "old pristine\n" });
    const [found] = findLegacy(bundle, target);
    expect(found).toMatchObject({ name: "axiom-website-upgrade", replacedBy: "axiomui-website-upgrade", pristine: true });
    removeLegacy(found);
    expect(existsSync(path.join(target, "axiom-website-upgrade"))).toBe(false);
  });

  it("reports an edited old download and never deletes it", () => {
    const { bundle, target } = setup();
    writeTree(target, { "axiom-website-upgrade/SKILL.md": "old, with my edits\n" });
    const [found] = findLegacy(bundle, target);
    expect(found.pristine).toBe(false);
    removeLegacy(found);
    expect(readFileSync(path.join(target, "axiom-website-upgrade/SKILL.md"), "utf8")).toBe("old, with my edits\n");
  });
});
