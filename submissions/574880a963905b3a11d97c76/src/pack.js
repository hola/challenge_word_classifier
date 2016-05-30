var UglifyJS = require("uglify-js");
var result = UglifyJS.minify("ver_min.js");
var fs = require('fs');
fs.writeFileSync('solution.js', result.code);
