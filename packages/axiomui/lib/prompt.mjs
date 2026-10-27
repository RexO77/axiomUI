// @ts-check
import readline from "node:readline";
import { StringDecoder } from "node:string_decoder";
import { stripVTControlCharacters } from "node:util";

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

const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/** @param {string} line */
function displayWidth(line) {
  let width = 0;
  for (const { segment } of graphemes.segment(stripVTControlCharacters(line))) {
    if (segment === "\t") { width += 8 - width % 8; continue; }
    if (/^[\p{Mark}\p{Cf}\p{Cc}]+$/u.test(segment)) continue;
    const code = segment.codePointAt(0) ?? 0;
    const wide = /\p{Emoji_Presentation}|\uFE0F|\u20E3/u.test(segment) ||
      code >= 0x1100 && (code <= 0x115f || code === 0x2329 || code === 0x232a ||
        code >= 0x2e80 && code <= 0xa4cf && code !== 0x303f ||
        code >= 0xac00 && code <= 0xd7a3 || code >= 0xf900 && code <= 0xfaff ||
        code >= 0xfe10 && code <= 0xfe19 || code >= 0xfe30 && code <= 0xfe6f ||
        code >= 0xff01 && code <= 0xff60 || code >= 0xffe0 && code <= 0xffe6 ||
        code >= 0x1b000 && code <= 0x1b2ff || code >= 0x20000 && code <= 0x3fffd);
    width += wide ? 2 : 1;
  }
  return width;
}

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
      drawn = lines.flatMap((line) => line.split("\n")).reduce(
        (rows, line) => rows + Math.max(1, Math.ceil(displayWidth(line) / Math.max(1, columns(io)))), 0
      );
    };
    /** @param {{ done: T } | { error: unknown }} result */
    const finish = (result) => {
      if (settled) return;
      settled = true;
      stdin.removeListener("keypress", handle);
      stdin.removeListener("end", cancel);
      stdin.removeListener("close", cancel);
      stdin.removeListener("error", fail);
      let cleanupError;
      for (const restore of [
        () => stdin.setRawMode?.(wasRaw),
        () => stdin.pause(),
        () => stdout.write(showCursor),
      ]) {
        try { restore(); }
        catch (error) { cleanupError ??= error; }
      }
      if ("error" in result) reject(result.error);
      else if (cleanupError) reject(cleanupError);
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
 * Keep unread pasted lines and partial UTF-8 across questions without leaving
 * a flowing input listener behind after an answer.
 * @type {WeakMap<PromptIO["stdin"], { lines: string[], tail: string, skipLf: boolean, decoder: StringDecoder, ended: boolean }>}
 */
const lineInputs = new WeakMap();

/**
 * Line-mode fallback when raw mode is unavailable.
 * @param {PromptIO} io
 * @param {string} question
 * @returns {Promise<string>}
 */
function ask(io, question) {
  let state = lineInputs.get(io.stdin);
  if (!state) {
    state = { lines: [], tail: "", skipLf: false, decoder: new StringDecoder("utf8"), ended: false };
    lineInputs.set(io.stdin, state);
  }
  const input = state;
  /** @param {string} text */
  const feed = (text) => {
    for (const character of text) {
      if (input.skipLf) {
        input.skipLf = false;
        if (character === "\n") continue;
      }
      if (character === "\r" || character === "\n") {
        input.lines.push(input.tail);
        input.tail = "";
        input.skipLf = character === "\r";
      } else input.tail += character;
    }
  };
  const endInput = () => {
    if (input.ended) return;
    feed(input.decoder.end());
    input.ended = true;
    if (input.tail) { input.lines.push(input.tail); input.tail = ""; }
  };
  if (inputClosed(io)) endInput();
  return new Promise((resolve, reject) => {
    let settled = false;
    /** @param {unknown} [error] */
    const finish = (error) => {
      if (settled) return;
      if (!error && input.lines.length === 0 && !input.ended) return;
      settled = true;
      io.stdin.removeListener("data", data);
      io.stdin.removeListener("end", ended);
      io.stdin.removeListener("close", ended);
      io.stdin.removeListener("error", failed);
      io.stdin.pause();
      if (error) reject(error);
      else if (input.lines.length) resolve(input.lines.shift()?.trim() ?? "");
      else reject(new CancelledError());
    };
    /** @param {string | Buffer} chunk */
    const data = (chunk) => {
      feed(typeof chunk === "string" ? chunk : input.decoder.write(chunk));
      finish();
    };
    const ended = () => { endInput(); finish(); };
    /** @param {unknown} error */
    const failed = (error) => finish(error);
    try {
      io.stdout.write(question);
      if (input.lines.length || input.ended) { finish(); return; }
      io.stdin.on("data", data);
      io.stdin.on("end", ended);
      io.stdin.on("close", ended);
      io.stdin.on("error", failed);
      io.stdin.resume();
    } catch (error) { finish(error); }
  });
}

/**
 * @param {PromptIO} io
 * @param {{ message: string, choices: Choice[], initial: string[] }} options
 * @returns {Promise<string[]>}
 */
export async function multiselect(io, { message, choices, initial }) {
  if (choices.length === 0) throw new Error("Provide at least one choice for multiselect.");
  const { paint } = io;
  const selected = new Set(choices.filter((choice) => initial.includes(choice.value)).map((choice) => choice.value));

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
  if (choices.length === 0) throw new Error("Provide at least one choice for select.");
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
