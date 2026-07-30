import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "oee-service",
    include: ["tests/**/*.test.ts"],
  },
});
