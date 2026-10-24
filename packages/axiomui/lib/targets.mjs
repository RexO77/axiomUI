// @ts-check
import { existsSync, lstatSync, readlinkSync, realpathSync } from "node:fs";
import path from "node:path";

import { didYouMean, usageError } from "./format.mjs";

/**
 * Everything that varies between machines, injected so tests never touch the
 * real home directory.
 * @typedef {object} Context
 * @property {string} cwd
 * @property {string} home
 * @property {Record<string, string | undefined>} env
 * @property {string} [etcDir] defaults to /etc
 */

/** @typedef {"project" | "global" | "custom"} Scope */

/**
 * @typedef {object} Agent
 * @property {string} id
 * @property {string} label
 * @property {string[]} aliases
 * @property {"claude" | "agents"} folder which skills folder the agent reads
 * @property {(context: Context) => string[]} markers paths whose existence means "installed"
 */

/**
 * @typedef {object} Target
 * @property {string} dir absolute skills folder
 * @property {Scope} scope
 * @property {string[]} agents labels of the agents that read it
 */

/** @param {Record<string, string | undefined>} env @param {string} name */
const envPath = (env, name) => {
  const value = env[name]?.trim();
  return value ? value : null;
};

/** @param {Context} context */
const claudeHome = (context) => envPath(context.env, "CLAUDE_CONFIG_DIR") ?? path.join(context.home, ".claude");

/**
 * Claude Code reads only `.claude/skills`. Every other agent here reads the
 * shared `.agents/skills`, so one copy serves all of them. Detection mirrors
 * the skills CLI's agent table.
 * @type {Agent[]}
 */
export const agents = [
  {
    id: "claude",
    label: "Claude Code",
    aliases: ["claude-code"],
    folder: "claude",
    markers: (context) => [claudeHome(context)],
  },
  {
    id: "codex",
    label: "Codex",
    aliases: [],
    folder: "agents",
    markers: (context) => [
      envPath(context.env, "CODEX_HOME") ?? path.join(context.home, ".codex"),
      path.join(context.etcDir ?? "/etc", "codex"),
    ],
  },
  {
    id: "cursor",
    label: "Cursor",
    aliases: [],
    folder: "agents",
    markers: (context) => [path.join(context.home, ".cursor")],
  },
  {
    id: "opencode",
    label: "OpenCode",
    aliases: [],
    folder: "agents",
    markers: (context) => [
      path.join(envPath(context.env, "XDG_CONFIG_HOME") ?? path.join(context.home, ".config"), "opencode"),
    ],
  },
  {
    id: "gemini",
    label: "Gemini CLI",
    aliases: ["gemini-cli"],
    folder: "agents",
    markers: (context) => [path.join(context.home, ".gemini")],
  },
  {
    id: "copilot",
    label: "GitHub Copilot",
    aliases: ["github-copilot"],
    folder: "agents",
    markers: (context) => [path.join(context.home, ".copilot")],
  },
  {
    id: "windsurf",
    label: "Windsurf",
    aliases: [],
    folder: "agents",
    markers: (context) => [path.join(context.home, ".codeium", "windsurf")],
  },
  {
    id: "universal",
    label: "Other agents",
    aliases: ["agents"],
    folder: "agents",
    markers: () => [],
  },
];

const agentWords = [...agents.flatMap((agent) => [agent.id, ...agent.aliases]), "all"];

/**
 * Parses `--agent` values: comma-separated, repeatable, with aliases and `all`.
 * @param {string[]} values
 * @returns {string[]} agent ids in table order
 */
export function parseAgents(values) {
  const wanted = new Set();
  for (const raw of values.flatMap((value) => value.split(","))) {
    const word = raw.trim().toLowerCase();
    if (!word) {
      continue;
    }
    if (word === "all") {
      agents.forEach((agent) => wanted.add(agent.id));
      continue;
    }
    const agent = agents.find((candidate) => candidate.id === word || candidate.aliases.includes(word));
    if (!agent) {
      throw usageError(`Unknown agent "${raw.trim()}".${didYouMean(word, agentWords)} Agents: ${agentWords.join(", ")}.`);
    }
    wanted.add(agent.id);
  }
  if (wanted.size === 0) {
    throw usageError("--agent needs at least one agent.");
  }
  return agents.filter((agent) => wanted.has(agent.id)).map((agent) => agent.id);
}

/**
 * Ids of the agents installed on this machine. `universal` is never detected.
 * @param {Context} context
 */
export function detectAgents(context) {
  return agents.filter((agent) => agent.markers(context).some((marker) => existsSync(marker))).map((agent) => agent.id);
}

/**
 * @param {"claude" | "agents"} folder
 * @param {"project" | "global"} scope
 * @param {Context} context
 */
export function skillsFolder(folder, scope, context) {
  if (scope === "project") {
    return path.resolve(context.cwd, folder === "claude" ? ".claude" : ".agents", "skills");
  }
  return folder === "claude"
    ? path.resolve(claudeHome(context), "skills")
    : path.resolve(context.home, ".agents", "skills");
}

/**
 * Where a folder really is: the real path of its deepest existing ancestor,
 * plus the part not created yet. Two spellings of one physical folder (a
 * symlinked `.claude/skills`, say) give the same answer.
 * @param {string} dir
 */
export function physicalPath(dir) {
  const absolute = path.resolve(dir);
  let candidate = absolute;
  const visited = new Set();
  try {
    while (true) {
      let existing = candidate;
      let entry = lstatSync(existing, { throwIfNoEntry: false });
      while (!entry) {
        const parent = path.dirname(existing);
        if (parent === existing) {
          return candidate;
        }
        existing = parent;
        entry = lstatSync(existing, { throwIfNoEntry: false });
      }
      // lstat also sees links whose destinations have not been created yet.
      if (entry.isSymbolicLink()) {
        if (visited.has(existing) || visited.size >= 40) {
          return absolute;
        }
        visited.add(existing);
        const destination = path.resolve(path.dirname(existing), readlinkSync(existing));
        candidate = path.join(destination, path.relative(existing, candidate));
        continue;
      }
      return path.join(realpathSync(existing), path.relative(existing, candidate));
    }
  } catch {
    return absolute;
  }
}

/**
 * The deduplicated folders a set of agents reads in one scope, Claude first.
 * Folders are deduplicated by where they really are, so a `.claude/skills`
 * linked to `.agents/skills` is planned once.
 * @param {string[]} agentIds
 * @param {"project" | "global"} scope
 * @param {Context} context
 * @returns {Target[]}
 */
export function resolveTargets(agentIds, scope, context) {
  /** @type {Map<string, Target>} */
  const targets = new Map();
  for (const agent of agents.filter((candidate) => agentIds.includes(candidate.id))) {
    const dir = skillsFolder(agent.folder, scope, context);
    const key = physicalPath(dir);
    const target = targets.get(key) ?? { dir, scope, agents: [] };
    target.agents.push(agent.label);
    targets.set(key, target);
  }
  return [...targets.values()];
}

/**
 * `--dir`. Shells do not expand `~` after `--dir=`, so a leading `~` or `~/`
 * is expanded here; otherwise `--dir=~/x` would create a folder named `~`.
 * @param {string} dir
 * @param {Context} context
 * @returns {Target}
 */
export function customTarget(dir, context) {
  const expanded = dir === "~" ? context.home : /^~[\\/]/.test(dir) ? path.join(context.home, dir.slice(2)) : dir;
  return { dir: path.resolve(context.cwd, expanded), scope: "custom", agents: [] };
}

/**
 * Every folder axiomui could have installed into, for `list`, `update` and `remove`.
 * @param {("project" | "global")[]} scopes
 * @param {Context} context
 * @param {string[]} [agentIds]
 * @returns {Target[]}
 */
export function knownTargets(scopes, context, agentIds = agents.map((agent) => agent.id)) {
  /** @type {Map<string, Target>} */
  const all = new Map();
  for (const scope of scopes) {
    for (const target of resolveTargets(agentIds, scope, context)) {
      const key = physicalPath(target.dir);
      if (!all.has(key)) {
        all.set(key, target);
      }
    }
  }
  return [...all.values()];
}

/**
 * A project install from the home directory would land in the global folders
 * under a project label. Refuse it rather than guess.
 * @param {Context} context
 */
export function assertProjectScopeAllowed(context) {
  /** @param {string} dir */
  const real = (dir) => {
    try {
      return realpathSync(dir);
    } catch {
      return path.resolve(dir);
    }
  };
  if (real(context.cwd) === real(context.home)) {
    throw usageError("The current directory is your home directory. Run this inside a project, or use --global.");
  }
}

/**
 * Project is the default when the cwd looks like a project.
 * @param {Context} context
 */
export const looksLikeProject = (context) =>
  existsSync(path.join(context.cwd, ".git")) || existsSync(path.join(context.cwd, "package.json"));
