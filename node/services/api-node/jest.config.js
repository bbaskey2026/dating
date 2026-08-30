module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@topolgira/shared-types$': '<rootDir>/../../packages/shared-types/src/index.ts',
    '^@topolgira/contracts$': '<rootDir>/../../packages/contracts/src/index.ts',
  },
};
