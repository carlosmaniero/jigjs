module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module"
    },
    extends: [
        "plugin:@typescript-eslint/recommended",
        "eslint:recommended",
        "google"
    ],
    rules: {
        "@typescript-eslint/ban-types": 0,
        "max-len": "off",
        "no-undef": "off",
        "require-jsdoc": "off",
        "no-prototype-builtins": "off"
    },
    ignorePatterns: ["**/*.js"]
};
