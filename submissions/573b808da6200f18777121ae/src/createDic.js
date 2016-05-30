import {readFile, writeFile} from 'fs';

let getWords = new Promise((resolve, reject) => {
  readFile('./words.txt', (err, data) => {
    resolve(data.toString().split('\n'));
  });
});

function splitIntoPairs(word) {
  let x = word.split('');
  let a = [];
  for (var i = 0; i < x.length - 1; i++) {
    a.push((x[i] + x[i+1]).toLowerCase());
  }
  return a;
}

function countPairs(array) {
  return array.reduce((h, i) => {
    h[i] ? h[i] = h[i] + 1 : h[i] = 1;
    return h;
  }, {});
}

function createDictionary(words) {
  let a = [];
  words.forEach(word => a.push(...splitIntoPairs(word)));
  writeFile('dictionary.js', JSON.stringify(countPairs(a)), () => console.log('done'));
}

getWords.then(words => createDictionary(words));
