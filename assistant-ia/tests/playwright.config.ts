import { defineConfig, devices } from "@playwright/test"

// ASSISTANT_API = service Python (defaut 8100). STOREFRONT = widget (defaut 8000).
export default defineConfig({
  testDir: ".",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.STOREFRONT || "http://localhost:8000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
})
