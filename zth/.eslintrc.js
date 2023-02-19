const _require = require('esm')(module);
module.exports = _require('./.eslintrc.esm.js').default;

module.exports = {
  root: true,
  env: {
    browser: true,
  },
  extends: [
    'plugin:vue/vue3-strongly-recommended',
    '@vue/airbnb',
    'prettier',
    '@vue/typescript',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  ecmaFeatures: {
    jsx: false,
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.json', '.vue'],
      },
      alias: {
        map: [['@', './src']],
        extensions: ['.ts', '.js', '.vue', '.jsx'],
      },
    },
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
    indent: ['error', 2],
    'vuejs-accessibility/click-events-have-key-events': 'off',
    'vuejs-accessibility/label-has-for': 'off',
    'comma-spacing': ['error', { before: false, after: true }],
    'import/prefer-default-export': 'off',
  },
  globals: {
    $: true,
    Vue: true,
    moment: true,
    DocumentTouch: true,
  },
};
