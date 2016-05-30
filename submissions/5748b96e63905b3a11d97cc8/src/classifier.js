var data = {};
var powerData = {};
var vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
var letters = "esainortlcudmph'gbyfkvwzxjq".split('');
var init = function(dataBuffer) {
	var content = dataBuffer.toString();
	var pieces = content.split('/');
  pieces[0].split('|').map(function(str) {
    var items = str.split(',');
    data[items[0]] = [];
    for (var i = 1; i < items.length; i++) {
      data[items[0]].push(items[i]);
      if (items[i] != "'s" && items[i].endsWith("'s")) {
        data[items[0]].push(items[i].slice(0, -2));
      }
    }
  });
  pieces[1].split('|').map(function(str) {
    var items = str.split(',').map(function(it) { return parseInt(it); });
    powerData[items[0]] = [];
    for (var i = 1; i < items.length; i++) {
      powerData[items[0]].push(items[i]);
    }
  });
};
var test = function(word) {
  if (!word || (typeof word != 'string')) return false;
	word = word.toLowerCase();
	var oldSeq = '';
  var preSeq = '';
  var curSeq = '';
  var lastWasVowel = false;
  var lastWasConso = false;
  var power = 0;
  for (var i = 0; i < word.length; i++) {
    var letter = word[i];
    var isVowel = vowels.indexOf(letter) > -1;
    var isConso = !isVowel;
    if ((isVowel && lastWasConso) || (isConso && lastWasVowel)) {
      oldSeq = preSeq;
      preSeq = curSeq;
      curSeq = '';
      if (!data[oldSeq] || data[oldSeq].indexOf(preSeq) == -1) {
        return false;
      }
    }
    curSeq += letter;
    lastWasVowel = isVowel;
    lastWasConso = !lastWasVowel;
    power += letters.indexOf(letter) ^ i;
  }
  oldSeq = preSeq;
  preSeq = curSeq;
  curSeq = '';
  if (!data[oldSeq] || data[oldSeq].indexOf(preSeq) == -1) {
    return false;
  }
  while (power > 99) {
    power -= 100;
  }
  if (!powerData[word.length] || powerData[word.length].indexOf(power) == -1) {
    return false;
  }
  return true;
};
module.exports = {
	init: init,
	test: test
}