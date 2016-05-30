'use strict';

module.exports = {};

var dictionary;

module.exports.init = function(dict) {
    dictionary = dict.toString();
};

module.exports.test = function(word) {
    var transform = word.toLowerCase().replace(/'s$/,'').replace(/s$/,'').replace(/[aeiouyrnc]/g,'');
    if (transform==='') return false;
    if (dictionary.indexOf(transform) !== -1) return true;
    return false;
};