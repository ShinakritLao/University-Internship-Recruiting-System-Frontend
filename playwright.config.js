// @ts-check
import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the University Internship Recruiting System frontend.
 *
 * Targets the local dev server (auto-started via `webServer`) and the local Go
 * backend on http://localhost:8080. Run the backend separately with
 * `go run ./src` from the sibling backend repo before invoking the tests.
 *
 * The 8 happy-path tests in `tests/happy-paths.spec.js` are serial and share
 * state between steps — keep `workers: 1`.
 */
export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ["html", { open: "never", outputFolder: "playwright-report" }],
    ["list"],
  ],
  globalSetup: "./tests/global-setup.js",
  use: {
    baseURL: "http://localhost:5173",
    viewport: { width: 1440, height: 900 },
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    screenshot: "on",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
