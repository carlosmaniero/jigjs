module.exports = {
    preset: 'ts-jest',
    testEnvironment: "node",
    setupFilesAfterEnv: ['./testing/setup.jest.ts'],
    "testPathIgnorePatterns": [
        "<rootDir>/cli"
    ],
    globals: {
        'ts-jest': {
            tsconfig: './tsconfig.json'
        }
    }
};
