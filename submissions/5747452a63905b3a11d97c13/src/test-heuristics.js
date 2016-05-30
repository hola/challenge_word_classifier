'use strict';

console.log('testing errors...');

const fs = require('fs');

const common = require('./common');
const stat = require('./stat');
const regexps = require('./regexps');

const allWords = fs.readFileSync('words.txt', 'utf-8').toLowerCase().split(/\s+/g);
const allErrorWords = fs.readFileSync('tmp/errors.txt', 'utf-8').toLowerCase().split(/\s+/g);

const freq = new Uint8Array(fs.readFileSync('tmp/ch-freq.bin'));

console.log('testing...');

let totalWords = 0;
let detectedWords = 0;
for (let word of allWords) {
    totalWords++;
    if (common.heuristics(word, regexps, freq)) {
        detectedWords++;
    }
}

let missedWords = [];
let totalErrorWords = 0;
let detectedErrors = 0;
for (let word of allErrorWords) {
    totalErrorWords++;
    if (common.heuristics(word, regexps, freq)) {
        missedWords.push(word);
    } else {
        detectedErrors++;
    }
}

console.log('detected errors, %d / %d (%s%), words %d / %d (%s%)',
    detectedErrors, totalErrorWords, (detectedErrors / totalErrorWords * 100).toFixed(2),
    detectedWords, totalWords, (detectedWords / totalWords * 100).toFixed(2)
);
fs.writeFileSync('tmp/errors-missed.txt', missedWords.join('\n'));
