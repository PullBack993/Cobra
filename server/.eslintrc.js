module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  "require-jsdoc": 0,
  extends: "google",
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {},
};
