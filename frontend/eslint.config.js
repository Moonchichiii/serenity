import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // Ignore outputs
  { ignores: ['dist', 'node_modules'] },

  // App rules
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true }, // JSX in TSX
      },
      globals: globals.browser,
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      // Let the react plugin detect your version from deps
      react: { version: 'detect' },
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended, // typescript-eslint base
      // If your eslint-plugin-react supports flat configs, these work:
      // react.configs['flat/recommended'],
      // react.configs['flat/jsx-runtime'],
      // For wide compatibility we enable key rules manually below.
    ],
    rules: {
      // React 19 / automatic runtime: no need to import React
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',

      // Hooks & Fast Refresh
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // A11y (keep it mild; adjust to your preference)
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/no-autofocus': 'off',

      // TS niceties
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  }
)
