/* eslint-disable linebreak-style */
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const config = {
  mode: process.argv.includes('--production') ? 'production' : 'development',
  entry: {
    'immediate-loading': './src/assets/scripts/immediate-loading.js',
    index: './src/assets/scripts/index-app.js',
    home: './src/assets/scripts/home.js',
    'single-construction': './src/assets/scripts/single-construction.js',
    'single-flat': './src/assets/scripts/single-flat.js',
    plannings: './src/assets/scripts/plannings.js',
  },
  output: {
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(?:js|mjs|cjs)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            targets: 'defaults',
            presets: [
              ['@babel/preset-env']
            ]
          }
        }
      }
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks(chunk) {
            // exclude `my-excluded-chunk`
            return chunk.name !== 'immediate-loading';
          },
        },
      },
    },
  },
  plugins: [
    // new UglifyJSPlugin({
    //   sourceMap: true,
    //   uglifyOptions: {
    //     compress: {
    //       drop_console: process.argv.includes('--production'),
    //     },
    //   },
    // }),
  ],
};

module.exports = config;
