#!/usr/bin/env node
// @ts-check
import os from "node:os";

import { main } from "../lib/cli.mjs";

main({
  argv: process.argv.slice(2),
  env: process.env,
  cwd: process.cwd(),
  home: os.homedir(),
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr,
}).then((code) => {
  process.exitCode = code;
});
