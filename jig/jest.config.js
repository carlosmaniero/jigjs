module.exports = {
    preset: 'ts-jest',
    testEnvironment: "node",
    setupFilesAfterEnv: ['./testing/setup.jest.ts'],
    "testPathIgnorePatterns": [
        "<rootDir>/cli"
    ],
    collectCoverageFrom: [
        "**/*.ts",
        "!<rootDir>/cli/**/*",
        "!<rootDir>/framework/patform/*", // Typo to deprecate
        "!<rootDir>/deprecation.ts", // Just a bunch of deprecation warnings (not tested when it is a module change)
        "!<rootDir>/framework/server/server.ts" // There is no intention to start the real express application, otherwise its configuration is well tested.
    ],
    globals: {
        'ts-jest': {
            tsconfig: './tsconfig.json'
        }
    }
};
