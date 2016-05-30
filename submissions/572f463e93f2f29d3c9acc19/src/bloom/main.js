var BloomFilter = require('./BloomFilter.js');
var fileUtils = require('../utils/FileUtils.js');
var bloomFilter;

exports.init = function (buffer) {
    var buckets = fileUtils.bufferToArray(buffer);
    bloomFilter = new BloomFilter(buckets);
}

exports.test = function (word) {
    return bloomFilter.test(word);
}
