const
    HASH_STRENGTH = 0x7ffff,
    LENGTH_GROUPS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,45,58,60];

const stem = function(word){
    let processedWord = word.trim().toLowerCase();
    processedWord = word.length > 4 ? word.replace(/([']?s|ed|ing|ish|est|ness|ly|sm|er|ship|ous|tude|th|wise|tude|let)$/i, '').replace(/[aeiou]/g, '') : word;
    return processedWord.length > 0 ? processedWord : word;
};

const hash = function(str){
    return str
        .split('')
        .map((letter)=>letter.charCodeAt(0))
        .reduce((hash, letterCode)=>((((hash << 6) - hash) + letterCode) & HASH_STRENGTH));
};

let hashDictionary;

exports.init = function(data){
    hashDictionary = [];
    for(var byte of data){ [0,1,2,3,4,5,6,7].map((i)=>!!(byte & (0x80 >> i))).forEach((bit)=>hashDictionary.push(bit)); }
};

exports.test = function(word){
    return !!~LENGTH_GROUPS.indexOf(word.length) && (hashDictionary[hash(stem(word))]);
};