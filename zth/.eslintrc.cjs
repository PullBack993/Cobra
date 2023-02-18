module.exports = {
  root: true,

  env: {
    browser: true,
    es2021: true,
    node: true,
  },

  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'standard-with-typescript',
    'prettier',
  ],

  overrides: [],

  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },

  plugins: ['vue'],

  rules: {
    // semi: ['error', 'always'],
    // quotes: ['error', 'single'],
    // indent: ['error', 2],
    // 'comma-spacing': ['error', { before: false, after: true }],

    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  },
};

// module.exports = {
// 	extends: [
// 		'airbnb-base',
// 		'plugin:@typescript-eslint/recommended',
// 		'plugin:vue/recommended',
// 		'@vue/typescript',
// 		'plugin:storybook/recommended',
// 	],
// 	parser: 'vue-eslint-parser',
// 	plugins: ['@typescript-eslint'],
// 	rules: {
// 		'no-undef': 'off',
// 		'no-unused-vars': 'off',
// 		'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
// 		'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
// 		'class-methods-use-this': 'off',
// 		strict: 0,
// 		'require-jsdoc': 2,
// 		'no-tabs': 0,
// 		'no-new': 0,
// 		'max-len': 0,
// 		'space-before-function-paren': [2, 'never'],
// 		'prefer-arrow-callback': 0,
// 		'func-names': [1, 'never'],
// 		'one-var': 0,
// 		'no-var': 0,
// 		'no-redeclare': ['warn'],
// 		'no-plusplus': 0,
// 		'prefer-template': 0,
// 		'no-multi-str': 0,
// 		'no-underscore-dangle': 'off',
// 		'prefer-destructuring': 0,
// 		'import/prefer-default-export': 0,
// 		indent: 0,
// 		'vue/html-indent': ['error', 'tab', {}],
// 		'@typescript-eslint/indent': ['error', 'tab', {}],
// 		'comma-dangle': ['error', {
// 			arrays: 'always-multiline',
// 			objects: 'ignore',
// 			imports: 'always-multiline',
// 			exports: 'always-multiline',
// 			functions: 'ignore'
// 		}],
// 		'import/no-extraneous-dependencies': ['error', {
// 			devDependencies: true,
// 			packageDir: './'
// 		}],
// 		'import/extensions': ['error', 'ignorePackages', {
// 			js: 'never',
// 			ts: 'never',
// 		}],
// 		'no-shadow': 'off',
// 		'@typescript-eslint/no-shadow': ['error'],
// 	},
// 	parserOptions: {
// 		 		ecmaVersion: 2020,
// 		parser: '@typescript-eslint/parser',
// 		sourceType: 'module',
// 		ecmaFeatures: {
// 			impliedStrict: false
// 		}
// 	},
// 	settings: {
// 		'import/resolver': {
// 			node: {
// 				extensions: ['.js', '.ts', '.json', '.vue']
// 			},
// 			webpack: {
// 				config: 'webpack/config.base.js'
// 			}
// 		},
// 	},
// 	globals: {
// 		$: true,
// 		Vue: true,
// 		moment: true,
// 		DocumentTouch: true
// 	},
// 	env: {
// 		browser: true
// 	}
// };
