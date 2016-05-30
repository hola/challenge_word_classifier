'use strict';

const fs = require('fs');
const zlib = require('zlib');
const main = require('./bundle.js');
const dictionary = fs.readFileSync('./words.golomb.txt.gz');

const MAX_LOOP = 100;
const MAX_SAMPLE = 5000;

if (main.init) {
  main.init(zlib.gunzipSync(dictionary));
}

let sc = [];
let fp = [];
let fn = [];

for (let i = 0; i < MAX_LOOP; i++) {
  const num = i;
  const name = '../hola-beta/samples/test' + zerofill(num, 6) + '.json';
  const sample = require(name);

  Object.keys(sample).forEach(key => {
    const result = main.test(key);
    const expected = sample[key];

    if (result === expected) sc.push(key);
    if (result && !expected) fp.push(key);
    if (!result && expected) fn.push(key);
  });
}

const total = sc.length + fp.length + fn.length;
const ratio = (sc.length / total * 100).toFixed(2);

// fn.map(w => console.log(w));

console.log('%s/%s %s%% fp=%s fn=%s', sc.length, total, ratio, fp.length, fn.length);

function zerofill(num, count) {
  let limit = (count - String(num).length);
  for (let i = 0; i < limit; i++) {
    num = '0' + num;
  }

  return num;
}
