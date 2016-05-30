var fs = require('fs');

var outputFile = './data';
var dictionaryFile = './words.txt';

var dictionaryObject = {};

function twoLetterArray() {
    'use strict';
    var a = 97,
        z = 122,

        i = a,
        j = a,
        result = [];

    for (i; i <= z; i += 1) {
        j = a;
        for (j; j <= z; j += 1) {
            result.push(String.fromCharCode(i) + String.fromCharCode(j));
        }

        result.push('\'' + String.fromCharCode(i));
        result.push(String.fromCharCode(i) + '\'');
    }

    // length: 728

    return result;
}

function onLoadDictionary(err, data) {
    'use strict';
    if (err) {
        throw err;
    }

    var dataArray = data.split('\n');
    var dataArrayLen = dataArray.length;

    var outputData = '';

    var word = '';
    var wordLen = 0;
    var wordArr = [];

    var twoLettersObject = {
        even: {},
        odd: {}
    };

    var i = 0;
    var j = 0;
    var position;

    for (i; i < dataArrayLen; i += 1) {
        word = dataArray[i].toLowerCase();
        wordLen = word.length;
        wordArr = [];

        if (wordLen <= 1) {
            continue;
        }

        wordArr = word.match(/[a-z\']{1,2}/g);
        
        for (j = 0; j < wordArr.length; j += 1) {
            if (j <= 6) {
                if (twoLettersObject['even'][j] === undefined) {
                    twoLettersObject['even'][j] = twoLetterArray();
                }
                position = twoLettersObject['even'][j].indexOf(wordArr[j])
                if (position !== -1) {
                    twoLettersObject['even'][j].splice(position, 1);
                }
            } else {
                if (twoLettersObject['even'][j] === undefined) {
                    twoLettersObject['even'][j] = [];
                }
                if (twoLettersObject['even'][j].indexOf(wordArr[j]) === -1) {
                    twoLettersObject['even'][j].push(wordArr[j]);
                }
            }
        }

        word = word.substr(1);
        wordLen = word.length;

        if (wordLen <= 1) {
            continue;
        }

        wordArr = word.match(/[a-z\']{1,2}/g);

        // TODO: merge cloned code into one separate method
        for (j = 0; j < wordArr.length; j += 1) {
            if (j <= 5) {
                if (twoLettersObject['odd'][j] === undefined) {
                    twoLettersObject['odd'][j] = twoLetterArray();
                }
                position = twoLettersObject['odd'][j].indexOf(wordArr[j])
                if (position !== -1) {
                    twoLettersObject['odd'][j].splice(position, 1);
                }
            } else {
                if (twoLettersObject['odd'][j] === undefined) {
                    twoLettersObject['odd'][j] = [];
                }
                if (twoLettersObject['odd'][j].indexOf(wordArr[j]) === -1) {
                    twoLettersObject['odd'][j].push(wordArr[j]);
                }
            }
        }
    }

    outputData = JSON.stringify(twoLettersObject);    
    console.log('* data prepared');

    fs.writeFile(
        outputFile,
        outputData,
        function () {
            console.log('* data saved');
            console.log('* file size: ' + outputData.length);
        }
    );
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

    console.log('* initializing...');
    loadDictionary();
}

init();