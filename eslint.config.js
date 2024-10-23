import globals from 'globals';
import pluginJs from '@eslint/js';
import tsEslint from 'typescript-eslint';

export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.browser } },
  { ignores: ['node_modules', 'dist', 'front'] },
  pluginJs.configs.recommended,
  ...tsEslint.configs.recommended,
];
