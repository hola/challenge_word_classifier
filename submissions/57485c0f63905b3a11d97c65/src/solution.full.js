var ngrams = {};
var probs = {}, cumul = {};
var st = 'a'.charCodeAt(0);
var bloom, bloomOffs;
var BITS = exports.BITS = 639001;
var MAX_WORD_LEN = exports.MAX_WORD_LEN = 15;
var alph = "abcdefghijklmnopqrstuvwxyz$";

// Only for testing, real version deals with single concatenated Buffer
module.exports.init = function(bigramsBuffer, bloomBuffer) {
  var ngrams = {};
  var i = 0;
  for (var a = 0; a < 26; a++) {
    for (var b = 0; b < 26; b++) {
      ngrams[String.fromCharCode(st + a, st + b)] =
        [bigramsBuffer[i++], bigramsBuffer[i++], bigramsBuffer[i++]];
    }
  }
  bloom = bloomBuffer;
  bloomOffs = 0;

  buildProbabilities(ngrams);
}

var buildProbabilities = function(ngrams) {
  for (var k in ngrams) {
    var stat = ngrams[k];
    // ^a
    probs['^' + k[0]] = (probs['^' + k[0]] || 0) + stat[0];
    probs['^'] = (probs['^'] || 0) + stat[0]; // denominator
    // ^aa
    probs['^' + k] = (probs['^' + k] || 0) + stat[0];
    probs[k[0]] = (probs[k[0]] || 0) + stat[1];
    // aa
    probs[k] = (probs[k] || 0) + stat[1];
    // a$
    probs[k.substr(1) + '$'] = (probs[k.substr(1) + '$'] || 0) + stat[2];
  }
  for (var k in probs) {
    if (k == '^') continue;
    var pref = k.substr(0, k.length - 1);
    var idx = alph.indexOf(k[k.length - 1]);
    for (var i = 0; i < alph.length; i++) {
      cumul[pref + alph[i]] = (cumul[pref + alph[i]] || 0) + (i > idx ? probs[k] : 0);
    }
  }
}

var getProbability = exports.getProbability = function(three) {
  var pref = three.substr(0, three.length - 1);
  if (three.length < 3) { // Prefix
    return [cumul['^' + three], probs['^' + three], probs['^' + pref]];
  } else {
    return [cumul[three.substr(1)], probs[three.substr(1)], probs[pref.substr(1)] + probs[pref.substr(1) + '$']/* + probs[pref.substr(1) + "$s"]*/];
  }
}

var times = 0;
var arithm = exports.arithm = function(word) {
  var apos = (word.substr(-2) == "'s");
  if (apos) {
    word = word.substr(0, word.length - 2);
  }
  if (word.indexOf("'") > -1) {
    return -1;
  }
  if (word.length > MAX_WORD_LEN) {
    return -1;
  }

  var x = 0.0;
  var len = 1.0;

  for (var i = 0; i <= word.length; i++) {
    var last = word.substring(i - 2, i + 1) + (i == word.length ? '$' : '');
    var prob = getProbability(last);
    if (prob[2] == 0) {
      return -1;
    }
    x += prob[0] * len / prob[2];
    len *= prob[1] / prob[2];
  }
  var hash = ((x + len * 0.5) * 12064428);
  return (hash % BITS) | 0;
}

function checkBloom(hash) {
  return !!(bloom[bloomOffs + (hash >> 3)] & (1 << (hash & 7)));
}

module.exports.test = function(word) {
  /*if (word.length < 3) {
    return false;
  }*/
  var hash = arithm(word);
  if (hash == -1) {
    return false;
  }
  if (!checkBloom(hash)) {
    return false;
  }
  var probs = [];
  var apos = (word.substr(-2) == "'s");
  if (apos) {
    word = word.substr(0, word.length - 2);
  }
  for (var i = 0; i <= word.length; i++) {
    var last = word.substring(i - 2, i + 1) + (i == word.length ? '$' : '');
    var prob = getProbability(last);
    probs.push(prob[1] / prob[2]);
  }
  probs.sort();
  return ((probs[0] * 3 + probs[1]) * 0.25 > 0.0025);
}
