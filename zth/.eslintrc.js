module.exports = {
  root: true,
  env: {
    browser: true,
  },
  extends: [
    'plugin:vue/vue3-strongly-recommended',
    'plugin:@typescript-eslint/recommended',
    '@vue/airbnb',
    'prettier',
    '@vue/typescript',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: '@typescript-eslint/parser',
  },
  ecmaFeatures: {
    jsx: false,
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.json', '.vue'],
        moduleDirectory: ['.', 'node_modules'],
      },
      alias: {
        map: [['@', './src']],
        extensions: ['.ts', '.js', '.vue'],
      },
    },
  },
  rules: {
    // 'vue/block-lang': 'error',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
    indent: ['error', 2, { SwitchCase: 1 }],
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'vue/block-lang': [
      'error',
      {
        script: {
          lang: ['ts', 'js'],
        },
        style: {
          lang: 'scss',
        },
      },
    ],

    'comma-spacing': ['error', { before: false, after: true }],
    'prefer-const': ['error', { destructuring: 'all' }],
    'vuejs-accessibility/click-events-have-key-events': 'off',
    'vuejs-accessibility/label-has-for': 'off',
    'import/prefer-default-export': 'off',
    'no-plusplus': 'off',
    'no-const-assign': 1,
    eqeqeq: 1,
  },
  globals: {
    $: true,
    Vue: true,
    moment: true,
    DocumentTouch: true,
  },
};
