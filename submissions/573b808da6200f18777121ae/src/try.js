import DICTIONARY from "./dictionary.js";
import fetch from 'node-fetch';

function splitIntoPairs(word) {
  let x = word.split('');
  let a = [];
  for (let i = 0; i < x.length - 1; i++) {
    a.push((x[i] + x[i+1]).toLowerCase());
  }
  return a;
};

function countCost(word) {
  return splitIntoPairs(word).reduce((cost, pair) => cost += DICTIONARY[pair], 0);
};

let results = [];
let i = 0;

function countCorrect(test) {
  let counter = 0;

  Object.keys(test).forEach(word => {
    let c = countCost(word);
    if(c > 100000 && c < 500000) {
      test[word] ? counter++ : null
    } else {
      !test[word] ? counter++ : null
    }
  });
  results.push(counter);
  console.log(counter, results.reduce((a, b) => a + b, 0)/results.length);
};

while (i < 1000) {
  fetch('https://hola.org/challenges/word_classifier/testcase/' + i++)
    .then((res) => res.json())
    .then(json => countCorrect(json));
}
