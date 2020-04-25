module.exports = {
    roots: [
        "<rootDir>/components",
        "<rootDir>/pages",
        "<rootDir>/services",
    ],
    preset: "ts-jest",
    transform: {
        "^.+\\.tsx?$": "ts-jest"
    },
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ],
    globals: {
        "ts-jest": {
            tsConfig: "<rootDir>/tsconfig.spec.json"
        }
    },
    testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
    testEnvironment: 'jest-environment-jsdom-sixteen',
};
