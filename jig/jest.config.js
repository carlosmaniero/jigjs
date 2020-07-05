module.exports = {
    preset: 'ts-jest',
    testEnvironment: "node",
    setupFilesAfterEnv: ['./testing/setup.jest.ts'],
    globals: {
        'ts-jest': {
            tsconfig: './tsconfig.json'
        }
    }
};
