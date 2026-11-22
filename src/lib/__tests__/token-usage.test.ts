import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

/**
 * Every custom property and class that globals.css defines must be used by the
 * source, and every token the source names must be defined.
 *
 * This is a source-reference guard, not proof that a token reaches mounted UI:
 * a reference in a file nothing imports still counts. Its job is to stop CSS
 * from going dead, and to stop source from naming a token that does not exist
 * (Tailwind drops an unknown utility such as `rounded-nub` without a word).
 *
 * - A token is a family: a raw `--ax-*` property plus every `@theme` alias
 *   whose value is exactly `var(--ax-…)`. The family is used when any member is,
 *   through a Tailwind utility (`bg-raised`, `shadow-item`, `rounded-sheet`) or
 *   a `var()`/`--theme()` reference. A generic step (`rounded-md`) never counts
 *   as a use of a named token, even when the values match.
 * - A reference inside globals.css counts only from a live context: a base
 *   rule, a component class the source uses, or a custom property that is
 *   itself used. A dead class does not keep its tokens alive.
 * - Comments, tests, `src/data/` (rule prose that names classes) and the
 *   prototype are not consumers. A declaration (`--x: …`) is never a use.
 *
 * Deleting a token or class? Add its name to RETIRED, so a stale reference to
 * it fails here instead of silently rendering nothing.
 */

/** Tokens whose consumer is a JavaScript constant, each with the test that pins the pair. */
const JS_TWINS: Record<string, { test: string; reason: string }> = {
  "--motion-slow": {
    test: "src/lib/__tests__/design-system.test.ts",
    reason: "holds it equal to DUR.slow in showcase-engine.ts, which the motion showcases play",
  },
};

/** Read by Tailwind or the browser without our code naming them. A closed list. */
const FRAMEWORK = new Set(["--default-transition-duration", "--default-transition-timing-function"]);
const isFramework = (name: string) => FRAMEWORK.has(name) || name.startsWith("--tw-");

/** Set on <body> by next/font. */
const NEXT_FONT = new Set(["--font-inter", "--font-plex-mono"]);

/** Deleted on purpose. Any definition of, or reference to, one of these fails. The list only grows. */
const RETIRED = [
  // Utilities nothing used.
  "panel-shadow",
  "duration-slow",
  "duration-medium",
  // The elevation of the old floating panels and rule cards.
  "--ax-shadow-panel",
  "shadow-panel",
  "--ax-shadow-card",
  "shadow-card",
  // The old catalog's rule cards, rule drawer and floating sidebar.
  "rule-card",
  "rule-card-panel",
  "rule-drawer-content",
  "rule-drawer-stagger",
  "drawer-scroll",
  "drawer-sticky-header",
  "sidebar-scroll",
  "sidebar-motion",
  // The reading column's padding that made room for the sidebar and the drawer.
  "main-lane-shell",
  "--main-lane-shift",
  "--main-lane-open-shift",
  "--main-lane-default-shift",
  "--lane-content",
  "--lane-gap",
  "--lane-pad-left",
  "--lane-pad-right",
  "--sidebar-clearance",
  "--sidebar-open",
  "--expand-clearance",
  "--drawer-footprint",
  // The serif display face. Every heading and title is the sans.
  "--font-source-serif",
  "--font-serif",
  "font-serif",
  // Manrope, the earlier sans. The sans is SF Pro on Apple devices, else Inter.
  "--font-manrope",
];

const GLOBALS_PATH = "src/app/globals.css";

// ── Source scanning ──────────────────────────────────────────────────

/** Code with comments removed, and the contents of every string literal. */
function scanScript(source: string): { code: string; strings: string[] } {
  const strings: string[] = [];
  let code = "";
  let depth = 0;
  const resume: number[] = [];
  let i = 0;

  const template = () => {
    let text = "";
    while (i < source.length) {
      const c = source[i];
      if (c === "\\") {
        text += source.slice(i, i + 2);
        i += 2;
      } else if (c === "`") {
        i++;
        strings.push(text);
        code += ` ${text} `;
        return;
      } else if (c === "$" && source[i + 1] === "{") {
        i += 2;
        strings.push(text);
        code += ` ${text} `;
        resume.push(depth);
        depth++;
        return;
      } else {
        text += c;
        i++;
      }
    }
  };

  while (i < source.length) {
    const c = source[i];
    const next = source[i + 1];
    if (c === "/" && next === "/") {
      while (i < source.length && source[i] !== "\n") i++;
    } else if (c === "/" && next === "*") {
      const end = source.indexOf("*/", i + 2);
      i = end < 0 ? source.length : end + 2;
      code += " ";
    } else if (c === "/" && (code.trim() === "" || /(?:[(,=:[!&|?{;+\-*%~^]|=>|\breturn)\s*$/.test(code.slice(-16)))) {
      // A regex literal: skip it whole, so a quote or backtick in it starts nothing.
      let j = i + 1;
      let inClass = false;
      while (j < source.length && source[j] !== "\n") {
        if (source[j] === "\\") j++;
        else if (source[j] === "[") inClass = true;
        else if (source[j] === "]") inClass = false;
        else if (source[j] === "/" && !inClass) break;
        j++;
      }
      j++;
      while (/[a-z]/.test(source[j] ?? "")) j++;
      code += " /re/ ";
      i = j;
    } else if (c === '"' || c === "'") {
      let j = i + 1;
      let text = "";
      while (j < source.length && source[j] !== c && source[j] !== "\n") {
        if (source[j] === "\\") {
          text += source.slice(j, j + 2);
          j += 2;
        } else {
          text += source[j++];
        }
      }
      strings.push(text);
      code += ` ${text} `;
      i = j + 1;
    } else if (c === "`") {
      i++;
      template();
    } else if (c === "}" && resume.length > 0 && depth - 1 === resume[resume.length - 1]) {
      depth--;
      resume.pop();
      i++;
      template();
    } else {
      if (c === "{") depth++;
      if (c === "}") depth--;
      code += c;
      i++;
    }
  }
  return { code, strings };
}

const stripCss = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, " ");

/** `var(--x)` and `--theme(--x)` references. */
function propertyRefs(text: string): string[] {
  return [...text.matchAll(/(?:var|--theme)\(\s*(--[\w-]+)/g)].map((match) => match[1]);
}

/** The utility a class token names, without variants, `!`, `-` or `/alpha`. */
function utilityBase(token: string): string {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < token.length; i++) {
    if (token[i] === "[") depth++;
    else if (token[i] === "]") depth--;
    else if (token[i] === ":" && depth === 0) start = i + 1;
  }
  let base = token.slice(start).replace(/^!/, "").replace(/!$/, "").replace(/^-/, "");
  const slash = base.indexOf("/");
  if (slash > 0 && !base.includes("[")) base = base.slice(0, slash);
  return base;
}

const COLOR_UTILITY =
  /^(?:bg|text|border(?:-[xytrblse])?|ring|ring-offset|outline|fill|stroke|decoration|divide|from|via|to|caret|accent|shadow|inset-ring|inset-shadow|drop-shadow)-(.+)$/;
const RADIUS_UTILITY = /^rounded(?:-(?:tl|tr|br|bl|ss|se|es|ee|[trblse]))?-(.+)$/;

/**
 * Theme properties a utility reads, by Tailwind's namespaces. `shadow-x` is a
 * shadow when `--shadow-x` exists and a shadow colour only otherwise, which is
 * how Tailwind resolves it.
 */
function utilityProperties(base: string, has: (name: string) => boolean): string[] {
  const out: string[] = [];
  const shadow = /^shadow-(.+)$/.exec(base);
  if (shadow) out.push(`--shadow-${shadow[1]}`);
  const color = COLOR_UTILITY.exec(base);
  if (color && !(shadow && has(`--shadow-${shadow[1]}`))) out.push(`--color-${color[1]}`);
  const radius = RADIUS_UTILITY.exec(base);
  if (radius) out.push(`--radius-${radius[1]}`);
  for (const ns of ["font", "ease", "animate", "text"]) {
    const match = new RegExp(`^${ns}-(.+)$`).exec(base);
    if (match) out.push(`--${ns}-${match[1]}`);
  }
  return out;
}

// ── globals.css ──────────────────────────────────────────────────────

type Block = { prelude: string; body: string };

/** Top-level blocks of a stylesheet, by brace matching. */
function topBlocks(css: string): Block[] {
  const out: Block[] = [];
  let prelude = "";
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (c === ";") {
      prelude = "";
    } else if (c === "{") {
      let depth = 0;
      for (let j = i; j < css.length; j++) {
        if (css[j] === "{") depth++;
        else if (css[j] === "}" && --depth === 0) {
          out.push({ prelude: prelude.trim(), body: css.slice(i + 1, j) });
          i = j;
          break;
        }
      }
      prelude = "";
    } else if (c !== "}") {
      prelude += c;
    }
  }
  return out;
}

/** `name: value` pairs directly in a body, nested blocks removed. */
function bodyDeclarations(body: string): [string, string][] {
  let flat = body;
  while (/\{[^{}]*\}/.test(flat)) flat = flat.replace(/[^;{}]*\{[^{}]*\}/g, "");
  return flat
    .split(";")
    .map((part) => part.trim())
    .filter((part) => /^[-\w]+\s*:/.test(part))
    .map((part) => {
      const at = part.indexOf(":");
      return [part.slice(0, at).trim(), part.slice(at + 1).trim()];
    });
}

/**
 * Every style rule in a stylesheet, however deeply nested in `@media`,
 * `@supports`, `@layer`, `@container` or CSS nesting: its selector and its own
 * declarations. Keyframe steps are not style rules.
 */
function styleRules(css: string): { selector: string; declarations: [string, string][] }[] {
  const out: { selector: string; declarations: [string, string][] }[] = [];
  for (const { prelude, body } of topBlocks(css)) {
    if (prelude.startsWith("@keyframes")) continue;
    if (!prelude.startsWith("@")) out.push({ selector: prelude, declarations: bodyDeclarations(body) });
    if (body.includes("{")) out.push(...styleRules(body));
  }
  return out;
}

/**
 * Properties a script really sets, read from its syntax tree: the name passed
 * as the first argument of a `.setProperty(…)` call, and the property names of
 * object literals (plain, string-literal or computed-literal keys). Text in a
 * string value, a template, a comment or JSX attribute text is never a setter.
 */
function scriptDefinitions(file: string, source: string): string[] {
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : file.endsWith(".mjs") ? ts.ScriptKind.JS : ts.ScriptKind.TS;
  const root = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, false, kind);
  const names: string[] = [];
  const literal = (node: ts.Node | undefined) =>
    node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) ? node.text : undefined;
  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === "setProperty"
    ) {
      const name = literal(node.arguments[0]);
      if (name) names.push(name);
    }
    if (ts.isObjectLiteralExpression(node)) {
      for (const property of node.properties) {
        if (ts.isSpreadAssignment(property) || !property.name) continue;
        const { name } = property;
        const key = ts.isComputedPropertyName(name) ? literal(name.expression) : literal(name);
        if (key) names.push(key);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(root);
  return names.filter((name) => /^--[\w-]+$/.test(name));
}

/** Selector list split on top-level commas (not those inside `:where(…)`). */
function selectorParts(selector: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const c of selector) {
    if (c === "(" || c === "[") depth++;
    if (c === ")" || c === "]") depth--;
    if (c === "," && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += c;
    }
  }
  parts.push(current);
  return parts;
}

const classesIn = (selector: string) =>
  [...selector.replace(/\[[^\]]*\]/g, "").matchAll(/\.(-?[A-Za-z_][\w-]*)/g)]
    .map((match) => match[1])
    .filter((name) => name !== "dark");

type Model = {
  /** Every custom property declared anywhere in the file. */
  properties: Set<string>;
  /** Every class a selector or `@utility` defines (`.dark` is the theme switch). */
  classes: Set<string>;
  /** property → the family it belongs to (its raw `--ax-*` root, or itself). */
  family: Map<string, string>;
  /** property → properties its values reference. */
  propertyEdges: Map<string, string[]>;
  /** References from rules: live when `classes` is empty or any part's classes are all used. */
  ruleRefs: { parts: string[][]; refs: string[] }[];
};

function modelGlobals(globals: string): Model {
  const model: Model = {
    properties: new Set(),
    classes: new Set(),
    family: new Map(),
    propertyEdges: new Map(),
    ruleRefs: [],
  };

  const visit = (css: string, theme: boolean, utility: string | null) => {
    for (const { prelude, body } of topBlocks(css)) {
      if (prelude.startsWith("@keyframes")) continue;
      const isTheme = theme || prelude.startsWith("@theme");
      const utilityName = /^@utility\s+([\w-]+)/.exec(prelude)?.[1] ?? null;
      if (utilityName) model.classes.add(utilityName);
      const isStyleRule = !prelude.startsWith("@");
      const parts = isStyleRule ? selectorParts(prelude).map(classesIn) : utility ? [[utility]] : [[]];
      if (isStyleRule) for (const name of parts.flat()) model.classes.add(name);
      const owner = utilityName ? [[utilityName]] : parts;

      for (const [name, value] of bodyDeclarations(body)) {
        const refs = propertyRefs(value);
        if (name.startsWith("--")) {
          model.properties.add(name);
          model.propertyEdges.set(name, [...(model.propertyEdges.get(name) ?? []), ...refs]);
          const alias = /^var\((--ax-[\w-]+)\)$/.exec(value);
          if (isTheme && alias) model.family.set(name, alias[1]);
        } else if (refs.length > 0) {
          model.ruleRefs.push({ parts: owner, refs });
        }
      }
      if (body.includes("{")) visit(body, isTheme, utilityName ?? utility);
    }
  };
  visit(stripCss(globals), false, null);
  for (const name of model.properties) if (!model.family.has(name)) model.family.set(name, name);
  return model;
}

// ── Analysis ─────────────────────────────────────────────────────────

type Tree = {
  globals: string;
  /** Repo-relative path → contents, for every file under src/. */
  files: Map<string, string>;
};

type Rules = {
  twins: Record<string, { test: string; reason: string }>;
  retired: string[];
};

const isConsumerFile = (file: string) =>
  /\.(?:tsx?|mjs|css)$/.test(file) &&
  file !== GLOBALS_PATH &&
  !file.startsWith("src/data/") &&
  !file.startsWith("src/app/proto/") &&
  !file.includes("/__tests__/") &&
  !/\.(?:test|spec)\.\w+$/.test(file);

/** Tailwind gives Tailwind's own names; anything else must be ours. */
const TAILWIND_RADII = new Set(["none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "full"]);
const TAILWIND_SHADOWS = new Set(["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "none", "inner"]);
const TAILWIND_COLOR = /^(?:[a-z]+-\d{2,3}|black|white|transparent|current|inherit|none)$/;

function analyse(tree: Tree, rules: Rules) {
  const model = modelGlobals(tree.globals);

  // Uses in the source, with the first file each one appears in.
  const usedProps = new Map<string, string>();
  const usedClasses = new Map<string, string>();
  const tokens: { token: string; file: string }[] = [];
  const propRefs: { name: string; file: string }[] = [];
  /** Properties a consumer sets: a CSS declaration, or a style key / setProperty string. */
  const consumerSets = new Set<string>();
  for (const [file, text] of tree.files) {
    if (!isConsumerFile(file)) continue;
    if (file.endsWith(".css")) {
      const css = stripCss(text);
      for (const name of propertyRefs(css)) propRefs.push({ name, file });
      for (const { selector, declarations } of styleRules(css)) {
        // A class selector in another stylesheet uses the class it styles.
        for (const name of classesIn(selector)) tokens.push({ token: name, file });
        for (const [name] of declarations) if (name.startsWith("--")) consumerSets.add(name);
      }
      for (const match of css.matchAll(/@apply\s+([^;{}]+);/g)) {
        for (const token of match[1].split(/\s+/)) if (token) tokens.push({ token, file });
      }
      continue;
    }
    const { code, strings } = scanScript(text);
    for (const name of propertyRefs(code)) propRefs.push({ name, file });
    for (const name of scriptDefinitions(file, text)) consumerSets.add(name);
    for (const literal of strings) {
      for (const token of literal.split(/\s+/)) if (token) tokens.push({ token: token.replace(/^\./, ""), file });
    }
  }
  for (const { name, file } of propRefs) if (!usedProps.has(name)) usedProps.set(name, file);
  for (const { token, file } of tokens) {
    const base = utilityBase(token);
    for (const name of new Set([token, base])) {
      if (model.classes.has(name) && !usedClasses.has(name)) usedClasses.set(name, file);
    }
    for (const name of utilityProperties(base, (prop) => model.properties.has(prop))) {
      if (model.properties.has(name) && !usedProps.has(name)) usedProps.set(name, file);
    }
  }

  // Liveness through globals.css: rules whose classes are used, then the
  // properties live properties reference, until nothing changes.
  const live = new Map(usedProps);
  const ruleLive = (parts: string[][]) => parts.some((part) => part.every((name) => usedClasses.has(name)));
  for (let changed = true; changed; ) {
    changed = false;
    const mark = (name: string, via: string) => {
      if (!live.has(name)) {
        live.set(name, via);
        changed = true;
      }
    };
    for (const { parts, refs } of model.ruleRefs) {
      if (ruleLive(parts)) for (const name of refs) mark(name, GLOBALS_PATH);
    }
    for (const [name, refs] of model.propertyEdges) {
      if (live.has(name)) for (const ref of refs) mark(ref, GLOBALS_PATH);
    }
  }

  const families = new Map<string, string[]>();
  for (const [name, root] of model.family) families.set(root, [...(families.get(root) ?? []), name]);
  const familyUsed = (root: string) => (families.get(root) ?? []).some((member) => live.has(member));

  const unusedFamilies = [...families.keys()]
    .filter((root) => !isFramework(root) && !familyUsed(root) && !(root in rules.twins))
    .sort();
  const unusedClasses = [...model.classes].filter((name) => !usedClasses.has(name)).sort();

  // Reverse direction: a reference to a property nothing defines or sets.
  const resolves = (name: string) =>
    model.properties.has(name) || consumerSets.has(name) || isFramework(name) || NEXT_FONT.has(name);
  const missing = [
    ...propRefs.filter(({ name }) => !resolves(name)),
    ...[...model.propertyEdges.values()]
      .flat()
      .concat(model.ruleRefs.flatMap(({ refs }) => refs))
      .filter((name) => name.startsWith("--ax-") && !model.properties.has(name))
      .map((name) => ({ name, file: GLOBALS_PATH })),
  ].map(({ name, file }) => `${file}: ${name} is not defined`);

  const stems = new Set(
    [...model.properties].filter((name) => name.startsWith("--color-")).map((name) => name.slice(8).split("-")[0])
  );
  const orphans: string[] = [];
  for (const { token, file } of tokens) {
    const base = utilityBase(token);
    if (base.includes("[")) continue;
    const radius = RADIUS_UTILITY.exec(base);
    if (radius && !TAILWIND_RADII.has(radius[1]) && !model.properties.has(`--radius-${radius[1]}`)) {
      orphans.push(`${file}: ${token} has no --radius-${radius[1]}`);
    }
    const shadow = /^shadow-(.+)$/.exec(base);
    if (
      shadow &&
      !TAILWIND_SHADOWS.has(shadow[1]) &&
      !TAILWIND_COLOR.test(shadow[1]) &&
      !model.properties.has(`--shadow-${shadow[1]}`) &&
      !model.properties.has(`--color-${shadow[1]}`)
    ) {
      orphans.push(`${file}: ${token} has no --shadow-${shadow[1]}`);
    }
    const color = COLOR_UTILITY.exec(base);
    const isShadow = shadow && model.properties.has(`--shadow-${shadow[1]}`);
    if (color && !isShadow && stems.has(color[1].split("-")[0]) && !model.properties.has(`--color-${color[1]}`)) {
      orphans.push(`${file}: ${token} has no --color-${color[1]}`);
    }
  }

  const retired: string[] = [];
  for (const name of rules.retired) {
    const prop = `--${name.replace(/^--/, "")}`;
    if (model.classes.has(name)) retired.push(`${GLOBALS_PATH} defines .${name}`);
    if (model.properties.has(prop)) retired.push(`${GLOBALS_PATH} defines ${prop}`);
    const use = usedClasses.get(name) ?? usedProps.get(prop);
    if (use) retired.push(`${use} uses ${name}`);
    for (const { token, file } of tokens) {
      if (token === name || utilityBase(token) === name) retired.push(`${file} uses ${name}`);
    }
    for (const { name: ref, file } of propRefs) if (ref === prop) retired.push(`${file} uses ${prop}`);
  }

  const twins: string[] = [];
  for (const [name, { test }] of Object.entries(rules.twins)) {
    if (!families.has(name)) twins.push(`${name}: not defined`);
    if (familyUsed(name)) twins.push(`${name}: now used by the source; delete the entry`);
    if (!(tree.files.get(test) ?? "").includes(name)) twins.push(`${name}: ${test} no longer pins it`);
  }

  return {
    unusedFamilies,
    unusedClasses,
    missing,
    orphans: [...new Set(orphans)],
    retired: [...new Set(retired)],
    twins,
  };
}

// ── The real tree ────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, "../../..");

function walk(dir: string): string[] {
  return readdirSync(path.join(ROOT, dir)).flatMap((entry) => {
    const file = `${dir}/${entry}`;
    return statSync(path.join(ROOT, file)).isDirectory() ? walk(file) : [file];
  });
}

const real = analyse(
  {
    globals: readFileSync(path.join(ROOT, GLOBALS_PATH), "utf8"),
    files: new Map(
      walk("src").map((file) => [file, /\.(?:tsx?|mjs|css)$/.test(file) ? readFileSync(path.join(ROOT, file), "utf8") : ""])
    ),
  },
  { twins: JS_TWINS, retired: RETIRED }
);

describe("globals.css usage", () => {
  it("uses every token family it defines", () => {
    expect(real.unusedFamilies, real.unusedFamilies.join("\n")).toEqual([]);
  });

  it("uses every class it defines", () => {
    expect(real.unusedClasses, real.unusedClasses.join("\n")).toEqual([]);
  });

  it("references only tokens that exist", () => {
    expect(real.missing, real.missing.join("\n")).toEqual([]);
  });

  it("has no utility naming a token globals.css does not define", () => {
    expect(real.orphans, real.orphans.join("\n")).toEqual([]);
  });

  it("uses no retired name", () => {
    expect(real.retired, real.retired.join("\n")).toEqual([]);
  });

  it("keeps each JS twin defined, unused by the source, and pinned by the test it names", () => {
    expect(real.twins, real.twins.join("\n")).toEqual([]);
  });
});

// ── The guard against itself ─────────────────────────────────────────

describe("the usage guard", () => {
  const GLOBALS = `
    :root {
      --ax-tone: #fff; --ax-shadow-lift: 0 0 0 1px red; --ax-dead: #000;
      --ax-edge: #111; --ax-shadow-cap: inset 0 0 0 1px var(--ax-edge);
      --ax-shadow-unused: inset 0 0 0 1px var(--ax-chained); --ax-chained: #222;
    }
    .dark {
      --ax-tone: #000; --ax-shadow-lift: 0 0 0 1px blue; --ax-dead: #fff;
      --ax-edge: #eee; --ax-shadow-cap: inset 0 0 0 1px var(--ax-edge);
      --ax-shadow-unused: inset 0 0 0 1px var(--ax-chained); --ax-chained: #ddd;
    }
    @theme inline {
      --color-tone: var(--ax-tone);
      --shadow-lift: var(--ax-shadow-lift);
      --color-dead: var(--ax-dead);
      --shadow-cap: var(--ax-shadow-cap);
      --shadow-unused: var(--ax-shadow-unused);
    }
    @theme static { --radius-tab: 6px; }
    @layer components { .gone { box-shadow: var(--ax-dead); } }
  `;
  const BASE = { twins: {}, retired: [] } satisfies Rules;
  const A = "src/components/ui/a.tsx";

  const tree = (files: Record<string, string>): Tree => ({ globals: GLOBALS, files: new Map(Object.entries(files)) });

  /** Uses everything except --ax-dead, --ax-shadow-unused, --ax-chained and .gone. */
  const used = { [A]: `export const A = <div className="bg-tone md:shadow-lift rounded-tab shadow-cap" />;` };

  it("counts a utility as a use of its raw token, and nothing in a dead class", () => {
    const result = analyse(tree(used), BASE);
    expect(result.unusedFamilies).toEqual(["--ax-chained", "--ax-dead", "--ax-shadow-unused"]);
    expect(result.unusedClasses).toEqual(["gone"]);
  });

  it("follows an alias chain from a used family, and leaves a chain of unused ones unused", () => {
    // --ax-edge has no utility and no direct use: shadow-cap reaches it.
    const result = analyse(tree(used), BASE);
    expect(result.unusedFamilies).not.toContain("--ax-edge");
    expect(result.unusedFamilies).toContain("--ax-chained");
  });

  it("does not count a generic Tailwind step as a named token", () => {
    const result = analyse(tree({ [A]: `<p className="bg-tone shadow-lift shadow-cap rounded-md" />` }), BASE);
    expect(result.unusedFamilies).toContain("--radius-tab");
  });

  it("does not count a comment as a use", () => {
    const result = analyse(tree({ ...used, "src/components/ui/b.tsx": `// bg-dead gone\n/* bg-dead */ export const b = 1;` }), BASE);
    expect(result.unusedFamilies).toContain("--ax-dead");
    expect(result.unusedClasses).toContain("gone");
  });

  it("does not count rule data, tests or the prototype as a use", () => {
    const result = analyse(
      tree({
        ...used,
        "src/data/rules.ts": `"bg-dead gone"`,
        "src/components/ui/__tests__/b.test.ts": `"bg-dead gone"`,
        "src/app/proto/v2-strip/x.tsx": `"bg-dead gone"`,
      }),
      BASE
    );
    expect(result.unusedFamilies).toContain("--ax-dead");
    expect(result.unusedClasses).toContain("gone");
  });

  it("counts a CSS consumer's var() and class selectors", () => {
    const result = analyse(tree({ ...used, "src/components/shell/shell.css": `.wrap .gone { color: var(--ax-shadow-unused); }` }), BASE);
    // Selecting .gone makes its rule live, and with it --ax-dead; the var()
    // keeps --ax-shadow-unused and, through it, --ax-chained.
    expect(result.unusedFamilies).toEqual([]);
    expect(result.unusedClasses).toEqual([]);
  });

  it("fails a retired name in a class token or a var()", () => {
    const result = analyse(
      tree({
        ...used,
        "src/components/ui/b.tsx": `<div className="hover:panel-shadow" />`,
        "src/components/ui/c.tsx": `<div style={{ boxShadow: "var(--old-lift)" }} />`,
      }),
      { ...BASE, retired: ["panel-shadow", "--old-lift"] }
    );
    expect(result.retired.join("\n")).toMatch(/b\.tsx uses panel-shadow/);
    expect(result.retired.join("\n")).toMatch(/c\.tsx uses --old-lift/);
  });

  it("fails a utility or var() naming a token nothing defines", () => {
    const result = analyse(
      tree({
        ...used,
        "src/components/ui/b.tsx": `<div className="rounded-nub shadow-lifted text-tone-strong" style={{ color: "var(--ax-gone)" }} />`,
      }),
      BASE
    );
    expect(result.orphans.join("\n")).toMatch(/rounded-nub has no --radius-nub/);
    expect(result.orphans.join("\n")).toMatch(/shadow-lifted has no --shadow-lifted/);
    expect(result.orphans.join("\n")).toMatch(/text-tone-strong has no --color-tone-strong/);
    expect(result.missing.join("\n")).toMatch(/--ax-gone is not defined/);
  });

  it("resolves a var() that a consumer sets, Tailwind reads, or next/font provides", () => {
    const result = analyse(
      tree({
        ...used,
        "src/components/ui/b.tsx": `<div style={{ "--inset": "4px", width: "var(--inset)", font: "var(--font-inter)", x: "var(--tw-duration)" }} />`,
        "src/components/shell/shell.css": `.s { --gap: 2px; margin: var(--gap); }`,
      }),
      BASE
    );
    expect(result.missing).toEqual([]);
  });

  it("fails a JS twin whose test stops pinning it, or that the source starts using", () => {
    const twins = { "--ax-dead": { test: "src/lib/__tests__/pin.test.ts", reason: "fixture" } };
    const pinned = { ...used, "src/lib/__tests__/pin.test.ts": `"--ax-dead"` };
    expect(analyse(tree(pinned), { ...BASE, twins }).twins).toEqual([]);
    expect(analyse(tree(pinned), { ...BASE, twins }).unusedFamilies).not.toContain("--ax-dead");
    expect(analyse(tree({ ...used, "src/lib/__tests__/pin.test.ts": `""` }), { ...BASE, twins }).twins.join("\n")).toMatch(/no longer pins it/);
    const usedNow = { ...pinned, "src/components/ui/b.tsx": `<p className="bg-dead" />` };
    expect(analyse(tree(usedNow), { ...BASE, twins }).twins.join("\n")).toMatch(/now used by the source/);
  });

  it("fails a retired name that globals.css still defines", () => {
    const result = analyse(tree(used), { ...BASE, retired: ["gone", "--ax-dead"] });
    expect(result.retired.join("\n")).toMatch(/defines \.gone/);
    expect(result.retired.join("\n")).toMatch(/defines --ax-dead/);
  });

  it("reads class selectors nested in @media, @supports, @layer and CSS nesting", () => {
    const NESTED = [
      `@media (width > 600px) { .gone { display: block; } }`,
      `@supports (display: grid) { @media (hover: hover) { .wrap .gone:hover { color: red; } } }`,
      `@layer shell { .gone { color: red; } }`,
      `.wrap { color: red; &.gone { color: blue; } }`,
      `.wrap { .gone & { color: blue; } }`,
    ];
    for (const css of NESTED) {
      const result = analyse(tree({ ...used, "src/components/shell/shell.css": css }), BASE);
      expect(result.unusedClasses, css).toEqual([]);
    }
    // A keyframe step is not a selector, and a declaration value is not one either.
    const notSelectors = `@keyframes spin { from { opacity: 0; } } .wrap { background: url(a.gone.png); }`;
    expect(analyse(tree({ ...used, "src/components/shell/shell.css": notSelectors }), BASE).unusedClasses).toEqual(["gone"]);
  });

  it("reads var() and declarations nested in consumer CSS", () => {
    const css = `@media (width > 600px) { .wrap { --gap: 2px; margin: var(--gap); color: var(--ax-dead); } }`;
    const result = analyse(tree({ ...used, "src/components/shell/shell.css": css }), BASE);
    expect(result.missing).toEqual([]);
    expect(result.unusedFamilies).not.toContain("--ax-dead");
  });

  it("does not take a string that merely names a property as its definition", () => {
    const READS = [
      `const name = "--missing"; const value = "var(--missing)";`,
      `const value = getComputedStyle(el).getPropertyValue("--missing") || "var(--missing)";`,
      `const key = wide ? "--missing" : "--other"; const v = "var(--missing)";`,
      `<div data-name="--missing" style={{ color: "var(--missing)" }} />`,
      `// style={{ "--missing": 1 }}\nconst v = "var(--missing)";`,
      // Setter and object-key syntax stored as text.
      `const example = 'el.style.setProperty("--missing", "1px")'; const value = "var(--missing)";`,
      `const example = '{"--missing": "1px"}'; const value = "var(--missing)";`,
      "const example = `{ \"--missing\": 1 }`; const value = \"var(--missing)\";",
      `<p title='{"--missing": 1}' style={{ color: "var(--missing)" }} />`,
    ];
    for (const source of READS) {
      const result = analyse(tree({ ...used, "src/components/ui/b.tsx": source }), BASE);
      expect(result.missing.join("\n"), source).toMatch(/--missing is not defined/);
    }
  });

  it("resolves a var() a consumer sets as a style key, computed key, setProperty target or CSS declaration", () => {
    const SETTERS = [
      `<div style={{ "--missing": "4px", width: "var(--missing)" }} />`,
      `const style = { color: "red", '--missing': 1 }; const v = "var(--missing)";`,
      `const style = { ["--missing"]: 1 }; const v = "var(--missing)";`,
      "el.style.setProperty(\"--missing\", `${x}px`); const v = \"var(--missing)\";",
      "el.style.setProperty(`--missing`, x); const v = \"var(--missing)\";",
    ];
    for (const source of SETTERS) {
      const result = analyse(tree({ ...used, "src/components/ui/b.tsx": source }), BASE);
      expect(result.missing, source).toEqual([]);
    }
    const css = analyse(tree({ ...used, "src/components/shell/shell.css": `@supports (x: y) { .s { --missing: 1px; } }`, "src/components/ui/b.tsx": `"var(--missing)"` }), BASE);
    expect(css.missing).toEqual([]);
  });
});
