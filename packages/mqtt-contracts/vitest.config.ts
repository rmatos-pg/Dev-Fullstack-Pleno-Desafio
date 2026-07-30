import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "mqtt-contracts",
    include: ["tests/**/*.test.ts"],
  },
});
