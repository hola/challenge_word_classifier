#!/usr/bin/env node

'use strict';

const fs = require('fs');
const zlib = require('zlib');
const classifier = require('.');

classifier.init(zlib.gunzipSync(fs.readFileSync('./data.gz')));

const samples = require('./test.json');

const words = Object.keys(samples);
let correct = 0;
words.forEach((word) => {

    if (classifier.test(word) === samples[word]) {
        correct++;
    }
    // const scores = calcProbs(word);
    // output.push([word, samples[word]].concat(scores));
});

console.log(`${correct}/${words.length}`);

//fs.writeFileSync('output.txt', output.map(x => x.join('\t')).join('\n'));