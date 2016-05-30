'use strict';

const fs = require('fs');

const common = require('./common');
const regexps = require('./regexps');

const allWords = fs.readFileSync('words.txt', 'utf8').toLowerCase().split(/\s+/g);
const allErrors = fs.readFileSync('tmp/errors.txt', 'utf8').toLowerCase().split(/\s+/g);
const chartTemplate = fs.readFileSync('chart-templates/stat.html', 'utf8');
const freq = new Uint8Array(fs.readFileSync('tmp/ch-freq.bin'));

const alphabet = common.alphabet;
const alphabetIndices = common.alphabetIndices;

let dataWords = calcTotalPairFreq(allWords);
let dataErrors = calcTotalPairFreq(allErrors);

let chartHtml = chartTemplate.replace('data_words', dataWords).replace('data_errors', dataErrors);
fs.writeFileSync('tmp/chart.html', chartHtml);

function calcFreq(words) {
    let freq = {};
    for (let word of words) {
        for (let i = 0; i < word.length - 3; i++) {
            let part = word.substr(i, 3);
            freq[part] = (freq[part] | 0) + 1;
        }
    }
    let max = 0;
    Object.keys(freq).forEach(k => max = Math.max(max, freq[k]));
    let freqs = [];
    for (let i = 0; i < alphabet.length; i++) {
        for (let j = 0; j < alphabet.length; j++) {
            for (let k = 0; k < alphabet.length; k++) {
                let pairFreq = (freq[alphabet[i] + alphabet[j] + alphabet[k]] | 0) / max;
                freqs.push(+pairFreq.toFixed(5));
            }
        }
    }
    return JSON.stringify(freqs);
}

function calcFreqDist(words) {
    let result = new Float32Array(256);
    let wordCount = 0;
    for (let word of words) {
        if (word.length > 3) {
            wordCount++;
            let wordFreq = new Float32Array(256);
            for (let i = 0; i < word.length - 2; i++) {
                var ch1 = alphabetIndices[word[i]];
                var ch2 = alphabetIndices[word[i + 1]];
                var pairFreq = Math.floor((freq[(ch1 + 1) * alphabet.length + ch2] | 0));
                wordFreq[pairFreq]++;
            }
            let sum = 0;
            wordFreq.forEach(f => sum += f);
            wordFreq.forEach((f, ix) => result[ix] += f / sum);
        }
    }
    result.forEach((k, ix) => result[ix] /= wordCount);
    return '[' + result.join(',') + ']';
}

function calcTotalPairFreq(words) {
    let maxLen = 16;
    let result = new Float32Array(maxLen + 1);
    let counts = new Int32Array(maxLen + 1);
    for (let word of words) {
        word = common.simplify(word, regexps);
        if (word.length > maxLen || word.length < 3) {
            continue;
        }
        var totalFreq = 0;
        var totalLowFreq = 0;
        for (let i = 0; i < word.length - 1; i++) {
            var ch1 = alphabetIndices[word[i]];
            var ch2 = alphabetIndices[word[i + 1]];
            var pairFreq = freq[(ch1 + 1) * alphabet.length + ch2] | 0;
            if (pairFreq < 3) {
                totalLowFreq++;
            }
            totalFreq += (pairFreq - 160) / 255;
            // totalFreq *= pairFreq / 160;
        }
        result[word.length] += totalFreq;
        counts[word.length]++;
    }
    for (let i = 0; i < result.length; i++) {
        if (counts[i]) {
            result[i] /= counts[i];
        }
    }
    return '[' + result.join(',') + ']';
}
