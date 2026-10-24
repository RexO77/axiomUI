// @ts-check
import path from "node:path";

/** A failure the CLI reports as one line and a specific exit code. */
export class CliError extends Error {
  /**
   * @param {string} message
   * @param {number} [exitCode] 1 for runtime failures, 2 for usage errors.
   */
  constructor(message, exitCode = 1) {
    super(message);
    this.name = "CliError";
    this.exitCode = exitCode;
  }
}

/** @param {string} message */
export const usageError = (message) => new CliError(message, 2);

/**
 * Colour only for a terminal, unless the environment says otherwise.
 * NO_COLOR (any non-empty value) wins, then FORCE_COLOR, then isTTY.
 * @param {{ env: Record<string, string | undefined>, isTTY: boolean, noColor: boolean }} options
 */
export function colorEnabled({ env, isTTY, noColor }) {
  if (noColor || (env.NO_COLOR !== undefined && env.NO_COLOR !== "")) {
    return false;
  }
  if (env.FORCE_COLOR !== undefined) {
    return env.FORCE_COLOR !== "0" && env.FORCE_COLOR !== "false";
  }
  return isTTY && env.TERM !== "dumb";
}

/** @typedef {(text: string) => string} Paint */
/** @typedef {{ bold: Paint, dim: Paint, green: Paint, yellow: Paint, red: Paint, cyan: Paint }} Palette */

/**
 * @param {boolean} enabled
 * @returns {Palette}
 */
export function createPalette(enabled) {
  /** @type {(open: number, close: number) => Paint} */
  const paint = (open, close) => (text) => (enabled ? `\u001b[${open}m${text}\u001b[${close}m` : text);
  return {
    bold: paint(1, 22),
    dim: paint(2, 22),
    green: paint(32, 39),
    yellow: paint(33, 39),
    red: paint(31, 39),
    cyan: paint(36, 39),
  };
}

/**
 * Project paths relative to the cwd, home paths with `~`, everything else absolute.
 * @param {string} absolute
 * @param {{ cwd: string, home: string }} context
 */
export function displayPath(absolute, { cwd, home }) {
  const relative = path.relative(cwd, absolute);
  if (relative === "") {
    return ".";
  }
  if (!relative.startsWith("..") && !path.isAbsolute(relative)) {
    // A folder really named `~` inside the project must not read as the home folder.
    return relative.startsWith("~") ? `./${relative}` : relative;
  }
  if (home && (absolute === home || absolute.startsWith(home + path.sep))) {
    return `~${absolute.slice(home.length)}`;
  }
  return absolute;
}

/**
 * @param {string} a
 * @param {string} b
 */
function levenshtein(a, b) {
  /** @type {number[]} */
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    previous = current;
  }
  return previous[b.length];
}

/**
 * The closest candidate within three edits, for "did you mean" hints.
 * @param {string} input
 * @param {readonly string[]} candidates
 * @returns {string | null}
 */
export function suggest(input, candidates) {
  let best = null;
  let bestDistance = 4;
  for (const candidate of candidates) {
    const distance = levenshtein(input.toLowerCase(), candidate.toLowerCase());
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best;
}

/**
 * @param {string} input
 * @param {readonly string[]} candidates
 */
export function didYouMean(input, candidates) {
  const match = suggest(input, candidates);
  return match ? ` Did you mean "${match}"?` : "";
}

/**
 * @param {number} count
 * @param {string} singular
 * @param {string} [plural]
 */
export function plural(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}
