/*
  Собирает решение в build/*
*/

'use strict';

const fs = require('fs');
const zlib = require('zlib');

// Load sources.
const sources = {
  bloom: fs.readFileSync('src/bloom.js', 'utf8'),
  stemmer: fs.readFileSync('src/stemmer.js', 'utf8'),
  test: fs.readFileSync('src/test.js', 'utf8'),
  solution: fs.readFileSync('src/index.js', 'utf8')
}

let sourceLength = sources.bloom.length + sources.stemmer.length + sources.test.length;
sources.solution = sources.solution.replace(/__SEP__/g, sourceLength);

let totalSizeLimit = 65536;
let dataLength = totalSizeLimit - sources.solution.length;

console.info(`Init size: ${sources.solution.length}B`);
console.info(`Unminified sources size: ${sourceLength}B`);

// Import dynamic modules.
const getStem = new Function(`${sources.stemmer} return getStem`)();
const BloomFilter = new Function(`${sources.bloom} return BloomFilter`)();
const like = new Function(`${sources.test} return like`)();
const strip = new Function(`${sources.test} return strip`)();

// Build a stem set.
let words = fs.readFileSync('assets/true.txt', 'utf8').trim().split('\n');
let stems = new Set;

for (let word of words) {
  let stem = getStem(word.replace(/'s$/, ''));

  if (like(word, stem))
    stems.add(strip(stem));
}

console.info(`Stem count: ${stems.size}`);

// Find the best size of bloom filter.
let sourceBuffer = Buffer.from(sources.bloom + sources.stemmer + sources.test);
console.info(`Sources size: ${sourceBuffer.length}B`);

function generateBloom(m) {
  m -= m % 32;
  let buckets = new Int32Array(m / 32);
  let filter = new BloomFilter(buckets);

  for (let stem of stems)
    filter.add(stem);

  return Buffer.from(buckets.buffer);
}

console.info('Determination of bloom size:');
console.info('  ' + '-'.repeat(28));
let size = totalSizeLimit - sourceLength;
let dataBuffer;

for (let step = sourceLength/2|0; step >= 1; step = step/2|0) {
  while (true) {
    let bloomBuffer = generateBloom(size * 8);
    let input = Buffer.concat([sourceBuffer, bloomBuffer]);
    let newDataBuffer = zlib.gzipSync(input, {level: zlib.Z_BEST_COMPRESSION});

    if (newDataBuffer.length > dataLength) {
      size -= Math.ceil(step/2);
      break;
    }

    let totalLength = newDataBuffer.length + sources.solution.length;
    console.info(`  Bloom: ${bloomBuffer.length}B, total: ${totalLength}B`);
    dataBuffer = newDataBuffer;
    size += step;
  }
}

console.info('  ' + '-'.repeat(28));
console.info(`Total size: ${dataBuffer.length + sources.solution.length}B`)

// Save to files.
try { fs.mkdirSync('build'); } catch (_) {}
fs.writeFileSync('build/data.gz', dataBuffer);
fs.writeFileSync('build/solution.js', sources.solution);
fs.writeFileSync('out.stems.txt', [...stems].join('\n'))
