import { defineConfig, devices } from "@playwright/test";

// Local: builds nothing — run `npm run build` first, then `npm run test:e2e`.
// Preview/production: BASE_URL=https://… npm run test:e2e  (no local server is started).
const BASE_URL = process.env.BASE_URL;
const PORT = 3210;

export default defineConfig({
  testDir: "tests",
  timeout: 30_000,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL ?? `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  webServer: BASE_URL
    ? undefined
    : {
        command: `npx next start -p ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: true,
        timeout: 60_000,
      },
});
