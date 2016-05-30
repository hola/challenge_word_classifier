'use strict';

console.log('initializing...');

const fs = require('fs');
const zlib = require('zlib');

const common = require('./common');
const BloomFilter = require('./bloom-filter-writable');
const regexps = require('./regexps');

const allWords = fs.readFileSync('words.txt', 'utf-8').toLowerCase().split(/\s+/g);

const alphabet = common.alphabet;
const alphabetIndices = common.alphabetIndices;

const val = +process.argv.filter(arg => arg.startsWith('--val=')).map(arg => arg.replace('--val=', ''))[0] || 0;
const bloomFilterSize = 64303;
const first3BloomFilterSize = 1152;
const additionalErrorList = 'error-words.txt';

if (!fs.existsSync('tmp')) {
    fs.mkdirSync('tmp');
}

console.log('learning...');

console.log('  calculating char frequencies...');

let chCounts = new Int32Array((alphabet.length + 1) * alphabet.length);
for (let word of allWords) {
    for (let i = 0; i < word.length; i++) {
        let ch = alphabetIndices[word[i]];
        chCounts[ch]++;
        if (i > 0) {
            let chPrev = alphabetIndices[word[i - 1]];
            chCounts[(chPrev + 1) * alphabet.length + ch]++;
        }
    }
}
let freq = new Uint8Array(chCounts.length);
let chFreqStr = '';
for (let i = 0; i <= alphabet.length; i++) {
    let max = 0;
    for (let j = 0; j < alphabet.length; j++) {
        let count = chCounts[i * alphabet.length + j];
        if (count > max) {
            max = count;
        }
    }
    for (let j = 0; j < alphabet.length; j++) {
        let count = chCounts[i * alphabet.length + j];
        freq[i * alphabet.length + j] = count === 0 ? 0 :
            Math.max(1, Math.round(count / max * 255));

        let ch1 = i === 0 ? ' ' : alphabet[i - 1];
        let ch2 = alphabet[j];
        chFreqStr += ch1 + ch2 + ' ' + freq[i * alphabet.length + j] + ' ' + count + '\n';
    }
}
if (process.argv.some(arg => arg.startsWith('--print-freq'))) {
    fs.writeFileSync('tmp/ch-freq.txt', chFreqStr);
}
fs.writeFileSync('tmp/ch-freq.bin', Buffer.from(freq.buffer));

console.log('  finding first substrings...');

let freqFirst3 = {};
for (let word of allWords) {
    if (word.length > 3) {
        let heuristics = common.heuristics(word, regexps, freq);
        if (heuristics === 0) {
            let simple = common.simplify(word, regexps);
            if (simple.length > 3) {
                let start = word.substr(0, 3);
                freqFirst3[start] = (freqFirst3[start] | 0) + 1;
            }
        }
    }
}

let filterFirst3 = new BloomFilter(first3BloomFilterSize);
Object.keys(freqFirst3).forEach(start => {
    if (freqFirst3[start] > 5) {
        let ch1 = alphabetIndices[start[0]];
        let ch2 = alphabetIndices[start[1]];
        if (freq[(ch1 + 1) * alphabet.length + ch2] < 255) {
            filterFirst3.add(start);
        }
    }
});

console.log('  building bloom filter...');

let simpleWords = {};
let totalWords = 0;
let heuristicsSkip = 0;
let filter = new BloomFilter(bloomFilterSize);
filter.upgradeToCountingFilter();
for (let word of allWords) {
    totalWords++;
    let heuristics = common.heuristics(word, regexps, freq);
    if (heuristics === 0) {
        let simple = common.simplify(word, regexps);
        simpleWords[simple] = true;
        if (!common.skipFirst(simple, freq, filterFirst3)) {
            filter.add(simple);
        }
    } else {
        heuristicsSkip++;
    }
}
if (process.argv.some(arg => arg.startsWith('--print-simple'))) {
    fs.writeFileSync('tmp/simple.txt', Object.keys(simpleWords).join('\n'));
}

console.log('  adding error words...');

let allErrors = fs.readFileSync(additionalErrorList, 'utf-8').toLowerCase().split(/\s+/g);

for (let word of allErrors) {
    let heuristics = common.heuristics(word, regexps, freq);
    if (heuristics === 0) {
        let simple = common.simplify(word, regexps);
        if (!common.skipFirst(simple, freq, filterFirst3)) {
            filter.addNeg(simple);
        }
    }
}

console.log('  updating bloom filter...');

filter.removeNeg(1/6, -2, [9, 18, 21, 30]);

console.log('total words: %d, hashed: %d, skipped by heuristics: %d',
    totalWords, Object.keys(simpleWords).length, heuristicsSkip);

console.log('saving...');

let data = [];
let regexpsStr = regexps.map(re => re[0].toString().replace(/\//g, '') + '\t' + re[1]).join('\n');

data.push(Buffer.from(filter.export()));
data.push(Buffer.from(filterFirst3.export()));
data.push(Buffer.from(freq.buffer));
data.push(Buffer.from(regexpsStr, 'utf8'));

let lengths = new Buffer(data.length * 4);
let lengthsStr = [];
data.forEach((item, ix) => {
    lengths.writeUInt32LE(item.byteLength, ix * 4);
    lengthsStr.push(item.byteLength);
});
data.unshift(lengths);
data = Buffer.concat(data);

console.log('uncompressed: %d (%s)', data.byteLength, lengthsStr.join('+'));

let compressed;
for (let strategy of [zlib.Z_FILTERED, zlib.Z_HUFFMAN_ONLY, zlib.Z_RLE, zlib.Z_FIXED, zlib.Z_DEFAULT_STRATEGY]) {
    let comp = zlib.gzipSync(data, {
        level: zlib.Z_BEST_COMPRESSION,
        memLevel: zlib.Z_BEST_COMPRESSION,
        strategy: strategy,
        chunkSize: 1024000
    });
    if (!compressed || comp.byteLength < compressed.byteLength) {
        compressed = comp;
    }
}
console.log('compressed: %d', compressed.byteLength);

if (!fs.existsSync('out')) {
    fs.mkdirSync('out');
}
fs.writeFileSync('out/data.gz', compressed);

require('./build-dist');

console.log('total size: %d bytes', compressed.byteLength + fs.statSync('out/solution.js').size);
