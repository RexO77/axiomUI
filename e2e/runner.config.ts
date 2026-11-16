import { defineConfig, devices } from "@playwright/test";

import { E2E_PORT, ORIGIN } from "./helpers";

/*
 * The browser suite's one config. Both scripts pass it explicitly
 * (`--config e2e/runner.config.ts`), so there is no config file at the root.
 *
 *   npm run e2e        builds with AXIOM_STAGING=1, serves it on :3100, runs the specs
 *   npm run e2e:guard  builds with VERCEL_ENV and AXIOM_STAGING cleared, runs only the guard spec
 *
 * `E2E_PORT` moves the server off 3100, so test runs can share a host. The
 * guard spec runs in both builds: it checks staging is off in the guard build
 * and, with the same requests, that the e2e build serves it.
 *
 * The staging gallery page decides at request time, so AXIOM_STAGING has to
 * be set for `next build` and for `next start`. The web server inherits this
 * process's environment, which is how the script's value reaches it.
 *
 * The browser binary is never installed by `npm ci` (the runner has no
 * install script). Fetch it once with `npx playwright install chromium`.
 * Runner artifacts are git-ignored.
 */

const guard = process.env.E2E_GUARD === "1";

if (guard && (process.env.AXIOM_STAGING || process.env.VERCEL_ENV)) {
  // A guard run against a build that opted in would prove nothing.
  throw new Error("The guard build must be made with VERCEL_ENV and AXIOM_STAGING cleared (npm run e2e:guard).");
}

export default defineConfig({
  testDir: ".",
  testMatch: guard ? "staging-guard.spec.ts" : "*.spec.ts",
  // On a Mac, keeps the host from idle sleep for the run (a sleeping host stalls the browser).
  globalSetup: "./global-setup.ts",
  outputDir: "../output/e2e/results",
  // No HTML report: lint would scan its generated JavaScript bundle.
  // Failures keep a trace and a screenshot in the results folder; the JSON file is the run's record.
  reporter: [["list"], ["json", { outputFile: "../output/e2e/results.json" }]],
  // One production server and CSS animations that the specs wait out: one worker, no retries to hide a flake.
  workers: 1,
  fullyParallel: false,
  retries: 0,
  // A hang fails fast: a whole run takes about a minute, one test a few seconds.
  globalTimeout: 8 * 60_000,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  forbidOnly: Boolean(process.env.CI),
  use: {
    baseURL: ORIGIN,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  // A single engine: the Chromium already cached in this checkout.
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: `node node_modules/next/dist/bin/next start -p ${E2E_PORT}`,
    // Relative to this file; the default is its own directory.
    cwd: "..",
    url: `${ORIGIN}/`,
    // A server left over from another build would be tested instead of this one.
    reuseExistingServer: false,
    timeout: 60_000,
    stdout: "pipe",
    stderr: "pipe",
    // The runner defaults NODE_ENV to "test"; the build under test is production.
    env: { NODE_ENV: "production" },
  },
});
