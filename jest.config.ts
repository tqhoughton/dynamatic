import type {Config} from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "src/*.ts"
  ],
  coveragePathIgnorePatterns: [
    "src/index.ts"
  ]
};

export default config;
