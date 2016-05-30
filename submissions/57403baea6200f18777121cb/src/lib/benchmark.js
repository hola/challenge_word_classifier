const zlib = require('zlib');
const fs = require('fs');
const final = require('../final/solution.js');

const tests = require('../testcases/test.json');
const testWords = Object.keys(tests);

final.init(
    new Buffer(Array.from(zlib.gunzipSync(fs.readFileSync(`${__dirname}/../final/data.gz`))))
);

let wrong = 0;
testWords.forEach(word => {
    const result = final.test(word);
    if (result !== tests[word]) {
        ++wrong;
        // console.error(word, result, tests[word]);
    }
});

console.log((1 - wrong / testWords.length) * 100);

// return {
//     result: ((1 - wrong / testWords.length) * 100),
//     sizes: trees.map(tree => tree.size),
//     totalSize
// };

// const alphabetList = ['etaoih', 'zqxjkvbpygfwmu', 'hrdlcum', 'opnszqxj'];
// const alphabetList = ['etaoins', 'zqxjkvbpygfwm', 'hrdlc', 'opnszq'];
// console.log(getPercentage(alphabetList, 7));


// let bestAlphabetList = [];
// let bestPercentage = 50;
// const letters = 'abcdefghijklmnopqrstuvwxyz';
// const randomLetter = () => letters[Math.floor(Math.random() * letters.length)];
//
// for (let i = 0; i < 10000000; ++i) {
//     const numberOfAlphabets = Math.floor(Math.random() * 5) + 1;
//     const alphabetList = [];
//     for (let j = 0; j < numberOfAlphabets; ++j) {
//         const numberOfLetters = Math.floor(Math.random() * 6) + 3;
//         let alphabet = '';
//         for (let letterIndex = 0; letterIndex < numberOfLetters; ++letterIndex) {
//             let letter = randomLetter();
//             while (alphabet.includes(letter)) {
//                 letter = randomLetter();
//             }
//             alphabet += letter;
//         }
//         alphabetList.push(alphabet);
//     }
//     const result = getPercentage(alphabetList);
//     if (result === false) {
//         continue;
//     }
//     if (result > bestPercentage) {
//         bestPercentage = result;
//         bestAlphabetList = alphabetList;
//         console.log(result, alphabetList);
//     }
// }
