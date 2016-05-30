var bloomjs = require('./bloom.js');
var read_ngram = require('./read_ngram.js');
var read_cvgram = require('./read_cv_gram.js');

var trigram_freq;
var cv_freq;
var bloom;

exports.init  = function init(data) {
    bloom = bloomjs.init(data, 0);
    var cvgram_offset = data.readInt32BE(0);
    var ngram_offset = data.readInt32BE(cvgram_offset);
    cv_freq = read_cvgram.buffer_to_cv_gram(data, cvgram_offset);
    trigram_freq = read_ngram.buffer_to_ngram(data, ngram_offset + cvgram_offset);
}

exports.test = function test(word) {
    //convert to lower
    var lower_word = word.toLowerCase().trim();
    var result = checkLength(lower_word);
    // check if length exists
    if (result === false || result === true){
        return result;
    }

    // calculate trigram based on trigram frequencies and consonant vowel frequencies
    var trigramResult = calculateTrigram(lower_word);
    // check if it returns true or false
    if (trigramResult === true || trigramResult === false){
        return trigramResult;
    }
    var wordLength = lower_word.length;
    var trigramBoolean = checkTrigramValue(lower_word, wordLength, trigramResult);
    return trigramBoolean;
}

var checkLength = function(word) {
    //lengths that dont exist
    if ((word.length > 60 ) || (word.length === 59)){
        return false;
    }
    else if ((word.length >= 35 ) && (word.length <= 44)){
        return false;
    }
    else if ((word.length >= 46 ) && (word.length <= 57)){
        return false;
    }
    else if ((word.length >= 15 ) && (word.length <= 60))
    {
        return checkBloomFilter(word);
    }
}

var calculateTrigram = function(word) {
    var rare_start = ['bj', 'bq', 'cx', 'ej', 'ek', 'fh', 'fj', 'fk', 'fq', 'gf', 'gj', 'gx', 'gz',
        'hx', 'jb', 'jf', 'jh', 'jk', 'jl', 'jm', 'jq', 'jw', 'jx', 'kf', 'kh', 'kq', 'kx', 'kz',
        'lk', 'lq', 'mq', 'mz', 'nk', 'nn', 'nx', 'oq', 'pj', 'pz', 'qj', 'qo', 'qz', 'rk', 'rz', 'sz',
        'tf', 'tj', 'tq', 'tz', 'ue', 'uf', 'uj', 'uo', 'uq', 'uy', 'uz', 'vh', 'vk', 'vq', 'vy', 'vz',
        'wj', 'wn', 'wq', 'wx', 'wz', 'xf', 'xg', 'xh', 'xj', 'xk', 'xm', 'xy', 'xz', 'yc', 'yg', 'yh',
        'yj', 'yk', 'yl', 'yk', 'yl', 'yq', 'yw', 'yx', 'zc', 'ze', 'zf', 'zh', 'zj', 'zk', 'zl', 'zm',
        'zp', 'zq', 'zv', 'zw', 'zx'];

    var doesnt_start = ['bq', 'fk', 'gx', 'hx', 'jz', 'jq', 'jx','kx', 'kz',
        'lk', 'lq', 'mq', 'qg', 'qj', 'qx', 'qz', 'rz', 'uo', 'uq',
        'vk', 'vq', 'vz', 'wq', 'wx', 'wz', 'xg', 'xj', 'xk', 'xz',
        'yj', 'yk', 'yz', 'yx', 'zc', 'zf', 'zj', 'zx'];

    var doesnt_end = ['gz', 'jb', 'jf', 'jh', 'jq', 'jw', 'jx', 'jz', 'kq', 'kz', 'wj', 'wq', 'wz',
        'xg', 'xh', 'xj', 'xk', 'tq', 'vk', 'vq', 'vz', 'qg', 'qk', 'qj', 'qo', 'qw', 'qz', 'pz',
        'zf', 'zp', 'zq', 'zv', 'zw', 'zx', 'yj', 'yq', 'yj', 'yq', 'yw', 'mq'];
    var trigram = 0;
    var cvgram = 0;
    // treat words between 1 and 2 characters seperately
    if (word.length === 1){
        return true;
    }

    if (word.length === 2){
        if (checkInArray(word, rare_start))
        {
            return false
        }
        return true;
    }

    // words with three characters upwards
    if (checkInArray(word.substring(word.length - 2, word.length), doesnt_end)){
        return false;
    }
    if (checkInArray(word.substring(0, 2), doesnt_start)){
        return false;
    }
    if (checkInArray(word.substring(0, 2), rare_start)){
        return checkBloomFilter(word);
    }

    //non-exceptional cases
    var cv_string = convertToConsonantVowel(word);

    for(var i = 0; i < word.length; i++)
    {
        if (word.substring(i, i+3) in trigram_freq) {
            trigram -= +(trigram_freq[word.substring(i, i + 3)].toFixed(4));
        }
        else{
            return false
        }
    }

    for(var i = 0; i < cv_string.length; i++)
    {
        if (cv_string.substring(i, i + 3) in cv_freq) {
            cvgram -= +(cv_freq[cv_string.substring(i, i + 3)].toFixed(4));
        }
        else{
            return false
        }
    }
    return  (-cvgram - trigram);
}

var checkTrigramValue = function(word, wordLength, trigramResult){
    var values = { 4 : [-12.66, -22.67, -32.83], 5 : [-16.03, -27.08, -39.53],
        6 : [-19.59, -32.99, -45.36], 7 : [-22.86, -38.37, -53.68 ],
        8 : [-26.71, -42.46, -58.14], 9 : [-30.77, -48.42, -70.05],
        10 : [-33.46, -52.31, -71.31], 11 : [-37.44, -50.28, -77.44],
        12 : [-41.24,  -55.00, -74.55], 13 : [-45.42, -58.23, -75.94],
        14 : [-48.14, -60.67, -81.33], 15 : [-52.83, -65.28, -87.08],
        3: [-9.10, -16.39, -22.51]};

    var trigramStartValue = values[wordLength][0];
    var trigramEndValue = values[wordLength][1];
    var trigramNuisanceWords = values[wordLength][2];

    if (checkBloomFilter(word)){
        return true;
    }
    if (trigramResult > trigramStartValue){
        return false;
    }
    if (trigramResult < trigramNuisanceWords){
        return false;
    }
    if (trigramResult >= trigramEndValue){
        return true;
    }
    return false;
}

var checkBloomFilter = function(word){
    return bloom.test(word);
}

var convertToConsonantVowel = function(word){
    var temp_string = '';

    for(i = 0; i < word.length; i++)
    {
        if (checkInArray(word[i], ['a', 'e', 'i', 'o', 'u']))
        {
            temp_string += 'v';
        }
        else if (word[i] === "'")
        {
            temp_string += 'p';
        }
        else
        {
            temp_string += 'c';
        }
    }
    return temp_string;
}

var checkInArray = function(element, arr) {
    for(var i= 0; i < arr.length; i++)
    {
        if(arr[i] === element){
            return true;
        }
    }
    return false;
}
