import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

/**
 * The catalog's client code must never reach the deep-dive corpus. This
 * walks every import from the client roots (static, type-only, re-export
 * and dynamic) through the source tree, and fails on a forbidden module with
 * the chain that reached it. Roots that do not exist are skipped; new files are covered
 * as they are added.
 */

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const ROOTS = [
  "src/components/catalog-app.tsx",
  "src/components/shell",
  "src/components/rule",
  "src/components/gallery",
  "src/lib/navigation",
];
/** Server-only prose: the corpus, its builders, and the server-only module and its pure builder. */
const FORBIDDEN = [
  "@/data/deep-dive-builder",
  "@/data/deep-dives",
  "@/data/rule-sources",
  "@/lib/rule-prose",
  "@/lib/rule-prose-build",
];

const toSpecifier = (file: string) => `@/${path.relative(SRC, file).replace(/\.(?:tsx?|mts)$/, "").replace(/\/index$/, "")}`;

function sourceFiles(entry: string): string[] {
  const full = path.join(ROOT, entry);
  if (!existsSync(full)) return [];
  if (!statSync(full).isDirectory()) return [full];
  return readdirSync(full).flatMap((name) =>
    name === "__tests__" || /\.test\./.test(name) ? [] : sourceFiles(path.join(entry, name)).filter((file) => /\.(?:tsx?|mts)$/.test(file) || statSync(file).isDirectory()),
  );
}

/** Every module specifier a file names: imports, type imports, re-exports, import() and require(). */
function specifiers(file: string, source: string): string[] {
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, false, kind);
  const out: string[] = [];
  const visit = (node: ts.Node) => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      out.push(node.moduleSpecifier.text);
    }
    if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) {
      out.push(node.argument.literal.text);
    }
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === "require")) &&
      node.arguments[0] &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      out.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  };
  visit(tree);
  return out;
}

/** A specifier inside the source tree, as a file; null for a package. */
function resolve(from: string, specifier: string): string | null {
  const base = specifier.startsWith("@/")
    ? path.join(SRC, specifier.slice(2))
    : specifier.startsWith(".")
      ? path.resolve(path.dirname(from), specifier)
      : null;
  if (!base) return null;
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, `${base}.mts`, path.join(base, "index.ts"), path.join(base, "index.tsx")]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return base;
}

function isForbidden(file: string): string | null {
  const specifier = toSpecifier(file);
  return FORBIDDEN.find((name) => specifier === name || specifier.startsWith(`${name}/`)) ?? null;
}

/** Breadth-first from the roots; each violation names the chain that reached it. */
function violations(roots: string[]): string[] {
  const seen = new Map<string, string[]>();
  const queue: string[] = [];
  for (const file of roots) {
    seen.set(file, [path.relative(ROOT, file)]);
    queue.push(file);
  }
  const found: string[] = [];
  while (queue.length) {
    const file = queue.shift()!;
    const chain = seen.get(file)!;
    const bad = isForbidden(file);
    if (bad) {
      found.push(`${chain.join(" → ")} (${bad})`);
      continue;
    }
    if (!existsSync(file) || !/\.(?:tsx?|mts)$/.test(file)) continue;
    for (const specifier of specifiers(file, readFileSync(file, "utf8"))) {
      const target = resolve(file, specifier);
      if (!target || seen.has(target)) continue;
      seen.set(target, [...chain, path.relative(ROOT, target)]);
      queue.push(target);
    }
  }
  return found;
}

describe("client import graph", () => {
  it("reads every kind of import", () => {
    const source = `
      import a from "@/x/a";
      import type { B } from "./b";
      export { c } from "../c";
      export * from "@/d";
      const e = import("@/e");
      type F = typeof import("@/f");
      const g = require("@/g");
    `;
    expect(specifiers("fixture.ts", source)).toEqual(["@/x/a", "./b", "../c", "@/d", "@/e", "@/f", "@/g"]);
  });

  it("names the forbidden modules", () => {
    expect(isForbidden(path.join(SRC, "data/deep-dives.ts"))).toBe("@/data/deep-dives");
    expect(isForbidden(path.join(SRC, "data/rule-sources.ts"))).toBe("@/data/rule-sources");
    expect(isForbidden(path.join(SRC, "lib/catalog/stores.ts"))).toBeNull();
    expect(isForbidden(path.join(SRC, "lib/rule-prose.ts"))).toBe("@/lib/rule-prose");
    expect(isForbidden(path.join(SRC, "lib/rule-prose-build.ts"))).toBe("@/lib/rule-prose-build");
    // The type and the loader are what client code is meant to use.
    expect(isForbidden(path.join(SRC, "lib/rule-prose-types.ts"))).toBeNull();
    expect(isForbidden(path.join(SRC, "lib/prose-loader.ts"))).toBeNull();
  });

  it("stops at the server-only prose module before the builder behind it", () => {
    const found = violations([path.join(SRC, "app/deep-dives/[id]/route.ts")]);
    expect(found).toContain("src/app/deep-dives/[id]/route.ts → src/lib/rule-prose.ts (@/lib/rule-prose)");
  });

  it("follows a chain through ordinary modules to the corpus", () => {
    // The llms-full.txt route reaches the corpus through rule-corpus.ts, as a server route may.
    const found = violations([path.join(SRC, "app/llms-full.txt/route.ts")]);
    expect(found).toContain(
      "src/app/llms-full.txt/route.ts → src/lib/rule-corpus.ts → src/data/deep-dive-builder.ts (@/data/deep-dive-builder)",
    );
  });

  const roots = ROOTS.flatMap(sourceFiles);

  it("starts from the shell and navigation code that exists", () => {
    const relative = roots.map((file) => path.relative(ROOT, file));
    expect(relative).toEqual(
      expect.arrayContaining([
        "src/components/catalog-app.tsx",
        "src/components/shell/shell.tsx",
        "src/lib/navigation/history.ts",
        "src/components/rule/stage.tsx",
        "src/components/rule/inspector.tsx",
      ]),
    );
  });

  it("never reaches the deep-dive corpus or server-only prose", () => {
    expect(violations(roots)).toEqual([]);
  });
});
