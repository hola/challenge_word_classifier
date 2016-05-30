

'use strict';
var dictionary = new Set();
var init_dictionary = new Set();
var prefixes  = new Set();
var words = new Set();
var suffixes = new Set();
var unpatterns = new Set();
var true_patterns = new Set();

const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
    'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', "'"];

/*
 const vowels = new Set('a', 'o', 'u', 'i', 'e');
 */

let patterns = [];

module.exports = {
    init: (data)=> {
        let text = data.toString();
        let initData = text.split('\n');
        prefixes = new Set(initData[0].split('\t'));
        let prefix_words = initData[1].split('\t');
        words = new Set(prefix_words);
        suffixes = new Set(initData[2].split('\t'));
        unpatterns = new Set(initData[3].split('\t'));
        initData.splice(0, 4);
        initPatterns();
        initStartDictionary(prefix_words, initData);
        refillUnpatterns();
        /*
         bad_blocks = blocks;
         */
    },

    test: (word)=> {
        word = word.toLowerCase();

        let pos_apostrophe = word.indexOf('\'');
        if (pos_apostrophe != -1 && pos_apostrophe != word.length - 2
            || pos_apostrophe != -1 && pos_apostrophe == word.length - 2 && word[word.length - 1] != 's')
            return false;

        if ((word.length == 5 || word.length == 4) && !~word.indexOf('\''))
            return init_dictionary.has(word);


        if (isWordInDictionary(word))
            return true;

        let word_s = '';
        if (word.lastIndexOf('\'s') == word.length - 2 && word.length > 2)
            word_s = word.substr(0, word.length - 2);

        if (word_s && isWordInDictionary(word_s))
            return true;

        if (cutOffPrefix(word, 11) || cutOffPrefix(word, 10) || cutOffPrefix(word, 9) || cutOffPrefix(word, 8) || cutOffPrefix(word, 7)
            || cutOffPrefix(word, 6) || cutOffPrefix(word, 5) || cutOffPrefix(word, 4) || cutOffPrefix(word, 3) || cutOffPrefix(word, 2))
            return true;

        if (word.length > 7) {

            if (cutOffSuffix(word, 13) || cutOffSuffix(word, 12) || cutOffSuffix(word, 11) || cutOffSuffix(word, 10) || cutOffSuffix(word, 9)
                || cutOffSuffix(word, 8) || cutOffSuffix(word, 7) || cutOffSuffix(word, 6) || cutOffSuffix(word, 5) || cutOffSuffix(word, 4) || cutOffSuffix(word, 3))
                return true;

            if (cutOffPrefix(word, 4, 'prefix') || cutOffPrefix(word, 3, 'prefix') || cutOffPrefix(word, 2, 'prefix'))
                return true;
            if (dictionary.size > 122000) {
                return false;
            }
            // return cutOffPrefix(word, 4, 'prefix') || cutOffPrefix(word, 3, 'prefix') || cutOffPrefix(word, 2, 'prefix');
        }

        if (word.length >= 13)
            return false;

        if (checkPatternSet(word))
            return false;


        /*  if (checkBlockSet(word))
         return false;

         */
        /* if (!consist_Pattern(word, 4))
         return false;
         */


        if (word.length < 3 && !~word.indexOf('\''))
            return true;

        // return testPuasson(word, puassonHash) >= 2;
        return word.length > 5;
    }
};

function  initPatterns() {
    let pos = 0;
    for (let i = 0; i < alphabet.length; i++) {
        if (pos == 10 || pos == 13) {
            patterns.push('');
            i--;
        } else {
            patterns.push(alphabet[i]);
        }
        pos++;
    }

    for (let i = 0; i < alphabet.length; i++) {
        for (let j = 0; j < alphabet.length; j++) {
            let pattern = alphabet[i] + alphabet[j];
            if (!unpatterns.has(pattern)) {
                patterns.push(pattern);
            }
        }
    }

    for (let i = 0; i < alphabet.length; i++) {
        for (let j = 0; j < alphabet.length; j++) {
            for (let k = 0; k < alphabet.length; k++) {
                patterns.push(alphabet[i] + alphabet[j] + alphabet[k]);
            }
        }
    }
}

function refillUnpatterns() {
    for (let i = 0; i < alphabet.length; i++) {
        for (let j = 0; j < alphabet.length; j++) {
            for (let k = 0; k < alphabet.length; k++) {
                let pattern = alphabet[i] + alphabet[j] + alphabet[k];
                if (!unpatterns.has(pattern) && !unpatterns.has(alphabet[i] + alphabet[j]) && !unpatterns.has(alphabet[j] + alphabet[k])) {
                    init_dictionary.add(pattern);
                }
            }
        }
    }
}

function initStartDictionary(prefix_words, encoded_data) {
    init_dictionary = new Set(prefix_words);
    encoded_data.forEach((code)=> {
        let idx = code.charCodeAt(0);
        let subword = patterns[idx];
        for (let i = 1; i < code.length; i++) {
            let _idx = code.charCodeAt(i);
            let endWord = patterns[_idx];
            let word = subword + endWord;
            if (word.length == 3)
                unpatterns.add(word);
            else
                init_dictionary.add(word);
        }
    });
}

function cutOffPrefix(word, prefixLength, detail) {
    let prefix = word.substr(0, prefixLength);
    let dataLocation = (detail) ? prefixes : words;
    if (dataLocation.has(prefix))
        return isWordInDictionary(word.substr(prefixLength));
    return false;
}

function cutOffSuffix(word, suffixLength) {
    let suffix = word.substr(word.length - suffixLength);
    if (suffixes.has(suffix))
        return isWordInDictionary(word.substr(0, word.length - suffixLength));
    return false;
}

function isWordInDictionary(word) {
    if (dictionary.has(word) || init_dictionary.has(word))
        return true;
    else
        dictionary.add(word);
    return false;
}

function checkPatternSet(word) {
    if (!consistPattern(word, 2)){
        return consistPattern(word, 3);
    }
    return true;
}

function consistPattern(word, numSymbols){
    let patternLength = word.length - (numSymbols - 1);
    for (let i = 0; i < patternLength; i++) {
        if (unpatterns.has(word.substr(i, numSymbols)))
            return true;
    }
    return false;
}
/*
 function consist_Pattern(word, numSymbols){
 let patternLength = word.length - (numSymbols - 1);
 for (let i = 0; i < patternLength; i++) {
 let subword = word.substr(i, numSymbols);
 if (similarChars(subword) && !patterns_4.has(word.substr(i, numSymbols)))
 return false;
 }
 return true;
 }*/

/*function consistVowels(word, numSymbols){
 let patternLength = word.length - (numSymbols - 1);
 for (let i = 0; i < patternLength; i++) {
 if (vowels.has(word.substr(i, numSymbols)))
 return true;
 }
 return false;
 }*/

/*function similarChars (str) {
 let last = 0;
 for (let i = 0; i < str.length; i++) {
 let mod = (vowels[str[i]]) ? 1 : -1;
 if (last == 0) {
 last = mod;
 } else {
 if (last != mod) return false;
 }
 }
 return true;
 }*/

/*
 function checkBlockSet(word) {
 if (!consistBlock(word, 2)){
 if (!consistBlock(word, 3)) {
 if(!consistBlock(word, 4)) {
 return consistPattern(word, 5);
 }
 }
 }
 return true;
 }

 function consistBlock(word, numSymbols){
 let patternLength = word.length - (numSymbols - 1);
 for (let i = 0; i < patternLength; i++) {
 if (bad_blocks.has(word.substr(i, numSymbols)))
 return true;
 }
 return false;
 }
 */




/*

 function analyseSequencesPatterns(word, numSymbols) {
 let pattern_length = word.length - (numSymbols - 1);
 word = word + '0';
 if (word.length >= numSymbols) {
 for (let i = 0; i < pattern_length; i++) {
 let subword = word.substr(i, numSymbols);
 /!* console.log('word: ', word)
 console.log('subword: ', sequences_patterns[subword])*!/

 if (sequences_patterns[subword] && !sequences_patterns[subword].has(word[i + numSymbols])) {
 return false;
 }
 }
 }
 return true;
 }*/


function testPuasson (word, hash) {
    let head = word.slice(0,2);
    let tail = word.slice(2);
    let result = 1;
    let len = word.length;
    if (!hash[head]) return -1;
    if (!hash[head][len]) {
        // console.log('--not', head, len, hash[head]);
        return -3;
    }
    for (let i = 0; i < tail.length; i++) {
        if (!hash[head][len][tail[i]]) return -2;
        result += hash[head][len][tail[i]];
    }
    // console.log('--', result);
    return result*10;
}