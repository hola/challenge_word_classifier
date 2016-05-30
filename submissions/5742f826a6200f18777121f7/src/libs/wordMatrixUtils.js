/**
 *
 */

var fs = require('fs');
var WORD_UTILS = require('./wordUtils.js');

(function () {
    'use strict';

    var _dictionaryFile, _outputDirectory;
    var _wordUtils;

    var _dimension;
    var _syllables;
    var _bytesInRecord;
    var _bitsInRecord;

    var _wordMatrix;

    var MatrixUtils = function (dictionaryFileName, outDirectory) {
        _dictionaryFile = dictionaryFileName;
        _outputDirectory = outDirectory;
        _wordUtils = new WORD_UTILS(_dictionaryFile, _outputDirectory);
    };

    MatrixUtils.prototype = {
        getWordPart            : getWordPart,
        ///
        getWordMatrix          : getWordMatrix,
        getNormalizedWordMatrix: getNormalizedWordMatrix
    };

    if (typeof exports !== 'undefined') {
        module.exports = MatrixUtils;
    }
    ////

    function loadMatrix(fileName) {
        try {
            fs.accessSync(fileName, fs.F_OK);
        } catch (e) {
            return false;
        }

        return JSON.parse(fs.readFileSync(fileName));
    }

    function saveMatrix(fileName, data) {
        fs.writeFileSync(fileName, JSON.stringify(data));
    }

    function calculateSizes(dimension, syllables) {
        _dimension = dimension;
        _syllables = syllables;
        _bytesInRecord = Math.ceil((_syllables + 1) / 8);
        _bitsInRecord = _bytesInRecord * 8;
        _wordMatrix = {}
    }

    function getWordPart(word, startIndex, dimension) {
        //return word.slice(startIndex, startIndex + dimension);
        return word.slice(0, 1) + word.slice(startIndex + 1, startIndex + dimension);
    }

    ////
    function getWordMatrix(dimension, syllables) {

        var matrixFileName = _outputDirectory + '/wordMatrix-' + dimension + '-' + syllables + '.txt';
        var data = loadMatrix(matrixFileName);
        if (false !== data) {
            return data;
        }

        var words = _wordUtils.getUniqueOriginalDictionary().filter(word => _wordUtils.simpleCheck(word));
        calculateSizes(dimension, syllables);
        words.forEach(word => train(word));

        saveMatrix(matrixFileName, _wordMatrix);
        return _wordMatrix;
    }

    function getNormalizedWordMatrix(dimension, syllables) {
        var matrixFileName = _outputDirectory + '/wordMatrix_norm-' + dimension + '-' + syllables + '.txt';
        var data = loadMatrix(matrixFileName);
        if (false !== data) {
            return data;
        }

        var normalizedMatrix = normalizeWordMatrix(getWordMatrix(dimension, syllables));

        saveMatrix(matrixFileName, normalizedMatrix);
        return normalizedMatrix;
    }

    function train(word) {
        var wrd = _wordUtils.normalizeWord(word);

        var parts = wrd.length - _dimension + 1;

        for (var i = 0; i < parts; i++) {

            var symbols = getWordPart(wrd, i, _dimension);
            var wrkMatrix = _wordMatrix;

            symbols.split('').forEach(function (symbol, index, array) {
                if (!wrkMatrix.hasOwnProperty(symbol)) {
                    if ((index + 1) === array.length) {
                        wrkMatrix[symbol] = {};
                        wrkMatrix[symbol]['freq'] = new Array(_bitsInRecord).fill(0);
                    } else {
                        wrkMatrix[symbol] = {};
                    }
                }
                wrkMatrix = wrkMatrix[symbol];
            });

            if (i < _syllables) {
                wrkMatrix.freq[i]++;
            }

            if (i + 1 == parts) {
                wrkMatrix.freq[wrkMatrix.freq.length - 1] = 1;
            }

        }
    }

    function normalizeWordMatrix(wordMatrix) {
        var normalizedMatrix = Object.assign({}, wordMatrix);

        var stack = [];
        stack.push(normalizedMatrix);

        while (stack.length > 0) {
            var link = stack.pop();
            if (link.hasOwnProperty('freq')) {
                var freq = link.freq;
                var sum = freq.slice(0, freq.length - 1).reduce((prev, curr) => prev + curr);
                var tmpLink = freq.slice(0, freq.length - 1)
                    .map(value => {
                        return value / sum;
                    })
                    .map(value=> {
                        return (value < 0.015 ? 0 : 1)
                    });

                link.freq = [].concat(tmpLink, freq.slice(-1));
            } else {
                for (var symbol in link) {
                    if (link.hasOwnProperty(symbol)) {
                        stack.push(link[symbol]);
                    }
                }
            }
        }

        return normalizedMatrix;
    }
}());
