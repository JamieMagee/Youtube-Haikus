const path = require('path');
const GasWebpackPlugin = require('gas-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/main.ts',
  cache: true,
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'Code.gs',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: 'pre',
        loader: 'eslint-loader',
        options: {
          fix: true,
          failOnError: true,
          failOnWarning: true,
        },
      },
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/appsscript.json',
          to: 'appsscript.json',
        },
      ],
    }),
    new GasWebpackPlugin(),
  ],
};
