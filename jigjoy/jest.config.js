module.exports = {
    preset: 'ts-jest',
    testEnvironment: "node",
    setupFilesAfterEnv: ['./src/testing/setup.jest.ts']
};
