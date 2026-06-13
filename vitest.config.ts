import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit/integration tests for the AI + data helpers. Node environment — these
// exercise pure logic and route helpers with mocked providers, not the DOM.
// The "@/" alias mirrors tsconfig.json's paths so imports match app code.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "app/**/*.test.ts", "tests/**/*.test.ts"],
  },
});
