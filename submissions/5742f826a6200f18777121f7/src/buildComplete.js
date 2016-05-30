/**
 *
 */


const DIMENSIONS = 3;
const SYLLABLES = 15;
const PREFIX_SIZE = 7;
const BLOOM_ERROR_RATE = 0.435;

const fs = require('fs');

var WORD_UTILS = require('./libs/wordUtils.js');
var wordUtils = new WORD_UTILS('./words.txt', './output2');

var TESTER = require('./libs/tester.js');
var MATRIX = require('./libs/wordBinaryMatrix.js');
var BLOOM = require('./libs/bloomFilter.js');

var matrix = new MATRIX('./words.txt', './output2');
matrix.buildBinaryMatrix(DIMENSIONS, SYLLABLES);

function buildBloomFromDictionary(words, errorRate, dictionaryName) {

    var bloomFilter = new BLOOM();
    bloomFilter.new(words.length, errorRate);

    words.forEach(function (word) {
        bloomFilter.train(word);
    });

    bloomFilter.saveBloomToFile('./output2/' + dictionaryName + '.dat');

    return bloomFilter;
}

var checkWord = function (word) {

    if (!wordUtils.simpleCheck(word)) {
        return checkException(word);
    } else {
        var matrixResult = matrix.test(word);

        var result = true;
        var tmp = wordUtils.getNormalizedWordPrefix(word, PREFIX_SIZE);

        if (tmp.length >= PREFIX_SIZE) {
            result = bloomForPrefixes.test(tmp);
        }

        return matrixResult && result;
    }
};

var exceptionsWord = wordUtils.getExceptionsDictionary();
var bloomForPrefixes = buildBloomFromDictionary(wordUtils.getUniquePrefixes(PREFIX_SIZE), BLOOM_ERROR_RATE, 'bloomPrefixes');
var bloomForExceptions = buildBloomFromDictionary(exceptionsWord, 0.01, 'bloomExceptions');
console.log(bloomForPrefixes.bloomSizeInBytes());

var bloom1Buffer = bloomForPrefixes.saveBloomToBuffer();
var bloom2Buffer = bloomForExceptions.saveBloomToBuffer();
var matrixBuffer = matrix.saveToBuffer();

var position = 0;

var dataBuffer = Buffer.alloc(bloom1Buffer.length + bloom2Buffer.length + matrixBuffer.length + 6, 0);

dataBuffer.writeUInt16LE(bloom1Buffer.length, position);
position += 2;
bloom1Buffer.copy(dataBuffer, position);
position += bloom1Buffer.length;

dataBuffer.writeUInt16LE(bloom2Buffer.length, position);
position += 2;
bloom2Buffer.copy(dataBuffer, position);
position += bloom2Buffer.length;

dataBuffer.writeUInt16LE(matrixBuffer.length, position);
position += 2;
matrixBuffer.copy(dataBuffer, position);

fs.writeFileSync('./output2/data', dataBuffer);

////
var tester = new TESTER(checkWord, 'completeTester', true);

var shortResult = tester.run('./verification', './output2');//test
console.log(shortResult);

/////
function checkException(word) {
    if ((word.length == 1) && word.match(/^[a-z]{1,1}$/g)) {
        return true;
    }

    if ((word.length == 2) &&
        word.match(/(a[a-z])|(b[a-ik-pr-z])|(c[a-wy-z])|(d[a-z])|(e[a-il-z])|(f[a-gil-pr-z])|(g[a-eg-ik-wy])|(h[a-wy-z])|(i[a-gi-z])|(j[ac-egi-jlo-pr-vy])|(k[a-egi-jl-pr-wy])|(l[a-jl-pr-z])|(m[a-pr-y])|(n[a-jl-mo-wy-z])|(o[a-pr-z])|(p[a-ik-y])|(q[a-fh-il-np-vy])|(r[a-jl-y])|(s[a-y])|(t[a-eg-ik-pr-y])|(u[a-dg-ik-npr-x])|(v[a-gi-jl-pr-x])|(w[a-ik-mo-pr-wy])|(x[a-eiln-x])|(y[a-bd-fim-pr-vy])|(z[a-bdgik-ln-or-uz])/g)) {
        return true;
    }

    return bloomForExceptions.test(word);
}