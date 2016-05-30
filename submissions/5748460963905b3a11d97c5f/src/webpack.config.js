'use strict';

var webpack = require('webpack');

module.exports = {

  entry: './application/solution.js',

  output: {
    path: './build',
    filename: 'solution.js',
    libraryTarget: 'commonjs2'
  },

  module: {
    loaders: [
      {
        test: /\.js?$/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      }
    ]
  },

  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },

      output: {
        comments: false
      }
    })
  ]
};
