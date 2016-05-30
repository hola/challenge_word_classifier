'use strict';


var dataJSON = {};

exports.init = function(data) {
  dataJSON = JSON.parse(data.toString('utf8'));
}


exports.test = function(word) {
  var wordPrefix = word.substr(0, 2);
  var wordSuffix = word.substr(-2, 2);
  var wordLength = word.length;
  word = word.replace('#[aeiou\s]+#i', '');
  if (dataJSON[wordPrefix] != undefined) {
    var prefixData = dataJSON[wordPrefix].split('|');
    var suffixList = prefixData[0].match(/.{1,2}/g);
    var maxWordLen = prefixData[1];
    if (suffixList.join(',').indexOf(wordSuffix) >=0 ) {
      if (wordLength > maxWordLen) {
        return false;
      }
      return true;
    }
  }
  return false;
}