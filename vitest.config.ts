import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    // Plan 005's tests are pure logic (normalisers, URL classifiers).
    // No jsdom — nothing here touches the DOM.
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
