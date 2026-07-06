module.exports = {
  root: true,
  env: { node: true, es2021: true, jest: true },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parserOptions: { ecmaVersion: 2021, sourceType: 'module' },
  ignorePatterns: ['dist', 'node_modules', '.eslintrc.cjs', 'jest.config.cjs'],
};
