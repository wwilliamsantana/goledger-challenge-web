import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "node",
  globals: {
    "ts-jest": {
      tsconfig: "./tsconfig.test.json",
    },
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFiles: ["<rootDir>/jest.setup.ts"],
  testMatch: ["<rootDir>/src/__tests__/**/*.test.ts"],
  collectCoverageFrom: [
    "src/lib/**/*.ts",
    "src/app/api/**/*.ts",
    "!src/**/*.d.ts",
  ],
};

export default createJestConfig(config);
