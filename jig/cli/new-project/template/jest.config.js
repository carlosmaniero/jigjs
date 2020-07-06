module.exports = {
  preset: 'ts-jest',
  setupFilesAfterEnv: ['./jest-setup.ts'],
  testEnvironment: 'jest-environment-jsdom-sixteen',
};
