import { defineConfig } from "vitest/config";
import path from "node:path";

// Tests that run against the local Firebase emulators: npm run test:rules
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src"), "server-only": path.resolve(__dirname, "tests/server-only-stub.ts") } },
  test: {
    include: ["tests/rules/**/*.test.ts"],
    environment: "node",
    testTimeout: 20000,
    hookTimeout: 30000,
    fileParallelism: false,
    // Load Firebase once (not twice as CommonJS + ES modules), so test helpers and app code share it.
    server: { deps: { inline: [/@firebase\/rules-unit-testing/] } },
  },
});
