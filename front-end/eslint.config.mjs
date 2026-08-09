import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const TOOLING_DIRECTIVE = /^\s*(eslint|ts-expect-error|ts-ignore|ts-nocheck|prettier-ignore|@vite-ignore|v8 ignore|c8 ignore)/;

const commentPolicy = {
  rules: {
    'no-comments': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          forbidden:
            'comments are not allowed: rename the code, name a test after it, or write it down in docs/decisions.md',
        },
      },
      create(context) {
        return {
          Program() {
            for (const comment of context.sourceCode.getAllComments()) {
              if (TOOLING_DIRECTIVE.test(comment.value)) {
                continue;
              }

              context.report({ loc: comment.loc, messageId: 'forbidden' });
            }
          },
        };
      },
    },
  },
};

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist/**', 'coverage/**', '**/*.generated.ts'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  reactHooks.configs.flat['recommended-latest'],
  reactRefresh.configs.vite,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      policy: commentPolicy,
    },
    rules: {
      'policy/no-comments': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { args: 'after-used', argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/require-await': 'error',
      'prettier/prettier': 'error',
    },
  },
);
