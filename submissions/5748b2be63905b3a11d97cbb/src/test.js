/*
  Тестирует решение.
*/

const fs = require('fs');
const zlib = require('zlib');
const solution = require('./build/solution');

let n = +process.argv[2];

if (n)
  console.info(`Test random sample with ${n} per group`);

let trueData = fs.readFileSync('assets/true.txt', 'utf8').trim().split('\n');
let falseData = fs.readFileSync('assets/false.txt', 'utf8').trim().split('\n')

if (n) {
  trueData = trueData.sort(_ => Math.random() > .5).slice(0, n);
  falseData = falseData.sort(_ => Math.random() > .5).slice(0, n);
}

let data = new Map;

for (let word of trueData)
  data.set(word, true);

for (let word of falseData)
  data.set(word, false);

solution.init(zlib.gunzipSync(fs.readFileSync('./build/data.gz')));

let t = 0;
let tp = 0;
let fp = 0;
let fpWords = [];

for (let [word, klass] of data.entries()) {
  let predict = solution.test(word);
  let res = klass === predict;
  t += res;

  if (klass)
    tp += res;
  else {
    fp += !res;
    if (!res)
      fpWords.push(word);
  }
}

let acc = t / data.size;
let tpr = tp / trueData.length;
let fpr = fp / falseData.length;

let _ = v => Math.round(v * 1000) / 10;

console.info(`Acc: ${_(acc)}% (${t}/${data.size})`);
console.info(`tpr: ${_(tpr)}% (${tp}/${trueData.length})`);
console.info(`fpr: ${_(fpr)}% (${fp}/${falseData.length})`);

fs.writeFileSync('out.fp.txt', fpWords.join('\n'));
