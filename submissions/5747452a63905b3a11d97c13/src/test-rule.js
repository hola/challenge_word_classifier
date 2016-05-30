'use strict';

console.log('testing rule...');

const fs = require('fs');

let allWords = fs.readFileSync('words.txt', 'utf-8').toLowerCase().split(/\s+/g);
let allWordsDict = {};
for (let word of allWords) {
    allWordsDict[word] = true;
}

let matchingBad = [];
let matching = 0;
for (let word of allWords) {
    let replaced = word
        .replace(/(fying)$/, 'fy')
        .replace(/(ying)$/, 'ie')
        .replace(/(ssing|tting|ffing|nning|gging)$/, m => m[0])
        .replace(/([iu]ring)$/, m => m.substr(0, 2) + 'e')
        .replace(/([psh]ting|ring|ning|xing|wing|ming|shing)$/, m => m.replace('ing', ''))
        .replace(/(ing)$/, 'e');
    if (replaced === word) {
        continue;
    }
    matching++;
    if (!allWordsDict[replaced]) {
        matchingBad.push(word);
    }
}

fs.writeFileSync('tmp/rule-matched.txt', matchingBad.sort().join('\n'));

console.log('found: %d, bad: %d', matching, matchingBad.length);
