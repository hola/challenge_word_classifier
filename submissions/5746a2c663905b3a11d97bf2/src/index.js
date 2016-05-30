'use strict';

let edges;

const MIN_NGRAM = 3;
const MAX_NGRAM = 3;
const THRESHOLD = 0.000019;

const getNgrams = (minLength, maxLength) => word => {

    const ngrams = [];
    const paddedWord = '_' + word.toLowerCase() + '_';
    for (let i = minLength; i <= maxLength; i++) {
        for (let j = 0; j < paddedWord.length - i + 1; j++) {
            ngrams.push(paddedWord.substr(j, i));
        }
    }
    return ngrams;
};

const calcProb = (ngram, prevNgram, norm) => {

    if (prevNgram && edges[prevNgram]) {
        return (edges[prevNgram][ngram] || 0) / norm;
    }
    return 0;
};

const calcProbs = (minLength, maxLength) => word => {

    const norms = {};

    for (let i = minLength; i <= Math.min(maxLength, word.length + 2); i++) {
        norms[i] = i * (word.length + 2 - i + 1) - 1;
    }

    return getNgrams(minLength, maxLength)(word)
        .reduce((score, ngram, i, arr) => {
            return score + calcProb(ngram, i > 0 ? arr[i - 1] : null, norms[ngram.length]);
        }, 0);
};

const init = (data) => {
    edges = data.toString()
        .split('\n')
        .map(line => line.split('\t'))
        .reduce((res, row) => {

            const prevNgram = row[0].substring(0, row[0].length - 1);
            const ngram = row[0].substring(1);
            if (!res[prevNgram]) res[prevNgram] = {};
            res[prevNgram][ngram] = parseFloat(row[1]) / 1000;
            return res;
        }, {});
};

const test = (word) => {
    return calcProbs(MIN_NGRAM, MAX_NGRAM)(word) > THRESHOLD;
};

module.exports = {
    init,
    test
};