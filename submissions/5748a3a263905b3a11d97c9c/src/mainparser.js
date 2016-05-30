var words = require('./data/lowerWords.json');
var fs = require('fs');

var
    result = {
        length: {},
        firstChar: {},
        lastChar: {},
        firstPair: {},
        lastPair: {},
        numberOfVowel: {},
        numberOfConsonant: {},
        vowelSuccession: {},
        consonantSuccession: {},
        numberOfPairs: {}
    },
    consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'],
    vowels = ['a', 'e', 'i', 'o', 'u', 'y'];

words.forEach(function (word) {
    var
        values = {
            length: word.length,
            firstChar: word.slice(0, 1),
            lastChar: word.slice(-1),
            firstPair: word.length >= 2 ? word.slice(0, 2) : undefined,
            lastPair: word.length >= 2 ? word.slice(-2) : undefined,
            numberOfVowel: 0,
            numberOfConsonant: 0,
            vowelSuccession: 0,
            consonantSuccession: 0
        },
        prevVowel = false,
        prevConsonants = false,
        tmpVowelCounter = 0,
        tmpConsonantsCounter = 0;

    word.split('').forEach(function (char) {
        if (vowels.indexOf(char) !== -1) {
            values.numberOfVowel++;

            if (prevVowel) {
                tmpVowelCounter++;
            } else {
                tmpVowelCounter = 1;
            }

            if (tmpVowelCounter > values.vowelSuccession) {
                values.vowelSuccession = tmpVowelCounter;
            }

            prevVowel = true;
            prevConsonants = false;
        } else if (consonants.indexOf(char) !== -1) {
            values.numberOfConsonant++;

            if (prevConsonants) {
                tmpConsonantsCounter++;
            } else {
                tmpConsonantsCounter = 1;
            }

            if (tmpConsonantsCounter > values.consonantSuccession) {
                values.consonantSuccession = tmpConsonantsCounter;
            }

            prevVowel = false;
            prevConsonants = true;
        }
    });

    values.numberOfPairs = word.length >= 2 ? Math.floor(word.length / 2) : 0;

    for (var key in result) {
        addValue(result[key], values[key]);
    }
});

for(var key in result){
    getPercent(result[key]);
}

fs.writeFile('./properties/data.json', JSON.stringify(result));

function addValue(obj, value) {
    if (value !== undefined) {
        value = value + '';

        if (obj[value]) {
            obj[value]++;
        } else {
            obj[value] = 1;
        }
    }
}

function getPercent(obj) {
    for (var key in obj) {
        obj[key] = ((obj[key] / words.length) * 100).toFixed(4);
    }
}