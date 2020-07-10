module.exports = {
  preset: 'ts-jest',
  setupFilesAfterEnv: ['./testing/setup.jest.ts'],
  testEnvironment: 'jest-environment-jsdom-sixteen',
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json'
    }
  }
};
