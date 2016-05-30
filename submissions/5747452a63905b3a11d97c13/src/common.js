'use strict';

let alphabet = 'abcdefghijklmnopqrstuvwxyz\'';
let alphabetLength = alphabet.length;

let alphabetIndices = {};
alphabet.split('').forEach((ch, ix) => alphabetIndices[ch] = ix);

let simplify = (word, regexps) => {
    for (let [re, repl] of regexps) {
        word = word.replace(re, repl)
    }
    return word;
};

let heuristics = (word, regexps, freq) => {
    if (word.length < 2) {
        return word !== '\'';
    }
    word = simplify(word, regexps);
    let length = word.length;
    if (!length || length > 14 || /0/.test(word)) {
        return false;
    }
    let seqLowFreq = 0;
    let totalFreq = 1;
    let totalLowFreq = 0;
    let maxPairFreq = 0;
    let i;
    for (i = 0; i < length - 1; i++) {
        let pairFreq = freq[(alphabetIndices[word[i]] + 1) * alphabetLength + alphabetIndices[word[i + 1]]];
        if (pairFreq > maxPairFreq) {
            maxPairFreq = pairFreq;
        }
        if (!pairFreq) {
            return false;
        }
        if (pairFreq < 4) {
            totalLowFreq++;
        }
        if (pairFreq < 12) {
            seqLowFreq++;
            if (seqLowFreq > 2) {
                return false;
            }
        } else {
            seqLowFreq = 0;
        }
        totalFreq *= pairFreq / 255;
    }
    if (maxPairFreq < 4 ||
        totalLowFreq / length > 0.4 ||
        length > 3 && (totalFreq < .0000002 || totalFreq > .95)) {
        return false;
    }
    let vowels = (word.match(/[aeiouy]/g) || []).length;
    if (length > 3 && (vowels < length / 10 || vowels >= length / 1.1)) {
        return false;
    }
    return 0;
};

let skipFirst = (simple, freq, filterFirst3) => {
    return simple.length > 3 &&
        freq[(alphabetIndices[simple[0]] + 1) * alphabetLength + alphabetIndices[simple[1]]] < 255 &&
        !filterFirst3.contains(simple.substr(0, 3));
};

module.exports = {
    simplify: simplify,
    heuristics: heuristics,
    skipFirst: skipFirst,
    alphabet: alphabet,
    alphabetIndices: alphabetIndices
};
