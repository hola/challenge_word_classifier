const fs = require('fs');

let maxLength = 34;
let template = (new Array(27)).fill(0);
let result = new Array(maxLength); // Обозначает позиции 0 это 2 позиция в слове для буквы (начиная считать с 1)
let words = fs.readFileSync('unique_words.txt', {encoding: 'utf8'}).split('\n');
let alpha = 'abcdefghijklmnopqrstuvwxyz\''.split('');

for (let i = 0; i < maxLength; ++i) {
    result[i] = template.slice();
}

for (let i = 0; i < words.length; ++i) {
    let word = words[i];
    let needLength = word.length > maxLength ? maxLength + 1 : word.length;

    for (let j = 1; j < needLength; ++j) {
        result[j - 1][alpha.indexOf(word.charAt(j))] += 1;
    }
}

let buf = Buffer.from(JSON.stringify(result.map((v) => {
    let max = Math.max.apply(null, v);

    return v.map((item) => {
        return Math.round(item * 100 / max);
    });
})));

fs.writeFileSync('data1', buf);

// fs.writeFileSync('tmp_result.txt', result.map((v) => {
//     let max = Math.max.apply(null, v);
//
//     return v.map((item) => {
//         return Math.round(item * 100 / max);
//     }).join(' ');
// }).join('\n'));
