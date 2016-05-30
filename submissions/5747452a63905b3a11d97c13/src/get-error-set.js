'use strict';

var fs = require('fs');

let errorWords = [];

for (let file of fs.readdirSync('tests/errorset')) {
    if (!/\d+/.test(file)) {
        continue;
    }
    let testData = JSON.parse(fs.readFileSync('tests/errorset/' + file));
    for (let word of Object.keys(testData)) {
        let expected = testData[word];
        if (!expected) {
            errorWords.push(word);
        }
    }
}

errorWords.sort();

if (!fs.existsSync('tmp')) {
    fs.mkdirSync('tmp');
}
fs.writeFileSync('tmp/errors.txt', errorWords.join('\n'));
