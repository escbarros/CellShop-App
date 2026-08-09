const NON_ASCII = /[^\x20-\x7E]/;

const languagePlugin = {
  rules: {
    'subject-ascii-only': ({ subject }) => [
      typeof subject !== 'string' || !NON_ASCII.test(subject),
      'subject must be written in english, without accented characters',
    ],
  },
};

module.exports = {
  extends: ['@commitlint/config-conventional'],
  plugins: [languagePlugin],
  rules: {
    'scope-enum': [2, 'always', ['back-end', 'front-end', 'docs']],
    'scope-empty': [0, 'never'],
    'subject-ascii-only': [2, 'always'],
  },
};
