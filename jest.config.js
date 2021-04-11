module.exports = {
  testEnvironment: 'node',
  rootDir: './src',
  testMatch: ['**/test.*.ts'],
  transform: {
	"^.+\\.(ts|tsx)$": "ts-jest"
  },
  collectCoverageFrom: ['src/**/*'],
}