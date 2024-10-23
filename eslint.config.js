import globals from 'globals';
import pluginJs from '@eslint/js';
import tsEslint from 'typescript-eslint';
import jestPlugin from 'eslint-plugin-jest';

export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: { ...globals.browser, ...globals.jest } } },
  { ignores: ['node_modules', 'dist', 'front'] },
  {
    files: ['tests/**/*'],
    ...jestPlugin.configs['flat/recommended'],
    ...jestPlugin.configs['flat/style'],
  },
  pluginJs.configs.recommended,
  ...tsEslint.configs.recommended,
];
