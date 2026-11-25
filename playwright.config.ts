import { defineConfig, devices } from "@playwright/test";

// End-to-end tests: a real browser (phone-sized) against the app + local Firebase emulators.
// Run with: npm run test:e2e
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:3000", trace: "off" },
  projects: [{ name: "phone", use: { ...devices["Pixel 7"] } }],
  webServer: {
    command: "node --env-file=.env.emulator node_modules/next/dist/bin/next start -p 3000",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
