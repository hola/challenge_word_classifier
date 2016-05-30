const words = require('./dictionary.json');

const bigrams = words.map(word => word.toLowerCase()).map(word => word.split('').slice(1).map((c, i) => word[i] + c));

const letters = Array.from(new Array(26)).map((v, i) => String.fromCharCode(97 + i)).concat(['\'']);
const getFreqObject = () => letters.reduce((obj, c) => Object.assign(obj, {[c]: letters.reduce((obj, c) => Object.assign(obj, {[c]: 0}), {})}), {});

const freq = bigrams.reduce((freq, bigrams) => {
  bigrams.forEach(bigram => freq[bigram[0]][bigram[1]]++);
  return freq;
}, getFreqObject());

Object.keys(freq).forEach(key => {
  const letter = freq[key];
  const total = Object.keys(letter).reduce((sum, key) => sum + letter[key], 0);
  Object.keys(letter).forEach(key => letter[key] = Math.ceil(letter[key] / total * 10000) / 10000);
});

console.log(JSON.stringify(freq));
