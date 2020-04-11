module.exports = {
    env: {
        browser: true,
        es6: true
    },
    extends: ["plugin:prettier/recommended"],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
    },
    parser: 'babel-eslint',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
    },
    plugins: ["prettier"],
    rules: {
        'prettier/prettier': 'warn'
    }
}