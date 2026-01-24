module.exports = {
  collectCoverageFrom: ['**/*.{ts,tsx}', '!**/node_modules/**', '!**/*.d.ts'],
  moduleFileExtensions: ['js', 'ts', 'tsx'],
  rootDir: '.',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  modulePathIgnorePatterns: ['<rootDir>/lib/'],
  testRegex: 'spec\\.(ts|tsx)$',
};
