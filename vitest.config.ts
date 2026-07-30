import { defineConfig } from "vitest/config";
import { coverageThresholds } from "./vitest.shared";

export default defineConfig({
  test: {
    projects: [
      "packages/mqtt-contracts/vitest.config.ts",
      "services/oee-service/vitest.config.ts",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage",
      include: [
        "packages/mqtt-contracts/src/**/*.ts",
        "services/oee-service/src/**/*.ts",
      ],
      exclude: [
        "**/*.test.ts",
        "**/vitest.*.ts",
        "**/vitest.config.ts",
      ],
      thresholds: coverageThresholds,
    },
  },
});
