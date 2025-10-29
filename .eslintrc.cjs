/* eslint-env node */
module.exports = {
    root: true,
    env: { browser: true, es2022: true, node: true },
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
    },
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:vue/vue3-recommended', 'prettier'],
    plugins: ['@typescript-eslint', 'vue'],
    rules: {
        'vue/html-self-closing': ['warn', { html: { void: 'any' } }],
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
    overrides: [
        {
            // Отключаем требование многосоставных имен для компонентов в папках pages
            files: ['**/pages/**/*.vue'],
            rules: {
                'vue/multi-word-component-names': 'off',
            },
        },
    ],
    ignorePatterns: ['dist', 'node_modules', '*.d.ts'],
};
