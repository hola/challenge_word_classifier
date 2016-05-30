var CONSONANTS = 'BCDFGHJKLMNPQRSTVXZW';

function test (word) {
    if(
        (word.match(/'/g) || []).length > 1 ||
        /^'/.test(word) ||
        (/'/.test(word) && /^((?!'s).)*$/.test(word)) ||
        !consonantTest(word) ||
        word.length > 13
    ) {
        return false;
    }
    return true;
}

function consonantTest (word) {
    var counter = 0;
    for(var i in word) {
        if(CONSONANTS.indexOf(word[i].toUpperCase()) > -1) counter++; else counter = 0;
        if(counter >= 4) return false;
    }
    return true;
}

module.exports = {
    init: function(){},
    test: test
};