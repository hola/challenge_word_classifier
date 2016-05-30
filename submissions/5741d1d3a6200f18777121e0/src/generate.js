const fs = require('fs')
const zlib = require('zlib')
const uniq = require('uniq')

const BloomFilter = require('./bloomfilter')
const LancasterStemmer = require('./lancasterstemmer')

const data = fs.readFileSync('./input', 'utf8')

const words = uniq(data.split('\n')
  .map((word) => word.toLowerCase())
  .map(x => LancasterStemmer.stem(x)))

const bits = process.argv[2] || 3;
const hashes = process.argv[3] || 9;
const bloom = new BloomFilter(
  bits * words.length,
  hashes
);

words.forEach((word) => bloom.add(word));

fs.writeFileSync('./data.gz', zlib.gzipSync(bloom.serialize(), { level: 9 }))

let size = fs.statSync('./data.gz').size + fs.statSync('./solution.js').size

console.log({
  words: words.length,
  bits: bits,
  hashes: hashes,
  size: `${size} bytes (${(size / 1024).toFixed(2)}KiB)`
})
