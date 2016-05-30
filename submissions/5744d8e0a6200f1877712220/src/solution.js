const SIMILARITY_PERCENT = 0.5;

var f;
var FuzzySet = require('fuzzyset.js');

module.exports = {
  init: (data) => {
    f = new FuzzySet(data.toString().split(' '));
  },
  test: (word) => {
    var tmp = f.get(word);
    if(tmp && tmp.length && tmp[0][0] >= SIMILARITY_PERCENT) {
      return true;
    }
    return false;
  }
};