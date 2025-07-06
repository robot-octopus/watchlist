import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import prettier from 'eslint-config-prettier';

export default [
  // Base JavaScript config (excluding Svelte files)
  {
    ...js.configs.recommended,
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    ignores: ['**/*.svelte'],
  },
  // TypeScript files
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    plugins: {
      '@typescript-eslint': ts,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
      globals: {
        console: 'readonly',
        fetch: 'readonly',
        process: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        localStorage: 'readonly',
        window: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-inner-declarations': 'off',
    },
  },
  // Svelte files
  {
    files: ['**/*.svelte'],
    plugins: {
      svelte,
      '@typescript-eslint': ts,
    },
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: {
          ts: tsParser,
          typescript: tsParser,
        },
        project: './tsconfig.json',
        extraFileExtensions: ['.svelte'],
        sourceType: 'module',
        ecmaVersion: 2020,
      },
      globals: {
        console: 'readonly',
        fetch: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        ResizeObserver: 'readonly',
      },
    },
    rules: {
      ...svelte.configs.recommended.rules,
      // Allow TypeScript features in Svelte files
      'no-inner-declarations': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      // Disable JS-specific rules that conflict with TS
      'no-redeclare': 'off',
      'no-use-before-define': 'off',
    },
  },
  // Config files
  {
    files: ['*.config.{js,ts}', 'tests/**/*.ts'],
    languageOptions: {
      globals: {
        process: 'readonly',
        localStorage: 'readonly',
        window: 'readonly',
      },
    },
  },
  prettier,
  // Ignore patterns
  {
    ignores: [
      'build/',
      '.svelte-kit/',
      'dist/',
      'node_modules/',
      'playwright-report/',
      'test-results/',
      '.env*',
      'pnpm-lock.yaml',
      'package-lock.json',
      'yarn.lock',
      'playwright.config.ts',
      'vitest.config.ts',
      'vite.config.ts',
      'svelte.config.js',
      'tailwind.config.js',
      'postcss.config.js',
      '*.config.js',
      '*.config.ts',
      '**/*.min.js',
      '**/*.bundle.js',
      '**/*.d.ts',
      '**/*.js.map',
      '**/*.css.map',
      '**/*-snapshots/',
      '**/coverage/',
      '**/*.tsbuildinfo',
    ],
  },
];
