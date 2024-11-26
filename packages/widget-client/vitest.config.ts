import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom", // Because our widget runs in the browser
    setupFiles: "./tests/setupTests.ts",
  },
});
