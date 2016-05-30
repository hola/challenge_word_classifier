var propertiesData = require('./properties/data.json');

function test(word, minPercents) {
    
    if(/[a-z]+'[a-z]+'[a-z]+/.test(word) || /^'|'$/.test(word)) return false;

    if (word.length === 1) return /[a-z]/.test(word);
    
    if(/'s/.test(word) && !/'s$/.test(word)) return false;

    var
        consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'],
        vowels = ['a', 'e', 'i', 'o', 'u', 'y'];

    var properties = {
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

    properties.numberOfPairs = word.length >= 2 ? Math.floor(word.length / 2) : null;

    word.split('').forEach(function (char) {

        if (vowels.indexOf(char) !== -1) {
            properties.numberOfVowel++;

            if (prevVowel) {
                tmpVowelCounter++;
            } else {
                tmpVowelCounter = 1;
            }

            if (tmpVowelCounter > properties.vowelSuccession) {
                properties.vowelSuccession = tmpVowelCounter;
            }

            prevVowel = true;
            prevConsonants = false;
        } else if (consonants.indexOf(char) !== -1) {
            properties.numberOfConsonant++;

            if (prevConsonants) {
                tmpConsonantsCounter++;
            } else {
                tmpConsonantsCounter = 1;
            }

            if (tmpConsonantsCounter > properties.consonantSuccession) {
                properties.consonantSuccession = tmpConsonantsCounter;
            }

            prevVowel = false;
            prevConsonants = true;
        }
    });

    var percents = [];

    for (var key in properties) {
        percents.push(+propertiesData[key][properties[key]]);
    }

    for (var i = 0; i < percents.length; i++) {
        if (percents[i] < minPercents[i][1]) return false;
    }

    return true;
}


module.exports.test = test;
