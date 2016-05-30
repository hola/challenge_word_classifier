/*global
    module
*/
var initialized = false;
var dictionaryObject = {};

var reversed = {
    even: [0, 1, 2, 3, 4, 5, 6],
    odd: [0, 1, 2, 3, 4, 5]
};

function check(word, type) {
    'use strict';
    var wordArr = [],
        result = true,
        i = 0;

    if (word.length === 1) {
        return result;
    }

    wordArr = word.match(/[a-z\']{1,2}/g);

    for (i; i < wordArr.length; i += 1) {
        if (reversed[type].indexOf(i) !== -1) {
            if (dictionaryObject[type][i].indexOf(wordArr[i]) !== -1) {
                result = false;
                break;
            }
        } else {
            if (dictionaryObject[type][i].indexOf(wordArr[i]) === -1) {
                result = false;
                break;
            }
        }
    }

    return result;
}

function test(word) {
    'use strict';
    var result = true;

    word = word.toLowerCase();
    result = check(word, 'even');

    if (result) {
        word = word.substr(1);
        result = check(word, 'odd');
    }

    return result;
}

function init(data) {
    'use strict';
    if (data instanceof Buffer) {
        dictionaryObject = JSON.parse(data.toString('utf-8'));
        initialized = true;
    } else {
        throw 'data expected to be Buffer';
    }
}

module.exports = {
    init: init,
    test: test
};