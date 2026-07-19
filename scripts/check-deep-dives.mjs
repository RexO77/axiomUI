import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const deepDivesSrc = readFileSync(path.join(root, "src/data/deep-dives.ts"), "utf8");
const uiLogicSrc = readFileSync(path.join(root, "src/data/ui-logic.ts"), "utf8");

const deepDiveKeys = [...deepDivesSrc.matchAll(/^\s{2}"([a-z0-9]+-\d+)":/gm)].map((m) => m[1]);
const ruleIds = new Set([...uiLogicSrc.matchAll(/id: "([a-z0-9]+-\d+)"/g)].map((m) => m[1]));

const unknown = deepDiveKeys.filter((key) => !ruleIds.has(key));

if (unknown.length > 0) {
  console.error(`Unknown deep-dive keys (not real rule ids): ${unknown.join(", ")}`);
  process.exit(1);
}

console.log(`deep dives authored: ${deepDiveKeys.length}/${ruleIds.size}`);
