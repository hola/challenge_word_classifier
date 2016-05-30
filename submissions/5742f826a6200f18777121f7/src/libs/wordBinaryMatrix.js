/**
 * Created by Cyber on 16.05.2016.
 */

var fs = require('fs');
var MATRIX_UTILS = require('./wordMatrixUtils.js');
var WORD_UTILS = require('./wordUtils.js');

(function () {

    var _dictionaryFile, _outputDirectory;

    var _matrix;
    var _matrixUtils;
    var _wordUtils;

    var _dimension;
    var _dimSizes;
    var _syllables;

    var _bytesInRecord;
    var _bitsInRecord;
    var _size;

    function WordBinaryMatrix(dictionaryFileName, outDirectory) {
        _dictionaryFile = dictionaryFileName;
        _outputDirectory = outDirectory;
        _matrixUtils = new MATRIX_UTILS(_dictionaryFile, _outputDirectory);
        _wordUtils = new WORD_UTILS(_dictionaryFile, _outputDirectory);
    }

    WordBinaryMatrix.prototype = {
        buildBinaryMatrix: buildBinaryMatrix,
        test             : test,

        loadFromFile: loadFromFile,
        saveToBuffer: saveToBuffer

    };

    if (typeof exports !== 'undefined') {
        module.exports = WordBinaryMatrix;
    }

    ///
    function calculateSizes(dimension, syllables) {
        _dimension = dimension;
        _syllables = syllables;

        _bytesInRecord = Math.ceil((_syllables + 1) / 8);
        _bitsInRecord = _bytesInRecord * 8;

        _size = 27 * _bytesInRecord;

        _dimSizes = [];
        _dimSizes[0] = 0;
        for (var i = 1; i < _dimension; i++) {
            _dimSizes[i] = _size;
            _size *= 27;
        }

        console.log(_bytesInRecord);
        console.log(_size);
        console.log(_dimSizes);
    }

    function initNew(dimension, syllables) {
        calculateSizes(dimension, syllables);

        _matrix = new Uint8Array(_size + 2);
        _matrix[_matrix.length - 1] = _syllables;
        _matrix[_matrix.length - 2] = _dimension;
    }

    ///
    function loadFromBuffer(buffer) {
        _matrix = new Uint8Array(buffer);
        calculateSizes(_matrix[_matrix.length - 2], _matrix[_matrix.length - 1]);
    }

    function saveToBuffer() {
        return Buffer.from(_matrix.buffer);
    }

    function loadFromFile(filePath) {
        console.log('Loading check...');
        try {
            fs.accessSync(filePath, fs.F_OK);
        } catch (e) {
            return false;
        }

        console.log('Loading....');
        loadFromBuffer(fs.readFileSync(filePath));
        return true;
    }

    function saveToFile(filePath) {
        fs.writeFileSync(filePath, saveToBuffer());
    }

    /////

    function buildBinaryMatrix(dimension, syllables) {
        var binaryMatrixFileName = _outputDirectory + '/wordMatrixBin-' + dimension + '-' + syllables + '.dat';
        var result = loadFromFile(binaryMatrixFileName);
        if (result !== false) {
            return true;
        }
        initNew(dimension, syllables);

        var wordMatrix = _matrixUtils.getNormalizedWordMatrix(dimension, syllables);
        translateToBinaryMatrix(wordMatrix);

        return saveToFile(binaryMatrixFileName);
    }

    ///

    function calculateBitIndex(symbols, syllableIndex) {
        var index = {
            byte: 0,
            bit : 0
        };

        if (symbols.length !== _dimension) {
            index.byte = -1;
            return index;
        }

        var dim = _dimension;

        symbols.split('').forEach(function (symbol) {
            dim--;
            var charIndex = symbol.charCodeAt(0) - 96;

            if (dim == 0) {
                index.byte += charIndex * _bytesInRecord + Math.floor(syllableIndex / 8);
            } else {
                index.byte += charIndex * _dimSizes[dim];
            }
        });
        index.bit = syllableIndex % 8;
        return index;
    }

    function setBit(index) {
        return _matrix[index.byte] |= (1 << index.bit);
    }

    function getBit(index) {
        return _matrix[index.byte] & (1 << index.bit);
    }

    ///

    function translateToBinaryMatrix(normalizedWordMatrix) {
        var stack = [];
        var symbolsStack = [];
        var symbols = [];
        var dim = 0;

        stack.push(normalizedWordMatrix);
        symbolsStack.push({sym: '', dim: dim});

        while (stack.length > 0) {
            var link = stack.pop();

            var sm = symbolsStack.pop();
            dim = sm.dim;
            symbols = symbols.slice(0, dim);
            symbols.push(sm.sym);

            if (link.hasOwnProperty('freq')) {
                var freq = link.freq;

                freq.forEach(function (value, index) {
                    if (value == 1) {
                        var idx = calculateBitIndex(symbols.join(''), index);
                        setBit(idx);
                    }
                });

            } else {
                dim++;
                for (var symbol in link) {
                    if (link.hasOwnProperty(symbol)) {
                        stack.push(link[symbol]);
                        symbolsStack.push({sym: symbol, dim: dim});
                    }
                }
            }
        }
    }

    function test(word) {
        var wrd = _wordUtils.normalizeWord(word);
        var parts = wrd.length - _dimension + 1;

        for (var i = 0; i < parts; i++) {
            var symbols = _matrixUtils.getWordPart(wrd, i, _dimension);//  wrd.slice(i, i + _dimension);
            var index = calculateBitIndex(symbols, i);

            if (index.byte !== -1) {
                if (!getBit(index)) {
                    return false;
                }
            }

            if (i + 1 == parts) {
                if (!getBit(calculateBitIndex(symbols, _bitsInRecord - 1))) {
                    return false;
                }
            }
        }

        return true;
    }

}());