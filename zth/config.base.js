/* eslint-disable @typescript-eslint/no-var-requires */
// const webpack = require('webpack');

// let baseConfig = [
//   {
//     test: /\.(png|jpe?g|gif|webp|woff2)?$/,
//     type: 'asset',
//   },
//   {
//     test: /\.svg$/,
//     resourceQuery: /inline/,
//     use: [
//       {
//         loader: 'vue-svg-loader',
//         options: {
//           svgo: {
//             plugins: [{ cleanupIDs: false }],
//           },
//         },
//       },
//     ],
//   },
// ];

// module.exports = baseConfig;

// module: {
//     rules: [
//       // other rules...
//       {
//         test: /\.svg$/,
//         use: ['svg-inline-loader'],
//       },
//     ],
//   },

const path = require('path');

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      // other rules...
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'file-loader',
        options: {
          name: 'img/[name].[hash:8].[ext]',
        },
      },
    ],
  },
};
