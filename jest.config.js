import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/test-utils$': '<rootDir>/src/app/shared/test-utils',
    '^@shared/test-utils/(.*)$': '<rootDir>/src/app/shared/test-utils/$1',
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['@swc/jest'],
  },
};

export default createJestConfig(customJestConfig); 