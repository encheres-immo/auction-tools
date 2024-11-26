import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom", // Because our widget runs in the browser
    coverage: {
      provider: "v8",
    },
    setupFiles: "./tests/setupTests.ts",
  },
});
