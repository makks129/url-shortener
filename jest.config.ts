import type { Config } from 'jest';

const config: Config = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['**/test/**/*.test.ts'],
	collectCoverageFrom: ['src/**/*.ts', '!src/index.ts'],
	coverageDirectory: 'coverage',
	testPathIgnorePatterns: ['/node_modules/', '/dist/'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
	},
	maxWorkers: 1, // run tests sequentially
};

export default config;
