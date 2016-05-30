'use strict';

const NUM_BITS = 500000;
const WORDS_FILE = './words.txt';
const RESOURCE_FILE = './words.golomb.txt';

const fs = require('fs');
const zopfli = require('node-zopfli');

const fnv1a = require('./fnv1a');
const heuristic = require('./heuristic');
const preprocess = require('./preprocess');

const words = fs.readFileSync(WORDS_FILE, 'utf-8').split('\n');

const words2keep = words
  .map(word => word.toLowerCase())
  .filter(word => heuristic(word))
  .map(preprocess)
  .sort()
  .reduce((acc, word) => {
    if (acc[acc.length - 1] !== word) {
      acc.push(word);
    }
    return acc;
  }, []);

console.log('total %s, keeped %s', words.length, words2keep.length);

let buffer = [];
words2keep.forEach(word => {
  let hash = fnv1a(word) % NUM_BITS;
  let index = Math.floor(hash / 8);
  let offset = hash % 8;

  buffer[index] = (buffer[index] || 0) | (1 << offset);
});

let data = new Buffer(buffer);
let gziped = zopfli.gzipSync(data, {
  numiterations: 15,
  blocksplitting: true,
  blocksplittingmax: 20
});

fs.writeFileSync(RESOURCE_FILE, data);
fs.writeFileSync(RESOURCE_FILE + '.gz', gziped);

console.log(
  'before %s, after: %s',
  humanBytes(data.byteLength),
  humanBytes(gziped.byteLength)
);

function humanBytes(num) {
  return (num / 1024).toFixed(2) + ' KiB';
}
