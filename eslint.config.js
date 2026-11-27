import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '.tmp/**',
      'coverage/**',
      'examples/source/**',
      'evals/runs/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.mjs'],
    languageOptions: { globals: { URL: 'readonly', console: 'readonly', process: 'readonly' } },
  },
  {
    files: [
      'examples/inventory-workbench/app.mjs',
      'examples/inventory-workbench/prototype.mjs',
      'examples/inventory-workbench/tools/check.mjs',
      'examples/effects-lab/app.mjs',
      'examples/effects-lab/tools/check.mjs',
      'examples/design-gallery/app.mjs',
      'examples/design-gallery/tools/check.mjs',
      'examples/composition-studies/*.mjs',
      'examples/composition-studies/tools/check.mjs',
      'examples/composition-library/app.mjs',
      'examples/composition-library/check.mjs',
      'examples/composition-library/fonts/browser-check.mjs',
    ],
    languageOptions: {
      globals: {
        document: 'readonly',
        window: 'readonly',
        fetch: 'readonly',
        FontFace: 'readonly',
        Option: 'readonly',
        getComputedStyle: 'readonly',
        DOMParser: 'readonly',
        URLSearchParams: 'readonly',
        innerWidth: 'readonly',
        innerHeight: 'readonly',
        scrollY: 'readonly',
        scrollTo: 'readonly',
      },
    },
  },
  { files: ['**/*.ts'], rules: { '@typescript-eslint/no-explicit-any': 'error' } },
);
