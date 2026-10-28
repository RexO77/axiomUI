// Lets plain `node` import the site's TypeScript modules, so build scripts can
// reuse src/ as the single source of truth instead of re-parsing it with regexes.
//
//   node --import ./scripts/lib/register-ts.mjs scripts/build-skills.mjs
//
// Two jobs, both narrow:
//   1. resolve: "@/x" → src/x(.ts|/index.ts), and extensionless relative
//      specifiers from a .ts file → .ts. This mirrors the tsconfig "paths" alias.
//   2. load: hand .ts files to Node's built-in type stripping as
//      "module-typescript", which also silences MODULE_TYPELESS_PACKAGE_JSON.
//
// Needs Node >= 22.18 (module.registerHooks + unflagged type stripping). src/
// must stay erasable TypeScript; tsconfig "erasableSyntaxOnly" enforces that.
import { statSync } from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const srcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../src");

function isFile(candidate) {
  try {
    return statSync(candidate).isFile();
  } catch {
    return false;
  }
}

function findModule(base) {
  return [`${base}.ts`, path.join(base, "index.ts"), base].find(isFile);
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    let base = null;
    if (specifier.startsWith("@/")) {
      base = path.join(srcDir, specifier.slice(2));
    } else if (
      (specifier.startsWith("./") || specifier.startsWith("../")) &&
      context.parentURL?.startsWith("file:") &&
      context.parentURL.endsWith(".ts")
    ) {
      base = path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier);
    }
    const file = base && findModule(base);
    if (file) {
      return { url: pathToFileURL(file).href, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.startsWith("file:") && url.endsWith(".ts")) {
      return nextLoad(url, { ...context, format: "module-typescript" });
    }
    return nextLoad(url, context);
  },
});
