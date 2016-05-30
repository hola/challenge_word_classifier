/**
 * Created by Cyber on 16.05.2016.
 */

var fs = require('fs');

var TESTER = require('./libs/tester.js');
var MATRIX = require('./libs/wordBinaryMatrix.js');

var MATRIX_UTILS = require('./libs/wordMatrixUtils.js');

///var matrixUtils = new MATRIX_UTILS('./words.txt', './output2');
var matrix = new MATRIX('./words.txt', './output2');

const DIMENSIONS = 4;
const SYLLABLES = 7;

var rs = matrix.buildBinaryMatrix(DIMENSIONS, SYLLABLES);


function checkWord(word) {
    return matrix.test(word);
}

var tester = new TESTER(checkWord, 'matrixTester', true);

var shortResult = tester.run('./test', './output2');
console.log(shortResult);

