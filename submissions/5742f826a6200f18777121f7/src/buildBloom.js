/**
 *
 */

var fs = require('fs');
var BLOOM = require('./libs/bloomFilter.js');

var WORD_UTILS = require('./libs/wordUtils.js');
var TESTER = require('./libs/tester.js');

const PREFIX_SIZE = 7;
const BLOOM_ERROR_RATE = 0.1;

var wordUtils = new WORD_UTILS('./words.txt', './output2');

/// test function
var checkWord = function (word) {
    var result = false;
    var tmp = wordUtils.getNormalizedWordPrefix(word, PREFIX_SIZE);

    if (tmp.length >= PREFIX_SIZE) {
        result = bloomForPrefixes.test(tmp);
    }

    return result;
};

function buildBloomFromDictionary(words, errorRate, dictionaryName) {

    var bloomFilter = new BLOOM();
    bloomFilter.new(words.length, errorRate);

    words.forEach(function (word) {
        bloomFilter.train(word);
    });

    bloomFilter.saveBloomToFile('./output2/' + dictionaryName + '.dat');

    return bloomFilter;
}

var exceptionsWord = wordUtils.getExceptionsDictionary();

var bloomForPrefixes = buildBloomFromDictionary(wordUtils.getUniquePrefixes(PREFIX_SIZE), BLOOM_ERROR_RATE, 'bloomPrefixes');
var bloomForExceptions = buildBloomFromDictionary(exceptionsWord, 0.01, 'bloomExceptions');

console.log(bloomForPrefixes.bloomId);
console.log(bloomForPrefixes.bloomSizeInBytes());
console.log(bloomForPrefixes.hashCounts());

console.log(bloomForExceptions.bloomId);
console.log(bloomForExceptions.bloomSizeInBytes());
console.log(bloomForExceptions.hashCounts());

var tester = new TESTER(checkWord, 'bloomTester', true);

var shortResult = tester.run('./verification', './output2');
console.log(shortResult);

var tmp = {
    'true' : 0,
    'false': 0
};

exceptionsWord.forEach(function (word) {
    tmp[(bloomForExceptions.test(word)).toString()]++;
});
console.log(tmp);

/*
shortResult = tester.run('./test', './output2');
console.log(shortResult);*/
