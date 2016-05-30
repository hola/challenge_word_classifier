var fnv1a = require('./fnv1a');
var heuristic = require('./heuristic');
var preprocess = require('./preprocess');

var NUM_BITS = 500000;

var bitset = [];
var exports = {
  init: (buffer) => { bitset = buffer; },

  test: function test(word) {
    var hash = fnv1a(preprocess(word)) % NUM_BITS;
    var index = Math.floor(hash / 8);
    var offset = hash % 8;
    return !!(bitset[index] & (1 << offset)) && heuristic(word);
  }

};

module.exports = exports;
