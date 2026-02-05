module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^react-native$': '<rootDir>/__mocks__/react-native.js',
  },
  collectCoverageFrom: [
    'utils/**/*.ts',
    'services/**/*.ts',
    '!**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  setupFilesAfterEnv: [],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo)/)',
  ],
};
