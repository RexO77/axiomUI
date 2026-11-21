#!/usr/bin/env node
/**
 * Prove a change did not alter rendered output.
 *
 * Snapshots the markup of every prerendered page plus the built CSS, with the
 * things that legitimately move between builds normalised away (content-hashed
 * chunk filenames, Next's build id, the streaming payload). Two builds of the
 * same source must produce an identical digest; a build after a refactor that
 * is meant to be invisible must match the snapshot taken before it.
 *
 *   node scripts/render-parity.mjs save     # after `npm run build`
 *   node scripts/render-parity.mjs check    # after `npm run build` again
 *
 * Covered: every prerendered page, the homepage's gallery wall and every
 * rule pages included, plus not-found, global-error and the CSS. The wall is
 * server-rendered into `index.html`, so a change to a tile or a preview it
 * shows moves the homepage's digest. A digest without the homepage fails
 * rather than passing on less than it claims.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const APP = ".next/server/app";
/** The literal build id, so it can be substituted exactly wherever it appears —
 *  it turns up escaped inside the RSC payload as \"b\":\"<id>\", which no
 *  reasonable regex for `"buildId"` would catch. */
const BUILD_ID = existsSync(".next/BUILD_ID")
  ? readFileSync(".next/BUILD_ID", "utf8").trim()
  : null;
/** Webpack writes stylesheets to static/css; Turbopack puts them beside the JS chunks. */
const CSS_DIRS = [".next/static/css", ".next/static/chunks"];
const SNAP = "scripts/.render-parity.json";

/**
 * Strip only what legitimately differs between two honest builds.
 *
 * Deliberately does NOT strip script contents: the RSC flight payload inside
 * <script> tags carries rendered markup too (a rule page's deep dive, the
 * client components' props). An earlier version blanket-replaced every script
 * and consequently could not detect a changed headline — it passed a mutation
 * test it should have failed.
 */
function normalise(text) {
  const withoutBuildId = BUILD_ID ? text.split(BUILD_ID).join("BUILD") : text;
  return withoutBuildId
    // Content-hashed asset names and Next's per-build id.
    .replace(/\/_next\/static\/[a-zA-Z0-9_\-./]+/g, "/_next/static/ASSET")
    .replace(/"buildId":"[^"]*"/g, '"buildId":"BUILD"')
    .replace(/[a-z0-9]{12,}\.js/g, "CHUNK.js")
    // React hydration markers and comments carry no rendered meaning.
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

function digest() {
  const pages = walk(APP)
    .filter((f) => f.endsWith(".html") || f.endsWith(".rsc"))
    .sort();
  if (!pages.includes(join(APP, "index.html"))) {
    throw new Error(`no prerendered homepage at ${join(APP, "index.html")}: build first, and keep / static`);
  }
  const out = {};
  for (const file of pages) {
    const key = relative(APP, file);
    out[key] = createHash("sha256")
      .update(normalise(readFileSync(file, "utf8")))
      .digest("hex")
      .slice(0, 16);
  }
  // Stylesheets are content-hashed, so hash their bytes, not their names.
  const css = CSS_DIRS.flatMap(walk).filter((f) => f.endsWith(".css")).sort();
  if (css.length === 0) throw new Error(`no stylesheets found under ${CSS_DIRS.join(" or ")}`);
  out["__css__"] = createHash("sha256")
    .update(css.map((f) => readFileSync(f, "utf8")).join(""))
    .digest("hex")
    .slice(0, 16);
  return out;
}

const mode = process.argv[2];
if (mode === "save") {
  const d = digest();
  writeFileSync(SNAP, JSON.stringify(d, null, 2) + "\n");
  console.log(`saved ${Object.keys(d).length - 1} page digests + css to ${SNAP}`);
} else if (mode === "check") {
  if (!existsSync(SNAP)) {
    console.error(`no snapshot at ${SNAP} — run \`save\` on the baseline build first`);
    process.exit(1);
  }
  const before = JSON.parse(readFileSync(SNAP, "utf8"));
  const after = digest();
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();
  const changed = keys.filter((k) => before[k] !== after[k]);
  if (changed.length === 0) {
    console.log(`✔ render parity: all ${keys.length - 1} pages and the stylesheet are unchanged`);
    process.exit(0);
  }
  console.error(`✖ render parity: ${changed.length} artefact(s) changed\n`);
  for (const k of changed) {
    console.error(`  ${k}\n    before ${before[k] ?? "(absent)"}\n    after  ${after[k] ?? "(absent)"}`);
  }
  process.exit(1);
} else {
  console.error("usage: render-parity.mjs save|check");
  process.exit(1);
}
