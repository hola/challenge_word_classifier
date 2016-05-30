var fs = require('fs');

// Pako.js is a bit hacked to produce smaller gzip on our data
var pako = require('pako');

var bigrams = fs.readFileSync('2grams.bin');
var bloom = fs.readFileSync('bloom.bin');
var code = fs.readFileSync('solution.body.min.js');

var concat = Buffer.concat([code, bigrams, bloom]);
var gzip = pako.gzip(concat, {
  level: 9,
  chunkSize: 131072,
  memLevel: 9,
  strategy: 1
});

fs.writeFileSync('data.bin', concat);
fs.writeFileSync('data.gz', new Buffer(gzip));

console.log('Code length:     ' + code.length);
console.log('Bigrams length:  ' + bigrams.length);
console.log('Bloom length:    ' + bloom.length);
console.log('Total data:      ' + (code.length + bigrams.length + bloom.length) + ' => ' + gzip.length);
console.log('');

var solution = `exports.init=(B,O)=>eval(B.toString('utf8',0,O=${code.length}))`;
fs.writeFileSync('solution.js', solution);

console.log('solution.js:     ' + solution.length);
console.log('Total:           ' + (gzip.length + solution.length));
console.log('');
console.log('Done!');
