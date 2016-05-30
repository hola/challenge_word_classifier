const UglifyJS = require("uglify-js");
const BloomFilter = require("./bloom");
const test = require("./test");
const fs = require('fs');

const result = UglifyJS.minify('solution.js', {
  mangle: true,
  compress: {
    sequences: true,
    dead_code: true,
    conditionals: true,
    booleans: true,
    unused: true,
    if_return: true,
    // join_consts: true,
    drop_console: false,
  }
});

const maxSize = 64 * 1024;
const _SIZE_ = (maxSize - result.code.length) * 8;
console.log('Bloom bits:', _SIZE_);
const solution = require("./solution.js");

const code = result.code.replace('_SIZE_', _SIZE_);
fs.writeFileSync('solution.min.js', code);


const b = new BloomFilter(_SIZE_, solution.k);
const words = fs.readFileSync('./words.txt', 'utf8').split('\n').map(w => w.replace(/'s$/, ''));
const uniqWords = new Set(words);
const unpassingWords = Array.from(uniqWords).filter(w => solution.test(w) == false);

console.log('total words:', words.length);
console.log('uniq words:', uniqWords.size, uniqWords.size/words.length*100 + '%');
console.log('unpassingWords words:', unpassingWords.length, unpassingWords.length/words.length*100 + '%');

unpassingWords.forEach(w => b.add(w));

console.log('--');

const fakeWords = fs.readFileSync('./words-false.txt', 'utf8').split('\n');
const falsePositives = fakeWords.reduce((errors, w) => {
  if (b.has(w)) { return errors + 1; }
  return errors;
}, 0);
console.log('falsePositives:', falsePositives, falsePositives / fakeWords.length * 100 + '%');

const wstream = fs.createWriteStream('serialize');
wstream.write(b.buffer);
wstream.end(() => {

  const totalSize = fs.statSync('solution.min.js').size + fs.statSync('serialize').size;

  if (totalSize <= maxSize) {
    console.log('ok, total size:', totalSize, maxSize - totalSize, 'b. available');
  } else {
    console.log(`ERROR, SIZE  ${totalSize} beyond limit. Excess: ${totalSize - maxSize} b.`);
  }


  test();
});

