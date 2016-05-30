/**
 *
 */

var fs = require('fs');

(function () {
    'use strict';

    var _dictionaryFile,
        _outputDirectory;

    const uniqueDictionaryFileName = 'words_unique.txt';

    var wordsUtils = function (dictionaryFilePath, outDirectory) {
        _dictionaryFile = dictionaryFilePath;
        _outputDirectory = outDirectory;
    };

    wordsUtils.prototype = {
        getNormalizedWordPrefix: getNormalizedWordPrefix,
        normalizeWord          : normalizeWord,
        simpleCheck            : simpleCheck,

        filterUniqueWords          : filterUniqueWords,
        getUniqueOriginalDictionary: getUniqueOriginalDictionary,
        getExceptionsDictionary    : getExceptionsDictionary,

        getUniquePrefixes: getUniquePrefixesWithoutExceptions
    };

    if (typeof exports !== 'undefined') {
        module.exports = wordsUtils;
    }
    ///

    function loadDictionaryFile(fileName) {
        try {
            fs.accessSync(fileName, fs.F_OK);
        } catch (e) {
            return false;
        }

        return fs.readFileSync(fileName).toString().split('\n');
    }

    function saveDictionaryFile(fileName, data) {
        try {
            fs.writeFileSync(fileName, data.join('\n'));
        } catch (e) {
            return false;
        }

        return true;
    }

    ////
    function normalizeWord(word) {
        return word.replace(/\'s$/g, '`');
    }

    function getNormalizedWordPrefix(word, prefixLength) {
        return normalizeWord(word).slice(0, prefixLength)
    }

    function simpleCheck(word) {
        if (word.match(/[^a-z\']/g)) {
            return false;
        }

        if (word.match(/\'\'/g)) {
            return false;
        }

        if (word.match(/^\'/g)) {
            return false;
        }

        if (word.match(/\'.{2,}$/g)) {
            return false;
        }

        if (word.match(/^.{1,2}$/g)) {
            return false;
        }

        return !word.match(/\'[a-rt-z]+$/g);
    }

    ////
    function filterUniqueWords(dictionary) {
        var uniqueDict = [],
            uniqueMap  = {};

        dictionary.forEach(function (word) {
            if (word.length > 0) {
                if (!uniqueMap.hasOwnProperty(word)) {
                    uniqueDict.push(word);
                    uniqueMap[word] = 1;
                }
            }
        });

        return uniqueDict.sort();
    }

    function getUniqueOriginalDictionary() {
        var uniqueDictPath = _outputDirectory + '/' + uniqueDictionaryFileName;
        var data = loadDictionaryFile(uniqueDictPath);
        if (false === data) {
            var originalDictionary = loadDictionaryFile(_dictionaryFile);
            if (false === originalDictionary) {
                return false;
            }

            originalDictionary = originalDictionary.map(function (word) {
                return word.trim().toLowerCase();
            });
            data = filterUniqueWords(originalDictionary);

            saveDictionaryFile(uniqueDictPath, data);
        }

        return data;
    }

    function getUniquePrefixesWithoutExceptions(prefixLength) {
        var prefixesFileName = _outputDirectory + '/' + 'wordPrefixes-' + prefixLength + '.txt';
        var data = loadDictionaryFile(prefixesFileName);
        if (false !== data) {
            return data;
        }

        var words = getUniqueOriginalDictionary();

        words = words.filter(function (word) {
            return simpleCheck(word);
        }).map(function (word) {
            var prefix = getNormalizedWordPrefix(word, prefixLength);
            return (prefix.length < prefixLength) ? '' : prefix;
        });

        var prefixes = filterUniqueWords(words);

        saveDictionaryFile(prefixesFileName, prefixes);

        return prefixes;
    }

    function getExceptionsDictionary() {
        var exceptionsDictionaryFileName = _outputDirectory + '/' + 'words_unique_exceptions.txt';
        var data = loadDictionaryFile(exceptionsDictionaryFileName);
        if (false !== data) {
            return data;
        }

        var words = getUniqueOriginalDictionary();

        words = words.filter(function (word) {
            return !simpleCheck(word) && (word.length > 2);
        });

        saveDictionaryFile(exceptionsDictionaryFileName, words);

        return words;
    }

}());