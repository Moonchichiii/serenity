import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  timeout: 30_000,
  expect: {
    timeout: 7_000,
  },

  reporter: process.env.CI
    ? [["list"], ["html"], ["github"]]
    : [["list"], ["html"]],

  use: {
    baseURL: BASE_URL,
    headless: true,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    viewport: { width: 1440, height: 900 },
  },

  webServer: {
    command: "bun run preview -- --host 127.0.0.1 --port 4173",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },

  outputDir: "test-results",

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
