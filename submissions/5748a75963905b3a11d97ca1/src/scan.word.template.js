const fs = require('fs');

let res = {};
let result = [];
let alphaG = 'aeiouy'.split('');
let alphaS = 'bcdfghjklmnpqrstvwxz'.split('');
let alphaTemplate = {g: 'G', s: 'S', q: 'Q'};
let words = fs.readFileSync('unique_words.txt', {encoding: 'utf8'}).split('\n');

for (let i = 0; i < words.length; ++i) {
    let word = words[i];
    let wordTemplate = '';

    for (let j = 0; j < word.length; ++j) {
        let letter = word[j];

        if (alphaG.indexOf(letter) !== -1) {
            wordTemplate += alphaTemplate.g;
        } else if (alphaS.indexOf(letter) !== -1) {
            wordTemplate += alphaTemplate.s;
        } else {
            wordTemplate += alphaTemplate.q;
        }
    }

    res[wordTemplate] = '';
}

for (let key in res) {
    result.push(key);
}

let buf = Buffer.from(JSON.stringify(result));

fs.writeFileSync('data3', buf);
