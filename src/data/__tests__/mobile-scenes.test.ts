import { readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { mobilePreviews } from "@/components/features/rules/previews/mobile";
import { mobileScene } from "@/components/features/rules/previews/mobile/kit/scenes";
import { rules } from "@/data/ui-logic";

const src = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const mobileIds = rules.filter((rule) => rule.category === "mobile").map((rule) => rule.id);

const isFile = (path: string) => statSync(path, { throwIfNoEntry: false })?.isFile() ?? false;

/** Every module the given one reaches through project imports (packages and CSS left out). */
function graph(entry: string, seen = new Set<string>()): Set<string> {
  if (seen.has(entry)) return seen;
  seen.add(entry);
  const code = readFileSync(entry, "utf8");
  for (const [, spec] of code.matchAll(/(?:from|import)\s+"([^"]+)"/g)) {
    if (spec.endsWith(".css") || !(spec.startsWith(".") || spec.startsWith("@/"))) continue;
    const base = spec.startsWith("@/") ? resolve(src, spec.slice(2)) : resolve(dirname(entry), spec);
    const file = [".ts", ".tsx", "/index.ts", "/index.tsx", ""].map((ext) => base + ext).find(isFile);
    if (file) graph(file, seen);
  }
  return seen;
}

describe("the Mobile scenes", () => {
  it("route every Mobile rule, and only Mobile rules, to one scene", () => {
    expect(mobileIds.length).toBeGreaterThan(0);
    for (const id of mobileIds) expect(mobileScene(id), id).not.toBeNull();
    expect(mobileScene("typo-1")).toBeNull();
    expect(mobileScene("mobile-999")).toBeNull();
  });

  it("give every Mobile rule a still on both sides", () => {
    for (const id of mobileIds) {
      expect(mobilePreviews(id, "do"), id).not.toBeNull();
      expect(mobilePreviews(id, "dont"), id).not.toBeNull();
    }
  });

  it("keep the wall's stills server-rendered: nothing they import is a client module", () => {
    const files = [...graph(resolve(src, "components/features/rules/previews/mobile/index.tsx"))];
    expect(files.some((file) => file.endsWith("touch-still.tsx"))).toBe(true);
    const client = files.filter((file) => /^\s*["']use client["']/m.test(readFileSync(file, "utf8")));
    expect(client.map((file) => file.slice(src.length + 1))).toEqual([]);
  });
});
