const
    _ = require('lodash'),
    zlib = require('zlib'),
    fs = require('fs');

const
    BITMAP_FILE = "dictionary.zip",
    HASH_STRENGTH = 0x7ffff,
    LENGTH_GROUPS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,45,58,60];

const stem = function(word){
    let processedWord = word.trim().toLowerCase();
    processedWord = word.length > 4 ? word.replace(/([']?s|ed|ing|ish|est|ness|ly|sm|er|ship|ous|tude|th|wise|tude|let)$/i, '').replace(/[aeiou]/g, '') : word;
    return processedWord.length > 0 ? processedWord : word;
};

const hash = function(str){
    return str
        .trim()
        .toLowerCase()
        .split('')
        .map((letter)=>letter.charCodeAt(0))
        .reduce((hash, letterCode)=>((((hash << 6) - hash) + letterCode) & HASH_STRENGTH));
};

let words = _(fs
    .readFileSync('./words.txt', 'ascii')
    .split('\r\n'))
    .map(stem)
    .uniq()
    .filter(_.negate(_.isEmpty))
    .value();

let hashEnglishDictionary = _(words).groupBy(hash).value(),
    hashBitmap = _(_.range(HASH_STRENGTH)).map((index)=>(!!hashEnglishDictionary[index] ? 1 : 0)).value();

zlib.gzip(new Buffer(_(hashBitmap).chunk(8).map((arr)=>arr.reduce((byte, v)=>byte<<1|v)).value()), { level: zlib.Z_BEST_COMPRESSION }, function(err, data){
    fs.writeFileSync(BITMAP_FILE, data);
});

// Calculate score
let testCase = require('./data/tests.json');
let hashEnglishDictionaryArray = _.keys(hashEnglishDictionary).map(Number).sort((a,b)=>a-b);
let score = _(testCase).map(function(isEnglish, word){
    return ((!!~LENGTH_GROUPS.indexOf(word.length) && !!~hashEnglishDictionaryArray.indexOf(hash(stem(word))))) === isEnglish;
}).value();

console.log('Score is %d%', _.compact(score).length / score.length * 100);