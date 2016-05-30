var options = {
    mainFilterSize: 50*1024,
    mainPrefixLength: 7,
    ngramFilterSize: 20*1024,
    ngramFilterCount: 7,
    ngramLength: 3,
    ngramStep: 2,
    minWordLength: 4,
    maxWordLength: 20
};

function hashCodeFactory(initHash) {
    if (undefined === initHash) initHash = 13;
    return function(str) {
        var hash = initHash;
        for (i = 0; i < str.length; i++)
            hash = (hash * 33) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
}

function isBadWord(word) {
    return (word.length < options.minWordLength || word.length > options.maxWordLength);
}

var modelData;
var hashFunction = hashCodeFactory();


module.exports.init = function init(data) {
    modelData = data;
};

module.exports.test = function test(word) {

    if (isBadWord(word))
        return false;

    var idx = (hashFunction(word.substr(0,options.mainPrefixLength)) >>> 0) % (options.mainFilterSize*8);
    if (!(modelData[Math.floor(idx/8)]  & (1<<(idx % 8)))) {
        return false;
    }

    for(var i= 0, filterIndex=0; i < word.length-options.ngramLength && filterIndex < options.ngramFilterCount; i+=options.ngramStep, ++filterIndex) {
        var ngram = word.substr(i,options.ngramLength);
        if (ngram.length<1) break;
        base = options.mainFilterSize + filterIndex * options.ngramFilterSize;
        idx = ((hashFunction(ngram) >>> 0) % (options.ngramFilterSize*8));

        if (!(modelData[base+Math.floor(idx/8)]  & (1<<(idx % 8))))
            return false;

    }

    return true;
};
