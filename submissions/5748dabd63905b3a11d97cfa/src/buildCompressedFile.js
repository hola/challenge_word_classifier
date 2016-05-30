/**
 * !- separator for combination of 2 chars which not repeated
 */

var fs = require('fs');
var zlib = require('zlib');
var _ = require('underscore');

function _getAllChars() {
    var charsArr = [];
    for (var i = 97; i <= 122; i++) {
        charsArr.push(String.fromCharCode(i));
    }
    charsArr.push('\'');
    return charsArr;
}

function _getIllegalCombinationsStr(allWordsArr) {
    var allCharsArr = _getAllChars();

    var maxIllegalCombinationLength = 3;
    var minIllegalCombinationLength = 3;

    var allCombinationsMap = {};
    allCharsArr.forEach(function (char) {
        allCombinationsMap[char] = true;
    });

    for (var i = 1; i < maxIllegalCombinationLength; i++) {
        var keys = Object.keys(allCombinationsMap);
        keys.forEach(function (str) {
            allCharsArr.forEach(function (char) {
                allCombinationsMap[str + char] = true;
            });
        });
    }

    allWordsArr.forEach(function (word) {
        var subStr;
        for (var length = 1; length <= maxIllegalCombinationLength; length++) {
            for (var i = 0; i < word.length; i++) {
                subStr = word.substr(i, length);
                delete allCombinationsMap[subStr];
            }
        }
    });

    _.mapObject(allCombinationsMap, function (val, illegalCombination) {
        for (var length = 1; length < illegalCombination.length; length++) {
            for (var i = 0; i <= illegalCombination.length - length; i++) {
                var subStr = illegalCombination.substr(i, length);
                if (allCombinationsMap[subStr]) {
                    delete allCombinationsMap[illegalCombination];
                }
            }
        }
    });

    return Object.keys(allCombinationsMap).filter(function (str) {
        return str.length >= minIllegalCombinationLength &&
            str.length <= maxIllegalCombinationLength &&
            str.indexOf('\'\'') === -1;
    });
}

function _getIndexesCharsNotAppearStr(allWordsArr) {
    var charsIndex = {};
    var allChars = _getAllChars();
    allChars.forEach(function (char) {
        charsIndex[char] = [];
        for (var i = 0; i < 60; i++) {
            charsIndex[char].push(false);
        }
    });
    allWordsArr.forEach(function (word) {
        for (var i in word) {
            var char = word[i];
            charsIndex[char][i] = true;
        }
    });

    var binaryCharsIndex = {};
    for (var char in charsIndex) {
        var indexArr = charsIndex[char],
            notAppearIndexMap = '';

        indexArr.forEach(function (isAppear, index) {
            charsIndex[char][index] = isAppear;
            if (index < minCharNotAppearIndex || index >= maxCharNotAppearIndex) {
                return;
            }

            notAppearIndexMap = (isAppear ? '1' : '0') + notAppearIndexMap;
        });

        binaryCharsIndex[char] = parseInt(notAppearIndexMap,2);
    }

    return binaryCharsIndex;
    // return {
    //     binaryCharsIndex: binaryCharsIndex,
    //     charsIndex: charsIndex
    // };
}

function _getWordsAllowedSums(allWordsArr) {
    var sumMap = {};
    allWordsArr.forEach(function (word) {
        var wordSum = wordSumOffset;

        var charArr = word.split('');
        charArr.forEach(function (char) {
            wordSum += char.charCodeAt(0);
        });

        sumMap[wordSum] = true;
    });
    var arr = Object.keys(sumMap).map(function (item) {
        return +item;
    });
    arr = arr.sort(function (item1, item2) {
        return item1 - item2;
    });

    return arr;
}

function _getCharsCombinationsIndexesNotAppear(allWordsArr) {
    var existingCharsCombinationsIndexesMap = {};
    var allChars = _getAllChars().sort(function (char1, char2) {
        return char1.charCodeAt(0) - char2.charCodeAt(0);
    });
    /************************* creating existing indexes of chars combinations****************************/
    (function () {
        // return;
        allChars.forEach(function (char, index) {
            existingCharsCombinationsIndexesMap[char] = {};
            for (var i = index; i < allChars.length; i++) {
                var appendedChar = allChars[i];
                existingCharsCombinationsIndexesMap[char][appendedChar] = [];
            }
        });

        allWordsArr.forEach(function (word, index) {
            console.log('starting', index);
            for (var i in word) {
                if (i > indexLimit) {
                    return;
                }

                var char1 = word[i];
                for (var i2 = +i + 1; i2 < word.length && i2 <= indexLimit; i2++) {
                    var char2 = word[i2];
                    var sortedCharsArr = [char1, char2].sort(function (char1, char2) {
                        return char1.charCodeAt(0) - char2.charCodeAt(0);
                    });
                    var minChar = sortedCharsArr[0];
                    var maxChar = sortedCharsArr[1];

                    var combinationIndexKey = minChar === char1 ? '' + i + '-' + i2 : '' + i2 + '-' + i;
                    var combinationIndexArr = existingCharsCombinationsIndexesMap[minChar][maxChar];
                    if (combinationIndexArr.indexOf(combinationIndexKey) === -1) {
                        combinationIndexArr.push(combinationIndexKey);
                    }
                }
            }
        });

        fs.writeFileSync('test.txt', JSON.stringify(existingCharsCombinationsIndexesMap));
        console.log('saved');
    })();
    /************************* END creating existing indexes of chars combinations****************************/

    (function () {
        existingCharsCombinationsIndexesMap = JSON.parse(fs.readFileSync('test.txt', 'utf-8'));
        GLOBAL.notExistingCharsIndexMap = {};
        var charsKeys = Object.keys(existingCharsCombinationsIndexesMap);
        charsKeys.forEach(function (char) {
            notExistingCharsIndexMap[char] = {};
            var existingIndexesCombinationForCharMap = existingCharsCombinationsIndexesMap[char];
            var keys = Object.keys(existingIndexesCombinationForCharMap);
            keys.forEach(function (appendedChar) {
                notExistingCharsIndexMap[char][appendedChar] = {
                    i: []
                };

                var existingIndexesForCharsCombination = existingIndexesCombinationForCharMap[appendedChar];

                var maxIndex = 0;
                existingIndexesForCharsCombination.forEach(function (index) {
                    var indexArr = index.split('-');
                    maxIndex = Math.max(+indexArr[0], +indexArr[1], maxIndex);
                });
                maxIndex = Math.min(maxIndex, indexLimit);

                notExistingCharsIndexMap[char][appendedChar].m = maxIndex;

                for (var i = 0; i <= indexLimit && i <= maxIndex; i++) {
                    for (var i1 = 0; i1 <= indexLimit && i1 <= maxIndex; i1++) {
                        if (i === i1) {
                            continue;
                        }

                        if (char === '\'' && appendedChar === '\'' && Math.abs(+i - i1) === 1) {
                            continue;
                        }

                        if ((char === '\'' && +i === 0) || (appendedChar === '\'' && +i1 === 0)) {
                            continue;
                        }

                        var itrIndex = '' + i + '-' + i1;
                        if (existingIndexesForCharsCombination.indexOf(itrIndex) === -1) {
                            notExistingCharsIndexMap[char][appendedChar].i.push(itrIndex);
                        }
                    }
                }
            });
        });
        fs.writeFileSync('temp.txt', JSON.stringify(notExistingCharsIndexMap));
    })();
    console.log('done');
    return notExistingCharsIndexMap;
}

function _getCompressedVocabularyStr(wordsMap, allWordsArr) {
    var compressedWordsMap = {};

    var addWord = (() => {
        var enteredWordsMap = {};
        var wordsToIgnore = [];
        return function (word, numOfContainingWords) {
            if (!enteredWordsMap[word] && wordsToIgnore.indexOf(word) === -1) {
                enteredWordsMap[word] = true;
                compressedWordsMap[word] = numOfContainingWords;
            }
        }
    })();

    var wordsWhichContainedInOtherWords = {};
    allWordsArr.forEach(function (word) {
        var partialWordArr = word.split('');
        var preLastIndex = partialWordArr.length - 2;

        if (partialWordArr[preLastIndex] === '\'') {
            partialWordArr.splice(preLastIndex, 1);
        }

        while (partialWordArr.length > 1) {
            partialWordArr.pop();
            var partialWord = partialWordArr.join('');
            if (wordsMap[partialWord]) {
                var currLongestContainingWord = wordsWhichContainedInOtherWords[partialWord];
                if (!currLongestContainingWord || currLongestContainingWord.length < word.length) {
                    wordsWhichContainedInOtherWords[partialWord] = word;
                }
            } else {
                break;
            }
        }
    });

    var containingWordsKeys = Object.keys(wordsWhichContainedInOtherWords);
    containingWordsKeys = containingWordsKeys.sort(function (str1, str2) {
        return str1.length - str1.length;
    });
    var mappedWords = {};
    containingWordsKeys.forEach(function (containedWord) {
        var containingWord = wordsWhichContainedInOtherWords[containedWord];
        var subStrArr = containingWord.split('');
        var preLastIndex = subStrArr.length - 2;

        if (subStrArr[preLastIndex] === '\'') {
            subStrArr.splice(preLastIndex, 1);
        }

        var numOfContainedWords = 0;
        var enteredWords = [];
        for (var i = subStrArr.length - 1; i > 0; i++) {
            subStrArr.pop();
            var partialWord = subStrArr.join('');

            if (!wordsMap[partialWord]) {
                break;
            }

            if (!mappedWords[partialWord]) {
                enteredWords.push(partialWord);
                mappedWords[partialWord] = true;
                numOfContainedWords++;
            } else {
                break;
            }
        }
        //limit by contained number of words
        // if (numOfContainedWords < 2 || (numOfContainedWords === 2 && !((++shouldBeEntered) % 3 === 0))) {
        //     return;
        // }

        //limit by words per char ratio
        var wordsPerCharRatio = numOfContainedWords / containingWord.length;
        if (wordsPerCharRatio > 0.43) {
            addWord(containingWord, numOfContainedWords);
        } else {
            enteredWords.forEach(function (enteredWord) {
                delete mappedWords[enteredWord];
            });
        }

    });

    return compressedWordsMap;
}

function _getCharsAppearanceStatusByWordLength(allWordsArr){
    var charsAppearanceStatusByWordLength = {
        len:{}
    };

    var ret = {
        len:{}
    };

    (function(){
        // return;
        function _addChars(chars, length){
            var sortedChars = chars.split('').sort(function(char1, char2){
                return char1.charCodeAt(0) - char2.charCodeAt(0);
            }).join('');

            if(!ret[sortedChars]){
                ret[sortedChars] = 0
            }
            ret[sortedChars] = Math.max(ret[sortedChars], length);

            charsAppearanceStatusByWordLength.len[length][sortedChars] = true;
        }

        allWordsArr.forEach(function(word, index){
            console.log('next', index);
            if(!charsAppearanceStatusByWordLength.len[word.length]){
                charsAppearanceStatusByWordLength.len[word.length] = {};
            }

            for(var i=0; i<word.length; i++){
                _addChars(word[i], word.length);

                for(var i1=i+1; i1<word.length; i1++){
                    _addChars(word[i] + word[i1], word.length);
                }
            }
        });

        fs.writeFileSync('wordLength.txt', JSON.stringify({
            charsAppearanceStatusByWordLength: charsAppearanceStatusByWordLength,
            ret: ret
        }));
    })();

    var fromFile = JSON.parse(fs.readFileSync('wordLength.txt', 'utf-8'));
    ret = fromFile.ret;
    charsAppearanceStatusByWordLength = fromFile.charsAppearanceStatusByWordLength;

    var allChars = _getAllChars();

    _.mapObject(charsAppearanceStatusByWordLength.len,function(charAppearStatusMap, length){
        function _processChars(chars){
            var sortedChars = chars.split('').sort(function(char1, char2){
                return char1.charCodeAt(0) - char2.charCodeAt(0);
            }).join('');

            if(ret[sortedChars] === 60 || (sortedChars[0] === "'" && sortedChars[1] === "'")){
                delete ret[sortedChars];
            }

            if(!charAppearStatusMap[sortedChars]){
                if(+length < sortedChars.length || ((sortedChars === "'" || sortedChars[0] === "'" || sortedChars[1] === "'") && (length === '1' || length === '2'))){
                    return;
                }

                if(!ret.len[length]){
                    ret.len[length] = [];
                }

                ret.len[length].push(sortedChars);
            }
        }
        allChars.forEach(function(char){
            _processChars(char);
            allChars.forEach(function(char1){
                _processChars(char + char1);
            });
        });
    });
    return ret;
}

function build() {
    var file = fs.readFileSync('words.txt');

    var tmpData = file.toString().replace(/\r/g, '').split('\n');

    var mainFileName = 'compressedData.txt';
    try {
        fs.unlinkSync(mainFileName);
        console.log(new Date(), 'file ' + mainFileName + ' was deleted');
    } catch (err) {

    }

    var wordsStr = '';

    var wordsMap = {};
    var allWordsArr = [];

    tmpData.forEach(function (word) {
        word = word.toLowerCase();

        if (wordsMap[word]) {
            return
        }

        if (word.indexOf("''") !== -1) {
            console.log();
        }

        if (word.length) {
            wordsMap[word] = true;
            allWordsArr.push(word);
        }
    });

    wordsStr += JSON.stringify(_getIllegalCombinationsStr(allWordsArr)) + '##';

    wordsStr += JSON.stringify(_getIndexesCharsNotAppearStr(allWordsArr)) + '##';

    wordsStr += JSON.stringify(_getWordsAllowedSums(allWordsArr)) + '##';

    wordsStr += JSON.stringify(_getCharsCombinationsIndexesNotAppear(allWordsArr)) + '##';

    // wordsStr += JSON.stringify(_getCompressedVocabularyStr(wordsMap, allWordsArr));

    wordsStr += JSON.stringify(_getCharsAppearanceStatusByWordLength(allWordsArr));

    console.log(new Date(), 'writing to file');
    fs.writeFileSync(mainFileName, wordsStr);
    console.log(new Date(), 'finished writing');

    console.log(new Date(), 'compressing');
    var buf = new Buffer(wordsStr);   // Choose encoding for the string.
    var result = zlib.gzipSync(buf, {
        level: zlib.Z_BEST_COMPRESSION
    });
    fs.writeFileSync('compressedData.txt.gz', result);
    console.log(new Date(), 'finished compressing');
}

module.exports.build = build;