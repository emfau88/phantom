import eslint from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'legacy', 'docs/qa', '.edge-*'] },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        URL: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        innerWidth: 'readonly',
        innerHeight: 'readonly',
        devicePixelRatio: 'readonly',
        HTMLCanvasElement: 'readonly',
        performance: 'readonly',
        requestAnimationFrame: 'readonly',
        process: 'readonly',
        window: 'readonly',
      },
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
