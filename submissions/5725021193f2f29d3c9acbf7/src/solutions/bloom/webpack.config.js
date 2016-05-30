'use strict';

module.exports = {
  target: 'node',
  entry: './solution.js',
  output: {
    path: __dirname,
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  }
};
