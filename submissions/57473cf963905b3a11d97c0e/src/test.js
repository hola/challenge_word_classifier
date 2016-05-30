'use strict';

const fs   = require('fs');
const zlib = require('zlib');

const solution = require('./solution');

const testWords       = require('./__/test-words');
const testWordsLength = Object.keys(testWords).length;

let data = fs.readFileSync('./words_stat_1464285255930.json.gz');
    data = zlib.gunzipSync(data);

let score = 0;

solution.init(data);

for (let i = 0, keys = Object.keys(testWords); i < testWordsLength; i++) 
  if (solution.test(keys[i]) === testWords[keys[i]]) 
    score++;

console.log(
  'Result: ', 
  (score*100/testWordsLength).toFixed(3) + '%'
);