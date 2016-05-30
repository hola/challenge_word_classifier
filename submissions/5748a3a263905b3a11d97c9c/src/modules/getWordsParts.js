function getWordsParts(word, number) {
    var
        result = [],
        start = 0,
        end = number;

    for (var i = 0; i < Math.floor(word.length / number); i++) {
        if (end <= word.length) {
            result.push(word.slice(start, end));
        }
        
        start += number;
        end += number;
    }

    return result;
}

module.exports = getWordsParts;