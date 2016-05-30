const words = require('./dictionary.json');
const BloomFilter = require('./bloom-filter');
const fs = require('fs');

function getPolyHashFunction(p, mod) {
  return word => word.split('').reduce((hash, s) => (hash * p + s.charCodeAt(0)) % mod, 0);
}

const buffer = Buffer.alloc(50000);
//const hashes = [[31, 1e9 + 7], [61, 1e9 + 9]].map(args => getPolyHashFunction.apply(null, args));
const hashes = [[31, 1e9 + 7]].map(args => getPolyHashFunction.apply(null, args));

const bloomFilter = new BloomFilter(buffer, hashes);

words.map(word => word.toLowerCase()).forEach(word => bloomFilter.add(word));

const out = fs.createWriteStream('bloom-filter.buf');
out.write(bloomFilter.getBuffer());
