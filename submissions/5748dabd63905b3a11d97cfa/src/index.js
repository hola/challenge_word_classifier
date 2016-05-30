GLOBAL.indexLimit = 25;
GLOBAL.minCharNotAppearIndex = 14;
GLOBAL.maxCharNotAppearIndex = 30;
GLOBAL.wordSumOffset = -100;

var illegalCombinationsArr,
    charsCombinationsIndexesNotAppearMap,
    charsIndexNotAppearMap,
    allowedSumArr,
    vocabularyMap = {},
    charsNotAppearedByLength;

var summary = {};
module.exports.summary = summary;

function _decompressCharsIndex(indexCharNotAppearMapCompressed) {
    _charsIndexNotAppearMap = {};
    var keys = Object.keys(indexCharNotAppearMapCompressed);
    keys.forEach(function (char) {
        _charsIndexNotAppearMap[char] = {};

        var decimalCharIndex = indexCharNotAppearMapCompressed[char];

        var binaryCharIndex = (+decimalCharIndex).toString(2);

        for (var i = binaryCharIndex.length - 1, i1 = 0; i >= 0; i--, i1++) {
            var isNotAppearUnderThisIndex = binaryCharIndex[i] === '0';

            if (isNotAppearUnderThisIndex) {
                var indexOffset = minCharNotAppearIndex;
                _charsIndexNotAppearMap[char][i1 + indexOffset] = true;
            }
        }
    });
    return _charsIndexNotAppearMap;
}

function _decompressVocabulary(compressedVocabulary) {
    var _vocabularyMap = {};

    var keys = Object.keys(compressedVocabulary);
    keys.forEach(function (compressedWords) {
        _vocabularyMap[compressedWords] = true;
        var numOfContainedWords = compressedVocabulary[compressedWords];
        var compressedWordsArr = compressedWords.split('');

        var preLastIndex = compressedWordsArr.length - 2;
        if(compressedWordsArr[preLastIndex] === '\''){
            compressedWordsArr.splice(preLastIndex,1);
        }
        for (var i = 0; i < numOfContainedWords; i++) {
            compressedWordsArr.pop();
            var word = compressedWordsArr.join('');
            _vocabularyMap[word] = true;
        }
    });

    return _vocabularyMap;
}

function init(_data) {
    var dataStr = _data.toString();
    var tmpDataArr = dataStr.split('##');

    illegalCombinationsArr = JSON.parse(tmpDataArr.splice(0, 1)[0]);
    charsIndexNotAppearMap = _decompressCharsIndex(JSON.parse(tmpDataArr.splice(0, 1)[0]));
    allowedSumArr = JSON.parse(tmpDataArr.splice(0, 1)[0]);
    allowedSumArr = allowedSumArr.map(function (sum) {
        return sum - wordSumOffset;
    });
    charsCombinationsIndexesNotAppearMap = JSON.parse(tmpDataArr.splice(0, 1)[0]);
    // vocabularyMap = _decompressVocabulary(JSON.parse(tmpDataArr.splice(0, 1)[0]));
    charsNotAppearedByLength = JSON.parse(tmpDataArr.splice(0, 1)[0]);
}
module.exports.init = init;

function test(word) {
    var ret;
    var charArr = word.split('');

    if (word.length > 60) {
        if(!summary.simple){
            summary.simple = 0;
        }
        summary.simple++;
        ret = false;
    }
    //sum
    var wordSum = 0;
    charArr.forEach(function (char) {
        wordSum += char.charCodeAt(0);
    });
    if (allowedSumArr.indexOf(wordSum) === -1) {
        if(!summary.sum){
            summary.sum = 0;
        }
        summary.sum++;
        ret = false;
    }

    // double '' are not allowed
    if (word.indexOf("''") !== -1) {
        if(!summary.sum){
            summary.sum = 0;
        }
        summary.sum++;
        ret = false;
    }
    // ' is not appear at the beginning and end
    if (word[0] === '\'' || word[word.length - 1] === '\'') {
        if(!summary.sum){
            summary.sum = 0;
        }
        summary.sum++;
        ret = false;
    }

    // if (vocabularyMap[word]) {
    //     console.log('vocabulary');
    //     if(!summary.vocabulary){
    //         summary.vocabulary = 0;
    //     }
    //     summary.vocabulary++;
    //     ret = true;
    // }

    for (var i in illegalCombinationsArr) {
        var illegalCombination = illegalCombinationsArr[i];
        if (word.indexOf(illegalCombination) !== -1) {
            if(!summary.illegalCombination){
                summary.illegalCombination = 0;
            }
            summary.illegalCombination++;
            ret = false;
            break;
        }
    }

    for (var index in charArr) {
        var char = charArr[index];
        if (charsIndexNotAppearMap[char] && charsIndexNotAppearMap[char][index]) {
            if(!summary.charIndex){
                summary.charIndex = 0;
            }
            summary.charIndex++;
            ret = false;
            break;
        }
    }
    var charsCombinationIndexesSet;
    for (var i in word) {
        if(charsCombinationIndexesSet){
            break;
        }
        var char1 = word[i];
        for (var i1 = +i + 1; i1 < word.length; i1++) {
            if (+i1 > indexLimit) {
                break;
            }
            var char2 = word[i1];

            var sortedCharsArr = [char1, char2].sort(function (char1, char2) {
                return char1.charCodeAt(0) - char2.charCodeAt(0);
            });
            var minChar = sortedCharsArr[0];
            var maxChar = sortedCharsArr[1];

            var index = minChar === char1 ? '' + i + '-' + i1 : '' + i1 + '-' + i;

            var notExistingData = charsCombinationsIndexesNotAppearMap[minChar][maxChar];

            if (+i > notExistingData.m || +i1 > notExistingData.m || notExistingData.i.indexOf(index) !== -1) {
                if(!summary.charsCombinationIndexes){
                    summary.charsCombinationIndexes = 0;
                }
                summary.charsCombinationIndexes++;
                charsCombinationIndexesSet = true
                ret = false;
                break;
            }
        }
    }

    (function(){
        function _isValid(chars){
            var sortedChars = chars.split('').sort(function(char1, char2){
                return char1.charCodeAt(0) - char2.charCodeAt(0);
            }).join('');

            if((charsNotAppearedByLength[sortedChars] && word.length > charsNotAppearedByLength[sortedChars]) || (charsNotAppearedByLength.len[word.length] && charsNotAppearedByLength.len[word.length].indexOf(char) !== -1)){
                if(!summary.length){
                    summary.length = 0;
                }
                summary.length++;
                return false;
            }
            return true;
        }

        for(var i=0; i<charArr.length; i++){
            var char = charArr[i];
            if(!_isValid(char)){
                ret = false;
                return;
            }

            for(var i1=i + 1; i1<charArr.length; i1++){
                var char1 = charArr[i1];
                if(!_isValid(char + char1)){
                    ret = false;
                    return;
                }
            }
        }
    })();

    if(ret !== undefined){
        return ret;
    }
    
    return true;
}
module.exports.test = test;