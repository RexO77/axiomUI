import { PassThrough } from "node:stream";
import { describe, expect, it, vi } from "vitest";

import { createPalette } from "../format.mjs";
import { CancelledError, confirm, multiselect, select } from "../prompt.mjs";

function terminal(raw = true, initiallyRaw = false) {
  const modes: boolean[] = [];
  const stdin = Object.assign(new PassThrough(), { isTTY: raw, isRaw: initiallyRaw });
  if (raw) {
    Object.assign(stdin, { setRawMode: (mode: boolean) => { stdin.isRaw = mode; modes.push(mode); } });
  }
  const stdout = new PassThrough();
  let output = "";
  stdout.on("data", (chunk) => { output += chunk.toString(); });
  return { stdin, stdout, paint: createPalette(false), modes, output: () => output };
}
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));
const choices = [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }];

describe("terminal prompts", () => {
  it.each([true, false])("rejects already-closed input when raw mode is %s", async (raw) => {
    const io = terminal(raw);
    io.stdin.resume();
    io.stdin.end();
    await tick();
    await expect(confirm(io, { message: "Continue?", initial: true })).rejects.toBeInstanceOf(CancelledError);
    expect(io.modes).toEqual([]);
    expect(io.stdin.listenerCount("data")).toBe(0);
  });

  it("confirms and restores raw mode, listeners and cursor", async () => {
    const io = terminal();
    const result = confirm(io, { message: "Continue?", initial: false });
    io.stdin.emit("keypress", "y", { name: "y" });
    expect(await result).toBe(true);
    expect(io.modes).toEqual([true, false]);
    expect(io.stdin.listenerCount("keypress")).toBe(0);
    expect(io.output()).toContain("\u001b[?25h");
  });

  it("preserves an already-raw terminal and honors the Enter default", async () => {
    const io = terminal(true, true);
    const result = confirm(io, { message: "Continue?", initial: false });
    io.stdin.emit("keypress", "", { name: "return" });
    expect(await result).toBe(false);
    expect(io.modes).toEqual([true, true]);
  });

  it("cancels with Ctrl-C and restores the terminal", async () => {
    const io = terminal();
    const result = confirm(io, { message: "Continue?", initial: true });
    const rejection = expect(result).rejects.toBeInstanceOf(CancelledError);
    io.stdin.emit("keypress", "", { name: "c", ctrl: true });
    await rejection;
    expect(io.stdin.isRaw).toBe(false);
    expect(io.stdin.listenerCount("keypress")).toBe(0);
    expect(io.output()).toContain("\u001b[?25h");
  });

  it("settles on input EOF instead of leaving raw mode active", async () => {
    const io = terminal();
    const result = confirm(io, { message: "Continue?", initial: true });
    let outcome: unknown = "pending";
    void result.then((value) => { outcome = value; }, (error) => { outcome = error; });
    io.stdin.end();
    await tick();
    if (outcome === "pending") io.stdin.emit("keypress", "", { name: "c", ctrl: true });
    expect(outcome).toBeInstanceOf(CancelledError);
    expect(io.stdin.isRaw).toBe(false);
  });

  it("restores raw mode when initial rendering throws", async () => {
    const io = terminal();
    vi.spyOn(io.stdout, "write").mockImplementationOnce(() => { throw new Error("output failed"); });
    await expect(confirm(io, { message: "Continue?", initial: true })).rejects.toThrow("output failed");
    expect(io.stdin.isRaw).toBe(false);
    expect(io.stdin.listenerCount("keypress")).toBe(0);
  });

  it("restores the terminal when input fails", async () => {
    const io = terminal();
    const result = confirm(io, { message: "Continue?", initial: true });
    const rejection = expect(result).rejects.toThrow("input failed");
    io.stdin.emit("error", new Error("input failed"));
    await rejection;
    expect(io.stdin.isRaw).toBe(false);
    expect(io.stdin.listenerCount("keypress")).toBe(0);
  });

  it("moves the selection with arrow keys", async () => {
    const io = terminal();
    const result = select(io, { message: "Choose", choices, initial: "a" });
    io.stdin.emit("keypress", "", { name: "down" });
    io.stdin.emit("keypress", "", { name: "return" });
    expect(await result).toBe("b");
  });

  it("prevents empty raw multiselect and returns catalog order", async () => {
    const io = terminal();
    const result = multiselect(io, { message: "Choose", choices, initial: [] });
    io.stdin.emit("keypress", "", { name: "return" });
    expect(io.output()).toContain("Select at least one");
    io.stdin.emit("keypress", "a", { name: "a" });
    io.stdin.emit("keypress", "", { name: "return" });
    expect(await result).toEqual(["a", "b"]);
  });

  it("uses line input when raw mode is unavailable", async () => {
    const io = terminal(false);
    const result = select(io, { message: "Choose", choices, initial: "a" });
    io.stdin.write("2\n");
    expect(await result).toBe("b");
    expect(io.modes).toEqual([]);
  });

  it("deduplicates line-mode multiselect numbers", async () => {
    const io = terminal(false);
    const result = multiselect(io, { message: "Choose", choices, initial: [] });
    io.stdin.write("2,1,2\n");
    expect(await result).toEqual(["a", "b"]);
  });

  it("releases line-mode input when question rendering fails", async () => {
    const io = terminal(false);
    vi.spyOn(io.stdout, "write").mockImplementationOnce(() => { throw new Error("output failed"); });
    await expect(confirm(io, { message: "Continue?", initial: true })).rejects.toThrow("output failed");
    expect(io.stdin.listenerCount("data")).toBe(0);
  });

  it("rejects line-mode input errors and releases its listeners", async () => {
    const io = terminal(false);
    const result = confirm(io, { message: "Continue?", initial: true });
    const rejection = expect(result).rejects.toThrow("input failed");
    io.stdin.emit("error", new Error("input failed"));
    await rejection;
    expect(io.stdin.listenerCount("data")).toBe(0);
  });

  it("requires at least one line-mode multiselect choice", async () => {
    const io = terminal(false);
    const result = multiselect(io, { message: "Choose", choices, initial: [] });
    io.stdin.write("\n");
    await tick();
    io.stdin.write("1\n");
    expect(await result).toEqual(["a"]);
    expect(io.output()).toContain("Select at least one");
  });

  it("cancels line input on EOF", async () => {
    const io = terminal(false);
    const result = confirm(io, { message: "Continue?", initial: true });
    const rejection = expect(result).rejects.toBeInstanceOf(CancelledError);
    io.stdin.end();
    await rejection;
  });
});
