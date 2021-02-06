module.exports = {
  presets: [
    [
      "@babel/env",
      {
        targets: {
          node: 4,
        },
      },
    ],
    "@babel/typescript",
  ],
  plugins: [
    "@babel/transform-runtime",
    "@babel/proposal-class-properties",
    "@babel/proposal-object-rest-spread",
  ],
};
