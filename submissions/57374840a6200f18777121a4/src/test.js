#!/usr/bin/env node
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const _ = require('lodash');

let classifierFile, wordsFiles = [], dataFile;

process.argv.forEach(arg => {
    if (arg.match(/\.json$/)) {
        wordsFiles.push(path.resolve(arg))
    } else if (arg.match(/\.js\.gz$/)) {
        dataFile = path.resolve(arg)
    } else if (arg.match(/\.js$/)) {
        classifierFile = path.resolve(arg)
    }
});

if (!~process.argv.indexOf('-v') && !~process.argv.indexOf('--verbose')) {
    console.log = () => {
    }
}

const classifier = require(classifierFile);

let data = zlib.gunzipSync(new Buffer(fs.readFileSync(dataFile)));

classifier.init(data);

_.forEach(wordsFiles, e => {
    let correct = 0, words = require(e), size = _.size(words);

    _.forIn(words, (test, word) => {
        if (classifier.t(word) === test) {
            correct++;
            console.log(`${correct / size * 100}%`);
        }
    });

    console.info(`${correct / size * 100}%  -  ${e}`);
});


