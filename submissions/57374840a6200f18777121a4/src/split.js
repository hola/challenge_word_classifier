#!/usr/bin/env node
const words = require('./words.json');
const nowords = require('./false-words.json');
const fs = require('fs');
const _ = require('lodash');

const wordsLen = _.reduce(words, (a, x,  b) => b.length > a ? b.length : a, 0);

for (let i = 1; i < wordsLen; ++i) {

    fs.writeFileSync(`words-json/${i}.json`, JSON.stringify(_.pickBy(words, (v, k) => k.length === i)));
    fs.writeFileSync(`no-words-json/${i}.json`, JSON.stringify(_.pickBy(nowords, (v, k) => k.length === i)));
    // fs.writeFileSync(`words-txt/${i}.txt`, _.filter(words, (a, e) => e.length === i).keys().join('\n');
    // fs.writeFileSync(`no-words-txt/${i}.txt`, _.filter(nowords, (a, e) => e.length === i).keys().join('\n'));
}
