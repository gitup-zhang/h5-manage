/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  env: {
    browser: true,
    es2023: true,
    node: true,
  },
  extends: [
    'plugin:vue/vue3-strongly-recommended',
    '@vue/eslint-config-typescript',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/max-attributes-per-line': ['warn', { singleline: 3, multiline: 1 }],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'prettier/prettier': ['warn', {}, { usePrettierrc: true }],
  },
}
