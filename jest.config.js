module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/lib/', '/build/', '/coverage/', '/docs/'],
	"roots": [
		"<rootDir>/src"
	],
	"testMatch": [
		"**/tests/test.*.ts",
	],
	"transform": {
		"^.+\\.(ts|tsx)$": "ts-jest"
  },
  collectCoverageFrom: ['src/**/*'],
}