import { defineConfig, devices } from "@playwright/test";

// Runs against the built site (npm run build first), served the way GitHub
// Pages serves it: under /degrees-of-freedom/.
const port = 4329;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 1 : 0,
  reporter: process.env["CI"] ? "github" : "list",
  use: {
    baseURL: `http://localhost:${port}/degrees-of-freedom/`,
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: `node tests/e2e/serve.mjs`,
    env: { PORT: String(port) },
    url: `http://localhost:${port}/degrees-of-freedom/en/`,
    reuseExistingServer: !process.env["CI"],
  },
});
