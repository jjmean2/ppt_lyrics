module.exports = {
  root: true,
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  env: {
    node: true,
  },
  overrides: [
    {
      files: ["**/*.ts"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
      },
      plugins: ["@typescript-eslint"],
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
      ],
    },
  ],
};
