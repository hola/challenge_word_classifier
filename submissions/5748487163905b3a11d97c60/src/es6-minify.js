/**
 * Simplistic ES6 minifier
 * https://github.com/ariya/es6-minify
 */
module.exports = (filePath) => {
  var fs = require('fs');
  var parser = require('shift-parser');
  var codegen = require('shift-codegen').default;

  var source = fs.readFileSync(filePath, 'utf-8');
  var ast = parser.parseScript(source);
  
  return codegen(ast);
};
