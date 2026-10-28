// @ts-check
import { realpathSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

import { loadBundle, packageRoot, readPackageVersion } from "./catalog.mjs";
import { CliError, colorEnabled, createPalette, didYouMean, displayPath, plural, usageError } from "./format.mjs";
import {
  applyInstall,
  applyRemove,
  findLegacy,
  findManaged,
  inspectEntry,
  planInstall,
  planRemove,
  removeLegacy,
} from "./install.mjs";
import { CancelledError, confirm, multiselect, select } from "./prompt.mjs";
import {
  agents,
  assertProjectScopeAllowed,
  customTarget,
  detectAgents,
  knownTargets,
  looksLikeProject,
  parseAgents,
  resolveTargets,
} from "./targets.mjs";

/** @typedef {import("./catalog.mjs").Bundle} Bundle */
/** @typedef {import("./catalog.mjs").CatalogSkill} CatalogSkill */
/** @typedef {import("./install.mjs").InstallPlan} InstallPlan */
/** @typedef {import("./install.mjs").RemovePlan} RemovePlan */
/** @typedef {import("./targets.mjs").Target} Target */
/** @typedef {import("./targets.mjs").Scope} Scope */

/**
 * @typedef {object} Runtime
 * @property {string[]} argv arguments after the binary
 * @property {Record<string, string | undefined>} env
 * @property {string} cwd
 * @property {string} home
 * @property {NodeJS.ReadableStream & { isTTY?: boolean, setRawMode?: (mode: boolean) => unknown, isRaw?: boolean }} stdin
 * @property {NodeJS.WritableStream & { isTTY?: boolean, columns?: number }} stdout
 * @property {NodeJS.WritableStream} stderr
 * @property {string} [etcDir]
 * @property {string} [packageDir] where package.json and the bundled skills live
 */

const site = "https://axiomui.nischal.fyi";

const commands = /** @type {const} */ ({
  add: "add",
  install: "add",
  i: "add",
  list: "list",
  ls: "list",
  update: "update",
  upgrade: "update",
  remove: "remove",
  rm: "remove",
  uninstall: "remove",
  help: "help",
});

/** @typedef {"add" | "list" | "update" | "remove" | "help"} Command */

const optionSpec = /** @type {const} */ ({
  agent: { type: "string", short: "a", multiple: true },
  global: { type: "boolean", short: "g" },
  dir: { type: "string" },
  all: { type: "boolean" },
  yes: { type: "boolean", short: "y" },
  "dry-run": { type: "boolean" },
  force: { type: "boolean" },
  json: { type: "boolean" },
  "no-color": { type: "boolean" },
  help: { type: "boolean", short: "h" },
  version: { type: "boolean", short: "v" },
});

const flagNames = Object.keys(optionSpec).map((name) => `--${name}`);

/**
 * @typedef {object} Flags
 * @property {string[]} agent
 * @property {boolean} global
 * @property {string | undefined} dir
 * @property {boolean} all
 * @property {boolean} yes no prompts (also set by --json)
 * @property {boolean} confirmed an explicit --yes: the only flag that may delete an old download
 * @property {boolean} dryRun
 * @property {boolean} force
 * @property {boolean} json
 * @property {boolean} noColor
 * @property {boolean} help
 * @property {boolean} version
 */

/**
 * node:util parseArgs, with its errors rewritten as usage errors that suggest a fix.
 * @param {string[]} argv
 */
function strictParse(argv) {
  try {
    return parseArgs({ args: argv, options: optionSpec, allowPositionals: true, strict: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const flag = /'(-{1,2}[^'\s]+)'/.exec(message)?.[1] ?? "";
    if (/** @type {{ code?: string }} */ (error).code === "ERR_PARSE_ARGS_UNKNOWN_OPTION") {
      throw usageError(`Unknown option ${flag}.${didYouMean(flag, flagNames)} Run axiomui --help.`);
    }
    throw usageError(`${message.split("\n")[0]} Run axiomui --help.`);
  }
}

/**
 * @param {string[]} argv
 * @returns {{ command: Command | null, names: string[], flags: Flags }}
 */
export function parseCommandLine(argv) {
  const { values, positionals } = strictParse(argv);
  if (values.dir !== undefined && values.dir.trim() === "") {
    throw usageError("--dir needs a path, such as --dir ./my-skills. Run axiomui --help.");
  }
  const [first, ...rest] = positionals;
  /** @type {Command | null} */
  let command = null;
  let names = positionals;
  if (first !== undefined) {
    const key = first.toLowerCase();
    if (!Object.hasOwn(commands, key)) {
      throw usageError(`Unknown command "${first}".${didYouMean(first, Object.keys(commands))} Run axiomui --help.`);
    }
    command = /** @type {Record<string, Command>} */ (commands)[key];
    names = rest;
  }
  return {
    command,
    names,
    flags: {
      agent: values.agent ?? [],
      global: Boolean(values.global),
      dir: values.dir,
      all: Boolean(values.all),
      yes: Boolean(values.yes) || Boolean(values.json),
      confirmed: Boolean(values.yes),
      dryRun: Boolean(values["dry-run"]),
      force: Boolean(values.force),
      json: Boolean(values.json),
      noColor: Boolean(values["no-color"]),
      help: Boolean(values.help),
      version: Boolean(values.version),
    },
  };
}

/**
 * Turns names, aliases and group words into catalog skills, in catalog order.
 * @param {string[]} names
 * @param {CatalogSkill[]} skills
 */
export function resolveSkills(names, skills) {
  const wanted = new Set();
  const words = [...skills.flatMap((skill) => [skill.name, ...skill.aliases]), "core", "domains", "all"];
  for (const raw of names) {
    const name = raw.toLowerCase();
    if (name === "all") {
      skills.forEach((skill) => wanted.add(skill.name));
    } else if (name === "core" || name === "domains" || name === "domain") {
      const group = name === "core" ? "core" : "domain";
      skills.filter((skill) => skill.group === group).forEach((skill) => wanted.add(skill.name));
    } else {
      const skill = skills.find((candidate) => candidate.name === name || candidate.aliases.includes(name));
      if (!skill) {
        throw usageError(`Unknown skill "${raw}".${didYouMean(name, words)} Run axiomui list to see them all.`);
      }
      wanted.add(skill.name);
    }
  }
  return skills.filter((skill) => wanted.has(skill.name));
}

/** @param {string} version */
function helpText(version) {
  return `axiomui ${version} · Axiom UI design rules as agent skills

Usage
  npx axiomui@latest add [skills...]      install skills (aliases: install, i)
  npx axiomui@latest list                 bundled skills and where they are installed (ls)
  npx axiomui@latest update [skills...]   refresh every install axiomui manages
  npx axiomui@latest remove [skills...]   delete axiomui-managed files (rm)

Skills
  A full name (axiomui-motion), an alias (motion, audit, upgrade), or a group:
  core, domains, all. With no names, add asks in a terminal and installs the
  core skills otherwise.

Options
  -a, --agent <list>  claude, codex, cursor, opencode, gemini, copilot,
                      windsurf, universal, all (comma-separated or repeated)
  -g, --global        use your user folders instead of the project
      --dir <path>    use this skills folder (ignores --agent and --global)
      --all           every skill
  -y, --yes           no prompts; accept the defaults
      --dry-run       print the plan and write nothing
      --force         overwrite edited files, unmanaged folders and symlinks
      --json          machine-readable output (implies --yes)
      --no-color      no colour (NO_COLOR and FORCE_COLOR are honoured)
  -h, --help          show this help
  -v, --version       print the version

Examples
  npx axiomui@latest add
  npx axiomui@latest add motion audit --agent claude
  npx axiomui@latest add --all --global --yes

Exit codes: 0 done, 1 error, 2 usage error, 3 some skills skipped, 130 cancelled.
Rules: ${site}
`;
}

/** @param {string} dir */
function realPath(dir) {
  try {
    return realpathSync(dir);
  } catch {
    return path.resolve(dir);
  }
}

/**
 * Entry point. Returns the exit code instead of exiting, so tests can call it.
 * @param {Runtime} runtime
 * @returns {Promise<number>}
 */
export async function main(runtime) {
  const { stdout, stderr, env } = runtime;
  /** @type {Flags | null} */
  let flags = null;
  const terminator = runtime.argv.indexOf("--");
  const jsonRequested = runtime.argv.slice(0, terminator === -1 ? undefined : terminator).includes("--json");
  try {
    const parsed = parseCommandLine(runtime.argv);
    flags = parsed.flags;
    const packageDir = runtime.packageDir ?? packageRoot;
    const version = readPackageVersion(packageDir);
    const paint = createPalette(
      colorEnabled({ env, isTTY: Boolean(stdout.isTTY), noColor: flags.noColor || flags.json })
    );
    const interactive = Boolean(runtime.stdin.isTTY && stdout.isTTY && !env.CI && !flags.yes && !flags.json);

    if (flags.version) {
      stdout.write(`${version}\n`);
      return 0;
    }
    let command = parsed.command;
    if (flags.help || command === "help") {
      stdout.write(helpText(version));
      return 0;
    }
    if (command === null) {
      if (!interactive) {
        stderr.write(helpText(version));
        return 2;
      }
      command = "add";
    }

    // Real paths, so a symlinked home or temp folder cannot make one folder look like two.
    const context = { cwd: realPath(runtime.cwd), home: realPath(runtime.home), env, etcDir: runtime.etcDir };
    /** @type {Session} */
    const session = {
      runtime,
      flags,
      version,
      paint,
      interactive,
      context,
      bundle: loadBundle(packageDir),
      io: { stdin: runtime.stdin, stdout, paint },
    };

    if (command === "list") {
      return list(session);
    }
    const skills = parsed.names.length > 0 ? resolveSkills(parsed.names, session.bundle.catalog.skills) : null;
    if (command === "add") {
      return await add(session, flags.all ? session.bundle.catalog.skills : skills);
    }
    if (command === "update") {
      return await update(session, flags.all ? null : skills);
    }
    if (command === "remove") {
      return await remove(session, flags.all ? null : skills);
    }
    throw usageError(`Unknown command "${command}". Run axiomui --help.`);
  } catch (error) {
    if (error instanceof CancelledError) {
      stderr.write("Cancelled.\n");
      return 130;
    }
    if (error instanceof CliError) {
      writeError(runtime, flags?.json ?? jsonRequested, error.message);
      return error.exitCode;
    }
    const failure = /** @type {NodeJS.ErrnoException} */ (error);
    const where = failure?.path ? ` (${failure.path})` : "";
    writeError(runtime, flags?.json ?? jsonRequested, `${failure?.message ?? String(error)}${where}`);
    return 1;
  }
}

/**
 * @param {Runtime} runtime
 * @param {boolean} json
 * @param {string} message
 */
function writeError(runtime, json, message) {
  if (json) {
    runtime.stdout.write(`${JSON.stringify({ error: message })}\n`);
  }
  runtime.stderr.write(`axiomui: ${message}\n`);
}

/**
 * @typedef {object} Session
 * @property {Runtime} runtime
 * @property {Flags} flags
 * @property {string} version
 * @property {import("./format.mjs").Palette} paint
 * @property {boolean} interactive
 * @property {import("./targets.mjs").Context} context
 * @property {Bundle} bundle
 * @property {import("./prompt.mjs").PromptIO} io
 */

/**
 * @param {Session} session
 * @param {string} text
 */
const say = (session, text) => {
  if (!session.flags.json) {
    session.runtime.stdout.write(`${text}\n`);
  }
};

/**
 * @param {Session} session
 * @param {string} dir
 */
const show = (session, dir) => displayPath(dir, session.context);

/**
 * @param {Session} session
 * @param {Target[]} targets
 */
const describeTargets = (session, targets) => targets.map((target) => show(session, target.dir)).join(" and ");

/**
 * Which folders to write, from --dir, --agent, prompts or detection.
 * @param {Session} session
 * @returns {Promise<{ targets: Target[], scope: Scope, notes: string[] }>}
 */
async function chooseTargets(session) {
  const { flags, context, interactive, io } = session;
  if (flags.dir) {
    return { targets: [customTarget(flags.dir, context)], scope: "custom", notes: [] };
  }

  /** @type {string[]} */
  const notes = [];
  const detected = detectAgents(context);
  let agentIds;
  if (flags.agent.length > 0) {
    agentIds = parseAgents(flags.agent);
  } else if (interactive) {
    agentIds = await multiselect(io, {
      message: "Which agents?",
      choices: agents.map((agent) => ({
        value: agent.id,
        label: agent.label,
        hint: [
          detected.includes(agent.id) ? "detected" : "",
          agent.folder === "claude" ? ".claude/skills" : ".agents/skills",
        ]
          .filter(Boolean)
          .join(" · "),
      })),
      initial: detected.length > 0 ? detected : ["universal"],
    });
  } else if (detected.length > 0) {
    agentIds = detected;
  } else {
    agentIds = ["universal"];
    notes.push("No agents detected; installing to .agents/skills, which most agents read. Use --agent claude for Claude Code.");
  }

  /** @type {"project" | "global"} */
  let scope = flags.global ? "global" : "project";
  if (!flags.global && interactive) {
    const projectTargets = resolveTargets(agentIds, "project", context);
    const globalTargets = resolveTargets(agentIds, "global", context);
    scope = /** @type {"project" | "global"} */ (
      await select(io, {
        message: "Where?",
        choices: [
          { value: "project", label: "This project", hint: describeTargets(session, projectTargets) },
          { value: "global", label: "Every project", hint: describeTargets(session, globalTargets) },
        ],
        initial: looksLikeProject(context) ? "project" : "global",
      })
    );
  }
  if (scope === "project") {
    assertProjectScopeAllowed(context);
  }
  return { targets: resolveTargets(agentIds, scope, context), scope, notes };
}

const symbols = /** @type {const} */ ({
  install: "+",
  replace: "+",
  update: "~",
  uptodate: "=",
  conflict: "!",
  foreign: "!",
  remove: "-",
});

/**
 * One aligned result row, plus continuation lines for skipped skills.
 * @param {Session} session
 * @param {InstallPlan | RemovePlan} plan
 * @param {number} nameWidth
 */
function resultRow(session, plan, nameWidth) {
  const { paint, flags } = session;
  const dry = flags.dryRun;
  const name = plan.skill.padEnd(nameWidth);
  const indent = " ".repeat(4 + nameWidth + 2 + 12);
  /** @type {(symbol: string, color: import("./format.mjs").Paint, status: string, detail?: string, more?: string[]) => string} */
  const row = (symbol, color, status, detail = "", more = []) =>
    [`  ${color(symbol)} ${name}  ${color(status.padEnd(11))} ${detail}`.trimEnd(), ...more.map((line) => `${indent}${paint.dim(line)}`)].join("\n");

  if (plan.action === "absent") {
    return row("·", paint.dim, "not installed");
  }
  /** @param {string[]} files */
  const fileList = (files) => files.slice(0, 3).join(", ") + (files.length > 3 ? ", …" : "");
  /** @param {string[]} dirs */
  const linkedWhy = (dirs) => `${fileList(dirs)} ${dirs.length === 1 ? "is a symlink" : "are symlinks"}; axiomui never writes through one`;
  if (plan.action === "remove") {
    const leftovers =
      "leftovers" in plan && plan.leftovers.length > 0
        ? [
            `${dry ? "will leave" : "left"} ${plural(plan.leftovers.length, "file")} axiomui did not install: ${fileList(plan.leftovers)}`,
            "the folder stays, and is no longer managed by axiomui",
          ]
        : [];
    return row(symbols.remove, paint.red, dry ? "will remove" : "removed", `(${plural(plan.deletes.length, "file")})`, leftovers);
  }
  if (plan.action === "conflict" && !("writes" in plan)) {
    if (plan.linked.length > 0) {
      return row(symbols.conflict, paint.yellow, "skipped", linkedWhy(plan.linked), ["rerun with --force to remove the link (never its target)"]);
    }
    return row(symbols.conflict, paint.yellow, "skipped", `${plural(plan.conflicts.length, "edited file")}: ${fileList(plan.conflicts)}`, [
      "nothing was removed; rerun with --force to delete it all",
    ]);
  }
  if (plan.action === "foreign") {
    const why =
      plan.foreignKind === "symlink"
        ? "a symlink, probably from `npx skills`; left untouched"
        : "not managed by axiomui (installed manually or by `npx skills`?)";
    const hint = "deletes" in plan && "writes" in plan ? ["rerun with --force to replace it"] : [];
    return row(symbols.foreign, paint.yellow, "skipped", why, hint);
  }
  if (!("writes" in plan)) {
    return "";
  }
  const kept = plan.kept.length > 0 ? [`kept ${plural(plan.kept.length, "edited file")} no longer bundled: ${plan.kept.join(", ")}`] : [];
  switch (plan.action) {
    case "install":
      return row(symbols.install, paint.green, dry ? "will install" : "installed", `(${plural(plan.writes.length, "file")})`);
    case "replace":
      return row(symbols.replace, paint.green, dry ? "will replace" : "replaced", `(${plural(plan.writes.length, "file")})`);
    case "update": {
      const changed = plan.writes.length + plan.deletes.length;
      return row(symbols.update, paint.cyan, dry ? "will update" : "updated", `(${plural(changed, "file")})`, kept);
    }
    case "uptodate":
      return row(symbols.uptodate, paint.dim, "up to date", "", kept);
    case "conflict": {
      if (plan.linked.length > 0) {
        return row(symbols.conflict, paint.yellow, "skipped", linkedWhy(plan.linked), [
          "rerun with --force to replace the link with a real folder (its target is never touched)",
        ]);
      }
      return row(symbols.conflict, paint.yellow, "skipped", `${plural(plan.conflicts.length, "modified file")}: ${fileList(plan.conflicts)}`, [
        "rerun with --force to overwrite",
      ]);
    }
  }
  return "";
}

/**
 * @param {Session} session
 * @param {(InstallPlan | RemovePlan)[]} plans
 */
function printPlans(session, plans) {
  const nameWidth = Math.max(...plans.map((plan) => plan.skill.length), 7);
  /** @type {Map<string, (InstallPlan | RemovePlan)[]>} */
  const byDir = new Map();
  for (const plan of plans) {
    byDir.set(plan.targetDir, [...(byDir.get(plan.targetDir) ?? []), plan]);
  }
  for (const [dir, dirPlans] of byDir) {
    say(session, session.paint.bold(show(session, dir)));
    for (const plan of dirPlans) {
      say(session, resultRow(session, plan, nameWidth));
    }
  }
}

/**
 * Old site downloads of a renamed skill. A pristine copy is offered for
 * removal only where its replacement is installed (or is being installed by
 * this run) in the same folder, and only an explicit --yes or a confirmation
 * removes it. --json alone never deletes anything.
 * @param {Session} session
 * @param {Target[]} targets
 * @param {InstallPlan[]} plans this run's plans; their effect is already on disk unless --dry-run
 * @returns {Promise<{ notes: string[], removed: number }>}
 */
async function handleLegacy(session, targets, plans) {
  const { flags, interactive, io, bundle } = session;
  /** @type {string[]} */
  const notes = [];
  let removed = 0;
  /** @param {string} dir @param {string} name */
  const replacementReady = (dir, name) => {
    const replacement = bundle.catalog.skills.find((skill) => skill.name === name);
    return Boolean(replacement && planInstall(replacement, dir).action === "uptodate") ||
    (flags.dryRun &&
      plans.some(
        (plan) =>
          plan.targetDir === path.resolve(dir) &&
          plan.skill === name &&
          (plan.action === "install" || plan.action === "replace" || plan.action === "update" || plan.action === "uptodate")
      ));
  };
  for (const target of targets) {
    for (const legacy of findLegacy(bundle, target.dir)) {
      const where = show(session, legacy.file);
      if (!legacy.pristine) {
        notes.push(`Found ${where}, an edited copy of the old ${legacy.name} download. Left in place; ${legacy.replacedBy} replaces it.`);
        continue;
      }
      if (!replacementReady(target.dir, legacy.replacedBy)) {
        const replacement = bundle.catalog.skills.find((skill) => skill.name === legacy.replacedBy);
        const word = replacement?.aliases[0] ?? legacy.replacedBy;
        notes.push(
          `Found the old site download ${where}. Its replacement ${legacy.replacedBy} is not up to date in ${show(session, target.dir)}, so the old copy stays. Install it with: npx axiomui@latest add ${word}`
        );
        continue;
      }
      say(session, `Found the old site download ${legacy.name}. It is replaced by ${legacy.replacedBy}.`);
      if (flags.dryRun) {
        notes.push(`Would offer to remove ${where}.`);
        continue;
      }
      const remove =
        flags.confirmed || (interactive && (await confirm(io, { message: `Remove the old copy at ${where}?`, initial: true })));
      if (remove) {
        if (replacementReady(target.dir, legacy.replacedBy) && removeLegacy(legacy)) {
          removed += 1;
          notes.push(`Removed ${where}.`);
        } else {
          notes.push(`Skipped cleanup of ${where}: the old copy or its replacement changed. Left untouched.`);
        }
      } else {
        notes.push(`Kept ${where}. Delete it yourself, or rerun with --yes to remove it.`);
      }
    }
  }
  return { notes, removed };
}

/**
 * @param {InstallPlan[]} plans
 */
const skippedCount = (plans) => plans.filter((plan) => plan.action === "conflict" || plan.action === "foreign").length;

/**
 * @param {Session} session
 * @param {Scope | "mixed"} scope
 * @param {(InstallPlan | RemovePlan)[]} plans
 * @param {string[]} notes
 */
function writeJson(session, scope, plans, notes) {
  const results = plans.map((plan) => ({
    dir: plan.targetDir,
    skill: plan.skill,
    action: plan.action,
    files: "writes" in plan ? plan.writes.length + plan.deletes.length : plan.deletes.length,
    conflicts: plan.conflicts,
    linked: plan.linked,
    kept: "kept" in plan ? plan.kept : [],
    leftovers: "leftovers" in plan ? plan.leftovers : [],
  }));
  session.runtime.stdout.write(
    `${JSON.stringify({ version: session.version, scope, dryRun: session.flags.dryRun, results, notes }, null, 2)}\n`
  );
}

/**
 * @param {Session} session
 * @param {CatalogSkill[] | null} requested
 */
async function add(session, requested) {
  const { flags, interactive, io, bundle, paint } = session;
  let skills = requested;
  if (!skills) {
    if (interactive) {
      const picked = await multiselect(io, {
        message: "Which skills?",
        choices: bundle.catalog.skills.map((skill) => ({
          value: skill.name,
          label: skill.name,
          group: skill.group === "core" ? "Core" : "Domains",
          hint: skill.group === "core" ? skill.summary : `${plural(skill.ruleCount, "rule")} · ${skill.summary}`,
        })),
        initial: bundle.catalog.skills.filter((skill) => skill.group === "core").map((skill) => skill.name),
      });
      skills = bundle.catalog.skills.filter((skill) => picked.includes(skill.name));
    } else {
      skills = bundle.catalog.skills.filter((skill) => skill.group === "core");
    }
  }

  const { targets, scope, notes } = await chooseTargets(session);
  const plans = targets.flatMap((target) => skills.map((skill) => planInstall(skill, target.dir, { force: flags.force })));
  const pending = plans.filter((plan) => plan.action !== "uptodate" && plan.action !== "conflict" && plan.action !== "foreign");

  if (interactive && pending.length > 0 && !flags.dryRun) {
    const ok = await confirm(io, {
      message: `Install ${plural(skills.length, "skill")} to ${describeTargets(session, targets)}?`,
      initial: true,
    });
    if (!ok) {
      say(session, "Nothing installed.");
      return 0;
    }
  }

  say(session, "");
  say(
    session,
    `${paint.bold(`axiomui ${session.version}`)} · ${plural(skills.length, "skill")} → ${plural(targets.length, "location")} (${scope})${flags.dryRun ? paint.yellow(" · dry run") : ""}`
  );
  say(session, "");
  if (!flags.dryRun) {
    for (const plan of plans) {
      applyInstall(plan, bundle, session.version);
    }
  }
  printPlans(session, plans);
  const legacy = await handleLegacy(session, targets, plans);
  notes.push(...legacy.notes);

  const skipped = skippedCount(plans);
  if (flags.json) {
    writeJson(session, scope, plans, notes);
    return skipped > 0 ? 3 : 0;
  }
  say(session, "");
  for (const note of notes) {
    say(session, paint.dim(note));
  }
  if (flags.dryRun) {
    say(session, "Dry run: nothing was written.");
  } else {
    const wrote = pending.length > 0;
    say(
      session,
      `${skipped > 0 ? `Done with ${skipped} skipped.` : "Done."}${wrote ? " Agents pick up new skills on their next session." : ""}`
    );
    if (wrote) {
      say(session, paint.dim(`Try: "Audit this page with Axiom UI" · Rules: ${site}`));
    }
  }
  return skipped > 0 ? 3 : 0;
}

/**
 * Folders to search for existing installs. `--dir` wins; `-g` limits the
 * search to user folders; `--agent` limits it to those agents' folders.
 * @param {Session} session
 * @param {("project" | "global")[]} defaultScopes
 */
function searchTargets(session, defaultScopes) {
  const { flags, context } = session;
  if (flags.dir) {
    return [customTarget(flags.dir, context)];
  }
  const scopes = flags.global ? /** @type {("project" | "global")[]} */ (["global"]) : defaultScopes;
  const agentIds = flags.agent.length > 0 ? parseAgents(flags.agent) : undefined;
  return knownTargets(scopes, context, agentIds);
}

/**
 * @param {Session} session
 * @param {Target[]} targets
 */
const scopeOf = (session, targets) => {
  const scopes = [...new Set(targets.map((target) => target.scope))];
  return scopes.length === 1 ? scopes[0] : "mixed";
};

/**
 * @param {Session} session
 * @param {CatalogSkill[] | null} requested
 */
async function update(session, requested) {
  const { flags, bundle, paint } = session;
  const targets = searchTargets(session, ["project", "global"]);
  /** @type {InstallPlan[]} */
  const plans = [];
  /** @type {string[]} */
  const notes = [];
  for (const target of targets) {
    for (const installed of findManaged(target.dir)) {
      if (requested && !requested.some((skill) => skill.name === installed.skill)) {
        continue;
      }
      const skill = bundle.catalog.skills.find((candidate) => candidate.name === installed.skill);
      if (!skill) {
        notes.push(`${show(session, installed.skillDir)} is not in axiomui ${session.version}; left alone.`);
        continue;
      }
      plans.push(planInstall(skill, target.dir, { force: flags.force }));
    }
  }

  if (plans.length === 0) {
    const legacy = await handleLegacy(session, targets, []);
    if (flags.json) {
      writeJson(session, scopeOf(session, targets), [], [...notes, ...legacy.notes]);
      return 0;
    }
    for (const note of [...notes, ...legacy.notes]) {
      say(session, paint.dim(note));
    }
    say(session, `No axiomui skills installed in ${describeTargets(session, targets)}. Install with: npx axiomui@latest add`);
    return 0;
  }

  say(session, "");
  say(
    session,
    `${paint.bold(`axiomui ${session.version}`)} · updating ${plural(plans.length, "install")}${flags.dryRun ? paint.yellow(" · dry run") : ""}`
  );
  say(session, "");
  if (!flags.dryRun) {
    for (const plan of plans) {
      applyInstall(plan, bundle, session.version);
    }
  }
  printPlans(session, plans);
  const legacy = await handleLegacy(session, targets, plans);
  notes.push(...legacy.notes);

  const skipped = skippedCount(plans);
  if (flags.json) {
    writeJson(session, scopeOf(session, targets), plans, notes);
    return skipped > 0 ? 3 : 0;
  }
  say(session, "");
  for (const note of notes) {
    say(session, paint.dim(note));
  }
  say(session, flags.dryRun ? "Dry run: nothing was written." : skipped > 0 ? `Done with ${skipped} skipped.` : "Done.");
  return skipped > 0 ? 3 : 0;
}

/**
 * @param {Session} session
 * @param {CatalogSkill[] | null} requested
 */
async function remove(session, requested) {
  const { flags, interactive, io, paint } = session;
  const targets = searchTargets(session, ["project"]);
  /** @type {RemovePlan[]} */
  const plans = [];
  for (const target of targets) {
    if (requested) {
      for (const skill of requested) {
        const plan = planRemove(skill.name, target.dir, { force: flags.force });
        if (plan.action !== "absent") {
          plans.push(plan);
        }
      }
    } else {
      for (const installed of findManaged(target.dir)) {
        plans.push(planRemove(installed.skill, target.dir, { force: flags.force }));
      }
    }
  }

  const removable = plans.filter((plan) => plan.action === "remove");
  if (plans.length === 0) {
    if (flags.json) {
      writeJson(session, scopeOf(session, targets), [], []);
      return 0;
    }
    const where = describeTargets(session, targets);
    say(session, `Nothing to remove: no ${requested ? "matching " : ""}axiomui skills in ${where}.${flags.global ? "" : " Add --global for user folders."}`);
    return 0;
  }

  if (interactive && removable.length > 0 && !flags.dryRun) {
    const dirs = [...new Set(removable.map((plan) => show(session, plan.targetDir)))].join(" and ");
    const ok = await confirm(io, { message: `Remove ${plural(removable.length, "skill install")} from ${dirs}?`, initial: false });
    if (!ok) {
      say(session, "Nothing removed.");
      return 0;
    }
  }

  say(session, "");
  say(session, `${paint.bold(`axiomui ${session.version}`)} · remove${flags.dryRun ? paint.yellow(" · dry run") : ""}`);
  say(session, "");
  if (!flags.dryRun) {
    for (const plan of removable) {
      applyRemove(plan);
    }
  }
  printPlans(session, plans);

  const skipped = plans.filter((plan) => plan.action === "foreign" || plan.action === "conflict").length;
  if (flags.json) {
    writeJson(session, scopeOf(session, targets), plans, []);
    return skipped > 0 ? 3 : 0;
  }
  say(session, "");
  say(session, flags.dryRun ? "Dry run: nothing was removed." : skipped > 0 ? `Done with ${skipped} skipped.` : "Done.");
  return skipped > 0 ? 3 : 0;
}

/**
 * @param {Session} session
 */
function list(session) {
  const { flags, bundle, paint } = session;
  const targets = searchTargets(session, ["project", "global"]);

  /** @type {{ dir: string, scope: Scope, skill: string, status: string, version: string | null }[]} */
  const installs = [];
  for (const target of targets) {
    const managed = new Map(findManaged(target.dir).map((entry) => [entry.skill, entry]));
    const names = [...new Set([...bundle.catalog.skills.map((skill) => skill.name), ...managed.keys()])];
    for (const name of names) {
      const entry = inspectEntry(target.dir, name);
      if (entry === "absent") {
        continue;
      }
      const skill = bundle.catalog.skills.find((candidate) => candidate.name === name);
      /** @type {string} */
      let status = entry;
      if (entry === "managed") {
        if (!skill) {
          status = "not in this version";
        } else {
          const plan = planInstall(skill, target.dir);
          status =
            plan.action === "uptodate" ? "up to date" : plan.action === "conflict" ? "modified" : "update available";
        }
      } else if (entry === "symlink") {
        status = "symlink (not managed)";
      } else {
        status = "not managed by axiomui";
      }
      installs.push({ dir: target.dir, scope: target.scope, skill: name, status, version: managed.get(name)?.version ?? null });
    }
  }

  if (flags.json) {
    session.runtime.stdout.write(
      `${JSON.stringify(
        {
          version: session.version,
          skills: bundle.catalog.skills.map(({ name, group, title, summary, ruleCount, aliases }) => ({
            name,
            group,
            title,
            summary,
            ruleCount,
            aliases,
          })),
          installs,
        },
        null,
        2
      )}\n`
    );
    return 0;
  }

  const width = Math.max(...bundle.catalog.skills.map((skill) => skill.name.length));
  say(session, `${paint.bold(`axiomui ${session.version}`)} · ${plural(bundle.catalog.skills.length, "skill")} bundled`);
  for (const [group, label] of /** @type {const} */ ([["core", "Core"], ["domain", "Domains"]])) {
    say(session, "");
    say(session, paint.bold(label));
    for (const skill of bundle.catalog.skills.filter((candidate) => candidate.group === group)) {
      const rules = paint.dim(`${String(skill.ruleCount).padStart(3)} rules`);
      say(session, `  ${skill.name.padEnd(width)}  ${rules}  ${skill.summary}`);
    }
  }
  say(session, "");
  say(session, paint.bold("Installed"));
  if (installs.length === 0) {
    say(session, `  Nothing yet. Install with: npx axiomui@latest add`);
    return 0;
  }
  for (const target of targets) {
    const rows = installs.filter((install) => install.dir === target.dir);
    if (rows.length === 0) {
      continue;
    }
    say(session, `  ${show(session, target.dir)}`);
    for (const row of rows) {
      const symbol = row.status === "up to date" ? "=" : row.status === "update available" ? "~" : "!";
      const version = row.version ? paint.dim(` ${row.version}`) : "";
      say(session, `    ${symbol} ${row.skill.padEnd(width)}  ${row.status}${version}`);
    }
  }
  return 0;
}
