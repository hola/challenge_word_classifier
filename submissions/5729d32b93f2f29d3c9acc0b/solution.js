/*global
    require console module
*/
var fs = require('fs');

var initialized = false;

var dictionaryFile = './words.txt';
var dictionaryObject = {};

var onInitLoaded = function () {};

var endPoint = '_e';

function test(word) {
    'use strict';
    if (!initialized) {
        console.log('Use \'init()\' method before start testing words');
        return false;
    }

    var dictionaryObjectRef = dictionaryObject;
    var wordLen = 0;
    var result = true;
    var i = 0;

    word = word.toLowerCase();
    wordLen = word.length;

    for (i; i < wordLen; i += 1) {
        if (dictionaryObjectRef[word[i]] instanceof Object) {
            dictionaryObjectRef = dictionaryObjectRef[word[i]]
        } else {
            result = false;
            break;
        }
        if (wordLen === (i + 1)) {
            if (!dictionaryObjectRef[endPoint]) {
                result = false;
            }
        }
    }

    return result;
}

function onLoadDictionary(err, data) {
    'use strict';
    if (err) {
        throw err;
    }

    var dataArray = data.split('\n');
    var dataArrayLen = dataArray.length;

    var word = '';
    var wordLen = 0;
    var dictionaryObjectRef = {};

    var i = 0;
    var j = 0;

    for (i; i < dataArrayLen; i += 1) {
        dictionaryObjectRef = dictionaryObject;

        word = dataArray[i].toLowerCase();
        wordLen = word.length;

        for (j = 0; j < wordLen; j += 1) {
            if (!(dictionaryObjectRef[word[j]] instanceof Object)) {
                dictionaryObjectRef[word[j]] = {};
            }

            dictionaryObjectRef = dictionaryObjectRef[word[j]];

            if (wordLen === (j + 1)) {
                dictionaryObjectRef[endPoint] = true;
            }
        }
    }

    initialized = true;
    console.log('* dictionary loaded');

    onInitLoaded();
}

function loadDictionary() {
    'use strict';
    fs.readFile(
        dictionaryFile,
        'utf8',
        onLoadDictionary
    );
}

function init() {
    'use strict';

    function then(resolve) {
        onInitLoaded = resolve;
    }

    console.log('* initialing...');
    loadDictionary();

    return {
        then: then
    };
}

module.exports = {
    init: init,
    test: test
};