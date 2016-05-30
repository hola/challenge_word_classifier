'use strict';

const fs = require('fs');

const words = fs.readFileSync('./data/words.txt', 'utf8')
  .split('\n')
  .filter(word => !!word.length)
  .map(word => word.toLowerCase());
console.log('Total words:', words.length);
const wordCount = words.length;

// fs.writeFileSync('./data/words.json', JSON.stringify(words));

let wordLengthes = words.reduce((sum, word) => sum + word.length, 0);
console.log('Average word length:', wordLengthes / wordCount);

let apostropheEndedCount = words.reduce((count, word) => count + (word.endsWith('\'s') ? 1 : 0), 0);
console.log('Words ending with \'s:', apostropheEndedCount);

const wordCountsByLength = words.reduce((counts, word) => {
  counts[word.length] = (counts[word.length] || 0) + 1;
  return counts;
}, {});
// console.log('Length distribution by count:', wordCountsByLength);

const maxWordLength = Object.keys(wordCountsByLength).map(Number).pop();

const leftPrefixesByLength = {};
for (let prefixLength = 1; prefixLength <= maxWordLength; prefixLength++) {
  const prefixes = {};
  for (const word of words) {
    if (word.length < prefixLength) {
      continue;
    }
    const prefix = word.slice(0, prefixLength);
    prefixes[prefix] = (prefixes[prefix] || 0) + 1
  }
  leftPrefixesByLength[prefixLength] = Object.keys(prefixes).length;
}

console.log('Unique left prefixes by prefix length:', leftPrefixesByLength);

const rightPrefixesByLength = {};
for (let prefixLength = 1; prefixLength <= maxWordLength; prefixLength++) {
  const prefixes = {};
  for (const word of words) {
    if (word.length < prefixLength) {
      continue;
    }
    const prefix = word.slice(0, -prefixLength);
    prefixes[prefix] = (prefixes[prefix] || 0) + 1
  }
  rightPrefixesByLength[prefixLength] = Object.keys(prefixes).length;
}

console.log('Unique right prefixes by prefix length:', rightPrefixesByLength);
