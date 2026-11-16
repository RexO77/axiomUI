import { defineConfig, devices } from "@playwright/test";

import { E2E_PORT, ORIGIN } from "./helpers";

/*
 * The browser suite's one config. `npm run e2e` passes it explicitly
 * (`--config e2e/runner.config.ts`), so there is no config file at the root.
 * The script makes the production build, serves it on :3100 and runs every spec
 * against it.
 *
 * The catalog is at the site root; every spec builds its URLs from the app's
 * CATALOG_BASE (helpers.ts), which `E2E_BASE` overrides. `E2E_PORT` moves the
 * server off 3100, so several runs can share a machine.
 *
 * The browser binary is never installed by `npm ci` (the runner has no
 * install script). Fetch it once with `npx playwright install chromium`.
 * Runner artifacts are git-ignored.
 */

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
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
