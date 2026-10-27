// @ts-check
import readline from "node:readline";

/** Thrown when the user presses Ctrl-C in a prompt. The CLI exits 130. */
export class CancelledError extends Error {
  constructor() {
    super("Cancelled");
    this.name = "CancelledError";
  }
}

/**
 * @typedef {object} PromptIO
 * @property {NodeJS.ReadableStream & { isTTY?: boolean, setRawMode?: (mode: boolean) => unknown, isRaw?: boolean }} stdin
 * @property {NodeJS.WritableStream} stdout
 * @property {import("./format.mjs").Palette} paint
 */

/**
 * @typedef {object} Choice
 * @property {string} value
 * @property {string} label
 * @property {string} [hint]
 * @property {string} [group] heading printed above the first choice of each group
 */

/** @typedef {{ name?: string, ctrl?: boolean, sequence?: string }} Key */

const hideCursor = "\u001b[?25l";
const showCursor = "\u001b[?25h";

/**
 * Cuts plain text to `max` characters, so a row never wraps and breaks redraws.
 * @param {string} text
 * @param {number} max
 */
const fit = (text, max) => (text.length <= max ? text : max <= 1 ? "" : `${text.slice(0, max - 1)}…`);

/** @param {PromptIO} io */
const columns = (io) => /** @type {{ columns?: number }} */ (io.stdout).columns || 80;

/** @param {PromptIO} io */
const canUseRawMode = (io) => typeof io.stdin.setRawMode === "function";

/** @param {PromptIO} io */
const inputClosed = (io) => {
  const input = /** @type {{ readableEnded?: boolean, destroyed?: boolean }} */ (io.stdin);
  return Boolean(input.readableEnded || input.destroyed);
};

/**
 * Runs one raw-mode prompt: renders `frame()` and feeds keys to `onKey` until
 * it returns a result. Raw mode and the cursor are restored on every exit path.
 * @template T
 * @param {PromptIO} io
 * @param {() => string[]} frame
 * @param {(key: Key, text: string) => { done: T } | void} onKey
 * @returns {Promise<T>}
 */
function rawPrompt(io, frame, onKey) {
  if (inputClosed(io)) return Promise.reject(new CancelledError());
  const { stdin, stdout } = io;
  return new Promise((resolve, reject) => {
    let drawn = 0;
    let settled = false;
    const wasRaw = Boolean(stdin.isRaw);
    const draw = () => {
      const lines = frame();
      stdout.write(`${drawn > 0 ? `\u001b[${drawn}A\r\u001b[0J` : ""}${lines.join("\n")}\n`);
      drawn = lines.length;
    };
    /** @param {{ done: T } | { error: unknown }} result */
    const finish = (result) => {
      if (settled) return;
      settled = true;
      stdin.removeListener("keypress", handle);
      stdin.removeListener("end", cancel);
      stdin.removeListener("close", cancel);
      stdin.removeListener("error", fail);
      try {
        stdin.setRawMode?.(wasRaw);
        stdin.pause();
        stdout.write(showCursor);
      } catch (error) {
        reject("error" in result ? result.error : error);
        return;
      }
      if ("error" in result) reject(result.error);
      else resolve(result.done);
    };
    /** @param {unknown} error */
    const fail = (error) => finish({ error });
    const cancel = () => fail(new CancelledError());
    /** @param {string} text @param {Key} key */
    function handle(text, key = {}) {
      if (settled) return;
      try {
        if (key.ctrl && key.name === "c") {
          cancel();
          return;
        }
        const result = onKey(key, text ?? "");
        draw();
        if (result) finish(result);
      } catch (error) {
        fail(error);
      }
    }
    try {
      readline.emitKeypressEvents(stdin);
      stdin.on("end", cancel);
      stdin.on("close", cancel);
      stdin.on("error", fail);
      stdin.setRawMode?.(true);
      stdin.on("keypress", handle);
      stdin.resume();
      stdout.write(hideCursor);
      draw();
    } catch (error) {
      fail(error);
    }
  });
}

/**
 * Line-mode fallback when raw mode is unavailable.
 * @param {PromptIO} io
 * @param {string} question
 * @returns {Promise<string>}
 */
function ask(io, question) {
  if (inputClosed(io)) return Promise.reject(new CancelledError());
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({ input: io.stdin, output: io.stdout, terminal: false });
    let settled = false;
    /** @param {unknown} error */
    const fail = (error) => {
      if (settled) return;
      settled = true;
      rl.close();
      reject(error);
    };
    rl.on("error", fail);
    rl.on("SIGINT", () => fail(new CancelledError()));
    rl.on("close", () => {
      if (!settled) {
        settled = true;
        reject(new CancelledError());
      }
    });
    try {
      rl.question(question, (answer) => {
        settled = true;
        rl.close();
        resolve(answer.trim());
      });
    } catch (error) {
      fail(error);
    }
  });
}

/**
 * @param {PromptIO} io
 * @param {{ message: string, choices: Choice[], initial: string[] }} options
 * @returns {Promise<string[]>}
 */
export async function multiselect(io, { message, choices, initial }) {
  const { paint } = io;
  const selected = new Set(initial);

  if (!canUseRawMode(io)) {
    io.stdout.write(`${paint.bold(message)}\n`);
    choices.forEach((choice, index) => {
      const mark = selected.has(choice.value) ? "x" : " ";
      io.stdout.write(`  ${String(index + 1).padStart(2)}. [${mark}] ${choice.label}${choice.hint ? `  ${paint.dim(choice.hint)}` : ""}\n`);
    });
    for (;;) {
      const answer = await ask(io, "Numbers separated by commas (enter keeps the [x] ones): ");
      if (answer === "") {
        const kept = choices.filter((choice) => selected.has(choice.value)).map((choice) => choice.value);
        if (kept.length > 0) return kept;
        io.stdout.write("Select at least one, or press Ctrl-C to cancel.\n");
        continue;
      }
      const picked = answer.split(/[\s,]+/).map(Number);
      if (picked.every((number) => Number.isInteger(number) && number >= 1 && number <= choices.length)) {
        return [...new Set(picked)].sort((a, b) => a - b).map((number) => choices[number - 1].value);
      }
      io.stdout.write(`Use numbers from 1 to ${choices.length}.\n`);
    }
  }

  let cursor = 0;
  let warning = "";
  let finished = false;
  const width = Math.max(...choices.map((choice) => choice.label.length));
  return rawPrompt(
    io,
    () => {
      if (finished) {
        const labels = choices.filter((choice) => selected.has(choice.value)).map((choice) => choice.label);
        return [`${paint.green("✔")} ${paint.bold(message)} ${paint.dim(labels.join(", "))}`];
      }
      /** @type {string[]} */
      const lines = [`${paint.cyan("?")} ${paint.bold(message)} ${paint.dim("↑/↓ move · space toggle · a all · enter confirm")}`];
      let group = "";
      choices.forEach((choice, index) => {
        if (choice.group && choice.group !== group) {
          group = choice.group;
          lines.push(`  ${paint.dim(group)}`);
        }
        const pointer = index === cursor ? paint.cyan("›") : " ";
        const box = selected.has(choice.value) ? paint.green("◼") : paint.dim("◻");
        const label = index === cursor ? paint.bold(choice.label.padEnd(width)) : choice.label.padEnd(width);
        const hint = fit(choice.hint ?? "", columns(io) - width - 9);
        lines.push(`  ${pointer} ${box} ${label}  ${paint.dim(hint)}`.trimEnd());
      });
      if (warning) {
        lines.push(`  ${paint.yellow(warning)}`);
      }
      return lines;
    },
    (key, text) => {
      warning = "";
      if (key.name === "up" || key.name === "k") {
        cursor = (cursor - 1 + choices.length) % choices.length;
      } else if (key.name === "down" || key.name === "j" || key.name === "tab") {
        cursor = (cursor + 1) % choices.length;
      } else if (key.name === "space") {
        const value = choices[cursor].value;
        if (selected.has(value)) {
          selected.delete(value);
        } else {
          selected.add(value);
        }
      } else if (text === "a") {
        const all = selected.size === choices.length;
        choices.forEach((choice) => (all ? selected.delete(choice.value) : selected.add(choice.value)));
      } else if (key.name === "return" || key.name === "enter") {
        if (selected.size === 0) {
          warning = "Select at least one, or press Ctrl-C to cancel.";
          return;
        }
        finished = true;
        return { done: choices.filter((choice) => selected.has(choice.value)).map((choice) => choice.value) };
      }
    }
  );
}

/**
 * @param {PromptIO} io
 * @param {{ message: string, choices: Choice[], initial: string }} options
 * @returns {Promise<string>}
 */
export async function select(io, { message, choices, initial }) {
  const { paint } = io;
  let cursor = Math.max(0, choices.findIndex((choice) => choice.value === initial));

  if (!canUseRawMode(io)) {
    io.stdout.write(`${paint.bold(message)}\n`);
    choices.forEach((choice, index) => {
      io.stdout.write(`  ${index + 1}. ${choice.label}${choice.hint ? `  ${paint.dim(choice.hint)}` : ""}\n`);
    });
    for (;;) {
      const answer = await ask(io, `Number (enter for ${cursor + 1}): `);
      if (answer === "") {
        return choices[cursor].value;
      }
      const number = Number(answer);
      if (Number.isInteger(number) && number >= 1 && number <= choices.length) {
        return choices[number - 1].value;
      }
      io.stdout.write(`Use a number from 1 to ${choices.length}.\n`);
    }
  }

  let finished = false;
  return rawPrompt(
    io,
    () => {
      if (finished) {
        return [`${paint.green("✔")} ${paint.bold(message)} ${paint.dim(choices[cursor].label)}`];
      }
      return [
        `${paint.cyan("?")} ${paint.bold(message)} ${paint.dim("↑/↓ move · enter confirm")}`,
        ...choices.map((choice, index) => {
          const pointer = index === cursor ? paint.cyan("›") : " ";
          const label = index === cursor ? paint.bold(choice.label) : choice.label;
          const hint = fit(choice.hint ?? "", columns(io) - choice.label.length - 7);
          return `  ${pointer} ${label}  ${paint.dim(hint)}`.trimEnd();
        }),
      ];
    },
    (key) => {
      if (key.name === "up" || key.name === "k") {
        cursor = (cursor - 1 + choices.length) % choices.length;
      } else if (key.name === "down" || key.name === "j" || key.name === "tab") {
        cursor = (cursor + 1) % choices.length;
      } else if (key.name === "return" || key.name === "enter") {
        finished = true;
        return { done: choices[cursor].value };
      }
    }
  );
}

/**
 * @param {PromptIO} io
 * @param {{ message: string, initial: boolean }} options
 * @returns {Promise<boolean>}
 */
export async function confirm(io, { message, initial }) {
  const { paint } = io;
  const hint = initial ? "(Y/n)" : "(y/N)";

  if (!canUseRawMode(io)) {
    const answer = (await ask(io, `${message} ${hint} `)).toLowerCase();
    return answer === "" ? initial : answer.startsWith("y");
  }

  /** @type {boolean | null} */
  let answer = null;
  return rawPrompt(
    io,
    () =>
      answer === null
        ? [`${paint.cyan("?")} ${paint.bold(message)} ${paint.dim(hint)}`]
        : [`${answer ? paint.green("✔") : paint.dim("✖")} ${paint.bold(message)} ${paint.dim(answer ? "yes" : "no")}`],
    (key, text) => {
      const lower = text.toLowerCase();
      if (lower === "y" || lower === "n") {
        answer = lower === "y";
      } else if (key.name === "return" || key.name === "enter") {
        answer = initial;
      } else {
        return;
      }
      return { done: answer };
    }
  );
}
