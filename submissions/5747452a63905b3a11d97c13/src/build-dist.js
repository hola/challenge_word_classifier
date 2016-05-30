'use strict';

const fs = require('fs');
const uglify = require('uglify-js');

console.log('building js module...');

let modText = fs.readFileSync('./module.js', 'utf-8');

modText = modText.replace(/let\s+(\w+)\s*=\s*require\('(.*)'\);/g, function(match) {
    match = /let\s+(\w+)\s*=\s*require\('(.*)'\);/.exec(match);
    let varName = match[1];
    let fileName = match[2];
    let contents = fs.readFileSync(fileName + '.js', 'utf-8');
    contents = contents.replace(/module\.exports\s*=/, 'return ');
    contents = 'let ' + varName + ' = (()=>{\n' + contents + '\n})()';
    return contents;
});

try {
    modText = uglify.minify(modText, {
        fromString: true,
        enclose: true,
        mangle: {},
        mangleProperties: {regex: /simplify|heuristics|hash|contains|data|alphabet|skipFirst/},
        compress: {},
        output: {ascii_only: true, screw_ie8: true}
    }).code;
} catch (ex) {
    console.error('uglify error', ex);
    throw ex.msg || 'uglify error';
}

if (!fs.existsSync('out')) {
    fs.mkdirSync('out');
}

let bytes = Buffer.from(modText, 'utf-8');
fs.writeFileSync('./out/solution.js', bytes);

console.log('built js module: %d bytes', bytes.byteLength);
